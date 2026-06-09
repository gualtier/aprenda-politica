import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from './site'

export const POL_CHUNK = 20_000 // teto do protocolo é 50k; 20k mantém a geração ~4s (longe do timeout)

export type SUrl = { loc: string; changefreq?: string; priority?: number }

// Client direto (sem cookies) — sitemaps rodam fora de request scope no build
function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

const STATIC_PATHS = [
  '', '/estados', '/partidos', '/politicos', '/aprenda',
  '/aprenda/poderes', '/aprenda/poderes/executivo', '/aprenda/poderes/legislativo', '/aprenda/poderes/judiciario',
  '/aprenda/esferas', '/aprenda/esferas/federal', '/aprenda/esferas/estadual', '/aprenda/esferas/municipal',
  '/aprenda/cargos', '/aprenda/cargos/presidente', '/aprenda/cargos/senador', '/aprenda/cargos/deputado-federal',
  '/aprenda/cargos/governador', '/aprenda/cargos/deputado-estadual', '/aprenda/cargos/prefeito', '/aprenda/cargos/vereador',
  '/aprenda/processo-legislativo', '/aprenda/processo-legislativo/apresentacao', '/aprenda/processo-legislativo/comissoes',
  '/aprenda/processo-legislativo/plenario', '/aprenda/processo-legislativo/casa-revisora', '/aprenda/processo-legislativo/sancao',
  '/aprenda/processo-legislativo/publicacao',
  '/aprenda/impostos', '/aprenda/impostos/ir', '/aprenda/impostos/ipi', '/aprenda/impostos/iof', '/aprenda/impostos/icms',
  '/aprenda/impostos/ipva', '/aprenda/impostos/itcmd', '/aprenda/impostos/iptu', '/aprenda/impostos/iss', '/aprenda/impostos/itbi',
]

// Supabase limita 1000 linhas/request — paginamos para cobrir um intervalo maior
async function paginate(table: 'politicians' | 'municipalities', select: string, from: number, size: number) {
  const supabase = db()
  const rows: Record<string, unknown>[] = []
  let offset = from
  const end = from + size
  while (offset < end) {
    const to = Math.min(offset + 999, end - 1)
    const { data } = await supabase.from(table).select(select).order('id').range(offset, to)
    if (!data || data.length === 0) break
    rows.push(...(data as unknown as Record<string, unknown>[]))
    if (data.length < to - offset + 1) break
    offset += data.length
  }
  return rows
}

/** Nº total de arquivos de sitemap: 0 (estático) + 1 (municípios) + N (políticos). */
export async function chunkCount(): Promise<number> {
  const { count } = await db().from('politicians').select('id', { count: 'exact', head: true })
  const polChunks = Math.max(1, Math.ceil((count ?? 0) / POL_CHUNK))
  return 2 + polChunks
}

/** URLs de um arquivo de sitemap pelo índice. */
export async function chunkUrls(id: number): Promise<SUrl[]> {
  // id 0 — estático + Aprenda + estados + partidos
  if (id === 0) {
    const supabase = db()
    const [{ data: states }, { data: parties }] = await Promise.all([
      supabase.from('states').select('slug'),
      supabase.from('parties').select('abbr, slug'),
    ])
    const staticUrls: SUrl[] = STATIC_PATHS.map(p => ({
      loc: `${SITE_URL}${p}`,
      changefreq: p.startsWith('/aprenda') ? 'monthly' : 'weekly',
      priority: p === '' ? 1 : 0.7,
    }))
    const stateUrls: SUrl[] = (states ?? []).map((s: { slug: string }) => ({
      loc: `${SITE_URL}/${s.slug}`, changefreq: 'weekly', priority: 0.7,
    }))
    const partyUrls: SUrl[] = (parties ?? [])
      .map((p: { abbr: string; slug: string | null }) => p.slug)
      .filter((s): s is string => Boolean(s))
      .map(slug => ({ loc: `${SITE_URL}/partidos/${slug}`, changefreq: 'monthly', priority: 0.5 }))
    return [...staticUrls, ...stateUrls, ...partyUrls]
  }

  // id 1 — municípios
  if (id === 1) {
    const rows = await paginate('municipalities', 'slug, state:states(slug)', 0, 50_000)
    return rows
      .map(m => {
        const state = m.state as { slug: string } | null
        return { loc: `${SITE_URL}/${state?.slug}/${m.slug as string}`, changefreq: 'weekly', priority: 0.8 }
      })
      .filter(u => !u.loc.includes('/undefined/'))
  }

  // id 2.. — políticos (chunked)
  const chunk = id - 2
  const rows = await paginate('politicians', 'slug', chunk * POL_CHUNK, POL_CHUNK)
  return rows.map(p => ({ loc: `${SITE_URL}/politico/${p.slug as string}`, changefreq: 'monthly', priority: 0.6 }))
}

const escapeXml = (s: string) => s.replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&apos;', '"': '&quot;' }[c]!))

export function urlsetXml(urls: SUrl[]): string {
  const body = urls.map(u =>
    `<url><loc>${escapeXml(u.loc)}</loc>` +
    (u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : '') +
    (u.priority != null ? `<priority>${u.priority}</priority>` : '') +
    `</url>`
  ).join('')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`
}

export function indexXml(count: number): string {
  const now = new Date().toISOString()
  const items = Array.from({ length: count }, (_, i) =>
    `<sitemap><loc>${SITE_URL}/sitemaps/${i}.xml</loc><lastmod>${now}</lastmod></sitemap>`
  ).join('')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>`
}
