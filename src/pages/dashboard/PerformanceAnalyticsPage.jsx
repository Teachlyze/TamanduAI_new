// src/pages/dashboard/PerformanceAnalyticsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { supabase } from '@/lib/supabaseClient';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const PerformanceAnalyticsPage = () => {
  const { studentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [analytics, setAnalytics] = useState({
    gradesBySubject: [],
    completionRate: 0,
    averageGrade: 0,
    activityTypes: [],
    performanceTrend: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Fetch data from Supabase
        const [
          { data: gradesBySubject },
          { data: completionData },
          { data: activityTypes },
          { data: performanceTrend }
        ] = await Promise.all([
          supabase
            .rpc('get_grades_by_subject', { student_id: studentId }),
          supabase
            .rpc('get_completion_rate', { student_id: studentId }),
          supabase
            .rpc('get_activity_type_distribution', { student_id: studentId }),
          supabase
            .from('performance_metrics')
            .select('*')
            .eq('student_id', studentId)
            .order('metric_date', { ascending: true })
        ]);

        // Calculate average grade
        const gradedActivities = performanceTrend?.filter(a => a.metric_type === 'grade') || [];
        const averageGrade = gradedActivities.length > 0
          ? (gradedActivities.reduce((sum, a) => sum + a.value, 0) / gradedActivities.length).toFixed(2)
          : 0;

        // Calculate completion rate
        const completionRate = completionData?.[0]?.completion_rate || 0;

        setAnalytics({
          gradesBySubject: gradesBySubject || [],
          completionRate,
          averageGrade,
          activityTypes: activityTypes || [],
          performanceTrend: performanceTrend?.filter(t => t.metric_type === 'grade') || []
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [studentId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Análise de Desempenho
      </Typography>
      
      <Tabs 
        value={tabValue} 
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Visão Geral" />
        <Tab label="Análise Detalhada" />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notas por Disciplina
                </Typography>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.gradesBySubject}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Média']}
                      />
                      <Legend />
                      <Bar dataKey="average_grade" fill="#8884d8" name="Média" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Distribuição de Atividades
                </Typography>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.activityTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="type"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {analytics.activityTypes.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} atividades`, name]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Taxa de Conclusão</Typography>
                <Box display="flex" alignItems="center" mt={2}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: `conic-gradient(#4CAF50 ${analytics.completionRate}%, #e0e0e0 ${analytics.completionRate}% 100%)`,
                      mr: 3
                    }}
                  >
                    <Typography variant="h5">
                      {analytics.completionRate}%
                    </Typography>
                  </Box>
                  <Typography>
                    das atividades foram concluídas
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Média Geral</Typography>
                <Box display="flex" alignItems="center" mt={2}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: `conic-gradient(#2196F3 ${analytics.averageGrade}%, #e0e0e0 ${analytics.averageGrade}% 100%)`,
                      mr: 3
                    }}
                  >
                    <Typography variant="h5">
                      {analytics.averageGrade}%
                    </Typography>
                  </Box>
                  <Typography>
                    é a sua média geral
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Evolução do Desempenho
            </Typography>
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analytics.performanceTrend}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="metric_date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={(date) => `Data: ${new Date(date).toLocaleDateString('pt-BR')}`}
                    formatter={(value) => [`${value}%`, 'Nota']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Sua Nota" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PerformanceAnalyticsPage;
