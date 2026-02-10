import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { CreditCard, Calendar, Zap, TrendingUp, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { useLocation } from "wouter";

const TIER_COLORS = {
  free: "bg-slate-600",
  starter: "bg-blue-600",
  pro: "bg-purple-600",
  ultimate: "bg-gradient-to-r from-yellow-500 to-orange-500",
};

const TIER_NAMES = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  ultimate: "Ultimate",
};

const PERIOD_NAMES = {
  monthly: "Monthly",
  six_month: "6-Month",
  annual: "Annual",
};

const HUB_NAMES = {
  money: "Money Hub",
  wellness: "Wellness Hub",
  translation_hub: "Translation Hub",
  learning: "Learning Hub",
};

export function SubscriptionManagement() {
  const { translate: t } = useLanguage();
  const [, setLocation] = useLocation();
  
  const { data: subscriptionInfo, isLoading } = trpc.subscription.getSubscriptionInfo.useQuery();
  
  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardContent className="py-8">
          <div className="text-center text-slate-400">Loading subscription information...</div>
        </CardContent>
      </Card>
    );
  }
  
  if (!subscriptionInfo) {
    return null;
  }
  
  const { tier, subscriptionPeriod, selectedHubs, subscriptionExpiresAt, hubsSelectedAt, trials, role } = subscriptionInfo;
  
  const isAdmin = role === "admin";
  const isFree = tier === "free";
  const isUltimate = tier === "ultimate";
  
  // Calculate trial durations based on tier and period
  const getTrialDuration = () => {
    if (tier === "free") return 5;
    if (subscriptionPeriod === "monthly") return 5;
    if (subscriptionPeriod === "six_month") return 10;
    if (subscriptionPeriod === "annual") return 20;
    return 5;
  };
  
  const trialDuration = getTrialDuration();
  
  // Group trials by status
  const activeTrials = trials?.filter(t => {
    const expiresAt = new Date(t.expiresAt);
    return expiresAt > new Date();
  }) || [];
  
  const expiredTrials = trials?.filter(t => {
    const expiresAt = new Date(t.expiresAt);
    return expiresAt <= new Date();
  }) || [];
  
  const handleUpgrade = () => {
    setLocation("/pricing");
    toast.info("Redirecting to pricing page...");
  };
  
  const handleManageSubscription = () => {
    // TODO: Implement Stripe customer portal
    toast.info("Subscription management coming soon");
  };
  
  return (
    <Card className="bg-slate-800/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <CreditCard className="h-5 w-5" />
          {t("Subscription Management")}
        </CardTitle>
        <CardDescription className="text-slate-400">
          {t("View your subscription details, trial status, and upgrade options")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Current Plan:</span>
                <Badge className={`${TIER_COLORS[tier]} text-white`}>
                  {TIER_NAMES[tier]}
                </Badge>
                {isAdmin && (
                  <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                    Admin
                  </Badge>
                )}
              </div>
              {!isFree && subscriptionPeriod && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="h-4 w-4" />
                  <span>Billing: {PERIOD_NAMES[subscriptionPeriod as keyof typeof PERIOD_NAMES]}</span>
                </div>
              )}
            </div>
            {!isUltimate && !isAdmin && (
              <Button 
                onClick={handleUpgrade}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade
              </Button>
            )}
          </div>
          
          {subscriptionExpiresAt && (
            <div className="text-sm text-slate-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Expires: {new Date(subscriptionExpiresAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        
        {/* Selected Hubs */}
        {!isUltimate && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-300">Selected Hubs</h4>
              {tier === "starter" && <span className="text-xs text-slate-400">(1 hub included)</span>}
              {tier === "pro" && <span className="text-xs text-slate-400">(2 hubs included)</span>}
            </div>
            
            {selectedHubs && selectedHubs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedHubs.map((hub) => (
                  <div 
                    key={hub}
                    className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-white">{HUB_NAMES[hub as keyof typeof HUB_NAMES]}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-400 bg-slate-700/30 px-4 py-3 rounded-lg">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                No hubs selected yet. Visit the pricing page to select your hubs.
              </div>
            )}
            
            {hubsSelectedAt && (
              <p className="text-xs text-slate-500">
                Selected on: {new Date(hubsSelectedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
        
        {/* Trial Status */}
        {!isUltimate && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-300">Hub Trials</h4>
              <span className="text-xs text-slate-400">
                ({trialDuration} days per trial)
              </span>
            </div>
            
            {/* Active Trials */}
            {activeTrials.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-medium">Active Trials:</p>
                {activeTrials.map((trial) => {
                  const expiresAt = new Date(trial.expiresAt);
                  const now = new Date();
                  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div 
                      key={trial.id}
                      className="flex items-center justify-between bg-green-500/10 border border-green-500/30 px-3 py-2 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-white">{HUB_NAMES[trial.hubId as keyof typeof HUB_NAMES]}</span>
                      </div>
                      <span className="text-xs text-green-400">
                        {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Expired Trials */}
            {expiredTrials.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-medium">Expired Trials:</p>
                {expiredTrials.map((trial) => (
                  <div 
                    key={trial.id}
                    className="flex items-center justify-between bg-slate-700/30 px-3 py-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-400">{HUB_NAMES[trial.hubId as keyof typeof HUB_NAMES]}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      Expired {new Date(trial.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {activeTrials.length === 0 && expiredTrials.length === 0 && (
              <div className="text-sm text-slate-400 bg-slate-700/30 px-4 py-3 rounded-lg">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                No trials started yet. Visit any hub to start your {trialDuration}-day trial.
              </div>
            )}
          </div>
        )}
        
        {/* Ultimate Tier Message */}
        {isUltimate && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-yellow-500">Ultimate Plan Active</p>
                <p className="text-xs text-slate-300 mt-1">
                  You have full access to all 4 specialized hubs with no limitations.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Admin Message */}
        {isAdmin && (
          <div className="bg-purple-500/10 border border-purple-500/30 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-purple-500">Admin Access</p>
                <p className="text-xs text-slate-300 mt-1">
                  You have full administrative access to all features and hubs.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
