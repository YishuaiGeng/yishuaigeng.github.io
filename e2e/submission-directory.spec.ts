import { expect, test } from '@playwright/test';

const path = '/blog/submission-venue-directory/';

test('submission directory combines filters and shares cross-area journal tags', async ({
  page,
}) => {
  await page.goto(path);
  const directory = page.locator('[data-venue-directory]');
  const visibleRows = directory.locator('[data-venue-row]:visible');
  await expect(visibleRows).toHaveCount(282);
  await directory.getByRole('combobox', { name: '研究方向', exact: true }).selectOption('ai');
  await directory.getByLabel('文献载体').selectOption('journal');
  await directory.getByLabel('CCF 等级').selectOption('B');
  await directory.getByLabel('期刊分区', { exact: true }).selectOption('pending');
  await expect(visibleRows).toHaveCount(21);
  await expect(directory.getByRole('status')).toContainText('21 / 282');
  await directory.getByRole('searchbox', { name: '检索名称、简称、旧称或标签' }).fill('DKE');
  await expect(visibleRows).toHaveCount(1);
  await expect(visibleRows.first()).toContainText('人工智能');
  await expect(visibleRows.first()).toContainText('数据库/数据挖掘/内容检索');
  await directory.getByLabel('文献载体').selectOption('conference');
  await expect(visibleRows).toHaveCount(0);
  await expect(directory.locator('.empty')).toBeVisible();
  await directory.getByRole('button', { name: '重置筛选' }).click();
  await expect(visibleRows).toHaveCount(282);
  await directory.getByRole('searchbox', { name: '检索名称、简称、旧称或标签' }).fill('DKE');
  await expect(visibleRows).toHaveCount(2);
  await expect(visibleRows.first().getByRole('link', { name: '原文 p. 52' })).toHaveAttribute(
    'href',
    '/assets/pdf/ccf-2026-v7.pdf#page=52',
  );
});

test('source PDF, blog entry and mobile layout are accessible', async ({ page, request }) => {
  const source = await request.get('/assets/pdf/ccf-2026-v7.pdf');
  expect(source.status()).toBe(200);
  expect(source.headers()['content-type']).toContain('application/pdf');
  await page.goto('/blog/');
  await expect(page.locator(`a[href="${path}"]`).first()).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(path);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('论文投稿目录');
  await expect(page.locator('[data-venue-directory]')).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
  await page.locator('.area-links').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/submission-directory-mobile.png' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('.area-links').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/submission-directory-desktop.png' });
});

test('the complete directory remains readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`http://localhost:4321${path}`);
  await expect(page.locator('[data-venue-row]')).toHaveCount(282);
  await expect(page.getByText('启用 JavaScript 后可筛选', { exact: false })).toBeVisible();
  await context.close();
});
