---
title: "Chapter 9: Variance and statistics"
subtitle: "pass@k, pass^k, flaky cases, and how sure a small sample lets you be."
date: 2026-10-25
tags: [ai-agents, evals, llm, interview-prep]
order: 10
---

An agent that passes once may fail the next time, so run each case several times. Use **pass^k** to measure reliability and **pass@k** to measure capability.

## Why results vary

- Models sample their words, so the same prompt can lead to a different tool choice.
- Even at temperature 0, providers don't promise identical output on every call.
- A small early difference (search first versus list first) sends the whole run down a different path.

## pass@k and pass^k

Run a case k times.

- **pass@k:** at least **one** of the k trials passed. Good for "can it ever do this?"
- **pass^k:** **all** k trials passed. Good for "can users rely on it?"

Example from Anthropic's guide: a case that passes 75% of the time has pass^3 = 0.75 × 0.75 × 0.75 ≈ 42% ([Demystifying evals](https://anthropic.com/engineering/demystifying-evals-for-ai-agents)). The same case has pass@3 = 1 − (0.25 × 0.25 × 0.25) ≈ 98%.

| k (trials) | pass@k (any passes) | pass^k (all pass) |
| --- | --- | --- |
| 1 | 75% | 75% |
| 3 | 98% | 42% |
| 5 | 99.9% | 24% |
| 10 | about 100% | 6% |

Per-trial success rate 75%. The two measures move in opposite directions as k grows.

τ-bench, which introduced pass^k for agents, found that strong function-calling agents succeeded on under 50% of tasks and had pass^8 below 25% in its retail domain ([Yao et al., 2024](https://arxiv.org/abs/2406.12045)).

**Which one to report?** For a customer-facing agent, pass^k. Users don't retry until it works; they meet whichever run they get.

**Estimating from your runs.** Run n trials (n at least k) and count the passes, c. The standard estimate is pass@k = 1 − C(n−c, k) ÷ C(n, k), where C(a, b) counts the ways to pick b items from a ([Chen et al., 2021](https://arxiv.org/abs/2107.03374)). Example: 10 trials with 3 passes give pass@1 = 30% and pass@3 = 1 − 35 ÷ 120 ≈ 71%.

## Pass, flaky, fail

With 3 trials per case, label each case:

| Result | Label | What to do |
| --- | --- | --- |
| 3/3 | Pass | Nothing |
| 1/3 or 2/3 | Flaky | Read the failing trial; flaky is not passing |
| 0/3 | Fail | Find the cause (Chapter 13) |
| Never finished (timeout, provider error) | Error | Not the agent's fault; retry once, and don't count it as a pass or a fail |

## How sure can you be?

Small samples are noisy. If a version passes 18 of 20 cases (90%), its true pass rate could plausibly be anywhere from about 70% to 97%. This range is called a 95% confidence interval. Practical rules:

- Don't celebrate a 5-point change measured on 20 cases.
- Compare two versions on the **same** cases, several trials each.
- Before blaming the product for a failure, rerun it, and try another model. If it fails on one model only, that points to a model weakness, or a prompt that suits some models only. It is still your problem if you ship that model.

**Is the improvement real?** Run both versions on the same cases and count the cases that flipped. 6 fixed and 5 newly broken is noise; 9 fixed and 0 broken is probably real. McNemar's test is the formal version of this count.

## Noise from the infrastructure

Timeouts, rate limits and dropped connections can fail several trials at once. Anthropic notes these make failures correlated rather than independent ([Demystifying evals](https://anthropic.com/engineering/demystifying-evals-for-ai-agents)). Mark them as errors, not agent failures, and keep concurrency low enough to avoid rate limits.

## Say it in an interview

> "Agents are non-deterministic, so I run each case k times. pass@k measures capability; pass^k measures reliability, which is what users feel. At 75% per trial, pass^3 is only 42%. I separate flaky from failing, treat infrastructure errors as their own category, and rerun on another model before calling something a product bug."

## Check yourself

1. A case passes 90% of the time. What is pass^3? (0.9³ ≈ 73%.)
2. Why is pass@k misleading for a customer-facing agent?
3. Is a case that passes 2 of 3 times "passing"?
