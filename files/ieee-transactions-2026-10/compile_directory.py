"""Compile the journal subset and article tables from saved research snapshots."""
import csv
import json
import re
from collections import Counter
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OUT = ROOT / 'public/assets/journals/ieee-transactions-2026-10'
OUT.mkdir(parents=True, exist_ok=True)
DATE = '2026-10-15'
COMMIT = json.loads((HERE / 'github-commit.json').read_text())['sha']
TREE = json.loads((HERE / 'showjcr-tree.json').read_text())['tree']


def norm(value):
    return re.sub('[^a-z0-9]', '', value.lower().replace('&', 'and'))


def source_url(filename):
    path = next(v['path'] for v in TREE if v['path'].split('/')[-1] == filename)
    return f'https://github.com/hitfyd/ShowJCR/blob/{COMMIT}/{path}'


JURL = source_url('JCR2025-UTF8.csv')
XURL = source_url('XR2026-UTF8.csv')
raw = json.loads((HERE / 'crossref-transactions.json').read_text())
jcr = list(csv.DictReader((HERE / 'JCR2025-UTF8.csv').open(encoding='utf-8-sig')))
xr = list(csv.DictReader((HERE / 'XR2026-UTF8.csv').open(encoding='utf-8-sig')))
wb = openpyxl.load_workbook(HERE / 'iel-2023.xlsx', read_only=True, data_only=True)
kbart = [dict(zip(list(sh.values)[1], row)) for sh in wb for row in list(sh.values)[2:] if row[0]]

