---
title: "Chapter 2: Why agents are hard to test"
subtitle: "Seven reasons agent tests break, and why what an agent says is not what it did."
date: 2026-10-25
tags: [ai-agents, evals, llm, interview-prep]
order: 3
---

Agents are hard to test because the same request can take a different path each time, through many steps that change real data, and the agent can say it succeeded when it didn't.

## Seven reasons, with examples

| # | Reason | Blog Assistant example |
| --- | --- | --- |
| 1 | **Non-determinism:** the same input can give different outputs, even at temperature 0 (temperature is the randomness setting; 0 is the least random). | Run "move drafts to In Review" 3 times: 2 runs are perfect, 1 run also changes a Published post. |
| 2 | **Errors compound over steps.** | If each step is right 95% of the time, 10 steps in a row are all right only about 60% of the time (0.95 × 0.95 × … ten times ≈ 0.60). |
| 3 | **Side effects:** tools change the world, so checking the reply text is not enough. | The reply says "3 posts updated", but only 2 were. You must check the posts themselves. |
| 4 | **Many valid paths.** | `search_posts("Spring sale")` and listing every post can both find the right post. A test that demands one exact path fails good runs. |
| 5 | **Outside dependencies.** | The real CMS changes daily, is slow, or is down. Results become flaky for reasons unrelated to the agent. |
| 6 | **Open-ended output.** | "Write a friendly Slack summary" has no single right answer. |
| 7 | **Constant change.** | A new model version, a prompt tweak or a changed tool schema can quietly break something that worked. |

## The most important idea: "said" is not "did"

An agent's final message is a *claim*. The changed data, the API calls it made and the files it produced are the *evidence*.

> The agent says: *"I've moved all 3 drafts to In Review."* The data shows: 2 posts changed, 1 call failed with an error the agent ignored.

A good eval trusts the evidence. Anthropic's eval guide calls this the difference between the **transcript** (what the agent said and did) and the **outcome** (the final state of the world) ([Demystifying evals for AI agents](https://anthropic.com/engineering/demystifying-evals-for-ai-agents)).

## Say it in an interview

> "Agents are non-deterministic, multi-step and stateful. Errors compound across steps, many paths can be correct, and the agent's final message can disagree with what it actually did. So agent evals check outcomes in a controlled environment, run each case several times, and avoid locking in one exact path."

## Check yourself

1. If each step succeeds 90% of the time, roughly how often do 5 steps all succeed? (Answer: 0.9⁵ ≈ 59%.)
2. Why can't you grade an agent by its final message alone?
3. Give an example where two different tool paths are both correct.
