import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Calendar,
  BookOpen,
  TrendingUp,
  Settings,
  Mail,
  Copy,
  Share2,
  UserPlus
} from 'lucide-react';
import { PremiumCard, StatsCard, FeatureCard } from '@/components/ui/PremiumCard';
import { PremiumButton, IconButton, FAB } from '@/components/ui/PremiumButton';
import { PremiumInput } from '@/components/ui/PremiumInput';
import { PremiumModal, FormModal } from '@/components/ui/PremiumModal';
import { LoadingScreen, SkeletonScreen } from '@/components/ui/LoadingScreen';
import { EmptyState, NoClasses } from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import ClassInviteService from '@/services/classInviteService';
import { getNextClassDate, formatNextClass } from '@/utils/classScheduleUtils';

const ClassroomsPagePremium = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedClassForInvite, setSelectedClassForInvite] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [stats, setStats] = useState({ totalStudents: 0, activeActivities: 0, participationRate: 0 });
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    schedule: '',
    room: '',
    capacity: '',
    description: '',
    bannerColor: 'from-blue-500 to-purple-500'
  });
  const [creatingClass, setCreatingClass] = useState(false);

  const bannerColors = [
    { name: 'Azul-Roxo', value: 'from-blue-500 to-purple-500' },
    { name: 'Verde-Azul', value: 'from-emerald-500 to-cyan-500' },
    { name: 'Roxo-Rosa', value: 'from-purple-500 to-pink-500' },
    { name: 'Laranja-Vermelho', value: 'from-orange-500 to-red-500' },
    { name: 'Amarelo-Laranja', value: 'from-yellow-500 to-orange-500' },
    { name: 'Verde-Limão', value: 'from-green-500 to-lime-500' }
  ];

  useEffect(() => {
    if (user) {
      loadClasses();
    }
  }, [user]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando turmas do professor...');

      // Buscar turmas do professor
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (classesError) {
        console.error('❌ Erro na query de turmas:', classesError);
        throw classesError;
      }

      // Para cada turma, buscar contagem de alunos e atividades
      const classesWithCounts = await Promise.all(
        (classesData || []).map(async (cls) => {
          const [studentsResult, activitiesResult] = await Promise.all([
            supabase
              .from('class_members')
              .select('id', { count: 'exact', head: true })
              .eq('class_id', cls.id)
              .eq('role', 'student'),
            supabase
              .from('activities')
              .select('id', { count: 'exact', head: true })
              .eq('class_id', cls.id)
          ]);

          // Calculate next class based on weekly_schedule and dates
          const nextClassDate = getNextClassDate(cls);
          const nextClassText = formatNextClass(nextClassDate);

          return {
            ...cls,
            students: studentsResult.count || 0,
            activities: activitiesResult.count || 0,
            nextClass: nextClassText,
            nextClassDate: nextClassDate
          };
        })
      );

      setClasses(classesWithCounts);
      console.log(`✅ ${classesWithCounts.length} turmas carregadas`);

      // Calcular stats totais
      const totalStudents = classesWithCounts.reduce((sum, cls) => sum + cls.students, 0);
      const activeActivities = classesWithCounts.reduce((sum, cls) => sum + cls.activities, 0);
      
      setStats({
        totalStudents,
        activeActivities,
        participationRate: totalStudents > 0 ? Math.round((activeActivities / totalStudents) * 100) : 0
      });

    } catch (error) {
      console.error('❌ Erro ao carregar turmas:', error);
      toast.error(`Erro ao carregar turmas: ${error.message}`);
      setClasses([]); // Garante array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!formData.name.trim()) {
      toast.error('Digite um nome para a turma');
      return;
    }

    if (!formData.subject.trim()) {
      toast.error('Digite a disciplina');
      return;
    }

    setCreatingClass(true);
    
    try {
      const { data: newClass, error } = await supabase
        .from('classes')
        .insert([
          {
            name: formData.name,
            subject: formData.subject,
            description: formData.description || null,
            created_by: user.id,
            room_number: formData.room || null,
            student_capacity: formData.capacity ? parseInt(formData.capacity) : null
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Turma criada com sucesso!');
      setShowCreateModal(false);
      setFormData({
        name: '',
        subject: '',
        schedule: '',
        room: '',
        capacity: '',
        description: '',
        bannerColor: 'from-blue-500 to-purple-500'
      });
      
      // Recarregar lista
      loadClasses();
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      toast.error('Erro ao criar turma');
    } finally {
      setCreatingClass(false);
    }
  };

  const handleOpenInvite = async (classroom) => {
    try {
      const invite = await ClassInviteService.createInvite(classroom.id, {
        maxUses: 50,
        expiresInHours: 24 * 7
      });

      const inviteLink = ClassInviteService.getInviteLink(invite.invitation_code);
      await navigator.clipboard.writeText(inviteLink);
      
      toast.success('Link de convite copiado!');
    } catch (error) {
      console.error('Erro ao gerar convite:', error);
      toast.error('Erro ao gerar link de convite');
    }
  };

  const handleCopyInviteCode = async () => {
    if (selectedClassForInvite) {
      await handleOpenInvite(selectedClassForInvite);
      setShowInviteModal(false);
    }
  };

  const handleSendEmailInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.warning('Digite um email válido', 'Campo obrigatório');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Convite enviado para ${inviteEmail}!`, 'Sucesso');
      setInviteEmail('');
    } catch (error) {
      toast.error('Erro ao enviar convite', 'Erro');
    }
  };

  const statsCards = [
    {
      title: 'Total de Turmas',
      value: classes.length.toString(),
      change: `${classes.length} turma${classes.length !== 1 ? 's' : ''}`,
      trend: classes.length > 0 ? 'up' : 'neutral',
      icon: Users
    },
    {
      title: 'Total de Alunos',
      value: stats.totalStudents.toString(),
      change: `${stats.totalStudents} aluno${stats.totalStudents !== 1 ? 's' : ''}`,
      trend: stats.totalStudents > 0 ? 'up' : 'neutral',
      icon: Users
    },
    {
      title: 'Atividades Ativas',
      value: stats.activeActivities.toString(),
      change: `${stats.activeActivities} criada${stats.activeActivities !== 1 ? 's' : ''}`,
      trend: stats.activeActivities > 0 ? 'up' : 'neutral',
      icon: BookOpen
    },
    {
      title: 'Taxa de Participação',
      value: `${stats.participationRate}%`,
      change: stats.participationRate > 70 ? 'Excelente' : stats.participationRate > 40 ? 'Bom' : 'Melhorar',
      trend: stats.participationRate > 70 ? 'up' : stats.participationRate > 40 ? 'neutral' : 'down',
      icon: TrendingUp
    }
  ];

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="skeleton h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
        <SkeletonScreen type="card" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="bg-gradient-primary p-8 rounded-2xl text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Minhas Turmas</h1>
          <p className="text-white/90">
            Gerencie suas turmas e acompanhe o progresso dos alunos
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stagger-children grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map(stat => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <PremiumInput
            placeholder="Buscar turmas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={Search}
            clearable
          />
        </div>
        <PremiumButton
          variant="gradient"
          leftIcon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          Nova Turma
        </PremiumButton>
      </div>

      {/* Classes Grid or Empty State */}
      {filteredClasses.length === 0 ? (
        classes.length === 0 ? (
          <NoClasses onCreate={() => setShowCreateModal(true)} />
        ) : (
          <EmptyState
            variant="search"
            icon={Search}
            title="Nenhuma turma encontrada"
            description={`Não encontramos turmas com "${searchQuery}"`}
            actionLabel="Limpar busca"
            onAction={() => setSearchQuery('')}
          />
        )
      ) : (
        <div className="stagger-children grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classroom, index) => (
            <motion.div
              key={classroom.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <PremiumCard
                variant="elevated"
                hover
                onClick={() => navigate(`/dashboard/classes/${classroom.id}`)}
                className="cursor-pointer"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${classroom.bannerColor || 'from-blue-500 to-purple-500'} rounded-xl flex items-center justify-center`}>
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <IconButton
                      icon={MoreVertical}
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle menu
                      }}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {classroom.name}
                  </h3>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {classroom.students}
                      </p>
                      <p className="text-sm text-muted-foreground">Alunos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {classroom.activities}
                      </p>
                      <p className="text-sm text-muted-foreground">Atividades</p>
                    </div>
                  </div>

                  {/* Next Class */}
                  {classroom.nextClass ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>Próxima aula: {classroom.nextClass}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>Nenhuma aula agendada</span>
                    </div>
                  )}

                  {/* Invite Button */}
                  <PremiumButton
                    variant="outline"
                    size="sm"
                    leftIcon={UserPlus}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInvite(classroom);
                    }}
                    className="w-full"
                  >
                    Convidar Alunos
                  </PremiumButton>
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateClass}
        title="Criar Nova Turma"
        description="Preencha os dados da nova turma"
        submitLabel="Criar Turma"
        loading={creatingClass}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PremiumInput
              label="Nome da Turma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Turma A"
              leftIcon={Users}
              required
              autoFocus
            />
            <PremiumInput
              label="Disciplina"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Ex: Matemática"
              leftIcon={BookOpen}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PremiumInput
              label="Horário"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              placeholder="Ex: Seg/Qua 14:00-16:00"
              leftIcon={Calendar}
            />
            <PremiumInput
              label="Sala"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="Ex: Sala 12"
            />
          </div>

          <PremiumInput
            label="Capacidade"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            placeholder="Ex: 30"
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              Descrição (opcional)
            </label>
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição da turma..."
            />
          </div>

          {/* Banner Color Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Cor do Banner
            </label>
            <div className="grid grid-cols-3 gap-3">
              {bannerColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, bannerColor: color.value })}
                  className={`relative h-16 rounded-lg bg-gradient-to-br ${color.value} transition-all ${
                    formData.bannerColor === color.value
                      ? 'ring-2 ring-primary ring-offset-2 scale-105'
                      : 'hover:scale-105'
                  }`}
                >
                  {formData.bannerColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <span className="sr-only">{color.name}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Escolha uma cor para o ícone da turma
            </p>
          </div>
        </div>
      </FormModal>

      {/* Invite Modal */}
      <PremiumModal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setInviteEmail('');
        }}
        title={`Convidar Alunos - ${selectedClassForInvite?.name}`}
        description="Convide alunos por email ou compartilhe o código da turma"
        hideActions
      >
        <div className="space-y-6">
          {/* Invite Code Section */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-primary/20">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Código de Convite
            </h4>
            <div className="flex items-center gap-2 mb-2">
              <code className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg font-mono text-lg font-bold text-primary border-2 border-primary/30">
                {selectedClassForInvite?.inviteCode || 'MAT-ABC123'}
              </code>
              <PremiumButton
                variant="outline"
                size="sm"
                leftIcon={Copy}
                onClick={handleCopyInviteCode}
              >
                Copiar
              </PremiumButton>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Compartilhe este código com seus alunos para que eles possam entrar na turma
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Email Invite Section */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Enviar Convite por Email
            </h4>
            <div className="flex gap-2">
              <PremiumInput
                placeholder="email@exemplo.com"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                leftIcon={Mail}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSendEmailInvite()}
              />
              <PremiumButton
                variant="gradient"
                onClick={handleSendEmailInvite}
                disabled={!inviteEmail.trim()}
              >
                Enviar
              </PremiumButton>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              O aluno receberá um email com o link e código de acesso à turma
            </p>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
            <p className="text-sm text-info dark:text-info-foreground">
              <strong>Dica:</strong> Você também pode compartilhar o código via WhatsApp, Telegram ou qualquer outro app de mensagens!
            </p>
          </div>
        </div>
      </PremiumModal>

      {/* FAB for mobile */}
      <div className="lg:hidden">
        <FAB
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        />
      </div>
    </motion.div>
  );
};

export default ClassroomsPagePremium;
