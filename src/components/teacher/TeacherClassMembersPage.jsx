import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { PremiumCard, LoadingScreen, EmptyState, PremiumButton, toast } from '@/components/ui';
import { Users, Trash2, Clock } from 'lucide-react';

const TeacherClassMembersPage = () => {
  const { classId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [klass, setKlass] = useState(null);
  const [members, setMembers] = useState([]);
  const [history, setHistory] = useState([]);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!classId) return;
      setLoading(true);
      try {
        const { data: c, error: e1 } = await supabase
          .from('classes')
          .select('id, name, created_by')
          .eq('id', classId)
          .maybeSingle();
        if (e1) throw e1;
        setKlass(c);

        const { data: mems, error: e2 } = await supabase
          .from('class_members')
          .select('id, user_id, role, joined_at, nickname, user:profiles(id, full_name, email)')
          .eq('class_id', classId)
          .order('joined_at', { ascending: false });
        if (e2) throw e2;
        setMembers(mems || []);

        const { data: hist, error: e3 } = await supabase
          .from('class_member_history')
          .select('id, user_id, action, role, performed_by, reason, created_at, user:profiles!class_member_history_user_id_fkey(full_name), performer:profiles!class_member_history_performed_by_fkey(full_name)')
          .eq('class_id', classId)
          .order('created_at', { ascending: false })
          .limit(50);
        if (e3) throw e3;
        setHistory(hist || []);
      } catch (e) {
        console.error('Erro ao carregar membros:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [classId]);

  const removeMember = async (memberId, userId) => {
    if (!window.confirm('Tem certeza que deseja remover este aluno da turma?')) return;
    setRemoving(memberId);
    try {
      await supabase.rpc('set_config', { parameter: 'app.current_user_id', value: user.id });
      const { error } = await supabase
        .from('class_members')
        .delete()
        .eq('id', memberId);
      if (error) throw error;
      setMembers((m) => m.filter((mem) => mem.id !== memberId));
      toast.success?.('Aluno removido da turma');
      // Reload history
      const { data: hist } = await supabase
        .from('class_member_history')
        .select('id, user_id, action, role, performed_by, reason, created_at, user:profiles!class_member_history_user_id_fkey(full_name), performer:profiles!class_member_history_performed_by_fkey(full_name)')
        .eq('class_id', classId)
        .order('created_at', { ascending: false })
        .limit(50);
      setHistory(hist || []);
    } catch (e) {
      console.error('Erro ao remover membro:', e);
      toast.error?.('Erro ao remover aluno');
    } finally {
      setRemoving(null);
    }
  };

  if (loading) return <LoadingScreen message="Carregando membros..." />;
  if (!klass) return <EmptyState icon={Users} title="Turma não encontrada" />;

  const students = members.filter((m) => m.role === 'student');
  const teachers = members.filter((m) => m.role === 'teacher');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-2xl text-white">
        <h1 className="text-2xl font-bold flex items-center gap-3"><Users className="w-6 h-6"/> Gerenciar Membros</h1>
        <p className="text-white/90">{klass.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PremiumCard variant="elevated">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold">Alunos ({students.length})</h2>
            {students.length === 0 ? (
              <EmptyState icon={Users} title="Sem alunos" description="Nenhum aluno matriculado ainda." />
            ) : (
              <div className="space-y-2">
                {students.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <div className="font-medium">{m.user?.full_name || 'Aluno'}</div>
                      <div className="text-xs text-muted-foreground">{m.user?.email}</div>
                      {m.nickname && <div className="text-xs text-muted-foreground">Apelido: {m.nickname}</div>}
                      <div className="text-xs text-muted-foreground">Entrou: {new Date(m.joined_at).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <PremiumButton
                      variant="outline"
                      size="sm"
                      onClick={() => removeMember(m.id, m.user_id)}
                      disabled={removing === m.id}
                      leftIcon={Trash2}
                    >
                      {removing === m.id ? 'Removendo...' : 'Remover'}
                    </PremiumButton>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold">Professores ({teachers.length})</h2>
            {teachers.length === 0 ? (
              <EmptyState icon={Users} title="Sem co-professores" />
            ) : (
              <div className="space-y-2">
                {teachers.map((m) => (
                  <div key={m.id} className="p-3 rounded-lg border border-border">
                    <div className="font-medium">{m.user?.full_name || 'Professor'}</div>
                    <div className="text-xs text-muted-foreground">{m.user?.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PremiumCard>
      </div>

      <PremiumCard variant="elevated">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><Clock className="w-5 h-5"/> Histórico de Alterações</h2>
          {history.length === 0 ? (
            <EmptyState icon={Clock} title="Sem histórico" description="Nenhuma alteração registrada." />
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.map((h) => (
                <div key={h.id} className="p-3 rounded-lg border border-border text-sm">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      h.action === 'added' ? 'bg-green-100 text-green-700' :
                      h.action === 'removed' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {h.action === 'added' ? 'Adicionado' : h.action === 'removed' ? 'Removido' : 'Alterado'}
                    </span>
                    <span className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="mt-1">
                    <strong>{h.user?.full_name || 'Usuário'}</strong> ({h.role})
                    {h.performer?.full_name && <> por <strong>{h.performer.full_name}</strong></>}
                  </div>
                  {h.reason && <div className="text-xs text-muted-foreground mt-1">Motivo: {h.reason}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </PremiumCard>
    </div>
  );
};

export default TeacherClassMembersPage;
