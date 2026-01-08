import { useState, useEffect } from "react";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { getPendingCount, syncQueue } from "@/lib/backgroundSync";
import { toast } from "sonner";

/**
 * Sync status indicator showing pending offline actions
 */
export function SyncStatus() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Update pending count
    const updateCount = () => {
      setPendingCount(getPendingCount());
    };

    updateCount();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      updateCount();
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateCount();
    };

    // Listen for sync complete events
    const handleSyncComplete = (event: any) => {
      updateCount();
      if (event.detail?.count > 0) {
        toast.success(`Synced ${event.detail.count} offline actions`);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("sync-complete", handleSyncComplete);

    // Update count periodically
    const interval = setInterval(updateCount, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("sync-complete", handleSyncComplete);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) {
      toast.error("Cannot sync while offline");
      return;
    }

    setIsSyncing(true);
    try {
      const count = await syncQueue();
      if (count > 0) {
        toast.success(`Successfully synced ${count} actions`);
      } else {
        toast.info("No pending actions to sync");
      }
      setPendingCount(getPendingCount());
    } catch (error) {
      toast.error("Failed to sync actions");
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Don't show if no pending actions and online
  if (pendingCount === 0 && isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[250px]">
        {isOnline ? (
          <Cloud className="h-5 w-5 text-green-500" />
        ) : (
          <CloudOff className="h-5 w-5 text-yellow-500" />
        )}
        
        <div className="flex-1">
          <p className="text-sm font-medium text-white">
            {isOnline ? "Online" : "Offline"}
          </p>
          {pendingCount > 0 && (
            <p className="text-xs text-slate-400">
              {pendingCount} action{pendingCount !== 1 ? "s" : ""} pending
            </p>
          )}
        </div>

        {pendingCount > 0 && isOnline && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="h-8 px-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          </Button>
        )}
      </div>
    </div>
  );
}
