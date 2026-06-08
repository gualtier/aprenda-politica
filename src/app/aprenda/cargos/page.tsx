import Link from 'next/link'
import type { Metadata } from 'next'
import type { ComponentType, SVGProps } from 'react'
import { IconMedal, IconBank, IconFile, IconMap, IconCity, IconChair } from '@/components/ui/icons'

export const metadata: Metadata = {
  title: 'Os Cargos Políticos — Aprenda Política',
  description: 'Presidente, Senador, Deputado, Governador, Prefeito, Vereador — mandatos, salários e como são eleitos.',
}

type Role = {
  slug: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  sphere: string
  branch: string
  branchColor: string
  sphereColor: string
  term: string
  reelection: string
  count: string
  ageMin: string
  howElected: string
  mainDuties: string[]
  salary: string
}

const roles: Role[] = [
  {
    slug: 'presidente',
    Icon: IconMedal,
    title: 'Presidente da República',
    sphere: 'Federal',
    branch: 'Executivo',
    branchColor: 'bg-green-100 text-green-800',
    sphereColor: 'bg-[#2255AA]/10 text-[#2255AA]',
    term: '4 anos',
    reelection: 'Uma vez consecutiva',
    count: '1',
    ageMin: '35 anos',
    howElected: 'Voto direto em dois turnos. Ganha quem obtiver mais de 50% dos votos válidos no 1° turno, ou o mais votado no 2° turno.',
    mainDuties: ['Chefiar o Governo Federal', 'Nomear ministros e diretores', 'Sancionar ou vetar leis', 'Representar o Brasil externamente', 'Editar Medidas Provisórias'],
    salary: 'R$ 30.934,70',
  },
  {
    slug: 'senador',
    Icon: IconBank,
    title: 'Senador Federal',
    sphere: 'Federal',
    branch: 'Legislativo',
    branchColor: 'bg-blue-100 text-blue-800',
    sphereColor: 'bg-[#2255AA]/10 text-[#2255AA]',
    term: '8 anos',
    reelection: 'Sem limite',
    count: '81 (3 por estado)',
    ageMin: '35 anos',
    howElected: 'Voto direto majoritário. Cada estado elege 1 ou 2 senadores a cada 4 anos, alternando 1/3 e 2/3 do Senado.',
    mainDuties: ['Aprovar ou rejeitar projetos de lei', 'Fiscalizar o Executivo', 'Aprovar indicados pelo Presidente (ministros, embaixadores)', 'Julgar o Presidente em processo de impeachment'],
    salary: 'R$ 41.650,92',
  },
  {
    slug: 'deputado-federal',
    Icon: IconFile,
    title: 'Deputado Federal',
    sphere: 'Federal',
    branch: 'Legislativo',
    branchColor: 'bg-blue-100 text-blue-800',
    sphereColor: 'bg-[#2255AA]/10 text-[#2255AA]',
    term: '4 anos',
    reelection: 'Sem limite',
    count: '513 (proporcional por estado)',
    ageMin: '21 anos',
    howElected: 'Voto proporcional. Cada estado elege um número de deputados proporcional à sua população. O eleitor vota no candidato ou no partido.',
    mainDuties: ['Elaborar e votar projetos de lei', 'Aprovar o orçamento federal', 'Fiscalizar o Executivo federal', 'Autorizar processo de impeachment'],
    salary: 'R$ 41.650,92',
  },
  {
    slug: 'governador',
    Icon: IconMap,
    title: 'Governador de Estado',
    sphere: 'Estadual',
    branch: 'Executivo',
    branchColor: 'bg-green-100 text-green-800',
    sphereColor: 'bg-[#007A30]/10 text-[#007A30]',
    term: '4 anos',
    reelection: 'Uma vez consecutiva',
    count: '27 (um por estado + DF)',
    ageMin: '30 anos',
    howElected: 'Voto direto em dois turnos. Mesmo sistema do Presidente da República, mas restrito ao estado.',
    mainDuties: ['Administrar o estado', 'Gerir a segurança pública estadual', 'Cuidar das escolas e hospitais estaduais', 'Administrar rodovias estaduais'],
    salary: 'Varia por estado (≈ R$ 27.000)',
  },
  {
    slug: 'deputado-estadual',
    Icon: IconFile,
    title: 'Deputado Estadual',
    sphere: 'Estadual',
    branch: 'Legislativo',
    branchColor: 'bg-blue-100 text-blue-800',
    sphereColor: 'bg-[#007A30]/10 text-[#007A30]',
    term: '4 anos',
    reelection: 'Sem limite',
    count: 'Varia (mín. 24 por estado)',
    ageMin: '21 anos',
    howElected: 'Voto proporcional, como os deputados federais, mas limitado ao eleitorado do estado.',
    mainDuties: ['Criar leis estaduais', 'Aprovar o orçamento estadual', 'Fiscalizar o governador', 'Votar emendas à Constituição estadual'],
    salary: 'Varia por estado',
  },
  {
    slug: 'prefeito',
    Icon: IconCity,
    title: 'Prefeito Municipal',
    sphere: 'Municipal',
    branch: 'Executivo',
    branchColor: 'bg-green-100 text-green-800',
    sphereColor: 'bg-[#CC9900]/10 text-[#CC9900]',
    term: '4 anos',
    reelection: 'Uma vez consecutiva',
    count: '5.570 municípios',
    ageMin: '21 anos',
    howElected: 'Voto direto. Municípios com mais de 200 mil eleitores têm segundo turno. Os menores elegem em turno único.',
    mainDuties: ['Administrar o município', 'Gerir postos de saúde e escolas municipais', 'Controlar o orçamento municipal', 'Licenciar construções e serviços locais'],
    salary: 'Varia por município',
  },
  {
    slug: 'vereador',
    Icon: IconChair,
    title: 'Vereador',
    sphere: 'Municipal',
    branch: 'Legislativo',
    branchColor: 'bg-blue-100 text-blue-800',
    sphereColor: 'bg-[#CC9900]/10 text-[#CC9900]',
    term: '4 anos',
    reelection: 'Sem limite',
    count: '9 a 55 por câmara',
    ageMin: '18 anos',
    howElected: 'Voto proporcional. É o único cargo onde o eleitor vota na câmara municipal. Número proporcional à população.',
    mainDuties: ['Criar leis municipais', 'Aprovar o orçamento municipal', 'Fiscalizar o prefeito e secretarias', 'Votar concessões e contratos do município'],
    salary: 'Varia por município (mín. 20% do subsídio estadual)',
  },
]

