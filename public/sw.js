// Pal Mate - Service Worker for PWA Offline & Streak Push Notifications

const CACHE_NAME = 'pal-mate-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Network First, Cache Fallback for offline play)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

// Listen for Push Notifications
self.addEventListener('push', (event) => {
  let data = { title: 'Pengingat Streak Catur Pal Mate', body: 'Jangan biarkan streak-mu padam! Check-in & selesaikan 1 teka-teki catur hari ini!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/assets/images/avatar_martin_1779709510230.png',
    badge: '/assets/images/avatar_martin_1779709510230.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 'streak-reminder'
    },
    actions: [
      { action: 'checkin', title: 'Check-In Sekarang' },
      { action: 'close', title: 'Tutup' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle Notification Clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'checkin') {
    event.waitUntil(
      clients.openWindow('/?action=checkin')
    );
  } else {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i];
              break;
            }
          }
          return client.focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// Handle internal messages sent from client app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_STREAK_NOTIFICATION') {
    const title = event.data.title || 'Pengingat Streak Catur Pal Mate';
    const options = {
      body: event.data.body || 'Jangan biarkan streak-mu padam! Check-in dan mainkan catur hari ini!',
      icon: '/assets/images/avatar_martin_1779709510230.png',
      badge: '/assets/images/avatar_martin_1779709510230.png',
      vibrate: [200, 100, 200],
      tag: 'streak-reminder-notification',
      renotify: true,
      data: { url: '/' },
      actions: [
        { action: 'checkin', title: 'Check-In Sekarang' }
      ]
    };
    self.registration.showNotification(title, options);
  }
});
