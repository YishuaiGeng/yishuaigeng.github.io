import { spawnSync } from 'node:child_process';

import { site } from '@config/site';
import { parseBibtex } from '@utils/bibtex';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

import bibRaw from '../data/papers.bib?raw';

const siteUrl = site.url.replace(/\/$/, '');
const base = site.base.replace(/\/$/, '');

function loc(path: string): string {
  return `${siteUrl}${base}${path}`;
}

function gitLastmod(filePath: string): string | undefined {
  const result = spawnSync('git', ['log', '-1', '--format=%ci', '--', filePath], {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (result.status !== 0 || !result.stdout?.trim()) return undefined;
  return result.stdout.trim().split(' ')[0] || undefined;
}

interface UrlEntry {
  url: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

function urlEntry({ url, lastmod, changefreq, priority }: UrlEntry): string {
  return [
    '  <url>',
    `    <loc>${url}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    priority !== undefined ? `    <priority>${priority.toFixed(1)}</priority>` : '',
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function GET(_ctx: APIContext): Promise<Response> {
  const [posts, projects] = await Promise.all([
    getCollection('posts', (post) => !post.data.draft && !post.data.hidden),
    getCollection('projects', (project) => !project.data.redirect),
  ]);
  const today = new Date().toISOString().split('T')[0];
  const staticUrls: UrlEntry[] = [
    {
      url: loc('/'),
      lastmod: gitLastmod('src/pages/index.astro') ?? today,
      changefreq: 'weekly',
      priority: 1.0,
    },
    {
      url: loc('/blog/'),
      lastmod: gitLastmod('src/pages/blog/index.astro'),
      changefreq: 'weekly',
      priority: 0.8,
    },
    {
      url: loc('/publications/'),
      lastmod: gitLastmod('src/data/papers.bib'),
      changefreq: 'monthly',
      priority: 0.9,
    },
    {
      url: loc('/projects/'),
      lastmod: gitLastmod('src/pages/projects/index.astro'),
      changefreq: 'monthly',
      priority: 0.8,
    },
    {
      url: loc('/cv/'),
      lastmod: gitLastmod('src/data/cv.yml'),
      changefreq: 'monthly',
      priority: 0.8,
    },
    {
      url: loc('/news/'),
      changefreq: 'monthly',
      priority: 0.6,
    },
    {
      url: loc('/repositories/'),
      lastmod: gitLastmod('src/pages/repositories.astro'),
      changefreq: 'monthly',
      priority: 0.6,
    },
    {
      url: loc('/teaching/'),
      lastmod: gitLastmod('src/pages/teaching/index.astro'),
      changefreq: 'monthly',
      priority: 0.5,
    },
    {
      url: loc('/people/'),
      lastmod: gitLastmod('src/pages/people/index.astro'),
      changefreq: 'monthly',
      priority: 0.5,
    },
    {
      url: loc('/books/'),
      lastmod: gitLastmod('src/pages/books.astro'),
      changefreq: 'monthly',
      priority: 0.5,
    },
  ];

  const publicationUrls: UrlEntry[] = parseBibtex(bibRaw).map((paper) => ({
    url: loc(`/publications/${paper.key}/`),
    changefreq: 'yearly',
    priority: 0.7,
  }));

  const postUrls: UrlEntry[] = posts.map((post) => ({
    url: loc(`/blog/${post.id}/`),
    lastmod:
      post.data.lastmod?.toISOString().split('T')[0] ??
      (post.filePath ? gitLastmod(post.filePath) : undefined) ??
      post.data.date.toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.7,
  }));

  const projectUrls: UrlEntry[] = projects.map((project) => ({
    url: loc(`/projects/${project.id}/`),
    lastmod: project.filePath ? gitLastmod(project.filePath) : undefined,
    changefreq: 'monthly',
    priority: 0.7,
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...publicationUrls, ...postUrls, ...projectUrls].map(urlEntry).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
