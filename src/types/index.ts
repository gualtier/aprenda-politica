export interface State {
  id: number
  name: string
  slug: string
  abbr: string
  ibge_code: number
}

export interface Municipality {
  id: number
  name: string
  slug: string
  state_id: number
  ibge_code: number
  population: number | null
  state?: State
}

export interface Party {
  id: number
  name: string
  abbr: string
  color_hex: string
}

export interface Position {
  id: number
  name: string
  slug: string
  level: 'federal' | 'state' | 'municipal'
  branch: 'executive' | 'legislative' | 'judicial'
  description: string | null
}

export interface Politician {
  id: number
  name: string
  slug: string
  photo_url: string | null
  party_id: number | null
  position_id: number | null
  mandate_start: string | null
  mandate_end: string | null
  state_id: number | null
  municipality_id: number | null
  external_id: string | null
  source: string | null
  party?: Party
  position?: Position
  state?: State
  municipality?: Municipality
}

export interface OrganogramData {
  state: State
  municipality: Municipality | null
  federal: {
    executive: Politician[]
    legislative: {
      camara: Politician[]
      senado: Politician[]
    }
  }
  estadual: {
    executive: Politician[]
    legislative: Politician[]
  }
  municipal: {
    executive: Politician[]
    legislative: Politician[]
  } | null
}

export interface SearchResult {
  type: 'municipality' | 'politician'
  slug: string
  name: string
  subtitle: string
  href: string
}
