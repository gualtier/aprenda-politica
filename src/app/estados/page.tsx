import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Estados — Aprenda Política',
  description: 'Explore o organograma político de cada estado brasileiro.',
}

type Region = 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul'

const STATE_META: Record<string, { capital: string; region: Region }> = {
  AC: { capital: 'Rio Branco',       region: 'Norte' },
  AL: { capital: 'Maceió',           region: 'Nordeste' },
  AM: { capital: 'Manaus',           region: 'Norte' },
  AP: { capital: 'Macapá',           region: 'Norte' },
  BA: { capital: 'Salvador',         region: 'Nordeste' },
  CE: { capital: 'Fortaleza',        region: 'Nordeste' },
  DF: { capital: 'Brasília',         region: 'Centro-Oeste' },
  ES: { capital: 'Vitória',          region: 'Sudeste' },
  GO: { capital: 'Goiânia',          region: 'Centro-Oeste' },
  MA: { capital: 'São Luís',         region: 'Nordeste' },
  MG: { capital: 'Belo Horizonte',   region: 'Sudeste' },
  MS: { capital: 'Campo Grande',     region: 'Centro-Oeste' },
  MT: { capital: 'Cuiabá',           region: 'Centro-Oeste' },
  PA: { capital: 'Belém',            region: 'Norte' },
  PB: { capital: 'João Pessoa',      region: 'Nordeste' },
  PE: { capital: 'Recife',           region: 'Nordeste' },
  PI: { capital: 'Teresina',         region: 'Nordeste' },
  PR: { capital: 'Curitiba',         region: 'Sul' },
  RJ: { capital: 'Rio de Janeiro',   region: 'Sudeste' },
  RN: { capital: 'Natal',            region: 'Nordeste' },
  RO: { capital: 'Porto Velho',      region: 'Norte' },
  RR: { capital: 'Boa Vista',        region: 'Norte' },
  RS: { capital: 'Porto Alegre',     region: 'Sul' },
  SC: { capital: 'Florianópolis',    region: 'Sul' },
  SE: { capital: 'Aracaju',          region: 'Nordeste' },
  SP: { capital: 'São Paulo',        region: 'Sudeste' },
  TO: { capital: 'Palmas',           region: 'Norte' },
}

const REGION_ORDER: Region[] = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']

const REGION_COLOR: Record<Region, string> = {
  'Norte':        'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Nordeste':     'bg-amber-50 text-amber-700 border-amber-200',
  'Centro-Oeste': 'bg-purple-50 text-purple-700 border-purple-200',
  'Sudeste':      'bg-blue-50 text-blue-700 border-blue-200',
  'Sul':          'bg-rose-50 text-rose-700 border-rose-200',
}

export default async function EstadosPage() {
  const supabase = createServerSupabaseClient()

  const [{ data: states }, { data: govPosition }] = await Promise.all([
    supabase.from('states').select('id, name, slug, abbr').order('name'),
    supabase.from('positions').select('id').eq('slug', 'governador').single(),
  ])

  const stateIds = (states ?? []).map(s => s.id)

  const [muniResult, polResult, govResult] = await Promise.all([
    supabase
      .from('municipalities')
      .select('state_id')
      .in('state_id', stateIds),
    supabase
      .from('politicians')
      .select('state_id')
      .in('state_id', stateIds),
    govPosition
      ? supabase
          .from('politicians')
          .select('name, state_id, party:parties(abbr)')
          .eq('position_id', govPosition.id)
      : Promise.resolve({ data: [] }),
  ])

  const muniCounts: Record<string, number> = {}
  for (const m of muniResult.data ?? []) {
    muniCounts[m.state_id] = (muniCounts[m.state_id] ?? 0) + 1
  }

  const polCounts: Record<string, number> = {}
  for (const p of polResult.data ?? []) {
    polCounts[p.state_id] = (polCounts[p.state_id] ?? 0) + 1
  }

  type GovernorRow = { name: string; state_id: string; party: { abbr: string } | null }
  const governors: Record<string, GovernorRow> = {}
  for (const g of (govResult.data ?? []) as unknown as GovernorRow[]) {
    governors[g.state_id] = g
  }

  type EnrichedState = {
    id: string; name: string; slug: string; abbr: string
    capital: string; region: Region
    muniCount: number; polCount: number
    governor?: GovernorRow
  }

  const enriched: EnrichedState[] = (states ?? []).map(s => ({
    ...s,
    capital: STATE_META[s.abbr]?.capital ?? '',
    region: STATE_META[s.abbr]?.region ?? 'Norte',
    muniCount: muniCounts[s.id] ?? 0,
    polCount: polCounts[s.id] ?? 0,
    governor: governors[s.id],
  }))

  const byRegion = REGION_ORDER.map(region => ({
    region,
    states: enriched.filter(s => s.region === region),
  }))

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Estados</h1>
        <p className="text-gray-500 mb-10">
          Selecione um estado para explorar seus municípios e organogramas políticos.
        </p>

        <div className="space-y-10">
          {byRegion.map(({ region, states: regionStates }) => (
            <section key={region}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                {region}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {regionStates.map(s => {
                  const govName = s.governor
                    ? s.governor.name.split(' ').slice(0, 2).join(' ')
                    : null
                  return (
                    <Link
                      key={s.slug}
                      href={`/${s.slug}`}
                      className="group flex flex-col border border-gray-200 rounded-xl p-4 hover:border-[#00A859] hover:bg-[#00A859]/5 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <img
                          src={`/flags/states/${s.abbr}.svg`}
                          alt={`Bandeira ${s.name}`}
                          className="w-12 h-8 object-cover rounded shadow-sm shrink-0"
                        />
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${REGION_COLOR[s.region]}`}>
                          {s.abbr}
                        </span>
                      </div>

                      <div className="font-semibold text-gray-900 group-hover:text-[#00A859] leading-tight">
                        {s.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{s.capital}</div>

                      {(s.muniCount > 0 || s.polCount > 0) && (
                        <div className="text-xs text-gray-500 mt-2 flex gap-2 flex-wrap">
                          {s.muniCount > 0 && (
                            <span>{s.muniCount.toLocaleString('pt-BR')} municípios</span>
                          )}
                          {s.polCount > 0 && (
                            <span>{s.polCount.toLocaleString('pt-BR')} políticos</span>
                          )}
                        </div>
                      )}

                      {govName && (
                        <div className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">
                          <span className="text-gray-400">Gov.</span>
                          <span className="font-medium">{govName}</span>
                          {s.governor?.party?.abbr && (
                            <span className="text-gray-400">· {s.governor.party.abbr}</span>
                          )}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}

export const revalidate = 86400
