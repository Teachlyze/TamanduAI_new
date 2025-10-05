import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FiAlertTriangle, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { getClassAlerts, resolveAlert, generateAlertsForClass } from '@/services/alertService';

const StudentAlertsPanel = ({ classId }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (classId) {
      loadAlerts();
    }
  }, [classId]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getClassAlerts(classId, false);
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast({
        title: 'Erro ao carregar alertas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await resolveAlert(alertId);
      toast({
        title: 'Alerta resolvido',
        description: 'O alerta foi marcado como resolvido.'
      });
      loadAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: 'Erro ao resolver alerta',
        variant: 'destructive'
      });
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await generateAlertsForClass(classId);
      toast({
        title: 'Alertas gerados',
        description: 'Novos alertas foram gerados com base no desempenho dos alunos.'
      });
      loadAlerts();
    } catch (error) {
      console.error('Error generating alerts:', error);
      toast({
        title: 'Erro ao gerar alertas',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      attention: 'bg-blue-100 text-blue-800 border-blue-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[severity] || colors.attention;
  };

  const getAlertTypeLabel = (type) => {
    const labels = {
      low_grade: 'Nota Baixa',
      late_submissions: 'Entregas Atrasadas',
      plagiarism: 'Plágio Detectado',
      no_submissions: 'Sem Submissões'
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div className="text-center py-4">Carregando alertas...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Alertas de Alunos</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerate}
            disabled={generating}
          >
            <FiRefreshCw className={`mr-2 h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Gerando...' : 'Gerar Alertas'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiCheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
            <p>Nenhum alerta pendente</p>
            <p className="text-sm mt-1">Clique em "Gerar Alertas" para analisar o desempenho dos alunos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FiAlertTriangle className="h-4 w-4" />
                      <span className="font-medium">{getAlertTypeLabel(alert.alert_type)}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white bg-opacity-50">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{alert.student?.name || 'Aluno'}</p>
                    {alert.details && (
                      <p className="text-xs mt-1">
                        {alert.details.message ||
                          (alert.alert_type === 'low_grade' && `Média: ${alert.details.average_grade?.toFixed(1)}%`) ||
                          (alert.alert_type === 'late_submissions' && `${alert.details.late_count} entregas atrasadas`) ||
                          (alert.alert_type === 'plagiarism' && `${alert.details.plagiarism_count} ocorrências`)}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      Criado em: {new Date(alert.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleResolve(alert.id)}
                  >
                    <FiCheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentAlertsPanel;
