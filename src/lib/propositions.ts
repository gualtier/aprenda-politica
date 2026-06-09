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
  const ids = Array.from(new Set((links ?? []).map(l => l.proposition_id)))
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

/** Tipos distintos para popular os filtros. */
export async function propositionFacets(): Promise<{ types: string[] }> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('propositions').select('type')
  const types = Array.from(new Set((data ?? []).map(r => (r as { type: string }).type))).sort()
  return { types }
}
