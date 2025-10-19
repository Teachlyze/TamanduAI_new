// src/components/admin/ConnectionMonitor.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Activity,
  Clock,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getSupabaseConnectionManager,
  checkConnection,
  forceReconnect
} from '@/lib/supabaseConnectionManager';
import { useErrorMonitoring } from '@/services/errorMonitoring.jsx';
import { usePerformanceOptimization } from '@/services/performanceOptimizer.jsx';

/**
 * Monitor de conexão Supabase em tempo real
 */
const ConnectionMonitor = ({ className = '' }) => {
  const [connectionState, setConnectionState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const { getMetrics: getErrorMetrics } = useErrorMonitoring();
  const { getMetrics: getPerformanceMetrics } = usePerformanceOptimization();

  // Atualizar estado da conexão
  useEffect(() => {
    const updateConnectionState = async () => {
      try {
        const state = await checkConnection();
        setConnectionState(state);
        setLastUpdate(Date.now());
      } catch (error) {
        console.error('Failed to check connection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    updateConnectionState();

    // Atualizar a cada 10 segundos
    const interval = setInterval(updateConnectionState, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleReconnect = async () => {
    setIsLoading(true);
    try {
      await forceReconnect();
      // Aguardar um pouco para refletir mudança
      setTimeout(async () => {
        const state = await checkConnection();
        setConnectionState(state);
        setLastUpdate(Date.now());
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Reconnection failed:', error);
      setIsLoading(false);
    }
  };

  const getConnectionIcon = () => {
    switch (connectionState?.state) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'connecting':
      case 'reconnecting':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
      case 'disconnected':
        return <WifiOff className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  const getConnectionBadge = () => {
    const state = connectionState?.state;

    switch (state) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Conectado
          </Badge>
        );
      case 'connecting':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Conectando...
          </Badge>
        );
      case 'reconnecting':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Reconectando...
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Erro
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Desconectado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Verificando...
          </Badge>
        );
    }
  };

  if (isLoading && !connectionState) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 animate-pulse text-blue-500" />
            <span>Verificando conexão...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-4 ${className}`}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getConnectionIcon()}
              <CardTitle className="text-lg">Conexão Supabase</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {getConnectionBadge()}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReconnect}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <CardDescription>
            Monitoramento em tempo real da conexão com o banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectionState && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estado:</span>
                  <span className="font-medium capitalize">{connectionState.state}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tentativas de reconexão:</span>
                  <span className="font-medium">
                    {connectionState.reconnectAttempts}/{connectionState.maxReconnectAttempts}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Última atualização:</span>
                  <span className="font-medium">
                    {new Date(lastUpdate).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uptime:</span>
                  <span className="font-medium">
                    {connectionState.state === 'connected' ?
                      `${Math.floor((Date.now() - (connectionState.connectedAt || Date.now())) / 1000)}s` :
                      'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Heartbeat:</span>
                  <span className="font-medium">30s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Health Check:</span>
                  <span className="font-medium">60s</span>
                </div>
              </div>
            </div>
          )}

          {/* Indicadores de problemas */}
          {connectionState?.reconnectAttempts > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  {connectionState.reconnectAttempts === 1 ?
                    'Uma tentativa de reconexão foi necessária' :
                    `${connectionState.reconnectAttempts} tentativas de reconexão foram necessárias`
                  }
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * Dashboard integrado de monitoramento
 */
export const IntegratedMonitoringDashboard = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('connection');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'connection', label: 'Conexão', icon: Wifi },
          { id: 'errors', label: 'Erros', icon: AlertTriangle },
          { id: 'performance', label: 'Performance', icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'connection' && <ConnectionMonitor />}
        {activeTab === 'errors' && <ErrorMetricsDashboard />}
        {activeTab === 'performance' && <PerformanceDashboard />}
      </div>
    </div>
  );
};

/**
 * Indicador compacto para header
 */
export const ConnectionIndicator = () => {
  const [connectionState, setConnectionState] = useState('unknown');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const state = await checkConnection();
        setConnectionState(state.state);
      } catch {
        setConnectionState('error');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const getIndicatorColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
      case 'reconnecting':
        return 'bg-blue-500 animate-pulse';
      case 'error':
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getTooltipText = () => {
    switch (connectionState) {
      case 'connected':
        return 'Conectado ao banco de dados';
      case 'connecting':
        return 'Conectando...';
      case 'reconnecting':
        return 'Reconectando...';
      case 'error':
        return 'Erro de conexão';
      case 'disconnected':
        return 'Desconectado';
      default:
        return 'Verificando conexão...';
    }
  };

  return (
    <div className="flex items-center gap-2 px-2" title={getTooltipText()}>
      <div className={`w-2 h-2 rounded-full ${getIndicatorColor()}`} />
    </div>
  );
};

export default ConnectionMonitor;
