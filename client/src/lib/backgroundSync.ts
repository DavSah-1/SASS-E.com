/**
 * Background Sync Service
 * Handles queuing offline actions and syncing when connection is restored
 */

export interface SyncAction {
  id: string;
  type: "expense" | "workout" | "journal" | "mood" | "meal" | "water";
  data: any;
  timestamp: number;
  retries: number;
}

const SYNC_QUEUE_KEY = "sass-e-sync-queue";
const MAX_RETRIES = 3;

/**
 * Add an action to the sync queue
 */
export function queueAction(
  type: SyncAction["type"],
  data: any
): string {
  const action: SyncAction = {
    id: generateId(),
    type,
    data,
    timestamp: Date.now(),
    retries: 0,
  };

  const queue = getQueue();
  queue.push(action);
  saveQueue(queue);

  // Try to sync immediately if online
  if (navigator.onLine) {
    syncQueue().catch(console.error);
  }

  return action.id;
}

/**
 * Get the current sync queue
 */
export function getQueue(): SyncAction[] {
  try {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to get sync queue:", error);
    return [];
  }
}

/**
 * Save the sync queue to localStorage
 */
function saveQueue(queue: SyncAction[]): void {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Failed to save sync queue:", error);
  }
}

/**
 * Remove an action from the queue
 */
export function removeFromQueue(actionId: string): void {
  const queue = getQueue();
  const filtered = queue.filter((action) => action.id !== actionId);
  saveQueue(filtered);
}

/**
 * Get the number of pending actions
 */
export function getPendingCount(): number {
  return getQueue().length;
}

/**
 * Clear all actions from the queue
 */
export function clearQueue(): void {
  saveQueue([]);
}

/**
 * Sync all queued actions
 * Returns the number of successfully synced actions
 */
export async function syncQueue(): Promise<number> {
  const queue = getQueue();
  
  if (queue.length === 0) {
    return 0;
  }

  let syncedCount = 0;
  const failedActions: SyncAction[] = [];

  for (const action of queue) {
    try {
      const success = await syncAction(action);
      
      if (success) {
        syncedCount++;
      } else {
        // Increment retry count
        action.retries++;
        
        // Keep in queue if under max retries
        if (action.retries < MAX_RETRIES) {
          failedActions.push(action);
        } else {
          console.warn(`Action ${action.id} failed after ${MAX_RETRIES} retries`);
        }
      }
    } catch (error) {
      console.error(`Failed to sync action ${action.id}:`, error);
      
      action.retries++;
      if (action.retries < MAX_RETRIES) {
        failedActions.push(action);
      }
    }
  }

  // Update queue with only failed actions
  saveQueue(failedActions);

  return syncedCount;
}

/**
 * Sync a single action
 * Returns true if successful, false otherwise
 */
async function syncAction(action: SyncAction): Promise<boolean> {
  // This will be called by the service worker
  // For now, we'll use a placeholder that can be replaced with actual API calls
  
  try {
    // Send to backend via fetch (works in service worker context)
    const endpoint = getEndpointForActionType(action.type);
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(action.data),
    });

    return response.ok;
  } catch (error) {
    console.error("Sync action failed:", error);
    return false;
  }
}

/**
 * Get the API endpoint for an action type
 */
function getEndpointForActionType(type: SyncAction["type"]): string {
  const baseUrl = "/api/trpc";
  
  const endpoints: Record<SyncAction["type"], string> = {
    expense: `${baseUrl}/budget.createTransaction`,
    workout: `${baseUrl}/wellness.logWorkout`,
    journal: `${baseUrl}/wellness.addJournalEntry`,
    mood: `${baseUrl}/wellness.logMood`,
    meal: `${baseUrl}/wellness.logMeal`,
    water: `${baseUrl}/wellness.logHydration`,
  };

  return endpoints[type] || baseUrl;
}

/**
 * Generate a unique ID for an action
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Register background sync with service worker
 */
export async function registerBackgroundSync(tag: string = "sass-e-sync"): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("SyncManager" in window)) {
    console.warn("Background sync is not supported");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    // @ts-ignore - SyncManager types may not be available
    await registration.sync.register(tag);
    return true;
  } catch (error) {
    console.error("Failed to register background sync:", error);
    return false;
  }
}

/**
 * Initialize background sync listeners
 */
export function initBackgroundSync(): void {
  // Listen for online event to sync queue
  window.addEventListener("online", () => {
    console.log("Connection restored, syncing queue...");
    syncQueue()
      .then((count) => {
        if (count > 0) {
          console.log(`Successfully synced ${count} actions`);
          // Dispatch custom event for UI updates
          window.dispatchEvent(new CustomEvent("sync-complete", { detail: { count } }));
        }
      })
      .catch(console.error);
  });

  // Try to sync on page load if online
  if (navigator.onLine && getQueue().length > 0) {
    syncQueue().catch(console.error);
  }
}
