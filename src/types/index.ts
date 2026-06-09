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
  full_name?: string | null
  slug?: string | null
  ideology?: string | null
  spectrum_position?: number | null
  logo_url?: string | null
  tse_number?: number | null
  website?: string | null
  foundation_year?: number | null
  description?: string | null
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
  bio?: string | null
  proposals?: Array<{ title: string; description: string }> | null
  spectrum_position?: number | null
  occupation?: string | null
  social_links?: Array<{ platform: string; url: string }> | null
  government_plan_url?: string | null
  birth_date?: string | null
  gender?: string | null
  education?: string | null
  race?: string | null
  marital_status?: string | null
  birth_state?: string | null
  email?: string | null
  party?: Party
  position?: Position
  state?: State
  municipality?: Municipality
}

export interface PropositionAuthor {
  author_name: string
  politician_id: number | null
  role: string | null
  ordem: number | null
  politician?: { name: string; slug: string } | null
}

export interface Proposition {
  id: number
  source: string
  external_id: string
  type: string
  number: number | null
  year: number | null
  title: string | null
  summary: string | null
  presented_on: string | null
  status: string | null
  themes: string[] | null
  url: string | null
  party_ids: number[] | null
  slug: string
  authors?: PropositionAuthor[]
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
