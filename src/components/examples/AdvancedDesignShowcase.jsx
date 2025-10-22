// src/components/examples/AdvancedDesignShowcase.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  BookOpen,
  TrendingUp,
  MessageSquare,
  Image as ImageIcon,
  Music,
  Video,
  FileText,
  Download,
  Share,
  Heart,
  Star,
  Award,
  Settings,
  Bell,
  Search,
  Filter,
  Plus,
} from 'lucide-react';

// Importar todos os componentes avançados
import EnhancedLayout, { EnhancedSidebar } from '@/components/ui/EnhancedLayout';
import {
  EnhancedCard,
  StatCard,
  StatsGrid,
  ProgressRing,
  SimpleBarChart,
  EnhancedTable
} from '@/components/ui/EnhancedTable';
import {
  EnhancedInput,
  EnhancedSelect,
  EnhancedButton,
  EnhancedCheckbox,
  EnhancedFileUpload
} from '@/components/ui/EnhancedForm';
import {
  NotificationProvider,
  useNotifications,
  NotificationCenter,
  NotificationToggle,
  ActionFeedback,
  StatusBadge
} from '@/components/ui/EnhancedNotifications';
import {
  AdvancedSidebar,
  AdvancedPagination,
  AdvancedSearch,
  QuickActionButton
} from '@/components/ui/EnhancedNavigation';
import {
  InteractiveCalendar,
  ActivityList,
  UserProfileCard,
  MessageBubble,
  MediaPlayer,
  ImageGallery,
  Leaderboard,
  ActivityFeed
} from '@/components/ui/AdvancedComponents';
import {
  AdvancedThemeProvider,
  AdvancedThemeSelector,
  ThemeIndicator,
  useAdvancedTheme
} from '@/components/ui/AdvancedThemeSystem';

/**
 * Showcase completo de todos os componentes avançados de design
 */
