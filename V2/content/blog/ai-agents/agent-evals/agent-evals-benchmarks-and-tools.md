---
title: "Chapter 15: Benchmarks and tools"
subtitle: "The famous benchmarks, what they grade, and the tool categories worth knowing."
date: 2026-10-25
tags: [ai-agents, evals, llm, interview-prep]
order: 16
---

Public benchmarks measure a model's general agent ability; your own evals measure your product. Know the famous benchmarks by name and what they grade, and know the tool categories, not every feature.

## Benchmarks worth knowing

Numbers are the paper's own, at publication; benchmarks move fast, so quote them as "when it came out".

| Benchmark | What it tests | How it grades | Headline at publication |
| --- | --- | --- | --- |
| [SWE-bench](https://arxiv.org/abs/2310.06770) | Fixing real GitHub issues: 2,294 problems from 12 Python repositories | Whether the code edits resolve the issue (run against the repository's tests) | The best model then resolved 1.96% |
| [τ-bench](https://arxiv.org/abs/2406.12045) | Customer-service agents talking to a simulated user, with tools and a policy | Compares the database at the end with the expected state | Under 50% task success; pass^8 below 25% in retail |
| [GAIA](https://arxiv.org/abs/2311.12983) | General assistant questions needing reasoning, browsing, tools and multiple modalities: 466 questions | Exact final answers | Humans 92%, GPT-4 with plugins 15% |
| [WebArena](https://arxiv.org/abs/2307.13854) | Tasks on real, self-hosted websites: shopping, forums, code collaboration, content management | Functional correctness of the finished task | Best GPT-4 agent 14.41%, humans 78.24% |

Anthropic's guide also names SWE-bench Verified and Terminal-Bench for coding, τ²-Bench for conversation, BrowseComp for research and OSWorld for computer use ([Demystifying evals](https://anthropic.com/engineering/demystifying-evals-for-ai-agents)).

## Benchmarks versus your own evals

|  | Public benchmark | Your product evals |
| --- | --- | --- |
| Question | Which model is generally stronger? | Does *our* agent do *our* users' tasks? |
| Data | Fixed, public | Your tools, your data, your users' wording |
| Risks | Training-data contamination, saturation, poor match to your use | Small size, drift if not refreshed |
| Use | Shortlist models | Decide releases, find regressions |

**Contamination** means the benchmark's questions or answers were in the model's training data, so a high score may be memory, not skill. For example, the fixes behind SWE-bench tasks are public on GitHub.

A model that tops a leaderboard can still do badly on your tools. Always check it on your own suite.

## The tools landscape

Non-exhaustive, grouped by what they do. In interviews, explain the concept first and name a tool only as an example.

| Category | What it does | Examples |
| --- | --- | --- |
| Tracing and eval platforms | Record traces, build datasets from them, run experiments, dashboards | [LangSmith](https://smith.langchain.com), [Langfuse](https://langfuse.com), [Braintrust](https://www.braintrust.dev), [Arize Phoenix](https://phoenix.arize.com) |
| Eval libraries | Ready-made scorers and test runners in code | [DeepEval](https://deepeval.com), [Ragas](https://docs.ragas.io) (RAG metrics), [promptfoo](https://www.promptfoo.dev) |
| Eval frameworks for research and safety | Run benchmark-style tasks in sandboxes | [OpenAI Evals](https://github.com/openai/evals), [Inspect](https://inspect.aisi.org.uk) |
| Framework-native evals | Scorers built into an agent framework | [Mastra](https://mastra.ai) evals |

## Say it in an interview

> "I use public benchmarks like SWE-bench, τ-bench, GAIA and WebArena to shortlist models, but they can be contaminated or saturated and don't use my tools. Release decisions come from my own suite, built from my users' tasks. Tools like LangSmith, Langfuse or Braintrust handle tracing and experiments; the concepts matter more than the vendor."

## Check yourself

1. What does τ-bench check at the end of a conversation?
2. Why isn't a leaderboard win enough to choose a model for your agent?
3. What is benchmark contamination?
