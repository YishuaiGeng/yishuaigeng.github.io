"""Render the submission-planning note and downloadable venue pool from audited data."""
import csv
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = ROOT / 'public/assets/journals/research-submission-plan-2026-10'
audit = json.loads((HERE / 'rankings.json').read_text())
guidance = {}
for line in (HERE / 'guidance.txt').read_text().splitlines():
    if not line or line.startswith('#'):
        continue
    kind, abbr, group, role, status, url, fit = line.split('|', 6)
    key = (kind, abbr)
    assert key not in guidance, key
    guidance[key] = dict(group=group, role=role, scope_status=status, scope_url=url, fit=fit)

venues = []
for kind, entries in [('journal', audit['venues']), ('conference', audit['conferences'])]:
    for entry in entries:
        key = (kind, entry['abbreviation'])
        venues.append({'kind': kind, **entry, **guidance.pop(key)})
assert not guidance, guidance


def ccf(v):
    ranks = sorted({r['rank'] for r in v['ccf_2026']})
    return '/'.join(ranks) or '未列'


def division(v, scheme):
    return '；'.join(f"{c['name']} {c['division']}区" for r in v.get(scheme, [])
                    for c in r['broad_categories']) or '未匹配'


def jcr(v, full=False):
    rows = [c for r in v.get('jcr_2025', []) for c in r['categories']]
    if full:
        return '；'.join(f"{c['category']} {c['quartile']}" for c in rows) or '未匹配'
    return '/'.join(sorted({c['quartile'] for c in rows})) or '未匹配'


def label(v):
    marker = ' †' if v['scope_status'] != 'verified' else ''
    return f"[{v['abbreviation']}]({v['scope_url']}){marker}"


def journal_table(group):
    rows = ['| 期刊 | CCF 2026 | 中科院 2025 大类 | 新锐 2026 大类 | JCR 各学科 Q | 投稿定位 |',
            '|---|---|---|---|---|---|']
    for v in venues:
        if v['kind'] == 'journal' and v['group'] == group:
            rows.append(f"| {label(v)} | {ccf(v)} | {division(v, 'cas_2025')} | {division(v, 'xinrui_2026')} | {jcr(v)} | **{v['role']}**：{v['fit']} |")
    return '\n'.join(rows)


def conference_table(group):
    rows = ['| 会议 | CCF 2026 | 定位与适合的贡献 |', '|---|---|---|']
    for v in venues:
        if v['kind'] == 'conference' and v['group'] == group:
            rows.append(f"| {label(v)} | {ccf(v)} | **{v['role']}**：{v['fit']} |")
    return '\n'.join(rows)


OUT.mkdir(parents=True, exist_ok=True)
payload = {
    'updated_on': audit['checked_on'],
    'purpose': '神经符号约束推理/求解器反馈与自编码器推荐的投稿规划；适配与优先级为研究建议，不代表接收概率或学位认定。',
    'ccf_edition': audit['ccf_edition'],
    'jcr_edition': audit['jcr_edition'],
    'ranking_sources': audit['ranking_sources'],
    'scope_note': 'verified 表示本次读到官方范围/CFP；scope_pending 表示条件候选，尚需复核范围或当届入口。历史 CFP 用于判断主题，不表示当前开放。',
    'index_note': '索引来自有日期的二次快照；未完成所有期刊当前 Clarivate MJL 实时复核。',
    'counts': {'journals': sum(v['kind'] == 'journal' for v in venues),
               'conferences': sum(v['kind'] == 'conference' for v in venues)},
    'venues': venues,
}
(OUT / 'venues.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')
fields = ['kind', 'abbreviation', 'name', 'issns', 'group', 'role', 'ccf_2026',
          'cas_2025_broad', 'xinrui_2026_broad', 'jcr_2025_metric_year_all_subjects',
          'index_snapshot', 'fit', 'scope_status', 'scope_url', 'ranking_sources', 'checked_on']
with (OUT / 'venues.csv').open('w', encoding='utf-8-sig', newline='') as stream:
    writer = csv.DictWriter(stream, fields, lineterminator='\n')
    writer.writeheader()
    for v in venues:
        sources = {r['source_url'] for key in ['ccf_2026', 'cas_2025', 'xinrui_2026', 'jcr_2025']
                   for r in v.get(key, [])}
        writer.writerow(dict(kind=v['kind'], abbreviation=v['abbreviation'], name=v['name'],
                             issns=' / '.join(v.get('issns', [])), group=v['group'], role=v['role'],
                             ccf_2026=ccf(v), cas_2025_broad=division(v, 'cas_2025') if v['kind']=='journal' else '不适用',
                             xinrui_2026_broad=division(v, 'xinrui_2026') if v['kind']=='journal' else '不适用',
                             jcr_2025_metric_year_all_subjects=jcr(v, full=True) if v['kind']=='journal' else '不适用',
                             index_snapshot=v.get('indexing', {}).get('label', '不适用'),
                             fit=v['fit'], scope_status=v['scope_status'], scope_url=v['scope_url'],
                             ranking_sources='；'.join(sorted(sources)), checked_on=audit['checked_on']))

template = (HERE / 'article-template.md').read_text()
for group in ['logic', 'learning', 'recommendation', 'special']:
    template = template.replace('{{JOURNALS_' + group.upper() + '}}', journal_table(group))
for group in ['phd', 'recommendation', 'adjacent']:
    template = template.replace('{{CONFERENCES_' + group.upper() + '}}', conference_table(group))
assert '{{' not in template
(ROOT / 'src/content/blogs/research-submission-roadmap.md').write_text(template)
print(payload['counts'])
