import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { ComponentType, SVGProps } from 'react'
import {
  IconMedal, IconBank, IconFile, IconMap, IconCity, IconChair,
  IconCheck, IconSpark,
} from '@/components/ui/icons'

type IconType = ComponentType<SVGProps<SVGSVGElement>>
type Item = { title: string; desc: string }
type Sphere = 'Federal' | 'Estadual' | 'Municipal'

type Cargo = {
  slug: string
  title: string
  short: string
  sphere: Sphere
  branch: 'Executivo' | 'Legislativo'
  Icon: IconType
  term: string
  reelection: string
  count: string
  ageMin: string
  howElected: string
  intro: string[]
  atribuicoes: string[]
  exemplos: Item[]
  cidadao: Item[]
  salary: string
}

const ESFERA: Record<Sphere, { accent: string; soft: string }> = {
  Federal: { accent: '#2255AA', soft: '#EAF1FB' },
  Estadual: { accent: '#007A30', soft: '#E9F7EF' },
  Municipal: { accent: '#CC9900', soft: '#FFFAE6' },
}

const CARGOS: Record<string, Cargo> = {
  presidente: {
    slug: 'presidente', title: 'Presidente da República', short: 'Presidente', sphere: 'Federal', branch: 'Executivo', Icon: IconMedal,
    term: '4 anos', reelection: 'Uma vez consecutiva', count: '1', ageMin: '35 anos',
    howElected: 'Voto direto em dois turnos. Ganha quem tiver mais de 50% dos votos válidos no 1º turno, ou o mais votado no 2º.',
    intro: [
      'O Presidente da República é o cargo mais alto do Poder Executivo. Acumula dois papéis: Chefe de Estado, representando o Brasil diante do mundo, e Chefe de Governo, comandando a administração federal.',
      'Comanda os ministérios e as Forças Armadas e define as grandes políticas do país — da economia à saúde. É a pessoa que mais concentra responsabilidade sobre os rumos nacionais.',
    ],
    atribuicoes: ['Chefiar o Governo Federal', 'Nomear ministros e diretores', 'Sancionar ou vetar leis', 'Editar Medidas Provisórias', 'Representar o Brasil externamente', 'Comandar as Forças Armadas'],
    exemplos: [
      { title: 'Editar uma Medida Provisória', desc: 'Em caso urgente, cria uma regra com força de lei na hora — que o Congresso depois confirma ou derruba.' },
      { title: 'Sancionar ou vetar uma lei', desc: 'Decide se uma lei aprovada pelo Congresso entra em vigor.' },
      { title: 'Indicar ministros do STF', desc: 'Indica ministros do Supremo, que precisam ser aprovados pelo Senado.' },
    ],
    cidadao: [
      { title: 'Acompanhe o Portal da Transparência', desc: 'Veja como o governo federal gasta o seu imposto, em tempo quase real.' },
      { title: 'Cobre as promessas de campanha', desc: 'Compare o plano de governo registrado com o que foi entregue.' },
      { title: 'Participe de consultas públicas', desc: 'Políticas federais costumam abrir consulta ao cidadão antes de decidir.' },
    ],
    salary: 'R$ 30.934,70',
  },
  senador: {
    slug: 'senador', title: 'Senador Federal', short: 'Senador', sphere: 'Federal', branch: 'Legislativo', Icon: IconBank,
    term: '8 anos', reelection: 'Sem limite', count: '81 (3 por estado)', ageMin: '35 anos',
    howElected: 'Voto direto majoritário. Cada estado elege 1 ou 2 senadores a cada 4 anos, alternando 1/3 e 2/3 do Senado.',
    intro: [
      'O Senador representa o seu estado no Congresso. São 3 por estado (81 no total), com mandatos longos de 8 anos — o dobro dos demais — para dar estabilidade às decisões de Estado.',
      'Além de votar leis, o Senado tem funções exclusivas: aprova autoridades, julga o Presidente em impeachment e referenda tratados internacionais.',
    ],
    atribuicoes: ['Aprovar ou rejeitar projetos de lei', 'Fiscalizar o Executivo', 'Aprovar indicados pelo Presidente (STF, agências, embaixadas)', 'Julgar o Presidente em impeachment'],
    exemplos: [
      { title: 'Sabatinar autoridades', desc: 'Aprova ou rejeita ministros do STF e embaixadores indicados pelo Presidente.' },
      { title: 'Julgar um impeachment', desc: 'É o Senado que julga o Presidente em um processo de impeachment.' },
      { title: 'Votar leis e o orçamento', desc: 'Toda lei federal e o orçamento da União passam pelo Senado.' },
    ],
    cidadao: [
      { title: 'Use o e-Cidadania', desc: 'Sugira leis e vote em ideias diretamente no portal do Senado.' },
      { title: 'Acompanhe o seu senador', desc: 'Veja votos, presença e projetos no site do Senado.' },
      { title: 'Cobre posição', desc: 'Senadores têm gabinetes e canais abertos ao cidadão.' },
    ],
    salary: 'R$ 41.650,92',
  },
  'deputado-federal': {
    slug: 'deputado-federal', title: 'Deputado Federal', short: 'Dep. Federal', sphere: 'Federal', branch: 'Legislativo', Icon: IconFile,
    term: '4 anos', reelection: 'Sem limite', count: '513 (proporcional)', ageMin: '21 anos',
    howElected: 'Voto proporcional. Cada estado elege deputados proporcionalmente à sua população. O voto conta para o candidato e para o partido.',
    intro: [
      'O Deputado Federal representa o povo do seu estado na Câmara dos Deputados. São 513, distribuídos conforme a população de cada estado — quanto mais habitantes, mais deputados.',
      'É a casa onde a maioria das leis começa. A Câmara também aprova o orçamento, fiscaliza o governo e pode autorizar o impeachment do Presidente.',
    ],
    atribuicoes: ['Elaborar e votar projetos de lei', 'Aprovar o orçamento federal', 'Fiscalizar o Executivo federal', 'Autorizar processo de impeachment'],
    exemplos: [
      { title: 'Apresentar e votar leis', desc: 'A maior parte dos projetos de lei nasce e é votada na Câmara.' },
      { title: 'Aprovar o orçamento da União', desc: 'Define onde o governo federal pode gastar no ano.' },
      { title: 'Trabalhar nas comissões', desc: 'Os projetos são debatidos em comissões temáticas antes do plenário.' },
    ],
    cidadao: [
      { title: 'Siga o seu deputado', desc: 'O portal da Câmara mostra votos, presença, projetos e gastos de gabinete.' },
      { title: 'Pressione em votações-chave', desc: 'Mande mensagem cobrando posição em temas que afetam você.' },
      { title: 'Acompanhe as comissões', desc: 'É onde os detalhes das leis são realmente decididos.' },
    ],
    salary: 'R$ 41.650,92',
  },
  governador: {
    slug: 'governador', title: 'Governador de Estado', short: 'Governador', sphere: 'Estadual', branch: 'Executivo', Icon: IconMap,
    term: '4 anos', reelection: 'Uma vez consecutiva', count: '27 (um por UF)', ageMin: '30 anos',
    howElected: 'Voto direto em dois turnos. Mesmo sistema do Presidente, mas restrito ao estado.',
    intro: [
      'O Governador é o chefe do Executivo estadual. Administra o estado: comanda a segurança pública (as polícias Militar e Civil), a rede de ensino médio, os hospitais estaduais e as rodovias do estado.',
      'É um dos cargos com mais impacto direto na sua vida — segurança e saúde de média complexidade passam por ele. Mandato de 4 anos, com uma reeleição.',
    ],
    atribuicoes: ['Administrar o estado', 'Comandar a segurança pública estadual', 'Gerir escolas e hospitais estaduais', 'Administrar as rodovias estaduais', 'Sancionar ou vetar leis estaduais'],
    exemplos: [
      { title: 'Comandar as polícias', desc: 'A Polícia Militar e a Civil respondem ao governo do estado.' },
      { title: 'Gerir saúde e educação estaduais', desc: 'Hospitais de referência e a maior parte do ensino médio público.' },
      { title: 'Sancionar leis estaduais', desc: 'Aprova ou veta o que a Assembleia Legislativa decide.' },
    ],
    cidadao: [
      { title: 'Use a transparência estadual', desc: 'Veja os gastos do governo do seu estado nos portais oficiais.' },
      { title: 'Cobre segurança e saúde', desc: 'Ouvidorias estaduais registram demandas e reclamações.' },
      { title: 'Acompanhe o Tribunal de Contas do Estado', desc: 'O TCE fiscaliza o governador — você pode denunciar.' },
    ],
    salary: 'Varia por estado (≈ R$ 27.000)',
  },
  'deputado-estadual': {
    slug: 'deputado-estadual', title: 'Deputado Estadual', short: 'Dep. Estadual', sphere: 'Estadual', branch: 'Legislativo', Icon: IconFile,
    term: '4 anos', reelection: 'Sem limite', count: 'Mín. 24 por estado', ageMin: '21 anos',
    howElected: 'Voto proporcional, como os deputados federais, mas limitado ao eleitorado do estado.',
    intro: [
      'O Deputado Estadual representa você na Assembleia Legislativa do seu estado. Faz as leis estaduais, aprova o orçamento do estado e fiscaliza o Governador.',
      'São no mínimo 24 por estado (mais, conforme a população), eleitos por voto proporcional para mandatos de 4 anos, sem limite de reeleições.',
    ],
    atribuicoes: ['Criar leis estaduais', 'Aprovar o orçamento estadual', 'Fiscalizar o governador', 'Votar emendas à Constituição estadual'],
    exemplos: [
      { title: 'Criar leis do estado', desc: 'Regras que valem dentro do estado, da educação ao meio ambiente.' },
      { title: 'Aprovar o orçamento estadual', desc: 'Autoriza e fiscaliza os gastos do governo do estado.' },
      { title: 'Fiscalizar o governador', desc: 'Pode convocar secretários e abrir investigações.' },
    ],
    cidadao: [
      { title: 'Acompanhe a Assembleia', desc: 'O site mostra projetos e votações dos deputados estaduais.' },
      { title: 'Cobre o seu deputado', desc: 'Eles decidem leis que afetam diretamente o seu estado.' },
      { title: 'Participe de audiências', desc: 'A Assembleia abre debates antes de votar temas importantes.' },
    ],
    salary: 'Varia por estado',
  },
  prefeito: {
    slug: 'prefeito', title: 'Prefeito Municipal', short: 'Prefeito', sphere: 'Municipal', branch: 'Executivo', Icon: IconCity,
    term: '4 anos', reelection: 'Uma vez consecutiva', count: '5.570 municípios', ageMin: '21 anos',
    howElected: 'Voto direto. Cidades com mais de 200 mil eleitores têm segundo turno; as menores elegem em turno único.',
    intro: [
      'O Prefeito é o chefe do Executivo municipal — o governante mais próximo de você. Cuida do dia a dia da cidade: creches e escolas, postos de saúde, coleta de lixo, iluminação, transporte e manutenção das ruas.',
      'É o cargo mais fácil de acompanhar e cobrar, porque o resultado aparece no seu bairro. Mandato de 4 anos, com direito a uma reeleição.',
    ],
    atribuicoes: ['Administrar o município', 'Gerir postos de saúde e escolas municipais', 'Controlar o orçamento municipal', 'Licenciar construções e serviços locais'],
    exemplos: [
      { title: 'Manter saúde e educação básicas', desc: 'UBS, creches e escolas de ensino fundamental.' },
      { title: 'Cuidar da cidade', desc: 'Lixo, iluminação, buracos, parques e transporte urbano.' },
      { title: 'Definir as prioridades de gasto', desc: 'Controla o orçamento municipal e as obras da cidade.' },
    ],
    cidadao: [
      { title: 'Use o 156 / app da prefeitura', desc: 'Reclamações e pedidos de serviço vão direto para a prefeitura.' },
      { title: 'Participe do orçamento', desc: 'Muitas cidades deixam você ajudar a decidir os investimentos.' },
      { title: 'Fiscalize as obras', desc: 'Obra parada ou cara? Acione a Câmara, a Ouvidoria ou o Ministério Público.' },
    ],
    salary: 'Varia por município',
  },
  vereador: {
    slug: 'vereador', title: 'Vereador', short: 'Vereador', sphere: 'Municipal', branch: 'Legislativo', Icon: IconChair,
    term: '4 anos', reelection: 'Sem limite', count: '9 a 55 por câmara', ageMin: '18 anos',
    howElected: 'Voto proporcional. É o único cargo em que o voto vai para a Câmara Municipal. Número proporcional à população.',
    intro: [
      'O Vereador é o legislador da sua cidade — o cargo eleito mais próximo do cidadão. Faz as leis municipais, aprova o orçamento da cidade e fiscaliza o Prefeito.',
      'São de 9 a 55 por câmara, conforme a população. Por estar tão perto de você, é o canal mais direto para os problemas do bairro. Mandato de 4 anos, sem limite de reeleições.',
    ],
    atribuicoes: ['Criar leis municipais', 'Aprovar o orçamento municipal', 'Fiscalizar o prefeito e as secretarias', 'Votar concessões e contratos do município'],
    exemplos: [
      { title: 'Criar leis da cidade', desc: 'Do Plano Diretor às regras de comércio e zoneamento urbano.' },
      { title: 'Aprovar o orçamento municipal', desc: 'Autoriza e fiscaliza os gastos da prefeitura.' },
      { title: 'Fiscalizar o prefeito', desc: 'Pode convocar secretários e investigar a gestão municipal.' },
    ],
    cidadao: [
      { title: 'Acompanhe a Câmara', desc: 'As sessões são públicas — veja como o seu vereador vota.' },
      { title: 'Leve as demandas do bairro', desc: 'Vereadores são o canal mais direto para problemas locais.' },
      { title: 'Cobre presença e coerência', desc: 'Compare as promessas de campanha com os votos de verdade.' },
    ],
    salary: 'Varia por município (mín. 20% do subsídio estadual)',
  },
}

