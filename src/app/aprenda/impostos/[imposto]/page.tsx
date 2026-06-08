import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { IconBulb } from '@/components/ui/icons'

type Item = { title: string; desc: string }
type Sphere = 'Federal' | 'Estadual' | 'Municipal'

type Imposto = {
  slug: string
  sigla: string
  name: string
  sphere: Sphere
  resumo: string
  incideShort: string
  quemPaga: string
  aliquota: string
  intro: string[]
  incide: string
  exemplos: Item[]
  dicas: Item[]
}

const COLOR: Record<Sphere, { accent: string; soft: string }> = {
  Federal: { accent: '#2255AA', soft: '#EAF1FB' },
  Estadual: { accent: '#007A30', soft: '#E9F7EF' },
  Municipal: { accent: '#CC9900', soft: '#FFFAE6' },
}

const IMPOSTOS: Record<string, Imposto> = {
  ir: {
    slug: 'ir', sigla: 'IR', name: 'Imposto de Renda', sphere: 'Federal',
    resumo: 'Sobre a renda de pessoas e empresas', incideShort: 'Renda e ganhos', quemPaga: 'Quem tem renda acima da faixa de isenção', aliquota: '0% a 27,5% (progressivo)',
    intro: [
      'O Imposto de Renda incide sobre o que as pessoas (IRPF) e as empresas (IRPJ) ganham. É progressivo: quem ganha mais paga uma alíquota maior — uma forma de o sistema buscar mais justiça.',
      'É o principal imposto direto do país e a maior fonte de arrecadação federal. Boa parte é descontada na fonte (no salário) e acertada na declaração anual.',
    ],
    incide: 'Salários, aposentadorias acima do limite, aluguéis, rendimentos de investimentos, lucros e ganhos na venda de bens (imóveis, ações).',
    exemplos: [
      { title: 'Desconto na folha de pagamento', desc: 'O IRRF é retido todo mês de quem ganha acima da faixa de isenção.' },
      { title: 'Declaração anual', desc: 'Entre março e maio você acerta as contas — e pode ter restituição ou imposto a pagar.' },
      { title: 'Venda de um imóvel ou ações', desc: 'O lucro na venda (ganho de capital) também é tributado.' },
    ],
    dicas: [
      { title: 'Use as deduções', desc: 'Gastos com saúde, educação, dependentes e previdência reduzem o imposto devido.' },
      { title: 'Declare no prazo', desc: 'Atrasar gera multa. Quem teve imposto retido a mais recebe restituição.' },
      { title: 'Guarde os comprovantes', desc: 'Notas de saúde e educação podem ser exigidas em caso de malha fina.' },
    ],
  },
  ipi: {
    slug: 'ipi', sigla: 'IPI', name: 'Imposto sobre Produtos Industrializados', sphere: 'Federal',
    resumo: 'Sobre produtos de fábrica', incideShort: 'Produtos industrializados', quemPaga: 'Você, embutido no preço', aliquota: 'Varia por produto (seletivo)',
    intro: [
      'O IPI incide sobre produtos que saem da indústria. É recolhido pelas fábricas, mas chega até você embutido no preço de quase tudo que é manufaturado.',
      'É um imposto seletivo: produtos considerados supérfluos ou nocivos (cigarros, bebidas) pagam alíquotas bem maiores, enquanto itens essenciais pagam pouco ou nada.',
    ],
    incide: 'Produtos industrializados em geral — eletrônicos, carros, eletrodomésticos, bebidas, cigarros.',
    exemplos: [
      { title: 'Um carro novo', desc: 'O preço de fábrica já inclui o IPI.' },
      { title: 'Um celular ou eletrodoméstico', desc: 'Todo produto de fábrica carrega IPI no preço.' },
      { title: 'Cigarros e bebidas', desc: 'Pagam IPI alto, justamente por serem produtos nocivos.' },
    ],
    dicas: [
      { title: 'Fica de olho nas reduções', desc: 'O governo às vezes corta o IPI para estimular setores (carros, linha branca).' },
      { title: 'Será substituído', desc: 'Com a reforma tributária, o IPI será absorvido pela CBS (novo imposto federal).' },
    ],
  },
  iof: {
    slug: 'iof', sigla: 'IOF', name: 'Imposto sobre Operações Financeiras', sphere: 'Federal',
    resumo: 'Sobre crédito, câmbio e seguros', incideShort: 'Operações financeiras', quemPaga: 'Quem faz a operação', aliquota: 'Varia por operação',
    intro: [
      'O IOF incide sobre operações financeiras — crédito, câmbio, seguros e títulos. Além de arrecadar, serve como ferramenta do governo para regular a economia, podendo subir ou descer rapidamente.',
      'É um imposto que aparece em situações do dia a dia, como usar o cartão no exterior ou pegar um empréstimo, mas que muita gente nem percebe.',
    ],
    incide: 'Empréstimos e financiamentos, compra de moeda estrangeira, compras internacionais no cartão e alguns seguros.',
    exemplos: [
      { title: 'Comprar dólar para viajar', desc: 'A compra de moeda estrangeira tem IOF.' },
      { title: 'Usar o cartão no exterior', desc: 'Compras internacionais no cartão de crédito têm IOF.' },
      { title: 'Pegar um empréstimo', desc: 'Operações de crédito têm IOF embutido no custo.' },
    ],
    dicas: [
      { title: 'Considere o IOF em viagens', desc: 'Ele encarece a compra de moeda e os gastos internacionais no cartão.' },
      { title: 'Compare as formas de câmbio', desc: 'O IOF pode variar entre cartão, espécie e conta global.' },
    ],
  },
  icms: {
    slug: 'icms', sigla: 'ICMS', name: 'Imposto sobre Circulação de Mercadorias e Serviços', sphere: 'Estadual',
    resumo: 'O maior imposto do país', incideShort: 'Quase tudo que você compra', quemPaga: 'Você, embutido no preço', aliquota: 'Varia por estado e produto',
    intro: [
      'O ICMS é o maior imposto do Brasil e a principal fonte de receita dos estados. Incide sobre a circulação de mercadorias e alguns serviços — e está embutido no preço de praticamente tudo que você consome.',
      'Por ser cobrado em cada etapa da cadeia e variar por estado e por produto, é também um dos impostos mais complexos. É o que mais pesa no preço final de muitos itens.',
    ],
    incide: 'Mercadorias em geral (comida, roupa, combustível), energia elétrica, comunicação e transporte intermunicipal.',
    exemplos: [
      { title: 'A conta de luz', desc: 'A energia elétrica é uma das maiores fontes de ICMS.' },
      { title: 'O combustível', desc: 'Boa parte do preço da gasolina é ICMS.' },
      { title: 'As compras no supermercado', desc: 'Quase todo produto carrega ICMS no preço.' },
    ],
    dicas: [
      { title: 'Varia muito por estado', desc: 'O mesmo produto pode custar diferente por causa da alíquota de ICMS.' },
      { title: 'Será substituído pelo IBS', desc: 'A reforma tributária troca o ICMS (e o ISS) por um novo imposto: o IBS.' },
    ],
  },
  ipva: {
    slug: 'ipva', sigla: 'IPVA', name: 'Imposto sobre a Propriedade de Veículos', sphere: 'Estadual',
    resumo: 'O imposto anual do seu veículo', incideShort: 'Carros, motos, caminhões', quemPaga: 'O dono do veículo', aliquota: '≈ 1% a 4% do valor/ano',
    intro: [
      'O IPVA é o imposto anual sobre a propriedade de veículos. Quem tem carro, moto ou caminhão paga todo ano, com base no valor de mercado do veículo.',
      'Metade do que você paga fica com o estado e a outra metade vai para o município onde o veículo é registrado — por isso vale registrar na sua cidade.',
    ],
    incide: 'A propriedade de veículos automotores: carros, motos, caminhões.',
    exemplos: [
      { title: 'O boleto anual do carro', desc: 'Chega no começo do ano, com vencimento conforme a placa.' },
      { title: 'Metade vai para a sua cidade', desc: '50% do IPVA fica com o município onde o veículo é registrado.' },
    ],
    dicas: [
      { title: 'Pague à vista', desc: 'O pagamento em cota única costuma dar desconto.' },
      { title: 'Veja se tem isenção', desc: 'Veículos antigos (idade varia por estado), de PCD e táxis podem ser isentos.' },
    ],
  },
  itcmd: {
    slug: 'itcmd', sigla: 'ITCMD', name: 'Imposto sobre Transmissão Causa Mortis e Doação', sphere: 'Estadual',
    resumo: 'Sobre heranças e doações', incideShort: 'Herança e doações', quemPaga: 'Quem recebe', aliquota: '≈ 2% a 8% (por estado)',
    intro: [
      'O ITCMD incide quando bens ou valores mudam de dono sem compra — por herança (quando alguém falece) ou por doação. É um imposto estadual.',
      'A alíquota varia por estado, geralmente entre 2% e 8%. Em muitos lugares ela é progressiva: quanto maior o valor transmitido, maior o percentual.',
    ],
    incide: 'Bens e valores recebidos por herança ou por doação (imóveis, dinheiro, veículos, participações).',
    exemplos: [
      { title: 'Receber um imóvel de herança', desc: 'O herdeiro paga ITCMD sobre o valor do bem.' },
      { title: 'Ganhar uma doação de valor', desc: 'Doações acima de certos limites também são tributadas.' },
    ],
    dicas: [
      { title: 'Planejamento sucessório', desc: 'Organizar a transmissão em vida pode reduzir custos e conflitos.' },
      { title: 'Confira a alíquota do seu estado', desc: 'Varia bastante — de 2% a 8% conforme a lei estadual.' },
    ],
  },
  iptu: {
    slug: 'iptu', sigla: 'IPTU', name: 'Imposto Predial e Territorial Urbano', sphere: 'Municipal',
    resumo: 'O imposto anual do seu imóvel', incideShort: 'Imóveis urbanos', quemPaga: 'O dono do imóvel', aliquota: '≈ 0,3% a 1,5% do valor venal',
    intro: [
      'O IPTU é o imposto municipal anual sobre imóveis urbanos — casas, apartamentos e terrenos na cidade. É calculado sobre o valor venal (o valor que a prefeitura atribui ao imóvel).',
      'É uma das principais receitas próprias dos municípios e financia diretamente os serviços da cidade onde você mora.',
    ],
    incide: 'A propriedade de imóveis na zona urbana: casas, apartamentos e terrenos.',
    exemplos: [
      { title: 'O carnê anual do imóvel', desc: 'Chega no começo do ano, com opção de cota única ou parcelado.' },
      { title: 'Terreno vazio também paga', desc: 'Lotes urbanos sem construção também são tributados.' },
    ],
    dicas: [
      { title: 'Pague à vista', desc: 'A cota única costuma ter desconto.' },
      { title: 'Veja se tem isenção', desc: 'Aposentados de baixa renda e imóveis de pequeno valor podem ser isentos (varia por cidade).' },
      { title: 'Confira o valor venal', desc: 'Se achar o valor superestimado, dá para contestar na prefeitura.' },
    ],
  },
  iss: {
    slug: 'iss', sigla: 'ISS', name: 'Imposto Sobre Serviços', sphere: 'Municipal',
    resumo: 'Sobre a prestação de serviços', incideShort: 'Serviços em geral', quemPaga: 'O prestador (no preço)', aliquota: '2% a 5%',
    intro: [
      'O ISS é o imposto municipal sobre a prestação de serviços. É pago por quem presta o serviço — do salão de beleza ao médico, do mecânico ao desenvolvedor de software — e embutido no valor cobrado de você.',
      'A alíquota fica entre 2% e 5%, definida por cada cidade. É uma das principais receitas municipais, ao lado do IPTU.',
    ],
    incide: 'Serviços em geral: saúde, educação privada, beleza, consertos, profissionais autônomos, tecnologia.',
    exemplos: [
      { title: 'A nota de um serviço', desc: 'Um conserto, um corte de cabelo ou uma consulta particular têm ISS.' },
      { title: 'A mensalidade da escola particular', desc: 'Serviços de educação privada também recolhem ISS.' },
    ],
    dicas: [
      { title: 'Peça a nota fiscal', desc: 'Ajuda a fiscalizar e, em algumas cidades, dá direito a programas de Nota Fiscal premiada.' },
      { title: 'Será substituído pelo IBS', desc: 'A reforma tributária troca o ISS (e o ICMS) pelo novo IBS.' },
    ],
  },
  itbi: {
    slug: 'itbi', sigla: 'ITBI', name: 'Imposto sobre Transmissão de Bens Imóveis', sphere: 'Municipal',
    resumo: 'Sobre a compra de imóveis', incideShort: 'Compra de imóvel', quemPaga: 'O comprador', aliquota: '≈ 2% a 3% do valor',
    intro: [
      'O ITBI é o imposto municipal cobrado na compra e venda de um imóvel. Diferente do ITCMD (herança e doação), ele incide na transmissão onerosa — quando há pagamento.',
      'É pago pelo comprador no momento de registrar o imóvel no cartório, e entra no custo total da aquisição.',
    ],
    incide: 'A compra (transmissão onerosa) de imóveis urbanos.',
    exemplos: [
      { title: 'Comprar um apartamento', desc: 'O ITBI é pago para registrar a compra no cartório de imóveis.' },
      { title: 'Faz parte do custo de comprar', desc: 'Some ao valor do imóvel, junto com as despesas de cartório.' },
    ],
    dicas: [
      { title: 'Inclua no orçamento da compra', desc: 'O ITBI costuma ser 2% a 3% do valor — planeje esse custo extra.' },
      { title: 'Programas habitacionais', desc: 'A primeira aquisição pelo SFH pode ter desconto em algumas cidades.' },
    ],
  },
}

