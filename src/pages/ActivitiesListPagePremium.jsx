import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PremiumCard,
  StatsCard,
  PremiumButton,
  PremiumInput,
  PremiumTable,
  PremiumModal,
  LoadingScreen,
  EmptyState,
  toast
} from '@/components/ui';
import {
  BookOpen,
  Plus,
  Search,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Edit2,
  Trash2,
  Eye,
  FileText
} from 'lucide-react';
import { useActivities } from '@/contexts/ActivityContext';

export default function ActivitiesListPagePremium() {
  const navigate = useNavigate();
  const { activities: contextActivities, loading: contextLoading } = useActivities();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data
  const mockActivities = [
    {
      id: '1',
      title: 'Trabalho de Matemática - Cap. 5',
      description: 'Resolver exercícios sobre equações de 2º grau',
      type: 'Tarefa',
      status: 'Ativa',
      dueDate: '2025-10-12',
      class: 'Matemática 9A',
      students: 32,
      completed: 18,
      avgGrade: 8.5
    },
    {
      id: '2',
      title: 'Prova de Física - Mecânica',
      description: 'Avaliação sobre leis de Newton',
      type: 'Prova',
      status: 'Ativa',
      dueDate: '2025-10-13',
      class: 'Física 2B',
      students: 28,
      completed: 25,
      avgGrade: 7.8
    },
    {
      id: '3',
      title: 'Projeto de Química',
      description: 'Apresentação sobre reações químicas',
      type: 'Projeto',
      status: 'Ativa',
      dueDate: '2025-10-18',
      class: 'Química 3C',
      students: 30,
      completed: 12,
      avgGrade: 8.2
    },
    {
      id: '4',
      title: 'Quiz - Genética',
      description: 'Quiz rápido sobre herança genética',
      type: 'Quiz',
      status: 'Concluída',
      dueDate: '2025-10-08',
      class: 'Biologia 1A',
      students: 35,
      completed: 35,
      avgGrade: 9.0
    }
  ];

  // Usar dados do contexto diretamente (dados reais)
  const activities = contextActivities || [];
  const loading = contextLoading;

  // Estatísticas
  const activeActivities = activities.filter(a => a.status === 'Ativa' || a.status === 'published').length;
  const totalStudents = activities.reduce((acc, a) => acc + (a.students || 0), 0);
  const completedTasks = activities.reduce((acc, a) => acc + (a.completed || 0), 0);
  const avgGrade = activities.length > 0
    ? (activities.reduce((acc, a) => acc + (a.avgGrade || 0), 0) / activities.length).toFixed(1)
    : 0;

  // Filtrar atividades
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
    const matchesType = filterType === 'all' || activity.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateActivity = () => {
    console.log('📋 Navegando para criar atividade...');
    navigate('/dashboard/activities/new');
  };

  const handleViewActivity = (activity) => {
    navigate(`/dashboard/activities/${activity.id}`);
  };

  const handleEditActivity = (activity) => {
    navigate(`/dashboard/activities/${activity.id}/edit`);
  };

  const handleDeleteActivity = async (activity) => {
    if (confirm(`Tem certeza que deseja excluir "${activity.title}"?`)) {
      try {
        // API call aqui
        toast.success('Atividade excluída com sucesso!', 'Sucesso');
        loadActivities();
      } catch (error) {
        toast.error('Erro ao excluir atividade', 'Erro');
      }
    }
  };

  // Loading state com skeleton
  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-2xl text-white">
          <h1 className="text-3xl font-bold mb-2">Atividades</h1>
          <p className="text-white/90">Carregando suas atividades...</p>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card p-6 rounded-xl animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card p-6 rounded-xl animate-pulse">
              <div className="h-6 bg-muted rounded w-2/3 mb-3"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-4/5"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state quando não há atividades
  if (activities.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Nenhuma atividade criada"
        description="Comece criando sua primeira atividade para os alunos"
        actionLabel="Criar Atividade"
        onAction={handleCreateActivity}
      />
    );
  }

  const columns = [
    {
      key: 'title',
      label: 'Título',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{row.class}</div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Tipo',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Prova' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
          value === 'Projeto' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
          value === 'Quiz' ? 'bg-blue-100 dark:bg-muted/50 text-blue-700 dark:text-blue-300' :
          'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Ativa' 
            ? 'bg-success/10 text-success' 
            : 'bg-muted text-muted-foreground'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'dueDate',
      label: 'Prazo',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('pt-BR')
    },
    {
      key: 'progress',
      label: 'Progresso',
      render: (_, row) => (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>{row.completed}/{row.students}</span>
            <span>{Math.round((row.completed / row.students) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-success h-1.5 rounded-full transition-all"
              style={{ width: `${(row.completed / row.students) * 100}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'avgGrade',
      label: 'Nota Média',
      sortable: true,
      render: (value) => value ? value.toFixed(1) : '-'
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewActivity(row);
            }}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Visualizar"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditActivity(row);
            }}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteActivity(row);
            }}
            className="p-1 hover:bg-destructive/10 text-destructive rounded transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 p-8 rounded-2xl text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            Atividades
          </h1>
          <p className="text-white/90">Gerencie todas as atividades e avaliações</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stagger-children grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Atividades Ativas"
          value={activeActivities.toString()}
          change="+3 esta semana"
          trend="up"
          icon={BookOpen}
        />
        <StatsCard
          title="Total de Alunos"
          value={totalStudents.toString()}
          change="+12%"
          trend="up"
          icon={Users}
        />
        <StatsCard
          title="Tarefas Concluídas"
          value={completedTasks.toString()}
          change="+8%"
          trend="up"
          icon={CheckCircle2}
        />
        <StatsCard
          title="Nota Média"
          value={avgGrade}
          change="+0.3"
          trend="up"
          icon={TrendingUp}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1 w-full">
          <PremiumInput
            placeholder="Buscar atividades..."
            leftIcon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            clearable
          />
        </div>
        <PremiumButton
          variant="gradient"
          leftIcon={Plus}
          onClick={handleCreateActivity}
        >
          Nova Atividade
        </PremiumButton>
      </div>

      {/* Table */}
      {filteredActivities.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhuma atividade encontrada"
          description="Tente ajustar os filtros de busca"
          actionLabel="Limpar Busca"
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <PremiumTable
          data={filteredActivities}
          columns={columns}
          sortable
          filterable
          pagination
          pageSize={10}
          onRowClick={handleViewActivity}
        />
      )}
    </div>
  );
}
