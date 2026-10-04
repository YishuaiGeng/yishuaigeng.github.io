import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 1000 } });

test.beforeEach(async ({ page }) => {
  // Keep these checks independent of analytics and the visitor map services.
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    return ['localhost', '127.0.0.1'].includes(url.hostname) ? route.continue() : route.abort();
  });
});

test('navigation logo activates with keyboard and repeated clicks without navigating', async ({
  page,
}) => {
  const errors: string[] = [];
  const modelRequests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (/\.glb|assets\/js\/whale-pet/.test(request.url())) modelRequests.push(request.url());
  });
  await page.goto('/');
  const pet = page.locator('nav whale-pet');
  const button = pet.getByRole('button');
  await expect(page.locator('whale-pet')).toHaveCount(1);
  await expect(pet).toHaveAttribute('data-motion', 'active');
  await expect(pet.locator('.pet-artwork')).toBeVisible();
  await expect(pet.locator('canvas, .pet-hint, [title]')).toHaveCount(0);
  await expect(button).toHaveAccessibleName(/Whale companion/);
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(pet).toHaveAttribute('data-state', 'happy');
  await expect(pet).toHaveAttribute('data-fountain', 'active');
  for (let i = 0; i < 3; i++) await button.click();
  await expect(pet).toHaveAttribute('data-fountain', 'idle');
  await expect(pet).toHaveAttribute('data-state', 'idle');
  await button.press('Space');
  await expect(pet).toHaveAttribute('data-state', 'happy');
  await expect(pet).toHaveAttribute('data-state', 'idle');
  await expect(page).toHaveURL(/\/$/);
  expect(await button.evaluate((el) => el.closest('a'))).toBeNull();
  expect(await pet.innerText()).toBe('');
  expect(modelRequests).toEqual([]);
  expect(errors).toEqual([]);
  await button.blur();
  await page.screenshot({ path: 'test-results/whale-navbar-desktop.png' });
});

test('reading follows scroll and selection, and resumes after a greeting', async ({ page }) => {
  await page.goto('/');
  const pet = page.locator('whale-pet');
  await page.evaluate(() => window.scrollTo({ top: 350, behavior: 'instant' }));
  await expect(pet).toHaveAttribute('data-state', 'reading');
  await expect(pet.locator('.pet-expression-reading')).toBeVisible();
  await pet.getByRole('button').click();
  await expect(pet).toHaveAttribute('data-state', 'happy');
  await expect(pet).toHaveAttribute('data-state', 'reading');
  await page.screenshot({ path: 'test-results/whale-navbar-reading.png' });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(pet).toHaveAttribute('data-state', 'idle');
  await page
    .locator('#main-content p')
    .first()
    .evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    });
  await expect(pet).toHaveAttribute('data-state', 'reading');
  await page.evaluate(() => window.getSelection()?.removeAllRanges());
  await expect(pet).toHaveAttribute('data-state', 'idle');
});

test('idle sleeps and wakes; reading pages remain attentive across navigation', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto('/');
  const pet = page.locator('whale-pet');
  await expect(pet).toHaveAttribute('data-motion', 'active');
  await page.clock.runFor(31000);
  await expect(pet).toHaveAttribute('data-state', 'sleep');
  await page.keyboard.press('Shift');
  await expect(pet).toHaveAttribute('data-state', 'idle');
  await page.locator('nav a[href="/blog/"]').first().click();
  await expect(page).toHaveURL(/\/blog\/$/);
  await expect(pet).toHaveCount(1);
  await expect(pet).toHaveAttribute('data-state', 'reading');
  await page.clock.runFor(31000);
  await expect(pet).toHaveAttribute('data-state', 'reading');
  await page.locator('nav .navbar-brand').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(pet).toHaveCount(1);
  await expect(pet).toHaveAttribute('data-state', 'idle');
});

test('search changes to thinking and restores the reading context when closed', async ({
  page,
}) => {
  await page.goto('/blog/');
  const pet = page.locator('whale-pet');
  await expect(pet).toHaveAttribute('data-state', 'reading');
  await page.locator('#search-toggle:visible').click();
  await expect(pet).toHaveAttribute('data-state', 'thinking');
  await expect(pet.locator('.pet-expression-thinking')).toBeVisible();
  await page.screenshot({ path: 'test-results/whale-navbar-thinking.png' });
  await page.keyboard.press('Escape');
  await expect(pet).toHaveAttribute('data-state', 'reading');
  await page.keyboard.press('Control+k');
  await expect(pet).toHaveAttribute('data-state', 'thinking');
  await page.keyboard.press('Escape');
  await expect(pet).toHaveAttribute('data-state', 'reading');
});

test('reduced motion keeps interactive and reading feedback static', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const pet = page.locator('whale-pet');
  await expect(pet).toHaveAttribute('data-motion', 'reduced');
  await pet.getByRole('button').click();
  await expect(pet).toHaveAttribute('data-state', 'happy');
  await expect(pet).toHaveAttribute('data-fountain', 'idle');
  expect(await pet.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }));
  await expect(pet).toHaveAttribute('data-state', 'reading');
  expect(await pet.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await pet.getByRole('button').click();
  await expect(pet).toHaveAttribute('data-fountain', 'active');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(pet).toHaveAttribute('data-state', 'reading');
  expect(await pet.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
});

test('logo fits before the name across screen sizes and stays in the fixed bar', async ({
  page,
}) => {
  await page.goto('/');
  const pet = page.locator('whale-pet');
  for (const width of [320, 390, 900, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    const petBox = (await pet.boundingBox())!;
    const brand = (await page.locator('.navbar-brand').boundingBox())!;
    const controls = await page.locator('nav > .page-container').evaluate((container) => {
      return [...container.children]
        .filter((el) => getComputedStyle(el).display !== 'none')
        .map((el) => {
          const b = el.getBoundingClientRect();
          return { left: b.left, right: b.right };
        });
    });
    expect(petBox.x).toBeGreaterThanOrEqual(0);
    expect(petBox.y).toBeGreaterThanOrEqual(0);
    expect(petBox.y + petBox.height).toBeLessThanOrEqual(57);
    expect(petBox.x + petBox.width).toBeLessThanOrEqual(brand.x);
    expect(controls[0].right).toBeLessThanOrEqual(controls[1].left);
    expect(controls[1].right).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (width < 1024) {
      await page.locator('#navbar-toggler').click();
      await expect(page.locator('#navbar-collapse')).toBeVisible();
      await page.locator('#navbar-toggler').click();
      await expect(page.locator('#navbar-collapse')).toBeHidden();
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const before = (await pet.boundingBox())!;
  await page.evaluate(() => window.scrollTo({ top: 240, behavior: 'instant' }));
  await expect(pet).toHaveAttribute('data-state', 'reading');
  const after = (await pet.boundingBox())!;
  expect(after.y).toBeCloseTo(before.y, 0);
  await page.screenshot({ path: 'test-results/whale-navbar-mobile.png' });
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.screenshot({ path: 'test-results/whale-navbar-mobile-dark.png' });
});
