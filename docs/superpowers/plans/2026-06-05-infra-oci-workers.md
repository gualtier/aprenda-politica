# Infraestrutura OCI + Pipeline Nacional de Sync — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar o repositório `aprenda-politica-workers` com Docker Compose rodando no OCI: sync TSE nacional (27 estados), fotos para OCI Object Storage, scheduler com BullMQ, e deploy automático via GitHub Actions + SSH.

**Architecture:** npm workspaces monorepo com cinco packages (shared, sync-worker, photo-worker, news-worker, scheduler). Redis + BullMQ para fila de jobs. Docker Compose para orquestração local e no OCI. GitHub Actions faz SSH no OCI e executa `docker compose up --build` a cada push em `main`. O `aprenda-politica` (Next.js) recebe um endpoint `/api/revalidate` que os workers chamam após sync.

**Tech Stack:** Node.js 20 · TypeScript · npm workspaces · BullMQ · IORedis · @aws-sdk/client-s3 (OCI S3-compat) · fflate · node-cron · @bull-board/express · Docker Compose · GitHub Actions

---

## Mapa de arquivos

### Novo repositório: `aprenda-politica-workers/`

```
package.json                         workspace root
tsconfig.base.json                   TS config base
.gitignore
.env.example
docker-compose.yml                   dev stack
docker-compose.prod.yml              prod overrides (restart policies)
packages/
  shared/
    package.json
    tsconfig.json
    src/
      index.ts                       re-exports tudo
      supabase.ts                    createServiceClient()
      queue.ts                       queues, job types, connection
      oci-storage.ts                 uploadPhoto(), photoExists(), getPhotoUrl()
      utils.ts                       slugify() — copiado de aprenda-politica
  sync-worker/
    package.json
    tsconfig.json
    Dockerfile
    src/
      index.ts                       BullMQ Worker (sync queue)
      tse.ts                         syncTSEBrazil/State/Federal — adaptado
      camara.ts                      syncDeputadosFederais — adaptado
      senado.ts                      syncSenadores — adaptado
  photo-worker/
    package.json
    tsconfig.json
    Dockerfile
    src/
      index.ts                       BullMQ Worker (photos queue)
      tse-photos.ts                  downloadPhotoZip(), extractAndUpload()
  news-worker/
    package.json
    tsconfig.json
    Dockerfile
    src/
      index.ts                       stub — loga e completa job
  scheduler/
    package.json
    tsconfig.json
    Dockerfile
    src/
      index.ts                       inicia cron + bull-board + revalidate worker
      cron.ts                        schedules BullMQ jobs
.github/workflows/deploy.yml
scripts/setup-oci.sh
```

### Modificações em `aprenda-politica/` (repo existente)

```
src/app/api/revalidate/route.ts      NOVO — endpoint chamado pelos workers
.gitignore                           MODIFICAR — adicionar .superpowers/
```

---

## Task 1: Inicializar monorepo

**Files:**
- Create: `aprenda-politica-workers/package.json`
- Create: `aprenda-politica-workers/tsconfig.base.json`
- Create: `aprenda-politica-workers/.gitignore`
- Create: `aprenda-politica-workers/.env.example`

- [ ] **Step 1: Criar diretório e inicializar git**

```bash
mkdir ~/Apps/aprenda-politica-workers
cd ~/Apps/aprenda-politica-workers
git init
```

- [ ] **Step 2: Criar `package.json` raiz**

```json
{
  "name": "aprenda-politica-workers",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "tsx": "^4.15.7",
    "vitest": "^1.6.0",
    "@types/node": "^20.14.2"
  }
}
```

- [ ] **Step 3: Criar `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

- [ ] **Step 4: Criar `.gitignore`**

```
node_modules/
dist/
.env
*.env.local
```

- [ ] **Step 5: Criar `.env.example`**

```env
# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=

# OCI Object Storage (S3-compatible)
OCI_NAMESPACE=
OCI_BUCKET=politician-photos
OCI_REGION=sa-saopaulo-1
OCI_ACCESS_KEY_ID=
OCI_SECRET_ACCESS_KEY=

# URL pública das fotos (via Cloudflare ou direto OCI)
PHOTOS_BASE_URL=https://objectstorage.sa-saopaulo-1.oraclecloud.com/n/{OCI_NAMESPACE}/b/politician-photos/o

# Vercel revalidation
VERCEL_REVALIDATE_URL=https://aprendapolitica.com.br/api/revalidate
REVALIDATE_SECRET=

# Bull Board
BULL_BOARD_USER=admin
BULL_BOARD_PASSWORD=

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
```

- [ ] **Step 6: Instalar devDependências e commit inicial**

```bash
npm install
git add .
git commit -m "chore: initialize workers monorepo"
```

Expected: `node_modules/` criado, `package-lock.json` gerado.

---

## Task 2: Package `shared` — Supabase + BullMQ queues

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/supabase.ts`
- Create: `packages/shared/src/queue.ts`
- Create: `packages/shared/src/utils.ts`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Criar `packages/shared/package.json`**

```json
{
  "name": "@aprenda-politica/shared",
  "version": "1.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "dependencies": {
    "@supabase/supabase-js": "^2.107.0",
    "bullmq": "^5.12.0",
    "ioredis": "^5.3.2",
    "@aws-sdk/client-s3": "^3.600.0"
  }
}
```

- [ ] **Step 2: Criar `packages/shared/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Criar `packages/shared/src/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

