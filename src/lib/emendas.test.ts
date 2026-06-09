import { describe, it, expect } from 'vitest'
import { formatMoney } from './emendas'

describe('formatMoney', () => {
  it('formata reais em escala legível', () => {
    expect(formatMoney(10000)).toBe('R$ 10 mil')
    expect(formatMoney(1500000)).toBe('R$ 1,5 mi')
    expect(formatMoney(2300000000)).toBe('R$ 2,3 bi')
    expect(formatMoney(500)).toBe('R$ 500')
    expect(formatMoney(0)).toBe('R$ 0')
  })
})
