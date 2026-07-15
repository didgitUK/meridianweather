import { expect, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const hasOpenWeatherKey = Boolean(process.env.OPENWEATHER_API_KEY?.trim());

const CONSOLE_ALLOW = [
  /Download the React DevTools/i,
  /hydration/i,
  /favicon/i,
];

test.describe('browser observability smoke', () => {
  test('home loads without page errors; optional geocode waterfall', async ({ page }, testInfo) => {
    const consoleErrors = [];
    const pageErrors = [];
    const apiTimings = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (CONSOLE_ALLOW.some((pattern) => pattern.test(text))) {
          return;
        }
        consoleErrors.push(text);
      }
    });

    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    page.on('response', async (response) => {
      const url = response.url();
      if (!url.includes('/api/geocode') && !url.includes('/api/weather')) {
        return;
      }

      const timing = response.request().timing();
      apiTimings.push({
        url,
        status: response.status(),
        responseEnd: timing?.responseEnd ?? null,
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/meridian|weather/i);

    // Prefill consent so pin flow can write localStorage without the banner dance.
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
    await expect(page.locator('html')).toBeAttached();

    expect(pageErrors, `pageerrors: ${pageErrors.join(' | ')}`).toEqual([]);
    expect(consoleErrors, `console.error: ${consoleErrors.join(' | ')}`).toEqual([]);

    if (hasOpenWeatherKey) {
      const search = page.getByRole('combobox').or(page.getByPlaceholder(/search/i)).first();
      await search.fill('London');
      await page.waitForTimeout(800);
      await page.keyboard.press('Enter').catch(() => {});

      // Soft waterfall artifact for engineers
      const artifactPath = path.join(testInfo.outputDir, 'api-waterfall.json');
      fs.mkdirSync(testInfo.outputDir, { recursive: true });
      fs.writeFileSync(artifactPath, JSON.stringify(apiTimings, null, 2));

      const timed = apiTimings.filter((entry) => entry.responseEnd != null);
      for (const entry of timed) {
        expect(entry.responseEnd, entry.url).toBeLessThan(15_000);
      }
    } else {
      testInfo.annotations.push({
        type: 'note',
        description: 'OPENWEATHER_API_KEY unset — skipped geocode/weather waterfall assertions',
      });
    }
  });

  test('pin path writes meridian:saved-cities when API available', async ({ page }, testInfo) => {
    test.skip(!hasOpenWeatherKey, 'Requires OPENWEATHER_API_KEY for live pin path');

    await page.addInitScript(() => {
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

    await page.goto('/');
    const search = page.getByRole('combobox').or(page.getByPlaceholder(/search/i)).first();
    await search.fill('London');
    await page.waitForTimeout(1000);

    const option = page.getByRole('option').first();
    if (await option.count()) {
      await option.click();
    } else {
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
    }

    await page.waitForURL(/\/city\//, { timeout: 20_000 });

    const pin = page.getByRole('button', { name: /pin/i }).first();
    await pin.click({ timeout: 15_000 });

    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem('meridian:saved-cities')))
      .not.toBeNull({ timeout: 10_000 });

    const raw = await page.evaluate(() => localStorage.getItem('meridian:saved-cities'));
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length).toBeGreaterThan(0);

    testInfo.annotations.push({
      type: 'note',
      description: `localStorage meridian:saved-cities present (${raw?.length ?? 0} chars)`,
    });
  });
});
