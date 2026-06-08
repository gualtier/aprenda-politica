import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { ComponentType, SVGProps } from 'react'
import {
  IconBank, IconFile, IconScale, IconFlag, IconMap, IconCity,
  IconCheck, IconArrow, IconBulb, IconSpark,
} from '@/components/ui/icons'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

type Instance = { Icon: IconType; color: string; label: string; role: string; detail: string }
type Item = { title: string; desc: string }

type Poder = {
  slug: string
  name: string
  short: string
  tagline: string
  accent: string
  soft: string
  Icon: IconType
  intro: string[]
  instances: Instance[]
  exemplos: Item[]
  deveres: string[]
  podeFazer: Item[]
  deveFazer: Item[]
  dicas: Item[]
}

const FLAG = { Icon: IconFlag, color: '#2255AA' }
const MAP = { Icon: IconMap, color: '#007A30' }
const CITY = { Icon: IconCity, color: '#CC9900' }

const PODERES: Record<string, Poder> = {
  executivo: {
    slug: 'executivo',
    name: 'Poder Executivo',
    short: 'Executivo',
    tagline: 'Governa, administra e coloca as leis em prática',
    accent: '#00A859',
    soft: '#E9F7EF',
    Icon: IconBank,
    intro: [
      'O Poder Executivo é quem coloca a máquina pública para funcionar. Ele administra o dinheiro dos impostos, mantém hospitais, escolas, ruas e a segurança, e transforma as leis aprovadas pelo Legislativo em serviços que chegam até você.',
      'É o poder mais visível no dia a dia: quando você usa o SUS, matricula um filho na escola pública, anda numa rua asfaltada ou recebe um benefício social, está vendo o Executivo em ação. Ele é chefiado pelo Presidente (União), pelos Governadores (estados) e pelos Prefeitos (municípios) — todos eleitos pelo voto direto.',
    ],
    instances: [
      { ...FLAG, label: 'Federal', role: 'Presidente da República', detail: 'Chefe de Estado e de Governo. Comanda os ministérios, as Forças Armadas e políticas nacionais como o SUS e a Previdência. 4 anos, com uma reeleição.' },
      { ...MAP, label: 'Estadual', role: 'Governador', detail: 'Comanda o estado: segurança pública (Polícia Militar e Civil), escolas e hospitais estaduais e rodovias estaduais. 4 anos, com uma reeleição.' },
      { ...CITY, label: 'Municipal', role: 'Prefeito', detail: 'Cuida do que é mais próximo de você: postos de saúde, creches, coleta de lixo, iluminação e transporte. 4 anos, com uma reeleição.' },
    ],
    exemplos: [
      { title: 'Construir e manter um hospital', desc: 'Decidir onde fica, contratar profissionais, comprar equipamentos e remédios — tudo é gestão do Executivo.' },
      { title: 'Operar programas sociais', desc: 'Programas de transferência de renda, como o Bolsa Família, são criados e operados pelo Executivo federal.' },
      { title: 'Asfaltar uma rua e iluminar o bairro', desc: 'Obras e zeladoria locais são responsabilidade da prefeitura, pagas com o orçamento municipal.' },
      { title: 'Organizar a vacinação', desc: 'Campanhas como a da gripe são planejadas e executadas pelo SUS, sob o comando do Executivo.' },
      { title: 'Sancionar ou vetar uma lei', desc: 'Quando o Congresso aprova uma lei, o Presidente decide sancioná-la (aprovar) ou vetá-la.' },
    ],
    deveres: [
      'Executar o orçamento aprovado pelo Legislativo, gastando o dinheiro público onde foi autorizado',
      'Garantir serviços essenciais: saúde, educação, segurança e infraestrutura',
      'Ser transparente — publicar gastos, contratos e licitações (Lei de Acesso à Informação)',
      'Responder às demandas do cidadão pelas ouvidorias',
      'Cumprir e fazer cumprir as leis e a Constituição',
    ],
    podeFazer: [
      { title: 'Acompanhar os gastos públicos', desc: 'Nos Portais da Transparência você vê quanto e com quem o governo gasta o seu imposto.' },
      { title: 'Cobrar serviços e fazer pedidos', desc: 'Ouvidorias, o 156 da prefeitura e o app da sua cidade registram reclamações e solicitações.' },
      { title: 'Pedir informações oficiais', desc: 'Pela Lei de Acesso à Informação (e-SIC), qualquer pessoa pode pedir dados ao governo e tem direito a resposta.' },
      { title: 'Participar das decisões', desc: 'Conselhos de saúde e educação e o orçamento participativo abrem espaço pra você opinar.' },
    ],
    deveFazer: [
      { title: 'Votar de forma consciente', desc: 'Você escolhe quem vai administrar bilhões em recursos — pesquise propostas e histórico antes de votar.' },
      { title: 'Fiscalizar entre as eleições', desc: 'O voto não encerra a sua participação: acompanhe obras, gastos e o cumprimento das promessas.' },
      { title: 'Denunciar irregularidades', desc: 'Suspeita de desvio? Acione a Ouvidoria, o Ministério Público ou o Tribunal de Contas.' },
    ],
    dicas: [
      { title: 'Portal da Transparência', desc: 'portaltransparencia.gov.br — gastos, servidores, contratos e benefícios da União.' },
      { title: 'Disque 156 / app da prefeitura', desc: 'Para buraco na rua, lixo, iluminação e zeladoria do seu bairro.' },
      { title: 'e-SIC (Lei de Acesso)', desc: 'Peça qualquer informação pública — o governo tem prazo legal para responder.' },
      { title: 'Conselhos municipais', desc: 'Participe das reuniões abertas de saúde e educação da sua cidade.' },
    ],
  },

  legislativo: {
    slug: 'legislativo',
    name: 'Poder Legislativo',
    short: 'Legislativo',
    tagline: 'Faz as leis, aprova o orçamento e fiscaliza',
    accent: '#2563EB',
    soft: '#EAF1FB',
    Icon: IconFile,
    intro: [
      'O Poder Legislativo é a voz do povo dentro do governo. Seus membros — deputados, senadores e vereadores — são eleitos para representar você. A função principal é fazer as leis que organizam a vida em sociedade: do trânsito ao imposto, da saúde à internet.',
      'Mas legislar é só metade do trabalho. O Legislativo também aprova (ou rejeita) o orçamento — decide quanto o governo pode gastar e com o quê — e fiscaliza o Executivo, podendo abrir investigações (CPIs) e até processos de impeachment. É o contrapeso que impede o governante de fazer o que bem entender.',
    ],
    instances: [
      { ...FLAG, label: 'Federal', role: 'Congresso Nacional', detail: 'Câmara dos Deputados (513, representam o povo) + Senado (81, três por estado). Fazem as leis federais e o orçamento da União.' },
      { ...MAP, label: 'Estadual', role: 'Assembleia Legislativa', detail: 'Os deputados estaduais fazem as leis do estado e fiscalizam o Governador. Mínimo de 24 por estado.' },
      { ...CITY, label: 'Municipal', role: 'Câmara Municipal', detail: 'Os vereadores fazem as leis da cidade (como o Plano Diretor), aprovam o orçamento municipal e fiscalizam o Prefeito.' },
    ],
    exemplos: [
      { title: 'Aprovar uma nova lei', desc: 'Do Marco do Saneamento à Lei Geral de Proteção de Dados — toda lei nasce no Legislativo.' },
      { title: 'Aprovar ou cortar o orçamento', desc: 'Nenhum gasto público acontece sem autorização do Legislativo no orçamento anual.' },
      { title: 'Abrir uma CPI', desc: 'Comissões Parlamentares de Inquérito investigam suspeitas de irregularidades, com amplos poderes.' },
      { title: 'Derrubar um veto', desc: 'Se o Presidente veta uma lei, o Congresso pode derrubar o veto e mantê-la em vigor.' },
      { title: 'Sabatinar autoridades', desc: 'O Senado aprova (ou rejeita) ministros do STF, diretores de agências e embaixadores.' },
    ],
    deveres: [
      'Legislar pensando no interesse público, não em interesses próprios',
      'Aprovar o orçamento e fiscalizar como cada real é gasto',
      'Representar fielmente quem os elegeu e prestar contas do mandato',
      'Tornar públicas as votações e a presença nas sessões',
      'Cobrar resultados do Executivo',
    ],
    podeFazer: [
      { title: 'Acompanhar como seu parlamentar vota', desc: 'Os sites da Câmara, do Senado e das câmaras municipais mostram votos, presença, projetos e gastos de gabinete.' },
      { title: 'Dialogar e pressionar', desc: 'Você pode mandar e-mail, mensagem ou visitar o gabinete do seu deputado ou vereador para pedir e cobrar.' },
      { title: 'Sugerir e apoiar leis', desc: 'No portal e-Cidadania (Senado) você sugere leis e vota em ideias; uma sugestão com apoio pode virar projeto.' },
      { title: 'Propor lei de iniciativa popular', desc: 'Com assinaturas de cerca de 1% do eleitorado, o povo pode apresentar um projeto de lei diretamente.' },
    ],
    deveFazer: [
      { title: 'Conhecer seus representantes', desc: 'Saiba quem é o seu deputado e vereador — são eles que decidem leis e orçamento em seu nome.' },
      { title: 'Acompanhar votações importantes', desc: 'Leis que afetam seu bolso e seus direitos passam por lá; vale ficar de olho nas decisões.' },
      { title: 'Cobrar coerência', desc: 'Compare o que foi prometido na campanha com o jeito que o parlamentar realmente vota.' },
    ],
    dicas: [
      { title: 'e-Cidadania (Senado)', desc: 'senado.leg.br/ecidadania — sugira leis, vote em ideias e participe de consultas.' },
      { title: 'Portal da Câmara dos Deputados', desc: 'Veja votos, presença, projetos e gastos de cada deputado federal.' },
      { title: 'Câmara Municipal da sua cidade', desc: 'Acompanhe o que os vereadores votam e propõem localmente.' },
      { title: 'Audiências públicas', desc: 'São abertas ao cidadão para debater projetos antes da votação.' },
    ],
  },

  judiciario: {
    slug: 'judiciario',
    name: 'Poder Judiciário',
    short: 'Judiciário',
    tagline: 'Interpreta as leis, julga conflitos e protege direitos',
    accent: '#7c3aed',
    soft: '#F3EEFD',
    Icon: IconScale,
    intro: [
      'O Poder Judiciário é o guardião das leis e dos seus direitos. Quando há um conflito — entre pessoas, empresas ou contra o próprio governo — é a Justiça que decide quem tem razão, aplicando a lei de forma imparcial. Ela também protege a Constituição: pode anular uma lei ou um ato do governo que a desrespeite.',
      'Diferente dos outros poderes, seus membros não são eleitos. Os juízes entram por concurso público e julgam com independência; os tribunais superiores, como o STF, têm ministros indicados pelo Presidente e aprovados pelo Senado. Isso protege a Justiça da pressão política — ela responde à lei, não a votos.',
    ],
    instances: [
      { ...FLAG, label: 'Superior', role: 'STF, STJ, TSE…', detail: 'O STF guarda a Constituição (11 ministros). O STJ uniformiza a lei federal. O TSE organiza as eleições. Julgam em última instância.' },
      { ...MAP, label: 'Estadual', role: 'Tribunal de Justiça (TJ)', detail: 'Cada estado tem seu TJ, que julga os recursos (2ª instância) e a maior parte das causas do dia a dia.' },
      { ...CITY, label: '1ª instância', role: 'Juízes, Varas e Juizados', detail: 'Onde o seu processo começa: o juiz dá a primeira decisão. Os Juizados Especiais resolvem causas menores de forma rápida.' },
    ],
    exemplos: [
      { title: 'Garantir um tratamento pelo SUS', desc: 'Se um direito é negado, a Justiça pode determinar (por liminar) que o Estado forneça o remédio ou a cirurgia.' },
      { title: 'Resolver uma briga de consumidor', desc: 'Cobrança indevida, produto com defeito, voo cancelado — o Juizado Especial resolve, muitas vezes sem advogado.' },
      { title: 'Declarar uma lei inconstitucional', desc: 'O STF pode derrubar uma lei que viole a Constituição, mesmo que já aprovada pelo Congresso.' },
      { title: 'Julgar crimes', desc: 'Do furto ao homicídio — este pelo Tribunal do Júri, com jurados cidadãos — a Justiça julga e aplica as penas.' },
      { title: 'Conceder um habeas corpus', desc: 'Protege a liberdade de quem sofre ou está ameaçado de uma prisão ilegal.' },
    ],
    deveres: [
      'Julgar com imparcialidade e independência, sem favorecer os poderosos',
      'Garantir o devido processo legal — direito de defesa e a um julgamento justo',
      'Proteger os direitos fundamentais e a Constituição',
      'Dar publicidade aos processos (a maioria é pública)',
      'Buscar decisões em prazo razoável',
    ],
    podeFazer: [
      { title: 'Acessar a Justiça de graça', desc: 'A Defensoria Pública oferece advogado gratuito a quem não pode pagar por um.' },
      { title: 'Resolver pequenas causas sozinho', desc: 'Nos Juizados Especiais, causas de até 20 salários mínimos dispensam advogado.' },
      { title: 'Defender direitos coletivos', desc: 'Um problema que afeta muita gente? O Ministério Público pode agir a partir da sua denúncia.' },
      { title: 'Usar instrumentos constitucionais', desc: 'Habeas corpus (liberdade) e mandado de segurança (direito líquido e certo) protegem o cidadão.' },
    ],
    deveFazer: [
      { title: 'Conhecer e exercer seus direitos', desc: 'Direito negado e não cobrado é direito perdido — a Justiça existe justamente para isso.' },
      { title: 'Servir como jurado se convocado', desc: 'No Tribunal do Júri, cidadãos comuns decidem casos graves; é um dever cívico.' },
      { title: 'Respeitar o devido processo', desc: 'Cumprir decisões e usar os caminhos legais fortalece o Estado de Direito.' },
    ],
    dicas: [
      { title: 'Defensoria Pública', desc: 'Advogado gratuito para quem precisa — a do seu estado ou a DPU para causas federais.' },
      { title: 'Juizado Especial (Pequenas Causas)', desc: 'Rápido, gratuito e sem advogado em causas de até 20 salários mínimos.' },
      { title: 'Ministério Público', desc: 'Para denúncias de interesse coletivo: meio ambiente, consumidor, improbidade.' },
      { title: 'Consulta processual', desc: 'Os tribunais permitem acompanhar processos pela internet — a maioria é pública.' },
    ],
  },
}

