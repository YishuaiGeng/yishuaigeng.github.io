---
title: 'Research Notebook: How These Notes Are Organized'
date: 2026-10-02
description: 'A guide to the collections, tags, naming rules, and writing workflow used in this research notebook.'
tags: [Research Workflow]
categories: [Daily Notes]
toc: true
---

These posts form a working research notebook. They keep reading, technical decisions, focused
study, and weekly reflection in one searchable place. The structure below is a starting point and
can evolve with the research.

## Collections

| Collection      | Use it for                                                                     |
| --------------- | ------------------------------------------------------------------------------ |
| Paper Reading   | Reviews, comparisons, critiques, and links between papers                      |
| Learning Notes  | Structured study notes on RAG, reinforcement learning, and new methods         |
| Technical Notes | Implementations, reproducibility details, debugging, and engineering decisions |
| Daily Notes     | Weekly plans, short work logs, reflections, and ideas to revisit               |

Each post should use one stable collection. Tags can connect a post to several topics, such as
`RAG`, `LLM Reasoning`, or `Research Workflow`.

## File Naming

```text
paper-reading-<topic>.md
learning-rag-<topic>.md
learning-rl-<topic>.md
technical-<topic>.md
daily-<date>.md
```

## Writing Workflow

1. Capture the question or observation quickly.
2. Add evidence, links, experiment settings, or citations while they are still available.
3. Record uncertainty and failed attempts alongside successful results.
4. End with concrete follow-up actions.
5. Revisit useful notes and add `lastmod` to the frontmatter when they change substantially.

## Suggested Status Block

Use this short block at the top of an active note when useful:

```markdown
**Status:** Seed / In progress / Stable
**Question:** [What is this note trying to answer?]
**Next review:** [Date or milestone]
```

## Next Steps

- Replace starter templates with notes from current work.
- Add links between related paper, research, and technical notes.
- Promote mature notes into project documentation or formal writing.
