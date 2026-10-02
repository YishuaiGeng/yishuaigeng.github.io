import { expect, test } from '@playwright/test';

test('homepage presents Yishuai Geng and migrated content', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Yishuai Geng/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Yishuai Geng (耿宜帅)' }),
  ).toBeVisible();
  await expect(page.getByText(/^I am a PhD student/)).toBeVisible();
  await expect(page.getByText(/I am Yishuai Geng/)).toHaveCount(0);
  await expect(
    page.getByText('Knowledge Representation and Reasoning', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Logical Reasoning with Large Language Models', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Recommender Systems', { exact: true })).toBeVisible();
  await expect(page.getByText(/born on December 19, 1999/)).toBeVisible();
  await expect(page.getByText('Formal Verification', { exact: true })).toHaveCount(0);
  await expect(page.getByText('My research interests include:', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 2, name: 'Research Interests' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Education' })).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 2, name: 'News' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Latest Blogs' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Latest Posts' })).toHaveCount(0);
  await expect(page.getByText(/Two co-authored papers on virtual knowledge graphs/)).toBeVisible();

  const wordmark = page.locator('.navbar-brand .navbar-wordmark');
  await expect(wordmark).toBeVisible();
  await expect(wordmark).toHaveAttribute('src', /yishuai-geng-wordmark\.svg$/);
  await expect(wordmark).toHaveAttribute('alt', 'Yishuai Geng');
  expect(await wordmark.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(
    0,
  );

  await expect(page.locator('.home-section-heading .heading-emoji')).toHaveText([
    '🔬',
    '🔥',
    '📝',
    '📰',
  ]);
  await expect(page.locator('.home-section-heading svg')).toHaveCount(0);

  const newsContentLeft = await page
    .locator('.news-list tbody tr')
    .first()
    .locator('td')
    .nth(1)
    .evaluate((element) => element.getBoundingClientRect().left);
  const blogContentLeft = await page
    .locator('.blog-list tbody tr')
    .first()
    .locator('td')
    .nth(1)
    .evaluate((element) => element.getBoundingClientRect().left);
  expect(Math.abs(newsContentLeft - blogContentLeft)).toBeLessThan(1);

  const avatar = page.locator('.profile img[alt*="Yishuai Geng"]');
  await expect(avatar).toBeVisible();
  await expect(avatar).toHaveAttribute('src', /profile-life\.jpg$/);
  expect(await avatar.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  const avatarBox = await avatar.boundingBox();
  expect(avatarBox).toBeTruthy();
  expect(avatarBox!.height).toBeGreaterThan(avatarBox!.width);

  const profile = page.locator('.profile');
  await expect(profile.locator('.social-links')).toBeVisible();
  await expect(profile.locator('.more-info')).toHaveCount(0);
  await expect(page.getByText(/conference activities.*CV/i)).toHaveCount(0);

  const centerDifference = await profile.evaluate((element) => {
    const photo = element.querySelector('.photo-frame')!.getBoundingClientRect();
    const icons = element.querySelector('.profile-extra')!.getBoundingClientRect();
    return Math.abs(photo.left + photo.width / 2 - (icons.left + icons.width / 2));
  });
  expect(centerDifference).toBeLessThan(1);

  await expect(
    page
      .locator('section')
      .filter({ hasText: 'Selected Publications' })
      .getByText('Yishuai Geng', { exact: true }),
  ).toHaveCount(7);
  await expect(
    page
      .locator('section')
      .filter({ hasText: 'Selected Publications' })
      .locator('strong')
      .filter({ hasText: /^Yishuai Geng$/ }),
  ).toHaveCount(7);
  await expect(
    page.locator('section').filter({ hasText: 'Selected Publications' }).locator('.self-author'),
  ).toHaveCount(7);
});

test('publications page lists all migrated papers', async ({ page }) => {
  await page.goto('/publications/');

  await expect(page).toHaveTitle(/publications/i);
  await expect(
    page.getByRole('link', { name: /Can LLMs Solve ASP Problems/ }).first(),
  ).toBeVisible();
  await expect(
    page
      .getByRole('link', { name: 'Soft Prompt-tuning for Personalized News Recommendation' })
      .first(),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Information-Needs-Guided/ }).first()).toBeVisible();
  await expect(
    page.getByRole('link', { name: /NaVQA: Mitigating Silent Failures/ }).first(),
  ).toBeVisible();
  await expect(page.locator('.bibliography > li')).toHaveCount(9);
  await expect(page.locator('.citation-summary')).toHaveAttribute(
    'aria-label',
    'Google Scholar Citations: 46',
  );
  await expect(page.locator('.citation-summary-icon')).toBeVisible();
  await expect(page.locator('.publication-rank').filter({ hasText: 'CCF-B' })).toHaveCount(4);
  await expect(page.getByAltText('Google Scholar: 15 citations').first()).toBeVisible();
  await expect(
    page.locator('.links .metric-badges img[alt="Google Scholar: 15 citations"]').first(),
  ).toBeVisible();

  const llmPaper = page
    .locator('.bibliography > li')
    .filter({ hasText: 'Can LLMs Solve ASP Problems?' });
  await expect(llmPaper.locator('.col-sm-12')).toBeVisible();
  const periodicalAlignment = await llmPaper.locator('.periodical').evaluate((element) => {
    const venue = element.querySelector('em')!.getBoundingClientRect();
    const rank = element.querySelector('.publication-rank')!.getBoundingClientRect();
    return Math.abs(venue.top + venue.height / 2 - (rank.top + rank.height / 2));
  });
  expect(periodicalAlignment).toBeLessThan(3);
});

