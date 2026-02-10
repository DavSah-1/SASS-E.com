import { useAuth } from "@/_core/hooks/useAuth";
import type { SpecializedHub } from "@shared/pricing";

export interface HubAccessResult {
  hasAccess: boolean;
  reason?: string;
  requiresUpgrade: boolean;
  currentTier: string;
  isAdmin: boolean;
}

/**
 * Hook to check if the current user has access to a specialized hub
 * Respects admin bypass (admin users have unlimited access)
 * 
 * @param hubId - The specialized hub identifier (e.g., "money_hub", "language_learning")
 * @returns HubAccessResult with access status and reason
 */
export function useHubAccess(hubId: SpecializedHub): HubAccessResult {
  const { user, isAuthenticated } = useAuth();

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

  // Free tier - no permanent hub access (trials only)
  if (tier === "free") {
    return {
      hasAccess: false,
      reason: "Free tier requires upgrade for hub access",
      requiresUpgrade: true,
      currentTier: tier,
      isAdmin: false,
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

  // Hub not selected
  const maxHubs = tier === "starter" ? 1 : tier === "pro" ? 2 : 0;
  return {
    hasAccess: false,
    reason: `You haven't selected this hub. Your ${tier} plan allows ${maxHubs} hub${maxHubs > 1 ? "s" : ""}.`,
    requiresUpgrade: true,
    currentTier: tier,
    isAdmin: false,
  };
}
