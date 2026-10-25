"""Build the combined Transactions catalogue and its public article."""
import csv
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OUT = ROOT / 'public/assets/journals/ieee-transactions-2026-10'
DATE = '2026-10-25'
ACM_INDEX_DATE = '2026-10-17'
base = json.loads((HERE / 'ieee-base.json').read_text(encoding='utf8'))
acm_source = json.loads((HERE / 'acm-titles.json').read_text(encoding='utf8'))
SOURCE_COMMIT = '4687a8f608f20aaf004299992f5d347dba009361'
SOURCE_ROOT = f'https://github.com/hitfyd/ShowJCR/blob/{SOURCE_COMMIT}/中科院分区表及JCR原始数据文件'
CCF_SOURCE = '/assets/pdf/ccf-2026-v7.pdf'
CAS_SOURCE = f'{SOURCE_ROOT}/FQBJCR2025-UTF8.csv'
XINRUI_SOURCE = f'{SOURCE_ROOT}/XR2026-UTF8.csv'


def normalize(title):
    return re.sub('[^a-z0-9]', '', title.lower().replace('&', 'and'))


# The sources retain some earlier joint titles and index-specific spellings.
RATING_ALIASES = {
    normalize(current): normalize(source)
    for current, source in [
        ('IEEE Transactions on Networking', 'IEEE/ACM Transactions on Networking'),
        ('IEEE Transactions on Computational Biology and Bioinformatics', 'IEEE/ACM Transactions on Computational Biology and Bioinformatics'),
        ('IEEE Transactions on Audio Speech and Language Processing', 'IEEE/ACM Transactions on Audio Speech and Language Processing'),
        ('IEEE Transactions on Systems, Man, and Cybernetics: Systems', 'IEEE Transactions on Systems Man Cybernetics-Systems'),
        ('ACM Transactions on Quantum Computing', 'ACM Transactions in Quantum Computing'),
    ]
}


def read_rows(path):
    with path.open(encoding='utf-8-sig', newline='') as stream:
        return list(csv.DictReader(stream))


ccf_rows = [row for row in read_rows(HERE / 'CCF2026-UTF8.csv')
            if '刊物' in row['CCF推荐类别（国际学术刊物/会议）']]
cas_rows = read_rows(ROOT / 'files/ieee-transactions-2026-10/FQBJCR2025-UTF8.csv')
xinrui_rows = read_rows(ROOT / 'files/ieee-transactions-2026-10/XR2026-UTF8.csv')


def rating_matches(record, rows):
    names = {normalize(record['title']), normalize(record.get('crossref_title', ''))}
    names |= {RATING_ALIASES[name] for name in list(names) if name in RATING_ALIASES}
    return [row for row in rows if normalize(row['Journal']) in names]


def add_ratings(record, active=True):
    record.update({
        'ccf_rank': '', 'ccf_year': '', 'ccf_areas': [],
        'ccf_source': '', 'ccf_source_titles': [],
        'cas_quartile': '', 'cas_year': '', 'cas_category': '',
        'cas_source': '', 'cas_source_title': '', 'cas_source_issn': '',
        'xinrui_quartile': '', 'xinrui_year': '', 'xinrui_category': '',
        'xinrui_source': '', 'xinrui_source_title': '', 'xinrui_source_issn': '',
        'xinrui_checked_on': '',
    })
    if not active:
        return
    # Xinrui also covers ESCI/SSCI titles; match its own source independently.
    xinrui = rating_matches(record, xinrui_rows)
    if not xinrui:
        identifiers = set(record['issn'])
        xinrui = [row for row in xinrui_rows
                  if identifiers.intersection({row['ISSN'], row['EISSN']})]
    assert len(xinrui) <= 1, (record['title'], xinrui)
    if xinrui:
        row = xinrui[0]
        division = re.fullmatch(r'([1-4])\s*区', row['大类新锐分区'].strip())
        if division:
            assert row['年份'] == '2026'
            # The matched catalogue titles each have one broad category.
            assert not row['大类2新锐分区'].strip(), record['title']
            record.update({
                'xinrui_quartile': f'{division[1]}区', 'xinrui_year': 2026,
                'xinrui_category': row['大类中文名'], 'xinrui_source': XINRUI_SOURCE,
                'xinrui_source_title': row['Journal'],
                'xinrui_source_issn': '/'.join(dict.fromkeys(
                    value for value in [row['ISSN'], row['EISSN']] if value and value != 'N/A')),
                'xinrui_checked_on': DATE,
            })
    # Preserve the existing SCIE-only display rule for CCF and CAS.
    if 'SCIE' not in record['index_status']:
        return
    ccf = rating_matches(record, ccf_rows)
    if ccf:
        ranks = {row['CCF推荐类型'].removesuffix('类') for row in ccf}
        assert len(ranks) == 1 and ranks <= {'A', 'B', 'C'}, (record['title'], ranks)
        assert all(row['年份'] == '2026' for row in ccf)
        record.update({
            'ccf_rank': ranks.pop(), 'ccf_year': 2026,
            'ccf_areas': sorted({row['领域'] for row in ccf}),
            'ccf_source': CCF_SOURCE,
            'ccf_source_titles': sorted({row['Journal'] for row in ccf}),
        })
    cas = rating_matches(record, cas_rows)
    if not cas:
        identifiers = set(record['issn'])
        cas = [row for row in cas_rows if identifiers.intersection(row['ISSN/EISSN'].split('/'))]
    assert len(cas) <= 1, (record['title'], cas)
    if cas and 'SCIE' in cas[0]['Web of Science']:
        row = cas[0]
        quartile = re.match(r'^([1-4])(?:\s|$)', row['大类分区'])
        if quartile:
            assert row['年份'] == '2025'
            record.update({
                'cas_quartile': f'{quartile[1]}区', 'cas_year': 2025,
                'cas_category': row['大类'], 'cas_source': CAS_SOURCE,
                'cas_source_title': row['Journal'], 'cas_source_issn': row['ISSN/EISSN'],
            })

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
        'index_checked_on': ACM_INDEX_DATE,
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
for record in all_journals:
    add_ratings(record)
