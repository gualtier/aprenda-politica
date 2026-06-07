import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Partidos — Aprenda Política',
  description: 'Diretório de partidos políticos brasileiros com informações, ideologia e políticos filiados.',
}

const IDEOLOGY_ORDER = ['Esquerda', 'Centro-Esquerda', 'Centro', 'Centro-Direita', 'Direita']

const IDEOLOGY_COLOR: Record<string, string> = {
  'Esquerda':       'bg-red-50 text-red-700 border-red-200',
  'Centro-Esquerda':'bg-orange-50 text-orange-700 border-orange-200',
  'Centro':         'bg-gray-50 text-gray-600 border-gray-200',
  'Centro-Direita': 'bg-blue-50 text-blue-700 border-blue-200',
  'Direita':        'bg-indigo-50 text-indigo-700 border-indigo-200',
}

export default async function PartidosPage() {
  const supabase = createServerSupabaseClient()

  const [{ data: parties }, { data: polCounts }] = await Promise.all([
    supabase
      .from('parties')
      .select('id, abbr, slug, full_name, color_hex, ideology, tse_number, foundation_year, logo_url')
      .not('slug', 'is', null)
      .order('full_name'),
    supabase
      .from('politicians')
      .select('party_id'),
  ])

  const counts: Record<number, number> = {}
  for (const p of polCounts ?? []) {
    counts[p.party_id] = (counts[p.party_id] ?? 0) + 1
  }

  // deduplicate by slug (REP + REPUBLICANOS share slug prefix)
  const seen = new Set<string>()
  const unique = (parties ?? []).filter(p => {
    if (!p.slug || seen.has(p.slug)) return false
    seen.add(p.slug)
    return true
  })

  const byIdeology = IDEOLOGY_ORDER.map(ideology => ({
    ideology,
    parties: unique
      .filter(p => p.ideology === ideology)
      .sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0)),
  })).filter(g => g.parties.length > 0)

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Breadcrumb items={[
          { label: 'Brasil', href: '/' },
          { label: 'Partidos' },
        ]} />

        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Partidos</h1>
        <p className="text-gray-500 mb-10">
          {unique.length} partidos políticos registrados no TSE.
        </p>

        <div className="space-y-10">
          {byIdeology.map(({ ideology, parties: group }) => (
            <section key={ideology}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                {ideology}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {group.map(party => {
                  const count = counts[party.id] ?? 0
                  return (
                    <Link
                      key={party.slug}
                      href={`/partidos/${party.slug}`}
                      className="group flex items-center gap-4 border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      {/* Logo or color badge */}
                      <div
                        className="w-12 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                        style={{ backgroundColor: party.logo_url ? 'transparent' : party.color_hex }}
                      >
                        {party.logo_url ? (
                          <img
                            src={party.logo_url}
                            alt={party.abbr}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-white text-xs font-bold">{party.tse_number ?? party.abbr.slice(0,2)}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm group-hover:text-gray-700">
                            {party.abbr}
                          </span>
                          {party.ideology && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${IDEOLOGY_COLOR[party.ideology] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                              {party.ideology}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate mt-0.5">{party.full_name}</div>
                        {count > 0 && (
                          <div className="text-xs text-gray-400 mt-0.5">{count.toLocaleString('pt-BR')} políticos</div>
                        )}
                      </div>
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
