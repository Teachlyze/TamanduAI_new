import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Advanced metrics dashboard with real-time data visualization and analytics
 * @param {Object} props
 * @param {Array} props.metrics - Array of metric configurations
 * @param {Function} props.onMetricClick - Metric click handler
 * @param {Function} props.onRefresh - Refresh data handler
 * @param {boolean} props.autoRefresh - Auto-refresh enabled
 * @param {number} props.refreshInterval - Refresh interval in seconds
 * @param {string} props.timeRange - Time range for data ('1h' | '24h' | '7d' | '30d')
 * @param {string} props.className - Additional CSS classes
 */
export const [loading, setLoading] = useState(true);
const MetricsDashboard = ({
  metrics = [],
  onMetricClick,
  onRefresh,
  autoRefresh = true,
  refreshInterval = 30,
  timeRange = "24h",
  className = "",
  ...props
}) => {
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for demonstration
  const defaultMetrics = [
    {
      id: "users",
      title: "Usuários Ativos",
      value: 1234,
      change: 12.5,
      trend: "up",
      unit: "usuários",
      color: "blue",
      icon: "👥",
    },
    {
      id: "revenue",
      title: "Receita Mensal",
      value: 45678,
      change: -2.3,
      trend: "down",
      unit: "R$",
      color: "green",
      icon: "💰",
    },
    {
      id: "performance",
      title: "Performance",
      value: 94.2,
      change: 5.1,
      trend: "up",
      unit: "%",
      color: "purple",
      icon: "⚡",
    },
    {
      id: "errors",
      title: "Erros",
      value: 23,
      change: -15.2,
      trend: "up",
      unit: "erros",
      color: "red",
      icon: "🚨",
    },
  ];

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData = {
        overview: defaultMetrics,
        performance: [
          { name: "CPU", value: 45, color: "#3b82f6" },
          { name: "Memória", value: 67, color: "#10b981" },
          { name: "Disco", value: 34, color: "#f59e0b" },
          { name: "Rede", value: 23, color: "#ef4444" },
        ],
        activity: [
          { time: "00:00", users: 120, pageViews: 340 },
          { time: "04:00", users: 89, pageViews: 210 },
          { time: "08:00", users: 234, pageViews: 567 },
          { time: "12:00", users: 345, pageViews: 890 },
          { time: "16:00", users: 287, pageViews: 654 },
          { time: "20:00", users: 198, pageViews: 432 },
        ],
      };

      setDashboardData(mockData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [defaultMetrics]);

  // Auto-refresh effect
  useEffect(() => {
    loadDashboardData();

    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, refreshInterval * 1000);
      /* if (loading) return <LoadingScreen />; */

      return () => clearInterval(interval);
    }
  }, [loadDashboardData, autoRefresh, refreshInterval]);

  // Handle metric click
  const handleMetricClick = useCallback(
    (metric) => {
      onMetricClick?.(metric);
    },
    [onMetricClick]
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadDashboardData();
    onRefresh?.();
  }, [loadDashboardData, onRefresh]);

  // Metric card component
  const MetricCard = ({ metric }) => (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => handleMetricClick(metric)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
        <span className="text-2xl">{metric.icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {metric.unit === "R$"
            ? `${metric.unit} ${metric.value.toLocaleString()}`
            : `${metric.value.toLocaleString()} ${metric.unit}`}
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Badge
            variant={metric.trend === "up" ? "default" : "destructive"}
            className={`mr-2 ${metric.trend === "up" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {metric.trend === "up" ? "↗" : "↘"} {Math.abs(metric.change)}%
          </Badge>
          vs período anterior
        </div>
      </CardContent>
    </Card>
  );

  // Performance chart component
  const PerformanceChart = ({ data }) => (
    <Card>
      <CardHeader>
        <CardTitle>Performance do Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={item.value} className="w-20" />
                <span className="text-sm font-medium">{item.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Activity chart component
  const ActivityChart = ({ data }) => (
    <Card>
      <CardHeader>
        <CardTitle>Atividade por Hora</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">{item.time}h</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{item.users} usuários</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{item.pageViews} visualizações</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading && !dashboardData.overview) {
    /* if (loading) return <LoadingScreen />; */

    return (
      <div className={`metrics-dashboard ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  /* if (loading) return <LoadingScreen />; */

  return (
    <div className={`metrics-dashboard ${className}`} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Métricas</h2>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Última atualização: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Última hora</SelectItem>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? "🔄" : "🔄"} Atualizar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData.overview?.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PerformanceChart data={dashboardData.performance || []} />
            <Card>
              <CardHeader>
                <CardTitle>Alertas de Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-sm">CPU acima de 80%</span>
                    <Badge variant="outline">Aviso</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-sm">Serviço de banco offline</span>
                    <Badge variant="destructive">Crítico</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <ActivityChart data={dashboardData.activity || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetricsDashboard;
