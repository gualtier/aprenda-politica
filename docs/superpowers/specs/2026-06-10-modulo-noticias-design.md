# Módulo de Notícias — Design

**Data:** 2026-06-10
**Projeto:** Aprenda Política
**Status:** Aprovado (design) — aguardando revisão do spec

## Objetivo

Trazer **notícias cívicas** para o Aprenda Política como um módulo que **alimenta o portal e o SEO** e **cruza com os objetos do sistema** (políticos, órgãos, projetos de lei, emendas). A feature-assinatura, vinda do design: cada notícia exibe as **entidades mencionadas** como chips linkados que voltam pro grafo do portal ("Mencionados nesta notícia"). Ângulo: "o que a imprensa está dizendo sobre o seu deputado / esse projeto / essa emenda".

## Decisões (do brainstorming)

| Tema | Decisão |
|------|---------|
| **Fonte** | **Google News RSS por entidade** (`news.google.com/rss/search?q=…&hl=pt-BR&gl=BR&ceid=BR:pt-419`). Não existe API oficial do Google News. A query **é** a entidade → o cross-link sai de graça. |
| **Conteúdo** | **Nível A** — resumo próprio de 2-3 frases gerado por IA (**Claude Haiku 4.5**, `claude-haiku-4-5-20251001`) **ancorado só no título+snippet** do RSS. Sem scraping de corpo de matéria. Modelo agregador: link "ler na fonte". |
| **Direito autoral** | Não republicar texto de terceiros. Guardamos título original + **resumo próprio** + fonte + link. |
| **Design** | Adaptar o design **mobile** do bundle para **web responsivo**, no **design system do Aprenda Política** (não o frame de iPhone). |
| **Atribuição de fonte** | **Sempre exibir logo + nome do veículo** em todo card e no artigo (como no Google News). Logo vem do **favicon do domínio** do veículo (`<source url>` do RSS → `source_domain`), via serviço de favicon; fallback = monograma com a inicial. |
| **Semente (1º slice)** | Federais (deputados+senadores+governadores+presidente) + órgãos-chave (Câmara, Senado, STF, TSE) + 15 temas. Prefeituras/assembleias = expansão futura. |

## Restrição de primeira classe: Design System

**Tudo** segue o design system já existente — é requisito, não preferência:
- **Tokens** do `tailwind.config.ts`: `verde-{50,100,500,600,700}`, `amarelo-{50,500,600}`, `esfera-{federal,estadual,municipal}`, escala `gray-*`. **Zero hex hardcoded** em className (cores de partido/fonte que vêm do banco continuam via `style` inline, como hoje).
- **Fonte** Inter (já global).
- **Componentes reutilizados**: `Avatar`, `Breadcrumb`, e os padrões de chip de tema (`@/lib/topics` → emoji+accent), de card (`/proposicoes`, `/emendas`) e a régua/secões já existentes.
- **Acento por esfera**: categoria de notícia → `sphere` (federal/estadual/municipal) → cor `esfera-*`, igual ao resto do app.
- **Responsivo** (mobile-first), RSC + `revalidate`, padrões idênticos às outras páginas.

## Arquitetura

### 1. Modelo de dados (migration `010_news.sql`)

