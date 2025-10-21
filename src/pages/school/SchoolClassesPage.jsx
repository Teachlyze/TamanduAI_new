import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  Users,
  TrendingUp,
  Eye,
  UserCheck,
  Calendar,
  Award,
  FileText,
  ArrowRight
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import schoolService from '@/services/schoolService';
import { useAuth } from '@/hooks/useAuth';

const SchoolClassesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadClasses();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = classes.filter(cls =>
        cls.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.teacherName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClasses(filtered);
    } else {
      setFilteredClasses(classes);
    }
  }, [searchQuery, classes]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const school = await schoolService.getUserSchool(user.id);
      if (!school?.id) throw new Error('Nenhuma escola associada ao usuário');

      const classesList = await schoolService.getClasses(school.id);

      // Map to expected shape used in UI
      const mapped = (classesList || []).map((c) => ({
        id: c.id,
        name: c.name,
        subject: c.subject,
        color: c.color,
        schedule: undefined,
        created_at: c.linkedAt,
        created_by: undefined,
        teacherName: c.teacherName,
        studentCount: c.studentCount,
        activitiesCount: undefined,
      }));

      setClasses(mapped);
      setFilteredClasses(mapped);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      toast.error('Erro ao carregar turmas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando turmas..." />;
  }

  const stats = {
    total: classes.length,
    totalStudents: classes.reduce((sum, cls) => sum + cls.studentCount, 0),
    totalActivities: classes.reduce((sum, cls) => sum + cls.activitiesCount, 0),
    avgStudentsPerClass: classes.length > 0 
      ? Math.round(classes.reduce((sum, cls) => sum + cls.studentCount, 0) / classes.length)
      : 0
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Animado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800 p-8 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">Gestão de Turmas</span>
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">Todas as Turmas 📚</h1>
          <p className="text-white/90 text-lg">Visão geral de todas as turmas da instituição</p>
        </div>

        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-10 right-20 text-6xl opacity-20"
        >
          📚
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Total de Turmas", value: stats.total, icon: BookOpen, gradient: "from-purple-600 to-indigo-700" },
          { title: "Total de Alunos", value: stats.totalStudents, icon: Users, gradient: "from-green-600 to-emerald-700" },
          { title: "Total de Atividades", value: stats.totalActivities, icon: FileText, gradient: "from-orange-600 to-red-700" },
          { title: "Média/Turma", value: stats.avgStudentsPerClass, icon: TrendingUp, gradient: "from-blue-600 to-cyan-700" }
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

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PremiumCard variant="elevated" className="p-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar turmas por nome, disciplina ou professor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-900 text-foreground border-border rounded-lg"
            />
          </div>
        </PremiumCard>
      </motion.div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        classes.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhuma turma criada"
            description="Os professores podem criar turmas"
          />
        ) : (
          <EmptyState
            icon={Search}
            title="Nenhuma turma encontrada"
            description="Tente ajustar sua busca"
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredClasses.map((classItem, index) => (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <PremiumCard
                  variant="elevated"
                  className="group relative overflow-hidden hover:scale-105 transition-all cursor-pointer"
                  onClick={() => navigate(`/school/classes/${classItem.id}`)}
                >
                  {/* Banner Colorido */}
                  <div className={`h-24 bg-gradient-to-r ${classItem.color || 'from-purple-600 to-indigo-700'} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '20px 20px'
                      }} />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white truncate">
                        {classItem.name}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-primary/10 text-primary">
                        {classItem.subject}
                      </Badge>
                      {classItem.schedule && (
                        <Badge variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {classItem.schedule}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                      <UserCheck className="w-4 h-4" />
                      <span>{classItem.teacherName}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{classItem.studentCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">{classItem.activitiesCount}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
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

export default SchoolClassesPage;
