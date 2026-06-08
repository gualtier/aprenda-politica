import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/lib/site'

const POL_CHUNK = 40_000

// Aponta direto para cada arquivo do sitemap (o índice auto do Next é instável
// com generateSitemaps; o protocolo aceita vários Sitemap no robots.txt).
export default async function robots(): Promise<MetadataRoute.Robots> {
  let total = 4 // fallback: 0 (estático) + 1 (municípios) + 2 chunks de políticos
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { count } = await supabase.from('politicians').select('id', { count: 'exact', head: true })
    const polChunks = Math.max(1, Math.ceil((count ?? 0) / POL_CHUNK))
    total = 2 + polChunks
  } catch {
    /* usa o fallback */
  }
  const sitemaps = Array.from({ length: total }, (_, i) => `${SITE_URL}/sitemap/${i}.xml`)

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/offline'] }],
    sitemap: sitemaps,
    host: SITE_URL,
  }
}

export const revalidate = 86400
