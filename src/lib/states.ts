/**
 * Lista canônica das 27 unidades federativas do Brasil.
 * `munis` = nº real de municípios (IBGE); soma = 5.570.
 * `slug` segue o padrão de rota do app (/[estado]).
 */
export type Region = 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul'

export type UF = {
  abbr: string
  name: string
  slug: string
  capital: string
  region: Region
  munis: number
}

export const STATES: UF[] = [
  { abbr: 'AC', name: 'Acre',                slug: 'acre',                capital: 'Rio Branco',     region: 'Norte',        munis: 22 },
  { abbr: 'AL', name: 'Alagoas',             slug: 'alagoas',             capital: 'Maceió',         region: 'Nordeste',     munis: 102 },
  { abbr: 'AP', name: 'Amapá',               slug: 'amapa',               capital: 'Macapá',         region: 'Norte',        munis: 16 },
  { abbr: 'AM', name: 'Amazonas',            slug: 'amazonas',            capital: 'Manaus',         region: 'Norte',        munis: 62 },
  { abbr: 'BA', name: 'Bahia',               slug: 'bahia',               capital: 'Salvador',       region: 'Nordeste',     munis: 417 },
  { abbr: 'CE', name: 'Ceará',               slug: 'ceara',               capital: 'Fortaleza',      region: 'Nordeste',     munis: 184 },
  { abbr: 'DF', name: 'Distrito Federal',    slug: 'distrito-federal',    capital: 'Brasília',       region: 'Centro-Oeste', munis: 1 },
  { abbr: 'ES', name: 'Espírito Santo',      slug: 'espirito-santo',      capital: 'Vitória',        region: 'Sudeste',      munis: 78 },
  { abbr: 'GO', name: 'Goiás',               slug: 'goias',               capital: 'Goiânia',        region: 'Centro-Oeste', munis: 246 },
  { abbr: 'MA', name: 'Maranhão',            slug: 'maranhao',            capital: 'São Luís',       region: 'Nordeste',     munis: 217 },
  { abbr: 'MT', name: 'Mato Grosso',         slug: 'mato-grosso',         capital: 'Cuiabá',         region: 'Centro-Oeste', munis: 141 },
  { abbr: 'MS', name: 'Mato Grosso do Sul',  slug: 'mato-grosso-do-sul',  capital: 'Campo Grande',   region: 'Centro-Oeste', munis: 79 },
  { abbr: 'MG', name: 'Minas Gerais',        slug: 'minas-gerais',        capital: 'Belo Horizonte', region: 'Sudeste',      munis: 853 },
  { abbr: 'PA', name: 'Pará',                slug: 'para',                capital: 'Belém',          region: 'Norte',        munis: 144 },
  { abbr: 'PB', name: 'Paraíba',             slug: 'paraiba',             capital: 'João Pessoa',    region: 'Nordeste',     munis: 223 },
  { abbr: 'PR', name: 'Paraná',              slug: 'parana',              capital: 'Curitiba',       region: 'Sul',          munis: 399 },
  { abbr: 'PE', name: 'Pernambuco',          slug: 'pernambuco',          capital: 'Recife',         region: 'Nordeste',     munis: 185 },
  { abbr: 'PI', name: 'Piauí',               slug: 'piaui',               capital: 'Teresina',       region: 'Nordeste',     munis: 224 },
  { abbr: 'RJ', name: 'Rio de Janeiro',      slug: 'rio-de-janeiro',      capital: 'Rio de Janeiro', region: 'Sudeste',      munis: 92 },
  { abbr: 'RN', name: 'Rio Grande do Norte', slug: 'rio-grande-do-norte', capital: 'Natal',          region: 'Nordeste',     munis: 167 },
  { abbr: 'RS', name: 'Rio Grande do Sul',   slug: 'rio-grande-do-sul',   capital: 'Porto Alegre',   region: 'Sul',          munis: 497 },
  { abbr: 'RO', name: 'Rondônia',            slug: 'rondonia',            capital: 'Porto Velho',    region: 'Norte',        munis: 52 },
  { abbr: 'RR', name: 'Roraima',             slug: 'roraima',             capital: 'Boa Vista',      region: 'Norte',        munis: 15 },
  { abbr: 'SC', name: 'Santa Catarina',      slug: 'santa-catarina',      capital: 'Florianópolis',  region: 'Sul',          munis: 295 },
  { abbr: 'SP', name: 'São Paulo',           slug: 'sao-paulo',           capital: 'São Paulo',      region: 'Sudeste',      munis: 645 },
  { abbr: 'SE', name: 'Sergipe',             slug: 'sergipe',             capital: 'Aracaju',        region: 'Nordeste',     munis: 75 },
  { abbr: 'TO', name: 'Tocantins',           slug: 'tocantins',           capital: 'Palmas',         region: 'Norte',        munis: 139 },
]

/** Esferas do organograma — legenda de cores (federal/estadual/municipal). */
export const REGIONS: { name: Region; tone: string; ufs: number }[] = [
  { name: 'Norte',        tone: '#007A30', ufs: 7 },
  { name: 'Nordeste',     tone: '#CC9900', ufs: 9 },
  { name: 'Centro-Oeste', tone: '#00A859', ufs: 4 },
  { name: 'Sudeste',      tone: '#2255AA', ufs: 4 },
  { name: 'Sul',          tone: '#1d7a8c', ufs: 3 },
]