export function createServiceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  return createClient(url, key)
}
```

- [ ] **Step 4: Criar `packages/shared/src/queue.ts`**

```typescript
import { Queue } from 'bullmq'
import IORedis from 'ioredis'

export const connection = new IORedis({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
  maxRetriesPerRequest: null,
})

// ── Job type definitions ───────────────────────────────────────────────────────

export type SyncJob =
  | { type: 'sync-tse-state'; uf: string }
  | { type: 'sync-federal' }
  | { type: 'sync-camara'; uf: string }
  | { type: 'sync-senado'; uf: string }

export type PhotoJob = {
  uf: string
  year: 2022 | 2024
}

export type RevalidateJob = {
  paths: string[]
}

export type NewsJob = {
  municipalitySlug: string
}

// ── Queue instances ────────────────────────────────────────────────────────────

export const syncQueue     = new Queue<SyncJob>('sync',       { connection })
export const photosQueue   = new Queue<PhotoJob>('photos',    { connection })
export const revalidateQueue = new Queue<RevalidateJob>('revalidate', { connection })
export const newsQueue     = new Queue<NewsJob>('news',       { connection })
```

- [ ] **Step 5: Criar `packages/shared/src/utils.ts`**

```typescript
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
```

- [ ] **Step 6: Criar `packages/shared/src/index.ts`**

```typescript
export * from './supabase.js'
export * from './queue.js'
export * from './utils.js'
export * from './oci-storage.js'
```

- [ ] **Step 7: Instalar dependências e commit**

```bash
npm install
git add packages/shared
git commit -m "feat: shared package — supabase client, bullmq queues, utils"
```

---

## Task 3: Package `shared` — OCI Storage client (com teste)

**Files:**
- Create: `packages/shared/src/oci-storage.ts`
- Create: `packages/shared/src/oci-storage.test.ts`

- [ ] **Step 1: Criar `packages/shared/src/oci-storage.ts`**

```typescript
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

function getClient(): S3Client {
  const namespace = process.env.OCI_NAMESPACE
  const region    = process.env.OCI_REGION ?? 'sa-saopaulo-1'
  if (!namespace) throw new Error('OCI_NAMESPACE is required')

  return new S3Client({
    region,
    endpoint: `https://${namespace}.compat.objectstorage.${region}.oraclecloud.com`,
    credentials: {
      accessKeyId:     process.env.OCI_ACCESS_KEY_ID!,
      secretAccessKey: process.env.OCI_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  })
}

const BUCKET = () => process.env.OCI_BUCKET ?? 'politician-photos'

export function getPhotoUrl(uf: string, sqCandidato: string): string {
  const base = process.env.PHOTOS_BASE_URL ?? ''
  return `${base}/${uf.toLowerCase()}/${sqCandidato}.jpg`
}

export async function uploadPhoto(
  uf: string,
  sqCandidato: string,
  imageBuffer: Uint8Array
): Promise<string> {
  const key = `${uf.toLowerCase()}/${sqCandidato}.jpg`
  await getClient().send(new PutObjectCommand({
    Bucket: BUCKET(),
    Key: key,
    Body: imageBuffer,
    ContentType: 'image/jpeg',
    ACL: 'public-read',
  }))
  return getPhotoUrl(uf, sqCandidato)
}

export async function photoExists(uf: string, sqCandidato: string): Promise<boolean> {
  try {
    await getClient().send(new HeadObjectCommand({
      Bucket: BUCKET(),
      Key: `${uf.toLowerCase()}/${sqCandidato}.jpg`,
    }))
    return true
  } catch {
    return false
  }
}
```

- [ ] **Step 2: Criar `packages/shared/src/oci-storage.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPhotoUrl } from './oci-storage.js'

beforeEach(() => {
  process.env.PHOTOS_BASE_URL = 'https://fotos.aprendapolitica.com.br'
})

describe('getPhotoUrl', () => {
  it('generates correct URL for a politician', () => {
    const url = getPhotoUrl('ES', '80002264925')
    expect(url).toBe('https://fotos.aprendapolitica.com.br/es/80002264925.jpg')
  })

  it('lowercases the UF', () => {
    const url = getPhotoUrl('SP', '12345678')
    expect(url).toBe('https://fotos.aprendapolitica.com.br/sp/12345678.jpg')
  })
})
```

- [ ] **Step 3: Criar `vitest.config.ts` na raiz**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/*/src/**/*.test.ts'],
  },
})
```

- [ ] **Step 4: Rodar o teste**

```bash
npm test
```

Expected: `2 tests passed`

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/oci-storage.ts packages/shared/src/oci-storage.test.ts vitest.config.ts
git commit -m "feat: OCI Storage client with tests"
```

---

## Task 4: Package `sync-worker`

**Files:**
- Create: `packages/sync-worker/package.json`
- Create: `packages/sync-worker/tsconfig.json`
- Create: `packages/sync-worker/Dockerfile`
- Create: `packages/sync-worker/src/tse.ts`
- Create: `packages/sync-worker/src/camara.ts`
- Create: `packages/sync-worker/src/senado.ts`
- Create: `packages/sync-worker/src/index.ts`

- [ ] **Step 1: Criar `packages/sync-worker/package.json`**

```json
{
  "name": "@aprenda-politica/sync-worker",
  "version": "1.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "dependencies": {
    "@aprenda-politica/shared": "*",
    "fflate": "^0.8.3"
  }
}
```

- [ ] **Step 2: Criar `packages/sync-worker/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "outDir": "dist" },
  "include": ["src"]
}
```

- [ ] **Step 3: Criar `packages/sync-worker/src/tse.ts`**

Adaptar de `aprenda-politica/src/lib/sync/tse.ts`, substituindo `@/lib/utils` por `@aprenda-politica/shared` e `SupabaseClient` permanece o mesmo. Cole o conteúdo completo abaixo:

```typescript
import { unzipSync } from 'fflate'
import { slugify } from '@aprenda-politica/shared'
import type { SupabaseClient } from '@supabase/supabase-js'

