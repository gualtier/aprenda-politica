export const CATEGORIAS = [
  { id: 'processo-legislativo', label: 'Processo Legislativo', pill: 'bg-verde-600 text-white',      chip: 'bg-verde-50 text-verde-700' },
  { id: 'orcamento',            label: 'Orçamento',            pill: 'bg-amarelo-600 text-white',    chip: 'bg-amarelo-50 text-amarelo-600' },
  { id: 'eleicoes',             label: 'Eleições',             pill: 'bg-amarelo-500 text-gray-900', chip: 'bg-amarelo-50 text-amarelo-600' },
  { id: 'instituicoes',         label: 'Instituições',         pill: 'bg-esfera-federal text-white', chip: 'bg-gray-100 text-esfera-federal' },
  { id: 'justica',              label: 'Justiça',              pill: 'bg-gray-800 text-white',       chip: 'bg-gray-100 text-gray-700' },
  { id: 'participacao',         label: 'Participação',         pill: 'bg-verde-500 text-white',      chip: 'bg-verde-50 text-verde-600' },
] as const
export type CategoriaId = typeof CATEGORIAS[number]['id']
export const getCategoria = (id: string) => CATEGORIAS.find(c => c.id === id)

export interface Termo {
  slug: string
  termo: string
  nomeCompleto?: string
  categoria: CategoriaId
  definicaoCurta: string
  definicao: string[]
  exemplo: string
  relacionados: string[]
  temas?: string[]
  links?: { label: string; href: string }[]
}

