---
title: "Cheat sheet: mistakes, revision and glossary"
subtitle: "Common mistakes, a one-page revision sheet, a glossary, and the sources behind this guide."
date: 2026-10-25
tags: [ai-agents, evals, llm, interview-prep]
order: 19
---

## Common mistakes

Most eval failures come from a handful of habits. Each one below makes an eval pass when it shouldn't, fail when it shouldn't, or cost more than it teaches.

| Mistake | Why it hurts | Do this instead |
| --- | --- | --- |
| Grading only the final message | The agent can say "done" when nothing happened | Check the end state and the recorded calls |
| Requiring one exact tool sequence | Fails valid alternative paths | Require must-happen steps, forbid harmful ones |
| Mocking the product's own functions | Product logic you meant to test never runs | Fake at the network edge |
| A fake friendlier than the real system | False passes: no pagination, no errors | Mirror real limits and errors; prove it with rig tests |
| Expected values typed by hand | A fixture change silently makes tests wrong | Compute expectations from the fixture |
| One trial per case | You can't tell luck from reliability | Run k trials; report pass^k |
| Trusting an unvalidated LLM judge | Its score is an opinion | Validate against human labels: true positive and true negative rates |
| Using accuracy to validate a judge | Hides a judge that never fails anything | Measure true positive and true negative rates |
| 1–10 scores | Inconsistent between graders and runs | Several binary checks |
| Only "do X" cases | Rewards an agent that always acts | Add ask, refuse and do-nothing cases |
| Shared state between trials | Results leak and inflate | A clean world per trial |
| Hiding failures in a baseline | The test is effectively deleted | Baseline only with evidence and an exit condition |
| Weakening a check because it is red | Moves the goalposts | Change it only with evidence, and disclose it |
| Not reading transcripts | Grader bugs look like agent bugs | Read failing transcripts before concluding anything |
| Blaming the product after one run on one model | Variance or a model quirk | Rerun, and try another model |
| Ignoring cost and step count | A correct but wasteful agent ships | Add budgets on calls, tokens or time |
| Never refreshing the dataset | Saturation and drift | Feed production failures back in; retire saturated cases |
| Generic off-the-shelf metrics | False confidence | Checks built from your own failure modes |

## Revision sheet

Read this the night before.

1. **Agent** = model + tools + loop. The model chooses; code executes.
2. **Eval** = input → run → grade with clear logic. If no model decision is involved, write a unit test.
3. **Task, trial, transcript, outcome:** the case, one attempt, what it said and did, the final state of the world.
4. **Grade three layers** (answer, trajectory, end state) and trust the end state most.
5. **Don't lock one path:** require must-happen steps, forbid harmful ones.
6. **Scorers:** code first; LLM judge for subjective qualities; humans to calibrate both. Binary checks gate; scores and averages are tracked.
7. **Judges:** one failure mode each, binary, reasoning first. Validate on 100+ labels with true positive and true negative rates. Biases: position, verbosity, self-enhancement.
8. **Datasets** come from error analysis of real traces. Balance act and don't-act cases. Compute expected values from fixtures.
9. **Simulate the world** at the network edge, faithfully, with a clean world per trial.
10. **Variance:** pass@k for capability, pass^k for reliability. At 75% per trial, pass^3 ≈ 42%.
11. **Metrics:** success first; then tool accuracy, steps, p50/p95 latency, cost, safety.
12. **CI:** rig tests every PR, smoke evals on changes, the full suite nightly and before release.
13. **Online:** traces, sampled scoring, guardrails inline, evaluators after; failures become offline cases.
14. **Debugging:** agent, rig, setting or product. Find the first upstream failure; rerun on another model.
15. **Your story:** a real harness, real findings, before-and-after numbers, and "I prove the rig first".

## Glossary

| Term | Meaning |
| --- | --- |
| A/B test | Splitting real traffic between two versions and comparing outcomes |
| Agent harness | The code that turns a model into an agent: loop, tools, memory |
| Axial coding | Grouping error-analysis notes into named failure modes |
| Baseline (regression) | The current scores a change is compared against; also a list of known-failing cases, each with evidence and an exit condition |
| Benchmark | A public test set for comparing models generally |
| Capability eval | Measures what an agent can do; starts with a low pass rate |
| Cohen's kappa | Agreement between two graders beyond chance |
| Confidence interval | The range the true pass rate probably lies in, given a small sample |
| Contamination | Benchmark questions or answers that leaked into a model's training data |
| Criteria drift | Grading changes your idea of what "good" means |
| Drift | Behaviour or inputs changing over time without code changes |
| End state (outcome) | What the world looks like after a run |
| Error analysis | Reading traces, naming failure modes, counting them |
| Eval harness | The machinery that runs, records, grades and reports evals |
| F1 | One number combining precision and recall; low if either is low |
| Faithfulness | Every claim is supported by the source text |
| Fixture | The starting data for a test case |
| Flaky case | Passes some trials, fails others |
| Grader (scorer) | Logic that scores one aspect of a run |
| Guardrail | A fast inline check that blocks or fixes output |
| Held-out set | Cases you never tune on, kept to check a fix is general |
| LLM-as-a-judge | A model that grades outputs against a rubric |
| MCP | Model Context Protocol, a standard for connecting tools to agents |
| MRR | Average of 1 ÷ the rank of the first relevant search result, over many queries |
| N–1 testing | Testing the next reply given a real conversation's first N–1 turns |
| Open coding | Free-form notes on each trace during error analysis |
| p50 / p95 | Median / the time 95% of runs beat |
| Pairwise judging | Picking the better of two outputs |
| pass@k | At least one of k trials passes |
| pass^k | All k trials pass |
| Precision / recall | Of the outputs flagged, how many were bad / of the bad outputs, how many were flagged |
| Prompt injection | Text that tries to override the agent's instructions, from the user or from data it reads |
| ReAct | Reason, act, observe, repeat |
| Recall@k | Share of relevant documents found in the top k |
| Regression eval | Checks the agent still does what it did; stays near 100% |
| Rig test | A model-free test proving the harness and checks |
| Saturation | A suite that always passes and stops giving signal |
| Simulated user | An LLM playing the user in multi-turn evals |
| Span | One step inside a trace |
| Trace / transcript / trajectory | The full record of one run |
| Transition failure matrix | Last success × first failure counts, showing where runs break |
| Trial | One attempt at a task |

## Sources

- Anthropic, [Demystifying evals for AI agents](https://anthropic.com/engineering/demystifying-evals-for-ai-agents) (Jan 2026)
- Anthropic, [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) (Dec 2024)
- Hamel Husain and Shreya Shankar, [AI Evals: Everything You Need to Know (Evals FAQ)](https://hamel.dev/blog/posts/evals-faq/)
- Langfuse, [AI agent evaluation](https://langfuse.com/resources/engineering/ai-agent-evaluation.md)
- Zheng et al., [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685) (2023)
- Shankar et al., [Who Validates the Validators?](https://arxiv.org/abs/2404.12272) (2024)
- Yao et al., [τ-bench](https://arxiv.org/abs/2406.12045) (2024)
- Jimenez et al., [SWE-bench](https://arxiv.org/abs/2310.06770) (2023)
- Mialon et al., [GAIA](https://arxiv.org/abs/2311.12983) (2023)
- Zhou et al., [WebArena](https://arxiv.org/abs/2307.13854) (2023)
- Chen et al., [Evaluating Large Language Models Trained on Code](https://arxiv.org/abs/2107.03374) (2021)
