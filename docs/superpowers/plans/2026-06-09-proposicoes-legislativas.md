# Proposições Legislativas — Plano de Implementação (Ciclo 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promover proposições legislativas a entidade de primeira classe (`propositions` + `proposition_authors`), ingeridas de Câmara/Senado/ALES por adaptadores plugáveis, navegáveis em `/proposicoes` com filtros e cruzadas com políticos e partidos.

**Architecture:** Modelo agnóstico à fonte no Supabase. Ingestão por **scripts `.mjs` standalone** (padrão dos `enrich-*.mjs`) em `aprenda-politica-workers/scripts/propositions/`: um adaptador por casa + um `ingest` único + um runner `sync-propositions.mjs <fonte>`. Frontend em RSC (Next.js App Router), espelhando os padrões de `/politicos` (filtros via `searchParams`) e `/partidos/[slug]`.

**Tech Stack:** Next.js 14 (RSC), Supabase (PostgREST), Tailwind, vitest (testes front), `node:test`/`node:assert` (testes das funções puras dos adaptadores — zero-dep no Node 22), `@supabase/supabase-js` (já presente nos workers).

**Spec:** `docs/superpowers/specs/2026-06-08-proposicoes-legislativas-design.md`

---

## File Structure

**Workers (`aprenda-politica-workers/`):**
| Arquivo | Responsabilidade |
|---|---|
| `scripts/propositions/normalize.mjs` | funções puras: `slugify`, `buildSlug`, `normalizeType`, `dedupeAuthors` |
| `scripts/propositions/normalize.test.mjs` | testes `node:test` das funções puras |
| `scripts/propositions/ingest.mjs` | runner genérico: itera adaptador → casa autores → upsert → `party_ids` |
| `scripts/propositions/adapters/camara.mjs` | adaptador Câmara (por deputado autor) |
| `scripts/propositions/adapters/senado.mjs` | adaptador Senado (autorias por senador) |
| `scripts/propositions/adapters/ales.mjs` | adaptador ALES/ES |
| `scripts/propositions/registry.mjs` | `{ camara, senado, ales }` |
| `scripts/sync-propositions.mjs` | CLI: `node scripts/sync-propositions.mjs <fonte>` |

**Frontend (`aprenda-politica/`):**
| Arquivo | Responsabilidade |
|---|---|
| `supabase/migrations/006_propositions.sql` | schema |
| `src/types/index.ts` (modificar) | tipos `Proposition`, `PropositionAuthor` |
| `src/lib/propositions.ts` | helpers de consulta (lista/filtros/slug/por-político/por-partido) + `formatPropositionLabel` |
| `src/lib/propositions.test.ts` | testes vitest de `formatPropositionLabel` |
| `src/app/proposicoes/page.tsx` | lista + filtros |
| `src/app/proposicoes/[slug]/page.tsx` | página da proposição |
| `src/app/politico/[slug]/page.tsx` (modificar) | bloco de proposições do político |
| `src/app/partidos/[slug]/page.tsx` (modificar) | bloco de proposições do partido |
| `src/components/ui/Navbar.tsx` (modificar) | item "Proposições" |

---

## Task 1: Migration 006 — schema

**Files:**
- Create: `supabase/migrations/006_propositions.sql`

- [ ] **Step 1: Criar o arquivo de migration**

```sql
-- Proposições legislativas como entidade de primeira classe.
CREATE TABLE IF NOT EXISTS propositions (
  id            BIGSERIAL PRIMARY KEY,
  source        TEXT NOT NULL,            -- 'camara' | 'senado' | 'ales'
  external_id   TEXT NOT NULL,
  type          TEXT NOT NULL,            -- 'PL','PEC','PLP','MP','PDL','PLV',...
  number        INTEGER,
  year          INTEGER,
  title         TEXT,                     -- ementa curta
  summary       TEXT,                     -- ementa completa
  presented_on  DATE,
  status        TEXT,
  themes        TEXT[] DEFAULT '{}',
  url           TEXT,
  party_ids     INTEGER[] DEFAULT '{}',
  slug          TEXT UNIQUE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source, external_id)
);

CREATE TABLE IF NOT EXISTS proposition_authors (
  id                 BIGSERIAL PRIMARY KEY,
  proposition_id     BIGINT NOT NULL REFERENCES propositions(id) ON DELETE CASCADE,
  politician_id      BIGINT REFERENCES politicians(id),
  author_name        TEXT NOT NULL,
  author_external_id TEXT,
  role               TEXT DEFAULT 'autor',
  ordem              INTEGER,
  UNIQUE(proposition_id, author_name)
);

CREATE INDEX IF NOT EXISTS idx_propositions_party_ids  ON propositions USING GIN (party_ids);
CREATE INDEX IF NOT EXISTS idx_propositions_themes     ON propositions USING GIN (themes);
CREATE INDEX IF NOT EXISTS idx_propositions_type       ON propositions (type);
CREATE INDEX IF NOT EXISTS idx_propositions_year       ON propositions (year);
CREATE INDEX IF NOT EXISTS idx_propositions_source     ON propositions (source);
CREATE INDEX IF NOT EXISTS idx_prop_authors_politician ON proposition_authors (politician_id);
CREATE INDEX IF NOT EXISTS idx_prop_authors_prop       ON proposition_authors (proposition_id);
```

- [ ] **Step 2: Aplicar a migration**

A migration roda via **Supabase → SQL Editor** (não há CLI/connection string no projeto — mesmo fluxo da 005). Colar o conteúdo do arquivo e executar.

- [ ] **Step 3: Verificar que as tabelas existem**

