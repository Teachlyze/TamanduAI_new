import { motion } from 'framer-motion';
import { Trophy, Medal, Star, TrendingUp, Users, Award, Zap, Target, Crown, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/Loading';

const TeacherRankingPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myClassesRanking, setMyClassesRanking] = useState([]);
  const [schoolRanking, setSchoolRanking] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [classes, setClasses] = useState([]);
  const [schools, setSchools] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, avgXP: 0, topStreak: 0 });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedClass]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadClasses(),
        loadSchools(),
        loadMyClassesRanking(),
        loadSchoolRanking(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    const { data } = await supabase
      .from('classes')
      .select('id, name')
      .eq('created_by', user.id)
      .eq('is_active', true)
      .order('name');

    setClasses(data || []);
  };

  const loadSchools = async () => {
    // Buscar escolas onde o professor trabalha
    const { data } = await supabase
      .from('school_teachers')
      .select(`
        school_id,
        schools:school_id (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (data) {
      setSchools(data.map(st => st.schools).filter(Boolean));
    }
  };

  const loadMyClassesRanking = async () => {
    // Buscar turmas do professor
    const classQuery = supabase
      .from('classes')
      .select('id')
      .eq('created_by', user.id)
      .eq('is_active', true);

    if (selectedClass !== 'all') {
      classQuery.eq('id', selectedClass);
    }

    const { data: classData } = await classQuery;

    if (!classData || classData.length === 0) {
      setMyClassesRanking([]);
      return;
    }

    const classIds = classData.map(c => c.id);

    // Buscar membros dessas turmas
    const { data: members } = await supabase
      .from('class_members')
      .select('user_id')
      .in('class_id', classIds)
      .eq('role', 'student');

    if (!members || members.length === 0) {
      setMyClassesRanking([]);
      return;
    }

    const userIds = members.map(m => m.user_id);

    // Buscar gamificação dos alunos
    const { data: gamification } = await supabase
      .from('gamification_profiles')
      .select(`
        user_id,
        xp_total,
        level,
        current_streak,
        badges_earned,
        missions_completed,
        profiles:user_id (
          name,
          avatar_url
        )
      `)
      .in('user_id', userIds)
      .order('xp_total', { ascending: false })
      .limit(100);

    setMyClassesRanking(gamification || []);
  };

  const loadSchoolRanking = async () => {
    if (schools.length === 0) {
      setSchoolRanking([]);
      return;
    }

    const schoolIds = schools.map(s => s.id);

    // Buscar turmas das escolas
    const { data: schoolClasses } = await supabase
      .from('school_classes')
      .select('class_id')
      .in('school_id', schoolIds);

    if (!schoolClasses || schoolClasses.length === 0) {
      setSchoolRanking([]);
      return;
    }

    const classIds = schoolClasses.map(sc => sc.class_id);

    // Buscar membros dessas turmas
    const { data: members } = await supabase
      .from('class_members')
      .select('user_id')
      .in('class_id', classIds)
      .eq('role', 'student');

    if (!members || members.length === 0) {
      setSchoolRanking([]);
      return;
    }

    const userIds = members.map(m => m.user_id);

    // Buscar gamificação dos alunos
    const { data: gamification } = await supabase
      .from('gamification_profiles')
      .select(`
        user_id,
        xp_total,
        level,
        current_streak,
        badges_earned,
        missions_completed,
        profiles:user_id (
          name,
          avatar_url
        )
      `)
      .in('user_id', userIds)
      .order('xp_total', { ascending: false })
      .limit(100);

    setSchoolRanking(gamification || []);
  };

  const loadStats = async () => {
    const ranking = selectedClass === 'all' ? myClassesRanking : myClassesRanking;
    
    if (ranking.length === 0) return;

    const totalStudents = ranking.length;
    const avgXP = Math.round(ranking.reduce((sum, s) => sum + s.xp_total, 0) / totalStudents);
    const topStreak = Math.max(...ranking.map(s => s.current_streak || 0));

    setStats({ totalStudents, avgXP, topStreak });
  };

  const getRankIcon = (position) => {
    switch(position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getRankBadge = (position) => {
    if (position === 1) return <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white">🏆 1º Lugar</Badge>;
    if (position === 2) return <Badge className="bg-gradient-to-r from-gray-300 to-gray-400 text-white">🥈 2º Lugar</Badge>;
    if (position === 3) return <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">🥉 3º Lugar</Badge>;
    return <Badge variant="outline">{position}º</Badge>;
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
            <Trophy className="w-8 h-8 text-purple-600" />
            Ranking de Alunos
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe o desempenho e evolução dos seus alunos
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Alunos</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">XP Médio</p>
                <p className="text-2xl font-bold">{stats.avgXP}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maior Sequência</p>
                <p className="text-2xl font-bold">{stats.topStreak} dias</p>
              </div>
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Ranking */}
      <Tabs defaultValue="myClasses" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="myClasses">
            <Target className="w-4 h-4 mr-2" />
            Minhas Turmas
          </TabsTrigger>
          <TabsTrigger value="school" disabled={schools.length === 0}>
            <Award className="w-4 h-4 mr-2" />
            Escola
            {schools.length > 0 && <Badge className="ml-2" variant="secondary">{schools.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Ranking das Minhas Turmas */}
        <TabsContent value="myClasses" className="space-y-4">
          {/* Filtro de Turmas */}
          {classes.length > 1 && (
            <Card>
              <CardContent className="pt-6">
                <label className="text-sm font-medium mb-2 block">Filtrar por Turma:</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full md:w-auto px-4 py-2 border rounded-lg bg-white dark:bg-slate-900 text-foreground border-border"
                >
                  <option value="all">Todas as Turmas</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </CardContent>
            </Card>
          )}

          {/* Ranking List */}
          <Card>
            <CardHeader>
              <CardTitle>Top Alunos</CardTitle>
              <CardDescription>
                Classificação baseada em XP total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myClassesRanking.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum aluno encontrado
                </p>
              ) : (
                <div className="space-y-3">
                  {myClassesRanking.map((student, index) => (
                    <motion.div
                      key={student.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${
                        index < 3 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' : 'bg-card'
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-12 flex items-center justify-center">
                        {getRankIcon(index + 1)}
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={student.profiles?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          {student.profiles?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold truncate">{student.profiles?.name || 'Aluno'}</p>
                          {getRankBadge(index + 1)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            Nível {student.level}
                          </span>
                          {student.current_streak > 0 && (
                            <span className="flex items-center gap-1">
                              <Flame className="w-4 h-4 text-orange-500" />
                              {student.current_streak} dias
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-purple-500" />
                            {student.badges_earned || 0} badges
                          </span>
                        </div>
                      </div>

                      {/* XP */}
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {student.xp_total}
                        </p>
                        <p className="text-xs text-muted-foreground">XP Total</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ranking da Escola */}
        <TabsContent value="school" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking da Escola</CardTitle>
              <CardDescription>
                Alunos de todas as turmas das escolas onde você trabalha
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schoolRanking.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum aluno encontrado nas escolas
                </p>
              ) : (
                <div className="space-y-3">
                  {schoolRanking.map((student, index) => (
                    <motion.div
                      key={student.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${
                        index < 3 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' : 'bg-card'
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-12 flex items-center justify-center">
                        {getRankIcon(index + 1)}
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={student.profiles?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                          {student.profiles?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold truncate">{student.profiles?.name || 'Aluno'}</p>
                          {getRankBadge(index + 1)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            Nível {student.level}
                          </span>
                          {student.current_streak > 0 && (
                            <span className="flex items-center gap-1">
                              <Flame className="w-4 h-4 text-orange-500" />
                              {student.current_streak} dias
                            </span>
                          )}
                        </div>
                      </div>

                      {/* XP */}
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {student.xp_total}
                        </p>
                        <p className="text-xs text-muted-foreground">XP Total</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherRankingPage;