test('publication details keep actions, metrics, and highlighted author together', async ({
  page,
}) => {
  await page.goto('/publications/ren2026invkge/');

  const actionRow = page.locator('.pub-action-row');
  await expect(actionRow.locator('.pub-actions')).toBeVisible();
  await expect(actionRow.locator('.pub-badges')).toBeVisible();
  await expect(page.locator('.pub-authors strong').getByText('Yishuai Geng')).toBeVisible();
  await expect(page.locator('.publication-rank').getByText('CCF-B')).toBeVisible();

  const centers = await actionRow.evaluate((row) => {
    const actions = row.querySelector('.pub-actions')!.getBoundingClientRect();
    const badges = row.querySelector('.pub-badges')!.getBoundingClientRect();
    return [actions.top + actions.height / 2, badges.top + badges.height / 2];
  });
  expect(Math.abs(centers[0] - centers[1])).toBeLessThan(2);
});

test('CV includes migrated achievements and institution logos', async ({ page, request }) => {
  await page.goto('/cv/');

  await expect(page.getByRole('heading', { level: 3, name: 'Patents' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Competitions' })).toBeVisible();
  const certificateLinks = page.locator('a[href^="/assets/img/achievements/"]');
  await expect(certificateLinks).toHaveCount(29);

  const institutionLogos = page.locator('img.entry-logo');
  await expect(institutionLogos).toHaveCount(3);
  for (const logo of await institutionLogos.all()) {
    expect(await logo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  }

  const firstAsset = await certificateLinks.first().getAttribute('href');
  expect(firstAsset).toBeTruthy();
  const response = await request.get(firstAsset!);
  expect(response.ok()).toBe(true);

  const portrait = page.locator('img.cv-portrait');
  await expect(portrait).toBeVisible();
  await expect(portrait).toHaveAttribute('src', /profile-cv\.jpg$/);
  expect(await portrait.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(
    0,
  );

  const sectionHeadings = page.locator('.cv-section > .card-title');
  const sectionEmojis = page.locator('.cv-section-emoji');
  await expect(sectionEmojis).toHaveCount(await sectionHeadings.count());
  await expect(sectionEmojis.first()).toHaveText('👤');
  await expect(sectionHeadings.locator('svg')).toHaveCount(0);

  const competitionSection = page.locator('#competitions + .cv-section');
  await expect(competitionSection.locator('.entry-badge-national')).toHaveCount(2);
  await expect(competitionSection.locator('.entry-badge-provincial')).toHaveCount(5);
  await expect(competitionSection.locator('.entry-badge-award')).toHaveCount(7);
  await expect(competitionSection.locator('.entry-badge-national').first()).toHaveText('National');
  await expect(competitionSection.locator('.entry-badge-provincial').first()).toHaveText(
    'Provincial',
  );
  await expect(competitionSection.locator('.entry-badge-award').first()).toHaveText('Third Prize');
  await expect(competitionSection.locator('.title').first()).not.toContainText(
    'National Third Prize',
  );

  const honorSection = page.locator('#honors + .cv-section');
  const awardSection = page.locator('#awards + .cv-section');
  await expect(honorSection.locator('.cv-institution-group-title')).toHaveText([
    'Southeast University',
    'Yangzhou University',
    'Wuxi Taihu University',
  ]);
  await expect(awardSection.locator('.cv-institution-group-title')).toHaveText([
    'Yangzhou University',
    'Wuxi Taihu University',
  ]);
  await expect(honorSection.locator('.institution-logo')).toHaveCount(3);
  await expect(awardSection.locator('.institution-logo')).toHaveCount(2);
  await expect(honorSection.locator('.subtitle').filter({ hasText: 'University' })).toHaveCount(0);
  await expect(awardSection.locator('.subtitle').filter({ hasText: 'University' })).toHaveCount(0);
  await expect(honorSection.getByText('Civilized Dormitory', { exact: true })).toHaveCount(0);
  await expect(
    honorSection.getByText('Outstanding Communist Party Member', { exact: true }),
  ).toBeVisible();
  await expect(
    honorSection.getByText('Outstanding Student Cadre, 2025-2026 Academic Year', { exact: true }),
  ).toBeVisible();

  const competitionLevelColors = await Promise.all([
    competitionSection
      .locator('.entry-badge-national')
      .first()
      .evaluate((element) => getComputedStyle(element).borderColor),
    competitionSection
      .locator('.entry-badge-provincial')
      .first()
      .evaluate((element) => getComputedStyle(element).borderColor),
  ]);
  expect(competitionLevelColors[0]).not.toBe(competitionLevelColors[1]);

  const patentSubtitle = page.locator('#patents + .cv-section .subtitle').first();
  await expect(patentSubtitle).toHaveCSS('color', 'rgb(108, 117, 125)');
  await expect(patentSubtitle).toHaveCSS('font-weight', '400');

  await expect(awardSection.locator('.inline-meta')).toHaveCount(5);
  await expect(awardSection.locator('ul.items')).toHaveCount(0);
  await expect(
    awardSection.locator('.title').filter({ hasText: 'Ranked 1/78' }).first(),
  ).toBeVisible();
});

test('CV page shows education and publication data', async ({ page }) => {
  await page.goto('/cv/');

  await expect(page).toHaveTitle(/cv/i);
  await expect(page.getByText('Southeast University').first()).toBeVisible();
  await expect(page.getByText('Can LLMs Solve ASP Problems?').first()).toBeVisible();
  await expect(page.getByText('December 19, 1999', { exact: true })).toBeVisible();
  await expect(page.getByText('Yangzhou, Jiangsu, China', { exact: true })).toBeVisible();
  await expect(page.getByText('Website', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Research Interests' })).toHaveCount(0);
  await expect(page.locator('.cv-publication-entry .self-author').first()).toBeVisible();
  await expect(page.getByText('Mar 2025 – Present', { exact: true })).toBeVisible();

  const honorDates = await page
    .locator('#honors + .cv-section .date-column .badge')
    .allTextContents();
  expect(honorDates.slice(0, 3).map((date) => date.trim())).toEqual([
    'Sep 2026',
    'Mar 2026',
    'May 2024',
  ]);
});

test('legacy achievements URL redirects to the CV', async ({ page }) => {
  await page.goto('/achievements/');
  await expect(page).toHaveURL(/\/cv\/$/);
});

test('theme preference persists across navigation', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('theme', 'dark'));
  await page.goto('/cv/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.evaluate(() => localStorage.setItem('theme', 'light'));
  await page.goto('/publications/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('navigation exposes the restored personal-site routes', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation').first();

  for (const label of ['About', 'Blogs', 'Publications', 'Projects', 'Repositories', 'CV']) {
    await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
  }
  const topLevelLabels = await nav.locator(':scope > div > div.md\\:flex > a').allTextContents();
  expect(topLevelLabels.map((label) => label.trim())).toEqual([
    'About',
    'Blogs',
    'Publications',
    'Projects',
    'Repositories',
    'CV',
  ]);
  await expect(nav.getByRole('link', { name: 'Achievements', exact: true })).toHaveCount(0);

  await expect(nav.getByRole('button', { name: 'More', exact: true })).toHaveCount(0);
  for (const label of ['Teaching', 'People', 'Books']) {
    await expect(nav.getByRole('link', { name: label, exact: true })).toHaveCount(0);
  }
  await expect(nav.getByRole('menuitem', { name: 'Repositories', exact: true })).toHaveCount(0);
});

test('blog provides a structured research notebook with starter posts', async ({ page }) => {
  await page.goto('/blog/');

  await expect(page.getByRole('heading', { level: 1, name: 'Blogs' })).toBeVisible();
  for (const category of ['Paper Reading', 'Learning Notes', 'Technical Notes', 'Daily Notes']) {
    await expect(page.locator('.collection-link').filter({ hasText: category })).toBeVisible();
  }

  await expect(page.getByRole('link', { name: /RAG Learning Notes/ })).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Reinforcement Learning Study Notes/ }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Recommender Systems Notes/ })).toBeVisible();
  await expect(page.getByText('Research Updates', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Research Progress Log/ })).toHaveCount(0);

  const visibleNotes = page.locator('.post-list > li');
  await expect(visibleNotes).toHaveCount(7);
  expect(await visibleNotes.count()).toBeLessThanOrEqual(20);

  await page.getByRole('link', { name: 'Paper Reading Notes: A Reusable Review Template' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Bibliographic Record' })).toBeVisible();
});

test('repositories page shows the GitHub overview and selected repositories', async ({ page }) => {
  await page.goto('/repositories/');

  await expect(page.getByRole('heading', { level: 1, name: 'Repositories' })).toBeVisible();
  await expect(page.getByAltText('GitHub stats for YishuaiGeng')).toHaveCount(2);

  for (const repo of [
    'seu-llm-logical-reasoning',
    'Synvory',
    'ai-paper-writing',
    'ai-infra-console',
    'CertMaster',
    'gaokao-volunteer-skills',
  ]) {
    const repoUrl = `https://github.com/YishuaiGeng/${repo}`;
    const cardLink = page.locator(`.repo-card a[href="${repoUrl}"]`);
    await expect(cardLink).toHaveCount(1);
    await expect(cardLink.locator('img')).toHaveCount(2);
    await expect(cardLink.locator('img').first()).toHaveAttribute(
      'src',
      new RegExp(`repo=${repo}`),
    );
  }

  const lightCards = page.locator('.repo-card .only-light');
  const darkCards = page.locator('.repo-card .only-dark');
  await expect(lightCards).toHaveCount(7);
  await expect(darkCards).toHaveCount(7);

  await page.locator('html').evaluate((element) => element.setAttribute('data-theme', 'light'));
  await expect(lightCards.first()).toHaveCSS('display', 'block');
  await expect(darkCards.first()).toHaveCSS('display', 'none');

  await page.locator('html').evaluate((element) => element.setAttribute('data-theme', 'dark'));
  await expect(lightCards.first()).toHaveCSS('display', 'none');
  await expect(darkCards.first()).toHaveCSS('display', 'block');
});

test('restored template sections are available for future content', async ({ page }) => {
  for (const path of [
    '/blog/',
    '/projects/',
    '/repositories/',
    '/teaching/',
    '/people/',
    '/books/',
  ]) {
    const response = await page.goto(path);
    expect(response?.ok(), `${path} should be available`).toBe(true);
    await expect(page.locator('main')).toBeVisible();
  }

  for (const [path, placeholder] of [
    ['/projects/', 'Projects Coming Soon'],
    ['/teaching/', 'Teaching Materials Coming Soon'],
    ['/people/', 'People Section Coming Soon'],
    ['/books/', 'Reading List Coming Soon'],
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 2, name: placeholder })).toBeVisible();
  }
});

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`${viewport.name} pages do not overflow horizontally`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const path of [
      '/',
      '/blog/',
      '/publications/',
      '/projects/',
      '/repositories/',
      '/cv/',
      '/teaching/',
      '/people/',
      '/books/',
    ]) {
      await page.goto(path);
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth, `${path} should fit the viewport`).toBeLessThanOrEqual(
        dimensions.clientWidth,
      );
    }
  });
}

test('unknown routes return the 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist/');
  expect(response?.status()).toBe(404);
});
