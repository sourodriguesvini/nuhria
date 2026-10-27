// Dados reais da Nuhria (reunião de 27/10/2026 e Dossiê). Não inventar telefone, e-mail ou preço.

export const WHATSAPP = '5521996062680';
export const WHATSAPP_LEGIVEL = '(21) 99606-2680';
export const waLink = (msg = 'Olá! Vim pelo site da Nuhria e gostaria de agendar uma conversa.') =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

export const INSTAGRAM = '@saudenuhria'; // a confirmar com a Stephanie
export const ENDERECO = {
  rua: 'Av. Pref. Silvio Picanço, 463',
  sala: 'Sala 706 · Only Offices',
  cidade: 'Charitas, Niterói · RJ',
};
export const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  'Av. Pref. Silvio Picanço, 463, Charitas, Niterói, RJ',
)}`;
// CFM 2.336/2023: nome, CRM e "médica". Falta: registro da clínica no CRM-RJ e diretor técnico-médico.
export const IDENTIFICACAO_MEDICA = 'Diretora clínica: Dra. Suzana Lessa · Médica · CRM-RJ 52-91631-5';

export type Area = { slug: string; titulo: string; texto: string; img: string };

// Seis áreas montadas a partir da reunião e do briefing. A validar com a Dra. Suzana.
export const AREAS: Area[] = [
  {
    slug: 'metabolismo',
    titulo: 'Metabolismo e hormônios',
    texto: 'Investigação e acompanhamento de como o corpo funciona por dentro: metabolismo, hormônios e a energia do dia a dia.',
    img: '/img/area-metabolismo.webp',
  },
  {
    slug: 'nutricao',
    titulo: 'Nutrição',
    texto: 'Atendimento com a nutricionista da equipe, que pode acontecer no mesmo dia da consulta médica.',
    img: '/img/area-nutricao.webp',
  },
  {
    slug: 'avaliacao',
    titulo: 'Avaliação do corpo',
    texto: 'Avaliação física, bioimpedância, fotos e scanner corporal, feitos pela enfermagem antes da consulta.',
    img: '/img/area-avaliacao.webp',
  },
  {
    slug: 'injetaveis',
    titulo: 'Tratamentos injetáveis',
    texto: 'Aplicados na sala de enfermagem quando indicados na consulta, com orientação e acompanhamento.',
    img: '/img/area-injetaveis.webp',
  },
  {
    slug: 'esteticos',
    titulo: 'Cuidados estéticos',
    texto: 'Procedimentos estéticos selecionados, sempre a partir do que foi conversado na consulta.',
    img: '/img/area-esteticos.webp',
  },
  {
    slug: 'acompanhamento',
    titulo: 'Acompanhamento',
    texto: 'Retornos marcados ao fim de cada atendimento, para que o cuidado tenha continuidade.',
    img: '/img/area-acompanhamento.webp',
  },
];

export type Etapa = { n: string; rotulo: string; titulo: string; texto: string; quem: string; img: string };

// Primeira consulta descrita pela Dra. Suzana na reunião de 27/10/2026.
export const ETAPAS: Etapa[] = [
  {
    n: '01',
    rotulo: 'Chegada',
    titulo: 'Recepção',
    texto: 'Chegada sem pressa. A equipe de atendimento recebe você na sala 706 e acompanha os primeiros passos.',
    quem: 'Equipe de atendimento',
    img: '/img/dia-recepcao.webp',
  },
  {
    n: '02',
    rotulo: 'Avaliação',
    titulo: 'Avaliação do corpo',
    texto: 'Na sala de enfermagem: avaliação física, bioimpedância, fotos e scanner corporal. Dados do seu corpo que chegam à consulta junto com a sua história.',
    quem: 'Enfermagem',
    img: '/img/dia-avaliacao.webp',
  },
  {
    n: '03',
    rotulo: 'Consulta',
    titulo: 'Consulta com a Dra. Suzana',
    texto: 'Uma conversa a partir das suas queixas e necessidades, lidas junto com a avaliação. É aqui que as prioridades são definidas com você.',
    quem: 'Dra. Suzana Lessa',
    img: '/img/dia-consulta.webp',
  },
  {
    n: '04',
    rotulo: 'Cuidados',
    titulo: 'Procedimentos e nutrição',
    texto: 'Quando indicado, procedimento injetável ou estético na sala de enfermagem. Se fizer sentido, atendimento com a nutricionista da equipe no mesmo dia.',
    quem: 'Enfermagem e nutricionista',
    img: '/img/dia-cuidados.webp',
  },
  {
    n: '05',
    rotulo: 'Retorno',
    titulo: 'Retorno marcado',
    texto: 'Antes de sair, o próximo encontro já fica agendado, para que o cuidado tenha continuidade.',
    quem: 'Equipe de atendimento',
    img: '/img/dia-retorno.webp',
  },
];

export const WAZE = `https://waze.com/ul?q=${encodeURIComponent('Av. Pref. Silvio Picanço, 463, Charitas, Niterói')}&navigate=yes`;

/** A cor do dia: manhã clara no topo, poente quente no fim da página. */
export const COR_DO_DIA = ['#FFF9F1', '#FFF7EC', '#F8EFE1', '#F6EADB', '#F0DFCB', '#EAD5BD'];