const TSE_ZIP_2022 = 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2022.zip'
const TSE_ZIP_2024 = 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2024.zip'

const CARGO_TO_POSITION: Record<string, string> = {
  'PRESIDENTE': 'presidente',
  'PRESIDENTE DA REPÚBLICA': 'presidente',
  'GOVERNADOR': 'governador',
  'DEPUTADO ESTADUAL': 'deputado-estadual',
  'PREFEITO': 'prefeito',
  'VEREADOR': 'vereador',
}

const MANDATE: Record<string, { start: string; end: string }> = {
  'presidente':        { start: '2023-01-01', end: '2026-12-31' },
  'governador':        { start: '2023-01-01', end: '2026-12-31' },
  'deputado-estadual': { start: '2023-02-01', end: '2027-01-31' },
  'prefeito':          { start: '2025-01-01', end: '2028-12-31' },
  'vereador':          { start: '2025-01-01', end: '2028-12-31' },
}

const BATCH_SIZE = 500

let cache2022: Uint8Array | null = null
let cache2024: Uint8Array | null = null

async function getZip(year: 2022 | 2024): Promise<Uint8Array> {
  if (year === 2022 && cache2022) return cache2022
  if (year === 2024 && cache2024) return cache2024
  const url = year === 2022 ? TSE_ZIP_2022 : TSE_ZIP_2024
  console.log(`[tse] downloading ${year} ZIP...`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TSE ZIP ${year} failed: ${res.status}`)
  const buf = new Uint8Array(await res.arrayBuffer())
  if (year === 2022) cache2022 = buf
  else cache2024 = buf
  return buf
}

function parseCSV(buffer: Uint8Array): Record<string, string>[] {
  const text = new TextDecoder('iso-8859-1').decode(buffer)
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const parse = (l: string) => l.split(';').map(v => v.replace(/^"|"$/g, '').trim())
  const headers = parse(lines[0])
  return lines.slice(1).map(l => {
    const vals = parse(l)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = vals[i] ?? '' })
    return row
  })
}

function chunks<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
  return result
}

async function resolveParties(supabase: SupabaseClient, rows: Record<string, string>[]): Promise<Map<string, number>> {
  const parties = new Map<string, string>()
  for (const r of rows) {
    const abbr = r['SG_PARTIDO']?.trim()
    if (abbr && !parties.has(abbr)) parties.set(abbr, r['NM_PARTIDO']?.trim() ?? abbr)
  }
  if (parties.size === 0) return new Map()
  await supabase.from('parties').upsert(
    Array.from(parties.entries()).map(([abbr, name]) => ({ abbr, name, color_hex: '#888888' })),
    { onConflict: 'abbr', ignoreDuplicates: true }
  )
  const { data } = await supabase.from('parties').select('id, abbr').in('abbr', Array.from(parties.keys()))
  const map = new Map<string, number>()
  for (const p of data ?? []) map.set(p.abbr, p.id)
  return map
}

async function resolveMunicipalities(supabase: SupabaseClient, stateId: number): Promise<Map<string, number>> {
  const { data } = await supabase.from('municipalities').select('id, name').eq('state_id', stateId)
  const map = new Map<string, number>()
  for (const m of data ?? []) map.set(m.name.toUpperCase(), m.id)
  return map
}

export async function syncTSEState(
  supabase: SupabaseClient,
  uf: string,
  cargos: ('GOVERNADOR' | 'DEPUTADO ESTADUAL' | 'PREFEITO' | 'VEREADOR')[]
): Promise<number> {
  const { data: state } = await supabase.from('states').select('id').eq('abbr', uf).single()
  if (!state) throw new Error(`State not found: ${uf}`)

  const positionSlugs = Array.from(new Set(cargos.map(c => CARGO_TO_POSITION[c])))
  const { data: positions } = await supabase.from('positions').select('id, slug').in('slug', positionSlugs)
  const positionIds: Record<string, number> = {}
  for (const p of positions ?? []) positionIds[p.slug] = p.id

  const years = new Set(cargos.map(c => (c === 'PREFEITO' || c === 'VEREADOR') ? 2024 : 2022))
  const rowsByYear: Record<number, Record<string, string>[]> = {}
  for (const year of Array.from(years)) {
    const zipBuf = await getZip(year as 2022 | 2024)
    const files = unzipSync(zipBuf)
    const csvName = Object.keys(files).find(n => n.includes(`_${uf}.csv`))
    if (!csvName) throw new Error(`CSV for ${uf} not found in ${year} ZIP`)
    rowsByYear[year] = parseCSV(files[csvName])
  }

  const allElected: Record<string, string>[] = []
  for (const cargo of cargos) {
    const year = (cargo === 'PREFEITO' || cargo === 'VEREADOR') ? 2024 : 2022
    const elected = rowsByYear[year].filter(r =>
      r['DS_CARGO'] === cargo && r['DS_SIT_TOT_TURNO']?.startsWith('ELEITO')
    )
    console.log(`[tse] ${uf} ${cargo}: ${elected.length} eleitos`)
    allElected.push(...elected)
  }
  if (allElected.length === 0) return 0

  const partyMap = await resolveParties(supabase, allElected)
  const munMap = await resolveMunicipalities(supabase, state.id)

  const records = allElected.map(row => {
    const cargo = row['DS_CARGO']
    const positionSlug = CARGO_TO_POSITION[cargo]
    const positionId = positionIds[positionSlug]
    if (!positionId) return null
    const sqCandidato = row['SQ_CANDIDATO']?.trim()
    const name = (row['NM_CANDIDATO'] || row['NM_URNA_CANDIDATO'])?.trim()
    if (!name || !sqCandidato) return null
    const mandate = MANDATE[positionSlug]
    const isMunicipal = cargo === 'PREFEITO' || cargo === 'VEREADOR'
    return {
      name,
      slug: `${slugify(name)}-${uf.toLowerCase()}-${sqCandidato.slice(-6)}`,
      photo_url: null,
      party_id: partyMap.get(row['SG_PARTIDO']?.trim()) ?? null,
      position_id: positionId,
      state_id: state.id,
      municipality_id: isMunicipal ? (munMap.get(row['NM_UE']?.trim().toUpperCase()) ?? null) : null,
      external_id: sqCandidato,
      source: 'tse',
      mandate_start: mandate.start,
      mandate_end: mandate.end,
    }
  }).filter(Boolean) as object[]

  let upserted = 0
  for (const batch of chunks(records, BATCH_SIZE)) {
    const { error, count } = await supabase.from('politicians')
      .upsert(batch, { onConflict: 'slug', ignoreDuplicates: false })
      .select('id')
    if (error) console.error(`[tse] batch error (${uf}):`, error.message)
    else upserted += count ?? batch.length
  }
  return upserted
}

export async function syncTSEFederal(supabase: SupabaseClient): Promise<number> {
  const { data: position } = await supabase.from('positions').select('id').eq('slug', 'presidente').single()
  if (!position) throw new Error('Position "presidente" not found')
  const zipBuf = await getZip(2022)
  const files = unzipSync(zipBuf)
  const csvName = Object.keys(files).find(n => n.includes('_BR.csv'))
  if (!csvName) throw new Error('BR CSV not found in 2022 ZIP')
  const rows = parseCSV(files[csvName])
  const elected = rows.filter(r =>
    (r['DS_CARGO'] === 'PRESIDENTE' || r['DS_CARGO'] === 'PRESIDENTE DA REPÚBLICA') &&
    r['DS_SIT_TOT_TURNO']?.startsWith('ELEITO')
  )
  if (elected.length === 0) return 0
  const partyMap = await resolveParties(supabase, elected)
  const mandate = MANDATE['presidente']
  const records = elected.map(row => {
    const sqCandidato = row['SQ_CANDIDATO']?.trim()
    const name = (row['NM_CANDIDATO'] || row['NM_URNA_CANDIDATO'])?.trim()
    if (!name || !sqCandidato) return null
    return {
      name,
      slug: `${slugify(name)}-br-${sqCandidato.slice(-6)}`,
      photo_url: null,
      party_id: partyMap.get(row['SG_PARTIDO']?.trim()) ?? null,
      position_id: position.id,
      state_id: null, municipality_id: null,
      external_id: sqCandidato, source: 'tse',
      mandate_start: mandate.start, mandate_end: mandate.end,
    }
  }).filter(Boolean) as object[]
  const { error, count } = await supabase.from('politicians')
    .upsert(records, { onConflict: 'slug', ignoreDuplicates: false })
    .select('id')
  if (error) { console.error('[tse] federal error:', error.message); return 0 }
  return count ?? records.length
}

export const BRAZIL_UFS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA',
  'MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN',
  'RO','RR','RS','SC','SE','SP','TO',
]
```

- [ ] **Step 4: Criar `packages/sync-worker/src/camara.ts`**

Adaptar de `aprenda-politica/src/lib/sync/camara.ts` — substituir `import { slugify } from '@/lib/utils'` por `import { slugify } from '@aprenda-politica/shared'`. O resto do arquivo fica idêntico.

- [ ] **Step 5: Criar `packages/sync-worker/src/senado.ts`**

Adaptar de `aprenda-politica/src/lib/sync/senado.ts` — mesma substituição de import.

- [ ] **Step 6: Criar `packages/sync-worker/src/index.ts`**

```typescript
import 'dotenv/config'
import { Worker } from 'bullmq'
import { connection, revalidateQueue, type SyncJob, createServiceClient } from '@aprenda-politica/shared'
import { syncTSEState, syncTSEFederal } from './tse.js'
import { syncDeputadosFederais } from './camara.js'
import { syncSenadores } from './senado.js'

const worker = new Worker<SyncJob>('sync', async (job) => {
  const supabase = createServiceClient()
  const { type } = job.data

  if (type === 'sync-tse-state') {
    const { uf } = job.data as { type: 'sync-tse-state'; uf: string }
    await syncTSEState(supabase, uf, ['GOVERNADOR', 'DEPUTADO ESTADUAL', 'PREFEITO', 'VEREADOR'])
    await revalidateQueue.add('revalidate-after-sync', { paths: [`/${uf.toLowerCase()}`, '/politicos'] })

  } else if (type === 'sync-federal') {
    await syncTSEFederal(supabase)
    await revalidateQueue.add('revalidate-federal', { paths: ['/'] })

  } else if (type === 'sync-camara') {
    const { uf } = job.data as { type: 'sync-camara'; uf: string }
    await syncDeputadosFederais(supabase, uf)

  } else if (type === 'sync-senado') {
    const { uf } = job.data as { type: 'sync-senado'; uf: string }
    await syncSenadores(supabase, uf)
  }
}, {
  connection,
  concurrency: 2,
})

worker.on('completed', job => console.log(`[sync-worker] ✓ ${job.id} (${job.data.type})`))
worker.on('failed', (job, err) => console.error(`[sync-worker] ✗ ${job?.id}:`, err.message))

console.log('[sync-worker] listening on queue "sync"')
```

- [ ] **Step 7: Criar `packages/sync-worker/Dockerfile`**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/sync-worker/package.json packages/sync-worker/
RUN npm ci
COPY packages/shared/src packages/shared/src
COPY packages/sync-worker/src packages/sync-worker/src
CMD ["npx", "tsx", "packages/sync-worker/src/index.ts"]
```

- [ ] **Step 8: Instalar + commit**

```bash
npm install
git add packages/sync-worker
git commit -m "feat: sync-worker — TSE nacional, Câmara, Senado via BullMQ"
```

---

## Task 5: Package `photo-worker`

**Files:**
- Create: `packages/photo-worker/package.json`
- Create: `packages/photo-worker/tsconfig.json`
- Create: `packages/photo-worker/Dockerfile`
- Create: `packages/photo-worker/src/tse-photos.ts`
- Create: `packages/photo-worker/src/index.ts`

- [ ] **Step 1: Criar `packages/photo-worker/package.json`**

```json
{
  "name": "@aprenda-politica/photo-worker",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@aprenda-politica/shared": "*",
    "fflate": "^0.8.3"
  }
}
```

- [ ] **Step 2: Criar `packages/photo-worker/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "outDir": "dist" },
  "include": ["src"]
}
```

- [ ] **Step 3: Criar `packages/photo-worker/src/tse-photos.ts`**

```typescript
import { unzipSync } from 'fflate'
import { uploadPhoto, photoExists } from '@aprenda-politica/shared'
import type { SupabaseClient } from '@supabase/supabase-js'

