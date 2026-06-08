import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { ComponentType, SVGProps } from 'react'
import { IconFlag, IconMap, IconCity, IconCheck, IconArrow, IconBulb, IconSpark } from '@/components/ui/icons'

type IconType = ComponentType<SVGProps<SVGSVGElement>>
type Item = { title: string; desc: string }
type Gov = { role: string; count: string; period: string }
type Tributo = { sigla: string; nome: string }

type Esfera = {
  slug: string
  name: string
  short: string
  tagline: string
  accent: string
  soft: string
  Icon: IconType
  intro: string[]
  governanca: Gov[]
  responsabilidades: string[]
  exemplos: Item[]
  tributos: Tributo[]
  podeFazer: Item[]
  deveFazer: Item[]
  dicas: Item[]
}

const ESFERAS: Record<string, Esfera> = {
  federal: {
    slug: 'federal',
    name: 'Esfera Federal',
    short: 'Federal',
    tagline: 'A União — o que vale para todo o país',
    accent: '#2255AA',
    soft: '#EAF1FB',
    Icon: IconFlag,
    intro: [
      'A esfera federal é o nível mais amplo de governo: a União. Ela cuida do que afeta o Brasil inteiro e do que precisa de um padrão único para todos — como a moeda, a defesa do país, as relações com outras nações e a Previdência Social.',
      'É a esfera que define as grandes diretrizes nacionais de saúde, educação e economia, mesmo que a execução no dia a dia aconteça nos estados e municípios. Tem sede em Brasília e é onde estão o Presidente, o Congresso Nacional e os tribunais superiores.',
    ],
    governanca: [
      { role: 'Presidente da República', count: '1', period: '4 anos' },
      { role: 'Senadores', count: '81', period: '8 anos' },
      { role: 'Deputados Federais', count: '513', period: '4 anos' },
    ],
    responsabilidades: [
      'Política externa e relações com outros países',
      'Defesa nacional e Forças Armadas',
      'Emissão da moeda (Banco Central)',
      'Previdência Social — aposentadorias do INSS',
      'Coordenação do SUS e repasse de verbas da saúde',
      'Rodovias federais (as BRs) e ferrovias',
      'Ensino superior — universidades e institutos federais',
      'Leis trabalhistas (CLT) e o salário mínimo',
      'Polícia Federal e Polícia Rodoviária Federal',
    ],
    exemplos: [
      { title: 'Pagar a aposentadoria do INSS', desc: 'Quem se aposenta recebe da União, pela Previdência Social federal.' },
      { title: 'Emitir passaporte e fiscalizar fronteiras', desc: 'Documentos de viagem e o controle de quem entra e sai do país são federais.' },
      { title: 'Definir o salário mínimo', desc: 'O valor que vale para todo o Brasil é fixado pelo governo federal.' },
      { title: 'Manter universidades federais', desc: 'USP é estadual, mas a UFRJ, a UnB e os institutos federais são da União.' },
    ],
    tributos: [
      { sigla: 'IR', nome: 'Imposto de Renda' },
      { sigla: 'IPI', nome: 'Produtos Industrializados' },
      { sigla: 'IOF', nome: 'Operações Financeiras' },
      { sigla: 'INSS', nome: 'Contribuição previdenciária' },
    ],
    podeFazer: [
      { title: 'Usar os serviços digitais', desc: 'No gov.br e no app Meu INSS você resolve aposentadoria, CPF, antecedentes e muito mais.' },
      { title: 'Fiscalizar os gastos da União', desc: 'O Portal da Transparência federal mostra cada repasse, contrato e benefício pago.' },
      { title: 'Pedir informação federal', desc: 'Pela Lei de Acesso (Fala.BR) você pede dados a qualquer órgão federal e tem direito a resposta.' },
    ],
    deveFazer: [
      { title: 'Votar em presidente, senador e deputado federal', desc: 'São eles que decidem leis nacionais e o orçamento da União — pesquise antes.' },
      { title: 'Acompanhar políticas nacionais', desc: 'Decisões federais sobre impostos, juros e Previdência mexem com o seu bolso.' },
    ],
    dicas: [
      { title: 'gov.br', desc: 'Portal único dos serviços federais — login que vale para quase tudo.' },
      { title: 'Meu INSS', desc: 'App e site para aposentadoria, benefícios e perícias.' },
      { title: 'Portal da Transparência', desc: 'portaltransparencia.gov.br — gastos e repasses da União.' },
    ],
  },

  estadual: {
    slug: 'estadual',
    name: 'Esfera Estadual',
    short: 'Estadual',
    tagline: 'O estado — o nível regional entre a União e a cidade',
    accent: '#007A30',
    soft: '#E9F7EF',
    Icon: IconMap,
    intro: [
      'A esfera estadual é o nível intermediário: o estado (são 26 mais o Distrito Federal). Ela cuida do que é regional e grande demais para um município sozinho resolver — como a segurança pública, os hospitais de referência e as estradas que ligam cidades.',
      'É a esfera responsável pelas polícias que você vê na rua (Militar e Civil), pela maior parte do ensino médio e pela Justiça estadual. Cada estado tem seu Governador, sua Assembleia Legislativa e seu Tribunal de Justiça.',
    ],
    governanca: [
      { role: 'Governador', count: '1 por estado', period: '4 anos' },
      { role: 'Deputados Estaduais', count: 'mín. 24', period: '4 anos' },
    ],
    responsabilidades: [
      'Segurança pública — Polícia Militar e Polícia Civil',
      'Ensino médio (escolas estaduais)',
      'Hospitais estaduais e de referência',
      'Rodovias estaduais',
      'Transporte intermunicipal',
      'Meio ambiente e licenciamento estadual',
      'Justiça estadual (Tribunal de Justiça)',
      'Administração dos presídios',
      'Emissão de RG e CNH (Detran)',
    ],
    exemplos: [
      { title: 'Atender uma ocorrência policial', desc: 'A PM que chega ao chamado e a Polícia Civil que investiga são estaduais.' },
      { title: 'Emitir sua CNH e o RG', desc: 'O Detran, que cuida da habilitação e do licenciamento de veículos, é do estado.' },
      { title: 'Manter uma escola de ensino médio', desc: 'O ensino médio público é, em geral, responsabilidade da rede estadual.' },
      { title: 'Operar um hospital regional', desc: 'Hospitais de média e alta complexidade costumam ser geridos pelo estado.' },
    ],
    tributos: [
      { sigla: 'ICMS', nome: 'Circulação de Mercadorias e Serviços' },
      { sigla: 'IPVA', nome: 'Propriedade de Veículos' },
      { sigla: 'ITCMD', nome: 'Herança e Doações' },
    ],
    podeFazer: [
      { title: 'Usar os serviços do estado', desc: 'Detran, atendimento de saúde estadual e portais como o do governo do seu estado.' },
      { title: 'Fiscalizar a Assembleia', desc: 'O site da Assembleia Legislativa mostra o que os deputados estaduais votam e propõem.' },
      { title: 'Acionar a ouvidoria estadual', desc: 'Para reclamar de segurança, saúde ou estradas estaduais.' },
    ],
    deveFazer: [
      { title: 'Votar em governador e deputado estadual', desc: 'Eles decidem a segurança, a educação e os impostos estaduais.' },
      { title: 'Cobrar o Tribunal de Contas do Estado (TCE)', desc: 'É o órgão que fiscaliza as contas do governo estadual — você pode denunciar.' },
    ],
    dicas: [
      { title: 'Detran do seu estado', desc: 'CNH, licenciamento, multas e pontuação.' },
      { title: 'Portal do governo estadual', desc: 'Serviços, transparência e ouvidoria do estado.' },
      { title: 'Assembleia Legislativa', desc: 'Acompanhe votações e projetos dos deputados estaduais.' },
    ],
  },

  municipal: {
    slug: 'municipal',
    name: 'Esfera Municipal',
    short: 'Municipal',
    tagline: 'A cidade — o governo mais perto de você',
    accent: '#CC9900',
    soft: '#FFFAE6',
    Icon: IconCity,
    intro: [
      'A esfera municipal é o nível mais próximo do cidadão: a sua cidade (são 5.570 no Brasil). É ela que cuida do dia a dia — a creche, o posto de saúde do bairro, a coleta de lixo, a iluminação, o ônibus e a manutenção das ruas.',
      'É a esfera onde a sua participação tem efeito mais direto e rápido. Cada município tem seu Prefeito e sua Câmara de Vereadores, que cuidam dos serviços locais e organizam o crescimento da cidade (como o Plano Diretor).',
    ],
    governanca: [
      { role: 'Prefeito', count: '1 por município', period: '4 anos' },
      { role: 'Vereadores', count: '9 a 55', period: '4 anos' },
    ],
    responsabilidades: [
      'Educação infantil e fundamental (creches e escolas)',
      'Atenção básica de saúde (UBS e postos)',
      'Limpeza urbana e coleta de lixo',
      'Transporte coletivo urbano',
      'Iluminação pública e zeladoria',
      'Licenciamento de obras e alvarás',
      'Zoneamento e o Plano Diretor da cidade',
      'Vigilância sanitária local',
      'Feiras, mercados e comércio local',
    ],
    exemplos: [
      { title: 'Matricular na creche', desc: 'A educação infantil e o ensino fundamental I são responsabilidade da prefeitura.' },
      { title: 'Atender na UBS do bairro', desc: 'O posto de saúde e a atenção básica do SUS são geridos pelo município.' },
      { title: 'Recolher o lixo e tapar buracos', desc: 'A limpeza urbana, a iluminação e a manutenção das ruas são da cidade.' },
      { title: 'Liberar o alvará de um comércio', desc: 'Abrir uma loja depende de licenciamento e zoneamento municipais.' },
    ],
    tributos: [
      { sigla: 'IPTU', nome: 'Predial e Territorial Urbano' },
      { sigla: 'ISS', nome: 'Impostos Sobre Serviços' },
      { sigla: 'ITBI', nome: 'Transmissão de Imóveis' },
    ],
    podeFazer: [
      { title: 'Pedir e reclamar pelo 156', desc: 'Buraco, lixo, poda de árvore, iluminação — o 156 e o app da prefeitura registram tudo.' },
      { title: 'Participar do orçamento', desc: 'Muitas cidades têm orçamento participativo: você ajuda a decidir onde investir.' },
      { title: 'Acompanhar a Câmara', desc: 'O portal da Câmara Municipal mostra o que os vereadores votam pertinho de você.' },
    ],
    deveFazer: [
      { title: 'Votar em prefeito e vereador', desc: 'São eles que cuidam dos serviços que você usa todo dia — e os mais fáceis de cobrar.' },
      { title: 'Fiscalizar as obras da cidade', desc: 'Obra parada, superfaturada ou mal feita? Acione a Câmara, a Ouvidoria ou o Ministério Público.' },
    ],
    dicas: [
      { title: 'Disque 156', desc: 'Central de atendimento da prefeitura — serviços e reclamações.' },
      { title: 'Portal da prefeitura', desc: 'Serviços, IPTU, transparência e ouvidoria municipal.' },
      { title: 'Câmara Municipal', desc: 'Sessões e votações dos vereadores são abertas ao público.' },
    ],
  },
}

