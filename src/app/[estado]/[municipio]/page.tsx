import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getOrganogramData } from '@/lib/supabase/queries'
import { Organogram } from '@/components/organogram/Organogram'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

interface PageProps {
  params: { estado: string; municipio: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getOrganogramData(params.estado, params.municipio)
  if (!data) return {}
  const name = data.municipality?.name ?? data.state.name
  return {
    title: `${name} — Aprenda Política`,
    description: `Organograma político de ${name}: prefeito, vereadores, governador, deputados e senadores.`,
  }
}

export default async function MunicipioPage({ params }: PageProps) {
  const data = await getOrganogramData(params.estado, params.municipio)
  if (!data) notFound()

  const municipioName = data.municipality?.name ?? data.state.name

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: municipioName,
    description: `Organograma político de ${municipioName}`,
    url: `https://aprendapolitica.com.br/${params.estado}/${params.municipio}`,
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: '🇧🇷 Brasil', href: '/' },
          { label: data.state.name, href: `/${params.estado}` },
          { label: municipioName },
        ]} />

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{municipioName}</h1>
          <p className="text-gray-500 mt-1">
            Organograma político — poder executivo e legislativo
          </p>
        </div>

        <Organogram data={data} />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  )
}

export async function generateStaticParams() {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: states } = await supabase
    .from('states').select('id, slug').eq('abbr', 'ES')

  const params: { estado: string; municipio: string }[] = []

  for (const state of states ?? []) {
    const { data: municipalities } = await supabase
      .from('municipalities')
      .select('slug')
      .eq('state_id', state.id)

    for (const m of municipalities ?? []) {
      params.push({ estado: state.slug, municipio: m.slug })
    }
  }

  return params
}

export const revalidate = 86400
