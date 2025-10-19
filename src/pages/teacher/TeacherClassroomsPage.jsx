import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  BookOpen,
  TrendingUp,
  Calendar,
  Share2,
  Settings,
  ArrowRight,
  Filter,
  Grid,
  List,
  Sparkles
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

const TeacherClassroomsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  useEffect(() => {
    if (user) {
      loadClasses();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = classes.filter(cls =>
        cls.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClasses(filtered);
    } else {
      setFilteredClasses(classes);
    }
  }, [searchQuery, classes]);

  const loadClasses = async () => {
    try {
      setLoading(true);

      // Buscar turmas do professor
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (classesError) throw classesError;

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

          return {
            ...cls,
            studentsCount: studentsResult.count || 0,
            activitiesCount: activitiesResult.count || 0
          };
        })
      );

      setClasses(classesWithCounts);
      setFilteredClasses(classesWithCounts);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      toast.error('Erro ao carregar turmas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando suas turmas..." />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Animado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-8 text-white"
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
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Gestão de Turmas</span>
            </motion.div>
            <h1 className="text-4xl font-bold mb-2">Minhas Turmas 📚</h1>
            <p className="text-white/90 text-lg">Gerencie suas turmas, alunos e atividades</p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
          >
            <PremiumButton
              leftIcon={Plus}
              onClick={() => navigate('/dashboard/teacher/classes/new')}
              className="bg-white text-blue-600 hover:bg-white/90 shadow-lg whitespace-nowrap inline-flex items-center gap-2 font-semibold border-2 border-white/20"
            >
              Nova Turma
            </PremiumButton>
          </motion.div>
        </div>

        {/* Floating Icon */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-10 right-20 text-6xl opacity-20"
        >
          📚
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Total de Turmas",
            value: classes.length,
            icon: BookOpen,
            gradient: "from-blue-500 to-cyan-500"
          },
          {
            title: "Total de Alunos",
            value: classes.reduce((sum, cls) => sum + (cls.studentsCount || 0), 0),
            icon: Users,
            gradient: "from-green-500 to-emerald-500"
          },
          {
            title: "Atividades Criadas",
            value: classes.reduce((sum, cls) => sum + (cls.activitiesCount || 0), 0),
            icon: TrendingUp,
            gradient: "from-purple-500 to-pink-500"
          }
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

      {/* Search and View Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PremiumCard variant="elevated" className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar turmas por nome ou disciplina..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <PremiumButton
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                leftIcon={Grid}
                className="whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border"
              >
                Grade
              </PremiumButton>
              <PremiumButton
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                leftIcon={List}
                className="whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border"
              >
                Lista
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Classes Grid/List */}
      {filteredClasses.length === 0 ? (
        classes.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhuma turma criada"
            description="Crie sua primeira turma para começar a gerenciar alunos e atividades"
            action={{
              label: "Criar Primeira Turma",
              onClick: () => navigate('/dashboard/teacher/classes/new')
            }}
          />
        ) : (
          <EmptyState
            icon={Search}
            title="Nenhuma turma encontrada"
            description="Tente ajustar sua busca"
          />
        )
      ) : (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
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
                  onClick={() => navigate(`/dashboard/teacher/classes/${classItem.id}`)}
                >
                  {/* Banner Colorido */}
                  <div className={`h-24 bg-gradient-to-r ${classItem.color || 'from-blue-500 to-cyan-500'} relative overflow-hidden`}>
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
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {classItem.schedule}
                        </Badge>
                      )}
                    </div>

                    {classItem.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {classItem.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{classItem.studentsCount}</span>
                          <span className="text-muted-foreground">alunos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">{classItem.activitiesCount}</span>
                          <span className="text-muted-foreground">atividades</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-4">
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        leftIcon={Share2}
                        onClick={() => {
                          navigator.clipboard.writeText(classItem.invite_code);
                          toast.success('Código copiado!');
                        }}
                        className="flex-1 whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border rounded-lg"
                      >
                        Convidar
                      </PremiumButton>
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        leftIcon={Settings}
                        onClick={() => {
                          navigate(`/dashboard/teacher/classes/${classItem.id}/settings`);
                        }}
                        className="whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border rounded-lg"
                      >
                        <Settings className="w-4 h-4" />
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

export default TeacherClassroomsPage;
