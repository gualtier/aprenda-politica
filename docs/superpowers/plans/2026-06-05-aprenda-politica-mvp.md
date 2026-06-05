# Aprenda Política MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the interactive political organogram PWA for Vitória/ES/Brasil, showing the 3-branch hierarchy at federal, state, and municipal levels with official photos, search, and a Brazil map — structured to scale to all 5,570 municipalities.

**Architecture:** Next.js 14 App Router with static generation per municipality page. Supabase PostgreSQL stores normalized politician data synced daily from Brazilian public APIs (Câmara dos Deputados, Senado Federal, IBGE) and scrapers for ALES/CM-Vitória. The organogram uses React Flow with custom nodes; photos are stored in Supabase Storage and served via CDN. Search uses Supabase full-text search via an Edge Function route.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, @xyflow/react, Leaflet + react-leaflet, @supabase/supabase-js, @upstash/redis, Vitest + @testing-library/react, next-pwa

---

## File Map

```
aprenda-politica/
├── src/
│   ├── app/
│   │   ├── layout.tsx                         # Root layout, PWA meta, fonts
│   │   ├── page.tsx                           # Home: SearchBar + BrazilMap
│   │   ├── [estado]/
│   │   │   ├── page.tsx                       # State overview
│   │   │   └── [municipio]/
│   │   │       └── page.tsx                   # Full organogram page
│   │   ├── politico/[slug]/page.tsx           # Politician profile
│   │   └── api/
│   │       ├── search/route.ts                # Full-text search endpoint
│   │       └── sync/route.ts                  # Manual sync trigger (admin)
│   ├── components/
│   │   ├── organogram/
│   │   │   ├── Organogram.tsx                 # React Flow canvas + layout
│   │   │   ├── nodes/
│   │   │   │   ├── PoliticianNode.tsx         # Single politician card node
│   │   │   │   └── GroupNode.tsx              # Grid of politicians (deputies, etc.)
│   │   │   └── PoliticianPanel.tsx            # Slide-in detail panel
│   │   ├── map/
│   │   │   ├── BrazilMap.tsx                  # Dynamic-import wrapper (no SSR)
│   │   │   └── LeafletMapClient.tsx           # Leaflet map implementation
│   │   ├── search/
│   │   │   └── SearchBar.tsx                  # Debounced search input + results
│   │   └── ui/
│   │       ├── Avatar.tsx                     # Circular photo with fallback initials
│   │       └── Breadcrumb.tsx                 # Brasil › ES › Vitória nav
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                      # Browser Supabase client (singleton)
│   │   │   ├── server.ts                      # Server Supabase client (SSR/RSC)
│   │   │   └── queries.ts                     # All DB query functions
│   │   ├── sync/
│   │   │   ├── ibge.ts                        # Sync states + municipalities from IBGE API
│   │   │   ├── camara.ts                      # Sync federal deputies from Câmara API
│   │   │   ├── senado.ts                      # Sync senators from Senado API
│   │   │   └── scraper.ts                     # Scrape ALES + CM-Vitória (photos, names)
│   │   └── utils.ts                           # slugify, initials, formatDate
│   └── types/
│       └── index.ts                           # Shared TypeScript interfaces
├── supabase/
│   └── migrations/
│       └── 001_initial.sql                    # Full schema: states, municipalities, politicians…
├── public/
│   └── manifest.json                          # PWA manifest
├── vercel.json                                # Cron job config
└── vitest.config.ts                           # Test runner config
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `vitest.config.ts`, `.env.local.example`
- Create: `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1: Bootstrap Next.js app**

```bash
cd /Users/gualtieri/Apps/aprenda-politica
npx create-next-app@14 . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-git
```

When prompted: Yes to TypeScript, Yes to Tailwind, Yes to App Router, Yes to src/, `@/*` for alias.

- [ ] **Step 2: Install dependencies**

```bash
npm install @xyflow/react react-leaflet leaflet @supabase/supabase-js @upstash/redis next-pwa
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @types/leaflet
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
})
```

Create `src/tests/setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

Add to `package.json` scripts:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 4: Create `.env.local.example`**

```bash
cat > .env.local.example << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
CRON_SECRET=a-random-secret-string
EOF
cp .env.local.example .env.local
```

- [ ] **Step 5: Configure `next.config.ts` with PWA and image domains**

```typescript
import type { NextConfig } from 'next'
const withPWA = require('next-pwa')({ dest: 'public', disable: process.env.NODE_ENV === 'development' })

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'www.camara.leg.br' },
    ],
  },
}

module.exports = withPWA(nextConfig)
```

- [ ] **Step 6: Add Inter font and base layout**

Replace `src/app/layout.tsx`:
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aprenda Política',
  description: 'Entenda quem governa o Brasil. Dados reais. Linguagem simples.',
  themeColor: '#009c3b',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: server at http://localhost:3000 with default Next.js page. No errors.

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js 14 project with Tailwind, Vitest, PWA"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/types/index.ts`
- Create: `src/tests/types.test.ts`

- [ ] **Step 1: Write the failing type guard test**

Create `src/tests/types.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import type { Politician, OrganogramData } from '@/types'

describe('types', () => {
  it('Politician type has required fields', () => {
    const p: Politician = {
      id: 1, name: 'Test', slug: 'test',
      photo_url: null, party_id: null, position_id: null,
      mandate_start: null, mandate_end: null,
      state_id: null, municipality_id: null,
      external_id: null, source: null,
    }
    expect(p.name).toBe('Test')
  })

  it('OrganogramData has federal, estadual, municipal', () => {
    const data: OrganogramData = {
      state: { id: 1, name: 'Espírito Santo', slug: 'espirito-santo', abbr: 'ES', ibge_code: 32 },
      municipality: null,
      federal: { executive: [], legislative: { camara: [], senado: [] } },
      estadual: { executive: [], legislative: [] },
      municipal: null,
    }
    expect(data.federal.legislative.camara).toEqual([])
  })
})
```

- [ ] **Step 2: Run — expect compile error (types not defined yet)**

```bash
npm run test:run -- src/tests/types.test.ts
```

Expected: FAIL — cannot find module `@/types`

- [ ] **Step 3: Create types**

Create `src/types/index.ts`:
```typescript
export interface State {
  id: number
  name: string
  slug: string
  abbr: string
  ibge_code: number
}

export interface Municipality {
  id: number
  name: string
  slug: string
  state_id: number
  ibge_code: number
  population: number | null
  state?: State
}

export interface Party {
  id: number
  name: string
  abbr: string
  color_hex: string
}

export interface Position {
  id: number
  name: string
  slug: string
  level: 'federal' | 'state' | 'municipal'
  branch: 'executive' | 'legislative' | 'judicial'
  description: string | null
}

export interface Politician {
  id: number
  name: string
  slug: string
  photo_url: string | null
  party_id: number | null
  position_id: number | null
  mandate_start: string | null
  mandate_end: string | null
  state_id: number | null
  municipality_id: number | null
  external_id: string | null
  source: string | null
  party?: Party
  position?: Position
  state?: State
  municipality?: Municipality
}

export interface OrganogramData {
  state: State
  municipality: Municipality | null
  federal: {
    executive: Politician[]
    legislative: {
      camara: Politician[]
      senado: Politician[]
    }
  }
  estadual: {
    executive: Politician[]
    legislative: Politician[]
  }
  municipal: {
    executive: Politician[]
    legislative: Politician[]
  } | null
}

export interface SearchResult {
  type: 'municipality' | 'politician'
  slug: string
  name: string
  subtitle: string
  href: string
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm run test:run -- src/tests/types.test.ts
```

Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/tests/
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: Utility Functions

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/tests/lib/utils.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/tests/lib/utils.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { slugify, getInitials, formatMandate } from '@/lib/utils'

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Espírito Santo')).toBe('espirito-santo')
  })
  it('handles accented characters', () => {
    expect(slugify('João Pessoa')).toBe('joao-pessoa')
  })
  it('handles multiple spaces', () => {
    expect(slugify('São Paulo  ')).toBe('sao-paulo')
  })
})

describe('getInitials', () => {
  it('returns first and last initial', () => {
    expect(getInitials('Lorenzo Pazolini')).toBe('LP')
  })
  it('returns single initial for one name', () => {
    expect(getInitials('Lula')).toBe('L')
  })
})