// ZIPs de foto TSE: foto_cand{YEAR}_{UF}_div.zip
// Arquivo dentro do ZIP: F{UF_UPPER}{SQ_CANDIDATO}_div.jpg
function photoZipUrl(year: 2022 | 2024, uf: string): string {
  return `https://cdn.tse.jus.br/estatistica/sead/odsele/foto_cand/foto_cand${year}_${uf}_div.zip`
}

export async function processPhotosForState(
  supabase: SupabaseClient,
  uf: string,
  year: 2022 | 2024
): Promise<number> {
  // Busca políticos sem foto para este estado e ano de eleição
  const mandateStart = year === 2024 ? '2025-01-01' : '2023-01-01'
  const { data: politicians } = await supabase
    .from('politicians')
    .select('id, external_id, slug')
    .eq('state_id', (await supabase.from('states').select('id').eq('abbr', uf).single()).data?.id)
    .is('photo_url', null)
    .eq('mandate_start', mandateStart)
    .eq('source', 'tse')

  if (!politicians || politicians.length === 0) {
    console.log(`[photo-worker] ${uf} ${year}: no politicians without photos`)
    return 0
  }

  // Baixa o ZIP de fotos
  const url = photoZipUrl(year, uf)
  console.log(`[photo-worker] downloading ${url}...`)
  const res = await fetch(url)
  if (!res.ok) {
    console.warn(`[photo-worker] ZIP ${url} not found (${res.status})`)
    return 0
  }
  const zipBuf = new Uint8Array(await res.arrayBuffer())
  const files = unzipSync(zipBuf)

  let updated = 0
  for (const pol of politicians) {
    const sq = pol.external_id
    if (!sq) continue

    // Arquivo dentro do ZIP: FES80002264925_div.jpg
    const filename = `F${uf.toUpperCase()}${sq}_div.jpg`
    const imgData = files[filename]
    if (!imgData) continue

    try {
      const photoUrl = await uploadPhoto(uf, sq, imgData)
      await supabase.from('politicians').update({ photo_url: photoUrl }).eq('id', pol.id)
      updated++
    } catch (err: any) {
      console.warn(`[photo-worker] failed to upload ${sq}:`, err.message)
    }
  }

  console.log(`[photo-worker] ${uf} ${year}: ${updated}/${politicians.length} photos uploaded`)
  return updated
}
```

- [ ] **Step 4: Criar `packages/photo-worker/src/index.ts`**

```typescript
import 'dotenv/config'
import { Worker } from 'bullmq'
import { connection, type PhotoJob, createServiceClient } from '@aprenda-politica/shared'
import { processPhotosForState } from './tse-photos.js'

