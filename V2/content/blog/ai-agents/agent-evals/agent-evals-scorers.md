---
title: "Chapter 6: Scorers — code, LLM judge, human"
subtitle: "Which scorer to use for what, and what should fail a case."
date: 2026-10-25
tags: [ai-agents, evals, llm, interview-prep]
order: 7
---

Use code checks wherever a right answer exists, an LLM judge only for judgment calls, and human review to check both. Most agent evals can be graded mostly with code.

## The three kinds

Pros and cons as listed in Anthropic's eval guide ([Demystifying evals](https://anthropic.com/engineering/demystifying-evals-for-ai-agents)):

| Scorer | What it is | Good | Bad | Blog Assistant example |
| --- | --- | --- | --- | --- |
| **Code** (deterministic) | A program: string match, schema check, state check, call count | Fast, cheap, objective, repeatable, easy to debug | Brittle to valid variations; can't judge tone or quality | "Exactly the 3 drafts are In Review" |
| **LLM judge** (model-based) | Another model grades against a rubric | Flexible, handles open-ended output, scales | Non-deterministic, costs money, needs checking against humans | "Is the Slack summary accurate and friendly?" |
| **Human** | A person (ideally a domain expert) reviews | The gold standard; catches what nothing else does | Slow, expensive, hard to scale | An editor reviews 20 Slack summaries a week |

## Which one should I use?

Ask these questions in order:

1. **Is there a single right answer you can compute?** (a value, a state, a count) → **code**.
2. **Is it a judgment** (tone, helpfulness, faithfulness to a source)? → **LLM judge**, after you have checked it against human labels.
3. **Are you setting up a judge, settling a disagreement or exploring new failures?** → **human**.

A common setup layers all three: code checks on every run, a judge on the subset that needs judgment, humans on samples and on cases where the judge and code disagree ([Langfuse guide](https://langfuse.com/resources/engineering/ai-agent-evaluation.md)).

## Gate on binary checks, track the rest

- A **gate** decides pass or fail. It is the case's binary checks: the outcome, plus hard limits you choose, such as "no forbidden call" or "at most 4 calls".
- **Tracked** metrics are scores and averages (trajectory score, average cost, p95 latency), watched as trends. They don't fail a single case.

Example: Blog Assistant's suite fails if any case's outcome check fails; its average step count is a chart you watch.

## Avoid these scorers

- **Generic "helpfulness" scores off the shelf:** they give false confidence; build checks from your own failure modes ([Evals FAQ](https://hamel.dev/blog/posts/evals-faq/)).
- **Text-similarity metrics (ROUGE, BLEU, BERTScore)** for agent answers: two correct answers can share few words. They were made for translation (BLEU) and summaries (ROUGE), where one reference answer exists; agent tasks rarely have one.
- **Hackable checks:** a check that only looks for the word "done" lets an agent pass without doing anything.

## Say it in an interview

> "Code checks first, because most agent behaviour has a checkable right answer: the API calls made and the state left behind. I use an LLM judge only for subjective qualities, and only after checking it agrees with human labels. Humans calibrate both. Binary checks gate: the outcome and hard limits. Scores and averages are tracked."

## Check yourself

1. Name one thing a code check can't grade well.
2. Why not gate a release on an average trajectory score?
3. Give an example of a hackable check.
