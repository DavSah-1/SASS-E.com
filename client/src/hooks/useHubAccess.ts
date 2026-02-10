import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type { SpecializedHub } from "@shared/pricing";

export interface HubAccessResult {
  hasAccess: boolean;
  reason?: string;
  requiresUpgrade: boolean;
  currentTier: string;
  isAdmin: boolean;
  trialDaysRemaining?: number;
  canStartTrial?: boolean;
  trialStatus?: "active" | "expired" | "never_started";
}

/**
 * Hook to check if the current user has access to a specialized hub
 * Respects admin bypass (admin users have unlimited access)
 * Supports 5-day free trials for Free tier users
 * 
 * @param hubId - The specialized hub identifier (e.g., "money", "wellness")
 * @returns HubAccessResult with access status, trial info, and reason
 */
export function useHubAccess(hubId: SpecializedHub): HubAccessResult {
  const { user, isAuthenticated } = useAuth();

  // Hub ID is already in correct format from SpecializedHub type
  const backendHubId = hubId as "money" | "wellness" | "translation_hub" | "learning";

  // Query trial status for all non-Ultimate users (Free, Starter, Pro can all use trials)
  const { data: trialStatus } = trpc.subscription.getHubTrialStatus.useQuery(
    { hubId: backendHubId },
    { 
      enabled: isAuthenticated && user?.subscriptionTier !== "ultimate",
      refetchOnWindowFocus: false,
    }
  );

  // Not authenticated - no access
  if (!isAuthenticated || !user) {
    return {
      hasAccess: false,
      reason: "Please sign in to access this hub",
      requiresUpgrade: true,
      currentTier: "none",
      isAdmin: false,
    };
  }

  // Admin bypass - unlimited access
  if (user.role === "admin") {
    return {
      hasAccess: true,
      reason: "Admin has unlimited access",
      requiresUpgrade: false,
      currentTier: user.subscriptionTier || "free",
      isAdmin: true,
    };
  }

  const tier = user.subscriptionTier || "free";
  const selectedHubs = user.selectedSpecializedHubs || [];

  // Ultimate tier - all hubs included
  if (tier === "ultimate") {
    return {
      hasAccess: true,
      reason: "Ultimate tier includes all hubs",
      requiresUpgrade: false,
      currentTier: tier,
      isAdmin: false,
    };
  }

  // Free tier - check for active trial
  if (tier === "free") {
    if (trialStatus?.hasActiveTrial && trialStatus.trial) {
      const expiresAt = new Date(trialStatus.trial.expiresAt);
      const now = new Date();
      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        hasAccess: true,
        reason: `Trial active (${daysRemaining} day${daysRemaining > 1 ? "s" : ""} remaining)`,
        requiresUpgrade: false,
        currentTier: tier,
        isAdmin: false,
        trialDaysRemaining: daysRemaining,
        trialStatus: "active",
      };
    }

    // No active trial - check if can start one
    return {
      hasAccess: false,
      reason: trialStatus?.canStartTrial 
        ? "Start your 5-day free trial" 
        : "Trial expired - upgrade to continue",
      requiresUpgrade: true,
      currentTier: tier,
      isAdmin: false,
      canStartTrial: trialStatus?.canStartTrial ?? false,
      trialStatus: trialStatus?.canStartTrial ? "never_started" : "expired",
    };
  }

  // Starter/Pro tier - check if hub is in selected hubs
  if (selectedHubs.includes(hubId)) {
    return {
      hasAccess: true,
      reason: `${hubId} is in your selected hubs`,
      requiresUpgrade: false,
      currentTier: tier,
      isAdmin: false,
    };
  }

  // Hub not selected - check for active trial (Starter/Pro can trial non-selected hubs)
  if (trialStatus?.hasActiveTrial && trialStatus.trial) {
    const expiresAt = new Date(trialStatus.trial.expiresAt);
    const now = new Date();
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      hasAccess: true,
      reason: `Trial active (${daysRemaining} day${daysRemaining > 1 ? "s" : ""} remaining)`,
      requiresUpgrade: false,
      currentTier: tier,
      isAdmin: false,
      trialDaysRemaining: daysRemaining,
      trialStatus: "active",
    };
  }

  // No trial - offer to start one or upgrade
  const maxHubs = tier === "starter" ? 1 : tier === "pro" ? 2 : 0;
  return {
    hasAccess: false,
    reason: trialStatus?.canStartTrial 
      ? `Start your 5-day free trial for ${hubId}` 
      : `Trial expired. Your ${tier} plan allows ${maxHubs} hub${maxHubs > 1 ? "s" : ""}. Upgrade or select this hub.`,
    requiresUpgrade: true,
    currentTier: tier,
    isAdmin: false,
    canStartTrial: trialStatus?.canStartTrial ?? false,
    trialStatus: trialStatus?.canStartTrial ? "never_started" : "expired",
  };
}
