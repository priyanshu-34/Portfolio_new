---
title: "Chapter 7: LLM-as-a-judge in depth"
subtitle: "How to write a judge, the biases to watch for, and how to prove it agrees with people."
date: 2026-10-25
tags: [ai-agents, evals, llm, interview-prep]
order: 8
---

An LLM judge is a second model that grades an output against a rubric. It is a measuring instrument: useful for judgment calls, but only trustworthy after you have measured how often it agrees with humans.

## A simple judge

Task: grade the Slack message Blog Assistant wrote after moving 3 posts.

```text
You are grading a Slack update written by an assistant.

Facts (from the run): 3 posts moved to In Review: "Spring sale", "Q3 recap", "Hiring update".
Message: <the agent's Slack message>

The message PASSES only if:
- it names all 3 posts and no others, and
- it states nothing that is not in the facts.

First explain your reasoning in 2-3 sentences, then answer PASS or FAIL.
```

Notice: one narrow question, a binary answer, the facts handed over, and reasoning before the verdict.

## Kinds of judge

| Kind | How it works | Use it when | Example |
| --- | --- | --- | --- |
| **Pointwise** | Grade one output on its own | You need a pass/fail per output | "Is this summary accurate?" |
| **Pairwise** | Compare two outputs and pick the better | Comparing two prompt or model versions | "Which of A and B is clearer?" |
| **Reference-based** | Compare against a gold answer | You have expected answers | "Does it say the same as the reference?" |
| **Reference-free** | A rubric only | No gold answer exists | "Is the tone friendly?" |
| **Step-level** | Grade each step of an agent's run separately | Finding where a long run went wrong | "Was this tool call sensible given what it knew?" |

## Known biases and fixes

The classic study of LLM judges named position bias, verbosity bias, self-enhancement bias and limited reasoning ability. It also found GPT-4 as a judge agreed with human preferences over 80% of the time, about as often as humans agree with each other ([Zheng et al., 2023](https://arxiv.org/abs/2306.05685)).

| Bias | What happens | Fix |
| --- | --- | --- |
| **Position** | Prefers the first (or second) answer it sees | Ask twice with the order swapped; count only consistent verdicts |
| **Verbosity** | Prefers longer answers | Rubric says length is not quality; compare answers of similar length |
| **Self-enhancement** | Prefers answers in its own style or from its own model | Use a different model as judge, or validate carefully |
| **Weak reasoning** | Misgrades maths, code or logic | Give it the facts, or check those parts with code instead |
| **Leniency and drift** | Scores creep up, or change when the judge model updates | Pin the judge model and prompt; re-validate after any change |

## Writing a good judge

1. **One judge per failure mode.** "Accurate?" and "friendly?" are two judges, not one.
2. **Binary, not 1–10.** Pass/fail is easier to make consistent ([Evals FAQ](https://hamel.dev/blog/posts/evals-faq/)).
3. **Define pass and fail precisely,** with one example of each.
4. **Reasoning before the verdict.**
5. **Only the context it needs:** extra context can make it worse.
6. **Temperature 0** and a pinned model version.

## Validating a judge: the step most people skip

Treat the judge like any classifier:

1. A domain expert labels outputs by hand, pass or fail. The Evals FAQ suggests 100–200 labelled examples per failure mode, split into train, dev and test sets, each with plenty of both passes and fails. Train examples may go into the judge prompt, dev is for tuning the prompt, and test is used once, at the end, to measure it ([Evals FAQ](https://hamel.dev/blog/posts/evals-faq/)).
2. Run the judge on the same outputs.
3. Measure two numbers:
   - **True positive rate:** of the outputs the expert *failed*, how many did the judge also fail? (Does it catch problems?)
   - **True negative rate:** of the outputs the expert *passed*, how many did the judge also pass? (Does it avoid false alarms?)
4. Fix the rubric where they disagree, then test again on the held-out set.

**Why not plain accuracy?** If 95 of 100 outputs are good, a judge that always says PASS is 95% "accurate" and catches nothing.

**Precision and recall** are two more ways to read the same pass/fail table. Recall (the same as the true positive rate) asks: of the real failures, how many did the judge catch? Precision asks: of the outputs the judge failed, how many were really bad? A judge that fails everything has perfect recall and poor precision. F1 combines the two into one number, and it is low if either one is low.

**Cohen's kappa** is another agreement measure: how much the judge and the human agree beyond what chance alone would give. 1 is perfect, 0 is no better than chance. Example: a judge that always says PASS, on 95 good and 5 bad outputs, agrees with the human 95% of the time, but chance alone would give 95% too, so kappa is 0.

**How good can judges get?** In the MT-Bench study, a strong model (GPT-4) graded answers to 80 multi-turn questions and agreed with human experts over 80% of the time, about as often as two humans agree. The same paper introduced Chatbot Arena, where real users compare two anonymous models and vote ([Judging LLM-as-a-Judge](https://arxiv.org/abs/2306.05685)). A good result in a study does not carry over to your task for free: validate your own judge.

## Criteria drift

While grading, people change their minds about what "good" means. Shankar et al. call this **criteria drift**: you need criteria to grade outputs, but grading outputs changes your criteria ([Who Validates the Validators?](https://arxiv.org/abs/2404.12272)). Expect to revise the rubric several times.

## When not to use a judge

- The answer is checkable with code (a count, a state, an id).
- You can't afford a second model call per case.
- You haven't validated it yet. An unvalidated judge is an opinion, not a measurement.

## Say it in an interview

> "I use an LLM judge only for subjective qualities, one narrow binary question per judge, reasoning before verdict. Before trusting it I label 100+ examples by hand and measure true positive and true negative rates on a held-out set, because accuracy hides a judge that never fails anything. I watch for position, verbosity and self-preference bias, pin the judge model, and re-validate after any change."

## Check yourself

1. Why does accuracy mislead when most outputs are good?
2. How do you reduce position bias in a pairwise judge?
3. What is criteria drift, and what does it mean for writing rubrics?
