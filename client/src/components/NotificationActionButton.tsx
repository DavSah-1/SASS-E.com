import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ExternalLink, Check, X } from "lucide-react";

interface NotificationActionButtonProps {
  notificationId: number;
  actionUrl?: string | null;
  actionType?: string;
  actionLabel?: string;
  onActionComplete?: () => void;
}

export function NotificationActionButton({
  notificationId,
  actionUrl,
  actionType = "view_details",
  actionLabel = "View Details",
  onActionComplete,
}: NotificationActionButtonProps) {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const utils = trpc.useUtils();

  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getNotifications.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      onActionComplete?.();
    },
  });

  const dismiss = trpc.notifications.dismiss.useMutation({
    onSuccess: () => {
      utils.notifications.getNotifications.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      toast.success("Notification dismissed");
      onActionComplete?.();
    },
  });

  const handleAction = async () => {
    setIsLoading(true);
    try {
      switch (actionType) {
        case "view_details":
          if (actionUrl) {
            // Mark as read and navigate
            await markAsRead.mutateAsync({ notificationId });
            setLocation(actionUrl);
          }
          break;

        case "mark_read":
          await markAsRead.mutateAsync({ notificationId });
          toast.success("Marked as read");
          break;

        case "dismiss":
          await dismiss.mutateAsync({ notificationId });
          break;

        case "custom":
          if (actionUrl) {
            setLocation(actionUrl);
          }
          break;

        default:
          console.warn(`Unknown action type: ${actionType}`);
      }
    } catch (error) {
      console.error("Action failed:", error);
      toast.error("Action failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonIcon = () => {
    switch (actionType) {
      case "view_details":
      case "custom":
        return <ExternalLink className="h-3 w-3 mr-1" />;
      case "mark_read":
        return <Check className="h-3 w-3 mr-1" />;
      case "dismiss":
        return <X className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getButtonVariant = () => {
    switch (actionType) {
      case "view_details":
      case "custom":
        return "default";
      case "mark_read":
        return "outline";
      case "dismiss":
        return "ghost";
      default:
        return "outline";
    }
  };

  return (
    <Button
      variant={getButtonVariant() as any}
      size="sm"
      onClick={handleAction}
      disabled={isLoading || markAsRead.isPending || dismiss.isPending}
      className="text-xs"
    >
      {getButtonIcon()}
      {actionLabel}
    </Button>
  );
}
