import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { trpc } from "@/lib/trpc";
import { getHubsByIds } from "../../../shared/hubs";

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Get session_id from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("session_id");
    setSessionId(id);
  }, []);

  // Fetch current user data to get subscription details
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const { data: subscription } = trpc.subscription.getCurrent.useQuery(undefined, {
    enabled: !!user,
  });

  const selectedHubs = user?.selectedSpecializedHubs || [];
  const hubs = getHubsByIds(selectedHubs);

  const tierName = user?.subscriptionTier
    ? user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)
    : "Premium";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading your subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Welcome to {tierName}!
            </h1>
            <p className="text-xl text-purple-200">
              Your subscription is now active. Let's get you started with Assistant Bob.
            </p>
          </div>

          {/* Subscription Details Card */}
          <Card className="bg-purple-900/30 border-purple-700/50 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-yellow-400" />
                Your Subscription
              </CardTitle>
              <CardDescription className="text-purple-300">
                Here's what you've unlocked
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-purple-700/30">
                <span className="text-purple-200">Plan</span>
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                  {tierName}
                </Badge>
              </div>
              
              {subscription?.billingPeriod && (
                <div className="flex justify-between items-center py-3 border-b border-purple-700/30">
                  <span className="text-purple-200">Billing Period</span>
                  <span className="text-white font-medium">
                    {subscription.billingPeriod === "monthly" && "Monthly"}
                    {subscription.billingPeriod === "six_month" && "6 Months"}
                    {subscription.billingPeriod === "annual" && "Annual"}
                  </span>
                </div>
              )}

              {subscription?.trialDays && subscription.trialDays > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-purple-700/30">
                  <span className="text-purple-200">Trial Period</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                    {subscription.trialDays} Days Free
                  </Badge>
                </div>
              )}

              {subscription?.currentPeriodEnd && (
                <div className="flex justify-between items-center py-3 border-b border-purple-700/30">
                  <span className="text-purple-200">Next Billing Date</span>
                  <span className="text-white font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              )}

              {hubs.length > 0 && (
                <div className="py-3">
                  <span className="text-purple-200 block mb-3">Your Specialized Hubs</span>
                  <div className="grid gap-3">
                    {hubs.map((hub) => (
                      <div
                        key={hub.id}
                        className="flex items-center gap-3 p-3 bg-purple-800/30 rounded-lg border border-purple-700/30"
                      >
                        <span className="text-2xl">{hub.icon}</span>
                        <div>
                          <div className="text-white font-medium">{hub.name}</div>
                          <div className="text-sm text-purple-300">{hub.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps Card */}
          <Card className="bg-purple-900/30 border-purple-700/50 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-white">What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <div>
                  <div className="text-white font-medium">Start Using Your Hubs</div>
                  <div className="text-sm text-purple-300">
                    Access your specialized hubs from the navigation menu
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <div>
                  <div className="text-white font-medium">Chat with Assistant Bob</div>
                  <div className="text-sm text-purple-300">
                    Try voice chat or text conversations with your AI assistant
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <div>
                  <div className="text-white font-medium">Manage Your Subscription</div>
                  <div className="text-sm text-purple-300">
                    Update billing, change plans, or cancel anytime from your account
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              asChild
            >
              <Link href="/assistant">
                Launch Assistant Bob
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="bg-purple-800/50 border-purple-600 text-white hover:bg-purple-700"
              asChild
            >
              <Link href="/">
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Support Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-purple-300">
              Need help? Contact us at{" "}
              <a href="mailto:support@sass-e.com" className="text-purple-200 underline hover:text-white">
                support@sass-e.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
