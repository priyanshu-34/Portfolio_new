---
title: "Liskov Substitution Principle: a child must keep the parent's promises"
subtitle: If a subclass overrides a method just to throw, it isn't really a substitute.
date: 2026-09-25
tags: [solid, lsp, oop, typescript]
order: 3
---

**In simple words:** if class `B` extends class `A`, then anywhere the code uses an `A`, you should be able to put a `B` instead — and nothing should break or behave unexpectedly.

The child should only *add* to what the parent does, never take away or change what the parent already promised.

## How to spot a violation

If a child class overrides a method just to throw an error, leaves it empty, or makes it do something totally different from the parent's version — the rule is being broken.

## The problem

`TextDocument` can be read and written. We want a read-only version, so we create `ProtectedDocument` that extends it — and since a read-only document should never allow writing, we override `write()` to throw:

```ts
class TextDocument {
  constructor(protected data: string) {}

  read() {
    console.log('Reading the document: ' + this.data);
  }

  write() {
    console.log('Editing the document: ' + this.data);
  }
}

class ProtectedDocument extends TextDocument {
  write() {
    throw new Error('Editing is not allowed as this is a Protected Document');
  }
}

const doc1 = new TextDocument('doc1');
const doc2 = new ProtectedDocument('doc2');

doc1.write();
doc2.write(); // crashes here — a surprise for anyone who expected write() to just work
```

Anyone using `TextDocument` expects `write()` to save changes — that's the promise the parent makes. `ProtectedDocument` secretly breaks it. Hand a `ProtectedDocument` to code that expects a normal `TextDocument` and calling `write()` crashes instead of working. The child is no longer a true replacement for the parent, which is exactly what this principle says should never happen.

## The fix

The real problem is that we forced `write` onto *every* document, even ones that should never support it. Split "can read" and "can write" into two small interfaces:

- `ReadableDoc` — just `read()`. Every document can do this.
- `WritableDoc` — `read()` and `write()`. Only documents that truly support editing use it.

```ts
interface ReadableDoc {
  read(): void;
}

interface WritableDoc extends ReadableDoc {
  write(): void;
}

class ReadOnlyDoc implements ReadableDoc {
  constructor(protected data: string) {}

  read() {
    console.log('Here is your content: ' + this.data);
  }
}

class EditableDoc implements WritableDoc {
  constructor(protected data: string) {}

  read() {
    console.log('Here is your content: ' + this.data);
  }

  write() {
    console.log('This is your editable content, start editing');
  }
}

const readOnly = new ReadOnlyDoc('doc1');
const editable = new EditableDoc('doc2');

readOnly.read();
editable.read();
editable.write();
// readOnly.write(); <- doesn't even compile: write() doesn't exist on ReadOnlyDoc
```

A read-only document simply implements `ReadableDoc` and never has a `write()` method at all — nothing to override, nothing to throw, nothing to break at runtime.

## TL;DR

- **Bad sign:** a child class overrides a method just to throw an error or block something the parent allowed.
- **Good fix:** don't force every child to inherit methods it can't support. Break behaviour into small interfaces and let each class implement only what it can truly do.

*Source: [SOLID/LSP.ts](https://github.com/priyanshu-34/LLD/blob/main/SOLID/LSP.ts)*
