import { chunkUrls, urlsetXml } from '@/lib/sitemap'

export const revalidate = 86400

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  // params.id chega como "0.xml" → 0
  const id = parseInt(params.id, 10)
  if (Number.isNaN(id) || id < 0) {
    return new Response('Not found', { status: 404 })
  }
  const urls = await chunkUrls(id)
  return new Response(urlsetXml(urls), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
