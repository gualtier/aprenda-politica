import Link from 'next/link'
import type { Metadata } from 'next'
import type { ComponentType, SVGProps } from 'react'
import { IconFlag, IconMap, IconCity, IconCheck } from '@/components/ui/icons'

export const metadata: Metadata = {
  title: 'As Esferas de Governo — Aprenda Política',
  description: 'Federal, Estadual e Municipal: quem é responsável pelo quê no Brasil.',
}

type IconType = ComponentType<SVGProps<SVGSVGElement>>

const spheres = [
  {
    key: 'federal',
    Icon: IconFlag as IconType,
    accent: '#2255AA',
    name: 'Esfera Federal',
    scope: 'Todo o território nacional',
    capital: 'Brasília, DF',
    border: 'border-[#2255AA]/40',
    bg: 'bg-[#2255AA]/5',
    heading: 'text-[#2255AA]',
    competencies: [
      'Política externa e relações internacionais',
      'Defesa nacional e Forças Armadas',
      'Emissão de moeda (Banco Central)',
      'Previdência Social (INSS)',
      'Sistema Único de Saúde (SUS) — coordenação',
      'Rodovias federais (BRs)',
      'Ensino superior (universidades federais)',
      'Legislação trabalhista (CLT)',
      'Polícia Federal e Polícia Rodoviária Federal',
      'Imposto de Renda, IOF, IPI, IRPJ',
    ],
    politicians: [
      { role: 'Presidente', count: '1', period: '4 anos' },
      { role: 'Senadores', count: '81', period: '8 anos' },
      { role: 'Deputados Federais', count: '513', period: '4 anos' },
    ],
  },
  {
    key: 'estadual',
    Icon: IconMap as IconType,
    accent: '#007A30',
    name: 'Esfera Estadual',
    scope: 'Território do estado',
    capital: 'Capital do estado',
    border: 'border-[#007A30]/40',
    bg: 'bg-[#007A30]/5',
    heading: 'text-[#007A30]',
    competencies: [
      'Segurança pública (Polícia Militar e Civil)',
      'Educação estadual (escolas estaduais)',
      'Saúde estadual (hospitais estaduais)',
      'Rodovias estaduais',
      'Transporte intermunicipal',
      'Meio ambiente estadual',
      'Poder Judiciário estadual (TJ)',
      'Ministério Público estadual',
      'ICMS — principal imposto estadual',
      'Administração de presídios',
    ],
    politicians: [
      { role: 'Governador', count: '1 por estado', period: '4 anos' },
      { role: 'Deputados Estaduais', count: 'Varia por estado', period: '4 anos' },
    ],
  },
  {
    key: 'municipal',
    Icon: IconCity as IconType,
    accent: '#CC9900',
    name: 'Esfera Municipal',
    scope: 'Território do município',
    capital: 'Sede do município',
    border: 'border-[#CC9900]/40',
    bg: 'bg-[#CC9900]/5',
    heading: 'text-[#CC9900]',
    competencies: [
      'Educação infantil e fundamental (creches e escolas municipais)',
      'Atenção básica de saúde (UBSs, postos de saúde)',
      'Limpeza urbana e coleta de lixo',
      'Transporte coletivo urbano',
      'Licenciamento de obras e construções',
      'Zoneamento urbano',
      'Vigilância sanitária local',
      'Feiras, mercados e comércio local',
      'ISS — Imposto Sobre Serviços',
      'IPTU — Imposto Predial e Territorial Urbano',
    ],
    politicians: [
      { role: 'Prefeito', count: '1 por município', period: '4 anos' },
      { role: 'Vereadores', count: '9 a 55 por câmara', period: '4 anos' },
    ],
  },
]

