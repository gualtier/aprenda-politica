import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import { parse } from 'csv-parse/sync'

const SUPABASE_URL = 'https://agsfkmxgklkhhmwxtdzo.supabase.co'
const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// ── Load CSVs ─────────────────────────────────────────────────────────────────

function loadCsv(path) {
  if (!fs.existsSync(path)) return []
  const content = fs.readFileSync(path)
  return parse(content, { delimiter: ';', columns: true, skip_empty_lines: true, bom: true })
}

// Social media by SQ_CANDIDATO: { [sq]: string[] }
function buildSocialMap(...csvPaths) {
  const map = {}
  for (const path of csvPaths) {
    for (const row of loadCsv(path)) {
      const sq = row.SQ_CANDIDATO?.trim()
      const url = row.DS_URL?.trim()
      if (sq && url && url !== '#NULO#') {
        if (!map[sq]) map[sq] = []
        if (!map[sq].includes(url)) map[sq].push(url)
      }
    }
  }
  return map
}

// Candidate info by SQ_CANDIDATO: { [sq]: { occupation, education, name } }
function buildCandMap(...csvPaths) {
  const map = {}
  for (const path of csvPaths) {
    for (const row of loadCsv(path)) {
      const sq = row.SQ_CANDIDATO?.trim()
      if (sq && !map[sq]) {
        map[sq] = {
          name: row.NM_URNA_CANDIDATO?.trim() || row.NM_CANDIDATO?.trim(),
          civilName: row.NM_CANDIDATO?.trim(),
          occupation: row.DS_OCUPACAO?.trim(),
          education: row.DS_GRAU_INSTRUCAO?.trim(),
        }
      }
    }
  }
  return map
}

// Build name→SQ map for camara cross-reference (from ES 2022)
function buildNameToSqMap(csvPath) {
  const map = {}
  for (const row of loadCsv(csvPath)) {
    const name = row.NM_CANDIDATO?.trim().toUpperCase()
    if (name) map[name] = row.SQ_CANDIDATO?.trim()
  }
  return map
}

// ── Detect platform from URL ──────────────────────────────────────────────────

function detectPlatform(url) {
  const u = url.toLowerCase()
  if (u.includes('instagram.com')) return 'instagram'
  if (u.includes('facebook.com') || u.includes('fb.com')) return 'facebook'
  if (u.includes('twitter.com') || u.includes('x.com') || u.includes('twiter.com') || u.includes('tter.com')) return 'twitter'
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube'
  if (u.includes('tiktok.com')) return 'tiktok'
  if (u.includes('linkedin.com')) return 'linkedin'
  if (u.includes('t.me') || u.includes('telegram')) return 'telegram'
  if (u.includes('whatsapp')) return 'whatsapp'
  if (u.includes('@')) return null // email, skip
  return 'website'
}

function buildSocialLinks(urls) {
  const seen = new Set()
  const links = []
  for (const url of (urls || [])) {
    const platform = detectPlatform(url)
    if (!platform) continue
    const key = platform === 'website' ? url : platform
    if (seen.has(key)) continue
    seen.add(key)
    links.push({ platform, url })
  }
  // Sort: website last
  return links.sort((a, b) => {
    const order = ['instagram', 'twitter', 'facebook', 'tiktok', 'youtube', 'linkedin', 'telegram', 'website']
    return (order.indexOf(a.platform) ?? 99) - (order.indexOf(b.platform) ?? 99)
  })
}

// ── Main ──────────────────────────────────────────────────────────────────────

// 1. Load social maps
console.log('Loading social media data...')
const socialFederal = buildSocialMap('/tmp/redes_2022_BR/rede_social_candidato_2022_BR.csv')
const socialState22 = buildSocialMap('/tmp/redes_2022_ES/rede_social_candidato_2022_ES.csv')
const socialMuni24  = buildSocialMap('/tmp/redes_2024/rede_social_candidato_2024_ES.csv')

// 2. Load candidate info maps (occupation, education)
console.log('Loading candidate info data...')
const candEs22 = buildCandMap('/tmp/cand_2022/consulta_cand_2022_ES.csv')

