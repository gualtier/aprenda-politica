import { describe, it, expect } from 'vitest'
import type { Politician, OrganogramData } from '@/types'

describe('types', () => {
  it('Politician type has required fields', () => {
    const p: Politician = {
      id: 1, name: 'Test', slug: 'test',
      photo_url: null, party_id: null, position_id: null,
      mandate_start: null, mandate_end: null,
      state_id: null, municipality_id: null,
      external_id: null, source: null,
    }
    expect(p.name).toBe('Test')
  })

  it('OrganogramData has federal, estadual, municipal', () => {
    const data: OrganogramData = {
      state: { id: 1, name: 'Espírito Santo', slug: 'espirito-santo', abbr: 'ES', ibge_code: 32 },
      municipality: null,
      federal: { executive: [], legislative: { camara: [], senado: [] } },
      estadual: { executive: [], legislative: [] },
      municipal: null,
    }
    expect(data.federal.legislative.camara).toEqual([])
  })
})
