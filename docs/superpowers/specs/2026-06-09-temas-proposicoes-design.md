# Páginas por Tema de Proposição — Design

**Data:** 2026-06-09
**Projeto:** Aprenda Política
**Status:** Aprovado (design) — aguardando spec review

## Objetivo

Capturar a busca por **assunto** ("o que estão fazendo sobre saúde / educação / segurança…")
com landing pages ricas por tema, classificando as ~23k proposições numa **taxonomia
curada de ~15 assuntos cidadãos**. Cada página combina **conteúdo didático + exemplos
práticos + dados (BI)** — no padrão visual das páginas do Aprenda, com o design system
(tokens `verde/amarelo/esfera`, componentes Avatar/cards/chips já existentes).

Impacto: alto volume de busca + valor cívico, amarrando o grafo **tema → proposições →
autores → partidos**, e multiplicando páginas indexáveis de alta intenção.

## Por que taxonomia curada (e não os `themes` crus)

Os `themes` atuais vêm do campo `keywords` da Câmara: **3.302 temas distintos** numa amostra
de 1.000 (média 7,4/proposição), dominados por palavras-chave jurídicas genéricas
("Alteração", "Criação", "obrigatoriedade", "data comemorativa"), com casing inconsistente
e quase ausentes no Senado. Inúteis como landing pages. A solução é **classificar** as
proposições em assuntos curados via regras de palavra-chave.

## Arquitetura

### 1. Taxonomia (`src/lib/topics.ts`)

Módulo único, fonte da verdade, **compartilhado entre frontend e o classificador dos
workers** (cópia espelhada no repo de workers, pois são repos separados — ver Plano).

Cada tema:
```ts
export interface Topic {
  slug: string          // 'saude'
  label: string         // 'Saúde'
  tagline: string       // frase curta p/ card e <title>
  accent: string        // hex de acento (paleta curada, padrão das páginas Aprenda)
  Icon: ...             // ícone outline (icons.tsx)
  intro: string[]       // 2-3 parágrafos didáticos (o que o Congresso legisla no tema)
  examples: string[]    // exemplos práticos do que costuma virar PL/PEC no tema
  match: RegExp         // regra: casa em texto normalizado (sem acento/caixa) da ementa+keywords
}
```

**~15 temas** (ajustável): Saúde, Educação, Segurança Pública, Meio Ambiente, Trabalho e
Emprego, Economia e Impostos, Direitos da Mulher, Direitos dos Animais, Transporte e
Trânsito, Tecnologia e Internet, Defesa do Consumidor, Criança e Adolescente, Pessoa Idosa,
Cultura e Esporte, Agropecuária.

`classifyTopics(p): string[]` — normaliza `título + summary + themes.join(' ')` (NFD, sem
acento, minúsculo) e retorna os slugs cujo `match` casa. Uma proposição pode ter vários.

Regras são **listas de palavras** por tema (ex. Saúde: `saude|sus|hospital|medic|enfermag|
vacina|doenca|farmac|cancer|saude mental|…`), montadas em `RegExp` com bordas para evitar
falso-positivo. Curadas para precisão razoável (não perfeita — é heurística, documentada).

### 2. Classificação & armazenamento

- **Migration 007** (`007_proposition_topics.sql`): `ALTER TABLE propositions ADD COLUMN
  topics TEXT[] DEFAULT '{}'` + `CREATE INDEX … USING GIN (topics)` + RLS já cobre (a
  policy `public_read` é por-tabela). Aplicada via SQL Editor (padrão das anteriores).
- **Classificador** (`scripts/classify-topics.mjs` nos workers): pagina todas as
  proposições, roda `classifyTopics`, faz `update` do `topics[]`. Idempotente, com pool de
  concorrência (padrão dos enrich-*).
- **Ingest plugado**: `ingest.mjs` calcula `topics` no upsert (importa o mesmo
  `topics.mjs`), para proposições novas já saírem classificadas.

### 3. Camada de consulta (`src/lib/propositions.ts`, estender)

- `listPropositions` ganha filtro `tema?` → `topics @> [slug]` (e o filtro vira parâmetro
  da página de tema e do `/proposicoes`).
- `topicStats(slug)`: `{ total, byType, bySource, topAuthors[], topParties[] }` — contadores
  e rankings do tema (BI). `topAuthors`/`topParties` via `proposition_authors`/`party_ids`
  das proposições do tema (consultas batched, como em `propositionsByParty`).
