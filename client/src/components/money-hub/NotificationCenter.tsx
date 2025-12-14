import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Bell, X, Check, AlertCircle, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: alerts = [], isLoading } = trpc.budget.getAlerts.useQuery(
    { unreadOnly: true },
    { enabled: open }
  );

  const { data: unreadCount = 0 } = trpc.budget.getUnreadAlertCount.useQuery();

  const markAsRead = trpc.budget.markAlertRead.useMutation({
    onSuccess: () => {
      utils.budget.getAlerts.invalidate();
      utils.budget.getUnreadAlertCount.invalidate();
    },
  });

  const markAllAsRead = trpc.budget.markAllAlertsRead.useMutation({
    onSuccess: () => {
      utils.budget.getAlerts.invalidate();
      utils.budget.getUnreadAlertCount.invalidate();
      toast.success("All alerts marked as read");
    },
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "threshold_80":
      case "threshold_100":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "exceeded":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "weekly_summary":
      case "monthly_report":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "threshold_80":
        return "bg-yellow-500/10 border-yellow-500/20";
      case "threshold_100":
        return "bg-orange-500/10 border-orange-500/20";
      case "exceeded":
        return "bg-red-500/10 border-red-500/20";
      case "weekly_summary":
      case "monthly_report":
        return "bg-blue-500/10 border-blue-500/20";
      default:
        return "bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[500px] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {alerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading notifications...
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No new notifications</p>
          </div>
        ) : (
          <div className="divide-y">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 hover:bg-accent/50 transition-colors ${getAlertColor(alert.alertType)} border-l-4`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getAlertIcon(alert.alertType)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight mb-1">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(alert.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => markAsRead.mutate({ alertId: alert.id })}
                    disabled={markAsRead.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