const worker = new Worker<PhotoJob>('photos', async (job) => {
  const supabase = createServiceClient()
  const { uf, year } = job.data
  await processPhotosForState(supabase, uf, year)
}, {
  connection,
  concurrency: 1, // um download de ZIP por vez para não sobrecarregar a rede
})

worker.on('completed', job => console.log(`[photo-worker] ✓ ${job.id} ${job.data.uf}/${job.data.year}`))
worker.on('failed', (job, err) => console.error(`[photo-worker] ✗ ${job?.id}:`, err.message))

console.log('[photo-worker] listening on queue "photos"')
```

- [ ] **Step 5: Criar `packages/photo-worker/Dockerfile`**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/photo-worker/package.json packages/photo-worker/
RUN npm ci
COPY packages/shared/src packages/shared/src
COPY packages/photo-worker/src packages/photo-worker/src
CMD ["npx", "tsx", "packages/photo-worker/src/index.ts"]
```

- [ ] **Step 6: Commit**

```bash
git add packages/photo-worker
git commit -m "feat: photo-worker — TSE ZIP download + OCI Storage upload"
```

---

## Task 6: Package `news-worker` (stub)

**Files:**
- Create: `packages/news-worker/package.json`
- Create: `packages/news-worker/tsconfig.json`
- Create: `packages/news-worker/Dockerfile`
- Create: `packages/news-worker/src/index.ts`

