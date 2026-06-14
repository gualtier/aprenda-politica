export type FonteId =
  | 'tse' | 'camara' | 'senado' | 'transparencia' | 'ibge'
  | 'osm' | 'editorial' | 'veiculo' | 'wikidata' | 'commons'

export interface FonteDef {
  id: FonteId
  nome: string
  sigla?: string
  domain?: string
  licenca: string
  hrefFor?: (extId: string | null) => string | null
}

export const FONTES: Record<FonteId, FonteDef> = {
  tse: {
    id: 'tse', nome: 'Tribunal Superior Eleitoral', sigla: 'TSE',
    domain: 'tse.jus.br', licenca: 'Dados públicos',
    hrefFor: () => 'https://www.tse.jus.br',
  },
  camara: {
    id: 'camara', nome: 'Câmara dos Deputados', sigla: 'Câmara',
    domain: 'camara.leg.br', licenca: 'Dados abertos',
    hrefFor: (id) => id ? `https://www.camara.leg.br/deputados/${id}` : null,
  },
  senado: {
    id: 'senado', nome: 'Senado Federal', sigla: 'Senado',
    domain: 'senado.leg.br', licenca: 'Dados abertos',
    hrefFor: (id) => id ? `https://www25.senado.leg.br/web/senadores/senador/-/perfil/${id}` : null,
  },
  transparencia: {
    id: 'transparencia', nome: 'Portal da Transparência', sigla: 'CGU',
    domain: 'portaldatransparencia.gov.br', licenca: 'Dados públicos',
    hrefFor: () => 'https://portaldatransparencia.gov.br/emendas',
  },
  ibge: {
    id: 'ibge', nome: 'IBGE', sigla: 'IBGE',
    domain: 'ibge.gov.br', licenca: 'Dados públicos',
    hrefFor: () => 'https://www.ibge.gov.br',
  },
  osm: {
    id: 'osm', nome: 'OpenStreetMap', sigla: 'OSM',
    domain: 'openstreetmap.org', licenca: 'ODbL',
    hrefFor: () => 'https://www.openstreetmap.org/copyright',
  },
  editorial: {
    id: 'editorial', nome: 'Aprenda Política', licenca: 'Conteúdo próprio',
  },
  veiculo: {
    id: 'veiculo', nome: 'Veículo de imprensa', licenca: 'do veículo',
  },
  wikidata: {
    id: 'wikidata', nome: 'Wikidata', sigla: 'Wikidata',
    domain: 'wikidata.org', licenca: 'CC0',
    hrefFor: (qid) => qid ? `https://www.wikidata.org/wiki/${qid}` : null,
  },
  commons: {
    id: 'commons', nome: 'Wikimedia Commons', sigla: 'Commons',
    domain: 'commons.wikimedia.org', licenca: 'CC BY-SA',
  },
}

export function getFonte(id: FonteId): FonteDef {
  return FONTES[id]
}

export function fonteLogo(domain?: string): string | null {
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null
}