describe('formatMandate', () => {
  it('formats start and end year', () => {
    expect(formatMandate('2021-01-01', '2024-12-31')).toBe('2021–2024')
  })
  it('shows "presente" when no end date', () => {
    expect(formatMandate('2021-01-01', null)).toBe('2021–presente')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test:run -- src/tests/lib/utils.test.ts
```

Expected: FAIL — cannot find module `@/lib/utils`

- [ ] **Step 3: Implement utils**

Create `src/lib/utils.ts`:
```typescript
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function formatMandate(start: string | null, end: string | null): string {
  if (!start) return ''
  const startYear = new Date(start).getFullYear()
  const endYear = end ? new Date(end).getFullYear() : 'presente'
  return `${startYear}–${endYear}`
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm run test:run -- src/tests/lib/utils.test.ts
```

Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils.ts src/tests/lib/utils.test.ts
git commit -m "feat: add slugify, getInitials, formatMandate utils"
```

---

## Task 4: Supabase Database Schema

**Files:**
- Create: `supabase/migrations/001_initial.sql`
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com → New project → name: `aprenda-politica`.
Copy the project URL and keys to `.env.local`.

- [ ] **Step 2: Write migration**

Create `supabase/migrations/001_initial.sql`:
```sql
-- States
CREATE TABLE states (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  abbr CHAR(2) NOT NULL UNIQUE,
  ibge_code INT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Municipalities
CREATE TABLE municipalities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  state_id INT NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  ibge_code INT NOT NULL UNIQUE,
  population INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, state_id)
);

-- Parties
CREATE TABLE parties (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  abbr TEXT NOT NULL UNIQUE,
  color_hex TEXT NOT NULL DEFAULT '#888888',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Positions (Presidente, Governador, Prefeito, Deputado Federal, etc.)
CREATE TABLE positions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  level TEXT NOT NULL CHECK (level IN ('federal', 'state', 'municipal')),
  branch TEXT NOT NULL CHECK (branch IN ('executive', 'legislative', 'judicial')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Politicians
CREATE TABLE politicians (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  photo_url TEXT,
  party_id INT REFERENCES parties(id),
  position_id INT REFERENCES positions(id),
  mandate_start DATE,
  mandate_end DATE,
  state_id INT REFERENCES states(id),
  municipality_id INT REFERENCES municipalities(id),
  external_id TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_politicians_state ON politicians(state_id);
CREATE INDEX idx_politicians_municipality ON politicians(municipality_id);
CREATE INDEX idx_politicians_position ON politicians(position_id);

-- Full-text search index
ALTER TABLE politicians ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('portuguese', name)) STORED;
CREATE INDEX idx_politicians_search ON politicians USING GIN(search_vector);

ALTER TABLE municipalities ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('portuguese', name)) STORED;
CREATE INDEX idx_municipalities_search ON municipalities USING GIN(search_vector);

-- Sync log
CREATE TABLE sync_logs (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'running')),
  error TEXT,
  records_synced INT DEFAULT 0
);

-- Seed positions
INSERT INTO positions (name, slug, level, branch, description) VALUES
  ('Presidente da República', 'presidente', 'federal', 'executive', 'Chefe do Poder Executivo federal'),
  ('Senador', 'senador', 'federal', 'legislative', 'Representa o estado no Senado Federal'),
  ('Deputado Federal', 'deputado-federal', 'federal', 'legislative', 'Representa o estado na Câmara dos Deputados'),
  ('Governador', 'governador', 'state', 'executive', 'Chefe do Poder Executivo estadual'),
  ('Deputado Estadual', 'deputado-estadual', 'state', 'legislative', 'Membro da Assembleia Legislativa estadual'),
  ('Prefeito', 'prefeito', 'municipal', 'executive', 'Chefe do Poder Executivo municipal'),
  ('Vereador', 'vereador', 'municipal', 'legislative', 'Membro da Câmara Municipal');
```

- [ ] **Step 3: Run migration in Supabase**

Go to Supabase Dashboard → SQL Editor → paste `001_initial.sql` → Run.

Verify: Tables `states`, `municipalities`, `parties`, `positions`, `politicians`, `sync_logs` created. Positions table has 7 rows.

- [ ] **Step 4: Create Supabase client (browser)**

Create `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 5: Create Supabase client (server/RSC)**

```bash
npm install @supabase/ssr
```

Create `src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
}

export function createServiceRoleClient() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add supabase/ src/lib/supabase/
git commit -m "feat: Supabase schema migration + client helpers"
```

---

## Task 5: IBGE Sync (States + Municipalities)

**Files:**
- Create: `src/lib/sync/ibge.ts`
- Create: `src/tests/lib/sync/ibge.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/tests/lib/sync/ibge.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseIbgeState, parseIbgeMunicipality } from '@/lib/sync/ibge'

describe('parseIbgeState', () => {
  it('converts IBGE state object to DB row', () => {
    const raw = { id: 32, nome: 'Espírito Santo', sigla: 'ES' }
    const result = parseIbgeState(raw)
    expect(result).toEqual({
      name: 'Espírito Santo',
      slug: 'espirito-santo',
      abbr: 'ES',
      ibge_code: 32,
    })
  })
})

describe('parseIbgeMunicipality', () => {
  it('converts IBGE municipality object to DB row', () => {
    const raw = { id: 3205309, nome: 'Vitória', microrregiao: { mesorregiao: { UF: { id: 32 } } } }
    const result = parseIbgeMunicipality(raw, 1)
    expect(result).toEqual({
      name: 'Vitória',
      slug: 'vitoria',
      ibge_code: 3205309,
      state_id: 1,
      population: null,
    })
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test:run -- src/tests/lib/sync/ibge.test.ts
```

Expected: FAIL — cannot find module

- [ ] **Step 3: Implement**

Create `src/lib/sync/ibge.ts`:
```typescript
import { slugify } from '@/lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'

export function parseIbgeState(raw: { id: number; nome: string; sigla: string }) {
  return {
    name: raw.nome,
    slug: slugify(raw.nome),
    abbr: raw.sigla,
    ibge_code: raw.id,
  }
}

export function parseIbgeMunicipality(raw: { id: number; nome: string }, stateId: number) {
  return {
    name: raw.nome,
    slug: slugify(raw.nome),
    ibge_code: raw.id,
    state_id: stateId,
    population: null,
  }
}

export async function syncStates(supabase: SupabaseClient): Promise<number> {
  const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
  if (!res.ok) throw new Error(`IBGE states fetch failed: ${res.status}`)
  const raw: Array<{ id: number; nome: string; sigla: string }> = await res.json()

  const rows = raw.map(parseIbgeState)
  const { error } = await supabase.from('states').upsert(rows, { onConflict: 'ibge_code' })
  if (error) throw new Error(`Supabase upsert states: ${error.message}`)
  return rows.length
}

export async function syncMunicipalities(supabase: SupabaseClient, stateAbbr: string): Promise<number> {
  const { data: state } = await supabase.from('states').select('id').eq('abbr', stateAbbr).single()
  if (!state) throw new Error(`State not found: ${stateAbbr}`)

  const res = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateAbbr}/municipios?orderBy=nome`
  )
  if (!res.ok) throw new Error(`IBGE municipalities fetch failed: ${res.status}`)
  const raw: Array<{ id: number; nome: string }> = await res.json()

  const rows = raw.map((m) => parseIbgeMunicipality(m, state.id))
  const { error } = await supabase.from('municipalities').upsert(rows, { onConflict: 'ibge_code' })
  if (error) throw new Error(`Supabase upsert municipalities: ${error.message}`)
  return rows.length
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm run test:run -- src/tests/lib/sync/ibge.test.ts
```

Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/sync/ibge.ts src/tests/lib/sync/ibge.test.ts
git commit -m "feat: IBGE sync — states and municipalities"
```

---

## Task 6: Câmara dos Deputados Sync

**Files:**
- Create: `src/lib/sync/camara.ts`
- Create: `src/tests/lib/sync/camara.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/tests/lib/sync/camara.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { parseCamaraDeputado } from '@/lib/sync/camara'

describe('parseCamaraDeputado', () => {
  it('maps Camara API fields to politician row', () => {
    const raw = {
      id: 204554,
      nome: 'Camila Valadão',
      siglaPartido: 'PSOL',
      siglaUf: 'ES',
      urlFoto: 'https://www.camara.leg.br/internet/deputado/bandep/204554.jpg',
    }
    const result = parseCamaraDeputado(raw, 99, 88)
    expect(result.name).toBe('Camila Valadão')
    expect(result.slug).toBe('camila-valadao')
    expect(result.external_id).toBe('204554')
    expect(result.source).toBe('camara')
    expect(result.position_id).toBe(99)
    expect(result.state_id).toBe(88)
    expect(result.photo_url).toBe('https://www.camara.leg.br/internet/deputado/bandep/204554.jpg')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test:run -- src/tests/lib/sync/camara.test.ts
```

- [ ] **Step 3: Implement**

Create `src/lib/sync/camara.ts`:
```typescript
import { slugify } from '@/lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'

const CAMARA_API = 'https://dadosabertos.camara.leg.br/api/v2'
const CURRENT_LEGISLATURE = 57

export function parseCamaraDeputado(
  raw: { id: number; nome: string; siglaPartido: string; siglaUf: string; urlFoto: string },
  positionId: number,
  stateId: number
) {
  return {
    name: raw.nome,
    slug: slugify(raw.nome),
    photo_url: raw.urlFoto,
    external_id: String(raw.id),
    source: 'camara' as const,
    position_id: positionId,
    state_id: stateId,
    municipality_id: null,
    party_id: null,           // resolved separately via party abbr
    mandate_start: '2023-02-01',
    mandate_end: '2027-01-31',
    _party_abbr: raw.siglaPartido, // temp field for resolution
  }
}

export async function syncDeputadosFederais(supabase: SupabaseClient, stateAbbr: string): Promise<number> {
  // Get position id
  const { data: position } = await supabase
    .from('positions').select('id').eq('slug', 'deputado-federal').single()
  if (!position) throw new Error('Position deputado-federal not found')

  // Get state id
  const { data: state } = await supabase
    .from('states').select('id').eq('abbr', stateAbbr).single()
  if (!state) throw new Error(`State not found: ${stateAbbr}`)

  let page = 1
  let total = 0
  while (true) {
    const url = `${CAMARA_API}/deputados?idLegislatura=${CURRENT_LEGISLATURE}&siglaUf=${stateAbbr}&itens=100&pagina=${page}&ordem=ASC&ordenarPor=nome`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Camara API error: ${res.status}`)
    const { dados } = await res.json()
    if (!dados || dados.length === 0) break

    for (const dep of dados) {
      const row = parseCamaraDeputado(dep, position.id, state.id)
      const { _party_abbr, ...politicianRow } = row

      // Upsert party
      if (_party_abbr) {
        await supabase.from('parties').upsert(
          { name: _party_abbr, abbr: _party_abbr, color_hex: '#888888' },
          { onConflict: 'abbr', ignoreDuplicates: true }
        )
        const { data: party } = await supabase
          .from('parties').select('id').eq('abbr', _party_abbr).single()
        if (party) politicianRow.party_id = party.id
      }

      await supabase
        .from('politicians')
        .upsert(politicianRow, { onConflict: 'slug' })
    }
    total += dados.length
    if (dados.length < 100) break
    page++
  }
  return total
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm run test:run -- src/tests/lib/sync/camara.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/sync/camara.ts src/tests/lib/sync/camara.test.ts
git commit -m "feat: Câmara dos Deputados sync"
```

---

## Task 7: Senado Federal Sync

**Files:**
- Create: `src/lib/sync/senado.ts`
- Create: `src/tests/lib/sync/senado.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/tests/lib/sync/senado.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { parseSenador } from '@/lib/sync/senado'

describe('parseSenador', () => {
  it('maps Senado API fields to politician row', () => {
    const raw = {
      IdentificacaoParlamentar: {
        CodigoParlamentar: '5936',
        NomeParlamentar: 'Fabiano Contarato',
        SiglaPartidoParlamentar: 'PT',
        UfParlamentar: 'ES',
        UrlFotoParlamentar: 'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador5936.jpg',
      },
      Mandato: {
        DataInicioMandato: '2019-02-01',
        DataFimMandato: '2027-01-31',
      },
    }
    const result = parseSenador(raw, 10, 5)
    expect(result.name).toBe('Fabiano Contarato')
    expect(result.slug).toBe('fabiano-contarato')
    expect(result.source).toBe('senado')
    expect(result.position_id).toBe(10)
    expect(result.state_id).toBe(5)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test:run -- src/tests/lib/sync/senado.test.ts
```

- [ ] **Step 3: Implement**

Create `src/lib/sync/senado.ts`:
```typescript
import { slugify } from '@/lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'

export function parseSenador(raw: any, positionId: number, stateId: number) {
  const p = raw.IdentificacaoParlamentar
  const m = raw.Mandato
  return {
    name: p.NomeParlamentar,
    slug: slugify(p.NomeParlamentar),
    photo_url: p.UrlFotoParlamentar || null,
    external_id: String(p.CodigoParlamentar),
    source: 'senado' as const,
    position_id: positionId,
    state_id: stateId,
    municipality_id: null,
    party_id: null,
    mandate_start: m?.DataInicioMandato || null,
    mandate_end: m?.DataFimMandato || null,
    _party_abbr: p.SiglaPartidoParlamentar as string,
  }
}

export async function syncSenadores(supabase: SupabaseClient, stateAbbr: string): Promise<number> {
  const { data: position } = await supabase
    .from('positions').select('id').eq('slug', 'senador').single()
  if (!position) throw new Error('Position senador not found')

  const { data: state } = await supabase
    .from('states').select('id').eq('abbr', stateAbbr).single()
  if (!state) throw new Error(`State not found: ${stateAbbr}`)

  const res = await fetch(
    'https://legis.senado.leg.br/dadosabertos/senador/lista/atual',
    { headers: { Accept: 'application/json' } }
  )
  if (!res.ok) throw new Error(`Senado API error: ${res.status}`)
  const json = await res.json()

  const allSenadores: any[] = json?.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar ?? []
  const stateSenadores = allSenadores.filter(
    (s: any) => s.IdentificacaoParlamentar?.UfParlamentar === stateAbbr
  )

  let count = 0
  for (const sen of stateSenadores) {
    const row = parseSenador(sen, position.id, state.id)
    const { _party_abbr, ...politicianRow } = row

    if (_party_abbr) {
      await supabase.from('parties').upsert(
        { name: _party_abbr, abbr: _party_abbr, color_hex: '#888888' },
        { onConflict: 'abbr', ignoreDuplicates: true }
      )
      const { data: party } = await supabase
        .from('parties').select('id').eq('abbr', _party_abbr).single()
      if (party) politicianRow.party_id = party.id
    }

    await supabase.from('politicians').upsert(politicianRow, { onConflict: 'slug' })
    count++
  }
  return count
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm run test:run -- src/tests/lib/sync/senado.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/sync/senado.ts src/tests/lib/sync/senado.test.ts
git commit -m "feat: Senado Federal sync"
```

---

## Task 8: Web Scraper (ALES + CM-Vitória)

**Files:**
- Create: `src/lib/sync/scraper.ts`
- Create: `src/tests/lib/sync/scraper.test.ts`

- [ ] **Step 1: Install scraping dependency**

```bash
npm install cheerio
npm install -D @types/cheerio
```

- [ ] **Step 2: Write failing tests**

Create `src/tests/lib/sync/scraper.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { parseALESDeputado } from '@/lib/sync/scraper'

describe('parseALESDeputado', () => {
  it('parses scraped ALES data', () => {
    const raw = { name: 'Theodorico Ferraço', party: 'PP', photoUrl: 'https://ales.es.gov.br/foto.jpg' }
    const result = parseALESDeputado(raw, 5, 99)
    expect(result.name).toBe('Theodorico Ferraço')
    expect(result.slug).toBe('theodorico-ferraco')
    expect(result.source).toBe('ales-scraper')
    expect(result.state_id).toBe(5)
    expect(result.position_id).toBe(99)
  })
})
```

- [ ] **Step 3: Run — expect FAIL**

```bash
npm run test:run -- src/tests/lib/sync/scraper.test.ts
```

- [ ] **Step 4: Implement**

Create `src/lib/sync/scraper.ts`:
```typescript
import * as cheerio from 'cheerio'
import { slugify } from '@/lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'

export function parseALESDeputado(
  raw: { name: string; party: string; photoUrl: string | null },
  stateId: number,
  positionId: number
) {
  return {
    name: raw.name,
    slug: slugify(raw.name),
    photo_url: raw.photoUrl,
    source: 'ales-scraper' as const,
    state_id: stateId,
    municipality_id: null,
    position_id: positionId,
    party_id: null,
    external_id: null,
    mandate_start: '2023-02-01',
    mandate_end: '2027-01-31',
    _party_abbr: raw.party,
  }
}

export async function scrapeALES(supabase: SupabaseClient): Promise<number> {
  const { data: position } = await supabase
    .from('positions').select('id').eq('slug', 'deputado-estadual').single()
  if (!position) throw new Error('Position deputado-estadual not found')

  const { data: state } = await supabase
    .from('states').select('id').eq('abbr', 'ES').single()
  if (!state) throw new Error('State ES not found')

  const res = await fetch('https://www.ales.es.gov.br/deputados', {
    headers: { 'User-Agent': 'AprindaPoliticaBot/1.0 (+https://aprendapolitica.com.br)' },
  })
  if (!res.ok) throw new Error(`ALES scrape failed: ${res.status}`)
  const html = await res.text()
  const $ = cheerio.load(html)

  const deputados: Array<{ name: string; party: string; photoUrl: string | null }> = []

  // ALES lists deputies in .deputado-card or similar — adjust selector to match live HTML
  $('[class*="deputad"]').each((_, el) => {
    const name = $(el).find('[class*="nome"], h3, h4').first().text().trim()
    const party = $(el).find('[class*="partido"], [class*="party"]').first().text().trim().replace(/[()]/g, '')
    const imgSrc = $(el).find('img').attr('src') || null
    const photoUrl = imgSrc ? (imgSrc.startsWith('http') ? imgSrc : `https://www.ales.es.gov.br${imgSrc}`) : null
    if (name) deputados.push({ name, party, photoUrl })
  })

  let count = 0
  for (const dep of deputados) {
    const row = parseALESDeputado(dep, state.id, position.id)
    const { _party_abbr, ...politicianRow } = row
    if (_party_abbr) {
      await supabase.from('parties').upsert(
        { name: _party_abbr, abbr: _party_abbr, color_hex: '#888888' },
        { onConflict: 'abbr', ignoreDuplicates: true }
      )
      const { data: party } = await supabase
        .from('parties').select('id').eq('abbr', _party_abbr).single()
      if (party) politicianRow.party_id = party.id
    }
    await supabase.from('politicians').upsert(politicianRow, { onConflict: 'slug' })
    count++
  }
  return count
}

export async function scrapeCamaraVitoria(supabase: SupabaseClient): Promise<number> {
  const { data: position } = await supabase
    .from('positions').select('id').eq('slug', 'vereador').single()
  if (!position) throw new Error('Position vereador not found')

  const { data: municipality } = await supabase
    .from('municipalities').select('id, state_id').eq('slug', 'vitoria').single()
  if (!municipality) throw new Error('Municipality vitoria not found')

  const res = await fetch('https://www.camaravitoria.es.gov.br/vereadores', {
    headers: { 'User-Agent': 'AprindaPoliticaBot/1.0' },
  })
  if (!res.ok) throw new Error(`CM-Vitória scrape failed: ${res.status}`)
  const html = await res.text()
  const $ = cheerio.load(html)

  const vereadores: Array<{ name: string; party: string; photoUrl: string | null }> = []

  $('[class*="vereador"], [class*="parlamentar"], .card').each((_, el) => {
    const name = $(el).find('[class*="nome"], h3, h4, strong').first().text().trim()
    const party = $(el).find('[class*="partido"]').first().text().trim().replace(/[()]/g, '')
    const imgSrc = $(el).find('img').attr('src') || null
    const photoUrl = imgSrc ? (imgSrc.startsWith('http') ? imgSrc : `https://www.camaravitoria.es.gov.br${imgSrc}`) : null
    if (name) vereadores.push({ name, party, photoUrl })
  })

  let count = 0
  for (const ver of vereadores) {
    const row = {
      name: ver.name,
      slug: slugify(ver.name),
      photo_url: ver.photoUrl,
      source: 'cm-vitoria-scraper',
      state_id: municipality.state_id,
      municipality_id: municipality.id,
      position_id: position.id,
      party_id: null as number | null,
      external_id: null,
      mandate_start: '2025-01-01',
      mandate_end: '2028-12-31',
    }
    if (ver.party) {
      await supabase.from('parties').upsert(
        { name: ver.party, abbr: ver.party, color_hex: '#888888' },
        { onConflict: 'abbr', ignoreDuplicates: true }
      )
      const { data: party } = await supabase
        .from('parties').select('id').eq('abbr', ver.party).single()
      if (party) row.party_id = party.id
    }
    await supabase.from('politicians').upsert(row, { onConflict: 'slug' })
    count++
  }
  return count
}
```

- [ ] **Step 5: Run — expect PASS**

```bash
npm run test:run -- src/tests/lib/sync/scraper.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/sync/scraper.ts src/tests/lib/sync/scraper.test.ts
git commit -m "feat: ALES + CM-Vitória scrapers"
```

---

## Task 9: Sync API Route + Initial Data Load

**Files:**
- Create: `src/app/api/sync/route.ts`

- [ ] **Step 1: Create sync route**

Create `src/app/api/sync/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { syncStates, syncMunicipalities } from '@/lib/sync/ibge'
import { syncDeputadosFederais } from '@/lib/sync/camara'
import { syncSenadores } from '@/lib/sync/senado'
import { scrapeALES, scrapeCamaraVitoria } from '@/lib/sync/scraper'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const results: Record<string, number | string> = {}

  try {
    results.states = await syncStates(supabase)
    results.municipalities_es = await syncMunicipalities(supabase, 'ES')
    results.deputados_federais_es = await syncDeputadosFederais(supabase, 'ES')
    results.senadores_es = await syncSenadores(supabase, 'ES')
    results.deputados_estaduais_es = await scrapeALES(supabase)
    results.vereadores_vitoria = await scrapeCamaraVitoria(supabase)

    await supabase.from('sync_logs').insert({
      source: 'full-sync',
      status: 'success',
      records_synced: Object.values(results).reduce((a: number, b) => a + (Number(b) || 0), 0),
    })

    return NextResponse.json({ ok: true, results })
  } catch (err: any) {
    await supabase.from('sync_logs').insert({
      source: 'full-sync',
      status: 'error',
      error: err.message,
    })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
```

- [ ] **Step 2: Run initial data sync**

```bash
npm run dev &
curl -X POST http://localhost:3000/api/sync \
  -H "x-cron-secret: $(grep CRON_SECRET .env.local | cut -d= -f2)"
```

Expected: `{"ok":true,"results":{...}}` with counts for each source.

Verify in Supabase Dashboard: `politicians` table should have rows.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/sync/
git commit -m "feat: sync API route for full data load"
```

---

## Task 10: Database Query Functions

**Files:**
- Create: `src/lib/supabase/queries.ts`
- Create: `src/tests/lib/supabase/queries.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/tests/lib/supabase/queries.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { buildOrganogramFromRows } from '@/lib/supabase/queries'
import type { Politician } from '@/types'

const makePolitician = (overrides: Partial<Politician>): Politician => ({
  id: 1, name: 'Test', slug: 'test', photo_url: null,
  party_id: null, position_id: null, mandate_start: null, mandate_end: null,
  state_id: 1, municipality_id: null, external_id: null, source: null,
  ...overrides,
})

describe('buildOrganogramFromRows', () => {
  it('splits politicians by level and branch', () => {
    const presidente = makePolitician({
      position: { id: 1, name: 'Presidente', slug: 'presidente', level: 'federal', branch: 'executive', description: null },
    })
    const deputado = makePolitician({
      position: { id: 3, name: 'Deputado Federal', slug: 'deputado-federal', level: 'federal', branch: 'legislative', description: null },
    })
    const senador = makePolitician({
      position: { id: 2, name: 'Senador', slug: 'senador', level: 'federal', branch: 'legislative', description: null },
    })

    const result = buildOrganogramFromRows([presidente, deputado, senador], null)

    expect(result.federal.executive).toHaveLength(1)
    expect(result.federal.legislative.camara).toHaveLength(1)
    expect(result.federal.legislative.senado).toHaveLength(1)
    expect(result.estadual.executive).toHaveLength(0)
    expect(result.municipal).toBeNull()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test:run -- src/tests/lib/supabase/queries.test.ts
```

- [ ] **Step 3: Implement**

Create `src/lib/supabase/queries.ts`:
```typescript
import { createServerSupabaseClient } from './server'
import type { Politician, OrganogramData, Municipality, State, SearchResult } from '@/types'

export function buildOrganogramFromRows(
  politicians: Politician[],
  municipality: Municipality | null
): OrganogramData {
  const bySlug = (slug: string) =>
    politicians.filter((p) => p.position?.slug === slug)

  const state = politicians[0]?.state ?? ({} as State)

  return {
    state,
    municipality,
    federal: {
      executive: bySlug('presidente'),
      legislative: {
        camara: politicians.filter((p) => p.position?.slug === 'deputado-federal'),
        senado: politicians.filter((p) => p.position?.slug === 'senador'),
      },
    },
    estadual: {
      executive: bySlug('governador'),
      legislative: politicians.filter((p) => p.position?.slug === 'deputado-estadual'),
    },
    municipal: municipality
      ? {
          executive: bySlug('prefeito'),
          legislative: politicians.filter((p) => p.position?.slug === 'vereador'),
        }
      : null,
  }
}

export async function getOrganogramData(
  stateSlug: string,
  municipalitySlug?: string
): Promise<OrganogramData | null> {
  const supabase = createServerSupabaseClient()

  const { data: state } = await supabase
    .from('states').select('*').eq('slug', stateSlug).single()
  if (!state) return null

  let municipality: Municipality | null = null
  if (municipalitySlug) {
    const { data } = await supabase
      .from('municipalities')
      .select('*, state:states(*)')
      .eq('slug', municipalitySlug)
      .eq('state_id', state.id)
      .single()
    municipality = data
  }

  const query = supabase
    .from('politicians')
    .select('*, party:parties(*), position:positions(*), state:states(*), municipality:municipalities(*)')
    .eq('state_id', state.id)

  if (municipality) {
    query.or(`municipality_id.is.null,municipality_id.eq.${municipality.id}`)
  }

  const { data: politicians } = await query
  if (!politicians) return null

  return buildOrganogramFromRows(politicians as Politician[], municipality)
}

export async function searchPoliticsEntities(q: string): Promise<SearchResult[]> {
  const supabase = createServerSupabaseClient()
  const term = q.trim()
  if (term.length < 2) return []

  const [{ data: politicians }, { data: municipalities }] = await Promise.all([
    supabase
      .from('politicians')
      .select('name, slug, position:positions(name), state:states(slug, abbr)')
      .textSearch('search_vector', term, { type: 'websearch', config: 'portuguese' })
      .limit(5),
    supabase
      .from('municipalities')
      .select('name, slug, state:states(slug, abbr, name)')
      .textSearch('search_vector', term, { type: 'websearch', config: 'portuguese' })
      .limit(5),
  ])

  const results: SearchResult[] = []

  for (const m of municipalities ?? []) {
    const s = m.state as any
    results.push({
      type: 'municipality',
      slug: m.slug,
      name: m.name,
      subtitle: `${s?.name ?? ''} · ${s?.abbr ?? ''}`,
      href: `/${s?.slug}/${m.slug}`,
    })
  }

  for (const p of politicians ?? []) {
    const s = p.state as any
    const pos = p.position as any
    results.push({
      type: 'politician',
      slug: p.slug,
      name: p.name,
      subtitle: `${pos?.name ?? ''} · ${s?.abbr ?? ''}`,
      href: `/politico/${p.slug}`,
    })
  }

  return results
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm run test:run -- src/tests/lib/supabase/queries.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/queries.ts src/tests/lib/supabase/queries.test.ts
git commit -m "feat: DB query functions — getOrganogramData, searchPoliticsEntities"
```

---

## Task 11: Avatar UI Component

**Files:**
- Create: `src/components/ui/Avatar.tsx`
- Create: `src/tests/components/ui/Avatar.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/tests/components/ui/Avatar.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { Avatar } from '@/components/ui/Avatar'

describe('Avatar', () => {
  it('renders image when photoUrl provided', () => {
    render(<Avatar name="Lula" photoUrl="https://example.com/lula.jpg" size={40} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'Lula')
  })

  it('renders initials when no photo', () => {
    render(<Avatar name="Lorenzo Pazolini" photoUrl={null} size={40} />)
    expect(screen.getByText('LP')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test:run -- src/tests/components/ui/Avatar.test.tsx
```

- [ ] **Step 3: Implement**

Create `src/components/ui/Avatar.tsx`:
```typescript
'use client'
import Image from 'next/image'
import { useState } from 'react'
import { getInitials } from '@/lib/utils'

interface AvatarProps {
  name: string
  photoUrl: string | null
  size: number
  className?: string
}

export function Avatar({ name, photoUrl, size, className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false)

  if (photoUrl && !imgError) {
    return (
      <div
        className={`relative rounded-full overflow-hidden flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={photoUrl}
          alt={name}
          fill
          className="object-cover"
          sizes={`${size}px`}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div
      className={`rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-600 font-semibold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm run test:run -- src/tests/components/ui/Avatar.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Avatar.tsx src/tests/components/ui/Avatar.test.tsx
git commit -m "feat: Avatar component with photo + initials fallback"
```

---

## Task 12: PoliticianNode + GroupNode (React Flow)

**Files:**
- Create: `src/components/organogram/nodes/PoliticianNode.tsx`
- Create: `src/components/organogram/nodes/GroupNode.tsx`
- Create: `src/tests/components/organogram/PoliticianNode.test.tsx`
- Create: `src/tests/components/organogram/GroupNode.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/tests/components/organogram/PoliticianNode.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { PoliticianNode } from '@/components/organogram/nodes/PoliticianNode'
import type { NodeProps } from '@xyflow/react'
import type { Politician } from '@/types'

const mockPolitician: Politician = {
  id: 1, name: 'Lorenzo Pazolini', slug: 'lorenzo-pazolini',
  photo_url: null, party_id: 1, position_id: 6,
  mandate_start: '2025-01-01', mandate_end: '2028-12-31',
  state_id: 32, municipality_id: 1, external_id: null, source: null,
  party: { id: 1, name: 'Republicanos', abbr: 'REP', color_hex: '#ff6600' },
  position: { id: 6, name: 'Prefeito', slug: 'prefeito', level: 'municipal', branch: 'executive', description: null },
}

describe('PoliticianNode', () => {
  it('renders politician name', () => {
    const props = { data: { politician: mockPolitician, onSelect: vi.fn() } } as any
    render(<PoliticianNode {...props} />)
    expect(screen.getByText('Lorenzo Pazolini')).toBeInTheDocument()
  })

  it('renders party abbreviation', () => {
    const props = { data: { politician: mockPolitician, onSelect: vi.fn() } } as any
    render(<PoliticianNode {...props} />)
    expect(screen.getByText(/REP/)).toBeInTheDocument()
  })
})
```

Create `src/tests/components/organogram/GroupNode.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { GroupNode } from '@/components/organogram/nodes/GroupNode'
import type { Politician } from '@/types'

const mockPoliticians: Politician[] = Array.from({ length: 3 }, (_, i) => ({
  id: i + 1, name: `Vereador ${i + 1}`, slug: `vereador-${i + 1}`,
  photo_url: null, party_id: null, position_id: 7,
  mandate_start: null, mandate_end: null,
  state_id: 32, municipality_id: 1, external_id: null, source: null,
}))

describe('GroupNode', () => {
  it('renders all politician avatars', () => {
    const props = { data: { politicians: mockPoliticians, label: 'Vereadores', onSelect: vi.fn() } } as any
    render(<GroupNode {...props} />)
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(3)
  })

  it('renders count label', () => {
    const props = { data: { politicians: mockPoliticians, label: 'Vereadores', onSelect: vi.fn() } } as any
    render(<GroupNode {...props} />)
    expect(screen.getByText('3 Vereadores')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test:run -- src/tests/components/organogram/
```

- [ ] **Step 3: Create PoliticianNode**

Create `src/components/organogram/nodes/PoliticianNode.tsx`:
```typescript
'use client'
import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Avatar } from '@/components/ui/Avatar'
import { formatMandate } from '@/lib/utils'
import type { Politician } from '@/types'

interface PoliticianNodeData {
  politician: Politician
  borderColor: string
  onSelect: (p: Politician) => void
}

export const PoliticianNode = memo(({ data }: NodeProps) => {
  const { politician: p, borderColor, onSelect } = data as PoliticianNodeData
  return (
    <div
      className="bg-white rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow p-3 flex items-center gap-3 min-w-[160px] max-w-[200px]"
      style={{ border: `2px solid ${borderColor}` }}
      onClick={() => onSelect(p)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(p)}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Avatar name={p.name} photoUrl={p.photo_url} size={44} />
      <div className="min-w-0">
        <div className="font-semibold text-sm text-gray-900 truncate">{p.name}</div>
        <div className="text-xs truncate" style={{ color: borderColor }}>
          {p.party?.abbr ?? '—'} · {p.position?.name ?? ''}
        </div>
        <div className="text-xs text-gray-400">{formatMandate(p.mandate_start, p.mandate_end)}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
})

PoliticianNode.displayName = 'PoliticianNode'
```

- [ ] **Step 4: Create GroupNode**

Create `src/components/organogram/nodes/GroupNode.tsx`:
```typescript
'use client'
import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Avatar } from '@/components/ui/Avatar'
import type { Politician } from '@/types'

interface GroupNodeData {
  politicians: Politician[]
  label: string
  borderColor: string
  onSelect: (p: Politician) => void
}

export const GroupNode = memo(({ data }: NodeProps) => {
  const { politicians, label, borderColor, onSelect } = data as GroupNodeData
  return (
    <div
      className="bg-white rounded-xl shadow-sm p-3 min-w-[280px] max-w-[480px]"
      style={{ border: `2px solid ${borderColor}` }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: borderColor }}>
        {politicians.length} {label}
      </div>
      <div className="flex flex-wrap gap-3">
        {politicians.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="flex flex-col items-center gap-1 hover:scale-105 transition-transform"
            title={p.name}
          >
            <Avatar name={p.name} photoUrl={p.photo_url} size={40} />
            <span className="text-[9px] text-gray-600 text-center leading-tight max-w-[44px] truncate">
              {p.name.split(' ')[0]}
            </span>
            {p.party && (
              <span className="text-[8px] text-gray-400">{p.party.abbr}</span>
            )}
          </button>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
})

GroupNode.displayName = 'GroupNode'
```

- [ ] **Step 5: Run — expect PASS**

```bash
npm run test:run -- src/tests/components/organogram/
```

- [ ] **Step 6: Commit**

```bash
git add src/components/organogram/nodes/ src/tests/components/organogram/
git commit -m "feat: PoliticianNode and GroupNode React Flow components"
```

---

## Task 13: PoliticianPanel (Side Panel)

**Files:**
- Create: `src/components/organogram/PoliticianPanel.tsx`
- Create: `src/tests/components/organogram/PoliticianPanel.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/tests/components/organogram/PoliticianPanel.test.tsx`:
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { PoliticianPanel } from '@/components/organogram/PoliticianPanel'

const p = {
  id: 1, name: 'Lorenzo Pazolini', slug: 'lorenzo-pazolini',
  photo_url: null, party_id: 1, position_id: 6,
  mandate_start: '2025-01-01', mandate_end: '2028-12-31',
  state_id: 32, municipality_id: 1, external_id: null, source: null,
  party: { id: 1, name: 'Republicanos', abbr: 'REP', color_hex: '#ff6600' },
  position: { id: 6, name: 'Prefeito', slug: 'prefeito', level: 'municipal' as const, branch: 'executive' as const, description: null },
}

describe('PoliticianPanel', () => {
  it('shows politician name when open', () => {
    render(<PoliticianPanel politician={p} onClose={vi.fn()} />)
    expect(screen.getByText('Lorenzo Pazolini')).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(<PoliticianPanel politician={p} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /fechar/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test:run -- src/tests/components/organogram/PoliticianPanel.test.tsx
```

- [ ] **Step 3: Implement**

Create `src/components/organogram/PoliticianPanel.tsx`:
```typescript
'use client'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { formatMandate } from '@/lib/utils'
import type { Politician } from '@/types'

interface PoliticianPanelProps {
  politician: Politician
  onClose: () => void
}

export function PoliticianPanel({ politician: p, onClose }: PoliticianPanelProps) {
  return (
    <aside
      className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right"
      role="complementary"
      aria-label="Detalhes do político"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          {p.position?.name}
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          aria-label="Fechar painel"
        >
          ×
        </button>
      </div>

      <div className="p-6 flex flex-col items-center gap-4 border-b">
        <Avatar name={p.name} photoUrl={p.photo_url} size={96} />
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">{p.name}</h2>
          {p.party && (
            <div className="text-sm font-medium mt-1" style={{ color: p.party.color_hex }}>
              {p.party.name} ({p.party.abbr})
            </div>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col gap-3 text-sm flex-1">
        {p.mandate_start && (
          <div className="flex justify-between">
            <span className="text-gray-500">Mandato</span>
            <span className="font-medium">{formatMandate(p.mandate_start, p.mandate_end)}</span>
          </div>
        )}
        {p.position && (
          <div className="flex justify-between">
            <span className="text-gray-500">Esfera</span>
            <span className="font-medium capitalize">{p.position.level === 'federal' ? 'Federal' : p.position.level === 'state' ? 'Estadual' : 'Municipal'}</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <Link
          href={`/politico/${p.slug}`}
          className="block w-full text-center bg-[#009c3b] text-white rounded-lg py-2 text-sm font-semibold hover:bg-[#007a30] transition-colors"
        >
          Ver perfil completo →
        </Link>
      </div>
    </aside>
  )
}
```

Add to `src/app/globals.css`:
```css
@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.animate-slide-in-right {
  animation: slide-in-right 0.2s ease-out;
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm run test:run -- src/tests/components/organogram/PoliticianPanel.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/organogram/PoliticianPanel.tsx src/tests/components/organogram/PoliticianPanel.test.tsx src/app/globals.css
git commit -m "feat: PoliticianPanel slide-in component"
```

---

## Task 14: Organogram Canvas (React Flow)

**Files:**
- Create: `src/components/organogram/Organogram.tsx`
- Create: `src/tests/components/organogram/Organogram.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/tests/components/organogram/Organogram.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { Organogram } from '@/components/organogram/Organogram'
import type { OrganogramData } from '@/types'

const mockData: OrganogramData = {
  state: { id: 32, name: 'Espírito Santo', slug: 'espirito-santo', abbr: 'ES', ibge_code: 32 },
  municipality: { id: 1, name: 'Vitória', slug: 'vitoria', state_id: 32, ibge_code: 3205309, population: 365855 },
  federal: {
    executive: [{ id: 1, name: 'Lula', slug: 'lula', photo_url: null, party_id: null, position_id: 1, mandate_start: '2023-01-01', mandate_end: '2026-12-31', state_id: null, municipality_id: null, external_id: null, source: null, position: { id: 1, name: 'Presidente', slug: 'presidente', level: 'federal', branch: 'executive', description: null } }],
    legislative: { camara: [], senado: [] },
  },
  estadual: { executive: [], legislative: [] },
  municipal: { executive: [], legislative: [] },
}

describe('Organogram', () => {
  it('renders federal level label', () => {
    render(<Organogram data={mockData} />)
    expect(screen.getByText(/Federal/i)).toBeInTheDocument()
  })
  it('renders estadual level label', () => {
    render(<Organogram data={mockData} />)
    expect(screen.getByText(/Estadual/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test:run -- src/tests/components/organogram/Organogram.test.tsx
```

- [ ] **Step 3: Implement Organogram**

Create `src/components/organogram/Organogram.tsx`:
```typescript
'use client'
import { useState, useCallback } from 'react'
import ReactFlow, { Background, Controls, type Node, type Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { PoliticianNode } from './nodes/PoliticianNode'
import { GroupNode } from './nodes/GroupNode'
import { PoliticianPanel } from './PoliticianPanel'
import type { OrganogramData, Politician } from '@/types'

const COLORS = {
  federal: '#2255aa',
  estadual: '#007a30',
  municipal: '#cc9900',
}

const NODE_TYPES = { politician: PoliticianNode, group: GroupNode }

interface OrganogramProps {
  data: OrganogramData
}

export function Organogram({ data }: OrganogramProps) {
  const [selected, setSelected] = useState<Politician | null>(null)

  const handleSelect = useCallback((p: Politician) => setSelected(p), [])

  const nodes: Node[] = []
  const edges: Edge[] = []
  let yOffset = 0
  const X_CENTER = 400
  const Y_GAP = 220

  // Helper to add a level section
  function addLevel(
    levelKey: 'federal' | 'estadual' | 'municipal',
    label: string,
    execPoliticians: Politician[],
    legPoliticians: Politician[],
    legLabel: string,
    extraLeg?: { politicians: Politician[]; label: string }
  ) {
    const color = COLORS[levelKey]
    const labelNodeId = `label-${levelKey}`

    nodes.push({
      id: labelNodeId,
      type: 'default',
      position: { x: 0, y: yOffset },
      data: { label },
      style: { background: color, color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 11, fontWeight: 700 },
      draggable: false,
    })

    yOffset += 50

    // Executivo
    if (execPoliticians.length === 1) {
      const nodeId = `exec-${levelKey}`
      nodes.push({
        id: nodeId,
        type: 'politician',
        position: { x: X_CENTER - 340, y: yOffset },
        data: { politician: execPoliticians[0], borderColor: color, onSelect: handleSelect },
        draggable: false,
      })
      edges.push({ id: `e-${labelNodeId}-${nodeId}`, source: labelNodeId, target: nodeId, style: { stroke: color, opacity: 0.3 } })
    }

    // Legislativo principal
    if (legPoliticians.length > 0) {
      const nodeId = `leg-${levelKey}-main`
      nodes.push({
        id: nodeId,
        type: 'group',
        position: { x: X_CENTER - 100, y: yOffset },
        data: { politicians: legPoliticians, label: legLabel, borderColor: color, onSelect: handleSelect },
        draggable: false,
      })
      edges.push({ id: `e-${labelNodeId}-${nodeId}`, source: labelNodeId, target: nodeId, style: { stroke: color, opacity: 0.3 } })
    }

    // Extra legislativo (senado)
    if (extraLeg && extraLeg.politicians.length > 0) {
      const nodeId = `leg-${levelKey}-extra`
      nodes.push({
        id: nodeId,
        type: 'group',
        position: { x: X_CENTER + 300, y: yOffset },
        data: { politicians: extraLeg.politicians, label: extraLeg.label, borderColor: color, onSelect: handleSelect },
        draggable: false,
      })
      edges.push({ id: `e-${labelNodeId}-${nodeId}`, source: labelNodeId, target: nodeId, style: { stroke: color, opacity: 0.3 } })
    }

    yOffset += Y_GAP
  }

  addLevel('federal', 'Federal', data.federal.executive, data.federal.legislative.camara, 'Dep. Federais', { politicians: data.federal.legislative.senado, label: 'Senadores' })
  addLevel('estadual', `Estadual · ${data.state.abbr}`, data.estadual.executive, data.estadual.legislative, 'Dep. Estaduais')
  if (data.municipal) {
    addLevel('municipal', `Municipal · ${data.municipality?.name}`, data.municipal.executive, data.municipal.legislative, 'Vereadores')
  }

  return (
    <div className="w-full" style={{ height: yOffset + 100 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-[#f9f9f7]"
      >
        <Background />
        <Controls />
      </ReactFlow>

      {selected && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelected(null)} />
          <PoliticianPanel politician={selected} onClose={() => setSelected(null)} />
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm run test:run -- src/tests/components/organogram/Organogram.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/organogram/Organogram.tsx src/tests/components/organogram/Organogram.test.tsx
git commit -m "feat: Organogram React Flow canvas with 3-level hierarchy"
```

---

## Task 15: Breadcrumb + Municipality Page

**Files:**
- Create: `src/components/ui/Breadcrumb.tsx`
- Create: `src/app/[estado]/[municipio]/page.tsx`

- [ ] **Step 1: Create Breadcrumb**

Create `src/components/ui/Breadcrumb.tsx`:
```typescript
import Link from 'next/link'

interface BreadcrumbItem { label: string; href?: string }

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Navegação">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-gray-300">›</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-[#009c3b] transition-colors font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-semibold">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
```

- [ ] **Step 2: Create municipality organogram page**

Create `src/app/[estado]/[municipio]/page.tsx`:
```typescript
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getOrganogramData } from '@/lib/supabase/queries'
import { Organogram } from '@/components/organogram/Organogram'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

interface PageProps {
  params: { estado: string; municipio: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getOrganogramData(params.estado, params.municipio)
  if (!data) return {}
  const name = data.municipality?.name ?? data.state.name
  return {
    title: `${name} — Aprenda Política`,
    description: `Organograma político de ${name}: prefeito, vereadores, governador, deputados e senadores.`,
  }
}

export default async function MunicipioPage({ params }: PageProps) {
  const data = await getOrganogramData(params.estado, params.municipio)
  if (!data) notFound()

  const municipioName = data.municipality?.name ?? data.state.name

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: '🇧🇷 Brasil', href: '/' },
          { label: data.state.name, href: `/${params.estado}` },
          { label: municipioName },
        ]} />

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{municipioName}</h1>
          <p className="text-gray-500 mt-1">
            Organograma político — poder executivo e legislativo
          </p>
        </div>

        <Organogram data={data} />
      </div>
    </main>
  )
}

export const revalidate = 86400 // 24h ISR
```

- [ ] **Step 3: Test in browser**

```bash
npm run dev
```

Open http://localhost:3000/espirito-santo/vitoria

Expected: Page loads with organogram showing federal, estadual, and municipal levels with politician cards and photos.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Breadcrumb.tsx src/app/
git commit -m "feat: municipality organogram page with ISR"
```

---

## Task 16: Search API + SearchBar Component

**Files:**
- Create: `src/app/api/search/route.ts`
- Create: `src/components/search/SearchBar.tsx`

- [ ] **Step 1: Create search API route**

Create `src/app/api/search/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { searchPoliticsEntities } from '@/lib/supabase/queries'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (q.trim().length < 2) {
    return NextResponse.json([])
  }
  const results = await searchPoliticsEntities(q)
  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}
```

- [ ] **Step 2: Create SearchBar component**

Create `src/components/search/SearchBar.tsx`:
```typescript
'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { SearchResult } from '@/types'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const router = useRouter()

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setOpen(false); return }

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data: SearchResult[] = await res.json()
        setResults(data)
        setOpen(data.length > 0)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutRef.current)
  }, [query])

  function handleSelect(result: SearchResult) {
    setOpen(false)
    setQuery('')
    router.push(result.href)
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-[#009c3b] focus-within:ring-1 focus-within:ring-[#009c3b]">
        <span className="text-gray-400">🔍</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sua cidade, estado ou político..."
          className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
          aria-label="Buscar município ou político"
          autoComplete="off"
        />
        {loading && <span className="text-gray-400 text-xs">...</span>}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
          {results.map((r) => (
            <li key={r.href}>
              <button
                onClick={() => handleSelect(r)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <span className="text-lg">{r.type === 'municipality' ? '🏙' : '👤'}</span>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.subtitle}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Test search in browser**

With dev server running, open http://localhost:3000/api/search?q=vit

Expected: JSON array with Vitória as a result.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/search/ src/components/search/
git commit -m "feat: search API route + SearchBar with debounce"
```

---

## Task 17: Leaflet Map (Brazil)

**Files:**
- Create: `src/components/map/LeafletMapClient.tsx`
- Create: `src/components/map/BrazilMap.tsx`

- [ ] **Step 1: Create Leaflet client component**

Create `src/components/map/LeafletMapClient.tsx`:
```typescript
'use client'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { PathOptions } from 'leaflet'

interface BrazilMapClientProps {
  onStateClick: (stateSlug: string, stateAbbr: string) => void
}

export default function LeafletMapClient({ onStateClick }: BrazilMapClientProps) {
  useEffect(() => {
    // Fix Leaflet default icon paths in Next.js
    // @ts-ignore
    delete (window as any).L?.Icon?.Default?.prototype?._getIconUrl
  }, [])

  const stateStyle: PathOptions = {
    fillColor: '#009c3b',
    fillOpacity: 0.08,
    color: '#009c3b',
    weight: 1,
  }

  const hoverStyle: PathOptions = {
    fillOpacity: 0.2,
    weight: 2,
  }

  function onEachFeature(feature: any, layer: any) {
    layer.on({
      mouseover: (e: any) => e.target.setStyle(hoverStyle),
      mouseout: (e: any) => e.target.setStyle(stateStyle),
      click: () => {
        const abbr: string = feature.properties.sigla
        const slug = feature.properties.nome
          .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '-')
        onStateClick(slug, abbr)
      },
    })
    layer.bindTooltip(feature.properties.nome, { permanent: false, direction: 'center', className: 'leaflet-state-tooltip' })
  }

  return (
    <MapContainer
      center={[-14.235, -51.925]}
      zoom={4}
      scrollWheelZoom={false}
      style={{ height: '400px', width: '100%', borderRadius: '12px' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        opacity={0.3}
      />
      <BrazilGeoJSON onEachFeature={onEachFeature} style={() => stateStyle} />
    </MapContainer>
  )
}

function BrazilGeoJSON({ onEachFeature, style }: any) {
  const [geoData, setGeoData] = useState<any>(null)

  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=minima&divisao=UF')
      .then((r) => r.json())
      .then(setGeoData)
  }, [])

  if (!geoData) return null
  return <GeoJSON data={geoData} onEachFeature={onEachFeature} style={style} />
}
```

- [ ] **Step 2: Create dynamic-import wrapper**

Create `src/components/map/BrazilMap.tsx`:
```typescript
'use client'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const LeafletMapClient = dynamic(() => import('./LeafletMapClient'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
      Carregando mapa...
    </div>
  ),
})

export function BrazilMap() {
  const router = useRouter()

  function handleStateClick(stateSlug: string) {
    router.push(`/${stateSlug}`)
  }

  return <LeafletMapClient onStateClick={handleStateClick} />
}
```

- [ ] **Step 3: Test map in browser**

```bash
npm run dev
```

Open http://localhost:3000 (after adding BrazilMap to home page in next task). Map should render Brazil with clickable states.

- [ ] **Step 4: Commit**

```bash
git add src/components/map/
git commit -m "feat: Leaflet Brazil map with state click navigation"
```

---

## Task 18: Home Page + State Page

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/[estado]/page.tsx`

- [ ] **Step 1: Build home page**

Replace `src/app/page.tsx`:
```typescript
import { SearchBar } from '@/components/search/SearchBar'
import { BrazilMap } from '@/components/map/BrazilMap'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <div>
            <span className="text-xl font-bold text-gray-900">Aprenda Política</span>
            <div className="w-6 h-0.5 bg-[#009c3b] mt-0.5" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16 flex flex-col items-center text-center gap-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
          Entenda o poder<br />
          <span className="text-[#009c3b]">na sua cidade.</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-md">
          Dados reais. Linguagem simples. Do presidente ao vereador.
        </p>
        <SearchBar />
      </section>

      {/* Map */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Ou clique no mapa para explorar por estado
        </h2>
        <BrazilMap />
      </section>
    </main>
  )
}
```

- [ ] **Step 2: Create state page**

Create `src/app/[estado]/page.tsx`:
```typescript
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

interface PageProps { params: { estado: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: `${params.estado.replace(/-/g, ' ')} — Aprenda Política` }
}

export default async function EstadoPage({ params }: PageProps) {
  const supabase = createServerSupabaseClient()

  const { data: state } = await supabase
    .from('states').select('*').eq('slug', params.estado).single()
  if (!state) notFound()

  const { data: municipalities } = await supabase
    .from('municipalities')
    .select('name, slug')
    .eq('state_id', state.id)
    .order('name')

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: '🇧🇷 Brasil', href: '/' },
          { label: state.name },
        ]} />

        <h1 className="text-3xl font-bold mb-2">{state.name}</h1>
        <p className="text-gray-500 mb-8">
          Selecione um município para ver o organograma político completo.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {(municipalities ?? []).map((m) => (
            <Link
              key={m.slug}
              href={`/${params.estado}/${m.slug}`}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#009c3b] hover:text-[#009c3b] transition-colors"
            >
              {m.name}
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

export const revalidate = 86400
```

- [ ] **Step 3: Test in browser**

```bash
npm run dev
```

- Open http://localhost:3000 — verify hero, search bar, and map render
- Click ES on map — should navigate to `/espirito-santo`
- Click a municipality — should show organogram

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/[estado]/page.tsx
git commit -m "feat: home page with search + map, state listing page"
```

---

## Task 19: Politician Profile Page

**Files:**
- Create: `src/app/politico/[slug]/page.tsx`

- [ ] **Step 1: Create politician profile page**

Create `src/app/politico/[slug]/page.tsx`:
```typescript
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { formatMandate } from '@/lib/utils'
import type { Politician } from '@/types'

interface PageProps { params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('politicians').select('name, position:positions(name)').eq('slug', params.slug).single()
  if (!data) return {}
  const pos = data.position as any
  return { title: `${data.name} — ${pos?.name ?? ''} — Aprenda Política` }
}

export default async function PoliticoPage({ params }: PageProps) {
  const supabase = createServerSupabaseClient()
  const { data: p } = await supabase
    .from('politicians')
    .select('*, party:parties(*), position:positions(*), state:states(*), municipality:municipalities(*)')
    .eq('slug', params.slug)
    .single()

  if (!p) notFound()
  const politician = p as Politician

  const stateHref = politician.state ? `/${politician.state.slug}` : '/'
  const muniHref = politician.state && politician.municipality
    ? `/${politician.state.slug}/${politician.municipality.slug}`
    : stateHref

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: '🇧🇷 Brasil', href: '/' },
          ...(politician.state ? [{ label: politician.state.name, href: stateHref }] : []),
          ...(politician.municipality ? [{ label: politician.municipality.name, href: muniHref }] : []),
          { label: politician.name },
        ]} />

        <div className="flex flex-col sm:flex-row gap-6 items-start mt-4">
          <Avatar name={politician.name} photoUrl={politician.photo_url} size={120} />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{politician.name}</h1>
            {politician.position && (
              <div className="text-lg text-gray-600 mt-1">{politician.position.name}</div>
            )}
            {politician.party && (
              <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold"
                style={{ background: `${politician.party.color_hex}22`, color: politician.party.color_hex }}>
                {politician.party.name} ({politician.party.abbr})
              </div>
            )}
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-4">
          {politician.mandate_start && (
            <div className="bg-gray-50 rounded-lg p-4">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mandato</dt>
              <dd className="text-lg font-bold mt-1">{formatMandate(politician.mandate_start, politician.mandate_end)}</dd>
            </div>
          )}
          {politician.state && (
            <div className="bg-gray-50 rounded-lg p-4">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</dt>
              <dd className="text-lg font-bold mt-1">{politician.state.name}</dd>
            </div>
          )}
          {politician.position && (
            <div className="bg-gray-50 rounded-lg p-4">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Esfera</dt>
              <dd className="text-lg font-bold mt-1 capitalize">
                {politician.position.level === 'federal' ? 'Federal' : politician.position.level === 'state' ? 'Estadual' : 'Municipal'}
              </dd>
            </div>
          )}
          {politician.municipality && (
            <div className="bg-gray-50 rounded-lg p-4">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Município</dt>
              <dd className="text-lg font-bold mt-1">{politician.municipality.name}</dd>
            </div>
          )}
        </dl>
      </div>
    </main>
  )
}

export const revalidate = 86400
```

- [ ] **Step 2: Test in browser**

With dev server running, navigate to a politician's profile via the organogram panel. Verify photo, party, mandate, and breadcrumb render correctly.

- [ ] **Step 3: Commit**

```bash
git add src/app/politico/
git commit -m "feat: politician profile page"
```

---

## Task 20: PWA Manifest + Static Generation

**Files:**
- Create: `public/manifest.json`
- Modify: `src/app/[estado]/[municipio]/page.tsx` (add `generateStaticParams`)

- [ ] **Step 1: Create PWA manifest**

Create `public/manifest.json`:
```json
{
  "name": "Aprenda Política",
  "short_name": "AprendaPolítica",
  "description": "Entenda quem governa o Brasil. Dados reais. Linguagem simples.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#009c3b",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Create simple placeholder icons (replace with real icons later):
```bash
# Create a simple green square icon as placeholder
node -e "
const { createCanvas } = require('canvas') || {};
" 2>/dev/null || echo "Install canvas or create icons manually in public/"
```

> **Note:** Create 192×192 and 512×512 PNG icons at `public/icon-192.png` and `public/icon-512.png` using any image editor. Use the green (#009c3b) brand color.

- [ ] **Step 2: Add generateStaticParams for ES municipalities**

Add to `src/app/[estado]/[municipio]/page.tsx`:
```typescript
export async function generateStaticParams() {
  // generateStaticParams runs at build time — use service role client (no cookies needed)
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // For initial deploy: generate only ES. Remove .eq('abbr','ES') to generate all 5,570.
  const { data: states } = await supabase
    .from('states').select('id, slug').eq('abbr', 'ES')

  const params: { estado: string; municipio: string }[] = []

  for (const state of states ?? []) {
    const { data: municipalities } = await supabase
      .from('municipalities')
      .select('slug')
      .eq('state_id', state.id)

    for (const m of municipalities ?? []) {
      params.push({ estado: state.slug, municipio: m.slug })
    }
  }

  return params
}
```

- [ ] **Step 3: Configure Vercel cron**

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/sync",
      "schedule": "0 2 * * *"
    }
  ]
}
```

The cron fires at 02:00 UTC daily. The route checks `x-cron-secret` — Vercel passes it via `CRON_SECRET` env var. Add `CRON_SECRET` to Vercel project settings.

- [ ] **Step 4: Run full test suite**

```bash
npm run test:run
```

Expected: All tests PASS.

- [ ] **Step 5: Build check**

```bash
npm run build
```

Expected: Build succeeds. Check that static pages for ES municipalities are generated.

- [ ] **Step 6: Commit**

```bash
git add public/manifest.json vercel.json src/app/[estado]/[municipio]/page.tsx
git commit -m "feat: PWA manifest, generateStaticParams for ES, Vercel cron config"
```

---

## Task 21: SEO — Metadata + Schema.org + Sitemap

**Files:**
- Create: `src/app/sitemap.ts`
- Modify: `src/app/[estado]/[municipio]/page.tsx` (add JSON-LD)

- [ ] **Step 1: Add Schema.org JSON-LD to municipality page**

Add to the municipality page `<main>` element, after the `<Breadcrumb>`:
```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'GovernmentOrganization',
  name: municipioName,
  description: `Organograma político de ${municipioName}`,
  url: `https://aprendapolitica.com.br/${params.estado}/${params.municipio}`,
}
```

Inside the JSX, before `</main>`:
```typescript
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

- [ ] **Step 2: Create sitemap**

Create `src/app/sitemap.ts`:
```typescript
import type { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabaseClient()
  const BASE = 'https://aprendapolitica.com.br'

  const { data: municipalities } = await supabase
    .from('municipalities')
    .select('slug, state:states(slug), updated_at')

  const municipalityUrls: MetadataRoute.Sitemap = (municipalities ?? []).map((m) => ({
    url: `${BASE}/${(m.state as any)?.slug}/${m.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...municipalityUrls,
  ]
}
```

- [ ] **Step 3: Verify sitemap and JSON-LD**

```bash
npm run dev
```

- Open http://localhost:3000/sitemap.xml — verify XML with municipality URLs
- Open http://localhost:3000/espirito-santo/vitoria — inspect page source for `application/ld+json` script

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/[estado]/[municipio]/page.tsx
git commit -m "feat: sitemap + Schema.org JSON-LD for municipality pages"
```

---

## Task 22: Deploy to Vercel

- [ ] **Step 1: Create Vercel project**

```bash
npm install -g vercel
vercel login
vercel link
```

- [ ] **Step 2: Set environment variables in Vercel**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
vercel env add CRON_SECRET production
```

- [ ] **Step 3: Deploy**

```bash
vercel --prod
```

Expected: Build succeeds, site live at `*.vercel.app`.

- [ ] **Step 4: Trigger initial data sync on production**

```bash
PROD_URL=https://your-app.vercel.app
CRON_SECRET=your-secret
curl -X POST "$PROD_URL/api/sync" -H "x-cron-secret: $CRON_SECRET"
```

Expected: `{"ok":true,"results":{...}}` — politicians loaded into production DB.

- [ ] **Step 5: Verify production**

- Open `https://your-app.vercel.app/espirito-santo/vitoria`
- Verify organogram renders with real politician data and photos
- Run Lighthouse: PWA score > 90, Performance > 85

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "chore: production deploy configuration"
```

---

## Verification Checklist

After all tasks complete, verify end-to-end:

- [ ] `/espirito-santo/vitoria` renders 3-level organogram (Federal, Estadual, Municipal)
- [ ] Politician photos load (lazy) for all 26+ vereadores, 30+ deputados estaduais, 10+ deputados federais, 3 senadores
- [ ] Click on politician → panel slides in with name, party, mandate, "Ver perfil" link
- [ ] `/politico/[slug]` page renders full profile
- [ ] Search "Vitória" returns municipality result → redirects to organogram page
- [ ] Brazil map renders → click ES → `/espirito-santo` → municipality list → organogram
- [ ] `npm run test:run` → all tests PASS
- [ ] `npm run build` → build succeeds, no TypeScript errors
- [ ] Lighthouse PWA score ≥ 90, Performance ≥ 85
- [ ] `generateStaticParams` generates all ES municipality pages at build time
- [ ] Sitemap at `/sitemap.xml` lists all municipality URLs
- [ ] Schema.org `GovernmentOrganization` JSON-LD present on organogram pages