const AdvancedDesignShowcase = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [feedback, setFeedback] = useState(null);
  const { showSuccess, showError, showWarning } = useNotifications();
  const { currentTheme } = useAdvancedTheme();

  // Dados de exemplo para demonstração
  const sidebarItems = [
    { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'media', label: 'Mídia', icon: ImageIcon },
    { id: 'social', label: 'Social', icon: MessageSquare },
  ];

  const stats = [
    { title: 'Usuários Ativos', value: '2,847', change: '+12%', trend: 'up', icon: Users },
    { title: 'Atividades', value: '156', change: '+8', trend: 'up', icon: BookOpen },
    { title: 'Taxa de Sucesso', value: '94.2%', change: '+2.1%', trend: 'up', icon: Award },
    { title: 'Tempo Médio', value: '2.4s', change: '-0.3s', trend: 'down', icon: TrendingUp },
  ];

  const users = [
    { id: 1, name: 'João Silva', email: 'joao@email.com', role: 'Aluno', status: 'active', points: 1250 },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', role: 'Professor', status: 'active', points: 2100 },
    { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', role: 'Aluno', status: 'inactive', points: 890 },
  ];

  const tableColumns = [
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Função', sortable: true, render: (value) => <StatusBadge status={value === 'Professor' ? 'active' : 'pending'}>{value}</StatusBadge> },
    { key: 'status', label: 'Status', sortable: true, render: (value) => <StatusBadge status={value}>{value}</StatusBadge> },
    { key: 'points', label: 'Pontos', sortable: true },
  ];

  const events = [
    { id: 1, title: 'Reunião de Matemática', date: '2024-01-15', type: 'meeting' },
    { id: 2, title: 'Entrega de Trabalho', date: '2024-01-16', type: 'assignment' },
    { id: 3, title: 'Evento Cultural', date: '2024-01-18', type: 'event' },
  ];

  const activities = [
    {
      id: 1,
      title: 'Equações do Segundo Grau',
      description: 'Resolva as equações propostas e explique o método utilizado',
      status: 'completed',
      dueDate: '2024-01-15',
      points: 100,
      grade: 9.5,
    },
    {
      id: 2,
      title: 'Análise de Texto',
      description: 'Leia o texto fornecido e faça uma análise crítica',
      status: 'in_progress',
      dueDate: '2024-01-20',
      points: 80,
    },
    {
      id: 3,
      title: 'Experimento de Física',
      description: 'Realize o experimento e registre os resultados',
      status: 'overdue',
      dueDate: '2024-01-10',
      points: 120,
    },
  ];

  const leaderboardUsers = [
    { id: 1, name: 'Ana Carolina', points: 2450, level: 5, streak: 12 },
    { id: 2, name: 'Carlos Eduardo', points: 2380, level: 5, streak: 8 },
    { id: 3, name: 'Beatriz Lima', points: 2250, level: 4, streak: 15 },
  ];

  const socialActivities = [
    {
      id: 1,
      user: { name: 'Ana Carolina' },
      content: 'Acabei de completar a atividade de matemática! Foi desafiador mas muito gratificante! 🎉',
      timestamp: '2024-01-15T10:30:00Z',
      likes: 5,
      comments: 2,
      isLiked: false,
    },
    {
      id: 2,
      user: { name: 'Carlos Eduardo' },
      content: 'Compartilhando uma dúvida sobre o experimento de física. Alguém pode ajudar?',
      timestamp: '2024-01-15T09:15:00Z',
      likes: 3,
      comments: 7,
      isLiked: true,
    },
  ];

  const demoActions = [
    {
      icon: Plus,
      label: 'Nova Atividade',
      variant: 'btn-primary',
      onClick: () => showSuccess('Nova atividade criada com sucesso!'),
    },
    {
      icon: Users,
      label: 'Convidar Aluno',
      variant: 'btn-secondary',
      onClick: () => showWarning('Convite enviado para análise'),
    },
    {
      icon: Bell,
      label: 'Enviar Notificação',
      variant: 'btn-accent',
      onClick: () => setFeedback({ type: 'info', message: 'Notificação enviada!' }),
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection stats={stats} />;

      case 'dashboard':
        return <DashboardSection stats={stats} />;

      case 'users':
        return <UsersSection users={users} columns={tableColumns} />;

      case 'calendar':
        return <CalendarSection events={events} />;

      case 'media':
        return <MediaSection />;

      case 'social':
        return <SocialSection activities={socialActivities} />;

      default:
        return <OverviewSection stats={stats} />;
    }
  };

  return (
    <NotificationProvider>
      <AdvancedThemeProvider>
        <EnhancedLayout
          title="Showcase Avançado do Design System"
          subtitle={`Demonstração completa • Tema: ${currentTheme}`}
          sidebarContent={
            <EnhancedSidebar
              items={sidebarItems}
              activeItem={activeSection}
              onItemClick={setActiveSection}
              footer={
                <div className="space-y-2">
                  <ThemeIndicator showDetails />
                  <AdvancedThemeSelector showPreview={false} />
                </div>
              }
            />
          }
          headerActions={
            <div className="flex items-center gap-2">
              <AdvancedSearch
                placeholder="Buscar no showcase..."
                suggestions={[
                  { title: 'Dashboard', subtitle: 'Visão geral', icon: TrendingUp },
                  { title: 'Usuários', subtitle: 'Lista de usuários', icon: Users },
                  { title: 'Calendário', subtitle: 'Eventos e atividades', icon: Calendar },
                ]}
              />
              <NotificationToggle />
            </div>
          }
        >
          <div className="space-y-8">
            {renderContent()}

            {/* Botões de ação rápida */}
            <QuickActionButton actions={demoActions} />

            {/* Feedback visual */}
            <ActionFeedback
              isVisible={!!feedback}
              type={feedback?.type}
              message={feedback?.message}
              onClose={() => setFeedback(null)}
            />
          </div>
        </EnhancedLayout>

        {/* Centro de notificações */}
        <NotificationCenter isOpen={false} onClose={() => {}} />
      </AdvancedThemeProvider>
    </NotificationProvider>
  );
};

