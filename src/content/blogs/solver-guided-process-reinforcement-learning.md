---
title: 'Solver 引导的过程强化学习'
date: 2026-10-06
lastmod: 2026-10-14
description: '总结过程奖励与信用分配的研究进展，整理连续的相关工作列表，并提出以形式有效性为前提、目标条件化证明进展为信号的 Solver 强化学习方案与实验对照。'
categories: [Paper Reading]
tags: [Reinforcement Learning, Logical Reasoning, Formal Methods, Process Supervision]
math: true
toc: true
relatedPosts: true
mermaid: false
---

本方向研究如何把求解器或证明器的反馈用于大语言模型推理训练。核心问题是：**当一个推断已经通过形式有效性检查时，它是否减少了完成当前目标所需的后续证明工作？** 研究目标是完整证明质量与单位计算效率，而不只是最终答案准确率或步骤验证通过率。

本文整合截至 **2026 年 10 月 14 日**的文献梳理与方案设计。相关工作中的结果来自各论文；文中的 Solver 证明进展方法属于拟检验方案，尚无本项目的复现或训练结果。

## 1. 研究背景

逻辑推理至少包含三个评价层面：答案正确、局部推断有效，以及这些推断组成支持答案的完整证明。模型可能猜中答案，也可能生成许多正确却无关的事实，或在长轨迹中完成一次关键的非法跳步。因此，结果奖励无法单独刻画过程可靠性；过程监督尝试把反馈细化到中间决策。[\[1\]](#ref-1)–[\[3\]](#ref-3)

过程监督是一种监督方式，过程奖励模型（Process Reward Model，PRM）是其实现之一。人工标签、模型判断、采样续写与形式检查回答的问题不同：局部步骤正确、后续成功机会、答案置信度和实际证明贡献不能相互替代。PRM 用于候选筛选，也不等于过程信号已用于策略训练。[\[4\]](#ref-4)

Solver 的优势是对指定形式系统中的证明义务执行检查。例如，在可信且一致的前提 $\Gamma$ 下，可以用 $\Gamma\land\neg c$ 的不可满足性检验候选结论 $c$ 是否被蕴含。但 Solver 只检查收到的形式输入；原题是否被忠实表达、依赖是否获准、目标是否被改写，仍需另外控制。[\[8\]](#ref-8)、[\[18\]](#ref-18)

本方向需要区分四种性质：

- **有效性（Validity）：** 步骤能否由获准前提和规则推出，用于可信状态准入。
- **非冗余性（Novelty）：** 是否重复显式已有推断；参照集合必须明确。
- **证明相关性（Proof Relevance）：** 是否属于某次成功证明的答案支持闭包；不代表所有证明都离不开它。
- **证明进展（Proof Progress）：** 在固定目标、动作体系、搜索程序和预算下，估计的剩余证明工作是否下降。

SPRING 与 Proof-R1 已分别研究非冗余过程监督与证明依赖信用。[\[12\]](#ref-12)、[\[13\]](#ref-13) 当前拟研究的增量，是在这些机制之外检验受限计算效用能否提供额外训练信息。

## 2. 相关工作：一张连续列表

下表将过程监督、优化基础、进展奖励、信用分配与形式反馈合并整理，按首发年份组织；出版年份或后续版本在必要处注明。表中的验证、数据学习、策略训练和推理时搜索是不同机制，不能仅因使用同一种反馈就合并解释。

<div class="solver-comparison" role="region" aria-label="过程强化学习与形式反馈相关工作连续列表" tabindex="0">

| 工作                                                        | 信号与学习机制                                     | 与本方向的关系及边界                                         |
| ----------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| Training Verifiers，2021 [\[1\]](#ref-1)                    | 学习完整解答验证器，从多个候选中筛选答案           | 建立生成与验证分离的范式；不是形式证明认证。                 |
| Process vs. Outcome Feedback，2022 [\[2\]](#ref-2)          | PRM 引导逐步搜索，再以专家迭代蒸馏轨迹             | 比较答案与过程可靠性；训练机制不能误写为 PPO。               |
| Let's Verify Step by Step，2023 / ICLR 2024 [\[3\]](#ref-3) | 人工过程标签、PRM800K 与候选筛选                   | 提供过程监督基础；筛选结果不等于在线过程 RL。                |
| Math-Shepherd，2023 / ACL 2024 [\[20\]](#ref-20)            | 自动构造步骤监督并用于逐步 PPO                     | 连接过程标签与策略训练；额外推理时筛选收益应单独统计。       |
| StepCoder，2024 [\[26\]](#ref-26)                           | 代码补全课程与执行区域掩码                         | 展示执行反馈下的细粒度优化；不是自然语言逻辑认证。           |
| DeepSeekMath / GRPO，2024 [\[5\]](#ref-5)                   | 同题多输出构造组相对优势                           | 提供优化基础；奖励对象与优势粒度仍需另行设计。               |
| RLSF，2024 [\[7\]](#ref-7)                                  | 将符号工具的错误定位或证书转成细粒度训练反馈       | 说明符号反馈训练已有基础；需明确证书怎样转为信用。           |
| Rewarding Progress / PAV，2024 [\[21\]](#ref-21)            | 学习续写成功价值的步级优势，用于搜索与在线 RL      | 进展依赖续写策略及预算；价值差分本身已有先例。               |
| Free Process Rewards / ImplicitPRM，2024 [\[23\]](#ref-23)  | 从结果标签学习似然比参数化的过程分数               | 无需人工步骤标签；不提供形式有效性保证。                     |
| VinePPO，2024 / ICML 2025 [\[22\]](#ref-22)                 | Monte Carlo 前缀续写估计价值，改进 PPO 信用分配    | 终局目标保持不变，是区分奖励与信用的重要对照。               |
| Lessons of Developing PRMs，2025 [\[4\]](#ref-4)            | 分析人工、模型判断与续写标签及 PRM 评价            | Best-of-$N$ 筛选能力不能替代步骤错误定位。                   |
| Logic-RL，2025 [\[9\]](#ref-9)                              | 逻辑谜题中规则可验证的结果奖励与 GRPO              | 直接结果奖励强基线；答案正确不能替代过程认证。               |
| PRIME，2025 [\[24\]](#ref-24)                               | 结果标签在线更新隐式 PRM，联合过程与结果反馈       | 研究稠密信号进入在线训练；完整流程收益需靠消融归因。         |
| DeepSeek-R1，2025 [\[6\]](#ref-6)                           | 可验证结果奖励、多阶段训练与蒸馏                   | 结果奖励也可塑造推理行为；数学、代码验证不同于逻辑过程认证。 |
| FoVer，2025 [\[8\]](#ref-8)                                 | 将自然语言推理转为一阶逻辑并形式核验               | 验证流水线的直接基础；不宜直接归类为在线 RL。                |
| CoT Monitoring，2025 [\[19\]](#ref-19)                      | 在代码环境中研究推理监测与奖励投机                 | 支持独立审计的必要性；观察不能直接外推到逻辑 Solver。        |
| PACR，2025 [\[25\]](#ref-25)                                | 正确答案条件对数概率的增量，与终局优势结合         | 不需额外 PRM；需要训练答案和逐前缀评分，不是逻辑证明。       |
| LogicReward，2025 / ICLR 2026 [\[10\]](#ref-10)             | 形式评分组织 SFT 和 DPO 数据                       | 属于验证引导的数据与偏好学习；形式化及软统一有语义边界。     |
| ProRAG，2026 [\[27\]](#ref-27)                              | MCTS 过程标签、偏好精炼与双粒度优势                | 将过程反馈用于检索推理；多阶段收益需拆解。                   |
| PRoSFI，2026 [\[11\]](#ref-11)                              | 结构化形式中间步骤，验证后聚合轨迹奖励             | 直接覆盖形式过程训练；检查粒度与策略信用粒度需区分。         |
| Do LLMs Game Formalization?，2026 [\[18\]](#ref-18)         | 研究形式化中的语义忠实性                           | Solver 通过不能保证它证明的就是原题。                        |
| Step-wise Rubric Rewards / SRaR，2026 [\[28\]](#ref-28)     | LLM judge 将评分准则归因到步骤，区分过程与结果优势 | 提供步级信用思路；judge 评价不等于形式认证。                 |
| Beyond Solver Verdicts，2026 [\[17\]](#ref-17)              | 自动形式化中的生成式奖励与 Solver 判定边界         | 提醒形式输入质量与内部证明正确性应分别评价。                 |
| LogicTrack，2026 [\[14\]](#ref-14)                          | 形式审计引导回溯搜索，再使用审核轨迹 SFT           | 搜索收益、训练数据收益与工具成本需分别报告。                 |
| Proof-R1，2026 [\[13\]](#ref-13)                            | 验证状态准入与最终答案支持闭包信用                 | 最接近的后验相关性对照；保证依赖给定形式前提。               |
| Counterfactual Rollout Replay，2026 [\[15\]](#ref-15)       | 在可恢复环境中重放替代动作，以终局差构造过程优势   | 提供反事实信用思路；环境恢复与新增续写并非免费。             |
| SPRING，2026 [\[12\]](#ref-12)                              | Z3 有效性、一致性、非冗余监督与 GRPO               | 最接近的非冗余对照；未重复不代表对当前目标有用。             |
| DARS，2026 [\[16\]](#ref-16)                                | 先决条件依赖图、进展表示与奖励塑形                 | 依赖感知进展已有邻近研究；图来源不同于形式认证依赖。         |

</div>

## 3. 过程强化学习：进展奖励与信用分配

### 3.1 背景及问题

设问题为 $x$，执行动作 $a_t$ 后的前缀为 $s_t=(x,a_1,\ldots,a_t)$，终局成功标记为 $Y\in\{0,1\}$。过程信号希望区分不同中间动作，但必须说明它究竟估计局部正确性、后续成功价值，还是动作对目标的贡献。

这一专题的问题是：**怎样构造“这一步使任务更容易完成”的反馈，并确认它优于可靠终局奖励加更准确信用估计的组合？** 正确但无关的事实、可恢复的错误前缀与有价值的回溯，都说明局部正确性和后续成功不是同一个量。

### 3.2 相关工作进展

**从过程标签进入策略训练。** Uesato 等人采用 PRM 引导搜索与专家迭代；Let's Verify 重点是过程奖励模型训练及候选筛选；Math-Shepherd 则自动构造监督并进行逐步 PPO。后者在 Mistral-7B 上报告 GSM8K 从 77.9% 提升至 84.1%，MATH 从 28.6% 提升至 33.0%；加入推理时筛选后的 89.1% / 43.5% 属于另一设置。[\[2\]](#ref-2)、[\[3\]](#ref-3)、[\[20\]](#ref-20)

**续写成功价值：PAV。** 固定续写策略 $\rho$、采样配置与剩余预算，定义

$$
q_\rho(s)=\Pr_\rho(Y=1\mid s),\qquad
r_t^{\mathrm{PAV}}=q_\rho(s_t)-q_\rho(s_{t-1}).
$$

在确定性前缀转移、仅有终局成功奖励且不折扣的理想设定下，该差分对应续写策略的步级优势。PAV 学习这种进展信号并用于搜索或在线 RL，在其设置中相对 ORM 报告约 5–6 倍样本效率收益。[\[21\]](#ref-21) 更强的续写者并不自动产生更好的信号：若它从几乎所有前缀都能恢复成功，价值差可能失去区分度。续写者与当前策略的互补性、动作区分能力及预算都是奖励定义的一部分。

**答案置信度增量：PACR。** 给定训练时正确答案 $y^\ast$，使用

$$
C_t=\log p_\theta(y^\ast\mid s_t)
-\log p_\theta(y^\ast\mid s_{t-1}).
$$

PACR 将该代理信号与终局优势结合；Dense-PACR 保留步级信息。它不要求与标准推理逐字对齐，但需要已知答案及逐前缀概率计算。论文中三种模型在五个基准上的平均 pass@1 分别增加 2.5、3.0、3.0 个百分点，部分单项下降。[\[25\]](#ref-25) 似然上升不是证明，且受答案表面形式、提示与校准影响。

**保持终局奖励，改善信用：VinePPO。** 从前缀 $s$ 按策略 $\pi$ 采样 $K$ 条续写，可估计

$$
\widehat V^\pi(s)=\frac{1}{K}\sum_{j=1}^{K}Y(\tau^{(j)}),
\qquad \tau^{(j)}\sim\pi(\cdot\mid s).
$$

VinePPO 用 Monte Carlo 价值估计改善 PPO 信用分配，核心并非新增一个步骤正确性奖励。[\[22\]](#ref-22) 因此，若证明进展训练有效，需要进一步排除收益只是来自更好的终局信用估计；额外续写开销也应计入比较。

**从结果标签恢复稠密信号：ImplicitPRM 与 PRIME。** 一种隐式过程奖励参数化为

$$
r_t^{\mathrm{imp}}=\beta\log
\frac{\pi_\phi(a_t\mid s_{t-1})}{\pi_{\mathrm{ref}}(a_t\mid s_{t-1})}.
$$

ImplicitPRM 研究结果标签下的似然比奖励；PRIME 将其在线更新并用于策略训练。[\[23\]](#ref-23)、[\[24\]](#ref-24) 稠密分数不需要人工步骤标签，但仍是学习信号，不能继承 Solver 逐次检查的保证。SRaR 进一步展示了评分准则向具体步骤归因的路线。[\[28\]](#ref-28)

### 3.3 存在的待解决问题

**进展的对象尚需定义。** 若完整前提 $\Gamma$ 已经蕴含 $c$，则

$$
\operatorname{Mod}(\Gamma)=\operatorname{Mod}(\Gamma\land c).
$$

合法演绎没有缩小完整理论的语义模型集合。可以改变的是显式事实、可复用引理、未完成证明义务和受限搜索工作量。因此，不能把合法命题增加直接解释为语义信息增益。

**进展依赖策略、预算与动作粒度。** 同一结论对不同目标或搜索程序可能有不同价值。预算内未找到证明不是不可证明；拆步、合步和合法跳步也可能改变距离。奖励必须与固定接口绑定，并检查对表达及粒度的稳健性。

**逐步检查不等于逐步信用。** 过程分数若先汇总成轨迹标量，再交给标准轨迹级 GRPO，同一轨迹的不同动作仍可能共享优势。奖励语义、聚合方式、优势估计与 token 对齐必须分别说明。

**计算与投机可能解释表面提升。** 逐步正奖可能鼓励无关合法事实，单调置信度偏好可能压制有效回溯，形式化也可能弱化原题。训练奖励上升必须由独立完整证明审核及同总预算对照支持。[\[17\]](#ref-17)–[\[19\]](#ref-19)

### 3.4 拟定的方案或想法

拟检验假设是：**在形式有效性已经控制的条件下，目标条件化、预算受限的剩余证明工作估计，能以可承受成本改善完整证明率或同预算效率。** 首版使用核对后的形式输入和 Solver 反馈；学习型 PRM、置信度增量及续写价值差作为外部或离线诊断，不同时引入第二个需要训练的奖励模块。

推进顺序是先验证信号，再验证训练：构造同状态同目标的有用、无关、重复和回溯动作配对集，检查区分能力与独立后续效用；随后核对步级优势及变长掩码，进行小规模多种子训练。只有相对最强同预算对照获得可重复收益，才扩大任务或模型。

## 4. 主线方案：Solver 证明进展过程奖励

### 4.1 可信输入、原子动作与状态

输入为经过核对且一致的形式前提 $\Gamma$ 和固定目标 $q$。状态 $S_t$ 保存显式事实 $E_t$、允许的规则和已审核依赖图。模型提交动作

$$
a_t=(D_t,c_t,\rho_t),
$$

其中 $D_t$ 为引用的事实编号，$c_t$ 为结论，$\rho_t$ 为获准规则或证书。先检查格式、依赖权限和规则应用，再检查前提一致性与 $D_t\models c_t$；只有通过的结论进入可信状态。

对蕴含检查，$D_t\land\neg c_t$ 为 `UNSAT` 支持该结论，`SAT` 给出反例，`UNKNOWN` 表示未完成判定。前提不一致、解析失败与超时分别记录。未判定动作不进入可信状态，也不被标成逻辑错误。

动作体系必须固定粒度。如果允许任意提交“$\Gamma\models q$，所以输出 $q$”作为单步动作，证明距离就失去区分意义。首版宜从有限、可规范化的规则环境开始，再扩展到可提供可靠形式输入的逻辑谜题；自由文本自动形式化留作后续变量。

### 4.2 受限剩余证明距离

固定动作体系、搜索程序、最大深度 $h$ 和节点展开预算 $B$，令 $\mathcal P_{h,B}(S,q)$ 为预算内实际找到的合法续接证明，定义

$$
\widehat d_{h,B}(S,q)=
\begin{cases}
0, & q\text{ 已由显式证明完成},\\
\min_{\pi\in\mathcal P_{h,B}(S,q)}|\pi|,
& \mathcal P_{h,B}(S,q)\ne\varnothing,\\
h+1, & \text{预算内未找到证明}.
\end{cases}
$$

这里的 $h+1$ 是截断标记，不是不可证明的判定。找到的最短续接仅相对于已搜索到的候选；除非穷尽对应空间，不能称为真实最短证明。

拟采用单一势函数及合法动作反馈：

$$
\Phi(S,q)=-\frac{\widehat d_{h,B}(S,q)}{h+1},\qquad
r_t^{\mathrm{prog}}=\Phi(S_{t+1},q)-\Phi(S_t,q)-\eta\bar\kappa_t.
$$

$\bar\kappa_t$ 为按固定尺度归一化的动作验证与进展探测成本。相邻状态使用规范化缓存和增量求解，记录实际开销。首版不混合距离、依赖闭包与反事实分数；这些机制分别作为对照。若大量前后状态都落在截断区而反馈近乎为零，应先调整任务或估计器。

### 4.3 保留过程信号的训练接口

不折扣的势差满足

$$
\sum_{t=0}^{T-1}\bigl[\Phi(S_{t+1},q)-\Phi(S_t,q)\bigr]
=\Phi(S_T,q)-\Phi(S_0,q).
$$

同题成功轨迹若起终点势值相同，简单求和会消去中间路径差异。因而“势差总和加到轨迹奖励”只作为朴素消融，不能直接当作步骤信用已经实现。

主方案拟将后续过程回报与对应动作的 token 区间对齐，再结合终局组内优势。对同题第 $g$ 条轨迹：

$$
G_{g,t}^{\mathrm{prog}}=\sum_{u=t}^{T_g-1}r_{g,u}^{\mathrm{prog}},\qquad
\widehat A_{g,t}=\widehat A_g^{\mathrm{out}}
+\beta\widehat A_{g,t}^{\mathrm{prog}}.
$$

过程优势的基线、尺度归一化、截断和变长掩码尚需实现核对；不同轨迹步号相同不代表状态可直接比较。这是拟扩展的过程版 GRPO 接口，而非仅更换一个标量奖励。上述恒等式也不为实际优化提供策略不变性或性能提升保证。

### 4.4 关键对照与评价

在同一初始化、数据、动作权限和终局评价下，计划比较：

1. **Base / SFT 与 outcome-only GRPO：** 确认结果奖励和训练本身的收益。
2. **Solver-validity：** 只使用合法性反馈，判断进展是否提供额外信息。
3. **SPRING-like：** 采用明确参照集合的非冗余机制。
4. **Proof-R1-like：** 以成功证明的答案支持闭包分配信用。
5. **Solver proof progress：** 消融目标条件化、探测预算、成本项及步级接口。
6. **终局奖励不变的信用控制组：** 改善价值或优势估计，区分奖励语义与信用估计的作用。

“-like”表示统一环境中的机制对照，只有按原文配置复现后才报告原方法复现结果。冻结续写价值差与 PACR 可在资源允许时作为离线代理比较；主训练信号仍来自 Solver。

**主要终点是答案正确且完整支持证明通过独立审核的比例。** 同时报告答案准确率、所有生成动作的有效率、无关合法动作比例、成功证明长度、解析失败及 UNKNOWN / 超时率。只统计已接纳动作的有效率会趋于平凡满分，不能替代全体生成动作的评价。

成本分别按相同生成 token / rollout 预算和相同总计算预算比较。后者计入 Solver 与探测的 CPU 工作、GPU 生成及训练、端到端耗时，允许基线把省下的资源用于额外采样。调用次数相同不代表计算量相同。

进展信号用独立搜索配置或冻结续写策略检查后续成功与成本，不仅复查训练评分。训练至少比较三个随机种子，报告题目级配对区间和种子间波动；泛化测试覆盖更深证明、未见规则组合、实体 / 谓词重命名，以及重复、拆步、跳步和无关事实。

## 5. 研究进展与可选课题

已有研究形成三条相连路线：过程标签和验证器；目标进展、隐式奖励及信用估计；形式有效性、非冗余性与答案依赖。逐步打分、价值差分和依赖塑形都有前序。当前研究空间应通过机制区别和实验增量界定，不能只以“使用 Solver”或“引入过程奖励”作为创新主张。

可选课题按与当前主线的关系排列：

1. **目标条件化证明进展（主线）：** 在合法性、非冗余和后验依赖之外，检验受限剩余证明工作是否带来额外收益。
2. **奖励与信用的机制区分：** 保持终局目标不变，对比价值估计和过程奖励，拆解各自贡献。
3. **步骤粒度与有效回溯：** 构造拆步、合步、重述和纠错配对，检验分数是否稳定识别有用行为。
4. **低成本进展估计：** 研究缓存、增量求解和选择性探测；若信号有效但过贵，再考虑蒸馏估计器。
5. **形式化噪声与反事实贡献：** 主结果成立后，引入受控语义扰动、依赖删改与替代续接，评价忠实性和重放成本。

首阶段的推进条件是信号非平凡、能够反映独立后续效用且成本可承受；训练后的推进条件是最强同预算对照下存在跨种子的可重复收益。如果改进仅出现在训练评分、只来自长度惩罚或被探测成本抵消，应回到信号定义与接口分析。

阅读可从 PRM800K、Math-Shepherd 建立监督与训练概念，再比较 PAV、PACR、VinePPO、PRIME，最后对照 PRoSFI、SPRING 与 Proof-R1。实现入口包括 [PRM800K](https://github.com/openai/prm800k)、[VinePPO](https://github.com/McGill-NLP/VinePPO)、[ImplicitPRM](https://github.com/PRIME-RL/ImplicitPRM)、[PRIME](https://github.com/PRIME-RL/PRIME) 和 [Z3 Guide](https://microsoft.github.io/z3guide/)。语义保真背景见本站[自动形式化研究笔记](/blog/autoformalization-research-overview/)。

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

<p id="ref-20">[20] Peiyi Wang, Lei Li, Zhihong Shao et al. <a href="https://aclanthology.org/2024.acl-long.510/">Math-Shepherd: Verify and Reinforce LLMs Step-by-step without Human Annotations</a>. ACL, 2024, pp. 9426–9439.</p>

<p id="ref-21">[21] Amrith Setlur, Chirag Nagpal, Adam Fisch et al. <a href="https://arxiv.org/abs/2410.08146">Rewarding Progress: Scaling Automated Process Verifiers for LLM Reasoning</a>. arXiv, 2024.</p>

<p id="ref-22">[22] Amirhossein Kazemnejad, Milad Aghajohari, Eva Portelance et al. <a href="https://arxiv.org/abs/2410.01679">VinePPO: Refining Credit Assignment in RL Training of LLMs</a>. arXiv, 2024; ICML, 2025.</p>

<p id="ref-23">[23] Lifan Yuan, Wendi Li, Huayu Chen et al. <a href="https://arxiv.org/abs/2412.01981">Free Process Rewards without Process Labels</a>. arXiv, 2024.</p>

<p id="ref-24">[24] Ganqu Cui, Lifan Yuan, Zefan Wang et al. <a href="https://arxiv.org/abs/2502.01456">Process Reinforcement through Implicit Rewards</a>. arXiv, 2025.</p>

<p id="ref-25">[25] Eunseop Yoon, Hee Suk Yoon, Jaehyun Jang et al. <a href="https://arxiv.org/abs/2510.22255">PACR: Progressively Ascending Confidence Reward for LLM Reasoning</a>. arXiv, 2025.</p>

<p id="ref-26">[26] Shihan Dou, Yan Liu, Haoxiang Jia et al. <a href="https://arxiv.org/abs/2402.01391">StepCoder: Improve Code Generation with Reinforcement Learning from Compiler Feedback</a>. arXiv, 2024.</p>

<p id="ref-27">[27] Zhao Wang, Ziliang Zhao, Zhicheng Dou. <a href="https://arxiv.org/abs/2601.21912">ProRAG: Process-Supervised Reinforcement Learning for Retrieval-Augmented Generation</a>. arXiv, 2026.</p>

<p id="ref-28">[28] Weichu Xie, Haozhe Zhao, Wenpu Liu et al. <a href="https://arxiv.org/abs/2605.17291">Step-wise Rubric Rewards for LLM Reasoning</a>. arXiv, 2026.</p>

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
