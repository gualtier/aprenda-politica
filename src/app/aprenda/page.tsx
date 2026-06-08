import Link from 'next/link'
import type { Metadata } from 'next'
import type { ComponentType, SVGProps } from 'react'
import { IconScale, IconBank, IconChair, IconScroll, IconBulb, IconReceipt } from '@/components/ui/icons'

export const metadata: Metadata = {
  title: 'Aprenda — Aprenda Política',
  description: 'Entenda como funciona o sistema político brasileiro: poderes, esferas, cargos e processos.',
}

type Topic = {
  href: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
  color: string
  tag: string
  iconWrap: string
}

const topics: Topic[] = [
  {
    href: '/aprenda/poderes',
    Icon: IconScale,
    title: 'Os Três Poderes',
    description: 'Executivo, Legislativo e Judiciário — o que cada um faz e como se equilibram.',
    color: 'bg-green-50 border-green-200 hover:border-green-400',
    tag: 'bg-green-100 text-green-700',
    iconWrap: 'bg-green-100 text-green-700',
  },
  {
    href: '/aprenda/esferas',
    Icon: IconBank,
    title: 'As Esferas de Governo',
    description: 'Federal, Estadual e Municipal — quem cuida do quê e onde cada poder atua.',
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    tag: 'bg-blue-100 text-blue-700',
    iconWrap: 'bg-blue-100 text-blue-700',
  },
  {
    href: '/aprenda/cargos',
    Icon: IconChair,
    title: 'Os Cargos Políticos',
    description: 'Presidente, Senador, Deputado, Governador, Prefeito, Vereador — mandatos, competências e como são eleitos.',
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    tag: 'bg-purple-100 text-purple-700',
    iconWrap: 'bg-purple-100 text-purple-700',
  },
  {
    href: '/aprenda/processo-legislativo',
    Icon: IconScroll,
    title: 'Como uma Lei é Criada',
    description: 'Do projeto à publicação no Diário Oficial — passo a passo do processo legislativo.',
    color: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    tag: 'bg-amber-100 text-amber-700',
    iconWrap: 'bg-amber-100 text-amber-700',
  },
  {
    href: '/aprenda/impostos',
    Icon: IconReceipt,
    title: 'Os Impostos',
    description: 'IR, ICMS, IPVA, IPTU, ISS e os outros — o que cada um é, quem cobra e para onde vai o dinheiro.',
    color: 'bg-teal-50 border-teal-200 hover:border-teal-400',
    tag: 'bg-teal-100 text-teal-700',
    iconWrap: 'bg-teal-100 text-teal-700',
  },
]

export default function AprendaPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Educação política</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-3">
            Como funciona o poder<br />
            <span className="text-[#00A859]">no Brasil?</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl">
            Guias visuais para entender o sistema político brasileiro — sem juridiquês, sem complicação.
          </p>
        </div>

        {/* Topic cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topics.map(t => (
            <Link
              key={t.href}
              href={t.href}
              className={`group flex flex-col border-2 rounded-2xl p-6 transition-colors ${t.color}`}
            >
              <span className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${t.iconWrap}`}>
                <t.Icon className="w-6 h-6" />
              </span>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 mb-2">{t.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">{t.description}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.tag}`}>Ler guia →</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom callout */}
        <div className="mt-10 border border-gray-100 rounded-xl p-5 bg-gray-50 flex items-start gap-4">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-amarelo-50 text-amarelo-600">
            <IconBulb className="w-5 h-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Sabia que o Brasil tem 3 esferas e 3 poderes?</p>
            <p className="text-sm text-gray-500">Isso significa que pode haver até 9 combinações — um executivo federal, um executivo estadual, um executivo municipal, e assim por diante.</p>
          </div>
        </div>
      </div>
    </main>
  )
}

export const revalidate = false
