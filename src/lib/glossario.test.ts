import { describe, it, expect } from 'vitest'
import { TERMOS, CATEGORIAS, getTermo, termosPorLetra, afins, vizinhos } from './glossario'
import { getTopic } from './topics'

describe('glossario', () => {
  it('tem ~60+ termos com slugs únicos', () => {
    expect(TERMOS.length).toBeGreaterThanOrEqual(55)
    expect(new Set(TERMOS.map(t => t.slug)).size).toBe(TERMOS.length)
  })
  it('getTermo resolve e retorna undefined p/ inexistente', () => {
    expect(getTermo('pec')?.termo).toBe('PEC')
    expect(getTermo('nao-existe')).toBeUndefined()
  })
  it('todo relacionado aponta pra um termo existente', () => {
    const slugs = new Set(TERMOS.map(t => t.slug))
    for (const t of TERMOS) for (const r of t.relacionados) {
      expect(slugs.has(r), `${t.slug} → relacionado inexistente: ${r}`).toBe(true)
      expect(r).not.toBe(t.slug)
    }
  })
  it('todo tema aponta pra um topic existente', () => {
    for (const t of TERMOS) for (const tema of t.temas ?? []) {
      expect(getTopic(tema), `${t.slug} → tema inexistente: ${tema}`).toBeDefined()
    }
  })
  it('toda categoria usada existe em CATEGORIAS', () => {
    const ids = new Set(CATEGORIAS.map(c => c.id))
    for (const t of TERMOS) expect(ids.has(t.categoria), `${t.slug}: ${t.categoria}`).toBe(true)
  })
  it('todo termo tem conteúdo completo', () => {
    for (const t of TERMOS) {
      expect(t.definicaoCurta.length, t.slug).toBeGreaterThan(20)
      expect(t.definicao.length, t.slug).toBeGreaterThanOrEqual(2)
      expect(t.exemplo.length, t.slug).toBeGreaterThan(20)
    }
  })
  it('afins completa até 6 com a mesma categoria, sem o próprio termo', () => {
    const pec = getTermo('pec')!
    const a = afins(pec)
    expect(a.length).toBeGreaterThanOrEqual(3)
    expect(a.length).toBeLessThanOrEqual(6)
    expect(a.some(x => x.slug === 'pec')).toBe(false)
    expect(new Set(a.map(x => x.slug)).size).toBe(a.length)
  })
  it('termosPorLetra agrupa ordenado', () => {
    const grupos = termosPorLetra()
    const letras = grupos.map(([l]) => l)
    expect([...letras].sort()).toEqual(letras)
  })
  it('vizinhos navega em ordem alfabética', () => {
    const { prev, next } = vizinhos(getTermo('pec')!)
    expect(prev || next).toBeDefined()
  })
})
