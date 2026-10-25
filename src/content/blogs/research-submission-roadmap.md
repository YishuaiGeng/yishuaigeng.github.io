---
title: '投稿路线图：神经符号推理与推荐系统'
date: 2026-10-25
lastmod: 2026-10-25
description: '面向神经符号约束推理、求解器反馈、LLM 逻辑推理与自编码器推荐的投稿规划：36 本期刊、37 个会议，比较 CCF、中科院、新锐与 JCR，并按稿件贡献建立首投和备选路线。'
categories: [投稿目录]
tags:
  [
    投稿选刊,
    CCF,
    神经符号,
    Logical Reasoning,
    LLM Reasoning,
    Recommender Systems,
    Research Workflow,
  ]
pinned: true
toc: true
relatedPosts: true
---

这份笔记围绕两条已有研究积累建立投稿池：**博士阶段的神经符号约束推理、求解器反馈与大模型逻辑推理**，以及**硕士阶段延续的自编码器推荐、显式评分预测、稀疏与不平衡问题**。目标是让每项工作都有明确的读者和备选去处，在继续冲刺高水平会议的同时，建立领域会议与期刊的持续产出路线。

**更新：2026-10-25。** 共整理 **36 本期刊、37 个会议**。下面的“主线池、专业池、条件池、冲刺”表示研究定位建议，不表示接受率、审稿速度或录用保证。候选池也不等于所有期刊都适合当前每一篇稿件。

[下载投稿池 CSV](/assets/journals/research-submission-plan-2026-10/venues.csv) · [下载含学科与来源的 JSON](/assets/journals/research-submission-plan-2026-10/venues.json) · [CCF 全目录](/blog/submission-venue-directory/) · [IEEE / ACM Transactions 全目录](/blog/ieee-transactions-journals-and-emerging-venues/)

## 1. 先建立常用投稿池

我的博士主线可以凝练为：**如何把自然语言意图可靠地转成形式约束，并利用求解、反例或证明反馈改善推理与学习？** 推荐系统则保留为有积累的延续方向，优先研究明确的误差、偏差、泛化或信息效用问题。

| 工作的主要贡献                             | 优先跟踪的期刊                                            | 优先跟踪的会议                                           | 选投前要成立的条件                                       |
| ------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| 可靠形式化、ASP 程序生成与修复             | TPLP、JAR、JAIR；知识系统方法也看 KBS、INS                | KR、CP、ICLP；语言语义突出时看 EMNLP                     | 语义、建模错误或形式方法贡献清楚，不只报告最终准确率     |
| 结构化 solver feedback、反例/core/证明反馈 | JAR、JAIR、KBS、INS；约束技术突出时看 Constraints         | KR、CP、SAT、CADE/IJCAR（按具体贡献区分）                | 证明反馈比重试或普通报错多提供了什么信息，并公平计算成本 |
| 反馈驱动的训练、过程监督或泛化学习         | Machine Learning、Neural Networks、TNNLS；TMLR 为条件候选 | COLM、ICLR、ICML、NeurIPS；语言实验主导时看 EMNLP        | 确实学到了可迁移能力；区分训练收益与推理时额外计算       |
| 推荐中的评分不平衡、稀疏、长尾或知识融合   | IPM、INS、KBS、ESWA、Neurocomputing、ASOC、FCS            | RecSys、CIKM、WSDM；按贡献再看 ICDM、DASFAA、PAKDD、ECIR | 任务定义、强基线、分组误差、实验公平性和方法机制充分     |
| 用户偏好、可解释/可控推荐与决策价值        | UMUAI、TORS；决策贡献明确时看 DSS                         | RecSys、UMAP                                             | 用合适的用户、交互或决策证据支撑主张                     |

**KBS 和 IPM 都值得常看，但理由不同。** KBS 的范围直接包含推荐系统，也适合知识与智能系统方法；IPM 强调计算与信息科学的交叉，推荐稿要讲清信息访问问题。博士方向中，只有研究问题确实落在检索、问答、信息处理或知识管理上，才自然进入 IPM、DKE 等投稿池。

面向毕业保障，先跟踪认可类别明确、与博士论文主线契合的成果；在此基础上，KBS、ESWA、TIST、Neurocomputing、ASOC 等可以承接独立的方法或应用贡献。**分区、CCF 等级、学位认定是三个需要分别记录的维度。** TETCI 虽在本表两套大类分区中都是 2 区，也不能仅据此推定满足某校的 CCF/JCR 考核类别。

## 2. 评价口径：四列分别读

| 标签   | 本笔记的口径                              | 如何使用                                               |
| ------ | ----------------------------------------- | ------------------------------------------------------ |
| CCF    | 2026 年第七版正式目录，含 2026-04-09 勘误 | A/B/C 与学科、刊会类别一起核验；“未列”指本版目录未匹配 |
| 中科院 | 2025 年大类分区                           | 保留大类名称，不拿小类最优分区替代大类                 |
| 新锐   | 2026 年大类分区                           | 与中科院独立列示，不改称“中科院 2026”                  |
| JCR    | 2025 指标、2026 发布的数据快照            | 多学科 Q 分区全部保留；不能静默挑最优学科作为唯一标签  |

CCF 新版中 **ICLR 为 A、IJCAI 为 B、TIST 和 TORS 为 C**。这是本笔记明确版本后的标注；官网旧分类网页若与正式 PDF 不一致，应核对标明版本的正式目录。**WWW 期刊为 B，The Web Conference 会议为 A**，二者不能混用。

