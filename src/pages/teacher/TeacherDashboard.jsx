import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock,
  TrendingUp,
  AlertCircle,
  Calendar,
  MessageSquare,
  Target,
  Award,
  FileText,
  BarChart3,
  Plus,
  ArrowRight,
  Video,
  Bell,
  Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PremiumCard, StatsCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalActivities: 0,
    pendingCorrections: 0,
    avgClassSize: 0
  });
  const [recentClasses, setRecentClasses] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar turmas do professor
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id, name, subject, color, created_at')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (classesError) throw classesError;

      // Buscar alunos
      let totalStudents = 0;
      if (classes && classes.length > 0) {
        const classIds = classes.map(c => c.id);
        const { count } = await supabase
          .from('class_members')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds)
          .eq('role', 'student');
        totalStudents = count || 0;
      }

      // Buscar atividades
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('id, title, due_date, status, class_id')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (activitiesError) throw activitiesError;

      // Buscar submissões pendentes de correção
      const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select(`
          id,
          submitted_at,
          student_id,
          activity_id,
          status,
          activities(id, title),
          student:profiles!submissions_student_id_fkey(full_name, email)
        `)
        .is('grade', null)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: true })
        .limit(10);

      if (submissionsError) throw submissionsError;

      setStats({
        totalClasses: classes?.length || 0,
        totalStudents,
        totalActivities: activities?.length || 0,
        pendingCorrections: submissions?.length || 0,
        avgClassSize: classes?.length > 0 ? Math.round(totalStudents / classes.length) : 0
      });

      setRecentClasses(classes?.slice(0, 4) || []);
      setRecentActivities(activities || []);
      setPendingSubmissions(submissions?.slice(0, 5) || []);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando seu painel..." />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Animado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-8 text-white"
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
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">Painel do Professor</span>
            </motion.div>
            <h1 className="text-4xl font-bold mb-2">
              Olá, Prof. {user?.user_metadata?.name?.split(' ')[0] || 'Professor'}! 👨‍🏫
            </h1>
            <p className="text-white/90 text-lg">
              Gerencie suas turmas, atividades e acompanhe o progresso dos alunos
            </p>
          </div>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.3 }}
          >
            <PremiumButton 
              variant="outline" 
              leftIcon={Plus}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 whitespace-nowrap inline-flex items-center gap-2 font-semibold shadow-lg"
              onClick={() => navigate('/dashboard/teacher/activities/new')}
            >
              Nova Atividade
            </PremiumButton>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-20 right-32 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl"
        />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            title: "Turmas",
            value: stats.totalClasses,
            icon: Users,
            gradient: "from-blue-500 to-cyan-500",
            action: () => navigate('/dashboard/teacher/classes')
          },
          {
            title: "Alunos",
            value: stats.totalStudents,
            icon: Users,
            gradient: "from-green-500 to-emerald-500"
          },
          {
            title: "Atividades",
            value: stats.totalActivities,
            icon: FileText,
            gradient: "from-purple-500 to-pink-500",
            action: () => navigate('/dashboard/teacher/activities')
          },
          {
            title: "Para Corrigir",
            value: stats.pendingCorrections,
            icon: Clock,
            gradient: "from-orange-500 to-red-500",
            urgent: stats.pendingCorrections > 0
          },
          {
            title: "Média/Turma",
            value: stats.avgClassSize,
            icon: Target,
            gradient: "from-indigo-500 to-purple-500"
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={stat.action}
            className={stat.action ? 'cursor-pointer' : ''}
          >
            <PremiumCard 
              variant="elevated" 
              className={`relative overflow-hidden group hover:scale-105 transition-transform ${
                stat.urgent ? 'border-2 border-orange-300 dark:border-orange-700' : ''
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  {stat.urgent && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    </motion.div>
                  )}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </div>
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Turmas Recentes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PremiumCard variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold mb-1">Minhas Turmas</h3>
                <p className="text-sm text-muted-foreground">Acesso rápido às suas turmas</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {recentClasses.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nenhuma turma criada"
                description="Crie sua primeira turma para começar"
              />
            ) : (
              <div className="space-y-3">
                {recentClasses.map((classItem, index) => (
                  <motion.div
                    key={classItem.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/dashboard/teacher/classes/${classItem.id}`)}
                    className="group flex items-center justify-between p-4 border-2 border-border rounded-xl hover:border-primary/50 hover:bg-gradient-to-r hover:from-muted/50 hover:to-transparent transition-all cursor-pointer hover:scale-105"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                          classItem.color || 'from-blue-500 to-cyan-500'
                        } flex items-center justify-center text-white font-bold text-lg`}
                      >
                        {classItem.name?.charAt(0) || 'T'}
                      </div>
                      <div>
                        <h4 className="font-semibold group-hover:text-primary transition-colors">
                          {classItem.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{classItem.subject}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </motion.div>
                ))}
              </div>
            )}

            {recentClasses.length > 0 && (
              <PremiumButton
                variant="outline"
                className="w-full mt-4 whitespace-nowrap inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border"
                onClick={() => navigate('/dashboard/teacher/classes')}
              >
                Ver Todas as Turmas
              </PremiumButton>
            )}
          </PremiumCard>
        </motion.div>

        {/* Correções Pendentes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <PremiumCard variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold mb-1">Para Corrigir</h3>
                <p className="text-sm text-muted-foreground">Submissões aguardando correção</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {pendingSubmissions.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="Tudo corrigido!"
                description="Nenhuma submissão pendente no momento"
              />
            ) : (
              <div className="space-y-3">
                {pendingSubmissions.map((submission, index) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/dashboard/teacher/activities/${submission.activity_id}`)}
                    className="group flex items-center justify-between p-4 border-2 border-orange-200 dark:border-orange-900 rounded-xl hover:border-orange-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent dark:hover:from-orange-900/20 transition-all cursor-pointer"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                        {submission.activities?.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>👤 {submission.student?.name}</span>
                        <span>•</span>
                        <span>📚 {submission.activities?.classes?.name}</span>
                        <span>•</span>
                        <span>📅 {new Date(submission.submitted_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-orange-600 group-hover:translate-x-1 transition-all" />
                  </motion.div>
                ))}
              </div>
            )}
          </PremiumCard>
        </motion.div>
      </div>

      {/* Daily Overview */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Correções do Dia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <PremiumCard variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold mb-1">Correções do Dia</h3>
                <p className="text-sm text-muted-foreground">Atividades para corrigir hoje</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-3">
              {pendingSubmissions.slice(0, 3).map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/submissions/${submission.id}`)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm truncate">
                      {submission.activities?.title || 'Atividade'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {submission.student?.name || 'Aluno'}
                    </p>
                  </div>
                  <div className="text-xs text-orange-600 font-medium">
                    {new Date(submission.submitted_at).toLocaleDateString('pt-BR')}
                  </div>
                </motion.div>
              ))}
              
              {pendingSubmissions.length === 0 && (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma correção pendente!</p>
                </div>
              )}
            </div>
          </PremiumCard>
        </motion.div>

        {/* Eventos do Dia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <PremiumCard variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold mb-1">Eventos do Dia</h3>
                <p className="text-sm text-muted-foreground">Agenda de hoje</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-3">
              {/* Mock data - substituir por dados reais */}
              {[
                { id: 1, title: 'Aula de Matemática 9A', time: '08:00', type: 'aula' },
                { id: 2, title: 'Reunião de Pais', time: '14:00', type: 'reuniao' },
                { id: 3, title: 'Entrega de Notas', time: '16:30', type: 'prazo' }
              ].map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-3 h-3 rounded-full ${
                    event.type === 'aula' ? 'bg-blue-500' :
                    event.type === 'reuniao' ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </PremiumCard>
        </motion.div>

        {/* Alunos Precisando de Atenção */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <PremiumCard variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold mb-1">Alunos em Alerta</h3>
                <p className="text-sm text-muted-foreground">Precisam de atenção</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 text-white">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-3">
              {/* Mock data - substituir por dados reais */}
              {[
                { id: 1, name: 'Ana Silva', issue: 'Baixa frequência', severity: 'high' },
                { id: 2, name: 'João Santos', issue: 'Notas abaixo da média', severity: 'medium' },
                { id: 3, name: 'Maria Costa', issue: 'Atividades em atraso', severity: 'medium' }
              ].map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/students/${student.id}`)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.issue}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    student.severity === 'high' ? 'bg-red-500' : 'bg-orange-500'
                  }`} />
                </motion.div>
              ))}
            </div>
          </PremiumCard>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <PremiumCard variant="elevated" className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Ações Rápidas</h2>
            <p className="text-muted-foreground">Acesso rápido às principais funcionalidades</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Plus, 
                label: 'Nova Turma', 
                path: '/dashboard/classes/create', 
                gradient: 'from-blue-500 to-cyan-500',
                description: 'Criar nova turma',
                indicator: null
              },
              { 
                icon: FileText, 
                label: 'Nova Atividade', 
                path: '/dashboard/activities/new', 
                gradient: 'from-purple-500 to-pink-500',
                description: 'Criar atividade',
                indicator: null
              },
              { 
                icon: Video, 
                label: 'Reuniões Hoje', 
                path: '/dashboard/calendar', 
                gradient: 'from-green-500 to-emerald-500',
                description: 'Agendar reunião',
                indicator: 2 // Exemplo: 2 reuniões hoje
              },
              { 
                icon: Clock, 
                label: 'Para Corrigir', 
                path: '/dashboard/corrections', 
                gradient: 'from-orange-500 to-red-500',
                description: 'Atividades pendentes',
                indicator: stats.pendingCorrections,
                urgent: stats.pendingCorrections > 0
              },
              { 
                icon: Bell, 
                label: 'Alunos em Alerta', 
                path: '/dashboard/students', 
                gradient: 'from-red-500 to-pink-500',
                description: 'Precisam atenção',
                indicator: 3 // Exemplo: 3 alunos em alerta
              },
              { 
                icon: BarChart3, 
                label: 'Analytics', 
                path: '/dashboard/analytics', 
                gradient: 'from-indigo-500 to-purple-500',
                description: 'Ver relatórios',
                indicator: null
              },
              { 
                icon: Calendar, 
                label: 'Agenda', 
                path: '/dashboard/calendar', 
                gradient: 'from-teal-500 to-cyan-500',
                description: 'Ver calendário',
                indicator: null
              },
              { 
                icon: Activity, 
                label: 'Atividade Turma', 
                path: '/dashboard/live-activity', 
                gradient: 'from-yellow-500 to-orange-500',
                description: 'Monitorar em tempo real',
                indicator: null
              }
            ].map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className="cursor-pointer group"
              >
                <div className={`relative p-6 rounded-2xl border-2 border-border hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg ${
                  action.urgent ? 'border-orange-300 dark:border-orange-700 animate-pulse' : ''
                }`}>
                  {/* Indicator Badge */}
                  {action.indicator !== null && action.indicator > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg z-10"
                    >
                      {action.indicator > 99 ? '99+' : action.indicator}
                    </motion.div>
                  )}
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300 p-3`}>
                    <action.icon className="w-8 h-8" />
                  </div>
                  
                  {/* Content */}
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                </div>
              </motion.div>
            ))}
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  );
};

export default TeacherDashboard;