- [ ] **Step 1: Criar `packages/news-worker/package.json`**

```json
{
  "name": "@aprenda-politica/news-worker",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@aprenda-politica/shared": "*"
  }
}
```

- [ ] **Step 2: Criar `packages/news-worker/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "outDir": "dist" },
  "include": ["src"]
}
```

- [ ] **Step 3: Criar `packages/news-worker/src/index.ts`**

```typescript
import 'dotenv/config'
import { Worker } from 'bullmq'
import { connection, type NewsJob } from '@aprenda-politica/shared'

const worker = new Worker<NewsJob>('news', async (job) => {
  // Stub — implementado na fase de notícias
  console.log(`[news-worker] job received (stub): ${job.data.municipalitySlug}`)
}, {
  connection,
  concurrency: 3,
})

worker.on('failed', (job, err) => console.error(`[news-worker] ✗ ${job?.id}:`, err.message))
console.log('[news-worker] listening on queue "news" (stub)')
```

- [ ] **Step 4: Criar `packages/news-worker/Dockerfile`**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/news-worker/package.json packages/news-worker/
RUN npm ci
COPY packages/shared/src packages/shared/src
COPY packages/news-worker/src packages/news-worker/src
CMD ["npx", "tsx", "packages/news-worker/src/index.ts"]
```

- [ ] **Step 5: Commit**

```bash
git add packages/news-worker
git commit -m "feat: news-worker stub"
```

---

## Task 7: Package `scheduler` — cron + Bull Board + revalidate worker

**Files:**
- Create: `packages/scheduler/package.json`
- Create: `packages/scheduler/tsconfig.json`
- Create: `packages/scheduler/Dockerfile`
- Create: `packages/scheduler/src/cron.ts`
- Create: `packages/scheduler/src/index.ts`

- [ ] **Step 1: Criar `packages/scheduler/package.json`**

```json
{
  "name": "@aprenda-politica/scheduler",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@aprenda-politica/shared": "*",
    "node-cron": "^3.0.3",
    "@bull-board/api": "^5.20.0",
    "@bull-board/express": "^5.20.0",
    "express": "^4.19.2",
    "express-basic-auth": "^1.2.1",
    "@types/express": "^4.17.21",
    "@types/node-cron": "^3.0.11"
  }
}
```

- [ ] **Step 2: Criar `packages/scheduler/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "outDir": "dist" },
  "include": ["src"]
}
```

- [ ] **Step 3: Criar `packages/scheduler/src/cron.ts`**

```typescript
import cron from 'node-cron'
import { syncQueue, photosQueue } from '@aprenda-politica/shared'

export const BRAZIL_UFS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA',
  'MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN',
  'RO','RR','RS','SC','SE','SP','TO',
]

export function startCronJobs() {
  // Sync TSE nacional — domingos 02h00 BRT (05h00 UTC)
  cron.schedule('0 5 * * 0', async () => {
    console.log('[scheduler] Enqueueing TSE national sync...')
    await syncQueue.add('sync-federal', { type: 'sync-federal' }, { jobId: 'sync-federal' })
    for (const uf of BRAZIL_UFS) {
      await syncQueue.add(`sync-tse-${uf}`, { type: 'sync-tse-state', uf }, { jobId: `sync-tse-${uf}` })
    }
    console.log(`[scheduler] Enqueued ${BRAZIL_UFS.length + 1} sync jobs`)
  })

  // Sync Câmara + Senado — domingos 02h30 BRT (05h30 UTC)
  cron.schedule('30 5 * * 0', async () => {
    console.log('[scheduler] Enqueueing Câmara + Senado sync...')
    for (const uf of BRAZIL_UFS) {
      await syncQueue.add(`sync-camara-${uf}`, { type: 'sync-camara', uf }, { jobId: `sync-camara-${uf}` })
      await syncQueue.add(`sync-senado-${uf}`, { type: 'sync-senado', uf }, { jobId: `sync-senado-${uf}` })
    }
  })

  // Fotos — domingos 04h00 BRT (07h00 UTC)
  cron.schedule('0 7 * * 0', async () => {
    console.log('[scheduler] Enqueueing photo processing...')
    for (const uf of BRAZIL_UFS) {
      await photosQueue.add(`photos-2024-${uf}`, { uf, year: 2024 }, { jobId: `photos-2024-${uf}` })
      await photosQueue.add(`photos-2022-${uf}`, { uf, year: 2022 }, { jobId: `photos-2022-${uf}` })
    }
  })

  console.log('[scheduler] Cron jobs started (TSE Sun 02h, Câmara/Senado Sun 02h30, Photos Sun 04h BRT)')
}
```

- [ ] **Step 4: Criar `packages/scheduler/src/index.ts`**

```typescript
import 'dotenv/config'
import express from 'express'
import basicAuth from 'express-basic-auth'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js'
import { ExpressAdapter } from '@bull-board/express'
import { Worker } from 'bullmq'
import {
  connection, syncQueue, photosQueue, revalidateQueue, newsQueue,
  type RevalidateJob,
} from '@aprenda-politica/shared'
import { startCronJobs } from './cron.js'

