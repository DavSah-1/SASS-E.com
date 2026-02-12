import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, Search } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { toast } from "sonner";

export default function AuditLog() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(0);
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const pageSize = 50;

  // Fetch audit logs
  const { data: logsData, refetch: refetchLogs, isLoading: logsLoading } = trpc.admin.getAuditLogs.useQuery(
    {
      limit: pageSize,
      offset: page * pageSize,
      actionType: actionTypeFilter === "all" ? undefined : actionTypeFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
    {
      enabled: !loading && !!user && user.role === "admin",
    }
  );

  // Export query (disabled by default, triggered manually)
  const [exportEnabled, setExportEnabled] = useState(false);
  const { data: exportData, refetch: refetchExport, isLoading: exportLoading } = trpc.admin.exportAuditLogs.useQuery(
    {
      actionType: actionTypeFilter === "all" ? undefined : actionTypeFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
    {
      enabled: exportEnabled && !loading && !!user && user.role === "admin",
    }
  );

  // Handle export data when it arrives
  useEffect(() => {
    if (exportData && exportEnabled) {
      // Convert to CSV
      if (!exportData.logs || exportData.logs.length === 0) {
        toast.error("No audit logs to export");
        setExportEnabled(false);
        return;
      }

      const headers = ["ID", "Timestamp", "Admin Email", "Action Type", "Target User Email", "Details", "IP Address"];
      const rows = exportData.logs.map((log: any) => [
        log.id,
        new Date(log.createdAt).toLocaleString(),
        log.adminEmail || "N/A",
        log.actionType,
        log.targetUserEmail || "N/A",
        log.details || "",
        log.ipAddress || "N/A",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(",")),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Audit logs exported successfully");
      setExportEnabled(false);
    }
  }, [exportData, exportEnabled]);

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const logs = logsData?.logs || [];
  const total = logsData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const handleExport = () => {
    setExportEnabled(true);
    refetchExport();
  };

  const getActionBadgeVariant = (actionType: string) => {
    switch (actionType) {
      case "role_change":
        return "default";
      case "user_delete":
        return "destructive";
      case "password_reset":
        return "secondary";
      case "user_suspend":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumb items={[{ label: "Admin Dashboard", href: "/profile/admin" }, { label: "Audit Log" }]} />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Audit Log</CardTitle>
          <CardDescription>
            Track all administrative actions for compliance and security monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Action Type</label>
              <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="role_change">Role Change</SelectItem>
                  <SelectItem value="user_delete">User Delete</SelectItem>
                  <SelectItem value="password_reset">Password Reset</SelectItem>
                  <SelectItem value="user_suspend">User Suspend</SelectItem>
                  <SelectItem value="cache_clear">Cache Clear</SelectItem>
                  <SelectItem value="manual_cleanup">Manual Cleanup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => refetchLogs()}
                disabled={logsLoading}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="default"
                onClick={handleExport}
                disabled={exportLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target User</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>{log.adminEmail || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.actionType)}>
                          {log.actionType.replace("_", " ").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.targetUserEmail || "N/A"}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.details || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ipAddress || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, total)} of {total} logs
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
