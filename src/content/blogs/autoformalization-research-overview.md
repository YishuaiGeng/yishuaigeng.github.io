---
title: '自动形式化研究综述：从语言翻译到语义可靠的形式推理'
date: 2026-10-06
description: '梳理自动形式化的任务边界、经典工作与近期进展，讨论语义验证、诊断修复、强化学习、证明结构和理论规模形式化的关键问题与研究前景。'
categories: [Paper Reading]
tags: [Autoformalization, Logical Reasoning, Formal Methods, LLM]
math: true
toc: true
relatedPosts: true
mermaid: false
---

**摘要。** 自动形式化（Autoformalization）研究如何把自然语言中的陈述、规则、约束和证明转换为具有明确语义、能够接受机器检查的形式表示。大语言模型显著降低了这种转换的门槛，也使一个长期存在的问题更加突出：形式系统能够检查给定表示内部的性质，但原文与表示之间的语义对应仍需要独立论证。本文围绕任务定义、生成与检索、语义验证、诊断修复、学习方法及结构扩展，梳理该方向的经典基础和近期进展。本文认为，值得持续关注的研究问题包括具有明确覆盖边界的语义检查、诊断到修复的有效转化、风险约束下的验证预算分配，以及跨表示依赖的维护。对于逻辑谜题，有限域、可执行约束和可构造反例提供了较为清晰的研究起点。

**关键词：** 自动形式化；语义保真；神经符号推理；形式验证；逻辑谜题。

## 1. 研究背景：语言理解与形式保证之间的接口

自然语言适合表达目标、解释概念和传递背景知识，但常常省略变量域、默认假设和推理步骤。形式语言要求这些信息以明确的类型、量词、逻辑关系或程序约束表达出来。自动形式化的基本任务，就是在两者之间建立可检查的对应关系。

