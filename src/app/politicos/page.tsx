import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import { PoliticosFilters } from '@/components/politicos/PoliticosFilters'
import type { Politician } from '@/types'

export const metadata: Metadata = {
  title: 'Políticos — Aprenda Política',
  description: 'Explore os políticos brasileiros por estado, cidade, cargo e partido.',
}

const RESULT_LIMIT = 300

// Ordem hierárquica dos cargos
const CARGO_RANK: Record<string, number> = {
  presidente: 1, governador: 2, senador: 3, 'deputado-federal': 4,
  'deputado-estadual': 5, prefeito: 6, vereador: 7,
}

interface PageProps {
  searchParams: { estado?: string; cargo?: string; partido?: string; cidade?: string }
}

export default async function PoliticosPage({ searchParams }: PageProps) {
  const supabase = createServerSupabaseClient()
  const { estado = '', cargo = '', partido = '', cidade = '' } = searchParams

  // Listas de opções
  const [{ data: states }, { data: positions }, { data: parties }] = await Promise.all([
    supabase.from('states').select('id, slug, name, abbr').order('name'),
    supabase.from('positions').select('id, slug, name, level'),
    supabase.from('parties').select('id, abbr, name').order('abbr'),
  ])

  const selState = estado ? (states ?? []).find(s => s.slug === estado) : null

  // Municípios só do estado selecionado
  let municipalities: { id: number; slug: string; name: string }[] = []
  if (selState) {
    const { data } = await supabase
      .from('municipalities').select('id, slug, name').eq('state_id', selState.id).order('name')
    municipalities = data ?? []
  }
  const selCity = cidade ? municipalities.find(m => m.slug === cidade) : null
  const selPosition = cargo ? (positions ?? []).find(p => p.slug === cargo) : null
  const selParty = partido ? (parties ?? []).find(p => p.abbr === partido) : null

  // Query filtrada (colunas de ID em politicians)
  let query = supabase
    .from('politicians')
    .select('*, party:parties(*), position:positions(*), state:states(*), municipality:municipalities(*)', { count: 'exact' })
  if (selState) query = query.eq('state_id', selState.id)
  if (selCity) query = query.eq('municipality_id', selCity.id)
  if (selPosition) query = query.eq('position_id', selPosition.id)
  if (selParty) query = query.eq('party_id', selParty.id)

  const { data: politicians, count } = await query.order('name').limit(RESULT_LIMIT)
  const list = (politicians ?? []) as Politician[]
  const total = count ?? list.length

  const sortedPositions = [...(positions ?? [])].sort(
    (a, b) => (CARGO_RANK[a.slug] ?? 99) - (CARGO_RANK[b.slug] ?? 99)
  )

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Políticos</h1>
        <p className="text-gray-500 mb-6">
          {total.toLocaleString('pt-BR')} político{total !== 1 ? 's' : ''}
          {total > list.length ? ` · mostrando ${list.length}` : ''}
        </p>

        <PoliticosFilters
          states={(states ?? []).map(s => ({ value: s.slug, label: s.name }))}
          municipalities={municipalities.map(m => ({ value: m.slug, label: m.name }))}
          positions={sortedPositions.map(p => ({ value: p.slug, label: p.name }))}
          parties={(parties ?? []).filter(p => p.abbr).map(p => ({ value: p.abbr, label: `${p.abbr} — ${p.name}` }))}
          current={{ estado, cargo, partido, cidade }}
        />

        {list.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {list.map(p => (
              <Link
                key={p.id}
                href={`/politico/${p.slug}`}
                className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 hover:border-[#00A859] hover:bg-[#00A859]/5 transition-colors group"
              >
                <Avatar name={p.name} photoUrl={p.photo_url} size={44} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 group-hover:text-[#00A859] truncate">
                    {p.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {p.position?.name ?? '—'}
                    {p.party?.abbr ? ` · ${p.party.abbr}` : ''}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {p.state?.abbr ?? ''}
                    {p.municipality?.name ? ` · ${p.municipality.name}` : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-16">Nenhum político encontrado com esses filtros.</p>
        )}

        {total > list.length && (
          <p className="text-center text-xs text-gray-400 mt-8">
            Refine os filtros (estado, cidade, cargo, partido) para ver resultados mais específicos.
          </p>
        )}
      </div>
    </main>
  )
}

export const revalidate = 3600
