// Utility helpers for PWA Service Worker & Streak Notifications

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registered successfully:', reg);
      return reg;
    } catch (err) {
      console.error('ServiceWorker registration failed:', err);
      return null;
    }
  }
  return null;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    alert('Browser ini tidak mendukung notifikasi web.');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    localStorage.setItem('streak_notifications_enabled', 'true');
    await registerServiceWorker();
  } else {
    localStorage.setItem('streak_notifications_enabled', 'false');
  }
  return permission;
}

export function isNotificationEnabled(): boolean {
  if (!('Notification' in window)) return false;
  return Notification.permission === 'granted' && localStorage.getItem('streak_notifications_enabled') === 'true';
}

export async function sendStreakNotification(title?: string, body?: string): Promise<boolean> {
  if (!('Notification' in window)) return false;

  const notifTitle = title || 'Pengingat Streak Catur Pal Mate';
  const notifBody = body || 'Jangan biarkan streak beruntun-mu padam! Buka Pal Mate & selesaikan 1 tantangan catur hari ini!';

  // Try via Service Worker first
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.active) {
        reg.active.postMessage({
          type: 'TRIGGER_STREAK_NOTIFICATION',
          title: notifTitle,
          body: notifBody
        });
        return true;
      }
    } catch (e) {
      console.warn('SW notification fallback to standard Notification:', e);
    }
  }

  // Fallback to standard browser Notification object
  if (Notification.permission === 'granted') {
    new Notification(notifTitle, {
      body: notifBody,
      icon: '/assets/images/avatar_martin_1779709510230.png',
      badge: '/assets/images/avatar_martin_1779709510230.png',
      tag: 'streak-reminder-test'
    });
    return true;
  }

  return false;
}

export function scheduleStreakReminderCheck(streak: number, isCheckedInToday: boolean) {
  const isEnabled = localStorage.getItem('streak_notifications_enabled') === 'true';
  if (!isEnabled || Notification.permission !== 'granted') return;

  const todayStr = new Date().toISOString().split('T')[0];
  const lastNotifDate = localStorage.getItem('last_streak_notif_date');

  if (lastNotifDate !== todayStr && !isCheckedInToday) {
    setTimeout(() => {
      sendStreakNotification(
        `Streak ${streak} Hari Kamu Belum Di-Check-In`,
        `Kamu belum check-in hari ini. Buka Pal Mate sekarang untuk mempertahankan streak dan klaim bonus koin!`
      );
      localStorage.setItem('last_streak_notif_date', todayStr);
    }, 3000);
  }
}
