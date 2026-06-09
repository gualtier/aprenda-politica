import { chunkCount, chunkUrls, urlsetXml } from '@/lib/sitemap'

// Caminho de chunk VERSIONADO (URLs novas, sem histórico no GSC) — cada chunk
// vira um "chunk novo" que o Google busca do zero. Estáticos via generateStaticParams.
export const revalidate = 86400
export const maxDuration = 60

export async function generateStaticParams() {
  const n = await chunkCount()
  return Array.from({ length: n }, (_, i) => ({ id: `${i}.xml` }))
}

const CACHE = 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)
  if (Number.isNaN(id) || id < 0) {
    return new Response('Not found', { status: 404 })
  }
  const urls = await chunkUrls(id)
  return new Response(urlsetXml(urls), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': CACHE },
  })
}
