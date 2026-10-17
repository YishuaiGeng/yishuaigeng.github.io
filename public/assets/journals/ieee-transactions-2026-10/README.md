# IEEE Transactions journal directory snapshot

Checked: 2026-10-15.

- `directory.csv`: 115 recent-metadata journal records in the main directory.
- `watchlist.csv`: 21 records: 10 IEEE titles marked ESCI in the cited snapshots, 9 IEEE titles with unverified indexing, ACM TORS, and one future-year metadata record.
- `legacy.csv`: 62 legacy-title or archival metadata records. These records' latest metadata years are not verified cessation dates.
- `directory.json`: the same records, historical and future supplements, and source links. Journal identifiers and available publisher links are included.

CSV files use UTF-8 with a BOM for compatibility with Excel. Topic labels are editorial navigation aids, not official scope statements.

The main directory is derived from the IEEE Transactions name family in Crossref journal metadata, selecting records with latest issued years of 2025 or 2026, and merging the legacy IEEE/ACM Networking name into the IEEE Networking entry. IEEE/ASME Mechatronics and IEEE Latin America Transactions are included. Historical IRE/AIEE titles and IEEE Journal/Letters/Magazine titles are outside the scope. This is a reproducible retrieval inventory, not an IEEE-certified count of currently active journals.

Indexing fields retain their source versions: the public ShowJCR JCR2025 and XR2026 secondary datasets are linked at commit `4687a8f608f20aaf004299992f5d347dba009361`. Four ESCI entries were additionally checked against LetPub pages on the stated date. The molecular-communications title has conflicting LetPub pages for the same ISSN; the article explicitly records this conflict.

No record has been certified against the live Clarivate Master Journal List in this task. `current_mjl_verified: false` makes this limitation explicit. `未核实` means insufficient evidence in this retrieval, not proof that a journal is unindexed. Snapshot SCIE/ESCI/SSCI labels do not guarantee unchanged status on the checking date. Publisher-deposited Crossref metadata establishes publication identity, not citation-index inclusion.

Read the accompanying article at `/blog/ieee-transactions-journals-and-emerging-venues/` for methodology, scope, emerging-venue notes, and source limitations.
