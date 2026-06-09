import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Avatar } from '@/components/ui/Avatar'
import { SpectrumBar } from '@/components/ui/SpectrumBar'
import { propositionsByParty, formatPropositionLabel } from '@/lib/propositions'

interface PageProps { params: { slug: string } }

const POSITION_ORDER = ['governador', 'senador', 'deputado-federal', 'deputado-estadual', 'prefeito', 'vereador']
const POSITION_LABEL: Record<string, string> = {
  'governador':         'Governadores',
  'senador':            'Senadores',
  'deputado-federal':   'Deputados Federais',
  'deputado-estadual':  'Deputados Estaduais',
  'prefeito':           'Prefeitos',
  'vereador':           'Vereadores',
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('parties').select('full_name, abbr').eq('slug', params.slug).single()
  if (!data) return {}
  return {
    title: `${data.abbr} — ${data.full_name} — Aprenda Política`,
    description: `Conheça o ${data.full_name} (${data.abbr}): história, ideologia e políticos filiados.`,
  }
}

export default async function PartidoPage({ params }: PageProps) {
  const supabase = createServerSupabaseClient()

  const { data: party } = await supabase
    .from('parties')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!party) notFound()

  const { data: politicians } = await supabase
    .from('politicians')
    .select('id, name, slug, photo_url, position:positions(name, slug), state:states(name, abbr, slug), municipality:municipalities(name, slug)')
    .eq('party_id', party.id)
    .order('name')

  type PolRow = {
    id: number; name: string; slug: string; photo_url: string | null
    position: { name: string; slug: string } | null
    state: { name: string; abbr: string; slug: string } | null
    municipality: { name: string; slug: string } | null
  }

  const pols = (politicians ?? []) as unknown as PolRow[]
  const totalCount = pols.length

  // Group by position
  const byPosition: Record<string, PolRow[]> = {}
  for (const p of pols) {
    const slug = p.position?.slug ?? 'outros'
    if (!byPosition[slug]) byPosition[slug] = []
    byPosition[slug].push(p)
  }

  const sections = POSITION_ORDER
    .filter(slug => byPosition[slug]?.length > 0)
    .map(slug => ({ slug, label: POSITION_LABEL[slug], pols: byPosition[slug] }))

  const partyPropositions = await propositionsByParty(party.id, 5)

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: 'Brasil', href: '/' },
          { label: 'Partidos', href: '/partidos' },
          { label: party.abbr },
        ]} />

        {/* Header */}
        <div className="flex items-center gap-5 mt-4 mb-8">
          <div
            className="w-20 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow overflow-hidden p-2"
            style={{ backgroundColor: party.logo_url ? '#f9fafb' : party.color_hex }}
          >
            {party.logo_url ? (
              <img src={party.logo_url} alt={party.abbr} className="w-full h-full object-contain" />
            ) : (
              <span className="text-white font-black text-2xl">{party.tse_number ?? party.abbr.slice(0, 2)}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {party.abbr}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">{party.full_name}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {party.ideology && (
                <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600">
                  {party.ideology}
                </span>
              )}
              {party.foundation_year && (
                <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600">
                  Fundado em {party.foundation_year}
                </span>
              )}
              {party.tse_number && (
                <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600">
                  Número {party.tse_number}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats + website */}
        <div className="flex flex-wrap gap-3 mb-8">
          {totalCount > 0 && (
            <div className="border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
              <div className="text-2xl font-bold text-gray-900">{totalCount.toLocaleString('pt-BR')}</div>
              <div className="text-xs text-gray-500">Políticos cadastrados</div>
            </div>
          )}
          {sections.map(s => (
            <div key={s.slug} className="border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
              <div className="text-2xl font-bold text-gray-900">{s.pols.length}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {party.website && (
          <a
            href={party.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-verde-500 hover:underline mb-8"
          >
            {party.website.replace('https://', '')}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}

        {/* Political spectrum */}
        {party.ideology && (
          <div className="border border-gray-100 rounded-2xl p-5 mb-8 max-w-md">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Posicionamento político
            </div>
            <SpectrumBar ideology={party.ideology} showIdeologyBadge={false} />
          </div>
        )}

        {party.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-2xl">
            {party.description}
          </p>
        )}

        {/* Politicians by position */}
        {sections.length > 0 ? (
          <div className="space-y-8">
            {sections.map(({ slug, label, pols: group }) => (
              <section key={slug}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  {label} · {group.length}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.map(pol => {
                    const href = `/politico/${pol.slug}`
                    const locationLabel = pol.municipality
                      ? `${pol.municipality.name} · ${pol.state?.abbr}`
                      : pol.state?.name

                    return (
                      <Link
                        key={pol.id}
                        href={href}
                        className="flex items-center gap-3 border border-gray-100 rounded-xl px-3 py-2.5 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <Avatar name={pol.name} photoUrl={pol.photo_url} size={36} />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate leading-tight">
                            {pol.name}
                          </div>
                          {locationLabel && (
                            <div className="text-xs text-gray-400 truncate mt-0.5">
                              {locationLabel}
                            </div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Nenhum político cadastrado ainda para este partido.</p>
        )}

        {partyPropositions.length > 0 && (
          <section className="mt-8 mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Proposições do partido</h2>
            <div className="space-y-2">
              {partyPropositions.map(pr => (
                <Link key={pr.id} href={`/proposicoes/${pr.slug}`} className="block border border-gray-200 rounded-xl p-3 hover:border-gray-400 transition-colors">
                  <span className="text-xs font-bold text-verde-500">{formatPropositionLabel(pr)}</span>
                  <p className="text-sm text-gray-700 line-clamp-2 mt-0.5">{pr.title}</p>
                </Link>
              ))}
            </div>
            <Link href={`/proposicoes?partido=${params.slug}`} className="inline-block mt-3 text-sm text-verde-500 font-medium hover:underline">
              Ver todas →
            </Link>
          </section>
        )}
      </div>
    </main>
  )
}

export const revalidate = 86400
