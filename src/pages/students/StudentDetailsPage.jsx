import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Edit2,
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PremiumCard, StatsCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import toast from 'react-hot-toast';

const StudentDetailsPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [performance, setPerformance] = useState({
    averageGrade: 0,
    totalActivities: 0,
    completedActivities: 0,
    pendingActivities: 0,
    attendanceRate: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (studentId && user) {
      loadStudentData();
    }
  }, [studentId, user]);

  const loadStudentData = async () => {
    try {
      setLoading(true);

      // Buscar dados do aluno
      const { data: studentData, error: studentError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;
      setStudent(studentData);

      // Buscar turmas matriculadas
      const { data: classesData, error: classesError } = await supabase
        .from('class_members')
        .select(`
          *,
          class:classes(id, name, subject)
        `)
        .eq('user_id', studentId)
        .eq('role', 'student');

      if (classesError) throw classesError;
      setEnrolledClasses(classesData || []);

      // Buscar submissões
      const { data: submissionsData, error: submissionsError } = await supabase
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
              classes(name)
            )
          )
        `)
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false })
        .limit(10);

      if (submissionsError) throw submissionsError;
      setRecentSubmissions(submissionsData || []);

      // Calcular performance
      const grades = submissionsData?.filter(s => s.grade !== null).map(s => s.grade) || [];
      const avgGrade = grades.length > 0 ? grades.reduce((sum, g) => sum + g, 0) / grades.length : 0;

      setPerformance({
        averageGrade: avgGrade,
        totalActivities: submissionsData?.length || 0,
        completedActivities: submissionsData?.filter(s => s.grade !== null).length || 0,
        pendingActivities: submissionsData?.filter(s => s.grade === null).length || 0,
        attendanceRate: 85 // Exemplo - implementar lógica real
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do aluno');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    toast.success('Funcionalidade de mensagem será implementada');
  };

  if (loading) {
    return <LoadingScreen message="Carregando dados do aluno..." />;
  }

  if (!student) {
    return (
      <div className="p-8 text-center">
        <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-bold mb-2">Aluno não encontrado</h2>
        <PremiumButton onClick={() => navigate('/dashboard/students')}>
          Voltar para Alunos
        </PremiumButton>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Alunos', path: '/dashboard/students' },
    { label: student.full_name || student.email, path: `/dashboard/students/${studentId}` }
  ];

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
    { id: 'activities', label: 'Atividades', icon: BookOpen },
    { id: 'grades', label: 'Notas', icon: Award },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10">
          <button
            onClick={() => navigate('/dashboard/students')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Alunos
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                {student.full_name?.charAt(0) || student.email?.charAt(0) || 'A'}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{student.full_name || 'Nome não disponível'}</h1>
                <div className="space-y-1 text-white/90">
                  {student.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {student.email}
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {student.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <PremiumButton
                variant="outline"
                size="sm"
                leftIcon={MessageSquare}
                onClick={sendMessage}
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                Enviar Mensagem
              </PremiumButton>
              <PremiumButton
                variant="outline"
                size="sm"
                leftIcon={Edit2}
                onClick={() => navigate(`/dashboard/students/${studentId}/edit`)}
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                Editar Perfil
              </PremiumButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Média Geral"
          value={performance.averageGrade.toFixed(1)}
          change={performance.averageGrade >= 7 ? 'Excelente' : 'Bom desempenho'}
          icon={Award}
          trend={performance.averageGrade >= 7 ? 'up' : 'neutral'}
        />
        <StatsCard
          title="Atividades Concluídas"
          value={performance.completedActivities}
          change={`${performance.totalActivities} total`}
          icon={CheckCircle}
          trend="up"
        />
        <StatsCard
          title="Atividades Pendentes"
          value={performance.pendingActivities}
          change={performance.pendingActivities > 0 ? 'Aguardando correção' : 'Em dia'}
          icon={Clock}
          trend={performance.pendingActivities > 0 ? 'warning' : 'neutral'}
        />
        <StatsCard
          title="Taxa de Presença"
          value={`${performance.attendanceRate}%`}
          change={performance.attendanceRate >= 80 ? 'Ótimo' : 'Melhorar'}
          icon={Calendar}
          trend={performance.attendanceRate >= 80 ? 'up' : 'down'}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PremiumCard variant="elevated" className="p-6">
              <h3 className="text-xl font-bold mb-4">Turmas Matriculadas</h3>
              {enrolledClasses.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma turma matriculada
                </p>
              ) : (
                <div className="space-y-3">
                  {enrolledClasses.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/dashboard/classes/${enrollment.class.id}`)}
                    >
                      <h4 className="font-medium">{enrollment.class.name}</h4>
                      {enrollment.class.subject && (
                        <p className="text-sm text-muted-foreground">{enrollment.class.subject}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Matriculado em {new Date(enrollment.joined_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </PremiumCard>

            <PremiumCard variant="elevated" className="p-6">
              <h3 className="text-xl font-bold mb-4">Desempenho Recente</h3>
              <div className="space-y-4">
                {recentSubmissions.slice(0, 5).map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-1">
                        {submission.activity?.title || 'Atividade'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(submission.submitted_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.grade !== null ? (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-bold">
                          {submission.grade}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs">
                          Pendente
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {recentSubmissions.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma submissão recente
                  </p>
                )}
              </div>
            </PremiumCard>
          </div>
        )}

        {activeTab === 'activities' && (
          <PremiumCard variant="elevated" className="p-6">
            <h3 className="text-xl font-bold mb-4">Todas as Atividades</h3>
            <div className="space-y-3">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{submission.activity?.title || 'Atividade'}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(submission.submitted_at).toLocaleDateString('pt-BR')}
                        </span>
                        {submission.activity?.due_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Prazo: {new Date(submission.activity.due_date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {submission.grade !== null ? (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {submission.grade}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            de {submission.activity?.max_score || 10}
                          </p>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs">
                          Aguardando correção
                        </span>
                      )}
                    </div>
                  </div>
                  {submission.feedback && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium mb-1">Feedback do Professor:</p>
                      <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
              {recentSubmissions.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma atividade encontrada
                </p>
              )}
            </div>
          </PremiumCard>
        )}

        {activeTab === 'grades' && (
          <PremiumCard variant="elevated" className="p-6">
            <h3 className="text-xl font-bold mb-4">Histórico de Notas</h3>
            <div className="space-y-2">
              {recentSubmissions.filter(s => s.grade !== null).map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-3 border-b border-border last:border-0">
                  <span className="font-medium">{submission.activity?.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{submission.grade}</span>
                    <span className="text-sm text-muted-foreground">/ {submission.activity?.max_score || 10}</span>
                  </div>
                </div>
              ))}
              {recentSubmissions.filter(s => s.grade !== null).length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma nota disponível
                </p>
              )}
            </div>
          </PremiumCard>
        )}

        {activeTab === 'feedback' && (
          <PremiumCard variant="elevated" className="p-6">
            <h3 className="text-xl font-bold mb-4">Feedbacks Recebidos</h3>
            <div className="space-y-4">
              {recentSubmissions.filter(s => s.feedback).map((submission) => (
                <div key={submission.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{submission.activity?.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(submission.graded_at || submission.submitted_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {submission.feedback}
                  </p>
                </div>
              ))}
              {recentSubmissions.filter(s => s.feedback).length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum feedback disponível
                </p>
              )}
            </div>
          </PremiumCard>
        )}
      </motion.div>
    </div>
  );
};

export default StudentDetailsPage;
