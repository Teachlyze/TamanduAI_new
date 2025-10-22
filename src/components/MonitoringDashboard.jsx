import React, { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Shield,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  Zap,
  Server,
  Eye,
  EyeOff
} from 'lucide-react';
import monitoringService from '@/services/monitoring';

  const MonitoringDashboard = () => {
  const [healthReport, setHealthReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadHealthReport();

    let interval;
    if (autoRefresh) {
      interval = setInterval(loadHealthReport, 10000); // Update every 10 seconds
    }
  return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadHealthReport = async () => {
    try {
      setIsLoading(true);
      const report = await monitoringService.getHealthReport();
      setHealthReport(report);
      setLastUpdate(new Date());

      // Record dashboard view
      monitoringService.recordUserInteraction('monitoring_dashboard_view', 'dashboard');
    } catch (error) {
      console.error('Error loading health report:', error);
      monitoringService.recordError(error, { context: 'monitoring_dashboard' });
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'unhealthy': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5" />;
      case 'unhealthy': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const formatUptime = (uptime) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading && !healthReport) {
  return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!healthReport) {
  return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erro ao carregar dashboard</h3>
        <p className="text-gray-600 mb-4">Não foi possível obter os dados de monitoramento.</p>
        <Button onClick={loadHealthReport}>Tentar novamente</Button>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard de Monitoramento
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Badge
            variant={healthReport.status === 'healthy' ? 'default' : 'destructive'}
            className="flex items-center space-x-2"
          >
            {getHealthStatusIcon(healthReport.status)}
            <span className="capitalize">{healthReport.status === 'healthy' ? 'Saudável' : 'Degradado'}</span>
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center space-x-2"
          >
            {autoRefresh ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{autoRefresh ? 'Auto' : 'Manual'}</span>
          </Button>

          <Button onClick={loadHealthReport} disabled={isLoading}>
            <Activity className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* System Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saúde do Sistema</CardTitle>
            <div className={getHealthStatusColor(healthReport.status)}>
              {getHealthStatusIcon(healthReport.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthReport.status === 'healthy' ? '100%' : '85%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Status geral do sistema
            </p>
          </CardContent>
        </Card>

        {/* Uptime */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Atividade</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatUptime(healthReport.uptime)}
            </div>
            <p className="text-xs text-muted-foreground">
              Desde o último restart
            </p>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso de Memória</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthReport.memory ? `${Math.round(healthReport.memory.used / 1024 / 1024)}MB` : 'N/A'}
            </div>
            <Progress
              value={healthReport.memory ? (healthReport.memory.used / healthReport.memory.limit) * 100 : 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Cache Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Cache</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthReport.cache?.status === 'connected' ? 'Online' : 'Offline'}
            </div>
            <p className="text-xs text-muted-foreground">
              {healthReport.cache?.status === 'connected' ? 'Conectado' : 'Desconectado'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Performance da API</span>
            </CardTitle>
            <CardDescription>
              Métricas de performance das chamadas de API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total de Requisições</span>
              <span className="font-semibold">
                {formatNumber(healthReport.metrics?.totalRequests || 0)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Tempo Médio de Resposta</span>
              <span className="font-semibold">
                {healthReport.metrics?.avgResponseTime || 0}ms
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Taxa de Erro</span>
              <Badge variant={healthReport.metrics?.errors > 0 ? 'destructive' : 'default'}>
                {healthReport.metrics?.errors || 0} erros
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Taxa de Acerto do Cache</span>
              <span className="font-semibold">
                {healthReport.metrics?.cacheHitRate || 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Alertas do Sistema</span>
            </CardTitle>
            <CardDescription>
              Alertas e notificações recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {healthReport.alerts?.length > 0 ? (
              <div className="space-y-3">
                {healthReport.alerts.slice(0, 5).map((alert, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.type}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>Nenhum alerta ativo</p>
                <p className="text-sm">Sistema funcionando normalmente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Métricas Detalhadas</span>
          </CardTitle>
          <CardDescription>
            Estatísticas avançadas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Error Trends */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Tendências de Erro</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Última hora:</span>
                  <span className={healthReport.errors?.total > 10 ? 'text-red-500' : 'text-green-500'}>
                    {healthReport.errors?.total || 0} erros
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa de erro:</span>
                  <span className={healthReport.errors?.rate > 0.05 ? 'text-red-500' : 'text-green-500'}>
                    {(healthReport.errors?.rate * 100 || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Trends */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tempo médio:</span>
                  <span className={healthReport.performance?.avgResponseTime > 1000 ? 'text-yellow-500' : 'text-green-500'}>
                    {healthReport.performance?.avgResponseTime || 0}ms
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Requisições lentas:</span>
                  <span className={healthReport.performance?.slowRequests > 5 ? 'text-red-500' : 'text-green-500'}>
                    {healthReport.performance?.slowRequests || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Cache Performance */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Cache</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Taxa de acerto:</span>
                  <span className={healthReport.cache?.hitRate < 70 ? 'text-red-500' : 'text-green-500'}>
                    {healthReport.cache?.hitRate || 0}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Operações totais:</span>
                  <span>{formatNumber(healthReport.cache?.totalOperations || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {navigator.onLine ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <span>Status da Rede</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {navigator.onLine ? (
                <Badge className="bg-green-100 text-green-800">
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </Badge>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Conexão: {navigator.onLine ? 'Ativa' : 'Inativa'}
              </span>
            </div>

            <div className="text-sm text-gray-500">
              Última verificação: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringDashboard;
