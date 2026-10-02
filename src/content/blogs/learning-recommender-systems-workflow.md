---
title: 'Recommender Systems Notes: Reading and Experiment Workflow'
date: 2026-09-25
description: 'A starter structure for connecting recommendation papers, datasets, evaluation choices, and reproducible experiments.'
tags: [Recommender Systems, Research Workflow]
categories: [Learning Notes]
toc: true
---

Use this note to connect recommender-system concepts with paper reading and experiments. Keep offline
metrics, user-facing objectives, and assumptions separate so that each conclusion remains clear.

## Problem Definition

- **Users:** [Who receives recommendations?]
- **Items:** [What can be recommended?]
- **Feedback:** [Clicks, ratings, dwell time, purchases, or another signal]
- **Task:** [Ranking, rating prediction, sequential recommendation, or another task]
- **Constraints:** [Latency, freshness, diversity, fairness, or privacy]

## Method Map

| Family                  | Core idea                                     | Questions to track                                     |
| ----------------------- | --------------------------------------------- | ------------------------------------------------------ |
| Collaborative filtering | Learn from user-item interactions             | How is sparsity handled?                               |
| Content-based methods   | Use item or user features                     | Which features generalize?                             |
| Sequential methods      | Model ordered interactions                    | What history and time scale matter?                    |
| Knowledge-aware methods | Add structured relations or semantics         | Does external knowledge improve reasoning or coverage? |
| Generative methods      | Formulate recommendation with language models | How are ranking quality and controllability evaluated? |

## Evaluation Checklist

- [ ] Define train, validation, and test splits without temporal leakage.
- [ ] Include simple and competitive baselines.
- [ ] Report ranking accuracy with more than one cutoff.
- [ ] Examine coverage, novelty, diversity, and calibration when relevant.
- [ ] Record efficiency, data scale, and statistical variation.

## Experiment Record

| Experiment | Dataset   | Baseline or change | Metrics   | Observation |
| ---------- | --------- | ------------------ | --------- | ----------- |
| [Name]     | [Dataset] | [Method]           | [Metrics] | [Result]    |

## Paper Connections

- [Paper and its main contribution]
- [Assumption shared with another method]
- [Conflict or gap between evaluation settings]

## Next Questions

- [Hypothesis to test]
- [Dataset or metric to add]
- [Connection to knowledge representation or LLM reasoning]
