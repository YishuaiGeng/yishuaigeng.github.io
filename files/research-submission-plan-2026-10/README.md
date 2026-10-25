# Research submission planning notebook

Checked on 2026-10-25. The research brief asks (1) which venues fit neuro-symbolic constraint reasoning, solver feedback and explicit-rating recommendation; (2) which ranking edition, identity and subject each label refers to; (3) how to route manuscripts and maintain a publication portfolio.

`rankings.json` records the independent identity/ranking audit: 36 journals and 37 conferences. CCF is the official 2026 seventh edition, revised 2026-04-09. The official PDF was downloaded and compared with the existing site PDF; the extracted-text difference is the corrected World Wide Web journal title on p68. Publication categories and audit page references are preserved. The pinned ShowJCR snapshots were matched using ISSN plus title checks; full CAS/Xinrui broad categories and JCR subject quartiles are retained. JCR uses the source's 2025 metric / 2026 release description, not a presumed release year based on the filename.

`guidance.txt` stores scope links, explicit verification status, venue groups and editorial fit judgments. `verified` means the official publisher/society scope or CFP was read. `scope_pending` is a conditional recommendation or an adjacent venue whose current scope/CFP still needs checking. Historical CFPs establish topical fit, not an open submission window. Fit, role and priorities are advice rather than publisher promises, acceptance probabilities or degree certification. Elsevier Shop and society pages were used when the main scope page was blocked.

`article-template.md` is the narrative source. Generate the public note and CSV/JSON with:

```sh
python3 files/research-submission-plan-2026-10/build.py
yarn prettier --write src/content/blogs/research-submission-roadmap.md public/assets/journals/research-submission-plan-2026-10/venues.json
yarn build
```

Downloads are in `public/assets/journals/research-submission-plan-2026-10/`. CSV uses UTF-8 BOM and LF. No degree-policy PDF, private applicability checklist or personal degree-eligibility assessment is included in the public dataset. The user's supplied policy is reviewed in a separate local note in their doctoral-study directory.

Venue tables and narrative sections intentionally serve practical planning rather than a full literature survey. Representative papers were verified at metadata/abstract level, with title-only use stated for the two KBS/IPM publication examples. No experiments were reproduced, and scope evidence cannot establish acceptance chances or current degree eligibility.
