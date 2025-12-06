import React from "react";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { usePWA } from "@/hooks/usePWA";
import { Download, Menu, X, Home as HomeIcon, Mic, Lightbulb, GraduationCap, Languages, User, Wallet } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

export function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { t } = useLanguage();

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
            <a href="/" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-2">
              <HomeIcon className="h-4 w-4" />
              {t.nav.home}
            </a>
            <a href="/assistant" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-2">
              <Mic className="h-4 w-4" />
              {t.nav.voiceAssistant}
            </a>
            <a href="/devices" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              {t.nav.iotDevices}
            </a>
            <a href="/learning" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              {t.nav.learning}
            </a>
            <a href="/language-learning" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-2">
              <Languages className="h-4 w-4" />
              {t.nav.languages}
            </a>
            <a href="/money" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Money
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
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
              Install App
            </Button>
          )}
          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <a href="/profile">
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">Profile</span>
                </a>
              </Button>
              <Button asChild variant="default" size="sm">
                <a href="/assistant">{t.nav.launchAssistant}</a>
              </Button>
            </>
          ) : (
            <Button asChild variant="default" size="sm">
              <a href={getLoginUrl()}>{t.nav.getStarted}</a>
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
            >
              <HomeIcon className="h-5 w-5" />
              <span>{t.nav.home}</span>
            </a>
            <a
              href="/assistant"
              className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Mic className="h-5 w-5" />
              <span>{t.nav.voiceAssistant}</span>
            </a>
            <a
              href="/devices"
              className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Lightbulb className="h-5 w-5" />
              <span>{t.nav.iotDevices}</span>
            </a>
            <a
              href="/learning"
              className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <GraduationCap className="h-5 w-5" />
              <span>{t.nav.learning}</span>
            </a>
            <a
              href="/language-learning"
              className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Languages className="h-5 w-5" />
              <span>{t.nav.languages}</span>
            </a>
            <a
              href="/money"
              className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Wallet className="h-5 w-5" />
              <span>Money</span>
            </a>
            {isAuthenticated && (
              <a
                href="/profile"
                className="flex items-center gap-3 text-slate-300 hover:text-purple-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </a>
            )}
            {isAuthenticated ? (
              <Button asChild variant="default" className="w-full">
                <a href="/assistant">{t.nav.launchAssistant}</a>
              </Button>
            ) : (
              <Button asChild variant="default" className="w-full">
                <a href={getLoginUrl()}>{t.nav.getStarted}</a>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
