# Módulo de Notícias — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Módulo de notícias cívicas que ingere Google News RSS por entidade, gera resumo próprio (Haiku) ancorado no snippet, cruza com políticos/leis/emendas, e expõe `/noticias` (feed + artigo agregador) + bloco "Na mídia" no perfil — tudo no design system.

**Architecture:** Backend de ingestão no repo `aprenda-politica-workers` (worker `sync-news.mjs` + módulos puros testáveis em `scripts/news/`). Frontend RSC no repo `aprenda-politica` (`src/lib/news.ts` + páginas + componentes). Dados em duas tabelas Supabase (`news`, `news_entities`). Modelo agregador: guardamos título original + resumo próprio + link pra fonte (sem republicar texto).

**Tech Stack:** Node 18+ (global fetch), `@anthropic-ai/sdk` (Haiku `claude-haiku-4-5-20251001`), `@supabase/supabase-js` (service role), node:test (lógica do worker), Next.js 14 App Router RSC, Tailwind (tokens do design system), Vitest (lib frontend).

**Repos:** worker = `/Users/gualtieri/Apps/aprenda-politica-workers` (branch `main`); frontend = `/Users/gualtieri/Apps/aprenda-politica` (criar branch `feat/noticias`).

**Spec:** `docs/superpowers/specs/2026-06-10-modulo-noticias-design.md`

---

## File Structure

**Worker (`aprenda-politica-workers`):**
- `scripts/news/parse.mjs` — parse do RSS (itens), `slugify`, `urlHash`, `sourceDomain`, `extractCodes` (PL/PEC/Emenda). Puro/testável.
- `scripts/news/parse.test.mjs` — node:test.
- `scripts/news/summarize.mjs` — resumo IA (Haiku) ancorado, com fallback.
- `scripts/news/seed.mjs` — monta a lista de entidades-semente (query + metadados de cross-link) a partir do banco + temas.
- `scripts/sync-news.mjs` — orquestra ingestão (fetch RSS → parse → resumo → cross-link → dedup → upsert).
- `.env` — adicionar `ANTHROPIC_API_KEY`.

**Frontend (`aprenda-politica`):**
- `supabase/migrations/010_news.sql` — tabelas `news` + `news_entities`.
- `src/lib/news.ts` — camada de consulta.
- `src/lib/news.test.ts` — vitest (formatadores).
- `src/components/news/NewsCover.tsx` — capa geométrica por motif (SVG, tokens).
- `src/components/news/SourceTag.tsx` — logo (favicon) + nome do veículo.
- `src/components/news/MentionChip.tsx` — chip por tipo de entidade.
- `src/components/news/NewsCard.tsx` — card (variantes destaque/feed/compacto).
- `src/components/news/CategoryBar.tsx` — barra de categorias (acento por esfera).
- `src/app/noticias/page.tsx` — Home (destaques + feed + categorias).
- `src/app/noticias/[slug]/page.tsx` — artigo agregador + JSON-LD.
- `src/app/politico/[slug]/page.tsx` — **modificar**: bloco "Na mídia".
- `src/components/ui/Navbar.tsx` — **modificar**: item "Notícias".
- `src/lib/sitemap.ts` — **modificar**: `/noticias` + artigos.

---

## Task 0: Pré-requisitos do worker (deps + chave)

**Files:**
- Modify: `aprenda-politica-workers/package.json` (via npm)
- Modify: `aprenda-politica-workers/.env`

- [ ] **Step 1: Instalar o SDK da Anthropic**

```bash
cd /Users/gualtieri/Apps/aprenda-politica-workers
npm install @anthropic-ai/sdk
```

- [ ] **Step 2: Pedir ao usuário pra adicionar `ANTHROPIC_API_KEY` no `.env`**

O `.env` é gitignored. Instruir o usuário a adicionar a linha `ANTHROPIC_API_KEY=sk-ant-...`. Verificar:

```bash
grep -q "^ANTHROPIC_API_KEY=" /Users/gualtieri/Apps/aprenda-politica-workers/.env && echo "ok" || echo "FALTA ANTHROPIC_API_KEY no .env"
```
Expected: `ok` (bloquear as tasks 3+ até isso).

- [ ] **Step 3: Commit**

```bash
cd /Users/gualtieri/Apps/aprenda-politica-workers
git add package.json package-lock.json
git commit -m "chore(news): add @anthropic-ai/sdk para resumo de notícias"
```

---

## Task 1: Migration 010_news (usuário aplica)

**Files:**
- Create: `aprenda-politica/supabase/migrations/010_news.sql`

- [ ] **Step 1: Criar o arquivo de migration**

```sql
-- Notícias cívicas (agregador) + cruzamento com objetos do sistema.
CREATE TABLE IF NOT EXISTS news (
  id            BIGSERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  summary       TEXT,
  source_name   TEXT,
  source_domain TEXT,
  source_url    TEXT NOT NULL,
  url_hash      TEXT UNIQUE NOT NULL,
  published_at  TIMESTAMPTZ,
  category      TEXT,
  sphere        TEXT,
  topics        TEXT[] DEFAULT '{}',
  cover_motif   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_news_published ON news (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category  ON news (category);
CREATE INDEX IF NOT EXISTS idx_news_topics    ON news USING GIN (topics);

CREATE TABLE IF NOT EXISTS news_entities (
  id             BIGSERIAL PRIMARY KEY,
  news_id        BIGINT REFERENCES news(id) ON DELETE CASCADE,
  role           TEXT NOT NULL,
  politician_id  BIGINT REFERENCES politicians(id),
  proposition_id BIGINT REFERENCES propositions(id),
  emenda_id      BIGINT REFERENCES emendas(id),
  orgao          TEXT,
  label          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_news_entities_news        ON news_entities (news_id);
CREATE INDEX IF NOT EXISTS idx_news_entities_politician  ON news_entities (politician_id);
CREATE INDEX IF NOT EXISTS idx_news_entities_proposition ON news_entities (proposition_id);
CREATE INDEX IF NOT EXISTS idx_news_entities_emenda      ON news_entities (emenda_id);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_entities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS public_read ON news;
CREATE POLICY public_read ON news FOR SELECT USING (true);
DROP POLICY IF EXISTS public_read ON news_entities;
CREATE POLICY public_read ON news_entities FOR SELECT USING (true);
```