如果学校文件使用 **JCR Q1** 作为认定条件，中科院或新锐的 1／2 区不能替代它。对 TPLP 等多学科期刊，表中 `Q1/Q3/Q4` 表示不同学科各有分区，**不是整本期刊统一为 Q1**。实际认定还需核适用年份、学科口径、作者署名、单位、论文类型和与学位论文的关系。

表中“未匹配”只表示指定版次未取得相应数据，不等于证明未收录。TAI、TORS、TMLR 的分区及当前 SCIE 状态没有在本次指定数据中核实，不补猜。会议不适用期刊分区。

期刊与会议链接优先指向官方范围或 CFP。**† 表示尚未完成最新范围正文或当届入口核验，属于条件候选。** 历史 CFP 用于核实主题，不表示下一轮仍开放；这里不列已经过期的截止日期，也不凭印象填写审稿周期、费用或“容易中”的判断。

## 3. 博士方向：先分清在推进什么

### 3.1 形式化与约束建模

问题可以是自然语言到 ASP/SAT/SMT/CP 的语义保真、量词与否定的处理、约束遗漏、过度约束、不可满足解释，以及形式程序的生成和修复。

- **ASP/逻辑程序是中心：** TPLP、ICLP；知识表示与推理方法更一般时看 KR、JAIR、AIJ。
- **约束建模、获取、求解与解释是中心：** CP、Constraints；有明确 SAT/SMT 贡献时看 SAT。
- **证明搜索、证书、反例或自动推理工具是中心：** JAR、CADE、IJCAR；形式语义与计算逻辑理论突出时再核 TOCL。
- **自然语言语义是中心：** ACL、EMNLP、TACL；要分析歧义、量词、范围、否定与语言泛化，而不只更换 solver。

至少分开报告：语法/可执行率、求解状态、形式化与原意的一致性、任务结果，以及失败类型。Solver 对收到的公式给出正确判定，并不说明公式忠实表达了原题。

### 3.2 基于求解器的反馈

可研究 counterexample、unsat core、proof/certificate、约束违反位置如何改变错误定位、修复、搜索或训练。先说明反馈属于语法报错、语义反例、约束冲突还是证明信息，再比较它提供了什么增量。

关键对照包括：无反馈、仅结果反馈、普通报错、自我反思、结构化反馈，以及固定重试次数/同等 token 与 solver 调用预算。对 core 或证明反馈，还要检查最小性、无关反馈、错误反馈、不同 solver 与不同问题规模。若收益来自额外搜索，应如实按搜索贡献定位。

### 3.3 求解器反馈用于学习

将反馈用于 SFT、偏好优化、RL 或过程监督时，Machine Learning、Neural Networks、TNNLS、TMLR 和学习类会议才更自然。学习稿需要证明提升不只是测试时多调用工具，优先检验未见模板、问题规模、约束组合、模型与求解器迁移、训练数据成本及预算公平性。

IJAR 适合不确定性、近似推理、默认推理、论证或矛盾容忍成为主要贡献的工作；不能只因刊名含 reasoning 就把确定性的 ASP pipeline 默认投过去。TETCI 也需要具体的新兴计算智能议题，而不是把所有 LLM 工作视作天然适配。

### 3.4 知识、逻辑与智能系统期刊

