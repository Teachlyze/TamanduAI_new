import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import {
  Brain, TrendingUp, AlertTriangle, Target, Users,
  Award, BarChart3, Zap, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Badge } from '@/components/ui/badge';
import analyticsMLService from '@/services/analyticsMLService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AnalyticsMLPage() {
  const { classId } = useParams();
  const [loading, setLoading] = useState(true);
  const [classSummary, setClassSummary] = useState(null);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [clusters, setClusters] = useState(null);
  const [churnRisks, setChurnRisks] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const reportRef = useRef(null);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [studentBuckets, setStudentBuckets] = useState({});

  useEffect(() => {
    loadAnalytics();
  }, [classId]);

  const loadAnalytics = async () => {
    setLoading(true);
    
    // Carregar análises em paralelo
    const [riskResult, clusterResult, churnResult, classPerf] = await Promise.all([
      analyticsMLService.identifyAtRiskStudents(classId),
      analyticsMLService.clusterStudents(classId),
      analyticsMLService.predictChurn(classId),
      analyticsMLService.analyzeClassPerformance(classId)
    ]);

    setAtRiskStudents(riskResult || []);
    setClusters(clusterResult || null);
    setChurnRisks(churnResult || []);
    setClassSummary(classPerf || null);
    setLoading(false);
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
      const fileName = `tamanduai-analytics-ml-turma-${classId}-${new Date().toISOString().slice(0,10)}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Falha ao exportar PDF:', err);
      alert('Para exportar o PDF, instale as dependências: npm i jspdf html2canvas');
    }
  };

  const toggleStudentExpand = async (studentId) => {
    if (expandedStudent === studentId) {
      setExpandedStudent(null);
      return;
    }
    setExpandedStudent(studentId);
    if (!studentBuckets[studentId]) {
      const buckets = await analyticsMLService.getStudentGradeBuckets(studentId, classId);
      setStudentBuckets(prev => ({ ...prev, [studentId]: buckets }));
    }
  };

  const loadStudentPrediction = async (studentId) => {
    const result = await analyticsMLService.predictPerformance(studentId, classId);
    setPrediction(result);
    setSelectedStudent(studentId);
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      low: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    };
    return colors[level] || colors.low;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend === 'declining') return <AlertTriangle className="w-5 h-5 text-red-600" />;
    return <Target className="w-5 h-5 text-blue-600" />;
  };

  const COLORS = {
    excelente: '#10b981',
    bom: '#3b82f6',
    regular: '#f59e0b',
    atencao: '#ef4444'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 shadow-xl hover:opacity-90"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Brain className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Analytics com ML</h1>
              <p className="text-blue-100">
                Inteligência Artificial para insights educacionais
              </p>
            </div>
            <button onClick={handleExportPdf} className="px-4 py-2 rounded-lg bg-white text-indigo-700 hover:bg-indigo-50 font-semibold">
              Exportar PDF
            </button>
          </div>

          {/* KPIs Rápidos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm text-blue-100">Em Risco</span>
              </div>
              <div className="text-2xl font-bold">{atRiskStudents.length}</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm text-blue-100">Inatividade</span>
              </div>
              <div className="text-2xl font-bold">{churnRisks.length}</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5" />
                <span className="text-sm text-blue-100">Clusters</span>
              </div>
              <div className="text-2xl font-bold">{clusters?.clusters?.length || 0}</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5" />
                <span className="text-sm text-white">Excelentes</span>
              </div>
              <div className="text-2xl font-bold">
                {clusters?.clusters?.find(c => c.name === 'Excelente')?.count || 0}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div ref={reportRef} className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Resumo da Turma (Métricas + Distribuição) */}
          {classSummary && (
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
                    <h2 className="text-xl font-bold">Resumo da Turma</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={Object.entries(classSummary.gradeBuckets || {}).map(([name, value]) => ({ name, value }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={85}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {Object.entries(classSummary.gradeBuckets || {}).map((_, idx) => (
                            <Cell key={`sum-cell-${idx}`} fill={["#ef4444","#f59e0b","#3b82f6","#10b981"][idx % 4]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center">
                          <p className="text-xs text-gray-500">Média</p>
                          <p className="text-lg font-semibold">{classSummary.avgGrade}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center">
                          <p className="text-xs text-gray-500">Média Ajustada</p>
                          <p className="text-lg font-semibold">{classSummary.adjustedAvg}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center">
                          <p className="text-xs text-gray-500">Dias médios entre submissões</p>
                          <p className="text-lg font-semibold">{classSummary.avgDaysBetweenSubmissions ?? 'N/D'}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center">
                          <p className="text-xs text-gray-500">Submissões por aluno (média)</p>
                          <p className="text-lg font-semibold">{classSummary.submissionsPerStudentAvg ?? 'N/D'}</p>
                        </div>
                      </div>
                      {classSummary.xpSources && (
                        <div className="pt-2">
                          <p className="text-xs text-gray-500 mb-1">Fontes de XP (top 3)</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(classSummary.xpSources).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v]) => (
                              <Badge key={k} variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border text-xs">{k}: {v}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          )}
          {/* Alunos em Risco */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PremiumCard variant="elevated">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-bold">Alunos em Risco</h2>
                </div>

                {atRiskStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <p className="text-gray-600">Nenhum aluno em risco identificado! 🎉</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {atRiskStudents.map((student) => (
                      <motion.div
                        key={student.studentId}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 border border-gray-200 dark:border-gray-600 text-white hover:opacity-90"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {student.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {student.email}
                            </p>
                          </div>
                          <Badge className={getRiskLevelColor(student.riskLevel)}>
                            {student.riskLevel === 'high' ? 'Alto' : 
                             student.riskLevel === 'medium' ? 'Médio' : 'Baixo'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Média Total</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {student.avgGrade}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Média Recente</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {student.avgRecent}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {student.reasons.map((reason, idx) => (
                            <Badge key={idx} variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                          <button
                            onClick={() => loadStudentPrediction(student.studentId)}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Ver Previsão →
                          </button>
                          <button
                            onClick={() => toggleStudentExpand(student.studentId)}
                            className="text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium"
                          >
                            {expandedStudent === student.studentId ? 'Fechar distribuição' : 'Ver distribuição de notas'}
                          </button>
                        </div>

                        {expandedStudent === student.studentId && (
                          <div className="mt-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 mb-2">Distribuição de Notas (Aluno)</p>
                            {studentBuckets[student.studentId] ? (
                              <div className="w-full md:w-1/2">
                                <ResponsiveContainer width="100%" height={160}>
                                  <PieChart>
                                    <Pie
                                      data={Object.entries(studentBuckets[student.studentId]).map(([name,value])=>({name,value}))}
                                      dataKey="value"
                                      nameKey="name"
                                      cx="50%"
                                      cy="50%"
                                      outerRadius={60}
                                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                      {Object.entries(studentBuckets[student.studentId]).map((_, idx) => (
                                        <Cell key={`stud-cell-${student.studentId}-${idx}`} fill={["#ef4444","#f59e0b","#3b82f6","#10b981"][idx % 4]} />
                                      ))}
                                    </Pie>
                                    <Tooltip />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500">Carregando distribuição...</p>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </PremiumCard>
          </motion.div>

          {/* Clustering de Alunos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PremiumCard variant="elevated">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold">Clustering de Desempenho</h2>
                </div>

                {clusters && clusters.clusters.length > 0 ? (
                  <>
                    {/* Gráfico de Pizza */}
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={clusters.clusters}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={(entry) => `${entry.name}: ${entry.count}`}
                        >
                          {clusters.clusters.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()] || '#8884d8'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Lista de Clusters */}
                    <div className="space-y-3 mt-6">
                      {clusters.clusters.map((cluster) => (
                        <div
                          key={cluster.name}
                          className="p-4 rounded-xl border border-gray-200 dark:border-gray-600"
                          style={{
                            background: `linear-gradient(to right, ${COLORS[cluster.name.toLowerCase()]}15, transparent)`
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {cluster.name}
                            </h3>
                            <Badge
                              className="text-white"
                              style={{ backgroundColor: COLORS[cluster.name.toLowerCase()] }}
                            >
                              {cluster.count} alunos
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Média:</span>
                              <span className="ml-2 font-bold text-gray-900 dark:text-white">
                                {cluster.avgGrade}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Dados insuficientes para clustering</p>
                  </div>
                )}
              </div>
            </PremiumCard>
          </motion.div>

          {/* Previsão de Churn */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PremiumCard variant="elevated">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <h2 className="text-xl font-bold">Risco de Inatividade</h2>
                </div>

                {churnRisks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <p className="text-gray-600">Todos os alunos ativos! 👏</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {churnRisks.slice(0, 5).map((risk) => (
                      <div
                        key={risk.studentId}
                        className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {risk.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {risk.reason}
                            </p>
                          </div>
                          <Badge className={getRiskLevelColor(risk.riskLevel)}>
                            {risk.riskLevel === 'high' ? 'Crítico' : 'Atenção'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {risk.daysSinceActivity} dias sem atividade
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PremiumCard>
          </motion.div>

          {/* Previsão de Desempenho */}
          {prediction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <PremiumCard variant="elevated">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Brain className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-bold">Previsão de Desempenho</h2>
                  </div>

                  {prediction.prediction === null ? (
                    <div className="text-center py-8">
                      <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">{prediction.message}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Previsão Principal */}
                      <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                        <p className="text-sm uppercase tracking-wider mb-2">Próxima Nota Prevista</p>
                        <p className="text-5xl font-bold mb-2">{prediction.prediction}</p>
                        <div className="flex items-center justify-center gap-2">
                          {getTrendIcon(prediction.trend)}
                          <p className="text-sm">
                            {prediction.message}
                          </p>
                        </div>
                      </div>

                      {/* Métricas */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-slate-800">
                          <p className="text-xs text-gray-500 mb-1">Confiança</p>
                          <p className="text-2xl font-bold">{prediction.confidence}%</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-slate-800">
                          <p className="text-xs text-gray-500 mb-1">Média Recente</p>
                          <p className="text-2xl font-bold">{prediction.avgRecent}</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-slate-800">
                          <p className="text-xs text-gray-500 mb-1">Média Total</p>
                          <p className="text-2xl font-bold">{prediction.avgTotal}</p>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>Baseado em {prediction.totalSubmissions} submissões</p>
                      </div>
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
