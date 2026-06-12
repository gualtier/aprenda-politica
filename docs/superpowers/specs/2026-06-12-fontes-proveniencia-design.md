# Fontes & Proveniência — Design (Parte 1)

**Data:** 2026-06-12
**Status:** Aprovado (design)
**Escopo:** Parte 1 de 2. A Parte 2 (enriquecimento via Wikidata) tem spec própria e se apoia nesta.

## Objetivo

Todo objeto do sistema deve **citar a fonte dos seus dados** de forma consistente — logo, nome, link para a fonte, data de atualização e nota de licença/atribuição quando aplicável. Cobertura máxima: políticos, proposições, emendas, notícias, partidos, estados, municípios, glossário e o mapa.

## Contexto / estado atual

A "fonte" hoje é inconsistente:

- **Notícias**: rico — componente `SourceTag` (logo via favicon + nome). É o modelo a generalizar.
- **Proposições**: têm `source` (camara/senado) + `url`, mas exibição fraca.
- **Emendas**: **nenhum** campo de fonte; Portal da Transparência fica implícito.
- **Políticos**: têm `source` (tse/camara/senado), mas o helper `externalLink()` em `src/app/politico/[slug]/page.tsx` só trata camara/senado — **`source='tse'` (a maioria: vereadores, deputados estaduais) não mostra link de fonte nenhum**.
- **Partidos / Estados / Municípios / Glossário / Mapa**: sem tratamento de fonte.

## Arquitetura

Três unidades, baixo acoplamento:

1. **Registro de fontes** (`src/lib/fontes.ts`) — catálogo estático de fontes conhecidas + helpers. Sem dependência de DB.
2. **Componente `<Fonte>`** (`src/components/ui/Fonte.tsx`) — apresentação; generaliza `SourceTag`. Duas variantes (`badge`, `bloco`), aceita múltiplas fontes.
3. **Fiação por objeto** — cada página/card consome o registro + o componente, usando os campos `source`/`url`/`updated_at` que já existem.

**Sem migração de schema.** Emenda usa fonte constante; o resto usa colunas existentes. As colunas do Wikidata pertencem à Parte 2.

### Por que estático (não data-model por campo)

Hoje cada objeto tem uma fonte dominante única. Proveniência por campo (JSON `provenance` em cada linha) exigiria mexer em todos os workers de ingestão — overkill (YAGNI). O único objeto multi-fonte real (político citando TSE + Wikidata) é resolvido pelo `<Fonte>` aceitar um **array** de fontes; não precisa de modelo por campo.

## Unidade 1 — Registro de fontes (`src/lib/fontes.ts`)

```ts
export type FonteId = 'tse' | 'camara' | 'senado' | 'transparencia' | 'ibge'
  | 'osm' | 'editorial' | 'veiculo' | 'wikidata' | 'commons'

export interface FonteDef {
  id: FonteId
  nome: string              // "Tribunal Superior Eleitoral"
  sigla?: string            // "TSE"
  domain?: string           // p/ favicon: "tse.jus.br" (undefined = sem logo de domínio)
  licenca: string           // "Dados públicos" | "Dados abertos" | "CC BY-SA" | "Conteúdo próprio"
  hrefFor?: (extId: string | null) => string | null  // link p/ o objeto na fonte
}

export const FONTES: Record<FonteId, FonteDef>
```

Entradas:

| id | nome | domain (favicon) | licença | hrefFor |
|---|---|---|---|---|
| `tse` | Tribunal Superior Eleitoral | `tse.jus.br` | Dados públicos | DivulgaCand: `https://divulgacandcontas.tse.jus.br/divulga/#/candidato/2022/.../{extId}` quando possível, senão `https://www.tse.jus.br` |
| `camara` | Câmara dos Deputados | `camara.leg.br` | Dados abertos | `https://www.camara.leg.br/deputados/{extId}` |
| `senado` | Senado Federal | `senado.leg.br` | Dados abertos | `https://www25.senado.leg.br/web/senadores/senador/-/perfil/{extId}` |
| `transparencia` | Portal da Transparência | `portaldatransparencia.gov.br` | Dados públicos | `https://portaldatransparencia.gov.br/emendas` |
| `ibge` | IBGE | `ibge.gov.br` | Dados públicos | `https://www.ibge.gov.br` |
| `osm` | OpenStreetMap | `openstreetmap.org` | ODbL | `https://www.openstreetmap.org/copyright` |
| `editorial` | Aprenda Política | (sem) | Conteúdo próprio | — |
| `veiculo` | (dinâmico) | do `FonteItem` | do veículo | a própria matéria (via `FonteItem.href`) |
| `wikidata` | Wikidata | `wikidata.org` | CC0 | `https://www.wikidata.org/wiki/{extId}` |
| `commons` | Wikimedia Commons | `commons.wikimedia.org` | CC BY-SA (ver atribuição) | — |

