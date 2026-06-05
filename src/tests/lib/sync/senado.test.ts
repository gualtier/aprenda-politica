import { describe, it, expect } from 'vitest'
import { parseSenador } from '@/lib/sync/senado'

describe('parseSenador', () => {
  it('maps Senado API fields to politician row', () => {
    const raw = {
      IdentificacaoParlamentar: {
        CodigoParlamentar: '5936',
        NomeParlamentar: 'Fabiano Contarato',
        SiglaPartidoParlamentar: 'PT',
        UfParlamentar: 'ES',
        UrlFotoParlamentar: 'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador5936.jpg',
      },
      Mandato: {
        DataInicioMandato: '2019-02-01',
        DataFimMandato: '2027-01-31',
      },
    }
    const result = parseSenador(raw, 10, 5)
    expect(result.name).toBe('Fabiano Contarato')
    expect(result.slug).toBe('fabiano-contarato')
    expect(result.source).toBe('senado')
    expect(result.position_id).toBe(10)
    expect(result.state_id).toBe(5)
    expect(result.external_id).toBe('5936')
    expect(result.mandate_start).toBe('2019-02-01')
  })
})
