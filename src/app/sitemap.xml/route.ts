import { chunkCount, indexXml } from '@/lib/sitemap'

export const revalidate = 86400

export async function GET() {
  const count = await chunkCount()
  return new Response(indexXml(count), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
