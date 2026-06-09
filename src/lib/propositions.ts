import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Proposition } from '@/types'

const SELECT =
  'id, source, external_id, type, number, year, title, summary, presented_on, status, themes, url, party_ids, slug'

export function formatPropositionLabel(p: { type: string; number: number | null; year: number | null }): string {
  if (p.number && p.year) return `${p.type} ${p.number}/${p.year}`
  if (p.year) return `${p.type} ${p.year}`
  return p.type
}

export const SOURCE_LABELS: Record<string, string> = {
  camara: 'Câmara dos Deputados',
  senado: 'Senado Federal',
  ales: 'Assembleia Legislativa · ES',
}
export const SOURCE_SHORT: Record<string, string> = { camara: 'Câmara', senado: 'Senado', ales: 'ALES' }

/** Nome e explicação didática por tipo de proposição. */
export const PROPOSITION_TYPES: Record<string, { name: string; desc: string }> = {
  PL:  { name: 'Projeto de Lei', desc: 'Cria ou altera uma lei ordinária — a maioria das leis do país.' },
  PLP: { name: 'Projeto de Lei Complementar', desc: 'Regulamenta dispositivos da Constituição; exige maioria absoluta.' },
  PEC: { name: 'Proposta de Emenda à Constituição', desc: 'Altera a Constituição; exige 3/5 dos votos em dois turnos.' },
  PDL: { name: 'Projeto de Decreto Legislativo', desc: 'Trata de matérias de competência exclusiva do Congresso.' },
  MPV: { name: 'Medida Provisória', desc: 'Editada pelo Presidente com força de lei imediata; o Congresso depois confirma.' },
  PLV: { name: 'Projeto de Lei de Conversão', desc: 'Texto de uma Medida Provisória alterado pelo Congresso.' },
  PRC: { name: 'Projeto de Resolução', desc: 'Regula matéria interna da Casa legislativa.' },
  PRS: { name: 'Projeto de Resolução', desc: 'Regula matéria interna do Senado.' },
  PLN: { name: 'Projeto de Lei do Congresso', desc: 'Matéria orçamentária apreciada pelo Congresso Nacional.' },
  PLC: { name: 'Projeto de Lei da Câmara', desc: 'Projeto de lei originário da Câmara em revisão no Senado.' },
  PDS: { name: 'Projeto de Decreto Legislativo', desc: 'Matérias de competência exclusiva do Congresso.' },
  PLS: { name: 'Projeto de Lei do Senado', desc: 'Projeto de lei originário do Senado.' },
}
export const typeInfo = (t: string) => PROPOSITION_TYPES[t] ?? { name: t, desc: '' }

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
  const items = (data as unknown as Proposition[]) ?? []

  // Enriquece com o autor principal (proponente) + partido, em uma query batched.
  const ids = items.map(i => i.id)
  if (ids.length) {
    const { data: pa } = await supabase
      .from('proposition_authors')
      .select('proposition_id, author_name, ordem, politician:politicians(slug, party:parties(abbr, color_hex))')
      .in('proposition_id', ids).eq('role', 'autor').order('ordem', { ascending: true })
    type Row = { proposition_id: number; author_name: string; politician: { slug: string; party: { abbr: string; color_hex: string | null } | null } | null }
    const primary = new Map<number, Row>()
    for (const a of (pa as unknown as Row[]) ?? []) if (!primary.has(a.proposition_id)) primary.set(a.proposition_id, a)
    for (const it of items) {
      const a = primary.get(it.id)
      if (a) it.primary_author = {
        name: a.author_name, slug: a.politician?.slug ?? null,
        party_abbr: a.politician?.party?.abbr ?? null, party_color: a.politician?.party?.color_hex ?? null,
      }
    }
  }
  return { items, total: count ?? 0 }
}

/** Uma proposição por slug, com autores (linkando políticos existentes). */
export async function getPropositionBySlug(slug: string): Promise<Proposition | null> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('propositions').select(SELECT).eq('slug', slug).single()
  if (!data) return null
  const { data: authors } = await supabase
    .from('proposition_authors')
    .select('author_name, politician_id, role, ordem, politician:politicians(name, slug, party:parties(abbr, color_hex))')
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
