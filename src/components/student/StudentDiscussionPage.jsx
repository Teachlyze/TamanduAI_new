import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { PremiumCard, LoadingScreen, EmptyState, PremiumButton, toast } from '@/components/ui';
import { MessageSquare, Send } from 'lucide-react';

const StudentDiscussionPage = () => {
  const { classId, discussionId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [discussion, setDiscussion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: disc, error: e1 } = await supabase
          .from('discussions')
          .select('id, title, description, class_id, created_by, created_at')
          .eq('id', discussionId)
          .maybeSingle();
        if (e1) throw e1;
        setDiscussion(disc);

        const { data: msgs, error: e2 } = await supabase
          .from('discussion_messages')
          .select('id, content, user_id, created_at, is_deleted, is_edited')
          .eq('discussion_id', discussionId)
          .order('created_at', { ascending: true });
        if (e2) throw e2;
        setMessages(msgs || []);
      } catch (e) {
        console.error('Erro ao carregar discussão:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [discussionId]);

  const postMessage = async () => {
    if (!text.trim() || !user?.id) return;
    setPosting(true);
    try {
      const { data, error } = await supabase
        .from('discussion_messages')
        .insert({ discussion_id: discussionId, user_id: user.id, content: text.trim() })
        .select()
        .maybeSingle();
      if (error) throw error;
      setMessages((m) => [...m, data]);
      setText('');
      toast.success?.('Mensagem enviada');
    } catch (e) {
      console.error('Erro ao enviar mensagem:', e);
      toast.error?.('Falha ao enviar mensagem');
    } finally {
      setPosting(false);
    }
  };
  if (!discussion) return <EmptyState icon={MessageSquare} title="Discussão não encontrada" description="Verifique o link." />;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-sky-600 to-indigo-600 p-8 rounded-2xl text-white">
        <h1 className="text-2xl font-bold flex items-center gap-3"><MessageSquare className="w-6 h-6"/> {discussion.title}</h1>
        {discussion.description && <p className="text-slate-900 dark:text-white/90">{discussion.description}</p>}
      </div>

      <PremiumCard variant="elevated">
        <div className="p-6 space-y-4">
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {messages.length === 0 ? (
              <EmptyState icon={MessageSquare} title="Sem mensagens" description="Comece a conversa." />
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="p-3 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground">{new Date(msg.created_at).toLocaleString('pt-BR')}</div>
                  <div className="mt-1">{msg.content}</div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Escreva uma mensagem"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background"
            />
            <PremiumButton onClick={postMessage} disabled={posting || !text.trim()} leftIcon={Send}>
              {posting ? 'Enviando...' : 'Enviar'}
            </PremiumButton>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
};

export default StudentDiscussionPage;
