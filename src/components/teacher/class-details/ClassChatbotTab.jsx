import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  AlertCircle,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';

const ClassChatbotTab = ({ classId, classData }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Olá! Sou o assistente IA da turma **${classData.name}**. Posso te ajudar com:\n\n• Análise de desempenho dos alunos\n• Sugestões de atividades\n• Identificação de alunos com dificuldades\n• Insights sobre engajamento\n\nComo posso ajudar hoje?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickActions = [
    {
      id: 'performance',
      label: 'Analisar Desempenho',
      icon: TrendingUp,
      prompt: 'Analise o desempenho geral da turma e me dê um resumo'
    },
    {
      id: 'struggling',
      label: 'Alunos com Dificuldade',
      icon: AlertCircle,
      prompt: 'Quais alunos estão com dificuldades e precisam de atenção?'
    },
    {
      id: 'suggestions',
      label: 'Sugestões de Atividades',
      icon: Lightbulb,
      prompt: 'Sugira atividades que podem ajudar a turma'
    },
    {
      id: 'engagement',
      label: 'Análise de Engajamento',
      icon: Users,
      prompt: 'Como está o engajamento dos alunos nas atividades?'
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simular resposta da IA (substituir por chamada real à API)
    setTimeout(() => {
      const aiResponse = generateAIResponse(messageText);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);
      setLoading(false);
    }, 1500);
  };

  const generateAIResponse = (prompt) => {
    // Respostas simuladas - substituir por chamada real à API de IA
    const responses = {
      'desempenho': `📊 **Análise de Desempenho - ${classData.name}**\n\n**Média Geral:** 7.8/10\n\n**Destaques:**\n• 65% dos alunos acima de 8.0\n• Melhor desempenho em Quiz de Matemática (8.5)\n• Maior dificuldade em Redação (6.8)\n\n**Recomendações:**\n1. Reforço em escrita criativa\n2. Mais exercícios práticos\n3. Feedback individualizado`,
      
      'dificuldades': `⚠️ **Alunos que Precisam de Atenção**\n\n**Alta Prioridade (3 alunos):**\n• Maria Silva - Média 5.2, ausente em 3 atividades\n• João Santos - Dificuldade em interpretação\n• Ana Costa - Baixo engajamento\n\n**Ações Sugeridas:**\n1. Agendar conversa individual\n2. Atividades de reforço personalizadas\n3. Monitoramento semanal`,
      
      'sugestões': `💡 **Sugestões de Atividades para ${classData.subject}**\n\n**Esta Semana:**\n1. Quiz interativo sobre tópicos anteriores\n2. Trabalho em grupo (3-4 alunos)\n3. Debate sobre tema atual\n\n**Próxima Semana:**\n1. Projeto criativo individual\n2. Apresentação oral\n3. Avaliação formativa\n\n**Objetivo:** Aumentar engajamento e reforçar conceitos`,
      
      'engajamento': `👥 **Análise de Engajamento**\n\n**Participação:**\n• 82% entrega no prazo\n• 15% média de comentários por post\n• 3.5 dias tempo médio de resposta\n\n**Horários de Maior Atividade:**\n• 19h-21h (pico de acesso)\n• Terça e quinta (maior engajamento)\n\n**Dicas:**\n• Postar conteúdo entre 18h-19h\n• Atividades interativas às terças`
    };

    // Identificar tipo de pergunta
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('desempenho') || lowerPrompt.includes('performance')) {
      return responses.desempenho;
    } else if (lowerPrompt.includes('dificuldade') || lowerPrompt.includes('atenção')) {
      return responses.dificuldades;
    } else if (lowerPrompt.includes('sugest') || lowerPrompt.includes('atividade')) {
      return responses.sugestões;
    } else if (lowerPrompt.includes('engajamento') || lowerPrompt.includes('participação')) {
      return responses.engajamento;
    }

    // Resposta padrão
    return `Entendi sua pergunta sobre "${prompt}". Baseado nos dados da turma **${classData.name}**, aqui está o que posso te dizer:\n\n• Total de ${classData.students_count || 0} alunos ativos\n• ${classData.activities_count || 0} atividades criadas\n• Engajamento médio de 78%\n\nPara análises mais específicas, experimente usar os botões de ação rápida acima! 🚀`;
  };

  const handleQuickAction = (action) => {
    sendMessage(action.prompt);
  };

  return (
    <div className="h-[calc(100vh-24rem)] flex flex-col">
      {/* Quick Actions */}
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <motion.button
            key={action.id}
            onClick={() => handleQuickAction(action)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-border hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm hover:shadow-md"
          >
            <action.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2" />
            <p className="text-sm font-medium text-left">{action.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Messages Container */}
      <PremiumCard className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === 'assistant'
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                      : 'bg-gradient-to-br from-emerald-600 to-teal-600'
                  }`}>
                    {message.role === 'assistant' ? (
                      <Bot className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white font-bold">P</span>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`rounded-2xl p-4 ${
                    message.role === 'assistant'
                      ? 'bg-slate-100 dark:bg-slate-800'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                  }`}>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {message.content.split('\n').map((line, i) => (
                        <p key={i} className="mb-2 last:mb-0">
                          {line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').split('<strong>').map((part, j) => {
                            if (j % 2 === 1) {
                              return <strong key={j}>{part}</strong>;
                            }
                            return part;
                          })}
                        </p>
                      ))}
                    </div>
                    <p className="text-xs mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Digite sua pergunta..."
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <PremiumButton
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="whitespace-nowrap inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white disabled:opacity-50 px-6 py-3"
            >
              <Send className="w-4 h-4" />
              <span>Enviar</span>
            </PremiumButton>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
};

export default ClassChatbotTab;
