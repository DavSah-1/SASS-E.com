import { Bell, CheckCircle, AlertTriangle, TrendingUp, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function BudgetAlerts() {
  const { data: alerts = [], refetch } = trpc.budget.getAlerts.useQuery({ unreadOnly: false, limit: 10 });
  const markRead = trpc.budget.markAlertRead.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Alert marked as read");
    },
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "threshold_80":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "threshold_100":
      case "exceeded":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "weekly_summary":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case "monthly_report":
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "threshold_80":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Warning</Badge>;
      case "threshold_100":
      case "exceeded":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Critical</Badge>;
      case "weekly_summary":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Summary</Badge>;
      case "monthly_report":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Report</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Budget Alerts
          </CardTitle>
          <CardDescription>Stay on top of your spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No alerts yet. We'll notify you when you approach budget limits.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Budget Alerts
          {alerts.filter(a => a.isRead === 0).length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {alerts.filter(a => a.isRead === 0).length} new
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Recent budget notifications and warnings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                alert.isRead === 0 ? "bg-muted/50 border-primary/20" : "bg-background"
              }`}
            >
              <div className="mt-0.5">{getAlertIcon(alert.alertType)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getAlertBadge(alert.alertType)}
                  <span className="text-xs text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{alert.message}</p>
              </div>
              {alert.isRead === 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markRead.mutate({ alertId: alert.id })}
                  className="shrink-0"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