Helpers:

```ts
export function fonteLogo(domain?: string): string | null   // google s2 favicon ou null
export function getFonte(id: FonteId): FonteDef
```

`wikidata`/`commons` ficam registrados desde já, mas só são usados na Parte 2.

## Unidade 2 — Componente `<Fonte>` (`src/components/ui/Fonte.tsx`)

Generaliza `src/components/news/SourceTag.tsx` (que passa a usar este componente internamente ou é substituído na fiação de notícias).

```ts
interface FonteItem {
  fonte: FonteId
  href?: string | null        // sobrescreve hrefFor; p/ veículo é a própria matéria
  nome?: string               // sobrescreve (veículo: nome do veículo)
  domain?: string             // sobrescreve (veículo: domínio do veículo)
  attribution?: string        // p/ Commons: "Foto: <autor>, CC BY-SA"
}

interface FonteProps {
  sources: FonteItem[]
  updatedAt?: string | null   // ISO; exibe "atualizado em DD/MM/AAAA"
  variant?: 'badge' | 'bloco' // default 'badge'
  light?: boolean             // overlay escuro (igual SourceTag)
  className?: string
}
```

- **`badge`** — `[logo] Nome` inline, pequeno (cards, listagens). Multi-fonte: mostra a primeira + "+N". Tokens existentes (`text-gray-500`, etc.), sem hex.
- **`bloco`** — seção rotulada "Fonte dos dados": cada fonte como linha (logo + nome + link "ver na fonte ↗" + nota de licença); rodapé "atualizado em …" se `updatedAt`. Atribuição (`attribution`) aparece como nota fina abaixo da foto/linha correspondente.

Comportamento de erro: fonte sem `domain` → sem logo (só nome). `hrefFor` retornando null → linha sem link. Favicon que falha → `onError` esconde a `<img>` (igual `SourceTag`).

## Unidade 3 — Cobertura (fiação por objeto)

| Objeto | Onde | Fontes | Variante |
|---|---|---|---|
| **Político** | `politico/[slug]` (detalhe) | `source` (tse/camara/senado) + `updated_at`; **corrige TSE sem link** | bloco |
| **Proposição** | detalhe + cards | `source` (camara/senado) + `url` | bloco (detalhe) / badge (card) |
| **Emenda** | `/emendas`, cards, perfil, estado, município | `transparencia` (constante) | badge + bloco |
| **Notícia** | `noticias`, `[slug]` | `veiculo` (domínio/nome) | badge (migra `SourceTag`) |
| **Partido** | `partidos/[slug]` | `tse` + `editorial` (ideologia/curadoria) | bloco |
| **Estado** | `estados/[slug]` ou `[slug]` | `ibge` + `tse` | bloco |
| **Município** | página do município | `ibge` + `tse` | bloco |
| **Glossário** | `glossario/[termo]` | `editorial` + os `links` do termo como referências citadas | bloco |
| **Mapa** | `BrazilMap` | `ibge` (malha) + `osm` (tiles) | nota fina |

Princípio: **detalhe usa `bloco`** (rodapé "Fonte dos dados"); **cards/listas usam `badge`**.

## Tratamento de erro

- Objeto sem `source` conhecido → componente não renderiza (retorna `null`), nunca quebra a página.
- `domain`/logo ausente → degrada para só-nome.
- Datas: `updated_at` null → omite "atualizado em".

## Testes

- `src/lib/fontes.test.ts` — integridade: toda `FonteDef` tem `nome` e `licenca`; `hrefFor` (quando definido) gera URL http(s) válida para um extId de exemplo; `fonteLogo` retorna URL de favicon para fontes com `domain` e `null` sem `domain`.
- Render do `<Fonte>`: badge (1 fonte), badge multi-fonte ("+N"), bloco com link + licença, bloco com `attribution`, fonte desconhecida → `null`.
- Verificação visual: uma página de cada tipo (político, proposição, emenda, notícia, partido, estado, glossário) mostrando a fonte corretamente; tokens do design system (zero hex hardcoded em className).

## Fora de escopo (Parte 2 e além)

- Enriquecimento via Wikidata (colunas `wikidata_id`, `wikipedia_url`, resumo, carreira; worker `sync-wikidata`; matching ancorado em nascimento). Spec própria.
- Proveniência por campo (JSON `provenance`). Não será feito — `<Fonte>` multi-fonte cobre o caso real.
- Adicionar coluna `source` em `emendas` (desnecessário: fonte é constante).