```bash
cd /Users/gualtieri/Apps/aprenda-politica
SUPA_URL=$(grep -E "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d= -f2-)
ANON=$(grep -E "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d= -f2-)
curl -s "${SUPA_URL}/rest/v1/propositions?select=id&limit=1" -H "apikey: ${ANON}" -H "Authorization: Bearer ${ANON}"
curl -s "${SUPA_URL}/rest/v1/proposition_authors?select=id&limit=1" -H "apikey: ${ANON}" -H "Authorization: Bearer ${ANON}"
```
Expected: ambos retornam `[]` (200, tabela vazia) — não erro de "relation does not exist".

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/006_propositions.sql
git commit -m "feat(db): migration 006 — propositions + proposition_authors"
```

---

## Task 2: Funções puras de normalização (workers)

**Files:**
- Create: `aprenda-politica-workers/scripts/propositions/normalize.mjs`
- Test: `aprenda-politica-workers/scripts/propositions/normalize.test.mjs`

- [ ] **Step 1: Escrever os testes (falhando)**

`scripts/propositions/normalize.test.mjs`:
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { slugify, buildSlug, normalizeType, dedupeAuthors } from './normalize.mjs'

test('slugify remove acentos e baixa caixa', () => {
  assert.equal(slugify('João DA Silva-Côrtes'), 'joao-da-silva-cortes')
})

test('buildSlug monta tipo-numero-ano', () => {
  assert.equal(buildSlug({ type: 'PL', number: 1853, year: 2026 }), 'pl-1853-2026')
})

test('buildSlug sem numero usa external_id e fonte', () => {
  assert.equal(buildSlug({ type: 'PEC', year: 2023, source: 'senado', externalId: 'X9' }), 'pec-2023-senado-x9')
})

test('normalizeType maiusculiza e tira acento', () => {
  assert.equal(normalizeType('pl'), 'PL')
  assert.equal(normalizeType('Proposição de Emenda'), 'PROPOSICAO DE EMENDA')
})

test('dedupeAuthors junta por author_name preservando 1ª ordem', () => {
  const out = dedupeAuthors([
    { author_name: 'Ana', ordem: 1 },
    { author_name: 'Ana', ordem: 5 },
    { author_name: 'Bruno', ordem: 2 },
  ])
  assert.equal(out.length, 2)
  assert.equal(out[0].author_name, 'Ana')
  assert.equal(out[0].ordem, 1)
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd /Users/gualtieri/Apps/aprenda-politica-workers && node --test scripts/propositions/normalize.test.mjs`
Expected: FAIL — `Cannot find module './normalize.mjs'`.

- [ ] **Step 3: Implementar**

`scripts/propositions/normalize.mjs`:
```js
export function slugify(s) {
  return (s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function normalizeType(t) {
  return (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim()
}

export function buildSlug({ type, number, year, source, externalId }) {
  const t = slugify(type)
  if (number && year) return `${t}-${number}-${year}`
  if (year) return `${t}-${year}-${slugify(source)}-${slugify(externalId)}`
  return `${t}-${slugify(source)}-${slugify(externalId)}`
}

export function dedupeAuthors(authors) {
  const byName = new Map()
  for (const a of authors) {
    if (!a.author_name) continue
    if (!byName.has(a.author_name)) byName.set(a.author_name, a)
  }
  return [...byName.values()]
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test scripts/propositions/normalize.test.mjs`
Expected: PASS (5 testes).

- [ ] **Step 5: Commit**

```bash
cd /Users/gualtieri/Apps/aprenda-politica-workers
git add scripts/propositions/normalize.mjs scripts/propositions/normalize.test.mjs
git commit -m "feat(prop): funções puras de normalização (slug, tipo, dedupe)"
```

---

## Task 3: Runner de ingestão genérico (workers)

**Files:**
- Create: `aprenda-politica-workers/scripts/propositions/ingest.mjs`

Este módulo é a peça reutilizada por todas as fontes. Recebe um adaptador, itera as proposições, casa autores↔políticos, faz upsert idempotente e calcula `party_ids` e `slug`.

- [ ] **Step 1: Implementar o ingest**

`scripts/propositions/ingest.mjs`:
```js
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { buildSlug, dedupeAuthors, slugify } from './normalize.mjs'

const env = Object.fromEntries(readFileSync('.env', 'utf8').split('\n')
  .filter(l => l && !l.startsWith('#') && l.includes('='))
  .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }))
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

/**
 * Índice de casamento de autores:
 *  - federal: external_id (id deputado / código senador) -> { id, party_id }
 *  - ES: nome normalizado (dep. estadual do ES) -> { id, party_id }
 */
async function loadMatchIndex() {
  const byExternal = new Map()
  const byNameES = new Map()
  let from = 0
  for (;;) {
    const { data, error } = await supabase.from('politicians')
      .select('id, name, party_id, external_id, source, state_id, position:positions(slug), state:states(abbr)')
      .order('id').range(from, from + 999)
    if (error) throw error
    if (!data?.length) break
    for (const p of data) {
      if (p.external_id && (p.source === 'camara' || p.source === 'senado')) {
        byExternal.set(`${p.source}:${p.external_id}`, { id: p.id, party_id: p.party_id })
      }
      const posSlug = p.position?.slug
      const uf = p.state?.abbr
      if (posSlug === 'deputado-estadual' && uf === 'ES') {
        byNameES.set(slugify(p.name), { id: p.id, party_id: p.party_id })
      }
    }
    if (data.length < 1000) break
    from += data.length
  }
  return { byExternal, byNameES }
}

function matchAuthor(raw, source, idx) {
  if ((source === 'camara' || source === 'senado') && raw.externalId) {
    return idx.byExternal.get(`${source}:${raw.externalId}`) ?? null
  }
  if (source === 'ales') return idx.byNameES.get(slugify(raw.name)) ?? null
  return null
}

export async function ingest(adapter, { sinceYear = 2023 } = {}) {
  const idx = await loadMatchIndex()
  let ok = 0, fail = 0
  for await (const p of adapter.fetchPropositions({ sinceYear })) {
    try {
      const authors = dedupeAuthors((p.authors || []).map(a => ({
        author_name: a.name, author_external_id: a.externalId ?? null,
        role: a.role ?? 'autor', ordem: a.ordem ?? null,
      })))
      const matched = authors.map(a => ({ a, m: matchAuthor({ name: a.author_name, externalId: a.author_external_id }, p.source, idx) }))
      const partyIds = [...new Set(matched.map(x => x.m?.party_id).filter(Boolean))]
      const slug = buildSlug({ type: p.type, number: p.number, year: p.year, source: p.source, externalId: p.externalId })

      const row = {
        source: p.source, external_id: p.externalId, type: p.type,
        number: p.number ?? null, year: p.year ?? null,
        title: p.title ?? null, summary: p.summary ?? null,
        presented_on: p.presentedOn ?? null, status: p.status ?? null,
        themes: p.themes ?? [], url: p.url ?? null,
        party_ids: partyIds, slug, updated_at: new Date().toISOString(),
      }
      const { data: up, error: upErr } = await supabase
        .from('propositions').upsert(row, { onConflict: 'source,external_id' }).select('id').single()
      if (upErr) throw upErr

      const authorRows = matched.map(({ a, m }) => ({
        proposition_id: up.id, politician_id: m?.id ?? null,
        author_name: a.author_name, author_external_id: a.author_external_id,
        role: a.role, ordem: a.ordem,
      }))
      if (authorRows.length) {
        await supabase.from('proposition_authors')
          .upsert(authorRows, { onConflict: 'proposition_id,author_name' })
      }
      if (++ok % 200 === 0) console.log(`  ...${ok} proposições`)
    } catch (e) {
      fail++
      console.warn(`  ✗ ${p.type} ${p.number}/${p.year}: ${e.message}`)
    }
  }
  console.log(`[${adapter.source}] concluído: ${ok} proposições, ${fail} falhas`)
}
```

