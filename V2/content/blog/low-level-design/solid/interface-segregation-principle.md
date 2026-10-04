---
title: "Interface Segregation Principle: don't force classes to fake methods"
subtitle: A square shouldn't have to implement volume() just because a cube does.
date: 2026-09-25
tags: [solid, isp, oop, typescript]
order: 4
---

**In simple words:** don't force a class to implement methods it doesn't need.

If one big interface has lots of methods but different classes only ever need a few of them, break it into several small ones and let each class pick only what it actually needs.

## Why it matters

A class forced to implement a method it has no use for usually ends up throwing an error or leaving it empty just to satisfy the interface. That's a fake implementation — a sign the interface was too broad to begin with.

## The problem

`SingleBigInterface` has both `area()` and `volume()`. A square is a 2D shape — it has an area but no volume. A cube has both. Because `Square` must implement the same interface as `Cube`, it has to write a `volume()` it can't honour:

```ts
interface SingleBigInterface {
  area(): void;
  volume(): void;
}

class Square implements SingleBigInterface {
  constructor(private length: number) {}

  area() {
    console.log('Area of the square is: ' + this.length * this.length);
  }

  volume() {
    // a square has no volume — this method only exists because
    // the interface forces it to, and that's the actual problem
    throw new Error('Square is a 2D object and does not have any volume');
  }
}

class Cube implements SingleBigInterface {
  constructor(private length: number) {}

  area() {
    console.log('Area of the cube is: ' + this.length * this.length);
  }

  volume() {
    console.log('Volume of the cube is: ' + this.length ** 3);
  }
}
```

## The fix

Split the big interface into smaller ones, grouped by what actually belongs together:

- `TwoDShape` — just `area()`. Every shape has this.
- `ThreeDShape` — `area()` and `volume()`. Only 3D shapes need this.

```ts
interface TwoDShape {
  area(): void;
}

interface ThreeDShape extends TwoDShape {
  volume(): void;
}

class Square2D implements TwoDShape {
  constructor(private length: number) {}

  area() {
    console.log('Area of the square is: ' + this.length * this.length);
  }
}

class Cube3D implements ThreeDShape {
  constructor(private length: number) {}

  area() {
    console.log('Area of the cube is: ' + this.length * this.length);
  }

  volume() {
    console.log('Volume of the cube is: ' + this.length ** 3);
  }
}

const sq = new Square2D(10);
const cb = new Cube3D(10);

sq.area();
cb.area();
cb.volume();
// sq.volume(); <- doesn't compile: volume() doesn't exist on Square2D
```

A 2D shape now only implements `TwoDShape`. There's no `volume()` to fake, nothing to throw, and no forced, meaningless code.

## TL;DR

- **Bad sign:** a class implements a method just to throw an error or leave it empty because the interface forced it.
- **Good fix:** break big interfaces into small, focused ones; each class implements only what it can truly support.

*Source: [SOLID/ISP.ts](https://github.com/priyanshu-34/LLD/blob/main/SOLID/ISP.ts)*
