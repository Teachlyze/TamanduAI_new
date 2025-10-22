import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Users,
  Calendar,
  TrendingUp,
  Eye,
  Settings,
  Plus,
  UserCheck,
  Activity
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
    let filtered = classes;

    if (searchQuery) {
      filtered = filtered.filter(cls =>
        cls.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredClasses(filtered);
  }, [searchQuery, classes]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const school = await schoolService.getUserSchool(user.id);
      if (!school?.id) throw new Error('Nenhuma escola associada ao usuário');

      // Buscar turmas da escola
      const { data: schoolClasses } = await supabase
        .from('school_classes')
        .select('class_id')
        .eq('school_id', school.id);

      const classIds = schoolClasses?.map(sc => sc.class_id) || [];

      if (classIds.length > 0) {
        // Buscar detalhes das turmas
        const { data: classesData } = await supabase
          .from('classes')
          .select('id, name, code, subject, description, created_by, created_at')
          .in('id', classIds);

        // Buscar professores
        const teacherIds = [...new Set(classesData?.map(c => c.created_by) || [])];
        const { data: teachers } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', teacherIds);

        // Buscar contagem de alunos por turma
        const classesWithData = await Promise.all(
          (classesData || []).map(async (cls) => {
            // Contar alunos
            const { count: studentsCount } = await supabase
              .from('class_members')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', cls.id)
              .eq('role', 'student');

            // Contar atividades
            const { count: activitiesCount } = await supabase
              .from('activities')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', cls.id);

            const teacher = teachers?.find(t => t.id === cls.created_by);

            return {
              ...cls,
              studentsCount: studentsCount || 0,
              activitiesCount: activitiesCount || 0,
              teacher_name: teacher?.name,
              teacher_avatar: teacher?.avatar_url
            };
          })
        );

        setClasses(classesWithData);
        setFilteredClasses(classesWithData);
      }
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
    totalStudents: classes.reduce((sum, c) => sum + c.studentsCount, 0),
    totalActivities: classes.reduce((sum, c) => sum + c.activitiesCount, 0),
    avgStudentsPerClass: classes.length > 0
      ? (classes.reduce((sum, c) => sum + c.studentsCount, 0) / classes.length).toFixed(1)
      : 0
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Animado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 p-8 text-white"
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
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">Gestão de Turmas</span>
            </motion.div>
            <h1 className="text-4xl font-bold mb-2">Turmas 📚</h1>
            <p className="text-white/90 text-lg">Visualize todas as turmas da instituição</p>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-10 right-20 text-6xl opacity-20"
        >
          📚
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Total de Turmas", value: stats.total, icon: BookOpen, gradient: "from-purple-600 to-pink-700" },
          { title: "Total de Alunos", value: stats.totalStudents, icon: Users, gradient: "from-blue-600 to-indigo-700" },
          { title: "Total de Atividades", value: stats.totalActivities, icon: Activity, gradient: "from-green-600 to-emerald-700" },
          { title: "Média Alunos/Turma", value: stats.avgStudentsPerClass, icon: TrendingUp, gradient: "from-orange-600 to-red-700" }
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
                <div className="text-sm text-slate-700 dark:text-slate-300">{stat.title}</div>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 dark:text-slate-300" />
            <Input
              placeholder="Buscar turmas por nome, código ou professor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </PremiumCard>
      </motion.div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        classes.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhuma turma cadastrada"
            description="As turmas criadas pelos professores aparecerão aqui"
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
            {filteredClasses.map((cls, index) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <PremiumCard
                  variant="elevated"
                  className="group relative overflow-hidden hover:scale-105 transition-all cursor-pointer"
                  onClick={() => navigate(`/dashboard/classes/${cls.id}`)}
                >
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg line-clamp-2">
                          {cls.name}
                        </h3>
                        <Badge className="bg-purple-100 text-purple-700">
                          {cls.code}
                        </Badge>
                      </div>
                      {cls.subject && (
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                          {cls.subject}
                        </p>
                      )}
                      {cls.description && (
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                          {cls.description}
                        </p>
                      )}
                    </div>

                    {/* Teacher */}
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                      <UserCheck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {cls.teacher_name || 'Professor não encontrado'}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{cls.studentsCount}</div>
                        <div className="text-xs text-slate-700 dark:text-slate-300">Alunos</div>
                      </div>
                      <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{cls.activitiesCount}</div>
                        <div className="text-xs text-slate-700 dark:text-slate-300">Atividades</div>
                      </div>
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
