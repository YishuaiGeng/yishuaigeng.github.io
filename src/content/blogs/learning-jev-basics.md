---
title: 'Jev：核心概念与架构模式'
date: 2026-10-02
lastmod: 2026-10-03
description: 'Jev 的语义判断接口、Choice/Score/Noul 三种问题原语、置信度语义与架构模式。'
categories: [Learning Notes]
tags: [Jev]
toc: true
---

## 模型定位

Jev 是 TypeSafe 的 System One 模型，面向快速、聚焦的语义判断。输入待评估的材料和问题，输出类型化答案及概率。
它不负责撰写回复、生成代码或解释推理过程；需要生成内容时，可以与 LLM 组合。

Jev 输出语义判断，业务代码负责阈值、权重、分支和动作执行。

## 接口与数据结构

- `state`：共享材料，可以是文本、JSON 对象或数组；保留相关事实，减少无关内容。
- `questions`：按自定义 ID 组织问题；`instructions` 写判断任务，`criteria` 写选项或等级边界。
- `answers`：按问题 ID 返回答案；ID 用于代码索引，不会被模型看到。
- `model`：指定模型；响应包含实际使用的模型版本。

调用入口是 `POST /v1/systemone`，Python SDK 的核心方法是 `client.system_one(state=..., questions=...)`。
安装与鉴权方式见 [快速开始](https://datawhalechina.github.io/jev-cookbook/introduction/quickstart/)。

## 三种问题原语

| 原语       | 判断任务               | 主要输出                                         | 语义                                                                     |
| ---------- | ---------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| **Choice** | 固定选项中选哪个？     | `choice`、`probabilities`、`confidence`          | 单选；类别要能区分，必要时加入“其他/不适用”。                            |
| **Score**  | 某个维度达到什么程度？ | `score`、`legend`、`probabilities`、`confidence` | 定义有序等级；分数是等级编号的概率加权值，可以是小数。                   |
| **Noul**   | 一个命题是否成立？     | `noul`，范围 0–1                                 | 接近 1 为“是”、接近 0 为“否”、接近 0.5 为不确定；无独立的 `confidence`。 |

**概率和程度要分开。** Noul 的 0.8 表示命题成立的概率，不是“程度达到 80%”；衡量程度应使用 Score。
例如，对客服消息判断处理团队用 Choice，客户不满程度用 Score，是否请求退款用 Noul。

## 问题设计与置信度

- **一题一件事。** “是否生气且要求退款”拆成两个 Noul，用代码组合；复杂评分拆成多个维度再加权。
- **材料与问题分开。** 事实放在 `state`，判断要求放在问题中，必要时明确引用相关字段。
- **合并独立问题。** 一次请求可混用三种原语，共享状态、独立评估。后一个问题若需要前一个答案，就分阶段调用。
- **明确答案边界。** Choice 避免类别含糊重叠，Score 写清等级，Noul 使用清楚的正向命题。

Choice 和 Score 的 `confidence` 来自概率分布的形状，表示答案有多集中，**不是正确率，也不等于某个选项的概率**。
概率校准是在一组预测上检验的，不能保证单个答案正确。

可以按确定程度采用三路策略：明确时自动处理，中间区间补充信息或确认，不确定时澄清或回退。
Noul 可分别设“否”和“是”的阈值，中间区间留给复核。阈值应依据自己的数据和误判代价调整，教程数值只作示例。

## 四种架构模式

| 模式                  | 核心做法                                               | 典型用途                   |
| --------------------- | ------------------------------------------------------ | -------------------------- |
| 推测式扇出（Fan-out） | 一次问完可能需要的独立问题，再由代码选择使用哪些答案。 | 减少多个小判断的串行等待。 |
| 置信度路由            | 用确定程度决定自动处理、澄清或转交其他系统。           | 自动分类、Agent 动作门控。 |
| 组合评分              | 多个 Score 分别评估不同维度，归一化后在代码中加权。    | 文档质量、候选项优先级。   |
| 意图路由              | 用 Choice 识别意图，再执行对应代码分支。               | 请求分发、工具选择。       |

四种模式均将模型判断与业务规则分离。
扇出仍受 token 成本和上下文限制；组合不同量表时要先统一尺度。

## 评估指标与适用边界

分类任务可通过准确率与多数类基线比较；概率质量可使用 Brier Score 衡量预测误差、使用 ECE 衡量分箱校准误差。运行效率包括延迟、token 用量和成本。重复输出的一致性不等同于判断正确性。

- 当前 Jev 接受文本；图像、音频和视频需要先转成文本或结构化字段。英语是主要训练语言，中文任务要单独测试。
- 数值计算、计数、日期比较、多跳推理、冗长无关上下文和对抗性内容，是当前版本需要重点验证的场景；确定性计算交给代码。
- `jev-latest` 等别名会更新。阈值调好后固定模型版本，升级时重新评测；性能数字要连同版本与实验条件一起看。
- Notebook 离线示例用于理解接口和控制流，不能证明真实准确率、速度或校准效果。
- Cookbook 中的 RLCD 微调针对开源同类模型 Laya；托管 Jev 本身不提供客户专属微调或 LoRA。

## 参考资料

- [TypeSafe 英文文档](https://docs.typesafe.ai)：接口与模型说明。
- [Datawhale Jev Cookbook](https://datawhalechina.github.io/jev-cookbook/)：TypeSafe 文档的社区中文翻译。
- [三种原语](https://datawhalechina.github.io/jev-cookbook/primitives/)与[置信度](https://datawhalechina.github.io/jev-cookbook/confidence/)：输出语义和阈值策略。
- [架构模式](https://datawhalechina.github.io/jev-cookbook/patterns/)：四种组合方式。
- [重排序](https://datawhalechina.github.io/jev-cookbook/cookbooks/rerank_typesafe/)、[RAG 片段分类](https://datawhalechina.github.io/jev-cookbook/cookbooks/classifying_rag_passages/)、[引用核查](https://datawhalechina.github.io/jev-cookbook/cookbooks/citation_check/)、[实体对齐](https://datawhalechina.github.io/jev-cookbook/cookbooks/entity_alignment/)：应用示例。
- [模型说明](https://datawhalechina.github.io/jev-cookbook/models/)与[Jev 1.13 已知短板](https://datawhalechina.github.io/jev-cookbook/model-jaggedness/jev-1.13/)：版本、输入范围和能力边界。
- [Datawhale 仓库](https://github.com/datawhalechina/jev-cookbook)：中文 Notebook 与实验示例。