- [ ] **Step 2: Verificar sintaxe**

Run: `cd /Users/gualtieri/Apps/aprenda-politica-workers && node --check scripts/propositions/ingest.mjs`
Expected: sem saída (sintaxe OK).

- [ ] **Step 3: Commit**

```bash
git add scripts/propositions/ingest.mjs
git commit -m "feat(prop): runner de ingestão (match autores, upsert, party_ids)"
```

---

## Task 4: Adaptador Câmara + runner CLI

**Files:**
- Create: `aprenda-politica-workers/scripts/propositions/adapters/camara.mjs`
- Create: `aprenda-politica-workers/scripts/propositions/registry.mjs`
- Create: `aprenda-politica-workers/scripts/sync-propositions.mjs`

Estratégia: para cada deputado **da nossa base** (source=camara), pedir as proposições que ele autorou no período (`idDeputadoAutor`), juntar ids únicos, e para cada id buscar detalhe + autores + temas. Isso limita o volume ao que interessa e garante o cruzamento.

- [ ] **Step 1: Implementar o adaptador Câmara**

`scripts/propositions/adapters/camara.mjs`:
```js
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { normalizeType } from '../normalize.mjs'

const env = Object.fromEntries(readFileSync('.env', 'utf8').split('\n')
  .filter(l => l && !l.startsWith('#') && l.includes('='))
  .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }))
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const API = 'https://dadosabertos.camara.leg.br/api/v2'

async function getJSON(url, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 25000)
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: ctrl.signal })
      clearTimeout(t)
      if (res.ok) return await res.json()
      if (res.status === 404) return null
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, 800 * 2 ** i))
  }
  throw new Error(`falha: ${url}`)
}

const idFromUri = uri => { const m = (uri || '').match(/\/(\d+)$/); return m ? m[1] : null }

async function deputadoExternalIds() {
  const { data: pos } = await supabase.from('positions').select('id').eq('slug', 'deputado-federal').single()
  const ids = []
  let from = 0
  for (;;) {
    const { data } = await supabase.from('politicians')
      .select('external_id').eq('position_id', pos.id).eq('source', 'camara').not('external_id', 'is', null)
      .order('id').range(from, from + 999)
    if (!data?.length) break
    ids.push(...data.map(d => d.external_id))
    if (data.length < 1000) break
    from += data.length
  }
  return ids
}

async function* listPropIdsByAuthor(depId, sinceYear) {
  const years = []
  for (let y = sinceYear; y <= new Date().getFullYear(); y++) years.push(y)
  let url = `${API}/proposicoes?idDeputadoAutor=${depId}&ano=${years.join(',')}&itens=100&ordem=ASC&ordenarPor=id`
  while (url) {
    const j = await getJSON(url)
    for (const d of j?.dados ?? []) yield d.id
    url = (j?.links ?? []).find(l => l.rel === 'next')?.href ?? null
  }
}

async function detail(id) {
  const [d, a, t] = await Promise.all([
    getJSON(`${API}/proposicoes/${id}`),
    getJSON(`${API}/proposicoes/${id}/autores`),
    getJSON(`${API}/proposicoes/${id}/temas`),
  ])
  if (!d?.dados) return null
  const p = d.dados
  return {
    source: 'camara', externalId: String(p.id),
    type: normalizeType(p.siglaTipo), number: p.numero ?? null, year: p.ano ?? null,
    title: p.ementa ?? null, summary: p.ementa ?? null,
    presentedOn: p.dataApresentacao ? p.dataApresentacao.slice(0, 10) : null,
    status: p.statusProposicao?.descricaoSituacao ?? null,
    themes: (t?.dados ?? []).map(x => x.tema).filter(Boolean),
    url: `https://www.camara.leg.br/propostas-legislativas/${p.id}`,
    authors: (a?.dados ?? []).map(x => ({
      name: x.nome, externalId: idFromUri(x.uri),
      role: x.proponente === 1 ? 'autor' : 'coautor', ordem: x.ordemAssinatura ?? null,
    })),
  }
}

export const camaraAdapter = {
  source: 'camara',
  async *fetchPropositions({ sinceYear }) {
    const deps = await deputadoExternalIds()
    console.log(`[camara] ${deps.length} deputados; coletando proposições...`)
    const seen = new Set()
    for (const depId of deps) {
      for await (const pid of listPropIdsByAuthor(depId, sinceYear)) {
        if (seen.has(pid)) continue
        seen.add(pid)
        const d = await detail(pid)
        if (d) yield d
        await new Promise(r => setTimeout(r, 80))
      }
    }
  },
}
```

- [ ] **Step 2: Criar o registry**

`scripts/propositions/registry.mjs`:
```js
import { camaraAdapter } from './adapters/camara.mjs'
// senado e ales entram nas tasks seguintes
export const registry = { camara: camaraAdapter }
```

- [ ] **Step 3: Criar o runner CLI**

`scripts/sync-propositions.mjs`:
```js
import { registry } from './propositions/registry.mjs'
import { ingest } from './propositions/ingest.mjs'

