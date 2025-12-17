import { FormData } from "@/types/form";

export interface Report {
  resumo: string;
  rituais: string[];
  cenarios: {
    provaveis: string[];
    possiveis: string[];
    ousados: string[];
  };
  insights: string[];
  numerologia: {
    numeroDestino: number;
    significado: string;
    numerosMegaSena: number[];
  };
}

function calcularNumeroDestino(idade: number, cidade?: string): number {
  const somaIdade = idade.toString().split('').reduce((acc, num) => acc + parseInt(num), 0);
  const somaCidade = cidade ? cidade.toLowerCase().split('').reduce((acc, char) => {
    const code = char.charCodeAt(0);
    return acc + (code >= 97 && code <= 122 ? code - 96 : 0);
  }, 0) : 0;
  
  let total = somaIdade + somaCidade;
  while (total > 9 && total !== 11 && total !== 22 && total !== 33) {
    total = total.toString().split('').reduce((acc, num) => acc + parseInt(num), 0);
  }
  
  return total;
}

function gerarNumerosMegaSena(numeroDestino: number, idade: number, cidade?: string): number[] {
  const numeros: number[] = [];
  const base = numeroDestino;
  
  numeros.push(base);
  numeros.push((base * 3) % 60 + 1);
  numeros.push((idade + base) % 60 + 1);
  numeros.push(((cidade?.length || 0) * base) % 60 + 1);
  numeros.push((base * 7 + idade) % 60 + 1);
  numeros.push((base * 11) % 60 + 1);
  
  return Array.from(new Set(numeros))
    .sort((a, b) => a - b)
    .slice(0, 6)
    .map(n => n === 0 ? numeroDestino : n);
}

function getSignificadoNumero(numero: number): string {
  const significados: { [key: number]: string } = {
    1: "Número da liderança e novos começos. 2026 será um ano de iniciativas ousadas e autonomia.",
    2: "Número da cooperação e parcerias. Relacionamentos serão fundamentais em sua jornada.",
    3: "Número da criatividade e expressão. Sua voz e talentos ganharão destaque.",
    4: "Número da estabilidade e construção. É hora de criar bases sólidas para o futuro.",
    5: "Número da liberdade e mudanças. Grandes transformações te aguardam.",
    6: "Número da responsabilidade e harmonia. Família e compromissos estarão em foco.",
    7: "Número da espiritualidade e introspecção. Busque respostas dentro de si.",
    8: "Número da abundância e poder. Prosperidade material está a caminho.",
    9: "Número da conclusão e sabedoria. Ciclos se fecham para novos renascerem.",
    11: "Número mestre da iluminação. Você tem uma missão especial em 2026.",
    22: "Número mestre do construtor. Grandes realizações são possíveis.",
    33: "Número mestre do mestre. Sua influência sobre outros será poderosa."
  };
  
  return significados[numero] || significados[1];
}

