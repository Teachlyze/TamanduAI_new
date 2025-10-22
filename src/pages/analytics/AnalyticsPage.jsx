import React, { useEffect, useRef, useState } from 'react';
  const reportRef = useRef(null);

  const handleExportPdf = async () => {
    try {
      const [{ default: html2canvas }, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule;
      const element = reportRef.current;
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let position = 0;
      let remainingHeight = imgHeight;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      remainingHeight -= pageHeight;
      while (remainingHeight > 0) {
        pdf.addPage();
        position = - (imgHeight - remainingHeight);
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        remainingHeight -= pageHeight;
      }
      pdf.save(`analytics_avancado_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error('Falha ao exportar PDF:', err);
      // Opcional: UI de toast caso exista
      // alert('Para exportar o PDF, instale as dependências: npm i jspdf html2canvas');
    }
  };
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Award, 
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    overview: {},
    classPerformance: [],
    studentEngagement: [],
    activityStats: []
  });
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Dados de exemplo para analytics
      setAnalytics({
        overview: {
          totalStudents: 156,
          totalClasses: 12,
          avgGrade: 8.4,
          completionRate: 87
        },
        classPerformance: [
          { name: 'Matemática 9A', avg: 8.7, students: 28 },
          { name: 'Português 9B', avg: 8.2, students: 25 },
          { name: 'História 8A', avg: 9.1, students: 30 }
        ],
        studentEngagement: [
          { week: 'Sem 1', engagement: 85 },
          { week: 'Sem 2', engagement: 92 },
          { week: 'Sem 3', engagement: 78 },
          { week: 'Sem 4', engagement: 88 }
        ],
        activityStats: [
          { type: 'Quiz', count: 45, avgScore: 8.3 },
          { type: 'Tarefa', count: 32, avgScore: 8.7 },
          { type: 'Projeto', count: 18, avgScore: 9.1 }
        ]
      });
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando analytics..." />;
  }

  return (
    <div ref={reportRef} className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Analytics & Relatórios
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe o desempenho e engajamento dos seus alunos
          </p>
        </div>
        
        <div className="flex gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 3 meses</option>
          </select>
          <PremiumButton leftIcon={Download} onClick={handleExportPdf}>
            Exportar PDF
          </PremiumButton>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: 'Total de Alunos', 
            value: analytics.overview.totalStudents, 
            icon: Users, 
            gradient: 'from-blue-600 to-cyan-600' 
          },
          { 
            title: 'Turmas Ativas', 
            value: analytics.overview.totalClasses, 
            icon: BookOpen, 
            gradient: 'from-green-600 to-teal-600' 
          },
          { 
            title: 'Média Geral', 
            value: analytics.overview.avgGrade?.toFixed(1), 
            icon: Award, 
            gradient: 'from-purple-600 to-pink-600' 
          },
          { 
            title: 'Taxa de Conclusão', 
            value: `${analytics.overview.completionRate}%`, 
            icon: TrendingUp, 
            gradient: 'from-orange-600 to-red-600' 
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PremiumCard className="p-6 relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -mr-16 -mt-16`}></div>
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6 text-slate-900 dark:text-white" />
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </div>
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desempenho por Turma */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PremiumCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold">Desempenho por Turma</h3>
            </div>
            <div className="space-y-4">
              {analytics.classPerformance.map((cls, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{cls.name}</p>
                    <p className="text-sm text-muted-foreground">{cls.students} alunos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{cls.avg}</p>
                    <p className="text-xs text-muted-foreground">Média</p>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        </motion.div>

        {/* Engajamento Semanal */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PremiumCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold">Engajamento Semanal</h3>
            </div>
            <div className="space-y-4">
              {analytics.studentEngagement.map((week, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{week.week}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full"
                        style={{ width: `${week.engagement}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-green-600">{week.engagement}%</span>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        </motion.div>
      </div>

      {/* Estatísticas de Atividades */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <PremiumCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold">Estatísticas de Atividades</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analytics.activityStats.map((activity, index) => (
              <div key={index} className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">{activity.count}</div>
                <div className="font-medium mb-1">{activity.type}</div>
                <div className="text-sm text-muted-foreground">
                  Média: {activity.avgScore}
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
