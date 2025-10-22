import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  MessageSquare,
  Plus,
  ArrowUpRight,
  Target,
  Zap,
  Brain,
  CheckCircle,
  AlertCircle,
  Play,
  Users,
  BarChart3
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUserClasses } from '@/hooks/useRedisCache';
import { supabase } from '@/lib/supabaseClient';
import { Logger } from '@/services/logger';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [studentStats, setStudentStats] = useState({
    enrolledClasses: 0,
    activeActivities: 0,
    completedActivities: 0,
    overallProgress: 0,
    currentGrade: 0,
    pendingAssignments: 0,
    upcomingDeadlines: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use Redis cache for student's classes
  const { data: studentClasses, loading: classesLoading } = useUserClasses(user?.id, 'student');

  useEffect(() => {
    const loadStudentData = async () => {
      if (!user?.id || !studentClasses) return;

      try {
        setLoading(true);

        // Get activities from all enrolled classes
        const { data: activityAssignments, error: activitiesError } = await supabase
          .from('activity_class_assignments')
          .select(`
            activity_id,
            class_id,
            activities!inner(
              id,
              title,
              activity_type,
              due_date,
              max_score,
              created_at,
              status
            ),
            classes!inner(name)
          `)
          .in('class_id', studentClasses.map(cls => cls.id))
          .eq('activities.status', 'published')
          .order('created_at', { ascending: false });

        if (activitiesError) {
          Logger.error('Error fetching student activities:', activitiesError);
        }

        // Transform activities data
        const activities = activityAssignments?.map(assignment => ({
          id: assignment.activities.id,
          title: assignment.activities.title,
          type: assignment.activities.activity_type,
          due_date: assignment.activities.due_date,
          max_score: assignment.activities.max_score,
          created_at: assignment.activities.created_at,
          class_id: assignment.class_id,
          classes: { name: assignment.classes.name }
        })) || [];

        // Buscar submissões do aluno
        const { data: submissions, error: submissionsError } = await supabase
          .from('submissions')
          .select(`
            *,
            activity_id,
            status,
            grade,
            submitted_at,
            activities(
              id,
              title,
              classes(name)
            )
          `)
          .eq('student_id', user.id)
          .order('submitted_at', { ascending: false });

        if (submissionsError) {
          Logger.error('Error fetching student submissions:', submissionsError);
        }

        // Calculate stats
        const enrolledClasses = studentClasses.length;
        const activeActivities = activities?.length || 0;
        const completedActivities = submissions?.filter(s => s.status === 'graded').length || 0;
        const overallProgress = activeActivities > 0 ? Math.round((completedActivities / activeActivities) * 100) : 0;
        const currentGrade = submissions?.filter(s => s.grade !== null).length > 0
          ? Math.round(submissions.filter(s => s.grade !== null).reduce((sum, s) => sum + (s.grade || 0), 0) / submissions.filter(s => s.grade !== null).length)
          : 0;

        // Get pending assignments (activities without submissions)
        const submittedActivityIds = submissions?.map(s => s.activity_id) || [];
        const pendingAssignments = activities?.filter(a => !submittedActivityIds.includes(a.id)).length || 0;

        // Get upcoming deadlines (next 7 days)
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        const upcoming = activities?.filter(a =>
          a.due_date &&
          new Date(a.due_date) >= now &&
          new Date(a.due_date) <= nextWeek
        ).slice(0, 3) || [];

        setStudentStats({
          enrolledClasses,
          activeActivities,
          completedActivities,
          overallProgress,
          currentGrade,
          pendingAssignments,
          upcomingDeadlines: upcoming.length
        });

        // Format upcoming deadlines
        const formattedDeadlines = upcoming.map(activity => ({
          id: activity.id,
          title: activity.title,
          class: activity.classes?.name,
          date: new Date(activity.due_date).toLocaleDateString('pt-BR'),
          daysLeft: Math.ceil((new Date(activity.due_date) - now) / (1000 * 60 * 60 * 24)),
          priority: Math.ceil((new Date(activity.due_date) - now) / (1000 * 60 * 60 * 24)) <= 2 ? 'high' : 'medium'
        }));

        setRecentActivities(formattedActivities);

        // Format recent activities (recent submissions)
        const formattedActivities = submissions?.slice(0, 5).map(submission => ({
          id: submission.id,
          type: submission.status === 'graded' ? 'graded' : 'submitted',
          title: submission.activities?.title || 'Atividade',
          description: `Turma: ${submission.activities?.classes?.name}`,
          time: submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'Data não disponível',
          icon: submission.status === 'graded' ? Award : FileText,
          color: submission.status === 'graded' ? (submission.grade >= 7 ? 'green' : 'orange') : 'blue',
          grade: submission.grade,
          status: submission.status
        })) || [];

        setUpcomingDeadlines(formattedDeadlines);
      } catch (error) {
        Logger.error('Error loading student dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [user?.id, studentClasses]);

  const stats = [
    {
      icon: BookOpen,
      label: 'Turmas Inscritas',
      value: studentStats.enrolledClasses.toString(),
      change: '+1',
      changeType: 'positive',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FileText,
      label: 'Atividades Ativas',
      value: studentStats.activeActivities.toString(),
      change: '+3',
      changeType: 'positive',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: CheckCircle,
      label: 'Atividades Concluídas',
      value: studentStats.completedActivities.toString(),
      change: '+2',
      changeType: 'positive',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: TrendingUp,
      label: 'Progresso Geral',
      value: `${studentStats.overallProgress}%`,
      change: '+5%',
      changeType: 'positive',
      gradient: 'from-orange-500 to-red-500'
    },
  ];

  const quickActions = [
    {
      icon: BookOpen,
      label: 'Ver Atividades',
      description: 'Acessar atividades das turmas',
      gradient: 'from-blue-500 to-cyan-500',
      action: () => navigate('/dashboard/activities')
    },
    {
      icon: Brain,
      label: 'Chatbot IA',
      description: 'Tirar dúvidas com IA',
      gradient: 'from-green-500 to-emerald-500',
      action: () => navigate('/dashboard/chatbot')
    },
    {
      icon: Calendar,
      label: 'Agenda',
      description: 'Ver prazos e eventos',
      gradient: 'from-purple-500 to-pink-500',
      action: () => navigate('/dashboard/calendar')
    },
    {
      icon: BarChart3,
      label: 'Meu Desempenho',
      description: 'Ver notas e estatísticas',
      gradient: 'from-orange-500 to-red-500',
      action: () => navigate('/dashboard/performance')
    },
  ];

  if (loading || classesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-muted-foreground">Carregando dados do aluno...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 rounded-3xl p-8 text-white"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                Bem-vindo, {user?.user_metadata?.full_name || 'Aluno'}! 🎓
              </h1>
              <p className="text-green-100 text-lg max-w-2xl">
                Continue sua jornada de aprendizado! Aqui você pode acessar suas atividades,
                acompanhar seu progresso e interagir com seus professores.
              </p>
              {studentStats.currentGrade > 0 && (
                <div className="mt-4 flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-sm text-green-100">Média Atual</span>
                    <div className="text-2xl font-bold">{studentStats.currentGrade.toFixed(1)}</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-sm text-green-100">Progresso</span>
                    <div className="text-2xl font-bold">{studentStats.overallProgress}%</div>
                  </div>
                </div>
              )}
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Brain className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl"></div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group"
          >
            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                    stat.changeType === 'positive'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</h3>
                <p className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Minhas Submissões</CardTitle>
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => navigate('/dashboard/activities')}
                >
                  Ver todas
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/dashboard/activities/${activity.id}`)}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${
                        activity.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                        activity.color === 'green' ? 'from-green-500 to-emerald-500' :
                        activity.color === 'purple' ? 'from-purple-500 to-pink-500' :
                        'from-orange-500 to-red-500'
                      } rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <activity.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {activity.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{activity.description}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-gray-400 text-xs">{activity.time}</p>
                          {activity.grade !== null && (
                            <Badge variant={activity.grade >= 7 ? 'default' : 'destructive'}>
                              Nota: {activity.grade.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma submissão encontrada</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate('/dashboard/activities')}
                    >
                      Ver Atividades Disponíveis
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Próximos Prazos</CardTitle>
                <Calendar className="w-6 h-6 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDeadlines.length > 0 ? (
                  upcomingDeadlines.map((deadline, index) => (
                    <motion.div
                      key={deadline.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => navigate(`/dashboard/activities/${deadline.id}`)}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {deadline.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Turma: {deadline.class}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                          deadline.daysLeft <= 2 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                          deadline.daysLeft <= 5 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                          'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        }`}>
                          {deadline.daysLeft} dias
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{deadline.date}</div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum prazo próximo</p>
                    <p className="text-sm mt-2">Todas as suas atividades estão em dia! 🎉</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pending Assignments Alert */}
      {studentStats.pendingAssignments > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                      Atividades Pendentes
                    </h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Você tem {studentStats.pendingAssignments} atividade(s) para entregar
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/30"
                  onClick={() => navigate('/dashboard/activities')}
                >
                  Ver Atividades
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Atividades Concluídas
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {studentStats.completedActivities} de {studentStats.activeActivities}
                  </span>
                </div>
                <Progress value={studentStats.overallProgress} className="h-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {studentStats.enrolledClasses}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Turmas Inscritas
                  </div>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {studentStats.pendingAssignments}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Pendentes
                  </div>
                </div>

                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {studentStats.currentGrade.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Média Atual
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-muted/30 transition-all transform hover:-translate-y-1"
                  onClick={action.action}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${action.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{action.description}</p>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;

