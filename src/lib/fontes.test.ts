import { describe, it, expect } from 'vitest'
import { FONTES, getFonte, fonteLogo, type FonteId } from './fontes'

describe('fontes', () => {
  it('toda fonte tem nome e licenca', () => {
    for (const [id, f] of Object.entries(FONTES)) {
      expect(f.nome, `${id} sem nome`).toBeTruthy()
      expect(f.licenca, `${id} sem licenca`).toBeTruthy()
    }
  })
  it('getFonte resolve ids conhecidos', () => {
    expect(getFonte('tse').sigla).toBe('TSE')
    expect(getFonte('camara').nome).toContain('Câmara')
  })
  it('fonteLogo retorna favicon p/ domain e null sem domain', () => {
    expect(fonteLogo('tse.jus.br')).toContain('s2/favicons')
    expect(fonteLogo(undefined)).toBeNull()
  })
  it('hrefFor gera URL http(s) válida quando definido', () => {
    const camara = getFonte('camara')
    expect(camara.hrefFor?.('220530')).toMatch(/^https:\/\/.+220530/)
    const editorial = getFonte('editorial')
    expect(editorial.hrefFor).toBeUndefined()
  })
})
