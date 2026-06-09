import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { SpectrumBar } from '@/components/ui/SpectrumBar'
import { formatMandate } from '@/lib/utils'
import { propositionsByPolitician, formatPropositionLabel } from '@/lib/propositions'
import type { Politician } from '@/types'

interface PageProps { params: { slug: string } }

const SOCIAL_STYLES: Record<string, string> = {
  instagram: 'bg-pink-50 text-pink-600 border-pink-200',
  twitter:   'bg-sky-50 text-sky-600 border-sky-200',
  facebook:  'bg-blue-50 text-blue-700 border-blue-200',
  youtube:   'bg-red-50 text-red-600 border-red-200',
  tiktok:    'bg-gray-900 text-white border-gray-800',
  linkedin:  'bg-blue-50 text-blue-800 border-blue-300',
  telegram:  'bg-cyan-50 text-cyan-700 border-cyan-200',
  website:   'bg-gray-50 text-gray-600 border-gray-200',
}
const SOCIAL_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  twitter:   'Twitter / X',
  facebook:  'Facebook',
  youtube:   'YouTube',
  tiktok:    'TikTok',
  linkedin:  'LinkedIn',
  telegram:  'Telegram',
  website:   'Site oficial',
}

function externalLink(source: string | null, externalId: string | null) {
  if (!source || !externalId) return null
  if (source === 'camara') return {
    label: 'Ver na Câmara dos Deputados',
    href: `https://www.camara.leg.br/deputados/${externalId}`,
  }
  if (source === 'senado') return {
    label: 'Ver no Senado Federal',
    href: `https://www25.senado.leg.br/web/senadores/senador/-/perfil/${externalId}`,
  }
  return null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('politicians')
    .select('name, position:positions(name)')
    .eq('slug', params.slug)
    .single()
  if (!data) return {}
  const pos = data.position as unknown as { name: string } | null
  return { title: `${data.name} — ${pos?.name ?? ''} — Aprenda Política` }
}