在数学中，输入可以是一条定理及其证明，输出可以是 Lean 或 Isabelle 中的声明与证明项；在自然语言逻辑推理中，输入可以是一组事实和规则，输出可以是一阶逻辑公式；在逻辑谜题中，输入通常需要转换为有限域上的变量、关系及约束，再由 SMT、SAT 或约束求解器求解。不同应用共享“保持原意”这一目标，但其允许的背景知识、表示语言和检查条件并不相同。[\[1\]](#ref-1)、[\[2\]](#ref-2)

早期规则方法和受控自然语言方法依靠预先定义的语法与词汇建立转换关系，覆盖范围受到人工建模成本的限制。大语言模型利用预训练中形成的语言与代码知识，将自动形式化扩展到更丰富的表达。Wu 等人的工作展示了用语言模型生成 Isabelle 陈述并辅助自动证明的可行性；Logic-LM 和 LINC 则把这一分工带入自然语言逻辑推理，使语言模型承担解释与形式化，符号工具承担精确推理。[\[3\]](#ref-3)、[\[4\]](#ref-4)、[\[5\]](#ref-5)

这一架构的价值在于，形式工具能够返回明确的可满足性结果、反例或证明证据。然而，工具处理的对象始终是收到的形式表示。若模型遗漏了一条关键约束，求解器完全可能对错误的问题给出正确的解。因此，系统可靠性取决于两个接口：**原文是否被忠实表示，以及后续结论是否确实由该表示支持。**

<figure>
  <img src="/assets/img/autoformalization/semantic-interface.svg" alt="自动形式化的两个检查接口：自然语言经形式化得到形式表示，再由求解器产生答案；语义检查连接原文与表示，执行检查连接表示与答案。" width="1120" height="450" loading="lazy" />
  <figcaption>图 1. 自动形式化在语言理解与形式推理之间的位置。语义检查与执行检查回答不同问题，两者共同决定端到端可靠性。图为本文整理。</figcaption>
</figure>

## 2. 任务边界：究竟需要形式化什么、保证什么

### 2.1 陈述、约束、证明与理论库

讨论研究进展之前，需要区分形式化的对象。同一篇论文报告的“成功率”，可能指完全不同的产物。

<div class="af-comparison" role="region" aria-label="形式化任务层次对照" tabindex="0">

| 任务层次         | 典型输入与输出                                | 主要困难                                     |
| ---------------- | --------------------------------------------- | -------------------------------------------- |
| 陈述形式化       | 自然语言定理 → 带类型、假设和结论的形式声明   | 量词、类型、隐含条件及库概念的选择           |
| 规则与约束形式化 | 事实、规则或谜题 → 逻辑公式、约束程序         | 开放／封闭世界假设、有限域、排他性及全局约束 |
| 证明形式化       | 非形式证明 → 机器可检查的证明步骤与依赖       | 中间引理补全、步骤对应和原论证结构的保留     |
| 理论规模形式化   | 教材或研究文本 → 相互依赖的定义、定理与证明库 | 概念复用、跨文件一致性、抽象设计及版本维护   |

</div>

陈述形式化与自动定理证明密切相关，但评价对象不同。一个证明器成功证明了候选定理，不能单独说明候选定理忠实于自然语言；一个忠实的陈述也可能超出当前证明器的能力。ProofNet、LeanEuclid 以及 Theory-Level Autoformalization 分别提供了本科数学、欧氏几何和理论规模任务的观察窗口。[\[6\]](#ref-6)、[\[7\]](#ref-7)、[\[8\]](#ref-8)

### 2.2 评价保证需要分层

统一自动形式化框架区分理想的语义准则与可计算的验证准则：前者描述希望保留的含义，后者描述实际能够执行的检查。二者之间的差距，是理解本领域评价结果的关键。[\[1\]](#ref-1)

<div class="af-comparison" role="region" aria-label="评价保证层次对照" tabindex="0">

| 检查对象     | 通过检查能够支持的结论           | 仍需另外检查的内容                     |
| ------------ | -------------------------------- | -------------------------------------- |
| 语法与类型   | 表示符合目标语言的语法和类型规则 | 是否遗漏条件、误用概念或改变量词       |
| 执行或证明   | 工具对给定形式对象完成求解或证明 | 形式对象是否表达了原问题               |
| 最终答案     | 当前查询的输出与标签一致         | 其他配置、查询与反事实条件是否一致     |
| 相对参考等价 | 候选与指定参考在明确背景下等价   | 参考本身是否正确、背景是否合适         |
| 原文语义保真 | 在规定解释与评价协议下保留原意   | 歧义、未检查性质以及协议覆盖之外的情况 |

</div>

给定背景约束 $\Gamma$、候选公式 $F$ 与参考公式 $F^\star$，在统一变量域和符号解释后，可以通过检查

$$
\Gamma\land(F\oplus F^\star)
$$

是否可满足来寻找二者的区分模型。其中 $\oplus$ 表示异或；若公式可满足，模型给出它们真值不同的情形；若工具证明不可满足，则二者在该背景下等价。这里的保证依赖参考正确性、逻辑与求解器支持范围，也需要排除背景本身不一致导致的平凡等价。超时或 `unknown` 都不能视为等价证明。

自然语言还可能允许多个合理解释。例如，“每位学生都读过一本书”通常对应

$$
\forall s\in S\;\exists b\in B:\operatorname{Read}(s,b),
$$

而不能随意改写为

$$
\exists b\in B\;\forall s\in S:\operatorname{Read}(s,b).
$$

两名学生各读一本不同的书，就能区分这两种陈述。形式工具可以检查这个区分情形，但应采用哪一种解释，仍然需要回到原文、上下文或显式标注协议。这也解释了为什么“再调用一次求解器”无法自动消除所有语义不确定性。

## 3. 相关工作的主要研究脉络

本节按解决的问题组织文献。同一路线内部仍可能存在形式语言、数据集和人工参与程度的差异；表中的方法应作为研究机制对照，而非同一排行榜上的性能比较。

### 3.1 生成、库检索与反馈修订

大模型生成形式代码后，最直接的改进方式是利用编译错误修订输出。随着基础语法能力提高，研究进一步处理目标库中“应该引用什么定义、定理或接口”的问题。这一变化很重要：形式表示经常可以写成多种等价形式，但只有与现有库兼容的表示，才能方便地证明、组合和复用。

<div class="af-comparison" role="region" aria-label="生成与检索相关工作" tabindex="0">

| 工作                                                                                | 主要做法                                                           | 对领域的意义与边界                                             |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------- |
| Autoformalization with LLMs（NeurIPS 2022）[\[3\]](#ref-3)                          | 将自然语言数学陈述转为 Isabelle 表示，并利用形式化结果辅助证明学习 | 建立大模型自动形式化的早期实证基础；生成率与忠实率仍需分开     |
| Logic-LM（EMNLP Findings 2023）、LINC（EMNLP 2023）[\[4\]](#ref-4)、[\[5\]](#ref-5) | 将语言解释与符号求解分工，并利用工具反馈改进流程                   | 说明精确求解的价值，也暴露自然语言到形式表示这一接口的瓶颈     |
| Don't Trust: Verify（ICLR 2024）[\[9\]](#ref-9)                                     | 将候选解答形式化，用证明工具检查并参与候选选择                     | 验证可辅助推理，但结果同时受形式化器、证明器和候选预算影响     |
| BEq／RAutoformalizer（ICLR 2025）[\[10\]](#ref-10)                                  | 引入双向可证明性评价，并检索形式库中的相关依赖辅助生成与修复       | 推动评价超越字符串相似度；可证明性检查仍依赖背景与证明搜索能力 |
| LTRAG（ACL Findings 2025）[\[11\]](#ref-11)                                         | 分别检索带推理说明的翻译与修复示例，引导逻辑程序生成和纠错         | 经验覆盖有助于复杂约束翻译，但运行反馈容易遗漏可执行的语义错误 |
| DDR（ACL 2026）[\[12\]](#ref-12)                                                    | 直接生成候选库依赖，通过符号存在性检查后提供给数学形式化器         | 将库依赖视为明确的研究对象；符号存在不等于概念适用             |
| Draft-and-Prune（arXiv 2026）[\[13\]](#ref-13)                                      | 生成多种自然语言建模计划，转成可执行形式表示，并剪除不合条件的候选 | 关注建模策略多样性；筛选仍可能依赖不完备信号和额外采样预算     |

</div>

这条路线已形成较完整的“生成—检查—修订”流程。下一步需要进一步识别失败来源：库符号缺失、声明类型错误、语义误译、证明搜索不足，可能产生相似的失败反馈，却需要不同的修复动作。把所有失败都交给同一个自由文本提示，容易增加尝试次数而没有改善诊断质量。

### 3.2 语义验证：从答案与编译结果转向表示含义

语义检查大致可以分为三类：依赖指定参考的等价性检查，依赖实例、辅助陈述或往返翻译的代理检查，以及通过训练得到的对齐判别器。三者在监督成本、运行成本和可提供的保证上各有边界。

<div class="af-comparison" role="region" aria-label="语义验证相关工作" tabindex="0">

| 工作                                                                  | 核心机制                                               | 阅读时应注意的限制                                                 |
| --------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------ |
| LeanEuclid（ICML 2024）[\[7\]](#ref-7)                                | 在欧氏几何领域结合形式表示与自动等价检查               | 保证依赖领域理论与表示约定，不能直接外推到所有自然语言任务         |
| SymEq／SemCo（NeurIPS 2024）[\[14\]](#ref-14)                         | 比较候选之间的语义等价关系，以语义一致性辅助选择       | 多个候选可能共享同一误解；一致性本身不是原文忠实性的充分条件       |
| FormalAlign（arXiv 2024）[\[15\]](#ref-15)                            | 学习自然语言与形式陈述之间的对齐分数                   | 低成本判别有用，但分数校准和分布外表现需要独立检验                 |
| SSV（IJCAI 2025）[\[16\]](#ref-16)                                    | 用实例化与模型检查约束自然语言到形式表示的转换         | 有限实例不能自动覆盖所有语义；被接受子集的精确率需与覆盖率同时报告 |
| Roundtrip Verification（arXiv，最新修订 2026-09-21）[\[17\]](#ref-17) | 形式化、反向翻译、再形式化，再检查两端公式等价性       | 闭环自洽可能与共同误译并存；定点修复效果依赖阶段诊断可靠性         |
| ShadowBench（EMNLP 2026）[\[18\]](#ref-18)                            | 利用辅助语义陈述进行双向测试，评估形式化的语义对齐     | 检查能力依赖辅助陈述的正确性与覆盖程度                             |
| BPF（ICML 2026 MusML Workshop）[\[19\]](#ref-19)                      | 以语义探针形成行为指纹，并考虑探针选择的预算           | 有限探针通过不能无条件推出任意语义等价，需明确可分离的错误类别     |
| GenV（arXiv，最新修订 2026-09-11）[\[20\]](#ref-20)                   | 将离线参考等价监督训练成部署时不输入参考的生成式验证器 | 推理接口无需参考，训练标签仍依赖参考；排序指标也不等于可靠性保证   |

</div>

GenV 提出的 **Verdict-Preserving Unfaithfulness（VPU）** 尤其值得关注：一个形式化可能已经偏离参考，却仍输出预期的 Solver 判定。它使“答案正确而表示错误”成为可以主动构造和测量的失败类型。对于逻辑谜题，删除一条暂时冗余的约束、改变未被当前查询触及的关系，均可能形成类似情形。[\[20\]](#ref-20)

从方法选择看，形式等价检查适合有可靠参考且工具支持目标理论的场景；实例与探针适合构造可解释的局部证据；学习判别器适合承担低成本筛选。将这些机制组合使用时，仍应明确每一次通过或失败究竟排除了哪些错误。

### 3.3 诊断与修复：把评价转化为可执行反馈

二值的“正确／错误”难以指导复杂修复。诊断方法进一步回答错误属于哪一类、位于哪个原文片段或形式子式，以及应当修改什么。

PrefRAG 以正确与错误程序的偏好对组织修复经验，通过检索引导语义纠错。FormalRx 将评价拆分为对齐判断、错误分类、位置定位和代码纠正，并用 SCI 分类体系组织 28 类错误。Proxy-Judge 则探索没有金标准形式化时的全局、模块及原文对齐检查。Roundtrip Verification 通过故障阶段定位缩小修改范围，VERGE 利用形式检查与冲突信息产生局部反馈。[\[17\]](#ref-17)、[\[21\]](#ref-21)、[\[22\]](#ref-22)、[\[23\]](#ref-23)、[\[24\]](#ref-24)

<figure>
  <img src="/assets/img/autoformalization/formalrx-taxonomy.webp" alt="FormalRx 的 SCI 错误分类图，按语义、约束和实现三个维度组织 28 类错误。" width="1800" height="772" loading="lazy" />
  <figcaption>图 2. FormalRx 的 SCI 错误分类。原论文图 2，来源：<a href="https://proceedings.mlr.press/v306/wang26cg.html">Wang 等，ICML 2026</a>。分类体系的覆盖范围与模型实际能够诊断的范围应分别评价。</figcaption>
</figure>

这一进展使研究目标从“提高一个总体准确率”细化到可观察的中间功能。不过，**诊断正确、修复有效、修复后保持其他条件**是三个不同问题。生成一段合理的解释，不一定能让模型执行正确修改；改对一个量词，也可能破坏另一个约束。对于多轮系统，应记录修改对象、依据及影响范围，并检查先前结论是否仍然有效。

修复还存在改变任务的风险。Formalization Gaming 和法律推理中的 Know Your Limits 分析了通过改变假设、作用域或目标，使形式检查变得容易的情形。一个系统如果只优化编译率、可证明率或最终标签，就可能把这种语义漂移当作成功修复。[\[25\]](#ref-25)、[\[26\]](#ref-26)

### 3.4 学习与数据：让形式反馈进入模型训练

训练路线主要涉及形式化器、反思与修复策略、语义判别器，以及使用形式反馈的推理模型。区分被训练的对象，有助于避免把不同能力统称为“学会验证”。

<div class="af-comparison" role="region" aria-label="学习与数据相关工作" tabindex="0">

| 工作                                                                                | 训练对象与信号                                                 | 主要研究问题                                                         |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| FormaRL（COLM 2025）[\[27\]](#ref-27)                                               | 结合 Lean 语法检查与语言模型一致性反馈，使用 GRPO 训练形式化器 | 无配对标注仍可能依赖有噪声的语义奖励；需检查训练题目与评测题目的关系 |
| ReForm（ICLR 2026）[\[28\]](#ref-28)                                                | 将陈述生成、语义批评和修订组织成序列，并设计 PBSO 优化         | 如何学习有用的反思，避免生成者与评价者共享错误                       |
| LogicReward（ICLR 2026）[\[29\]](#ref-29)                                           | 以形式工具产生逐步逻辑监督，主要通过 SFT 和 DPO 改善推理       | 形式化与语义桥本身影响监督可信度，不能把它简单归为同一种在线 RL 方法 |
| MathForm（arXiv 2026）[\[30\]](#ref-30)                                             | 结合库检索、验证引导修订和数据构造，训练数学形式化模型         | 数据量、候选多样性与语义质量分别贡献多少                             |
| FormalAlign、GenV、FormalRx [\[15\]](#ref-15)、[\[20\]](#ref-20)、[\[22\]](#ref-22) | 学习对齐分数、参考等价判断或细粒度诊断                         | 教师标签的可靠性，学生真实错误分布，以及判别是否能改善后续行为       |

</div>

这些工作说明，形式工具可以参与生成训练数据、提供奖励、选择候选或指导修复。但工具信号的强弱并不相同。类型检查器提供的是类型正确性，参考等价检查提供的是相对于参考的等价性，模型 Judge 提供的则是学习得到的判断。训练时若把这些信号混成一个“正确奖励”，模型可能学会满足代理指标而没有改善语义保真。

### 3.5 证明结构、理论规模与领域扩展

当对象从单条陈述扩展到完整证明时，结论正确也不能充分反映原证明是否被忠实转换。ProofFlow 将原论证组织为依赖图，把步骤转成显式依赖中间引理的形式陈述，再补全证明。它将结构保真纳入评价，使“证明了同一个结论”和“形式化了这份证明”之间的区别变得可测量。[\[31\]](#ref-31)

<figure>
  <img src="/assets/img/autoformalization/proofflow-framework.webp" alt="ProofFlow 框架：Graph Builder 构建依赖图，Formalizer 生成中间引理，Tactic Completer 结合 Lean 错误反馈补全证明。" width="1592" height="843" loading="lazy" />
  <figcaption>图 3. ProofFlow 的依赖图、引理形式化与证明补全流程。原论文图 3，来源：<a href="https://proceedings.iclr.cc/paper_files/paper/2026/file/5fce5198dbf92d5ff45f74504431e2ff-Paper-Conference.pdf">Cabral 等，ICLR 2026</a>。</figcaption>
</figure>

Theory-Level Autoformalization 进一步把定义、公理、记号、引理和证明之间的依赖作为研究对象。LCS-Bench 提供教材层面的具体任务，Theo 探索研究数学中的库外代理形式化，Relaxed Natural Formal Language 则以中间表示延迟部分证明义务的处理。MathAtlas 将范围扩展到真实数学文本中的陈述和定义。[\[8\]](#ref-8)、[\[32\]](#ref-32)、[\[33\]](#ref-33)、[\[34\]](#ref-34)、[\[35\]](#ref-35)

这一扩展还出现在规则验证、硬件规范和多模态输入中。ARc 处理自然语言模型构建与验证；DRAM 规范形式化需要区分轨迹逻辑和时间约束；MMFormalizer 把视觉条件纳入形式表示；NL2FOL 则讨论自然语言论证与一阶逻辑检测。[\[36\]](#ref-36)、[\[37\]](#ref-37)、[\[38\]](#ref-38)、[\[39\]](#ref-39) 这些领域提示了不同的困难：有限测试范围、长程状态、隐含假设和视觉信息完整性。领域覆盖的扩大并不自动意味着一个统一系统已经能够可靠处理所有这些任务。

## 4. 近期进展：哪些能力已经改善，证据支持到哪里

综合上述文献，近期研究可以概括为四个变化：评价对象从可执行性扩展到语义；反馈从二值结果扩展到结构化诊断；验证信号进入训练与推理决策；形式化对象从独立陈述扩展到依赖结构和知识库。以下结果有助于理解这些变化，但它们来自不同协议，不能相互排名。

**反思与语义评价。** ReForm 报告其 32B 模型在文中多基准平均语义指标上达到 72.7%，同规模基线为 50.1%，相差 22.6 个百分点。该结果支持反思与训练设计的有效性，但语义指标依赖文中的评价器与协议，并非全部由完备形式等价证书给出。[\[28\]](#ref-28)

**细粒度诊断。** FormalRx-8B 主表的对齐判断 F1 为 0.881、分类 F1 为 0.709、定位准确率为 0.750、纠正准确率为 0.729。训练集包含 56,287 对样本；定位与纠正评价结合规范化匹配及对未匹配项的模型判断。这表明专门训练可以提升诊断功能，也提示自然生成错误、组合错误及跨语言迁移仍需单独评估。[\[22\]](#ref-22)

**答案之外的语义判别。** GenV+HN 在 950 条真实输出上报告 0.961 AUROC，并在排除与训练源文本重叠后的 652 条子集上报告 0.955。它证明了学习判别器可以识别仅看 Solver 结论难以发现的错误；AUROC 衡量的是排序能力，实际部署还需确定阈值、误放行率与拒绝检查的覆盖率。[\[20\]](#ref-20)

**结构忠实性。** ProofFlow 正式版在 184 道问题的 Pass@5 设置下报告 ProofScore 0.545，高于全文形式化与逐步 tactic 基线的最佳值 0.279 和 0.046。但其对应的整篇语法通过率为 0.375，低于全文形式化 thinking 设置的 0.571；输出成本约为 94.2K token／题。这个比较说明，结构保真、编译成功和计算成本需要并列报告。[\[31\]](#ref-31)

**诊断与系统收益之间仍有距离。** Roundtrip Verification 的结果显示，定点修复优势受到诊断器可靠性的制约；GenV 的分析也区分了建议反馈与扩大采样预算的作用。因此，更好的判断分数不应直接被解读为更好的完整系统。需要在相同候选数、token 和工具预算下，测量诊断实际改变了哪些动作以及最终结果。[\[17\]](#ref-17)、[\[20\]](#ref-20)

## 5. 尚未解决的关键问题

### 5.1 自然语言意图与验证覆盖

自然语言中的默认知识、指代和歧义，使“正确形式化”有时不是唯一对象。即使有人工参考，也需要明确哪些假设来自原文、哪些来自领域常识、哪些是为便于求解而加入的约定。若这些来源混在一起，评测可能奖励与某个参考风格相似的输出，却惩罚另一种合理建模。

另一方面，有限探针、反向翻译和多模型一致性都存在覆盖不足。多个判断器可能共享同一种概念混淆，反向翻译也可能把误译重新解释成看似合理的原文。可靠的报告应说明检查覆盖的错误类型和无法排除的解释，并允许输出“尚不能确定”。

### 5.2 诊断、修复与证据维护

定位错误不等于知道如何修改，修复局部不等于保持全局一致。特别是在依赖图或多模块约束系统中，一处定义变化可能使此前证明、缓存结果和候选剪枝依据失效。现有的检索修复、分类诊断与证明结构方法分别处理了其中一部分；跨表示的修改影响与证据撤销仍值得系统研究。

需要明确区分三类结果：修复了表达错误；通过增加合理但原文隐含的背景完成形式化；未经授权改变了问题本身。若没有这样的区分，长期修订轨迹中的语义漂移很容易被最终成功率掩盖。

### 5.3 数据、评价器与真实使用分布

受控负样本有利于获得明确标签，却可能偏离模型实际产生的错误。真实误译可能同时涉及量词、域、指代和库概念，而且随着模型与提示更新不断变化。如果训练与测试共享原始题目，只修改名称或表面措辞，也容易高估泛化。

此外，候选池中至少有一个正确结果、系统最终选择正确结果、被接受子集的准确率以及全体输入上的准确率，分别回答不同问题。评价应同时记录训练题目重叠、参考依赖、候选预算、回退策略和人工介入，避免以一个总体分数替代系统行为分析。

### 5.4 成本与保证之间的权衡

完全验证往往不可得，逐步调用工具也可能代价很高。形式化生成、库检索、Solver 求解、证明搜索与模型诊断的成本结构不同，调用次数不足以代表总成本。复杂公式的少量调用，可能比大量简单检查更昂贵。

因此，需要在预算约束下决定检查顺序：哪些语义差异最可能影响下游答案，哪些检查能够分离当前候选，什么时候应重新形式化或请求澄清。该问题同时涉及错误概率、检查的信息价值、修复可行性和失败后果。

## 6. 未来前景：从能力提升走向可靠的模型构建

以下方向是基于现有证据提出的研究判断。它们的价值取决于能否给出清楚的问题定义、直接相关的基线与可证伪的评价。

<div class="af-comparison" role="region" aria-label="未来研究方向对照" tabindex="0">

| 研究方向                 | 可以形成的具体问题                             | 相对已有方法需要证明的增量                                               |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------ |
| 有覆盖边界的语义检查     | 哪些探针足以区分某类漏约束、错量词和域错配？   | 相对实例检查与语义指纹，给出可检验的覆盖条件及预算不足时的剩余不确定性   |
| 面向下游后果的验证选择   | 哪个语义差异最可能改变后续查询或决策？         | 相对单一分数排序，在同预算下减少有实际影响的误放行                       |
| 可追踪、可撤销的语义修订 | 修改一条约束后，哪些结论与证明必须重新检查？   | 相对经验检索、错误分类和结构保真，维护跨表示依赖并安全复用未受影响的证据 |
| 真实错误分布上的诊断学习 | 学生自己的错误能否产生比受控扰动更有效的监督？ | 相对已有验证器，展示未见规则、复合错误和形式风格迁移下的可靠性           |
| 风险可控的验证能力蒸馏   | 何时接受内部判断，何时转交外部工具？           | 同时报告任务质量、接受覆盖、误放行率和完整推理成本                       |
| 理论与模块规模形式化     | 如何构建并维护共享定义和假设的知识模块？       | 区分新增形式知识、库复用与人工修订，验证更新后的全局一致性               |

</div>

### 6.1 对逻辑谜题的研究定位

逻辑谜题适合把语义保真问题具体化。设 $\Omega(F)$ 是形式化 $F$ 允许的全部配置集合。在统一实体域和解释下，强语义要求可以写成 $\Omega(F)=\Omega(F^\star)$；较弱的查询要求，则只要求特定查询 $q$ 在两种表示下结果一致。后者成本可能更低，却不能保证换一个查询后仍然正确。

这一差别可以支持分层评价：首先检查当前答案，再检查额外查询与反事实配置，最后在可控规模上比较完整解空间。对漏约束、唯一性假设、排他性和量词嵌套，可以构造保持当前答案不变的困难误译，从而测试系统是否真正理解约束，而非仅命中标签。

结合现有 PrefRAG、Roundtrip、GenV 和 FormalRx 等工作，一个较有辨识度的研究目标是：**发现会影响后续推理的语义差异，解释其来源，并在有限预算下完成保持其他约束的修复。** 其评价应同时包含语义差异检测、错误定位、修复成功率、新错误引入率与总成本。[\[17\]](#ref-17)、[\[20\]](#ref-20)、[\[21\]](#ref-21)、[\[22\]](#ref-22)

### 6.2 从固定流程走向具有验证决策能力的系统

更长期的系统可以把形式化、检索、语义检查、修复、回溯和停止作为不同动作。其状态需要保存候选表示、已获得的证据、尚未消除的歧义及剩余预算。形式工具由此成为决策过程中的资源，每次调用都应服务于某个明确的不确定性。

这一路线的研究难点在于建立可信的奖励和状态表示。只奖励最终答对可能鼓励绕过困难语义；只惩罚工具成本可能让系统过早接受不可靠表示。更合适的目标需要同时约束任务质量、语义风险和计算成本，并允许系统在证据不足时保持不确定或寻求澄清。这样的自动形式化系统，才能逐步承担持续维护规则、更新知识与支持交互决策的任务。

## 7. 阅读与复现建议

入门阶段可先读统一框架与领域综述，明确评价对象；随后对读早期自动形式化、Logic-LM 和 LINC，理解语言模型与工具的分工。研究语义问题时，可按“候选一致性—实例检查—往返验证—学习判别—结构化诊断”的顺序阅读；研究训练时，再区分形式化器优化、反思策略学习和验证器蒸馏。

<div class="af-comparison" role="region" aria-label="阅读与复现建议" tabindex="0">

| 阅读主题           | 建议优先阅读                                          | 实践时最需要确认的条件                             |
| ------------------ | ----------------------------------------------------- | -------------------------------------------------- |
| 定义与基础         | Common Framework、Survey、Autoformalization with LLMs | 输入对象、目标形式语言、理想语义准则与实际验证准则 |
| 逻辑谜题与语义修复 | Logic-LM、LINC、SSV、PrefRAG、GenV                    | 数据划分、是否使用答案标签、程序失败回退、误译类型 |
| 数学语义与诊断     | ProofNet、LeanEuclid、BEq、FormalAlign、FormalRx      | 形式库版本、参考依赖、Judge 角色、训练与测试重叠   |
| 强化学习与反思     | FormaRL、ReForm、LogicReward                          | 奖励来源、训练算法、采样预算与被优化的具体模型能力 |
| 证明与理论结构     | ProofFlow、Theory-Level、LCS-Bench、Theo              | 证明义务、人工介入、依赖是否正确及结构指标的含义   |

</div>

可用资源包括 [Lean 与 Mathlib](https://leanprover-community.github.io/)、[Isabelle](https://isabelle.in.tum.de/)、[Z3](https://github.com/Z3Prover/z3)、[ProofFlow](https://github.com/Huawei-AI4Math/ProofFlow)、[PrefRAG](https://github.com/sysulic/PrefRAG) 和 [FormalRx 项目页](https://lark-ai-lab.github.io/formalrx/)。选择复现对象时，应先固定论文版本、代码提交、数据划分和工具环境，再比较方法差异。

## 8. 结语

自动形式化为大语言模型引入可执行、可检查的表示，也把自然语言理解中的歧义和隐含假设暴露为具体的建模问题。现有研究已经显著丰富了生成、检索、语义评价与诊断工具，但语言到形式表示的可靠性仍需要专门建立。

未来较有价值的进展，应当能够说明系统保留了什么含义、获得了什么证据、哪些错误仍未排除，以及为此付出了多少成本。在这一基础上，语义诊断、验证决策和依赖维护可以形成连贯的研究主线，使自动形式化逐步从单次翻译能力发展为可持续检验和修订的模型构建能力。

## 参考文献

文献按正文引用顺序排列，会议论文、立场论文、研讨会论文与预印本分别标明。完整作者及可获得的出版字段见 [BibTeX 文献表](/assets/bibliography/autoformalization-research-overview.bib)。

<p id="ref-1">[1] Agnieszka Mensfelt, David Tena Cucala, Santiago Franco et al. <a href="https://ojs.aaai.org/index.php/AAAI/article/view/42132">Towards a Common Framework for Autoformalization</a>. AAAI 2026.</p>

<p id="ref-2">[2] Ke Weng, Lun Du, Sirui Li et al. <a href="https://arxiv.org/abs/2505.23486">Autoformalization in the Era of Large Language Models: A Survey</a>. arXiv 2025.</p>

<p id="ref-3">[3] Yuhuai Wu, Albert Qiaochu Jiang, Wenda Li et al. <a href="https://proceedings.neurips.cc/paper_files/paper/2022/file/d0c6bc641a56bebee9d985b937307367-Paper-Conference.pdf">Autoformalization with Large Language Models</a>. NeurIPS 2022.</p>

<p id="ref-4">[4] Liangming Pan, Alon Albalak, Xinyi Wang et al. <a href="https://arxiv.org/abs/2305.12295">Logic-LM: Empowering Large Language Models with Symbolic Solvers for Faithful Logical Reasoning</a>. Findings of EMNLP 2023.</p>

<p id="ref-5">[5] Theo Olausson, Alex Gu, Ben Lipkin et al. <a href="https://aclanthology.org/2023.emnlp-main.313/">LINC: A Neurosymbolic Approach for Logical Reasoning by Combining Language Models with First-Order Logic Provers</a>. EMNLP 2023.</p>

<p id="ref-6">[6] Zhangir Azerbayev, Bartosz Piotrowski, Hailey Schoelkopf et al. <a href="https://arxiv.org/abs/2302.12433">ProofNet: Autoformalizing and Formally Proving Undergraduate-Level Mathematics</a>. arXiv 2023.</p>

<p id="ref-7">[7] Logan Murphy, Kaiyu Yang, Jialiang Sun et al. <a href="https://proceedings.mlr.press/v235/murphy24a.html">Autoformalizing Euclidean Geometry</a>. ICML 2024.</p>

<p id="ref-8">[8] Marcus J. Min, Mike He, Zhaoyu Li et al. <a href="https://proceedings.mlr.press/v306/min26h.html">Position: Theory-Level Autoformalization, From Isolated Statements to Unified Formal Knowledge Bases</a>. ICML 2026, Position Paper.</p>

<p id="ref-9">[9] Jin Peng Zhou, Charles Staats, Wenda Li et al. <a href="https://arxiv.org/abs/2403.18120">Don&#x27;t Trust: Verify -- Grounding LLM Quantitative Reasoning with Autoformalization</a>. ICLR 2024.</p>

<p id="ref-10">[10] Qi Liu, Xinhao Zheng, Xudong Lu et al. <a href="https://proceedings.iclr.cc/paper_files/paper/2025/file/d630537fc4402cfa3ebbc7450a0cac91-Paper-Conference.pdf">Rethinking and Improving Autoformalization: Towards a Faithful Metric and a Dependency Retrieval-based Approach</a>. ICLR 2025.</p>

<p id="ref-11">[11] Ruikang Hu, Shaoyu Lin, Yeliang Xiu et al. <a href="https://aclanthology.org/2025.findings-acl.126/">LTRAG: Enhancing Autoformalization and Self-refinement for Logical Reasoning with Thought-Guided RAG</a>. Findings of ACL 2025.</p>

<p id="ref-12">[12] Shaoqi Wang, Lu Yu, Siwei Lou et al. <a href="https://aclanthology.org/2026.acl-long.821/">Improving Autoformalization Using Direct Dependency Retrieval</a>. ACL 2026.</p>

<p id="ref-13">[13] Zhiyu Ni, Zheng Liang, Liangcheng Song et al. <a href="https://arxiv.org/abs/2603.17233">Draft-and-Prune: Improving the Reliability of Auto-formalization for Logical Reasoning</a>. arXiv 2026.</p>

<p id="ref-14">[14] Zenan Li, Yifan Wu, Zhaoyu Li et al. <a href="https://arxiv.org/abs/2410.20936">Autoformalizing Mathematical Statements by Symbolic Equivalence and Semantic Consistency</a>. NeurIPS 2024.</p>

<p id="ref-15">[15] Jianqiao Lu, Yingjia Wan, Yinya Huang et al. <a href="https://arxiv.org/abs/2410.10135">FormalAlign: Automated Alignment Evaluation for Autoformalization</a>. arXiv 2024.</p>

<p id="ref-16">[16] Mohammad Raza, Natasa Milic-Frayling. <a href="https://www.ijcai.org/proceedings/2025/516">Instantiation-based Formalization of Logical Reasoning Tasks Using Language Models and Logical Solvers</a>. IJCAI 2025.</p>

<p id="ref-17">[17] Daneshvar Amrollahi, Jerry Lopez, Clark Barrett. <a href="https://arxiv.org/abs/2604.25031">Faithful Autoformalization via Roundtrip Verification and Repair</a>. arXiv 2026.</p>

<p id="ref-18">[18] Hojae Han, Jongyoon Kim, Sanghyeok Park et al. <a href="https://arxiv.org/abs/2608.29270">SHADOWBENCH: Toward Reliable Automatic Evaluation of Semantic Alignment in Autoformalization</a>. EMNLP 2026.</p>

<p id="ref-19">[19] Noor Islam S. Mohammad, Tamim Sheikh. <a href="https://arxiv.org/abs/2606.16541">The Faithfulness Gap: Certifying Semantic Equivalence between Natural-Language and Formal Mathematical Statements</a>. ICML 2026 MusML Workshop.</p>

<p id="ref-20">[20] Vikash Singh, Debargha Ganguly, Aman Goel et al. <a href="https://arxiv.org/abs/2609.11085">Beyond Solver Verdicts: Generative Reward Models for Autoformalization</a>. arXiv 2026.</p>

<p id="ref-21">[21] Yuyin Zhou, Yongmei Liu. <a href="https://aclanthology.org/2026.findings-acl.795/">PrefRAG: Correcting Semantic Errors in Auto-Formalization for Logical Reasoning with Program Preference RAG</a>. Findings of ACL 2026.</p>

<p id="ref-22">[22] Haocheng Wang, Baiyu Huang, Yingjia Wan et al. <a href="https://proceedings.mlr.press/v306/wang26cg.html">FormalRx: Rectify and eXamine Semantic Failures in Autoformalization</a>. ICML 2026.</p>

<p id="ref-23">[23] Lei Xu, Xin Quan, André Freitas. <a href="https://arxiv.org/abs/2606.09449">Reasoning without Gold Standards: A Proxy-Judge Theory of Autoformalization</a>. arXiv 2026.</p>

<p id="ref-24">[24] Vikash Singh, Darion Cassel, Nathaniel Weir et al. <a href="https://arxiv.org/abs/2601.20055">VERGE: Formal Refinement and Guidance Engine for Verifiable LLM Reasoning</a>. arXiv 2026.</p>

<p id="ref-25">[25] Kyuhee Kim, Auguste Poiroux, Antoine Bosselut. <a href="https://arxiv.org/abs/2604.19459">Do LLMs Game Formalization? Evaluating Faithfulness in Logical Reasoning</a>. ICLR 2026 VerifAI-2 Workshop.</p>

<p id="ref-26">[26] Olivia Peiyu Wang, Sanna Wong-Toropainen, Daneshvar Amrollahi et al. <a href="https://arxiv.org/abs/2606.16118">Know Your Limits: On the Faithfulness of LLMs as Solvers and Autoformalizers in Legal Reasoning</a>. ICML 2026 AI4Law / AI4Math Workshops.</p>

<p id="ref-27">[27] Yanxing Huang, Xinling Jin, Sijie Liang et al. <a href="https://arxiv.org/abs/2508.18914">FormaRL: Enhancing Autoformalization with No Labeled Data</a>. COLM 2025.</p>

<p id="ref-28">[28] Guoxin Chen, Jing Wu, Xinjie Chen et al. <a href="https://arxiv.org/abs/2510.24592">ReForm: Reflective Autoformalization with Prospective Bounded Sequence Optimization</a>. ICLR 2026.</p>

<p id="ref-29">[29] Jundong Xu, Hao Fei, Huichi Zhou et al. <a href="https://arxiv.org/abs/2512.18196">LogicReward: Incentivizing LLM Reasoning via Step-Wise Logical Supervision</a>. ICLR 2026.</p>

<p id="ref-30">[30] Lushi Pu, Weiming Zhang, Xinheng Xie et al. <a href="https://arxiv.org/abs/2608.14221">MathForm: Scaling Mathematical Autoformalization with Knowledge Retrieval and Verification-Guided Refinement</a>. arXiv 2026.</p>

<p id="ref-31">[31] Rafael Cabral, Tuan Manh Do, Xuejun Yu et al. <a href="https://proceedings.iclr.cc/paper_files/paper/2026/file/5fce5198dbf92d5ff45f74504431e2ff-Paper-Conference.pdf">ProofFlow: A Dependency Graph Approach to Faithful Proof Autoformalization</a>. ICLR 2026.</p>

<p id="ref-32">[32] Yuming Feng, Frederick Pu, One An et al. <a href="https://arxiv.org/abs/2606.26525">Theory-Scale Auto-Formalization of Logics for Computer Science</a>. arXiv 2026.</p>

<p id="ref-33">[33] Arshia Soltani Moakhar, Iman Gholami, Max Springer et al. <a href="https://arxiv.org/abs/2606.31134">Beyond the Library: An Agentic Framework for Autoformalizing Research Mathematics</a>. arXiv 2026.</p>

<p id="ref-34">[34] Zhicheng Hui, Lihan Xie, Xingzhi Qi et al. <a href="https://arxiv.org/abs/2606.24443">Verifiable Auto-Formalization of Mathematics Using a Relaxed Natural Formal Language</a>. arXiv 2026.</p>

<p id="ref-35">[35] Nilay Patel, Noah Arias, Davit Babayan et al. <a href="https://arxiv.org/abs/2605.14061">MathAtlas: A Benchmark for Autoformalization in the Wild</a>. arXiv 2026.</p>

<p id="ref-36">[36] Chenyang An, Sam Bayless, Stefano Buliani et al. <a href="https://arxiv.org/abs/2511.09008">A Neurosymbolic Approach to Natural Language Formalization and Verification</a>. arXiv 2026.</p>

<p id="ref-37">[37] Jan Ole Ernst, Dmitri Michelangelo Saberi, Derek Christ et al. <a href="https://arxiv.org/abs/2605.00058">Autoformalizing Memory Device Specifications with Agents</a>. ICLR 2026 VerifAI-2 Workshop.</p>

<p id="ref-38">[38] Jing Xiong, Qi Han, Yunta Hsieh et al. <a href="https://arxiv.org/abs/2601.03017">MMFormalizer: Multimodal Autoformalization in the Wild</a>. arXiv 2026.</p>

<p id="ref-39">[39] Abhinav Lalwani, Tasha Kim, Lovish Chopra et al. <a href="https://arxiv.org/abs/2405.02318">Autoformalizing Natural Language to First-Order Logic: A Case Study in Logical Fallacy Detection</a>. arXiv 2025.</p>

<style>
  #post-content .af-comparison {
    overflow-x: auto;
    margin: 1.5rem 0;
  }
  #post-content .af-comparison:focus-visible {
    outline: 2px solid var(--global-theme-color);
    outline-offset: 4px;
  }
  #post-content .af-comparison table {
    display: table;
    min-width: 40rem;
    width: 100%;
    margin: 0;
    table-layout: fixed;
  }
  #post-content .af-comparison th:first-child {
    width: 30%;
  }
  #post-content figcaption {
    margin-top: 0.6rem;
    font-size: 0.9rem;
    color: var(--global-text-color-light);
  }
</style>
