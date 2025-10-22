import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import {
  Trophy,
  Target,
  BookOpen,
  Calendar,
  TrendingUp,
  Award,
  Zap,
  Brain,
  MessageCircle,
  CheckCircle,
  Clock,
  Star,
  Flame,
  ArrowRight,
  FileText,
  Bell,
  Plus,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
// import analyticsML from '@/services/analyticsML';

const StudentDashboardPremium = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    classes: 0,
    activities: 0,
    pending: 0,
    completed: 0,
    avgGrade: 0,
  });
  const [gamification, setGamification] = useState({
    xp: 0,
    level: 1,
    streak: 0,
    badges: [],
    rankPosition: 0,
  });
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Dados básicos de exemplo para evitar erros de RLS
      setStats({
        classes: 3,
        activities: 12,
        pending: 4,
        completed: 8,
        avgGrade: 8.5,
      });

      setGamification({
        xp: 1250,
        level: 5,
        streak: 7,
        badges: [],
        rankPosition: 12,
      });

      // Atividades de exemplo
      setUpcomingActivities([
        {
          id: '1',
          title: 'Exercícios de Matemática',
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          class_name: 'Matemática 9º Ano'
        },
        {
          id: '2', 
          title: 'Redação sobre Literatura',
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          class_name: 'Português'
        },
        {
          id: '3',
          title: 'Projeto de Ciências',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          class_name: 'Ciências'
        }
      ]);

      // Notas recentes de exemplo
      setRecentGrades([
        {
          id: '1',
          grade: 9.5,
          activities: { title: 'Quiz de História' }
        },
        {
          id: '2',
          grade: 8.0,
          activities: { title: 'Trabalho de Geografia' }
        },
        {
          id: '3',
          grade: 9.0,
          activities: { title: 'Prova de Matemática' }
        }
      ]);

      // Dados de exemplo para previsões
      setPredictions({
        success: true,
        prediction: {
          nextGrade: 8.7,
          trend: 'improving',
          approvalProbability: 92
        },
        status: {
          isAtRisk: false
        },
        confidence: 85,
        recommendations: [
          'Continue praticando exercícios de matemática',
          'Revise os conceitos de literatura',
          'Participe mais das discussões em sala'
        ]
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular XP para próximo nível
  const xpForNextLevel = gamification.level * 100;
  const xpProgress = (gamification.xp % 100) / xpForNextLevel * 100;

  const statsCards = [
    {
      icon: Trophy,
      title: 'Nível',
      value: gamification.level,
      subtitle: `${gamification.xp} XP total`,
      gradient: 'from-yellow-500 to-orange-500',
      progress: xpProgress,
    },
    {
      icon: Target,
      title: 'Média Geral',
      value: stats.avgGrade.toFixed(1),
      subtitle: 'de 10.0',
      gradient: 'from-green-500 to-teal-500',
      trend: predictions?.prediction?.trend,
    },
    {
      icon: BookOpen,
      title: 'Atividades',
      value: stats.pending,
      subtitle: 'Pendentes',
      gradient: 'from-blue-500 to-cyan-500',
      alert: stats.pending > 5,
    },
    {
      icon: Flame,
      title: 'Sequência',
      value: gamification.streak,
      subtitle: 'Dias consecutivos',
      gradient: 'from-red-500 to-pink-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Olá, Estudante! 🎓
          </h1>
          <p className="text-gray-600 mt-2">
            Continue aprendendo e alcançando suas metas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2">
            <Trophy className="mr-2 h-4 w-4" />
            Nível {gamification.level}
          </Badge>
          {gamification.streak > 0 && (
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2">
              <Flame className="mr-2 h-4 w-4" />
              {gamification.streak} dias
            </Badge>
          )}
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
                <div className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  {stat.value}
                  {stat.trend === 'improving' && (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                {stat.progress !== undefined && stat.progress > 0 && (
                  <div className="mt-3">
                    <Progress value={stat.progress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round(stat.progress)}% para o próximo nível
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Previsão de Desempenho (ML) */}
      {predictions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-6 w-6" />
                    <h3 className="text-xl font-bold">Previsão de IA</h3>
                    <Badge className="bg-white/20 text-white border-none">
                      Machine Learning
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-indigo-200 text-sm mb-1">Próxima Nota</p>
                      <p className="text-3xl font-bold">{predictions.prediction.nextGrade}</p>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-sm mb-1">Tendência</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold capitalize">
                          {predictions.prediction.trend === 'improving' ? '📈 Melhorando' : 
                           predictions.prediction.trend === 'declining' ? '📉 Caindo' : '➡️ Estável'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-sm mb-1">Chance de Aprovação</p>
                      <p className="text-3xl font-bold">{predictions.prediction.approvalProbability}%</p>
                    </div>
                  </div>

                  {predictions.status.isAtRisk && (
                    <div className="mt-4 bg-red-500/20 border border-red-300 rounded-lg p-3">
                      <p className="text-sm font-semibold">⚠️ Atenção: Você está em risco de reprovação</p>
                      <p className="text-xs mt-1 text-indigo-100">Recomendamos revisar os materiais e pedir ajuda ao professor</p>
                    </div>
                  )}
                </div>
                <Button
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                  onClick={() => navigate('/students/activities')}
                >
                  Ver Detalhes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Próximas Atividades */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Próximas Atividades
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/students/activities')}
                >
                  Ver todas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>Tudo em dia! 🎉</p>
                </div>
              ) : (
                upcomingActivities.map((activity, index) => {
                  const daysUntil = Math.ceil(
                    (new Date(activity.due_date) - new Date()) / (1000 * 60 * 60 * 24)
                  );
                  const isUrgent = daysUntil <= 2;

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${
                        isUrgent ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                      }`}
                      onClick={() => navigate(`/dashboard/activities/${activity.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600">{activity.classes.name}</p>
                        </div>
                        <Badge
                          className={
                            isUrgent
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {daysUntil} {daysUntil === 1 ? 'dia' : 'dias'}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Notas Recentes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Notas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentGrades.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Nenhuma nota ainda</p>
                </div>
              ) : (
                recentGrades.map((submission, index) => {
                  const grade = parseFloat(submission.grade);
                  const gradeColor =
                    grade >= 9.0
                      ? 'text-green-600 bg-green-100'
                      : grade >= 7.0
                      ? 'text-blue-600 bg-blue-100'
                      : grade >= 5.0
                      ? 'text-yellow-600 bg-yellow-100'
                      : 'text-red-600 bg-red-100';

                  return (
                    <motion.div
                      key={submission.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(`/dashboard/activities/${submission.activity_id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {submission.activities.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(submission.submitted_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${gradeColor}`}>
                          {grade.toFixed(1)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Badges Conquistadas */}
      {gamification.badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Suas Conquistas ({gamification.badges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {gamification.badges.map((badge, index) => (
                  <motion.div
                    key={badge.badge_id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="text-4xl mb-2">{badge.badges_catalog.icon || '🏆'}</div>
                    <p className="text-xs font-semibold text-center text-gray-900">
                      {badge.badges_catalog.name}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="grid md:grid-cols-3 gap-4">
          <Card
            className="cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-200"
            onClick={() => navigate('/dashboard/chatbot')}
          >
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-purple-600" />
              <h3 className="font-bold text-lg mb-1">Tirar Dúvidas</h3>
              <p className="text-sm text-gray-600">Chatbot 24/7 com IA</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-green-200"
            onClick={() => navigate('/dashboard/calendar')}
          >
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-green-600" />
              <h3 className="font-bold text-lg mb-1">Minha Agenda</h3>
              <p className="text-sm text-gray-600">Ver prazos e eventos</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-200"
            onClick={() => navigate('/students/gamification')}
          >
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-3 text-yellow-600" />
              <h3 className="font-bold text-lg mb-1">Rankings</h3>
              <p className="text-sm text-gray-600">Ver sua posição</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboardPremium;
