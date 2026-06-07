import { unzipSync } from 'fflate'
import { slugify } from '@/lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'

// ── Constants ─────────────────────────────────────────────────────────────────

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

// ── ZIP cache (in-memory within one request) ──────────────────────────────────

let cache2022: Uint8Array | null = null
let cache2024: Uint8Array | null = null

async function getZip(year: 2022 | 2024): Promise<Uint8Array> {
  if (year === 2022 && cache2022) return cache2022
  if (year === 2024 && cache2024) return cache2024

  const url = year === 2022 ? TSE_ZIP_2022 : TSE_ZIP_2024
  console.log(`[tse] downloading ${year} ZIP...`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TSE ZIP download failed: ${res.status} ${url}`)
  const buf = new Uint8Array(await res.arrayBuffer())
  if (year === 2022) cache2022 = buf
  else cache2024 = buf
  console.log(`[tse] ${year} ZIP loaded (${Math.round(buf.length / 1024)}KB)`)
  return buf
}

// ── CSV parsing ───────────────────────────────────────────────────────────────

function parseCSV(buffer: Uint8Array): Record<string, string>[] {
  const text = new TextDecoder('iso-8859-1').decode(buffer)
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []

  const parseRow = (line: string): string[] =>
    line.split(';').map(v => v.replace(/^"|"$/g, '').trim())

  const headers = parseRow(lines[0])
  return lines.slice(1).map(line => {
    const vals = parseRow(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = vals[i] ?? '' })
    return row
  })
}

// ── Batch helpers ─────────────────────────────────────────────────────────────

function chunks<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
  return result
}

// Pre-fetch or create all parties needed for a batch of rows.
// Returns abbr → party_id map.
async function resolveParties(
  supabase: SupabaseClient,
  rows: Record<string, string>[]
): Promise<Map<string, number>> {
  const parties = new Map<string, string>() // abbr → name
  for (const r of rows) {
    const abbr = r['SG_PARTIDO']?.trim()
    if (abbr && !parties.has(abbr)) parties.set(abbr, r['NM_PARTIDO']?.trim() ?? abbr)
  }

  if (parties.size === 0) return new Map()

  // Upsert all missing parties in one call
  const partyRows = Array.from(parties.entries()).map(([abbr, name]) => ({
    abbr, name, color_hex: '#888888',
  }))
  await supabase.from('parties').upsert(partyRows, { onConflict: 'abbr', ignoreDuplicates: true })

  // Fetch all at once
  const { data } = await supabase
    .from('parties')
    .select('id, abbr')
    .in('abbr', Array.from(parties.keys()))

  const idMap = new Map<string, number>()
  for (const p of data ?? []) idMap.set(p.abbr, p.id)
  return idMap
}

// Pre-fetch all municipalities for a state.
// Returns upper(name) → municipality_id map.
async function resolveMunicipalities(
  supabase: SupabaseClient,
  stateId: number
): Promise<Map<string, number>> {
  const { data } = await supabase
    .from('municipalities')
    .select('id, name')
    .eq('state_id', stateId)

  const map = new Map<string, number>()
  for (const m of data ?? []) map.set(m.name.toUpperCase(), m.id)
  return map
}

// ── Core sync ─────────────────────────────────────────────────────────────────

export async function syncTSEState(
  supabase: SupabaseClient,
  uf: string,
  cargos: ('GOVERNADOR' | 'DEPUTADO ESTADUAL' | 'PREFEITO' | 'VEREADOR')[]
): Promise<number> {
  const { data: state } = await supabase.from('states').select('id').eq('abbr', uf).single()
  if (!state) throw new Error(`State not found: ${uf}`)

  // Load position id map
  const positionIds: Record<string, number> = {}
  const positionSlugs = Array.from(new Set(cargos.map(c => CARGO_TO_POSITION[c])))
  const { data: positions } = await supabase
    .from('positions').select('id, slug').in('slug', positionSlugs)
  for (const p of positions ?? []) positionIds[p.slug] = p.id

  // Determine which year ZIPs we need
  const years = new Set(cargos.map(c => (c === 'PREFEITO' || c === 'VEREADOR') ? 2024 : 2022))
  const rowsByYear: Record<number, Record<string, string>[]> = {}

  for (const year of Array.from(years)) {
    const zipBuf = await getZip(year as 2022 | 2024)
    const files = unzipSync(zipBuf)
    const csvName = Object.keys(files).find(n => n.includes(`_${uf}.csv`))
    if (!csvName) throw new Error(`CSV for ${uf} not found in ${year} ZIP`)
    rowsByYear[year] = parseCSV(files[csvName])
  }

  // Collect all elected rows across all cargos
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

  // Resolve lookups in bulk
  const partyMap = await resolveParties(supabase, allElected)
  const munMap = await resolveMunicipalities(supabase, state.id)

  // Build politician records
  const records = allElected
    .map(row => {
      const cargo = row['DS_CARGO']
      const positionSlug = CARGO_TO_POSITION[cargo]
      const positionId = positionIds[positionSlug]
      if (!positionId) return null

      const sqCandidato = row['SQ_CANDIDATO']?.trim()
      const name = (row['NM_CANDIDATO'] || row['NM_URNA_CANDIDATO'])?.trim()
      if (!name || !sqCandidato) return null

      const mandate = MANDATE[positionSlug]
      const partyId = partyMap.get(row['SG_PARTIDO']?.trim()) ?? null

      const isMunicipal = cargo === 'PREFEITO' || cargo === 'VEREADOR'
      const munName = row['NM_UE']?.trim().toUpperCase()
      const municipalityId = isMunicipal ? (munMap.get(munName) ?? null) : null

      return {
        name,
        slug: `${slugify(name)}-${uf.toLowerCase()}-${sqCandidato.slice(-6)}`,
        photo_url: null,
        party_id: partyId,
        position_id: positionId,
        state_id: state.id,
        municipality_id: municipalityId,
        external_id: sqCandidato,
        source: 'tse',
        mandate_start: mandate.start,
        mandate_end: mandate.end,
      }
    })
    .filter(Boolean) as object[]

  // Batch upsert
  let upserted = 0
  for (const batch of chunks(records, BATCH_SIZE)) {
    const { error, count } = await supabase
      .from('politicians')
      .upsert(batch, { onConflict: 'slug', ignoreDuplicates: false })
      .select('id')
    if (error) {
      console.error(`[tse] batch upsert error (${uf}):`, error.message)
    } else {
      upserted += count ?? batch.length
    }
  }

  return upserted
}

// ── Federal sync (president from national BR CSV) ─────────────────────────────

export async function syncTSEFederal(supabase: SupabaseClient): Promise<number> {
  const { data: position } = await supabase
    .from('positions').select('id').eq('slug', 'presidente').single()
  if (!position) throw new Error('Position "presidente" not found in DB')

  const zipBuf = await getZip(2022)
  const files = unzipSync(zipBuf)
  const csvName = Object.keys(files).find(n => n.includes('_BR.csv'))
  if (!csvName) throw new Error('BR CSV not found in 2022 ZIP')

  const rows = parseCSV(files[csvName])
  const elected = rows.filter(r =>
    (r['DS_CARGO'] === 'PRESIDENTE' || r['DS_CARGO'] === 'PRESIDENTE DA REPÚBLICA') &&
    r['DS_SIT_TOT_TURNO']?.startsWith('ELEITO')
  )

  console.log(`[tse] BR PRESIDENTE: ${elected.length} eleitos`)
  if (elected.length === 0) return 0

  const partyMap = await resolveParties(supabase, elected)
  const mandate = MANDATE['presidente']

  const records = elected
    .map(row => {
      const sqCandidato = row['SQ_CANDIDATO']?.trim()
      const name = (row['NM_CANDIDATO'] || row['NM_URNA_CANDIDATO'])?.trim()
      if (!name || !sqCandidato) return null
      return {
        name,
        slug: `${slugify(name)}-br-${sqCandidato.slice(-6)}`,
        photo_url: null,
        party_id: partyMap.get(row['SG_PARTIDO']?.trim()) ?? null,
        position_id: position.id,
        state_id: null,
        municipality_id: null,
        external_id: sqCandidato,
        source: 'tse',
        mandate_start: mandate.start,
        mandate_end: mandate.end,
      }
    })
    .filter(Boolean) as object[]

  const { error, count } = await supabase
    .from('politicians')
    .upsert(records, { onConflict: 'slug', ignoreDuplicates: false })
    .select('id')

  if (error) { console.error('[tse] federal upsert error:', error.message); return 0 }
  return count ?? records.length
}

// ── Convenience exports ───────────────────────────────────────────────────────

export async function syncTSEEspiritoSanto(supabase: SupabaseClient): Promise<Record<string, number>> {
  return {
    presidente:          await syncTSEFederal(supabase),
    governadores:        await syncTSEState(supabase, 'ES', ['GOVERNADOR']),
    deputados_estaduais: await syncTSEState(supabase, 'ES', ['DEPUTADO ESTADUAL']),
    prefeitos:           await syncTSEState(supabase, 'ES', ['PREFEITO']),
    vereadores:          await syncTSEState(supabase, 'ES', ['VEREADOR']),
  }
}

// Sync all cargos for any state
export async function syncTSEAllCargos(
  supabase: SupabaseClient,
  uf: string
): Promise<Record<string, number>> {
  return {
    governadores:        await syncTSEState(supabase, uf, ['GOVERNADOR']),
    deputados_estaduais: await syncTSEState(supabase, uf, ['DEPUTADO ESTADUAL']),
    prefeitos:           await syncTSEState(supabase, uf, ['PREFEITO']),
    vereadores:          await syncTSEState(supabase, uf, ['VEREADOR']),
  }
}

// Sync all 26 states + DF + federal
export const BRAZIL_UFS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA',
  'MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN',
  'RO','RR','RS','SC','SE','SP','TO',
]

export async function syncTSEBrazil(supabase: SupabaseClient): Promise<Record<string, number>> {
  const results: Record<string, number> = {}
  results.presidente = await syncTSEFederal(supabase)
  for (const uf of BRAZIL_UFS) {
    try {
      const r = await syncTSEAllCargos(supabase, uf)
      for (const [k, v] of Object.entries(r)) {
        results[`${uf.toLowerCase()}_${k}`] = v
      }
      console.log(`[tse] ${uf} done`)
    } catch (e: any) {
      console.warn(`[tse] ${uf} failed:`, e.message)
      results[`${uf.toLowerCase()}_error`] = -1
    }
  }
  return results
}
