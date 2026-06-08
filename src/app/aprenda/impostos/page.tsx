import Link from 'next/link'
import type { Metadata } from 'next'
import { IconFlag, IconMap, IconCity, IconArrow } from '@/components/ui/icons'

export const metadata: Metadata = {
  title: 'Os Impostos — Aprenda Política',
  description: 'IR, ICMS, IPVA, IPTU, ISS e os outros: o que cada imposto é, quem cobra, quem paga e para onde vai o dinheiro.',
}

type Tax = { slug: string; sigla: string; desc: string }
type Group = { sphere: string; accent: string; soft: string; Icon: typeof IconFlag; intro: string; taxes: Tax[] }

const GROUPS: Group[] = [
  {
    sphere: 'Federais', accent: '#2255AA', soft: '#EAF1FB', Icon: IconFlag,
    intro: 'Cobrados pela União. Financiam a Previdência, a saúde, a defesa e os programas nacionais.',
    taxes: [
      { slug: 'ir', sigla: 'IR', desc: 'Sobre a renda de pessoas e empresas' },
      { slug: 'ipi', sigla: 'IPI', desc: 'Sobre produtos industrializados' },
      { slug: 'iof', sigla: 'IOF', desc: 'Sobre operações financeiras' },
    ],
  },
  {
    sphere: 'Estaduais', accent: '#007A30', soft: '#E9F7EF', Icon: IconMap,
    intro: 'Cobrados pelos estados. Financiam a segurança, o ensino médio e os hospitais estaduais.',
    taxes: [
      { slug: 'icms', sigla: 'ICMS', desc: 'O maior imposto — sobre quase tudo que você compra' },
      { slug: 'ipva', sigla: 'IPVA', desc: 'Sobre a propriedade de veículos' },
      { slug: 'itcmd', sigla: 'ITCMD', desc: 'Sobre heranças e doações' },
    ],
  },
  {
    sphere: 'Municipais', accent: '#CC9900', soft: '#FFFAE6', Icon: IconCity,
    intro: 'Cobrados pela cidade. Financiam creches, postos de saúde, limpeza e a zeladoria urbana.',
    taxes: [
      { slug: 'iptu', sigla: 'IPTU', desc: 'Sobre imóveis urbanos' },
      { slug: 'iss', sigla: 'ISS', desc: 'Sobre a prestação de serviços' },
      { slug: 'itbi', sigla: 'ITBI', desc: 'Sobre a compra de imóveis' },
    ],
  },
]

const TIPOS = [
  { title: 'Impostos', desc: 'Não têm destino específico — entram no caixa para custear o governo em geral. Ex: IR, ICMS, IPTU.' },
  { title: 'Taxas', desc: 'Cobradas por um serviço público específico que você usa. Ex: taxa de coleta de lixo, emissão de documentos.' },
  { title: 'Contribuições', desc: 'Têm um destino definido por lei. Ex: o INSS, que financia a Previdência Social.' },
]

export default function ImpostosPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/aprenda" className="hover:text-gray-600">Aprenda</Link>
          <span>›</span>
          <span className="text-gray-600">Os Impostos</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-[-0.02em] mb-3">Os Impostos</h1>
        <p className="text-gray-500 text-lg mb-10 max-w-2xl">
          Impostos são como o Estado se financia. É com o que você paga que existem o SUS, a escola pública, a polícia, as estradas e a aposentadoria — entender quem cobra o quê é o primeiro passo para fiscalizar.
        </p>

        {/* Tipos */}
        <section className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Imposto, taxa ou contribuição?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TIPOS.map(t => (
              <div key={t.title} className="border border-gray-200 rounded-xl p-4">
                <p className="font-bold text-gray-900 text-sm mb-1">{t.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Por esfera */}
        <section className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Quem cobra o quê</p>
          <h2 className="text-2xl font-bold text-gray-900 tracking-[-0.01em] mb-5">Os impostos nas três esferas</h2>
          <div className="space-y-6">
            {GROUPS.map(g => (
              <div key={g.sphere}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: g.soft, color: g.accent }}>
                    <g.Icon className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: g.accent }}>{g.sphere}</h3>
                    <p className="text-xs text-gray-500">{g.intro}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {g.taxes.map(tax => (
                    <Link
                      key={tax.slug}
                      href={`/aprenda/impostos/${tax.slug}`}
                      className="border rounded-xl p-4 hover:shadow-md transition-shadow group"
                      style={{ borderColor: `${g.accent}33`, background: g.soft }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg font-extrabold" style={{ color: g.accent }}>{tax.sigla}</span>
                        <IconArrow className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{tax.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Para onde vai */}
        <section className="mb-12">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <p className="text-sm font-bold text-gray-900 mb-1.5">Para onde vai o seu imposto?</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Boa parte vai para <span className="font-medium text-gray-800">Previdência e assistência</span> (aposentadorias e benefícios), <span className="font-medium text-gray-800">saúde</span> e <span className="font-medium text-gray-800">educação</span>, além de segurança, infraestrutura e o pagamento dos juros da dívida pública. Nos Portais da Transparência você acompanha cada real.
            </p>
          </div>
        </section>

        {/* Reforma */}
        <section className="mb-10">
          <div className="rounded-2xl p-5 border border-[#00A859]/30 bg-verde-50">
            <p className="text-xs font-semibold uppercase tracking-widest text-verde-700 mb-1.5">Atenção: está mudando</p>
            <p className="text-sm font-bold text-gray-900 mb-1.5">A Reforma Tributária</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Aprovada em 2023, a reforma vai unificar vários impostos sobre o consumo em dois novos: a <span className="font-semibold">CBS</span> (federal, no lugar de PIS/COFINS/IPI) e o <span className="font-semibold">IBS</span> (estadual e municipal, no lugar de ICMS/ISS). O objetivo é simplificar — hoje o Brasil tem um dos sistemas mais complexos do mundo. A transição é gradual, até 2033.
            </p>
          </div>
        </section>

        {/* Nav */}
        <div className="border-t border-gray-100 pt-6">
          <Link href="/aprenda" className="text-sm text-gray-500 hover:text-gray-700">← Voltar para Aprenda</Link>
        </div>
      </div>
    </main>
  )
}

export const revalidate = false
