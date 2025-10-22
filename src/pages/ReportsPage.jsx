import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  Calendar,
  Filter,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [dateRange, setDateRange] = useState('month'); // week, month, semester, year
  const [reportData, setReportData] = useState({
    totalStudents: 0,
    totalActivities: 0,
    averageGrade: 0,
    completionRate: 0,
    topStudents: [],
    activityStats: [],
    classPerformance: []
  });

  useEffect(() => {
    if (user) {
      loadClasses();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user, selectedClass, dateRange]);

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, subject')
        .eq('created_by', user.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const getDateFilter = () => {
    const now = new Date();
    const filters = {
      week: new Date(now.setDate(now.getDate() - 7)),
      month: new Date(now.setMonth(now.getMonth() - 1)),
      semester: new Date(now.setMonth(now.getMonth() - 6)),
      year: new Date(now.setFullYear(now.getFullYear() - 1))
    };
    return filters[dateRange] || filters.month;
  };

  const loadReportData = async () => {
    try {
      setLoading(true);
      const startDate = getDateFilter();

      // Build class filter
      let classFilter = supabase
        .from('classes')
        .select('id, name')
        .eq('created_by', user.id)
        .eq('is_active', true);

      if (selectedClass !== 'all') {
        classFilter = classFilter.eq('id', selectedClass);
      }

      const { data: classesData, error: classesError } = await classFilter;
      if (classesError) throw classesError;

      const classIds = classesData.map(c => c.id);

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

      // Get students from these classes
      const { data: members, error: membersError } = await supabase
        .from('class_members')
        .select('user_id, class_id, profiles:user_id(id, full_name, avatar_url)')
        .in('class_id', classIds)
        .eq('role', 'student');

      if (membersError) throw membersError;

      const studentIds = [...new Set(members.map(m => m.user_id))];

      // Get activities
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
            created_by
          )
        `)
        .in('class_id', classIds)
        .eq('activities.created_by', user.id)
        .gte('activities.created_at', startDate.toISOString());

      if (activitiesError) throw activitiesError;

      // Flatten activities with class info
      const activities = activityAssignments?.map(assignment => ({
        id: assignment.activities.id,
        title: assignment.activities.title,
        due_date: assignment.activities.due_date,
        max_score: assignment.activities.max_score,
        class_id: assignment.class_id
      })) || [];

      const activityIds = activities.map(a => a.id);

      // Get submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('id, activity_id, student_id, score, submitted_at, status')
        .in('activity_id', activityIds)
        .in('student_id', studentIds);

      if (submissionsError) throw submissionsError;

      // Calculate stats
      const totalStudents = studentIds.length;
      const totalActivities = activities.length;

      // Calculate average grade
      const gradedSubmissions = submissions.filter(s => s.grade !== null);
      const averageGrade = gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((sum, s) => sum + Number(s.grade || 0), 0) / gradedSubmissions.length
        : 0;

      // Calculate completion rate
      const expectedSubmissions = totalStudents * totalActivities;
      const completedSubmissions = submissions.filter(s => s.status === 'graded' || s.status === 'submitted').length;
      const completionRate = expectedSubmissions > 0 ? (completedSubmissions / expectedSubmissions) * 100 : 0;

      // Top students by average grade
      const studentGrades = {};
      gradedSubmissions.forEach(sub => {
        if (!studentGrades[sub.student_id]) {
          studentGrades[sub.student_id] = { total: 0, count: 0 };
        }
        studentGrades[sub.student_id].total += Number(sub.grade || 0);
        studentGrades[sub.student_id].count += 1;
      });

      const topStudents = Object.entries(studentGrades)
        .map(([studentId, data]) => {
          const student = members.find(m => m.user_id === studentId)?.profiles;
          return {
            id: studentId,
            name: student?.name || 'Aluno',
            avatar: student?.avatar_url,
            average: data.total / data.count,
            activities: data.count
          };
        })
        .sort((a, b) => b.average - a.average)
        .slice(0, 10);

      // Activity stats
      const activityStats = activities.map(activity => {
        const activitySubs = submissions.filter(s => s.activity_id === activity.id);
        const gradedSubs = activitySubs.filter(s => s.grade !== null);
        const avgScore = gradedSubs.length > 0
          ? gradedSubs.reduce((sum, s) => sum + Number(s.grade || 0), 0) / gradedSubs.length
          : 0;

        return {
          id: activity.id,
          title: activity.title,
          submissions: activitySubs.length,
          avgScore: avgScore.toFixed(1),
          dueDate: activity.due_date
        };
      });

      // Class performance
      const classPerformance = classesData.map(cls => {
        const classMembers = members.filter(m => m.class_id === cls.id);
        const classActivities = activities.filter(a => a.class_id === cls.id);
        const classActivityIds = classActivities.map(a => a.id);
        const classSubs = submissions.filter(s => classActivityIds.includes(s.activity_id));
        const gradedClassSubs = classSubs.filter(s => s.grade !== null);
        
        const avgGrade = gradedClassSubs.length > 0
          ? gradedClassSubs.reduce((sum, s) => sum + Number(s.grade || 0), 0) / gradedClassSubs.length
          : 0;

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
        averageGrade: averageGrade.toFixed(1),
        completionRate: completionRate.toFixed(1),
        topStudents,
        activityStats,
        classPerformance
      });

    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      setGeneratingPDF(true);
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229); // Indigo
      doc.text('Relatório de Desempenho', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
      doc.text(`Professor: ${user.user_metadata?.name || user.email}`, 14, 34);

      // Summary stats
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Resumo Geral', 14, 45);

      const summaryData = [
        ['Métrica', 'Valor'],
        ['Total de Alunos', reportData.totalStudents.toString()],
        ['Total de Atividades', reportData.totalActivities.toString()],
        ['Média Geral', `${reportData.averageGrade}%`],
        ['Taxa de Conclusão', `${reportData.completionRate}%`]
      ];

      doc.autoTable({
        startY: 50,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }
      });

      // Top students
      let finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text('Top 10 Alunos', 14, finalY);

      const studentsData = [
        ['Posição', 'Nome', 'Média', 'Atividades'],
        ...reportData.topStudents.map((student, index) => [
          `${index + 1}º`,
          student.name,
          `${student.average.toFixed(1)}%`,
          student.activities.toString()
        ])
      ];

      doc.autoTable({
        startY: finalY + 5,
        head: [studentsData[0]],
        body: studentsData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }
      });

      // Class performance
      if (reportData.classPerformance.length > 0) {
        finalY = doc.lastAutoTable.finalY + 15;
        
        // Check if we need a new page
        if (finalY > 250) {
          doc.addPage();
          finalY = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Desempenho por Turma', 14, finalY);

        const classData = [
          ['Turma', 'Alunos', 'Atividades', 'Média'],
          ...reportData.classPerformance.map(cls => [
            cls.name,
            cls.students.toString(),
            cls.activities.toString(),
            `${cls.avgGrade}%`
          ])
        ];

        doc.autoTable({
          startY: finalY + 5,
          head: [classData[0]],
          body: classData.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229] }
        });
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Save
      doc.save(`relatorio-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 p-8 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <FileText className="w-8 h-8" />
              Relatórios
            </h1>
            <p className="text-slate-900 dark:text-white/90">Análise detalhada de desempenho dos alunos</p>
          </div>
          
          <Button
            onClick={generatePDF}
            disabled={generatingPDF}
            className="bg-white text-teal-600 hover:bg-white/90"
          >
            {generatingPDF ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Download className="w-5 h-5 mr-2" />
            )}
            Gerar PDF
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-5 h-5 text-muted-foreground" />
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Turma:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-sm"
              >
                <option value="all">Todas as Turmas</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Período:</span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-sm"
              >
                <option value="week">Última Semana</option>
                <option value="month">Último Mês</option>
                <option value="semester">Último Semestre</option>
                <option value="year">Último Ano</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alunos</p>
                <p className="text-2xl font-bold">{reportData.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atividades</p>
                <p className="text-2xl font-bold">{reportData.totalActivities}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média Geral</p>
                <p className="text-2xl font-bold">{reportData.averageGrade}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa Conclusão</p>
                <p className="text-2xl font-bold">{reportData.completionRate}%</p>
              </div>
              <Award className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Students */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            Top 10 Alunos
          </h2>

          {reportData.topStudents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum dado disponível</p>
          ) : (
            <div className="space-y-3">
              {reportData.topStudents.map((student, index) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.activities} atividades concluídas
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90">
                    {student.average.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Class Performance */}
      {reportData.classPerformance.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-500" />
              Desempenho por Turma
            </h2>

            <div className="space-y-3">
              {reportData.classPerformance.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{cls.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {cls.students} alunos • {cls.activities} atividades
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border ml-4">
                    Média: {cls.avgGrade}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
