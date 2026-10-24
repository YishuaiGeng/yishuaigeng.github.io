import './submission-timeline.css';

import { lazy, Suspense, useEffect, useId, useState } from 'react';

import type { SiteConfig } from '../../../config/site';
import type { SubmissionData, SubmissionMilestone } from '../../../utils/submissions';
import {
  formatSubmissionDate,
  parseSubmissionData,
  selectSubmissions,
  submissionMonthCounts,
  submissionTemplate,
  submissionTotals,
  submissionYears,
} from '../../../utils/submissions';

const SubmissionEditor = lazy(() => import('./SubmissionEditor'));
export type TimelineConfig = SiteConfig['publications']['submissionTimeline'];
interface Props {
  data: SubmissionData;
  config: TimelineConfig;
  allowEditing?: boolean;
}
const storageKey = 'submission-venue-timeline-draft-v1';

export default function SubmissionTimeline({
  data: initialData,
  config,
  allowEditing = false,
}: Props) {
  const uid = useId();
  const [data, setData] = useState(initialData);
  const [ready, setReady] = useState(false);
  const [year, setYear] = useState(
    submissionYears(initialData.entries)[0] ?? new Date().getFullYear(),
  );
  const [expanded, setExpanded] = useState<boolean>(config.initiallyExpanded);
  const [month, setMonth] = useState('all');
  const [view, setView] = useState<'timeline' | 'list'>('timeline');
  const [editing, setEditing] = useState(false);
  const { labels } = config;

  useEffect(() => {
    if (!allowEditing) return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const restored = parseSubmissionData(JSON.parse(stored));
        setData(restored);
        setYear(submissionYears(restored.entries)[0] ?? new Date().getFullYear());
      }
    } catch {
      /* Invalid browser drafts must not prevent the source dataset from rendering. */
    }
    setReady(true);
  }, [allowEditing]);
  useEffect(() => {
    if (!allowEditing || !ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      /* JSON export is still available if browser storage is unavailable. */
    }
  }, [data, allowEditing, ready]);

  const years = submissionYears(data.entries);
  if (!years.includes(year)) years.unshift(year);
  const yearEntries = selectSubmissions(data.entries, year);
  const entries = selectSubmissions(data.entries, year, month);
  const totals = submissionTotals(yearEntries);
  const monthCounts = submissionMonthCounts(data.entries, year);
  const undated = submissionTotals(yearEntries.filter((entry) => !entry.date)).papers;
  const busy = yearEntries.length > config.overviewThreshold;
  const localDraft = allowEditing && JSON.stringify(data) !== JSON.stringify(initialData);

  function replaceData(next: SubmissionData) {
    setData(next);
    if (!next.entries.some((entry) => entry.year === year))
      setYear(submissionYears(next.entries)[0] ?? year);
    setMonth('all');
    setView('timeline');
  }
  function authorship(entry: SubmissionMilestone) {
    return [
      entry.firstAuthor ? submissionTemplate(labels.firstAuthor, { count: entry.firstAuthor }) : '',
      entry.coauthored ? submissionTemplate(labels.coauthored, { count: entry.coauthored }) : '',
    ]
      .filter(Boolean)
      .join(' · ');
  }

  return (
    <section className="submission-timeline" aria-labelledby={`${uid}-title`}>
      <header className="st-header">
        <div className="st-heading">
          <h2 id={`${uid}-title`}>{labels.title}</h2>
          <span className="st-zone">{config.timeZoneLabel}</span>
          {localDraft && <span className="st-zone">{labels.localDraft}</span>}
        </div>
        <div className="st-header-controls">
          <span className="st-summary">{submissionTemplate(labels.summary, totals)}</span>
          <label className="st-sr-only" htmlFor={`${uid}-year`}>
            {labels.year}
          </label>
          <select
            id={`${uid}-year`}
            value={year}
            onChange={(event) => {
              setYear(Number(event.target.value));
              setMonth('all');
              setView('timeline');
            }}
          >
            {years.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <button
            type="button"
            className="st-icon-button"
            aria-label={expanded ? labels.collapse : labels.expand}
            aria-expanded={expanded}
            aria-controls={`${uid}-body`}
            onClick={() => setExpanded(!expanded)}
          >
            <span className={expanded ? 'st-chevron is-open' : 'st-chevron'} aria-hidden="true" />
          </button>
        </div>
      </header>
      <div id={`${uid}-body`} hidden={!expanded}>
        {busy && (
          <div className="st-overview">
            <div className="st-overview-heading">
              <span>{labels.overview}</span>
              <div className="st-view-switch" role="group" aria-label={labels.view}>
                {(['timeline', 'list'] as const).map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    aria-pressed={view === mode}
                    onClick={() => setView(mode)}
                  >
                    {labels[mode]}
                  </button>
                ))}
              </div>
            </div>
            <div className="st-months" role="group" aria-label={labels.overview}>
              <button type="button" aria-pressed={month === 'all'} onClick={() => setMonth('all')}>
                {labels.allMonths}
                <strong>{totals.papers}</strong>
              </button>
              {config.months.map((label, index) => {
                const value = String(index + 1).padStart(2, '0');
                return (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={month === value}
                    disabled={!monthCounts[index]}
                    onClick={() => setMonth(value)}
                  >
                    <span>{label}</span>
                    <strong>{monthCounts[index]}</strong>
                  </button>
                );
              })}
              {undated > 0 && (
                <button
                  type="button"
                  aria-pressed={month === 'undated'}
                  onClick={() => setMonth('undated')}
                >
                  {labels.datePending}
                  <strong>{undated}</strong>
                </button>
              )}
            </div>
          </div>
        )}
        {entries.length === 0 ? (
          <p className="st-empty">{labels.empty}</p>
        ) : (
          // Keyboard users must be able to focus and scroll a long timeline.
          <div
            className={`st-scroll st-${view}`}
            role="region"
            aria-label={labels[view]}
            tabIndex={view === 'timeline' && entries.length > 4 ? 0 : undefined}
          >
            <ol className="st-entries">
              {entries.map((entry) => {
                const papers = entry.firstAuthor + entry.coauthored;
                return (
                  <li key={entry.id} className="st-entry">
                    <div className="st-date-block">
                      <time dateTime={entry.date ?? undefined}>
                        {formatSubmissionDate(entry.date, config.locale, labels.datePending)}
                      </time>
                      <span className="st-date-type">{labels[entry.dateType]}</span>
                    </div>
                    <span className="st-node" aria-hidden="true" />
                    <div className="st-venue">
                      <div className="st-venue-heading">
                        <h3>{entry.venue}</h3>
                        <span className="st-paper-count">
                          {submissionTemplate(papers === 1 ? labels.paper : labels.papers, {
                            count: papers,
                          })}
                        </span>
                      </div>
                      <p className="st-authorship">{authorship(entry)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
        {entries.length > 4 && view === 'timeline' && (
          <p className="st-hint">{labels.scrollHint}</p>
        )}
        {allowEditing && (
          <div className="st-local-tools">
            <button type="button" aria-expanded={editing} onClick={() => setEditing(!editing)}>
              {labels.manage}
            </button>
          </div>
        )}
        {allowEditing && editing && (
          <Suspense fallback={<p>{labels.loading}</p>}>
            <SubmissionEditor
              data={data}
              initialData={initialData}
              config={config}
              onChange={replaceData}
            />
          </Suspense>
        )}
      </div>
    </section>
  );
}
