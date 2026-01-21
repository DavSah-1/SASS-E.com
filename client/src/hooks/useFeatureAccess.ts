import { trpc } from "@/lib/trpc";
import type { SpecializedHub } from "@shared/pricing";

export type FeatureType =
  | "voice_assistant"
  | "iot_device"
  | "verified_learning"
  | "math_tutor"
  | "translate"
  | "image_ocr"
  | "specialized_hub";

export interface FeatureAccessResult {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number | "unlimited";
  upgradeRequired?: boolean;
  isLoading: boolean;
}

/**
 * Hook to check if the current user can access a feature
 * Owner always gets unlimited access
 */
export function useFeatureAccess(
  featureType: FeatureType,
  specializedHub?: SpecializedHub,
  options?: { enabled?: boolean }
): FeatureAccessResult {
  const enabled = options?.enabled !== false;
  
  const { data, isLoading } = trpc.subscription.checkAccess.useQuery(
    { featureType, specializedHub },
    {
      // Cache for 30 seconds to avoid excessive checks
      staleTime: 30000,
      // Refetch when window regains focus
      refetchOnWindowFocus: true,
      // Allow disabling the query (e.g., for unauthenticated users)
      enabled,
    }
  );

  // If query is disabled (e.g., user not authenticated), return allowed: true
  // This prevents redirect logic from triggering for unauthenticated users
  if (!enabled) {
    return {
      allowed: true,
      isLoading: false,
    };
  }

  if (isLoading || !data) {
    return {
      allowed: false,
      isLoading: true,
    };
  }

  return {
    ...data,
    isLoading: false,
  };
}

/**
 * Hook to record feature usage
 */
export function useRecordUsage() {
  const utils = trpc.useUtils();
  const recordMutation = trpc.subscription.recordUsage.useMutation({
    onSuccess: () => {
      // Invalidate access check queries to refresh limits
      utils.subscription.checkAccess.invalidate();
      utils.subscription.getUsageStats.invalidate();
    },
  });

  return {
    recordUsage: (featureType: FeatureType) => {
      recordMutation.mutate({ featureType });
    },
    isRecording: recordMutation.isPending,
  };
}

/**
 * Hook to get usage statistics
 */
export function useUsageStats() {
  const { data, isLoading } = trpc.subscription.getUsageStats.useQuery(undefined, {
    // Refetch every minute
    refetchInterval: 60000,
  });

  return {
    stats: data || {},
    isLoading,
  };
}
