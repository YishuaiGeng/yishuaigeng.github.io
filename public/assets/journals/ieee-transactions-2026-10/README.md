# IEEE / ACM Transactions journal directory

Updated: 2026-10-17.

| File             | Contents                                                                         |
| ---------------- | -------------------------------------------------------------------------------- |
| `directory.csv`  | Combined directory: 115 IEEE and 45 ACM journals                                 |
| `ieee.csv`       | IEEE directory, including IEEE/ASME Mechatronics                                 |
| `acm.csv`        | ACM directory                                                                    |
| `watchlist.csv`  | 22 ESCI entries, 14 entries with unconfirmed indexing, and one future-year title |
| `legacy.csv`     | 66 historical-title and archival records                                         |
| `directory.json` | All records with identifiers, dated indexing evidence, and source links          |

CSV files use UTF-8 with a BOM. Chinese subject labels support topic browsing; official journal scopes take precedence.

Ratings use CCF 2026 (7th edition, A/B/C) and CAS 2025 broad-category divisions (1区–4区). They are stored separately as `ccf_rank` and `cas_quartile`, with edition years and matching source titles. CAS divisions are not JCR quartiles. Per the directory's display rule, both rating fields remain empty for non-SCIE or unconfirmed journals, even if a CCF listing exists; missing ratings and historical/future titles are also left empty.

The CCF source is `/assets/pdf/ccf-2026-v7.pdf`, cross-checked against `CCF2026-UTF8.csv`; CAS divisions use `FQBJCR2025-UTF8.csv`. The CSV sources are public secondary datasets from the pinned ShowJCR commit below. Exact source links and the matched CAS broad category are retained in `directory.json`.

Titles and identifiers are based on publisher-deposited Crossref metadata, with the 2023 IEEE title list as an additional identity reference. The main directory covers recent publication records and is not an official certification of the publishers' current journal counts. Historical joint IEEE/ACM titles are retained in the legacy appendix without being counted again in the ACM main directory.

Index labels use the public JCR2025 and XR2026 secondary datasets at ShowJCR commit `4687a8f608f20aaf004299992f5d347dba009361`, with dated additional sources where available. `待确认` means insufficient indexing evidence, not proof of exclusion. Current index membership and coverage dates should be checked in Clarivate Master Journal List.

Article: `/blog/ieee-transactions-journals-and-emerging-venues/`.