const source = process.argv[2]
const adapter = registry[source]
if (!adapter) {
  console.error(`fonte inválida: "${source}". Disponíveis: ${Object.keys(registry).join(', ')}`)
  process.exit(1)
}
ingest(adapter, { sinceYear: 2023 }).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
```

- [ ] **Step 4: Verificar sintaxe**

Run: `node --check scripts/propositions/adapters/camara.mjs && node --check scripts/sync-propositions.mjs`
Expected: sem saída.

- [ ] **Step 5: Rodar a ingestão da Câmara**

Run: `cd /Users/gualtieri/Apps/aprenda-politica-workers && node scripts/sync-propositions.mjs camara`
Expected: logs `[camara] N deputados; coletando...` → `...200 proposições` → `[camara] concluído: N proposições, 0 falhas`.

- [ ] **Step 6: Verificar no banco**

```bash
cd /Users/gualtieri/Apps/aprenda-politica
SUPA_URL=$(grep -E "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d= -f2-); ANON=$(grep -E "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d= -f2-)
curl -s "${SUPA_URL}/rest/v1/propositions?source=eq.camara&select=slug,type,number,year,party_ids&limit=3" -H "apikey: ${ANON}" -H "Authorization: Bearer ${ANON}"
curl -s "${SUPA_URL}/rest/v1/proposition_authors?select=author_name,politician_id&limit=3" -H "apikey: ${ANON}" -H "Authorization: Bearer ${ANON}"
```
Expected: proposições com `slug`/`party_ids` preenchidos e autores com `politician_id` casado (não-null para deputados da base).

- [ ] **Step 7: Commit**

```bash
cd /Users/gualtieri/Apps/aprenda-politica-workers
git add scripts/propositions/adapters/camara.mjs scripts/propositions/registry.mjs scripts/sync-propositions.mjs
git commit -m "feat(prop): adaptador Câmara + runner CLI (uma fonte por vez)"
```

---

## Task 5: Adaptador Senado

**Files:**
- Create: `aprenda-politica-workers/scripts/propositions/adapters/senado.mjs`
- Modify: `aprenda-politica-workers/scripts/propositions/registry.mjs`

Estratégia: para cada senador da base, `/senador/{codigo}/autorias` → matérias; detalhe via `/materia/{codigo}`.

- [ ] **Step 1: Implementar o adaptador Senado**

`scripts/propositions/adapters/senado.mjs`:
```js
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { normalizeType } from '../normalize.mjs'

const env = Object.fromEntries(readFileSync('.env', 'utf8').split('\n')
  .filter(l => l && !l.startsWith('#') && l.includes('='))
  .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }))
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const API = 'https://legis.senado.leg.br/dadosabertos'

async function getJSON(url, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 25000)
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: ctrl.signal })
      clearTimeout(t)
      if (res.ok) return await res.json()
      if (res.status === 404) return null
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, 800 * 2 ** i))
  }
  throw new Error(`falha: ${url}`)
}
const arr = x => Array.isArray(x) ? x : x == null ? [] : [x]

async function senadorCodigos() {
  const { data: pos } = await supabase.from('positions').select('id').eq('slug', 'senador').single()
  const ids = []
  let from = 0
  for (;;) {
    const { data } = await supabase.from('politicians')
      .select('external_id').eq('position_id', pos.id).eq('source', 'senado').not('external_id', 'is', null)
      .order('id').range(from, from + 999)
    if (!data?.length) break
    ids.push(...data.map(d => d.external_id))
    if (data.length < 1000) break
    from += data.length
  }
  return ids
}

async function detail(codMateria, sinceYear) {
  const j = await getJSON(`${API}/materia/${codMateria}.json`)
  const m = j?.DetalheMateria?.Materia
  if (!m) return null
  const id = m.IdentificacaoMateria || {}
  const dados = m.DadosBasicosMateria || {}
  const year = Number(id.AnoMateria) || null
  if (year && year < sinceYear) return null
  const autoria = arr(m.Autoria?.Autor)
  return {
    source: 'senado', externalId: String(id.CodigoMateria),
    type: normalizeType(id.SiglaSubtipoMateria), number: Number(id.NumeroMateria) || null, year,
    title: dados.EmentaMateria ?? null, summary: dados.EmentaMateria ?? null,
    presentedOn: dados.DataApresentacao ?? null,
    status: m.SituacaoAtual?.Autuacoes?.Autuacao?.Situacao?.DescricaoSituacao ?? null,
    themes: [dados.IndexacaoMateria].filter(Boolean),
    url: `https://www25.senado.leg.br/web/atividade/materias/-/materia/${id.CodigoMateria}`,
    authors: autoria.map((a, i) => ({
      name: a.NomeAutor, externalId: a.IdentificacaoParlamentar?.CodigoParlamentar ?? null,
      role: i === 0 ? 'autor' : 'coautor', ordem: i + 1,
    })),
  }
}

export const senadoAdapter = {
  source: 'senado',
  async *fetchPropositions({ sinceYear }) {
    const cods = await senadorCodigos()
    console.log(`[senado] ${cods.length} senadores; coletando autorias...`)
    const seen = new Set()
    for (const cod of cods) {
      const j = await getJSON(`${API}/senador/${cod}/autorias.json`)
      const aut = arr(j?.MateriasAutoriaParlamentar?.Parlamentar?.Autorias?.Autoria)
      for (const a of aut) {
        const codMat = a.Materia?.IdentificacaoMateria?.CodigoMateria
        if (!codMat || seen.has(codMat)) continue
        seen.add(codMat)
        const d = await detail(codMat, sinceYear)
        if (d) yield d
        await new Promise(r => setTimeout(r, 100))
      }
    }
  },
}
```

- [ ] **Step 2: Registrar o adaptador**

Modificar `scripts/propositions/registry.mjs`:
```js
import { camaraAdapter } from './adapters/camara.mjs'
import { senadoAdapter } from './adapters/senado.mjs'
export const registry = { camara: camaraAdapter, senado: senadoAdapter }
```

- [ ] **Step 3: Verificar sintaxe**

Run: `node --check scripts/propositions/adapters/senado.mjs`
Expected: sem saída.

- [ ] **Step 4: Rodar e verificar**

Run: `node scripts/sync-propositions.mjs senado`
Expected: `[senado] concluído: N proposições, ...`. Conferir no banco:
```bash
curl -s "${SUPA_URL}/rest/v1/propositions?source=eq.senado&select=slug,type,year&limit=3" -H "apikey: ${ANON}" -H "Authorization: Bearer ${ANON}"
```
Expected: linhas do Senado com `type` (PEC/PLP/PLS…) e `slug`.

> **Nota:** os campos do Senado (`DetalheMateria.Materia.*`) podem variar; se a estrutura divergir, ajustar os caminhos com base na resposta real de `${API}/materia/{cod}.json` (logar `JSON.stringify(j).slice(0,800)` no primeiro item para inspecionar). Reportar como BLOCKED se o shape for incompatível.

- [ ] **Step 5: Commit**

```bash
git add scripts/propositions/adapters/senado.mjs scripts/propositions/registry.mjs
git commit -m "feat(prop): adaptador Senado (autorias por senador)"
```

---

## Task 6: Adaptador ALES (ES) — com descoberta

**Files:**
- Create: `aprenda-politica-workers/scripts/propositions/adapters/ales.mjs`
- Modify: `aprenda-politica-workers/scripts/propositions/registry.mjs`

> **Risco conhecido (da spec):** o formato da fonte da ALES é desconhecido (REST vs. download de dataset). Este task começa com descoberta. Se não houver fonte programática viável, marcar ES como **BLOCKED** e seguir — Câmara+Senado já entregam o ciclo; ES entra num ciclo posterior sem afetar o resto (arquitetura de adaptadores isola).

- [ ] **Step 1: Descobrir a fonte de dados da ALES**

Investigar o portal de Dados Abertos da ALES e a base ALES DIGITAL:
- `https://www.al.es.gov.br/Transparencia/DadosAbertos`
- `https://www3.al.es.gov.br/`

