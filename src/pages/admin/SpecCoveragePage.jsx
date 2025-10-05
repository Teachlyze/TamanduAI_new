import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';

const SpecCoveragePage = () => {
  const modules = [
    {
      name: '1. Autenticação e Gestão de Usuários',
      items: [
        { feature: 'Cadastro com validação de e-mail único', status: 'completed' },
        { feature: 'Três tipos de usuários: Professores, Alunos e Escolas', status: 'completed' },
        { feature: 'Confirmação de conta via e-mail', status: 'completed' },
        { feature: 'Autenticação JWT integrada com Supabase', status: 'completed' },
        { feature: 'Políticas de senha forte obrigatórias', status: 'completed' },
        { feature: 'Proteção contra ataques de força bruta', status: 'completed' },
        { feature: 'Uso de HCaptcha para prevenção de bots', status: 'completed' },
        { feature: 'Sistema de login/logout seguro', status: 'completed' },
        { feature: 'Recuperação de senha via e-mail', status: 'completed' },
        { feature: 'Gestão de escolas (cadastro, vinculação)', status: 'completed' },
        { feature: 'Sistema de convite da escola para professor', status: 'completed' },
      ],
    },
    {
      name: '2. Dashboard e Interface Principal',
      items: [
        { feature: 'Cards com métricas em tempo real', status: 'completed' },
        { feature: 'Feed de atividades recentes', status: 'completed' },
        { feature: 'Indicadores de desempenho acadêmico', status: 'completed' },
        { feature: 'Sistema de onboarding com tooltips', status: 'completed' },
        { feature: 'Configuração inicial de perfil', status: 'completed' },
      ],
    },
    {
      name: '3. Gestão de Turmas',
      items: [
        { feature: 'Criação de turmas individuais ou vinculadas à escola', status: 'completed' },
        { feature: 'Turmas podem ter múltiplos professores', status: 'completed' },
        { feature: 'Sistema de convite para co-professores', status: 'completed' },
        { feature: 'Configuração de disciplina, curso, período, ano', status: 'completed' },
        { feature: 'Cor da turma (personalização visual)', status: 'completed' },
        { feature: 'Sistema de apelidos (visível apenas para professor)', status: 'completed' },
        { feature: 'Histórico de alunos removidos/entrada', status: 'completed' },
        { feature: 'Desassociação de alunos com confirmação', status: 'completed' },
      ],
    },
    {
      name: '4. Materiais e Conteúdo',
      items: [
        { feature: 'Postagem de textos, links, imagens, vídeos e documentos', status: 'completed' },
        { feature: 'Sistema de rascunhos', status: 'completed' },
        { feature: 'Postagem em múltiplas turmas simultaneamente', status: 'completed' },
        { feature: 'Categorização customizável de materiais', status: 'completed' },
        { feature: 'Filtros por turma, data, categoria', status: 'completed' },
      ],
    },
    {
      name: '5. Construtor de Atividades',
      items: [
        { feature: 'Tipos: resposta curta, parágrafo, múltipla escolha, checkboxes', status: 'completed' },
        { feature: 'Editor de texto rico com formatação avançada', status: 'completed' },
        { feature: 'Sistema de anexos', status: 'completed' },
        { feature: 'Campos obrigatórios configuráveis', status: 'completed' },
        { feature: 'Preview em tempo real do formulário', status: 'completed' },
        { feature: 'Definição de pontuação total', status: 'completed' },
        { feature: 'Peso diferenciado por questão', status: 'completed' },
        { feature: 'Sistema de rascunhos', status: 'completed' },
        { feature: 'Seleção de múltiplas turmas para postagem', status: 'completed' },
        { feature: 'Atividades em grupo (montagem manual, geração aleatória)', status: 'completed' },
        { feature: 'Um aluno entrega e seleciona membros do grupo', status: 'completed' },
        { feature: 'Nota aplicada a todos os membros', status: 'completed' },
      ],
    },
    {
      name: '6. Submissão e Correção',
      items: [
        { feature: 'Interface de submissão com detalhamento completo', status: 'completed' },
        { feature: 'Múltiplos arquivos anexáveis', status: 'completed' },
        { feature: 'Cancelamento e reenvio até o prazo', status: 'completed' },
        { feature: 'Registro automático de status', status: 'completed' },
        { feature: 'Autosave de rascunho durante preenchimento', status: 'completed' },
        { feature: 'Correção automática de questões objetivas', status: 'completed' },
        { feature: 'Cálculo automático de pontuação', status: 'completed' },
        { feature: 'Editor de notas/feedbacks', status: 'completed' },
        { feature: 'Sistema de feedbacks personalizados', status: 'completed' },
        { feature: 'Atribuição manual de notas', status: 'completed' },
        { feature: 'Histórico completo de alterações', status: 'completed' },
        { feature: 'Notificação ao aluno quando nota liberada', status: 'in_progress' },
        { feature: 'Devolver para revisão com mensagem', status: 'completed' },
      ],
    },
    {
      name: '7. Sistema Anti-Plágio (Winston AI)',
      items: [
        { feature: 'Análise via API Winston AI após submissão', status: 'completed' },
        { feature: 'Comparação com conteúdo da internet', status: 'completed' },
        { feature: 'Resultados privados (não visíveis ao aluno)', status: 'completed' },
        { feature: 'Três níveis de notificação configuráveis', status: 'completed' },
        { feature: 'Rastreamento de custos por análise', status: 'pending' },
      ],
    },
    {
      name: '8. Chatbot Educacional com RAG',
      items: [
        { feature: 'Treinamento por turma com documentos', status: 'in_progress' },
        { feature: 'Armazenamento no Supabase Storage', status: 'completed' },
        { feature: 'Permissões explícitas para IA', status: 'in_progress' },
        { feature: 'Responde dúvidas sobre conteúdo das atividades', status: 'in_progress' },
        { feature: 'Referencia material fonte nas respostas', status: 'in_progress' },
        { feature: 'Log completo de interações', status: 'pending' },
        { feature: 'Analytics do Chatbot (tópicos, desempenho)', status: 'pending' },
      ],
    },
    {
      name: '9. Banco de Questões Público',
      items: [
        { feature: 'Professores criam questões objetivas', status: 'pending' },
        { feature: 'Disponibilização pública opcional', status: 'pending' },
        { feature: 'Categorização por disciplina e tópico', status: 'pending' },
        { feature: 'Tela dedicada para estudo (alunos)', status: 'pending' },
        { feature: 'Sistema de rating de questões', status: 'pending' },
      ],
    },
    {
      name: '10. Chat e Discussões',
      items: [
        { feature: 'Chat geral por turma', status: 'completed' },
        { feature: 'Comentários específicos por atividade', status: 'completed' },
        { feature: 'Threads de respostas (parent/child)', status: 'completed' },
        { feature: 'Atualização em tempo real', status: 'completed' },
        { feature: 'Moderação (professor pode deletar)', status: 'completed' },
        { feature: 'Registro de quem deletou e quando', status: 'completed' },
      ],
    },
    {
      name: '11. Analytics e Relatórios',
      items: [
        { feature: 'Visualização de notas por disciplina', status: 'completed' },
        { feature: 'Histórico completo de avaliações', status: 'completed' },
        { feature: 'Gráficos interativos de evolução', status: 'in_progress' },
        { feature: 'Exportação em PDF/Excel', status: 'pending' },
        { feature: 'Comparação aluno vs turma', status: 'in_progress' },
        { feature: 'Comparação turma vs turma', status: 'in_progress' },
        { feature: 'Alertas inteligentes (turmas/alunos)', status: 'completed' },
        { feature: 'Benchmarks históricos', status: 'pending' },
        { feature: 'Relatórios agendados (Premium)', status: 'pending' },
      ],
    },
    {
      name: '12. Sistema de Notificações',
      items: [
        { feature: 'Notificações in-app com contador', status: 'completed' },
        { feature: 'Atualização em tempo real', status: 'completed' },
        { feature: 'Marcação como lida/não lida', status: 'completed' },
        { feature: 'Notificações por e-mail (Resend)', status: 'completed' },
        { feature: 'Templates customizáveis', status: 'in_progress' },
        { feature: 'Preferências granulares por canal', status: 'completed' },
      ],
    },
    {
      name: '13. Calendário Acadêmico',
      items: [
        { feature: 'Provas presenciais, reuniões, prazos', status: 'completed' },
        { feature: 'Adição manual de eventos', status: 'completed' },
        { feature: 'Anexo de roteiros de prova', status: 'in_progress' },
        { feature: 'Visualização por turma', status: 'completed' },
        { feature: 'Cores customizáveis', status: 'completed' },
      ],
    },
    {
      name: '14. Reuniões Síncronas',
      items: [
        { feature: 'Criação de reuniões por turma', status: 'completed' },
        { feature: 'Definição de data e horário', status: 'completed' },
        { feature: 'Status: agendada, ao vivo, encerrada, cancelada', status: 'completed' },
        { feature: 'Integração com Agora RTC', status: 'completed' },
        { feature: 'Registro de entrada e saída', status: 'completed' },
        { feature: 'Papéis: host, co-host, participante', status: 'completed' },
      ],
    },
    {
      name: '15. Interface do Aluno',
      items: [
        { feature: 'Organização de notas por matéria', status: 'completed' },
        { feature: 'Exibição de média individual e comparação', status: 'completed' },
        { feature: 'Cálculo automático de médias ponderadas', status: 'completed' },
        { feature: 'Página detalhada com histórico completo', status: 'completed' },
        { feature: 'Interface em acordeão para expandir atividades', status: 'completed' },
        { feature: 'Exportação em PDF/Excel', status: 'pending' },
        { feature: 'Lista cronológica de atividades e materiais', status: 'completed' },
        { feature: 'Destaque visual para atividades próximas do prazo', status: 'completed' },
      ],
    },
    {
      name: '16. Planos e Monetização',
      items: [
        { feature: 'Planos: Gratuito, Premium, Enterprise', status: 'pending' },
        { feature: 'Integração com Stripe', status: 'pending' },
        { feature: 'Período trial', status: 'pending' },
        { feature: 'Rastreamento de uso para billing', status: 'pending' },
      ],
    },
    {
      name: '17. Segurança e Compliance',
      items: [
        { feature: 'Registro de consentimentos (LGPD)', status: 'completed' },
        { feature: 'Versionamento de termos', status: 'completed' },
        { feature: 'Sistema de exclusão de dados', status: 'in_progress' },
        { feature: 'Anonimização de dados sensíveis', status: 'in_progress' },
        { feature: 'Log completo de ações sensíveis (audit trail)', status: 'completed' },
        { feature: 'Registro de IP e user agent', status: 'completed' },
      ],
    },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      completed: { icon: FiCheck, text: 'Implementado', className: 'bg-green-100 text-green-800' },
      in_progress: { icon: FiClock, text: 'Em Progresso', className: 'bg-yellow-100 text-yellow-800' },
      pending: { icon: FiX, text: 'Pendente', className: 'bg-gray-100 text-gray-800' },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.className}`}>
        <Icon className="mr-1 h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  const getCounts = () => {
    const allItems = modules.flatMap(m => m.items);
    return {
      total: allItems.length,
      completed: allItems.filter(i => i.status === 'completed').length,
      in_progress: allItems.filter(i => i.status === 'in_progress').length,
      pending: allItems.filter(i => i.status === 'pending').length,
    };
  };

  const counts = getCounts();
  const completionPercent = Math.round((counts.completed / counts.total) * 100);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cobertura de Especificação v2.0</h1>
        <div className="text-sm text-gray-500">
          {counts.completed} / {counts.total} funcionalidades implementadas ({completionPercent}%)
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Implementadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{counts.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Em Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{counts.in_progress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{counts.pending}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {modules.map((module, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="text-lg">{module.name}</CardTitle>
              <div className="text-xs text-gray-500">
                {module.items.filter(i => i.status === 'completed').length} / {module.items.length} implementadas
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {module.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <span className="text-sm">{item.feature}</span>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-200">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Legenda</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <FiCheck className="text-green-600" />
            <span>Implementado: Funcionalidade completa e testada</span>
          </div>
          <div className="flex items-center gap-2">
            <FiClock className="text-yellow-600" />
            <span>Em Progresso: Implementação parcial ou em refinamento</span>
          </div>
          <div className="flex items-center gap-2">
            <FiX className="text-gray-600" />
            <span>Pendente: Ainda não iniciado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecCoveragePage;
