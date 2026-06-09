export interface Topic {
  slug: string
  label: string
  tagline: string
  emoji: string
  accent: string
  intro: string[]
  examples: string[]
  keywords: string // alternativas (já sem acento/caixa) p/ a RegExp
}

export const TOPICS: Topic[] = [
  {
    slug: 'saude', label: 'Saúde', tagline: 'SUS, vacinas, hospitais e atenção à população', emoji: '🏥', accent: '#E11D48',
    intro: [
      'O Congresso legisla sobre o Sistema Único de Saúde (SUS), planos de saúde, medicamentos, vigilância sanitária e políticas de prevenção.',
      'São leis que afetam o atendimento em hospitais e postos, o acesso a remédios e vacinas, e os direitos de pacientes.',
    ],
    examples: ['Inclusão de novos exames e medicamentos no SUS', 'Regras para planos de saúde e reajustes', 'Campanhas de vacinação e saúde mental'],
    keywords: 'saude|sus|hospital|posto de saude|ubs|medic|enfermag|vacina|imuniz|doenca|epidemi|pandemia|farmac|remedio|medicament|cancer|diabetes|saude mental|psicolog|psiquiatr|samu|plano de saude|anvisa|sanitari',
  },
  {
    slug: 'educacao', label: 'Educação', tagline: 'Escolas, universidades, professores e ensino', emoji: '📚', accent: '#2563EB',
    intro: [
      'Trata de educação básica e superior, financiamento (FUNDEB), currículo, merenda, e a carreira dos professores.',
      'São leis que definem como funcionam escolas, creches e universidades, e o acesso de alunos ao ensino.',
    ],
    examples: ['Mudanças no ENEM e no acesso à universidade', 'Merenda escolar e educação infantil', 'Valorização e piso dos professores'],
    keywords: 'educac|escola|ensino|aluno|professor|universidad|faculdad|creche|alfabetiz|merenda|fundeb|enem|bolsa de estudo|magisterio|pedagog|curricul|analfabet',
  },
  {
    slug: 'seguranca', label: 'Segurança Pública', tagline: 'Polícia, crimes, penas e combate à violência', emoji: '🛡️', accent: '#475569',
    intro: [
      'Abrange polícia, sistema prisional, definição de crimes e penas, e políticas de combate à violência.',
      'São leis que mudam o Código Penal, criam ou endurecem crimes, e organizam a segurança pública.',
    ],
    examples: ['Aumento de pena para determinados crimes', 'Regras sobre porte e posse de armas', 'Combate ao feminicídio e à violência'],
    keywords: 'seguranca publica|policia|policial|crime|criminal|violencia|homicidio|furto|roubo|trafico| pena |presidio|penitenciari|delegacia|arma de fogo|porte de arma|codigo penal|feminicidio|milicia|guarda municipal',
  },
  {
    slug: 'meio-ambiente', label: 'Meio Ambiente', tagline: 'Clima, florestas, água e sustentabilidade', emoji: '🌳', accent: '#16A34A',
    intro: [
      'Trata de preservação ambiental, desmatamento, recursos hídricos, saneamento, clima e energia limpa.',
      'São leis que protegem florestas e fauna, regulam poluição e resíduos, e incentivam a sustentabilidade.',
    ],
    examples: ['Proteção da Amazônia e combate ao desmatamento', 'Saneamento básico e tratamento de água', 'Incentivo a energias renováveis'],
    keywords: 'meio ambiente|ambiental|desmatament|floresta|amazonia|clima|aquecimento global|poluic|residuo|reciclag| agua |saneament|fauna|flora|biodiversidad|sustentavel|carbono|energia renovavel|preservac',
  },
  {
    slug: 'trabalho', label: 'Trabalho e Emprego', tagline: 'CLT, salário, sindicatos e aposentadoria', emoji: '💼', accent: '#B45309',
    intro: [
      'Abrange direitos trabalhistas (CLT), salário, jornada, FGTS, sindicatos e a Previdência (INSS).',
      'São leis que afetam quem trabalha com carteira assinada, autônomos e quem se aposenta.',
    ],
    examples: ['Mudanças na jornada e em direitos da CLT', 'Regras de aposentadoria e do INSS', 'Salário mínimo e seguro-desemprego'],
    keywords: 'trabalh|emprego|clt|salario|fgts|sindicato|aposentad|previdenc|inss|jornada|ferias|demiss|carteira|estagi|terceirizac|piso salarial|seguro-desemprego',
  },
  {
    slug: 'economia-impostos', label: 'Economia e Impostos', tagline: 'Tributos, orçamento e atividade econômica', emoji: '💰', accent: '#0D9488',
    intro: [
      'Trata de impostos (IR, ICMS, ISS), orçamento público, crédito, e regras para empresas.',
      'São leis que mudam quanto se paga de tributo e como o Estado arrecada e gasta.',
    ],
    examples: ['Mudanças no Imposto de Renda e isenções', 'Simples Nacional e MEI', 'Reforma tributária e novas taxas'],
    keywords: 'imposto|tribut|icms| iss |ipva|iptu|imposto de renda| taxa |aliquota|fiscal|orcament|divida publica|juros|inflac| credito |financ|economia|microempresa|simples nacional| mei ',
  },
  {
    slug: 'mulher', label: 'Direitos da Mulher', tagline: 'Igualdade, proteção e combate à violência', emoji: '♀️', accent: '#DB2777',
    intro: [
      'Abrange igualdade de gênero, proteção contra a violência doméstica (Lei Maria da Penha) e direitos da mulher.',
      'São leis que combatem o feminicídio e o assédio, e garantem direitos de gestantes e mães.',
    ],
    examples: ['Fortalecimento da Lei Maria da Penha', 'Combate ao assédio e ao feminicídio', 'Igualdade salarial entre homens e mulheres'],
    keywords: 'mulher|feminin|feminic|maria da penha|violencia domestica|igualdade de genero|materni|gestante|assedio',
  },
  {
    slug: 'animais', label: 'Direitos dos Animais', tagline: 'Proteção e bem-estar animal', emoji: '🐾', accent: '#CA8A04',
    intro: [
      'Trata da proteção e bem-estar de animais domésticos e silvestres, e do combate a maus-tratos.',
      'São leis que punem a crueldade, regulam a posse de pets e protegem a fauna.',
    ],
    examples: ['Penas maiores para maus-tratos a animais', 'Castração e adoção responsável', 'Proteção de animais silvestres'],
    keywords: 'maus-tratos|maus tratos|bem-estar animal|protecao animal|animais|crueldade contra|veterinari|zoonose|adocao de animais|castracao| pet ',
  },
  {
    slug: 'transporte', label: 'Transporte e Trânsito', tagline: 'CTB, veículos, rodovias e mobilidade', emoji: '🚗', accent: '#4F46E5',
    intro: [
      'Abrange o Código de Trânsito (CTB), veículos, habilitação (CNH), rodovias, pedágios e transporte público.',
      'São leis que afetam motoristas, passageiros e a mobilidade nas cidades.',
    ],
    examples: ['Mudanças no CTB e na CNH', 'Regras de pedágio e rodovias', 'Transporte público e mobilidade urbana'],
    keywords: 'transporte|transito|veiculo|automovel|motocicleta| ctb |codigo de transito|rodovia|pedagio|onibus| metro |ciclovia| cnh |habilitac|estacionament|mobilidade urbana',
  },
  {
    slug: 'tecnologia', label: 'Tecnologia e Internet', tagline: 'Dados, redes, IA e mundo digital', emoji: '💻', accent: '#0891B2',
    intro: [
      'Trata de internet, proteção de dados (LGPD), redes sociais, inteligência artificial e telecomunicações.',
      'São leis que regulam o ambiente digital, a privacidade e as plataformas online.',
    ],
    examples: ['Proteção de dados pessoais (LGPD)', 'Regulação de redes sociais e IA', 'Acesso à internet e telecom'],
    keywords: 'internet| digital|dados pessoais| lgpd |tecnolog|software|aplicativo|rede social|cibern|inteligencia artificial|telecomunicac|provedor|marco civil',
  },
  {
    slug: 'consumidor', label: 'Defesa do Consumidor', tagline: 'CDC, cobranças, garantias e Procon', emoji: '🛒', accent: '#EA580C',
    intro: [
      'Abrange o Código de Defesa do Consumidor (CDC), publicidade, cobranças, garantias e o Procon.',
      'São leis que protegem quem compra produtos e contrata serviços.',
    ],
    examples: ['Combate à publicidade enganosa', 'Regras de cobrança e garantia', 'Direitos em compras pela internet'],
    keywords: 'consumidor| cdc |codigo de defesa do consumidor|procon|publicidade enganosa| cobranca|fornecedor|relacao de consumo',
  },
  {
    slug: 'crianca', label: 'Criança e Adolescente', tagline: 'ECA, proteção e direitos da infância', emoji: '🧒', accent: '#F59E0B',
    intro: [
      'Trata do Estatuto da Criança e do Adolescente (ECA), proteção contra abusos e direitos da infância.',
      'São leis que combatem o trabalho infantil e o bullying, e protegem menores.',
    ],
    examples: ['Combate ao trabalho infantil', 'Proteção contra bullying e abuso', 'Pensão alimentícia e guarda'],
    keywords: 'crianca|infanti|adolescent| eca |estatuto da crianca| menor |bullying|trabalho infantil|pensao aliment',
  },
  {
    slug: 'idoso', label: 'Pessoa Idosa', tagline: 'Estatuto do Idoso e envelhecimento', emoji: '👵', accent: '#7C3AED',
    intro: [
      'Abrange o Estatuto do Idoso, direitos da terceira idade, e políticas de envelhecimento.',
      'São leis que protegem idosos contra abusos e garantem prioridade e dignidade.',
    ],
    examples: ['Prioridade de atendimento à pessoa idosa', 'Combate à violência contra idosos', 'Benefícios e cuidados na terceira idade'],
    keywords: 'idos|terceira idade|estatuto do idoso|envelheciment|asilo|longevidad',
  },
  {
    slug: 'cultura-esporte', label: 'Cultura e Esporte', tagline: 'Arte, patrimônio, esporte e lazer', emoji: '🎭', accent: '#DC2626',
    intro: [
      'Trata de cultura, patrimônio histórico, incentivo à arte (Lei Rouanet) e esporte.',
      'São leis que apoiam artistas, atletas e a preservação cultural.',
    ],
    examples: ['Incentivo à cultura e à arte', 'Apoio ao esporte e a atletas', 'Proteção do patrimônio histórico'],
    keywords: 'cultura|cultural|artist|patrimonio historico| musica|cinema|teatro|esporte|esportiv|atleta|olimpic|futebol|lei rouanet',
  },
  {
    slug: 'agro', label: 'Agropecuária', tagline: 'Agricultura, pecuária e mundo rural', emoji: '🌾', accent: '#65A30D',
    intro: [
      'Abrange agricultura, pecuária, crédito rural, defensivos e a vida no campo.',
      'São leis que afetam produtores rurais, o agronegócio e a produção de alimentos.',
    ],
    examples: ['Crédito rural e apoio ao produtor', 'Regras sobre defensivos agrícolas', 'Reforma agrária e terras'],
    keywords: 'agricultura|agropecuari|agricultor| rural|agronegoci|pecuari| safra |fazend|plantio|colheita|defensivo|agrotoxico|reforma agraria',
  },
]

const byslug = new Map(TOPICS.map(t => [t.slug, t]))
export const getTopic = (slug: string): Topic | undefined => byslug.get(slug)

const norm = (s: string) =>
  ` ${(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()} `

const RES = TOPICS.map(t => ({ slug: t.slug, re: new RegExp(`(${t.keywords})`, 'i') }))

/** Classifica uma proposição nos temas curados pelo texto (heurística por palavra-chave). */
export function classifyTopics(title: string, summary: string, themes: string[]): string[] {
  const text = norm(`${title} ${summary} ${(themes || []).join(' ')}`)
  return RES.filter(({ re }) => re.test(text)).map(({ slug }) => slug)
}
