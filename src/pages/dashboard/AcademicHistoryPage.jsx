// src/pages/dashboard/AcademicHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabaseClient';

const AcademicHistoryPage = () => {
  const { studentId } = useParams();
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch academic history
        const { data: historyData, error: historyError } = await supabase
          .from('academic_history')
          .select(`
            *,
            class:class_id (name, subject),
            activity:activity_id (title, type, max_grade)
          `)
          .eq('student_id', studentId)
          .order('submitted_at', { ascending: false });

        if (historyError) throw historyError;

        // Fetch performance metrics
        const { data: metricsData, error: metricsError } = await supabase
          .from('performance_metrics')
          .select('*')
          .eq('student_id', studentId)
          .order('metric_date', { ascending: true });

        if (metricsError) throw metricsError;

        setHistory(historyData || []);
        setMetrics(metricsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const calculateAverage = () => {
    const graded = history.filter(h => h.status === 'graded' && h.grade !== null);
    if (graded.length === 0) return 0;
    return (graded.reduce((sum, item) => sum + item.grade, 0) / graded.length).toFixed(2);
  };

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
        Histórico Acadêmico
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 2, flex: 1, minWidth: '200px' }}>
          <Typography color="textSecondary">Média Geral</Typography>
          <Typography variant="h3">{calculateAverage()}%</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: '200px' }}>
          <Typography color="textSecondary">Atividades Concluídas</Typography>
          <Typography variant="h3">{history.filter(h => h.status === 'graded').length}</Typography>
        </Paper>
      </Box>

      <Tabs 
        value={tabValue} 
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Atividades" />
        <Tab label="Desempenho" />
      </Tabs>

      {tabValue === 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Atividade</TableCell>
                <TableCell>Disciplina</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Nota</TableCell>
                <TableCell>Data de Entrega</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.length > 0 ? (
                history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.activity?.title || 'N/A'}</TableCell>
                    <TableCell>{item.class?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.activity?.type || 'N/A'} 
                        size="small" 
                        color={item.activity?.type === 'quiz' ? 'primary' : 'default'} 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.status === 'graded' ? 'Avaliado' : 
                               item.status === 'submitted' ? 'Enviado' : 
                               item.status === 'late' ? 'Atrasado' : 'Pendente'} 
                        color={
                          item.status === 'graded' ? 'success' : 
                          item.status === 'late' ? 'warning' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {item.status === 'graded' ? (
                        <Typography 
                          color={item.grade >= 70 ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {item.grade} / {item.max_grade || 100}
                        </Typography>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {new Date(item.submitted_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabValue === 1 && metrics.length > 0 && (
        <Box sx={{ mt: 4, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Desempenho ao Longo do Tempo
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={metrics.filter(m => m.metric_type === 'grade')}
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
                name="Nota" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default AcademicHistoryPage;
