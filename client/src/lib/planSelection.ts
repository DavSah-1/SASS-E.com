/**
 * Plan Selection Storage
 * Stores user's plan selection before authentication
 * Used to redirect to checkout after sign-up/sign-in
 */

export interface PlanSelection {
  tier: "starter" | "pro" | "ultimate";
  billingPeriod: "monthly" | "six_month" | "annual";
  selectedHubs: string[];
  timestamp: number;
}

const STORAGE_KEY = "pending_plan_selection";
const EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes

export function savePlanSelection(selection: Omit<PlanSelection, "timestamp">): void {
  const data: PlanSelection = {
    ...selection,
    timestamp: Date.now(),
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save plan selection:", error);
  }
}

export function getPlanSelection(): PlanSelection | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data: PlanSelection = JSON.parse(stored);
    
    // Check if expired
    if (Date.now() - data.timestamp > EXPIRY_TIME) {
      clearPlanSelection();
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Failed to get plan selection:", error);
    return null;
  }
}

export function clearPlanSelection(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear plan selection:", error);
  }
}

export function hasPendingPlanSelection(): boolean {
  return getPlanSelection() !== null;
}
