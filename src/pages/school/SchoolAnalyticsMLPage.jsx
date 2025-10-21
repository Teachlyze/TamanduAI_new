import { motion } from 'framer-motion';
import {
  Brain, Users, TrendingUp, Award, BarChart3, Zap,
  Target, BookOpen, Sparkles, Trophy, ArrowUp, ArrowDown, Download
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Badge } from '@/components/ui/badge';
import { PremiumButton } from '@/components/ui/PremiumButton';
import analyticsMLService from '@/services/analyticsMLService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';

export default function SchoolAnalyticsMLPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teacherComparisons, setTeacherComparisons] = useState([]);
  const [classComparisons, setClassComparisons] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [aiInsights, setAIInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    if (user) loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    setLoading(true);
    
    // Buscar school_id do usuário
    const { data: schoolData } = await supabase
      .from('schools')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!schoolData) {
      setLoading(false);
      return;
    }

    const [teachers, classes] = await Promise.all([
      analyticsMLService.compareTeachers(schoolData.id),
      analyticsMLService.compareClasses(schoolData.id)
    ]);

    setTeacherComparisons(teachers || []);
    setClassComparisons(classes || []);
    setLoading(false);
  };

  const loadTeacherDetails = async (teacherId) => {
    setSelectedTeacher(teacherId);
    setLoadingInsights(true);
    
    const teacher = teacherComparisons.find(t => t.teacherId === teacherId);
    if (teacher) {
      const insights = await analyticsMLService.generateAIInsights(teacher, 'teacher');
      setAIInsights(insights);
    }
    
    setLoadingInsights(false);
  };

  const getEngagementColor = (level) => {
    if (level === 'high') return 'text-green-600 bg-green-100';
    if (level === 'medium') return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return <ArrowUp className="w-5 h-5 text-green-600" />;
    if (trend === 'declining') return <ArrowDown className="w-5 h-5 text-red-600" />;
    return <Target className="w-5 h-5 text-blue-600" />;
  };

  // Exportar relatório em PDF
  const handleExportPdf = async () => {
    try {
      const [{ default: html2canvas }, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule;
      const element = reportRef.current;
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;
      let remainingHeight = imgHeight;

      // Se o conteúdo exceder a altura da página, criar múltiplas páginas
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      remainingHeight -= pageHeight;
      while (remainingHeight > 0) {
        pdf.addPage();
        position = - (imgHeight - remainingHeight);
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        remainingHeight -= pageHeight;
      }

      const fileName = `tamanduai-analytics-ml-escola-${new Date().toISOString().slice(0,10)}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Falha ao exportar PDF:', err);
      alert('Para exportar o PDF, instale as dependências: npm i jspdf html2canvas');
    }
  };

  // Preparar dados para gráficos
  const teacherChartData = teacherComparisons.slice(0, 5).map(t => ({
    name: t.name?.split(' ')[0] || 'Professor',
    'Média Notas': t.avgGrade,
    'XP Total': Math.round(t.totalXP / 100),
    'Atividades': t.totalActivities
  }));

  const classChartData = classComparisons.slice(0, 8).map(c => ({
    name: c.className?.substring(0, 15) || 'Turma',
    'Média': c.avgGrade,
    'Média Ajustada': c.adjustedAvg,
    'Alunos': c.totalStudents
  }));

  // Distribuição de notas agregada (somatório de buckets das turmas)
  const aggregatedBuckets = classComparisons.reduce((acc, c) => {
    const b = c.gradeBuckets || {};
    Object.keys(b).forEach(k => { acc[k] = (acc[k] || 0) + b[k]; });
    return acc;
  }, { '0-49': 0, '50-69': 0, '70-84': 0, '85-100': 0 });

  const pieData = Object.entries(aggregatedBuckets).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 t text-white hover:opacity-90 whitespace-nowrap inline-flex items-center gap-2 min-w-fitext-white p-8 shadow-xl"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Brain className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Analytics ML - Escola</h1>
              <p className="text-blue-100">Inteligência Artificial para insights institucionais</p>
            </div>
            <PremiumButton onClick={handleExportPdf} className="bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl whitespace-nowrap inline-flex items-center gap-2 shadow-lg">
              <Download className="w-4 h-4" />
              <span>Exportar PDF</span>
            </PremiumButton>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5" />
                <span className="text-sm text-blue-100">Professores</span>
              </div>
              <div className="text-2xl font-bold">{teacherComparisons.length}</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm text-blue-100">Turmas</span>
              </div>
              <div className="text-2xl font-bold">{classComparisons.length}</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm text-blue-100">Média Geral</span>
              </div>
              <div className="text-2xl font-bold">
                {teacherComparisons.length > 0 
                  ? Math.round(teacherComparisons.reduce((sum, t) => sum + t.avgGrade, 0) / teacherComparisons.length * 10) / 10
                  : 0}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5" />
                <span className="text-sm text-white">XP Total</span>
              </div>
              <div className="text-2xl font-bold">
                {Math.round(teacherComparisons.reduce((sum, t) => sum + t.totalXP, 0) / 1000)}k
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div ref={reportRef} className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Distribuição de Notas (Agregado) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-2"
          >
            <PremiumCard variant="elevated">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-xl font-bold">Distribuição de Notas (Escola)</h2>
                </div>
                {pieData.reduce((s, d) => s + d.value, 0) === 0 ? (
                  <div className="text-center py-6 text-gray-500">Sem dados suficientes</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie 
                          data={pieData} 
                          dataKey="value" 
                          nameKey="name" 
                          cx="50%" cy="50%" 
                          outerRadius={90}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {pieData.map((p, i) => (
                        <div key={p.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{p.name}</span>
                          </div>
                          <span className="text-sm font-medium">{p.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </PremiumCard>
          </motion.div>
          {/* Comparação de Professores */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PremiumCard variant="elevated">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-bold">Desempenho por Professor</h2>
                </div>

                {teacherComparisons.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Nenhum professor analisado</p>
                  </div>
                ) : (
                  <>
                    {/* Gráfico */}
                    <div className="mb-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={teacherChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Média Notas" fill="#8b5cf6" />
                          <Bar dataKey="XP Total" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Lista */}
                    <div className="space-y-3">
                      {teacherComparisons.map((teacher, index) => (
                        <motion.div
                          key={teacher.teacherId}
                          whileHover={{ scale: 1.02 }}
                          className="p-4 rounded-xl bg-gradient-to-r text-white hover:opacity-90 whitespace-nowrap inline-flex items-center gap-2 min-w-fit from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                index === 0 ? 'bg-yellow-500' :
                                index === 1 ? 'bg-gray-400' :
                                index === 2 ? 'bg-orange-600' :
                                'bg-blue-500'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {teacher.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {teacher.totalClasses} turma{teacher.totalClasses !== 1 ? 's' : ''} • {teacher.totalStudents} alunos
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-purple-100 text-purple-700">
                              Média: {teacher.avgGrade}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Atividades</p>
                              <p className="text-lg font-bold">{teacher.totalActivities}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">XP Gerado</p>
                              <p className="text-lg font-bold">{Math.round(teacher.totalXP / 1000)}k</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Engajamento</p>
                              <p className="text-lg font-bold">{Math.round(teacher.engagementScore)}</p>
                            </div>
                          </div>

                          <PremiumButton
                            size="sm"
                            variant="outline"
                            onClick={() => loadTeacherDetails(teacher.teacherId)}
                            className="mt-3 rounded-lg whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Ver Insights IA</span>
                          </PremiumButton>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </PremiumCard>
          </motion.div>

          {/* Comparação de Turmas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PremiumCard variant="elevated">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold">Desempenho por Turma</h2>
                </div>

                {classComparisons.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Nenhuma turma analisada</p>
                  </div>
                ) : (
                  <>
                    {/* Gráfico */}
                    <div className="mb-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={classChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Média" fill="#3b82f6" />
                          <Bar dataKey="Média Ajustada" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Lista */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {classComparisons.map((cls) => (
                        <div
                          key={cls.classId}
                          className="p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-800"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {cls.className}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Prof. {cls.teacherName}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {getTrendIcon(cls.trend)}
                              <Badge className="text-xs">
                                Média: {cls.avgGrade}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div>
                              <p className="text-xs text-gray-500">Alunos</p>
                              <p className="font-bold">{cls.totalStudents}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">XP</p>
                              <p className="font-bold">{Math.round(cls.totalXP / 1000)}k</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Consist.</p>
                              <Badge className="text-xs" variant="outline">
                                {cls.consistency === 'high' ? 'Alta' : cls.consistency === 'medium' ? 'Média' : 'Baixa'}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Eng.</p>
                              <Badge className={`text-xs ${getEngagementColor(cls.engagement)}`}>
                                {cls.engagement === 'high' ? 'Alto' : cls.engagement === 'medium' ? 'Médio' : 'Baixo'}
                              </Badge>
                            </div>
                          </div>

                          {/* KPIs adicionais por turma */}
                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-2 text-center">
                              <p className="text-xs text-gray-500">Dias médios entre submissões</p>
                              <p className="text-sm font-semibold">{cls.avgDaysBetweenSubmissions ?? 'N/D'}</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-2 text-center">
                              <p className="text-xs text-gray-500">Submissões por aluno (média)</p>
                              <p className="text-sm font-semibold">{cls.submissionsPerStudentAvg ?? 'N/D'}</p>
                            </div>
                          </div>

                          {cls.xpSources && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                              <p className="text-xs text-gray-500 mb-1">Fontes de XP:</p>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(cls.xpSources).slice(0, 3).map(([source, xp]) => (
                                  <Badge key={source} variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border text-xs">
                                    {source}: {xp}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Mini gráfico de distribuição por turma */}
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 mb-2">Distribuição de Notas</p>
                            {cls.gradeBuckets ? (
                              <div className="w-full md:w-1/2">
                                <ResponsiveContainer width="100%" height={140}>
                                  <PieChart>
                                    <Pie
                                      data={Object.entries(cls.gradeBuckets).map(([name,value])=>({name,value}))}
                                      dataKey="value"
                                      nameKey="name"
                                      cx="50%"
                                      cy="50%"
                                      outerRadius={55}
                                    >
                                      {Object.entries(cls.gradeBuckets).map((_, idx) => (
                                        <Cell key={`cls-cell-${cls.classId}-${idx}`} fill={["#ef4444","#f59e0b","#3b82f6","#10b981"][idx % 4]} />
                                      ))}
                                    </Pie>
                                    <Tooltip />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500">Sem dados</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </PremiumCard>
          </motion.div>

          {/* Insights IA */}
          {aiInsights && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-2"
            >
              <PremiumCard variant="elevated">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-yellow-600" />
                    <h2 className="text-xl font-bold">Insights Gerados por IA</h2>
                  </div>

                  {loadingInsights ? (
                    <div className="text-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                      >
                        <Zap className="w-12 h-12 text-purple-600" />
                      </motion.div>
                      <p className="mt-4 text-gray-600">Analisando com IA...</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          Pontos Fortes
                        </h3>
                        <ul className="space-y-2">
                          {aiInsights.strengths?.map((strength, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-orange-600 mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Áreas de Melhoria
                        </h3>
                        <ul className="space-y-2">
                          {aiInsights.improvements?.map((improvement, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="md:col-span-2">
                        <h3 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Recomendações
                        </h3>
                        <ul className="space-y-2">
                          {aiInsights.recommendations?.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {aiInsights.recognition && (
                        <div className="md:col-span-2 p-4 rounded-xl bg-gradient-to-r text-white hover:opacity-90 whitespace-nowrap inline-flex items-center gap-2 min-w-fit from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
                          <p className="text-center text-gray-800 dark:text-gray-200 italic">
                            "{aiInsights.recognition}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </PremiumCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
