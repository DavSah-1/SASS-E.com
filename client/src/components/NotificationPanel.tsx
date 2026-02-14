import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Bell, Check, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { NotificationActionButton } from "./NotificationActionButton";

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: notifications = [], isLoading } = trpc.notifications.getNotifications.useQuery(
    { includeRead: false },
    { enabled: open }
  );

  const { data: unreadCountData } = trpc.notifications.getUnreadCount.useQuery();
  const unreadCount = unreadCountData?.count || 0;

  const markAllAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getNotifications.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      toast.success("All notifications marked as read");
    },
  });

  const handleMarkAllAsRead = () => {
    // Mark all unread notifications as read
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    if (unreadNotifications.length === 0) {
      toast.info("No unread notifications");
      return;
    }

    // Mark all as read by passing a special flag
    markAllAsRead.mutate({ notificationId: -1 }); // -1 signals "mark all"
  };

  const getNotificationIcon = (type: string) => {
    // You can customize icons based on notification type
    return <Bell className="h-5 w-5 text-blue-500" />;
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "fact_update":
        return "bg-blue-500/10 border-blue-500/20";
      case "debt_milestone":
        return "bg-green-500/10 border-green-500/20";
      case "learning_achievement":
        return "bg-purple-500/10 border-purple-500/20";
      case "budget_alert":
        return "bg-yellow-500/10 border-yellow-500/20";
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
      <DropdownMenuContent align="end" className="w-[420px] max-h-[600px] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
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
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-accent/50 transition-colors ${
                  notification.isRead ? "opacity-60" : ""
                } ${getNotificationColor(notification.notificationType)} border-l-4`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getNotificationIcon(notification.notificationType)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight mb-1">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    
                    {/* Batch count indicator */}
                    {notification.batchCount && notification.batchCount > 1 && (
                      <Badge variant="secondary" className="text-xs mb-2">
                        {notification.batchCount} updates
                      </Badge>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Calendar className="h-3 w-3" />
                      {new Date(notification.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {notification.actionUrl && (
                        <NotificationActionButton
                          notificationId={notification.id}
                          actionUrl={notification.actionUrl}
                          actionType={notification.actionType || "view_details"}
                          actionLabel={notification.actionLabel || "View Details"}
                        />
                      )}
                      
                      {!notification.isRead && (
                        <NotificationActionButton
                          notificationId={notification.id}
                          actionType="mark_read"
                          actionLabel="Mark as Read"
                        />
                      )}
                      
                      <NotificationActionButton
                        notificationId={notification.id}
                        actionType="dismiss"
                        actionLabel="Dismiss"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
