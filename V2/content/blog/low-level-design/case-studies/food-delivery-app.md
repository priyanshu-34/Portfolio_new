---
title: "Designing a food delivery app: restaurants, cart, checkout and payments"
subtitle: Built in two phases — browse and add to cart first, then orders and pluggable payments.
date: 2026-09-30
tags: [lld, case-study, typescript]
order: 2
---

A food-delivery system built in phases, the way you'd approach it in a machine-coding round: get a thin slice working end to end, then extend it.

- **Phase 1:** restaurants with menus, search by location, and a cart.
- **Phase 2:** checkout — create an order, take payment, clear the cart.

## The entities

| Class | Responsibility |
| --- | --- |
| `Menu` | One menu item: id, name, price |
| `Restaurant` | Name, location and its menu items |
| `RestaurantManager` | Registers restaurants and searches them by location |
| `Cart` | Items from **one** restaurant, plus the total |
| `User` | Owns a cart and an order history; checks out |
| `Order` | A snapshot of what was bought, its total and payment status |
| `Payable`, `PaymentGateway` | Pluggable payment methods |

## Phase 1: restaurants, search and the cart

```ts
class Menu {
  constructor(private id: number, private name: string, private price: number) {}

  getMenu() {
    return { id: this.id, name: this.name, price: this.price };
  }
}

class Restaurant {
  private menuItems: Menu[] = [];

  constructor(private id: number, private name: string, private location: string) {}

  getRestaurant() {
    return { id: this.id, name: this.name, location: this.location, menu: this.menuItems };
  }

  addMenu(id: number, name: string, price: number) {
    this.menuItems.push(new Menu(id, name, price));
  }

  getMenuItem(id: number) {
    return this.menuItems.find((item) => item.getMenu().id === id);
  }
}

class RestaurantManager {
  private restaurants: Restaurant[] = [];

  addRestaurant(id: number, name: string, location: string) {
    const restaurant = new Restaurant(id, name, location);
    this.restaurants.push(restaurant);
    return restaurant;
  }

  search(location: string) {
    return this.restaurants.find((r) => r.getRestaurant().location === location);
  }
}
```

### The one-restaurant cart rule

Like real delivery apps, a cart can only hold items from **one** restaurant. Adding an item from a different restaurant empties the cart first:

```ts
class Cart {
  private menuItems: Menu[] = [];
  private restaurant: Restaurant | undefined;

  addItem(menuItem: Menu, restaurant: Restaurant) {
    if (this.restaurant && this.restaurant !== restaurant) {
      this.menuItems = []; // switching restaurants starts a new cart
    }
    this.restaurant = restaurant;
    this.menuItems.push(menuItem);
  }

  getItems() {
    return { restaurant: this.restaurant, items: this.menuItems };
  }

  calculatePrice() {
    return this.menuItems.reduce((total, item) => total + item.getMenu().price, 0);
  }

  clearCart() {
    this.restaurant = undefined;
    this.menuItems = [];
  }
}
```

At the end of phase 1 a user can find a restaurant, browse its menu and fill a cart — but can't order.

## Phase 2: checkout, orders and payments

### Payments behind an interface

Each payment method implements `Payable`, and the gateway only knows the interface — so adding a wallet or net banking is a new class, not an edit:

```ts
interface Payable {
  pay(amount: number): void;
}

class Upi implements Payable {
  pay(amount: number) {
    console.log('Payment successful via UPI:', amount);
  }
}

class CreditCard implements Payable {
  pay(amount: number) {
    console.log('Payment successful via Credit Card:', amount);
  }
}

class PaymentGateway {
  initiatePayment(paymentMethod: Payable, amount: number) {
    paymentMethod.pay(amount);
  }
}
```

### The order is a snapshot

An `Order` copies the restaurant name and the items at checkout time, so clearing the cart afterwards doesn't change the order. Ids come from a static counter:

```ts
type PaymentStatus = 'Success' | 'Pending' | 'Failed';

class Order {
  private static nextId = 1;
  private orderId = Order.nextId++;

  constructor(
    private restaurant: string,
    private items: { id: number; name: string; price: number }[],
    private status: PaymentStatus,
    private totalPrice: number,
  ) {}

  getOrder() {
    return {
      orderId: this.orderId,
      restaurant: this.restaurant,
      items: this.items,
      status: this.status,
      totalPrice: this.totalPrice,
    };
  }

  updatePaymentStatus(status: PaymentStatus) {
    this.status = status;
  }
}
```

### Checkout

```ts
class User {
  private cart = new Cart();
  private orders: Order[] = [];

  constructor(private id: number, private name: string) {}

  addItemToTheCart(item: Menu, restaurant: Restaurant) {
    this.cart.addItem(item, restaurant);
  }

  checkout(payment: Payable) {
    const { restaurant, items } = this.cart.getItems();
    if (!restaurant || items.length === 0) {
      throw new Error('No items in the cart');
    }

    const total = this.cart.calculatePrice();
    const order = new Order(restaurant.getRestaurant().name, items.map((m) => m.getMenu()), 'Pending', total);
    this.orders.push(order);

    new PaymentGateway().initiatePayment(payment, total);
    order.updatePaymentStatus('Success');

    this.cart.clearCart();
    return order;
  }

  getOrders() {
    return this.orders.map((o) => o.getOrder());
  }
}
```

### Running it

```ts
const manager = new RestaurantManager();
const rest1 = manager.addRestaurant(1, 'rest1', 'bettiah');
rest1.addMenu(8, 'rest1-menu1', 120);
rest1.addMenu(7, 'rest1-menu2', 100);

const user = new User(1, 'Priyanshu');
const restaurant = manager.search('bettiah');
const item = restaurant?.getMenuItem(8);

if (restaurant && item) {
  user.addItemToTheCart(item, restaurant);
  user.checkout(new Upi());
  console.log(JSON.stringify(user.getOrders(), null, 2));
}
```

## Still open

From the notes in my code, for the next phase:

- Removing items from the cart.
- Real payment handling — right now the order is marked `Success` right after `pay()`, without handling a failed payment.

*Source: [implementations/food-delivery](https://github.com/priyanshu-34/LLD/tree/main/implementations/food-delivery)*