for record in legacy + future:
    add_ratings(record, active=False)
watch = [record for record in all_journals if record['index_status'] in ['ESCI', '待确认']] + future
payload = {
    'catalogue_updated_on': DATE,
    'scope': 'IEEE、IEEE/ASME、IEEE Latin America 与 ACM Transactions 名称族；历史联合题名另列。主目录依据 2025/2026 出版元数据编制，不是出版社实时在刊总数认证。',
    'index_note': '收录状态依据 2025/2026 二次资料，逐条保留来源与核对日期。待确认不等于未收录；当前状态以 Clarivate MJL 为准。',
    'rating_note': 'CCF：2026 年第七版；中科院：2025 年大类分区；新锐：2026 年大类分区。CCF 与中科院维持仅为标注 SCIE 的现刊填写已匹配评级的口径；新锐按其自身数据匹配，也包括部分 ESCI、SSCI 期刊。无对应评级的单元格留空，三列独立填写。',
    'sources': {**base['sources'], 'acm_crossref': 'https://api.crossref.org/journals?query=ACM&rows=1000',
                'ccf_2026_primary': CCF_SOURCE,
                'ccf_2026_secondary': f'{SOURCE_ROOT}/CCF2026-UTF8.csv',
                'cas_2025_secondary': CAS_SOURCE,
                'xinrui_2026_secondary': XINRUI_SOURCE},
    'counts': {'IEEE': len(ieee), 'ACM': len(acm), 'total': len(all_journals), 'index_status': dict(Counter(record['index_status'] for record in all_journals))},
    'journals': all_journals, 'legacy': legacy, 'future': future,
}
(OUT / 'directory.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf8')


def write_csv(name, records):
    fields = ['publisher_group', 'title', 'issn', 'topic_zh', 'index_status',
              'ccf_rank', 'ccf_year', 'ccf_areas', 'ccf_source', 'ccf_source_titles',
              'cas_quartile', 'cas_year', 'cas_category', 'cas_source', 'cas_source_title', 'cas_source_issn',
              'xinrui_quartile', 'xinrui_year', 'xinrui_category', 'xinrui_source', 'xinrui_source_title', 'xinrui_source_issn', 'xinrui_checked_on',
              'jcr_2025_snapshot', 'xr_2026_snapshot', 'index_checked_on', 'catalogue_updated_on', 'current_mjl_verified', 'metadata_url', 'publisher_page', 'index_sources', 'catalogue_group']
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
    lines = ['| 序号 | 期刊全称 | 研究方向 | ISSN | 收录状态 | CCF 2026 | 中科院 2025 大类分区 | 新锐 2026 大类分区 |', '|---|---|---|---|---|---|---|---|']
    for i, record in enumerate(records, 1):
        lines.append(f"| {i} | {record['title']} | {record['topic_zh']} | [{record['issn'][-1]}]({record['metadata_url']}) | {record['index_status']} | {record['ccf_rank']} | {record['cas_quartile']} | {record['xinrui_quartile']} |")
    return '<div style="overflow-x: auto;">\n<div style="min-width: 78rem;">\n\n' + '\n'.join(lines) + '\n\n</div>\n</div>'


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
    '{{CCFURL}}': CCF_SOURCE, '{{CASURL}}': CAS_SOURCE,
}
for key, value in replacements.items():
    template = template.replace(key, value)
assert '{{' not in template
(ROOT / 'src/content/blogs/ieee-transactions-journals-and-emerging-venues.md').write_text(template, encoding='utf8')
print(json.dumps({'counts': payload['counts'], 'legacy': len(legacy), 'watch': len(watch), 'featured': len(featured)}, ensure_ascii=False))
