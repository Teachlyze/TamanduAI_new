import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { LoadingScreen, EmptyState, PremiumCard, PremiumButton, toast } from '@/components/ui';
import { Users } from 'lucide-react';

const StudentClassesPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // 1) Buscar memberships do usuário (sem embeds) ordenado por joined_at
        const { data: memberships, error: mErr } = await supabase
          .from('class_members')
          .select('class_id, joined_at')
          .eq('user_id', user.id)
          .eq('role', 'student')
          .order('joined_at', { ascending: false });
        if (mErr) throw mErr;

        const classIds = (memberships || []).map(m => m.class_id);
        if (classIds.length === 0) {
          setClasses([]);
          return;
        }

        // 2) Buscar classes por IDs (sem recursão via embed)
        const { data: klasses, error: kErr } = await supabase
          .from('classes')
          .select('id, name, subject, color, created_by, is_active')
          .in('id', classIds);
        if (kErr) throw kErr;

        // 3) Ordenar classes na mesma ordem dos memberships (joined_at desc)
        const orderMap = new Map(classIds.map((id, idx) => [id, idx]));
        const sorted = (klasses || []).sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
        setClasses(sorted);
      } catch (e) {
        console.error('Erro ao carregar turmas do aluno:', e);
        setError('Não foi possível carregar suas turmas.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  if (loading) return <LoadingScreen message="Carregando suas turmas..." />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-8 rounded-2xl text-white">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Users className="w-6 h-6" /> Minhas Turmas
        </h1>
        <p className="text-white/90">Veja as turmas das quais você participa</p>
      </div>

      <PremiumCard variant="elevated">
        <div className="p-6 space-y-3">
          <h2 className="text-lg font-bold">Entrar em uma turma com código</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Código da turma"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.trim())}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background"
            />
            <PremiumButton
              variant="gradient"
              disabled={!inviteCode || joining}
              onClick={async () => {
                if (!user?.id || !inviteCode) return;
                setJoining(true);
                setError('');
                try {
                  const { data: klass, error: ce } = await supabase
                    .from('classes')
                    .select('id, name')
                    .eq('invite_code', inviteCode)
                    .maybeSingle();
                  if (ce) throw ce;
                  if (!klass) {
                    toast.error?.('Código inválido.');
                    setJoining(false);
                    return;
                  }
                  // Inserir membro (ignore duplicate)
                  const { error: me } = await supabase
                    .from('class_members')
                    .insert({ class_id: klass.id, user_id: user.id, role: 'student', joined_at: new Date().toISOString() });
                  if (me && me.code !== '23505') throw me;
                  toast.success?.(`Você entrou na turma ${klass.name}.`);
                  setInviteCode('');
                  // Recarregar lista
                  // Recarregar via mesma estratégia em duas etapas
                  const { data: memberships } = await supabase
                    .from('class_members')
                    .select('class_id, joined_at')
                    .eq('user_id', user.id)
                    .eq('role', 'student')
                    .order('joined_at', { ascending: false });
                  const classIds = (memberships || []).map(m => m.class_id);
                  if (classIds.length === 0) {
                    setClasses([]);
                  } else {
                    const { data: klasses } = await supabase
                      .from('classes')
                      .select('id, name, subject, color, created_by, is_active')
                      .in('id', classIds);
                    const orderMap = new Map(classIds.map((id, idx) => [id, idx]));
                    const sorted = (klasses || []).sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
                    setClasses(sorted);
                  }
                } catch (e) {
                  console.error('Erro ao entrar na turma:', e);
                  setError('Não foi possível entrar na turma.');
                  toast.error?.('Não foi possível entrar na turma.');
                } finally {
                  setJoining(false);
                }
              }}
            >
              {joining ? 'Entrando...' : 'Entrar'}
            </PremiumButton>
          </div>
        </div>
      </PremiumCard>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
      )}

      {classes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Você ainda não participa de nenhuma turma"
          description="Peça ao seu professor um código de convite para entrar em uma turma."
          action={
            <PremiumButton variant="gradient" size="sm" onClick={() => window.location.assign('/join/')}>
              Entrar em uma turma
            </PremiumButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {classes.map((c) => (
            <PremiumCard key={c.id} variant="elevated">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">{c.name}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                    {c.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{c.subject || 'Sem disciplina'}</p>
              </div>
            </PremiumCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentClassesPage;
