# Glossário — Design

**Data:** 2026-06-10
**Projeto:** Aprenda Política
**Status:** Aprovado (design) — aguardando revisão do spec

## Objetivo

Glossário de termos políticos/legislativos em linguagem simples — cada termo é uma **landing de SEO** ("o que é PEC", "o que é quórum") que cruza com os objetos do sistema (proposições, emendas, temas, guias do /aprenda). Conteúdo estático curado, no padrão da seção /aprenda.

## Decisões (do brainstorming)

| Tema | Decisão |
|------|---------|
| Estrutura | **Hub + página por termo** (`/glossario` + `/glossario/[termo]`) — SEO por termo |
| URL | **`/glossario` top-level** (curta, destino próprio); entrada no mega menu "Aprenda Política" |
| Conteúdo | **Estático** (`src/lib/glossario.ts`, ~60 termos curados) — sem DB, padrão /aprenda |
| Afinidade | `relacionados` curados **+ complemento automático por categoria** (nenhum termo órfão) |
| Tópicos do sistema | Campo `temas: string[]` → chips (emoji/cor via `getTopic`) linkando `/proposicoes/tema/[slug]` |
| Design | 100% design system (tokens, componentes existentes, responsivo, zero hex hardcoded) |

## Arquitetura

### 1. Dados — `src/lib/glossario.ts`

```ts
export interface Termo {
  slug: string            // 'pec'
  termo: string           // 'PEC'
  nomeCompleto?: string   // 'Proposta de Emenda à Constituição'
  categoria: CategoriaId  // ver categorias abaixo
  definicaoCurta: string  // 1 frase — cards do hub + meta description
  definicao: string[]     // 2-3 parágrafos, linguagem simples, sem juridiquês
  exemplo: string         // exemplo prático ("Na prática: …")
  relacionados: string[]  // slugs de termos com afinidade (curado)
  temas?: string[]        // slugs de temas do sistema (@/lib/topics) — chips p/ /proposicoes/tema/[slug]
  links?: { label: string; href: string }[]  // cross-links pro portal (/proposicoes?tipo=PEC, /emendas, /aprenda/...)
}
```

**Categorias** (com cor por token):
- `processo-legislativo` (verde) — PEC, PL, PLP, MP, sanção, veto, quórum, plenário, comissão, CPI, relator, emenda (de texto), tramitação, urgência, casa revisora, promulgação…
- `orcamento` (amarelo) — emenda parlamentar, empenho/liquidação/pagamento, RP9/orçamento secreto, FPM, LOA/LDO/PPA, orçamento impositivo…
- `eleicoes` (municipal/amarelo-600) — coeficiente eleitoral, 2º turno, suplente, filiação, federação partidária, fundo eleitoral, inelegibilidade…
- `instituicoes` (federal/azul) — Congresso, Câmara, Senado, mesa diretora, bancada, líder, bloco partidário, base/oposição…
- `justica` (federal) — STF, ADI, ADPF, habeas corpus, foro privilegiado, trânsito em julgado…
- `participacao` (verde) — iniciativa popular, plebiscito, referendo, audiência pública, transparência/LAI…

Total inicial: **~60 termos**. Helpers: `TERMOS`, `getTermo(slug)`, `termosPorLetra()`, `CATEGORIAS` (id, label, cor-token), e `afins(termo)` = `relacionados` resolvidos + complemento da mesma categoria até ~6.

### 2. Páginas (RSC, design system)

- **`/glossario`** — hub:
  - hero (título + tagline no padrão /aprenda)
  - **busca instantânea** — ilha client (`GlossarioExplorer`) que recebe os termos serializados e filtra por texto/letra/categoria
  - **nav A–Z** + chips de categoria (cor por token)
  - grid de cards: termo + sigla + definição curta + pill de categoria
  - estático (`revalidate = false`)
- **`/glossario/[termo]`** — landing do termo:
  - breadcrumb (Brasil → Glossário → Termo)
  - h1 (termo + nome completo), pill de categoria
  - definição (parágrafos) + callout **"Na prática"** (exemplo, fundo `verde-50`)
  - **"Temas relacionados"** — chips de tema do sistema (emoji+accent via `getTopic`) → `/proposicoes/tema/[slug]`
  - **"Veja no portal"** — cross-links curados (ex.: PEC → `/proposicoes?tipo=PEC`; emenda parlamentar → `/emendas` + `/aprenda/emendas`)
  - **"Termos com afinidade"** — chips dos `afins()` → outras páginas do glossário
  - navegação anterior/próximo (ordem alfabética)
  - `generateStaticParams` + `notFound`; metadata `"O que é {termo}? — Glossário"` com `definicaoCurta`; **JSON-LD `DefinedTerm`** (e `DefinedTermSet` no hub)

### 3. Navbar + Sitemap

- Mega menu **"Aprenda Política"**: novo grupo `Glossário` (href `/glossario`) com ~7 termos mais buscados como filhos (PEC, MP, CPI, quórum, emenda parlamentar, sanção, coeficiente eleitoral).
- Sitemap: `/glossario` + todos os `/glossario/[termo]` em `STATIC_PATHS` (via `TERMOS.map` — são estáticos, não precisam de chunk).

## Fora do escopo (YAGNI)

- Tooltips de glossário espalhados nas outras páginas (cross-link reverso) — ciclo futuro.
- Glossário em DB / CMS — conteúdo é curado e estático.
- Busca server-side — o filtro client resolve para ~60 termos.

## Critérios de sucesso

- `/glossario` lista ~60 termos com busca/A–Z/categorias funcionais.
- Cada `/glossario/[termo]` renderiza definição + exemplo + temas do sistema + afins + cross-links; 404 para slug inexistente.
- Nenhum termo sem afinidades (complemento automático por categoria).
- Termos no sitemap; JSON-LD válido; metadata "O que é X?".
- Tudo no design system; `npx tsc --noEmit` limpo; testes (vitest) dos helpers (`getTermo`, `afins`, `termosPorLetra`).