Objetivo: achar um endpoint/dataset que liste proposições (PL/PEC estaduais) da legislatura atual com autor. Registrar no topo do arquivo `ales.mjs`, em comentário, a URL/forma encontrada (REST JSON, CSV, ou OData).

- [ ] **Step 2: Implementar o adaptador conforme a fonte encontrada**

`scripts/propositions/adapters/ales.mjs` (esqueleto a preencher com a fonte real; deve emitir o mesmo `RawProposition`):
```js
import { normalizeType } from '../normalize.mjs'

// FONTE (preencher na descoberta): <URL e formato>
// Autores casam por NOME (deputados estaduais do ES, source=tse) — sem external_id.

async function getJSON(url, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 25000)
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: ctrl.signal })
      clearTimeout(t)
      if (res.ok) return await res.json()
      if (res.status === 404) return null
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, 800 * 2 ** i))
  }
  throw new Error(`falha: ${url}`)
}

export const alesAdapter = {
  source: 'ales',
  async *fetchPropositions({ sinceYear }) {
    // 1. Buscar a lista de proposições da legislatura atual na fonte da ALES.
    // 2. Para cada uma, mapear para RawProposition:
    //    { source:'ales', externalId, type:normalizeType(tipo), number, year,
    //      title, summary, presentedOn, status, themes:[], url,
    //      authors:[{ name, externalId:null, role:'autor', ordem }] }
    // 3. Filtrar year >= sinceYear.
    // (corpo concreto definido após o Step 1)
    void getJSON; void normalizeType; void sinceYear
    return
  },
}
```

- [ ] **Step 3: Registrar o adaptador**

Modificar `scripts/propositions/registry.mjs`:
```js
import { camaraAdapter } from './adapters/camara.mjs'
import { senadoAdapter } from './adapters/senado.mjs'
import { alesAdapter } from './adapters/ales.mjs'
export const registry = { camara: camaraAdapter, senado: senadoAdapter, ales: alesAdapter }
```

- [ ] **Step 4: Rodar e verificar**

Run: `node scripts/sync-propositions.mjs ales`
Expected: `[ales] concluído: N proposições, ...` com autores casados por nome aos deputados estaduais do ES. Conferir:
```bash
curl -s "${SUPA_URL}/rest/v1/propositions?source=eq.ales&select=slug,type,year,party_ids&limit=3" -H "apikey: ${ANON}" -H "Authorization: Bearer ${ANON}"
```

- [ ] **Step 5: Commit**

```bash
git add scripts/propositions/adapters/ales.mjs scripts/propositions/registry.mjs
git commit -m "feat(prop): adaptador ALES/ES (casamento de autor por nome)"
```

---

## Task 7: Tipos + camada de consulta (frontend)

**Files:**
- Modify: `src/types/index.ts`
- Create: `src/lib/propositions.ts`
- Test: `src/lib/propositions.test.ts`

- [ ] **Step 1: Adicionar os tipos**

Em `src/types/index.ts`, após a interface `Politician` (linha ~67), adicionar:
```typescript
export interface PropositionAuthor {
  author_name: string
  politician_id: number | null
  role: string | null
  ordem: number | null
  politician?: { name: string; slug: string } | null
}

export interface Proposition {
  id: number
  source: string
  external_id: string
  type: string
  number: number | null
  year: number | null
  title: string | null
  summary: string | null
  presented_on: string | null
  status: string | null
  themes: string[] | null
  url: string | null
  party_ids: number[] | null
  slug: string
  authors?: PropositionAuthor[]
}
```

- [ ] **Step 2: Escrever o teste de `formatPropositionLabel` (falhando)**