- [ ] **Step 2: Pedir ao usuário pra aplicar no Supabase SQL Editor** e confirmar ("Success. No rows returned").

- [ ] **Step 3: Commit**

```bash
cd /Users/gualtieri/Apps/aprenda-politica
git add supabase/migrations/010_news.sql
git commit -m "feat(news): migration 010 (news + news_entities)"
```

---

## Task 2: Parser do RSS (módulo puro + testes)

**Files:**
- Create: `aprenda-politica-workers/scripts/news/parse.mjs`
- Test: `aprenda-politica-workers/scripts/news/parse.test.mjs`

- [ ] **Step 1: Escrever os testes (falhando)**

```js
// scripts/news/parse.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseRss, slugify, urlHash, sourceDomain, extractCodes } from './parse.mjs'

const SAMPLE = `<?xml version="1.0"?><rss><channel>
<item>
  <title>Câmara aprova PL 4012/2025 sobre emendas</title>
  <link>https://news.google.com/rss/articles/abc123?oc=5</link>
  <pubDate>Mon, 09 Jun 2026 12:00:00 GMT</pubDate>
  <description>&lt;a href="x"&gt;Texto do snippet da matéria.&lt;/a&gt;</description>
  <source url="https://oglobo.globo.com">O Globo</source>
</item>
</channel></rss>`

test('parseRss extrai os campos do item', () => {
  const items = parseRss(SAMPLE)
  assert.equal(items.length, 1)
  const it = items[0]
  assert.equal(it.title, 'Câmara aprova PL 4012/2025 sobre emendas')
  assert.equal(it.link, 'https://news.google.com/rss/articles/abc123?oc=5')
  assert.equal(it.sourceName, 'O Globo')
  assert.equal(it.sourceDomain, 'oglobo.globo.com')
  assert.ok(it.snippet.includes('Texto do snippet'))
  assert.ok(!it.snippet.includes('<a'))  // HTML removido
  assert.ok(it.publishedAt instanceof Date)
})

test('slugify gera slug ascii', () => {
  assert.equal(slugify('Câmara aprova Lei'), 'camara-aprova-lei')
})

test('urlHash é estável e determinístico', () => {
  assert.equal(urlHash('https://x.com/a'), urlHash('https://x.com/a'))
  assert.notEqual(urlHash('https://x.com/a'), urlHash('https://x.com/b'))
})

test('sourceDomain normaliza www', () => {
  assert.equal(sourceDomain('https://www.folha.uol.com.br/x'), 'folha.uol.com.br')
})

test('extractCodes acha PL/PEC/Emenda', () => {
  const c = extractCodes('Câmara aprova PL 4012/2025 e a PEC 18/2025; cita Emenda 71/2026')
  assert.deepEqual(c.sort(), ['Emenda 71/2026', 'PEC 18/2025', 'PL 4012/2025'].sort())
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd /Users/gualtieri/Apps/aprenda-politica-workers && node --test scripts/news/parse.test.mjs`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implementar**

```js
// scripts/news/parse.mjs
import { createHash } from 'node:crypto'

const decode = (s) => (s || '')
  .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ').trim()

const tag = (block, name) => {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))
  return m ? decode(m[1]) : ''
}

export function slugify(s) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

export const urlHash = (url) => createHash('sha1').update(url || '').digest('hex')

export function sourceDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return null }
}

const CODE_RE = /\b(PL|PLP|PEC|PDL|MPV?|ADI|ADPF|Lei|Resolu[çc][aã]o|Emenda)\s*n?[ºo.]?\s*([\d.]+\/\d{4})/gi

export function extractCodes(text) {
  const out = new Set()
  for (const m of (text || '').matchAll(CODE_RE)) {
    out.add(`${m[1].replace(/^Mp$/i, 'MP')} ${m[2]}`.replace(/\s+/g, ' ').trim())
  }
  return [...out]
}

export function parseRss(xml) {
  const items = []
  for (const m of (xml || '').matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
    const block = m[1]
    const link = tag(block, 'link')
    const srcM = block.match(/<source\s+url="([^"]+)"[^>]*>([\s\S]*?)<\/source>/i)
    const pub = tag(block, 'pubDate')
    items.push({
      title: tag(block, 'title'),
      link,
      snippet: tag(block, 'description'),
      publishedAt: pub ? new Date(pub) : null,
      sourceName: srcM ? decode(srcM[2]) : null,
      sourceDomain: srcM ? sourceDomain(srcM[1]) : null,
    })
  }
  return items.filter(i => i.title && i.link)
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test scripts/news/parse.test.mjs`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/news/parse.mjs scripts/news/parse.test.mjs
git commit -m "feat(news): parser do Google News RSS + slug/hash/domínio/códigos (testado)"
```

---

## Task 3: Resumo IA (Haiku) ancorado

**Files:**
- Create: `aprenda-politica-workers/scripts/news/summarize.mjs`

> **Nota ao implementer:** ao escrever a chamada ao Anthropic, siga a skill `claude-api`. Modelo: `claude-haiku-4-5-20251001`. SDK: `@anthropic-ai/sdk`.

- [ ] **Step 1: Implementar o módulo**

```js
// scripts/news/summarize.mjs
import Anthropic from '@anthropic-ai/sdk'

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

const cleanFallback = (title, snippet) => {
  const s = (snippet || '').trim()
  if (s.length >= 40) return s.slice(0, 280)
  return (title || '').trim().slice(0, 280)
}

