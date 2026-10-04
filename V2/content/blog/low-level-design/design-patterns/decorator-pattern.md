---
title: "Decorator pattern: add toppings without a subclass explosion"
subtitle: Wrap a pizza in decorators to extend its description and price at runtime.
date: 2026-10-02
tags: [design-patterns, decorator, typescript]
order: 4
---

**Problem statement:** build a pizza-ordering system where a user orders a basic pizza and adds toppings — cheese, pepperoni, mushrooms. Each topping should change both the pizza's description and its cost.

## Without the Decorator pattern

The obvious approach: a base `Pizza` class and a subclass for every combination of toppings.

```ts
class Pizza {
  description = 'Basic Pizza';
  cost = 5; // base cost

  getDescription(): string {
    return this.description;
  }

  getCost(): number {
    return this.cost;
  }
}

class PizzaWithCheese extends Pizza {
  constructor() {
    super();
    this.description += ', Cheese';
    this.cost += 2;
  }
}

class PizzaWithPepperoni extends Pizza {
  constructor() {
    super();
    this.description += ', Pepperoni';
    this.cost += 3;
  }
}

class PizzaWithMushrooms extends Pizza {
  constructor() {
    super();
    this.description += ', Mushrooms';
    this.cost += 1.5;
  }
}
```

This leads to a large number of subclasses and isn't flexible. Cheese *and* pepperoni needs yet another class, and every new topping multiplies the combinations.

## With the Decorator pattern

The Decorator pattern adds behaviour to an object **dynamically**, without changing its structure. Instead of subclassing for every combination, each topping becomes a *wrapper* around any pizza.

Three parts:

1. A common interface, `PizzaComponent`, that both pizzas and toppings implement.
2. The base object, `BasicPizza`.
3. An abstract `PizzaDecorator` that holds a `PizzaComponent` and is one itself — so decorators can wrap other decorators.

```ts
interface PizzaComponent {
  getDescription(): string;
  getCost(): number;
}

class BasicPizza implements PizzaComponent {
  getDescription(): string {
    return 'Basic Pizza';
  }

  getCost(): number {
    return 5;
  }
}

abstract class PizzaDecorator implements PizzaComponent {
  constructor(protected pizza: PizzaComponent) {}

  abstract getDescription(): string;
  abstract getCost(): number;
}
```

Each concrete decorator delegates to the pizza it wraps, then adds its own part:

```ts
class CheeseDecorator extends PizzaDecorator {
  getDescription(): string {
    return this.pizza.getDescription() + ', Cheese';
  }

  getCost(): number {
    return this.pizza.getCost() + 2;
  }
}

class PepperoniDecorator extends PizzaDecorator {
  getDescription(): string {
    return this.pizza.getDescription() + ', Pepperoni';
  }

  getCost(): number {
    return this.pizza.getCost() + 3;
  }
}
```

Now toppings stack in any order and any combination:

```ts
const withCheese = new CheeseDecorator(new BasicPizza());
console.log(withCheese.getDescription()); // Basic Pizza, Cheese
console.log(withCheese.getCost());        // 7

const withCheeseAndPepperoni = new PepperoniDecorator(withCheese);
console.log(withCheeseAndPepperoni.getDescription()); // Basic Pizza, Cheese, Pepperoni
console.log(withCheeseAndPepperoni.getCost());        // 10
```

## Why it's better

- **One class per topping**, not one per combination. A new topping is one new decorator.
- **Combinations happen at runtime** by wrapping, so the menu can change without new classes.
- Existing classes never change when a topping is added — [open for extension, closed for modification](/blog/low-level-design/solid/open-closed-principle).

*Source: [DesignPatterns/decoratorPattern.ts](https://github.com/priyanshu-34/LLD/blob/main/DesignPatterns/decoratorPattern.ts)*