export function generateReport(data: FormData): Report {
  const { 
    idade, 
    sexo, 
    profissao, 
    estudando, 
    situacaoCivil, 
    filhos, 
    estado,
    cidade,
    bairro,
    objetivoPrincipal,
    objetivoPrincipalOutro,
    areaMelhorar,
    areaMelhorarOutro,
    desafioAtual,
    desafioAtualOutro
  } = data;

  // Função auxiliar para formatar arrays em texto
  const formatarResposta = (opcoes?: string[], outro?: string): string => {
    const todas = [...(opcoes || [])];
    if (outro) todas.push(outro);
    return todas.join(", ").toLowerCase();
  };

  const objetivoTexto = objetivoPrincipal && objetivoPrincipal.length > 0 ? formatarResposta(objetivoPrincipal, objetivoPrincipalOutro) : "crescimento pessoal e profissional";
  const areaTexto = areaMelhorar && areaMelhorar.length > 0 ? formatarResposta(areaMelhorar, areaMelhorarOutro) : "desenvolvimento pessoal";
  const desafioTexto = desafioAtual && desafioAtual.length > 0 ? formatarResposta(desafioAtual, desafioAtualOutro) : "crescimento e transformação";

  const idadeCategoria = idade < 25 ? "jovem" : idade < 35 ? "adulto jovem" : idade < 50 ? "meia-idade" : "madura";
  const localizacao = cidade && estado ? (bairro ? `${bairro}, ${cidade}/${estado}` : `${cidade}/${estado}`) : "sua localização";
  
  const numeroDestino = calcularNumeroDestino(idade, cidade);
  const numerosMegaSena = gerarNumerosMegaSena(numeroDestino, idade, cidade);
  const significadoNumero = getSignificadoNumero(numeroDestino);

  return {
    resumo: `Através da análise profunda das linhas da sua mão e da energia do seu perfil, vejo uma ${sexo === "feminino" ? "mulher" : "pessoa"} ${idadeCategoria} de ${idade} anos${cidade ? `, residente em ${localizacao}` : ""}. ${cidade ? `A energia vibracional da sua localização, especialmente em ${cidade}, influencia diretamente as marcações místicas observadas em sua palma.` : "As marcações místicas observadas em sua palma revelam um perfil único e especial."}

Sua atuação como ${profissao.toLowerCase()} está refletida na linha do destino de sua mão - ela mostra ${estudando ? "uma mente em constante expansão, característica visível no desenvolvimento progressivo da linha da cabeça" : "a maturidade profissional alcançada, evidente na firmeza e profundidade das linhas principais"}.

As linhas do coração revelam que você está em um momento de ${situacaoCivil && (situacaoCivil === "casada" || situacaoCivil === "relacionamento") ? "aprofundamento nas relações existentes, com marcações que indicam maior intimidade e compromisso" : "abertura para novos encontros transformadores, com ramificações que sugerem múltiplas possibilidades afetivas"}. ${filhos ? "A maternidade deixou marcas visíveis nas linhas secundárias, mostrando força, sacrifício e amor incondicional." : "As linhas da fertilidade sugerem potencial criativo intenso, seja para gerar vida ou manifestar projetos transformadores."}

Seus objetivos relacionados a ${objetivoTexto} estão mapeados no monte de Júpiter de sua mão - há uma energia de ambição direcionada que se alinha perfeitamente com seus propósitos declarados. A área que você busca melhorar, ${areaTexto}, aparece como interrupções sutis na linha da vida, indicando que transformações profundas são necessárias e possíveis neste aspecto.

Os desafios atuais relacionados a ${desafioTexto} estão refletidos nas linhas de resistência. No entanto, a força do monte de Marte em sua palma mostra que você possui a resiliência necessária para superá-los. As marcações místicas indicam que a solução virá de dentro para fora.`,

    rituais: [
      `${estado ? `Use ${estado === "BA" || estado === "PE" || estado === "CE" ? "branco e azul claro" : estado === "RS" || estado === "SC" || estado === "PR" ? "vermelho e dourado" : estado === "SP" || estado === "RJ" || estado === "MG" ? "branco e dourado" : "branco e prata"} na virada do ano - cores que ressoam especialmente com as energias vibratórias de ${estado}` : "Use branco e dourado na virada do ano - cores que ressoam especialmente com energias de prosperidade e renovação"}`,
      `${filhos ? "Pule 7 ondas com seus filhos, uma tradição que fortalecerá os laços familiares e trará proteção para todo o núcleo" : "Pule 7 ondas de costas, visualizando cada onda lavando um obstáculo e trazendo uma bênção para 2026"}`,
      `${cidade ? `Leve uma romã na bolsa durante todo o mês de janeiro - em ${cidade}, esta fruta carrega uma energia especial de prosperidade` : "Leve uma romã na bolsa durante todo o mês de janeiro - esta fruta carrega uma energia especial de prosperidade"}`,
      "Na primeira lua cheia de 2026, escreva 3 desejos em papel amarelo e queime sob a luz lunar, guardando as cinzas em um saquinho vermelho",
      `${estudando ? "Coloque um cristal de quartzo transparente em seu local de estudos para amplificar concentração e absorção de conhecimento" : "Mantenha uma planta de dinheiro (Plectranthus) no ambiente de trabalho para atrair crescimento profissional e oportunidades"}`,
      `Acenda uma vela roxa toda quinta-feira às 19h durante janeiro, pedindo clareza para seus objetivos relacionados a ${objetivoTexto}`
    ],

    cenarios: {
      provaveis: [
        `Evolução na área de ${areaTexto}: as linhas da sua mão indicam movimento significativo nesta área entre fevereiro e maio de 2026`,
        `Quanto aos seus objetivos relacionados a ${objetivoTexto}, os primeiros sinais concretos de manifestação aparecerão no primeiro trimestre, ganhando força no segundo semestre`,
        `${situacaoCivil === "solteira" ? "Conhecimento de pessoa significativa em contexto inesperado, possivelmente relacionado a " + areaTexto : situacaoCivil ? "Fortalecimento do relacionamento atual através de uma renovação de compromisso ou decisão importante tomada em conjunto" : "Abertura para conexões significativas que podem transformar sua perspectiva sobre relacionamentos"}`,
        `Superação gradual relacionada a ${desafioTexto} através de ajuda inesperada de alguém próximo${cidade ? ` em ${cidade}` : ""}`,
        `${estudando ? "Conclusão de etapa importante nos estudos com reconhecimento público ou acadêmico" : "Proposta profissional que valoriza sua experiência e pode significar aumento de até 30% em ganhos"}`
      ],
      
      possiveis: [
        `Mudança significativa relacionada à ${localizacao} - pode ser mudança de bairro, cidade, ou transformação profunda no ambiente onde vive`,
        `Descoberta de talento oculto ou desenvolvimento de habilidade nova relacionada a ${areaTexto}, possivelmente gerando renda extra`,
        `${filhos ? "Conquista importante de um dos filhos que trará orgulho e renovação de perspectivas familiares" : "Decisão importante sobre expandir família ou assumir responsabilidade significativa com pessoa jovem"}`,
        `Viagem transformadora entre agosto e outubro que mudará completamente sua visão sobre seus objetivos`,
        `Reconhecimento público ou visibilidade aumentada na área de ${profissao.toLowerCase()}, possivelmente através de redes sociais ou indicação`,
        `Resolução surpreendente relacionada a ${desafioTexto} através de abordagem completamente diferente da que você imagina`
      ],
      
      ousados: [
        `Mudança radical de vida: relocação para outro estado ou país, seguindo intuição profunda relacionada a seus objetivos`,
        `Manifestação de abundância financeira inesperada (herança, prêmio, ou oportunidade única) - os números ${numerosMegaSena.join(", ")} têm energia especial para você na Mega-Sena`,
        `${situacaoCivil === "solteira" ? "Encontro com amor transformador que muda completamente sua perspectiva sobre relacionamentos e futuro" : situacaoCivil ? "Decisão audaciosa no relacionamento que solidifica ou transforma completamente a dinâmica atual" : "Descoberta de novas formas de conexão e relacionamento que expandem sua visão de mundo"}`,
        `Transformação completa na carreira: sua atuação como ${profissao.toLowerCase()} pode evoluir para algo revolucionário e inovador`,
        `Desenvolvimento de dons intuitivos ou espirituais que se transformam em propósito de vida ou fonte de renda complementar`
      ]
    },

    insights: [
      `${cidade ? `A energia da sua localização em ${localizacao} é propícia para manifestações materiais - aproveite esta força telúrica` : "A energia do seu perfil é propícia para manifestações materiais - aproveite esta força transformadora"}`,
      `${filhos ? "Seu papel como mãe é também seu poder místico - a maternidade é um portal de manifestação" : "Sua liberdade para focar em si mesma é um presente raro - use-a sabiamente"}`,
      `Os desafios relacionados a ${desafioTexto} não são bloqueios, mas sim portais de transformação`,
      `${estudando ? "O conhecimento que você busca é tanto intelectual quanto espiritual - permita que ambos se entrelacem" : "Sua experiência de vida é um tesouro - confie mais em sua sabedoria acumulada"}`,
      "As linhas da sua mão revelam que você tem proteção espiritual forte - confie em sua intuição",
      `${cidade ? `Em 2026, o alinhamento planetário favorecerá especialmente pessoas em ${cidade} - você está no lugar certo` : "Em 2026, o alinhamento planetário será especialmente favorável para você - confie no momento certo"}`
    ],

    numerologia: {
      numeroDestino,
      significado: significadoNumero,
      numerosMegaSena
    }
  };
}
