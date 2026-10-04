---
title: "Observer pattern: subscribe once, get notified on every change"
subtitle: A YouTube-style channel and its subscribers — the pattern behind every event system.
date: 2026-10-01
tags: [design-patterns, observer, typescript]
order: 3
---

The Observer pattern is for **subscribe-model** situations: one object (the *subject*) keeps a list of interested objects (the *observers*) and tells all of them when something happens. Think of a channel and its subscribers — subscribers don't keep checking for new videos; the channel notifies them.

## The two roles

- **Subject** (`Channel`) — keeps a list of subscribers and can add, remove and notify them.
- **Observer** (`Subscriber`) — exposes one method, `update()`, that the subject calls.

The subject only knows the observer *interface*, never the concrete classes behind it. That's what keeps the two sides loosely coupled — anything that implements `update()` can subscribe.

```ts
interface Subscriber {
  update(channel: Channel): void;
}

interface Channel {
  addSubscriber(subscriber: Subscriber): void;
  removeSubscriber(subscriber: Subscriber): void;
  notify(): void;
}
```

## The subject

```ts
class MyChannel implements Channel {
  private subscribers: Subscriber[] = [];

  constructor(public id: number) {}

  addSubscriber(subscriber: Subscriber) {
    this.subscribers.push(subscriber);
    console.log('User added as subscriber');
  }

  removeSubscriber(subscriber: Subscriber) {
    this.subscribers = this.subscribers.filter((s) => s !== subscriber);
  }

  notify() {
    for (const subscriber of this.subscribers) {
      subscriber.update(this);
    }
  }
}
```

## The observer

```ts
class User implements Subscriber {
  update(channel: Channel): void {
    console.log('Update notification received from channel', channel);
  }
}
```

## Wiring it up

```ts
const channel = new MyChannel(2);
const user1 = new User();
const user2 = new User();

channel.addSubscriber(user1);
channel.addSubscriber(user2);

channel.notify(); // both users receive the update
```

Adding a new kind of subscriber — an email notifier, an analytics logger — means writing a class with an `update()` method. `MyChannel` doesn't change, which is the [Open/Closed Principle](/blog/low-level-design/solid/open-closed-principle) at work.

## Where you see it

Any time one change must fan out to many listeners: UI event listeners, pub/sub systems, webhooks, and "notify me" features in general.

*Source: [DesignPatterns/observerPattern.ts](https://github.com/priyanshu-34/LLD/blob/main/DesignPatterns/observerPattern.ts)*
