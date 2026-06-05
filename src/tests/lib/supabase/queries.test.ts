import { describe, it, expect, vi } from 'vitest'
import { buildOrganogramFromRows } from '@/lib/supabase/queries'
import type { Politician } from '@/types'

const makePolitician = (overrides: Partial<Politician>): Politician => ({
  id: 1, name: 'Test', slug: 'test', photo_url: null,
  party_id: null, position_id: null, mandate_start: null, mandate_end: null,
  state_id: 1, municipality_id: null, external_id: null, source: null,
  ...overrides,
})

describe('buildOrganogramFromRows', () => {
  it('splits politicians by level and branch', () => {
    const presidente = makePolitician({
      id: 1,
      name: 'Presidente Test',
      slug: 'presidente-test',
      position: { id: 1, name: 'Presidente', slug: 'presidente', level: 'federal', branch: 'executive', description: null },
      state: { id: 1, name: 'Espírito Santo', slug: 'espirito-santo', abbr: 'ES', ibge_code: 35 },
    })
    const deputado = makePolitician({
      id: 2,
      name: 'Deputado Test',
      slug: 'deputado-test',
      position: { id: 3, name: 'Deputado Federal', slug: 'deputado-federal', level: 'federal', branch: 'legislative', description: null },
    })
    const senador = makePolitician({
      id: 3,
      name: 'Senador Test',
      slug: 'senador-test',
      position: { id: 2, name: 'Senador', slug: 'senador', level: 'federal', branch: 'legislative', description: null },
    })

    const result = buildOrganogramFromRows([presidente, deputado, senador], null)

    expect(result.federal.executive).toHaveLength(1)
    expect(result.federal.executive[0].name).toBe('Presidente Test')
    expect(result.federal.legislative.camara).toHaveLength(1)
    expect(result.federal.legislative.senado).toHaveLength(1)
    expect(result.estadual.executive).toHaveLength(0)
    expect(result.estadual.legislative).toHaveLength(0)
    expect(result.municipal).toBeNull()
  })
})