/**
 * Resumo neutro de 2-3 frases, ANCORADO só no título+snippet (não inventa fatos).
 * Falha de API/sem chave -> fallback pro snippet limpo (degradação graciosa).
 */
export async function summarize(title, snippet) {
  if (!client) return cleanFallback(title, snippet)
  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 220,
      system:
        'Você resume notícias cívicas brasileiras em pt-BR. Escreva 2 a 3 frases neutras e factuais, ' +
        'usando SOMENTE as informações do título e do trecho fornecidos. NUNCA invente nomes, números, ' +
        'datas ou fatos que não estejam no texto. Sem opinião, sem adjetivos de juízo. Retorne só o resumo.',
      messages: [{
        role: 'user',
        content: `Título: ${title}\nTrecho: ${snippet || '(sem trecho)'}\n\nResumo:`,
      }],
    })
    const text = msg.content?.find(c => c.type === 'text')?.text?.trim()
    return text && text.length >= 20 ? text : cleanFallback(title, snippet)
  } catch {
    return cleanFallback(title, snippet)
  }
}
```

- [ ] **Step 2: Smoke test manual (com a chave no .env)**

```bash
cd /Users/gualtieri/Apps/aprenda-politica-workers
node --input-type=module -e "
import { readFileSync } from 'node:fs';
for (const l of readFileSync('.env','utf8').split('\n')) { const i=l.indexOf('='); if(i>0 && !l.startsWith('#')) process.env[l.slice(0,i)]=l.slice(i+1); }
const { summarize } = await import('./scripts/news/summarize.mjs');
console.log(await summarize('Câmara aprova projeto de transparência de emendas', 'Texto cria portal único de rastreio de recursos.'));
"
```
Expected: 2-3 frases em pt-BR (ou o snippet, se a chave faltar).

- [ ] **Step 3: Commit**

```bash
git add scripts/news/summarize.mjs
git commit -m "feat(news): resumo IA (Haiku) ancorado no snippet, com fallback gracioso"
```

---

## Task 4: Semente de entidades (query + metadados de cross-link)

**Files:**
- Create: `aprenda-politica-workers/scripts/news/seed.mjs`

- [ ] **Step 1: Implementar**

`buildSeed(supabase)` retorna `[{ query, role:'principal', politician_id?, orgao?, category, sphere, label, topicSlug? }]`. Federais vêm do banco (cargo desambigua); órgãos e temas são fixos. Os temas usam keywords curtas (mesma taxonomia do frontend).

```js
// scripts/news/seed.mjs
const ORGAOS = [
  { query: '"Câmara dos Deputados"', orgao: 'Câmara dos Deputados', category: 'camara',  sphere: 'federal', label: 'Câmara dos Deputados' },
  { query: '"Senado Federal"',       orgao: 'Senado Federal',       category: 'senado',  sphere: 'federal', label: 'Senado Federal' },
  { query: '"Supremo Tribunal Federal" OR STF', orgao: 'STF',       category: 'justica', sphere: 'federal', label: 'STF' },
  { query: '"Tribunal Superior Eleitoral" OR TSE', orgao: 'TSE',    category: 'eleicoes',sphere: 'federal', label: 'TSE' },
]

// Temas: slug + termo de busca. (mantém alinhado com src/lib/topics.ts do frontend)
const TEMAS = [
  { slug: 'saude', query: 'saúde política Brasil', category: 'governo' },
  { slug: 'educacao', query: 'educação política Brasil', category: 'governo' },
  { slug: 'seguranca', query: 'segurança pública Brasil', category: 'justica' },
  { slug: 'meio-ambiente', query: 'meio ambiente política Brasil', category: 'governo' },
  { slug: 'economia-impostos', query: 'economia impostos Brasil congresso', category: 'economia' },
  { slug: 'trabalho', query: 'trabalho emprego política Brasil', category: 'economia' },
  { slug: 'transporte', query: 'transporte mobilidade política Brasil', category: 'cidades' },
]

const CARGO_TERM = {
  'presidente': 'presidente', 'governador': 'governador', 'senador': 'senador',
  'deputado-federal': 'deputado federal', 'deputado-estadual': 'deputado estadual',
}
const CARGO_CAT = {
  'presidente': ['governo', 'estadual'], 'governador': ['governo', 'estadual'],
  'senador': ['senado', 'federal'], 'deputado-federal': ['camara', 'federal'],
  'deputado-estadual': ['governo', 'estadual'],
}

