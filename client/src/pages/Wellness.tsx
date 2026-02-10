import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedTabs as Tabs, AnimatedTabsContent as TabsContent, AnimatedTabsList as TabsList, AnimatedTabsTrigger as TabsTrigger } from "@/components/AnimatedTabs";
import { Heart } from "lucide-react";
import { getLoginUrl } from "@/const";
import WellnessOverview from "./WellnessOverview";
import FitnessTracker from "./FitnessTracker";
import NutritionTracker from "./NutritionTracker";
import MentalWellness from "./MentalWellness";
import HealthMetrics from "./HealthMetrics";
import { useHubAccess } from "@/hooks/useHubAccess";
import { HubUpgradeModal } from "@/components/HubUpgradeModal";
import { TrialStatus } from "@/components/TrialStatus";

// Wrapper components to hide navigation in embedded context
const WellnessOverviewTab = () => {
  return (
    <div className="[&_.min-h-screen]:min-h-0 [&_nav]:hidden [&_footer]:hidden">
      <WellnessOverview />
    </div>
  );
};

const FitnessTrackerTab = () => {
  return (
    <div className="[&_.min-h-screen]:min-h-0 [&_nav]:hidden [&_footer]:hidden">
      <FitnessTracker />
    </div>
  );
};

const NutritionTrackerTab = () => {
  return (
    <div className="[&_.min-h-screen]:min-h-0 [&_nav]:hidden [&_footer]:hidden">
      <NutritionTracker />
    </div>
  );
};

const MentalWellnessTab = () => {
  return (
    <div className="[&_.min-h-screen]:min-h-0 [&_nav]:hidden [&_footer]:hidden">
      <MentalWellness />
    </div>
  );
};

const HealthMetricsTab = () => {
  return (
    <div className="[&_.min-h-screen]:min-h-0 [&_nav]:hidden [&_footer]:hidden">
      <HealthMetrics />
    </div>
  );
};

export default function Wellness() {
  const { user, isAuthenticated, loading } = useAuth();
  const { translate: t } = useLanguage();
  const [location, setLocation] = useLocation();
  
  // Hub access control
  const hubAccess = useHubAccess("wellness");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check hub access and show modal if needed
  useEffect(() => {
    if (!loading && isAuthenticated && !hubAccess.hasAccess && !hubAccess.isAdmin) {
      setShowUpgradeModal(true);
    }
  }, [loading, isAuthenticated, hubAccess.hasAccess, hubAccess.isAdmin]);
  
  // Read tab from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || "overview");
  
  // Update URL when tab changes
  useEffect(() => {
    const newUrl = activeTab === "overview" ? "/hubs/wellness" : `/hubs/wellness?tab=${activeTab}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, '', newUrl);
    }
  }, [activeTab]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Redirect to login if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">{t("Loading...")}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <main className="flex-1 container py-8">
        {/* Trial Status Banner */}
        {hubAccess.trialStatus === "active" && hubAccess.trialDaysRemaining !== undefined && (
          <div className="mb-6">
            <TrialStatus
              hubName="Wellness Hub"
              daysRemaining={hubAccess.trialDaysRemaining}
              expiresAt={new Date(Date.now() + hubAccess.trialDaysRemaining * 24 * 60 * 60 * 1000)}
            />
          </div>
        )}

        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-1.5">
              <Heart className="h-4 w-4 mr-1.5 inline" />
              {t("WELLNESS HUB")}
            </Badge>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="text-5xl sm:text-6xl">💪</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400">Wellness Dashboard</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            {t("Track your fitness, nutrition, mental health, and overall wellness in one comprehensive hub")}
          </p>
        </div>

        {/* Date Selector */}
        <div className="mb-6">
          <Label htmlFor="date">{t("Date")}</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 bg-slate-800/50 border border-cyan-500/30 rounded-lg p-1">
            <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
            <TabsTrigger value="fitness">{t("Fitness")}</TabsTrigger>
            <TabsTrigger value="nutrition">{t("Nutrition")}</TabsTrigger>
            <TabsTrigger value="mental">{t("Mental")}</TabsTrigger>
            <TabsTrigger value="health">{t("Health")}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0">
            <WellnessOverviewTab />
          </TabsContent>

          {/* Fitness Tab */}
          <TabsContent value="fitness" className="mt-0">
            <FitnessTrackerTab />
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="mt-0">
            <NutritionTrackerTab />
          </TabsContent>

          {/* Mental Tab */}
          <TabsContent value="mental" className="mt-0">
            <MentalWellnessTab />
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="mt-0">
            <HealthMetricsTab />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
      
      {/* Hub Access Modal */}
      <HubUpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        hubId="wellness"
        hubName="Wellness Hub"
        currentTier={hubAccess.currentTier}
        reason={hubAccess.reason || ""}
      />
    </div>
  );
}
