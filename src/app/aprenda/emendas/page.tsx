import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Emendas Parlamentares — o que são e como funcionam — Aprenda Política',
  description: 'O que são emendas parlamentares, os tipos (individual, bancada, comissão, relator), o orçamento impositivo e o que o cidadão pode fiscalizar.',
}
export const revalidate = false

const ACCENT = '#0D9488'

const TIPOS = [
  { nome: 'Individual', desc: 'Cada deputado e senador tem uma cota anual para destinar a obras e serviços. Tem autor único e destino definido — dá para saber exatamente quem mandou e para onde.' },
  { nome: 'De bancada', desc: 'Propostas pela bancada de um estado em conjunto. Atendem projetos de interesse estadual ou regional; o "autor" é a bancada, não um parlamentar.' },
  { nome: 'De comissão', desc: 'Apresentadas por comissões permanentes da Câmara ou do Senado, para temas de sua área.' },
  { nome: 'De relator (RP9)', desc: 'Indicadas pelo relator do orçamento. Foram alvo de polêmica por baixa transparência sobre quem realmente as indicou (o "orçamento secreto").' },
]

const FISCALIZAR = [
  'De quem é a emenda e para qual município ela foi destinada.',
  'A função (saúde, educação, infraestrutura…) e o valor.',
  'A diferença entre o valor empenhado (prometido) e o pago (entregue).',
  'Se a obra ou serviço financiado realmente saiu do papel na sua cidade.',
]

export default function EmendasAprendaPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/aprenda" className="hover:text-gray-600">Aprenda</Link><span>›</span>
          <span className="text-gray-600">Emendas Parlamentares</span>
        </nav>

        <div className="flex items-center gap-4 mb-5">
          <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${ACCENT}14` }}>💸</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Emendas Parlamentares</h1>
        </div>

        <div className="space-y-3 text-gray-700 leading-relaxed mb-8">
          <p>Emenda parlamentar é o instrumento pelo qual deputados e senadores <span className="font-semibold">direcionam parte do orçamento da União</span> para obras, serviços e repasses — muitas vezes para os municípios de suas bases eleitorais.</p>
          <p>É uma das formas mais concretas de o parlamentar levar recursos federais para a sua cidade — e, por isso, uma das mais importantes de acompanhar.</p>
        </div>

        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Os tipos de emenda</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TIPOS.map(t => (
              <div key={t.nome} className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{t.nome}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Orçamento impositivo</h2>
          <p className="text-gray-700 leading-relaxed">
            Desde 2015, parte das emendas é <span className="font-semibold">impositiva</span>: o governo é
            obrigado a executá-las, não pode simplesmente engavetá-las. Isso deu mais força ao Congresso na
            divisão do orçamento — e tornou ainda mais relevante saber quem destina o quê.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Empenhado × pago</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm font-bold text-gray-900 mb-1">Empenhado</div>
              <p className="text-sm text-gray-600">O dinheiro <span className="font-medium">reservado/prometido</span> para a emenda. É um compromisso, mas ainda não saiu do caixa.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm font-bold text-gray-900 mb-1">Pago</div>
              <p className="text-sm text-gray-600">O dinheiro que <span className="font-medium">efetivamente foi entregue</span>. É o que de fato chegou ao destino.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>O que você pode fiscalizar</h2>
          <ul className="space-y-1.5">
            {FISCALIZAR.map((f, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="mt-1" style={{ color: ACCENT }}>✓</span>{f}</li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100">
          <Link href="/emendas" className="text-sm font-medium hover:underline" style={{ color: ACCENT }}>Ver as emendas reais →</Link>
          <Link href="/aprenda" className="text-sm text-gray-500 hover:text-gray-700">← Voltar para o Aprenda</Link>
        </div>
      </div>
    </main>
  )
}