const ORDER = ['federal', 'estadual', 'municipal']

export function generateStaticParams() {
  return ORDER.map(esfera => ({ esfera }))
}

export function generateMetadata({ params }: { params: { esfera: string } }): Metadata {
  const e = ESFERAS[params.esfera]
  if (!e) return {}
  return {
    title: `${e.name} — Aprenda Política`,
    description: `${e.tagline}. Responsabilidades, exemplos práticos, impostos e o que você, cidadão, pode e deve fazer.`,
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

export default function EsferaPage({ params }: { params: { esfera: string } }) {
  const e = ESFERAS[params.esfera]
  if (!e) notFound()

  const idx = ORDER.indexOf(e.slug)
  const next = idx < ORDER.length - 1 ? ESFERAS[ORDER[idx + 1]] : null
  const prev = idx > 0 ? ESFERAS[ORDER[idx - 1]] : null

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/aprenda" className="hover:text-gray-600">Aprenda</Link>
          <span>›</span>
          <Link href="/aprenda/esferas" className="hover:text-gray-600">As Esferas de Governo</Link>
          <span>›</span>
          <span className="text-gray-600">{e.short}</span>
        </nav>

        {/* Header */}
        <header className="flex items-start gap-4 mb-8">
          <span className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: e.soft, color: e.accent }}>
            <e.Icon className="w-7 h-7" />
          </span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-[-0.02em]">{e.name}</h1>
            <p className="text-gray-500 text-lg mt-1">{e.tagline}</p>
          </div>
        </header>

        {/* O que é */}
        <section className="mb-12">
          <SectionTitle eyebrow="O que é" title="O que essa esfera faz" accent={e.accent} />
          <div className="space-y-3">
            {e.intro.map((para, i) => (
              <p key={i} className="text-[15px] text-gray-700 leading-relaxed">{para}</p>
            ))}
          </div>
        </section>

        {/* Quem governa */}
        <section className="mb-12">
          <SectionTitle eyebrow="Quem governa" title="Os eleitos dessa esfera" accent={e.accent} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {e.governanca.map(g => (
              <div key={g.role} className="border border-gray-200 rounded-xl p-4">
                <p className="font-semibold text-gray-900 text-sm">{g.role}</p>
                <p className="text-xs text-gray-500 mt-1">{g.count} · mandato de {g.period}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Responsabilidades */}
        <section className="mb-12">
          <SectionTitle eyebrow="Competências" title="Do que ela é responsável" accent={e.accent} />
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {e.responsabilidades.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <IconCheck className="w-3.5 h-3.5 mt-1 shrink-0" style={{ color: e.accent }} />
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Exemplos */}
        <section className="mb-12">
          <SectionTitle eyebrow="Na prática" title="Exemplos do dia a dia" accent={e.accent} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {e.exemplos.map((ex, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white mt-0.5" style={{ background: e.accent }}>{i + 1}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-0.5">{ex.title}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{ex.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tributos */}
        <section className="mb-12">
          <SectionTitle eyebrow="Como se financia" title="Os impostos dessa esfera" accent={e.accent} />
          <div className="flex flex-wrap gap-2.5">
            {e.tributos.map(t => (
              <div key={t.sigla} className="border border-gray-200 rounded-xl px-4 py-2.5">
                <span className="text-sm font-bold" style={{ color: e.accent }}>{t.sigla}</span>
                <span className="text-xs text-gray-500 block">{t.nome}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Você e essa esfera */}
        <section className="mb-12">
          <SectionTitle eyebrow="Você e essa esfera" title="O que você pode e deve fazer" accent={e.accent} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border rounded-2xl p-5" style={{ borderColor: `${e.accent}40`, background: e.soft }}>
              <div className="flex items-center gap-2 mb-3">
                <IconSpark className="w-4 h-4" style={{ color: e.accent }} />
                <h3 className="text-sm font-bold" style={{ color: e.accent }}>O que você PODE fazer</h3>
              </div>
              <ul className="space-y-3">
                {e.podeFazer.map((it, i) => (
                  <li key={i}>
                    <p className="text-sm font-semibold text-gray-900">{it.title}</p>
                    <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{it.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-amarelo-600/30 rounded-2xl p-5 bg-amarelo-50">
              <div className="flex items-center gap-2 mb-3">
                <IconCheck className="w-4 h-4 text-amarelo-600" />
                <h3 className="text-sm font-bold text-amarelo-600">O que você DEVE fazer</h3>
              </div>
              <ul className="space-y-3">
                {e.deveFazer.map((it, i) => (
                  <li key={i}>
                    <p className="text-sm font-semibold text-gray-900">{it.title}</p>
                    <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{it.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Dicas */}
        <section className="mb-10">
          <SectionTitle eyebrow="Mãos à obra" title="Ferramentas e dicas práticas" accent={e.accent} />
          <div className="space-y-2.5">
            {e.dicas.map((dica, i) => (
              <div key={i} className="flex items-start gap-3 border border-gray-100 rounded-xl p-3.5 bg-white">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: e.soft }}>
                  <IconBulb className="w-4 h-4" style={{ color: e.accent }} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{dica.title}</p>
                  <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{dica.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Outras esferas */}
        <section className="border-t border-gray-100 pt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Conheça as outras esferas</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ORDER.filter(s => s !== e.slug).map(s => {
              const o = ESFERAS[s]
              return (
                <Link key={s} href={`/aprenda/esferas/${s}`} className="flex items-center gap-3 border border-gray-200 rounded-xl p-3.5 hover:border-gray-300 transition-colors group">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: o.soft, color: o.accent }}>
                    <o.Icon className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{o.name}</p>
                    <p className="text-xs text-gray-500 truncate">{o.tagline}</p>
                  </div>
                  <IconArrow className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                </Link>
              )
            })}
          </div>
        </section>

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between gap-3 text-sm">
          {prev ? (
            <Link href={`/aprenda/esferas/${prev.slug}`} className="text-gray-500 hover:text-gray-800">← {prev.short}</Link>
          ) : (
            <Link href="/aprenda/esferas" className="text-gray-500 hover:text-gray-800">← As Esferas</Link>
          )}
          {next && (
            <Link href={`/aprenda/esferas/${next.slug}`} className="font-medium hover:underline" style={{ color: e.accent }}>{next.short} →</Link>
          )}
        </div>
      </div>
    </main>
  )
}

export const revalidate = false
