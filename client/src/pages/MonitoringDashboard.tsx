import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Activity, 
  AlertCircle, 
  BarChart3, 
  Clock, 
  Database, 
  RefreshCw, 
  Server, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Search
} from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";

export default function MonitoringDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("24h");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [logLevel, setLogLevel] = useState<"error" | "warn" | "info" | "http" | "debug" | undefined>();

  // Queries (must be called before conditional returns)
  const { data: systemHealth, refetch: refetchHealth } = trpc.admin.getSystemHealth.useQuery(undefined, {
    refetchInterval: autoRefresh ? 30000 : false,
    enabled: !loading && !!user && user.role === "admin",
  });

  const { data: performanceData, refetch: refetchPerformance } = trpc.admin.getPerformanceMetrics.useQuery(
    { timeRange },
    { refetchInterval: autoRefresh ? 30000 : false, enabled: !loading && !!user && user.role === "admin" }
  );

  const { data: apiUsageLogs, refetch: refetchApiUsage } = trpc.admin.getApiUsageLogs.useQuery(
    { limit: 100 },
    { refetchInterval: autoRefresh ? 30000 : false, enabled: !loading && !!user && user.role === "admin" }
  );

  const { data: errorLogs, refetch: refetchErrors } = trpc.admin.getErrorLogs.useQuery(
    { limit: 100, resolved: false },
    { refetchInterval: autoRefresh ? 30000 : false, enabled: !loading && !!user && user.role === "admin" }
  );

  const { data: systemLogs, refetch: refetchSystemLogs } = trpc.admin.getSystemLogs.useQuery(
    { limit: 100, level: logLevel, search: searchTerm || undefined },
    { refetchInterval: autoRefresh ? 30000 : false, enabled: !loading && !!user && user.role === "admin" }
  );

  const resolveErrorMutation = trpc.admin.resolveError.useMutation({
    onSuccess: () => {
      refetchErrors();
    },
  });

  const handleRefreshAll = () => {
    refetchHealth();
    refetchPerformance();
    refetchApiUsage();
    refetchErrors();
    refetchSystemLogs();
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Redirect non-admin users (after all hooks)
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Don't render if not admin
  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto py-8 px-4">
        <Breadcrumb items={[{ label: "Profile", href: "/profile" }, { label: "Admin Dashboard", href: "/profile/admin" }, { label: "System Monitoring" }]} />
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">System Monitoring</h1>
            <p className="text-slate-300">Real-time system health and performance metrics</p>
          </div>
          <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefreshAll}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth ? formatUptime(systemHealth.uptime) : "Loading..."}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Since last restart
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth ? `${systemHealth.memory.used} MB` : "Loading..."}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {systemHealth ? `${systemHealth.memory.percentage}% of ${systemHealth.memory.total} MB` : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unresolved Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {errorLogs ? errorLogs.length : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="api-usage">API Usage</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        {/* Performance Metrics Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Execution time statistics for critical operations</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData && performanceData.stats.length > 0 ? (
                <div className="space-y-6">
                  {performanceData.stats.map((stat) => (
                    <div key={stat.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{stat.name.replace(/_/g, " ").toUpperCase()}</h4>
                        <Badge variant="outline">{stat.stats?.count || 0} calls</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Average</p>
                          <p className="font-medium">{stat.stats?.avg ? formatDuration(stat.stats.avg) : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Min</p>
                          <p className="font-medium">{stat.stats?.min ? formatDuration(stat.stats.min) : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Max</p>
                          <p className="font-medium">{stat.stats?.max ? formatDuration(stat.stats.max) : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">P95</p>
                          <p className="font-medium">{stat.stats?.p95 ? formatDuration(stat.stats.p95) : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">P99</p>
                          <p className="font-medium">{stat.stats?.p99 ? formatDuration(stat.stats.p99) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No performance metrics available for the selected time range
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Usage Tab */}
        <TabsContent value="api-usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Usage Logs</CardTitle>
              <CardDescription>Recent API calls and quota consumption</CardDescription>
            </CardHeader>
            <CardContent>
              {apiUsageLogs && apiUsageLogs.length > 0 ? (
                <div className="space-y-2">
                  {apiUsageLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {log.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        <div>
                          <p className="font-medium">{log.apiName}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.method} {log.endpoint}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">{log.duration ? formatDuration(log.duration) : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quota</p>
                          <p className="font-medium">{log.quotaUsed}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Time</p>
                          <p className="font-medium">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No API usage logs available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Logs</CardTitle>
              <CardDescription>Unresolved errors requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {errorLogs && errorLogs.length > 0 ? (
                <div className="space-y-3">
                  {errorLogs.map((error) => (
                    <div
                      key={error.id}
                      className="p-4 border rounded-lg space-y-2 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">{error.errorType}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(error.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="font-medium mt-2">{error.message}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Context: {error.context}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveErrorMutation.mutate({ errorId: error.id })}
                          disabled={resolveErrorMutation.isPending}
                        >
                          Resolve
                        </Button>
                      </div>
                      {error.stack && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View stack trace
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                            {error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No unresolved errors. System is healthy! 🎉
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Application logs and events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={logLevel || "all"} onValueChange={(v) => setLogLevel(v === "all" ? undefined : v as any)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="http">HTTP</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {systemLogs && systemLogs.length > 0 ? (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {systemLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 border rounded-lg text-sm hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Badge
                          variant={
                            log.level === "error"
                              ? "destructive"
                              : log.level === "warn"
                              ? "default"
                              : "outline"
                          }
                          className="mt-0.5"
                        >
                          {log.level.toUpperCase()}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">{log.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No system logs match your filters
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
