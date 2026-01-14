import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  
  // Get unread count
  const { data: unreadData } = trpc.notifications.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Get notifications
  const { data: notifications, refetch } = trpc.notifications.getNotifications.useQuery(
    { includeRead: false },
    { enabled: open }
  );
  
  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  
  const dismiss = trpc.notifications.dismiss.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  
  const unreadCount = unreadData?.count || 0;
  
  const handleNotificationClick = (notificationId: number) => {
    markAsRead.mutate({ notificationId });
  };
  
  const handleDismiss = (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    dismiss.mutate({ notificationId });
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
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="p-2">
          <h3 className="font-semibold text-lg mb-2">Fact Updates</h3>
          {notifications && notifications.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <CardHeader className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-sm">{notification.title}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {notification.message}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => handleDismiss(notification.id, e)}
                        >
                          ×
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="text-xs space-y-2">
                        <div>
                          <span className="font-semibold text-muted-foreground">Previous:</span>
                          <p className="mt-1 text-muted-foreground line-clamp-2">
                            {notification.oldVersion.answer}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-primary">Updated:</span>
                          <p className="mt-1 line-clamp-2">
                            {notification.newVersion.answer}
                          </p>
                        </div>
                        <p className="text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No new fact updates</p>
              <p className="text-xs mt-1">You'll be notified when facts you've accessed are updated</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
