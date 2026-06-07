import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import type { Politician } from '@/types'

export const metadata: Metadata = {
  title: 'Políticos — Aprenda Política',
  description: 'Explore os políticos brasileiros por cargo e esfera de governo.',
}

const LEVELS = [
  { value: '', label: 'Todos' },
  { value: 'federal', label: 'Federal' },
  { value: 'state', label: 'Estadual' },
  { value: 'municipal', label: 'Municipal' },
]

interface PageProps {
  searchParams: { esfera?: string }
}

export default async function PoliticosPage({ searchParams }: PageProps) {
  const supabase = createServerSupabaseClient()
  const esfera = searchParams.esfera ?? ''

  let query = supabase
    .from('politicians')
    .select('*, party:parties(*), position:positions(*), state:states(*), municipality:municipalities(*)')
    .order('name')
    .limit(200)

  if (esfera) {
    query = query.eq('positions.level', esfera)
  }

  const { data: politicians } = await query

  const filtered = esfera
    ? (politicians ?? []).filter((p: any) => p.position?.level === esfera)
    : (politicians ?? [])

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Políticos</h1>
        <p className="text-gray-500 mb-6">
          {filtered.length} político{filtered.length !== 1 ? 's' : ''} cadastrado{filtered.length !== 1 ? 's' : ''}
        </p>

        <div className="flex gap-2 mb-8 flex-wrap">
          {LEVELS.map(({ value, label }) => (
            <Link
              key={value}
              href={value ? `/politicos?esfera=${value}` : '/politicos'}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                esfera === value
                  ? 'bg-[#00A859] text-white border-[#00A859]'
                  : 'border-gray-200 text-gray-600 hover:border-[#00A859] hover:text-[#00A859]'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(filtered as Politician[]).map((p) => (
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
                <div className="text-xs text-gray-400">
                  {p.state?.abbr ?? ''}
                  {p.municipality?.name ? ` · ${p.municipality.name}` : ''}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-16">Nenhum político encontrado nessa esfera.</p>
        )}
      </div>
    </main>
  )
}

export const revalidate = 3600
