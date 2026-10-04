---
title: "Factory pattern, part 2: sending notifications over email, SMS and push"
subtitle: The same six stages in a new domain — and a new kind of mismatched family.
date: 2026-10-01
tags: [design-patterns, factory, typescript]
order: 2
---

This is the second pass at the [factory pattern](/blog/low-level-design/design-patterns/factory-pattern), in a different domain: sending a message to a user over **email, SMS or push**. The point of redoing it is to check that each stage fixes the same pain in a different setting.

## Stage 0: no factory

Every place that notifies a user — signup, password reset, order shipped — builds the sender itself, so every place has to know which channel is active and what each channel's constructor needs. Again, the constructors don't match:

```ts
interface Notifier {
  send(to: string, message: string): void;
}

class EmailNotifier implements Notifier {
  // Email needs an SMTP server...
  constructor(private smtpHost: string, private port: number, private fromAddress: string) {}
  send(to: string, message: string) {
    console.log(`Email via ${this.smtpHost}:${this.port} from ${this.fromAddress} to ${to}: ${message}`);
  }
}

class SmsNotifier implements Notifier {
  // ...SMS needs an account id, a token and a sender number.
  constructor(private accountSid: string, private authToken: string, private fromNumber: string) {}
  send(to: string, message: string) {
    console.log(`SMS from ${this.fromNumber} to ${to}: ${message}`);
  }
}
```

## Stages 1–3: one function, then config, then a registry

These map one-to-one onto the storage example:

- **Simple Factory** — `createNotifier(channel: 'email' | 'sms'): Notifier`. The union makes a typo like `"emial"` a compile error instead of a runtime surprise, and returning the interface keeps `EmailNotifier` out of callers' sight.
- **Config-driven** — SMTP host, SMS token and the active channel move into a config object; `createNotifier()` takes no arguments and the caller names no channel or credentials.
- **Registry** — adding push is a new class plus one `register()` call, with no edit to `createNotifier()`:

```ts
// The new channel. Only ONE constructor field — shapes still don't match.
class PushNotifier implements Notifier {
  constructor(private serverKey: string) {}
  send(to: string, message: string) {
    console.log(`Push to device ${to}: ${message}`);
  }
}

register('email', (c) => new EmailNotifier(c.smtpHost, c.port, c.fromAddress));
register('sms', (c) => new SmsNotifier(c.accountSid, c.authToken, c.fromNumber));
register('push', (c) => new PushNotifier(c.serverKey));

function createNotifier(): Notifier {
  const create = registry[config.channel];
  if (!create) throw new Error(`Unknown notification channel: ${config.channel}`);
  return create(config[config.channel]);
}
```

Same price as before: `registry[name]` can be missing at runtime and `Record<string, Creator>` hides that from the compiler — the guard is on me.

## Stage 4: Abstract Factory — formatter and sender must match

A notification is really **two** objects: a *formatter* that turns the message into the channel's shape, and a *sender* that delivers it.

Build them with two separate factories and they can disagree. An HTML email body sent as an SMS arrives as `<h1>Hi</h1><p>Your OTP...`, eats the 160-character limit, and nothing throws. Another mismatched family.

One factory per channel builds both, so the channel is chosen once:

```ts
interface Formatter {
  format(title: string, body: string): string;
}

interface Sender {
  send(to: string, formatted: string): void;
}

interface NotificationFactory {
  createFormatter(): Formatter;
  createSender(): Sender;
}

class HtmlFormatter implements Formatter {
  format(title: string, body: string) {
    return `<h1>${title}</h1><p>${body}</p>`;
  }
}

class SmsFormatter implements Formatter {
  format(title: string, body: string) {
    return `${title}: ${body}`.slice(0, 160);
  }
}

class EmailFactory implements NotificationFactory {
  constructor(private fromAddress: string) {}
  createFormatter() { return new HtmlFormatter(); }
  createSender() { return new EmailSender(this.fromAddress); }
}

class SmsFactory implements NotificationFactory {
  constructor(private fromNumber: string) {}
  createFormatter() { return new SmsFormatter(); }
  createSender() { return new SmsSender(this.fromNumber); }
}

// The channel decision, made exactly once.
function getNotificationFactory(): NotificationFactory {
  return config.channel === 'sms'
    ? new SmsFactory(config.sms.fromNumber)
    : new EmailFactory(config.email.fromAddress);
}

const factory = getNotificationFactory();
const text = factory.createFormatter().format('Welcome', 'Thanks for signing up');
factory.createSender().send('priya@example.com', text);
```

**When not to use it:** if the formatter is only ever used by its own sender, just call `format()` inside `send()`. Keep them separate only when other code needs the formatter alone — for example, a "preview this message" screen.

## Stage 5: Factory Method — a shared notify workflow

The base class owns the workflow — check quiet hours, send, record it — and leaves one creation step to subclasses:

```ts
abstract class NotificationService {
  // THE FACTORY METHOD: subclasses fill it in.
  protected abstract createNotifier(): Notifier;

  // Shared workflow — the reason the base class exists.
  notify(to: string, message: string): void {
    console.log(`[check] ${to} is not in quiet hours`);   // shared step
    this.createNotifier().send(to, message);              // deferred to the subclass
    console.log('[log] notification recorded');           // shared step
  }
}

class EmailService extends NotificationService {
  constructor(private fromAddress: string) { super(); }
  protected createNotifier(): Notifier { return new EmailNotifier(this.fromAddress); }
}

class SmsService extends NotificationService {
  constructor(private fromNumber: string) { super(); }
  protected createNotifier(): Notifier { return new SmsNotifier(this.fromNumber); }
}

new SmsService('+10000000000').notify('+19999999999', 'Your OTP is 4821');
```

## What carried over

Every stage solved the same problem it solved for storage: Simple Factory centralises `new`, config hides credentials, a registry lets new channels plug in, Abstract Factory prevents mismatched parts, and Factory Method varies one object inside a shared workflow. Only the domain changed — which was the point of redoing it.

*Source: [DesignPatterns/factoryPattern2.ts](https://github.com/priyanshu-34/LLD/blob/main/DesignPatterns/factoryPattern2.ts)*
