import React from "react";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { usePWA } from "@/hooks/usePWA";
import { Download, Menu, X, Home as HomeIcon, Mic, Lightbulb, GraduationCap, Languages, User, Wallet, Heart, LogOut, WifiOff, AlertCircle, DollarSign, ChevronDown, Grid } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { NotificationBell } from "./NotificationBell";
import { useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const [showHubsDropdown, setShowHubsDropdown] = React.useState(false);
  const hubsDropdownRef = React.useRef<HTMLDivElement>(null);
  const { t, translate } = useLanguage();
  const isOnline = useOnlineStatus();
  const [, setLocation] = useLocation();

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutDialog(false);
    await logout();
    toast.success("Successfully signed out", {
      description: "You have been logged out of your account.",
    });
    setLocation("/");
  };

  // Click-outside detection for Hubs dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hubsDropdownRef.current && !hubsDropdownRef.current.contains(event.target as Node)) {
        setShowHubsDropdown(false);
      }
    };

    if (showHubsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHubsDropdown]);

  return (
    <nav className="sticky top-0 z-50 border-b border-purple-500/20 bg-slate-900/50 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center" style={{paddingTop: '0px', paddingBottom: '0px', height: '65px'}}>
        <div className="flex items-center gap-2 sm:gap-3">
          {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-6 w-6 sm:h-8 sm:w-8" />}
          <span className="text-base sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mr-2 sm:mr-6">
            {APP_TITLE}
          </span>
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 ml-4 lg:ml-8">
            <a href="/" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center" title="Home">
              <HomeIcon className="h-4 w-4" />
            </a>
            <a href="/specialized-learning" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              {translate("Learning")}
            </a>
            <a href={isAuthenticated ? "/hubs/translate" : "/translate"} className="text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-2">
              <Languages className="h-4 w-4" />
              {translate("Translate")}
            </a>
            {/* Hubs Dropdown */}
            <div className="relative" ref={hubsDropdownRef}>
              <button 
                onClick={() => setShowHubsDropdown(!showHubsDropdown)}
                className="text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-2"
              >
                <Grid className="h-4 w-4" />
                {translate("Hubs")}
                <ChevronDown className="h-3 w-3" />
              </button>
              {showHubsDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-purple-500/20 rounded-lg shadow-xl py-2 z-50">
                  <a 
                    href="/hubs/money" 
                    className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-purple-400 hover:bg-slate-700/50 transition-colors"
                    onClick={() => setShowHubsDropdown(false)}
                  >
                    <Wallet className="h-4 w-4" />
                    {translate("Money Hub")}
                  </a>
                  <a 
                    href="/hubs/wellness" 
                    className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-purple-400 hover:bg-slate-700/50 transition-colors"
                    onClick={() => setShowHubsDropdown(false)}
                  >
                    <Heart className="h-4 w-4" />
                    {translate("Wellness Hub")}
                  </a>
                  <a 
                    href="/hubs/translate" 
                    className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-purple-400 hover:bg-slate-700/50 transition-colors"
                    onClick={() => setShowHubsDropdown(false)}
                  >
                    <Languages className="h-4 w-4" />
                    {translate("Translation Hub")}
                  </a>
                  <a 
                    href="/hubs/learning" 
                    className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-purple-400 hover:bg-slate-700/50 transition-colors"
                    onClick={() => setShowHubsDropdown(false)}
                  >
                    <GraduationCap className="h-4 w-4" />
                    {translate("Learning Hub")}
                  </a>
                </div>
              )}
            </div>
            <a href="/pricing" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {translate("Pricing")}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Offline Indicator */}
          {!isOnline && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
              <WifiOff className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-medium text-yellow-500 hidden sm:inline">{translate("Offline")}</span>
            </div>
          )}
          
          {/* Language Selector */}
          <LanguageSelector />
          
          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-purple-400 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
          {isInstallable && !isInstalled && (
            <Button onClick={installApp} variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              {translate("Install App")}
            </Button>
          )}
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Button asChild variant="ghost" size="sm">
                <a href="/profile">
                  <User className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="default" size="sm">
                <a href="/assistant">{translate("Launch Assistant")}</a>
              </Button>
              <Button onClick={handleLogoutClick} variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button asChild variant="default" size="sm">
              <a href={getLoginUrl()}>{translate("Sign In")}</a>
            </Button>
          )}
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-500/20 bg-slate-900/95 backdrop-blur">
          <div className="container mx-auto px-4 sm:px-6 py-4 space-y-3">
            <a
              href="/"
              className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
              title="Home"
            >
              <HomeIcon className="h-5 w-5" />
              <span>{translate("Home")}</span>
            </a>
            <a
              href="/specialized-learning"
              className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <GraduationCap className="h-5 w-5" />
              <span>{translate("Learning")}</span>
            </a>
            <a
              href={isAuthenticated ? "/hubs/translate" : "/translate"}
              className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Languages className="h-5 w-5" />
              <span>{translate("Translate")}</span>
            </a>
            {/* Hubs Section */}
            <div className="border-t border-purple-500/20 pt-3 mt-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Grid className="h-4 w-4" />
                {translate("Hubs")}
              </div>
              <a
                href="/hubs/money"
                className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2 pl-6"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Wallet className="h-5 w-5" />
                <span>{translate("Money Hub")}</span>
              </a>
              <a
                href="/hubs/wellness"
                className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2 pl-6"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="h-5 w-5" />
                <span>{translate("Wellness Hub")}</span>
              </a>
              <a
                href="/hubs/translate"
                className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2 pl-6"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Languages className="h-5 w-5" />
                <span>{translate("Translation Hub")}</span>
              </a>
              <a
                href="/hubs/learning"
                className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2 pl-6"
                onClick={() => setMobileMenuOpen(false)}
              >
                <GraduationCap className="h-5 w-5" />
                <span>{translate("Learning Hub")}</span>
              </a>
            </div>
            <a
              href="/pricing"
              className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <DollarSign className="h-5 w-5" />
              <span>{translate("Pricing")}</span>
            </a>
            {isAuthenticated && (
              <a
                href="/profile"
                className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>{translate("Profile")}</span>
              </a>
            )}
            {isAuthenticated ? (
              <>
                <Button asChild variant="default" className="w-full">
                  <a href="/assistant">{translate("Launch Assistant")}</a>
                </Button>
                <Button onClick={() => { handleLogoutClick(); setMobileMenuOpen(false); }} variant="outline" className="w-full gap-2">
                  <LogOut className="h-5 w-5" />
                  <span>{translate("Sign Out")}</span>
                </Button>
              </>
            ) : (
              <Button asChild variant="default" className="w-full">
                <a href={getLoginUrl()}>{translate("Sign In")}</a>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-slate-800 border-purple-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              {translate("Confirm Sign Out")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              {translate("Are you sure you want to sign out? You'll need to log in again to access your personalized features.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-slate-100 hover:bg-slate-600 border-slate-600">
              {translate("Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogoutConfirm}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              {translate("Sign Out")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
}
