// src/components/admin/HealthDashboard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, AlertTriangle, XCircle, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useHealthCheck } from '@/utils/healthCheck';

/**
 * Dashboard de monitoramento da saúde da aplicação
 */
const HealthDashboard = () => {
  const { healthStatus, metrics } = useHealthCheck();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unhealthy':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!metrics) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 animate-pulse text-blue-500" />
            <span>Verificando saúde do sistema...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-4"
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(healthStatus)}
              <CardTitle className="text-lg">Status do Sistema</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Recolher' : 'Expandir'}
            </Button>
          </div>
          <CardDescription>
            Monitoramento em tempo real da saúde da aplicação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Badge className={`${getStatusColor(healthStatus)} font-medium`}>
              {healthStatus === 'healthy' && 'Sistema Saudável'}
              {healthStatus === 'degraded' && 'Degradado'}
              {healthStatus === 'unhealthy' && 'Não Saudável'}
              {healthStatus === 'unknown' && 'Verificando...'}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Última verificação: {new Date(metrics.last_check).toLocaleTimeString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.healthy_checks}
              </div>
              <div className="text-sm text-muted-foreground">Saudáveis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {metrics.total_checks - metrics.healthy_checks - metrics.unhealthy_checks}
              </div>
              <div className="text-sm text-muted-foreground">Degradados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {metrics.unhealthy_checks}
              </div>
              <div className="text-sm text-muted-foreground">Com Problemas</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Taxa de Sucesso</span>
              <span>{metrics.success_rate.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.success_rate} className="h-2" />
          </div>

          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 mt-4 pt-4 border-t"
            >
              {metrics.checks.map((check) => (
                <div
                  key={check.name}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <div className="font-medium capitalize">
                        {check.name.replace(/[-_]/g, ' ')}
                      </div>
                      {check.message && (
                        <div className="text-sm text-muted-foreground">
                          {check.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={check.status === 'healthy' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {check.status}
                    </Badge>
                    {check.duration && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {check.duration}ms
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * Indicador compacto de saúde para header/sidebar
 */
export const HealthIndicator = () => {
  const { healthStatus } = useHealthCheck();

  const getIndicatorColor = () => {
    switch (healthStatus) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'unhealthy':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${getIndicatorColor()}`} />
      <span className="text-sm text-muted-foreground capitalize">
        {healthStatus === 'healthy' && 'Sistema OK'}
        {healthStatus === 'degraded' && 'Atenção'}
        {healthStatus === 'unhealthy' && 'Problema'}
        {healthStatus === 'unknown' && 'Verificando'}
      </span>
    </div>
  );
};

/**
 * Hook para health checks em componentes específicos
 */
export const useServiceHealth = (serviceName) => {
  const { metrics } = useHealthCheck();
  const service = metrics?.checks?.find(check => check.name === serviceName);

  return {
    status: service?.status || 'unknown',
    data: service?.data,
    message: service?.message,
    isHealthy: service?.status === 'healthy',
  };
};

export default HealthDashboard;
