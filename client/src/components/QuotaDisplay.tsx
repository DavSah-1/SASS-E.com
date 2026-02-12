import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Search, Mic, Brain } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * QuotaDisplay Component
 * 
 * Displays user's API quota usage for Tavily searches, Whisper transcriptions, and LLM calls.
 * Shows current usage, limits, and remaining quota with visual progress bars.
 * 
 * Features:
 * - Real-time quota tracking
 * - Visual progress bars with color-coded warnings
 * - Service-specific icons
 * - Reset date display
 * - Warning alerts when quota is low
 */
export function QuotaDisplay() {
  const { data: quotaUsage, isLoading, error } = trpc.subscription.getQuotaUsage.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
          <CardDescription>Loading quota information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load quota information. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!quotaUsage) {
    return null;
  }

  const services = [
    {
      key: "tavily" as const,
      name: "Web Searches",
      icon: Search,
      description: "Tavily web search API calls",
    },
    {
      key: "whisper" as const,
      name: "Transcriptions",
      icon: Mic,
      description: "Whisper audio transcription API calls",
    },
    {
      key: "llm" as const,
      name: "AI Requests",
      icon: Brain,
      description: "LLM (AI assistant) API calls",
    },
  ];

  // Check if any service is over 80% usage
  const hasWarning = Object.values(quotaUsage).some(
    (quota) => quota.current / quota.limit > 0.8 && quota.limit !== Infinity
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Usage Quota</CardTitle>
        <CardDescription>
          Monthly usage limits for API services
          {quotaUsage.tavily.resetAt && (
            <span className="block mt-1 text-xs">
              Resets on {new Date(quotaUsage.tavily.resetAt).toLocaleDateString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasWarning && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You're running low on quota for some services. Consider upgrading your plan to avoid interruptions.
            </AlertDescription>
          </Alert>
        )}

        {services.map((service) => {
          const quota = quotaUsage[service.key];
          const percentage = quota.limit === Infinity ? 0 : (quota.current / quota.limit) * 100;
          const isUnlimited = quota.limit === Infinity;
          const isLow = percentage > 80;
          const isAlmostOut = percentage > 95;

          const Icon = service.icon;

          return (
            <div key={service.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  {isUnlimited ? (
                    <p className="text-sm font-medium">Unlimited</p>
                  ) : (
                    <>
                      <p className="text-sm font-medium">
                        {quota.current} / {quota.limit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {quota.remaining} remaining
                      </p>
                    </>
                  )}
                </div>
              </div>
              {!isUnlimited && (
                <div className="relative">
                  <Progress
                    value={percentage}
                    className={`h-2 ${
                      isAlmostOut
                        ? "[&>div]:bg-destructive"
                        : isLow
                        ? "[&>div]:bg-yellow-500"
                        : "[&>div]:bg-primary"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Current plan: <span className="font-medium capitalize">{quotaUsage.tavily.tier}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Upgrade your subscription to increase quota limits.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
