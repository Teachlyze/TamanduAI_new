import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Search,
  Filter,
  Users,
  BookOpen,
  TrendingUp,
  Mail,
  Phone,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  MoreVertical,
  Award,
  Calendar
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
import schoolService from '@/services/schoolService';
import { useAuth } from '@/hooks/useAuth';

const SchoolTeachersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive

  useEffect(() => {
    if (user) {
      loadTeachers();
    }
  }, [user]);

  useEffect(() => {
    let filtered = teachers;

    // Filtrar por busca
    if (searchQuery) {
      filtered = filtered.filter(teacher =>
        teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(teacher => 
        filterStatus === 'active' ? teacher.isActive : !teacher.isActive
      );
    }

    setFilteredTeachers(filtered);
  }, [searchQuery, filterStatus, teachers]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const school = await schoolService.getUserSchool(user.id);
      if (!school?.id) throw new Error('Nenhuma escola associada ao usuário');

      // Buscar professores vinculados à escola
      const teachersData = await schoolService.getTeachers(school.id);

      // Para cada professor, buscar estatísticas
      const teachersWithStats = await Promise.all(
        (teachersData || []).map(async (teacher) => {
          // Buscar turmas
          const { count: classesCount } = await supabase
            .from('classes')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', teacher.id);

          // Buscar alunos
          const { data: classes } = await supabase
            .from('classes')
            .select('id')
            .eq('created_by', teacher.id);

          let studentsCount = 0;
          if (classes && classes.length > 0) {
            const classIds = classes.map(c => c.id);
            const { count } = await supabase
              .from('class_members')
              .select('*', { count: 'exact', head: true })
              .in('class_id', classIds)
              .eq('role', 'student');
            studentsCount = count || 0;
          }

          // Buscar atividades
          const { count: activitiesCount } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', teacher.id);

          return {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            avatar_url: teacher.avatar,
            classesCount: classesCount || 0,
            studentsCount,
            activitiesCount: activitiesCount || 0,
            isActive: (classesCount || 0) > 0
          };
        })
      );

      setTeachers(teachersWithStats);
      setFilteredTeachers(teachersWithStats);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
      toast.error('Erro ao carregar professores');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando professores..." />;
  }

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.isActive).length,
    inactive: teachers.filter(t => !t.isActive).length,
    totalClasses: teachers.reduce((sum, t) => sum + t.classesCount, 0),
    totalStudents: teachers.reduce((sum, t) => sum + t.studentsCount, 0)
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Animado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 p-8 text-white"
      >
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
              <UserCheck className="w-4 h-4" />
              <span className="text-sm font-medium">Gestão de Professores</span>
            </motion.div>
            <h1 className="text-4xl font-bold mb-2">Corpo Docente 👨‍🏫</h1>
            <p className="text-white/90 text-lg">Gerencie todos os professores da instituição</p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
          >
            <PremiumButton
              leftIcon={UserPlus}
              onClick={() => navigate('/school/teachers/new')}
              className="bg-white text-blue-600 hover:bg-white/90 shadow-lg whitespace-nowrap inline-flex items-center gap-2 font-semibold"
            >
              Novo Professor
            </PremiumButton>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-10 right-20 text-6xl opacity-20"
        >
          👨‍🏫
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { title: "Total", value: stats.total, icon: Users, gradient: "from-blue-600 to-indigo-700" },
          { title: "Ativos", value: stats.active, icon: UserCheck, gradient: "from-green-600 to-emerald-700" },
          { title: "Inativos", value: stats.inactive, icon: Users, gradient: "from-gray-500 to-slate-600" },
          { title: "Turmas Total", value: stats.totalClasses, icon: BookOpen, gradient: "from-purple-600 to-indigo-700" },
          { title: "Alunos Total", value: stats.totalStudents, icon: TrendingUp, gradient: "from-orange-600 to-red-700" }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PremiumCard variant="elevated" className="relative overflow-hidden group hover:scale-105 transition-transform">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <div className="relative p-6">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white mb-2`}>
                  <stat.icon className="w-6 h-6" />
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
                placeholder="Buscar professores por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'inactive'].map((status) => (
                <PremiumButton
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  leftIcon={Filter}
                  className="whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border"
                >
                  {status === 'all' ? 'Todos' : status === 'active' ? 'Ativos' : 'Inativos'}
                </PremiumButton>
              ))}
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Teachers Grid */}
      {filteredTeachers.length === 0 ? (
        teachers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum professor cadastrado"
            description="Adicione o primeiro professor à sua instituição"
            action={{
              label: "Adicionar Professor",
              onClick: () => navigate('/school/teachers/new')
            }}
          />
        ) : (
          <EmptyState
            icon={Search}
            title="Nenhum professor encontrado"
            description="Tente ajustar sua busca ou filtros"
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredTeachers.map((teacher, index) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <PremiumCard
                  variant="elevated"
                  className="group relative overflow-hidden hover:scale-105 transition-all cursor-pointer"
                  onClick={() => navigate(`/school/teachers/${teacher.id}`)}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={teacher.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-lg font-bold">
                          {teacher.name?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                          {teacher.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{teacher.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={teacher.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {teacher.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{teacher.classesCount}</div>
                        <div className="text-xs text-muted-foreground">Turmas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{teacher.studentsCount}</div>
                        <div className="text-xs text-muted-foreground">Alunos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{teacher.activitiesCount}</div>
                        <div className="text-xs text-muted-foreground">Atividades</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        leftIcon={Eye}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/school/teachers/${teacher.id}`);
                        }}
                        className="flex-1"
                      >
                        Ver Perfil
                      </PremiumButton>
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        leftIcon={Mail}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `mailto:${teacher.email}`;
                        }}
                      >
                        <Mail className="w-4 h-4" />
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

export default SchoolTeachersPage;
