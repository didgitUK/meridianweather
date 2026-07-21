import webpush from 'web-push';

export function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()
    || process.env.VAPID_PUBLIC_KEY?.trim()
    || '';
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim() || '';
  const subject = process.env.VAPID_SUBJECT?.trim() || 'mailto:privacy@meridianweather.co.uk';

  if (!publicKey || !privateKey) {
    return null;
  }

  return { publicKey, privateKey, subject };
}

export function isWebPushConfigured() {
  return Boolean(getVapidConfig());
}

export function configureWebPush() {
  const config = getVapidConfig();
  if (!config) {
    return null;
  }

  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  return config;
}

export async function sendWebPushNotification(subscription, payload) {
  configureWebPush();
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);

  return webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    },
    body,
    {
      TTL: 60 * 60 * 12,
      urgency: 'normal',
    },
  );
}