```sql
CREATE TABLE news (
  id            BIGSERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,            -- título original do RSS
  summary       TEXT,                     -- resumo próprio (IA), ancorado no snippet
  source_name   TEXT,                     -- veículo (ex: "O Globo") — SEMPRE exibido
  source_domain TEXT,                     -- domínio do veículo (do <source url> do RSS) → logo via favicon
  source_url    TEXT NOT NULL,            -- link da matéria original
  url_hash      TEXT UNIQUE NOT NULL,     -- sha1(source_url) p/ dedup idempotente
  published_at  TIMESTAMPTZ,
  category      TEXT,                     -- camara|senado|governo|eleicoes|economia|cidades|justica
  sphere        TEXT,                     -- federal|estadual|municipal (acento de cor)
  topics        TEXT[] DEFAULT '{}',      -- temas (mesma taxonomia de propositions)
  cover_motif   TEXT,                     -- congresso|cupula|palacio|urna|… (capa geométrica)
  created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_news_published ON news (published_at DESC);
CREATE INDEX idx_news_category  ON news (category);
CREATE INDEX idx_news_topics    ON news USING GIN (topics);

CREATE TABLE news_entities (
  id              BIGSERIAL PRIMARY KEY,
  news_id         BIGINT REFERENCES news(id) ON DELETE CASCADE,
  role            TEXT NOT NULL,          -- 'principal' | 'mencionado'
  politician_id   BIGINT REFERENCES politicians(id),
  proposition_id  BIGINT REFERENCES propositions(id),
  emenda_id       BIGINT REFERENCES emendas(id),
  orgao           TEXT,                   -- órgãos não têm tabela própria (texto)
  label           TEXT,                   -- rótulo p/ exibir no chip
  created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_news_entities_news       ON news_entities (news_id);
CREATE INDEX idx_news_entities_politician ON news_entities (politician_id);
CREATE INDEX idx_news_entities_proposition ON news_entities (proposition_id);
CREATE INDEX idx_news_entities_emenda     ON news_entities (emenda_id);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read ON news FOR SELECT USING (true);
CREATE POLICY public_read ON news_entities FOR SELECT USING (true);
```

### 2. Ingestão — worker `scripts/sync-news.mjs` (+ módulos em `scripts/news/`)

Roda on-demand agora (como `sync-emendas.mjs`); depois entra no cron / na caixa OCI.

1. **Monta o conjunto-semente** de entidades (query + metadados de cross-link):
   - federais: nome + cargo (ex: `"Helena Vasconcelos" deputada`) — o cargo desambigua homônimos;
   - órgãos-chave: `"Câmara dos Deputados"`, etc.;
   - temas: a `keywords` de cada tema (`@/lib/topics`).
2. Para cada entidade, busca o **RSS** (`q` url-encoded), com retry/backoff e rate-limit.
3. Faz **parse** do XML (item: `title`, `link`, `pubDate`, `description`/snippet, e `<source url="…">` → `source_name` + `source_domain`). O `link` do Google News é redirect — guardamos como `source_url` (resolução opcional depois). O `source_domain` alimenta o **logo** do veículo no render.
4. **Resumo IA** (Haiku) ancorado em `title`+`description`: prompt que **proíbe inventar fatos** fora do texto recebido; 2-3 frases neutras em pt-BR. Falha → cai pro snippet limpo (degradação graciosa).
5. **Cross-link**:
   - `principal` = a entidade da query (id conhecido);
   - `mencionado` = regex de códigos (`PL \d+/\d{4}`, `PEC \d+/\d{4}`, `Emenda \d+/\d{4}`) casados com `propositions`/`emendas` + nomes distintos (nome+sobrenome) de federais casados na base.
6. **Categoria/esfera/tema**: deriva do tipo da entidade-semente (deputado→`camara`/federal; governador→`governo`/estadual; tema→`topics` + categoria temática) e classifica `topics` com `classifyTopics`.
7. **Capa geométrica** (`cover_motif`): keyed por categoria/tema.
8. **Dedup + upsert** idempotente por `url_hash` (`onConflict url_hash`); entidades reanexadas sem duplicar.

**Testes (node:test)**: parse do RSS (fixture XML), dedup por url_hash, extração de códigos (PL/PEC/Emenda), slugify.

### 3. Camada de consulta — `src/lib/news.ts`

- `listNews(filtro)`: categoria, tema, q, paginado; ordena por `published_at desc`.
- `featuredNews()`: destaques recentes (carrossel da Home).
- `newsBySlug(slug)`: artigo + entidades (joins) p/ a página single.
- `newsByPolitician(id, limit)`: "na mídia" no perfil. (depois: `byProposition`, `byEmenda`.)
- `newsCategories()`: as categorias com `sphere`.
- Formatadores: tempo relativo ("há 6 horas"), rótulo de fonte.

### 4. Frontend (RSC, web responsivo, design system)

