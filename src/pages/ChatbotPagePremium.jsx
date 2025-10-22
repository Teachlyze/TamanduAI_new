import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  PremiumCard,
  StatsCard,
  PremiumButton,
  PremiumInput,
  PremiumModal,
  LoadingScreen,
  toast
} from '@/components/ui';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  BookOpen,
  TrendingUp,
  Loader2,
  Settings,
  CheckCircle2,
  FileText,
  Upload
} from 'lucide-react';

export default function ChatbotPagePremium() {
  // Estado do chatbot
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false); // ✅ MUDOU: false ao invés de true
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [includeDrafts, setIncludeDrafts] = useState(false);
  const [modelInfo, setModelInfo] = useState({ model: 'gpt-3.5-turbo', version: '0613' });
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Mock data
  const [classes] = useState([
    { id: 1, name: 'Matemática 9A', students: 32, activities: 15 },
    { id: 2, name: 'Física 2B', students: 28, activities: 12 },
    { id: 3, name: 'Química Avançada', students: 24, activities: 18 }
  ]);

  const [materials] = useState([
    { id: 1, title: 'Equações de 2º Grau', type: 'activity', status: 'published' },
    { id: 2, title: 'Teorema de Pitágoras', type: 'material', status: 'published' },
    { id: 3, title: 'Funções Quadráticas', type: 'activity', status: 'draft' },
    { id: 4, title: 'Geometria Analítica', type: 'material', status: 'published' },
    { id: 5, title: 'Trigonometria Básica', type: 'activity', status: 'draft' }
  ]);

  // Stats do chatbot
  const [stats] = useState({
    totalConversations: 142,
    questionsAnswered: 856,
    avgResponseTime: '1.2s',
    satisfaction: '4.8/5'
  });

  // Mensagem de boas-vindas
  useEffect(() => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: 'Olá! 👋 Sou o assistente inteligente do TamanduAI. Como posso ajudar você hoje?',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto scroll para última mensagem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setAiTyping(true);

    // Gerar resposta da IA (com ou sem OpenAI)
    try {
      const aiResponse = await generateAIResponse(input);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '⚠️ Desculpe, houve um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiTyping(false);
    }
  };

  const generateAIResponse = async (userInput) => {
    try {
      const requestBody = {
        model: modelInfo.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: selectedClass 
              ? `Você é um assistente educacional inteligente do TamanduAI, especializado na turma "${selectedClass.name}". Ajude professores com questões sobre: criar atividades, gerenciar turmas, avaliar alunos, gerar relatórios e usar a plataforma. Considere o contexto da turma atual com ${selectedClass.students} alunos e ${selectedClass.activities} atividades. Seja conciso, prestativo e amigável.`
              : `Você é um assistente educacional inteligente do TamanduAI. Ajude professores com questões sobre: criar atividades, gerenciar turmas, avaliar alunos, gerar relatórios e usar a plataforma. Seja conciso, prestativo e amigável.`
          },
          { role: 'user', content: userInput }
        ],
        max_tokens: 500,
        temperature: 0.7
      };

      // Direct fetch to avoid x-client-info header added by supabase.functions.invoke (CORS)
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-chat`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('❌ Edge Function error:', res.status, text);
        toast.error('Erro ao chamar IA');
        return `⚠️ Erro ao chamar a IA. Usando modo fallback.\n\n${getMockResponse(userInput)}`;
      }

      let payload = await res.text();
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch {}
      }

      const content = payload?.choices?.[0]?.message?.content;
      if (content) return content;

      // Caso não venha no formato esperado
      return `⚠️ Resposta inesperada da IA. Usando modo fallback.\n\n${getMockResponse(userInput)}`;
    } catch (error) {
      console.error('❌ Erro ao chamar Edge Function/OpenAI:', error);
      toast.error(`Erro ao conectar com IA: ${error.message}`);
      return `⚠️ Erro de conexão com IA. Usando modo fallback.\n\n${getMockResponse(userInput)}`;
    }
  };
  
  const getMockResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('atividade') || input.includes('tarefa')) {
      return 'Para criar uma nova atividade, vá em "Atividades" > "Nova Atividade". Você pode escolher entre diferentes tipos: Tarefa, Prova, Projeto ou Quiz. Precisa de ajuda com algo específico?';
    }
    
    if (input.includes('turma') || input.includes('classe')) {
      return 'Para gerenciar turmas, acesse "Turmas" no menu lateral. Lá você pode criar novas turmas, adicionar alunos e acompanhar o progresso da classe. Quer saber mais sobre alguma funcionalidade?';
    }
    
    if (input.includes('aluno')) {
      return 'Na seção "Alunos" você pode visualizar todos os alunos cadastrados, adicionar novos, ver o desempenho individual e enviar mensagens. Posso ajudar com algo específico sobre os alunos?';
    }
    
    if (input.includes('nota') || input.includes('avaliação')) {
      return 'Para lançar notas, acesse a atividade específica e clique em "Avaliar". Você pode atribuir notas, dar feedback personalizado e enviar notificações aos alunos. Precisa de mais detalhes?';
    }
    
    if (input.includes('relatório')) {
      return 'A seção "Relatórios" oferece análises completas de desempenho, incluindo notas médias, frequência, progresso por turma e identificação de alunos que precisam de atenção. Quer ver algum relatório específico?';
    }
    
    if (input.includes('ajuda') || input.includes('help')) {
      return 'Estou aqui para ajudar! Posso responder perguntas sobre: criar atividades, gerenciar turmas, avaliar alunos, gerar relatórios, agendar eventos e muito mais. O que você gostaria de saber?';
    }
    
    if (input.includes('api') || input.includes('openai')) {
      return '⚠️ Para usar respostas inteligentes com OpenAI, adicione VITE_OPENAI_API_KEY no arquivo .env com sua chave da API. Por enquanto, estou usando respostas pré-programadas.';
    }
    
    return 'Entendo! Posso ajudar você com diversas tarefas como criar atividades, gerenciar turmas, avaliar alunos e gerar relatórios. Pode me fazer perguntas específicas ou pedir ajuda com alguma funcionalidade. 😊\n\n💡 Dica: Para respostas mais inteligentes, configure VITE_OPENAI_API_KEY no .env';
  };

  const quickActions = [
    { label: 'Como criar uma atividade?', icon: BookOpen },
    { label: 'Como adicionar alunos?', icon: User },
    { label: 'Como gerar relatórios?', icon: TrendingUp },
    { label: 'Ajuda com avaliações', icon: Sparkles }
  ];

  const handleQuickAction = (action) => {
    setInput(action);
  };

  const handleSelectClass = (classItem) => {
    setSelectedClass(classItem);
    setShowClassModal(false);
    setShowTrainingModal(true);
  };

  const handleToggleMaterial = (materialId) => {
    setSelectedMaterials(prev => 
      prev.includes(materialId)
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId]
    );
  };

  const handleStartTraining = () => {
    if (selectedMaterials.length === 0) {
      toast.warning('Selecione pelo menos um material', 'Atenção');
      return;
    }
    
    setShowTrainingModal(false);
    toast.success(`Chatbot configurado para ${selectedClass.name}!`, 'Sucesso');
    
    // Mensagem inicial contextualizada
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: `Olá! 👋 Sou o assistente inteligente treinado para a turma ${selectedClass.name}. Fui treinado com ${selectedMaterials.length} materiais e estou pronto para ajudar seus alunos! Como posso ajudar?`,
        timestamp: new Date()
      }
    ]);
  };

  const availableMaterials = includeDrafts 
    ? materials 
    : materials.filter(m => m.status === 'published');

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Modal de Seleção de Turma */}
      <PremiumModal
        isOpen={showClassModal}
        onClose={() => {}}
        title="Selecione uma Turma"
        description="Escolha a turma para configurar o chatbot"
        hideActions
      >
        <div className="space-y-3">
          {classes.map(classItem => (
            <button
              key={classItem.id}
              onClick={() => handleSelectClass(classItem)}
              className="w-full p-4 rounded-lg border-2 border-border hover:border-primary transition-all hover:bg-muted/50 text-left"
            >
              <h3 className="font-bold text-lg mb-1">{classItem.name}</h3>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{classItem.students} alunos</span>
                <span>{classItem.activities} atividades</span>
              </div>
            </button>
          ))}
        </div>
      </PremiumModal>

      {/* Modal de Configuração/Treinamento */}
      <PremiumModal
        isOpen={showTrainingModal}
        onClose={() => setShowTrainingModal(false)}
        title={`Configurar Chatbot - ${selectedClass?.name}`}
        description="Selecione os materiais e atividades para treinar o chatbot"
        submitLabel="Iniciar Treinamento"
        onSubmit={handleStartTraining}
      >
        <div className="space-y-4">
          {/* Opção de incluir rascunhos */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Incluir Rascunhos</p>
              <p className="text-xs text-muted-foreground">Incluir atividades ainda não publicadas</p>
            </div>
            <button
              onClick={() => setIncludeDrafts(!includeDrafts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                includeDrafts ? 'bg-primary' : 'bg-border'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  includeDrafts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Lista de materiais */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <p className="text-sm font-medium mb-2">
              Materiais Disponíveis ({availableMaterials.length})
            </p>
            {availableMaterials.map(material => (
              <div
                key={material.id}
                onClick={() => handleToggleMaterial(material.id)}
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedMaterials.includes(material.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedMaterials.includes(material.id) ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-border" />
                    )}
                    <div>
                      <p className="font-medium">{material.title}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{material.type === 'activity' ? 'Atividade' : 'Material'}</span>
                        {material.status === 'draft' && (
                          <span className="px-2 py-0.5 bg-warning/20 text-warning rounded">
                            Rascunho
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {material.type === 'activity' ? (
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-50 dark:bg-muted/30 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              💡 <strong>{selectedMaterials.length}</strong> materiais selecionados para treinamento
            </p>
          </div>
        </div>
      </PremiumModal>

      {/* Header com botão de configurar */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8 rounded-2xl text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <MessageCircle className="w-8 h-8" />
              Assistente Inteligente
              {selectedClass && (
                <span className="text-lg font-normal">- {selectedClass.name}</span>
              )}
            </h1>
            <p className="text-white/90">Tire suas dúvidas e receba ajuda instantânea com IA</p>
          </div>
          {selectedClass && (
            <PremiumButton
              variant="outline"
              onClick={() => {
                setShowClassModal(true);
                setSelectedMaterials([]);
              }}
              className="bg-white/10 hover:bg-white/20 border-white/30"
            >
              <Settings className="w-4 h-4 mr-2" />
              Reconfigurar
            </PremiumButton>
          )}
        </div>
      </div>

      {/* Info Bar - Modelo + Controles */}
      <PremiumCard variant="elevated" className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Modelo Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {modelInfo.model}
              </span>
              <span className="text-xs text-blue-600/60 dark:text-blue-400/60">
                v{modelInfo.version}
              </span>
            </div>
            
            {/* Status da API */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
              import.meta.env.VITE_OPENAI_API_KEY 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-orange-100 dark:bg-orange-900/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                import.meta.env.VITE_OPENAI_API_KEY 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-orange-500'
              }`} />
              <span className={`text-xs font-medium ${
                import.meta.env.VITE_OPENAI_API_KEY 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-orange-700 dark:text-orange-300'
              }`}>
                {import.meta.env.VITE_OPENAI_API_KEY ? 'OpenAI Ativo' : 'Modo Fallback'}
              </span>
            </div>
            
            {/* Turma Selecionada */}
            {selectedClass && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  {selectedClass.name}
                </span>
              </div>
            )}
          </div>
          
          {/* Botões de Controle */}
          <div className="flex items-center gap-2">
            <PremiumButton
              variant="outline"
              size="sm"
              leftIcon={BookOpen}
              onClick={() => setShowClassModal(true)}
            >
              {selectedClass ? 'Mudar Turma' : 'Selecionar Turma'}
            </PremiumButton>
            
            {selectedClass && (
              <PremiumButton
                variant="outline"
                size="sm"
                leftIcon={Settings}
                onClick={() => setShowTrainingModal(true)}
              >
                Treinar/Retreinar
              </PremiumButton>
            )}
          </div>
        </div>
      </PremiumCard>

      {/* Stats */}
      <div className="stagger-children grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Conversas"
          value={stats.totalConversations.toString()}
          icon={MessageCircle}
        />
        <StatsCard
          title="Perguntas Respondidas"
          value={stats.questionsAnswered.toString()}
          icon={Sparkles}
        />
        <StatsCard
          title="Tempo de Resposta"
          value={stats.avgResponseTime}
          icon={Zap}
        />
        <StatsCard
          title="Satisfação"
          value={stats.satisfaction}
          icon={TrendingUp}
        />
      </div>

      {/* Chat Container - Altura fixa para evitar crescimento infinito */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-3">
          <PremiumCard variant="elevated" className="flex flex-col h-[calc(100vh-28rem)]">
            {/* Messages - Scroll vertical fixo */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'ai' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {message.type === 'user' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {/* AI Typing Indicator */}
              {aiTyping && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <PremiumInput
                  ref={inputRef}
                  placeholder="Digite sua mensagem..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <PremiumButton
                  variant="gradient"
                  onClick={handleSend}
                  disabled={!input.trim() || aiTyping}
                >
                  <Send className="w-5 h-5" />
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <PremiumCard variant="elevated">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Ações Rápidas
              </h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.label)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors flex items-center gap-3"
                    >
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm">{action.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-medium mb-3">Dicas</h4>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>💡 Seja específico nas suas perguntas</p>
                  <p>⚡ Use as ações rápidas para começar</p>
                  <p>🎯 Pergunte sobre qualquer funcionalidade</p>
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
}
