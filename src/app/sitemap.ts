import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/lib/site'

// Client direto (sem cookies) — o sitemap roda no build, fora de request scope
function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Regenera o sitemap no máximo 1x/dia
export const revalidate = 86400

const POL_CHUNK = 40_000 // teto do protocolo é 50k URLs por arquivo

// URLs estáticas + seção Aprenda (todas as páginas didáticas)
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

// Supabase limita 1000 linhas por request — paginamos para cobrir um intervalo maior
async function paginate(
  table: 'politicians' | 'municipalities',
  select: string,
  from: number,
  size: number,
): Promise<Record<string, unknown>[]> {
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

export async function generateSitemaps() {
  const supabase = db()
  const { count } = await supabase.from('politicians').select('id', { count: 'exact', head: true })
  const polChunks = Math.max(1, Math.ceil((count ?? 0) / POL_CHUNK))
  // id 0 = estático/aprenda/estados/partidos · id 1 = municípios · id 2.. = políticos
  const ids = [{ id: 0 }, { id: 1 }]
  for (let i = 0; i < polChunks; i++) ids.push({ id: 2 + i })
  return ids
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // id 0 — estático + Aprenda + estados + partidos
  if (id === 0) {
    const supabase = db()
    const [{ data: states }, { data: parties }] = await Promise.all([
      supabase.from('states').select('slug'),
      supabase.from('parties').select('abbr, slug'),
    ])
    const staticUrls: MetadataRoute.Sitemap = STATIC_PATHS.map(p => ({
      url: `${SITE_URL}${p}`,
      lastModified: now,
      changeFrequency: p.startsWith('/aprenda') ? 'monthly' : 'weekly',
      priority: p === '' ? 1 : 0.7,
    }))
    const stateUrls: MetadataRoute.Sitemap = (states ?? []).map((s: { slug: string }) => ({
      url: `${SITE_URL}/${s.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7,
    }))
    const partyUrls: MetadataRoute.Sitemap = (parties ?? [])
      .map((p: { abbr: string; slug: string | null }) => p.slug ?? p.abbr)
      .filter((s): s is string => Boolean(s))
      .map(slug => ({
        url: `${SITE_URL}/partidos/${slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5,
      }))
    return [...staticUrls, ...stateUrls, ...partyUrls]
  }

  // id 1 — municípios
  if (id === 1) {
    const rows = await paginate('municipalities', 'slug, state:states(slug)', 0, 50_000)
    return rows
      .map(m => {
        const state = m.state as { slug: string } | null
        return {
          url: `${SITE_URL}/${state?.slug}/${m.slug as string}`,
          lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8,
        }
      })
      .filter(u => !u.url.includes('/undefined/'))
  }

  // id 2.. — políticos (chunked)
  const chunk = id - 2
  const rows = await paginate('politicians', 'slug', chunk * POL_CHUNK, POL_CHUNK)
  return rows.map(p => ({
    url: `${SITE_URL}/politico/${p.slug as string}`,
    lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6,
  }))
}
