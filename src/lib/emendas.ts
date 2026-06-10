import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface Emenda {
  id: number
  codigo: string
  ano: number | null
  numero: string | null
  tipo: string | null
  tipo_grupo: string | null
  autor_nome: string | null
  politician_id: number | null
  funcao: string | null
  subfuncao: string | null
  localidade_raw: string | null
  municipality_id: number | null
  uf: string | null
  valor_empenhado: number
  valor_liquidado: number
  valor_pago: number
  politician?: { slug: string; photo_url: string | null; party: { abbr: string; color_hex: string | null } | null } | null
  municipality?: { slug: string; name: string; state: { slug: string } | null } | null
}

const SELECT = 'id, codigo, ano, numero, tipo, tipo_grupo, autor_nome, politician_id, funcao, subfuncao, localidade_raw, municipality_id, uf, valor_empenhado, valor_liquidado, valor_pago, politician:politicians(slug, photo_url, party:parties(abbr, color_hex)), municipality:municipalities(slug, name, state:states(slug))'

/** Valor em reais → "R$ 1,2 mi" / "R$ 10 mil" / "R$ 500". */
export function formatMoney(reais: number): string {
  const v = reais || 0
  if (v >= 1e9) return `R$ ${(v / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} bi`
  if (v >= 1e6) return `R$ ${(v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`
  if (v >= 1e3) return `R$ ${Math.round(v / 1e3).toLocaleString('pt-BR')} mil`
  return `R$ ${Math.round(v).toLocaleString('pt-BR')}`
}

const TIPO_GRUPO_LABEL: Record<string, string> = {
  individual: 'Individual', bancada: 'De bancada', comissao: 'De comissão', relator: 'De relator', outro: 'Outra',
}
export const tipoGrupoLabel = (g: string | null) => TIPO_GRUPO_LABEL[g ?? 'outro'] ?? 'Emenda'

/** Cor de acento por tipo de emenda. */
const TIPO_GRUPO_COLOR: Record<string, string> = {
  individual: '#0D9488', bancada: '#2563EB', comissao: '#7c3aed', relator: '#CC9900', outro: '#6b7280',
}
export const tipoGrupoColor = (g: string | null) => TIPO_GRUPO_COLOR[g ?? 'outro'] ?? '#6b7280'

/** funcao do orçamento → slug de tema (cross-link). */
const FUNCAO_TEMA: Record<string, string> = {
  'Saúde': 'saude', 'Educação': 'educacao', 'Segurança pública': 'seguranca',
  'Gestão ambiental': 'meio-ambiente', 'Trabalho': 'trabalho', 'Agricultura': 'agro',
  'Transporte': 'transporte', 'Urbanismo': 'transporte', 'Assistência social': 'mulher',
  'Desporto e lazer': 'cultura-esporte', 'Cultura': 'cultura-esporte',
}
export const funcaoToTema = (funcao: string | null): string | null => FUNCAO_TEMA[funcao ?? ''] ?? null

export interface EmendaFilter {
  ano?: string; uf?: string; municipio?: string; funcao?: string; tipo?: string; autor?: string; q?: string
  page?: number; pageSize?: number
}

/** Lista emendas com filtros. */
export async function listEmendas(f: EmendaFilter): Promise<{ items: Emenda[]; total: number }> {
  const supabase = createServerSupabaseClient()
  const pageSize = f.pageSize ?? 30
  const page = f.page ?? 1
  let q = supabase.from('emendas').select(SELECT, { count: 'exact' })
  if (f.ano) q = q.eq('ano', Number(f.ano))
  if (f.uf) q = q.eq('uf', f.uf)
  if (f.funcao) q = q.eq('funcao', f.funcao)
  if (f.tipo) q = q.eq('tipo_grupo', f.tipo)
  if (f.q) q = q.ilike('autor_nome', `%${f.q}%`)
  if (f.municipio) {
    const { data: m } = await supabase.from('municipalities').select('id').eq('slug', f.municipio).single()
    if (m) q = q.eq('municipality_id', m.id)
  }
  if (f.autor) {
    const { data: p } = await supabase.from('politicians').select('id').eq('slug', f.autor).single()
    q = p ? q.eq('politician_id', p.id) : q.eq('id', -1)
  }
  q = q.order('valor_pago', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1)
  const { data, count } = await q
  return { items: (data as unknown as Emenda[]) ?? [], total: count ?? 0 }
}

