---
title: "Chapter 10: Metrics that matter"
subtitle: "Success first, then path quality, cost, speed and safety, read together."
date: 2026-10-25
tags: [ai-agents, evals, llm, interview-prep]
order: 11
---

Measure task success first, then path quality, cost, speed and safety, and read them together: improving one often makes another worse.

## The main metrics

| Metric | Question it answers | How to compute | Blog Assistant example |
| --- | --- | --- | --- |
| **Task success** | Did it do the job? | Cases passing every check (pass^k) ÷ cases | 34 of 40 cases pass 3/3 |
| **Tool selection accuracy** | Did it pick the right tools? | Correct tool choices ÷ tool choices | Used `get_post`, not `list_posts`, for a lookup by id |
| **Argument accuracy** | Were the tool inputs right? | Calls with valid, correct arguments ÷ calls | No made-up post ids |
| **Steps per task** | Did it work efficiently? | Average tool calls per case | 3.2 calls on average |
| **Redundant calls** | Did it repeat itself? | Identical calls in a row | `get_post(p42)` called twice |
| **Error recovery** | Did it handle failures well? | Cases with a tool error that still end correctly ÷ cases with a tool error | Got a 404, searched by name, found the post |
| **Latency** | How long did users wait? | Time from request to final answer; report p50 and p95 | p50 18 s, p95 45 s |
| **Cost** | How much did it cost? | Tokens × price, per task | $0.04 per task |
| **Clarification rate** | Did it ask when it should, and only then? | Questions asked on ambiguous cases vs clear cases | Asked on 9/10 ambiguous, 1/30 clear |
| **Safety** | Did it avoid harm? | Forbidden actions, leaked secrets, policy breaks | 0 deletes, 0 requests for passwords |

**p50 and p95:** p50 is the median, so half of runs are faster. p95 means 95% of runs are faster than this. The p95 shows the slow runs users complain about.

## Online-only metrics

From real users, after you ship ([Langfuse guide](https://langfuse.com/resources/engineering/ai-agent-evaluation.md)):

- **Resolution rate:** the share of sessions that end resolved, rather than handed to a human or abandoned.
- **Turns to resolution:** how many back-and-forths it took.
- **Feedback:** thumbs up or down, edits users make to the agent's output.
- **Handoff rate:** how often a human had to take over.

## Metrics fight each other

| Change | Usually improves | Usually worsens |
| --- | --- | --- |
| "Always double-check by re-reading after a write" | Success | Cost, latency, step count |
| "Ask the user when unsure" | Wrong writes drop | More questions, slower |
| Smaller, cheaper model | Cost, latency | Success, tool accuracy |

So pick **one primary metric** (usually task success) and set **limits** on the others ("p95 under 60 s", "cost under $0.10").

## Say it in an interview

> "Task success, measured as pass^k on outcome checks, is the primary metric. Around it I track tool and argument accuracy, steps, latency at p50 and p95, cost per task and safety violations. They trade off, so I optimise success within limits on cost and latency. Online I add resolution rate, turns to resolution, user feedback and handoff rate."

## Check yourself

1. Why report p95 latency, not only the average?
2. Give a change that raises success but hurts cost.
3. How would you measure whether the agent asks questions at the right times?
