---
title: "Chapter 11: Evals in CI/CD"
subtitle: "What runs on every change, what runs nightly, and how to keep known failures honest."
date: 2026-10-25
tags: [ai-agents, evals, llm, interview-prep]
order: 12
---

Run cheap, model-free tests on every change, and model evals before releases or nightly. Gate on binary checks; track scores and averages as trends.

## Tiers of testing

| Tier | What runs | Time | When | Blog Assistant example |
| --- | --- | --- | --- | --- |
| **Unit and rig tests** | No model: fakes behave like real APIs, checks fail bad answers | Seconds | Every pull request | "`list_posts` returns at most 50 posts per page"; "the check fails a reply missing a draft" |
| **Smoke evals** | A handful of key cases, 1 trial | A few minutes | Every merge, or on prompt changes | 5 core cases |
| **Full eval suite** | Every case, 3 trials each | 30–90 minutes | Nightly and before each release | 40 cases × 3 |
| **Online evals** | Scores on sampled production traffic | Continuous | After release | 5% of sessions scored daily |

CI evals use small curated datasets and mostly deterministic checks; production monitoring samples live traffic ([Evals FAQ](https://hamel.dev/blog/posts/evals-faq/)).

## What should trigger an eval run

- A change to the system prompt or any instruction text
- A new model or model version
- A change to a tool's schema or description
- A framework or dependency upgrade
- A fix for a bug that a case covers

## Regression baselines

A **baseline** usually means the current version's scores, which every change is compared against. Many teams also keep a known-failures baseline: a list of cases known to fail, so the suite can stay green while a known issue is open and new failures still stand out.

| Case result | Listed in baseline? | Verdict | Fails the build? |
| --- | --- | --- | --- |
| Fails | No | Regression | Yes |
| Fails | Yes | Known failure | No |
| Passes | Yes | Fixed: remove it from the list | No |
| Passes | No | Pass | No |

The danger: a baseline is an easy place to hide failures forever. A good entry carries evidence:

```text
case:      ask-before-guessing-title
measured:  2026-10-12, failed 2 of 6 trials
why:       the agent picks the first of two same-named posts
fix:       code change in the disambiguation step (ticket BLOG-231)
remove:    when the fix lands and the case passes 3/3
```

## Eval-driven development: two views

- Anthropic's guide recommends **eval-driven development**: write evals for capabilities before building them ([Demystifying evals](https://anthropic.com/engineering/demystifying-evals-for-ai-agents)).
- Husain and Shankar say **generally no**: write evaluators for failures you have actually seen through error analysis, not imagined ones, except where success is clearly defined in advance ([Evals FAQ](https://hamel.dev/blog/posts/evals-faq/)).

In an interview, showing you know both views and when each fits is a strong answer.

## Overfitting to your eval set

If you edit the prompt until every case passes, you may have fitted it to those cases rather than to your users. Keep a held-out set you never tune on, and check it before release. Example: you add a line about "Spring sale" because one case needed it; a held-out case about "Summer sale" shows whether the fix was general.

## Saturation

A suite that always passes 100% stops telling you anything ([Demystifying evals](https://anthropic.com/engineering/demystifying-evals-for-ai-agents)). When that happens:

- Add harder cases from recent production failures.
- Move the saturated cases to a cheaper, less frequent regression run.

## Say it in an interview

> "Model-free rig tests run on every PR in seconds. Smoke evals run on prompt or model changes, and the full suite with repeats runs nightly and before release. Each case's binary checks gate; trajectory and cost are trends. Known failures go in a baseline only with written evidence and an exit condition, and saturated suites get harder cases."

## Check yourself

1. Why not run the full eval suite on every pull request?
2. What makes a baseline entry acceptable?
3. What does it mean when a suite is saturated, and what do you do?
