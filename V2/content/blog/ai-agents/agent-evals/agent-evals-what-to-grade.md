---
title: "Chapter 5: What to grade"
subtitle: "Grade the answer, the path and the end state, and trust the end state most."
date: 2026-10-25
tags: [ai-agents, evals, llm, interview-prep]
order: 6
---

An agent run has three layers to grade: what it **said**, the **path** it took, and what it **changed**. For agents, what changed is the strongest evidence.

## The three layers

| Layer | Question | Blog Assistant check | How you check it |
| --- | --- | --- | --- |
| **Final answer** | Did it tell the user the right thing? | Reply says "3 posts moved" and names them | Look for required facts in the text |
| **Trajectory** (path) | Did it work sensibly? | Called `list_posts` first; called `update_post` 3 times, not 12 | Inspect the tool calls and their arguments |
| **End state** (outcome) | Is the world right afterwards? | Exactly the 3 drafts are In Review; nothing else changed | Read the fake CMS after the run |

These layers fail independently ([Langfuse guide](https://langfuse.com/resources/engineering/ai-agent-evaluation.md)):

- A run can reach the right end state by a wasteful path (12 calls where 2 would do).
- A run can follow a perfect path and then report the wrong number.
- A run can report success when the end state is wrong.

## Tool-call correctness

For each tool call, ask four questions:

1. **Right tool?** A lookup by id should use `get_post`, not list all 200 posts.
2. **Right arguments?** `update_post(id="p42", status="In Review")`, not a made-up id like `spring_sale_post`.
3. **Right number of times?** Each draft updated once, not twice.
4. **Right order, only when order matters?** Reading before writing matters; whether it searched before listing usually doesn't.

## Grade the outcome, not one rigid path

A test that demands "call `search_posts`, then `get_post`, then `update_post`" fails an agent that found the post another valid way. Anthropic lists overly rigid step checks as a common pitfall ([Demystifying evals](https://anthropic.com/engineering/demystifying-evals-for-ai-agents)).

Better:

- **Require** the steps that must happen: an `update_post` for each draft.
- **Forbid** the steps that must never happen: any `update_post` on a Published post, any `delete_post`.
- **Allow** everything else.

## Efficiency is part of quality

Two runs can both give the right answer:

| Run | Calls | Time | Verdict on outcome |
| --- | --- | --- | --- |
| A | `list_posts` once, then answer | 20 s | Pass |
| B | `list_posts`, then `get_post` for every post one by one | 58 s | Pass |

If you only check the answer, run B looks fine. A budget such as **"at most 4 calls"** makes the waste fail.

## Binary checks, combined

Prefer several small **pass/fail checks** over one 1–5 score: they are clearer and more consistent ([Evals FAQ](https://hamel.dev/blog/posts/evals-faq/)). A case passes only if every check passes ("pass all").

```text
check(run) = [
  drafts all In Review?           -> failure message if not
  no other post changed?          -> failure message if not
  update_post called 3 times?     -> failure message if not
  reply names the 3 posts?        -> failure message if not
]
pass = the list of failures is empty
```

Write each failure message so it names the fix: *"p17 (Published) was changed to In Review; only drafts should change"* beats *"wrong output"*.

## Say it in an interview

> "I grade three layers: the answer, the trajectory and the end state, and I trust the end state most. I require the steps that must happen and forbid the harmful ones instead of locking one exact path. I combine small binary checks, and I add a step or cost budget, because a correct answer reached wastefully is still a problem."

## Check yourself

1. Give an example where the trajectory is perfect but the run still fails.
2. Why is a rigid step-by-step check a bad idea?
3. How would you make a test fail a correct-but-wasteful run?
