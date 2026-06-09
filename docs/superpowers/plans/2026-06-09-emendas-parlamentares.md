# Emendas Parlamentares — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar uma página didática `/aprenda/emendas` e um objeto do sistema `emendas` (ingerido da API do Portal da Transparência, 2023→2025) cruzado com políticos, partidos e municípios — com o ângulo cívico "quanto seu deputado destinou pra sua cidade".

**Architecture:** Página Aprenda estática (RSC). Entidade `emendas` no nível de linha de execução (emenda×localidade×função), ingerida por script `.mjs` nos workers (API paginada + parse + casamento autor→político e localidade→município). Frontend RSC reusando os padrões das proposições (cards, Avatar, tokens, filtros via searchParams).

**Tech Stack:** Next.js 14 (RSC), Supabase (PostgREST), Tailwind (tokens `verde/amarelo/esfera`), vitest + `node:test` (funções puras de parse), Node ESM `.mjs` (ingestão).

**Spec:** `docs/superpowers/specs/2026-06-09-emendas-parlamentares-design.md`

---

## File Structure

**Frontend (`aprenda-politica/`):**
| Arquivo | Responsabilidade |
|---|---|
| `src/app/aprenda/emendas/page.tsx` | guia didático de emendas |
| `src/components/ui/Navbar.tsx` (mod) | item "Emendas" no submenu Aprenda |
| `src/app/aprenda/page.tsx` (mod) | card de emendas no hub |
| `src/lib/emendas.ts` | tipos + consultas + `formatMoney`, `funcaoToTema` |
| `src/lib/emendas.test.ts` | testes vitest de `formatMoney` |
| `src/app/emendas/page.tsx` | lista + filtros + faixa de dados |
| `src/app/politico/[slug]/page.tsx` (mod) | bloco "Emendas" |
| `src/app/[estado]/[municipio]/page.tsx` (mod) | bloco "Emendas recebidas" |
| `src/app/partidos/[slug]/page.tsx` (mod) | bloco emendas do partido |
| `src/lib/sitemap.ts` (mod) | `/emendas` no `STATIC_PATHS` |
| `supabase/migrations/008_emendas.sql` | tabela + índices + RLS |

**Workers (`aprenda-politica-workers/`):**
| Arquivo | Responsabilidade |
|---|---|
| `scripts/emendas/parse.mjs` | funções puras: `parseBRL`, `parseLocalidade`, `tipoGrupo` |
| `scripts/emendas/parse.test.mjs` | testes `node:test` |
| `scripts/sync-emendas.mjs` | ingestão da API + casamentos + upsert |

---

## Task 1: Página Aprenda `/aprenda/emendas`

**Files:**
- Create: `src/app/aprenda/emendas/page.tsx`
- Modify: `src/components/ui/Navbar.tsx`
- Modify: `src/app/aprenda/page.tsx`