export const TERMOS: Termo[] = [
  // ─── PROCESSO LEGISLATIVO (18) ────────────────────────────────────────────
  {
    slug: 'pec', termo: 'PEC', nomeCompleto: 'Proposta de Emenda à Constituição',
    categoria: 'processo-legislativo',
    definicaoCurta: 'Proposta que altera o texto da Constituição Federal — exige aprovação por 3/5 dos parlamentares, em dois turnos, na Câmara e no Senado.',
    definicao: [
      'A PEC é o instrumento usado para mudar a Constituição, a lei mais importante do país. Por mexer nas regras fundamentais, o caminho é mais difícil do que o de uma lei comum: são necessários 3/5 dos votos (308 deputados e 49 senadores), em dois turnos de votação em cada Casa.',
      'Nem tudo pode ser alterado por PEC: as chamadas cláusulas pétreas — como o voto direto e secreto, a separação dos Poderes e os direitos individuais — não podem ser abolidas.',
      'Depois de aprovada, a PEC é promulgada pelo próprio Congresso, sem sanção ou veto do presidente.',
    ],
    exemplo: 'A PEC do teto de gastos (2016) limitou o crescimento das despesas públicas por 20 anos. Precisou passar duas vezes na Câmara e duas no Senado, sempre com pelo menos 3/5 dos votos.',
    relacionados: ['quorum', 'promulgacao', 'pl', 'casa-revisora'],
    temas: ['economia-impostos'],
    links: [
      { label: 'PECs em tramitação', href: '/proposicoes?tipo=PEC' },
      { label: 'Como uma lei é criada', href: '/aprenda/processo-legislativo' },
    ],
  },
  {
    slug: 'pl', termo: 'PL', nomeCompleto: 'Projeto de Lei',
    categoria: 'processo-legislativo',
    definicaoCurta: 'A forma mais comum de criar ou alterar leis no Brasil — aprovado por maioria simples e sujeito a sanção ou veto presidencial.',
    definicao: [
      'O Projeto de Lei é a proposta mais frequente no Congresso. Pode ser apresentado por qualquer deputado, senador, pelo presidente da República, pelo STF, pelos tribunais superiores ou pela própria sociedade (via iniciativa popular).',
      'Para virar lei, o PL precisa ser aprovado pela maioria dos presentes na votação (maioria simples), em ambas as Casas. Depois vai ao presidente, que pode sancioná-lo — tornando-o lei — ou vetá-lo.',
      'Há dois tipos principais: o PL ordinário, para leis comuns, e o PLP, que trata de matérias que a Constituição reserva à lei complementar (exige maioria absoluta).',
    ],
    exemplo: 'O projeto que criou o Marco Civil da Internet tramitou por anos na Câmara e no Senado antes de ser aprovado e sancionado como lei em 2014, regulando direitos e deveres de usuários e provedores.',
    relacionados: ['plp', 'sancao', 'veto', 'tramitacao'],
    links: [
      { label: 'PLs em tramitação', href: '/proposicoes?tipo=PL' },
      { label: 'Como uma lei é criada', href: '/aprenda/processo-legislativo' },
    ],
  },
  {
    slug: 'plp', termo: 'PLP', nomeCompleto: 'Projeto de Lei Complementar',
    categoria: 'processo-legislativo',
    definicaoCurta: 'Proposta de lei para matérias que a Constituição exige tratamento especial — aprovada por maioria absoluta (metade mais um de todos os parlamentares).',
    definicao: [
      'Certas matérias — como o estatuto dos partidos políticos, o Código Tributário Nacional e as normas gerais de licitação — só podem ser reguladas por lei complementar. O PLP é o projeto que cria ou altera esse tipo de lei.',
      'A diferença em relação ao PL ordinário está no quórum: o PLP precisa da maioria absoluta dos membros de cada Casa (257 deputados e 41 senadores), e não apenas dos presentes na sessão.',
      'Após aprovado em ambas as Casas, também passa pela sanção ou veto do presidente da República.',
    ],
    exemplo: 'A Lei de Responsabilidade Fiscal, que impõe limites ao gasto público dos governos, é uma lei complementar — qualquer mudança nela exige um PLP aprovado por maioria absoluta no Congresso.',
    relacionados: ['pl', 'quorum', 'sancao', 'tramitacao'],
    temas: ['economia-impostos'],
    links: [
      { label: 'PLPs em tramitação', href: '/proposicoes?tipo=PLP' },
    ],
  },
  {
    slug: 'medida-provisoria', termo: 'Medida Provisória', nomeCompleto: 'MP — Medida Provisória',
    categoria: 'processo-legislativo',
    definicaoCurta: 'Ato com força de lei imediata editado pelo presidente da República em casos de urgência e relevância — válido por 60 dias, prorrogáveis uma vez por igual período.',
    definicao: [
      'A Medida Provisória permite ao Executivo agir com rapidez quando uma situação urgente exige mudança legal imediata. Ao ser publicada no Diário Oficial, a MP já tem efeito de lei, independentemente de votação no Congresso.',
      'O prazo é de 60 dias, prorrogável automaticamente por mais 60. Se não for votada pelo Congresso nesse período, perde a validade. Durante a tramitação, uma comissão mista de deputados e senadores analisa a MP antes do plenário.',
      'Existem restrições: MPs não podem tratar de matérias já disciplinadas por lei complementar, direito penal, eleitoral ou processual penal, entre outras.',
    ],
    exemplo: 'No início da pandemia, em 2020, o governo federal editou diversas medidas provisórias para criar benefícios emergenciais e flexibilizar regras trabalhistas, com efeito imediato enquanto o Congresso deliberava.',
    relacionados: ['pl', 'tramitacao', 'regime-de-urgencia', 'sancao'],
    links: [
      { label: 'MPs em tramitação', href: '/proposicoes?tipo=MPV' },
    ],
  },
  {
    slug: 'pdl', termo: 'PDL', nomeCompleto: 'Projeto de Decreto Legislativo',
    categoria: 'processo-legislativo',
    definicaoCurta: 'Proposta que regula matérias de competência exclusiva do Congresso e não está sujeita à sanção presidencial — como ratificar tratados internacionais.',
    definicao: [
      'O Decreto Legislativo é usado para tratar de assuntos que são competência exclusiva do Congresso Nacional, como a ratificação de tratados e acordos internacionais assinados pelo Executivo, a regulação de medidas provisórias rejeitadas e a aprovação de estado de sítio.',
      'Por ser competência exclusiva do Legislativo, o decreto legislativo não vai à sanção ou veto do presidente. Após aprovado, é promulgado pelo próprio Congresso.',
      'É diferente do decreto presidencial, que é ato unilateral do Executivo dentro de suas competências.',
    ],
    exemplo: 'Quando o Brasil assina um acordo comercial com outro país, o texto do tratado é enviado ao Congresso. O PDL que o ratifica precisa ser aprovado em ambas as Casas para que o acordo passe a ter validade interna.',
    relacionados: ['promulgacao', 'pl', 'plenario'],
    links: [
      { label: 'Proposições em tramitação', href: '/proposicoes' },
    ],
  },
  {
    slug: 'emenda-ao-projeto', termo: 'Emenda (a um projeto)',
    categoria: 'processo-legislativo',
    definicaoCurta: 'Modificação proposta ao texto de um projeto de lei durante sua tramitação — pode alterar, acrescentar ou suprimir trechos.',
    definicao: [
      'Ao longo da tramitação, deputados e senadores podem propor mudanças ao texto original de qualquer projeto. Essas alterações são chamadas de emendas e podem acrescentar dispositivos (emenda aditiva), suprimir partes (supressiva) ou substituir o texto (substitutiva).',
      'As emendas são analisadas pelo relator e pelas comissões. Quando uma Casa aprova o projeto com emendas em relação ao que veio da outra, o projeto volta para a casa de origem — garantindo que ambas concordem com o texto final.',
      'Não confundir com emenda parlamentar ao orçamento, que é um instrumento diferente para destinar recursos do orçamento federal.',
    ],
    exemplo: 'Um projeto que regulava o trabalho remoto chegou à Câmara sem mencionar auxílio-internet. Deputados apresentaram emendas para incluir esse direito, e o texto final aprovado incorporou a mudança.',
    relacionados: ['pl', 'relator', 'casa-revisora', 'tramitacao'],
    links: [
      { label: 'Como uma lei é criada', href: '/aprenda/processo-legislativo' },
    ],
  },
  {
    slug: 'sancao', termo: 'Sanção',
    categoria: 'processo-legislativo',
    definicaoCurta: 'Ato do presidente da República que aprova e transforma em lei um projeto aprovado pelo Congresso — pode ser expressa (assinatura) ou tácita (silêncio em 15 dias úteis).',
    definicao: [
      'Após um projeto de lei ser aprovado pelo Congresso, vai à mesa do presidente. Se ele concordar, assina a sanção e o projeto vira lei. Se não agir em 15 dias úteis, ocorre a sanção tácita: o silêncio equivale à aprovação.',
      'A sanção pode ser parcial: o presidente pode vetar partes do texto enquanto sanciona o restante. O veto vai ao Congresso para apreciação.',
      'Para PECs e decretos legislativos, não há sanção presidencial — o próprio Congresso promulga.',
    ],
    exemplo: 'Após o Congresso aprovar a lei que criou o Bolsa Família, o presidente assinou a sanção e o programa passou a existir juridicamente, podendo ser executado pelo governo.',
    relacionados: ['veto', 'promulgacao', 'pl', 'pec'],
    links: [
      { label: 'Etapa de sanção', href: '/aprenda/processo-legislativo/sancao' },
    ],
  },
  {
    slug: 'veto', termo: 'Veto',
    categoria: 'processo-legislativo',
    definicaoCurta: 'Rejeição total ou parcial, pelo presidente da República, de um projeto aprovado pelo Congresso — por inconstitucionalidade ou contrariedade ao interesse público.',
    definicao: [
      'O presidente pode vetar um projeto por dois motivos: inconstitucionalidade (o texto viola a Constituição) ou contrariedade ao interesse público (razão política ou administrativa). O veto pode ser total ou parcial.',
      'O veto é informado ao Congresso em 48 horas com justificativa. Os parlamentares têm prazo para apreciá-lo. Se o Congresso votar pela derrubada do veto — com maioria absoluta em sessão conjunta —, o projeto é promulgado mesmo assim.',
      'Enquanto o veto não é apreciado pelo Congresso, ele fica pendente na pauta. Há casos históricos de vetos que aguardaram anos pela votação.',
    ],
    exemplo: 'O presidente vetou um artigo de projeto de lei sobre precatórios alegando impacto fiscal não previsto. O Congresso incluiu a votação desse veto em sua pauta meses depois para decidir se derrubava ou mantinha a decisão.',
    relacionados: ['sancao', 'derrubada-de-veto', 'pl', 'promulgacao'],
    links: [
      { label: 'Etapa de sanção e veto', href: '/aprenda/processo-legislativo/sancao' },
    ],
  },
  {
    slug: 'derrubada-de-veto', termo: 'Derrubada de veto',
    categoria: 'processo-legislativo',
    definicaoCurta: 'Votação do Congresso Nacional que rejeita o veto presidencial e promulga a parte vetada — exige maioria absoluta em sessão conjunta.',
    definicao: [
      'Quando o presidente veta um projeto, o Congresso pode discordar e derrubar o veto. A votação ocorre em sessão conjunta (deputados e senadores votando juntos) e exige maioria absoluta dos membros de cada Casa.',
      'Se o veto for derrubado, a parte vetada é promulgada pelo próprio Congresso, passando a integrar a lei como se o veto nunca tivesse existido.',
      'Na prática, a derrubada de veto é rara quando o presidente tem apoio da maioria parlamentar — mas pode ocorrer em momentos de tensão entre Executivo e Legislativo.',
    ],
    exemplo: 'O Congresso derrubou o veto presidencial a um artigo que garantia correção em benefícios sociais, promulgando o trecho de forma autônoma e contrariando a posição do governo.',
    relacionados: ['veto', 'sancao', 'promulgacao', 'quorum'],
    links: [
      { label: 'Processo legislativo', href: '/aprenda/processo-legislativo' },
    ],
  },
  {
    slug: 'quorum', termo: 'Quórum',
    categoria: 'processo-legislativo',
    definicaoCurta: 'Número mínimo de parlamentares necessário para que uma votação seja válida — varia conforme o tipo de matéria.',
    definicao: [
      'Quórum é o número mínimo de membros que precisa estar presente (ou votar a favor) para que uma decisão seja válida. Na Câmara, há diferentes tipos: maioria simples (mais votos a favor do que contra, entre os presentes), maioria absoluta (257 deputados — metade mais um do total) e maioria qualificada.',
      'Para PEC, exige-se 3/5 dos membros: 308 na Câmara e 49 no Senado. Para lei complementar, maioria absoluta. Já para matérias rotineiras, basta maioria simples dos presentes, desde que haja pelo menos maioria absoluta na sessão.',
      'O não atingimento do quórum pode travar votações importantes e é frequentemente usado como estratégia de obstrução parlamentar.',
    ],
    exemplo: 'Uma PEC sobre reforma tributária precisou ser reagendada várias vezes na Câmara porque os líderes não conseguiam reunir os 308 votos necessários (3/5 dos 513 deputados) para sua aprovação.',
    relacionados: ['pec', 'plp', 'plenario', 'tramitacao'],
    links: [
      { label: 'Como uma lei é criada', href: '/aprenda/processo-legislativo' },
    ],
  },
  {
    slug: 'plenario', termo: 'Plenário',
    categoria: 'processo-legislativo',
    definicaoCurta: 'O espaço físico e o momento institucional em que todos os membros de uma Casa Legislativa se reúnem para debater e votar propostas.',
    definicao: [
      'O plenário é o fórum máximo de deliberação de uma Casa. Na Câmara, reúne os 513 deputados; no Senado, os 81 senadores. É ali que ocorrem as votações finais das propostas legislativas, os grandes debates políticos e os pronunciamentos.',
      'Nem toda proposta chega ao plenário: muitas são aprovadas conclusivamente pelas comissões, sem precisar da votação em plenário (salvo se houver recurso de um décimo dos membros da Casa).',
      'As sessões do plenário são públicas e transmitidas ao vivo. O presidente da Mesa Diretora conduz os trabalhos.',
    ],
    exemplo: 'A reforma da previdência foi votada no plenário da Câmara após semanas de negociação — a sessão durou horas, com discursos de líderes de todos os partidos antes da votação nominal.',
    relacionados: ['comissao', 'mesa-diretora', 'quorum', 'tramitacao'],
    links: [
      { label: 'Etapa de plenário', href: '/aprenda/processo-legislativo/plenario' },
    ],
  },
  {
    slug: 'comissao', termo: 'Comissão',
    categoria: 'processo-legislativo',
    definicaoCurta: 'Grupo de parlamentares especializado em um tema que analisa propostas, realiza audiências e pode aprovar projetos sem precisar do plenário.',
    definicao: [
      'As comissões são órgãos colegiados formados por um grupo menor de parlamentares para analisar propostas em determinada área temática — saúde, educação, finanças, etc. Elas fazem o trabalho técnico e político antes (ou em vez) do plenário.',
      'Há comissões permanentes (existem ao longo de toda a legislatura, como a Comissão de Constituição e Justiça, CCJ) e comissões temporárias (criadas para uma finalidade específica, como uma CPI ou uma comissão especial para analisar uma PEC).',
      'Pelas comissões, também passam audiências públicas, convocações de ministros e a análise de contas do governo.',
    ],
    exemplo: 'Uma proposta sobre planos de saúde passou primeiro pela Comissão de Saúde (análise técnica do mérito), depois pela Comissão de Finanças (impacto orçamentário) e pela CCJ (constitucionalidade) antes de ir ao plenário.',
    relacionados: ['cpi', 'relator', 'plenario', 'tramitacao'],
    links: [
      { label: 'Etapa de comissões', href: '/aprenda/processo-legislativo/comissoes' },
    ],
  },
  {
    slug: 'cpi', termo: 'CPI', nomeCompleto: 'Comissão Parlamentar de Inquérito',
    categoria: 'processo-legislativo',
    definicaoCurta: 'Comissão criada para investigar fatos determinados de interesse público — tem poderes de investigação próprios de autoridade judicial e prazo para concluir trabalhos.',
    definicao: [
      'A CPI é uma ferramenta de fiscalização do Congresso sobre o Executivo e a sociedade. Para ser criada, basta a assinatura de um terço dos membros da Casa (171 deputados ou 27 senadores). Ela deve ter objeto determinado (não pode ser genérica) e prazo definido.',
      'Suas competências incluem intimar testemunhas, determinar quebras de sigilo bancário e fiscal, requisitar documentos e realizar buscas e apreensões — todos poderes equiparados aos de um juiz de instrução. Mas não pode prender nem condenar.',
      'Ao final, a CPI elabora um relatório com suas conclusões e eventuais indicações ao Ministério Público. As investigações e indiciamentos ficam a cargo das autoridades competentes.',
    ],
    exemplo: 'A CPI da Covid, instalada em 2021 no Senado, ouviu dezenas de autoridades e empresários ao longo de meses, investigando a gestão da pandemia e a compra de vacinas. Ao final, seu relatório foi encaminhado ao STF e ao Ministério Público.',
    relacionados: ['comissao', 'plenario', 'congresso-nacional', 'stf'],
    links: [
      { label: 'Proposições em tramitação', href: '/proposicoes' },
    ],
  },
  {
    slug: 'relator', termo: 'Relator',
    categoria: 'processo-legislativo',
    definicaoCurta: 'Parlamentar designado para analisar uma proposta, emitir parecer técnico e apresentar texto final com eventuais emendas — tem papel central na tramitação.',
    definicao: [
      'Para cada proposta que tramita nas comissões ou no plenário, um parlamentar é designado como relator. Cabe a ele estudar o texto, ouvir especialistas e interessados, e apresentar um parecer recomendando a aprovação, rejeição ou aprovação com emendas.',
      'O relator tem grande influência no destino de uma proposta: pode incorporar mudanças, propor substitutivos (texto inteiramente novo) e negociar com os demais parlamentares. Em comissões, seu parecer pode ser decisivo.',
      'O relator-geral do orçamento (LOA) tem papel especialmente relevante, pois propõe as emendas de relator que afetam a distribuição de recursos — prática que ficou conhecida como "orçamento secreto" antes de ser declarada inconstitucional.',
    ],
    exemplo: 'Na reforma tributária, o deputado designado como relator reuniu-se com secretários estaduais, representantes do setor empresarial e movimentos sociais antes de apresentar seu substitutivo ao texto original da PEC.',
    relacionados: ['comissao', 'emenda-ao-projeto', 'tramitacao', 'emenda-de-relator'],
    links: [
      { label: 'Como uma lei é criada', href: '/aprenda/processo-legislativo' },
    ],
  },
  {
    slug: 'tramitacao', termo: 'Tramitação',
    categoria: 'processo-legislativo',
    definicaoCurta: 'O percurso oficial que uma proposta segue desde sua apresentação até a sanção ou arquivamento — passando por comissões, plenário e, se necessário, a outra Casa.',
    definicao: [
      'Toda proposta legislativa percorre um caminho institucional chamado tramitação. Começa com a apresentação pelo autor, passa pela CCJ (constitucionalidade), depois por comissões temáticas e, em muitos casos, vai ao plenário para votação final.',
      'Se aprovada na casa de origem, segue para a casa revisora. Havendo emendas, volta para a original. Só após ambas aprovarem o mesmo texto é que a proposta segue para sanção ou promulgação.',
      'A tramitação pode ser acelerada pelo regime de urgência ou pelo regime de prioridade, ou pode ser trancada se medidas provisórias não votadas bloquearem a pauta.',
    ],
    exemplo: 'Um projeto apresentado em março levou 18 meses até virar lei: ficou dois meses na CCJ, quatro em comissões temáticas, passou pelo plenário da Câmara, seguiu ao Senado onde levou mais oito meses, e só então foi sancionado.',
    relacionados: ['comissao', 'casa-revisora', 'regime-de-urgencia', 'pl'],
    links: [
      { label: 'Como uma lei é criada', href: '/aprenda/processo-legislativo' },
    ],
  },
  {
    slug: 'regime-de-urgencia', termo: 'Regime de urgência',
    categoria: 'processo-legislativo',
    definicaoCurta: 'Mecanismo que abrevia a tramitação de uma proposta, dispensando prazos regulares de comissões e acelerando sua votação em plenário.',
    definicao: [
      'Normalmente, projetos de lei percorrem comissões com prazos regulamentares que podem levar meses. O regime de urgência permite encurtar esse caminho, levando a proposta direto ao plenário — ou eliminando prazos entre as etapas.',
      'Pode ser requerido pelo autor, pelo governo (urgência constitucional para projetos do Executivo) ou aprovado pela maioria do plenário. Para medidas provisórias e matérias com prazo constitucional, a urgência é automática.',
      'O uso frequente do regime de urgência é alvo de críticas porque pode reduzir o tempo de debate e de participação da sociedade na análise das propostas.',
    ],
    exemplo: 'Diante de uma crise econômica, o governo solicitou regime de urgência para um projeto de reforma fiscal. Em vez de meses em comissões, o texto foi votado em plenário na semana seguinte, com debate concentrado em poucos dias.',
    relacionados: ['tramitacao', 'medida-provisoria', 'plenario', 'pl'],
    links: [
      { label: 'Como uma lei é criada', href: '/aprenda/processo-legislativo' },
    ],
  },
  {
    slug: 'casa-revisora', termo: 'Casa revisora',
    categoria: 'processo-legislativo',
    definicaoCurta: 'A segunda Casa do Congresso que analisa um projeto aprovado pela primeira — Senado revisa o que vem da Câmara, e vice-versa.',
    definicao: [
      'O sistema bicameral brasileiro exige que toda proposta seja aprovada por ambas as Casas do Congresso. Quando um projeto é aprovado na Câmara dos Deputados, vai ao Senado Federal (que atua como casa revisora) e vice-versa.',
      'Se a casa revisora aprovar sem alterações, o projeto segue direto para sanção. Se fizer emendas, o texto volta para a casa de origem, que decide se aceita ou rejeita as mudanças — garantindo que ambas concordem com o mesmo texto final.',
      'Esse sistema visa criar um duplo filtro de análise, evitando que propostas mal elaboradas ou apressadas se tornem lei sem reflexão adequada.',
    ],
    exemplo: 'Um projeto aprovado pela Câmara chegou ao Senado, onde foi substancialmente modificado. Voltou à Câmara, que aceitou parte das emendas do Senado e rejeitou outras — e o texto final com essas definições foi o que virou lei.',
    relacionados: ['tramitacao', 'pl', 'pec', 'sancao'],
    links: [
      { label: 'Etapa de casa revisora', href: '/aprenda/processo-legislativo/casa-revisora' },
    ],
  },
  {
    slug: 'promulgacao', termo: 'Promulgação',
    categoria: 'processo-legislativo',
    definicaoCurta: 'Ato formal que atesta a existência de uma nova lei e a insere no ordenamento jurídico — feita pelo presidente da República (ou pelo Congresso, no caso de PECs e vetos derrubados).',
    definicao: [
      'Após a sanção, cabe ao presidente da República promulgar a lei — um ato formal que confirma sua existência e determina sua entrada em vigor. A lei promulgada é publicada no Diário Oficial da União.',
      'No caso de PECs, não há sanção: o próprio Congresso Nacional promulga a emenda constitucional. O mesmo vale para decretos legislativos e resoluções, que são de competência exclusiva do Legislativo.',
      'Se o presidente não promulgar em até 48 horas após a sanção, o presidente do Senado pode fazê-lo. Se este também não o fizer, o vice-presidente do Senado tem a mesma competência.',
    ],
    exemplo: 'Após aprovação em dois turnos na Câmara e dois no Senado, a PEC da reforma tributária foi promulgada em sessão solene do Congresso, sem a participação do presidente da República — e imediatamente publicada no Diário Oficial.',
    relacionados: ['sancao', 'pec', 'veto', 'pl'],
    links: [
      { label: 'Etapa de promulgação', href: '/aprenda/processo-legislativo/publicacao' },
    ],
  },

  // ─── ORÇAMENTO (10) ────────────────────────────────────────────────────────
  {
    slug: 'emenda-parlamentar', termo: 'Emenda parlamentar',
    categoria: 'orcamento',
    definicaoCurta: 'Instrumento pelo qual deputados e senadores destinam recursos do orçamento federal para obras, serviços e programas nos seus estados e municípios.',
    definicao: [
      'Emendas parlamentares são inserções feitas pelos congressistas no projeto de lei orçamentária anual (LOA) para destinar verbas a ações específicas, geralmente em suas bases eleitorais — como reforma de hospital, pavimentação de rua ou compra de equipamentos para escola.',
      'Existem três tipos principais: individuais (de cada parlamentar), de bancada (do conjunto de deputados e senadores de um estado) e de comissão. Desde 2015, parte das emendas individuais é de execução obrigatória pelo governo (orçamento impositivo).',
      'O valor total destinado a emendas representa bilhões por ano no orçamento federal e é um dos principais instrumentos de negociação entre o Executivo e o Legislativo.',
    ],
    exemplo: 'Uma deputada destinou R$ 1 milhão de sua emenda individual para a compra de ambulâncias para municípios do interior do seu estado. O valor constou da LOA e, após empenhado, foi transferido diretamente aos municípios indicados.',
    relacionados: ['emenda-individual', 'emenda-de-bancada', 'loa', 'orcamento-impositivo'],
    temas: ['economia-impostos'],
    links: [
      { label: 'Emendas parlamentares (dados reais)', href: '/emendas' },
      { label: 'Guia: emendas parlamentares', href: '/aprenda/emendas' },
    ],
  },
  {
    slug: 'emenda-individual', termo: 'Emenda individual',
    categoria: 'orcamento',
    definicaoCurta: 'Emenda ao orçamento que cada parlamentar (deputado ou senador) tem direito a apresentar individualmente, com parte de execução obrigatória pelo governo.',
    definicao: [
      'Todo deputado federal e senador tem direito a apresentar emendas individuais ao orçamento, com um teto de valor definido a cada ano. Uma parcela dessas emendas é impositiva — ou seja, o governo é obrigado a executá-las.',
      'As emendas individuais são destinadas a ações como saúde, educação, infraestrutura e assistência social nos municípios da base eleitoral do parlamentar. A transparência sobre a destinação melhorou com a publicação dos dados em portais públicos.',
      'O modelo tem críticas: pode fragmentar políticas públicas e criar dependência entre prefeituras e parlamentares para acesso a recursos federais.',
    ],
    exemplo: 'Um senador destinou parte de suas emendas individuais para a construção de um centro de saúde em seu estado natal. A obra só pôde começar quando o Ministério da Saúde empenhou e liberou o recurso.',
    relacionados: ['emenda-parlamentar', 'emenda-de-bancada', 'loa', 'execucao-orcamentaria'],
    temas: ['economia-impostos'],
    links: [
      { label: 'Emendas parlamentares', href: '/emendas' },
    ],
  },
  {
    slug: 'emenda-de-bancada', termo: 'Emenda de bancada',
    categoria: 'orcamento',
    definicaoCurta: 'Emenda ao orçamento proposta pelo conjunto de parlamentares de um mesmo estado, destinada a obras e projetos de interesse regional.',
    definicao: [
      'A bancada estadual — formada por todos os deputados federais e senadores de um estado — pode apresentar coletivamente emendas ao orçamento para projetos de maior porte ou alcance regional, como rodovias, infraestrutura hídrica ou grandes equipamentos de saúde.',
      'O valor das emendas de bancada é definido em proporção ao número de parlamentares de cada estado. Sua execução é impositiva em parte, assim como as emendas individuais.',
      'A decisão sobre para onde destinar os recursos deve ser tomada de forma coletiva pela bancada, o que exige negociação interna entre parlamentares muitas vezes de partidos distintos.',
    ],
    exemplo: 'A bancada de um estado do Nordeste se reuniu para decidir como distribuir sua emenda de bancada entre a duplicação de uma rodovia estadual e a ampliação de um hospital universitário federal.',
    relacionados: ['emenda-parlamentar', 'emenda-individual', 'loa', 'bancada'],
    temas: ['economia-impostos'],
    links: [
      { label: 'Emendas parlamentares', href: '/emendas' },
    ],
  },
  {
    slug: 'emenda-de-relator', termo: 'Emenda de relator', nomeCompleto: 'RP9 — o "orçamento secreto"',
    categoria: 'orcamento',
    definicaoCurta: 'Emenda ao orçamento feita pelo relator-geral, que ficou conhecida como "orçamento secreto" por distribuir verbas sem transparência sobre quem indicou.',
    definicao: [
      'O relator-geral do orçamento pode propor emendas para corrigir erros e ajustar o texto. Entre 2020 e 2022, esse instrumento (classificado como RP9) passou a ser usado para distribuir bilhões em verbas indicadas por parlamentares sem registro público de autoria — daí o apelido "orçamento secreto".',
      'Em dezembro de 2022, o STF declarou essa prática inconstitucional por ferir os princípios da transparência e da impessoalidade. Desde então, as emendas de relator nos moldes do RP9 deixaram de existir.',
    ],
    exemplo: 'Um município recebia recursos para obras sem que ninguém soubesse qual parlamentar havia indicado a verba — impossibilitando o eleitor de cobrar responsabilidade.',
    relacionados: ['emenda-parlamentar', 'emenda-individual', 'execucao-orcamentaria', 'loa'],
    temas: ['economia-impostos'],
    links: [
      { label: 'Emendas parlamentares (dados reais)', href: '/emendas' },
      { label: 'Guia: emendas parlamentares', href: '/aprenda/emendas' },
    ],
  },
  {
    slug: 'empenho', termo: 'Empenho',
    categoria: 'orcamento',
    definicaoCurta: 'Ato pelo qual o governo reserva uma parcela do orçamento para pagar uma despesa específica — primeiro passo da execução orçamentária.',
    definicao: [
      'Antes de pagar qualquer despesa pública, o governo precisa "empenhar" o valor, ou seja, reservar formalmente aquela parcela do orçamento para aquela finalidade específica. O empenho é feito por meio de nota de empenho.',
      'O ciclo completo da despesa tem três etapas: empenho (reserva), liquidação (verificação de que o serviço/bem foi entregue) e pagamento (transferência do dinheiro). O empenho garante que o recurso não será usado para outro fim.',
      'Emendas parlamentares aprovadas na LOA só se efetivam quando o governo as empenha. Por isso, o atraso no empenho de emendas é frequente motivo de negociação entre parlamentares e o Executivo.',
    ],
    exemplo: 'A prefeitura havia sido contemplada com emenda parlamentar para uma escola, mas a obra não começava porque o ministério ainda não tinha empenhado o valor — sem o empenho, o dinheiro existia no papel, mas não podia ser gasto.',
    relacionados: ['execucao-orcamentaria', 'loa', 'emenda-parlamentar'],
    temas: ['economia-impostos'],
  },
  {
    slug: 'execucao-orcamentaria', termo: 'Execução orçamentária',
    categoria: 'orcamento',
    definicaoCurta: 'O processo pelo qual o governo efetivamente gasta os recursos previstos no orçamento — envolve empenho, liquidação e pagamento.',
    definicao: [
      'Aprovar o orçamento é só o primeiro passo: o governo precisa então executá-lo, transformando as previsões de receita e despesa em transações reais. Esse processo se chama execução orçamentária.',
      'O ciclo de gasto tem três etapas: empenho (reserva do valor para uma despesa), liquidação (confirmação de que o bem ou serviço foi entregue) e pagamento (transferência ao credor). Só após as três etapas o dinheiro sai do cofre público.',
      'A execução orçamentária é monitorada pelo TCU, pelo Congresso e pela sociedade via portais de transparência. Baixa execução pode indicar ineficiência ou retenção deliberada de recursos.',
    ],
    exemplo: 'No segundo semestre do ano, o Ministério da Saúde acelerou a execução orçamentária para não perder os recursos aprovados na LOA — valores não empenhados até 31 de dezembro não podem ser gastos no ano seguinte.',
    relacionados: ['empenho', 'loa', 'emenda-parlamentar', 'orcamento-impositivo'],
    temas: ['economia-impostos'],
    links: [
      { label: 'Guia: emendas parlamentares', href: '/aprenda/emendas' },
    ],
  },
  {
    slug: 'loa', termo: 'LOA', nomeCompleto: 'Lei Orçamentária Anual',
    categoria: 'orcamento',
    definicaoCurta: 'A lei que prevê todas as receitas e despesas do governo federal para o ano seguinte — aprovada pelo Congresso até o fim de cada ano.',
    definicao: [
      'A LOA é o orçamento do governo federal: lista quanto se espera arrecadar (impostos, contribuições, etc.) e quanto e em que se pretende gastar no ano. É elaborada pelo Executivo e aprovada pelo Congresso até o final de cada exercício.',
      'Durante a tramitação da LOA, parlamentares apresentam emendas para direcionar parte dos recursos a projetos de interesse de suas bases eleitorais. O relator-geral do orçamento consolida o texto final.',
      'A LOA faz parte de um tripé orçamentário: a LDO (diretrizes para a LOA) e o PPA (planejamento plurianual de quatro anos) estabelecem o contexto no qual a lei anual se insere.',
    ],
    exemplo: 'No projeto de LOA de 2024, o governo propôs R$ 5,5 trilhões em despesas. Ao longo dos meses de tramitação na comissão mista do Congresso, deputados e senadores apresentaram milhares de emendas antes da aprovação em plenário.',
    relacionados: ['ldo', 'emenda-parlamentar', 'execucao-orcamentaria', 'orcamento-impositivo'],
    temas: ['economia-impostos'],
    links: [
      { label: 'Proposições em tramitação', href: '/proposicoes' },
    ],
  },
  {
    slug: 'ldo', termo: 'LDO', nomeCompleto: 'Lei de Diretrizes Orçamentárias',
    categoria: 'orcamento',
    definicaoCurta: 'A lei que estabelece as metas fiscais e as prioridades que devem orientar a elaboração do orçamento anual — aprovada pelo Congresso no meio de cada ano.',
    definicao: [
      'A LDO serve de ponte entre o planejamento de longo prazo (PPA) e a lei orçamentária anual (LOA). Ela define as metas de resultado fiscal (superávit ou déficit), as prioridades do governo e as regras para a elaboração da LOA do ano seguinte.',
      'A LDO também estabelece critérios para transferências de recursos, normas sobre pessoal público e limites para emendas parlamentares. Deve ser aprovada pelo Congresso até 30 de junho de cada ano.',
      'O não cumprimento das metas fiscais da LDO pode obrigar o governo a decretar contingenciamento — cortando gastos previstos na LOA para manter as contas equilibradas.',
    ],
    exemplo: 'A LDO do ano apresentou meta de déficit primário de R$ 0, sinalizando ao mercado o compromisso do governo com o equilíbrio fiscal. Quando as receitas vieram abaixo do previsto, o governo precisou contingenciar despesas previstas na LOA.',
    relacionados: ['loa', 'execucao-orcamentaria', 'fpm'],
    temas: ['economia-impostos'],
    links: [
      { label: 'Proposições em tramitação', href: '/proposicoes' },
    ],
  },
  {
    slug: 'orcamento-impositivo', termo: 'Orçamento impositivo',
    categoria: 'orcamento',
    definicaoCurta: 'Regra que torna obrigatória a execução de parte das emendas parlamentares individuais e de bancada — o governo não pode simplesmente deixar de gastar esses valores.',
    definicao: [
      'Historicamente, o orçamento brasileiro era "autorizativo": o governo podia aprovar a LOA e simplesmente não executar algumas despesas, incluindo emendas parlamentares. O orçamento impositivo mudou isso para as emendas individuais e de bancada.',
      'Com a regra, uma parcela das emendas individuais e das de bancada deve ser obrigatoriamente empenhada e paga dentro do exercício. O governo não pode segurar esses recursos como moeda de troca política.',
      'A mudança foi aprovada por PEC em 2015 e ampliada posteriormente. Defensores dizem que garante previsibilidade para os municípios; críticos apontam que engessa o orçamento e reduz a capacidade de ajuste fiscal.',
    ],
    exemplo: 'Um prefeito que no passado precisava negociar com o governo federal para receber sua emenda agora tem garantia legal de que o recurso será empenhado — o que facilita o planejamento de obras e serviços municipais.',
    relacionados: ['emenda-individual', 'emenda-de-bancada', 'loa', 'execucao-orcamentaria'],
    temas: ['economia-impostos'],
    links: [
      { label: 'Emendas parlamentares', href: '/emendas' },
    ],
  },
  {
    slug: 'fpm', termo: 'FPM', nomeCompleto: 'Fundo de Participação dos Municípios',
    categoria: 'orcamento',
    definicaoCurta: 'Repasse constitucional de recursos federais (IR + IPI) para os municípios, distribuído segundo critérios de população e renda — principal fonte de receita de municípios menores.',
    definicao: [
      'O FPM é uma transferência constitucional automática: a União é obrigada a repassar uma parcela da arrecadação do Imposto de Renda (IR) e do Imposto sobre Produtos Industrializados (IPI) para todos os municípios brasileiros. O percentual é definido pela Constituição.',
      'A distribuição entre os municípios usa coeficientes que levam em conta a população e a renda per capita — favorecendo municípios menores e mais pobres. Para muitas prefeituras do interior, o FPM representa a maior parte da receita total.',
      'O FPM é creditado pelo Banco do Brasil em datas fixas (10, 20 e último dia útil do mês). Quedas na arrecadação federal, como as ocorridas em crises econômicas, reduzem automaticamente os repasses do FPM.',
    ],
    exemplo: 'Uma cidade com 8 mil habitantes no sertão nordestino depende do FPM para pagar servidores e manter a saúde básica — quando a arrecadação federal cai, a prefeitura enfrenta dificuldade imediata de caixa.',
    relacionados: ['loa', 'ldo', 'execucao-orcamentaria'],
    temas: ['economia-impostos'],
  },

  // ─── ELEIÇÕES (11) ─────────────────────────────────────────────────────────
  {
    slug: 'coeficiente-eleitoral', termo: 'Coeficiente eleitoral',
    categoria: 'eleicoes',
    definicaoCurta: 'Número mínimo de votos que um partido precisa obter em um estado para ter direito a uma cadeira na Câmara dos Deputados — base do sistema proporcional.',
    definicao: [
      'Nas eleições para a Câmara, cada estado elege um número de deputados proporcional à sua população. O coeficiente eleitoral é calculado dividindo o total de votos válidos (excluindo brancos e nulos) pelo número de cadeiras da circunscrição.',
      'Apenas partidos que atingem pelo menos o coeficiente eleitoral têm direito a participar da distribuição de cadeiras. Os assentos são distribuídos primeiro às legendas que atingiram o coeficiente, depois pelo método da maior média.',
      'Quanto maior o estado (mais cadeiras), menor tende a ser o coeficiente eleitoral relativo, facilitando a eleição de candidatos de partidos menores.',
    ],
    exemplo: 'Num estado com 50 cadeiras e 5 milhões de votos válidos, o coeficiente eleitoral é 100.000 votos. Um partido que obteve 80.000 votos — menos do que o coeficiente — não participa da distribuição de cadeiras naquele estado.',
    relacionados: ['voto-proporcional', 'federacao-partidaria', 'fundo-eleitoral'],
    links: [
      { label: 'Deputados federais', href: '/politicos?cargo=deputado-federal' },
    ],
  },
  {
    slug: 'segundo-turno', termo: 'Segundo turno',
    categoria: 'eleicoes',
    definicaoCurta: 'Segundo e decisivo turno de votação entre os dois candidatos mais votados quando nenhum obteve maioria absoluta no primeiro — ocorre em eleições majoritárias.',
    definicao: [
      'Nas eleições majoritárias (presidente, governador, prefeito de município com mais de 200 mil eleitores), se nenhum candidato obtiver mais de 50% dos votos válidos no primeiro turno, os dois mais votados disputam o segundo turno.',
      'No segundo turno, basta maioria simples: quem tiver mais votos vence, independentemente de percentual. A data é fixada para o último domingo de outubro do ano eleitoral.',
      'Não há segundo turno para senador, deputado ou vereador — essas são eleições pelo sistema majoritário simples (senador) ou proporcional (deputados e vereadores).',
    ],
    exemplo: 'Na eleição presidencial de 2022, nenhum candidato superou 50% dos votos válidos no primeiro turno. Os dois mais votados foram ao segundo turno, realizado no final de outubro, e o resultado final definiu o presidente.',
    relacionados: ['voto-majoritario', 'voto-proporcional', 'inelegibilidade'],
    links: [
      { label: 'Temas políticos', href: '/temas' },
    ],
  },
  {
    slug: 'suplente', termo: 'Suplente',
    categoria: 'eleicoes',
    definicaoCurta: 'Candidato eleito como substituto de senador — assume o mandato em caso de afastamento, renúncia ou falecimento do titular.',
    definicao: [
      'Na eleição para o Senado Federal, cada candidato à titularidade concorre com um ou dois suplentes que formam a mesma chapa. Se o senador eleito se afastar por qualquer motivo, o primeiro suplente assume o mandato.',
      'O suplente não exerce funções senatoriais enquanto o titular estiver ativo, mas pode ser convocado para assumir temporariamente em casos de licença ou afastamento para exercer cargo no Executivo.',
      'A escolha dos suplentes é decisão do candidato titular e de seu partido, sem votação direta dos eleitores — o que já foi alvo de críticas quanto à representatividade democrática.',
    ],
    exemplo: 'Quando um senador foi nomeado ministro do Supremo Tribunal Federal, seu primeiro suplente foi convocado para assumir a cadeira no Senado pelo restante do mandato.',
    relacionados: ['voto-majoritario', 'mandato', 'senado-federal'],
    links: [
      { label: 'Senadores', href: '/politicos?cargo=senador' },
    ],
  },
  {
    slug: 'filiacao-partidaria', termo: 'Filiação partidária',
    categoria: 'eleicoes',
    definicaoCurta: 'Vínculo formal entre um cidadão e um partido político — condição obrigatória para que alguém possa concorrer a qualquer cargo eletivo no Brasil.',
    definicao: [
      'No Brasil, qualquer pessoa que queira se candidatar a cargo eletivo precisa estar filiada a um partido político. A filiação deve ser anterior à eleição por um prazo mínimo definido pelo TSE (atualmente seis meses antes do pleito).',
      'A filiação cria vínculo entre o filiado e o estatuto e programa do partido. O eleito representa o partido que o apoiou e, em geral, não pode mudar de legenda sem justa causa durante o mandato sem perder o cargo.',
      'A desfiliação sem justa causa (como perseguição política, mudança substancial do partido ou fusão não desejada) resulta na perda do mandato, conforme entendimento consolidado do TSE.',
    ],
    exemplo: 'Um empresário interessado em se candidatar a prefeito precisou se filiar a um partido ao menos seis meses antes das eleições. Sem essa filiação tempestiva, sua candidatura seria indeferida pelo tribunal eleitoral.',
    relacionados: ['janela-partidaria', 'federacao-partidaria', 'mandato'],
    links: [
      { label: 'Partidos políticos', href: '/partidos' },
    ],
  },
  {
    slug: 'federacao-partidaria', termo: 'Federação partidária',
    categoria: 'eleicoes',
    definicaoCurta: 'União formal entre dois ou mais partidos que passam a atuar conjuntamente nas eleições e no Congresso como se fossem um só partido pelo prazo mínimo de quatro anos.',
    definicao: [
      'A federação permite que partidos menores se unam para superar a cláusula de desempenho e aumentar o tempo de TV, o fundo partidário e o fundo eleitoral. Durante a vigência, os partidos federados atuam juntos nas eleições e nas bancadas parlamentares.',
      'A diferença em relação à fusão é que na federação os partidos mantêm suas identidades jurídicas separadas — cada um com seu CNPJ, estatuto e diretórios. A federação tem duração mínima de quatro anos.',
      'No contexto eleitoral, os votos dos candidatos de todos os partidos federados são somados para o cálculo do coeficiente eleitoral e da distribuição de cadeiras.',
    ],
    exemplo: 'Dois partidos de centro-esquerda formaram uma federação para as eleições de 2022, somando suas listas de candidatos. Com os votos combinados, conseguiram eleger mais deputados do que teriam individualmente.',
    relacionados: ['filiacao-partidaria', 'fundo-eleitoral', 'coeficiente-eleitoral', 'bloco-partidario'],
    links: [
      { label: 'Partidos políticos', href: '/partidos' },
    ],
  },
  {
    slug: 'fundo-eleitoral', termo: 'Fundo eleitoral',
    categoria: 'eleicoes',
    definicaoCurta: 'Recurso público destinado ao financiamento de campanhas eleitorais, distribuído entre os partidos pelo TSE conforme critérios como representação na Câmara.',
    definicao: [
      'O Fundo Especial de Financiamento de Campanha (FEFC), popularmente chamado de fundo eleitoral, é dinheiro do Tesouro Nacional destinado às campanhas. Foi criado após a proibição do financiamento por empresas, que ocorreu por decisão do STF em 2015.',
      'A distribuição entre os partidos segue critérios definidos na legislação eleitoral: parte vai igualmente para todos os partidos com registro, e outra parte é proporcional à representação na Câmara e ao desempenho nas últimas eleições.',
      'O valor total do fundo eleitoral é fixado pelo Congresso para cada eleição. Nas eleições gerais de 2022, foram destinados cerca de R$ 4,96 bilhões.',
    ],
    exemplo: 'Um partido com grande bancada na Câmara recebeu fatia maior do fundo eleitoral, podendo investir mais em horário de TV, materiais e estrutura de campanha do que um partido pequeno que recebeu apenas o valor mínimo.',
    relacionados: ['fundo-partidario', 'federacao-partidaria', 'inelegibilidade'],
    links: [
      { label: 'Partidos políticos', href: '/partidos' },
    ],
  },
  {
    slug: 'fundo-partidario', termo: 'Fundo partidário',
    categoria: 'eleicoes',
    definicaoCurta: 'Recurso público transferido mensalmente aos partidos para seu funcionamento, programas de formação política e manutenção de estrutura — distinto do fundo eleitoral.',
    definicao: [
      'O Fundo Especial de Assistência Financeira aos Partidos Políticos (Fundo Partidário) é uma transferência regular do Tesouro Nacional para os partidos, destinada ao custeio da atividade partidária rotineira: sede, pessoal, fundações e programas de formação.',
      'Diferente do fundo eleitoral (que existe apenas em anos eleitorais), o fundo partidário é anual e permanente. A distribuição segue regras do TSE: parte igual para todos os partidos com registro, parte proporcional aos votos obtidos na última eleição para a Câmara.',
      'Os partidos são obrigados a prestar contas do uso do fundo ao TSE, sob pena de suspensão dos repasses.',
    ],
    exemplo: 'Um partido com registro recente mas sem representação na Câmara recebe apenas a cota mínima do fundo partidário — insuficiente para manter estrutura robusta, o que incentiva fusões ou federações com outros partidos.',
    relacionados: ['fundo-eleitoral', 'filiacao-partidaria', 'federacao-partidaria'],
    links: [
      { label: 'Partidos políticos', href: '/partidos' },
    ],
  },
  {
    slug: 'inelegibilidade', termo: 'Inelegibilidade',
    categoria: 'eleicoes',
    definicaoCurta: 'Condição que impede alguém de se candidatar a um cargo eletivo — pode ser absoluta (constitucional) ou relativa (por lei complementar, como a Lei da Ficha Limpa).',
    definicao: [
      'Uma pessoa inelegível não pode ser candidata. A inelegibilidade absoluta atinge, por exemplo, quem não é alistável como eleitor e analfabetos. Já a inelegibilidade relativa depende de circunstâncias — como o cargo que se ocupa, parentesco com o mandatário ou condenação criminal.',
      'A Lei da Ficha Limpa (Lei Complementar 135/2010) ampliou as causas de inelegibilidade: ficam inelegíveis por oito anos pessoas condenadas por colegiado (mesmo sem trânsito em julgado) por uma série de crimes, como corrupção, lavagem de dinheiro e abuso de poder econômico.',
      'A Justiça Eleitoral (TSE e TREs) é competente para declarar inelegibilidades e julgar impugnações de candidatura.',
    ],
    exemplo: 'Um ex-prefeito condenado por órgão colegiado por improbidade administrativa ficou inelegível por oito anos, conforme a Lei da Ficha Limpa, e teve sua candidatura a deputado estadual impugnada pelo Tribunal Regional Eleitoral.',
    relacionados: ['filiacao-partidaria', 'mandato', 'transito-em-julgado'],
    links: [
      { label: 'Notícias eleitorais', href: '/noticias' },
    ],
  },
  {
    slug: 'voto-proporcional', termo: 'Voto proporcional',
    categoria: 'eleicoes',
    definicaoCurta: 'Sistema eleitoral pelo qual as cadeiras são distribuídas conforme a proporção de votos de cada partido — usado para deputados e vereadores.',
    definicao: [
      'No sistema proporcional, o eleitor vota em um candidato ou na legenda de um partido. Os votos são somados por partido (e por federação), e as cadeiras são distribuídas proporcionalmente — partidos mais votados ganham mais assentos.',
      'Dentro de cada partido, assumem as vagas os candidatos mais votados individualmente. Isso cria o fenômeno do "puxador de votos": um candidato muito popular pode ajudar colegas de partido a se eleger.',
      'O sistema proporcional tende a gerar legislativos mais fragmentados e representativos da pluralidade política, mas pode dificultar a formação de maiorias estáveis.',
    ],
    exemplo: 'Nas eleições para vereador, um partido obteve 15% dos votos válidos em uma câmara municipal com 20 cadeiras — e elegeu 3 vereadores. Os eleitos foram os 3 candidatos com mais votos dentro da lista do partido.',
    relacionados: ['coeficiente-eleitoral', 'voto-majoritario', 'federacao-partidaria'],
    links: [
      { label: 'Deputados federais', href: '/politicos?cargo=deputado-federal' },
    ],
  },
  {
    slug: 'voto-majoritario', termo: 'Voto majoritário',
    categoria: 'eleicoes',
    definicaoCurta: 'Sistema eleitoral em que vence quem obtém mais votos — usado para presidente, governador, senador, prefeito e outras posições executivas.',
    definicao: [
      'No sistema majoritário, cada circunscrição (país, estado, município) elege apenas um representante, e vence quem obtiver o maior número de votos. Dependendo do cargo, pode ser por maioria simples (um turno) ou maioria absoluta (com segundo turno).',
      'No Brasil, senadores são eleitos por maioria simples em um único turno — não há segundo turno para o Senado. Já presidente, governador e prefeito de municípios com mais de 200 mil eleitores podem ter segundo turno se nenhum candidato superar 50% dos votos válidos.',
      'O sistema majoritário tende a concentrar poder em candidatos com mais visibilidade e recursos, em contraste com o proporcional, que favorece candidatos de nicho.',
    ],
    exemplo: 'Nas eleições para o Senado, três candidatos disputaram duas vagas. Os dois mais votados foram eleitos, sem necessidade de segundo turno — o terceiro colocado ficou fora mesmo tendo obtido milhões de votos.',
    relacionados: ['segundo-turno', 'voto-proporcional', 'suplente'],
    links: [
      { label: 'Senadores', href: '/politicos?cargo=senador' },
    ],
  },
  {
    slug: 'janela-partidaria', termo: 'Janela partidária',
    categoria: 'eleicoes',
    definicaoCurta: 'Período de 30 dias definido em lei eleitoral em que titulares de mandato podem trocar de partido sem risco de perda do cargo — ocorre aproximadamente seis meses antes das eleições.',
    definicao: [
      'Em regra, um parlamentar que troca de partido sem justa causa perde o mandato, pois o cargo pertence à legenda. A janela partidária é a exceção: durante esse período específico, qualquer detentor de mandato pode mudar de partido livremente.',
      'A janela ocorre nos seis meses anteriores ao pleito e dura 30 dias. É um período de intensa movimentação política, com negociações de candidaturas, alianças e composições de chapas para a eleição seguinte.',
      'A lei eleitoral estabelece que a janela partidária é a única oportunidade para mudança de partido sem justa causa para quem já tem mandato. Fora desse período, a troca de legenda pode resultar em perda do cargo por decisão da Justiça Eleitoral.',
    ],
    exemplo: 'Às vésperas das eleições municipais, dois vereadores aproveitaram a janela partidária para migrar de seus partidos para uma legenda maior, buscando melhores condições de campanha e acesso ao fundo eleitoral da nova sigla.',
    relacionados: ['filiacao-partidaria', 'mandato', 'fundo-eleitoral'],
    links: [
      { label: 'Partidos políticos', href: '/partidos' },
    ],
  },

  // ─── INSTITUIÇÕES (11) ─────────────────────────────────────────────────────
  {
    slug: 'congresso-nacional', termo: 'Congresso Nacional',
    categoria: 'instituicoes',
    definicaoCurta: 'O Poder Legislativo federal brasileiro, formado pela Câmara dos Deputados e pelo Senado Federal — responsável por legislar, fiscalizar o Executivo e aprovar o orçamento.',
    definicao: [
      'O Congresso Nacional é o órgão máximo do Poder Legislativo da União. É formado por duas casas: a Câmara dos Deputados (513 membros eleitos proporcionalmente pelos estados) e o Senado Federal (81 senadores, três por estado).',
      'Compete ao Congresso criar, alterar e revogar leis federais, aprovar o orçamento, ratificar tratados internacionais, fiscalizar os atos do Executivo e deliberar sobre matérias de competência exclusiva, como autorizar o estado de sítio.',
      'As duas Casas se reúnem em sessão conjunta para inaugurar sessões legislativas, elaborar e votar o orçamento, deliberar sobre vetos e promulgar emendas constitucionais.',
    ],
    exemplo: 'Quando o governo enviou o projeto de lei orçamentária, o Congresso reuniu uma comissão mista de deputados e senadores para analisar o texto. Depois, votou separadamente em cada Casa antes da promulgação final.',
    relacionados: ['camara-dos-deputados', 'senado-federal', 'mesa-diretora', 'legislatura'],
    links: [
      { label: 'Aprenda sobre o processo legislativo', href: '/aprenda/processo-legislativo' },
    ],
  },
  {
    slug: 'camara-dos-deputados', termo: 'Câmara dos Deputados',
    categoria: 'instituicoes',
    definicaoCurta: 'Uma das duas Casas do Congresso Nacional, formada por 513 deputados federais eleitos proporcionalmente pelos estados para mandatos de quatro anos.',
    definicao: [
      'A Câmara dos Deputados representa o povo brasileiro no Legislativo federal. Seus 513 membros são eleitos pelo sistema proporcional, com cada estado e o Distrito Federal elegendo entre 8 e 70 deputados conforme sua população.',
      'É na Câmara que a maioria das propostas legislativas têm origem ou onde são votadas primeiro. Cabe a ela iniciar o processo de impeachment do presidente, deliberar sobre o orçamento e criar comissões de investigação.',
      'A Câmara é presidida pela Mesa Diretora, eleita a cada dois anos pelos próprios deputados. O presidente da Câmara é o segundo na linha de sucessão presidencial.',
    ],
    exemplo: 'Um deputado apresentou um projeto de lei na Câmara para alterar as regras de licença-maternidade. O texto tramitou pelas comissões da Casa, foi votado em plenário e, aprovado, seguiu ao Senado para revisão.',
    relacionados: ['senado-federal', 'congresso-nacional', 'mesa-diretora', 'voto-proporcional'],
    links: [
      { label: 'Deputados federais', href: '/politicos?cargo=deputado-federal' },
      { label: 'Como é criada uma lei', href: '/aprenda/processo-legislativo' },
    ],
  },
  {
    slug: 'senado-federal', termo: 'Senado Federal',
    categoria: 'instituicoes',
    definicaoCurta: 'Uma das duas Casas do Congresso Nacional, formada por 81 senadores (três por estado e DF) eleitos pelo voto majoritário para mandatos de oito anos.',
    definicao: [
      'O Senado Federal representa os estados e o Distrito Federal no Legislativo federal. Cada unidade da federação elege três senadores, independentemente do tamanho da população — o que lhe confere papel de câmara de equilíbrio federativo.',
      'Os senadores cumprem mandatos de oito anos, com renovação alternada: em cada eleição geral, dois terços ou um terço das cadeiras são renovadas. Isso garante continuidade institucional.',
      'O Senado tem competências privativas, como aprovar nomes para os tribunais superiores, o Banco Central e outras funções de alta relevância, além de ser a casa revisora da maioria dos projetos vindos da Câmara.',
    ],
    exemplo: 'O presidente indicou um nome para o Banco Central do Brasil. O Senado realizou sabatina do indicado — uma audiência pública com perguntas dos senadores — e votou pela aprovação por maioria simples.',
    relacionados: ['camara-dos-deputados', 'congresso-nacional', 'mesa-diretora', 'suplente'],
    links: [
      { label: 'Senadores', href: '/politicos?cargo=senador' },
    ],
  },
  {
    slug: 'mesa-diretora', termo: 'Mesa Diretora',
    categoria: 'instituicoes',
    definicaoCurta: 'Órgão que dirige os trabalhos legislativos de cada Casa — presidida pelo presidente da Câmara ou do Senado, eleitos pelos próprios parlamentares para mandatos de dois anos.',
    definicao: [
      'A Mesa Diretora é o órgão de direção de cada Casa. Na Câmara, é composta pelo presidente, dois vice-presidentes e quatro secretários (e respectivos suplentes). No Senado, a estrutura é semelhante. Os membros são eleitos pelos parlamentares para mandatos de dois anos, renováveis por mais dois.',
      'O presidente da Câmara e o presidente do Senado têm papel central no funcionamento do Legislativo: determinam a pauta, conduzem sessões, decidem sobre urgências e representam suas Casas institucionalmente.',
      'O presidente da Câmara é o segundo na linha de sucessão presidencial (após o vice-presidente) e o presidente do Senado é o terceiro.',
    ],
    exemplo: 'Quando o presidente da República viajou ao exterior, o presidente da Câmara dos Deputados assumiu interinamente a presidência do país por alguns dias, conforme a ordem de sucessão constitucional.',
    relacionados: ['camara-dos-deputados', 'senado-federal', 'congresso-nacional', 'lider-partidario'],
    links: [
      { label: 'Como uma lei é criada', href: '/aprenda/processo-legislativo' },
    ],
  },
  {
    slug: 'bancada', termo: 'Bancada',
    categoria: 'instituicoes',
    definicaoCurta: 'Conjunto de parlamentares de um mesmo partido, estado ou causa que atuam coordenadamente na Câmara ou no Senado.',
    definicao: [
      'Uma bancada é um agrupamento informal ou formal de parlamentares com interesses comuns. As bancadas partidárias reúnem todos os membros de uma mesma legenda. As bancadas estaduais agrupam deputados e senadores eleitos pelo mesmo estado.',
      'Há também bancadas temáticas ou suprapartidárias, como a bancada ruralista (agronegócio), a bancada evangélica e a bancada da segurança pública — formadas por parlamentares de diferentes partidos unidos por um tema.',
      'As bancadas coordenam posições em votações, negociam cargos e recursos, e são atores centrais na política de coalizão do Legislativo brasileiro.',
    ],
    exemplo: 'Para aprovar a reforma agrária, o governo precisou negociar individualmente com vários líderes de bancada. A bancada ruralista, que reunia membros de vários partidos, votou unida contra a proposta.',
    relacionados: ['lider-partidario', 'bloco-partidario', 'base-governista', 'emenda-de-bancada'],
    links: [
      { label: 'Partidos políticos', href: '/partidos' },
    ],
  },
  {
    slug: 'lider-partidario', termo: 'Líder partidário',
    categoria: 'instituicoes',
    definicaoCurta: 'Parlamentar escolhido pelo grupo de deputados ou senadores de um partido para representá-lo oficialmente nas negociações e nas sessões legislativas.',
    definicao: [
      'O líder partidário é o porta-voz oficial da bancada. Ele usa a palavra em nome do partido nas sessões, orienta os parlamentares sobre como votar, negocia com a Mesa Diretora a inclusão de pautas e representa o partido nas articulações políticas.',
      'Nas votações nominais, é comum o sistema de "orientação de liderança": o líder anuncia a posição do partido (sim, não, liberado) e os parlamentares tendem a seguir. A orientação "liberado" significa que cada um vota como preferir.',
      'Além do líder do partido, há o líder de governo — parlamentar indicado pelo Executivo para articular a aprovação da agenda governamental no Congresso.',
    ],
    exemplo: 'Antes da votação da reforma trabalhista, os líderes dos partidos da base governista se reuniram com o ministro da Casa Civil para alinhar posições. No plenário, cada líder anunciou o voto de sua bancada.',
    relacionados: ['bancada', 'bloco-partidario', 'base-governista', 'plenario'],
    links: [
      { label: 'Partidos políticos', href: '/partidos' },
    ],
  },
  {
    slug: 'bloco-partidario', termo: 'Bloco partidário',
    categoria: 'instituicoes',
    definicaoCurta: 'União temporária de partidos dentro de uma Casa legislativa para fins de organização da pauta, distribuição de cargos nas comissões e tempo de fala nas sessões.',
    definicao: [
      'No Congresso, blocos partidários são formados quando diferentes partidos se unem temporariamente para fins regimentais — como obter maior representação nas comissões, mais tempo de pronunciamento em plenário e participação na distribuição de cargos.',
      'Diferente da federação partidária (que é eleitoral e de longo prazo), o bloco existe dentro do Congresso e pode ser formado e desfeito ao longo da legislatura. Partidos num mesmo bloco contam os assentos conjuntamente para fins de proporcionalidade.',
      'A formação de blocos é uma estratégia comum de partidos menores para ter mais poder dentro da Casa.',
    ],
    exemplo: 'Três partidos de centro com bancadas pequenas formaram um bloco parlamentar na Câmara, somando suas cadeiras. Com a representação conjunta, conseguiram presidir duas comissões permanentes que não teriam individualmente.',
    relacionados: ['bancada', 'lider-partidario', 'federacao-partidaria', 'comissao'],
    links: [
      { label: 'Partidos políticos', href: '/partidos' },
    ],
  },
  {
    slug: 'base-governista', termo: 'Base governista',
    categoria: 'instituicoes',
    definicaoCurta: 'Conjunto de partidos e parlamentares que apoiam o governo no Congresso, garantindo-lhe maioria para aprovar sua agenda legislativa.',
    definicao: [
      'No presidencialismo de coalizão brasileiro, o governo precisa montar e manter uma coalizão de partidos no Congresso para conseguir aprovar projetos. Os partidos que apoiam o governo formam a "base governista" ou "base aliada".',
      'Para construir e sustentar essa base, o governo distribui ministérios, cargos em estatais e garante execução de emendas parlamentares aos partidos aliados. A relação é de apoio mútuo e negociação constante.',
      'A base pode ser mais ou menos coesa: em temas controversos, partidos da base podem votar contra o governo (o "racha" da base) ou se abster, colocando pautas em risco.',
    ],
    exemplo: 'O governo perdeu uma votação sobre a reforma administrativa porque cinco partidos da base governista decidiram votar contra o texto após discordâncias sobre exceções aos servidores públicos.',
    relacionados: ['oposicao', 'bancada', 'lider-partidario', 'congresso-nacional'],
    links: [
      { label: 'Partidos políticos', href: '/partidos' },
    ],
  },
  {
    slug: 'oposicao', termo: 'Oposição',
    categoria: 'instituicoes',
    definicaoCurta: 'Conjunto de partidos e parlamentares que não apoiam o governo, fiscalizam seus atos, apresentam alternativas e votam contra sua agenda legislativa.',
    definicao: [
      'A oposição é estrutural à democracia: representa quem discorda das políticas do governo e atua para responsabilizá-lo, propor alternativas e eventualmente substituí-lo nas próximas eleições.',
      'No Legislativo, partidos de oposição usam instrumentos como requerimentos de informação, CPIs, discursos em plenário e obstrução de pauta para fiscalizar e pressionar o Executivo. Não precisam ter maioria para cumprir esse papel.',
      'A linha entre oposição e base governista no Brasil pode ser fluida: partidos que começaram na oposição podem migrar para a base em troca de espaço político e recursos, e vice-versa.',
    ],
    exemplo: 'O principal partido de oposição pediu a criação de uma CPI para investigar contratos do governo, lançou candidato próprio à presidência da Câmara e votou sistematicamente contra os projetos prioritários do Executivo.',
    relacionados: ['base-governista', 'bancada', 'cpi', 'lider-partidario'],
    links: [
      { label: 'Partidos políticos', href: '/partidos' },
    ],
  },
  {
    slug: 'legislatura', termo: 'Legislatura',
    categoria: 'instituicoes',
    definicaoCurta: 'Período de quatro anos de funcionamento do Congresso, correspondente ao mandato dos deputados federais — dividido em quatro sessões legislativas anuais.',
    definicao: [
      'A legislatura é o período de quatro anos que corresponde a uma composição do Congresso. Começa em 1º de fevereiro do ano seguinte às eleições gerais e termina em 31 de janeiro do quarto ano. A 57ª legislatura, por exemplo, vai de 2023 a 2027.',
      'Cada legislatura se divide em quatro sessões legislativas anuais (de 2 de fevereiro a 17 de julho e de 1º de agosto a 22 de dezembro, com recessos nos intervalos). Dentro de cada sessão, os parlamentares realizam sessões ordinárias e extraordinárias.',
      'Ao final de uma legislatura, propostas que não foram votadas são arquivadas — salvo exceções como PECs e matérias com regime de urgência aprovado.',
    ],
    exemplo: 'Uma proposta apresentada no primeiro ano da legislatura foi arquivada porque não foi votada até o final do quarto ano. Para ser retomada, precisaria ser reapresentada na legislatura seguinte.',
    relacionados: ['mandato', 'congresso-nacional', 'camara-dos-deputados'],
    links: [
      { label: 'Deputados federais', href: '/politicos?cargo=deputado-federal' },
    ],
  },
  {
    slug: 'mandato', termo: 'Mandato',
    categoria: 'instituicoes',
    definicaoCurta: 'O período pelo qual um político eleito exerce seu cargo: 4 anos para deputados, prefeitos e vereadores; 8 anos para senadores; 4 anos para presidente e governadores.',
    definicao: [
      'O mandato é o período em que o representante eleito exerce suas funções. No Brasil, deputados federais, estaduais, vereadores, prefeitos, governadores e o presidente têm mandato de quatro anos. Senadores têm mandato de oito anos.',
      'O mandato termina pelo fim natural do prazo, por renúncia, cassação (por perda de mandato decidida pela Casa ou pela Justiça Eleitoral), falecimento ou impeachment (no caso de chefes do Executivo).',
      'A reeleição é permitida uma vez para cargos do Executivo (presidente, governador, prefeito). Para o Legislativo, não há limite de reeleições.',
    ],
    exemplo: 'Um deputado federal eleito em outubro de 2022 tomou posse em 1º de fevereiro de 2023 e exerce seu mandato até 31 de janeiro de 2027. Se quiser continuar, precisa disputar a reeleição em outubro de 2026.',
    relacionados: ['legislatura', 'inelegibilidade', 'janela-partidaria', 'filiacao-partidaria'],
    links: [
      { label: 'Deputados federais', href: '/politicos?cargo=deputado-federal' },
      { label: 'Senadores', href: '/politicos?cargo=senador' },
    ],
  },

  // ─── JUSTIÇA (7) ───────────────────────────────────────────────────────────
  {
    slug: 'stf', termo: 'STF', nomeCompleto: 'Supremo Tribunal Federal',
    categoria: 'justica',
    definicaoCurta: 'A mais alta corte do Brasil, guardiã da Constituição — composta por 11 ministros indicados pelo presidente e aprovados pelo Senado para mandatos vitalícios.',
    definicao: [
      'O STF é o tribunal de última instância do Brasil e o guardião da Constituição. Seus 11 ministros são indicados pelo presidente da República e precisam ser aprovados pelo Senado antes de tomar posse. O cargo é vitalício, mas há aposentadoria compulsória aos 75 anos.',
      'Compete ao STF julgar ações que questionem a constitucionalidade de leis (ADI, ADPF), crimes de parlamentares federais e do presidente da República, e conflitos entre os poderes ou entre estados. Suas decisões valem para todos.',
      'O STF funciona em Plenário (todos os 11 ministros) e em duas turmas (cinco ministros cada), dependendo da matéria. As sessões são públicas e transmitidas ao vivo.',
    ],
    exemplo: 'Uma lei estadual que proibia determinado produto foi levada ao STF por meio de uma ADI. O plenário do tribunal, por seis votos a cinco, declarou a lei inconstitucional — tornando-a inválida em todo o território nacional.',
    relacionados: ['adi', 'adpf', 'foro-privilegiado', 'stj'],
    links: [
      { label: 'Notícias sobre o STF', href: '/noticias' },
    ],
  },
  {
    slug: 'stj', termo: 'STJ', nomeCompleto: 'Superior Tribunal de Justiça',
    categoria: 'justica',
    definicaoCurta: 'Tribunal superior responsável por uniformizar a interpretação da lei federal no Brasil — não julga questões constitucionais (competência do STF).',
    definicao: [
      'O STJ é a última instância para questões de direito federal infraconstitucional (leis que não são a Constituição). Ele não reanalisa fatos, mas garante que a mesma lei federal seja interpretada de forma uniforme em todo o país.',
      'É composto por 33 ministros indicados pelo presidente da República a partir de lista tríplice elaborada pelo próprio tribunal, e aprovados pelo Senado. Os ministros têm vitaliciedade (com aposentadoria compulsória aos 75 anos).',
      'Ao STJ chegam recursos de todas as regiões do país quando a parte alega que a decisão de tribunal estadual ou federal violou lei federal. Suas decisões sobre como interpretar a lei vinculam os tribunais inferiores.',
    ],
    exemplo: 'Uma empresa recorreu ao STJ alegando que o tribunal do estado havia interpretado errado o Código Civil ao julgá-la. O STJ deu razão à empresa e fixou entendimento sobre como aquele artigo deve ser aplicado em todo o país.',
    relacionados: ['stf', 'transito-em-julgado', 'foro-privilegiado'],
  },
  {
    slug: 'adi', termo: 'ADI', nomeCompleto: 'Ação Direta de Inconstitucionalidade',
    categoria: 'justica',
    definicaoCurta: 'Ação judicial ajuizada diretamente no STF para questionar a constitucionalidade de uma lei ou ato normativo federal ou estadual — com efeito para todos.',
    definicao: [
      'A ADI é o principal instrumento para questionar se uma lei viola a Constituição. Ela é ajuizada diretamente no STF (não passa por instâncias inferiores) e pode ser proposta por um rol restrito de legitimados: presidente da República, líderes do Congresso, governadores, procurador-geral da República, entre outros.',
      'Se o STF declarar uma lei inconstitucional em ADI, ela perde validade para todos — não apenas para as partes do processo. É o chamado efeito erga omnes e vinculante.',
      'O tribunal pode suspender cautelarmente a lei enquanto analisa a ADI, se houver risco de dano. O julgamento final pode levar meses ou anos.',
    ],
    exemplo: 'Um governador ajuizou uma ADI no STF contra uma lei federal que, segundo ele, invadia a competência dos estados. O STF deferiu liminar suspendendo a lei enquanto a ação era julgada no mérito.',
    relacionados: ['stf', 'adpf', 'transito-em-julgado'],
    links: [
      { label: 'Notícias jurídicas', href: '/noticias' },
    ],
  },
  {
    slug: 'adpf', termo: 'ADPF', nomeCompleto: 'Arguição de Descumprimento de Preceito Fundamental',
    categoria: 'justica',
    definicaoCurta: 'Ação ajuizada no STF para proteger preceitos fundamentais da Constituição contra atos do poder público — inclusive leis anteriores à Constituição de 1988.',
    definicao: [
      'A ADPF protege os preceitos fundamentais da Constituição (direitos e garantias individuais, separação dos poderes, forma de Estado) contra qualquer ato do poder público que os viole, inclusive leis antigas, anteriores à Constituição de 1988, que não podem ser objeto de ADI.',
      'Assim como a ADI, a ADPF tem efeito erga omnes — a decisão vale para todos. Pode ser proposta pelos mesmos legitimados da ADI e é julgada pelo plenário do STF.',
      'Na prática, a ADPF é usada quando não há outro instrumento adequado para levar a questão ao STF (ela tem caráter subsidiário em relação à ADI).',
    ],
    exemplo: 'Uma ADPF foi ajuizada para questionar a validade de leis municipais que autorizavam práticas consideradas lesivas a direitos fundamentais. O STF julgou a ação procedente e declarou as leis incompatíveis com a Constituição.',
    relacionados: ['adi', 'stf', 'transito-em-julgado'],
    links: [
      { label: 'Notícias jurídicas', href: '/noticias' },
    ],
  },
  {
    slug: 'foro-privilegiado', termo: 'Foro privilegiado',
    categoria: 'justica',
    definicaoCurta: 'Prerrogativa de certas autoridades de serem julgadas em tribunais superiores (como o STF ou STJ) em vez de na primeira instância — prevista na Constituição.',
    definicao: [
      'Algumas autoridades têm, pela Constituição, o direito de serem julgadas diretamente em tribunais superiores por crimes cometidos no exercício do cargo. Isso é chamado de foro privilegiado ou foro por prerrogativa de função.',
      'O presidente da República, os ministros de Estado e os membros do Congresso são julgados pelo STF. Governadores e desembargadores são julgados pelo STJ. A lógica é que tribunais superiores teriam mais capacidade de resistir a pressões políticas locais.',
      'Em 2018, o STF restringiu o alcance do foro: só vale para crimes cometidos no exercício do cargo e em razão das funções. Crimes anteriores ao mandato ou sem relação com as funções são julgados na primeira instância.',
    ],
    exemplo: 'Um deputado federal acusado de crime cometido antes de tomar posse teve seu processo julgado pela justiça comum, e não pelo STF — em razão da restrição estabelecida pelo próprio tribunal em 2018.',
    relacionados: ['stf', 'stj', 'mandato'],
    links: [
      { label: 'Notícias jurídicas', href: '/noticias' },
    ],
  },
  {
    slug: 'transito-em-julgado', termo: 'Trânsito em julgado',
    categoria: 'justica',
    definicaoCurta: 'O momento em que uma decisão judicial se torna definitiva, pois todos os recursos cabíveis foram esgotados — a partir daí, não pode mais ser revertida.',
    definicao: [
      'Uma decisão judicial transita em julgado quando não cabe mais nenhum recurso. Isso acontece quando os prazos para recurso se esgotam sem que a parte recorra, ou quando o tribunal de última instância já proferiu sua decisão final.',
      'O trânsito em julgado tem importância prática: é a partir dele que certas consequências se tornam definitivas, como o início do cumprimento de pena em matéria penal. A Lei da Ficha Limpa, porém, prevê inelegibilidade mesmo sem o trânsito em julgado (basta condenação por órgão colegiado).',
      'Em ações de controle de constitucionalidade (ADI, ADPF), o trânsito em julgado da decisão do STF torna definitiva a validade ou invalidade da lei questionada.',
    ],
    exemplo: 'Após o STJ negar o último recurso de um réu condenado, a sentença transitou em julgado. A partir desse momento, o réu passou a cumprir pena e não podia mais questionar a condenação por vias recursais ordinárias.',
    relacionados: ['stf', 'stj', 'habeas-corpus', 'inelegibilidade'],
  },
  {
    slug: 'habeas-corpus', termo: 'Habeas corpus',
    categoria: 'justica',
    definicaoCurta: 'Remédio constitucional que protege a liberdade de locomoção contra prisão ilegal ou arbitrária — pode ser impetrado por qualquer pessoa, em favor de quem esteja preso ilegalmente.',
    definicao: [
      'O habeas corpus é uma das mais antigas garantias do direito: qualquer pessoa pode impetrar um pedido de habeas corpus em favor de alguém que esteja preso ou ameaçado de prisão de forma ilegal ou abusiva, sem necessidade de advogado.',
      'O juiz ou tribunal competente deve analisar o pedido com urgência. Se concluir que a prisão é ilegal, expede uma ordem de soltura imediata — o "salvo-conduto". O habeas corpus não discute culpa ou inocência, apenas a legalidade da privação de liberdade.',
      'No Brasil, habeas corpus podem chegar até o STF. É frequentemente usado em casos de prisão preventiva considerada abusiva ou de condenação por processo com nulidades.',
    ],
    exemplo: 'Um acusado que permanecia preso preventivamente há mais de dois anos sem julgamento teve um habeas corpus impetrado em seu favor. O tribunal entendeu que a prisão era desproporcional e concedeu a ordem de soltura.',
    relacionados: ['stf', 'stj', 'transito-em-julgado'],
    links: [
      { label: 'Notícias jurídicas', href: '/noticias' },
    ],
  },

  // ─── PARTICIPAÇÃO (6) ──────────────────────────────────────────────────────
  {
    slug: 'iniciativa-popular', termo: 'Iniciativa popular',
    categoria: 'participacao',
    definicaoCurta: 'Mecanismo pelo qual cidadãos podem apresentar um projeto de lei ao Congresso, desde que colham assinaturas de ao menos 1% do eleitorado nacional, distribuídos em pelo menos 5 estados.',
    definicao: [
      'A Constituição de 1988 prevê que a população pode propor projetos de lei diretamente ao Congresso — sem depender de parlamentares. Para isso, é necessário coletar assinaturas de pelo menos 1% do eleitorado nacional, distribuídas em não menos de cinco estados, com ao menos 0,3% dos eleitores de cada um.',
      'O projeto de iniciativa popular é protocolado na Câmara dos Deputados e tramita como qualquer outro PL, podendo ser emendado e alterado pelos parlamentares. A sociedade não tem controle sobre o texto após a entrega.',
      'Exemplos históricos incluem a Lei da Ficha Limpa (2010) e a Lei dos Crimes Hediondos (1990), que nasceram de amplas mobilizações populares.',
    ],
    exemplo: 'A campanha pela Lei da Ficha Limpa coletou mais de 1,3 milhão de assinaturas em todo o Brasil, superando o mínimo exigido. O projeto foi entregue à Câmara e aprovado pelo Congresso em 2010, tornando-se a LC 135.',
    relacionados: ['pl', 'plebiscito', 'referendo', 'controle-social'],
    links: [
      { label: 'Como uma lei é criada', href: '/aprenda/processo-legislativo' },
    ],
  },
  {
    slug: 'plebiscito', termo: 'Plebiscito',
    categoria: 'participacao',
    definicaoCurta: 'Consulta popular sobre uma questão política ou institucional realizada antes de qualquer decisão formal — o resultado orienta (e geralmente vincula) a decisão dos representantes.',
    definicao: [
      'No plebiscito, a população é consultada antes de uma decisão de grande relevância ser tomada. O voto popular antecede e orienta a ação do Congresso ou do governo — diferente do referendo, que confirma ou rejeita uma decisão já tomada.',
      'No Brasil, a Constituição reserva o plebiscito para questões como criação, fusão ou desmembramento de estados e municípios, e mudanças na forma e sistema de governo. O Congresso Nacional autoriza a realização e o TSE organiza a votação.',
      'O plebiscito de 1993 é o exemplo mais conhecido: os brasileiros votaram para manter o presidencialismo ou adotar o parlamentarismo, e para confirmar a república ou restaurar a monarquia.',
    ],
    exemplo: 'Em 1993, os brasileiros foram às urnas para decidir o sistema de governo do país. Por ampla maioria, optaram pelo presidencialismo em vez do parlamentarismo — uma escolha que moldou as instituições políticas até hoje.',
    relacionados: ['referendo', 'iniciativa-popular', 'controle-social', 'pl'],
    links: [
      { label: 'Aprenda sobre política', href: '/temas' },
    ],
  },
  {
    slug: 'referendo', termo: 'Referendo',
    categoria: 'participacao',
    definicaoCurta: 'Consulta popular que ratifica ou rejeita uma decisão já tomada pelo Legislativo — ao contrário do plebiscito, o referendo confirma algo que já existe como proposta aprovada.',
    definicao: [
      'No referendo, a população é consultada após uma decisão ser tomada pelo Congresso ou pelo governo. O voto popular valida ou derruba o que já foi deliberado pelos representantes eleitos.',
      'No Brasil, o único referendo realizado sob a Constituição de 1988 foi o do Estatuto do Desarmamento, em 2005: os eleitores foram chamados a decidir se concordavam com a proibição da comercialização de armas de fogo e munições para civis. A proposta foi rejeitada por maioria.',
      'Como o plebiscito, o referendo deve ser autorizado pelo Congresso e organizado pelo TSE.',
    ],
    exemplo: 'Em 2005, o Congresso aprovou proibir a venda de armas para civis, mas condicionou a entrada em vigor da medida a um referendo popular. Os brasileiros foram às urnas e votaram contra a proibição — a lei não entrou em vigor.',
    relacionados: ['plebiscito', 'iniciativa-popular', 'controle-social'],
    links: [
      { label: 'Aprenda sobre política', href: '/temas' },
    ],
  },
  {
    slug: 'audiencia-publica', termo: 'Audiência pública',
    categoria: 'participacao',
    definicaoCurta: 'Sessão aberta à participação da sociedade, realizada por comissões ou tribunais, para ouvir especialistas, afetados e a população antes de tomar decisões importantes.',
    definicao: [
      'As audiências públicas são um dos principais mecanismos de participação direta da sociedade no processo de decisão. Qualquer cidadão, especialista, representante de movimento social ou entidade pode se inscrever para falar — ou assistir.',
      'No Legislativo, comissões realizam audiências públicas para debater projetos de lei polêmicos ou técnicos antes de votá-los. No STF, audiências públicas são convocadas para grandes temas constitucionais, como o aborto ou as pesquisas com células-tronco.',
      'A audiência pública não tem poder decisório direto: seus resultados são insumos para os parlamentares ou ministros que, ao final, tomam a decisão. Mas ela cria um registro público do debate e pode influenciar significativamente o resultado.',
    ],
    exemplo: 'Antes de votar um projeto que alterava o marco regulatório da mineração, a comissão da Câmara realizou três audiências públicas com geólogos, representantes de comunidades atingidas, ambientalistas e representantes do setor minerador.',
    relacionados: ['controle-social', 'comissao', 'lai', 'plenario'],
    links: [
      { label: 'Aprenda sobre participação', href: '/temas' },
    ],
  },
  {
    slug: 'lai', termo: 'LAI', nomeCompleto: 'Lei de Acesso à Informação',
    categoria: 'participacao',
    definicaoCurta: 'Lei federal que garante a qualquer cidadão o direito de solicitar e receber informações de órgãos públicos — o sigilo é a exceção, a transparência é a regra.',
    definicao: [
      'A Lei de Acesso à Informação (Lei 12.527/2011) consagrou no Brasil o princípio de que as informações produzidas ou guardadas pelo Estado pertencem à sociedade. Qualquer pessoa pode pedir dados a qualquer órgão público federal, estadual ou municipal.',
      'O órgão tem prazo para responder (20 dias, prorrogável por mais 10). Só pode negar informações em casos expressamente previstos na lei, como segurança nacional ou dados pessoais de terceiros. A negativa deve ser fundamentada e pode ser contestada.',
      'A LAI é uma ferramenta essencial para jornalistas, pesquisadores e cidadãos que querem acompanhar gastos, contratos e decisões do governo. Seu uso disseminou-se com os portais e-SIC do governo federal e serviços equivalentes estaduais.',
    ],
    exemplo: 'Uma organização de jornalismo de dados usou a LAI para solicitar ao Ministério da Saúde os contratos de compra de vacinas. Com os dados recebidos, publicou reportagem detalhando preços, fornecedores e prazos de entrega.',
    relacionados: ['controle-social', 'audiencia-publica', 'iniciativa-popular'],
    temas: ['tecnologia'],
    links: [
      { label: 'Transparência — Portal do Governo', href: '/temas' },
    ],
  },
  {
    slug: 'controle-social', termo: 'Controle social',
    categoria: 'participacao',
    definicaoCurta: 'A participação ativa da sociedade no monitoramento, fiscalização e avaliação das políticas públicas e dos gastos governamentais.',
    definicao: [
      'Controle social é o conjunto de mecanismos pelos quais cidadãos e organizações da sociedade civil acompanham, fiscalizam e avaliam a atuação do Estado. Vai além do voto: envolve participação em conselhos municipais, análise de portais de transparência, uso da LAI e participação em audiências públicas.',
      'Conselhos de políticas públicas (saúde, educação, assistência social) são instâncias formais de controle social: compostos por representantes do governo e da sociedade, deliberam sobre diretrizes e fiscalizam a execução das políticas.',
      'Com a digitalização, o controle social foi ampliado: portais como o Siop (orçamento), o Portal da Transparência e o Diário Oficial da União permitem que qualquer pessoa acompanhe gastos e decisões em tempo real.',
    ],
    exemplo: 'Moradores de um município notaram, pelo Portal da Transparência, que obras contratadas pela prefeitura estavam superfaturadas. A denúncia ao TCE levou à abertura de investigação e à suspensão dos contratos.',
    relacionados: ['lai', 'audiencia-publica', 'iniciativa-popular', 'cpi'],
    links: [
      { label: 'Portal da Transparência', href: '/temas' },
    ],
  },
]