export default async function PoliticoPage({ params }: PageProps) {
  const supabase = createServerSupabaseClient()
  const { data: p } = await supabase
    .from('politicians')
    .select('*, party:parties(*), position:positions(*), state:states(*), municipality:municipalities(*)')
    .eq('slug', params.slug)
    .single()

  if (!p) notFound()
  const politician = p as Politician

  const propositions = await propositionsByPolitician(politician.id, 5)

  const stateHref = politician.state ? `/${politician.state.slug}` : '/estados'
  const muniHref = politician.state && politician.municipality
    ? `/${politician.state.slug}/${politician.municipality.slug}`
    : stateHref

  // Colleagues scope: municipality-level positions use municipality filter
  const isMunicipalLevel = politician.position?.level === 'municipal'
  const colleagueScope = isMunicipalLevel && politician.municipality_id
    ? { column: 'municipality_id', value: politician.municipality_id }
    : politician.state_id
    ? { column: 'state_id', value: politician.state_id }
    : null

  const [partyColleaguesResult, positionColleaguesResult] = await Promise.all([
    colleagueScope && politician.party_id
      ? supabase
          .from('politicians')
          .select('id, name, slug, photo_url, position:positions(name, slug), party:parties(abbr, color_hex)')
          .eq(colleagueScope.column, colleagueScope.value)
          .eq('party_id', politician.party_id)
          .neq('id', politician.id)
          .limit(8)
      : Promise.resolve({ data: [] }),
    colleagueScope && politician.position_id
      ? supabase
          .from('politicians')
          .select('id, name, slug, photo_url, party:parties(abbr, color_hex)')
          .eq(colleagueScope.column, colleagueScope.value)
          .eq('position_id', politician.position_id)
          .neq('id', politician.id)
          .limit(8)
      : Promise.resolve({ data: [] }),
  ])

  type ColleagueRow = {
    id: number; name: string; slug: string; photo_url: string | null
    position?: { name: string; slug: string } | null
    party?: { abbr: string; color_hex: string } | null
  }

  const partyColleagues = (partyColleaguesResult.data ?? []) as unknown as ColleagueRow[]
  const positionColleagues = (positionColleaguesResult.data ?? []) as unknown as ColleagueRow[]

  const extLink = externalLink(politician.source, politician.external_id)
  const positionLevel = politician.position?.level === 'federal' ? 'Federal'
    : politician.position?.level === 'state' ? 'Estadual' : 'Municipal'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: politician.name,
    jobTitle: politician.position?.name,
    memberOf: politician.party?.name,
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: 'Brasil', href: '/' },
          ...(politician.state ? [{ label: politician.state.name, href: stateHref }] : []),
          ...(politician.municipality ? [{ label: politician.municipality.name, href: muniHref }] : []),
          { label: politician.name },
        ]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-6 items-start mt-4 mb-8">
          <div className="shrink-0">
            <Avatar name={politician.name} photoUrl={politician.photo_url} size={120} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {politician.name}
            </h1>
            {politician.position && (
              <div className="text-base text-gray-500 mt-1">{politician.position.name}</div>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {politician.party && (
                <span
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{ background: `${politician.party.color_hex}22`, color: politician.party.color_hex }}
                >
                  {politician.party.abbr}
                </span>
              )}
              {politician.state && (
                <Link
                  href={stateHref}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={`/flags/states/${politician.state.abbr}.svg`}
                    alt={politician.state.abbr}
                    className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                  />
                  <span className="text-xs font-medium text-gray-600">{politician.state.abbr}</span>
                </Link>
              )}
              {politician.municipality && (
                <Link
                  href={muniHref}
                  className="text-xs text-gray-500 px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {politician.municipality.name}
                </Link>
              )}
            </div>
            {extLink && (
              <a
                href={extLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-verde-500 hover:underline"
              >
                {extLink.label}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            {politician.social_links && politician.social_links.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {politician.social_links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-opacity hover:opacity-80 ${SOCIAL_STYLES[link.platform] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}
                  >
                    {SOCIAL_LABEL[link.platform] ?? link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {politician.position && (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Esfera</div>
              <div className="text-sm font-bold text-gray-800 mt-1">{positionLevel}</div>
            </div>
          )}
          {politician.position && (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Poder</div>
              <div className="text-sm font-bold text-gray-800 mt-1 capitalize">
                {politician.position.branch === 'executive' ? 'Executivo'
                  : politician.position.branch === 'legislative' ? 'Legislativo' : 'Judiciário'}
              </div>
            </div>
          )}
          {politician.mandate_start && (
            <div className="bg-gray-50 rounded-xl p-3 col-span-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mandato</div>
              <div className="text-sm font-bold text-gray-800 mt-1">
                {formatMandate(politician.mandate_start, politician.mandate_end)}
              </div>
            </div>
          )}
          {politician.occupation && (
            <div className="bg-gray-50 rounded-xl p-3 col-span-2 sm:col-span-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ocupação declarada ao TSE</div>
              <div className="text-sm font-bold text-gray-800 mt-1 capitalize">
                {politician.occupation.toLowerCase().replace(/\(exceto.*?\)/i, '').trim()}
              </div>
            </div>
          )}
        </div>

        {/* Political spectrum */}
        {(politician.spectrum_position != null || politician.party?.ideology) && (
          <section className="mb-8 border border-gray-100 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Posicionamento político
            </h2>
            <SpectrumBar
              position={politician.spectrum_position}
              ideology={politician.party?.ideology}
              showIdeologyBadge
            />
            {!politician.spectrum_position && politician.party?.ideology && (
              <p className="text-[10px] text-gray-400 mt-3 text-center">
                Baseado no posicionamento do {politician.party.abbr}
              </p>
            )}
          </section>
        )}

        {/* Perfil — dados estruturados (TSE / Câmara / Senado) */}
        {(() => {
          const age = politician.birth_date
            ? Math.floor((Date.now() - new Date(politician.birth_date).getTime()) / 31_557_600_000)
            : null
          const items = [
            age != null && age > 0 && age < 120 && { label: 'Idade', value: `${age} anos` },
            politician.education && { label: 'Escolaridade', value: politician.education },
            politician.race && { label: 'Cor/raça', value: politician.race },
            politician.marital_status && { label: 'Estado civil', value: politician.marital_status },
            politician.birth_state && { label: 'Naturalidade', value: politician.birth_state },
          ].filter(Boolean) as Array<{ label: string; value: string }>
          if (items.length === 0) return null
          return (
            <section className="mb-8">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Perfil</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {items.map(it => (
                  <div key={it.label} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{it.label}</div>
                    <div className="text-sm font-bold text-gray-800 mt-1">{it.value}</div>
                  </div>
                ))}
              </div>
            </section>
          )
        })()}

        {/* Proposições (autoria) */}
        {propositions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Proposições</h2>
            <div className="space-y-2">
              {propositions.map(pr => (
                <Link key={pr.id} href={`/proposicoes/${pr.slug}`} className="block border border-gray-200 rounded-xl p-3 hover:border-gray-400 transition-colors">
                  <span className="text-xs font-bold text-verde-500">{formatPropositionLabel(pr)}</span>
                  <p className="text-sm text-gray-700 line-clamp-2 mt-0.5">{pr.title}</p>
                </Link>
              ))}
            </div>
            <Link href={`/proposicoes?autor=${politician.slug}`} className="inline-block mt-3 text-sm text-verde-500 font-medium hover:underline">
              Ver todas as proposições →
            </Link>
          </section>
        )}

        {/* Proposta de governo (executive) */}
        {politician.government_plan_url && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Proposta de governo
            </h2>
            <a
              href={politician.government_plan_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl border border-verde-500/30 bg-verde-500/5 text-verde-500 hover:bg-verde-500/10 transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Baixar proposta de governo (PDF · TSE)
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </section>
        )}

        {/* Proposals (legislative) */}
        {politician.proposals && politician.proposals.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Propostas legislativas
            </h2>
            <div className="space-y-2">
              {politician.proposals.map((prop, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4">
                  <div className="text-sm font-semibold text-gray-800">{prop.title}</div>
                  {prop.description && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{prop.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Position colleagues */}
        {positionColleagues.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              {isMunicipalLevel
                ? `Outros ${politician.position?.name ?? 'políticos'} em ${politician.municipality?.name ?? ''}`
                : `Outros ${politician.position?.name ?? 'políticos'} — ${politician.state?.abbr ?? ''}`}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {positionColleagues.map(c => (
                <Link
                  key={c.id}
                  href={`/politico/${c.slug}`}
                  className="flex items-center gap-2 border border-gray-100 rounded-xl px-3 py-2 hover:border-verde-500 hover:bg-verde-500/5 transition-colors"
                >
                  <Avatar name={c.name} photoUrl={c.photo_url} size={32} />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-800 truncate leading-tight">
                      {c.name.split(' ').slice(0, 2).join(' ')}
                    </div>
                    {c.party?.abbr && (
                      <div className="text-[10px] text-gray-400">{c.party.abbr}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Party colleagues */}
        {partyColleagues.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              {`Outros do ${politician.party?.abbr ?? 'partido'} — ${politician.state?.abbr ?? ''}`}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {partyColleagues.map(c => (
                <Link
                  key={c.id}
                  href={`/politico/${c.slug}`}
                  className="flex items-center gap-2 border border-gray-100 rounded-xl px-3 py-2 hover:border-verde-500 hover:bg-verde-500/5 transition-colors"
                >
                  <Avatar name={c.name} photoUrl={c.photo_url} size={32} />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-800 truncate leading-tight">
                      {c.name.split(' ').slice(0, 2).join(' ')}
                    </div>
                    {c.position?.name && (
                      <div className="text-[10px] text-gray-400 truncate">{c.position.name}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  )
}

export const revalidate = 86400
