import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  Settings,
  ArrowLeft,
  UserPlus,
  MoreVertical,
  Trash2,
  Edit2,
  Share2,
  Calendar,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PremiumCard, StatsCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Skeleton, SkeletonList } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';
import ClassInviteService from '@/services/classInviteService';

const ClassDetailsPagePremium = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (classId && user) {
      loadClassDetails();
    }
  }, [classId, user]);

  const loadClassDetails = async () => {
    try {
      setLoading(true);

      // Buscar dados da turma, alunos e atividades em paralelo
      const [classResult, studentsResult, activitiesResult] = await Promise.all([
        supabase
          .from('classes')
          .select('*')
          .eq('id', classId)
          .single(),
        
        supabase
          .from('class_members')
          .select(`
            *,
            user:profiles(id, full_name, email, avatar_url)
          `)
          .eq('class_id', classId)
          .eq('role', 'student'),
        
        supabase
          .from('activities')
          .select('*')
          .eq('class_id', classId)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (classResult.error) throw classResult.error;
      if (studentsResult.error) throw studentsResult.error;
      if (activitiesResult.error) throw activitiesResult.error;

      setClassData(classResult.data);
      setStudents(studentsResult.data || []);
      setActivities(activitiesResult.data || []);

    } catch (error) {
      console.error('Erro ao carregar detalhes da turma:', error);
      toast.error('Erro ao carregar turma');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = async () => {
    try {
      const invite = await ClassInviteService.createInvite(classId, {
        maxUses: 50,
        expiresInHours: 24 * 7 // 1 semana
      });

      const inviteLink = ClassInviteService.getInviteLink(invite.invitation_code);
      
      // Copiar para clipboard
      await navigator.clipboard.writeText(inviteLink);
      
      toast.success('Link de convite copiado!', {
        description: 'Compartilhe com seus alunos'
      });
    } catch (error) {
      console.error('Erro ao gerar convite:', error);
      toast.error('Erro ao gerar link de convite');
    }
  };

  const handleDeleteClass = async () => {
    if (!confirm('Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      toast.success('Turma excluída com sucesso');
      navigate('/dashboard/classes');
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      toast.error('Erro ao excluir turma');
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando turma..." />;
  }

  if (!classData) {
    return (
      <EmptyState
        icon={Users}
        title="Turma não encontrada"
        description="A turma que você está procurando não existe ou foi removida."
        actionLabel="Voltar para Turmas"
        onAction={() => navigate('/dashboard/classes')}
      />
    );
  }

  const breadcrumbItems = [
    { label: 'Turmas', path: '/dashboard/classes' },
    { label: classData.name, path: `/dashboard/classes/${classId}` }
  ];

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
    { id: 'students', label: 'Alunos', icon: Users, count: students.length },
    { id: 'activities', label: 'Atividades', icon: BookOpen, count: activities.length },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Breadcrumbs */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <button
                onClick={() => navigate('/dashboard/classes')}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para Turmas
              </button>
              
              <h1 className="text-4xl font-bold mb-2">{classData.name}</h1>
              {classData.description && (
                <p className="text-white/90 text-lg max-w-2xl">{classData.description}</p>
              )}
              {classData.subject && (
                <p className="text-white/70 mt-2">Disciplina: {classData.subject}</p>
              )}
            </div>

            {/* Menu de Ações */}
            <div className="flex gap-2">
              <PremiumButton
                variant="outline"
                size="sm"
                leftIcon={UserPlus}
                onClick={handleGenerateInvite}
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                Convidar Alunos
              </PremiumButton>
              
              <div className="relative group">
                <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-border">
                  <button
                    onClick={() => navigate(`/dashboard/classes/${classId}/edit`)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Editar Turma</span>
                  </button>
                  <button
                    onClick={handleGenerateInvite}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Compartilhar</span>
                  </button>
                  <div className="border-t border-border"></div>
                  <button
                    onClick={handleDeleteClass}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-destructive/10 text-destructive transition-colors rounded-b-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir Turma</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Alunos</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Atividades</p>
                  <p className="text-2xl font-bold">{activities.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Média</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Criada em</p>
                  <p className="text-sm font-medium">
                    {new Date(classData.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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
              {tab.count !== undefined && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-muted">
                  {tab.count}
                </span>
              )}
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
            <PremiumCard variant="elevated">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Informações da Turma</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Nome</label>
                    <p className="font-medium">{classData.name}</p>
                  </div>
                  {classData.description && (
                    <div>
                      <label className="text-sm text-muted-foreground">Descrição</label>
                      <p className="font-medium">{classData.description}</p>
                    </div>
                  )}
                  {classData.subject && (
                    <div>
                      <label className="text-sm text-muted-foreground">Disciplina</label>
                      <p className="font-medium">{classData.subject}</p>
                    </div>
                  )}
                  {classData.class_code && (
                    <div>
                      <label className="text-sm text-muted-foreground">Código da Turma</label>
                      <p className="font-medium font-mono">{classData.class_code}</p>
                    </div>
                  )}
                </div>
              </div>
            </PremiumCard>

            <PremiumCard variant="elevated">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Atividades Recentes</h3>
                {activities.length === 0 ? (
                  <EmptyState
                    icon={BookOpen}
                    title="Nenhuma atividade"
                    description="Crie a primeira atividade para esta turma"
                  />
                ) : (
                  <div className="space-y-2">
                    {activities.slice(0, 5).map((activity) => (
                      <Link
                        key={activity.id}
                        to={`/dashboard/activities/${activity.id}`}
                        className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <p className="font-medium line-clamp-1">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </PremiumCard>
          </div>
        )}

        {activeTab === 'students' && (
          <PremiumCard variant="elevated">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Alunos ({students.length})</h3>
                <PremiumButton
                  variant="gradient"
                  size="sm"
                  leftIcon={UserPlus}
                  onClick={handleGenerateInvite}
                >
                  Convidar Alunos
                </PremiumButton>
              </div>

              {students.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Nenhum aluno na turma"
                  description="Gere um link de convite para adicionar alunos"
                  actionLabel="Gerar Convite"
                  onAction={handleGenerateInvite}
                />
              ) : (
                <div className="space-y-2">
                  {students.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {member.user?.full_name?.charAt(0) || 'A'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{member.user?.full_name || 'Aluno'}</p>
                        <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        Ativo
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PremiumCard>
        )}

        {activeTab === 'activities' && (
          <PremiumCard variant="elevated">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Atividades ({activities.length})</h3>
                <PremiumButton
                  variant="gradient"
                  size="sm"
                  leftIcon={BookOpen}
                  onClick={() => navigate('/dashboard/activities/new')}
                >
                  Nova Atividade
                </PremiumButton>
              </div>

              {activities.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="Nenhuma atividade criada"
                  description="Crie atividades para avaliar seus alunos"
                  actionLabel="Criar Atividade"
                  onAction={() => navigate('/dashboard/activities/new')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activities.map((activity) => (
                    <Link
                      key={activity.id}
                      to={`/dashboard/activities/${activity.id}`}
                      className="block p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/50 transition-all"
                    >
                      <h4 className="font-medium mb-2 line-clamp-1">{activity.title}</h4>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {activity.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        {activity.due_date && (
                          <span className="px-2 py-1 rounded-full bg-warning/10 text-warning">
                            Prazo: {new Date(activity.due_date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </PremiumCard>
        )}

        {activeTab === 'settings' && (
          <PremiumCard variant="elevated">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-6">Configurações da Turma</h3>
              <div className="space-y-4">
                <PremiumButton
                  variant="outline"
                  leftIcon={Edit2}
                  onClick={() => navigate(`/dashboard/classes/${classId}/edit`)}
                >
                  Editar Informações
                </PremiumButton>
                <PremiumButton
                  variant="outline"
                  leftIcon={Share2}
                  onClick={handleGenerateInvite}
                >
                  Gerar Novo Link de Convite
                </PremiumButton>
                <div className="border-t border-border pt-4">
                  <PremiumButton
                    variant="destructive"
                    leftIcon={Trash2}
                    onClick={handleDeleteClass}
                  >
                    Excluir Turma
                  </PremiumButton>
                  <p className="text-sm text-muted-foreground mt-2">
                    Esta ação não pode ser desfeita. Todos os dados serão permanentemente removidos.
                  </p>
                </div>
              </div>
            </div>
          </PremiumCard>
        )}
      </motion.div>
    </div>
  );
};

export default ClassDetailsPagePremium;
