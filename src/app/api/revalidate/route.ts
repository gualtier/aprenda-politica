import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const paths: string[] = body.paths ?? ['/']

  for (const path of paths) {
    revalidatePath(path)
  }

  console.log('[revalidate] paths:', paths)
  return NextResponse.json({ ok: true, revalidated: paths })
}
