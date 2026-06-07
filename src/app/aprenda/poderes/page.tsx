import Link from 'next/link'
import type { Metadata } from 'next'
import type { ComponentType, SVGProps } from 'react'
import { IconBank, IconFile, IconScale, IconFlag, IconMap, IconCity } from '@/components/ui/icons'

export const metadata: Metadata = {
  title: 'Os Três Poderes — Aprenda Política',
  description: 'Executivo, Legislativo e Judiciário: o que cada poder faz, quem os compõe e como se equilibram.',
}

type IconType = ComponentType<SVGProps<SVGSVGElement>>

// Esfera → icon + brand color (shared across instance grids)
const esferaIcon: Record<string, IconType> = { Federal: IconFlag, Estadual: IconMap, Municipal: IconCity }
const esferaColor: Record<string, string> = { Federal: '#2255AA', Estadual: '#007A30', Municipal: '#CC9900' }

type Power = {
  key: string
  Icon: IconType
  name: string
  verb: string
  border: string
  bg: string
  badge: string
  heading: string
  iconWrap: string
  description: string
  instances: { level: string; role: string; detail: string }[]
  facts: string[]
}

const powers: Power[] = [
  {
    key: 'executivo',
    Icon: IconBank,
    name: 'Poder Executivo',
    verb: 'Governa e administra',
    border: 'border-green-300',
    bg: 'bg-green-50',
    badge: 'bg-green-100 text-green-800',
    heading: 'text-green-800',
    iconWrap: 'bg-green-100 text-green-700',
    description: 'É responsável por administrar o Estado, executar as leis aprovadas pelo Legislativo e gerir os serviços públicos. Traça políticas públicas, administra o orçamento e representa o país ou o ente.',
    instances: [
      { level: 'Federal', role: 'Presidente da República', detail: 'Chefe de Estado e Chefe de Governo. Eleito por voto direto a cada 4 anos, com direito a uma reeleição.' },
      { level: 'Estadual', role: 'Governador de Estado', detail: 'Administra o estado. Eleito por voto direto a cada 4 anos, com direito a uma reeleição.' },
      { level: 'Municipal', role: 'Prefeito Municipal', detail: 'Administra o município. Eleito por voto direto a cada 4 anos, com direito a uma reeleição.' },
    ],
    facts: [
      'O Executivo federal tem 24 ministérios',
      'O Presidente comanda as Forças Armadas',
      'Pode vetar leis aprovadas pelo Congresso',
    ],
  },
  {
    key: 'legislativo',
    Icon: IconFile,
    name: 'Poder Legislativo',
    verb: 'Cria leis e fiscaliza',
    border: 'border-blue-300',
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-800',
    heading: 'text-blue-800',
    iconWrap: 'bg-blue-100 text-blue-700',
    description: 'É responsável por elaborar leis, aprovar o orçamento público e fiscalizar o Executivo. É o poder mais diretamente representativo da vontade popular, pois seus membros são eleitos proporcionalmente.',
    instances: [
      { level: 'Federal', role: 'Congresso Nacional', detail: 'Composto pela Câmara dos Deputados (513 deputados, 4 anos) e pelo Senado Federal (81 senadores, 8 anos).' },
      { level: 'Estadual', role: 'Assembleia Legislativa', detail: 'Deputados estaduais eleitos a cada 4 anos. O número varia por estado (mínimo 24).' },
      { level: 'Municipal', role: 'Câmara Municipal', detail: 'Vereadores eleitos a cada 4 anos. O número varia por tamanho do município (9 a 55).' },
    ],
    facts: [
      'O Senado tem 3 senadores por estado',
      'O Congresso pode derrubar um veto presidencial',
      'A Câmara tem poder de impeachment',
    ],
  },
  {
    key: 'judiciario',
    Icon: IconScale,
    name: 'Poder Judiciário',
    verb: 'Interpreta e aplica as leis',
    border: 'border-purple-300',
    bg: 'bg-purple-50',
    badge: 'bg-purple-100 text-purple-800',
    heading: 'text-purple-800',
    iconWrap: 'bg-purple-100 text-purple-700',
    description: 'É responsável por interpretar e aplicar a lei, resolver conflitos e garantir direitos. Seus membros não são eleitos — são aprovados pelo Senado e nomeados pelo Presidente ou pelos próprios tribunais.',
    instances: [
      { level: 'Federal', role: 'STF, STJ, TSE, TST, STM', detail: 'Tribunais superiores que julgam em última instância e guardam a Constituição Federal.' },
      { level: 'Estadual', role: 'Tribunal de Justiça (TJ)', detail: 'Cada estado tem seu TJ para julgar causas estaduais em segunda instância.' },
      { level: 'Municipal', role: 'Varas e Comarcas', detail: 'Juízes de primeira instância que atendem a população diretamente.' },
    ],
    facts: [
      'O STF tem 11 ministros com mandato vitalício',
      'O STF pode declarar leis inconstitucionais',
      'O TSE organiza todas as eleições do Brasil',
    ],
  },
]

