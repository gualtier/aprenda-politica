import * as cheerio from 'cheerio'
import { slugify } from '@/lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'

export function parseALESDeputado(
  raw: { name: string; party: string; photoUrl: string | null },
  stateId: number,
  positionId: number
) {
  return {
    name: raw.name,
    slug: slugify(raw.name),
    photo_url: raw.photoUrl,
    source: 'ales-scraper' as const,
    state_id: stateId,
    municipality_id: null as number | null,
    position_id: positionId,
    party_id: null as number | null,
    external_id: null as string | null,
    mandate_start: '2023-02-01',
    mandate_end: '2027-01-31',
    _party_abbr: raw.party,
  }
}

async function upsertParty(supabase: SupabaseClient, abbr: string): Promise<number | null> {
  if (!abbr) return null
  await supabase.from('parties').upsert(
    { name: abbr, abbr, color_hex: '#888888' },
    { onConflict: 'abbr', ignoreDuplicates: true }
  )
  const { data } = await supabase.from('parties').select('id').eq('abbr', abbr).single()
  return data?.id ?? null
}

export async function scrapeALES(supabase: SupabaseClient): Promise<number> {
  const { data: position } = await supabase
    .from('positions').select('id').eq('slug', 'deputado-estadual').single()
  if (!position) throw new Error('Position deputado-estadual not found')

  const { data: state } = await supabase
    .from('states').select('id').eq('abbr', 'ES').single()
  if (!state) throw new Error('State ES not found')

  const res = await fetch('https://www.ales.es.gov.br/deputados', {
    headers: { 'User-Agent': 'AprendaPoliticaBot/1.0 (+https://aprendapolitica.com.br)' },
  })
  if (!res.ok) throw new Error(`ALES scrape failed: ${res.status}`)

  const html = await res.text()
  const $ = cheerio.load(html)
  const deputados: Array<{ name: string; party: string; photoUrl: string | null }> = []

  // Try common selectors — adjust if ALES site structure changes
  $('[class*="deputad"], .card, article').each((_, el) => {
    const name = $(el).find('[class*="nome"], h2, h3, h4').first().text().trim()
    const party = $(el).find('[class*="partido"], [class*="party"], .sigla').first().text().trim().replace(/[()]/g, '').trim()
    const imgSrc = $(el).find('img').attr('src') || null
    const photoUrl = imgSrc
      ? imgSrc.startsWith('http') ? imgSrc : `https://www.ales.es.gov.br${imgSrc}`
      : null
    if (name && name.length > 3) deputados.push({ name, party, photoUrl })
  })

  let count = 0
  for (const dep of deputados) {
    const parsed = parseALESDeputado(dep, state.id, position.id)
    const { _party_abbr, ...row } = parsed
    if (_party_abbr) row.party_id = await upsertParty(supabase, _party_abbr)
    await supabase.from('politicians').upsert(row, { onConflict: 'slug' })
    count++
  }
  return count
}

export async function scrapeCamaraVitoria(supabase: SupabaseClient): Promise<number> {
  const { data: position } = await supabase
    .from('positions').select('id').eq('slug', 'vereador').single()
  if (!position) throw new Error('Position vereador not found')

  const { data: municipality } = await supabase
    .from('municipalities').select('id, state_id').eq('slug', 'vitoria').single()
  if (!municipality) throw new Error('Municipality vitoria not found')

  const res = await fetch('https://www.camaravitoria.es.gov.br/vereadores', {
    headers: { 'User-Agent': 'AprendaPoliticaBot/1.0' },
  })
  if (!res.ok) throw new Error(`CM-Vitória scrape failed: ${res.status}`)

  const html = await res.text()
  const $ = cheerio.load(html)
  const vereadores: Array<{ name: string; party: string; photoUrl: string | null }> = []

  $('[class*="vereador"], [class*="parlamentar"], .card, article').each((_, el) => {
    const name = $(el).find('[class*="nome"], h2, h3, h4, strong').first().text().trim()
    const party = $(el).find('[class*="partido"], .sigla').first().text().trim().replace(/[()]/g, '').trim()
    const imgSrc = $(el).find('img').attr('src') || null
    const photoUrl = imgSrc
      ? imgSrc.startsWith('http') ? imgSrc : `https://www.camaravitoria.es.gov.br${imgSrc}`
      : null
    if (name && name.length > 3) vereadores.push({ name, party, photoUrl })
  })

  let count = 0
  for (const ver of vereadores) {
    const row = {
      name: ver.name,
      slug: slugify(ver.name),
      photo_url: ver.photoUrl,
      source: 'cm-vitoria-scraper' as const,
      state_id: municipality.state_id as number,
      municipality_id: municipality.id as number,
      position_id: position.id as number,
      party_id: null as number | null,
      external_id: null as string | null,
      mandate_start: '2025-01-01',
      mandate_end: '2028-12-31',
    }
    if (ver.party) row.party_id = await upsertParty(supabase, ver.party)
    await supabase.from('politicians').upsert(row, { onConflict: 'slug' })
    count++
  }
  return count
}