- **`/noticias`** — Home: faixa de **destaques** (carrossel horizontal no mobile, grid no desktop) + **feed** + **barra de categorias** (abas, acento por esfera, igual à barra de temas de `/proposicoes`). `revalidate` curto (notícia é fresca).
- **`/noticias/[slug]`** — artigo agregador: breadcrumb, **capa geométrica**, kicker+título, fonte+data+tempo de leitura, **resumo próprio**, seção **"Mencionados nesta notícia"** (chips: `Avatar`+nome p/ político, chip p/ órgão, chip de código p/ PL/emenda — todos linkados), bloco "objetos relacionados" do portal, CTA **"Ler matéria completa na fonte →"** (link externo, `rel="noopener"`). `generateStaticParams` + `notFound`.
- **Bloco "Na mídia"** no `/politico/[slug]` — últimas notícias que mencionam o político (cards compactos linkando pro artigo interno).
- **Navbar**: **"Notícias"** como item de topo próprio (com submenu das categorias, no padrão dos mega menus atuais).
- **Atribuição de fonte (sempre)**: todo `NewsCard` e o artigo trazem uma linha **logo + nome do veículo**. Componente `SourceTag` = favicon (`https://www.google.com/s2/favicons?domain={source_domain}&sz=64`, via `<img>` simples — host externo, sem `next/image`) + `source_name`; fallback monograma (inicial em tile `gray-100`) se sem domínio/erro de carga.
- **Componentes novos**: `NewsCard` (variantes destaque/feed/compacto), `NewsCover` (capa geométrica por motif — SVG, tokens), `SourceTag` (logo+nome do veículo), `MentionChip` (por tipo de entidade), `CategoryBar`.

### 5. SEO

- Slugs estáveis (`url_hash`-based, únicos).
- `/noticias` + `/noticias/[slug]` no **sitemap** (chunk próprio; notícias mudam — `revalidate`).
- **JSON-LD**: `CollectionPage`/`ItemList` no feed; `Article` no artigo (com `isBasedOn`/`citation` apontando pra fonte original — deixa claro que o resumo é nosso e a matéria é de terceiros).
- **Cross-link bidirecional** (notícia↔político/lei/emenda) — o ativo de SEO e de grafo. Metadata por artigo com o apelo das entidades.

## Faseamento (1 ciclo, em ordem — como o de emendas)

1. Migration `010_news` — usuário aplica no SQL Editor.
2. `sync-news.mjs` + módulos (RSS, resumo IA, cross-link, dedup) + seed federais/órgãos/temas.
3. `src/lib/news.ts` (consulta/agregados).
4. Páginas: `/noticias` (Home+categorias), `/noticias/[slug]`, bloco "Na mídia" no perfil.
5. Navbar + Sitemap + JSON-LD.

## Riscos / mitigações

- **Exatidão da IA** (notícia cívica errada = difamação): resumo **ancorado 100%** no texto recebido, prompt anti-invenção, curto; rótulo "resumo"; degradação pro snippet limpo se a IA falhar. (Fila de revisão humana = melhoria futura.)
- **Homônimos** no cross-link `mencionado`: casar só nome+sobrenome distintos de federais + desambiguar query por cargo; códigos (PL/PEC/Emenda) são alta precisão via regex.
- **RSS instável / redirects do Google News**: retry/backoff; guardar `source_url` cru; resolução de redirect é opcional/futura.
- **Volume**: ~800 queries/refresh (semente) — rate-limit + cron diário; reprocessável (idempotente).
- **Imagem**: RSS não garante imagem → **capas geométricas** por tema (on-brand, como o design pede).

## Critérios de sucesso

- `news` populada a partir do Google News RSS pra semente federal/temas, com resumo próprio (IA) e dedup idempotente.
- `/noticias` lista, filtra por categoria e destaca; `/noticias/[slug]` mostra resumo + **"Mencionados"** linkados + "ler na fonte".
- **Bloco "Na mídia"** no perfil do político.
- Todo card/artigo exibe **logo + nome do veículo** (favicon do domínio; fallback monograma).
- Cross-link bidirecional funcionando (perfil → notícias e notícia → perfil/PL/emenda).
- Tudo no **design system** (tokens, responsivo, componentes reusados), sem hex hardcoded.
- Reprocessar a ingestão é idempotente.