const bySlug = new Map(TERMOS.map(t => [t.slug, t]))
export const getTermo = (slug: string): Termo | undefined => bySlug.get(slug)

const ordenados = () => Array.from(TERMOS).sort((a, b) => a.termo.localeCompare(b.termo, 'pt-BR'))

export function termosPorLetra(termos: Termo[] = TERMOS): [string, Termo[]][] {
  const grupos = new Map<string, Termo[]>()
  for (const t of Array.from(termos).sort((a, b) => a.termo.localeCompare(b.termo, 'pt-BR'))) {
    const letra = t.termo[0].normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
    if (!grupos.has(letra)) grupos.set(letra, [])
    grupos.get(letra)!.push(t)
  }
  return Array.from(grupos.entries()).sort(([a], [b]) => a.localeCompare(b))
}

/** Afinidade: relacionados curados + complemento da mesma categoria (sem dupes, sem o próprio), até max. */
export function afins(t: Termo, max = 6): Termo[] {
  const out: Termo[] = []
  const seen = new Set([t.slug])
  for (const r of t.relacionados) {
    const x = bySlug.get(r)
    if (x && !seen.has(x.slug)) { out.push(x); seen.add(x.slug) }
  }
  for (const x of TERMOS) {
    if (out.length >= max) break
    if (x.categoria === t.categoria && !seen.has(x.slug)) { out.push(x); seen.add(x.slug) }
  }
  return out.slice(0, max)
}

export function vizinhos(t: Termo): { prev?: Termo; next?: Termo } {
  const ord = ordenados()
  const i = ord.findIndex(x => x.slug === t.slug)
  return { prev: ord[i - 1], next: ord[i + 1] }
}
