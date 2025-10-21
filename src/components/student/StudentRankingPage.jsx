import { PremiumCard, EmptyState, LoadingScreen } from '@/components/ui';
import { Trophy, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

const rankify = (totals, profilesMap) => {
  const arr = Object.entries(totals).map(([user_id, xp]) => ({
    user_id,
    xp,
    name: profilesMap.get(user_id)?.full_name || 'Aluno',
  }));
  arr.sort((a, b) => (b.xp || 0) - (a.xp || 0));
  return arr.map((r, i) => ({ ...r, position: i + 1 }));
};

const StudentRankingPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [classMembers, setClassMembers] = useState({}); // classId -> [user_ids]
  const [profiles, setProfiles] = useState(new Map()); // user_id -> {full_name}
  const [xpByUser, setXpByUser] = useState({}); // user_id -> total xp
  const [schoolId, setSchoolId] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        // Minhas turmas
        const { data: cm } = await supabase
          .from('class_members')
          .select('class_id, class:classes(id, name)')
          .eq('user_id', user.id)
          .eq('role', 'student');
        const myClasses = (cm || []).map((m) => m.class).filter(Boolean);
        setClasses(myClasses);
        
        // Buscar school_id via school_classes
        let sId = null;
        if (myClasses.length > 0) {
          const classIds = myClasses.map(c => c.id);
          const { data: sc } = await supabase
            .from('school_classes')
            .select('school_id')
            .in('class_id', classIds)
            .limit(1)
            .maybeSingle();
          sId = sc?.school_id || null;
        }
        setSchoolId(sId);

        // Membros por turma
        if (myClasses.length > 0) {
          const classIds = myClasses.map((c) => c.id);
          const { data: members } = await supabase
            .from('class_members')
            .select('class_id, user_id')
            .in('class_id', classIds)
            .eq('role', 'student');
          const byClass = {};
          const userSet = new Set();
          for (const m of members || []) {
            byClass[m.class_id] = byClass[m.class_id] || [];
            byClass[m.class_id].push(m.user_id);
            userSet.add(m.user_id);
          }
          setClassMembers(byClass);

          // Perfis
          const userIds = Array.from(userSet);
          if (userIds.length) {
            const { data: profs } = await supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', userIds);
            const pMap = new Map();
            (profs || []).forEach((p) => pMap.set(p.id, p));
            setProfiles(pMap);

            // XP total por usuário (agregado no cliente)
            const { data: logs } = await supabase
              .from('xp_log')
              .select('user_id, xp')
              .in('user_id', userIds);
            const totals = {};
            (logs || []).forEach((l) => {
              totals[l.user_id] = (totals[l.user_id] || 0) + (l.xp || 0);
            });
            setXpByUser(totals);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const schoolUserIds = useMemo(() => {
    if (!schoolId) return [];
    const ids = new Set();
    for (const c of classes) {
      if (classMembers[c.id]) {
        classMembers[c.id].forEach((u) => ids.add(u));
      }
    }
    return Array.from(ids);
  }, [schoolId, classes, classMembers]);

  if (loading) return <LoadingScreen message="Calculando rankings..." />;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-amber-600 to-yellow-600 p-8 rounded-2xl text-white">
        <h1 className="text-2xl font-bold flex items-center gap-3"><Trophy className="w-6 h-6"/> Ranking</h1>
        <p className="text-white/90">Rankings por turma e por escola</p>
      </div>

      {/* Rankings lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Ranking por turma (esquerda) */}
        <div className="space-y-6 h-full">
          <h3 className="text-xl font-bold">Ranking por Turma</h3>
          {classes.length === 0 ? (
            <PremiumCard variant="elevated">
              <div className="p-6">
                <EmptyState icon={Users} title="Sem turmas" description="Entre em uma turma para ver o ranking." />
              </div>
            </PremiumCard>
          ) : (
            classes.map((c) => {
              const totals = {};
              (classMembers[c.id] || []).forEach((u) => {
                totals[u] = xpByUser[u] || 0;
              });
              const ranking = rankify(totals, profiles);
              return (
                <PremiumCard key={c.id} variant="elevated">
                  <div className="p-6">
                    <div className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      {c.name}
                    </div>
                    {ranking.length === 0 ? (
                      <EmptyState icon={Trophy} title="Sem pontos ainda" description="Ninguém pontuou por enquanto." />
                    ) : (
                      <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-700 scrollbar-track-transparent">
                        {ranking.map((r) => (
                          <div key={r.user_id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                r.position === 1 ? 'bg-yellow-400 text-yellow-900' :
                                r.position === 2 ? 'bg-gray-300 text-gray-800' :
                                r.position === 3 ? 'bg-orange-400 text-orange-900' :
                                'bg-muted text-foreground'
                              }`}>
                                {r.position}
                              </span>
                              <span className={r.user_id === user?.id ? 'font-bold text-primary' : ''}>{r.name}</span>
                            </div>
                            <span className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">{r.xp} XP</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </PremiumCard>
              );
            })
          )}
        </div>

        {/* Ranking por escola (direita) */}
        <div className="space-y-6 h-full">
          <h3 className="text-xl font-bold">Ranking da Escola</h3>
          <PremiumCard variant="elevated" className="h-full">
            <div className="p-6">
              <div className="font-bold text-lg mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Classificação Geral
              </div>
              {(!schoolId || schoolUserIds.length === 0) ? (
                <EmptyState icon={Users} title="Sem escola" description="Participe de uma turma vinculada a uma escola para ver o ranking." />
              ) : (
                (() => {
                  const totals = {};
                  schoolUserIds.forEach((u) => {
                    totals[u] = xpByUser[u] || 0;
                  });
                  const ranking = rankify(totals, profiles);
                  return ranking.length === 0 ? (
                    <EmptyState icon={Trophy} title="Sem pontos ainda" description="Ninguém pontuou por enquanto." />
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-700 scrollbar-track-transparent">
                      {ranking.map((r) => (
                        <div key={r.user_id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              r.position === 1 ? 'bg-yellow-400 text-yellow-900' :
                              r.position === 2 ? 'bg-gray-300 text-gray-800' :
                              r.position === 3 ? 'bg-orange-400 text-orange-900' :
                              'bg-muted text-foreground'
                            }`}>
                              {r.position}
                            </span>
                            <span className={r.user_id === user?.id ? 'font-bold text-primary' : ''}>{r.name}</span>
                          </div>
                          <span className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">{r.xp} XP</span>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
};

export default StudentRankingPage;
