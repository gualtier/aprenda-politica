# Proposições Legislativas como Objeto do Sistema — Design

**Data:** 2026-06-08
**Projeto:** Aprenda Política
**Status:** Aprovado (design) — aguardando spec review

## Objetivo

Promover proposições legislativas (PL, PEC, PLP, MP, etc.) de um campo JSONB
denormalizado (`politicians.proposals`) para uma **entidade de primeira classe**,
navegável e cruzável com **políticos** (autores, N:N) e **partidos** (derivado via
autores). Entrega: uma seção `/proposicoes` com filtros + páginas próprias, e
exibição enriquecida no perfil de cada político e na página do partido.

## Estado atual (ponto de partida)

- Proposições hoje vivem como JSONB em `politicians.proposals`:
  `[{ date, type, title, description }]`, populado de forma ad-hoc no teste do ES
  (ex.: Jack Rocha com PL 1853/2026, PL 1808/2026…). Fonte: API de proposições da
  Câmara (dadosabertos).
- Problemas: não é entidade; um PL com N autores vira N cópias; impossível cruzar
  ("o que o PT propõe"), listar por tema, ou ter página própria.
- O dado bruto e a fonte (Câmara) já foram validados no teste.

## Decisões (do brainstorming)

| Tema | Decisão |
|------|---------|
| Uso principal | **Seção navegável + perfis** (páginas próprias, filtros, cross-links) |
| Cobertura (norte) | Federal + **todas** as assembleias estaduais |
| Ciclo 1 | Modelo agnóstico + **Câmara + Senado + ALES (ES)** |
| Crescimento | **Uma casa por vez** — cada fonte é um adaptador novo, sem mexer no modelo |
| Recorte temporal | **Legislatura atual (2023→)**, proposições com ≥1 autor da base |

## Arquitetura

Princípio: **a entidade é a mesma para qualquer fonte**; o que varia é o
**adaptador de ingestão** por casa legislativa. O modelo nasce pronto para todas as
fontes; a ingestão entra incremental.

### 1. Modelo de dados (migration `006_propositions.sql`)

```sql
CREATE TABLE propositions (
  id            BIGSERIAL PRIMARY KEY,
  source        TEXT NOT NULL,            -- 'camara' | 'senado' | 'ales'
  external_id   TEXT NOT NULL,            -- id da proposição na fonte
  type          TEXT NOT NULL,            -- 'PL','PEC','PLP','MP','PDL','PLV',...
  number        INTEGER,
  year          INTEGER,
  title         TEXT,                     -- ementa curta
  summary       TEXT,                     -- ementa completa
  presented_on  DATE,
  status        TEXT,                     -- situação atual (texto da fonte)
  themes        TEXT[] DEFAULT '{}',      -- áreas/temas (best-effort por fonte)
  url           TEXT,                     -- link oficial
  party_ids     INTEGER[] DEFAULT '{}',   -- denormalizado p/ filtro rápido por partido
  slug          TEXT UNIQUE,              -- ex. 'pl-1853-2026'
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source, external_id)
);

CREATE TABLE proposition_authors (
  id                 BIGSERIAL PRIMARY KEY,
  proposition_id     BIGINT NOT NULL REFERENCES propositions(id) ON DELETE CASCADE,
  politician_id      BIGINT REFERENCES politicians(id),  -- nullable (autor fora da base)
  author_name        TEXT NOT NULL,                      -- sempre gravado
  author_external_id TEXT,                               -- chave do autor na fonte
  role               TEXT DEFAULT 'autor',               -- 'autor' | 'coautor'
  ordem              INTEGER,
  UNIQUE(proposition_id, author_name)
);

CREATE INDEX idx_propositions_party_ids ON propositions USING GIN (party_ids);
CREATE INDEX idx_propositions_themes    ON propositions USING GIN (themes);
CREATE INDEX idx_propositions_type      ON propositions (type);
CREATE INDEX idx_propositions_year      ON propositions (year);
CREATE INDEX idx_propositions_source    ON propositions (source);
CREATE INDEX idx_prop_authors_politician ON proposition_authors (politician_id);
CREATE INDEX idx_prop_authors_proposition ON proposition_authors (proposition_id);
```

**Cross com partido = derivado, não duplicado.** `party_ids` é preenchido na
ingestão a partir dos partidos dos autores casados (distintos). Consulta
"proposições do PT" = `party_ids @> ARRAY[<id_PT>]` (GIN, instantâneo).

`slug`: `{type}-{number}-{year}` minúsculo (ex. `pec-45-2023`). Para colisões
entre casas (raro no recorte atual), sufixar com a sigla da fonte.

### 2. Ingestão (workers) — adaptadores plugáveis

```
packages/sync-worker/src/propositions/
  types.ts           # RawProposition, RawAuthor (formato normalizado)
  adapters/
    camara.ts        # fetchPropositions(opts): AsyncIterable<RawProposition>
    senado.ts
    ales.ts          # formato a descobrir (REST ou dataset)
  ingest.ts          # runner: casa autores↔políticos, upsert, calcula party_ids, slug
  registry.ts        # { camara, senado, ales }
scripts/sync-propositions.mjs <fonte>   # roda UM adaptador por vez
```