const balanceItems = [
  { from: 'Executivo', to: 'Legislativo', how: 'Envia projetos de lei e Medidas Provisórias' },
  { from: 'Legislativo', to: 'Executivo', how: 'Aprova ou rejeita leis; pode fazer impeachment' },
  { from: 'Executivo', to: 'Legislativo', how: 'Pode vetar projetos de lei aprovados' },
  { from: 'Judiciário', to: 'Executivo', how: 'Pode anular atos executivos inconstitucionais' },
  { from: 'Judiciário', to: 'Legislativo', how: 'Pode declarar leis inconstitucionais (STF)' },
  { from: 'Executivo', to: 'Judiciário', how: 'Nomeia ministros do STF (com aprovação do Senado)' },
]

export default function PoderesPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/aprenda" className="hover:text-gray-600">Aprenda</Link>
          <span>›</span>
          <span className="text-gray-600">Os Três Poderes</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Os Três Poderes</h1>
        <p className="text-gray-500 text-lg mb-10 max-w-2xl">
          A Constituição divide o poder do Estado em três instâncias independentes e harmônicas, para evitar que ninguém governe sozinho.
        </p>

        {/* Powers */}
        <div className="space-y-8">
          {powers.map(p => (
            <section key={p.key} className={`border-2 ${p.border} ${p.bg} rounded-2xl p-6`}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${p.iconWrap}`}>
                  <p.Icon className="w-6 h-6" />
                </span>
                <div>
                  <h2 className={`text-xl font-bold ${p.heading}`}>{p.name}</h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.badge}`}>{p.verb}</span>
                </div>
              </div>
              <p className="text-gray-700 text-sm mb-5 leading-relaxed">{p.description}</p>

              {/* Instances grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {p.instances.map(inst => {
                  const Ic = esferaIcon[inst.level]
                  return (
                    <div key={inst.level} className="bg-white rounded-xl p-4 border border-white/60 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Ic className="w-4 h-4" style={{ color: esferaColor[inst.level] }} />
                        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: esferaColor[inst.level] }}>{inst.level}</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm mb-1">{inst.role}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{inst.detail}</p>
                    </div>
                  )
                })}
              </div>

              {/* Facts */}
              <ul className="space-y-1">
                {p.facts.map(f => (
                  <li key={f} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="mt-0.5 text-gray-400">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Checks & Balances */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Sistema de Freios e Contrapesos</h2>
          <p className="text-gray-500 text-sm mb-5">Os poderes se controlam mutuamente para que nenhum abuse da autoridade.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {balanceItems.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-semibold text-gray-700">{item.from}</span>
                    <span className="text-gray-400 text-xs">→</span>
                    <span className="text-xs font-semibold text-gray-700">{item.to}</span>
                  </div>
                  <p className="text-xs text-gray-500">{item.how}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Nav */}
        <div className="mt-10 flex gap-3">
          <Link href="/aprenda" className="text-sm text-gray-500 hover:text-gray-700">← Voltar para Aprenda</Link>
          <Link href="/aprenda/esferas" className="text-sm text-[#00A859] font-medium hover:underline">Próximo: As Esferas →</Link>
        </div>
      </div>
    </main>
  )
}

export const revalidate = false
