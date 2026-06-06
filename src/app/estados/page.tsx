import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Estados — Aprenda Política',
  description: 'Explore o organograma político de cada estado brasileiro.',
}


export default async function EstadosPage() {
  const supabase = createServerSupabaseClient()
  const { data: states } = await supabase
    .from('states')
    .select('name, slug, abbr')
    .order('name')

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Estados</h1>
        <p className="text-gray-500 mb-8">
          Selecione um estado para explorar seus municípios e organogramas políticos.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {(states ?? []).map((s) => (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              className="group flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 hover:border-[#009c3b] hover:bg-[#009c3b]/5 transition-colors"
            >
              <img
                src={`/flags/states/${s.abbr}.svg`}
                alt={`Bandeira ${s.name}`}
                className="w-8 h-6 object-cover rounded-sm shrink-0 shadow-sm"
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800 group-hover:text-[#009c3b] truncate">
                  {s.name}
                </div>
                <div className="text-xs text-gray-400">{s.abbr}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

export const revalidate = 86400
