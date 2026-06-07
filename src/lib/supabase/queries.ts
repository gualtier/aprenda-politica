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

  // include federal politicians (state_id IS NULL, e.g. president) alongside state politicians
  const query = supabase
    .from('politicians')
    .select('*, party:parties(*), position:positions(*), state:states(*), municipality:municipalities(*)')
    .or(`state_id.eq.${state.id},state_id.is.null`)

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