// ── Revalidate worker (pequeno, vive aqui no scheduler) ───────────────────────

const revalidateWorker = new Worker<RevalidateJob>('revalidate', async (job) => {
  const url = process.env.VERCEL_REVALIDATE_URL
  const secret = process.env.REVALIDATE_SECRET
  if (!url || !secret) return

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
    body: JSON.stringify({ paths: job.data.paths }),
  })
  if (!res.ok) console.warn(`[revalidate] Vercel responded ${res.status}`)
  else console.log(`[revalidate] ✓ ${job.data.paths.join(', ')}`)
}, { connection, concurrency: 5 })

revalidateWorker.on('failed', (job, err) => console.error('[revalidate] ✗', err.message))

// ── Bull Board ────────────────────────────────────────────────────────────────

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/')

createBullBoard({
  queues: [
    new BullMQAdapter(syncQueue),
    new BullMQAdapter(photosQueue),
    new BullMQAdapter(revalidateQueue),
    new BullMQAdapter(newsQueue),
  ],
  serverAdapter,
})

const app = express()

app.use(
  '/',
  basicAuth({
    users: { [process.env.BULL_BOARD_USER ?? 'admin']: process.env.BULL_BOARD_PASSWORD ?? 'admin' },
    challenge: true,
  }),
  serverAdapter.getRouter()
)

app.listen(3001, '0.0.0.0', () => {
  console.log('[bull-board] running on http://localhost:3001')
})

// ── Cron ──────────────────────────────────────────────────────────────────────

startCronJobs()
```

- [ ] **Step 5: Criar `packages/scheduler/Dockerfile`**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/scheduler/package.json packages/scheduler/
RUN npm ci
COPY packages/shared/src packages/shared/src
COPY packages/scheduler/src packages/scheduler/src
CMD ["npx", "tsx", "packages/scheduler/src/index.ts"]
```

- [ ] **Step 6: Instalar + commit**

```bash
npm install
git add packages/scheduler
git commit -m "feat: scheduler — cron jobs + bull-board + revalidate worker"
```

---

## Task 8: Docker Compose

**Files:**
- Create: `docker-compose.yml`
- Create: `docker-compose.prod.yml`

- [ ] **Step 1: Criar `docker-compose.yml`**

```yaml
services:
  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 3s
      retries: 5

  sync-worker:
    build:
      context: .
      dockerfile: packages/sync-worker/Dockerfile
    env_file: .env
    depends_on:
      redis:
        condition: service_healthy

  photo-worker:
    build:
      context: .
      dockerfile: packages/photo-worker/Dockerfile
    env_file: .env
    depends_on:
      redis:
        condition: service_healthy

  news-worker:
    build:
      context: .
      dockerfile: packages/news-worker/Dockerfile
    env_file: .env
    depends_on:
      redis:
        condition: service_healthy

  scheduler:
    build:
      context: .
      dockerfile: packages/scheduler/Dockerfile
    ports:
      - '127.0.0.1:3001:3001'
    env_file: .env
    depends_on:
      redis:
        condition: service_healthy

volumes:
  redis-data:
```

- [ ] **Step 2: Criar `docker-compose.prod.yml`**

```yaml
services:
  redis:
    restart: unless-stopped

  sync-worker:
    restart: unless-stopped

  photo-worker:
    restart: unless-stopped

  news-worker:
    restart: unless-stopped

  scheduler:
    restart: unless-stopped
```

- [ ] **Step 3: Testar localmente (requer Docker)**

```bash
cp .env.example .env
# Preencher .env com SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
# Para teste local, deixar OCI vars vazias por enquanto
docker compose up --build
```

Expected: todos os containers sobem, logs mostram workers listening, bull-board em localhost:3001.

- [ ] **Step 4: Commit**

```bash
git add docker-compose.yml docker-compose.prod.yml
git commit -m "feat: docker compose stack — redis + 4 workers"
```

---

## Task 9: GitHub Actions — deploy via SSH

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Criar `.github/workflows/deploy.yml`**

```yaml
name: Deploy to OCI

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.OCI_HOST }}
          username: ubuntu
          key: ${{ secrets.OCI_SSH_KEY }}
          script: |
            cd ~/aprenda-politica-workers
            git pull origin main
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
            docker system prune -f
```

- [ ] **Step 2: Configurar secrets no GitHub**

No repositório GitHub `aprenda-politica-workers`, ir em Settings → Secrets → Actions e adicionar:
- `OCI_HOST` — IP público da instância OCI
- `OCI_SSH_KEY` — conteúdo da chave privada SSH (`cat ~/.ssh/id_rsa`)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: github actions deploy to OCI via SSH"
```

---

## Task 10: Script de provisionamento OCI

**Files:**
- Create: `scripts/setup-oci.sh`

- [ ] **Step 1: Criar `scripts/setup-oci.sh`**

```bash
#!/bin/bash
set -euo pipefail

