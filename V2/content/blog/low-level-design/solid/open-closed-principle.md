---
title: "Open/Closed Principle: add behaviour without editing working code"
subtitle: Supporting a new payment method should mean adding a class, not another else-if.
date: 2026-09-25
tags: [solid, ocp, oop, typescript]
order: 2
---

**In simple words:** code should be *open* for adding new behaviour, but *closed* for editing what's already there and working.

When you need to support something new, you should be able to add new code for it — instead of going back and changing an existing class that already works (and might already be used elsewhere).

## Why it matters

Every edit to a class that already works risks breaking something that depends on it. If you can "plug in" new behaviour without touching old code, there's nothing old to accidentally break.

## The problem

`PaymentProcessor` decides what to do based on a string, using `if/else`:

```ts
class PaymentProcessor {
  processPayment(paymentMethod: string, amount: number): void {
    if (paymentMethod === 'creditCard') {
      console.log(`Processing credit card payment of $${amount}`);
    } else if (paymentMethod === 'paypal') {
      console.log(`Processing PayPal payment of $${amount}`);
    } else {
      // adding UPI, Stripe, etc. later means coming back
      // and editing this exact function again and again
      throw new Error('Unsupported payment method');
    }
  }
}
```

Every time we want a *new* payment method — UPI, Stripe — we reopen this class and add another branch. That means:

- We keep editing a class that already works, risking bugs in the methods that were fine before.
- The class keeps growing forever and never feels "done".

## The fix

Instead of one class that knows every payment method by name, define a common shape — an interface that says *"any payment processor must have a `processPayment` method"*. Each payment method becomes its own small class that implements it.

```ts
interface PaymentProcessorInterface {
  processPayment(amount: number): void;
}

class StripePaymentProcessor implements PaymentProcessorInterface {
  processPayment(amount: number): void {
    console.log(`Processing Stripe Payment of $${amount}`);
  }
}

class UPIPaymentProcessor implements PaymentProcessorInterface {
  processPayment(amount: number): void {
    console.log(`Processing UPI Payment of $${amount}`);
  }
}

// Later, supporting PayPal is just a new class — nothing above changes:
// class PayPalPaymentProcessor implements PaymentProcessorInterface { ... }

new StripePaymentProcessor().processPayment(40);
new UPIPaymentProcessor().processPayment(40);
```

Want to support a new payment method tomorrow? Add a new class. No existing class needs to be opened or edited.

## TL;DR

- **Bad sign:** adding new behaviour means going back into an existing, working class and adding another `if/else` branch.
- **Good fix:** define a common interface and add new behaviour as a brand-new class that implements it — old code stays untouched.

*Source: [SOLID/OCP.ts](https://github.com/priyanshu-34/LLD/blob/main/SOLID/OCP.ts)*