const ORDER = ['presidente', 'senador', 'deputado-federal', 'governador', 'deputado-estadual', 'prefeito', 'vereador']

export function generateStaticParams() {
  return ORDER.map(cargo => ({ cargo }))
}

export function generateMetadata({ params }: { params: { cargo: string } }): Metadata {
  const c = CARGOS[params.cargo]
  if (!c) return {}
  return {
    title: `${c.title} — Aprenda Política`,
    description: `O que faz, como é eleito, atribuições, exemplos práticos e como o cidadão pode acompanhar e cobrar o cargo de ${c.title}.`,
  }
}

function SectionTitle({ eyebrow, title, accent }: { eyebrow: string; title: string; accent: string }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: accent }}>{eyebrow}</p>
      <h2 className="text-2xl font-bold text-gray-900 tracking-[-0.01em]">{title}</h2>
    </div>
  )
}

export default function CargoPage({ params }: { params: { cargo: string } }) {
  const c = CARGOS[params.cargo]
  if (!c) notFound()
  const { accent, soft } = ESFERA[c.sphere]

  const idx = ORDER.indexOf(c.slug)
  const prev = idx > 0 ? CARGOS[ORDER[idx - 1]] : null
  const next = idx < ORDER.length - 1 ? CARGOS[ORDER[idx + 1]] : null

  const stats = [
    { label: 'Mandato', value: c.term },
    { label: 'Reeleição', value: c.reelection },
    { label: 'Vagas', value: c.count },
    { label: 'Idade mín.', value: c.ageMin },
  ]

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/aprenda" className="hover:text-gray-600">Aprenda</Link>
          <span>›</span>
          <Link href="/aprenda/cargos" className="hover:text-gray-600">Os Cargos Políticos</Link>
          <span>›</span>
          <span className="text-gray-600">{c.short}</span>
        </nav>

        {/* Header */}
        <header className="flex items-start gap-4 mb-6">
          <span className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: soft, color: accent }}>
            <c.Icon className="w-7 h-7" />
          </span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-[-0.02em]">{c.title}</h1>
            <div className="flex gap-1.5 mt-2">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: soft, color: accent }}>{c.sphere}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{c.branch}</span>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-10">
          {stats.map(s => (
            <div key={s.label} className="border border-gray-100 rounded-xl px-3 py-2.5 bg-gray-50">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-sm font-semibold text-gray-800 leading-tight mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* O que é */}
        <section className="mb-12">
          <SectionTitle eyebrow="O que é" title="O que esse cargo faz" accent={accent} />
          <div className="space-y-3">
            {c.intro.map((para, i) => (
              <p key={i} className="text-[15px] text-gray-700 leading-relaxed">{para}</p>
            ))}
          </div>
        </section>

        {/* Como é eleito */}
        <section className="mb-12">
          <SectionTitle eyebrow="Eleição" title="Como é eleito" accent={accent} />
          <div className="rounded-2xl p-5 border" style={{ borderColor: `${accent}33`, background: soft }}>
            <p className="text-sm text-gray-700 leading-relaxed">{c.howElected}</p>
          </div>
        </section>

        {/* Atribuições */}
        <section className="mb-12">
          <SectionTitle eyebrow="Competências" title="Principais atribuições" accent={accent} />
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {c.atribuicoes.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <IconCheck className="w-3.5 h-3.5 mt-1 shrink-0" style={{ color: accent }} />
                <span className="leading-relaxed">{a}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Na prática */}
        <section className="mb-12">
          <SectionTitle eyebrow="Na prática" title="Exemplos do que faz" accent={accent} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {c.exemplos.map((ex, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white mt-0.5" style={{ background: accent }}>{i + 1}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-0.5">{ex.title}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{ex.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Você e esse cargo */}
        <section className="mb-12">
          <SectionTitle eyebrow="Você e esse cargo" title="Como acompanhar e cobrar" accent={accent} />
          <div className="border rounded-2xl p-5" style={{ borderColor: `${accent}40`, background: soft }}>
            <div className="flex items-center gap-2 mb-3">
              <IconSpark className="w-4 h-4" style={{ color: accent }} />
              <h3 className="text-sm font-bold" style={{ color: accent }}>O que você pode fazer</h3>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {c.cidadao.map((it, i) => (
                <li key={i}>
                  <p className="text-sm font-semibold text-gray-900">{it.title}</p>
                  <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{it.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Subsídio */}
        <section className="mb-10">
          <div className="flex items-center justify-between border border-gray-100 rounded-xl px-5 py-3.5 bg-white">
            <span className="text-sm text-gray-500">Subsídio (salário)</span>
            <span className="text-sm font-bold text-gray-900">{c.salary}</span>
          </div>
        </section>

        {/* Outros cargos */}
        <section className="border-t border-gray-100 pt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Outros cargos</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ORDER.filter(s => s !== c.slug).map(s => {
              const o = CARGOS[s]
              const oc = ESFERA[o.sphere]
              return (
                <Link key={s} href={`/aprenda/cargos/${s}`} className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 hover:border-gray-300 transition-colors">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: oc.soft, color: oc.accent }}>
                    <o.Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-semibold text-gray-800 truncate">{o.short}</span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between gap-3 text-sm">
          {prev ? (
            <Link href={`/aprenda/cargos/${prev.slug}`} className="text-gray-500 hover:text-gray-800">← {prev.short}</Link>
          ) : (
            <Link href="/aprenda/cargos" className="text-gray-500 hover:text-gray-800">← Os Cargos</Link>
          )}
          {next && (
            <Link href={`/aprenda/cargos/${next.slug}`} className="font-medium hover:underline" style={{ color: accent }}>{next.short} →</Link>
          )}
        </div>
      </div>
    </main>
  )
}

export const revalidate = false
