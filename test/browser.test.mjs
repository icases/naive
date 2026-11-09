import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import test from 'node:test';
import { once } from 'node:events';

import { createApp } from '../server.mjs';

const modulePath = process.env.PLAYWRIGHT_MODULE_PATH ?? 'playwright';
let playwright;
try {
  playwright = await import(modulePath);
} catch {
  playwright = null;
}

test('the language picker and keyboard work in a browser', async (context) => {
  const chromiumPath = process.env.CHROMIUM_PATH ?? '/usr/bin/chromium';
  if (!playwright) {
    context.skip('Install Playwright or set PLAYWRIGHT_MODULE_PATH to run browser tests.');
    return;
  }
  try {
    await access(chromiumPath);
  } catch {
    context.skip('Set CHROMIUM_PATH to run browser tests.');
    return;
  }

  const server = await createApp();
  server.listen(0);
  await once(server, 'listening');
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const api = playwright.default ?? playwright;
  const browser = await api.chromium.launch({ headless: true, executablePath: chromiumPath, args: ['--no-sandbox'] });

  try {
    const page = await browser.newPage({ viewport: { width: 560, height: 800 } });
    let wordRequests = 0;
    await page.route('**/api/word?lang=*', async (route) => {
      wordRequests += 1;
      const lang = new URL(route.request().url()).searchParams.get('lang');
      const word = lang === 'en' ? 'chlesanthrashality' : 'inventata';
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ word, real: false }) });
    });

    await page.goto(`${baseUrl}/?lang=it`);
    await assert.equal(await page.locator('#heading').textContent(), 'È italiano?');
    await assert.equal(await page.locator('#languagePicker').inputValue(), 'it');

    await page.selectOption('#languagePicker', 'en');
    await page.waitForURL('**/?lang=en');
    await assert.equal(await page.locator('#heading').textContent(), 'Is this English?');
    await assert.equal(await page.locator('#yesLabel').textContent(), 'It is a real word');

    const dimensions = await page.locator('#word').evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
    assert.ok(dimensions.scrollWidth <= dimensions.clientWidth);

    await page.click('#no');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('#result').hidden);
    assert.equal(wordRequests, 3);
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});