export interface PoliticianEmendas {
  totalPago: number
  totalEmpenhado: number
  count: number
  topMunicipios: { name: string; slug: string; uf: string | null; pago: number }[]
  topFuncoes: { funcao: string; pago: number }[]
}

/** Agregado de emendas de um político (autor). */
export async function emendasByPolitician(politicianId: number): Promise<PoliticianEmendas | null> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('emendas')
    .select('valor_pago, valor_empenhado, funcao, municipality_id, municipality:municipalities(name, slug, state:states(abbr))')
    .eq('politician_id', politicianId).limit(10000)
  type Row = { valor_pago: number; valor_empenhado: number; funcao: string | null; municipality_id: number | null; municipality: { name: string; slug: string; state: { abbr: string } | null } | null }
  const rows = (data as unknown as Row[]) ?? []
  if (!rows.length) return null
  let totalPago = 0, totalEmpenhado = 0
  const muni = new Map<number, { name: string; slug: string; uf: string | null; pago: number }>()
  const func = new Map<string, number>()
  for (const r of rows) {
    totalPago += r.valor_pago; totalEmpenhado += r.valor_empenhado
    if (r.funcao) func.set(r.funcao, (func.get(r.funcao) ?? 0) + r.valor_pago)
    if (r.municipality_id && r.municipality) {
      const cur = muni.get(r.municipality_id) ?? { name: r.municipality.name, slug: r.municipality.slug, uf: r.municipality.state?.abbr ?? null, pago: 0 }
      cur.pago += r.valor_pago; muni.set(r.municipality_id, cur)
    }
  }
  const topMunicipios = Array.from(muni.values()).sort((a, b) => b.pago - a.pago).slice(0, 5)
  const topFuncoes = Array.from(func).map(([funcao, pago]) => ({ funcao, pago })).sort((a, b) => b.pago - a.pago).slice(0, 5)
  return { totalPago, totalEmpenhado, count: rows.length, topMunicipios, topFuncoes }
}

export interface MunicipalityEmendas {
  totalPago: number
  count: number
  topAutores: { name: string; slug: string | null; party_abbr: string | null; party_color: string | null; pago: number }[]
}

/** Agregado de emendas recebidas por um município. */
export async function emendasByMunicipality(municipalityId: number): Promise<MunicipalityEmendas | null> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('emendas')
    .select('valor_pago, autor_nome, politician_id, politician:politicians(name, slug, party:parties(abbr, color_hex))')
    .eq('municipality_id', municipalityId).limit(10000)
  type Row = { valor_pago: number; autor_nome: string | null; politician_id: number | null; politician: { name: string; slug: string; party: { abbr: string; color_hex: string | null } | null } | null }
  const rows = (data as unknown as Row[]) ?? []
  if (!rows.length) return null
  let totalPago = 0
  const aut = new Map<string, { name: string; slug: string | null; party_abbr: string | null; party_color: string | null; pago: number }>()
  for (const r of rows) {
    totalPago += r.valor_pago
    const key = r.politician_id ? `p${r.politician_id}` : `n${r.autor_nome}`
    const cur = aut.get(key) ?? {
      name: r.politician?.name ?? r.autor_nome ?? '—', slug: r.politician?.slug ?? null,
      party_abbr: r.politician?.party?.abbr ?? null, party_color: r.politician?.party?.color_hex ?? null, pago: 0,
    }
    cur.pago += r.valor_pago; aut.set(key, cur)
  }
  const topAutores = Array.from(aut.values()).sort((a, b) => b.pago - a.pago).slice(0, 6)
  return { totalPago, count: rows.length, topAutores }
}

/** Facetas pros filtros (anos e funções distintas). */
export async function emendaFacets(): Promise<{ anos: number[]; funcoes: string[] }> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('emendas').select('ano, funcao').limit(20000)
  const anos = Array.from(new Set((data ?? []).map(r => (r as { ano: number }).ano).filter(Boolean))).sort((a, b) => b - a)
  const funcoes = Array.from(new Set((data ?? []).map(r => (r as { funcao: string }).funcao).filter(Boolean))).sort()
  return { anos, funcoes }
}