# Chinese topic labels are editorial navigation aids, not a translation of official scope.
topic_lines = '''
Latin America Transactions|拉丁美洲综合工程
Aerospace and Electronic Systems|航空航天与电子系统
Affective Computing|情感计算
AgriFood Electronics|农业食品电子技术
Antennas and Propagation|天线与电波传播
Applied Superconductivity|应用超导
Artificial Intelligence|人工智能
Audio Speech and Language Processing|语音、音频与语言处理
Automatic Control|自动控制
Automation Science and Engineering|自动化科学与工程
Big Data|大数据
Biomedical Circuits and Systems|生物医学电路与系统
Biomedical Engineering|生物医学工程
Biometrics Behavior and Identity Science|生物识别、行为与身份
Broadcasting|广播技术
Circuits & Systems II Express Briefs|电路与系统短文
Circuits and Systems I Regular Papers|电路与系统
Circuits and Systems for Artificial Intelligence|人工智能电路与系统
Circuits and Systems for Video Technology|视频电路与系统
Cloud Computing|云计算
Cognitive Communications and Networking|认知通信与网络
Cognitive and Developmental Systems|认知与发展系统
Communications|通信
Components Packaging and Manufacturing Technology|元件、封装与制造
Computational Biology and Bioinformatics|计算生物学与生物信息学
Computational Imaging|计算成像
Computational Social Systems|计算社会系统
Computer-Aided Design of Integrated Circuits and Systems|集成电路与系统计算机辅助设计
Computers|计算机系统
Consumer Electronics|消费电子
Control Systems Technology|控制系统技术
Control of Network Systems|网络系统控制
Cybernetics|控制论与智能系统
Dependable and Secure Computing|可信与安全计算
Device and Materials Reliability|器件与材料可靠性
Dielectrics and Electrical Insulation|电介质与电气绝缘
Education|工程教育
Electromagnetic Compatibility|电磁兼容
Electron Devices|电子器件
Emerging Topics in Computational Intelligence|计算智能新兴主题
Emerging Topics in Computing|计算新兴主题
Energy Conversion|能量转换
Energy Markets Policy and Regulation|能源市场、政策与监管
Engineering Management|工程管理
Evolutionary Computation|进化计算
Field Robotics|场景机器人
Fuzzy Systems|模糊系统
Games|游戏与智能决策
Geoscience and Remote Sensing|地球科学与遥感
Green Communications and Networking|绿色通信与网络
Haptics|触觉技术
Human-Machine Systems|人机系统
Image Processing|图像处理
Industrial Cyber-Physical Systems|工业信息物理系统
Industrial Electronics|工业电子
Industrial Informatics|工业信息学
Industry Applications|工业应用
Information Forensics and Security|信息取证与安全
Information Theory|信息论
Instrumentation and Measurement|仪器与测量
Intelligent Transportation Systems|智能交通系统
Intelligent Vehicles|智能车辆
Knowledge and Data Engineering|知识与数据工程
Learning Technologies|学习技术
Machine Learning in Communications and Networking|通信网络中的机器学习
Magnetics|磁学
Materials for Electron Devices|电子器件材料
Medical Imaging|医学成像
Medical Robotics and Bionics|医疗机器人与仿生
Microwave Theory and Techniques|微波理论与技术
Mobile Computing|移动计算
Molecular Biological and Multi-Scale Communications|分子、生物与多尺度通信
Multimedia|多媒体
NanoBioscience|纳米生物科学
Nanotechnology|纳米技术
Network Science and Engineering|网络科学与工程
Network and Service Management|网络与服务管理
Networking|计算机网络
Neural Networks and Learning Systems|神经网络与学习系统
Neural Systems and Rehabilitation Engineering|神经系统与康复工程
Nuclear Science|核科学
Parallel and Distributed Systems|并行与分布式系统
Pattern Analysis and Machine Intelligence|模式分析与机器智能
Plasma Science|等离子体科学
Power Delivery|电力输送
Power Electronics|电力电子
Power Systems|电力系统
Privacy|隐私
Professional Communication|专业与技术传播
Quantum Engineering|量子工程
Radar Systems|雷达系统
Radiation and Plasma Medical Sciences|辐射与等离子体医学
Reliability|可靠性
Robot Learning|机器人学习
Robotics|机器人学
Semiconductor Manufacturing|半导体制造
Services Computing|服务计算
Signal Processing|信号处理
Signal and Information Processing over Networks|网络信号与信息处理
Signal and Power Integrity|信号与电源完整性
Smart Grid|智能电网
Soft Robotics|软体机器人
Software Engineering|软件工程
Sustainable Computing|可持续计算
Sustainable Energy|可持续能源
Systems Man and Cybernetics Systems|系统、人及控制论
Technology and Society|技术与社会
Terahertz Science and Technology|太赫兹科学与技术
Transportation Electrification|交通电气化
Ultrasonics|超声学
Ultrasonics Ferroelectrics and Frequency Control|超声、铁电与频率控制
Vehicular Technology|车辆技术
Very Large Scale Integration (VLSI) Systems|超大规模集成电路系统
Visualization and Computer Graphics|可视化与计算机图形学
Wireless Communications|无线通信
Mechatronics|机电一体化
'''
TOPICS = dict(line.split('|') for line in topic_lines.strip().splitlines())
CURRENT = []
ARCHIVE = []
FUTURE = []
LIVE = {
    'Quantum Engineering': '30159',
    'Medical Robotics and Bionics': '39840',
    'Radiation and Plasma Medical Sciences': '13782',
    'Molecular Biological and Multi-Scale Communications': '39539',
}
for entry in sorted(raw, key=lambda v: v['title']):
    title = entry['title']
    suffix = title.split('Transactions on ')[-1].removeprefix('IEEE ')
    k = next((v for v in kbart if norm(v['publication_title']) == norm(title)), None)
    j = next((v for v in jcr if norm(v['Journal']) == norm(title)), None)
    x = next((v for v in xr if norm(v['Journal']) == norm(title)), None)
    # The database uses an abbreviated conjunction for this established title.
    if suffix == 'Systems Man and Cybernetics Systems':
        j = next(v for v in jcr if v['Journal'] == 'IEEE Transactions on Systems Man Cybernetics-Systems')
        x = next((v for v in xr if norm(v['Journal']) == norm(j['Journal'])), None)
    # Do not use an arbitrary ISSN overlap: some Crossref records mix other journals' ISSNs.
    identifiers = [v for v in ([k.get('print_identifier'), k.get('online_identifier')] if k else []) if v]
    if not identifiers and j:
        identifiers = [v for v in [j['ISSN'], j['EISSN']] if v and v != 'N/A']
    if not identifiers:
        identifiers = list(dict.fromkeys(entry['issn']))
    identifiers = list(dict.fromkeys(identifiers))
    record = {
        'title': k['publication_title'] if k else title,
        'crossref_title': title,
        'issn': identifiers,
        'topic_zh': TOPICS.get(suffix, ''),
        'latest_issue_year_in_crossref': entry['last_year'],
        'metadata_url': f'https://api.crossref.org/journals/{identifiers[-1]}' if identifiers else 'https://api.crossref.org/journals?query=' + title.replace(' ', '%20'),
        'publisher_page': k['title_url'] if k else None,
        'jcr_2025_snapshot': j['Web of Science'] if j else None,
        'xr_2026_snapshot': x['数据库'] if x else None,
        'index_sources': ([JURL] if j else []) + ([XURL] if x else []),
        'checked_on': DATE,
        'current_mjl_verified': False,
    }
    if suffix in LIVE:
        record['secondary_live_index'] = 'ESCI'
        record['secondary_live_url'] = f'https://www.letpub.com.cn/index.php?journalid={LIVE[suffix]}&page=journalapp&view=detail'
        record['index_sources'].append(record['secondary_live_url'])
    if j:
        record['index_status'] = 'SCIE + SSCI' if 'SCIE' in j['Web of Science'] and 'SSCI' in j['Web of Science'] else j['Web of Science']
    elif x and 'SCIE' in x['数据库']:
        record['index_status'] = 'SCIE'
    else:
        record['index_status'] = '未核实'
    if title == 'IEEE Transactions on Soft Robotics':
        record['catalogue_group'] = 'future_metadata_2027'
        FUTURE.append(record)
    elif (entry['last_year'] or 0) < 2025 or title == 'IEEE/ACM Transactions on Networking':
        record['catalogue_group'] = 'legacy_or_archival_metadata'
        ARCHIVE.append(record)
    else:
        record['catalogue_group'] = 'recent_metadata_main_directory'
        assert record['topic_zh'], title
        CURRENT.append(record)

