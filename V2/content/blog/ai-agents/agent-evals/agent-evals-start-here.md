---
title: "Agent Evals, Simply: start here"
subtitle: "A plain-words guide to AI agents and how to test them, from the first idea to interview answers."
date: 2026-10-25
tags: [ai-agents, evals, llm, interview-prep]
order: 1
---

This book takes you from "what is an agent?" to answering hard interview questions about agent evals, in plain words and with one example that runs through every chapter.

**Who it is for:** anyone who builds or tests AI agents, or is preparing for interviews about them. No maths beyond simple fractions is needed.

**How it is laid out:**

1. **Part 1 — Foundations:** what an agent is, why it is hard to test, and what an eval is.
2. **Part 2 — Building evals:** test cases, what to grade, scorers, LLM-as-a-judge, simulated worlds and statistics.
3. **Part 3 — Running evals in practice:** metrics, CI, production monitoring, debugging, special topics, tools and a real case study.
4. **Part 4 — Interview prep:** a question bank with short answers, common mistakes and a one-page revision sheet.

Every chapter ends with **"Say it in an interview"** (one or two sentences you can repeat) and **"Check yourself"** (questions to test your understanding).

## The running example: Blog Assistant

All examples use one small agent, so you never have to learn a new setup.

> **Blog Assistant** helps a content team manage blog posts. A user types a request; the agent decides which tools to call.

| Tool | What it does | Reads or writes |
| --- | --- | --- |
| `list_posts` | Lists posts, 50 per page, with title and status | Reads |
| `search_posts` | Finds posts by words in the title | Reads |
| `get_post` | Gets one post by its id | Reads |
| `update_post` | Changes a post's title, body or status | Writes |
| `delete_post` | Deletes a post. The system prompt forbids it, so evals check it is never called | Writes |
| `send_slack` | Posts a message to a Slack channel | Writes |
| `ask_user` | Asks the user a question and waits | Neither |

Example request: *"Move every Draft post to In Review and tell #content-team."* A good agent lists the posts, finds the drafts, updates each one once, and posts one Slack message.

## How to study

1. **First pass:** read Parts 1 and 2 in order. Do not skip Chapter 3; everything builds on it.
2. **Second pass:** read Part 3 and try to explain each chapter out loud using Blog Assistant.
3. **Before the interview:** drill the question bank in Part 4, then read the revision sheet the night before.
