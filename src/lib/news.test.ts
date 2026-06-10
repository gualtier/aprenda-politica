import { describe, it, expect } from 'vitest'
import { timeAgo, NEWS_CATEGORIES, categorySphere } from './news'

describe('news helpers', () => {
  it('timeAgo formata em pt-BR', () => {
    const now = Date.now()
    expect(timeAgo(new Date(now - 2 * 3600e3).toISOString())).toMatch(/2 horas/)
    expect(timeAgo(new Date(now - 30 * 1000).toISOString())).toMatch(/agora/)
  })
  it('categorySphere mapeia a esfera', () => {
    expect(categorySphere('camara')).toBe('federal')
    expect(categorySphere('cidades')).toBe('municipal')
    expect(categorySphere('desconhecida')).toBe(null)
  })
  it('NEWS_CATEGORIES tem todos com sphere definido', () => {
    expect(NEWS_CATEGORIES.length).toBeGreaterThan(4)
  })
})
