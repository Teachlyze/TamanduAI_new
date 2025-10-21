import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
  MessageCircle,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Bot,
  User,
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Clock,
  Zap
} from 'lucide-react';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

const StudentChatSidebar = ({ collapsed, setCollapsed, classId = null, activityId = null }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user && (classId || activityId)) {
      loadChatHistory();
    }
  }, [user, classId, activityId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbot_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('class_id', classId || 'general')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      
      const formattedMessages = data?.map(msg => ({
        id: msg.id,
        content: msg.message,
        role: msg.role,
        timestamp: new Date(msg.created_at),
        sources: msg.metadata?.sources || []
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || loading) return;

    const messageToSend = newMessage.trim();
    const userMessage = {
      id: Date.now(),
      content: messageToSend,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage(''); // Limpa o input imediatamente
    setLoading(true);

    try {
      // Simular resposta do chatbot (substituir pela integração real)
      const { data, error } = await supabase.functions.invoke('chatbot-rag', {
        body: {
          class_id: classId || 'general',
          activity_id: activityId,
          user_id: user.id,
          message: messageToSend,
          context: {
            isStudent: true,
            currentPage: window.location.pathname
          }
        }
      });

      if (error) throw error;

      const botMessage = {
        id: Date.now() + 1,
        content: data?.answer || 'Desculpe, não consegui processar sua pergunta no momento.',
        role: 'assistant',
        timestamp: new Date(),
        sources: data?.sources || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Fallback response
      const fallbackMessage = {
        id: Date.now() + 1,
        content: 'Desculpe, estou temporariamente indisponível. Tente novamente em alguns minutos.',
        role: 'assistant',
        timestamp: new Date(),
        sources: []
      };

      setMessages(prev => [...prev, fallbackMessage]);
      toast.error('Erro ao conectar com o assistente IA');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    { icon: HelpCircle, text: "Como fazer esta atividade?", category: "ajuda" },
    { icon: BookOpen, text: "Explique este conceito", category: "conceito" },
    { icon: Lightbulb, text: "Dê uma dica", category: "dica" },
    { icon: Clock, text: "Quando é o prazo?", category: "prazo" }
  ];

  const handleQuickQuestion = (question) => {
    setNewMessage(question);
  };

  return (
    <motion.aside
      initial={{ x: 400 }}
      animate={{ x: 0, width: collapsed ? 60 : 380 }}
      transition={{ type: 'spring', damping: 20 }}
      className="fixed right-0 top-0 h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-l border-border/50 backdrop-blur-xl z-30 overflow-hidden"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-white hover:opacity-90">
                    Assistente IA
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {classId ? 'Contextual da turma' : 'Geral'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {collapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Chat Content */}
        {!collapsed && (
          <div className="flex-1 flex flex-col">
            {/* Context Info */}
            {(classId || activityId) && (
              <div className="p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-border/30 text-white hover:opacity-90">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-muted-foreground">
                    {activityId ? 'Contexto: Atividade atual' : 'Contexto: Turma atual'}
                  </span>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-muted">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">
                    Olá! Sou seu assistente IA. Como posso ajudar?
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[280px] rounded-2xl p-3 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                      : 'bg-white dark:bg-gray-800 border border-border shadow-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/30">
                        <p className="text-xs text-muted-foreground mb-1">Fontes:</p>
                        {message.sources.map((source, idx) => (
                          <Badge key={idx} variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border text-xs mr-1">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {message.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-border rounded-2xl p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 0 && (
              <div className="p-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground mb-3">Perguntas rápidas:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickQuestions.map((q, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickQuestion(q.text)}
                      className="p-2 text-xs bg-white dark:bg-gray-800 border border-border rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <q.icon className="w-3 h-3 text-blue-500" />
                        <span className="truncate">{q.text}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta..."
                  className="flex-1 text-sm"
                  disabled={loading}
                />
                <PremiumButton
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || loading}
                  size="sm"
                  className="px-3"
                >
                  {loading ? (
                    <Zap className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </PremiumButton>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed State */}
        {collapsed && (
          <div className="flex-1 flex flex-col items-center justify-center p-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCollapsed(false)}
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg mb-4"
            >
              <MessageCircle className="w-6 h-6" />
            </motion.button>
            
            {messages.length > 0 && (
              <Badge className="bg-red-500 text-white text-xs">
                {messages.filter(m => m.role === 'assistant' && !m.read).length || ''}
              </Badge>
            )}
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default StudentChatSidebar;
