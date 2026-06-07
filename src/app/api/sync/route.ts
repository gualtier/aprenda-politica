import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { syncStates, syncMunicipalities } from '@/lib/sync/ibge'
import { syncDeputadosFederais } from '@/lib/sync/camara'
import { syncSenadores } from '@/lib/sync/senado'
import { scrapeALES, scrapeCamaraVitoria } from '@/lib/sync/scraper'
import { syncTSEEspiritoSanto } from '@/lib/sync/tse'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const results: Record<string, number | string> = {}

  try {
    console.log('[sync] starting states...')
    results.states = await syncStates(supabase)
    console.log('[sync] states ok:', results.states)

    console.log('[sync] starting municipalities ES...')
    results.municipalities_es = await syncMunicipalities(supabase, 'ES')
    console.log('[sync] municipalities ok:', results.municipalities_es)

    console.log('[sync] starting deputados federais ES...')
    results.deputados_federais_es = await syncDeputadosFederais(supabase, 'ES')
    console.log('[sync] deputados ok:', results.deputados_federais_es)

    console.log('[sync] starting senadores ES...')
    results.senadores_es = await syncSenadores(supabase, 'ES')
    console.log('[sync] senadores ok:', results.senadores_es)

    console.log('[sync] starting TSE ES sync...')
    try {
      const tseResults = await syncTSEEspiritoSanto(supabase)
      Object.assign(results, tseResults)
      console.log('[sync] TSE ES ok:', tseResults)
    } catch (e: any) {
      console.warn('[sync] TSE skipped:', e.message)
      results.tse_es = 'skipped'
    }

    console.log('[sync] starting ALES scraper...')
    try {
      results.deputados_estaduais_es = await scrapeALES(supabase)
      console.log('[sync] ALES ok:', results.deputados_estaduais_es)
    } catch (e: any) {
      console.warn('[sync] ALES skipped (site unavailable):', e.message)
      results.deputados_estaduais_es = 'skipped'
    }

    console.log('[sync] starting CM-Vitória scraper...')
    try {
      results.vereadores_vitoria = await scrapeCamaraVitoria(supabase)
      console.log('[sync] CM-Vitória ok:', results.vereadores_vitoria)
    } catch (e: any) {
      console.warn('[sync] CM-Vitória skipped (site unavailable):', e.message)
      results.vereadores_vitoria = 'skipped'
    }

    await supabase.from('sync_logs').insert({
      source: 'full-sync',
      status: 'success',
      records_synced: Object.values(results).reduce((a: number, b) => a + (Number(b) || 0), 0),
    })

    return NextResponse.json({ ok: true, results })
  } catch (err: any) {
    console.error('[sync] FAILED:', err)
    await supabase.from('sync_logs').insert({
      source: 'full-sync',
      status: 'error',
      error: err.message,
    })
    return NextResponse.json({ error: err.message, stack: err.stack?.split('\n').slice(0,5) }, { status: 500 })
  }
}
