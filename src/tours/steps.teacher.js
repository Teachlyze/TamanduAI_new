const steps = [
  {
    target: 'body',
    placement: 'center',
    title: 'Bem-vindo ao TamanduAI',
    content:
      'Vamos fazer um tour rápido pelos principais recursos para professores. Você pode pular quando quiser.',
    disableBeacon: true,
  },
  {
    target: '[data-tour-id="nav-dashboard"]',
    title: 'Dashboard do Professor',
    content: 'Aqui você vê indicadores e atalhos rápidos para sua rotina.',
    placement: 'right',
  },
  {
    target: '[data-tour-id="nav-classes"]',
    title: 'Turmas',
    content: 'Gerencie suas turmas, alunos e atividades por turma.',
    placement: 'right',
  },
  {
    target: '[data-tour-id="nav-activities"]',
    title: 'Atividades',
    content: 'Crie, publique e corrija atividades. Rascunhos ficam em "Rascunhos".',
    placement: 'right',
  },
  {
    target: '[data-tour-id="nav-students"]',
    title: 'Alunos',
    content: 'Acompanhe o progresso individual e histórico de cada aluno.',
    placement: 'right',
  },
  {
    target: '[data-tour-id="nav-reports"]',
    title: 'Relatórios',
    content: 'Gere relatórios e métricas de desempenho em tempo real.',
    placement: 'right',
  },
  {
    target: '[data-tour-id="nav-chatbot"]',
    title: 'Chatbot IA',
    content: 'Assistente inteligente para apoio em tarefas e dúvidas.',
    placement: 'right',
  },
  {
    target: 'body',
    placement: 'center',
    title: 'Dica',
    content:
      'Você pode reabrir este tour pelo menu de perfil (canto superior direito) na opção "Refazer tour".',
  },
];

export default steps;
