---
title: 'Reinforcement Learning Study Notes: Concepts and Roadmap'
date: 2026-09-28
description: 'A structured path from Markov decision processes to policy optimization and LLM post-training.'
tags: [Reinforcement Learning, LLM Reasoning]
categories: [Learning Notes]
toc: true
math: true
---

This roadmap connects reinforcement learning fundamentals with modern applications. Add derivations,
small implementations, and paper notes as each topic becomes clear.

## Foundations

- Markov decision processes: states, actions, transitions, rewards, and discounting
- Return and value functions
- Bellman expectation and optimality equations
- Exploration and exploitation

The discounted return from time step $t$ is commonly written as

$$
G_t = \sum_{k=0}^{\infty} \gamma^k R_{t+k+1}.
$$

## Learning Sequence

1. Multi-armed bandits
2. Dynamic programming
3. Monte Carlo methods
4. Temporal-difference learning
5. Value-based deep reinforcement learning
6. Policy gradients and actor-critic methods
7. Offline reinforcement learning and preference optimization

## Concept Checks

- [ ] Explain on-policy and off-policy learning with one example each.
- [ ] Derive a one-step temporal-difference update.
- [ ] Describe why function approximation can destabilize learning.
- [ ] Compare value-based and policy-based methods.
- [ ] Connect reward design to observed model behavior.

## Experiment Log

| Experiment | Environment   | Algorithm   | Main observation |
| ---------- | ------------- | ----------- | ---------------- |
| [Baseline] | [Environment] | [Algorithm] | [Observation]    |

## Connection to Language Models

[Track how preference data, reward signals, policy updates, and evaluation relate to logical
reasoning behavior in large language models. Separate empirical observations from hypotheses.]

## Reading Queue

- [Textbook chapter]
- [Foundational algorithm paper]
- [Recent survey]
- [LLM post-training paper]
