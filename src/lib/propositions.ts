import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Proposition } from '@/types'

const SELECT =
  'id, source, external_id, type, number, year, title, summary, presented_on, status, themes, url, updated_at, party_ids, slug'

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

/** Cor de acento por casa legislativa (tokens de marca). */
export const SOURCE_COLORS: Record<string, string> = {
  camara: '#009C3B', // verde-600
  senado: '#2255AA', // esfera-federal
  ales: '#CC9900',   // amarelo-600 / esfera-municipal
}

/** Classe Tailwind do badge de status, por situação (tokens de marca). */
export function statusTone(status: string | null): string {
  const s = (status ?? '').toLowerCase()
  if (/sancion|promulg|aprovad|transformad.* em norma|publicad|conclu/.test(s)) return 'bg-verde-50 text-verde-700 border-verde-100'
  if (/arquivad|rejeitad|retirad|devolvid|prejudicad|veto/.test(s)) return 'bg-red-50 text-red-700 border-red-200'
  if (/tramit|aguard|pronta|an[áa]lise|comiss|despacho|designad|apresentad|pauta|distribu|relator/.test(s)) return 'bg-amarelo-50 text-amarelo-600 border-amarelo-500/40'
  return 'bg-gray-100 text-gray-600 border-gray-200'
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
  if (f.tema) q = q.contains('topics', [f.tema])
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
    .select('author_name, politician_id, role, ordem, politician:politicians(name, slug, photo_url, position:positions(name), state:states(abbr), party:parties(abbr, color_hex, logo_url, slug))')
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

/** Proposições de um tema (paginado, com autor principal já enriquecido). */
export async function propositionsByTopic(tema: string, page = 1, pageSize = 30): Promise<{ items: Proposition[]; total: number }> {
  return listPropositions({ tema, page, pageSize })
}

export interface TopicStats {
  total: number
  bySource: { camara: number; senado: number }
  topTypes: { type: string; n: number }[]
  topParties: { id: number; abbr: string; color: string | null; slug: string | null; logo: string | null; n: number }[]
  topAuthors: { id: number; name: string; slug: string; photo_url: string | null; party_abbr: string | null; party_color: string | null; n: number }[]
}

/** Agregados (BI) de um tema. */
export async function topicStats(tema: string): Promise<TopicStats> {
  const supabase = createServerSupabaseClient()
  const { data: props } = await supabase.from('propositions')
    .select('id, type, source, party_ids').contains('topics', [tema]).limit(20000)
  const rows = (props ?? []) as { id: number; type: string; source: string; party_ids: number[] | null }[]

  const bySource = { camara: 0, senado: 0 }
  const typeCount = new Map<string, number>()
  const partyCount = new Map<number, number>()
  for (const r of rows) {
    if (r.source === 'camara') bySource.camara++
    else if (r.source === 'senado') bySource.senado++
    typeCount.set(r.type, (typeCount.get(r.type) ?? 0) + 1)
    for (const pid of r.party_ids ?? []) partyCount.set(pid, (partyCount.get(pid) ?? 0) + 1)
  }
  const topTypes = Array.from(typeCount).map(([type, n]) => ({ type, n })).sort((a, b) => b.n - a.n).slice(0, 5)

  const topPartyIds = Array.from(partyCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id]) => id)
  let topParties: TopicStats['topParties'] = []
  if (topPartyIds.length) {
    const { data: parties } = await supabase.from('parties').select('id, abbr, color_hex, slug, logo_url').in('id', topPartyIds)
    topParties = (parties ?? []).map((p: { id: number; abbr: string; color_hex: string | null; slug: string | null; logo_url: string | null }) => ({
      id: p.id, abbr: p.abbr, color: p.color_hex, slug: p.slug, logo: p.logo_url, n: partyCount.get(p.id) ?? 0,
    })).sort((a, b) => b.n - a.n)
  }

  const ids = rows.map(r => r.id)
  const authorCount = new Map<number, number>()
  for (let i = 0; i < ids.length; i += 300) {
    const slice = ids.slice(i, i + 300)
    const { data: pa } = await supabase.from('proposition_authors')
      .select('politician_id').in('proposition_id', slice).eq('role', 'autor').not('politician_id', 'is', null)
    for (const a of (pa ?? []) as { politician_id: number }[]) authorCount.set(a.politician_id, (authorCount.get(a.politician_id) ?? 0) + 1)
  }
  const topAuthorIds = Array.from(authorCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id]) => id)
  let topAuthors: TopicStats['topAuthors'] = []
  if (topAuthorIds.length) {
    const { data: pols } = await supabase.from('politicians')
      .select('id, name, slug, photo_url, party:parties(abbr, color_hex)').in('id', topAuthorIds)
    type PR = { id: number; name: string; slug: string; photo_url: string | null; party: { abbr: string; color_hex: string | null } | null }
    topAuthors = ((pols as unknown as PR[]) ?? []).map(p => ({
      id: p.id, name: p.name, slug: p.slug, photo_url: p.photo_url,
      party_abbr: p.party?.abbr ?? null, party_color: p.party?.color_hex ?? null, n: authorCount.get(p.id) ?? 0,
    })).sort((a, b) => b.n - a.n)
  }

  return { total: rows.length, bySource, topTypes, topParties, topAuthors }
}