export async function buildSeed(supabase) {
  const seed = []
  for (const o of ORGAOS) seed.push({ ...o, role: 'principal' })
  for (const t of TEMAS) seed.push({ query: t.query, role: 'principal', category: t.category, sphere: 'federal', label: null, topicSlug: t.slug })

  // Federais do banco (presidente, governadores, senadores, deputados federais)
  const cargos = Object.keys(CARGO_TERM)
  const { data: positions } = await supabase.from('positions').select('id, slug').in('slug', cargos)
  const posIds = (positions ?? []).map(p => p.id)
  const posSlug = Object.fromEntries((positions ?? []).map(p => [p.id, p.slug]))
  // pagina os políticos desses cargos
  for (let from = 0; ; from += 1000) {
    const { data } = await supabase.from('politicians')
      .select('id, name, position_id').in('position_id', posIds).range(from, from + 999)
    const batch = data ?? []
    for (const p of batch) {
      const slug = posSlug[p.position_id]
      const [category, sphere] = CARGO_CAT[slug] ?? ['governo', 'federal']
      seed.push({
        query: `"${p.name}" ${CARGO_TERM[slug]}`,
        role: 'principal', politician_id: p.id, category, sphere, label: p.name,
      })
    }
    if (batch.length < 1000) break
  }
  return seed
}
```

- [ ] **Step 2: Smoke test (conta a semente)**

```bash
node --input-type=module -e "
import { readFileSync } from 'node:fs'; import { createClient } from '@supabase/supabase-js';
const env={}; for (const l of readFileSync('.env','utf8').split('\n')){const i=l.indexOf('=');if(i>0&&!l.startsWith('#'))env[l.slice(0,i)]=l.slice(i+1);}
const sb=createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const { buildSeed } = await import('./scripts/news/seed.mjs');
const s = await buildSeed(sb); console.log('seed:', s.length, '| ex:', s.slice(0,3).map(x=>x.query));
"
```
Expected: algumas centenas de entradas (federais + órgãos + temas).

- [ ] **Step 3: Commit**

```bash
git add scripts/news/seed.mjs
git commit -m "feat(news): conjunto-semente de entidades (federais + órgãos + temas)"
```

---

## Task 5: Orquestrador `sync-news.mjs`

**Files:**
- Create: `aprenda-politica-workers/scripts/sync-news.mjs`

- [ ] **Step 1: Implementar**

Para cada entidade-semente: busca o RSS, parseia, resume (IA), monta o `news` row + as `news_entities` (principal = entidade da query; mencionado = códigos via `extractCodes` casados em `propositions`/`emendas` + nomes distintos de federais). Dedup por `url_hash` (upsert). Limita itens por query (ex.: 6 mais recentes) pra controlar volume/custo.

```js
// scripts/sync-news.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { parseRss, slugify, urlHash, extractCodes } from './news/parse.mjs'
import { summarize } from './news/summarize.mjs'
import { buildSeed } from './news/seed.mjs'

const env = Object.fromEntries(readFileSync('.env', 'utf8').split('\n')
  .filter(l => l && !l.startsWith('#') && l.includes('='))
  .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }))
for (const k of ['ANTHROPIC_API_KEY']) if (env[k]) process.env[k] = env[k]
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const PER_QUERY = Number(process.env.NEWS_PER_QUERY ?? 6)
const COVER_BY_CAT = { camara: 'congresso', senado: 'cupula', governo: 'palacio', eleicoes: 'urna', economia: 'grafico', cidades: 'cidade', justica: 'balanca' }

