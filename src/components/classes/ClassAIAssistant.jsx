import React, { useState } from 'react';
import { Send, Bot } from 'lucide-react';
import { askClassAI } from '@/services/aiService';

export default function ClassAIAssistant({ classId }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  const onAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setError('');
    setLoading(true);
    const q = question.trim();
    setQuestion('');
    try {
      const res = await askClassAI({ classId, question: q });
      setHistory((h) => [...h, { role: 'user', content: q }, { role: 'assistant', content: res?.answer || 'Sem resposta' }]);
    } catch (err) {
      setError(err?.message || 'Falha ao obter resposta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="w-5 h-5" />
        <h3 className="font-semibold">Assistente IA da Turma</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Contexto atrelado à turma. A IA responde com base nos materiais e atividades desta turma.
      </p>
      <div className="space-y-2 max-h-64 overflow-auto border rounded p-2 bg-background">
        {history.length === 0 && (
          <div className="text-xs text-muted-foreground">Sem mensagens. Faça sua primeira pergunta.</div>
        )}
        {history.map((m, idx) => (
          <div key={idx} className="text-sm">
            <span className="font-medium mr-1">{m.role === 'user' ? 'Você:' : 'IA:'}</span>{m.content}
          </div>
        ))}
      </div>
      <form onSubmit={onAsk} className="mt-3 flex items-center gap-2">
        <input
          className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
          placeholder="Pergunte algo sobre esta turma..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-md border hover:bg-muted"
          disabled={loading}
        >
          <Send className="w-4 h-4" />
          Enviar
        </button>
      </form>
      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
    </div>
  );
}