Interface comum:
```ts
interface RawAuthor { name: string; externalId?: string; role?: 'autor'|'coautor'; ordem?: number }
interface RawProposition {
  source: string; externalId: string; type: string; number?: number; year?: number;
  title?: string; summary?: string; presentedOn?: string; status?: string;
  themes?: string[]; house?: string; url?: string; authors: RawAuthor[];
}
interface PropositionAdapter {
  source: string;
  fetchPropositions(opts: { sinceYear: number }): AsyncIterable<RawProposition>;
}
```

O `ingest.ts` é único e reaproveitado por todas as fontes: recebe um adaptador,
itera, casa autores, faz upsert idempotente (`onConflict source,external_id`),
recalcula `party_ids` e `slug`. Cada casa nova = um arquivo em `adapters/` +
um registro em `registry.ts`.

### 3. Casamento autor ↔ político

- **Federal (Câmara/Senado):** por `author_external_id` ↔ `politicians.external_id`
  filtrando por `source` correspondente (`camara`/`senado`). Casamento direto e confiável.
- **ES (ALES):** deputados estaduais na base são `source='tse'`
  (`external_id = SQ_CANDIDATO`), que **não** bate com o id da ALES. Casa por
  **nome normalizado** (slugify) dentro de `state_id = <ES>` + cargo
  `deputado-estadual`. Mesma técnica usada no casamento de municípios.
- Autor não encontrado → `politician_id = NULL`, mas `author_name` é gravado
  (a proposição não fica órfã e o nome aparece na UI).

### 4. Frontend

- **`/proposicoes`** — lista paginada + filtros: `tipo`, `tema`, `partido`,
  `casa`, `autor`, busca por texto/número. Card: `{TYPE NUMBER/YEAR}` · ementa
  curta · chips de autores · badge de status. (RSC + query Supabase, padrão do
  diretório de políticos.)
- **`/proposicoes/[slug]`** — página completa: ementa, autores (link p/ perfil),
  partido(s), status, data, link oficial. `generateMetadata` + OG.
- **Perfil do político** (`/politico/[slug]`) — substitui a exibição do JSONB
  `proposals` por consulta via `proposition_authors` (últimas N + "ver todas →"
  filtrando `/proposicoes?autor=`).
- **Página do partido** (`/partidos/[slug]`) — bloco "Proposições do partido"
  (recentes via `party_ids @> [id]`).
- **Navbar** — novo item "Proposições".

### 5. Recorte e volume

Legislatura atual (2023→). Ingerir proposições com ≥1 autor da base. Câmara via
`/proposicoes?ano=2023..2026` + autores; Senado matérias da legislatura vigente;
ALES legislatura vigente. Volume estimado: dezenas de milhares — controlável com
upsert idempotente e paginação.

### 6. Migração do JSONB atual

A coluna `politicians.proposals` (dado do teste ES) fica **substituída** pela
ingestão real. Passo a não exibi-la (perfil passa a ler `proposition_authors`).
Remoção da coluna fica para uma migration **posterior** (não neste ciclo), para
não quebrar nada que ainda a referencie.

## Faseamento

**Ciclo 1 (esta spec):**
1. Migration 006 (modelo).
2. Adaptador **Câmara** + `ingest.ts` + casamento de autores (a fonte mais rica e já validada).
3. Adaptador **Senado**.
4. Adaptador **ALES (ES)** — inclui passo de descoberta do formato da API/dataset.
5. Frontend: `/proposicoes` (lista+filtros), `/proposicoes/[slug]`, perfil, partido, navbar.

**Ciclos seguintes (fora desta spec):** uma assembleia estadual por vez, cada uma
um novo adaptador no mesmo modelo.

## Riscos / dependências

- **Formato da API da ALES** desconhecido (REST vs. download de dataset). Mitigação:
  passo de descoberta no início do item 4; se inviável no ciclo, ES degrada para
  ciclo seguinte sem afetar federal (arquitetura de adaptadores isola).
- **Aplicação de migration** exige SQL Editor do Supabase ou connection string
  (não há CLI/connection string no projeto) — mesmo fluxo da migration 005.
- **Casamento por nome no ES** pode ter ambiguidades (homônimos); mitigar com
  filtro por estado+cargo e log de não-casados para revisão.

## Critérios de sucesso

- `propositions` + `proposition_authors` populadas para Câmara, Senado e ES (ciclo 1).
- `/proposicoes` lista e filtra por tipo, tema, partido, casa, autor.
- Página por proposição com autores linkando perfis.
- Perfil do político e página do partido exibindo proposições via a nova entidade.
- Adicionar uma nova casa = criar 1 adaptador + 1 registro, sem tocar modelo/runner/UI.