| 期刊                                                                                                | CCF 2026 | 中科院 2025 大类 | 新锐 2026 大类 | JCR 各学科 Q | 投稿定位                                                                                      |
| --------------------------------------------------------------------------------------------------- | -------- | ---------------- | -------------- | ------------ | --------------------------------------------------------------------------------------------- |
| [AIJ](https://aij.ijcai.org/call-for-papers/)                                                       | A        | 计算机科学 2区   | 计算机科学 2区 | Q2           | **成熟后冲刺**：完整的知识表示与神经符号方法；需要对较广 AI 社群有价值的进展。                |
| [JAIR](https://jair.org/index.php/jair/about)                                                       | B        | 计算机科学 3区   | 计算机科学 3区 | Q2           | **主线池**：逻辑推理、约束处理与学习结合的完整研究；强调方法、分析与可复现证据。              |
| [TPLP](https://logicprogramming.org/tplp/scope-and-submission/)                                     | C        | 数学 2区         | 数学 2区       | Q1/Q3/Q4     | **专业池**：ASP/逻辑程序生成、语义保真、程序修复与学习；逻辑程序本身应是贡献中心。            |
| [JAR](https://link.springer.com/journal/10817/aims-and-scope)                                       | B        | 计算机科学 3区   | 计算机科学 2区 | Q4           | **主线池**：自动推理、证明/反例反馈、学习引导证明搜索；不能只有自然语言答题分数。             |
| [Constraints](https://link.springer.com/journal/10601/aims-and-scope)                               | 未列     | 计算机科学 4区   | 计算机科学 4区 | Q3/Q4        | **专业池**：约束建模、获取、解释与修复；需体现约束技术的进展。                                |
| [TOCL](https://dl.acm.org/journal/tocl/about) †                                                     | B        | 数学 4区         | 数学 3区       | Q1/Q3        | **条件池**：形式语义、计算逻辑、证明性质与复杂度贡献强时考虑；最新官网范围需复核。            |
| [IJAR](https://shop.elsevier.com/journals/international-journal-of-approximate-reasoning/0888-613X) | B        | 计算机科学 3区   | 计算机科学 3区 | Q3           | **条件池**：不确定性、近似推理、默认推理、论证与矛盾容忍；确定性 solver 流程不自动适配。      |
| [KBS](https://shop.elsevier.com/journals/knowledge-based-systems/0950-7051)                         | C        | 计算机科学 1区   | 计算机科学 1区 | Q1           | **主线池**：知识/规则驱动的智能方法与推荐系统；逻辑一致性、知识融合及评分不平衡均可形成问题。 |
| [INS](https://shop.elsevier.com/journals/information-sciences/0020-0255)                            | B        | 计算机科学 2区   | 计算机科学 1区 | Q1           | **主线池**：信息与知识工程、智能系统方法；适合有机制解释和跨设置验证的推理或推荐工作。        |
| [ESWA](https://shop.elsevier.com/journals/expert-systems-with-applications/0957-4174)               | C        | 计算机科学 1区   | 计算机科学 1区 | Q1           | **应用池**：智能系统的设计、验证与应用；突出实际问题、方法增量及系统性评价。                  |
| [APIN](https://link.springer.com/journal/10489/aims-and-scope)                                      | C        | 计算机科学 3区   | 计算机科学 3区 | Q2           | **应用池**：复杂实际问题中的知识推理、学习、优化与规划；既有技术换场景不足以支撑贡献。        |

### 3.5 学习方法与 Transactions

下表也适用于推荐方向，但要按各刊的核心研究问题判断贡献。ML、NN/TNNLS 等路线应说明学习或神经系统的增量；TACL 可突出语言语义与评价，TAI 可突出 AI 方法与应用，TMLR 也可考虑严谨的 ML 分析、评价或推理算法。**Transactions 是刊名系列，不是统一等级或统一研究范围。**

| 期刊                                                                                  | CCF 2026 | 中科院 2025 大类 | 新锐 2026 大类 | JCR 各学科 Q | 投稿定位                                                                                              |
| ------------------------------------------------------------------------------------- | -------- | ---------------- | -------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| [ASOC](https://shop.elsevier.com/journals/applied-soft-computing/1568-4946)           | 未列     | 计算机科学 2区   | 计算机科学 2区 | Q1           | **方法池**：软计算处理缺失、噪声、不确定性与多目标问题；推荐实验需支撑对应主张。                      |
| [ML](https://link.springer.com/journal/10994/aims-and-scope)                          | B        | 计算机科学 4区   | 计算机科学 3区 | Q2           | **条件池**：学习算法、反馈训练、泛化与数据效率；仅测试时重试不能写成学习贡献。                        |
| [NN](https://shop.elsevier.com/journals/neural-networks/0893-6080)                    | B        | 计算机科学 2区   | 计算机科学 2区 | Q1           | **条件池**：神经学习应是论文中心；约束进入训练或可推广表示学习机制比单一应用组合更合题。              |
| [Neurocomputing](https://shop.elsevier.com/journals/neurocomputing/0925-2312)         | C        | 计算机科学 2区   | 计算机科学 2区 | Q1           | **方法池**：自编码器/神经学习机制、鲁棒性和效率；需要超越堆层与模块拼接。                             |
| [TNNLS](https://cis.ieee.org/publications/t-neural-networks-and-learning-systems)     | B        | 计算机科学 1区   | 计算机科学 2区 | Q1           | **成熟后冲刺**：新的神经学习算法、结构或理论；推荐/逻辑任务是验证场景，学习贡献须成立。               |
| [TETCI](https://cis.ieee.org/publications/t-emerging-topics-in-ci)                    | 未列     | 计算机科学 2区   | 计算机科学 2区 | Q2           | **条件池**：有明确新兴计算智能议题时考虑；普通 AE 或 LLM 加 solver 不能仅凭“新兴”二字适配。           |
| [TIST](https://dl.acm.org/journal/tist/about) †                                       | C        | 计算机科学 3区   | 计算机科学 2区 | Q1           | **条件池**：可迁移智能技术与系统性实证；推理、推荐均可进一步比对近期文章与官网范围。                  |
| [TAI](https://cis.ieee.org/publications/ieee-transactions-on-artificial-intelligence) | 未列     | 未匹配           | 未匹配         | 未匹配       | **观察池**：AI 理论、方法与应用；分区/SCIE 在指定快照未核实，不能按 Trans 名称推断。                  |
| [TACL](https://transacl.org/index.php/tacl/about)                                     | B        | 计算机科学 2区   | 计算机科学 1区 | N/A/Q1       | **条件池**：自然语言到逻辑、量词/否定/歧义与语义保真；须有计算语言学或 NLP 贡献。                     |
| [TMLR](https://jmlr.org/tmlr/)                                                        | 未列     | 未匹配           | 未匹配         | 未匹配       | **条件池**：有严谨学习贡献的反馈训练与泛化分析；先核 overlap policy，不当作已发表会议稿的常规扩展刊。 |

### 3.6 博士方向会议

| 会议                                                                        | CCF 2026 | 定位与适合的贡献                                                                           |
| --------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| [KR](https://kr.org/KR2026/call_main_track.html)                            | B        | **主线池**：知识/逻辑表示、非单调推理、ASP、约束、解释与学习推理整合。                     |
| [AAAI](https://aaai.org/conference/aaai/aaai-26/main-technical-track-call/) | A        | **成熟后冲刺**：有显著方法贡献和广泛 AI 价值的神经符号推理。                               |
| [IJCAI](https://2025.ijcai.org/call-for-papers-main-track/)                 | B        | **主线池**：有一般 AI 意义的推理、训练、知识与学习方法；按新版目录为 B。                   |
| [ICLR](https://iclr.cc/Conferences/2026/CallForPapers)                      | A        | **成熟后冲刺**：可泛化学习、神经符号结构、反馈训练与严谨评价。                             |
| [NeurIPS](https://neurips.cc/Conferences/2026/CallForPapers)                | A        | **成熟后冲刺**：可推广推理、学习与优化方法，或有深度的局限与评价分析。                     |
| [ICML](https://icml.cc/Conferences/2026/CallForPapers)                      | A        | **成熟后冲刺**：核心是学习机制、数据效率、泛化或理论，而非单纯 solver 系统。               |
| [ACL](https://2026.aclweb.org/calls/main_conference_papers/)                | A        | **条件冲刺**：语言语义、形式化、逻辑推理与可靠评测；区分 main 与 Findings。                |
| [EMNLP](https://2025.emnlp.org/calls/main_conference_papers/)               | B        | **条件池**：语言到逻辑、语义保真、LLM 推理与反馈实证；区分 main 与 Findings。              |
| [COLM](https://colm.cc/Conferences/2026/CallForPapers)                      | 未列     | **条件池**：语言模型训练、推理/搜索与工具协同；本版 CCF 未匹配。                           |
| [ICLP](https://iclp25.demacs.unical.it/calls/main-track)                    | 未列     | **专业池**：ASP、逻辑程序与神经模型结合、生成/验证/修复；regular 与 TPLP 的出版联动须核。  |
| [CP](https://cp2026.a4cp.org/cfp.html)                                      | B        | **专业池**：自动约束建模、获取、解释与反馈；区分对 CP 的方法推进和使用 CP 的应用。         |
| [SAT](https://satisfiability.org/SAT26/)                                    | B        | **专业池**：SAT/SMT/MaxSAT、编码、证书与 solver 方法；需明确 Boolean/satisfiability 联系。 |
| [CADE](https://www.cadeinc.org/) †                                          | B        | **专业池**：自动推理、证明搜索与工具方法；独立年份 CFP 需复核，不把 IJCAR 直接归作 CADE。  |
| [IJCAR](https://merz.gitlabpages.inria.fr/2024-ijcar/post/call-for-papers/) | 未列     | **专业池**：自动/交互推理、学习引导证明、形式工具；CCF 本版未匹配，不继承 CADE 的 B。      |
| [ECAI](https://ecai2025.org/call-for-papers/)                               | B        | **主线池**：较完整的约束与神经符号 AI 方法；须有清楚贡献和可复现实验。                     |
| [AAMAS](https://aamas2025.org/index.php/conference/calls/call-for-papers/)  | B        | **条件池**：确有 agent 决策、规划、约束遵循或多智能体问题；普通单轮逻辑题不自动适配。      |

以 ICLP 2025 CFP 为例，接受的 regular／IJCAI Fast Track papers 发表于 TPLP，Technical Communications 出版于 EPTCS；下一轮应重新核当届政策。**ICLP 与其 TPLP 出版不能自动计作两项独立成果**；具体论文类型与认定方式应在投稿前确定。IJCAR 是独立会议，本版 CCF 未匹配，不能继承 CADE 的 B 类。

## 4. 推荐系统：从自编码器积累中提炼问题

硕士阶段已有自编码器、特征扩展、评分不平衡与知识图谱推荐的积累。延续这条线时，应先回答“哪类误差或信息缺失需要解决”，再选择结构，而不是每篇都从添加模块开始。

### 4.1 哪些问题更值得延续

| 研究问题                             | 应准备的关键证据                                                     | 自然的投稿池                                                                    |
| ------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 高低评分偏斜，少数评分段表现差       | 总体与按评分值分组的 MAE/RMSE、合理 macro 指标、损失/采样对照        | INS、KBS、IPM、Neurocomputing、ESWA                                             |
| 稀疏、长尾或冷启动                   | 用户/物品频次分组；真正隔离新用户/物品的切分；可控稀疏化与侧信息说明 | IPM、KBS、ASOC、RecSys、CIKM、PAKDD                                             |
| 知识图谱质量、知识融合与约束         | 无 KG、噪声 KG、关系消融、信息/时间泄漏检查、知识带来的机制分析      | DKE、KBS、INS；贡献成熟时看 TKDE、TKDD                                          |
| 评分预测的可预测性、偏差或评测可靠性 | 明确假设、强简单基线、重复实验、误差/不确定性与跨切分验证            | IPM、DMKD、INS、RecSys、CIKM                                                    |
| 用户可控性、解释、适配或决策价值     | 与主张一致的交互、用户研究或决策指标                                 | UMUAI、TORS、DSS、UMAP、RecSys                                                  |
| 新学习机制、表示或训练效率           | 一般机制、充分消融、复杂度/资源比较、多个场景的可迁移证据            | NN、TNNLS、Neurocomputing；另有明确信息访问或数据/知识工程贡献时再看 TOIS、TKDE |

**显式评分预测与隐式 Top-N 排序需要分开。** MAE/RMSE 改善不能直接推导出排序质量、用户满意度或商业效用改善。如果把评分二值化，要说明阈值、负采样、未观察项和任务变化；若声明冷启动，测试划分必须真正体现新用户或新物品。

### 4.2 推荐、信息访问与知识工程期刊

这些期刊与上面的 KBS、INS、ESWA、ASOC、Neurocomputing、NN/TNNLS 共同构成推荐方向的投稿池。

| 期刊                                                                                                             | CCF 2026 | 中科院 2025 大类 | 新锐 2026 大类 | JCR 各学科 Q | 投稿定位                                                                                        |
| ---------------------------------------------------------------------------------------------------------------- | -------- | ---------------- | -------------- | ------------ | ----------------------------------------------------------------------------------------------- |
| [IPM](https://shop.elsevier.com/journals/information-processing-and-management/0306-4573)                        | B        | 计算机科学 1区   | 计算机科学 1区 | Q1           | **主线池**：个性化信息访问与推荐；评分预测可投，但要解释信息处理问题和实际效用。                |
| [TOIS](https://dl.acm.org/journal/tois/about) †                                                                  | A        | 计算机科学 2区   | 计算机科学 1区 | Q1           | **成熟后冲刺**：信息访问、检索与推荐的强方法或评价贡献；最新官网范围需复核。                    |
| [TKDE](https://www.computer.org/digital-library/journals/tk/cfp-ieee-transactions-on-knowledge-data-engineering) | A        | 计算机科学 1区   | 计算机科学 2区 | Q1           | **成熟后冲刺**：推荐的数据/知识建模、图谱、可扩展性与工程方法；纯神经网络结构贡献需谨慎。       |
| [TKDD](https://dl.acm.org/journal/tkdd/about) †                                                                  | B        | 计算机科学 3区   | 计算机科学 3区 | Q1           | **条件池**：有一般数据挖掘价值的表征、图学习、偏差或评价研究；最新官网范围需复核。              |
| [TORS](https://www.acm.org/media-center/2022/march/tors-launch)                                                  | C        | 未匹配           | 未匹配         | 未匹配       | **专业池**：直接面向推荐算法、体验、影响与价值；CCF C 与索引/分区分别核验。                     |
| [DKE](https://shop.elsevier.com/journals/data-and-knowledge-engineering/0169-023X)                               | B        | 计算机科学 3区   | 计算机科学 3区 | Q2           | **条件池**：知识表示、获取、维护或融合主导的 KG 推荐、约束知识系统；不能只接一个 KG embedding。 |
| [DSS](https://shop.elsevier.com/journals/decision-support-systems/0167-9236)                                     | C        | 管理学 2区       | 管理学 1区     | Q1           | **条件池**：推荐如何改善决策、系统使用和影响；只有 RMSE 提升不足以支持决策贡献。                |
| [UMUAI](https://link.springer.com/journal/11257/aims-and-scope)                                                  | B        | 计算机科学 2区   | 计算机科学 2区 | Q2           | **条件池**：用户偏好建模、适配、可控/可解释推荐；用户层面主张需相应证据。                       |
| [FCS](https://link.springer.com/journal/11704/aims-and-scope)                                                    | B        | 计算机科学 2区   | 计算机科学 2区 | Q1           | **方法池**：方法与实验完整的计算机研究；推理和推荐均需比对近期编辑领域。                        |
| [DMKD](https://link.springer.com/journal/10618/aims-and-scope)                                                   | B        | 计算机科学 3区   | 计算机科学 3区 | Q1/Q2        | **条件池**：可推广的数据挖掘、偏差、规则发现或评价方法；单一推荐结构微调的普适价值偏弱。        |
| [WWW](https://link.springer.com/journal/11280/aims-and-scope)                                                    | B        | 计算机科学 4区   | 计算机科学 3区 | Q1/Q2        | **条件池**：Web 信息系统、推荐、Web 知识融合；这是 Springer 期刊，与 WWW 会议不同。             |
| [KAIS](https://link.springer.com/journal/10115/aims-and-scope)                                                   | B        | 计算机科学 4区   | 计算机科学 3区 | Q2           | **条件池**：知识/信息系统、数据挖掘、学习与推理；围绕可复用方法或系统推进定位。                 |

### 4.3 推荐方向会议

| 会议                                                                     | CCF 2026 | 定位与适合的贡献                                                                  |
| ------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------- |
| [RecSys](https://recsys.acm.org/recsys26/call/)                          | B        | **主线池**：最直接的推荐社群；算法、评分/排序评价、用户及系统价值均应与主张对齐。 |
| [SIGIR](https://sigir2026.org/en-AU/pages/submissions/full-papers-track) | A        | **成熟后冲刺**：对信息检索/访问有重要推进的推荐方法、理论或评价研究。             |
| [WWW](https://www2026.thewebconf.org/calls/research-tracks.html)         | A        | **成熟后冲刺**：必须回答明确 Web 问题；仅使用 Web 数据集/API 不等于符合范围。     |
| [KDD](https://kdd2026.kdd.org/research-track-call-for-papers/)           | A        | **成熟后冲刺**：具有较广数据科学价值的推荐、偏差、泛化或规模化方法。              |
| [WSDM](https://wsdm-conference.org/2026/index.php/call-for-papers/)      | B        | **主线池**：Web 搜索/挖掘、推荐与用户建模；明确数据及信息服务的意义。             |
| [CIKM](https://www.cikm2025.org/calls/full-research-papers)              | B        | **主线池**：推荐、知识管理、图谱与表示学习；问题意识和严谨实证需同时成立。        |
| [ICDM](https://www3.cs.stonybrook.edu/~icdm2025/cfp.html)                | B        | **条件池**：推荐研究形成可推广的数据挖掘、偏差、图学习或效率技术。                |
| [DASFAA](https://dasfaa2026.github.io/calls/research-papers.html)        | B        | **条件池**：数据库应用、知识/图数据、推荐与可扩展系统。                           |
| [PAKDD](https://www.pakdd2026.org/call-for-paper-main)                   | C        | **方法池**：稀疏/长尾、表征与知识发现；研究问题、对比和统计证据需扎实。           |
| [ECIR](https://ecir2026.eu/calls/call-for-full-papers)                   | C        | **方法池**：推荐与个性化信息访问、评价和复现；本表按 full research 稿规划。       |
| [WISE](https://conferences.sigappfr.org/wise2026/call-for-papers/)       | B        | **条件池**：Web 平台与信息系统中的推荐/知识应用；须有新的理论或实证结果。         |
| [UMAP](https://www.um.org/umap2026/call-for-full-short-papers/)          | 未列     | **专业池**：用户/偏好建模、适配、交互及人本推荐；CCF 本版未匹配。                 |

RecSys、CIKM、WSDM 可作为持续跟踪的社群；PAKDD、ECIR、DASFAA、ICDM、WISE 按问题匹配分流。SIGIR、KDD、WWW 保留为贡献与证据足够成熟时的冲刺目标。领域更聚焦也意味着评价标准更具体，不等于降低实验要求。

### 4.4 两个阶段能否形成一条交叉线

可以研究**预算受限下，何时值得让 LLM 参与长尾偏好推理或知识补全**：用 AE/图推荐器作为低成本基础模型，用不确定性、知识缺失或约束冲突决定何时调用更昂贵的推理流程。比较从不调用、始终调用、随机路由与有依据的路由，同时提供相同调用预算的比较，确保路由依据不使用测试标签，报告性能—费用—延迟关系和长尾分组表现。

如果核心是推荐效用与信息访问，可先看 KBS、IPM、CIKM、RecSys、WSDM；如果产生一般性的学习、可靠推理或约束决策方法，再考虑更广的 AI/ML venue。两个阶段不必强行合入每篇论文，交叉应由共同研究问题支撑。

## 5. 一区、二区候选怎么筛

下面按**中科院 2025 或新锐 2026 任一套大类为 1／2 区**建立观察池；“或”的条件只用于这份选刊笔记，不代表学校认定规则。

| 观察池                   | 期刊                                                                        | 使用方式                                                                    |
| ------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 两套均为 1 区            | KBS、ESWA、IPM、CSUR、AIR、Information Fusion                               | KBS/IPM 等按问题选；综述或信息融合刊须符合各自稿件定位                      |
| 两套均为 2 区            | AIJ、TPLP、ASOC、NN、Neurocomputing、TETCI、UMUAI、FCS                      | AIJ 与应用/学习刊的标准和读者不同；TPLP 的大类是数学                        |
| 两套为 1／2 区，顺序不同 | INS（2→1）、TNNLS（1→2）、TACL（2→1）、TOIS（2→1）、TKDE（1→2）、DSS（2→1） | 箭头仅表示中科院 2025 → 新锐 2026，不表示同一体系逐年升降；DSS 是管理学大类 |
| 新锐 2 区，中科院 3 区   | JAR、TIST                                                                   | 前者围绕自动推理，后者按具体智能技术与系统贡献复核                          |

JAIR、TOCL、IJAR、Machine Learning、TKDD、DKE、DMKD、KAIS 等仍值得按研究主题保留。专业匹配和 CCF 认可不由大类分区单独决定。Constraints 也有直接的约束研究范围，只是本表对应分区和考核标签不应预设满足个人要求。

### 5.1 综述与特殊条件候选

| 期刊                                                                  | CCF 2026 | 中科院 2025 大类 | 新锐 2026 大类 | JCR 各学科 Q | 投稿定位                                                                                     |
| --------------------------------------------------------------------- | -------- | ---------------- | -------------- | ------------ | -------------------------------------------------------------------------------------------- |
| [CSUR](https://dl.acm.org/journal/csur/about) †                       | 未列     | 计算机科学 1区   | 计算机科学 1区 | Q1           | **综述池**：综述选题先核最新政策；需要系统检索、分类、比较与综合判断，不能只是论文列表。     |
| [AIR](https://link.springer.com/journal/10462/aims-and-scope)         | 未列     | 计算机科学 1区   | 计算机科学 1区 | Q1           | **综述及综合池**：综述、教程、批判性评价与研究报告；并非只收综述，稿件类型需按当期政策核验。 |
| [IF](https://shop.elsevier.com/journals/information-fusion/1566-2535) | 未列     | 计算机科学 1区   | 计算机科学 1区 | Q1           | **条件池**：多源/多层信息融合是主要贡献时考虑；仅组合 LLM 与 solver 不自动构成信息融合研究。 |

神经符号/solver-in-the-loop 综述可先比较 CSUR、AIR 的选题覆盖、系统检索与比较分析要求。AIJ、JAIR、KBS 等是否适合某篇综述，也需要逐刊核实稿件类型政策。Information Fusion 的主线是多源、多过程、多层融合，不能仅凭 1 区把普通 LLM+solver 组合归到这里。

### 5.2 相邻会议扩展池

下表保留可拓展方向，尚未逐项完成当届 CFP 核验。它们用于扩大后续阅读和跟踪范围，不作为当前稿件已经适配的结论。

| 会议                                                | CCF 2026 | 定位与适合的贡献                                                                |
| --------------------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| [NAACL](https://naacl.org/) †                       | B        | **扩展观察**：语言与语义贡献成立时扩展，按当届主会 CFP 另核。                   |
| [COLING](https://aclanthology.org/venues/coling/) † | B        | **扩展观察**：计算语言学贡献成立时扩展；此链接为官方文集索引，当届 CFP 须另核。 |
| [UAI](https://www.auai.org/) †                      | B        | **扩展观察**：概率、不确定性或因果推断成为核心时再考虑。                        |
| [AISTATS](https://aistats.org/) †                   | C        | **扩展观察**：统计学习、估计或泛化分析成为核心时再考虑。                        |
| [SDM](https://www.siam.org/conferences-events/) †   | B        | **扩展观察**：数据挖掘方法形成一般贡献时另核当届 CFP。                          |
| [ECML-PKDD](https://ecmlpkdd.org/) †                | B        | **扩展观察**：学习/知识发现贡献成立时另核当届轨道与评测要求。                   |
| [ILP](https://logicprogramming.org/) †              | C        | **扩展观察**：逻辑/关系学习贡献成立时查当届 ILP CFP。                           |
| [ISWC](https://swsa.semanticweb.org/) †             | B        | **扩展观察**：知识图谱、语义 Web 与知识工程是核心问题时扩展。                   |
| [ESWC](https://www.eswc-conferences.org/) †         | C        | **扩展观察**：语义 Web、KG 与知识获取/推理贡献成立时扩展。                      |

## 6. 给每篇稿件写一条首投与备选路线

备选应与论文的主要贡献兼容，修改时调整论证和补足证据；不要只按 CCF 档次排列期刊名，也不要让同一稿件在综合会议之间长期循环。

| 稿件画像                        | 首轮重点比较                                     | 相邻备选                                                | 迁移时需要补的内容                                              |
| ------------------------------- | ------------------------------------------------ | ------------------------------------------------------- | --------------------------------------------------------------- |
| ASP 生成、语义保持与程序修复    | KR、ICLP/TPLP                                    | JAR、JAIR；通用知识方法可看 KBS                         | LP/推理语义、失败分类、跨任务结果；先核论文类型与出版关系       |
| 自动约束建模、core 反馈与解释   | CP、KR                                           | Constraints、JAR；应用方法看 KBS/ESWA                   | 对 constraint technology 的推进、可解释反馈、求解成本与建模质量 |
| 可推广 solver feedback 训练     | 与证据强度匹配的 COLM/ICLR/EMNLP 或 ML/NN 类期刊 | JAIR、INS；确有神经学习增量时看 TNNLS                   | 跨模型/模板/规模、训练和推理预算、学习与搜索收益分离            |
| 自编码器推荐中的不平衡/鲁棒学习 | IPM、INS、KBS 或 RecSys/CIKM                     | Neurocomputing、ESWA、ASOC、FCS；TETCI 先核新兴 CI 主题 | 强基线、标签/用户/物品分组、任务边界、机制和效率                |
| KG 推荐与知识质量/融合          | DKE、KBS、CIKM                                   | INS、TKDD；贡献成熟时看 TKDE                            | KG 质量、关系贡献、知识工程增量、泄漏和成本                     |
| 成熟的大规模个性化信息访问方法  | TOIS、SIGIR、TKDE 或 WWW（有 Web 问题时）        | IPM、WSDM、RecSys                                       | 贡献不能只靠规模；补公平预算、机制、泛化与信息访问证据          |

每篇立项时先写 **1 个首投候选和 2 个备选**，以近期同类论文和官方范围作依据。会议评审后先判断缺口：方法问题就修方法，证据不足就补实验，读者不匹配再转 venue。没有新增证据的同稿反复投递不应成为默认安排。

会议论文扩展到期刊前，按目标刊政策确认新增贡献和披露要求。ICLP/TPLP 的同一出版链不重复计数；TMLR 的 overlap policy 也不能按一般会议扩展刊理解。

## 7. 持续产出的工作安排

毕业要求是约束，博士论文主线决定研究递进。建议同时维持**一项主线方法研究和一项范围更明确的评价/应用研究**；推荐系统延续工作只在已有代码、数据与问题积累能支持实质增量时推进。

| 阶段        | 要产出的具体东西                                   | 决策点                                       |
| ----------- | -------------------------------------------------- | -------------------------------------------- |
| 立项 1–2 周 | 一页问题卡、最相关方法、3 个投稿候选、实验协议     | 能否说清读者、主要增量和被证伪的条件         |
| 下一轮实验  | 一个可运行最小方法、强基线、主要失败类型、统一预算 | 机制是否成立，收益是否只是额外数据/算力/重试 |
| 证据完善    | 消融、分组与泛化、成本、失败边界、可复现材料       | 选择专业会议、综合会议或完整期刊论证         |
| 投稿前      | 对照当届/当刊政策；核等级版本、作者单位和论文类型  | 能否同时支撑研究主张与个人认定要求           |
| 评审后      | 按方法、实验、表达、范围四类归纳问题，更新路线卡   | 什么证据值得补，是否需要更换读者群           |

规划周期只用于管理工作，不是审稿时间预测。每个目标 venue 至少读近两年最接近的若干论文；截止日期、投稿入口、费用和 OA 政策统一在真正进入准备阶段时查官方页面。需要记录的重点是“这篇论文缺什么”，而不只是“下一次投哪里”。

## 8. 可复用的稿件路线卡

```text
工作标题 / 当前阶段：
与博士论文哪一章、哪一个科学问题相关：
一句话贡献（方法 / 理论 / 评价 / 系统）：
最近且最强的对比工作：
相对它新增什么，哪些主张尚无证据：
首投候选 / 备选一 / 备选二：
各候选最接近的近期论文与范围依据：
等级和分区（体系 + 年份 + 学科）：
个人认定待核项（署名 / 单位 / 版本 / 论文类型）：
实验协议、预算和可复现材料：
下一项会改变选投判断的实验：
```

## 9. 用真实发表校准选题，而不推断录用概率

- **Logic-LM，Findings of EMNLP 2023：** 已有“自然语言形式化→solver→利用报错修复”的工作。新稿要说清超越普通报错与重试的机制。[官方原文](https://aclanthology.org/2023.findings-emnlp.248/)
- **LINC，EMNLP 2023：** 将语言模型作为语义解析器连接一阶逻辑证明器，说明语言形式化与逻辑求解的分工是明确研究对象。[官方原文](https://aclanthology.org/2023.emnlp-main.313/)
- **LLASP，KR 2024：** ASP 专用微调已有发表先例；“微调 LLM 生成 ASP”本身不足以定义全部新意。[官方原文](https://proceedings.kr.org/2024/78/)
- **NeurASP，IJCAI 2020：** 神经网络与 ASP 语义约束结合的基础工作，属于神经符号背景，不能写成 LLM 研究。[官方原文](https://www.ijcai.org/proceedings/2020/243)
- **An improved autoencoder for recommendation to alleviate the vanishing gradient problem，KBS 2023：** 已核题名、作者和出版元数据，可作为 KBS 发表 AE 推荐工作的实例；此处不据题名推断其具体方法和效果。[DOI](https://doi.org/10.1016/j.knosys.2023.110254)
- **Upper bound on the predictability of rating prediction in recommender systems，IPM 2025：** 已核出版元数据，说明评分预测的分析性问题也是 IPM 的实际发表对象。[DOI](https://doi.org/10.1016/j.ipm.2024.103950)
- **Are We Really Making Much Progress?，RecSys 2019：** 对一批神经推荐方法的复现与基线比较提出问题；用于提醒实验公平性，不外推为所有神经推荐无效。[论文与摘要](https://arxiv.org/abs/1907.06902)
- **Recommendations as Treatments，ICML 2016：** 研究推荐中的选择偏差与去偏学习/评价；不能把随机删评分的实验直接当作现实曝光偏差的完整证据。[官方原文](https://proceedings.mlr.press/v48/schnabel16.html)

## 10. 数据来源与维护

CCF 依据[官网总目录与版本说明](https://www.ccf.org.cn/Academic_Evaluation/By_category/)及[2026 第七版正式 PDF（含 4 月 9 日勘误）](https://www.ccf.org.cn/ccf/contentcore/resource/download?ID=112CF3BF7E1140ACEB271ADAED12A67ADFABB8FF099E40C2759502A85C8A281F)。相应页码与出版物类型保存在 JSON 中；未将旧 CSV 合并的 CADE/IJCAR 名称当作新目录的事实。

中科院、新锐和 JCR 使用 ShowJCR 的固定版本公开整理数据，逐刊用 ISSN 与刊名核对：[中科院 2025](https://github.com/hitfyd/ShowJCR/blob/4687a8f608f20aaf004299992f5d347dba009361/中科院分区表及JCR原始数据文件/FQBJCR2025-UTF8.csv)、[新锐 2026](https://github.com/hitfyd/ShowJCR/blob/4687a8f608f20aaf004299992f5d347dba009361/中科院分区表及JCR原始数据文件/XR2026-UTF8.csv)、[JCR 数据](https://github.com/hitfyd/ShowJCR/blob/4687a8f608f20aaf004299992f5d347dba009361/中科院分区表及JCR原始数据文件/JCR2025-UTF8.csv)。[固定版本说明](https://github.com/hitfyd/ShowJCR/blob/4687a8f608f20aaf004299992f5d347dba009361/README.md)将 JCR 标为 2025 指标、2026 发布；本笔记没有将文件名解释为 2025 年发布。

两套大类分区保留学科名，JCR 保留全部学科 Q 与 N/A。题名相同但 ISSN 不同的期刊没有合并，例如此处 AIJ 指 Elsevier 的 _Artificial Intelligence_（0004-3702），不是 MDPI 的同名刊。索引来自有日期的资料快照，最新覆盖以 [Clarivate Master Journal List](https://mjl.clarivate.com/home) 和学校认可证明为准。

选题适配来自表内官方范围/CFP 与上述真实论文；优先级和路线属于基于这些证据的研究建议。四个常见 ACM Transactions 范围页和 CSUR 本次正文读取未完成，已标 †；相邻会议池也保留了复核标记。下一次维护时先更新数据和范围证据，再调整候选与路线。
