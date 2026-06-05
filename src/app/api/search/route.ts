import { NextRequest, NextResponse } from 'next/server'
import { searchPoliticsEntities } from '@/lib/supabase/queries'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (q.trim().length < 2) {
    return NextResponse.json([])
  }
  const results = await searchPoliticsEntities(q)
  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}
