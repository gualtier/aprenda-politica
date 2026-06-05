import { describe, it, expect } from 'vitest'
import { parseALESDeputado } from '@/lib/sync/scraper'

describe('parseALESDeputado', () => {
  it('parses scraped ALES data', () => {
    const raw = { name: 'Theodorico Ferraço', party: 'PP', photoUrl: 'https://ales.es.gov.br/foto.jpg' }
    const result = parseALESDeputado(raw, 5, 99)
    expect(result.name).toBe('Theodorico Ferraço')
    expect(result.slug).toBe('theodorico-ferraco')
    expect(result.source).toBe('ales-scraper')
    expect(result.state_id).toBe(5)
    expect(result.position_id).toBe(99)
    expect(result.photo_url).toBe('https://ales.es.gov.br/foto.jpg')
  })
})
