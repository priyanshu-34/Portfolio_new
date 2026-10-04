---
title: "Dependency Inversion Principle: depend on interfaces, not concrete classes"
subtitle: An email client shouldn't be locked in to Gmail.
date: 2026-09-26
tags: [solid, dip, dependency-injection, typescript]
order: 5
---

**In simple words:** a high-level class (the one with the main business logic) should not depend directly on a low-level class (the one doing the grunt work, like sending an email). Both should depend on an *interface* in between.

## Why it matters

If `EmailClient` directly creates and calls Gmail, it's locked in to Gmail. The day we need Outlook — or both — we have to edit `EmailClient` itself. That's risky, and it breaks the [Open/Closed Principle](/blog/low-level-design/solid/open-closed-principle) too.

If `EmailClient` only knows about an interface — *"something that can send a message"* — we can hand it any class that implements it: Gmail, Outlook, or a new provider next year, without changing `EmailClient` at all.

## The problem

`EmailClient` depends on the concrete `GmailClient` class. It isn't talking to "an email sender" in general; it's talking to Gmail specifically:

```ts
class GmailClient {
  send() {
    console.log('Sending email via Gmail');
  }
}

class EmailClientTightlyCoupled {
  constructor(private gmail: GmailClient) {}

  sendEmail() {
    this.gmail.send();
  }
}

new EmailClientTightlyCoupled(new GmailClient()).sendEmail();
```

To switch to Outlook tomorrow, there's no choice but to open up `EmailClient` and rewrite it.

## The fix

Introduce an interface — `EmailInterface` — that says *"anything that can `send(message)` counts as an email sender"*. Gmail and Outlook both implement it, and `EmailClient` depends only on the interface:

```ts
interface EmailInterface {
  send(message: string): void;
}

class Gmail implements EmailInterface {
  send(message: string) {
    console.log('Sending email via Gmail: ' + message);
  }
}

class Outlook implements EmailInterface {
  send(message: string) {
    console.log('Sending email via Outlook: ' + message);
  }
}

class EmailClient {
  constructor(private email: EmailInterface) {}

  sendEmail(message: string) {
    this.email.send(message);
  }
}

// EmailClient doesn't care which one it gets —
// it only knows it can call send(). That's the whole point.
new EmailClient(new Gmail()).sendEmail('Hello, this is Gmail');
new EmailClient(new Outlook()).sendEmail('Hello, this is Outlook');
```

The concrete sender is passed in from outside rather than created inside `EmailClient`. That's **dependency injection** — the practical way to apply this principle.

## TL;DR

- **Bad sign:** a high-level class creates or depends on a specific low-level class directly (`new Gmail()` inside it).
- **Good fix:** both sides depend on a shared interface, and the actual low-level class is passed in from outside.

*Source: [SOLID/DIP.ts](https://github.com/priyanshu-34/LLD/blob/main/SOLID/DIP.ts)*