echo "=== aprenda-politica-workers: OCI Ubuntu 22.04 setup ==="

# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
newgrp docker

# Docker Compose plugin
sudo apt-get install -y docker-compose-plugin

# Clonar repo
REPO_URL="${1:-https://github.com/SEU_USUARIO/aprenda-politica-workers.git}"
git clone "$REPO_URL" ~/aprenda-politica-workers
cd ~/aprenda-politica-workers

echo ""
echo "=== Setup concluído! ==="
echo "Próximos passos:"
echo "  1. cd ~/aprenda-politica-workers"
echo "  2. cp .env.example .env && nano .env   # preencher credentials"
echo "  3. docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
echo "  4. docker compose logs -f              # verificar workers"
```

- [ ] **Step 2: Tornar executável e commit**

```bash
chmod +x scripts/setup-oci.sh
git add scripts/setup-oci.sh
git commit -m "chore: OCI provisioning script"
```

---

## Task 11: Endpoint `/api/revalidate` no Next.js (`aprenda-politica`)

**Trabalho no repositório `aprenda-politica` (não no workers).**

**Files:**
- Create: `src/app/api/revalidate/route.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Criar `src/app/api/revalidate/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const paths: string[] = body.paths ?? ['/']

  for (const path of paths) {
    revalidatePath(path)
  }

  console.log('[revalidate] paths:', paths)
  return NextResponse.json({ ok: true, revalidated: paths })
}
```

- [ ] **Step 2: Adicionar `REVALIDATE_SECRET` ao `.env.local`**

```bash
echo "REVALIDATE_SECRET=$(openssl rand -hex 32)" >> .env.local
```

- [ ] **Step 3: Adicionar `.superpowers/` ao `.gitignore`**

Abrir `.gitignore` e adicionar ao final:
```
.superpowers/
```

- [ ] **Step 4: Testar o endpoint localmente**

```bash
SECRET=$(grep REVALIDATE_SECRET .env.local | cut -d= -f2)
curl -s -X POST http://localhost:3000/api/revalidate \
  -H "x-revalidate-secret: $SECRET" \
  -H "Content-Type: application/json" \
  -d '{"paths":["/"]}'
```

Expected:
```json
{"ok":true,"revalidated":["/"]}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/revalidate/route.ts .gitignore
git commit -m "feat: /api/revalidate endpoint for ISR cache invalidation"
```

---

## Task 12: Smoke test local end-to-end

**Objetivo:** verificar que enfileirar um job de sync no Redis resulta em dados atualizados no Supabase.

- [ ] **Step 1: Subir stack local**

```bash
cd ~/Apps/aprenda-politica-workers
cp .env.example .env
# Preencher SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
docker compose up --build -d
docker compose logs -f
```

Expected: logs mostram `[sync-worker] listening on queue "sync"`, `[scheduler] Cron jobs started`.

- [ ] **Step 2: Enfileirar um job de sync manualmente via Node**

```bash
node --input-type=module << 'EOF'
import IORedis from 'ioredis'
import { Queue } from 'bullmq'

const conn = new IORedis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null })
const q = new Queue('sync', { connection: conn })
await q.add('test-es', { type: 'sync-tse-state', uf: 'ES' })
console.log('Job enqueued')
await conn.quit()
EOF
```

- [ ] **Step 3: Verificar no Bull Board**

```bash
# Abrir no browser:
open http://localhost:3001
# Login: admin / (valor de BULL_BOARD_PASSWORD no .env)
```

Expected: job `test-es` aparece em "Completed" após ~65s.

- [ ] **Step 4: Verificar dados no Supabase**

```bash
node --input-type=module << 'EOF'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { count } = await s.from('politicians').select('*', { count: 'exact', head: true }).eq('source', 'tse')
console.log('TSE politicians:', count)
EOF
```

Expected: `TSE politicians: 979` (ou mais após sync completo).

- [ ] **Step 5: Commit final de verificação**

```bash
git add .
git commit -m "chore: smoke test passed — workers stack operational"
```

---

## Self-Review

**Spec coverage:**
- ✅ Repo `aprenda-politica-workers` com Docker Compose → Tasks 1, 8
- ✅ packages/shared (Supabase, queues, OCI storage) → Tasks 2, 3
- ✅ sync-worker (TSE 27 estados, Câmara, Senado) → Task 4
- ✅ photo-worker (TSE ZIPs → OCI Storage) → Task 5
- ✅ news-worker stub → Task 6
- ✅ scheduler (cron + bull-board + revalidate worker) → Task 7
- ✅ GitHub Actions SSH deploy → Task 9
- ✅ setup-oci.sh → Task 10
- ✅ `/api/revalidate` no Next.js → Task 11
- ✅ Smoke test → Task 12
- ✅ `.superpowers/` no .gitignore → Task 11

**Notas de implementação:**
- O `dotenv` precisa ser adicionado como dependência nos packages que o usam (`npm i dotenv` em shared)
- O OCI Object Storage `ACL: 'public-read'` pode requerer configuração explícita do bucket como público no console OCI antes de funcionar
- Na primeira execução do GitHub Actions, o OCI ainda precisa ter o Docker instalado — rodar `setup-oci.sh` manualmente uma vez antes do primeiro deploy automático
