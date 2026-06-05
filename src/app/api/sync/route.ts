import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { syncStates, syncMunicipalities } from '@/lib/sync/ibge'
import { syncDeputadosFederais } from '@/lib/sync/camara'
import { syncSenadores } from '@/lib/sync/senado'
import { scrapeALES, scrapeCamaraVitoria } from '@/lib/sync/scraper'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const results: Record<string, number | string> = {}

  try {
    results.states = await syncStates(supabase)
    results.municipalities_es = await syncMunicipalities(supabase, 'ES')
    results.deputados_federais_es = await syncDeputadosFederais(supabase, 'ES')
    results.senadores_es = await syncSenadores(supabase, 'ES')
    results.deputados_estaduais_es = await scrapeALES(supabase)
    results.vereadores_vitoria = await scrapeCamaraVitoria(supabase)

    await supabase.from('sync_logs').insert({
      source: 'full-sync',
      status: 'success',
      records_synced: Object.values(results).reduce((a: number, b) => a + (Number(b) || 0), 0),
    })

    return NextResponse.json({ ok: true, results })
  } catch (err: any) {
    await supabase.from('sync_logs').insert({
      source: 'full-sync',
      status: 'error',
      error: err.message,
    })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
