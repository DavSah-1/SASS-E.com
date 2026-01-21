import { AlertCircle, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface UpgradePromptProps {
  featureName: string;
  currentUsage?: number;
  limit?: number | "unlimited";
  reason?: string;
  className?: string;
}

/**
 * Component to show when users hit feature limits
 * Encourages upgrade to higher tier
 */
export function UpgradePrompt({
  featureName,
  currentUsage,
  limit,
  reason,
  className,
}: UpgradePromptProps) {
  const limitText =
    limit === "unlimited"
      ? "unlimited"
      : currentUsage !== undefined && limit !== undefined
        ? `${currentUsage}/${limit}`
        : limit?.toString() || "limit reached";

  return (
    <Alert className={`border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 ${className || ""}`}>
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-900 dark:text-amber-100">
        Feature Limit Reached
      </AlertTitle>
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        <p className="mb-3">
          {reason || `You've reached your daily limit for ${featureName} (${limitText}).`}
        </p>
        <div className="flex gap-2">
          <Button asChild size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Link href="/pricing">
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade Now
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/pricing">View Plans</Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface FeatureLockedProps {
  featureName: string;
  requiredTier: string;
  className?: string;
}

/**
 * Component to show when feature is not available in current tier
 */
export function FeatureLocked({ featureName, requiredTier, className }: FeatureLockedProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className || ""}`}>
      <div className="rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-6 mb-4">
        <Sparkles className="h-12 w-12 text-purple-600 dark:text-purple-400" />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
        {featureName} is Locked
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        Upgrade to {requiredTier} or higher to unlock this feature and enjoy unlimited access.
      </p>
      <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
        <Link href="/pricing">
          <Sparkles className="mr-2 h-5 w-5" />
          Upgrade to {requiredTier}
        </Link>
      </Button>
    </div>
  );
}
