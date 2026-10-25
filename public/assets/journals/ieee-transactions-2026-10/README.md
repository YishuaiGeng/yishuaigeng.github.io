# IEEE / ACM Transactions journal directory

Updated: 2026-10-25 (Xinrui divisions added; indexing evidence retains its original dates).

| File             | Contents                                                                         |
| ---------------- | -------------------------------------------------------------------------------- |
| `directory.csv`  | Combined directory: 115 IEEE and 45 ACM journals                                 |
| `ieee.csv`       | IEEE directory, including IEEE/ASME Mechatronics                                 |
| `acm.csv`        | ACM directory                                                                    |
| `watchlist.csv`  | 22 ESCI entries, 14 entries with unconfirmed indexing, and one future-year title |
| `legacy.csv`     | 66 historical-title and archival records                                         |
| `directory.json` | All records with identifiers, dated indexing evidence, and source links          |

CSV files use UTF-8 with a BOM. Chinese subject labels support topic browsing; official journal scopes take precedence.

Ratings use CCF 2026 (7th edition, A/B/C), CAS 2025 broad-category divisions, and Xinrui 2026 broad-category divisions (1区–4区). They are stored separately as `ccf_rank`, `cas_quartile`, and `xinrui_quartile`, with edition years and matching source titles. CAS and Xinrui divisions are distinct from JCR quartiles; Xinrui 2026 must not be relabeled as CAS 2026. CCF and CAS retain the directory's existing SCIE-only display rule. Xinrui is matched independently against its own dataset and includes covered ESCI/SSCI journals. Missing ratings and historical/future titles remain empty.

The CCF source is `/assets/pdf/ccf-2026-v7.pdf`, cross-checked against `CCF2026-UTF8.csv`; CAS divisions use `FQBJCR2025-UTF8.csv`; Xinrui divisions use the `大类新锐分区` field of `XR2026-UTF8.csv`. The CSV sources are public secondary datasets from the pinned ShowJCR commit below. Exact source links, matched titles, ISSNs, and broad categories are retained in the CSV files and `directory.json`. `xinrui_checked_on` records the Xinrui verification date separately from indexing checks.

Regenerate the article and downloads with `python3 files/ieee-acm-transactions-2026-10/update_directory.py`, then format the generated Markdown and JSON with the repository's Yarn/Prettier tooling. The article source is `files/ieee-acm-transactions-2026-10/article-template.md`; ranking data snapshots are versioned under `files/`.

Titles and identifiers are based on publisher-deposited Crossref metadata, with the 2023 IEEE title list as an additional identity reference. The main directory covers recent publication records and is not an official certification of the publishers' current journal counts. Historical joint IEEE/ACM titles are retained in the legacy appendix without being counted again in the ACM main directory.

Index labels use the public JCR2025 and XR2026 secondary datasets at ShowJCR commit `4687a8f608f20aaf004299992f5d347dba009361`, with dated additional sources where available. `待确认` means insufficient indexing evidence, not proof of exclusion. Current index membership and coverage dates should be checked in Clarivate Master Journal List.

Article: `/blog/ieee-transactions-journals-and-emerging-venues/`.
