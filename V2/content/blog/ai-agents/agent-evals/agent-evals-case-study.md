---
title: "Chapter 16: A real case study"
subtitle: "Offline evals for a no-code agent platform: what they found and what changed."
date: 2026-10-25
tags: [ai-agents, evals, llm, interview-prep]
order: 17
---

Offline evals for a no-code "custom agent" platform found a real product defect and a prompt conflict, and moved one suite from 6/9 to 8/9 passing at pass^3. This is the story to tell in an interview.

## The setting

- Authors build agents without code: they write instructions and attach connector tools (CMS reads and writes, Slack, file creation), pinning some values such as which content stack to use.
- An agent runs **directly** (a chat playground, an API call, a schedule) or is **handed a job** by an orchestrator agent, where it must plan, may ask the user questions, and needs approval for writes.

## What was built

- **A copy of the real agent**, reusing its production prompt builder, tool resolver (picks the agent's tools), processors (code that edits messages before and after the model) and loop guard (stops repeated identical calls). Only the model (pinned for comparable runs) and memory (in-memory) were swapped.
- **A simulated world** faked at the network boundary: a fake CMS behind a fake connector engine (the service that calls third-party apps for the agent), a local sandbox per case, and the real connector schemas, so the product's own request code ran unchanged.
- **Five suites:** files (13 cases), configuration (6), reads (6), handed-off jobs (9), safety (4). Every case is graded on evidence: API calls made, data after the run, file bytes, the pending question.
- **About 80 model-free rig tests** proving the fakes and checks, and **pass^3** for every real run.

## What the evals found

| Finding | Cause type | Evidence | Fix and result |
| --- | --- | --- | --- |
| On handed-off jobs, list results reached the model as "ambiguous, ask the user which one", with every field stripped | Product | "Count posts by status" failed 0/3; one run moved all 5 posts to In Review, overwriting 3; on a second model, 9 of 9 runs stopped to ask | Keep every row and make the advice conditional. The case went to 3/3, the suite from 6/9 to 8/9, and a list task from 9 API calls to 2 |
| The prompt said "resolve top-down: content type before entry", which pulled against "look things up before asking" | Product (prompt) | Asked "which content type?" before searching in 3 of 6 runs | One added line: when an entry is named without its type, search by name first. It found the entries first in 6 of 6 runs |
| The agent retyped long file links and changed them | Agent | Broken links in 4 runs (one character changed, or a path segment duplicated) | Proposed: don't rely on the model copying links |
| A check required a name in every answer option, though the question already said it | Rig | It failed a correct question | Check fixed with evidence; a rig test now pins both shapes |
| The fake search treated an unknown query field as "match everything" | Rig | It created a false ambiguity | Documented as a known limit |
| The harness counted a hidden loop-guard message as part of the agent's reply | Rig | The guard's text appeared in replies | Real message shape measured first, then fixed and pinned with a test |
| An instruction said "post every update" | Setting | The agent posted progress updates: a fair reading | Case reworded and disclosed |

## Lessons

1. **Prove the measuring tool first.** Three of the seven findings were bugs in the rig, not the agent.
2. **A green result can hide a problem.** A case passed while making 9 API calls where 2 do the job; a call-count budget now fails that.
3. **Before and after, at pass^k.** Every fix was confirmed by numbers moving on repeated runs.
4. **Cross-check on a second model** before calling something a product bug.
5. **Measure before you fix.** The loop-guard fix was based on the real output shape, not a guess.
6. **Disclose every change to a check,** with the evidence that justified it.

## Say it in an interview

> "I built offline evals that run our real custom agent against a simulated CMS, with deterministic checks on API calls and end state, and pass^3. They found a component that stripped data from list results: counting by status failed 0/3, and one run overwrote posts. After the fix it was 3/3 and the suite went from 6/9 to 8/9. A one-line prompt change made the agent search before asking in 6/6 runs instead of 3/6. And three of my 'agent failures' were rig bugs, which is why I prove the rig first."

## Check yourself

1. Which finding would a unit test never have caught, and why?
2. Why does it matter that a second model failed the same way?
3. What made the loop-guard fix trustworthy?
