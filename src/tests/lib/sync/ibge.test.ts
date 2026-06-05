import { describe, it, expect } from 'vitest'
import { parseIbgeState, parseIbgeMunicipality } from '@/lib/sync/ibge'

describe('parseIbgeState', () => {
  it('converts IBGE state object to DB row', () => {
    const raw = { id: 32, nome: 'Espírito Santo', sigla: 'ES' }
    const result = parseIbgeState(raw)
    expect(result).toEqual({
      name: 'Espírito Santo',
      slug: 'espirito-santo',
      abbr: 'ES',
      ibge_code: 32,
    })
  })
})

describe('parseIbgeMunicipality', () => {
  it('converts IBGE municipality object to DB row', () => {
    const raw = { id: 3205309, nome: 'Vitória' }
    const result = parseIbgeMunicipality(raw, 1)
    expect(result).toEqual({
      name: 'Vitória',
      slug: 'vitoria',
      ibge_code: 3205309,
      state_id: 1,
      population: null,
    })
  })
})
