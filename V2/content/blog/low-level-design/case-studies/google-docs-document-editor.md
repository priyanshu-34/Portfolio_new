---
title: "Designing a Google Docs-style editor: from one class to SOLID"
subtitle: A document that holds text and images, renders and saves — built naively first, then refactored.
date: 2026-09-27
tags: [lld, case-study, solid, typescript]
order: 1
---

## Requirements

- Add text to the document
- Add an image to the document
- Render the document as a single string
- Save the document

## Questions before writing code

I made myself answer these before touching the keyboard:

1. **What are the nouns?** Document, text, image, editor, storage. Listing nouns is the crudest way to find classes, and it's still where everyone starts.
2. **What holds text and images together, and what type is it?** An array — but an array of *what*? Text and images are different things, and that's the first problem you hit.
3. **Where does the "render text as text, image as `[image: cat.png]`" decision live?** In the simplest version, inside one `render()` method.
4. **If the PM asks for tables, video embeds and newlines tomorrow, which lines change?** In the naive version: almost all of them.

## Phase 1: the naive version

One class does everything, and everything is a `string`:

```ts
class DocumentEditor {
  private data: string[] = [];

  addText(text: string): void {
    this.data.push(text);
  }

  addImage(imgPath: string): void {
    this.data.push(imgPath);
  }

  render(): void {
    let result = '';
    for (const item of this.data) {
      // the only way to tell an image from text: guess from the extension
      result += item.endsWith('.jpg') ? `[image:${item}]` : item;
    }
    console.log(result);
  }

  save(): void {
    console.log('Data has been saved to the DB');
  }
}
```

It works, but:

- **It breaks SRP.** Storing elements, rendering them and persisting them are three jobs in one class.
- **It breaks OCP.** Supporting tables or videos means editing `render()` with more `if`s.
- **Type information is lost.** Once pushed into `string[]`, an image is just a string. `render()` has to *guess* with `endsWith('.jpg')` — so a `.png` renders as text, and a sentence that happens to end in `.jpg` renders as an image.
- **Storage is hard-coded** inside `save()`.

## Phase 2: the refactor

### Each element renders itself

Give every element a common interface and let each type own its rendering. The type information lives in the class, so nothing has to be guessed:

```ts
interface DocumentElement {
  render(): string;
}

class TextElement implements DocumentElement {
  constructor(private data: string) {}
  render(): string {
    return this.data;
  }
}

class ImageElement implements DocumentElement {
  constructor(private path: string) {}
  render(): string {
    return `[image:${this.path}]`;
  }
}
```

### The document just holds elements

`Document` no longer knows what text or images are — it asks each element to render itself:

```ts
class Document {
  private elements: DocumentElement[] = [];

  add(element: DocumentElement) {
    this.elements.push(element);
  }

  render(): string {
    return this.elements.map((e) => e.render()).join('\n');
  }
}
```

Adding tables or videos is now a new class implementing `DocumentElement`. `Document` doesn't change.

### Persistence behind an interface

Where to save is a separate concern, so it gets its own interface — and the editor receives the storage it should use:

```ts
interface Persistence {
  save(data: string): void;
}

class SaveToDB implements Persistence {
  save(data: string) {
    console.log('Saved to DB:', data);
  }
}

class SaveToRedis implements Persistence {
  save(data: string) {
    console.log('Saved to Redis:', data);
  }
}
```

### The editor ties it together

```ts
class DocumentEditor {
  private doc = new Document();

  addText(text: string) {
    this.doc.add(new TextElement(text));
  }

  addImage(path: string) {
    this.doc.add(new ImageElement(path));
  }

  render() {
    console.log('Rendered:', this.doc.render());
  }

  save(persistTo: Persistence) {
    persistTo.save(this.doc.render());
  }
}

const editor = new DocumentEditor();
editor.addText('My name is Priyanshu');
editor.addImage('priyanshu.png');
editor.addText('I live in Bengaluru');

editor.render();
editor.save(new SaveToDB());
editor.save(new SaveToRedis());
```

## What changed

| Concern | Phase 1 | Phase 2 |
| --- | --- | --- |
| Rendering a type | `if` on the file extension | each element's own `render()` (OCP) |
| Holding content | `string[]` | `DocumentElement[]` |
| Saving | hard-coded inside the editor | `Persistence` passed in (DIP) |
| Responsibilities | one class | element, document, storage, editor (SRP) |

*Source: [implementations/google-doc](https://github.com/priyanshu-34/LLD/tree/main/implementations/google-doc)*
