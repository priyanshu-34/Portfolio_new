---
title: "Chapter 12: Online evals and monitoring"
subtitle: "Tracing, sampling, guardrails, and turning production failures into test cases."
date: 2026-10-25
tags: [ai-agents, evals, llm, interview-prep]
order: 13
---

Offline evals guard releases; online evals watch real use. Their most important output is new offline cases: every interesting production failure should become a test.

## Traces: the raw material

A **trace** is the full record of one request, from the user's message to the final answer, including every model call, tool call and retrieval ([Evals FAQ](https://hamel.dev/blog/posts/evals-faq/)). Each step inside it is a **span**.

Log, for every trace: the input, every tool call with its arguments and result, errors, tokens, cost, latency per step, the final answer, and any user feedback.

## Which traces to look at

You can't read them all. Mix sampling methods ([Evals FAQ](https://hamel.dev/blog/posts/evals-faq/)):

| Method | Picks | Example |
| --- | --- | --- |
| Random | A fair slice of everything | 50 random sessions a week |
| Outliers | Unusually long, slow or costly runs | Sessions with more than 20 tool calls |
| Feedback | Runs users rated badly or edited | Thumbs-down sessions |
| Clustering | Groups of similar requests | All "bulk update" requests |
| Classifier or check flags | Runs a cheap check marked as suspicious | Replies that mention a raw id |

Always keep some random traces, or you only ever see the problems you already know about.

## Scoring live traffic

- **Code checks** on every trace: cheap and instant ("did any write fail and the agent still say done?").
- **LLM judges** on a sample, run in the background so users aren't kept waiting.
- **Humans** review a weekly sample and every case where the checks disagree.

## Guardrails versus evaluators

|  | Guardrail | Evaluator |
| --- | --- | --- |
| When it runs | Inside the request, before the user sees the output | After the response, usually in the background |
| Speed | Must be fast | Can be slow |
| What it does | Blocks, redacts or regenerates output | Measures and reports |
| Typical form | Regex, schema check, personal-data filter | LLM judge for faithfulness or tone |
| Blog Assistant example | Block any `delete_post` call | Weekly score of Slack-summary accuracy |

Only fast checks with very few false alarms belong in the request path; slow LLM judges rarely do ([Evals FAQ](https://hamel.dev/blog/posts/evals-faq/)).

Test a guardrail like any classifier: run it on a labelled set of attacks and normal requests, and report two numbers, how many attacks it blocks and how many normal requests it wrongly blocks. Example: it blocks 48 of 50 injected posts, but also 6 of 200 normal edits, so 3% of real users are blocked for nothing.

## A/B tests

To compare two versions on real users, send part of the traffic to each and compare product metrics: resolution rate, user edits, thumbs-up rate, cost. Use them for decisions offline evals can't settle, such as "do users prefer shorter answers?"

## Drift

Things change without you changing any code:

- The model provider updates the model behind the same name.
- Users start asking new kinds of questions.
- The data changes: more posts, new statuses, new languages.

Watch trends (success, cost, step count, feedback) on a dashboard, and review fresh traces regularly. Husain and Shankar suggest at least 100 fresh traces every 2–4 weeks after significant changes, plus a lighter weekly look at outliers ([Evals FAQ](https://hamel.dev/blog/posts/evals-faq/)).

## The loop that improves the agent

1. A production trace shows a failure.
2. Turn it into an offline case with the same input and starting data.
3. Reproduce the failure in the eval.
4. Fix the prompt, tool or code.
5. Watch the case pass, and keep it as a regression test ([Langfuse guide](https://langfuse.com/resources/engineering/ai-agent-evaluation.md)).

## Say it in an interview

> "Online, I trace every request, run cheap code checks on all of them and judges on a sample in the background, and review a mix of random, outlier and low-rated traces each week. Guardrails block in the request path; evaluators measure after. Every production failure becomes an offline case, so the offline suite keeps growing with real problems."

## Check yourself

1. What is the difference between a guardrail and an evaluator?
2. Why keep random sampling if you already sample thumbs-down sessions?
3. Name two sources of drift that need no code change from you.