tors = next(v for v in json.loads((HERE / 'crossref-tors.json').read_text())['message']['items'] if 'Recommender' in v['title'])
TORS = {
    'title': tors['title'], 'publisher': tors['publisher'], 'issn': list(dict.fromkeys(tors['ISSN'])),
    'topic_zh': '推荐系统', 'index_status': '未核实', 'checked_on': DATE,
    'metadata_url': 'https://api.crossref.org/journals/2770-6699',
    'current_mjl_verified': False, 'catalogue_group': 'acm_supplement',
    'note': 'ACM 期刊，未计入 IEEE 主目录；未在本次两份索引快照中匹配，不等于未被收录。',
}
WATCH = [v for v in CURRENT if v['index_status'] in ['ESCI', '未核实']] + [TORS] + FUTURE
payload = {
    'checked_on': DATE,
    'scope': 'IEEE Transactions 名称族，含 IEEE/ASME；主目录按 Crossref 2025/2026 记录筛选并合并 Networking 旧名。不是 IEEE 官方实时在刊数量认证。',
    'index_note': '索引分类来自注明版本的二次数据快照；4 刊补查 LetPub。全部未完成 Clarivate MJL 实时核验。未匹配不能证明未收录。',
    'sources': {'crossref': 'https://api.crossref.org/journals?query=IEEE&rows=1000', 'kbart_2023': 'https://lib.qlu.edu.cn/2019/0304/c1252a122430/page.htm', 'jcr_2025_secondary': JURL, 'xr_2026_secondary': XURL},
    'counts': dict(Counter(v['index_status'] for v in CURRENT)),
    'journals': CURRENT, 'legacy': ARCHIVE, 'future': FUTURE, 'acm_supplement': [TORS],
}
(OUT / 'directory.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf8')


def write_csv(name, records):
    fields = ['title', 'issn', 'topic_zh', 'index_status', 'jcr_2025_snapshot', 'xr_2026_snapshot', 'secondary_live_index', 'secondary_live_url', 'current_mjl_verified', 'checked_on', 'catalogue_group', 'metadata_url', 'publisher_page', 'index_sources']
    with (OUT / name).open('w', encoding='utf-8-sig', newline='') as stream:
        writer = csv.DictWriter(stream, fields, extrasaction='ignore')
        writer.writeheader()
        for record in records:
            writer.writerow({key: '; '.join(value) if isinstance(value, list) else value for key, value in record.items() if key in fields})


write_csv('directory.csv', CURRENT)
write_csv('watchlist.csv', WATCH)
write_csv('legacy.csv', ARCHIVE)
main = ['| 序号 | 期刊全称 | 方向速查 | ISSN（登记信息） | 索引快照 |', '|---|---|---|---|---|']
for i, record in enumerate(CURRENT, 1):
    evidence = 'J25 / X26' if record['jcr_2025_snapshot'] and record['xr_2026_snapshot'] else 'J25' if record['jcr_2025_snapshot'] else 'X26' if record['xr_2026_snapshot'] else '未匹配'
    if record.get('secondary_live_index'):
        evidence += ' / L26'
    main.append(f"| {i} | {record['title']} | {record['topic_zh']} | [{record['issn'][-1]}]({record['metadata_url']}) | {record['index_status']} · {evidence} |")
legacy = ['| 刊名／旧记录 | 记录中的最近年份 | ISSN／元数据 |', '|---|---|---|']
for record in ARCHIVE:
    legacy.append(f"| {record['title']} | {record['latest_issue_year_in_crossref'] or '未提供'} | [{record['issn'][-1] if record['issn'] else '无 ISSN'}]({record['metadata_url']}) |")
(HERE / 'main-table.md').write_text('\n'.join(main), encoding='utf8')
(HERE / 'legacy-table.md').write_text('\n'.join(legacy), encoding='utf8')
print(json.dumps({'main': len(CURRENT), 'legacy': len(ARCHIVE), 'future': len(FUTURE), 'watch': len(WATCH), 'counts': payload['counts'], 'JURL': JURL, 'XURL': XURL}, ensure_ascii=False, indent=2))
