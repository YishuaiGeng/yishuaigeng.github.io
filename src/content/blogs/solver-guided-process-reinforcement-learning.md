---
title: 'Solver 引导的过程强化学习'
date: 2026-10-06
description: '梳理 Solver 引导过程监督的研究背景、经典基础与近期进展，区分学习型 PRM、形式有效性、证明相关性和计算进展，讨论语义保真、信用分配与公平评估。'
categories: [Paper Reading]
tags: [Reinforcement Learning, Logical Reasoning, Formal Methods, Process Supervision]
math: true
toc: true
relatedPosts: true
mermaid: false
---

**笔记导读。** Solver 引导的过程强化学习研究如何把求解器或证明器产生的反馈用于推理策略的训练，使模型不仅得到正确答案，还能形成可检查的推理过程。本文以自然语言逻辑推理为主要范围，整理截至 **2026 年 10 月 6 日**的代表性文献，并联系数学过程监督和智能体信用分配研究。贯穿全文的问题是：形式工具能检查哪些性质，这些性质如何转化为训练信号，以及训练后的提升究竟来自更可靠的推理还是更多的外部计算？

**关注主题：** 过程监督；可验证奖励；神经符号推理；证明依赖；信用分配。

## 1. 研究背景：答案正确与推理可靠之间的距离

逻辑推理的评价至少包含三个层面：最终答案是否正确，每一步是否由允许使用的前提推出，以及这些步骤是否组成支持答案的完整证明。三者并不等价。模型可能猜中答案，也可能生成许多正确但无关的陈述，或在大部分步骤正确的情况下完成一次关键的非法跳步。因此，答案准确率无法单独描述推理过程的可靠性。

早期数学验证器研究建立了“生成多个解答，再由验证器筛选”的范式。后续过程监督把反馈细化到中间步骤，使正确与错误的推理路径更容易区分。Training Verifiers、过程与结果反馈比较研究，以及 Let's Verify Step by Step 分别构成了这条脉络的重要基础。[\[1\]](#ref-1)、[\[2\]](#ref-2)、[\[3\]](#ref-3)

