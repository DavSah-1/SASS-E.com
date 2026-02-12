import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Trash2, RefreshCw, Database, Clock, CheckCircle, XCircle, AlertTriangle, Zap, Users, FileText, BarChart3, TrendingUp, Activity, HardDrive } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [cleanupType, setCleanupType] = useState<"age" | "storage" | "both">("both");
  
  // Fetch storage stats (must be called before conditional returns)
  const { data: storageStats, isLoading: statsLoading, refetch: refetchStats } = trpc.admin.getStorageStats.useQuery(undefined, {
    enabled: !loading && !!user && user.role === "admin",
  });
  
  // Fetch cleanup logs
  const { data: cleanupLogs, isLoading: logsLoading, refetch: refetchLogs } = trpc.admin.getCleanupLogs.useQuery(
    { limit: 20 },
    { enabled: !loading && !!user && user.role === "admin" }
  );
  
  // Fetch cache stats
  const { data: cacheStats, isLoading: cacheLoading, refetch: refetchCache } = trpc.admin.getCacheStats.useQuery(undefined, {
    enabled: !loading && !!user && user.role === "admin",
  });

  // Fetch overview stats
  const { data: overviewStats, isLoading: overviewLoading } = trpc.admin.getOverviewStats.useQuery(undefined, {
    enabled: !loading && !!user && user.role === "admin",
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = trpc.admin.getRecentActivity.useQuery(
    { limit: 15 },
    { enabled: !loading && !!user && user.role === "admin" }
  );
  
  // Clear cache mutation
  const clearCacheMutation = trpc.admin.clearCache.useMutation({
    onSuccess: (result) => {
      toast.success(result.message);
      refetchCache();
    },
    onError: (error) => {
      toast.error(`Failed to clear cache: ${error.message}`);
    },
  });
  
  // Cleanup mutation
  const cleanupMutation = trpc.admin.cleanupAudio.useMutation({
    onSuccess: (result) => {
      toast.success("Cleanup completed successfully!");
      console.log("Cleanup result:", result);
      refetchStats();
      refetchLogs();
    },
    onError: (error) => {
      toast.error(`Cleanup failed: ${error.message}`);
    },
  });

  const handleCleanup = () => {
    if (confirm(`Are you sure you want to run ${cleanupType} cleanup? This will permanently delete audio files.`)) {
      cleanupMutation.mutate({ type: cleanupType });
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "partial":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "success" ? "default" : status === "partial" ? "secondary" : "destructive";
    return <Badge variant={variant}>{status}</Badge>;
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
        <Loader2 className="h-8 w-8 animate-spin" />
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
        <Breadcrumb items={[{ label: "Profile", href: "/profile" }, { label: "Admin Dashboard" }]} />
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Admin Dashboard</h1>
          <p className="text-slate-300">Manage audio file storage, cache, and cleanup operations</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                overviewStats?.totalUsers || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                overviewStats?.activeSessions || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                `${Math.round((overviewStats?.cacheHitRate || 0) * 100)}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground">Performance metric</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                `${Math.round(overviewStats?.storageUsed || 0)} MB`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              of {overviewStats?.storageLimit || 1000} MB limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setLocation("/profile/admin/users")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              View and manage user accounts, roles, and permissions
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setLocation("/profile/admin/audit")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Audit Log
            </CardTitle>
            <CardDescription>
              Track all administrative actions and security events
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setLocation("/profile/admin/monitoring")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              System Monitoring
            </CardTitle>
            <CardDescription>
              View system health, logs, metrics, and performance data
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest user registrations and admin actions</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : recentActivity && recentActivity.activities.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === 'user_registration' ? (
                      <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-green-500" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-blue-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>

      {/* Cache Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Search Cache Statistics
          </CardTitle>
          <CardDescription>Redis/In-memory cache for Tavily search results</CardDescription>
        </CardHeader>
        <CardContent>
          {cacheLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : cacheStats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Cache Type</p>
                  <p className="text-2xl font-bold capitalize">{cacheStats.type}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Cached Entries</p>
                  <p className="text-2xl font-bold">{cacheStats.entries}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-2xl font-bold">{cacheStats.enabled ? "✅ Enabled" : "❌ Disabled"}</p>
                </div>
              </div>

              {/* Cache Performance Metrics */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Cache Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold">{cacheStats.totalRequests || 0}</p>
                  </div>
                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <p className="text-sm text-green-600 dark:text-green-400">Cache Hits</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{cacheStats.hits || 0}</p>
                  </div>
                  <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
                    <p className="text-sm text-orange-600 dark:text-orange-400">Cache Misses</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{cacheStats.misses || 0}</p>
                  </div>
                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <p className="text-sm text-blue-600 dark:text-blue-400">Hit Rate</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{cacheStats.hitRate || 0}%</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Cache Efficiency</span>
                    <span className="text-muted-foreground">
                      {cacheStats.hitRate || 0}% of requests served from cache
                    </span>
                  </div>
                  <Progress value={cacheStats.hitRate || 0} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {cacheStats.hitRate && cacheStats.hitRate > 0 ? (
                      <>Saving approximately {cacheStats.hits || 0} API calls through caching</>
                    ) : (
                      <>No cache hits yet. Make some searches to see caching in action!</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => refetchCache()} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Stats
                </Button>
                <Button 
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all cache entries? This will force all subsequent searches to make new API calls.")) {
                      clearCacheMutation.mutate({});
                    }
                  }}
                  variant="destructive" 
                  size="sm"
                  disabled={clearCacheMutation.isPending}
                >
                  {clearCacheMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Cache
                    </>
                  )}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Cache stores search results for 1 hour (successful searches) or 5 minutes (empty results)</p>
                <p>• Cache hits do not consume your Tavily API quota</p>
                <p>• {cacheStats.type === "redis" ? "Using Redis for persistent caching" : "Using in-memory cache (resets on server restart)"}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Failed to load cache statistics</p>
          )}
        </CardContent>
      </Card>

      {/* Storage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage Statistics
          </CardTitle>
          <CardDescription>Current audio file storage usage</CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : storageStats ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Storage Used</span>
                  <span className="text-muted-foreground">
                    {storageStats.totalSizeMB.toFixed(2)} MB / {storageStats.maxSizeMB} MB
                  </span>
                </div>
                <Progress value={storageStats.percentUsed} className="h-3" />
                <p className="text-xs text-muted-foreground text-right">
                  {storageStats.percentUsed.toFixed(1)}% used
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Total Files</p>
                  <p className="text-2xl font-bold">{storageStats.totalFiles}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Total Size</p>
                  <p className="text-2xl font-bold">{storageStats.totalSizeMB.toFixed(2)} MB</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Available Space</p>
                  <p className="text-2xl font-bold">
                    {(storageStats.maxSizeMB - storageStats.totalSizeMB).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <Button onClick={() => refetchStats()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Stats
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Failed to load storage statistics</p>
          )}
        </CardContent>
      </Card>

      {/* Manual Cleanup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Manual Cleanup
          </CardTitle>
          <CardDescription>Trigger audio file cleanup operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cleanup Type</label>
            <div className="flex gap-2">
              <Button
                variant={cleanupType === "age" ? "default" : "outline"}
                onClick={() => setCleanupType("age")}
                size="sm"
              >
                <Clock className="h-4 w-4 mr-2" />
                Age-Based (7 days)
              </Button>
              <Button
                variant={cleanupType === "storage" ? "default" : "outline"}
                onClick={() => setCleanupType("storage")}
                size="sm"
              >
                <Database className="h-4 w-4 mr-2" />
                Storage-Based
              </Button>
              <Button
                variant={cleanupType === "both" ? "default" : "outline"}
                onClick={() => setCleanupType("both")}
                size="sm"
              >
                Both
              </Button>
            </div>
          </div>

          <Button
            onClick={handleCleanup}
            disabled={cleanupMutation.isPending}
            variant="destructive"
            className="w-full md:w-auto"
          >
            {cleanupMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Cleanup...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Run Cleanup
              </>
            )}
          </Button>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>• <strong>Age-Based:</strong> Deletes audio files older than 7 days</p>
            <p>• <strong>Storage-Based:</strong> Deletes oldest files when storage exceeds limit</p>
            <p>• <strong>Both:</strong> Runs both cleanup strategies</p>
          </div>
        </CardContent>
      </Card>

      {/* Cleanup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cleanup History
          </CardTitle>
          <CardDescription>Recent cleanup operations and audit trail</CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : cleanupLogs && cleanupLogs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Files Deleted</TableHead>
                    <TableHead>Space Freed</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cleanupLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          {getStatusBadge(log.status)}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{log.cleanupType.replace("_", " ")}</TableCell>
                      <TableCell>{log.filesDeleted}</TableCell>
                      <TableCell>{parseFloat(log.spaceFreedMB).toFixed(2)} MB</TableCell>
                      <TableCell>{log.executionTimeMs ? `${(log.executionTimeMs / 1000).toFixed(2)}s` : "N/A"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No cleanup history available</p>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
