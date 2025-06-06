const CACHE_NAME = 'sms-bridge-v1.0.0';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/dashboard',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip socket.io requests
  if (event.request.url.includes('socket.io')) {
    return;
  }

  // Skip API requests (let them fail gracefully)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }

        console.log('Fetching from network:', event.request.url);
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch((error) => {
        console.error('Fetch failed:', error);
        
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        
        throw error;
      })
  );
});

// Background sync for sending messages when online
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'send-message') {
    event.waitUntil(
      // Handle queued messages when connection is restored
      handleQueuedMessages()
    );
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: 'New SMS message received',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'sms-notification',
    renotify: true,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Message'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = `New message from ${data.from}: ${data.content}`;
    options.data = data;
  }

  event.waitUntil(
    self.registration.showNotification('SMS Bridge', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'view') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Helper function to handle queued messages
async function handleQueuedMessages() {
  try {
    // Check if online
    const online = navigator.onLine;
    if (!online) {
      console.log('Still offline, will retry later');
      return;
    }

    // Get queued messages from IndexedDB or localStorage
    const queuedMessages = await getQueuedMessages();
    
    for (const message of queuedMessages) {
      try {
        // Attempt to send message
        const response = await fetch('/api/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message)
        });

        if (response.ok) {
          // Remove from queue on success
          await removeFromQueue(message.id);
          console.log('Queued message sent successfully:', message.id);
        }
      } catch (error) {
        console.error('Failed to send queued message:', error);
      }
    }
  } catch (error) {
    console.error('Error handling queued messages:', error);
  }
}

// Helper functions for message queue (simplified)
async function getQueuedMessages() {
  // In a real implementation, use IndexedDB
  return [];
}

async function removeFromQueue(messageId) {
  // In a real implementation, remove from IndexedDB
  console.log('Removing message from queue:', messageId);
}
