/**
 * Synchronize publication citation counts with the configured Google Scholar
 * profile. OpenAlex is used as a fallback when Scholar is temporarily blocked.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import yaml from 'js-yaml';

import { parseBibtex } from '../src/utils/bibtex.ts';

const REQUEST_DELAY_MS = 500;
const POLITE_POOL_EMAIL = 'ysgeng@seu.edu.cn';
const SCHOLAR_USER_ID = process.env.SCHOLAR_USER_ID ?? 'yYGe764AAAAJ';
const PROFILE_TOTAL_KEY = '__profile_total';

const root = process.cwd();
const bibPath = join(root, 'src/data/papers.bib');
const citationsPath = join(root, 'src/data/citations.yml');

interface OpenAlexWork {
  cited_by_count?: number;
  display_name?: string;
}

interface ScholarSnapshot {
  counts: Record<string, number>;
  titles: Record<string, string>;
  total: number;
}

function decodeHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function fetchScholarSnapshot(): Promise<ScholarSnapshot> {
  const url = `https://scholar.google.com/citations?user=${encodeURIComponent(SCHOLAR_USER_ID)}&hl=en`;
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Google Scholar returned HTTP ${response.status}`);
  }

  const html = await response.text();
  const counts: Record<string, number> = {};
  const titles: Record<string, string> = {};
  const idPattern = new RegExp(`citation_for_view=${escapeRegExp(SCHOLAR_USER_ID)}:([^&"]+)`);

  for (const match of html.matchAll(/<tr class="gsc_a_tr">([\s\S]*?)<\/tr>/g)) {
    const row = match[1];
    const id = row.match(idPattern)?.[1];
    const title = row.match(/class="gsc_a_at"[^>]*>([\s\S]*?)<\/a>/)?.[1];
    const countText = row.match(/<td class="gsc_a_c">[\s\S]*?<a[^>]*>([\d,]*)<\/a>/)?.[1];

    if (!id || title === undefined || countText === undefined) continue;
    counts[id] = countText ? Number(countText.replace(/,/g, '')) : 0;
    titles[id] = decodeHtml(title);
  }

  const totalText = html.match(/<td class="gsc_rsb_std">([\d,]+)<\/td>/)?.[1];
  const total = totalText ? Number(totalText.replace(/,/g, '')) : Number.NaN;

  if (Object.keys(counts).length === 0 || !Number.isFinite(total)) {
    throw new Error('Google Scholar response did not contain a readable publication profile');
  }

  return { counts, titles, total };
}

async function fetchOpenAlexCount(doi: string): Promise<number | null> {
  const encoded = encodeURIComponent(`https://doi.org/${doi}`);
  const url = `https://api.openalex.org/works/${encoded}?select=cited_by_count,display_name`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': `as-folio/1.0 (mailto:${POLITE_POOL_EMAIL})` },
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      console.warn(`  OpenAlex returned HTTP ${response.status} for DOI ${doi}`);
      return null;
    }
    const data = (await response.json()) as OpenAlexWork;
    return typeof data.cited_by_count === 'number' ? data.cited_by_count : null;
  } catch (error) {
    console.warn(`  OpenAlex request failed for DOI ${doi}:`, error);
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadExisting(): Record<string, number> {
  try {
    const parsed = yaml.load(readFileSync(citationsPath, 'utf8'));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, number>;
    }
  } catch {
    // The file is created on the first successful synchronization.
  }
  return {};
}

async function main(): Promise<void> {
  const entries = parseBibtex(readFileSync(bibPath, 'utf8'));
  const targets = entries.filter((entry) => entry.fields.google_scholar_id);

  if (targets.length === 0) {
    console.log('No entries with google_scholar_id were found in papers.bib.');
    return;
  }

  const existing = loadExisting();
  const updated: Record<string, number> = {};
  let source = 'Google Scholar';
  let scholarSnapshot: ScholarSnapshot | null = null;

  try {
    scholarSnapshot = await fetchScholarSnapshot();
    updated[PROFILE_TOTAL_KEY] = scholarSnapshot.total;
    console.log(`Google Scholar profile total: ${scholarSnapshot.total}`);
  } catch (error) {
    source = 'OpenAlex fallback';
    console.warn(`Google Scholar synchronization unavailable: ${String(error)}`);
  }

  for (const [index, entry] of targets.entries()) {
    const scholarId = entry.fields.google_scholar_id!;
    const scholarCount = scholarSnapshot?.counts[scholarId];

    if (scholarCount !== undefined) {
      updated[scholarId] = scholarCount;
      console.log(`  [${entry.key}] ${scholarCount} citations via Google Scholar`);
      continue;
    }

    const doi = entry.fields.doi;
    const openAlexCount = doi ? await fetchOpenAlexCount(doi) : null;
    updated[scholarId] =
      openAlexCount !== null
        ? Math.max(existing[scholarId] ?? 0, openAlexCount)
        : (existing[scholarId] ?? 0);
    console.log(
      `  [${entry.key}] ${updated[scholarId]} citations via ${
        openAlexCount !== null ? 'OpenAlex' : 'stored fallback'
      }`,
    );

    if (index < targets.length - 1 && doi) await sleep(REQUEST_DELAY_MS);
  }

  if (updated[PROFILE_TOTAL_KEY] === undefined) {
    updated[PROFILE_TOTAL_KEY] =
      existing[PROFILE_TOTAL_KEY] ??
      Object.entries(updated).reduce(
        (total, [key, count]) => (key === PROFILE_TOTAL_KEY ? total : total + count),
        0,
      );
  }

  const header = [
    '# Citation counts for the publications page.',
    '#',
    '# Per-paper keys are google_scholar_id values from papers.bib.',
    '# __profile_total is the total shown on the Google Scholar profile.',
    '# Google Scholar is the primary source; OpenAlex is used as a fallback.',
    '#',
    `# Last updated: ${new Date().toISOString().split('T')[0]}`,
    '# To refresh: yarn citations:update',
    '',
  ].join('\n');
  const body = yaml.dump(updated, { lineWidth: -1, sortKeys: true });

  writeFileSync(citationsPath, header + body, 'utf8');
  console.log(`Updated ${citationsPath} using ${source}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
