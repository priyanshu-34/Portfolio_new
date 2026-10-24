---
title: "Chapter 8: Simulating the world"
subtitle: "Run the real agent in a fake world that behaves like the real one."
date: 2026-10-25
tags: [ai-agents, evals, llm, interview-prep]
order: 9
---

Run the real agent in a fake world: keep the agent's own code real, and fake only what sits outside it, at the outermost edge. Only the model stays live.

## What to fake, what to keep real

| Keep real | Fake | Why |
| --- | --- | --- |
| The system prompt and how it is built | The CMS and other external APIs | Offline, repeatable, and the case controls the data |
| Tool definitions and schemas | Databases and caches | No shared state between runs |
| The code that executes tool calls | Sandboxes for running code or building files | Safe, and cleaned after each case |
| Retry, loop-guard and approval logic | Slack, email, file storage | Nothing real is sent |
| The model | — | It is the thing you are testing |

## Fake at the edge, not inside

Suppose `update_post` builds a request, adds the API key the author configured, then sends it over HTTP.

- **Wrong:** replace the whole `update_post` function with a fake. The step that adds the configured key never runs, so a bug there can't be caught.
- **Right:** let `update_post` run and answer the HTTP request with a fake server. Everything the product does before the network still runs.

## The fake must behave like the real thing

A fake that is friendlier than production gives false passes.

| Real behaviour | If the fake ignores it |
| --- | --- |
| list\_posts returns at most 50 posts per page | Pagination bugs are never tested |
| A wrong id returns a specific error with a code | The agent's error handling is never tested |
| Totals are returned only when asked for | The agent seems to know totals it would not know in production |
| Writes need the data in a specific shape | Malformed writes "succeed" in the eval and fail in production |

**Prove the fake with tests that don't use a model:** call each fake tool directly and check it pages, errors and validates like the real API. These are rig tests: the rig is everything around the model in a test (fakes, starting data and checks), and a rig test proves it without a model.

## Isolation: a clean world for every trial

Each trial should start from a fresh copy: its own data, its own sandbox folder, its own conversation thread. Anthropic warns that shared state between trials leaks information, for example an agent reading the git history left by an earlier trial, and inflates scores ([Demystifying evals](https://anthropic.com/engineering/demystifying-evals-for-ai-agents)).

## Simulated users for multi-turn agents

Some agents talk back and forth with a user. A second LLM can play the user, with a hidden goal and a persona. τ-bench works this way: a model plays the customer, the agent uses real-looking tools under a policy, and success is judged by comparing the database at the end with the expected state ([Yao et al., 2024](https://arxiv.org/abs/2406.12045)).

Example for Blog Assistant: the simulated user is told *"You want the spring sale post published, but you only remember it mentions shoes. Answer questions briefly."*

## Approvals and questions

If the agent pauses for approval before writes, run each write case two ways:

- **Approval off (auto-approve):** the write should land exactly once.
- **Approval on:** the run should stop at the write, with nothing changed.

A pending question (`ask_user`) is a valid ending; grade the question itself.

## Record everything

The fake world is also your witness. Record every API call (with its final arguments), every write, every file produced and every message sent. These recordings are what your checks read.

## Say it in an interview

> "I run the real agent code against a simulated environment faked at the network boundary, so product logic like merging configured values still runs. The fake mimics real pagination, errors and validation, and I prove it with model-free tests. Every trial gets a clean world, and the fake records every call and write as evidence for the graders."

## Check yourself

1. Why fake the HTTP layer instead of the tool function?
2. Give an example of a fake that is "too friendly".
3. How would you test both sides of an approval step?
