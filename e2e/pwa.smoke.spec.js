import { expect, test } from '@playwright/test';

test.describe('PWA smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem(
        'meridian:consent',
        JSON.stringify({
          essential: true,
          functional: true,
          marketing: false,
          analytics: false,
          advertising: false,
        }),
      );
      localStorage.setItem('meridian:cookie-consent', 'accepted');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
  });

  test('manifest and service worker are available', async ({ page }) => {
    const manifestResponse = await page.request.get('/manifest.webmanifest');
    expect(manifestResponse.ok()).toBeTruthy();
    const manifest = await manifestResponse.json();
    expect(manifest.display).toBe('standalone');
    expect(manifest.short_name).toMatch(/meridian/i);

    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) {
        return false;
      }
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      return Boolean(registration);
    });
    expect(swRegistered).toBeTruthy();

    await expect.poll(async () => {
      return page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration('/');
        return Boolean(registration?.active || registration?.installing || registration?.waiting);
      });
    }).toBeTruthy();
  });

  test('Settings App tab exposes install and notification controls', async ({ page }) => {
    await page.getByRole('button', { name: /settings/i }).first().click();
    await page.getByRole('tab', { name: /^App$/i }).click();
    await expect(page.getByRole('heading', { name: /Install meridian/i })).toBeVisible();
    await expect(page.getByText(/Offline backup/i)).toBeVisible();
    await expect(page.getByText(/Device notifications|Daily refresh/i).first()).toBeVisible();
  });

  test('offline.html fallback is served', async ({ page }) => {
    const response = await page.request.get('/offline.html');
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toMatch(/offline/i);
  });
});
