import { describe, it, expect } from 'vitest'
import { classifyTopics, TOPICS, getTopic } from './topics'

describe('classifyTopics', () => {
  it('classifica saúde', () => {
    expect(classifyTopics('Cria programa de vacinação no SUS', '', [])).toContain('saude')
  })
  it('classifica por keyword nos themes (sem acento/caixa)', () => {
    expect(classifyTopics('Dispõe sobre matéria', '', ['Educação', 'Escola'])).toContain('educacao')
  })
  it('pode ter múltiplos temas', () => {
    const t = classifyTopics('Educação ambiental nas escolas', '', [])
    expect(t).toEqual(expect.arrayContaining(['educacao', 'meio-ambiente']))
  })
  it('retorna vazio quando nada casa', () => {
    expect(classifyTopics('Altera dispositivo da Lei X', '', [])).toEqual([])
  })
})

describe('TOPICS', () => {
  it('tem 15 temas com slug único', () => {
    expect(TOPICS).toHaveLength(15)
    expect(new Set(TOPICS.map(t => t.slug)).size).toBe(15)
  })
  it('getTopic acha por slug', () => {
    expect(getTopic('saude')?.label).toBe('Saúde')
    expect(getTopic('inexistente')).toBeUndefined()
  })
})