async function rss(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`
  for (let a = 0; a < 3; a++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 AprendaPoliticaBot' } })
      if (res.ok) return parseRss(await res.text())
    } catch {}
    await new Promise(r => setTimeout(r, 500 * (a + 1)))
  }
  return []
}

// índices p/ casar "mencionado": nomes distintos de federais + códigos
async function loadMentionIndex() {
  const polByName = new Map()
  const { data: positions } = await supabase.from('positions').select('id, slug')
    .in('slug', ['presidente', 'governador', 'senador', 'deputado-federal'])
  const posIds = (positions ?? []).map(p => p.id)
  for (let from = 0; ; from += 1000) {
    const { data } = await supabase.from('politicians').select('id, name').in('position_id', posIds).range(from, from + 999)
    const batch = data ?? []
    for (const p of batch) { const key = slugify(p.name); if (key.includes('-')) polByName.set(key, { id: p.id, name: p.name }) }
    if (batch.length < 1000) break
  }
  return { polByName }
}

async function matchCode(code) {
  // PL/PEC/etc. -> propositions; Emenda N/AAAA -> emendas
  const em = code.match(/^Emenda\s+([\d.]+)\/(\d{4})$/i)
  if (em) {
    const { data } = await supabase.from('emendas').select('id').eq('numero', em[1]).eq('ano', Number(em[2])).limit(1)
    return data?.[0] ? { emenda_id: data[0].id, label: code } : null
  }
  const m = code.match(/^(\w+)\s+(\d+)\/(\d{4})$/)
  if (m) {
    const { data } = await supabase.from('propositions').select('id')
      .ilike('type', m[1]).eq('number', Number(m[2])).eq('year', Number(m[3])).limit(1)
    return data?.[0] ? { proposition_id: data[0].id, label: code } : null
  }
  return null
}

async function main() {
  const seed = await buildSeed(supabase)
  const idx = await loadMentionIndex()
  console.log(`[news] semente: ${seed.length} entidades · índice menção: ${idx.polByName.size} federais`)
  let inserted = 0, linked = 0
  for (const s of seed) {
    const items = (await rss(s.query)).slice(0, PER_QUERY)
    for (const it of items) {
      const url_hash = urlHash(it.link)
      // dedup: existe?
      const { data: ex } = await supabase.from('news').select('id').eq('url_hash', url_hash).limit(1)
      let newsId = ex?.[0]?.id
      if (!newsId) {
        const summary = await summarize(it.title, it.snippet)
        const slug = `${slugify(it.title)}-${url_hash.slice(0, 6)}`
        const row = {
          slug, title: it.title, summary,
          source_name: it.sourceName, source_domain: it.sourceDomain, source_url: it.link, url_hash,
          published_at: it.publishedAt ? it.publishedAt.toISOString() : null,
          category: s.category, sphere: s.sphere,
          topics: s.topicSlug ? [s.topicSlug] : [],
          cover_motif: COVER_BY_CAT[s.category] ?? 'congresso',
        }
        const { data: ins } = await supabase.from('news').insert(row).select('id').single()
        newsId = ins?.id
        if (newsId) inserted++
      }
      if (!newsId) continue
      // entidade principal (a da query)
      const ents = []
      if (s.politician_id) ents.push({ news_id: newsId, role: 'principal', politician_id: s.politician_id, label: s.label })
      else if (s.orgao) ents.push({ news_id: newsId, role: 'principal', orgao: s.orgao, label: s.label })
      // mencionados: códigos
      for (const code of extractCodes(`${it.title} ${it.snippet}`)) {
        const mm = await matchCode(code)
        if (mm) ents.push({ news_id: newsId, role: 'mencionado', ...mm })
      }
      // mencionados: federais por nome (nome+sobrenome presente no título/snippet)
      const hay = slugify(`${it.title} ${it.snippet}`)
      for (const [key, p] of idx.polByName) {
        if (p.id === s.politician_id) continue
        if (hay.includes(key)) ents.push({ news_id: newsId, role: 'mencionado', politician_id: p.id, label: p.name })
      }
      if (ents.length) {
        // evita duplicar vínculos: apaga os do news e regrava (idempotente)
        await supabase.from('news_entities').delete().eq('news_id', newsId)
        await supabase.from('news_entities').insert(ents)
        linked += ents.length
      }
    }
    await new Promise(r => setTimeout(r, 120))
  }
  console.log(`[news] concluído: ${inserted} notícias novas · ${linked} vínculos`)
}
main().catch(e => { console.error(e); process.exit(1) })
```

- [ ] **Step 2: Rodar um piloto pequeno**

```bash
cd /Users/gualtieri/Apps/aprenda-politica-workers
NEWS_PER_QUERY=3 node scripts/sync-news.mjs 2>&1 | tail -20
```
Expected: log `[news] concluído: N notícias novas · M vínculos` com N>0.

- [ ] **Step 3: Verificar no banco**

```bash
node --input-type=module -e "
import { readFileSync } from 'node:fs'; import { createClient } from '@supabase/supabase-js';
const env={}; for (const l of readFileSync('.env','utf8').split('\n')){const i=l.indexOf('=');if(i>0&&!l.startsWith('#'))env[l.slice(0,i)]=l.slice(i+1);}
const sb=createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const { count } = await sb.from('news').select('id',{count:'exact',head:true});
const { count: c2 } = await sb.from('news_entities').select('id',{count:'exact',head:true});
console.log('news:', count, '· news_entities:', c2);
"
```
Expected: contagens > 0.

- [ ] **Step 4: Commit**

```bash
git add scripts/sync-news.mjs
git commit -m "feat(news): orquestrador sync-news (RSS por entidade + resumo IA + cross-link + dedup)"
```

---

## Task 6: Camada de consulta `src/lib/news.ts`

**Files:**
- Create: `aprenda-politica/src/lib/news.ts`
- Test: `aprenda-politica/src/lib/news.test.ts`
- (criar branch antes: `cd /Users/gualtieri/Apps/aprenda-politica && git checkout -b feat/noticias`)

- [ ] **Step 1: Escrever testes dos formatadores (vitest)**

```ts
// src/lib/news.test.ts
import { describe, it, expect } from 'vitest'
import { timeAgo, NEWS_CATEGORIES, categorySphere } from './news'

describe('news helpers', () => {
  it('timeAgo formata em pt-BR', () => {
    const now = Date.now()
    expect(timeAgo(new Date(now - 2 * 3600e3).toISOString())).toMatch(/2 horas/)
    expect(timeAgo(new Date(now - 30 * 1000).toISOString())).toMatch(/agora/)
  })
  it('categorySphere mapeia a esfera', () => {
    expect(categorySphere('camara')).toBe('federal')
    expect(categorySphere('cidades')).toBe('municipal')
    expect(categorySphere('desconhecida')).toBe(null)
  })
  it('NEWS_CATEGORIES tem todos com sphere definido', () => {
    expect(NEWS_CATEGORIES.length).toBeGreaterThan(4)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd /Users/gualtieri/Apps/aprenda-politica && npx vitest run src/lib/news.test.ts`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implementar**

```ts
// src/lib/news.ts
import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface NewsEntity {
  role: 'principal' | 'mencionado'
  label: string | null
  politician?: { slug: string; name: string; photo_url: string | null } | null
  proposition?: { slug: string; type: string; number: number; year: number } | null
  emenda_id?: number | null
  orgao?: string | null
}
export interface News {
  id: number; slug: string; title: string; summary: string | null
  source_name: string | null; source_domain: string | null; source_url: string
  published_at: string | null; category: string | null; sphere: string | null
  topics: string[]; cover_motif: string | null
  entities?: NewsEntity[]
}

export const NEWS_CATEGORIES: { id: string; label: string; sphere: 'federal' | 'estadual' | 'municipal' | null }[] = [
  { id: 'todos', label: 'Todos', sphere: null },
  { id: 'camara', label: 'Câmara', sphere: 'federal' },
  { id: 'senado', label: 'Senado', sphere: 'federal' },
  { id: 'governo', label: 'Governo', sphere: 'estadual' },
  { id: 'eleicoes', label: 'Eleições', sphere: 'municipal' },
  { id: 'economia', label: 'Economia', sphere: 'estadual' },
  { id: 'cidades', label: 'Cidades', sphere: 'municipal' },
  { id: 'justica', label: 'Justiça', sphere: 'federal' },
]
export const categorySphere = (id: string | null): 'federal' | 'estadual' | 'municipal' | null =>
  NEWS_CATEGORIES.find(c => c.id === id)?.sphere ?? null

export function timeAgo(iso: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24)
  if (d >= 1) return `há ${d} dia${d > 1 ? 's' : ''}`
  if (h >= 1) return `há ${h} hora${h > 1 ? 's' : ''}`
  if (m >= 1) return `há ${m} min`
  return 'agora há pouco'
}
/** URL do logo do veículo (favicon). */
export const sourceLogo = (domain: string | null): string | null =>
  domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null

const SELECT = 'id, slug, title, summary, source_name, source_domain, source_url, published_at, category, sphere, topics, cover_motif'

export async function listNews(opts: { category?: string; tema?: string; q?: string; page?: number; pageSize?: number } = {}) {
  const supabase = createServerSupabaseClient()
  const pageSize = opts.pageSize ?? 24, page = opts.page ?? 1
  let qb = supabase.from('news').select(SELECT, { count: 'exact' })
  if (opts.category && opts.category !== 'todos') qb = qb.eq('category', opts.category)
  if (opts.tema) qb = qb.contains('topics', [opts.tema])
  if (opts.q) qb = qb.ilike('title', `%${opts.q}%`)
  qb = qb.order('published_at', { ascending: false, nullsFirst: false }).range((page - 1) * pageSize, page * pageSize - 1)
  const { data, count } = await qb
  return { items: (data as News[]) ?? [], total: count ?? 0 }
}

export async function featuredNews(limit = 5): Promise<News[]> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('news').select(SELECT)
    .order('published_at', { ascending: false, nullsFirst: false }).limit(limit)
  return (data as News[]) ?? []
}

const ENT_SELECT = 'role, label, orgao, emenda_id, politician:politicians(slug, name, photo_url), proposition:propositions(slug, type, number, year)'

export async function newsBySlug(slug: string): Promise<News | null> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('news').select(`${SELECT}, news_entities(${ENT_SELECT})`).eq('slug', slug).single()
  if (!data) return null
  const raw = data as unknown as News & { news_entities: NewsEntity[] }
  return { ...raw, entities: raw.news_entities ?? [] }
}

export async function newsByPolitician(politicianId: number, limit = 4): Promise<News[]> {
  const supabase = createServerSupabaseClient()
  const { data: links } = await supabase.from('news_entities').select('news_id').eq('politician_id', politicianId).limit(40)
  const ids = [...new Set((links ?? []).map(l => l.news_id))]
  if (!ids.length) return []
  const { data } = await supabase.from('news').select(SELECT).in('id', ids)
    .order('published_at', { ascending: false, nullsFirst: false }).limit(limit)
  return (data as News[]) ?? []
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/news.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/news.ts src/lib/news.test.ts
git commit -m "feat(news): camada de consulta src/lib/news.ts (lista, destaque, por slug, por político)"
```

---

## Task 7: Componentes (design system)

**Files:**
- Create: `src/components/news/NewsCover.tsx`, `SourceTag.tsx`, `MentionChip.tsx`, `NewsCard.tsx`, `CategoryBar.tsx`

- [ ] **Step 1: `NewsCover` — capa geométrica por motif (SVG, tokens)**

```tsx
// src/components/news/NewsCover.tsx
const TONE: Record<string, { bg: string; fg: string }> = {
  federal:   { bg: 'bg-esfera-federal',   fg: 'text-white' },
  estadual:  { bg: 'bg-esfera-estadual',  fg: 'text-white' },
  municipal: { bg: 'bg-amarelo-600',      fg: 'text-white' },
}
const EMOJI: Record<string, string> = {
  congresso: '🏛️', cupula: '🏛️', palacio: '🏛️', urna: '🗳️', grafico: '📊', cidade: '🏙️', balanca: '⚖️',
}
export function NewsCover({ motif, sphere, className = '' }: { motif: string | null; sphere: string | null; className?: string }) {
  const tone = TONE[sphere ?? 'federal'] ?? TONE.federal
  return (
    <div className={`relative overflow-hidden ${tone.bg} ${className}`}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,.5) 0, transparent 45%), linear-gradient(135deg, rgba(255,255,255,.15), transparent)' }} />
      <div className={`absolute inset-0 flex items-center justify-center text-5xl ${tone.fg}`}>{EMOJI[motif ?? 'congresso'] ?? '🏛️'}</div>
    </div>
  )
}
```

- [ ] **Step 2: `SourceTag` — logo + nome (sempre)**

```tsx
// src/components/news/SourceTag.tsx
import { sourceLogo } from '@/lib/news'
export function SourceTag({ name, domain, className = '' }: { name: string | null; domain: string | null; className?: string }) {
  const logo = sourceLogo(domain)
  return (
    <span className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
      {logo
        ? <img src={logo} alt="" width={16} height={16} className="w-4 h-4 rounded-sm object-contain shrink-0" loading="lazy" />
        : <span className="w-4 h-4 rounded-sm bg-gray-100 text-gray-500 text-[9px] font-bold flex items-center justify-center shrink-0">{(name ?? '?').slice(0, 1)}</span>}
      <span className="text-xs font-medium text-gray-500 truncate">{name ?? 'Fonte'}</span>
    </span>
  )
}
```

- [ ] **Step 3: `MentionChip` — chip por tipo de entidade (linkado)**

```tsx
// src/components/news/MentionChip.tsx
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import type { NewsEntity } from '@/lib/news'
export function MentionChip({ e }: { e: NewsEntity }) {
  if (e.politician?.slug) return (
    <Link href={`/politico/${e.politician.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 pl-1 pr-2.5 py-1 hover:border-verde-500 transition-colors">
      <Avatar name={e.politician.name} photoUrl={e.politician.photo_url} size={20} />
      <span className="text-xs font-medium text-gray-800">{e.politician.name}</span>
    </Link>
  )
  if (e.proposition?.slug) return (
    <Link href={`/proposicoes/${e.proposition.slug}`} className="inline-flex items-center rounded-full bg-verde-50 text-verde-700 text-xs font-semibold px-2.5 py-1 hover:bg-verde-100 transition-colors">
      {e.label ?? `${e.proposition.type} ${e.proposition.number}/${e.proposition.year}`}
    </Link>
  )
  if (e.emenda_id) return (
    <Link href={`/emendas`} className="inline-flex items-center rounded-full bg-amarelo-50 text-amarelo-600 text-xs font-semibold px-2.5 py-1 hover:opacity-80 transition-colors">{e.label ?? 'Emenda'}</Link>
  )
  if (e.orgao) return <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1">{e.orgao}</span>
  return null
}
```

- [ ] **Step 4: `NewsCard` — variantes destaque/feed/compacto**

```tsx
// src/components/news/NewsCard.tsx
import Link from 'next/link'
import type { News } from '@/lib/news'
import { timeAgo } from '@/lib/news'
import { NewsCover } from './NewsCover'
import { SourceTag } from './SourceTag'