export default function CargosPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/aprenda" className="hover:text-gray-600">Aprenda</Link>
          <span>›</span>
          <span className="text-gray-600">Os Cargos Políticos</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Os Cargos Políticos</h1>
        <p className="text-gray-500 text-lg mb-10 max-w-2xl">
          Do vereador ao presidente — quem é eleito como, por quanto tempo e o que faz no cargo.
        </p>

        {/* Hierarchy visual */}
        <div className="mb-10 border border-gray-100 rounded-2xl p-5 bg-gray-50">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Hierarquia territorial</p>
          <div className="flex flex-col sm:flex-row items-stretch gap-4">
            <div className="flex-1 rounded-xl p-4 text-center" style={{ border: '1px solid rgba(34,85,170,0.3)', background: 'rgba(34,85,170,0.05)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#2255AA' }}>Federal</p>
              <p className="text-sm text-gray-700">Presidente</p>
              <p className="text-sm text-gray-700">Senador</p>
              <p className="text-sm text-gray-700">Dep. Federal</p>
            </div>
            <div className="hidden sm:flex items-center text-gray-300 text-2xl self-center">›</div>
            <div className="flex-1 rounded-xl p-4 text-center" style={{ border: '1px solid rgba(0,122,48,0.3)', background: 'rgba(0,122,48,0.05)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#007A30' }}>Estadual</p>
              <p className="text-sm text-gray-700">Governador</p>
              <p className="text-sm text-gray-700">Dep. Estadual</p>
            </div>
            <div className="hidden sm:flex items-center text-gray-300 text-2xl self-center">›</div>
            <div className="flex-1 rounded-xl p-4 text-center" style={{ border: '1px solid rgba(204,153,0,0.3)', background: 'rgba(204,153,0,0.05)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#CC9900' }}>Municipal</p>
              <p className="text-sm text-gray-700">Prefeito</p>
              <p className="text-sm text-gray-700">Vereador</p>
            </div>
          </div>
        </div>

        {/* Role cards */}
        <div className="space-y-5">
          {roles.map(role => (
            <Link key={role.slug} href={`/aprenda/cargos/${role.slug}`} className="block border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-md transition-all group">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gray-50 text-gray-600">
                    <role.Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{role.title}</h2>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${role.sphereColor}`}>{role.sphere}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${role.branchColor}`}>{role.branch}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Mandato', value: role.term },
                    { label: 'Reeleição', value: role.reelection },
                    { label: 'Vagas', value: role.count },
                    { label: 'Idade mín.', value: role.ageMin },
                  ].map(stat => (
                    <div key={stat.label} className="bg-gray-50 rounded-lg px-3 py-1.5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{stat.label}</p>
                      <p className="text-xs font-semibold text-gray-800">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Como é eleito</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{role.howElected}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Principais atribuições</p>
                  <ul className="space-y-1">
                    {role.mainDuties.map(d => (
                      <li key={d} className="text-sm text-gray-600 flex items-start gap-1.5">
                        <span className="text-gray-300 mt-0.5 text-xs">▸</span>{d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <span>
                  <span className="text-xs text-gray-400">Subsídio: </span>
                  <span className="text-xs font-semibold text-gray-700">{role.salary}</span>
                </span>
                <span className="text-xs font-semibold text-[#00A859] inline-flex items-center gap-1">
                  Ver detalhes <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Nav */}
        <div className="mt-10 flex gap-3">
          <Link href="/aprenda/esferas" className="text-sm text-gray-500 hover:text-gray-700">← As Esferas</Link>
          <Link href="/aprenda/processo-legislativo" className="text-sm text-[#00A859] font-medium hover:underline">Próximo: Como uma Lei é Criada →</Link>
        </div>
      </div>
    </main>
  )
}

export const revalidate = false
