import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import schoolService from '@/services/schoolService';
import {
  School,
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  BarChart3,
  Shield,
  Globe,
  Award,
  Target,
  ArrowRight,
  Plus,
  Settings,
  Bell,
  CheckCircle,
  AlertCircle,
  Activity,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const SchoolDashboardPremium = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schoolData, setSchoolData] = useState(null);
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    classes: 0,
    activities: 0,
    avgPerformance: 0,
  });
  const [recentTeachers, setRecentTeachers] = useState([]);
  const [topClasses, setTopClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 1. Buscar dados da escola usando o schoolService
      const schoolData = await schoolService.getUserSchool(user.id);
      
      if (!schoolData) {
        console.log('Nenhuma escola encontrada para o usuário');
        setLoading(false);
        return;
      }

      setSchoolData(schoolData);

      // 2. Buscar estatísticas usando o schoolService
      try {
        const dashboardStats = await schoolService.getDashboardStats(schoolData.id);
        
        setStats({
          teachers: dashboardStats.totalTeachers || 0,
          students: dashboardStats.totalStudents || 0,
          classes: dashboardStats.totalClasses || 0,
          activities: dashboardStats.submissionsLast30Days || 0,
          avgPerformance: parseFloat(dashboardStats.averageGrade) || 0,
        });

        // 3. Buscar professores usando o schoolService
        const teachersData = await schoolService.getTeachers(schoolData.id);
        setRecentTeachers(teachersData.slice(0, 5) || []);

        // 4. Buscar turmas usando o schoolService
        const classesData = await schoolService.getClasses(schoolData.id);
        setTopClasses(classesData.slice(0, 5) || []);

      } catch (statsError) {
        console.warn('Erro ao carregar estatísticas detalhadas:', statsError);
        // Usar dados básicos se as estatísticas falharem
        setStats({
          teachers: 0,
          students: 0,
          classes: 0,
          activities: 0,
          avgPerformance: 0,
        });
        setRecentTeachers([]);
        setTopClasses([]);
      }

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      // Criar escola fictícia para desenvolvimento se não encontrar nenhuma
      setSchoolData({
        id: 'temp-school',
        name: 'Minha Escola',
        logo_url: null,
        settings: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      icon: GraduationCap,
      title: 'Professores',
      value: stats.teachers,
      subtitle: 'Vinculados',
      gradient: 'from-indigo-600 to-purple-600',
    },
    {
      icon: Users,
      title: 'Alunos',
      value: stats.students,
      subtitle: 'Total na rede',
      gradient: 'from-blue-600 to-cyan-600',
    },
    {
      icon: BookOpen,
      title: 'Turmas',
      value: stats.classes,
      subtitle: 'Ativas',
      gradient: 'from-green-600 to-teal-600',
    },
    {
      icon: Target,
      title: 'Desempenho',
      value: stats.avgPerformance.toFixed(1),
      subtitle: 'Média geral',
      gradient: 'from-orange-600 to-amber-600',
    },
  ];

  const quickActions = [
    {
      icon: Plus,
      title: 'Convidar Professor',
      description: 'Adicionar novo professor',
      action: () => navigate('/school/teachers'),
      gradient: 'from-indigo-600 to-purple-600',
    },
    {
      icon: BarChart3,
      title: 'Relatórios',
      description: 'Analytics consolidado',
      action: () => navigate('/school/reports'),
      gradient: 'from-green-600 to-teal-600',
    },
    {
      icon: Settings,
      title: 'Configurações',
      description: 'Gerenciar escola',
      action: () => navigate('/school/settings'),
      gradient: 'from-orange-600 to-red-600',
    },
    {
      icon: Globe,
      title: 'Comunicação',
      description: 'Enviar avisos',
      action: () => navigate('/school/comms'),
      gradient: 'from-pink-600 to-rose-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!schoolData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-12 text-center">
            <School className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Nenhuma escola encontrada</h2>
            <p className="text-gray-600 mb-6">
              Você ainda não possui uma escola cadastrada.
            </p>
            <Button
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white"
              onClick={() => navigate('/school/settings')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Escola
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            {schoolData.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Painel de Gestão Escolar
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2">
            <Shield className="mr-2 h-4 w-4" />
            Enterprise
          </Badge>
          <Button
            variant="outline"
            onClick={() => navigate('/school/settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -mr-16 -mt-16`}></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-orange-200"
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Professores Recentes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                  Professores Recentes
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/school/teachers')}
                >
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentTeachers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Nenhum professor vinculado ainda</p>
                </div>
              ) : (
                recentTeachers.map((teacher, index) => (
                  <motion.div
                    key={teacher.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {teacher.name || 'Sem nome'}
                        </p>
                        <p className="text-sm text-gray-600">{teacher.email}</p>
                      </div>
                      <Badge className={teacher.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {teacher.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Turmas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  Turmas Mais Populares
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/school/classes')}
                >
                  Ver todas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {topClasses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Nenhuma turma criada ainda</p>
                </div>
              ) : (
                topClasses.map((cls, index) => (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/dashboard/classes/${cls.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{cls.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {cls.studentCount} alunos
                          </span>
                          <span className="text-xs text-gray-500">
                            • {cls.teacherName}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-blue-100 text-blue-700">
                          {cls.subject || 'Geral'}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Resumo Mensal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-none">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Resumo do Mês</h3>
                <p className="text-orange-100 mb-4">
                  Sua escola está crescendo! Continue assim.
                </p>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-orange-200 text-sm mb-1">Novos Alunos</p>
                    <p className="text-3xl font-bold">+{Math.floor(stats.students * 0.1)}</p>
                  </div>
                  <div>
                    <p className="text-orange-200 text-sm mb-1">Atividades</p>
                    <p className="text-3xl font-bold">{stats.activities}</p>
                  </div>
                  <div>
                    <p className="text-orange-200 text-sm mb-1">Engajamento</p>
                    <p className="text-3xl font-bold">
                      {stats.avgPerformance >= 7 ? '85%' : '70%'}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                className="bg-white text-orange-600 hover:bg-gray-100"
                onClick={() => navigate('/school/reports')}
              >
                Ver Relatório Completo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features Enterprise */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Recursos Enterprise Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">Chatbot Ilimitado</p>
                  <p className="text-xs text-gray-600">Sem limite de mensagens</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Analytics Avançado</p>
                  <p className="text-xs text-gray-600">ML e relatórios consolidados</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-semibold text-gray-900">Suporte Prioritário</p>
                  <p className="text-xs text-gray-600">Atendimento 24/7</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SchoolDashboardPremium;
