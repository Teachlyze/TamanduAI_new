import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen,
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  Filter,
  Eye,
  PieChart,
  Activity,
  ChevronDown,
  ArrowUpRight,
  Target,
  Clock,
  Award,
  Brain
} from 'lucide-react';
// Lazy loaded imports
import { loadExcelJS } from '@/utils/lazyLoaders';
import useUserRole from '@/hooks/useUserRole';

const ReportsPage = () => {
  const { isTeacher } = useUserRole();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedClass, setSelectedClass] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [reportData, setReportData] = useState({
    totalStudents: 0,
    totalActivities: 0,
    averageGrade: 0,
    completionRate: 0,
    topStudents: [],
    activityStats: [],
    classPerformance: []
  });

  // Fechar o menu quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isExportMenuOpen && !event.target.closest('.export-menu-container')) {
        setIsExportMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportMenuOpen]);

  const toggleExportMenu = () => {
    setIsExportMenuOpen(!isExportMenuOpen);
  };

  const handleExport = (type) => {
    setIsExportMenuOpen(false);
    handleAction(`export:${type}`);
  };

  // Load classes for current teacher
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('id, name')
          .eq('created_by', user.id)
          .eq('is_active', true)
          .order('name');
        if (error) throw error;
        setClasses([ { id: 'all', name: 'Todas as Turmas' }, ...(data || []) ]);
      } catch (e) {
        console.error('Erro ao carregar turmas:', e);
      }
    })();
  }, [user]);

  // Compute start date by selectedPeriod
  const getDateFilter = () => {
    const now = new Date();
    const base = new Date(now);
    switch (selectedPeriod) {
      case 'week':
        base.setDate(now.getDate() - 7);
        return base;
      case 'quarter':
        base.setMonth(now.getMonth() - 3);
        return base;
      case 'year':
        base.setFullYear(now.getFullYear() - 1);
        return base;
      case 'month':
      default:
        base.setMonth(now.getMonth() - 1);
        return base;
    }
  };

  // Load report data (activities, submissions, members)
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        const startDate = getDateFilter();

        // Filter classes for this teacher
        let classQuery = supabase
          .from('classes')
          .select('id, name')
          .eq('created_by', user.id)
          .eq('is_active', true);
        if (selectedClass !== 'all') classQuery = classQuery.eq('id', selectedClass);
        const { data: classesData, error: classesError } = await classQuery;
        if (classesError) throw classesError;
        const classIds = (classesData || []).map(c => c.id);
        if (classIds.length === 0) {
          setReportData({
            totalStudents: 0,
            totalActivities: 0,
            averageGrade: 0,
            completionRate: 0,
            topStudents: [],
            activityStats: [],
            classPerformance: []
          });
          setLoading(false);
          return;
        }

        // Members (students only) for these classes
        const { data: members, error: membersError } = await supabase
          .from('class_members')
          .select('user_id, class_id, profiles:user_id(id, full_name, avatar_url)')
          .in('class_id', classIds)
          .eq('role', 'student');
        if (membersError) throw membersError;
        const studentIds = [...new Set((members || []).map(m => m.user_id))];

        // Activities assigned to these classes created by this user within date range
        const { data: activityAssignments, error: activitiesError } = await supabase
          .from('activity_class_assignments')
          .select(`
            activity_id,
            class_id,
            activities!inner(
              id,
              title,
              due_date,
              max_score,
              created_by,
              created_at
            )
          `)
          .in('class_id', classIds)
          .eq('activities.created_by', user.id)
          .gte('activities.created_at', startDate.toISOString());
        if (activitiesError) throw activitiesError;
        const activities = (activityAssignments || []).map(a => ({
          id: a.activities.id,
          title: a.activities.title,
          due_date: a.activities.due_date,
          max_score: a.activities.max_score,
          class_id: a.class_id
        }));
        const activityIds = activities.map(a => a.id);

        // Submissions for those activities from those students
        const { data: submissions, error: submissionsError } = await supabase
          .from('submissions')
          .select('id, activity_id, student_id, grade, submitted_at, status')
          .in('activity_id', activityIds)
          .in('student_id', studentIds);
        if (submissionsError) throw submissionsError;

        // Compute KPIs
        const totalStudents = studentIds.length;
        const totalActivities = activities.length;
        const graded = (submissions || []).filter(s => s.grade !== null);
        const averageGrade = graded.length > 0
          ? graded.reduce((sum, s) => sum + Number(s.grade || 0), 0) / graded.length
          : 0;
        const expectedSubmissions = totalStudents * totalActivities;
        const completedSubmissions = (submissions || []).filter(s => s.status === 'graded' || s.status === 'submitted').length;
        const completionRate = expectedSubmissions > 0 ? (completedSubmissions / expectedSubmissions) * 100 : 0;

        // Top students
        const studentGrades = {};
        for (const s of graded) {
          if (!studentGrades[s.student_id]) studentGrades[s.student_id] = { total: 0, count: 0 };
          studentGrades[s.student_id].total += Number(s.grade || 0);
          studentGrades[s.student_id].count += 1;
        }
        const topStudents = Object.entries(studentGrades)
          .map(([studentId, data]) => {
            const profile = (members || []).find(m => m.user_id === studentId)?.profiles;
            return {
              id: studentId,
              name: profile?.full_name || 'Aluno',
              avatar: profile?.avatar_url,
              average: data.total / data.count,
              activities: data.count
            };
          })
          .sort((a, b) => b.average - a.average)
          .slice(0, 10);

        // Per-activity stats
        const activityStats = activities.map(activity => {
          const subs = (submissions || []).filter(s => s.activity_id === activity.id);
          const gradedSubs = subs.filter(s => s.grade !== null);
          const avgScore = gradedSubs.length > 0 ? gradedSubs.reduce((sum, s) => sum + Number(s.grade || 0), 0) / gradedSubs.length : 0;
          return {
            id: activity.id,
            title: activity.title,
            submissions: subs.length,
            avgScore: avgScore.toFixed(1),
            dueDate: activity.due_date
          };
        });

        // Per-class aggregation
        const classPerformance = (classesData || []).map(cls => {
          const classMembers = (members || []).filter(m => m.class_id === cls.id);
          const classActivities = activities.filter(a => a.class_id === cls.id);
          const classActivityIds = classActivities.map(a => a.id);
          const classSubs = (submissions || []).filter(s => classActivityIds.includes(s.activity_id));
          const gradedClassSubs = classSubs.filter(s => s.grade !== null);
          const avgGrade = gradedClassSubs.length > 0 ? gradedClassSubs.reduce((sum, s) => sum + Number(s.grade || 0), 0) / gradedClassSubs.length : 0;
          return {
            id: cls.id,
            name: cls.name,
            students: classMembers.length,
            activities: classActivities.length,
            avgGrade: avgGrade.toFixed(1)
          };
        });

        setReportData({
          totalStudents,
          totalActivities,
          averageGrade: Number(averageGrade.toFixed(1)),
          completionRate: Number(completionRate.toFixed(1)),
          topStudents,
          activityStats,
          classPerformance
        });
      } catch (e) {
        console.error('Erro ao carregar relatórios (teacher dashboard):', e);
        toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar relatórios' });
      } finally {
        setLoading(false);
      }
    })();
  }, [user, selectedClass, selectedPeriod]);

  const exportToExcel = async () => {
    try {
      // Load ExcelJS only when needed
      const ExcelJS = await loadExcelJS();
      const rows = reportData.activityStats.map(a => ({
        data: a.dueDate ? new Date(a.dueDate).toLocaleDateString('pt-BR') : '-',
        atividade: a.title,
        concluido: a.submissions > 0 ? 'Sim' : 'Não',
        nota: a.avgScore
      }));
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Relatório');
      
      // Adicionar cabeçalhos
      worksheet.columns = [
        { header: 'Data', key: 'data', width: 15 },
        { header: 'Atividade', key: 'atividade', width: 30 },
        { header: 'Concluído', key: 'concluido', width: 15 },
        { header: 'Nota', key: 'nota', width: 10 }
      ];
      
      // Adicionar dados
      worksheet.addRows(rows);
      
      // Estilizar cabeçalhos
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E88E5' } // Azul
      };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
      
      // Ajustar largura das colunas
      worksheet.columns.forEach(column => {
        column.width = column.header.length < 12 ? 12 : column.header.length;
      });
      
      // Gerar o arquivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Relatório exportado!",
        description: "O relatório em Excel foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      toast({
        variant: "destructive",
        title: "Erro ao exportar para Excel",
        description: error.message || "Ocorreu um erro ao exportar para Excel."
      });
    }
  };

  const exportToPDF = () => {
    try {
      const rows = reportData.activityStats.map(a => ({
        data: a.dueDate ? new Date(a.dueDate).toLocaleDateString('pt-BR') : '-',
        atividade: a.title,
        concluido: a.submissions > 0 ? 'Sim' : 'Não',
        nota: a.avgScore
      }));

      // Create a simple HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Relatório de Atividades</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #2980b9; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
              h1 { color: #2980b9; }
            </style>
          </head>
          <body>
            <h1>Relatório de Atividades</h1>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Atividade</th>
                  <th>Concluído</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                ${rows.map(item => `
                  <tr>
                    <td>${item.data}</td>
                    <td>${item.atividade}</td>
                    <td>${item.concluido}</td>
                    <td>${item.nota}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      // Create a blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Relatório exportado!",
        description: "O relatório foi baixado como HTML.",
      });
    } catch (error) {
      console.error('Erro ao exportar para PDF:', error);
      toast({
        variant: "destructive",
        title: "Erro ao exportar relatório",
        description: error.message || "Ocorreu um erro ao exportar o relatório."
      });
    }
  };

  const handleAction = async (action) => {
    try {
      switch (action) {
        case 'export:excel':
          exportToExcel();
          break;
        case 'export:pdf':
          exportToPDF();
          break;
        case 'filter':
          toast({
            title: "Filtros aplicados",
            description: `Período: ${periods.find(p => p.id === selectedPeriod)?.name}, Turma: ${selectedClass === 'all' ? 'Todas' : (classes.find(c => c.id === selectedClass)?.name || selectedClass)}`,
          });
          break;
        default:
          toast({
            title: "Ação não implementada",
            description: `A ação ${action} ainda não foi implementada.`,
          });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Ocorreu um erro ao processar sua solicitação."
      });
    }
  };

  const stats = [
    { name: 'Taxa de Conclusão', value: `${reportData.completionRate}%`, icon: TrendingUp, gradient: 'from-green-500 to-emerald-500' },
    { name: 'Média Geral', value: `${reportData.averageGrade}`, icon: BarChart3, gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Alunos', value: `${reportData.totalStudents}`, icon: Users, gradient: 'from-purple-500 to-pink-500' },
    { name: 'Atividades', value: `${reportData.totalActivities}`, icon: BookOpen, gradient: 'from-orange-500 to-red-500' }
  ];

  const periods = [
    { id: 'week', name: 'Semana' },
    { id: 'month', name: 'Mês' },
    { id: 'quarter', name: 'Trimestre' },
    { id: 'year', name: 'Ano' },
  ];

  const tabs = useMemo(() => (
    [
      { id: 'overview', name: 'Visão Geral', icon: Activity },
      { id: 'performance', name: 'Desempenho', icon: BarChart3 },
      // Only teachers see Engagement and Attendance tabs
      ...(isTeacher ? [
        { id: 'engagement', name: 'Engajamento', icon: TrendingUp },
        { id: 'attendance', name: 'Frequência', icon: Users },
      ] : []),
    ]
  ), [isTeacher]);

  return (
    <div className="w-full space-y-8">
      {/* Header Section with Gradient Background */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white"
      >
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                📊 Relatórios & Analytics
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Acompanhe métricas detalhadas e insights sobre o desempenho das suas turmas e atividades educacionais.
              </p>
            </div>
            {/* Export moved to Filters section */}
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl"></div>
        <div className="hidden lg:block absolute top-8 right-8">
          <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <BarChart3 className="w-12 h-12 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900 dark:text-white">Filtros:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full sm:w-64 rounded-xl">
                <SelectValue placeholder="Selecionar turma" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-48 rounded-xl">
                <SelectValue placeholder="Selecionar período" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={() => handleAction('filter')} 
              className="whitespace-nowrap inline-flex items-center gap-2 rounded-xl hover:bg-blue-50 dark:hover:bg-muted/30"
            >
              <Eye className="w-4 h-4" />
              <span>Aplicar Filtros</span>
            </Button>

            {isTeacher && (
              <div className="relative export-menu-container ml-auto">
                <Button 
                  variant="outline"
                  className="whitespace-nowrap inline-flex items-center gap-2 rounded-xl"
                  onClick={toggleExportMenu}
                  aria-expanded={isExportMenuOpen}
                  aria-haspopup="true"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                  <ChevronDown className="w-4 h-4 transition-transform" style={{ transform: isExportMenuOpen ? 'rotate(180deg)' : 'none' }} />
                </Button>
                {isExportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-gray-700 z-50 backdrop-blur-xl">
                    <div className="py-2">
                      <button
                        onClick={() => handleExport('excel')}
                        className="w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-3 transition-all duration-200 rounded-lg mx-2"
                      >
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <FileSpreadsheet className="w-4 h-4 text-green-600 dark:text-green-500" />
                        </div>
                        <div>
                          <div className="font-medium">Exportar para Excel</div>
                          <div className="text-xs text-gray-500">Planilha .xlsx</div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-3 transition-all duration-200 rounded-lg mx-2"
                      >
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-red-600 dark:text-red-500" />
                        </div>
                        <div>
                          <div className="font-medium">Exportar para HTML</div>
                          <div className="text-xs text-gray-500">Relatório formatado</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
            className="group"
          >
            <Card className="relative p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-300">Atual</div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</h3>
                <p className="text-gray-600 dark:text-gray-300 font-medium">{stat.name}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-gray-100 dark:bg-gray-800 rounded-2xl p-2">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="whitespace-nowrap inline-flex items-center gap-2 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <Card className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className={`w-10 h-10 bg-gradient-to-r ${stats[0].gradient} rounded-xl flex items-center justify-center`}>
                      <tab.icon className="w-5 h-5 text-white" />
                    </div>
                    {tab.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <tab.icon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Gráfico de {tab.name}
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Dados serão exibidos aqui em breve</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </div>
  );
}

export default ReportsPage;