/**
 * Seção de visão geral
 */
const OverviewSection = ({ stats }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    {/* Métricas principais */}
    <StatsGrid stats={stats} columns={4} />

    {/* Cards de demonstração */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <EnhancedCard title="Componentes de Formulário" className="space-y-4">
        <EnhancedInput
          label="Nome do Projeto"
          placeholder="Digite o nome..."
          helperText="Nome do projeto para identificação"
        />

        <EnhancedSelect
          label="Categoria"
          placeholder="Selecione uma categoria"
          options={[
            { value: 'math', label: 'Matemática' },
            { value: 'portuguese', label: 'Português' },
            { value: 'science', label: 'Ciências' },
          ]}
        />

        <div className="flex gap-2">
          <EnhancedButton variant="primary">Salvar</EnhancedButton>
          <EnhancedButton variant="outline">Cancelar</EnhancedButton>
        </div>
      </EnhancedCard>

      <EnhancedCard title="Estados Visuais" className="space-y-4">
        <div className="space-y-3">
          <StatusBadge status="active">Ativo</StatusBadge>
          <StatusBadge status="pending">Pendente</StatusBadge>
          <StatusBadge status="completed">Concluído</StatusBadge>
          <StatusBadge status="error">Erro</StatusBadge>
        </div>

        <div className="space-y-2">
          <ProgressRing progress={75} size={60} />
          <ProgressRing progress={45} color="warning" size={60} />
          <ProgressRing progress={90} color="success" size={60} />
        </div>
      </EnhancedCard>
    </div>

    {/* Gráfico de exemplo */}
    <EnhancedCard title="Análise de Performance">
      <SimpleBarChart
        data={[
          { label: 'Jan', value: 75 },
          { label: 'Fev', value: 82 },
          { label: 'Mar', value: 88 },
          { label: 'Abr', value: 95 },
          { label: 'Mai', value: 92 },
        ]}
        height={250}
      />
    </EnhancedCard>
  </motion.div>
);

/**
 * Seção do Dashboard
 */
const DashboardSection = ({ stats }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <StatsGrid stats={stats} columns={4} />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <ActivityList
          activities={[
            {
              id: 1,
              title: 'Equações do Segundo Grau',
              description: 'Resolva as equações propostas',
              status: 'completed',
              dueDate: '2024-01-15',
              points: 100,
              grade: 9.5,
            },
            {
              id: 2,
              title: 'Análise Textual',
              description: 'Análise crítica do texto fornecido',
              status: 'in_progress',
              dueDate: '2024-01-20',
              points: 80,
            },
          ]}
          viewMode="list"
          showFilters={true}
        />
      </div>

      <div className="space-y-6">
        <Leaderboard
          users={[
            { id: 1, name: 'Ana Carolina', points: 2450, level: 5, streak: 12 },
            { id: 2, name: 'Carlos Eduardo', points: 2380, level: 5, streak: 8 },
            { id: 3, name: 'Beatriz Lima', points: 2250, level: 4, streak: 15 },
          ]}
          currentUserId={1}
        />

        <InteractiveCalendar
          events={[
            { id: 1, title: 'Reunião de Matemática', date: '2024-01-15', type: 'meeting' },
            { id: 2, title: 'Entrega de Trabalho', date: '2024-01-16', type: 'assignment' },
          ]}
        />
      </div>
    </div>
  </motion.div>
);

/**
 * Seção de Usuários
 */
const UsersSection = ({ users, columns }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <EnhancedCard>
      <EnhancedTable
        data={users}
        columns={columns}
        searchable={true}
        sortable={true}
        selectable={true}
        pagination={true}
        pageSize={5}
        actions={[
          { icon: Download, label: 'Exportar', onClick: (user) => console.log('Export user:', user) },
          { icon: Settings, label: 'Configurar', onClick: (user) => console.log('Configure user:', user) },
        ]}
        emptyMessage="Nenhum usuário encontrado"
      />
    </EnhancedCard>
  </motion.div>
);

/**
 * Seção de Calendário
 */
const CalendarSection = ({ events }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <InteractiveCalendar events={events} />
      </div>

      <div className="space-y-6">
        <EnhancedCard title="Eventos Hoje">
          <div className="space-y-3">
            {events.filter(event => new Date(event.date).toDateString() === new Date().toDateString()).map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  event.type === 'meeting' ? 'bg-info' :
                  event.type === 'assignment' ? 'bg-warning' : 'bg-success'
                }`} />
                <div className="flex-1">
                  <div className="font-medium text-sm">{event.title}</div>
                  <div className="text-xs text-base-content/70">
                    {new Date(event.date).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </EnhancedCard>

        <EnhancedCard title="Próximos Eventos">
          <div className="space-y-3">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  event.type === 'meeting' ? 'bg-info' :
                  event.type === 'assignment' ? 'bg-warning' : 'bg-success'
                }`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{event.title}</div>
                  <div className="text-xs text-base-content/70">
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </EnhancedCard>
      </div>
    </div>
  </motion.div>
);

/**
 * Seção de Mídia
 */
const MediaSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <EnhancedCard title="Galeria de Imagens">
        <ImageGallery
          images={[
            {
              src: 'https://picsum.photos/400/300?random=1',
              thumbnail: 'https://picsum.photos/150/150?random=1',
              alt: 'Imagem de exemplo 1',
              title: 'Projeto de Matemática',
            },
            {
              src: 'https://picsum.photos/400/300?random=2',
              thumbnail: 'https://picsum.photos/150/150?random=2',
              alt: 'Imagem de exemplo 2',
              title: 'Experimento de Ciências',
            },
            {
              src: 'https://picsum.photos/400/300?random=3',
              thumbnail: 'https://picsum.photos/150/150?random=3',
              alt: 'Imagem de exemplo 3',
              title: 'Apresentação de Português',
            },
          ]}
          columns={2}
        />
      </EnhancedCard>

      <EnhancedCard title="Reprodutor de Mídia">
        <MediaPlayer
          src="/demo-audio.mp3"
          type="audio"
          title="Aula de Matemática - Equações"
          thumbnail="https://picsum.photos/300/200?random=4"
          controls={true}
        />
      </EnhancedCard>
    </div>

    <EnhancedCard title="Upload de Arquivos">
      <EnhancedFileUpload
        accept=".pdf,.doc,.docx,.jpg,.png"
        multiple={true}
        preview={true}
        helperText="Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)"
      />
    </EnhancedCard>
  </motion.div>
);

/**
 * Seção Social
 */
const SocialSection = ({ activities }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <ActivityFeed
          activities={activities}
          onLike={(id) => console.log('Liked activity:', id)}
          onComment={(id) => console.log('Commented on activity:', id)}
          onShare={(id) => console.log('Shared activity:', id)}
        />
      </div>

      <div className="space-y-6">
        <UserProfileCard
          user={{
            name: 'Ana Carolina',
            username: 'ana.carolina',
            bio: 'Estudante de matemática apaixonada por resolver problemas complexos e ajudar colegas.',
            role: 'student',
            isOnline: true,
            verified: true,
            followers: 127,
            activities: 45,
            points: 2450,
            memberSince: '2023-08-15',
          }}
          showStats={true}
        />

        <Leaderboard
          users={[
            { id: 1, name: 'Ana Carolina', points: 2450, level: 5, streak: 12 },
            { id: 2, name: 'Carlos Eduardo', points: 2380, level: 5, streak: 8 },
            { id: 3, name: 'Beatriz Lima', points: 2250, level: 4, streak: 15 },
          ]}
          currentUserId={1}
        />
      </div>
    </div>
  </motion.div>
);

export default AdvancedDesignShowcase;
