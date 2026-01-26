import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type { SpecializedHub } from "@shared/pricing";

export function useHubSelection() {
  const { user, isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  
  const canChangeHubs = trpc.subscription.canChangeHubs.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Parse selected hubs from user data
  const selectedHubs: SpecializedHub[] = (user?.selectedSpecializedHubs || []) as SpecializedHub[];

  // Check if user needs to select hubs
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Skip if user is free tier or ultimate tier (doesn't need to select)
    if (user.subscriptionTier === "free" || user.subscriptionTier === "ultimate") {
      return;
    }

    // Skip if user already has hubs selected
    if (selectedHubs.length > 0) {
      return;
    }

    // Show modal for starter/pro users who haven't selected hubs yet
    if (user.subscriptionTier === "starter" || user.subscriptionTier === "pro") {
      setShowModal(true);
    }
  }, [isAuthenticated, user, selectedHubs.length]);

  return {
    showModal,
    setShowModal,
    selectedHubs,
    isLocked: canChangeHubs.data ? !canChangeHubs.data.canChange : false,
    canChange: canChangeHubs.data?.canChange ?? true,
    lockedReason: canChangeHubs.data?.reason,
    userTier: user?.subscriptionTier || "free",
  };
}
