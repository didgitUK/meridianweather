'use client';

import { STORAGE_KEYS } from '@/constants/storage-keys';
import { normalizePwaNotifyMode, PWA_NOTIFY_MODES } from '@/constants/pwa';

/**
 * Push subscription helpers for the meridian PWA.
 */

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

export function readStoredNotifyMode() {
  try {
    return normalizePwaNotifyMode(window.localStorage.getItem(STORAGE_KEYS.pwaNotifyMode));
  } catch {
    return PWA_NOTIFY_MODES.daily;
  }
}

export function writeStoredNotifyMode(mode) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.pwaNotifyMode, normalizePwaNotifyMode(mode));
  } catch {
    // Ignore storage failures.
  }
}

export async function fetchVapidPublicKey() {
  const response = await fetch('/api/push/vapid-public-key');
  if (!response.ok) {
    return null;
  }
  const payload = await response.json();
  return typeof payload?.publicKey === 'string' ? payload.publicKey : null;
}

export async function subscribeToPush({ clientId, cities, notifyMode }) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push is not supported in this browser.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  const publicKey = await fetchVapidPublicKey();
  if (!publicKey) {
    throw new Error('Push is not configured on the server yet.');
  }

  const mode = normalizePwaNotifyMode(notifyMode ?? readStoredNotifyMode());
  writeStoredNotifyMode(mode);

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const json = subscription.toJSON();
  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId,
      endpoint: json.endpoint,
      keys: json.keys,
      cities,
      notifyMode: mode,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.message || 'Unable to save push subscription.');
  }

  return subscription;
}

export async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    return false;
  }

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await fetch('/api/push/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint }),
  }).catch(() => undefined);

  return true;
}

export async function syncPushCities({ clientId, cities, notifyMode }) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    return;
  }

  const mode = normalizePwaNotifyMode(notifyMode ?? readStoredNotifyMode());
  const json = subscription.toJSON();
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId,
      endpoint: json.endpoint,
      keys: json.keys,
      cities,
      notifyMode: mode,
    }),
  }).catch(() => undefined);
}

export async function getPushSubscriptionState() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return {
      supported: false,
      subscribed: false,
      permission: 'denied',
      notifyMode: PWA_NOTIFY_MODES.daily,
    };
  }

  const permission = Notification.permission;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return {
    supported: true,
    subscribed: Boolean(subscription),
    permission,
    notifyMode: readStoredNotifyMode(),
  };
}
