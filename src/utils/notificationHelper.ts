import { NotificationSettings, ParkingPaymentSession } from '../types';
import { playParkingAlertSound, unlockAudioContext } from './audioAlert';

const NOTIFICATION_SETTINGS_KEY = 'parking_app_notification_settings';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  leadMinutes: 5, // Exactly 5 minutes warning before expiration
  soundEnabled: true,
  vibrateEnabled: true,
};

export function getStoredNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw), leadMinutes: 5 };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function saveStoredNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save notification settings', err);
  }
}

/**
 * Checks if browser supports Web Notifications API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Gets current notification permission status ('granted', 'denied', 'default', or 'unsupported')
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Requests Notification permission from the user and unlocks audio context
 */
export async function requestNotificationPermission(): Promise<boolean> {
  unlockAudioContext();
  if (!isNotificationSupported()) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch {
    return false;
  }
}

/**
 * Synchronizes an active session with the Service Worker background scheduler
 */
export async function syncSessionWithServiceWorker(session: ParkingPaymentSession | null): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      // Register periodic background sync if supported (Chrome Android / PWA)
      if ('periodicSync' in reg) {
        try {
          // @ts-ignore
          await reg.periodicSync.register('check-parking-sessions', {
            minInterval: 60 * 1000,
          });
        } catch {
          // Periodic sync permission not available or restricted
        }
      }
      const target = reg.active || navigator.serviceWorker.controller;
      if (target) {
        if (session && session.status !== 'expired') {
          target.postMessage({
            type: 'SCHEDULE_SESSION_ALERT',
            session,
          });
        } else if (session) {
          target.postMessage({
            type: 'CANCEL_SESSION_ALERT',
            sessionId: session.id,
          });
        }
      }
    }
  } catch (err) {
    console.warn('SW session sync notice:', err);
  }
}

/**
 * Automatically activates notification permissions and schedules the 5-minute pre-expiration alert
 * in the background Service Worker and operating system so it fires even if the app is accidentally closed.
 */
export async function autoScheduleParkingExpiryNotification(session: ParkingPaymentSession): Promise<{
  permissionGranted: boolean;
  alertScheduled: boolean;
}> {
  unlockAudioContext();
  let granted = false;
  if (isNotificationSupported()) {
    if (Notification.permission === 'granted') {
      granted = true;
    } else if (Notification.permission === 'default') {
      granted = await requestNotificationPermission();
    }
  }

  // Firmly synchronize with Service Worker (saves to IndexedDB and triggers background timer / TimestampTrigger)
  await syncSessionWithServiceWorker(session);
  return { permissionGranted: granted, alertScheduled: true };
}

/**
 * Fires a full test of the 5-minute alert chime sound + push notification
 */
export async function testParkingAlert(): Promise<boolean> {
  unlockAudioContext();
  playParkingAlertSound();
  if (isNotificationSupported()) {
    if (Notification.permission !== 'granted') {
      try {
        await Notification.requestPermission();
      } catch {}
    }
    if (Notification.permission === 'granted') {
      return showParkingNotification('🔔 Test: Alarm 5 min pre isteka', {
        body: 'Zvuk i obaveštenje funkcionišu! Bićete blagovremeno opomenuti zvučnim signalom pre nego što parking istekne.',
        tag: 'test-parking-alert',
        requireInteraction: true,
      });
    }
  }
  return true;
}

/**
 * Triggers a native system Push Notification with Extend / Dismiss action buttons
 */
export async function showParkingNotification(
  title: string,
  options: NotificationOptions & { data?: any } = {}
): Promise<boolean> {
  // Always play audible alert sound
  playParkingAlertSound();

  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const defaultOptions: any = {
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [400, 150, 400, 150, 600],
    requireInteraction: true,
    tag: 'parking-alert',
    renotify: true,
    actions: [
      { action: 'extend', title: '⏱ Produži parking' },
      { action: 'dismiss', title: '✕ Odustani' },
    ],
    ...options,
  };

  try {
    // 1. Try via Service Worker if active (supports background handling and mobile actions)
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, defaultOptions);
        return true;
      }
    }
    // 2. Fallback to standard Notification instance
    new Notification(title, defaultOptions);
    return true;
  } catch (err) {
    console.warn('Could not display system notification:', err);
    return false;
  }
}

/**
 * Evaluates active parking session and automatically sends push notifications:
 * 1. Exactly 5 minutes before expiration
 * 2. When parking has expired
 * Includes 'extend' and 'dismiss' options.
 */
export function checkAndTriggerSessionAlerts(
  session: ParkingPaymentSession | null
): {
  session: ParkingPaymentSession;
  triggered: 'expiring' | 'expired';
} | null {
  if (!session || session.status === 'expired') return null;

  const now = Date.now();
  const remainingSeconds = Math.floor((session.expiresAt - now) / 1000);
  const leadSeconds = 5 * 60; // 5 minutes exactly

  // Case 1: Session expired (0 or less seconds left)
  if (remainingSeconds <= 0 && !session.expiredAlertSentAt) {
    const updated: ParkingPaymentSession = {
      ...session,
      expiredAlertSentAt: now,
      status: 'expired',
    };

    showParkingNotification(`⚠️ Parking je ISTEKAO! (${session.vehiclePlate})`, {
      body: `${session.cityName} (${session.zoneName}) – parking je istekao! Kliknite za produženje ili odustanite.`,
      tag: `expired-${session.id}`,
      data: {
        sessionId: session.id,
        vehiclePlate: session.vehiclePlate,
        smsNumber: session.smsNumber,
        cityName: session.cityName,
        zoneName: session.zoneName,
        actionType: 'expired',
      },
    });

    return { session: updated, triggered: 'expired' };
  }

  // Case 2: Session expiring soon (within 5 minutes)
  if (remainingSeconds > 0 && remainingSeconds <= leadSeconds && !session.alertSentAt) {
    const updated: ParkingPaymentSession = {
      ...session,
      alertSentAt: now,
    };

    showParkingNotification(
      `⏱ Parking ističe za 5 minuta! (${session.vehiclePlate})`,
      {
        body: `${session.cityName} – ${session.zoneName}\nKliknite 'Produži parking' za slanje SMS-a na ${session.smsNumber} ili 'Odustani'.`,
        tag: `expiring-${session.id}`,
        data: {
          sessionId: session.id,
          vehiclePlate: session.vehiclePlate,
          smsNumber: session.smsNumber,
          cityName: session.cityName,
          zoneName: session.zoneName,
          actionType: 'expiring',
        },
      }
    );

    return { session: updated, triggered: 'expiring' };
  }

  return null;
}
