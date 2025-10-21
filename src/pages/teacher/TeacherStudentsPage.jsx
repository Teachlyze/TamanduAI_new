import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  BookOpen,
  BarChart3,
  Mail,
  MessageSquare,
  Eye,
  UserPlus
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

const TeacherStudentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPerformance, setFilterPerformance] = useState('all'); // all, excellent, good, attention

  useEffect(() => {
    if (user) {
      loadStudents();
    }
  }, [user]);

  useEffect(() => {
    let filtered = students;

    // Filtrar por busca
    if (searchQuery) {
      filtered = filtered.filter(student =>
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.className?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por desempenho
    if (filterPerformance !== 'all') {
      filtered = filtered.filter(student => {
        const avg = student.averageGrade || 0;
        switch (filterPerformance) {
          case 'excellent':
            return avg >= 9;
          case 'good':
            return avg >= 7 && avg < 9;
          case 'attention':
            return avg < 7;
          default:
            return true;
        }
      });
    }

    setFilteredStudents(filtered);
  }, [searchQuery, filterPerformance, students]);

  const loadStudents = async () => {
    try {
      setLoading(true);

      // Buscar turmas do professor
      const { data: classes } = await supabase
        .from('classes')
        .select('id, name, subject')
        .eq('created_by', user.id);

      if (!classes || classes.length === 0) {
        setStudents([]);
        setFilteredStudents([]);
        setLoading(false);
        return;
      }

      const classIds = classes.map(c => c.id);

      // Buscar alunos das turmas
      const { data: members, error: membersError } = await supabase
        .from('class_members')
        .select(`
          user_id,
          class_id,
          classes(id, name, subject),
          profiles:user_id(id, full_name, email, avatar_url)
        `)
        .in('class_id', classIds)
        .eq('role', 'student');

      if (membersError) throw membersError;

      // Para cada aluno, buscar estatísticas
      const studentsWithStats = await Promise.all(
        (members || []).map(async (member) => {
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
          let trend = 'neutral';
          if (grades.length >= 6) {
            const recent = grades.slice(-3).reduce((a, b) => a + b, 0) / 3;
            const previous = grades.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
            if (recent > previous + 0.5) trend = 'up';
            else if (recent < previous - 0.5) trend = 'down';
          }

          return {
            id: studentId,
            name: member.profiles?.name || 'Sem nome',
            email: member.profiles?.email || '',
            avatar_url: member.profiles?.avatar_url,
            className: member.classes?.name || '',
            classSubject: member.classes?.subject || '',
            classId: member.class_id,
            totalSubmissions: submissions?.length || 0,
            averageGrade: averageGrade,
            trend: trend
          };
        })
      );

      setStudents(studentsWithStats);
      setFilteredStudents(studentsWithStats);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      toast.error('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (grade) => {
    if (grade >= 9) return 'from-green-500 to-emerald-500';
    if (grade >= 7) return 'from-blue-500 to-cyan-500';
    if (grade >= 5) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getPerformanceLabel = (grade) => {
    if (grade >= 9) return 'Excelente';
    if (grade >= 7) return 'Bom';
    if (grade >= 5) return 'Regular';
    return 'Precisa Atenção';
  };

  if (loading) {
    return <LoadingScreen message="Carregando alunos..." />;
  }

  const stats = {
    total: students.length,
    excellent: students.filter(s => s.averageGrade >= 9).length,
    good: students.filter(s => s.averageGrade >= 7 && s.averageGrade < 9).length,
    attention: students.filter(s => s.averageGrade < 7).length,
    averageClass: students.length > 0
      ? students.reduce((sum, s) => sum + s.averageGrade, 0) / students.length
      : 0
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Animado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-8 text-white"
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
              className="whitespace-nowrap inline-flex items-center gap-2 min-w-fit bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="text-sm font-medium">Gestão de Alunos</span>
            </motion.div>
            <h1 className="text-4xl font-bold mb-2">Meus Alunos 🎓</h1>
            <p className="text-white/90 text-lg">Acompanhe o desempenho e evolução dos seus alunos</p>
          </div>
        </div>

        {/* Floating Icon */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-10 right-20 text-6xl opacity-20"
        >
          🎓
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          {
            title: "Total de Alunos",
            value: stats.total,
            icon: GraduationCap,
            gradient: "from-green-500 to-emerald-500"
          },
          {
            title: "Excelentes (≥9)",
            value: stats.excellent,
            icon: Award,
            gradient: "from-yellow-500 to-orange-500"
          },
          {
            title: "Bons (7-9)",
            value: stats.good,
            icon: TrendingUp,
            gradient: "from-blue-500 to-cyan-500"
          },
          {
            title: "Precisam Atenção (<7)",
            value: stats.attention,
            icon: Clock,
            gradient: "from-red-500 to-pink-500",
            urgent: stats.attention > 0
          },
          {
            title: "Média Geral",
            value: stats.averageClass.toFixed(1),
            icon: BarChart3,
            gradient: "from-purple-500 to-indigo-500"
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PremiumCard 
              variant="elevated" 
              className={`relative overflow-hidden group hover:scale-105 transition-transform ${
                stat.urgent ? 'border-2 border-red-300 dark:border-red-700' : ''
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </div>
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PremiumCard variant="elevated" className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar alunos por nome, email ou turma..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'excellent', 'good', 'attention'].map((filter) => (
                <PremiumButton
                  key={filter}
                  variant={filterPerformance === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterPerformance(filter)}
                  className="whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2 bg-white dark:bg-slate-900 text-foreground border-border rounded-lg"
                >
                  {filter === 'all' ? 'Todos' : 
                   filter === 'excellent' ? 'Excelentes' :
                   filter === 'good' ? 'Bons' : 'Atenção'}
                </PremiumButton>
              ))}
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        students.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="Nenhum aluno cadastrado"
            description="Seus alunos aparecerão aqui quando se matricularem nas turmas"
          />
        ) : (
          <EmptyState
            icon={Search}
            title="Nenhum aluno encontrado"
            description="Tente ajustar sua busca ou filtros"
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <PremiumCard
                  variant="elevated"
                  className="group relative overflow-hidden hover:scale-105 transition-all cursor-pointer"
                  onClick={() => navigate(`/dashboard/teacher/students/${student.id}`)}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={student.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white text-lg font-bold">
                          {student.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                          {student.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border text-xs">
                            {student.className}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Performance */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Média</span>
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getPerformanceColor(student.averageGrade)}`}>
                            {student.averageGrade.toFixed(1)}
                          </div>
                          {student.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                          {student.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge className={`${
                          student.averageGrade >= 9 ? 'bg-green-100 text-green-700' :
                          student.averageGrade >= 7 ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {getPerformanceLabel(student.averageGrade)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Submissões</span>
                        <span className="font-medium">{student.totalSubmissions}</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-4 border-t border-border">
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        leftIcon={Eye}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/students/${student.id}`);
                        }}
                        className="flex-1 whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2 bg-white dark:bg-slate-900 text-foreground border-border rounded-lg"
                      >
                        Ver Perfil
                      </PremiumButton>
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        leftIcon={MessageSquare}
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success('Mensagem enviada!');
                        }}
                        className="whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-3 py-2 bg-white dark:bg-slate-900 text-foreground border-border rounded-lg"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </PremiumButton>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default TeacherStudentsPage;
