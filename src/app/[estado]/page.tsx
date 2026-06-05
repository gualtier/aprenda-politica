import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

interface PageProps { params: { estado: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: `${params.estado.replace(/-/g, ' ')} — Aprenda Política` }
}

export default async function EstadoPage({ params }: PageProps) {
  const supabase = createServerSupabaseClient()

  const { data: state } = await supabase
    .from('states').select('*').eq('slug', params.estado).single()
  if (!state) notFound()

  const { data: municipalities } = await supabase
    .from('municipalities')
    .select('name, slug')
    .eq('state_id', state.id)
    .order('name')

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: '🇧🇷 Brasil', href: '/' },
          { label: state.name },
        ]} />

        <h1 className="text-3xl font-bold mb-2">{state.name}</h1>
        <p className="text-gray-500 mb-8">
          Selecione um município para ver o organograma político completo.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {(municipalities ?? []).map((m) => (
            <Link
              key={m.slug}
              href={`/${params.estado}/${m.slug}`}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#009c3b] hover:text-[#009c3b] transition-colors"
            >
              {m.name}
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

export const revalidate = 86400
