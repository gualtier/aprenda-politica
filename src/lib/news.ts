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
  const ids = Array.from(new Set((links ?? []).map(l => l.news_id)))
  if (!ids.length) return []
  const { data } = await supabase.from('news').select(SELECT).in('id', ids)
    .order('published_at', { ascending: false, nullsFirst: false }).limit(limit)
  return (data as News[]) ?? []
}