`src/lib/propositions.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { formatPropositionLabel } from './propositions'

describe('formatPropositionLabel', () => {
  it('monta TIPO Nº/ANO', () => {
    expect(formatPropositionLabel({ type: 'PL', number: 1853, year: 2026 })).toBe('PL 1853/2026')
  })
  it('cai pro tipo quando falta número', () => {
    expect(formatPropositionLabel({ type: 'PEC', number: null, year: 2023 })).toBe('PEC 2023')
  })
})
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `cd /Users/gualtieri/Apps/aprenda-politica && npx vitest run src/lib/propositions.test.ts`
Expected: FAIL — `formatPropositionLabel` não existe.

- [ ] **Step 4: Implementar `src/lib/propositions.ts`**

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Proposition } from '@/types'

const SELECT =
  'id, source, external_id, type, number, year, title, summary, presented_on, status, themes, url, party_ids, slug'

export function formatPropositionLabel(p: { type: string; number: number | null; year: number | null }): string {
  if (p.number && p.year) return `${p.type} ${p.number}/${p.year}`
  if (p.year) return `${p.type} ${p.year}`
  return p.type
}

export interface PropositionFilter {
  tipo?: string; tema?: string; partido?: string; fonte?: string; autor?: string; q?: string
  page?: number; pageSize?: number
}

/** Lista proposições com filtros. Retorna {items,total}. */
export async function listPropositions(f: PropositionFilter): Promise<{ items: Proposition[]; total: number }> {
  const supabase = createServerSupabaseClient()
  const pageSize = f.pageSize ?? 30
  const page = f.page ?? 1
  let q = supabase.from('propositions').select(SELECT, { count: 'exact' })

  if (f.tipo) q = q.eq('type', f.tipo)
  if (f.fonte) q = q.eq('source', f.fonte)
  if (f.tema) q = q.contains('themes', [f.tema])
  if (f.q) q = q.or(`title.ilike.%${f.q}%,slug.ilike.%${f.q}%`)
  if (f.partido) {
    const { data: party } = await supabase.from('parties').select('id').eq('slug', f.partido).single()
    if (party) q = q.contains('party_ids', [party.id])
  }
  if (f.autor) {
    const { data: rows } = await supabase
      .from('proposition_authors').select('proposition_id, politician:politicians!inner(slug)')
      .eq('politician.slug', f.autor)
    const ids = (rows ?? []).map(r => r.proposition_id)
    q = ids.length ? q.in('id', ids) : q.eq('id', -1)
  }

  q = q.order('presented_on', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1)
  const { data, count } = await q
  return { items: (data as unknown as Proposition[]) ?? [], total: count ?? 0 }
}

/** Uma proposição por slug, com autores (linkando políticos existentes). */
export async function getPropositionBySlug(slug: string): Promise<Proposition | null> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('propositions').select(SELECT).eq('slug', slug).single()
  if (!data) return null
  const { data: authors } = await supabase
    .from('proposition_authors')
    .select('author_name, politician_id, role, ordem, politician:politicians(name, slug)')
    .eq('proposition_id', (data as { id: number }).id)
    .order('ordem', { ascending: true })
  return { ...(data as unknown as Proposition), authors: (authors as unknown as Proposition['authors']) ?? [] }
}

/** Proposições de um político (via vínculos de autoria). */
export async function propositionsByPolitician(politicianId: number, limit = 5): Promise<Proposition[]> {
  const supabase = createServerSupabaseClient()
  const { data: links } = await supabase
    .from('proposition_authors').select('proposition_id').eq('politician_id', politicianId)
  const ids = [...new Set((links ?? []).map(l => l.proposition_id))]
  if (!ids.length) return []
  const { data } = await supabase.from('propositions').select(SELECT)
    .in('id', ids).order('presented_on', { ascending: false }).limit(limit)
  return (data as unknown as Proposition[]) ?? []
}

/** Proposições recentes de um partido (via party_ids). */
export async function propositionsByParty(partyId: number, limit = 5): Promise<Proposition[]> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('propositions').select(SELECT)
    .contains('party_ids', [partyId]).order('presented_on', { ascending: false }).limit(limit)
  return (data as unknown as Proposition[]) ?? []
}

/** Tipos e temas distintos para popular os filtros. */
export async function propositionFacets(): Promise<{ types: string[] }> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('propositions').select('type')
  const types = [...new Set((data ?? []).map(r => (r as { type: string }).type))].sort()
  return { types }
}
```

- [ ] **Step 5: Rodar o teste e ver passar**

Run: `npx vitest run src/lib/propositions.test.ts`
Expected: PASS (2 testes).

- [ ] **Step 6: Typecheck e commit**

```bash
npx tsc --noEmit 2>&1 | grep -v "src/tests/" | grep -E "error TS" && echo "ERROS" || echo "tsc OK (fora dos testes)"
git add src/types/index.ts src/lib/propositions.ts src/lib/propositions.test.ts
git commit -m "feat(prop): tipos + camada de consulta de proposições"
```

---

## Task 8: Página de lista `/proposicoes` + filtros

**Files:**
- Create: `src/app/proposicoes/page.tsx`

Espelha o padrão de `src/app/politicos/page.tsx` (filtros via `searchParams`, RSC).

- [ ] **Step 1: Criar a página**

