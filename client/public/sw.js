// Service Worker for SASS-E PWA
const CACHE_NAME = 'sass-e-v1';
const OFFLINE_URL = '/offline.html';

const urlsToCache = [
  '/',
  '/assistant',
  '/learning',
  '/money',
  '/wellness',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          // Update cache in background (stale-while-revalidate)
          fetch(event.request).then((freshResponse) => {
            if (freshResponse && freshResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, freshResponse.clone());
              });
            }
          }).catch(() => {});
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request).then(
          (response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache static assets and pages
            if (
              event.request.url.includes('/assets/') ||
              event.request.url.match(/\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2)$/) ||
              event.request.mode === 'navigate'
            ) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }

            return response;
          }
        ).catch(() => {
          // If both cache and network fail, show offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sass-e-sync') {
    event.waitUntil(syncQueuedActions());
  }
});

async function syncQueuedActions() {
  console.log('Background sync: Syncing queued actions...');
  
  try {
    // Get queued actions from localStorage
    const queue = JSON.parse(localStorage.getItem('sass-e-sync-queue') || '[]');
    
    if (queue.length === 0) {
      console.log('No actions to sync');
      return;
    }
    
    console.log(`Syncing ${queue.length} queued actions`);
    
    const failedActions = [];
    let syncedCount = 0;
    
    for (const action of queue) {
      try {
        const endpoint = getEndpointForActionType(action.type);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(action.data),
        });
        
        if (response.ok) {
          syncedCount++;
        } else {
          action.retries = (action.retries || 0) + 1;
          if (action.retries < 3) {
            failedActions.push(action);
          }
        }
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        action.retries = (action.retries || 0) + 1;
        if (action.retries < 3) {
          failedActions.push(action);
        }
      }
    }
    
    // Update queue with only failed actions
    localStorage.setItem('sass-e-sync-queue', JSON.stringify(failedActions));
    
    console.log(`Background sync complete: ${syncedCount} actions synced, ${failedActions.length} failed`);
    
    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        count: syncedCount
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

function getEndpointForActionType(type) {
  const baseUrl = '/api/trpc';
  
  const endpoints = {
    expense: `${baseUrl}/budget.createTransaction`,
    workout: `${baseUrl}/wellness.logWorkout`,
    journal: `${baseUrl}/wellness.addJournalEntry`,
    mood: `${baseUrl}/wellness.logMood`,
    meal: `${baseUrl}/wellness.logMeal`,
    water: `${baseUrl}/wellness.logHydration`,
  };
  
  return endpoints[type] || baseUrl;
}

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from SASS-E',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification('SASS-E', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