- [ ] **Step 1: Criar `src/app/aprenda/emendas/page.tsx`**
```tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Emendas Parlamentares — o que são e como funcionam — Aprenda Política',
  description: 'O que são emendas parlamentares, os tipos (individual, bancada, comissão, relator), o orçamento impositivo e o que o cidadão pode fiscalizar.',
}
export const revalidate = false

const ACCENT = '#0D9488'

const TIPOS = [
  { nome: 'Individual', desc: 'Cada deputado e senador tem uma cota anual para destinar a obras e serviços. Tem autor único e destino definido — dá para saber exatamente quem mandou e para onde.' },
  { nome: 'De bancada', desc: 'Propostas pela bancada de um estado em conjunto. Atendem projetos de interesse estadual ou regional; o "autor" é a bancada, não um parlamentar.' },
  { nome: 'De comissão', desc: 'Apresentadas por comissões permanentes da Câmara ou do Senado, para temas de sua área.' },
  { nome: 'De relator (RP9)', desc: 'Indicadas pelo relator do orçamento. Foram alvo de polêmica por baixa transparência sobre quem realmente as indicou (o "orçamento secreto").' },
]

const FISCALIZAR = [
  'De quem é a emenda e para qual município ela foi destinada.',
  'A função (saúde, educação, infraestrutura…) e o valor.',
  'A diferença entre o valor empenhado (prometido) e o pago (entregue).',
  'Se a obra ou serviço financiado realmente saiu do papel na sua cidade.',
]

export default function EmendasAprendaPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/aprenda" className="hover:text-gray-600">Aprenda</Link><span>›</span>
          <span className="text-gray-600">Emendas Parlamentares</span>
        </nav>

        <div className="flex items-center gap-4 mb-5">
          <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${ACCENT}14` }}>💸</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Emendas Parlamentares</h1>
        </div>

        <div className="space-y-3 text-gray-700 leading-relaxed mb-8">
          <p>Emenda parlamentar é o instrumento pelo qual deputados e senadores <span className="font-semibold">direcionam parte do orçamento da União</span> para obras, serviços e repasses — muitas vezes para os municípios de suas bases eleitorais.</p>
          <p>É uma das formas mais concretas de o parlamentar levar recursos federais para a sua cidade — e, por isso, uma das mais importantes de acompanhar.</p>
        </div>

        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Os tipos de emenda</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TIPOS.map(t => (
              <div key={t.nome} className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{t.nome}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Orçamento impositivo</h2>
          <p className="text-gray-700 leading-relaxed">
            Desde 2015, parte das emendas é <span className="font-semibold">impositiva</span>: o governo é
            obrigado a executá-las, não pode simplesmente engavetá-las. Isso deu mais força ao Congresso na
            divisão do orçamento — e tornou ainda mais relevante saber quem destina o quê.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Empenhado × pago</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm font-bold text-gray-900 mb-1">Empenhado</div>
              <p className="text-sm text-gray-600">O dinheiro <span className="font-medium">reservado/prometido</span> para a emenda. É um compromisso, mas ainda não saiu do caixa.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm font-bold text-gray-900 mb-1">Pago</div>
              <p className="text-sm text-gray-600">O dinheiro que <span className="font-medium">efetivamente foi entregue</span>. É o que de fato chegou ao destino.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>O que você pode fiscalizar</h2>
          <ul className="space-y-1.5">
            {FISCALIZAR.map((f, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="mt-1" style={{ color: ACCENT }}>✓</span>{f}</li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100">
          <Link href="/emendas" className="text-sm font-medium hover:underline" style={{ color: ACCENT }}>Ver as emendas reais →</Link>
          <Link href="/aprenda" className="text-sm text-gray-500 hover:text-gray-700">← Voltar para o Aprenda</Link>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Adicionar ao submenu "Aprenda Política" da navbar** — em `src/components/ui/Navbar.tsx`, localizar o array `children` do item "Aprenda Política" (lista de guias). Adicionar, no fim do array `children`, o item:
```tsx
        { href: '/aprenda/emendas', label: 'Emendas Parlamentares' },
```
(Manter o padrão exato dos outros itens `children`.)

- [ ] **Step 3: Adicionar card no hub `/aprenda`** — em `src/app/aprenda/page.tsx`, localizar o array de tópicos/guias (cada um com `href`, `title`, `description` e cor). Adicionar um item seguindo o shape existente:
```tsx
  {
    href: '/aprenda/emendas',
    emoji: '💸',
    title: 'Emendas Parlamentares',
    description: 'Como deputados e senadores destinam verba do orçamento para os municípios — e como fiscalizar.',
    color: 'bg-teal-50 border-teal-200 hover:border-teal-400',
    tag: 'bg-teal-100 text-teal-700',
  },
```
(Se o shape do array for diferente — ex.: usa `Icon` em vez de `emoji`, ou outra estrutura de cor — adaptar ao padrão real do arquivo, lido no passo. O objetivo é um card linkando `/aprenda/emendas`.)

- [ ] **Step 4: Verificar + commit**
```bash
cd /Users/gualtieri/Apps/aprenda-politica
npx tsc --noEmit 2>&1 | grep -v "src/tests/" | grep -E "error TS" && echo ERROS || echo "tsc ok"
curl -s "http://localhost:3002/aprenda/emendas" | grep -oE "Emendas Parlamentares|Orçamento impositivo|Empenhado|Ver as emendas" | sort -u
curl -s "http://localhost:3002/" | grep -oc "/aprenda/emendas"
git add "src/app/aprenda/emendas/page.tsx" src/components/ui/Navbar.tsx src/app/aprenda/page.tsx
git commit -m "feat(emendas): página didática /aprenda/emendas + navbar + hub"
```
Expected: tsc ok; marcadores presentes; `/aprenda/emendas` aparece na navbar.

---

## Task 2: Migration 008 — tabela `emendas`

**Files:**
- Create: `supabase/migrations/008_emendas.sql`

- [ ] **Step 1: Criar a migration**
```sql
CREATE TABLE IF NOT EXISTS emendas (
  id              BIGSERIAL PRIMARY KEY,
  codigo          TEXT NOT NULL,
  ano             INTEGER,
  numero          TEXT,
  tipo            TEXT,
  tipo_grupo      TEXT,          -- 'individual'|'bancada'|'comissao'|'relator'
  autor_nome      TEXT,
  politician_id   BIGINT REFERENCES politicians(id),
  funcao          TEXT,
  subfuncao       TEXT,
  localidade_raw  TEXT,
  municipality_id BIGINT REFERENCES municipalities(id),
  uf              TEXT,
  valor_empenhado NUMERIC DEFAULT 0,
  valor_liquidado NUMERIC DEFAULT 0,
  valor_pago      NUMERIC DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(codigo, localidade_raw, funcao, ano)
);

CREATE INDEX IF NOT EXISTS idx_emendas_politician   ON emendas (politician_id);
CREATE INDEX IF NOT EXISTS idx_emendas_municipality ON emendas (municipality_id);
CREATE INDEX IF NOT EXISTS idx_emendas_ano          ON emendas (ano);
CREATE INDEX IF NOT EXISTS idx_emendas_uf           ON emendas (uf);
CREATE INDEX IF NOT EXISTS idx_emendas_funcao       ON emendas (funcao);
CREATE INDEX IF NOT EXISTS idx_emendas_tipo_grupo   ON emendas (tipo_grupo);

ALTER TABLE emendas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS public_read ON emendas;
CREATE POLICY public_read ON emendas FOR SELECT USING (true);
```

- [ ] **Step 2: Aplicar** no Supabase → SQL Editor.

- [ ] **Step 3: Verificar**
```bash
SUPA_URL=$(grep -E "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d= -f2-); ANON=$(grep -E "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d= -f2-)
curl -s "${SUPA_URL}/rest/v1/emendas?select=id&limit=1" -H "apikey: ${ANON}" -H "Authorization: Bearer ${ANON}"
```
Expected: `[]` (tabela existe, anon lê via RLS).

- [ ] **Step 4: Commit**
```bash
git add supabase/migrations/008_emendas.sql
git commit -m "feat(db): migration 008 — tabela emendas"
```

---

## Task 3: Funções de parse + ingestão (workers)

**Files:**
- Create: `aprenda-politica-workers/scripts/emendas/parse.mjs`
- Test: `aprenda-politica-workers/scripts/emendas/parse.test.mjs`
- Create: `aprenda-politica-workers/scripts/sync-emendas.mjs`

- [ ] **Step 1: Escrever os testes** — `scripts/emendas/parse.test.mjs`:
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseBRL, parseLocalidade, tipoGrupo } from './parse.mjs'

test('parseBRL converte "10.000,00" → 10000', () => {
  assert.equal(parseBRL('10.000,00'), 10000)
  assert.equal(parseBRL('1.234.567,89'), 1234567.89)
  assert.equal(parseBRL('0,00'), 0)
  assert.equal(parseBRL(''), 0)
})

test('parseLocalidade separa município e UF', () => {
  assert.deepEqual(parseLocalidade('LONDRINA - PR'), { municipio: 'LONDRINA', uf: 'PR' })
  assert.deepEqual(parseLocalidade('PR'), { municipio: null, uf: 'PR' })
  assert.deepEqual(parseLocalidade('NACIONAL'), { municipio: null, uf: null })
  assert.deepEqual(parseLocalidade(''), { municipio: null, uf: null })
})

test('tipoGrupo classifica o tipoEmenda', () => {
  assert.equal(tipoGrupo('Emenda Individual - Transferências com Finalidade Definida'), 'individual')
  assert.equal(tipoGrupo('Emenda de Bancada Estadual'), 'bancada')
  assert.equal(tipoGrupo('Emenda de Comissão'), 'comissao')
  assert.equal(tipoGrupo('Emenda de Relator-Geral'), 'relator')
  assert.equal(tipoGrupo('Outra coisa'), 'outro')
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd /Users/gualtieri/Apps/aprenda-politica-workers && node --test scripts/emendas/parse.test.mjs`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar `scripts/emendas/parse.mjs`**
```js
/** "10.000,00" -> 10000 (em reais). */
export function parseBRL(s) {
  if (!s) return 0
  const n = Number(String(s).replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

/** "LONDRINA - PR" -> { municipio, uf }. UF sozinha -> {municipio:null, uf}. Nacional -> nulls. */
export function parseLocalidade(s) {
  const v = (s || '').trim().toUpperCase()
  if (!v || v === 'NACIONAL' || v === 'EXTERIOR' || v === 'MÚLTIPLO' || v === 'MULTIPLO') return { municipio: null, uf: null }
  const m = v.match(/^(.+?)\s*-\s*([A-Z]{2})$/)
  if (m) return { municipio: m[1].trim(), uf: m[2] }
  if (/^[A-Z]{2}$/.test(v)) return { municipio: null, uf: v }
  return { municipio: v, uf: null }
}

/** tipoEmenda -> grupo. */
export function tipoGrupo(t) {
  const s = (t || '').toLowerCase()
  if (s.includes('individual')) return 'individual'
  if (s.includes('bancada')) return 'bancada'
  if (s.includes('comiss')) return 'comissao'
  if (s.includes('relator')) return 'relator'
  return 'outro'
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test scripts/emendas/parse.test.mjs`
Expected: PASS (3 testes).

- [ ] **Step 5: Implementar `scripts/sync-emendas.mjs`**
```js
/** Ingere emendas (2023→2025) da API do Portal da Transparência. */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { parseBRL, parseLocalidade, tipoGrupo } from './emendas/parse.mjs'

const env = Object.fromEntries(readFileSync('.env', 'utf8').split('\n')
  .filter(l => l && !l.startsWith('#') && l.includes('='))
  .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }))
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const KEY = env.PORTAL_TRANSPARENCIA_KEY
const API = 'https://api.portaldatransparencia.gov.br/api-de-dados/emendas'
const YEARS = [2023, 2024, 2025]

const slugify = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

async function getPage(ano, pagina, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 25000)
      const res = await fetch(`${API}?ano=${ano}&pagina=${pagina}`, { headers: { 'chave-api-dados': KEY, Accept: 'application/json' }, signal: ctrl.signal })
      clearTimeout(t)
      if (res.ok) return await res.json()
      if (res.status === 404) return []
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, 800 * 2 ** i))
  }
  throw new Error(`falha ano ${ano} pág ${pagina}`)
}

/** Índices de casamento: deputados/senadores por nome; municípios por uf|nome. */
async function loadIndex() {
  const polByName = new Map()
  let from = 0
  for (;;) {
    const { data } = await supabase.from('politicians')
      .select('id, name, position:positions(slug)').order('id').range(from, from + 999)
    if (!data?.length) break
    for (const p of data) {
      const slug = p.position?.slug
      if (slug === 'deputado-federal' || slug === 'senador') {
        const k = slugify(p.name)
        if (!polByName.has(k)) polByName.set(k, p.id)
      }
    }
    if (data.length < 1000) break
    from += data.length
  }
  const muniByKey = new Map()
  from = 0
  for (;;) {
    const { data } = await supabase.from('municipalities')
      .select('id, name, state:states(abbr)').order('id').range(from, from + 999)
    if (!data?.length) break
    for (const m of data) {
      const uf = m.state?.abbr
      if (uf) muniByKey.set(`${uf}|${slugify(m.name)}`, m.id)
    }
    if (data.length < 1000) break
    from += data.length
  }
  return { polByName, muniByKey }
}

async function runPool(items, worker, concurrency = 20) {
  let idx = 0, done = 0, fail = 0
  async function lane() {
    while (idx < items.length) {
      const it = items[idx++]
      try { await worker(it) } catch { fail++ }
      if (++done % 2000 === 0) console.log(`  ...${done}/${items.length} upserts`)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, lane))
  return { done, fail }
}

async function main() {
  if (!KEY) throw new Error('PORTAL_TRANSPARENCIA_KEY ausente no .env')
  const idx = await loadIndex()
  console.log(`[emendas] índices: ${idx.polByName.size} parlamentares, ${idx.muniByKey.size} municípios`)
  const rows = []
  for (const ano of YEARS) {
    let pagina = 1
    for (;;) {
      const page = await getPage(ano, pagina)
      if (!page.length) break
      for (const e of page) {
        const { municipio, uf } = parseLocalidade(e.localidadeDoGasto)
        const tg = tipoGrupo(e.tipoEmenda)
        const politician_id = tg === 'individual' ? (idx.polByName.get(slugify(e.nomeAutor || e.autor)) ?? null) : null
        const municipality_id = municipio && uf ? (idx.muniByKey.get(`${uf}|${slugify(municipio)}`) ?? null) : null
        rows.push({
          codigo: String(e.codigoEmenda), ano: Number(e.ano) || ano, numero: e.numeroEmenda ?? null,
          tipo: e.tipoEmenda ?? null, tipo_grupo: tg, autor_nome: e.nomeAutor || e.autor || null, politician_id,
          funcao: e.funcao ?? null, subfuncao: e.subfuncao ?? null,
          localidade_raw: e.localidadeDoGasto ?? null, municipality_id, uf,
          valor_empenhado: parseBRL(e.valorEmpenhado), valor_liquidado: parseBRL(e.valorLiquidado), valor_pago: parseBRL(e.valorPago),
          updated_at: new Date().toISOString(),
        })
      }
      if (pagina % 50 === 0) console.log(`[emendas] ${ano}: ${pagina} páginas, ${rows.length} linhas`)
      pagina++
      await new Promise(r => setTimeout(r, 60))
    }
    console.log(`[emendas] ${ano}: coletado (total acumulado ${rows.length})`)
  }
  console.log(`[emendas] ${rows.length} linhas a gravar...`)
  const { done, fail } = await runPool(rows, r =>
    supabase.from('emendas').upsert(r, { onConflict: 'codigo,localidade_raw,funcao,ano' }))
  const comPol = rows.filter(r => r.politician_id).length
  const comMuni = rows.filter(r => r.municipality_id).length
  console.log(`[emendas] concluído: ${done - fail} gravadas, ${fail} falhas · autor casado: ${comPol} · município casado: ${comMuni}`)
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
```

- [ ] **Step 6: Sintaxe + rodar ingestão**

Run: `node --check scripts/sync-emendas.mjs && node --check scripts/emendas/parse.mjs && echo OK`
Run: `node scripts/sync-emendas.mjs`
Expected: logs de páginas por ano → `[emendas] concluído: N gravadas, … autor casado: X · município casado: Y`. Pode levar vários minutos (paginação de 15/página). Deixe terminar.

- [ ] **Step 7: Verificar no banco**
```bash
cd /Users/gualtieri/Apps/aprenda-politica
SUPA_URL=$(grep -E "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d= -f2-); ANON=$(grep -E "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d= -f2-)
curl -s "${SUPA_URL}/rest/v1/emendas?select=codigo,autor_nome,uf,funcao,valor_pago,politician_id,municipality_id&limit=3" -H "apikey: ${ANON}" -H "Authorization: Bearer ${ANON}"
curl -s "${SUPA_URL}/rest/v1/emendas?politician_id=not.is.null&select=id&limit=1" -H "apikey: ${ANON}" -H "Authorization: Bearer ${ANON}" -H "Prefer: count=exact" -H "Range: 0-0" -i 2>/dev/null | grep -i content-range
```
Expected: linhas com valores; contagem de emendas com `politician_id` casado > 0.

- [ ] **Step 8: Commit (workers, sem push)**
```bash
cd /Users/gualtieri/Apps/aprenda-politica-workers
git add scripts/emendas/parse.mjs scripts/emendas/parse.test.mjs scripts/sync-emendas.mjs
git commit -m "feat(emendas): parse + ingestão da API do Portal da Transparência"
```

---

## Task 4: Camada de consulta (`src/lib/emendas.ts`)

**Files:**
- Create: `src/lib/emendas.ts`
- Test: `src/lib/emendas.test.ts`

- [ ] **Step 1: Teste (falhando)** — `src/lib/emendas.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { formatMoney } from './emendas'

describe('formatMoney', () => {
  it('formata reais em escala legível', () => {
    expect(formatMoney(10000)).toBe('R$ 10 mil')
    expect(formatMoney(1500000)).toBe('R$ 1,5 mi')
    expect(formatMoney(2300000000)).toBe('R$ 2,3 bi')
    expect(formatMoney(500)).toBe('R$ 500')
    expect(formatMoney(0)).toBe('R$ 0')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd /Users/gualtieri/Apps/aprenda-politica && npx vitest run src/lib/emendas.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar `src/lib/emendas.ts`**
```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface Emenda {
  id: number
  codigo: string
  ano: number | null
  tipo: string | null
  tipo_grupo: string | null
  autor_nome: string | null
  politician_id: number | null
  funcao: string | null
  subfuncao: string | null
  localidade_raw: string | null
  municipality_id: number | null
  uf: string | null
  valor_empenhado: number
  valor_pago: number
}

const SELECT = 'id, codigo, ano, tipo, tipo_grupo, autor_nome, politician_id, funcao, subfuncao, localidade_raw, municipality_id, uf, valor_empenhado, valor_pago'

/** Valor em reais → "R$ 1,2 mi" / "R$ 10 mil" / "R$ 500". */
export function formatMoney(reais: number): string {
  const v = reais || 0
  if (v >= 1e9) return `R$ ${(v / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} bi`
  if (v >= 1e6) return `R$ ${(v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`
  if (v >= 1e3) return `R$ ${Math.round(v / 1e3).toLocaleString('pt-BR')} mil`
  return `R$ ${Math.round(v).toLocaleString('pt-BR')}`
}

const TIPO_GRUPO_LABEL: Record<string, string> = {
  individual: 'Individual', bancada: 'De bancada', comissao: 'De comissão', relator: 'De relator', outro: 'Outra',
}
export const tipoGrupoLabel = (g: string | null) => TIPO_GRUPO_LABEL[g ?? 'outro'] ?? 'Emenda'

/** funcao do orçamento → slug de tema (cross-link). */
const FUNCAO_TEMA: Record<string, string> = {
  'Saúde': 'saude', 'Educação': 'educacao', 'Segurança pública': 'seguranca',
  'Gestão ambiental': 'meio-ambiente', 'Trabalho': 'trabalho', 'Agricultura': 'agro',
  'Transporte': 'transporte', 'Urbanismo': 'transporte', 'Assistência social': 'mulher',
  'Desporto e lazer': 'cultura-esporte', 'Cultura': 'cultura-esporte',
}
export const funcaoToTema = (funcao: string | null): string | null => FUNCAO_TEMA[funcao ?? ''] ?? null

export interface EmendaFilter {
  ano?: string; uf?: string; municipio?: string; funcao?: string; tipo?: string; autor?: string; q?: string
  page?: number; pageSize?: number
}

/** Lista emendas com filtros. */
export async function listEmendas(f: EmendaFilter): Promise<{ items: Emenda[]; total: number }> {
  const supabase = createServerSupabaseClient()
  const pageSize = f.pageSize ?? 30
  const page = f.page ?? 1
  let q = supabase.from('emendas').select(SELECT, { count: 'exact' })
  if (f.ano) q = q.eq('ano', Number(f.ano))
  if (f.uf) q = q.eq('uf', f.uf)
  if (f.funcao) q = q.eq('funcao', f.funcao)
  if (f.tipo) q = q.eq('tipo_grupo', f.tipo)
  if (f.q) q = q.ilike('autor_nome', `%${f.q}%`)
  if (f.municipio) {
    const { data: m } = await supabase.from('municipalities').select('id').eq('slug', f.municipio).single()
    if (m) q = q.eq('municipality_id', m.id)
  }
  if (f.autor) {
    const { data: p } = await supabase.from('politicians').select('id').eq('slug', f.autor).single()
    q = p ? q.eq('politician_id', p.id) : q.eq('id', -1)
  }
  q = q.order('valor_pago', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1)
  const { data, count } = await q
  return { items: (data as unknown as Emenda[]) ?? [], total: count ?? 0 }
}

export interface PoliticianEmendas {
  totalPago: number
  totalEmpenhado: number
  count: number
  topMunicipios: { name: string; slug: string; uf: string | null; pago: number }[]
  topFuncoes: { funcao: string; pago: number }[]
}

/** Agregado de emendas de um político (autor). */
export async function emendasByPolitician(politicianId: number): Promise<PoliticianEmendas | null> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('emendas')
    .select('valor_pago, valor_empenhado, funcao, municipality_id, municipality:municipalities(name, slug, state:states(abbr))')
    .eq('politician_id', politicianId).limit(10000)
  type Row = { valor_pago: number; valor_empenhado: number; funcao: string | null; municipality_id: number | null; municipality: { name: string; slug: string; state: { abbr: string } | null } | null }
  const rows = (data as unknown as Row[]) ?? []
  if (!rows.length) return null
  let totalPago = 0, totalEmpenhado = 0
  const muni = new Map<number, { name: string; slug: string; uf: string | null; pago: number }>()
  const func = new Map<string, number>()
  for (const r of rows) {
    totalPago += r.valor_pago; totalEmpenhado += r.valor_empenhado
    if (r.funcao) func.set(r.funcao, (func.get(r.funcao) ?? 0) + r.valor_pago)
    if (r.municipality_id && r.municipality) {
      const cur = muni.get(r.municipality_id) ?? { name: r.municipality.name, slug: r.municipality.slug, uf: r.municipality.state?.abbr ?? null, pago: 0 }
      cur.pago += r.valor_pago; muni.set(r.municipality_id, cur)
    }
  }
  const topMunicipios = Array.from(muni.values()).sort((a, b) => b.pago - a.pago).slice(0, 5)
  const topFuncoes = Array.from(func).map(([funcao, pago]) => ({ funcao, pago })).sort((a, b) => b.pago - a.pago).slice(0, 5)
  return { totalPago, totalEmpenhado, count: rows.length, topMunicipios, topFuncoes }
}

export interface MunicipalityEmendas {
  totalPago: number
  count: number
  topAutores: { name: string; slug: string | null; party_abbr: string | null; party_color: string | null; pago: number }[]
}

/** Agregado de emendas recebidas por um município. */
export async function emendasByMunicipality(municipalityId: number): Promise<MunicipalityEmendas | null> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('emendas')
    .select('valor_pago, autor_nome, politician_id, politician:politicians(name, slug, party:parties(abbr, color_hex))')
    .eq('municipality_id', municipalityId).limit(10000)
  type Row = { valor_pago: number; autor_nome: string | null; politician_id: number | null; politician: { name: string; slug: string; party: { abbr: string; color_hex: string | null } | null } | null }
  const rows = (data as unknown as Row[]) ?? []
  if (!rows.length) return null
  let totalPago = 0
  const aut = new Map<string, { name: string; slug: string | null; party_abbr: string | null; party_color: string | null; pago: number }>()
  for (const r of rows) {
    totalPago += r.valor_pago
    const key = r.politician_id ? `p${r.politician_id}` : `n${r.autor_nome}`
    const cur = aut.get(key) ?? {
      name: r.politician?.name ?? r.autor_nome ?? '—', slug: r.politician?.slug ?? null,
      party_abbr: r.politician?.party?.abbr ?? null, party_color: r.politician?.party?.color_hex ?? null, pago: 0,
    }
    cur.pago += r.valor_pago; aut.set(key, cur)
  }
  const topAutores = Array.from(aut.values()).sort((a, b) => b.pago - a.pago).slice(0, 6)
  return { totalPago, count: rows.length, topAutores }
}

/** Facetas pros filtros (anos e funções distintas). */
export async function emendaFacets(): Promise<{ anos: number[]; funcoes: string[] }> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('emendas').select('ano, funcao').limit(20000)
  const anos = Array.from(new Set((data ?? []).map(r => (r as { ano: number }).ano).filter(Boolean))).sort((a, b) => b - a)
  const funcoes = Array.from(new Set((data ?? []).map(r => (r as { funcao: string }).funcao).filter(Boolean))).sort()
  return { anos, funcoes }
}
```

- [ ] **Step 4: Rodar teste + tsc + commit**
```bash
npx vitest run src/lib/emendas.test.ts
npx tsc --noEmit 2>&1 | grep -v "src/tests/" | grep -E "error TS" && echo ERROS || echo "tsc ok"
git add src/lib/emendas.ts src/lib/emendas.test.ts
git commit -m "feat(emendas): camada de consulta (lista, agregados, formatMoney, funcaoToTema)"
```
Expected: vitest PASS; tsc ok. (Se aparecer TS2802 em algum spread de Map/Set, trocar por `Array.from(...)` — o código acima já usa `Array.from`.)

---

## Task 5: Página `/emendas` (lista + filtros)

**Files:**
- Create: `src/app/emendas/page.tsx`

- [ ] **Step 1: Criar a página**
```tsx
import Link from 'next/link'
import type { Metadata } from 'next'
import { listEmendas, emendaFacets, formatMoney, tipoGrupoLabel } from '@/lib/emendas'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { STATES } from '@/lib/states'

export const metadata: Metadata = {
  title: 'Emendas Parlamentares — quem destinou e para onde — Aprenda Política',
  description: 'Emendas ao orçamento por autor, estado, município e função. Veja quanto cada parlamentar destinou e quanto sua cidade recebeu.',
}
export const revalidate = 3600

type PageProps = { searchParams: { ano?: string; uf?: string; funcao?: string; tipo?: string; q?: string; pagina?: string } }

export default async function EmendasPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.pagina ?? '1', 10) || 1)
  const [{ items, total }, { anos, funcoes }] = await Promise.all([
    listEmendas({ ...searchParams, page }),
    emendaFacets(),
  ])
  const pages = Math.ceil(total / 30)

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Emendas Parlamentares</h1>
        <p className="text-gray-500 mb-6">{total.toLocaleString('pt-BR')} linhas de emenda — quem destinou verba do orçamento, para onde e quanto.</p>

        <form className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8" action="/emendas" method="get">
          <input name="q" defaultValue={searchParams.q} placeholder="Autor" className="col-span-2 sm:col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <select name="ano" defaultValue={searchParams.ano ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Todo ano</option>
            {anos.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select name="uf" defaultValue={searchParams.uf ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Toda UF</option>
            {STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.abbr}</option>)}
          </select>
          <select name="funcao" defaultValue={searchParams.funcao ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Toda função</option>
            {funcoes.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select name="tipo" defaultValue={searchParams.tipo ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Todo tipo</option>
            <option value="individual">Individual</option>
            <option value="bancada">De bancada</option>
            <option value="comissao">De comissão</option>
            <option value="relator">De relator</option>
          </select>
          <button type="submit" className="bg-verde-500 text-white rounded-lg px-3 py-2 text-sm font-medium">Filtrar</button>
        </form>

        <div className="space-y-3">
          {items.map(e => (
            <div key={e.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">{tipoGrupoLabel(e.tipo_grupo)} · {e.ano}</span>
                {e.funcao && <span className="text-[10px] text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">{e.funcao}</span>}
                <span className="ml-auto text-sm font-bold text-verde-600">{formatMoney(e.valor_pago)}<span className="text-[10px] text-gray-400 font-normal"> pago</span></span>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                <span className="font-medium text-gray-900">{e.autor_nome ?? '—'}</span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-600">{e.localidade_raw ?? 'destino não informado'}</span>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-gray-400">Nenhuma emenda encontrada com esses filtros.</p>}
        </div>

        {pages > 1 && (
          <div className="mt-8 flex items-center justify-between text-sm">
            {page > 1 ? <Link href={`/emendas?${new URLSearchParams({ ...searchParams, pagina: String(page - 1) } as Record<string, string>)}`} className="text-gray-600 hover:text-gray-900">← Anterior</Link> : <span />}
            <span className="text-gray-400">Página {page} de {pages}</span>
            {page < pages ? <Link href={`/emendas?${new URLSearchParams({ ...searchParams, pagina: String(page + 1) } as Record<string, string>)}`} className="text-gray-600 hover:text-gray-900">Próxima →</Link> : <span />}
          </div>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verificar render + commit**
```bash
npx tsc --noEmit 2>&1 | grep -v "src/tests/" | grep -E "error TS" && echo ERROS || echo "tsc ok"
curl -s "http://localhost:3002/emendas" | grep -oE "Emendas Parlamentares|R\\$ [0-9]|linhas de emenda" | sort -u | head
git add src/app/emendas/page.tsx
git commit -m "feat(emendas): página /emendas com filtros"
```
Expected: tsc ok; aparece a lista com valores.

---

## Task 6: Bloco "Emendas" no perfil do político

**Files:**
- Modify: `src/app/politico/[slug]/page.tsx`

- [ ] **Step 1: Importar e buscar** — em `src/app/politico/[slug]/page.tsx`, adicionar import:
```tsx
import { emendasByPolitician, formatMoney } from '@/lib/emendas'
```
Após `const propositions = await propositionsByPolitician(politician.id, 5)` (já existe), adicionar:
```tsx
  const emendas = await emendasByPolitician(politician.id)
```

- [ ] **Step 2: Renderizar o bloco** — inserir antes da seção de "Proposições (autoria)" (o bloco `{propositions.length > 0 && (`):
```tsx
        {emendas && emendas.totalPago > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Emendas parlamentares</h2>
            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="flex flex-wrap items-end gap-x-8 gap-y-2 mb-4">
                <div>
                  <div className="text-2xl font-bold text-verde-600 tabular-nums">{formatMoney(emendas.totalPago)}</div>
                  <div className="text-xs text-gray-500">destinado e pago ({emendas.count} emendas)</div>
                </div>
              </div>
              {emendas.topMunicipios.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Principais destinos</div>
                  <div className="flex flex-wrap gap-2">
                    {emendas.topMunicipios.map(m => (
                      <Link key={m.slug} href={`/emendas?municipio=${m.slug}`} className="text-xs border border-gray-200 rounded-full px-2.5 py-1 text-gray-600 hover:border-gray-400">
                        {m.name}{m.uf ? `-${m.uf}` : ''} · {formatMoney(m.pago)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {emendas.topFuncoes.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Por função</div>
                  <div className="flex flex-wrap gap-2">
                    {emendas.topFuncoes.map(f => (
                      <span key={f.funcao} className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">{f.funcao} · {formatMoney(f.pago)}</span>
                    ))}
                  </div>
                </div>
              )}
              <Link href={`/emendas?autor=${politician.slug}`} className="inline-block mt-4 text-sm text-verde-600 font-medium hover:underline">Ver todas as emendas →</Link>
            </div>
          </section>
        )}
```
(Os chips de município linkam para `/emendas?municipio={slug}` — filtra as emendas daquela cidade. `topMunicipios` já traz `slug` e `uf`.)

- [ ] **Step 3: Verificar + commit**
```bash
npx tsc --noEmit 2>&1 | grep -v "src/tests/" | grep -E "error TS" && echo ERROS || echo "tsc ok"
# perfil de um político com emendas (pega um politician_id casado):
SUPA_URL=$(grep -E "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d= -f2-); ANON=$(grep -E "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d= -f2-)
PID=$(curl -s "${SUPA_URL}/rest/v1/emendas?politician_id=not.is.null&select=politician_id&limit=1" -H "apikey: ${ANON}" -H "Authorization: Bearer ${ANON}" | grep -oE '[0-9]+' | head -1)
SLUG=$(curl -s "${SUPA_URL}/rest/v1/politicians?id=eq.${PID}&select=slug" -H "apikey: ${ANON}" -H "Authorization: Bearer ${ANON}" | grep -oE '"slug":"[^"]+"' | cut -d'"' -f4)
curl -s "http://localhost:3002/politico/$SLUG" | grep -oE "Emendas parlamentares|destinado e pago|Ver todas as emendas" | sort -u
git add "src/app/politico/[slug]/page.tsx"
git commit -m "feat(emendas): bloco de emendas no perfil do político"
```
Expected: tsc ok; bloco aparece no perfil de quem tem emendas.

---

## Task 7: Bloco "Emendas recebidas" no município

**Files:**
- Modify: `src/app/[estado]/[municipio]/page.tsx`

- [ ] **Step 1: Ler a página e achar o id do município** — em `src/app/[estado]/[municipio]/page.tsx`, identificar de onde sai o município com `id` (provavelmente `data.municipality?.id` ou similar — o `OrganogramData`). Confirmar o nome real lendo o arquivo. Adicionar import:
```tsx
import { emendasByMunicipality, formatMoney } from '@/lib/emendas'
import { Avatar } from '@/components/ui/Avatar'
```
(Se `Avatar` já estiver importado, não duplicar.)

- [ ] **Step 2: Buscar** (usando o id real do município encontrado, ex.: `data.municipality?.id`):
```tsx
  const muniEmendas = data.municipality?.id ? await emendasByMunicipality(data.municipality.id) : null
```

- [ ] **Step 3: Renderizar** — inserir logo após a "Stats strip" (a faixa de indicadores), antes do organograma:
```tsx
        {muniEmendas && muniEmendas.totalPago > 0 && (
          <section className="mb-6 border border-gray-200 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Emendas recebidas</h2>
            <div className="flex flex-wrap items-end gap-x-8 gap-y-2 mb-4">
              <div>
                <div className="text-2xl font-bold text-verde-600 tabular-nums">{formatMoney(muniEmendas.totalPago)}</div>
                <div className="text-xs text-gray-500">em emendas pagas ({muniEmendas.count} linhas)</div>
              </div>
            </div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Quem destinou</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {muniEmendas.topAutores.map((a, i) => {
                const inner = (
                  <div className="flex items-center justify-between gap-2 border border-gray-200 rounded-xl p-2.5">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-sm text-gray-900 truncate">{a.name}</span>
                      {a.party_abbr && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: `${a.party_color ?? '#9ca3af'}1a`, color: a.party_color ?? '#6b7280' }}>{a.party_abbr}</span>}
                    </span>
                    <span className="text-sm font-semibold text-verde-600 shrink-0">{formatMoney(a.pago)}</span>
                  </div>
                )
                return a.slug ? <Link key={i} href={`/politico/${a.slug}`} className="block hover:opacity-90">{inner}</Link> : <div key={i}>{inner}</div>
              })}
            </div>
          </section>
        )}
```
(O componente já importa `Link`.)

- [ ] **Step 4: Verificar + commit**
```bash
npx tsc --noEmit 2>&1 | grep -v "src/tests/" | grep -E "error TS" && echo ERROS || echo "tsc ok"
# município com emendas (pega um municipality_id casado → slug do estado+município):
MID=$(curl -s "${SUPA_URL}/rest/v1/emendas?municipality_id=not.is.null&select=municipality_id&limit=1" -H "apikey: ${ANON}" -H "Authorization: Bearer ${ANON}" | grep -oE '[0-9]+' | head -1)
ROW=$(curl -s "${SUPA_URL}/rest/v1/municipalities?id=eq.${MID}&select=slug,state:states(slug)" -H "apikey: ${ANON}" -H "Authorization: Bearer ${ANON}")
echo "município: $ROW"
# montar a URL /estado-slug/municipio-slug a partir do ROW e testar:
curl -s "http://localhost:3002/$(echo $ROW | grep -oE '"slug":"[^"]+"' | tail -1 | cut -d'"' -f4)/$(echo $ROW | grep -oE '"slug":"[^"]+"' | head -1 | cut -d'"' -f4)" | grep -oE "Emendas recebidas|em emendas pagas|Quem destinou" | sort -u
git add "src/app/[estado]/[municipio]/page.tsx"
git commit -m "feat(emendas): bloco 'emendas recebidas' na página do município"
```
Expected: tsc ok; bloco aparece no município que recebeu emendas.

---

## Task 8: Bloco no partido + sitemap

**Files:**
- Modify: `src/app/partidos/[slug]/page.tsx`
- Modify: `src/lib/sitemap.ts`

- [ ] **Step 1: Bloco no partido** — em `src/app/partidos/[slug]/page.tsx`, reutilizar `listEmendas` filtrando pelos políticos do partido é custoso; em vez disso, somar via os filiados já carregados. Abordagem simples e barata: buscar as emendas dos políticos do partido por uma query agregada. Adicionar import:
```tsx
import { formatMoney } from '@/lib/emendas'
import { createServerSupabaseClient as sb2 } from '@/lib/supabase/server'
```
Após carregar o `party` (com `party.id`), adicionar:
```tsx
  const { data: partyPolIds } = await sb2().from('politicians').select('id').eq('party_id', party.id)
  const pids = (partyPolIds ?? []).map(p => p.id)
  let emendasPartidoTotal = 0
  if (pids.length) {
    const { data: em } = await sb2().from('emendas').select('valor_pago').in('politician_id', pids).limit(20000)
    emendasPartidoTotal = (em ?? []).reduce((s, e) => s + ((e as { valor_pago: number }).valor_pago || 0), 0)
  }
```
Renderizar (no fim do conteúdo, junto aos outros blocos do partido), se houver:
```tsx
        {emendasPartidoTotal > 0 && (
          <section className="mb-8 border border-gray-200 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Emendas dos filiados</h2>
            <div className="text-2xl font-bold text-verde-600 tabular-nums">{formatMoney(emendasPartidoTotal)}</div>
            <div className="text-xs text-gray-500">destinados em emendas por parlamentares do partido</div>
          </section>
        )}
```

- [ ] **Step 2: Sitemap** — em `src/lib/sitemap.ts`, no array `STATIC_PATHS`, na primeira linha, adicionar `/emendas` (e `/aprenda/emendas` já entra via... não — `/aprenda/emendas` não está em STATIC_PATHS). Trocar a primeira linha:
```typescript
  '', '/estados', '/partidos', '/politicos', '/proposicoes', '/temas', '/emendas', '/aprenda',
```
E, na lista de paths de Aprenda do array, adicionar `/aprenda/emendas` junto aos outros `/aprenda/...` (ex.: depois de `/aprenda/impostos/itbi`):
```typescript
  '/aprenda/emendas',
```

- [ ] **Step 3: Verificar + commit**
```bash
npx tsc --noEmit 2>&1 | grep -v "src/tests/" | grep -E "error TS" && echo ERROS || echo "tsc ok"
curl -s "http://localhost:3002/sitemaps-v2/0.xml" | grep -oE "/emendas<|/aprenda/emendas" | sort -u
git add "src/app/partidos/[slug]/page.tsx" src/lib/sitemap.ts
git commit -m "feat(emendas): bloco no partido + /emendas e /aprenda/emendas no sitemap"
```
Expected: tsc ok; `/emendas` e `/aprenda/emendas` no chunk 0.

---

## Verificação final

1. **Build:** `npm run build` (parar o dev server antes) — compila; rotas `/aprenda/emendas` e `/emendas` aparecem.
2. **Testes:** `npx vitest run src/lib/emendas.test.ts` e `cd ../aprenda-politica-workers && node --test scripts/emendas/parse.test.mjs` — passam.
3. **E2E** (dev :3002): `/aprenda/emendas` (didática) ok; `/emendas` lista + filtra; perfil de parlamentar mostra "destinou R$ X"; **município mostra "recebeu R$ Y e de quem"**; partido mostra total.
4. **Reprocesso:** re-rodar `node scripts/sync-emendas.mjs` é idempotente.

## Notas

- **Migration 008** depende do usuário aplicar no SQL Editor antes da ingestão (Task 3) e das páginas.
- **Chave da API** já está em `aprenda-politica-workers/.env` (`PORTAL_TRANSPARENCIA_KEY`, gitignored).
- **Volume/tempo:** a API pagina 15/registro; 3 anos × milhares de linhas = muitas requisições — rodar local, com o retry/backoff já no script. Se o backfill for muito longo, rodar um ano por vez ajustando `YEARS`.
- **Casamento por nome** (autor/município) é heurístico; conferir as contagens "autor casado"/"município casado" no fim do backfill. Reprocessável.
- **Dev/build:** não rodar `npm run build` com o `next dev` ligado (corrompe `.next`).
