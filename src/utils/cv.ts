/**
 * CV data types and parsing utilities.
 *
 * Supports two formats:
 *   'rendercv'   — src/data/cv.yml  (RenderCV YAML format)
 *   'jsonresume' — src/data/resume.json  (JSONResume schema v1)
 */

// ─── RenderCV types ──────────────────────────────────────────────────────────

export interface RenderCVEntry {
  institution?: string;
  company?: string;
  position?: string;
  area?: string;
  degree?: string;
  logo?: string;
  title?: string;
  authors?: string[];
  doi?: string;
  date?: string | number;
  start_date?: string | number;
  end_date?: string | number | 'present';
  location?: string;
  journal?: string;
  publisher?: string;
  url?: string;
  highlights?: string[];
  name?: string;
  issuer?: string;
  level?: string;
  prize?: string;
  label?: string;
  details?: string;
}

export interface RenderCV {
  cv: {
    name: string;
    location?: string;
    email?: string;
    phone?: string;
    website?: string;
    date_of_birth?: string;
    hometown?: string;
    summary?: string;
    social_networks?: Array<{ network: string; username: string }>;
    sections: {
      education?: RenderCVEntry[];
      experience?: RenderCVEntry[];
      publications?: RenderCVEntry[];
      patents?: RenderCVEntry[];
      conferences?: RenderCVEntry[];
      honors?: RenderCVEntry[];
      awards?: RenderCVEntry[];
      competitions?: RenderCVEntry[];
      academic_service?: RenderCVEntry[];
      skills?: RenderCVEntry[];
      languages?: RenderCVEntry[];
      interests?: RenderCVEntry[];
      [key: string]: RenderCVEntry[] | undefined;
    };
  };
}

// ─── JSONResume types ────────────────────────────────────────────────────────

export interface JSONResumeWork {
  name?: string;
  position?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
}

export interface JSONResumeEducation {
  institution?: string;
  url?: string;
  area?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
  score?: string;
  courses?: string[];
}

export interface JSONResumeAward {
  title?: string;
  date?: string;
  awarder?: string;
  summary?: string;
}

export interface JSONResumePublication {
  name?: string;
  publisher?: string;
  releaseDate?: string;
  url?: string;
  summary?: string;
}

export interface JSONResumeSkill {
  name?: string;
  level?: string;
  keywords?: string[];
}

export interface JSONResumeLanguage {
  language?: string;
  fluency?: string;
}

export interface JSONResumeInterest {
  name?: string;
  keywords?: string[];
}

export interface JSONResume {
  basics?: {
    name?: string;
    label?: string;
    email?: string;
    phone?: string;
    url?: string;
    summary?: string;
    location?: {
      address?: string;
      postalCode?: string;
      city?: string;
      countryCode?: string;
      region?: string;
    };
    profiles?: Array<{ network?: string; username?: string; url?: string }>;
  };
  work?: JSONResumeWork[];
  education?: JSONResumeEducation[];
  awards?: JSONResumeAward[];
  publications?: JSONResumePublication[];
  skills?: JSONResumeSkill[];
  languages?: JSONResumeLanguage[];
  interests?: JSONResumeInterest[];
}

// ─── Utilities ───────────────────────────────────────────────────────────────

/** Format a date string or number as "Month Year" or just "Year". */
export function formatCVDate(d: string | number | undefined): string {
  if (!d || d === 'present') return d === 'present' ? 'Present' : '';
  const str = String(d);
  // ISO: 2025-01 or 2025-01-01
  const isoMatch = str.match(/^(\d{4})(?:-(\d{2}))?/);
  if (isoMatch) {
    const [, year, month] = isoMatch;
    if (month) {
      const date = new Date(Number(year), Number(month) - 1);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }
    return year;
  }
  return str;
}

/** Format a date range like "Jan 2020 – Present". */
export function formatDateRange(
  start: string | number | undefined,
  end: string | number | undefined,
): string {
  if (!start && !end) return '';
  const s = formatCVDate(start);
  const e = end === 'present' || (!end && !!start) ? 'Present' : formatCVDate(end);
  if (!s && !e) return '';
  if (!s) return e;
  if (!e || s === e) return s;
  return `${s} \u2013 ${e}`;
}

function cvDateSortValue(date: string | number | undefined): number {
  if (date === 'present') return Number.POSITIVE_INFINITY;
  if (date === undefined || date === '') return Number.NEGATIVE_INFINITY;

  const match = String(date).match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/);
  if (!match) return Number.NEGATIVE_INFINITY;

  const [, year, month = '12', day = '31'] = match;
  return Number(year) * 10_000 + Number(month) * 100 + Number(day);
}

/** Return a copy of CV entries sorted from most recent to oldest. */
export function sortCVEntriesByDate(entries: RenderCVEntry[]): RenderCVEntry[] {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const dateFor = (entry: RenderCVEntry) => {
        if (entry.date !== undefined) return entry.date;
        if (entry.end_date !== undefined) return entry.end_date;
        if (entry.start_date !== undefined) return 'present';
        return undefined;
      };

      const difference = cvDateSortValue(dateFor(b.entry)) - cvDateSortValue(dateFor(a.entry));
      return Number.isNaN(difference) || difference === 0 ? a.index - b.index : difference;
    })
    .map(({ entry }) => entry);
}
