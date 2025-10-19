import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, TrendingUp, Users, Award, Zap, BookOpen, Crown, Flame, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/Loading';
import schoolService from '@/services/schoolService';

const SchoolRankingPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [globalRanking, setGlobalRanking] = useState([]);
  const [classRankings, setClassRankings] = useState({});
  const [selectedClass, setSelectedClass] = useState('global');
  const [classes, setClasses] = useState([]);
  const [schoolData, setSchoolData] = useState(null);
  const [stats, setStats] = useState({ totalStudents: 0, totalClasses: 0, avgXP: 0, topStreak: 0 });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      await loadSchoolData();
      await loadClasses();
      await loadGlobalRanking();
      await loadStats();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSchoolData = async () => {
    // Buscar dados da escola via schoolService (profiles.school_id não existe)
    const schoolInfo = await schoolService.getUserSchool(user.id);
    if (schoolInfo) {
      setSchoolData({ id: schoolInfo.id, name: schoolInfo.name });
    }
  };

  const loadClasses = async () => {
    if (!schoolData?.id) return;

    // Buscar turmas linkadas à escola via school_classes
    const { data } = await supabase
      .from('school_classes')
      .select(`
        class_id,
        classes:class_id (
          id,
          name,
          created_by
        )
      `)
      .eq('school_id', schoolData.id);

    if (data) {
      const classList = data.map(sc => sc.classes).filter(Boolean);
      setClasses(classList);
      
      // Carregar ranking de cada turma
      for (const cls of classList) {
        await loadClassRanking(cls.id);
      }
    }
  };

  const loadGlobalRanking = async () => {
    if (!schoolData?.id) return;

    // Buscar turmas da escola
    const { data: schoolClasses } = await supabase
      .from('school_classes')
      .select('class_id')
      .eq('school_id', schoolData.id);

    if (!schoolClasses || schoolClasses.length === 0) {
      setGlobalRanking([]);
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
      setGlobalRanking([]);
      return;
    }

    const userIds = [...new Set(members.map(m => m.user_id))]; // Remove duplicatas

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

    setGlobalRanking(gamification || []);
  };

  const loadClassRanking = async (classId) => {
    // Buscar membros da turma
    const { data: members } = await supabase
      .from('class_members')
      .select('user_id')
      .eq('class_id', classId)
      .eq('role', 'student');

    if (!members || members.length === 0) return;

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
        profiles:user_id (
          name,
          avatar_url
        )
      `)
      .in('user_id', userIds)
      .order('xp_total', { ascending: false });

    setClassRankings(prev => ({
      ...prev,
      [classId]: gamification || []
    }));
  };

  const loadStats = async () => {
    if (globalRanking.length === 0) return;

    const totalStudents = globalRanking.length;
    const totalClasses = classes.length;
    const avgXP = Math.round(globalRanking.reduce((sum, s) => sum + s.xp_total, 0) / totalStudents);
    const topStreak = Math.max(...globalRanking.map(s => s.current_streak || 0));

    setStats({ totalStudents, totalClasses, avgXP, topStreak });
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

  const currentRanking = selectedClass === 'global' ? globalRanking : classRankings[selectedClass] || [];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
            <Trophy className="w-8 h-8 text-blue-600" />
            Ranking de Alunos - {schoolData?.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Desempenho de todos os alunos da instituição
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-muted-foreground">Turmas Ativas</p>
                <p className="text-2xl font-bold">{stats.totalClasses}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-500" />
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

      {/* Filtro de Turmas */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Target className="w-5 h-5 text-muted-foreground" />
            <label className="text-sm font-medium">Filtrar por Turma:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="flex-1 md:flex-none md:w-64 px-4 py-2 border rounded-lg bg-white dark:bg-slate-900 text-foreground border-border"
            >
              <option value="global">🌐 Ranking Global da Escola</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>📚 {c.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Ranking List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedClass === 'global' ? 'Top Alunos da Escola' : `Top Alunos - ${classes.find(c => c.id === selectedClass)?.name}`}
          </CardTitle>
          <CardDescription>
            Classificação baseada em XP total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentRanking.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground">
                Nenhum aluno encontrado nesta visualização
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentRanking.map((student, index) => (
                <motion.div
                  key={student.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-lg ${
                    index < 3 
                      ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-amber-200 shadow-md' 
                      : 'bg-card hover:bg-accent'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-14 flex items-center justify-center">
                    {getRankIcon(index + 1)}
                  </div>

                  {/* Avatar */}
                  <Avatar className={`${index < 3 ? 'w-14 h-14 ring-2 ring-amber-300' : 'w-12 h-12'}`}>
                    <AvatarImage src={student.profiles?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold">
                      {student.profiles?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-semibold truncate ${index < 3 ? 'text-lg' : ''}`}>
                        {student.profiles?.name || 'Aluno'}
                      </p>
                      {getRankBadge(index + 1)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
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
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-green-500" />
                        {student.missions_completed || 0} missões
                      </span>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <p className={`font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ${
                      index < 3 ? 'text-3xl' : 'text-2xl'
                    }`}>
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

      {/* Top 3 Podium (opcional - visual extra) */}
      {selectedClass === 'global' && globalRanking.length >= 3 && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              Pódio dos Campeões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-center gap-4 py-8">
              {/* 2º Lugar */}
              {globalRanking[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <Avatar className="w-20 h-20 ring-4 ring-gray-300 mb-2">
                    <AvatarImage src={globalRanking[1].profiles?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-500 text-white text-xl">
                      {globalRanking[1].profiles?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gradient-to-br from-gray-300 to-gray-400 text-white px-6 py-8 rounded-t-lg text-center min-w-[120px]">
                    <Medal className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold text-sm mb-1">{globalRanking[1].profiles?.name}</p>
                    <p className="text-2xl font-bold">{globalRanking[1].xp_total}</p>
                    <p className="text-xs opacity-90">XP</p>
                  </div>
                </motion.div>
              )}

              {/* 1º Lugar */}
              {globalRanking[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center"
                >
                  <Avatar className="w-24 h-24 ring-4 ring-yellow-400 mb-2">
                    <AvatarImage src={globalRanking[0].profiles?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white text-2xl">
                      {globalRanking[0].profiles?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white px-6 py-12 rounded-t-lg text-center min-w-[140px]">
                    <Crown className="w-10 h-10 mx-auto mb-2" />
                    <p className="font-bold mb-1">{globalRanking[0].profiles?.name}</p>
                    <p className="text-3xl font-bold">{globalRanking[0].xp_total}</p>
                    <p className="text-sm opacity-90">XP</p>
                  </div>
                </motion.div>
              )}

              {/* 3º Lugar */}
              {globalRanking[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <Avatar className="w-18 h-18 ring-4 ring-amber-500 mb-2">
                    <AvatarImage src={globalRanking[2].profiles?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-lg">
                      {globalRanking[2].profiles?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white px-6 py-6 rounded-t-lg text-center min-w-[110px]">
                    <Medal className="w-7 h-7 mx-auto mb-2" />
                    <p className="font-bold text-sm mb-1">{globalRanking[2].profiles?.name}</p>
                    <p className="text-xl font-bold">{globalRanking[2].xp_total}</p>
                    <p className="text-xs opacity-90">XP</p>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SchoolRankingPage;