const ORDER = ['ir', 'ipi', 'iof', 'icms', 'ipva', 'itcmd', 'iptu', 'iss', 'itbi']

export function generateStaticParams() {
  return ORDER.map(imposto => ({ imposto }))
}

export function generateMetadata({ params }: { params: { imposto: string } }): Metadata {
  const t = IMPOSTOS[params.imposto]
  if (!t) return {}
  return {
    title: `${t.sigla} — ${t.name} — Aprenda Política`,
    description: `O que é o ${t.sigla}, sobre o que incide, quem paga, exemplos práticos e dicas. ${t.resumo}.`,
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

export default function ImpostoPage({ params }: { params: { imposto: string } }) {
  const t = IMPOSTOS[params.imposto]
  if (!t) notFound()
  const { accent, soft } = COLOR[t.sphere]

  const idx = ORDER.indexOf(t.slug)
  const prev = idx > 0 ? IMPOSTOS[ORDER[idx - 1]] : null
  const next = idx < ORDER.length - 1 ? IMPOSTOS[ORDER[idx + 1]] : null

  const facts = [
    { label: 'Esfera', value: t.sphere },
    { label: 'Incide sobre', value: t.incideShort },
    { label: 'Quem paga', value: t.quemPaga },
    { label: 'Alíquota', value: t.aliquota },
  ]

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/aprenda" className="hover:text-gray-600">Aprenda</Link>
          <span>›</span>
          <Link href="/aprenda/impostos" className="hover:text-gray-600">Os Impostos</Link>
          <span>›</span>
          <span className="text-gray-600">{t.sigla}</span>
        </nav>

        {/* Header */}
        <header className="flex items-start gap-4 mb-6">
          <span className="px-3 h-14 min-w-14 rounded-2xl flex items-center justify-center shrink-0 text-lg font-extrabold" style={{ background: soft, color: accent }}>
            {t.sigla}
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-[-0.02em] leading-tight">{t.name}</h1>
            <div className="flex gap-1.5 mt-2">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: soft, color: accent }}>{t.sphere}</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t.resumo}</span>
            </div>
          </div>
        </header>

        {/* Facts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-10">
          {facts.map(f => (
            <div key={f.label} className="border border-gray-100 rounded-xl px-3 py-2.5 bg-gray-50">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">{f.label}</p>
              <p className="text-xs font-semibold text-gray-800 leading-tight mt-0.5">{f.value}</p>
            </div>
          ))}
        </div>

        {/* O que é */}
        <section className="mb-12">
          <SectionTitle eyebrow="O que é" title={`Entenda o ${t.sigla}`} accent={accent} />
          <div className="space-y-3">
            {t.intro.map((para, i) => (
              <p key={i} className="text-[15px] text-gray-700 leading-relaxed">{para}</p>
            ))}
          </div>
        </section>

        {/* Incide sobre */}
        <section className="mb-12">
          <SectionTitle eyebrow="Fato gerador" title="Sobre o que incide" accent={accent} />
          <div className="rounded-2xl p-5 border" style={{ borderColor: `${accent}33`, background: soft }}>
            <p className="text-sm text-gray-700 leading-relaxed">{t.incide}</p>
          </div>
        </section>

        {/* Exemplos */}
        <section className="mb-12">
          <SectionTitle eyebrow="Na prática" title="Onde você encontra" accent={accent} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {t.exemplos.map((ex, i) => (
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

        {/* Dicas */}
        <section className="mb-10">
          <SectionTitle eyebrow="Bom saber" title="Dicas para o cidadão" accent={accent} />
          <div className="space-y-2.5">
            {t.dicas.map((dica, i) => (
              <div key={i} className="flex items-start gap-3 border border-gray-100 rounded-xl p-3.5 bg-white">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: soft }}>
                  <IconBulb className="w-4 h-4" style={{ color: accent }} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{dica.title}</p>
                  <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{dica.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Outros impostos */}
        <section className="border-t border-gray-100 pt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Outros impostos</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ORDER.filter(s => s !== t.slug).map(s => {
              const o = IMPOSTOS[s]
              const oc = COLOR[o.sphere]
              return (
                <Link key={s} href={`/aprenda/impostos/${s}`} className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 hover:border-gray-300 transition-colors">
                  <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0" style={{ background: oc.soft, color: oc.accent }}>{o.sigla}</span>
                  <span className="text-xs text-gray-600 truncate">{o.incideShort}</span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between gap-3 text-sm">
          {prev ? (
            <Link href={`/aprenda/impostos/${prev.slug}`} className="text-gray-500 hover:text-gray-800">← {prev.sigla}</Link>
          ) : (
            <Link href="/aprenda/impostos" className="text-gray-500 hover:text-gray-800">← Os Impostos</Link>
          )}
          {next && (
            <Link href={`/aprenda/impostos/${next.slug}`} className="font-medium hover:underline" style={{ color: accent }}>{next.sigla} →</Link>
          )}
        </div>
      </div>
    </main>
  )
}

export const revalidate = false