const ORDER = ['executivo', 'legislativo', 'judiciario']

export function generateStaticParams() {
  return ORDER.map(poder => ({ poder }))
}

export function generateMetadata({ params }: { params: { poder: string } }): Metadata {
  const p = PODERES[params.poder]
  if (!p) return {}
  return {
    title: `${p.name} — Aprenda Política`,
    description: `${p.tagline}. O que faz, exemplos práticos, deveres e o que você, cidadão, pode e deve fazer.`,
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

export default function PoderPage({ params }: { params: { poder: string } }) {
  const p = PODERES[params.poder]
  if (!p) notFound()

  const idx = ORDER.indexOf(p.slug)
  const prev = idx > 0 ? PODERES[ORDER[idx - 1]] : null
  const next = idx < ORDER.length - 1 ? PODERES[ORDER[idx + 1]] : null

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/aprenda" className="hover:text-gray-600">Aprenda</Link>
          <span>›</span>
          <Link href="/aprenda/poderes" className="hover:text-gray-600">Os Três Poderes</Link>
          <span>›</span>
          <span className="text-gray-600">{p.short}</span>
        </nav>

        {/* Header */}
        <header className="flex items-start gap-4 mb-8">
          <span className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: p.soft, color: p.accent }}>
            <p.Icon className="w-7 h-7" />
          </span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-[-0.02em]">{p.name}</h1>
            <p className="text-gray-500 text-lg mt-1">{p.tagline}</p>
          </div>
        </header>

        {/* O que é */}
        <section className="mb-12">
          <SectionTitle eyebrow="O que é" title="Para que serve esse poder" accent={p.accent} />
          <div className="space-y-3">
            {p.intro.map((para, i) => (
              <p key={i} className="text-[15px] text-gray-700 leading-relaxed">{para}</p>
            ))}
          </div>
        </section>

        {/* Onde atua */}
        <section className="mb-12">
          <SectionTitle eyebrow="Onde atua" title="Nas três esferas" accent={p.accent} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {p.instances.map(inst => (
              <div key={inst.label} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <inst.Icon className="w-4 h-4" style={{ color: inst.color }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: inst.color }}>{inst.label}</span>
                </div>
                <p className="font-semibold text-gray-900 text-sm mb-1">{inst.role}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{inst.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Exemplos práticos */}
        <section className="mb-12">
          <SectionTitle eyebrow="Na prática" title="Exemplos do dia a dia" accent={p.accent} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {p.exemplos.map((ex, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white mt-0.5" style={{ background: p.accent }}>{i + 1}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-0.5">{ex.title}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{ex.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Deveres do poder */}
        <section className="mb-12">
          <SectionTitle eyebrow="Responsabilidades" title="O que é dever desse poder" accent={p.accent} />
          <ul className="space-y-2.5">
            {p.deveres.map((d, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: p.soft }}>
                  <IconCheck className="w-3.5 h-3.5" style={{ color: p.accent }} />
                </span>
                <span className="text-sm text-gray-700 leading-relaxed">{d}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Você e esse poder */}
        <section className="mb-12">
          <SectionTitle eyebrow="Você e esse poder" title="O que você pode e deve fazer" accent={p.accent} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pode fazer */}
            <div className="border rounded-2xl p-5" style={{ borderColor: `${p.accent}40`, background: p.soft }}>
              <div className="flex items-center gap-2 mb-3">
                <IconSpark className="w-4 h-4" style={{ color: p.accent }} />
                <h3 className="text-sm font-bold" style={{ color: p.accent }}>O que você PODE fazer</h3>
              </div>
              <ul className="space-y-3">
                {p.podeFazer.map((it, i) => (
                  <li key={i}>
                    <p className="text-sm font-semibold text-gray-900">{it.title}</p>
                    <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{it.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
            {/* Deve fazer */}
            <div className="border border-amarelo-600/30 rounded-2xl p-5 bg-amarelo-50">
              <div className="flex items-center gap-2 mb-3">
                <IconCheck className="w-4 h-4 text-amarelo-600" />
                <h3 className="text-sm font-bold text-amarelo-600">O que você DEVE fazer</h3>
              </div>
              <ul className="space-y-3">
                {p.deveFazer.map((it, i) => (
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
          <SectionTitle eyebrow="Mãos à obra" title="Ferramentas e dicas práticas" accent={p.accent} />
          <div className="space-y-2.5">
            {p.dicas.map((dica, i) => (
              <div key={i} className="flex items-start gap-3 border border-gray-100 rounded-xl p-3.5 bg-white">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: p.soft }}>
                  <IconBulb className="w-4 h-4" style={{ color: p.accent }} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{dica.title}</p>
                  <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{dica.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Outros poderes */}
        <section className="border-t border-gray-100 pt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Conheça os outros poderes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ORDER.filter(s => s !== p.slug).map(s => {
              const o = PODERES[s]
              return (
                <Link key={s} href={`/aprenda/poderes/${s}`} className="flex items-center gap-3 border border-gray-200 rounded-xl p-3.5 hover:border-gray-300 transition-colors group">
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
            <Link href={`/aprenda/poderes/${prev.slug}`} className="text-gray-500 hover:text-gray-800">← {prev.short}</Link>
          ) : (
            <Link href="/aprenda/poderes" className="text-gray-500 hover:text-gray-800">← Os Três Poderes</Link>
          )}
          {next && (
            <Link href={`/aprenda/poderes/${next.slug}`} className="font-medium hover:underline" style={{ color: p.accent }}>{next.short} →</Link>
          )}
        </div>
      </div>
    </main>
  )
}

export const revalidate = false
