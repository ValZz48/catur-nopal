// This is the service worker with the combined offline experience (Offline page + Offline copy of pages)

const CACHE = "pwabuilder-offline-page";

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const offlineFallbackPage = "offline.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'TRIGGER_STREAK_NOTIFICATION') {
    const title = event.data.title || 'Pengingat Streak Catur Pal Mate';
    const options = {
      body: event.data.body || 'Jangan biarkan streak-mu padam! Check-in dan mainkan catur hari ini!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
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

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE
  })
);

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {

        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
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
    icon: '/icon-192.png',
    badge: '/icon-192.png',
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