export function NewsCard({ n, variant = 'feed' }: { n: News; variant?: 'destaque' | 'feed' | 'compacto' }) {
  const href = `/noticias/${n.slug}`
  if (variant === 'compacto') return (
    <Link href={href} className="flex items-center gap-3 group">
      <NewsCover motif={n.cover_motif} sphere={n.sphere} className="w-16 h-16 rounded-lg shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-verde-600">{n.title}</p>
        <div className="mt-1 flex items-center gap-2"><SourceTag name={n.source_name} domain={n.source_domain} /><span className="text-[11px] text-gray-400">{timeAgo(n.published_at)}</span></div>
      </div>
    </Link>
  )
  if (variant === 'destaque') return (
    <Link href={href} className="group block rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors">
      <NewsCover motif={n.cover_motif} sphere={n.sphere} className="h-44 w-full" />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1.5"><SourceTag name={n.source_name} domain={n.source_domain} /><span className="text-[11px] text-gray-400">· {timeAgo(n.published_at)}</span></div>
        <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-verde-600">{n.title}</h3>
        {n.summary && <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{n.summary}</p>}
      </div>
    </Link>
  )
  return (
    <Link href={href} className="group flex gap-3 py-3 border-b border-gray-100">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1"><SourceTag name={n.source_name} domain={n.source_domain} /><span className="text-[11px] text-gray-400">· {timeAgo(n.published_at)}</span></div>
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-verde-600">{n.title}</h3>
        {n.summary && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.summary}</p>}
      </div>
      <NewsCover motif={n.cover_motif} sphere={n.sphere} className="w-24 h-24 rounded-xl shrink-0" />
    </Link>
  )
}
```

- [ ] **Step 5: `CategoryBar` — abas por categoria (acento por esfera)**

```tsx
// src/components/news/CategoryBar.tsx
import Link from 'next/link'
import { NEWS_CATEGORIES } from '@/lib/news'
const ESF: Record<string, string> = { federal: 'text-esfera-federal', estadual: 'text-esfera-estadual', municipal: 'text-amarelo-600' }
export function CategoryBar({ active }: { active: string }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {NEWS_CATEGORIES.map(c => {
        const on = (active || 'todos') === c.id
        const href = c.id === 'todos' ? '/noticias' : `/noticias?cat=${c.id}`
        return (
          <Link key={c.id} href={href}
            className={`shrink-0 text-sm font-medium rounded-full px-3.5 py-1.5 border transition-colors ${on ? 'bg-gray-900 text-white border-gray-900' : `border-gray-200 hover:border-gray-400 ${c.sphere ? ESF[c.sphere] : 'text-gray-600'}`}`}>
            {c.label}
          </Link>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 6: Typecheck + commit**

Run: `npx tsc --noEmit` (ignorar erros pré-existentes em `src/tests/`)
Expected: sem erros novos.

```bash
git add src/components/news/
git commit -m "feat(news): componentes (NewsCover, SourceTag, MentionChip, NewsCard, CategoryBar) no design system"
```

---

## Task 8: Página `/noticias` (Home + categorias)

**Files:**
- Create: `src/app/noticias/page.tsx`

- [ ] **Step 1: Implementar**

```tsx
// src/app/noticias/page.tsx
import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { listNews, featuredNews } from '@/lib/news'
import { NewsCard } from '@/components/news/NewsCard'
import { CategoryBar } from '@/components/news/CategoryBar'

export const metadata: Metadata = {
  title: 'Notícias — política que cruza com o portal — Aprenda Política',
  description: 'Notícias sobre políticos, projetos de lei e emendas, com as entidades mencionadas linkadas ao Aprenda Política.',
}
export const revalidate = 900

type PageProps = { searchParams: { cat?: string } }

export default async function NoticiasPage({ searchParams }: PageProps) {
  const cat = searchParams.cat ?? 'todos'
  const [{ items }, featured] = await Promise.all([
    listNews({ category: cat, pageSize: 30 }),
    cat === 'todos' ? featuredNews(5) : Promise.resolve([]),
  ])
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: 'Brasil', href: '/' }, { label: 'Notícias' }]} />
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-1">Notícias</h1>
        <p className="text-gray-500 mb-5">O que a imprensa diz sobre políticos, projetos de lei e emendas — com tudo linkado ao portal.</p>
        <div className="mb-6"><CategoryBar active={cat} /></div>

        {featured.length > 0 && (
          <section className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map(n => <NewsCard key={n.id} n={n} variant="destaque" />)}
            </div>
          </section>
        )}

        <section>
          {items.length === 0
            ? <p className="text-sm text-gray-400">Sem notícias nesta categoria ainda.</p>
            : items.map(n => <NewsCard key={n.id} n={n} variant="feed" />)}
        </section>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verificar render**

Run: `npx tsc --noEmit` então com o dev server: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3002/noticias`
Expected: 200.

- [ ] **Step 3: Commit**

```bash
git add src/app/noticias/page.tsx
git commit -m "feat(news): página /noticias (destaques + feed + categorias)"
```

---

## Task 9: Página `/noticias/[slug]` (agregador + JSON-LD)

**Files:**
- Create: `src/app/noticias/[slug]/page.tsx`

- [ ] **Step 1: Implementar**

```tsx
// src/app/noticias/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { newsBySlug, timeAgo } from '@/lib/news'
import { NewsCover } from '@/components/news/NewsCover'
import { SourceTag } from '@/components/news/SourceTag'
import { MentionChip } from '@/components/news/MentionChip'

interface PageProps { params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const n = await newsBySlug(params.slug)
  if (!n) return {}
  return { title: `${n.title} — Aprenda Política`, description: n.summary ?? n.title }
}

export default async function NoticiaPage({ params }: PageProps) {
  const n = await newsBySlug(params.slug)
  if (!n) notFound()
  const ents = n.entities ?? []
  const mentioned = ents.filter(e => e.role === 'mencionado' || e.role === 'principal')

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: n.title, datePublished: n.published_at ?? undefined,
    abstract: n.summary ?? undefined,
    isBasedOn: n.source_url, publisher: n.source_name ? { '@type': 'Organization', name: n.source_name } : undefined,
    url: `https://aprendapolitica.com.br/noticias/${n.slug}`,
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: 'Brasil', href: '/' }, { label: 'Notícias', href: '/noticias' }, { label: n.title.slice(0, 40) + '…' }]} />
        <NewsCover motif={n.cover_motif} sphere={n.sphere} className="h-52 w-full rounded-2xl mt-4 mb-5" />
        <div className="flex items-center gap-2 mb-2">
          <SourceTag name={n.source_name} domain={n.source_domain} />
          <span className="text-xs text-gray-400">· {timeAgo(n.published_at)}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">{n.title}</h1>
        {n.summary && <p className="text-lg text-gray-700 leading-relaxed mb-6">{n.summary}</p>}

        <a href={n.source_url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-verde-600 hover:underline mb-8">
          Ler matéria completa na fonte
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>

        {mentioned.length > 0 && (
          <section className="border-t border-gray-100 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Mencionados nesta notícia</h2>
            <div className="flex flex-wrap gap-2">
              {mentioned.map((e, i) => <MentionChip key={i} e={e} />)}
            </div>
          </section>
        )}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  )
}

export const revalidate = 900
```

- [ ] **Step 2: Verificar** (pegar um slug real do banco e `curl`): 200 + contém "Mencionados" quando há entidades; 404 pra slug inexistente.

- [ ] **Step 3: Commit**

```bash
git add src/app/noticias/\[slug\]/page.tsx
git commit -m "feat(news): página do artigo (agregador + Mencionados + ler na fonte + JSON-LD)"
```

---

## Task 10: Bloco "Na mídia" no perfil do político

**Files:**
- Modify: `src/app/politico/[slug]/page.tsx`

- [ ] **Step 1: Importar e buscar** — adicionar perto dos outros imports e fetch:

```tsx
import { newsByPolitician } from '@/lib/news'
import { NewsCard } from '@/components/news/NewsCard'
// ... dentro do componente, após carregar `politician`:
const naMidia = await newsByPolitician(politician.id, 4)
```

- [ ] **Step 2: Renderizar o bloco** — colocar **antes** do bloco de emendas (ou após proposições), seguindo o padrão de seção:

```tsx
{naMidia.length > 0 && (
  <section className="mb-8">
    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Na mídia</h2>
    <div className="space-y-1">
      {naMidia.map(n => <NewsCard key={n.id} n={n} variant="compacto" />)}
    </div>
    <a href={`/noticias?cat=todos`} className="inline-block mt-3 text-sm text-verde-600 font-medium hover:underline">Ver mais notícias →</a>
  </section>
)}
```

- [ ] **Step 3: Typecheck + verificar** num político com notícias (200, mostra "Na mídia").

- [ ] **Step 4: Commit**

```bash
git add src/app/politico/\[slug\]/page.tsx
git commit -m "feat(news): bloco 'Na mídia' no perfil do político"
```

---

## Task 11: Navbar "Notícias" + Sitemap

**Files:**
- Modify: `src/components/ui/Navbar.tsx`
- Modify: `src/lib/sitemap.ts`

- [ ] **Step 1: Navbar** — adicionar o item "Notícias" como link de topo (após "Aprenda Política" ou antes de "Políticos"). Adicionar ao array `links`:

```tsx
{ href: '/noticias', label: 'Notícias' },
```
(Sem submenu por enquanto — a `CategoryBar` da página já faz o papel de subnavegação. Manter o padrão dos demais itens.)

- [ ] **Step 2: Sitemap** — incluir `/noticias` em `STATIC_PATHS` e adicionar um chunk de artigos. Em `src/lib/sitemap.ts`, no array `STATIC_PATHS` adicionar `'/noticias'`. Para os artigos, seguir o padrão dos demais objetos (buscar slugs de `news` via `rest()` cacheável e emitir `/noticias/${slug}`). Mostrar o código exato do chunk seguindo o que já existe para proposições no arquivo.

- [ ] **Step 3: Verificar** — `curl -s http://localhost:3002/sitemap_index.xml` lista o chunk de notícias; `/noticias` aparece nas STATIC_PATHS.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Navbar.tsx src/lib/sitemap.ts
git commit -m "feat(news): item 'Notícias' na navbar + /noticias e artigos no sitemap"
```

---

## Verificação final

1. `npx tsc --noEmit` — 0 erros novos.
2. `npx vitest run src/lib/news.test.ts` — passa.
3. Dev server: visitar `/noticias`, clicar numa categoria, abrir um artigo, conferir os chips "Mencionados" linkando pra `/politico/...`, `/proposicoes/...`; conferir **logo+nome da fonte** em todo card.
4. Perfil de um federal com cobertura: bloco "Na mídia" aparece.
5. Rodar `node scripts/sync-news.mjs` completo (sem `NEWS_PER_QUERY` reduzido) pra popular a base de verdade.
6. Merge `feat/noticias` → main (deploy) via superpowers:finishing-a-development-branch. Lembrar o usuário de re-submeter o sitemap no GSC.

## Notas de design system (hard requirement)

- Cores **sempre** por token (`verde-*`, `amarelo-*`, `esfera-*`, `gray-*`). A única exceção legítima são cores vindas do banco (partido), via `style` inline — como já é o padrão do app.
- Reusar `Avatar`, `Breadcrumb`. Tipografia Inter (global). Responsivo mobile-first.
- A capa é geométrica (sem foto), tom por esfera — fiel ao design do bundle.
