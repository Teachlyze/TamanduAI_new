// src/components/admin/CacheMonitor.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  RefreshCw,
  Database,
  HardDrive,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  Activity
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const CacheMonitor = () => {
  const [cacheStats, setCacheStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCacheStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/cache/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch cache stats');
      }
      const stats = await response.json();
      setCacheStats(stats);
    } catch (err) {
      console.error('Error loading cache stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      const response = await fetch('/api/cache/clear', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to clear cache');
      }
      const result = await response.json();

      toast({
        title: 'Cache limpo!',
        description: `Removidos ${result.clearedKeys} registros do cache.`,
      });

      // Reload stats
      await loadCacheStats();
    } catch (err) {
      console.error('Error clearing cache:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível limpar o cache.',
        variant: 'destructive',
      });
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  useEffect(() => {
    loadCacheStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadCacheStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !cacheStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Monitor de Cache Redis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">Carregando estatísticas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            Monitor de Cache Redis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span>Erro ao conectar com Redis: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const memoryUsagePercent = cacheStats?.memoryUsage?.usedMemory && cacheStats?.memoryUsage?.usedMemoryHuman
    ? (parseFloat(cacheStats.memoryUsage.usedMemory) / (parseFloat(cacheStats.memoryUsage.usedMemory) + 1000000)) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Monitor de Cache Redis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadCacheStats}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={clearCache}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Cache
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status geral */}
        <div className="flex items-center gap-2">
          <Badge variant={cacheStats ? 'default' : 'destructive'} className="flex items-center gap-1">
            {cacheStats ? (
              <>
                <CheckCircle className="w-3 h-3" />
                Conectado
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                Desconectado
              </>
            )}
          </Badge>
          {cacheStats?.uptime && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatUptime(cacheStats.uptime)}
            </Badge>
          )}
        </div>

        {/* Estatísticas principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total de Chaves</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {cacheStats?.totalKeys?.toLocaleString() || '0'}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Uso de Memória</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {cacheStats?.memoryUsage?.usedMemoryHuman || '0 MB'}
            </p>
            {memoryUsagePercent > 0 && (
              <Progress value={memoryUsagePercent} className="mt-2 h-2" />
            )}
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Status</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {cacheStats ? 'Ativo' : 'Inativo'}
            </p>
          </div>
        </div>

        {/* Detalhes da memória */}
        {cacheStats?.memoryUsage && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Detalhes da Memória</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Memória usada:</span>
                <span className="font-medium ml-2">{cacheStats.memoryUsage.usedMemoryHuman}</span>
              </div>
              <div>
                <span className="text-gray-600">Memória total:</span>
                <span className="font-medium ml-2">
                  {formatBytes(parseInt(cacheStats.memoryUsage.usedMemory) + 1000000)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Cache Health Check */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Health Check</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Conexão Redis:</span>
              <Badge variant={cacheStats ? 'default' : 'destructive'}>
                {cacheStats ? 'OK' : 'Falha'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Performance:</span>
              <Badge variant="outline">
                {cacheStats?.totalKeys < 1000 ? 'Excelente' :
                 cacheStats?.totalKeys < 5000 ? 'Boa' : 'Requer atenção'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={loadCacheStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="destructive" size="sm" onClick={clearCache}>
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Todo Cache
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CacheMonitor;