强化学习进一步使反馈从推理时的筛选进入生成策略的优化。DeepSeekMath 提出的组相对策略优化（Group Relative Policy Optimization，GRPO）以及 DeepSeek-R1 展示了可验证结果奖励的训练价值，但它们并不自动解决自然语言逻辑步骤的认证问题。[\[5\]](#ref-5)、[\[6\]](#ref-6) 对这一方向而言，关键不仅是使用哪种优化算法，还包括验证对象、监督粒度与奖励所代表的性质。

## 2. 概念边界：过程监督、学习型 PRM 与 Solver 反馈

### 2.1 过程监督不等于训练一个奖励模型

过程监督是一类监督方式，过程奖励模型（Process Reward Model，PRM）是实现这种监督的一种技术。学习型 PRM 根据题目和推理前缀预测当前步骤的质量：

$$
r_t=f_\phi(x,s_{\leq t}).
$$

它的标签可以来自人工标注、LLM 评判或 Monte Carlo 续写。这些来源回答的问题并不完全相同：人工步骤标注通常关注局部正确性，续写成功率还受到续写策略、剩余预算和探索难度影响。The Lessons of Developing Process Reward Models 指出，应区分步骤错误识别与 Best-of-$N$ 答案筛选能力，不能用后者替代前者。[\[4\]](#ref-4)

Solver 反馈则直接执行一个形式检查。例如，给定前提集合 $\Gamma_t$ 和候选结论 $c_t$，检查

$$
\Gamma_t\models c_t.
$$

两者可以独立使用，也可以由 Solver 生成标签后训练 PRM。但即使标签来自形式验证，部署时的 PRM 仍然是统计预测器，不能继承 Solver 对每个输入执行检查时的保证。

<div class="solver-comparison" role="region" aria-label="过程监督来源比较" tabindex="0">

| 监督来源              | 实际检查或估计的对象           | 保证与限制                                   |
| --------------------- | ------------------------------ | -------------------------------------------- |
| 人工或 LLM 步骤评判   | 文本步骤是否合理、正确         | 能处理丰富语言，但存在判断误差与标准差异     |
| Monte Carlo 续写      | 当前前缀在给定策略下的成功机会 | 体现策略与预算，不能直接当作逻辑有效性       |
| 学习型 PRM            | 从训练标签学到的步骤质量       | 推理成本可较低，可靠性依赖数据与分布         |
| 直接 Solver 反馈      | 指定形式系统中的证明义务       | 保证有明确边界，依赖形式输入、前提与工具状态 |
| Solver 标签训练的 PRM | 对形式标签的近似预测           | 可用于筛选或加速，仍需单独评估预测误差       |

</div>

### 2.2 有效性检查需要一致的前提和明确的状态

在经典逻辑中，蕴含检查可以转换为不可满足性检查：

$$
\Gamma_t\models c_t
\quad\Longleftrightarrow\quad
\Gamma_t\land\neg c_t\ \text{不可满足}.
$$

这里有一个必要条件：用于推理的前提应当一致。若 $\Gamma_t$ 本身不可满足，任意候选结论都可被平凡地推出。因此，系统需要区分前提一致性与候选步骤有效性，并明确哪些原始事实、背景公理和已验证步骤允许进入状态。

对一次蕴含检查而言，`UNSAT` 支持该形式结论成立；`SAT` 给出反例，说明结论不由当前前提保证；`UNKNOWN` 表示工具未完成判定。语法错误、超时和不支持的理论也应保留各自的诊断信息。它们可以在训练中按策略映射为数值，但评价时不能统称为“逻辑错误”。尤其是 `SAT` 并不意味着候选结论在所有模型中都为假。

Solver、自动定理证明器与交互式证明系统也有不同的输出和信任边界。获得一个求解结果、获得可复查的证明证书，以及由证明内核检查完整证明，不宜混用同一个“已验证”标签。

## 3. 文献脉络：形式反馈如何进入学习

### 3.1 从过程判别到符号反馈

学习型验证器和 PRM 为过程监督提供了任务定义、标注资源与评价方法。[\[1\]](#ref-1)–[\[4\]](#ref-4) 形式工具带来的变化是，某些步骤性质可以由可执行程序检查，而不必全部依赖模型判断。RLSF 利用符号工具反馈定位输出错误，并把反馈转化为细粒度训练指导；FoVer 将自然语言推理转换为一阶逻辑，再进行形式核验。[\[7\]](#ref-7)、[\[8\]](#ref-8)

这两类工作分别强调“怎样利用反馈学习”和“怎样验证自然语言推理”。它们说明形式检查可以提供过程监督的基础，但验证流水线本身并不等于在线过程强化学习。比较方法时，需要分别记录监督来源和实际训练机制。

### 3.2 从结果奖励到形式过程奖励

Logic-RL 在逻辑谜题中使用规则可验证的结果反馈，提供了判断过程监督是否带来额外收益的重要参照。[\[9\]](#ref-9) LogicReward 用形式检查构造逻辑分数，并据此组织监督微调（SFT）和直接偏好优化（DPO）数据；它体现了验证引导的数据与偏好学习，训练机制有别于在线 GRPO。[\[10\]](#ref-10)

PRoSFI 引入结构化形式中间步骤，逐步验证后将结果聚合为轨迹奖励；SPRING 以 Z3 检查有效性、一致性和相对于已有推断的非冗余性，并将过程评分用于 GRPO。[\[11\]](#ref-11)、[\[12\]](#ref-12) 这条脉络将问题从“答案是否可验证”扩展为“模型生成的推理链能否接受形式检查”。

### 3.3 从局部检查到证明结构与信用分配

Proof-R1 将通过验证的结论加入推理状态，并恢复支持答案的证明依赖闭包，用于训练信用分配。[\[13\]](#ref-13) 其价值在于联系局部合法性与整体答案支持，而不仅是逐步打分。不过，论文的问题设定提供自然语言与形式前提，其过程保证不能直接推广到未经核对的自动形式化输入。

LogicTrack 通过形式审计引导回溯搜索，并利用审计后的轨迹进行 SFT。[\[14\]](#ref-14) 它提醒我们区分推理时工具增强、搜索获得的数据和训练后模型能力：这三种收益都可能有价值，但证据来源不同。

邻近的智能体研究提供了其他信用分配思路。Counterfactual Rollout Replay 在可恢复的软件工程环境中比较实际行动和替代行动的后续回报；DARS 利用先决条件依赖结构进行奖励塑形。[\[15\]](#ref-15)、[\[16\]](#ref-16) 前者依赖额外重放和环境恢复，后者的依赖来源也不等同于 Solver 认证的逻辑依赖。它们有助于理解过程贡献的度量，但不是逻辑证明场景下可直接继承的结论。

<div class="solver-comparison" role="region" aria-label="代表性形式反馈工作比较" tabindex="0">

| 工作                                | 主要机制                       | 阅读时需要辨明的边界               |
| ----------------------------------- | ------------------------------ | ---------------------------------- |
| FoVer，2025 [\[8\]](#ref-8)         | 自然语言推理的一阶逻辑验证     | 验证系统与训练算法应分开讨论       |
| Logic-RL，2025 [\[9\]](#ref-9)      | 规则可验证的结果奖励           | 结果正确不能替代过程认证           |
| LogicReward，2026 [\[10\]](#ref-10) | 形式评分构造 SFT / DPO 数据    | 数据筛选、偏好优化与在线 RL 的区别 |
| PRoSFI，2026 [\[11\]](#ref-11)      | 结构化中间步骤与轨迹奖励       | 逐步检查怎样聚合成训练信号         |
| SPRING，2026 [\[12\]](#ref-12)      | 有效性、一致性与非冗余过程监督 | 非冗余所参照的知识集合             |
| Proof-R1，2026 [\[13\]](#ref-13)    | 验证状态与答案依赖信用         | 给定形式前提与证明依赖的保证范围   |
| LogicTrack，2026 [\[14\]](#ref-14)  | 形式审计、回溯搜索与 SFT       | 搜索成本和训练收益需分别评价       |

</div>

表中近期预印本按其公开版本讨论；具体方法、数据与评价设置应以对应论文为准。

## 4. 重要分析：有效、不重复与有贡献是不同性质

### 4.1 四种性质回答四个问题

**有效性（Validity）**关注一个步骤是否由允许的前提推出；**非冗余性（Novelty）**关注它是否重复指定参照集合中的内容；**证明相关性（Proof Relevance）**关注它是否出现在某次支持答案的证明中；**证明进展（Proof Progress）**关注它是否使完成目标所需的后续工作减少。

一个有效且此前未出现的命题，可能与目标无关。一个被某条证明使用的命题，也可能被另一条证明绕开。因此，依赖闭包能够说明“这次证明用了它”，不能自动说明“所有证明都需要它”，更不能单独确立反事实因果贡献。SPRING 与 Proof-R1 分别为非冗余过程监督和证明结构信用提供了直接的研究参照。[\[12\]](#ref-12)、[\[13\]](#ref-13)

### 4.2 演绎结论不改变完整理论的模型集合

如果完整前提 $\Gamma$ 已经蕴含 $c$，则

$$
\operatorname{Mod}(\Gamma)
=\operatorname{Mod}(\Gamma\land c).
$$

这意味着，加入合法演绎结论并没有从完整理论的语义模型集合中排除额外模型。讨论“信息增益”或“分支减少”时，必须说明所指的是完整理论、显式已知事实、部分约束状态，还是特定搜索程序的前沿。若候选假设已经满足完整前提，合法结论也不会继续排除这些假设。

演绎仍然可以具有计算价值：显式中间结论可以避免重复展开，帮助组织子目标，或让有限资源的搜索更快找到证明。这种价值涉及表示、动作体系和搜索过程。因此，把“合法命题增加了多少”直接当作推理进展，缺少必要的计算解释。

### 4.3 检查粒度与训练信用粒度不同

逐步调用验证器，不代表策略更新时每一步都获得了不同的信用。过程分数可能先被求和、平均或按最弱步骤聚合，最终只形成一个轨迹级奖励。随后如何构造优势、如何把信用分配到 token，又是另一层机制。[\[5\]](#ref-5)、[\[11\]](#ref-11) 因而评估“过程强化学习”时，需要沿着检查结果、奖励聚合和策略更新追踪信号，而不能只看验证器的调用位置。

奖励还可能偏好某种表面形式。按有效步骤数量计分，可能鼓励拆分、重复和冗长；简单按长度惩罚，则可能压掉必要的中间证明。评价应考察模型是否形成了更可靠的证明结构，而不是只观察训练奖励上升。

## 5. 保证边界与现实困难

### 5.1 自动形式化的语义保真

Solver 检查的是收到的形式输入。若模型遗漏前提、弱化目标或误译量词，工具仍可能正确地证明一个错误的问题。Beyond Solver Verdicts 与 Do LLMs Game Formalization? 分别从自动形式化奖励和语义忠实性角度讨论了这一边界。[\[17\]](#ref-17)、[\[18\]](#ref-18)

因此，应分别评价原文与形式表示的对应，以及形式表示内部的证明有效性。修改前提、引入未经允许的假设和改变目标，都不能仅凭后续验证成功被接受。对使用原生形式输入的研究，保证范围也应表述为该输入条件下的推理可靠性。

### 5.2 工具成本与不确定状态

Solver 调用次数相同，并不意味着计算成本相同。理论片段、公式规模、量词结构、缓存与增量求解均会改变耗时。若一种方法使用更多验证或搜索，它的结果提升可能部分来自额外计算，而非更好的奖励定义。反事实重放尤其需要计入环境恢复和新增续写的成本。[\[15\]](#ref-15)

`UNKNOWN` 和超时还会产生选择偏差：若只在易验证步骤上报告有效率，困难步骤和解析失败就被移出了分母。应同时报告所有生成步骤的状态分布，以及在可判定子集上的正确性，明确两者各自回答什么问题。

### 5.3 奖励投机与独立审计

外部工具可以提高局部检查的可信度，但整个评分接口仍可能被策略利用。例如，模型可能生成容易认证但与目标无关的命题，或利用解析规则改变被检查的内容。CoT Monitoring 研究在代码环境中观察到优化监测信号可能改变可见推理的表达方式。[\[19\]](#ref-19) 这一结果不直接证明逻辑验证方法存在同样行为，但支持一个评估原则：训练奖励之外，还需要独立检查最终行为与过程可靠性。

## 6. 如何评价这一研究方向

评价应同时覆盖结果、过程与成本，并区分训练时使用工具和测试时使用工具。至少需要明确以下问题：

- **结果层面：** 最终答案准确率、完整证明成功率，以及两者不一致的情形。
- **过程层面：** 所有生成步骤中的有效、无效、解析失败和未判定比例；答案是否真正由已验证状态支持。
- **语义层面：** 原题约束和目标是否被保留；自动形式化错误是否被独立发现。
- **效率层面：** 生成 token、Solver 调用及 CPU 时间、搜索工作量和端到端耗时。
- **泛化层面：** 更深的证明、不同题目规模、语言改写和未见规则组合下的表现。

比较中还应控制基础模型、训练数据与预算，并说明测试阶段的外部工具权限。原方法复现与机制近似实现需要明确标记；推理时搜索获得的收益不能全部归因于模型已经内化的能力。对 PRM，则应分别评价候选答案筛选和步骤错误定位。[\[4\]](#ref-4)

## 7. 开放问题与阅读路径

现有工作已经覆盖规则结果奖励、形式过程验证、非冗余监督以及答案依赖信用。[\[9\]](#ref-9)–[\[14\]](#ref-14) 尚待研究的问题包括：怎样在可承担的成本下度量步骤效用；怎样区分某次证明的依赖与替代证明中的必要性；怎样减少形式化误差而不削弱原问题；以及怎样把局部验证信号转化为稳定、可解释的策略学习。

阅读时可先用过程与结果监督文献建立评价概念，再通过 RLSF、FoVer 和 LogicReward 理解形式反馈的不同用途，随后比较 PRoSFI、SPRING 与 Proof-R1 的奖励对象和信用机制。最后结合 LogicTrack、反事实重放及语义保真研究，检查工具增强、训练能力和端到端保证之间的边界。相关自动形式化背景也见本站[自动形式化研究笔记](/blog/autoformalization-research-overview/)。

工具入门可参考 [Z3 官方仓库](https://github.com/Z3Prover/z3) 与 [Z3 Guide](https://microsoft.github.io/z3guide/)。工具的理论支持、判定状态与证明输出，是理解上述文献实现条件的基础。

## 参考文献

[下载本文参考文献 BibTeX](/assets/bibliography/solver-guided-process-reinforcement-learning.bib)

<p id="ref-1">[1] Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian et al. <a href="https://arxiv.org/abs/2110.14168">Training Verifiers to Solve Math Word Problems</a>. arXiv, 2021.</p>

<p id="ref-2">[2] Jonathan Uesato, Nate Kushman, Ramana Kumar et al. <a href="https://arxiv.org/abs/2211.14275">Solving math word problems with process- and outcome-based feedback</a>. arXiv, 2022.</p>

<p id="ref-3">[3] Hunter Lightman, Vineet Kosaraju, Yura Burda et al. <a href="https://openreview.net/forum?id=VM8cgr3OI8">Let's Verify Step by Step</a>. ICLR, 2024.</p>

<p id="ref-4">[4] Zhenru Zhang, Chujie Zheng, Yangzhen Wu et al. <a href="https://arxiv.org/abs/2501.07301">The Lessons of Developing Process Reward Models in Mathematical Reasoning</a>. arXiv, 2025.</p>

<p id="ref-5">[5] Zhihong Shao, Peiyi Wang, Qihao Zhu et al. <a href="https://arxiv.org/abs/2402.03300">DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models</a>. arXiv, 2024.</p>

<p id="ref-6">[6] DeepSeek-AI, Daya Guo, Dejian Yang et al. <a href="https://doi.org/10.1038/s41586-025-09422-z">DeepSeek-R1 incentivizes reasoning in LLMs through reinforcement learning</a>. Nature 645, 633–638, 2025.</p>

<p id="ref-7">[7] Piyush Jha, Prithwish Jana, Pranavkrishna Suresh et al. <a href="https://arxiv.org/abs/2405.16661">RLSF: Fine-tuning LLMs via Symbolic Feedback</a>. arXiv, 2024; revised 2025.</p>

<p id="ref-8">[8] Yu Pei, Yongping Du, Xingnan Jin. <a href="https://doi.org/10.1162/tacl.a.41">FoVer: First-Order Logic Verification for Natural Language Reasoning</a>. Transactions of the Association for Computational Linguistics 13, 1340–1359, 2025.</p>

<p id="ref-9">[9] Tian Xie, Zitian Gao, Qingnan Ren et al. <a href="https://arxiv.org/abs/2502.14768">Logic-RL: Unleashing LLM Reasoning with Rule-Based Reinforcement Learning</a>. arXiv, 2025.</p>

<p id="ref-10">[10] Jundong Xu, Hao Fei, Huichi Zhou et al. <a href="https://arxiv.org/abs/2512.18196">LogicReward: Incentivizing LLM Reasoning via Step-Wise Logical Supervision</a>. ICLR, 2026.</p>

<p id="ref-11">[11] Luoxin Chen, Yichi Zhou, Huishuai Zhang. <a href="https://arxiv.org/abs/2603.29500">Learning to Generate Formally Verifiable Step-by-Step Logic Reasoning via Structured Formal Intermediaries</a>. arXiv, 2026.</p>

<p id="ref-12">[12] Muhammad Asif Ali, Wenqing Wang, Huan Wang, Mohammad Raza. <a href="https://arxiv.org/abs/2609.34660">Rewarding Novel Deductions: Solver-guided Process Supervision for Logical Reasoning</a>. arXiv, 2026; v2, 2026-10-01.</p>

<p id="ref-13">[13] Qili Zhang, Qianren Mao, Hanze Cai et al. <a href="https://arxiv.org/abs/2609.37203">Learning to Prove, Not Just to Answer: Reinforcement Learning from Formal Verification for Natural-Language Logical Reasoning</a>. arXiv, 2026.</p>

<p id="ref-14">[14] Jingyu Hu, Shu Yang, Weiru Liu, Di Wang. <a href="https://arxiv.org/abs/2609.21492">LogicTrack: Auditing Reasoning Trajectories of Large Language Models with Formal Logic Solvers</a>. arXiv, 2026.</p>

<p id="ref-15">[15] Yuanhao Li, Hongbo Wang, Xuhong Chen et al. <a href="https://arxiv.org/abs/2609.33875">Counterfactual Rollout Replay: Forkable Environments as Free Process Rewards for Software Engineering Agents</a>. arXiv, 2026.</p>

<p id="ref-16">[16] Ziyi Chen, Yan Zhang, Jianhui Wei et al. <a href="https://arxiv.org/abs/2610.01207">Dependency-Aware Reward Shaping for Agentic Reinforcement Learning</a>. arXiv, 2026.</p>

<p id="ref-17">[17] Vikash Singh, Debargha Ganguly, Aman Goel et al. <a href="https://arxiv.org/abs/2609.11085">Beyond Solver Verdicts: Generative Reward Models for Autoformalization</a>. arXiv, 2026.</p>

<p id="ref-18">[18] Kyuhee Kim, Auguste Poiroux, Antoine Bosselut. <a href="https://arxiv.org/abs/2604.19459">Do LLMs Game Formalization? Evaluating Faithfulness in Logical Reasoning</a>. ICLR 2026 VerifAI-2 Workshop.</p>

<p id="ref-19">[19] Bowen Baker, Joost Huizinga, Leo Gao et al. <a href="https://arxiv.org/abs/2503.11926">Monitoring Reasoning Models for Misbehavior and the Risks of Promoting Obfuscation</a>. arXiv, 2025.</p>

<style>
  #post-content .solver-comparison {
    overflow-x: auto;
    margin: 1.5rem 0;
  }
  #post-content .solver-comparison:focus-visible {
    outline: 2px solid var(--global-theme-color);
    outline-offset: 4px;
  }
  #post-content .solver-comparison table {
    display: table;
    min-width: 40rem;
    width: 100%;
    margin: 0;
    table-layout: fixed;
  }
  #post-content .solver-comparison th:first-child {
    width: 27%;
  }
</style>
