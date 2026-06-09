import { chunkCount, chunkUrls, urlsetXml } from '@/lib/sitemap'

export const revalidate = 86400
export const maxDuration = 60

// Pré-gera todos os chunks no BUILD → arquivos estáticos servidos pela CDN
// (sem geração em runtime). Faixas novas (id além do build) caem em ISR sob demanda.
export async function generateStaticParams() {
  const n = await chunkCount()
  return Array.from({ length: n }, (_, i) => ({ id: `${i}.xml` }))
}

const CACHE = 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  // params.id chega como "0.xml" → 0
  const id = parseInt(params.id, 10)
  if (Number.isNaN(id) || id < 0) {
    return new Response('Not found', { status: 404 })
  }
  const urls = await chunkUrls(id)
  return new Response(urlsetXml(urls), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': CACHE },
  })
}
