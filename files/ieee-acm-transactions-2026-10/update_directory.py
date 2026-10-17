"""Build the combined Transactions catalogue and its public article."""
import csv
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OUT = ROOT / 'public/assets/journals/ieee-transactions-2026-10'
DATE = '2026-10-17'
base = json.loads((HERE / 'ieee-base.json').read_text(encoding='utf8'))
acm_source = json.loads((HERE / 'acm-titles.json').read_text(encoding='utf8'))

topic_lines = '''
AI for Science|科学人工智能
Accessible Computing|无障碍计算
Algorithms|算法
Applied Perception|应用感知
Architecture and Code Optimization|体系结构与代码优化
Asian and Low-Resource Language Information Processing|亚洲与低资源语言处理
Autonomous and Adaptive Systems|自主与自适应系统
Computation Theory|计算理论
Computational Logic|计算逻辑
Computer Systems|计算机系统
Computer-Human Interaction|人机交互
Computing Education|计算教育
Computing for Healthcare|医疗健康计算
Cyber-Physical Systems|信息物理系统
Database Systems|数据库系统
Design Automation of Electronic Systems|电子系统设计自动化
Economics and Computation|经济学与计算
Embedded Computing Systems|嵌入式计算系统
Evolutionary Learning and Optimization|进化学习与优化
Graphics|计算机图形学
Human-Robot Interaction|人机协作与机器人交互
Information Systems|信息系统与检索
Intelligent Systems and Technology|智能系统与技术
Interactive Intelligent Systems|交互式智能系统
Internet Technology|互联网技术
Internet of Things|物联网
Knowledge Discovery from Data|数据挖掘与知识发现
Management Information Systems|管理信息系统
Mathematical Software|数学软件
Modeling and Computer Simulation|建模与计算机仿真
Modeling and Performance Evaluation of Computing Systems|计算系统建模与性能评价
Multimedia Computing Communications and Applications|多媒体计算、通信与应用
Parallel Computing|并行计算
Privacy and Security|隐私与安全
Probabilistic Machine Learning|概率机器学习
Programming Languages and Systems|程序设计语言与系统
Quantum Computing|量子计算
Recommender Systems|推荐系统
Reconfigurable Technology and Systems|可重构技术与系统
Sensor Networks|传感器网络
Social Computing|社会计算
Software Engineering and Methodology|软件工程与方法学
Spatial Algorithms and Systems|空间算法与系统
Storage|存储系统
the Web|Web 技术
'''
TOPICS = dict(line.split('|') for line in topic_lines.strip().splitlines())


def prepare_ieee(record):
    result = dict(record)
    result['publisher_group'] = 'IEEE'
    result['index_checked_on'] = result.pop('checked_on')
    result['catalogue_updated_on'] = DATE
    result['index_status'] = result['index_status'].replace('未核实', '待确认')
    return result


ieee = [prepare_ieee(record) for record in base['journals']]
legacy = [prepare_ieee(record) for record in base['legacy']]
future = [prepare_ieee(record) for record in base['future']]
acm = []
acm_legacy = {}
for record in acm_source:
    # Match publisher identity as well as the name. Joint IEEE titles are already
    # accounted for above; similarly named third-party publishers are excluded.
    if 'Association for Computing Machinery' not in record['publisher']:
        continue
    recent = (record['last_year'] or 0) >= 2025
    jcr, xr = record['jcr'], record['xr']
    identifiers = list(dict.fromkeys(record['issn']))
    # Crossref has additional, unrelated ISSNs in some journal records.
    # Prefer the title-matched index entry where available, never a loose ISSN join.
    if jcr:
        identifiers = list(dict.fromkeys(v for v in [jcr['ISSN'], jcr['EISSN']] if v and v != 'N/A'))
    status = jcr['Web of Science'] if jcr else '待确认'
    if 'SCIE' in status and 'SSCI' in status:
        status = 'SCIE + SSCI'
    result = {
        'title': record['title'],
        'crossref_title': record['title'],
        'publisher_group': 'ACM',
        'publisher': record['publisher'],
        'issn': identifiers,
        'topic_zh': TOPICS.get(record['title'].removeprefix('ACM Transactions on '), ''),
        'latest_issue_year_in_crossref': record['last_year'],
        'metadata_url': f'https://api.crossref.org/journals/{identifiers[-1]}',
        'publisher_page': None,
        'jcr_2025_snapshot': jcr['Web of Science'] if jcr else None,
        'xr_2026_snapshot': xr['数据库'] if xr else None,
        'index_status': status,
        'index_sources': ([base['sources']['jcr_2025_secondary']] if jcr else []) + ([base['sources']['xr_2026_secondary']] if xr else []),
        'index_checked_on': DATE,
        'catalogue_updated_on': DATE,
        'current_mjl_verified': False,
        'catalogue_group': 'recent_metadata_main_directory' if recent else 'legacy_or_archival_metadata',
    }
    if recent:
        assert result['topic_zh'], record['title']
        acm.append(result)
    elif result['title'] in acm_legacy:
        existing = acm_legacy[result['title']]
        existing['issn'] = list(dict.fromkeys(existing['issn'] + identifiers))
        existing['latest_issue_year_in_crossref'] = max(existing['latest_issue_year_in_crossref'] or 0, record['last_year'] or 0) or None
    else:
        acm_legacy[result['title']] = result

