import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { PremiumCard, LoadingScreen, EmptyState, PremiumButton } from '@/components/ui';
import ChatbotWidget from '@/components/ui/ChatbotWidget';
import { BookOpen, MessageSquare } from 'lucide-react';

const StudentClassDetailsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [klass, setKlass] = useState(null);
  const [activities, setActivities] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setError('');
      try {
        // Class info
        const { data: c, error: e1 } = await supabase
          .from('classes')
          .select('*')
          .eq('id', classId)
          .maybeSingle();
        if (e1) throw e1;
        setKlass(c);

        // Activities assigned to this class via activity_class_assignments
        const { data: acts, error: e2 } = await supabase
          .from('activity_class_assignments')
          .select('activity:activities(id, title, description, type, due_date, is_published)')
          .eq('class_id', classId)
          .order('assigned_at', { ascending: false });
        if (e2) throw e2;
        setActivities((acts || []).map(a => a.activity).filter(Boolean));

        // Discussions for this class
        const { data: discs, error: e3 } = await supabase
          .from('discussions')
          .select('id, title, description, created_at, activity_id')
          .eq('class_id', classId)
          .order('created_at', { ascending: false });
        if (e3) throw e3;
        setDiscussions(discs || []);
      } catch (err) {
        console.error('Erro ao carregar turma:', err);
        setError('Não foi possível carregar a turma.');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [classId]);

  if (loading) return <LoadingScreen message="Carregando turma..." />;
  if (!klass) return <EmptyState title="Turma não encontrada" description="Verifique o link e tente novamente." icon={BookOpen} />;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-2xl text-white">
        <h1 className="text-2xl font-bold">{klass.name}</h1>
        <p className="text-white/90">{klass.subject || 'Sem disciplina'}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PremiumCard variant="elevated">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2"><BookOpen className="w-5 h-5"/> Atividades</h2>
              </div>
              {activities.length === 0 ? (
                <EmptyState icon={BookOpen} title="Nenhuma atividade" description="O professor ainda não publicou atividades." />
              ) : (
                <div className="space-y-3">
                  {activities.map(a => (
                    <div key={a.id} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{a.title}</h3>
                          <p className="text-sm text-muted-foreground">{a.description || 'Sem descrição'}</p>
                        </div>
                        <PremiumButton variant="gradient" size="sm" onClick={() => navigate(`/students/activities/${a.id}`)}>
                          Abrir
                        </PremiumButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PremiumCard>
        </div>

        <div className="space-y-6">
          <PremiumCard variant="elevated">
            <div className="p-6">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><MessageSquare className="w-5 h-5"/> Discussões</h2>
              {discussions.length === 0 ? (
                <EmptyState icon={MessageSquare} title="Sem discussões" description="Nenhuma discussão criada ainda." />
              ) : (
                <div className="space-y-3">
                  {discussions.map(d => (
                    <Link key={d.id} to={`/students/classes/${classId}/discussions/${d.id}`} className="block p-3 rounded-lg border border-border hover:bg-muted/50">
                      <div className="font-medium">{d.title}</div>
                      {d.description && <div className="text-sm text-muted-foreground line-clamp-2">{d.description}</div>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </PremiumCard>
        </div>
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget context={{ classId }} />
    </div>
  );
};

export default StudentClassDetailsPage;
