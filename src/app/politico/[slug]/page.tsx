import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { formatMandate } from '@/lib/utils'
import type { Politician } from '@/types'

interface PageProps { params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('politicians')
    .select('name, position:positions(name)')
    .eq('slug', params.slug)
    .single()
  if (!data) return {}
  const pos = (data.position as unknown as { name: string } | null)
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

  const stateHref = politician.state ? `/${politician.state.slug}` : '/'
  const muniHref = politician.state && politician.municipality
    ? `/${politician.state.slug}/${politician.municipality.slug}`
    : stateHref

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
          { label: '🇧🇷 Brasil', href: '/' },
          ...(politician.state ? [{ label: politician.state.name, href: stateHref }] : []),
          ...(politician.municipality ? [{ label: politician.municipality.name, href: muniHref }] : []),
          { label: politician.name },
        ]} />

        <div className="flex flex-col sm:flex-row gap-6 items-start mt-4">
          <Avatar name={politician.name} photoUrl={politician.photo_url} size={120} />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{politician.name}</h1>
            {politician.position && (
              <div className="text-lg text-gray-600 mt-1">{politician.position.name}</div>
            )}
            {politician.party && (
              <div
                className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold"
                style={{ background: `${politician.party.color_hex}22`, color: politician.party.color_hex }}
              >
                {politician.party.name} ({politician.party.abbr})
              </div>
            )}
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-4">
          {politician.mandate_start && (
            <div className="bg-gray-50 rounded-lg p-4">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mandato</dt>
              <dd className="text-lg font-bold mt-1">{formatMandate(politician.mandate_start, politician.mandate_end)}</dd>
            </div>
          )}
          {politician.state && (
            <div className="bg-gray-50 rounded-lg p-4">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</dt>
              <dd className="text-lg font-bold mt-1">{politician.state.name}</dd>
            </div>
          )}
          {politician.position && (
            <div className="bg-gray-50 rounded-lg p-4">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Esfera</dt>
              <dd className="text-lg font-bold mt-1 capitalize">
                {politician.position.level === 'federal' ? 'Federal' : politician.position.level === 'state' ? 'Estadual' : 'Municipal'}
              </dd>
            </div>
          )}
          {politician.municipality && (
            <div className="bg-gray-50 rounded-lg p-4">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Município</dt>
              <dd className="text-lg font-bold mt-1">{politician.municipality.name}</dd>
            </div>
          )}
        </dl>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  )
}

export const revalidate = 86400
