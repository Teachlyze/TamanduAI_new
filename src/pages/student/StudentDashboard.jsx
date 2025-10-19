import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Download,
  Target,
  Zap,
  Star,
  FileText,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useXP } from '@/contexts/XPContext';
import { PremiumCard, StatsCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { totalXP, level, currentLevelXP, nextLevelXP, loading: xpLoading } = useXP();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageGrade: 0,
    totalActivities: 0,
    completedActivities: 0,
    pendingActivities: 0
  });
  const [gradesBySubject, setGradesBySubject] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [upcomingActivities, setUpcomingActivities] = useState([]);

  useEffect(() => {
    if (user) {
      loadStudentData();
    }
  }, [user]);

  const loadStudentData = async () => {
    try {
      setLoading(true);

      // Buscar submissões do aluno
      const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select(`
          *,
          activities(
            id,
            title,
            max_score,
            due_date,
            activity_class_assignments(
              class_id,
              classes(name, subject)
            )
          )
        `)
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false });

      if (submissionsError) throw submissionsError;

      // Calcular estatísticas
      const graded = submissions?.filter(s => s.grade !== null) || [];
      const avgGrade = graded.length > 0
        ? graded.reduce((sum, s) => sum + s.grade, 0) / graded.length
        : 0;

      setStats({
        averageGrade: avgGrade,
        totalActivities: submissions?.length || 0,
        completedActivities: graded.length,
        pendingActivities: (submissions?.length || 0) - graded.length
      });

      // Notas recentes
      setRecentGrades(graded.slice(0, 10));

      // Agrupar por disciplina
      const bySubject = {};
      graded.forEach(sub => {
        const subject = sub.activity?.class?.subject || 'Outros';
        if (!bySubject[subject]) {
          bySubject[subject] = { grades: [], subject };
        }
        bySubject[subject].grades.push(sub.grade);
      });

      const subjectStats = Object.values(bySubject).map(s => ({
        subject: s.subject,
        average: s.grades.reduce((sum, g) => sum + g, 0) / s.grades.length,
        count: s.grades.length
      })).sort((a, b) => b.average - a.average);

      setGradesBySubject(subjectStats);

      // Buscar atividades próximas
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('activities')
        .select(`
          *,
          class:classes(name, subject)
        `)
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(5);

      if (upcomingError) throw upcomingError;
      setUpcomingActivities(upcomingData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 7) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (grade >= 5) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  if (loading) {
    return <LoadingScreen message="Carregando seu desempenho..." />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Animado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 text-white"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard do Aluno</span>
            </motion.div>
            <h1 className="text-4xl font-bold mb-2">Olá, {user?.user_metadata?.name?.split(' ')[0] || 'Estudante'}! 👋</h1>
            <p className="text-white/90 text-lg">Acompanhe seu desempenho e continue evoluindo</p>
          </div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-20 right-32 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl"
        />
        <motion.div
          animate={{ 
            y: [0, 10, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          className="absolute bottom-10 right-20 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full"
        />
      </motion.div>

      {/* Stats com Animação */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Nível",
            value: xpLoading ? '...' : level,
            change: xpLoading ? 'Carregando...' : `${totalXP} XP total`,
            icon: Star,
            trend: "up",
            color: 'from-yellow-500 to-orange-500',
            progress: xpLoading ? 0 : (currentLevelXP / nextLevelXP) * 100,
            progressLabel: xpLoading ? '' : `${currentLevelXP}/${nextLevelXP} XP`
          },
          {
            title: "Média Geral",
            value: stats.averageGrade.toFixed(1),
            change: stats.averageGrade >= 7 ? 'Excelente! 🎉' : stats.averageGrade >= 5 ? 'Bom trabalho!' : 'Vamos melhorar!',
            icon: Award,
            trend: stats.averageGrade >= 7 ? 'up' : stats.averageGrade >= 5 ? 'neutral' : 'down',
            color: stats.averageGrade >= 7 ? 'from-green-500 to-emerald-500' : stats.averageGrade >= 5 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-pink-500'
          },
          {
            title: "Atividades Concluídas",
            value: stats.completedActivities,
            change: `${stats.totalActivities} total`,
            icon: CheckCircle,
            trend: "up",
            color: 'from-blue-500 to-cyan-500'
          },
          {
            title: "Aguardando Correção",
            value: stats.pendingActivities,
            change: stats.pendingActivities > 0 ? 'Aguarde o professor' : 'Tudo corrigido! ✓',
            icon: Clock,
            trend: stats.pendingActivities > 0 ? 'warning' : 'neutral',
            color: 'from-purple-500 to-indigo-500'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PremiumCard variant="elevated" className="relative overflow-hidden group hover:scale-105 transition-transform duration-300 h-full">
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              
              <div className="relative p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  {stat.trend === 'up' && (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground mb-2">{stat.title}</div>
                <div className="text-xs font-medium text-primary">{stat.change}</div>
                
                {/* XP Progress Bar */}
                {stat.progress !== undefined && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Progresso</span>
                      <span className="text-xs font-medium">{stat.progressLabel}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notas por Disciplina com Badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PremiumCard variant="elevated" className="p-6 relative overflow-hidden">
            {/* Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-1">Desempenho por Disciplina</h3>
                  <p className="text-sm text-muted-foreground">Suas médias por matéria</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
          
          {gradesBySubject.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Nenhuma nota ainda"
              description="Suas notas aparecerão aqui"
            />
          ) : (
            <div className="space-y-4">
              {gradesBySubject.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        item.average >= 7 ? 'bg-green-500' : item.average >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium">{item.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getGradeColor(item.average)}`}>
                        {item.average.toFixed(1)}
                      </span>
                      {item.average >= 7 && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.average / 10) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1, type: "spring" }}
                      className={`h-full rounded-full bg-gradient-to-r ${
                        item.average >= 7 ? 'from-green-500 to-emerald-500' : 
                        item.average >= 5 ? 'from-yellow-500 to-orange-500' : 
                        'from-red-500 to-pink-500'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.count} avaliações</span>
                    <span>{((item.average / 10) * 100).toFixed(0)}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
            </div>
          </PremiumCard>
        </motion.div>

        {/* Atividades Próximas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PremiumCard variant="elevated" className="p-6 relative overflow-hidden">
            {/* Decorative Element */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-1">Próximas Entregas</h3>
                  <p className="text-sm text-muted-foreground">Fique atento aos prazos</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
          
          {upcomingActivities.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="Nada pendente"
              description="Você está em dia com as atividades"
            />
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
              {upcomingActivities.map((activity, index) => {
                const daysUntil = Math.ceil((new Date(activity.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysUntil <= 2;
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group relative p-4 border-2 rounded-xl transition-all hover:scale-105 hover:shadow-lg ${
                      isUrgent 
                        ? 'border-orange-300 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30' 
                        : 'border-border hover:border-primary/50 bg-background'
                    }`}
                  >
                    {/* Glow Effect */}
                    {isUrgent && (
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur opacity-50" />
                    )}
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-primary" />
                            <h4 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                              {activity.title}
                            </h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{activity.class?.name}</p>
                        </div>
                        {isUrgent && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                          </motion.div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          📅 {new Date(activity.due_date).toLocaleDateString('pt-BR')}
                        </span>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isUrgent 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {daysUntil === 0 ? '⏰ Hoje!' : daysUntil === 1 ? '⚡ Amanhã' : `🗓️ ${daysUntil} dias`}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </div>
          )}
            </div>
          </PremiumCard>
        </motion.div>
      </div>

      {/* Notas Recentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <PremiumCard variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Notas Recentes</h3>
              <p className="text-sm text-muted-foreground">Acompanhe seu histórico de avaliações</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <Award className="w-5 h-5" />
            </div>
          </div>
        
        {recentGrades.length === 0 ? (
          <EmptyState
            icon={Award}
            title="Nenhuma nota ainda"
            description="Suas notas aparecerão aqui após a correção"
          />
        ) : (
          <div className="space-y-3">
            {recentGrades.map((submission, index) => (
              <motion.div 
                key={submission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex items-center justify-between p-4 border-2 border-border rounded-xl hover:border-primary/50 hover:bg-gradient-to-r hover:from-muted/50 hover:to-transparent transition-all hover:scale-105 hover:shadow-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${
                      submission.grade >= 7 ? 'from-green-500 to-emerald-500' :
                      submission.grade >= 5 ? 'from-yellow-500 to-orange-500' :
                      'from-red-500 to-pink-500'
                    } text-white`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold group-hover:text-primary transition-colors">
                        {submission.activity?.title || 'Atividade'}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>📚 {submission.activity?.class?.name}</span>
                        <span>•</span>
                        <span>📅 {new Date(submission.graded_at || submission.submitted_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  {submission.feedback && (
                    <div className="mt-2 p-2 rounded-lg bg-muted/50 border-l-4 border-primary">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        💬 <span className="font-medium">Feedback:</span> {submission.feedback}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${
                      submission.grade >= 7 ? 'from-green-500 to-emerald-500' :
                      submission.grade >= 5 ? 'from-yellow-500 to-orange-500' :
                      'from-red-500 to-pink-500'
                    } flex items-center justify-center text-white shadow-lg`}
                  >
                    <div className="text-center">
                      <p className="text-3xl font-bold">{submission.grade}</p>
                      <p className="text-xs opacity-90">/{submission.activity?.max_score || 10}</p>
                    </div>
                    {submission.grade >= 7 && (
                      <Star className="absolute -top-1 -right-1 w-6 h-6 fill-yellow-400 text-yellow-400" />
                    )}
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Ver detalhes <ArrowRight className="w-3 h-3" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </PremiumCard>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