- `propositionsByTopic(slug, {page})`: lista paginada (reusa o enriquecimento de
  `primary_author` já existente).

### 4. UI (design system + riqueza)

**`/temas` — hub**
Grid de cards (1/2/3 col), cada um: tile do ícone na cor de acento + label + tagline +
contador de proposições. Header didático curto. (Padrão do hub `/aprenda`.)

**`/proposicoes/tema/[slug]` — landing rica**
- **Header**: tile do ícone (acento) + `H1 "Projetos de lei sobre {Tema}"` + contador + tagline.
- **Intro didática** (`intro[]`): o que o Congresso legisla no tema, por que importa — texto
  crawlável (SEO) no tom das páginas Aprenda.
- **Faixa de dados (BI)**: cards de stat — total · por casa (Câmara/Senado) · tipos
  predominantes · (opcional) status. Tokens + `tabular-nums`.
- **Parlamentares mais ativos no tema**: top N como cards de conexão (Avatar + partido +
  contador), linkando perfis. **Partidos mais ativos**: chips com logo + contagem.
- **Exemplos práticos**: bloco "Exemplos" — algumas proposições em destaque (cards
  enriquecidos já existentes) + a `examples[]` curada como contexto.
- **Lista paginada**: cards enriquecidos (reuso) + filtros dentro do tema (tipo, casa, partido).
- **Veja também**: chips dos outros temas.
- **SEO**: `generateMetadata` (title/description/canonical/OG) + **JSON-LD** `CollectionPage`/`ItemList`.

**Cross-links**
- Página da proposição: trocar os chips de keywords cruas por **chips de tema curado** (via
  `classifyTopics` ou um `topics[]` já gravado) → linkam pro tema.
- `/proposicoes`: adicionar filtro "Tema" (select) usando a taxonomia.
- (futuro, fora do escopo) tema em perfil de político/partido.

**Ícones**: a taxonomia precisa de ~15 ícones outline (coração, livro, escudo, folha, etc.)
no estilo de `icons.tsx` (stroke-2). O Plano inclui criá-los lá.

**Sitemap**: incluir `/temas` + as 15 `/proposicoes/tema/[slug]` no chunk estático (0) de
`src/lib/sitemap.ts` (adicionar ao `STATIC_PATHS` de forma derivada da taxonomia).

## Faseamento (1 ciclo)

1. `src/lib/topics.ts` (taxonomia + `classifyTopics`) + ícones em `icons.tsx`.
2. Migration 007 (`topics[]`) — usuário aplica.
3. Classificador nos workers (`topics.mjs` espelhado + `classify-topics.mjs`) + backfill +
   plugar no `ingest.mjs`.
4. Consulta: `topicStats`, `propositionsByTopic`, filtro `tema` em `listPropositions`.
5. UI: `/temas` (hub), `/proposicoes/tema/[slug]` (landing rica), cross-links, filtro no
   `/proposicoes`, chips de tema na página da proposição.
6. Sitemap + JSON-LD + metadata.

## Riscos / decisões

- **Heurística de classificação** não é perfeita (falsos pos/neg). Mitiga-se com regras
  curadas + bordas de palavra; é transparente ("classificação automática por palavra-chave").
  Reprocessável a qualquer momento (re-rodar o classificador).
- **Duplicação da taxonomia** entre `src/lib/topics.ts` (frontend) e `scripts/.../topics.mjs`
  (workers) — repos separados. Mantém-se em sincronia manual; o Plano deixa as regras num
  formato simples de copiar. (Alternativa futura: pacote compartilhado.)
- **Cobertura**: proposições sem nenhum tema casado ficam com `topics = {}` (não aparecem em
  nenhuma landing, mas seguem em `/proposicoes`). Aceitável.

## Critérios de sucesso

- `/temas` lista os ~15 temas com contadores reais.
- `/proposicoes/tema/saude` (e demais) renderiza: intro, faixa de dados, parlamentares/
  partidos mais ativos, exemplos, lista paginada — tudo no design system.
- Filtro `?tema=` funciona no `/proposicoes`; chips de tema na página da proposição linkam.
- 15 páginas de tema + `/temas` no sitemap, com JSON-LD.
- Re-rodar o classificador reclassifica de forma idempotente; proposições novas já saem
  classificadas pelo ingest.