const sharedComps = [
  { area: 'Saúde', federal: 'Normas, SUS nacional, repasse de verbas', estadual: 'Hospitais regionais, gestão estadual', municipal: 'Postos de saúde, vacinação, UBS' },
  { area: 'Educação', federal: 'Universidades, LDB, FUNDEB', estadual: 'Escolas estaduais, ensino médio', municipal: 'Creches, ensino fundamental I' },
  { area: 'Segurança', federal: 'Polícia Federal, Forças Armadas', estadual: 'Polícia Militar, Polícia Civil', municipal: 'Guarda Municipal' },
  { area: 'Infraestrutura', federal: 'Rodovias federais (BRs)', estadual: 'Rodovias estaduais', municipal: 'Ruas e avenidas do município' },
]

export default function EsferasPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/aprenda" className="hover:text-gray-600">Aprenda</Link>
          <span>›</span>
          <span className="text-gray-600">As Esferas de Governo</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">As Esferas de Governo</h1>
        <p className="text-gray-500 text-lg mb-10 max-w-2xl">
          No Brasil, o poder político é dividido em três níveis territoriais — cada um com autonomia e competências próprias definidas pela Constituição.
        </p>

        {/* Spheres */}
        <div className="space-y-8">
          {spheres.map(s => (
            <Link key={s.key} href={`/aprenda/esferas/${s.key}`} className={`block border-2 ${s.border} ${s.bg} rounded-2xl p-6 hover:shadow-md transition-shadow group`}>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.accent}14`, color: s.accent }}>
                    <s.Icon className="w-6 h-6" />
                  </span>
                  <div>
                    <h2 className={`text-xl font-bold ${s.heading}`}>{s.name}</h2>
                    <span className="text-xs text-gray-500">{s.scope} · {s.capital}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {s.politicians.map(p => (
                    <div key={p.role} className="bg-white rounded-lg px-3 py-1.5 border border-white/60 shadow-sm text-center">
                      <p className="text-xs font-semibold text-gray-900">{p.role}</p>
                      <p className="text-[10px] text-gray-500">{p.count} · {p.period}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Responsabilidades principais</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  {s.competencies.map(c => (
                    <li key={c} className="text-sm text-gray-700 flex items-start gap-2">
                      <IconCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: s.accent }} />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`mt-5 pt-4 border-t ${s.border} flex items-center gap-1.5 text-sm font-semibold ${s.heading}`}>
                Ver tudo sobre a {s.name}
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Shared Competencies Table */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Competências Compartilhadas</h2>
          <p className="text-gray-500 text-sm mb-4">Algumas áreas são atendidas pelos três níveis com funções diferentes.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  <th className="text-left p-3 border-b border-gray-200 w-28">Área</th>
                  <th className="text-left p-3 border-b border-gray-200">
                    <span className="inline-flex items-center gap-1.5" style={{ color: '#2255AA' }}><IconFlag className="w-3.5 h-3.5" />Federal</span>
                  </th>
                  <th className="text-left p-3 border-b border-gray-200">
                    <span className="inline-flex items-center gap-1.5" style={{ color: '#007A30' }}><IconMap className="w-3.5 h-3.5" />Estadual</span>
                  </th>
                  <th className="text-left p-3 border-b border-gray-200">
                    <span className="inline-flex items-center gap-1.5" style={{ color: '#CC9900' }}><IconCity className="w-3.5 h-3.5" />Municipal</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sharedComps.map((row, i) => (
                  <tr key={row.area} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3 font-semibold text-gray-700 border-b border-gray-100">{row.area}</td>
                    <td className="p-3 text-gray-600 border-b border-gray-100">{row.federal}</td>
                    <td className="p-3 text-gray-600 border-b border-gray-100">{row.estadual}</td>
                    <td className="p-3 text-gray-600 border-b border-gray-100">{row.municipal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Nav */}
        <div className="mt-10 flex gap-3">
          <Link href="/aprenda/poderes" className="text-sm text-gray-500 hover:text-gray-700">← Os Três Poderes</Link>
          <Link href="/aprenda/cargos" className="text-sm text-[#00A859] font-medium hover:underline">Próximo: Os Cargos →</Link>
        </div>
      </div>
    </main>
  )
}

export const revalidate = false
