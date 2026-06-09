import { describe, it, expect } from 'vitest'
import { formatPropositionLabel } from './propositions'

describe('formatPropositionLabel', () => {
  it('monta TIPO Nº/ANO', () => {
    expect(formatPropositionLabel({ type: 'PL', number: 1853, year: 2026 })).toBe('PL 1853/2026')
  })
  it('cai pro tipo quando falta número', () => {
    expect(formatPropositionLabel({ type: 'PEC', number: null, year: 2023 })).toBe('PEC 2023')
  })
})
