import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "./ui/button";

/**
 * Install promotion banner for desktop users
 * Shows after 2 page views if app is installable and not dismissed
 */
export function InstallBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed
    const dismissed = localStorage.getItem("sass-e-install-banner-dismissed");
    if (dismissed === "true") {
      return;
    }

    // Track page views
    const pageViews = parseInt(localStorage.getItem("sass-e-page-views") || "0", 10);
    const newPageViews = pageViews + 1;
    localStorage.setItem("sass-e-page-views", newPageViews.toString());

    // Don't show until after 2 page views
    if (newPageViews < 2) {
      return;
    }

    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    if (isStandalone) {
      console.log("App already installed");
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("beforeinstallprompt event fired");
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Fallback: Show banner after 3 seconds if beforeinstallprompt doesn't fire
    // This helps with testing and browsers that support PWA but don't fire the event reliably
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt) {
        console.log("beforeinstallprompt not fired, showing fallback banner");
        // Check if browser supports service workers (basic PWA requirement)
        if ('serviceWorker' in navigator && newPageViews >= 2) {
          setShowFallback(true);
          setIsVisible(true);
        }
      }
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Native install prompt available
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      }

      setDeferredPrompt(null);
    } else if (showFallback) {
      // Show instructions for manual installation
      const instructions = getInstallInstructions();
      alert(instructions);
    }

    setIsVisible(false);
    localStorage.setItem("sass-e-install-banner-dismissed", "true");
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("sass-e-install-banner-dismissed", "true");
  };

  const getInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return "To install SASS-E:\n1. Click the menu (⋮) in the top-right\n2. Select 'Install SASS-E' or 'Install app'\n3. Follow the prompts";
    } else if (userAgent.includes('edg')) {
      return "To install SASS-E:\n1. Click the menu (⋯) in the top-right\n2. Select 'Apps' > 'Install this site as an app'\n3. Follow the prompts";
    } else if (userAgent.includes('safari')) {
      return "To add SASS-E to your home screen:\n1. Tap the Share button\n2. Scroll down and tap 'Add to Home Screen'\n3. Tap 'Add'";
    } else {
      return "To install SASS-E, look for an 'Install' or 'Add to Home Screen' option in your browser's menu.";
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Download className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              Install SASS-E for a better experience
            </p>
            <p className="text-xs opacity-90">
              Quick access, offline support, and faster performance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleInstall}
            size="sm"
            variant="secondary"
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            {deferredPrompt ? "Install" : "How to Install"}
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
