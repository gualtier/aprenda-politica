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
  const { data: state, error: stateError } = await supabase
    .from('states').select('id').eq('abbr', stateAbbr).single()
  if (stateError || !state) throw new Error(`State not found: ${stateAbbr}`)

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
