---
title: "Single Responsibility Principle: one class, one reason to change"
subtitle: If you need the word "and" to describe a class, it's probably doing two jobs.
date: 2026-09-25
tags: [solid, srp, oop, typescript]
order: 1
---

**In simple words:** a class should have only *one* job — one reason to change.

A quick test I use: describe the class in one sentence. If the sentence needs an "and" — *"this class stores cart items **and** builds invoices"* — it's doing too much and should be split.

## Why it matters

When one class handles several jobs, a change for one job (say, how invoices look) forces you to touch a class that also handles something unrelated (cart items). That makes the code riskier to change and harder to test.

## The problem

`ShoppingCart` below does two different jobs:

1. Keeps track of products in the cart (add, list, total).
2. Builds a printable invoice from those products.

```ts
class Product {
  constructor(private name: string, private price: number) {}

  getName(): string {
    return this.name;
  }

  getPrice(): number {
    return this.price;
  }
}

class ShoppingCart {
  private products: Product[] = [];

  addProduct(product: Product): void {
    this.products.push(product);
  }

  getProducts(): Product[] {
    return this.products;
  }

  getTotalPrice(): number {
    return this.products.reduce((total, product) => total + product.getPrice(), 0);
  }

  // job #2 hiding inside a "cart" class — this shouldn't be here
  generateInvoice(): string {
    let invoice = 'Invoice:\n';
    this.products.forEach((product) => {
      invoice += `${product.getName()}: $${product.getPrice()}\n`;
    });
    invoice += `Total: $${this.getTotalPrice()}`;
    return invoice;
  }
}
```

These are two separate reasons to change the same class. If the invoice format changes *or* the cart logic changes, both changes land in the same file, tangled together.

## The fix

Split the two jobs into two classes, each with exactly one reason to change:

- `ShoppingCartSRP` — only manages products (add, list, total).
- `InvoiceGenerator` — only knows how to turn a cart's products into an invoice.

```ts
class ShoppingCartSRP {
  private products: Product[] = [];

  addProduct(product: Product): void {
    this.products.push(product);
  }

  getProducts(): Product[] {
    return this.products;
  }

  getTotalPrice(): number {
    return this.products.reduce((total, product) => total + product.getPrice(), 0);
  }
}

class InvoiceGenerator {
  constructor(private cart: ShoppingCartSRP) {}

  generateInvoice(): string {
    let invoice = 'Invoice:\n';
    this.cart.getProducts().forEach((product) => {
      invoice += `${product.getName()}: $${product.getPrice()}\n`;
    });
    invoice += `Total: $${this.cart.getTotalPrice()}`;
    return invoice;
  }
}

const cart = new ShoppingCartSRP();
cart.addProduct(new Product('Laptop', 1000));
cart.addProduct(new Product('Mouse', 50));

console.log(new InvoiceGenerator(cart).generateInvoice());
```

Now if the invoice format changes, only `InvoiceGenerator` is touched. If the way the cart stores items changes, only `ShoppingCartSRP` is touched. Neither affects the other.

## TL;DR

- **Bad sign:** a class's description needs the word "and" to cover everything it does.
- **Good fix:** pull each separate job into its own class, so each class changes for only one reason.

*Source: [SOLID/SRP.ts](https://github.com/priyanshu-34/LLD/blob/main/SOLID/SRP.ts)*