// Download and extract 2024 municipal candidates if needed
let candEs24 = {}
const cand2024Path = '/tmp/cand_2024/consulta_cand_2024_ES.csv'
if (fs.existsSync(cand2024Path)) {
  candEs24 = buildCandMap(cand2024Path)
}

// 3. Name→SQ map to cross-ref camara deputies
const nameToSq = buildNameToSqMap('/tmp/cand_2022/consulta_cand_2022_ES.csv')

// Known name mappings for camara deputies (civil name in TSE → DB name)
const CAMARA_CIVIL_NAMES = {
  'jack-rocha':         'JACKELINE OLIVEIRA ROCHA',
  'helder-salomao':     'HELDER IGNÁCIO SALOMÃO',
  'da-vitoria':         'JOSIAS MARIO DA VITÓRIA',
  'evair-vieira-de-melo': 'EVAIR VIEIRA DE MELO',
  'gilson-daniel':      'GILSON DANIEL BATISTA',
  'gilvan-da-federal':  'GILVAN AGUIAR COSTA',
  'messias-donato':     'MANOEL MESSIAS DONATO BEZERRA',
  'amaro-neto':         'AMARO ROCHA NASCIMENTO NETO',
  'paulo-foletto':      'PAULO ROBERTO FOLETTO',
  'dr-victor-linhalis': 'VICTOR GAROZI LINHALIS',
}

// 4. Fetch all politicians
const { data: politicians } = await supabase
  .from('politicians')
  .select('id, name, slug, source, external_id')

console.log(`Processing ${politicians.length} politicians...`)

let updated = 0
for (const pol of politicians) {
  let sq = pol.external_id  // for TSE politicians, external_id IS the SQ_CANDIDATO
  let socialUrls = []
  let candInfo = null

  if (pol.source === 'camara') {
    // For camara deputies, resolve SQ via civil name lookup
    const civilName = CAMARA_CIVIL_NAMES[pol.slug]
    if (civilName) {
      sq = nameToSq[civilName]
    }
    if (sq) {
      socialUrls = socialFederal[sq] || []
      candInfo = candEs22[sq]
    }
  } else if (pol.source === 'senado') {
    // Senators: try BR federal social
    // Match by name - senators are in the federal election
    // Try to find in candEs22 by searching for senator names
    // Senators in 2022 ES federal election
    const SENADO_NAMES = {
      'fabiano-contarato': 'FABIANO CONTARATO',
      'marcos-do-val':     'MARCOS DO VAL',
      'magno-malta':       'MAGNO MALTA',
    }
    const senName = SENADO_NAMES[pol.slug]
    if (senName) {
      // Search in nameToSq (Senadores would be cargo=5)
      const senSq = Object.entries(nameToSq).find(([n]) => n.includes(senName.split(' ')[0]) && n.includes(senName.split(' ').slice(-1)[0]))?.[1]
      if (senSq) {
        socialUrls = socialFederal[senSq] || []
        candInfo = candEs22[senSq]
      }
    }
  } else if (pol.source === 'tse') {
    // For TSE politicians: use external_id directly as SQ_CANDIDATO
    // State deputies are in 2022 social, prefeitos/vereadores in 2024
    socialUrls = [
      ...(socialState22[sq] || []),
      ...(socialMuni24[sq] || []),
    ]
    candInfo = candEs22[sq] || candEs24[sq]
  }

  const social_links = buildSocialLinks(socialUrls)
  const occupation = candInfo?.occupation || null

  if (social_links.length > 0 || occupation) {
    const { error } = await supabase
      .from('politicians')
      .update({ social_links, occupation })
      .eq('id', pol.id)

    if (error) {
      console.error(`  ✗ ${pol.name}:`, error.message)
    } else {
      updated++
      if (social_links.length > 0) {
        console.log(`  ✓ ${pol.name}: ${social_links.map(s => s.platform).join(', ')} | ${occupation || '—'}`)
      }
    }
  }
}

console.log(`\nDone. Updated ${updated} politicians.`)
