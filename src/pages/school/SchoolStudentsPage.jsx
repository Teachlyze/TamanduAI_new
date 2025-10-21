import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  Filter,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  BookOpen,
  BarChart3,
  Users,
  Star,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import schoolService from '@/services/schoolService';
import { useAuth } from '@/hooks/useAuth';
import { PremiumCard, StatsCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';

const SchoolStudentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    averageGrade: 0,
    topPerformers: 0,
    needsAttention: 0
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, filterClass, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const school = await schoolService.getUserSchool(user.id);
      if (!school?.id) throw new Error('Nenhuma escola associada ao usuário');

      await Promise.all([
        loadStudents(school.id),
        loadClasses(school.id),
        loadStats()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados dos alunos');
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async (schoolId) => {
    try {
      const list = await schoolService.getClasses(schoolId);
      const mapped = (list || []).map(c => ({ id: c.id, name: c.name, subject: c.subject }));
      setClasses(mapped);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const loadStudents = async (schoolId) => {
    try {
      // Buscar alunos através das turmas vinculadas à escola
      const classesList = await schoolService.getClasses(schoolId);
      const classIds = (classesList || []).map(c => c.id);

      if (!classIds || classIds.length === 0) {
        setStudents([]);
        return;
      }

      const { data: classMembers, error } = await supabase
        .from('class_members')
        .select(`
          user_id,
          class_id,
          joined_at,
          role,
          classes (
            id,
            name,
            subject
          ),
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            created_at
          )
        `)
        .in('class_id', classIds)
        .eq('role', 'student');

      if (error) throw error;

      // Buscar estatísticas de cada aluno
      const studentsWithStats = await Promise.all(
        (classMembers || []).map(async (member) => {
          const studentId = member.user_id;

          // Buscar submissões do aluno
          const { data: submissions } = await supabase
            .from('submissions')
            .select('grade, submitted_at, activity_id, activities(max_score)')
            .eq('student_id', studentId)
            .not('grade', 'is', null);

          // Calcular estatísticas
          const grades = submissions?.map(s => s.grade) || [];
          const averageGrade = grades.length > 0
            ? grades.reduce((sum, g) => sum + g, 0) / grades.length
            : 0;

          // Calcular tendência (últimas 3 vs 3 anteriores)
          const recentGrades = grades.slice(-3);
          const previousGrades = grades.slice(-6, -3);
          const recentAvg = recentGrades.length > 0 
            ? recentGrades.reduce((sum, g) => sum + g, 0) / recentGrades.length 
            : 0;
          const previousAvg = previousGrades.length > 0 
            ? previousGrades.reduce((sum, g) => sum + g, 0) / previousGrades.length 
            : 0;

          const trend = recentAvg > previousAvg ? 'up' : recentAvg < previousAvg ? 'down' : 'stable';

          // Buscar atividades pendentes
          const { count: pendingActivities } = await supabase
            .from('activity_class_assignments')
            .select('activity_id', { count: 'exact', head: true })
            .eq('class_id', member.class_id)
            .not('activity_id', 'in', `(${submissions?.map(s => s.activity_id).join(',') || '0'})`);

          return {
            id: member.user_id,
            name: member.profiles?.full_name || 'Aluno',
            avatar: member.profiles?.avatar_url,
            class: member.classes,
            joinedAt: member.joined_at,
            createdAt: member.profiles?.created_at,
            averageGrade: Math.round(averageGrade * 10) / 10,
            totalSubmissions: submissions?.length || 0,
            pendingActivities: pendingActivities || 0,
            trend,
            isActive: grades.length > 0,
            lastActivity: submissions?.length > 0 
              ? new Date(Math.max(...submissions.map(s => new Date(s.submitted_at))))
              : null
          };
        })
      );

      setStudents(studentsWithStats);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      throw error;
    }
  };

  const loadStats = async () => {
    try {
      // As estatísticas serão calculadas após carregar os alunos
      // Por isso, vamos calcular no useEffect quando students mudar
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Calcular estatísticas quando students mudar
  useEffect(() => {
    if (students.length > 0) {
      const total = students.length;
      const active = students.filter(s => s.isActive).length;
      const inactive = total - active;
      const averageGrade = students.reduce((sum, s) => sum + s.averageGrade, 0) / total;
      const topPerformers = students.filter(s => s.averageGrade >= 8).length;
      const needsAttention = students.filter(s => s.averageGrade < 6 || s.pendingActivities > 3).length;

      setStats({
        total,
        active,
        inactive,
        averageGrade: Math.round(averageGrade * 10) / 10,
        topPerformers,
        needsAttention
      }, []); // TODO: Add dependencies
    }
  }, [students]);

  const filterStudents = () => {
    let filtered = [...students];

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por turma
    if (filterClass !== 'all') {
      filtered = filtered.filter(student => student.class?.id === filterClass);
    }

    // Filtro por status
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        filtered = filtered.filter(student => student.isActive);
      } else if (filterStatus === 'inactive') {
        filtered = filtered.filter(student => !student.isActive);
      } else if (filterStatus === 'top') {
        filtered = filtered.filter(student => student.averageGrade >= 8);
      } else if (filterStatus === 'attention') {
        filtered = filtered.filter(student => student.averageGrade < 6 || student.pendingActivities > 3);
      }
    }

    setFilteredStudents(filtered);
  };

  const exportToExcelHandler = () => {
    const data = filteredStudents.map((s) => ({
      Nome: s.name,
      Turma: s.class?.name || '',
      Média: s.averageGrade,
      Submissões: s.totalSubmissions,
      Pendentes: s.pendingActivities,
      Status: s.isActive ? 'Ativo' : 'Inativo',
      'Último Acesso': s.lastActivity ? s.lastActivity.toLocaleDateString('pt-BR') : 'Nunca',
    }));

    exportToExcel(data, `alunos_escola_${new Date().toISOString().split('T')[0]}`, 'Alunos');
  };

  const exportToPDFHandler = () => {
    const data = filteredStudents.map((s) => ({
      Nome: s.name,
      Turma: s.class?.name || '',
      Média: s.averageGrade,
      Submissões: s.totalSubmissions,
      Pendentes: s.pendingActivities,
      Status: s.isActive ? 'Ativo' : 'Inativo',
      'Último Acesso': s.lastActivity ? s.lastActivity.toLocaleDateString('pt-BR') : 'Nunca',
    }));

    exportToPDF(data, `alunos_escola_${new Date().toISOString().split('T')[0]}`, 'Alunos da Escola', ['Nome', 'Turma', 'Média', 'Submissões', 'Pendentes', 'Status', 'Último Acesso']);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPerformanceBadge = (grade) => {
    if (grade >= 9) return <Badge className="bg-green-100 text-green-700">Excelente</Badge>;
    if (grade >= 8) return <Badge className="bg-blue-100 text-blue-700">Muito Bom</Badge>;
    if (grade >= 7) return <Badge className="bg-yellow-100 text-yellow-700">Bom</Badge>;
    if (grade >= 6) return <Badge className="bg-orange-100 text-orange-700">Regular</Badge>;
    return <Badge className="bg-red-100 text-red-700">Precisa Atenção</Badge>;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r text-white hover:opacity-90 whitespace-nowrap inline-flex items-center gap-2 min-w-fit from-green-600 to-teal-600 bg-clip-text text-transparent">
            Alunos da Escola
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e acompanhe o desempenho dos alunos
          </p>
        </div>
        <div className="flex gap-3">
            <div className="flex gap-2">
              <PremiumButton onClick={exportToExcelHandler} variant="outline" className="whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border hover:bg-slate-50 dark:hover:bg-slate-800">
                <Download className="w-4 h-4" />
                <span>Excel</span>
              </PremiumButton>
              <PremiumButton onClick={exportToPDFHandler} variant="outline" className="whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border hover:bg-slate-50 dark:hover:bg-slate-800">
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </PremiumButton>
            </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Total de Alunos"
          value={stats.total}
          icon={Users}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatsCard
          title="Alunos Ativos"
          value={stats.active}
          icon={CheckCircle2}
          gradient="from-green-500 to-emerald-500"
        />
        <StatsCard
          title="Inativos"
          value={stats.inactive}
          icon={AlertTriangle}
          gradient="from-orange-500 to-red-500"
        />
        <StatsCard
          title="Média Geral"
          value={stats.averageGrade}
          icon={BarChart3}
          gradient="from-purple-500 to-pink-500"
        />
        <StatsCard
          title="Top Performers"
          value={stats.topPerformers}
          icon={Award}
          gradient="from-yellow-500 to-orange-500"
        />
        <StatsCard
          title="Precisam Atenção"
          value={stats.needsAttention}
          icon={AlertTriangle}
          gradient="from-red-500 to-pink-500"
        />
      </div>

      {/* Filters */}
      <PremiumCard className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou turma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterClass} onValueChange={setFilterClass}>
  <SelectTrigger className="bg-white dark:bg-slate-900 text-foreground border-border w-full md:w-48">
              <SelectValue placeholder="Filtrar por turma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as turmas</SelectItem>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
  <SelectTrigger className="bg-white dark:bg-slate-900 text-foreground border-border w-full md:w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
              <SelectItem value="top">Top Performers</SelectItem>
              <SelectItem value="attention">Precisam Atenção</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PremiumCard>

      {/* Students List */}
      <PremiumCard className="p-6">
        {filteredStudents.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="Nenhum aluno encontrado"
            description="Não há alunos que correspondam aos filtros selecionados."
          />
        ) : (
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-bold">
                    {student.avatar ? (
                      <img src={student.avatar} alt={student.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      student.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{student.name}</h3>
                      {getTrendIcon(student.trend)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {student.class?.name || 'Sem turma'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Entrou em {new Date(student.joinedAt).toLocaleDateString('pt-BR')}
                      </span>
                      {student.lastActivity && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Último acesso: {student.lastActivity.toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{student.averageGrade}</div>
                    <div className="text-xs text-muted-foreground">Média</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{student.totalSubmissions}</div>
                    <div className="text-xs text-muted-foreground">Submissões</div>
                  </div>
                  {student.pendingActivities > 0 && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">{student.pendingActivities}</div>
                      <div className="text-xs text-muted-foreground">Pendentes</div>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    {getPerformanceBadge(student.averageGrade)}
                    <Badge className={student.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {student.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <PremiumButton
                    size="sm"
                    variant="outline"
                    leftIcon={Eye}
                    onClick={() => navigate(`/students/${student.id}`)}
                  >
                    Ver Perfil
                  </PremiumButton>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </PremiumCard>
    </div>
  );
};

export default SchoolStudentsPage;