legacy += list(acm_legacy.values())
all_journals = ieee + acm
watch = [record for record in all_journals if record['index_status'] in ['ESCI', '待确认']] + future
payload = {
    'catalogue_updated_on': DATE,
    'scope': 'IEEE、IEEE/ASME、IEEE Latin America 与 ACM Transactions 名称族；历史联合题名另列。主目录依据 2025/2026 出版元数据编制，不是出版社实时在刊总数认证。',
    'index_note': '收录状态依据 2025/2026 二次资料，逐条保留来源与核对日期。待确认不等于未收录；当前状态以 Clarivate MJL 为准。',
    'sources': {**base['sources'], 'acm_crossref': 'https://api.crossref.org/journals?query=ACM&rows=1000'},
    'counts': {'IEEE': len(ieee), 'ACM': len(acm), 'total': len(all_journals), 'index_status': dict(Counter(record['index_status'] for record in all_journals))},
    'journals': all_journals, 'legacy': legacy, 'future': future,
}
(OUT / 'directory.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf8')


def write_csv(name, records):
    fields = ['publisher_group', 'title', 'issn', 'topic_zh', 'index_status', 'jcr_2025_snapshot', 'xr_2026_snapshot', 'index_checked_on', 'catalogue_updated_on', 'current_mjl_verified', 'metadata_url', 'publisher_page', 'index_sources', 'catalogue_group']
    with (OUT / name).open('w', encoding='utf-8-sig', newline='') as stream:
        writer = csv.DictWriter(stream, fields, extrasaction='ignore')
        writer.writeheader()
        for record in records:
            writer.writerow({key: '; '.join(value) if isinstance(value, list) else value for key, value in record.items() if key in fields})


write_csv('directory.csv', all_journals)
write_csv('ieee.csv', ieee)
write_csv('acm.csv', acm)
write_csv('watchlist.csv', watch)
write_csv('legacy.csv', legacy)


def table(records):
    lines = ['| 序号 | 期刊全称 | 研究方向 | ISSN | 收录状态 |', '|---|---|---|---|---|']
    for i, record in enumerate(records, 1):
        lines.append(f"| {i} | {record['title']} | {record['topic_zh']} | [{record['issn'][-1]}]({record['metadata_url']}) | {record['index_status']} |")
    return '<div style="overflow-x: auto;">\n<div style="min-width: 52rem;">\n\n' + '\n'.join(lines) + '\n\n</div>\n</div>'


legacy_table = ['| 出版机构 | 历史刊名 | ISSN |', '|---|---|---|']
for record in legacy:
    ids = ' / '.join(record['issn']) or '—'
    legacy_table.append(f"| {record['publisher_group']} | {record['title']} | {ids} |")

featured_suffixes = {
    ('IEEE', 'Artificial Intelligence'),
    ('IEEE', 'Machine Learning in Communications and Networking'),
    ('IEEE', 'Robot Learning'),
    ('IEEE', 'Circuits and Systems for Artificial Intelligence'),
    ('IEEE', 'Privacy'),
    ('IEEE', 'Industrial Cyber-Physical Systems'),
    ('ACM', 'AI for Science'),
    ('ACM', 'Evolutionary Learning and Optimization'),
    ('ACM', 'Probabilistic Machine Learning'),
    ('ACM', 'Recommender Systems'),
    ('ACM', 'Quantum Computing'),
    ('ACM', 'Human-Robot Interaction'),
}
featured = [record for record in all_journals if (record['publisher_group'], record['title'].split('Transactions on ')[-1]) in featured_suffixes]
featured_table = ['| 期刊 | 研究方向 | 收录状态 |', '|---|---|---|']
featured_table += [f"| {record['title']} | {record['topic_zh']} | {record['index_status']} |" for record in featured]

template = (HERE / 'article-template.md').read_text(encoding='utf8')
replacements = {
    '{{IEEE_TABLE}}': table(ieee), '{{ACM_TABLE}}': table(acm),
    '{{FEATURED_TABLE}}': '\n'.join(featured_table), '{{LEGACY_TABLE}}': '\n'.join(legacy_table),
    '{{JURL}}': base['sources']['jcr_2025_secondary'], '{{XURL}}': base['sources']['xr_2026_secondary'],
}
for key, value in replacements.items():
    template = template.replace(key, value)
assert '{{' not in template
(ROOT / 'src/content/blogs/ieee-transactions-journals-and-emerging-venues.md').write_text(template, encoding='utf8')
print(json.dumps({'counts': payload['counts'], 'legacy': len(legacy), 'watch': len(watch), 'featured': len(featured)}, ensure_ascii=False))
