import { describe, it, expect } from 'vitest'
import { parseCamaraDeputado } from '@/lib/sync/camara'

describe('parseCamaraDeputado', () => {
  it('maps Camara API fields to politician row', () => {
    const raw = {
      id: 204554,
      nome: 'Camila Valadão',
      siglaPartido: 'PSOL',
      siglaUf: 'ES',
      urlFoto: 'https://www.camara.leg.br/internet/deputado/bandep/204554.jpg',
    }
    const result = parseCamaraDeputado(raw, 99, 88)
    expect(result.name).toBe('Camila Valadão')
    expect(result.slug).toBe('camila-valadao')
    expect(result.external_id).toBe('204554')
    expect(result.source).toBe('camara')
    expect(result.position_id).toBe(99)
    expect(result.state_id).toBe(88)
    expect(result.photo_url).toBe('https://www.camara.leg.br/internet/deputado/bandep/204554.jpg')
  })
})
