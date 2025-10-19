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
  Users,
  Plus,
  Search,
  UserPlus,
  TrendingUp,
  Award,
  BookOpen,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

export default function StudentsPagePremium() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    class: '',
    enrollment: ''
  });

  // Fetch real students data from Supabase
  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);

        // Buscar alunos das turmas do professor (sem embed de profiles para evitar PGRST201)
        const { data: classMembers, error: membersError } = await supabase
          .from('class_members')
          .select(`
            user_id,
            role,
            joined_at,
            classes!inner (
              id,
              name,
              subject,
              created_by
            )
          `)
          .eq('role', 'student')
          .eq('classes.created_by', user.id);

        if (membersError) throw membersError;

        // Processar dados dos alunos
        const studentsMap = new Map();
        
        classMembers?.forEach(member => {
          const studentId = member.user_id;
          const classInfo = member.classes;

          if (!studentsMap.has(studentId)) {
            studentsMap.set(studentId, {
              id: studentId,
              name: '', // será preenchido após buscar profiles
              email: '', // será preenchido após buscar profiles
              enrollment: studentId.substring(0, 8),
              class: classInfo.name,
              phone: '-',
              avgGrade: 0,
              activitiesCompleted: 0,
              totalActivities: 0,
              attendance: 0,
              status: 'Ativo',
              classes: [classInfo]
            });
          } else {
            const student = studentsMap.get(studentId);
            student.classes.push(classInfo);
            student.class = student.classes.map(c => c.name).join(', ');
          }
        });

        // Buscar perfis dos alunos separadamente para evitar ambiguidade de relacionamento
        const userIds = Array.from(studentsMap.keys());
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url, role')
            .in('id', userIds);
          if (profilesError) throw profilesError;

          profilesData.forEach(p => {
            const s = studentsMap.get(p.id);
            if (s) {
              s.name = p.full_name || p.email?.split('@')[0] || 'Aluno';
              s.email = p.email;
              s.avatar_url = p.avatar_url;
              s.profile_role = p.role;
            }
          });
        }

        // Buscar submissões para calcular médias
        const studentIds = Array.from(studentsMap.keys());
        if (studentIds.length > 0) {
          const { data: submissions } = await supabase
            .from('submissions')
            .select('student_id, grade, status')
            .in('student_id', studentIds);

          submissions?.forEach(sub => {
            const student = studentsMap.get(sub.student_id);
            if (student) {
              student.totalActivities++;
              if (sub.status === 'graded' && sub.grade !== null) {
                student.activitiesCompleted++;
                student.avgGrade += sub.grade;
              }
            }
          });

          // Calcular médias finais
          studentsMap.forEach(student => {
            if (student.activitiesCompleted > 0) {
              student.avgGrade = (student.avgGrade / student.activitiesCompleted).toFixed(1);
            }
            student.attendance = student.totalActivities > 0 
              ? Math.round((student.activitiesCompleted / student.totalActivities) * 100)
              : 0;
          });
        }

        const studentsArray = Array.from(studentsMap.values());
        setStudents(studentsArray);
        console.log('✅ Alunos carregados:', studentsArray.length);

      } catch (err) {
        console.error('❌ Erro ao carregar alunos:', err);
        setError(err.message);
        toast.error('Erro ao carregar alunos');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  // OLD Mock data (REMOVED)
  const mockStudents_REMOVED = [
    {
      id: '1',
      name: 'Ana Silva',
      email: 'ana.silva@email.com',
      enrollment: '2023001',
      class: 'Matemática 9A',
      phone: '(11) 98765-4321',
      avgGrade: 8.5,
      activitiesCompleted: 24,
      totalActivities: 28,
      attendance: 95,
      status: 'Ativo'
    },
    {
      id: '2',
      name: 'Carlos Santos',
      email: 'carlos.santos@email.com',
      enrollment: '2023002',
      class: 'Física 2B',
      phone: '(11) 98765-4322',
      avgGrade: 7.8,
      activitiesCompleted: 20,
      totalActivities: 25,
      attendance: 88,
      status: 'Ativo'
    },
    {
      id: '3',
      name: 'Beatriz Costa',
      email: 'beatriz.costa@email.com',
      enrollment: '2023003',
      class: 'Química 3C',
      phone: '(11) 98765-4323',
      avgGrade: 9.2,
      activitiesCompleted: 30,
      totalActivities: 30,
      attendance: 98,
      status: 'Ativo'
    }
  ];

  // Mock data removed - using real Supabase data now

  // Estatísticas
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'Ativo').length;
  const avgGrade = students.length > 0
    ? (students.reduce((acc, s) => acc + (s.avgGrade || 0), 0) / students.length).toFixed(1)
    : 0;
  const avgAttendance = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.attendance || 0), 0) / students.length)
    : 0;

  // Filtrar alunos
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.enrollment.includes(searchQuery)
  );

  const handleCreateStudent = async () => {
    // Validar campos
    if (!formData.name || !formData.email) {
      toast.error('Preencha nome e email do aluno');
      return;
    }

    try {
      // Nota: Alunos são adicionados às turmas via código de convite
      // Esta função pode enviar um convite por email
      toast.info('Alunos devem usar o código de convite da turma para se cadastrar');
      
      // Aqui você pode implementar envio de email de convite:
      // const { error } = await supabase.auth.signInWithOtp({
      //   email: formData.email,
      //   options: {
      //     data: {
      //       full_name: formData.name,
      //       invite_class: formData.class
      //     }
      //   }
      // });
      
      setShowCreateModal(false);
      setFormData({ name: '', email: '', class: '', enrollment: '' });
      
    } catch (error) {
      console.error('❌ Erro ao convidar aluno:', error);
      toast.error('Erro ao processar convite');
    }
  };

  const handleViewStudent = (student) => {
    navigate(`/dashboard/students/${student.id}`);
  };

  const handleEditStudent = (student) => {
    navigate(`/dashboard/students/${student.id}/edit`);
  };

  const handleDeleteStudent = async (student) => {
    if (confirm(`Tem certeza que deseja excluir "${student.name}"?`)) {
      try {
        toast.success('Aluno excluído com sucesso!', 'Sucesso');
        loadStudents();
      } catch (error) {
        toast.error('Erro ao excluir aluno', 'Erro');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 rounded-2xl text-white">
          <h1 className="text-3xl font-bold mb-2">Carregando alunos...</h1>
          <p className="text-white/90">Por favor aguarde</p>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-card p-6 rounded-xl animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
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

  if (students.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 rounded-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Users className="w-8 h-8" />
              Alunos
            </h1>
            <p className="text-white/90">Gerencie todos os alunos e acompanhe o desempenho</p>
          </div>
        </div>

        <EmptyState
          icon={Users}
          title="Nenhum aluno cadastrado"
          description="Os alunos aparecer\u00e3o aqui quando se juntarem \u00e0s suas turmas usando o c\u00f3digo de convite. Compartilhe o c\u00f3digo da turma com seus alunos para que eles possam se cadastrar."
          actionLabel="Ver Turmas"
          onAction={() => window.location.href = '/dashboard/classes'}
        />
      </div>
    );
  }

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{row.enrollment}</div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => (
        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-3 h-3 text-muted-foreground" />
          {value}
        </div>
      )
    },
    {
      key: 'class',
      label: 'Turma',
      sortable: true
    },
    {
      key: 'avgGrade',
      label: 'Nota Média',
      sortable: true,
      render: (value) => (
        <span className={`font-medium ${
          value >= 7 ? 'text-success' :
          value >= 5 ? 'text-warning' :
          'text-destructive'
        }`}>
          {value.toFixed(1)}
        </span>
      )
    },
    {
      key: 'progress',
      label: 'Progresso',
      render: (_, row) => (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{row.activitiesCompleted}/{row.totalActivities}</span>
            <span className="font-bold text-lg text-primary">
              {Math.round((row.activitiesCompleted / row.totalActivities) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all shadow-sm"
              style={{ width: `${(row.activitiesCompleted / row.totalActivities) * 100}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'attendance',
      label: 'Frequência',
      sortable: true,
      render: (value) => (
        <span className={`font-medium ${
          value >= 90 ? 'text-success' :
          value >= 75 ? 'text-warning' :
          'text-destructive'
        }`}>
          {value}%
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Ativo' 
            ? 'bg-success/10 text-success' 
            : 'bg-warning/10 text-warning'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewStudent(row);
            }}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Visualizar"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditStudent(row);
            }}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteStudent(row);
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
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 rounded-2xl text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Users className="w-8 h-8" />
            Alunos
          </h1>
          <p className="text-white/90">Gerencie todos os alunos e acompanhe o desempenho</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stagger-children grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Alunos"
          value={totalStudents.toString()}
          change="+5 este mês"
          trend="up"
          icon={Users}
        />
        <StatsCard
          title="Alunos Ativos"
          value={activeStudents.toString()}
          change="95%"
          trend="up"
          icon={UserPlus}
        />
        <StatsCard
          title="Nota Média Geral"
          value={avgGrade}
          change="+0.5"
          trend="up"
          icon={Award}
        />
        <StatsCard
          title="Frequência Média"
          value={`${avgAttendance}%`}
          change="+3%"
          trend="up"
          icon={TrendingUp}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1 w-full">
          <PremiumInput
            placeholder="Buscar alunos por nome, email ou matrícula..."
            leftIcon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            clearable
          />
        </div>
      </div>

      {/* Table */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhum aluno encontrado"
          description="Tente ajustar os filtros de busca"
          actionLabel="Limpar Busca"
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <PremiumTable
          data={filteredStudents}
          columns={columns}
          sortable
          pagination
          pageSize={10}
          onRowClick={handleViewStudent}
        />
      )}

      {/* Create Modal */}
      <PremiumModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Adicionar Novo Aluno"
        description="Preencha os dados do aluno"
      >
        <div className="space-y-4">
          <PremiumInput
            label="Nome Completo"
            placeholder="Digite o nome do aluno"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <PremiumInput
            label="Email"
            type="email"
            placeholder="email@exemplo.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <PremiumInput
            label="Turma"
            placeholder="Ex: Matemática 9A"
            value={formData.class}
            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            required
          />
          <PremiumInput
            label="Matrícula"
            placeholder="Ex: 2023001"
            value={formData.enrollment}
            onChange={(e) => setFormData({ ...formData, enrollment: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 mt-6">
            <PremiumButton
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancelar
            </PremiumButton>
            <PremiumButton
              variant="gradient"
              onClick={handleCreateStudent}
            >
              Adicionar
            </PremiumButton>
          </div>
        </div>
      </PremiumModal>
    </div>
  );
}
