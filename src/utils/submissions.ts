export interface SubmissionMilestone {
  id: string;
  venue: string;
  year: number;
  date: string | null;
  dateType: 'deadline' | 'submitted';
  firstAuthor: number;
  coauthored: number;
  active: number;
}
export interface SubmissionData {
  version: 1;
  entries: SubmissionMilestone[];
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`${path}: expected an object.`);
  return value as Record<string, unknown>;
}
function text(value: unknown, path: string, max: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max)
    throw new Error(`${path}: enter 1–${max} characters.`);
  return value.trim();
}
function count(value: unknown, path: string): number {
  if (!Number.isInteger(value) || Number(value) < 0 || Number(value) > 10000)
    throw new Error(`${path}: enter a whole number from 0 to 10000.`);
  return Number(value);
}

/** Validate public venue totals without inventing paper titles or review outcomes. */
export function parseSubmissionData(value: unknown): SubmissionData {
  const source = record(value, 'timeline');
  if (source.version !== 1) throw new Error('timeline: version must be 1.');
  if (!Array.isArray(source.entries) || source.entries.length > 2000)
    throw new Error('timeline.entries: expected up to 2000 milestones.');
  const ids = new Set<string>();
  const entries = source.entries.map((item, index): SubmissionMilestone => {
    const path = `entries[${index}]`;
    const entry = record(item, path);
    const id = text(entry.id, `${path}.id`, 100);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id) || ids.has(id))
      throw new Error(`${path}.id: use a unique lowercase identifier.`);
    ids.add(id);
    if (!Number.isInteger(entry.year) || Number(entry.year) < 1900 || Number(entry.year) > 2200)
      throw new Error(`${path}.year: enter a year from 1900 to 2200.`);
    const year = Number(entry.year);
    let date: string | null = null;
    if (entry.date !== null) {
      if (typeof entry.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date))
        throw new Error(`${path}.date: use YYYY-MM-DD or null.`);
      const parsed = new Date(`${entry.date}T00:00:00Z`);
      if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== entry.date)
        throw new Error(`${path}.date: invalid calendar date.`);
      date = entry.date;
      if (Number(date.slice(0, 4)) !== year)
        throw new Error(`${path}.year: must match the milestone date, not the venue edition.`);
    }
    if (entry.dateType !== 'deadline' && entry.dateType !== 'submitted')
      throw new Error(`${path}.dateType: expected deadline or submitted.`);
    const firstAuthor = count(entry.firstAuthor, `${path}.firstAuthor`);
    const coauthored = count(entry.coauthored, `${path}.coauthored`);
    const active = count(entry.active, `${path}.active`);
    if (firstAuthor + coauthored === 0 || active > firstAuthor + coauthored)
      throw new Error(`${path}: include at least one paper; active cannot exceed the paper total.`);
    return {
      id,
      venue: text(entry.venue, `${path}.venue`, 200),
      year,
      date,
      dateType: entry.dateType,
      firstAuthor,
      coauthored,
      active,
    };
  });
  return { version: 1, entries };
}

export function submissionYears(entries: SubmissionMilestone[]): number[] {
  return [...new Set(entries.map((entry) => entry.year))].sort((a, b) => b - a);
}
export function selectSubmissions(entries: SubmissionMilestone[], year: number, month = 'all') {
  return entries
    .filter((entry) => entry.year === year)
    .filter(
      (entry) =>
        month === 'all' || (month === 'undated' ? !entry.date : entry.date?.slice(5, 7) === month),
    )
    .sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999') || a.id.localeCompare(b.id));
}
export function submissionTotals(entries: SubmissionMilestone[]) {
  return entries.reduce(
    (totals, entry) => ({
      active: totals.active + entry.active,
      first: totals.first + entry.firstAuthor,
      co: totals.co + entry.coauthored,
      papers: totals.papers + entry.firstAuthor + entry.coauthored,
    }),
    { active: 0, first: 0, co: 0, papers: 0 },
  );
}
export function submissionMonthCounts(entries: SubmissionMilestone[], year: number): number[] {
  const counts = Array<number>(12).fill(0);
  for (const entry of entries)
    if (entry.year === year && entry.date)
      counts[Number(entry.date.slice(5, 7)) - 1] += entry.firstAuthor + entry.coauthored;
  return counts;
}
export function formatSubmissionDate(
  value: string | null,
  locale: string,
  pending: string,
): string {
  if (!value) return pending;
  // Stored dates are calendar dates in the configured display zone, not UTC timestamps.
  return new Date(`${value}T00:00:00Z`)
    .toLocaleDateString(locale, {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    })
    .toUpperCase();
}
export function submissionTemplate(
  template: string,
  values: Record<string, number | string>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => String(values[key] ?? match));
}
