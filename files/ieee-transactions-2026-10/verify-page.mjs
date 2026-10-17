/* global window, document, getComputedStyle, console */
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const route = 'http://127.0.0.1:4337/blog/ieee-transactions-journals-and-emerging-venues/';
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
for (const [name, width, height] of [
  ['desktop', 1440, 1000],
  ['mobile', 390, 844],
]) {
  await page.setViewportSize({ width, height });
  await page.goto(route, { waitUntil: 'networkidle' });
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    tables: [...document.querySelectorAll('.prose table')].map((table) => ({
      rows: table.querySelectorAll('tbody tr').length,
      overflow: getComputedStyle(table).overflowX,
    })),
  }));
  if (dimensions.document > width) throw new Error(`${name}: page overflows viewport`);
  await page.screenshot({ path: `files/ieee-transactions-2026-10/${name}.png` });
  console.log(name, JSON.stringify(dimensions));
  const details = page.locator('details').filter({ hasText: '展开 62 条' });
  await details.locator('summary').click();
  if ((await details.locator('tbody tr').count()) !== 62) throw new Error('Legacy table missing');
}
if (errors.length) throw new Error(errors.join('\n'));
await browser.close();
console.log('Desktop/mobile layout and legacy expansion passed; no page errors.');
