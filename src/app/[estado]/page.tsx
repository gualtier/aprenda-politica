import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

interface PageProps { params: { estado: string } }

const STATE_CAPITALS: Record<string, string> = {
  AC:'Rio Branco', AL:'Maceió', AM:'Manaus', AP:'Macapá', BA:'Salvador',
  CE:'Fortaleza', DF:'Brasília', ES:'Vitória', GO:'Goiânia', MA:'São Luís',
  MG:'Belo Horizonte', MS:'Campo Grande', MT:'Cuiabá', PA:'Belém',
  PB:'João Pessoa', PE:'Recife', PI:'Teresina', PR:'Curitiba',
  RJ:'Rio de Janeiro', RN:'Natal', RO:'Porto Velho', RR:'Boa Vista',
  RS:'Porto Alegre', SC:'Florianópolis', SE:'Aracaju', SP:'São Paulo',
  TO:'Palmas',
}

const POSITION_LABELS: Record<string, string> = {
  'prefeito':         'Prefeitos',
  'vereador':         'Vereadores',
  'deputado-estadual':'Dep. Estaduais',
  'deputado-federal': 'Dep. Federais',
  'senador':          'Senadores',
  'governador':       'Governadores',
}

const POSITION_ORDER = [
  'deputado-federal',
  'deputado-estadual',
  'senador',
  'prefeito',
  'vereador',
]

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  const { data: state } = await supabase
    .from('states').select('name').eq('slug', params.estado).single()
  const name = state?.name ?? params.estado.replace(/-/g, ' ')
  return {
    title: `${name} — Aprenda Política`,
    description: `Explore o organograma político de ${name}: municípios, governador, deputados e senadores.`,
  }
}

export default async function EstadoPage({ params }: PageProps) {
  const supabase = createServerSupabaseClient()

  const { data: state } = await supabase
    .from('states').select('*').eq('slug', params.estado).single()
  if (!state) notFound()

  const [{ data: municipalities }, { data: politicians }, govPositionResult] = await Promise.all([
    supabase.from('municipalities').select('name, slug').eq('state_id', state.id).order('name'),
    supabase.from('politicians')
      .select('name, position:positions(name, slug), party:parties(abbr)')
      .eq('state_id', state.id),
    supabase.from('positions').select('id').eq('slug', 'governador').single(),
  ])

  // Count by position slug
  const positionCounts: Record<string, number> = {}
  for (const p of politicians ?? []) {
    const slug = (p.position as unknown as { slug: string } | null)?.slug
    if (slug) positionCounts[slug] = (positionCounts[slug] ?? 0) + 1
  }

  // Governor
  type Politician = {
    name: string
    position: { name: string; slug: string } | null
    party: { abbr: string } | null
  }
  const governor = govPositionResult.data
    ? (politicians ?? []).find(p =>
        (p.position as unknown as { slug: string } | null)?.slug === 'governador'
      ) as Politician | undefined
    : undefined

  const capital = STATE_CAPITALS[state.abbr] ?? ''
  const muniCount = (municipalities ?? []).length

  const stats = [
    { label: 'Municípios', value: muniCount, href: null },
    ...POSITION_ORDER
      .filter(slug => positionCounts[slug] > 0)
      .map(slug => ({
        label: POSITION_LABELS[slug],
        value: positionCounts[slug],
        href: null,
      })),
  ]

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: 'Brasil', href: '/' },
          { label: 'Estados', href: '/estados' },
          { label: state.name },
        ]} />

        {/* Header */}
        <div className="flex items-center gap-4 mt-4 mb-6">
          <img
            src={`/flags/states/${state.abbr}.svg`}
            alt={`Bandeira ${state.name}`}
            className="w-16 h-11 object-cover rounded shadow"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{state.name}</h1>
            {capital && (
              <p className="text-sm text-gray-500 mt-0.5">Capital: {capital}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
            {stats.map(stat => (
              <div
                key={stat.label}
                className="border border-gray-100 rounded-xl px-4 py-3 bg-gray-50"
              >
                <div className="text-2xl font-bold text-gray-900 tabular-nums">
                  {stat.value.toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Governor */}
        {governor && (
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 mb-8 bg-white">
            <div className="w-8 h-8 rounded-full bg-verde-500/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-verde-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Governador</div>
              <div className="text-sm font-semibold text-gray-800 leading-tight">
                {governor.name}
                {governor.party?.abbr && (
                  <span className="font-normal text-gray-400"> · {governor.party.abbr}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Municipality list */}
        {muniCount > 0 ? (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Municípios
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {(municipalities ?? []).map((m) => (
                <Link
                  key={m.slug}
                  href={`/${params.estado}/${m.slug}`}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:border-verde-500 hover:text-verde-500 transition-colors"
                >
                  {m.name}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-sm">
            Dados em sincronização. Em breve os municípios estarão disponíveis.
          </p>
        )}
      </div>
    </main>
  )
}

export const revalidate = 86400
