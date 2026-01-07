import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, X, Smartphone, Zap, Wifi, Bell } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

export function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the prompt before
    const hasDismissed = localStorage.getItem("pwa-install-dismissed");
    if (hasDismissed) {
      setDismissed(true);
      return;
    }

    // Show prompt after 30 seconds if installable and not installed
    const timer = setTimeout(() => {
      if (isInstallable && !isInstalled && !dismissed) {
        setShowPrompt(true);
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, dismissed]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
    setDismissed(true);
  };

  const handleLater = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !isInstallable || isInstalled) {
    return null;
  }

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-purple-500" />
              Install SASS-E App
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleLater}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Get the full app experience with these benefits:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Smartphone className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Quick Access</h4>
              <p className="text-sm text-muted-foreground">
                Launch directly from your home screen like a native app
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Zap className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Faster Performance</h4>
              <p className="text-sm text-muted-foreground">
                Optimized loading and smoother navigation
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <Wifi className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Offline Access</h4>
              <p className="text-sm text-muted-foreground">
                View your data even without internet connection
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-yellow-500/10 p-2">
              <Bell className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Push Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Get reminders for goals, workouts, and financial insights
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleInstall}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Install Now
          </Button>
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleLater}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="flex-1"
            >
              Don't Show Again
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
