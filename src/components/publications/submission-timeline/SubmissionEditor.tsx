import type { FormEvent } from 'react';
import { useId, useRef, useState } from 'react';

import type { SubmissionData, SubmissionMilestone } from '../../../utils/submissions';
import { parseSubmissionData } from '../../../utils/submissions';
import type { TimelineConfig } from './SubmissionTimeline';

interface Props {
  data: SubmissionData;
  initialData: SubmissionData;
  config: TimelineConfig;
  onChange: (data: SubmissionData) => void;
}
interface Draft {
  venue: string;
  year: string;
  date: string;
  dateType: SubmissionMilestone['dateType'];
  firstAuthor: string;
  coauthored: string;
  active: string;
}
const emptyDraft = (): Draft => ({
  venue: '',
  year: String(new Date().getFullYear()),
  date: '',
  dateType: 'deadline',
  firstAuthor: '0',
  coauthored: '0',
  active: '0',
});

export default function SubmissionEditor({ data, initialData, config, onChange }: Props) {
  const uid = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [id, setId] = useState('');
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [deleted, setDeleted] = useState<SubmissionMilestone | null>(null);
  const copy = config.editor;

  function choose(value: string) {
    setId(value);
    setError('');
    setNotice('');
    const entry = data.entries.find((item) => item.id === value);
    setDraft(
      entry
        ? {
            venue: entry.venue,
            year: String(entry.year),
            date: entry.date ?? '',
            dateType: entry.dateType,
            firstAuthor: String(entry.firstAuthor),
            coauthored: String(entry.coauthored),
            active: String(entry.active),
          }
        : emptyDraft(),
    );
  }
  function change<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }
  function save(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const entry = {
        id: id || `milestone-${crypto.randomUUID()}`,
        venue: draft.venue,
        year: Number(draft.year),
        date: draft.date || null,
        dateType: draft.dateType,
        firstAuthor: Number(draft.firstAuthor),
        coauthored: Number(draft.coauthored),
        active: Number(draft.active),
      };
      const next = parseSubmissionData({
        ...data,
        entries: id
          ? data.entries.map((item) => (item.id === id ? entry : item))
          : [...data.entries, entry],
      });
      onChange(next);
      setId(entry.id);
      setNotice(copy.saved);
    } catch (error) {
      setError(error instanceof Error ? error.message : copy.invalidImport);
    }
  }
  function remove() {
    const entry = data.entries.find((item) => item.id === id);
    if (!entry) return;
    setDeleted(entry);
    onChange({ ...data, entries: data.entries.filter((item) => item.id !== id) });
    choose('');
    setNotice(copy.removed);
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob(
        [JSON.stringify({ $schema: '../../schemas/submissions.json', ...data }, null, 2) + '\n'],
        { type: 'application/json' },
      ),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'timeline.json';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importFile(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;
    setError('');
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error(copy.fileTooLarge);
      const next = parseSubmissionData(JSON.parse(await file.text()));
      onChange(next);
      choose('');
      setDeleted(null);
      setNotice(copy.imported);
    } catch (error) {
      setError(`${copy.invalidImport} ${error instanceof Error ? error.message : ''}`);
    }
    input.value = '';
  }

  return (
    <section className="st-editor" aria-labelledby={`${uid}-heading`}>
      <h3 id={`${uid}-heading`}>{copy.title}</h3>
      <p>{copy.description}</p>
      <div className="st-editor-actions">
        <button type="button" onClick={download}>
          {copy.download}
        </button>
        <button type="button" onClick={() => fileInput.current?.click()}>
          {copy.import}
        </button>
        <input
          ref={fileInput}
          type="file"
          hidden
          aria-label={copy.import}
          accept=".json,application/json"
          onChange={(event) => void importFile(event.currentTarget)}
        />
        <button
          type="button"
          onClick={() => {
            onChange(initialData);
            choose('');
            setDeleted(null);
            setNotice(copy.resetDone);
          }}
        >
          {copy.reset}
        </button>
      </div>
      {error && (
        <p role="alert" className="st-error">
          {error}
        </p>
      )}
      <div role="status" className="st-editor-notice">
        {notice}
        {deleted && (
          <button
            type="button"
            onClick={() => {
              onChange(parseSubmissionData({ ...data, entries: [...data.entries, deleted] }));
              setDeleted(null);
              setNotice(copy.saved);
            }}
          >
            {copy.undo}
          </button>
        )}
      </div>
      <label className="st-editor-select">
        {copy.chooseMilestone}
        <select value={id} onChange={(event) => choose(event.target.value)}>
          <option value="">{copy.newMilestone}</option>
          {data.entries.map((entry) => (
            <option value={entry.id} key={entry.id}>
              {entry.venue} · {entry.date ?? config.labels.datePending}
            </option>
          ))}
        </select>
      </label>
      <form onSubmit={save} className="st-editor-form">
        <label className="st-wide">
          {copy.venue}
          <input
            required
            maxLength={200}
            value={draft.venue}
            onChange={(event) => change('venue', event.target.value)}
          />
        </label>
        <label>
          {copy.year}
          <input
            required
            type="number"
            min={1900}
            max={2200}
            value={draft.year}
            onChange={(event) => change('year', event.target.value)}
          />
        </label>
        <label>
          {copy.date}
          <input
            type="date"
            value={draft.date}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                date: event.target.value,
                ...(event.target.value ? { year: event.target.value.slice(0, 4) } : {}),
              }))
            }
          />
        </label>
        <label>
          {copy.dateType}
          <select
            value={draft.dateType}
            onChange={(event) => change('dateType', event.target.value as Draft['dateType'])}
          >
            <option value="deadline">{config.labels.deadline}</option>
            <option value="submitted">{config.labels.submitted}</option>
          </select>
        </label>
        {(['firstAuthor', 'coauthored', 'active'] as const).map((key) => (
          <label key={key}>
            {copy[key]}
            <input
              required
              type="number"
              min={0}
              max={10000}
              step={1}
              value={draft[key]}
              onChange={(event) => change(key, event.target.value)}
            />
          </label>
        ))}
        <div className="st-wide st-editor-actions">
          <button type="submit" className="st-primary">
            {copy.save}
          </button>
          {id && (
            <button type="button" className="st-delete" onClick={remove}>
              {copy.remove}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
