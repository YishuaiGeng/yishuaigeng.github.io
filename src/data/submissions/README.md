# Submission timeline data

The public Publications page reads `timeline.json` from this folder. The bibliography stays in `../papers.bib`; this dataset stores **venue-level submission totals**, without unpublished paper titles.

The initial records reproduce the owner's confirmed 2026 reference: AAAI 2027 (5 papers), ICLR 2027 (4), TKDE (1), and WWW 2027 (1). Their dates and date labels are transcribed from that reference, not fetched from external venue calendars. The summary is 11 active, 4 first-author, and 7 co-authored papers.

Each record contains:

- `id`: unique lowercase identifier.
- `venue`: conference edition or journal name.
- `year`: calendar year of the displayed milestone, independent of the venue edition (AAAI 2027 has a 2026 deadline).
- `date`: `YYYY-MM-DD`, or `null` to display **Date pending**. Dates are calendar dates in the displayed UTC+8 zone.
- `dateType`: `deadline` or `submitted`. A deadline must not be displayed as a confirmed submission date.
- `firstAuthor`, `coauthored`: paper counts. The badge total is their sum; these categories must not overlap within a record.
- `active`: number of currently active papers in this group, between zero and its paper total. Outcomes are never inferred from elapsed time.

Use one record per venue/round. If the same paper appears in multiple attempts, the counters represent attempts rather than unique manuscripts.

Run `yarn dev` and open `/publications/`. **Manage submissions** opens the local browser editor for adding or correcting dates and counts. Browser edits persist locally. **Download JSON** exports `timeline.json`; replace this folder's file and publish the website to update the public page. The editor is only available during local development. **Import JSON** validates a saved dataset before replacing the draft. **Reset local draft** restores the source file served by the development server.

The public display matches the compact reference: timezone badge, annual totals, year selector, collapse control, chronological date nodes, venue names, paper-count badges, and authorship totals. Desktop milestones use readable spacing rather than a proportional duration scale. More than four venues can be scrolled horizontally; phones use a vertical timeline. Years above `overviewThreshold` venue records also show a monthly paper-count overview, month filtering, and a List view. The annual header totals stay fixed while filtering.

Configuration and all UI wording live in `site.publications.submissionTimeline`. `../../schemas/submissions.json` supplies editor hints; runtime validation additionally checks duplicate IDs, real dates, matching milestone years, and consistent counts.
