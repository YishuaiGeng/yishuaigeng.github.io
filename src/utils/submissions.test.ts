import { describe, expect, it } from 'vitest';

import source from '../data/submissions/timeline.json';
import {
  formatSubmissionDate,
  parseSubmissionData,
  selectSubmissions,
  submissionMonthCounts,
  submissionTotals,
  submissionYears,
} from './submissions';

const dataset = () => structuredClone(source);

describe('submission timeline data', () => {
  it('reproduces the confirmed 2026 venue counts and date labels', () => {
    const data = parseSubmissionData(dataset());
    expect(submissionTotals(data.entries)).toEqual({ active: 11, first: 4, co: 7, papers: 11 });
    expect(data.entries.map((entry) => [entry.venue, entry.date, entry.dateType])).toEqual([
      ['AAAI 2027', '2026-07-29', 'deadline'],
      ['ICLR 2027', '2026-09-26', 'deadline'],
      ['TKDE', '2026-09-29', 'submitted'],
      ['WWW 2027', '2026-10-26', 'deadline'],
    ]);
    expect(submissionYears(data.entries)).toEqual([2026]);
  });
  it('rejects duplicate IDs instead of silently double counting a venue', () => {
    const data = dataset();
    data.entries[1].id = data.entries[0].id;
    expect(() => parseSubmissionData(data)).toThrow(/unique/);
  });
  it('validates real dates and uses the milestone year rather than conference edition', () => {
    const data = dataset();
    data.entries[0].date = '2026-02-30';
    expect(() => parseSubmissionData(data)).toThrow(/calendar date/);
    data.entries[0].date = '2026-07-29';
    data.entries[0].year = 2027;
    expect(() => parseSubmissionData(data)).toThrow(/milestone date/);
  });
  it('rejects negative, fractional, empty, and inconsistent totals', () => {
    const entry = dataset().entries[0];
    for (const change of [
      { firstAuthor: -1 },
      { coauthored: 1.5 },
      { active: 6 },
      { firstAuthor: 0, coauthored: 0, active: 0 },
    ])
      expect(() =>
        parseSubmissionData({ version: 1, entries: [{ ...entry, ...change }] }),
      ).toThrow();
    expect(() =>
      parseSubmissionData({ version: 1, entries: [{ ...entry, dateType: 'accepted' }] }),
    ).toThrow(/dateType/);
  });
  it('does not infer outcomes from an elapsed deadline or a future date', () => {
    const entries = parseSubmissionData(dataset()).entries;
    expect(submissionTotals(entries).active).toBe(11);
    const completed = entries.map((entry) => ({ ...entry, active: 0 }));
    expect(submissionTotals(completed)).toEqual({ active: 0, first: 4, co: 7, papers: 11 });
  });
});

describe('submission timeline views', () => {
  it('counts papers by month and preserves two separate September milestones', () => {
    const entries = parseSubmissionData(dataset()).entries;
    expect(selectSubmissions(entries, 2026, '09').map((entry) => entry.venue)).toEqual([
      'ICLR 2027',
      'TKDE',
    ]);
    expect(submissionMonthCounts(entries, 2026)).toEqual([0, 0, 0, 0, 0, 0, 5, 0, 5, 1, 0, 0]);
  });
  it('retains unknown dates explicitly without counting them in January', () => {
    const entry = { ...parseSubmissionData(dataset()).entries[0], date: null };
    const entries = parseSubmissionData({ version: 1, entries: [entry] }).entries;
    expect(selectSubmissions(entries, 2026, 'undated')).toHaveLength(1);
    expect(submissionMonthCounts(entries, 2026).reduce((a, b) => a + b, 0)).toBe(0);
    expect(formatSubmissionDate(null, 'en-US', 'Date pending')).toBe('Date pending');
  });
  it('separates years and keeps all same-day milestones in a busy year without mutating data', () => {
    const entry = parseSubmissionData(dataset()).entries[0];
    const entries = Array.from({ length: 120 }, (_, i) => ({
      ...entry,
      id: `venue-${String(i).padStart(3, '0')}`,
    }));
    const ids = entries.map((item) => item.id);
    expect(selectSubmissions(entries, 2026, '07')).toHaveLength(120);
    expect(selectSubmissions(entries, 2025)).toHaveLength(0);
    expect(submissionTotals(entries).papers).toBe(600);
    expect(submissionMonthCounts(entries, 2026)[6]).toBe(600);
    expect(entries.map((item) => item.id)).toEqual(ids);
  });
  it('formats complete uppercase calendar dates consistently across browser timezones', () => {
    expect(formatSubmissionDate('2026-07-29', 'en-US', 'Date pending')).toBe('JUL 29, 2026');
    expect(formatSubmissionDate('2026-01-01', 'en-US', 'Date pending')).toBe('JAN 01, 2026');
  });
});
