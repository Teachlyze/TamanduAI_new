// src/components/MetricsDashboard.jsx
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Activity, AlertTriangle, CheckCircle, Clock, Database, Zap, TrendingUp } from 'lucide-react';
import monitoringService from '@/services/monitoring';

export default function MetricsDashboard({ isVisible = false }) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadMetrics();
    }
  }, [isVisible]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const healthReport = await monitoringService.getHealthReport();
      setMetrics(healthReport);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  if (loading) return <LoadingScreen />;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          System Health
        </h3>
        <button
          onClick={loadMetrics}
          disabled={isLoading}
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          {isLoading ? '...' : 'Refresh'}
        </button>
      </div>

      {metrics ? (
        <div className="space-y-3">
          {/* Status geral */}
          <div className="flex items-center gap-2">
            {metrics.status === 'healthy' ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            )}
            <span className={`text-sm font-medium ${
              metrics.status === 'healthy' ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'
            }`}>
              {metrics.status === 'healthy' ? 'Sistema Saudável' : 'Sistema Degradado'}
            </span>
          </div>

          {/* Métricas principais */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">Requests:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {metrics.metrics.totalRequests}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className="text-gray-600 dark:text-gray-400">Errors:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {metrics.metrics.errors}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-purple-500" />
              <span className="text-gray-600 dark:text-gray-400">Avg RT:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {metrics.metrics.avgResponseTime}ms
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Database className="w-3 h-3 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">Cache:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {metrics.metrics.cacheHitRate}%
              </span>
            </div>
          </div>

          {/* Cache status */}
          <div className="flex items-center gap-2 text-xs">
            <Database className={`w-3 h-3 ${metrics.cache.status === 'healthy' ? 'text-green-500' : 'text-red-500'}`} />
            <span className="text-gray-600 dark:text-gray-400">Redis:</span>
            <span className={`font-medium ${
              metrics.cache.status === 'healthy' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
            }`}>
              {metrics.cache.status === 'healthy' ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Memory usage */}
          {metrics.memory && (
            <div className="text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-1">
                <span>Memory:</span>
                <span>{Math.round(metrics.memory.used / 1024 / 1024)}MB</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((metrics.memory.used / metrics.memory.limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-2">
            Última atualização: {new Date(metrics.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Carregando métricas...
        </div>
      )}
    </div>
  );
}
