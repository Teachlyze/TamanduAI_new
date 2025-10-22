import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Eye,
  Mail,
  TrendingUp,
  Award,
  BookOpen,
  Clock
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
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';

const SchoolStudentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    let filtered = students;

    // Filtrar por busca
    if (searchQuery) {
      filtered = filtered.filter(student =>
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por turma
    if (filterClass !== 'all') {
      filtered = filtered.filter(student =>
        student.classes?.some(c => c.id === filterClass)
      );
    }

    setFilteredStudents(filtered);
  }, [searchQuery, filterClass, students]);

  const loadData = async () => {
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
          .select('id, name, code')
          .in('id', classIds);

        setClasses(classesData || []);

        // Buscar alunos das turmas
        const { data: membersData } = await supabase
          .from('class_members')
          .select('user_id, class_id, joined_at')
          .in('class_id', classIds)
          .eq('role', 'student');

        // Buscar perfis dos alunos
        const studentIds = [...new Set(membersData?.map(m => m.user_id) || [])];
        
        if (studentIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, name, email, avatar_url, total_xp')
            .in('id', studentIds);

          // Combinar dados
          const studentsWithClasses = profilesData?.map(profile => {
            const studentClasses = membersData
              .filter(m => m.user_id === profile.id)
              .map(m => {
                const classInfo = classesData?.find(c => c.id === m.class_id);
                return {
                  id: m.class_id,
                  name: classInfo?.name,
                  code: classInfo?.code,
                  joined_at: m.joined_at
                };
              });

            return {
              ...profile,
              classes: studentClasses,
              classCount: studentClasses.length
            };
          }) || [];

          setStudents(studentsWithClasses);
          setFilteredStudents(studentsWithClasses);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      toast.error('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcelHandler = () => {
    const data = filteredStudents.map(s => ({
      Nome: s.name,
      Email: s.email,
      XP: s.total_xp || 0,
      Turmas: s.classCount,
      'Turmas (Nomes)': s.classes?.map(c => c.name).join(', ')
    }));

    exportToExcel(data, 'alunos-escola', 'Alunos da Escola');
    toast.success('Exportado para Excel!');
  };

  const exportToPDFHandler = () => {
    const data = filteredStudents.map(s => [
      s.name,
      s.email,
      s.total_xp || 0,
      s.classCount,
      s.classes?.map(c => c.name).join(', ')
    ]);

    exportToPDF(
      ['Nome', 'Email', 'XP', 'Turmas', 'Turmas (Nomes)'],
      data,
      'alunos-escola',
      'Alunos da Escola'
    );
    toast.success('Exportado para PDF!');
  };

  if (loading) {
    return <LoadingScreen message="Carregando alunos..." />;
  }

  const stats = {
    total: students.length,
    totalClasses: classes.length,
    avgClassesPerStudent: students.length > 0
      ? (students.reduce((sum, s) => sum + s.classCount, 0) / students.length).toFixed(1)
      : 0,
    totalXP: students.reduce((sum, s) => sum + (s.total_xp || 0), 0)
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Animado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-800 p-8 text-white"
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
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Gestão de Alunos</span>
            </motion.div>
            <h1 className="text-4xl font-bold mb-2">Alunos 🎓</h1>
            <p className="text-white/90 text-lg">Visualize e gerencie todos os alunos da instituição</p>
          </div>
          <div className="flex gap-2">
            <PremiumButton
              leftIcon={FileSpreadsheet}
              onClick={exportToExcelHandler}
              className="bg-white dark:bg-slate-900 text-foreground hover:bg-white/90 shadow-lg whitespace-nowrap inline-flex items-center gap-2"
            >
              Excel
            </PremiumButton>
            <PremiumButton
              leftIcon={FileText}
              onClick={exportToPDFHandler}
              className="bg-white dark:bg-slate-900 text-foreground hover:bg-white/90 shadow-lg whitespace-nowrap inline-flex items-center gap-2"
            >
              PDF
            </PremiumButton>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-10 right-20 text-6xl opacity-20"
        >
          🎓
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Total de Alunos", value: stats.total, icon: Users, gradient: "from-indigo-600 to-purple-700" },
          { title: "Turmas", value: stats.totalClasses, icon: BookOpen, gradient: "from-purple-600 to-pink-700" },
          { title: "Média Turmas/Aluno", value: stats.avgClassesPerStudent, icon: TrendingUp, gradient: "from-green-600 to-emerald-700" },
          { title: "XP Total", value: stats.totalXP.toLocaleString(), icon: Award, gradient: "from-orange-600 to-red-700" }
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

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PremiumCard variant="elevated" className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 dark:text-slate-300" />
              <Input
                placeholder="Buscar alunos por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-slate-900 text-foreground border-border"
            >
              <option value="all">Todas as turmas</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum aluno cadastrado"
            description="Os alunos aparecerão aqui quando se matricularem em turmas"
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
                  className="group relative overflow-hidden hover:scale-105 transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={student.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-lg font-bold">
                          {student.name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">
                          {student.name}
                        </h3>
                        <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{student.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-indigo-100 text-indigo-700">
                            {student.total_xp || 0} XP
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Classes */}
                    <div className="space-y-2 mb-4">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Turmas ({student.classCount})
                      </div>
                      {student.classes?.slice(0, 2).map(cls => (
                        <div key={cls.id} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {cls.name}
                        </div>
                      ))}
                      {student.classCount > 2 && (
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                          +{student.classCount - 2} outras
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <PremiumButton
                      size="sm"
                      variant="outline"
                      leftIcon={Mail}
                      onClick={() => window.location.href = `mailto:${student.email}`}
                      className="w-full whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border"
                    >
                      Enviar Email
                    </PremiumButton>
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

export default SchoolStudentsPage;
