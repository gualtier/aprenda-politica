import type { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabaseClient()
  const BASE = 'https://aprendapolitica.com.br'

  const { data: municipalities } = await supabase
    .from('municipalities')
    .select('slug, state:states(slug)')

  type MunicipalityData = { slug: string; state: { slug: string } | null }
  const municipalityUrls: MetadataRoute.Sitemap = (municipalities as MunicipalityData[] ?? []).map((m) => ({
    url: `${BASE}/${m.state?.slug}/${m.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    ...municipalityUrls,
  ]
}
