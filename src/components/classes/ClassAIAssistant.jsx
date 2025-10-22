import React, { useState } from 'react';
import { Send, Bot, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { askClassAI } from '@/services/aiService';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export default function ClassAIAssistant({ classId }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const onAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error('Digite uma pergunta');
      return;
    }
    
    setLoading(true);
    const q = question.trim();
    setQuestion('');
    
    // Adiciona pergunta do usuário ao histórico
    setHistory((h) => [...h, { role: 'user', content: q }]);
    
    try {
      const res = await askClassAI({ classId, question: q });
      setHistory((h) => [...h, { role: 'assistant', content: res?.answer || 'Sem resposta disponível.' }]);
      toast.success('Resposta recebida!');
    } catch (err) {
      console.error('AI Error:', err);
      setHistory((h) => [...h, { 
        role: 'assistant', 
        content: 'Desculpe, não consegui processar sua pergunta. Tente novamente.' 
      }]);
      toast.error('Erro ao consultar IA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PremiumCard variant="elevated" className="relative overflow-hidden">
      {/* Header com gradiente */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-4 rounded-t-xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-white text-lg">Assistente IA</h3>
          </div>
          <p className="text-white/90 text-sm">
            Pergunte sobre a turma, materiais ou atividades
          </p>
        </div>
      </div>

      {/* Chat History */}
      <div className="p-4">
        <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-700 scrollbar-track-transparent pr-2">
          {history.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="inline-flex p-4 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-3">
                <Bot className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                Nenhuma mensagem ainda.
                <br />
                Faça sua primeira pergunta!
              </p>
            </motion.div>
          )}
          
          <AnimatePresence>
            {history.map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-foreground border border-border'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
                {m.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">Você</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 border border-border">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span className="text-sm text-muted-foreground">Pensando...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={onAsk} className="mt-4 flex items-center gap-2">
          <Input
            placeholder="Digite sua pergunta..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            className="flex-1 bg-white dark:bg-slate-900 text-foreground border-border"
          />
          <PremiumButton
            type="submit"
            disabled={loading || !question.trim()}
            leftIcon={loading ? Loader2 : Send}
            className="whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </PremiumButton>
        </form>
      </div>
    </PremiumCard>
  );
}