`src/app/proposicoes/page.tsx`:
```tsx
import Link from 'next/link'
import type { Metadata } from 'next'
import { listPropositions, propositionFacets, formatPropositionLabel } from '@/lib/propositions'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Proposições — Aprenda Política',
  description: 'Projetos de lei, PECs e outras proposições — por tipo, tema, partido e autor.',
}
export const revalidate = 3600

type PageProps = {
  searchParams: { tipo?: string; tema?: string; partido?: string; fonte?: string; autor?: string; q?: string; pagina?: string }
}

export default async function ProposicoesPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.pagina ?? '1', 10) || 1)
  const [{ items, total }, { types }, { data: parties }] = await Promise.all([
    listPropositions({ ...searchParams, page }),
    propositionFacets(),
    createServerSupabaseClient().from('parties').select('abbr, slug').order('abbr'),
  ])
  const pageSize = 30
  const pages = Math.ceil(total / pageSize)

  const qs = (patch: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams()
    const merged = { ...searchParams, ...patch }
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, String(v))
    return `/proposicoes?${sp.toString()}`
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Proposições</h1>
        <p className="text-gray-500 mb-8">{total.toLocaleString('pt-BR')} proposições do mandato atual.</p>

        {/* Filtros */}
        <form className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8" action="/proposicoes" method="get">
          <input name="q" defaultValue={searchParams.q} placeholder="Buscar por texto ou número"
            className="col-span-2 sm:col-span-4 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <select name="tipo" defaultValue={searchParams.tipo ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Todos os tipos</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select name="partido" defaultValue={searchParams.partido ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Todos os partidos</option>
            {(parties ?? []).filter(p => p.slug).map(p => <option key={p.slug} value={p.slug!}>{p.abbr}</option>)}
          </select>
          <select name="fonte" defaultValue={searchParams.fonte ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Todas as casas</option>
            <option value="camara">Câmara</option>
            <option value="senado">Senado</option>
            <option value="ales">Assembleia ES</option>
          </select>
          <button type="submit" className="bg-[#00A859] text-white rounded-lg px-3 py-2 text-sm font-medium">Filtrar</button>
        </form>

        {/* Lista */}
        <div className="space-y-3">
          {items.map(p => (
            <Link key={p.id} href={`/proposicoes/${p.slug}`} className="block border border-gray-200 rounded-xl p-4 hover:border-gray-400 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#00A859]">{formatPropositionLabel(p)}</span>
                {p.status && <span className="text-[10px] text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">{p.status}</span>}
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">{p.title}</p>
            </Link>
          ))}
          {items.length === 0 && <p className="text-sm text-gray-400">Nenhuma proposição encontrada com esses filtros.</p>}
        </div>

        {/* Paginação */}
        {pages > 1 && (
          <div className="mt-8 flex items-center justify-between text-sm">
            {page > 1 ? <Link href={qs({ pagina: page - 1 })} className="text-gray-600 hover:text-gray-900">← Anterior</Link> : <span />}
            <span className="text-gray-400">Página {page} de {pages}</span>
            {page < pages ? <Link href={qs({ pagina: page + 1 })} className="text-gray-600 hover:text-gray-900">Próxima →</Link> : <span />}
          </div>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verificar render**

Run (com dev server em :3002): `curl -s "http://localhost:3002/proposicoes" | grep -oE "Proposições|PL [0-9]+/[0-9]+|Nenhuma proposição" | sort -u | head`
Expected: aparece "Proposições" e ou cards `PL …/…` ou "Nenhuma proposição". Testar filtro: `curl -s "http://localhost:3002/proposicoes?tipo=PEC" | grep -oc "PEC"`.

- [ ] **Step 3: Commit**

```bash
git add src/app/proposicoes/page.tsx
git commit -m "feat(prop): página /proposicoes com filtros (tipo, partido, casa, busca)"
```

---

## Task 9: Página da proposição `/proposicoes/[slug]`

**Files:**
- Create: `src/app/proposicoes/[slug]/page.tsx`

- [ ] **Step 1: Criar a página**

`src/app/proposicoes/[slug]/page.tsx`:
```tsx
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPropositionBySlug, formatPropositionLabel } from '@/lib/propositions'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getPropositionBySlug(params.slug)
  if (!p) return { title: 'Proposição — Aprenda Política' }
  return { title: `${formatPropositionLabel(p)} — Aprenda Política`, description: p.title ?? undefined }
}

