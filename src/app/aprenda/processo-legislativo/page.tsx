import Link from 'next/link'
import type { Metadata } from 'next'
import type { ComponentType, SVGProps } from 'react'
import { IconPencil, IconSearch, IconVote, IconRefresh, IconCheckCircle, IconNewspaper } from '@/components/ui/icons'

export const metadata: Metadata = {
  title: 'Como uma Lei é Criada — Aprenda Política',
  description: 'O processo legislativo brasileiro passo a passo: da apresentação do projeto à publicação no Diário Oficial.',
}

type IconType = ComponentType<SVGProps<SVGSVGElement>>

const steps = [
  {
    n: '1',
    Icon: IconPencil as IconType,
    title: 'Apresentação do Projeto',
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    detail: 'Um deputado, senador, presidente, ministro, ou o próprio povo (por iniciativa popular com 1% dos eleitores) apresenta um Projeto de Lei (PL).',
    types: [
      { name: 'PL', desc: 'Projeto de Lei ordinária — aprovado por maioria simples' },
      { name: 'PLP', desc: 'Projeto de Lei Complementar — aprovado por maioria absoluta' },
      { name: 'PEC', desc: 'Proposta de Emenda Constitucional — 3/5 dos votos em 2 turnos' },
      { name: 'MP', desc: 'Medida Provisória — editada pelo Presidente em urgência' },
    ],
  },
  {
    n: '2',
    Icon: IconSearch as IconType,
    title: 'Análise nas Comissões',
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    detail: 'O projeto vai às comissões temáticas (saúde, educação, finanças etc.) que analisam seu mérito, impacto orçamentário e constitucionalidade. Podem ser feitas audiências públicas com especialistas e a sociedade.',
    types: [],
  },
  {
    n: '3',
    Icon: IconVote as IconType,
    title: 'Votação no Plenário',
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700',
    detail: 'O projeto vai ao plenário para votação de todos os parlamentares da Casa iniciante (normalmente a Câmara dos Deputados). É aprovado ou rejeitado.',
    types: [],
  },
  {
    n: '4',
    Icon: IconRefresh as IconType,
    title: 'Casa Revisora',
    color: 'bg-sky-50 border-sky-200',
    badge: 'bg-sky-100 text-sky-700',
    detail: 'Se aprovado na Câmara, vai ao Senado (ou vice-versa). Se a Casa Revisora fizer emendas, o projeto volta à Casa Iniciante. Se for rejeitado, é arquivado.',
    types: [],
  },
  {
    n: '5',
    Icon: IconCheckCircle as IconType,
    title: 'Sanção ou Veto Presidencial',
    color: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    detail: 'O Presidente recebe o projeto aprovado. Tem 15 dias úteis para sancionar (aprovar) ou vetar total/parcialmente. O silêncio implica sanção tácita.',
    types: [
      { name: 'Sanção', desc: 'O Presidente concorda. A lei é aprovada.' },
      { name: 'Veto total', desc: 'O Presidente rejeita integralmente.' },
      { name: 'Veto parcial', desc: 'O Presidente rejeita trechos específicos.' },
      { name: 'Derrubada do veto', desc: 'O Congresso pode derrubar o veto por maioria absoluta.' },
    ],
  },
  {
    n: '6',
    Icon: IconNewspaper as IconType,
    title: 'Publicação no Diário Oficial',
    color: 'bg-gray-50 border-gray-200',
    badge: 'bg-gray-100 text-gray-700',
    detail: 'A lei é publicada no Diário Oficial da União com um número (ex: Lei nº 14.133/2021). A lei entra em vigor na data de publicação ou após o prazo de vacatio legis indicado no próprio texto.',
    types: [],
  },
]

const fastTrack = [
  {
    name: 'Medida Provisória (MP)',
    who: 'Presidente',
    when: 'Casos de relevância e urgência',
    duration: 'Válida por 60 dias, prorrogável por mais 60. Precisa ser aprovada pelo Congresso ou perde validade.',
  },
  {
    name: 'Urgência Constitucional',
    who: 'Presidente',
    when: 'Projetos de autoria do Executivo',
    duration: 'O Congresso é obrigado a votar em 45 dias ou a MP entra na ordem do dia.',
  },
  {
    name: 'Iniciativa Popular',
    who: 'Cidadãos',
    when: '1% do eleitorado (≈ 1,4 mi assinaturas)',
    duration: 'Segue o processo legislativo normal após apresentação à Câmara.',
  },
]

export default function ProcessoLegislativoPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/aprenda" className="hover:text-gray-600">Aprenda</Link>
          <span>›</span>
          <span className="text-gray-600">Como uma Lei é Criada</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Como uma Lei é Criada</h1>
        <p className="text-gray-500 text-lg mb-10 max-w-2xl">
          Do projeto inicial à publicação: o caminho que uma ideia percorre até virar lei no Brasil.
        </p>

        {/* Flow */}
        <div className="space-y-3 mb-10">
          {steps.map((step, i) => (
            <div key={step.n}>
              <div className={`border-2 ${step.color} rounded-2xl p-5`}>
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${step.badge}`}>
                      {step.n}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <step.Icon className="w-5 h-5 text-gray-500" />
                      <h2 className="text-base font-bold text-gray-900">{step.title}</h2>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{step.detail}</p>
                    {step.types.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {step.types.map(t => (
                          <div key={t.name} className="bg-white rounded-lg p-3 border border-white/60 shadow-sm">
                            <p className="text-xs font-bold text-gray-800 mb-0.5">{t.name}</p>
                            <p className="text-xs text-gray-500">{t.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-start pl-[2.6rem]">
                  <div className="w-0.5 h-4 bg-gray-200" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Fast-track section */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Ritos Especiais</h2>
          <p className="text-gray-500 text-sm mb-4">Alguns projetos têm tramitação diferenciada.</p>
          <div className="space-y-3">
            {fastTrack.map(ft => (
              <div key={ft.name} className="border border-gray-200 rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{ft.name}</h3>
                  <span className="text-xs text-gray-400">Iniciativa: {ft.who}</span>
                </div>
                <p className="text-xs text-gray-600 mb-1"><span className="font-medium">Quando:</span> {ft.when}</p>
                <p className="text-xs text-gray-600"><span className="font-medium">Prazo:</span> {ft.duration}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Summary stats */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { n: '~300', label: 'dias em média para um PL ser aprovado' },
            { n: '513', label: 'deputados federais que votam no plenário' },
            { n: '81', label: 'senadores que revisam na Casa Revisora' },
          ].map(stat => (
            <div key={stat.n} className="border border-gray-100 rounded-xl p-4 text-center bg-gray-50">
              <p className="text-2xl font-bold text-[#00A859]">{stat.n}</p>
              <p className="text-xs text-gray-500 leading-snug mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Nav */}
        <div className="mt-10 flex gap-3">
          <Link href="/aprenda/cargos" className="text-sm text-gray-500 hover:text-gray-700">← Os Cargos</Link>
          <Link href="/aprenda" className="text-sm text-[#00A859] font-medium hover:underline">↑ Início do Aprenda</Link>
        </div>
      </div>
    </main>
  )
}

export const revalidate = false
