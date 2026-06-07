import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://agsfkmxgklkhhmwxtdzo.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Câmara API ────────────────────────────────────────────────────────────────

async function fetchCamaraBio(externalId) {
  const r = await fetch(`https://dadosabertos.camara.leg.br/api/v2/deputados/${externalId}`)
  if (!r.ok) return null
  const { dados } = await r.json()
  return dados
}

async function fetchCamaraProposals(externalId) {
  // Only fetch substantive proposal types, not requerimentos/recursos
  const TYPES = ['PL', 'PEC', 'PLP', 'PDC', 'IND', 'REL', 'MPV']
  const url = `https://dadosabertos.camara.leg.br/api/v2/proposicoes?idDeputadoAutor=${externalId}&itens=20&ordem=DESC&ordenarPor=id`
  const r = await fetch(url)
  if (!r.ok) return []
  const { dados } = await r.json()
  return (dados ?? [])
    .filter(p => TYPES.includes(p.siglaTipo))
    .slice(0, 5)
    .map(p => ({
      title: `${p.siglaTipo} ${p.numero}/${p.ano}`,
      description: p.ementa,
      date: p.dataApresentacao?.slice(0, 10) ?? null,
      type: p.siglaTipo,
    }))
}

function buildCamaraBio(dados, partyAbbr, stateName) {
  if (!dados) return null
  const parts = []

  const civil = dados.nomeCivil
  const electoral = dados.ultimoStatus?.nomeEleitoral
  if (civil && civil !== electoral) parts.push(`Nome civil: ${civil}.`)

  if (dados.dataNascimento) {
    const [y, m, d] = dados.dataNascimento.split('-')
    const born = `${d}/${m}/${y}`
    const city = dados.municipioNascimento
    const uf = dados.ufNascimento
    if (city && uf) parts.push(`Nascido(a) em ${city}–${uf} em ${born}.`)
    else parts.push(`Nascido(a) em ${born}.`)
  }

  if (dados.escolaridade) {
    const edu = {
      'Fundamental incompleto': 'Ensino fundamental incompleto',
      'Fundamental completo': 'Ensino fundamental completo',
      'Médio incompleto': 'Ensino médio incompleto',
      'Médio completo': 'Ensino médio completo',
      'Superior incompleto': 'Ensino superior incompleto',
      'Superior completo': 'Ensino superior completo',
      'Especialização': 'Especialização',
      'Mestrado': 'Mestrado',
      'Doutorado': 'Doutorado',
    }[dados.escolaridade] ?? dados.escolaridade
    parts.push(`Formação: ${edu}.`)
  }

  if (dados.sexo === 'F') {
    parts.push(`Deputada Federal pelo ${partyAbbr ?? ''} pelo estado do ${stateName ?? ''}.`)
  } else {
    parts.push(`Deputado Federal pelo ${partyAbbr ?? ''} pelo estado do ${stateName ?? ''}.`)
  }

  const email = dados.ultimoStatus?.gabinete?.email
  if (email) parts.push(`Contato: ${email}.`)

  return parts.join(' ')
}

// ── Senado API ────────────────────────────────────────────────────────────────

async function fetchSenadoBio(externalId) {
  const r = await fetch(`https://legis.senado.leg.br/dadosabertos/senador/${externalId}`, {
    headers: { Accept: 'application/json' },
  })
  if (!r.ok) return null
  const data = await r.json()
  return data?.DetalheParlamentar?.Parlamentar ?? null
}

async function fetchSenadoProposals(externalId) {
  const r = await fetch(
    `https://legis.senado.leg.br/dadosabertos/senador/${externalId}/autorias`,
    { headers: { Accept: 'application/json' } }
  )
  if (!r.ok) return []
  const data = await r.json()
  const raw = data?.MateriasAutoriaParlamentar?.Parlamentar?.Autorias?.Autoria ?? []
  const items = Array.isArray(raw) ? raw : [raw]
  const TYPES = ['PL', 'PEC', 'PLS', 'PLP', 'PDL', 'PDS']
  return items
    .map(a => a.Materia)
    .filter(m => m && TYPES.includes(m.Sigla))
    .slice(0, 5)
    .map(m => ({
      title: `${m.Sigla} ${m.Numero}/${m.Ano}`,
      description: m.Ementa ?? '',
      date: m.Data ?? null,
      type: m.Sigla,
    }))
}

function buildSenadoBio(senador, partyAbbr, stateName) {
  if (!senador) return null
  const parts = []
  const ident = senador.IdentificacaoParlamentar
  const dados = senador.DadosBasicosParlamentar
  const sexo = ident?.SexoParlamentar

  if (dados?.DataNascimento) {
    const [y, m, d] = dados.DataNascimento.split('-')
    const born = `${d}/${m}/${y}`
    const city = dados.Naturalidade
    const uf = dados.UfNaturalidade
    if (city && uf) parts.push(`Nascido(a) em ${city}–${uf} em ${born}.`)
    else parts.push(`Nascido(a) em ${born}.`)
  }

  if (sexo === 'Feminino') {
    parts.push(`Senadora pelo ${partyAbbr ?? ''} pelo estado do ${stateName ?? ''}.`)
  } else {
    parts.push(`Senador pelo ${partyAbbr ?? ''} pelo estado do ${stateName ?? ''}.`)
  }

  const email = ident?.EmailParlamentar
  if (email) parts.push(`Contato: ${email}.`)

  return parts.join(' ')
}

// ── Main ──────────────────────────────────────────────────────────────────────

const filterSource = process.argv[2] // optional: 'camara' | 'senado'

const query = supabase
  .from('politicians')
  .select('id, name, source, external_id, party:parties(abbr), state:states(name)')
  .in('source', filterSource ? [filterSource] : ['camara', 'senado'])

const { data: politicians } = await query

console.log(`Found ${politicians.length} politicians to enrich`)

for (const pol of politicians) {
  const partyAbbr = pol.party?.abbr
  const stateName = pol.state?.name
  let bio = null
  let proposals = []

  if (pol.source === 'camara') {
    console.log(`  ← Câmara ${pol.external_id}: ${pol.name}`)
    const dados = await fetchCamaraBio(pol.external_id)
    bio = buildCamaraBio(dados, partyAbbr, stateName)
    proposals = await fetchCamaraProposals(pol.external_id)
    await new Promise(r => setTimeout(r, 300)) // rate limit

  } else if (pol.source === 'senado') {
    console.log(`  ← Senado ${pol.external_id}: ${pol.name}`)
    const senador = await fetchSenadoBio(pol.external_id)
    bio = buildSenadoBio(senador, partyAbbr, stateName)
    proposals = await fetchSenadoProposals(pol.external_id)
    await new Promise(r => setTimeout(r, 300))
  }

  const { error } = await supabase
    .from('politicians')
    .update({ bio, proposals })
    .eq('id', pol.id)

  if (error) {
    console.error(`  ✗ Error updating ${pol.name}:`, error.message)
  } else {
    console.log(`  ✓ Updated ${pol.name}: bio=${bio ? bio.length + ' chars' : 'null'}, proposals=${proposals.length}`)
  }
}

console.log('\nDone.')