export default async function PropositionPage({ params }: { params: { slug: string } }) {
  const p = await getPropositionBySlug(params.slug)
  if (!p) notFound()

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-BR') : null

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/proposicoes" className="hover:text-gray-600">Proposições</Link>
          <span>›</span>
          <span className="text-gray-600">{formatPropositionLabel(p)}</span>
        </nav>

        <div className="flex items-center gap-2 mb-3">
          <h1 className="text-2xl font-bold text-gray-900">{formatPropositionLabel(p)}</h1>
          {p.status && <span className="text-xs text-gray-600 bg-gray-100 rounded-full px-2 py-0.5">{p.status}</span>}
        </div>

        {p.summary && <p className="text-gray-700 leading-relaxed mb-6">{p.summary}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {fmtDate(p.presented_on) && (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Apresentação</div>
              <div className="text-sm font-bold text-gray-800 mt-1">{fmtDate(p.presented_on)}</div>
            </div>
          )}
          {(p.themes ?? []).length > 0 && (
            <div className="bg-gray-50 rounded-xl p-3 col-span-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Temas</div>
              <div className="text-sm font-bold text-gray-800 mt-1">{(p.themes ?? []).join(', ')}</div>
            </div>
          )}
        </div>

        <section className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Autoria</h2>
          <div className="flex flex-wrap gap-2">
            {(p.authors ?? []).map((a, i) => a.politician?.slug ? (
              <Link key={i} href={`/politico/${a.politician.slug}`} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-400">
                {a.politician.name}
              </Link>
            ) : (
              <span key={i} className="text-sm border border-gray-100 rounded-lg px-3 py-1.5 text-gray-500">{a.author_name}</span>
            ))}
          </div>
        </section>

        {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#00A859] font-medium hover:underline">Ver no portal oficial →</a>}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verificar render**

Pegar um slug real e abrir:
```bash
SLUG=$(curl -s "${SUPA_URL}/rest/v1/propositions?select=slug&limit=1" -H "apikey: ${ANON}" -H "Authorization: Bearer ${ANON}" | grep -oE '"slug":"[^"]+"' | head -1 | cut -d'"' -f4)
curl -s "http://localhost:3002/proposicoes/$SLUG" | grep -oE "Autoria|Apresentação|Ver no portal" | sort -u
```
Expected: aparece "Autoria" e os blocos da página.

- [ ] **Step 3: Commit**

```bash
git add src/app/proposicoes/\[slug\]/page.tsx
git commit -m "feat(prop): página da proposição com autores linkados"
```

---

## Task 10: Bloco de proposições no perfil do político

**Files:**
- Modify: `src/app/politico/[slug]/page.tsx`

Substituir o uso do JSONB `proposals` por consulta à nova entidade. (A seção de Bio já virou o grid "Perfil" — agora adicionamos "Proposições".)

- [ ] **Step 1: Importar o helper**

No topo de `src/app/politico/[slug]/page.tsx`, junto aos imports existentes:
```tsx
import { propositionsByPolitician, formatPropositionLabel } from '@/lib/propositions'
```

- [ ] **Step 2: Buscar as proposições do político**

Logo após `const politician = p as Politician` (linha ~68), adicionar:
```tsx
  const propositions = await propositionsByPolitician(politician.id, 5)
```

- [ ] **Step 3: Renderizar o bloco**

Localizar a seção "Proposta de governo" (`{politician.government_plan_url && (` , ~linha 274) e inserir **antes** dela:
```tsx
        {/* Proposições (autoria) */}
        {propositions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Proposições</h2>
            <div className="space-y-2">
              {propositions.map(pr => (
                <Link key={pr.id} href={`/proposicoes/${pr.slug}`} className="block border border-gray-200 rounded-xl p-3 hover:border-gray-400 transition-colors">
                  <span className="text-xs font-bold text-[#00A859]">{formatPropositionLabel(pr)}</span>
                  <p className="text-sm text-gray-700 line-clamp-2 mt-0.5">{pr.title}</p>
                </Link>
              ))}
            </div>
            <Link href={`/proposicoes?autor=${politician.slug}`} className="inline-block mt-3 text-sm text-[#00A859] font-medium hover:underline">
              Ver todas as proposições →
            </Link>
          </section>
        )}
```
(O componente já importa `Link` de `next/link`.)

- [ ] **Step 4: Verificar render + typecheck**

```bash
npx tsc --noEmit 2>&1 | grep -v "src/tests/" | grep -E "error TS" && echo "ERROS" || echo "tsc OK"
# perfil de um deputado com proposições:
curl -s "http://localhost:3002/politico/<slug-de-um-deputado>" | grep -oE "Proposições|Ver todas as proposições" | sort -u
```
Expected: "Proposições" + "Ver todas as proposições" aparecem no perfil de quem tem autorias.

- [ ] **Step 5: Commit**

```bash
git add src/app/politico/\[slug\]/page.tsx
git commit -m "feat(prop): bloco de proposições no perfil do político"
```

---

## Task 11: Bloco de proposições na página do partido

**Files:**
- Modify: `src/app/partidos/[slug]/page.tsx`

- [ ] **Step 1: Inspecionar a página e achar o id do partido + ponto de inserção**

Ler `src/app/partidos/[slug]/page.tsx` e localizar: (a) onde o objeto do partido (com `id`) é carregado; (b) um ponto no fim do conteúdo principal para inserir a seção. Confirmar o nome da variável do partido (ex.: `party`).

- [ ] **Step 2: Importar e buscar**

Adicionar import:
```tsx
import { propositionsByParty, formatPropositionLabel } from '@/lib/propositions'
```
Após o carregamento do partido (usando o id real da variável encontrada, ex.: `party.id`):
```tsx
  const partyPropositions = await propositionsByParty(party.id, 5)
```

- [ ] **Step 3: Renderizar a seção** (inserir no ponto identificado no Step 1)

```tsx
        {partyPropositions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Proposições do partido</h2>
            <div className="space-y-2">
              {partyPropositions.map(pr => (
                <Link key={pr.id} href={`/proposicoes/${pr.slug}`} className="block border border-gray-200 rounded-xl p-3 hover:border-gray-400 transition-colors">
                  <span className="text-xs font-bold text-[#00A859]">{formatPropositionLabel(pr)}</span>
                  <p className="text-sm text-gray-700 line-clamp-2 mt-0.5">{pr.title}</p>
                </Link>
              ))}
            </div>
            <Link href={`/proposicoes?partido=${params.slug}`} className="inline-block mt-3 text-sm text-[#00A859] font-medium hover:underline">
              Ver todas →
            </Link>
          </section>
        )}
```
(Se a página ainda não importa `Link`, adicionar `import Link from 'next/link'`.)

- [ ] **Step 4: Verificar render + typecheck**

```bash
npx tsc --noEmit 2>&1 | grep -v "src/tests/" | grep -E "error TS" && echo "ERROS" || echo "tsc OK"
curl -s "http://localhost:3002/partidos/<slug-de-um-partido>" | grep -oE "Proposições do partido" | head
```
Expected: "Proposições do partido" aparece para partidos com proposições.

- [ ] **Step 5: Commit**

```bash
git add src/app/partidos/\[slug\]/page.tsx
git commit -m "feat(prop): bloco de proposições na página do partido"
```

---

## Task 12: Item "Proposições" na navbar

**Files:**
- Modify: `src/components/ui/Navbar.tsx`

- [ ] **Step 1: Inspecionar o array de links**

Ler `src/components/ui/Navbar.tsx` e localizar o array `links` (itens como Início, Estados, Partidos, Políticos, e o grupo "Aprenda Política" com `children`).

- [ ] **Step 2: Adicionar o link**

Inserir `{ href: '/proposicoes', label: 'Proposições' }` no array `links`, após o item "Políticos" (mantendo "Aprenda Política" na 2ª posição conforme o padrão atual — inserir o novo item depois de Políticos, antes ou depois de Aprenda conforme a ordem visual desejada; padrão: ao lado de Políticos).

- [ ] **Step 3: Verificar**

```bash
curl -s "http://localhost:3002/" | grep -oE "Proposições" | head -1
```
Expected: "Proposições" aparece no HTML da navbar. Conferir no navegador que o link ativo destaca em `/proposicoes` (a navbar já usa `isActive()` por prefixo).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Navbar.tsx
git commit -m "feat(prop): item Proposições na navbar"
```

---

## Verificação final (após todas as tasks)

1. **Build:** `cd /Users/gualtieri/Apps/aprenda-politica && npm run build` — deve compilar sem erros.
2. **Testes:** `npx vitest run src/lib/propositions.test.ts` e `cd ../aprenda-politica-workers && node --test scripts/propositions/normalize.test.mjs` — todos passam.
3. **Fluxo end-to-end** (dev server :3002):
   - `/proposicoes` lista e os filtros `?tipo=`, `?partido=`, `?fonte=`, `?q=`, `?autor=` funcionam.
   - `/proposicoes/<slug>` mostra ementa, autores (linkando perfis) e link oficial.
   - Perfil de um deputado mostra "Proposições" + "Ver todas".
   - Página de um partido mostra "Proposições do partido".
   - Navbar tem "Proposições".
4. **Cruzamento:** `party_ids` preenchido permite `/proposicoes?partido=pt` retornar resultados.
5. **Extensibilidade (critério de sucesso):** adicionar uma nova casa = criar 1 adaptador em `adapters/` + 1 linha no `registry.mjs`, sem tocar `ingest.mjs`, modelo ou UI.

## Notas de implementação

- **Volume/tempo:** a ingestão da Câmara faz N deputados × proposições × 3 chamadas de detalhe — pode levar vários minutos. Rodar localmente (as APIs Câmara/Senado funcionam de qualquer IP, diferente do TSE). O `ingest` loga a cada 200.
- **Idempotência:** re-rodar qualquer fonte faz `upsert` por `(source, external_id)` — seguro repetir.
- **Coluna `proposals` (JSONB):** deixa de ser exibida (perfil passa a ler a entidade). Remoção fica para migration posterior, fora deste ciclo.
- **ES (Task 6):** se a fonte da ALES não tiver acesso programático viável, marcar BLOCKED e seguir — Câmara+Senado entregam o ciclo; ES entra depois sem redesign.
