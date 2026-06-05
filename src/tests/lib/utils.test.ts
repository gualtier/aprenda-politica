import { describe, it, expect } from 'vitest'
import { slugify, getInitials, formatMandate } from '@/lib/utils'

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Espírito Santo')).toBe('espirito-santo')
  })
  it('handles accented characters', () => {
    expect(slugify('João Pessoa')).toBe('joao-pessoa')
  })
  it('handles multiple spaces', () => {
    expect(slugify('São Paulo  ')).toBe('sao-paulo')
  })
})

describe('getInitials', () => {
  it('returns first and last initial', () => {
    expect(getInitials('Lorenzo Pazolini')).toBe('LP')
  })
  it('returns single initial for one name', () => {
    expect(getInitials('Lula')).toBe('L')
  })
})

describe('formatMandate', () => {
  it('formats start and end year', () => {
    expect(formatMandate('2021-01-01', '2024-12-31')).toBe('2021–2024')
  })
  it('shows "presente" when no end date', () => {
    expect(formatMandate('2021-01-01', null)).toBe('2021–presente')
  })
})
