---
title: "Factory pattern, in six stages: from new to Abstract Factory"
subtitle: Simple Factory, Factory Method and Abstract Factory are different tools. A cloud-storage example shows when each one earns its place.
date: 2026-09-28
tags: [design-patterns, factory, typescript]
order: 1
---

**The one-line idea:** creating an object (`new X(...)`) is *knowledge*. If every caller has that knowledge, every caller must change when creation changes. A factory is the single place that holds it, so callers only know the interface.

Three patterns get confused all the time, so here they are side by side:

| Pattern | Question it answers |
| --- | --- |
| Simple Factory | "Give me **a** thing" — a function and a `switch` |
| Factory Method | "**Subclasses** decide which" — an abstract method, overridden |
| Abstract Factory | "Give me a **matched set**" — one object makes a whole family |

I'll build up to all three with one example — uploading files to cloud storage — where each stage fixes the pain of the previous one.

## Stage 0: no factory

The caller does the `new` itself, so it must know which vendor is active *and* what each vendor's constructor needs. And the constructors don't match — which is the whole reason a factory is worth having:

```ts
interface StorageProvider {
  upload(file: string, path: string): void;
}

class S3Storage implements StorageProvider {
  // S3 needs three things...
  constructor(private bucket: string, private region: string, private accessKey: string) {}
  upload(file: string, path: string) {
    console.log(`S3: uploaded ${file} to ${this.bucket} (${this.region}) at ${path}`);
  }
}

class GcsStorage implements StorageProvider {
  // ...GCS needs two completely different things.
  constructor(private projectId: string, private keyFile: string) {}
  upload(file: string, path: string) {
    console.log(`GCS: uploaded ${file} to ${this.projectId} at ${path}`);
  }
}

// THE PAIN: this if/else is repeated at every call site.
const activeProvider = 's3';
const storage: StorageProvider =
  activeProvider === 's3'
    ? new S3Storage('bucket1', 'us-east', '1234')
    : new GcsStorage('project1', 'key.json');

storage.upload('report.pdf', '/reports/2026/');
```

Copy that block to the ten places in your app that upload a file, then try switching vendors. You'll edit ten places and miss one.

## Stage 1: Simple Factory

Move the `new` calls into **one** function. The caller names a provider and gets back the interface — it never sees `S3Storage` or `GcsStorage`.

```ts
type Provider = 's3' | 'gcs';

function createStorage(provider: Provider): StorageProvider {
  switch (provider) {
    case 's3': return new S3Storage('bucket1', 'us-east', '1234');
    case 'gcs': return new GcsStorage('project1', 'key.json');
  }
}

createStorage('s3').upload('report.pdf', '/reports/2026/');
```

Two details matter here, and both are easy to get wrong:

1. **The parameter is a union type**, not `string`. With `string`, TypeScript assumes someone could pass `"azure"` and the switch can fall through — with a declared return type that's a compile error; without one, the return type silently becomes `... | undefined` and every caller has to write `createStorage('s3')?.upload(...)`.
2. **The return type is the interface.** Without it, TypeScript infers `S3Storage | GcsStorage` and leaks the concrete classes to the caller — which defeats the point of a factory.

With both in place the switch is exhaustive and needs no `default`.

**Remaining pain:** the credentials are hard-coded inside the factory, and the caller still has to say `'s3'`.

## Stage 2: Config-driven factory

Credentials move into a config object (env vars in a real app). Now the factory's job is the interesting part: take **one uniform input** and map it onto constructors that **don't match** each other.

```ts
const config = {
  provider: 's3' as Provider,
  s3: { bucket: 'bucket1', region: 'us-east', accessKey: '1234' },
  gcs: { projectId: 'project1', keyFile: 'key.json' },
};

function createStorage(): StorageProvider {
  switch (config.provider) {
    case 's3':
      return new S3Storage(config.s3.bucket, config.s3.region, config.s3.accessKey);
    case 'gcs':
      return new GcsStorage(config.gcs.projectId, config.gcs.keyFile);
  }
}

// Change config.provider to "gcs" and the whole app switches backends.
createStorage().upload('report.pdf', '/reports/2026/');
```

That mapping is the real answer to *"why not just call `new`?"* — otherwise every caller would need to know which vendor wants which fields. The call site now names **no vendor and no credentials**.

**Remaining pain:** adding a third provider means editing this file three times — the union, the config and the switch. In a big codebase it becomes a bottleneck every team has to touch.

## Stage 3: Registry — Open/Closed in practice

A registry is just a lookup table: *name → how to build that thing*.

A `switch` is a lookup table written as **code**. A registry is the same table written as **data**. That one difference is everything: you can't add a `case` to a switch from another file, but you can add a key to an object from another file.

```ts
type Creator = (cfg: any) => StorageProvider;

// Starts EMPTY — the registry itself names no vendors.
const registry: Record<string, Creator> = {};

function register(name: string, create: Creator): void {
  registry[name] = create;
}

// In a real project each line lives next to its class, in its own file.
register('s3', (c) => new S3Storage(c.bucket, c.region, c.accessKey));
register('gcs', (c) => new GcsStorage(c.projectId, c.keyFile));
register('disk', (c) => new DiskStorage(c.baseDir));

function createStorage(): StorageProvider {
  const create = registry[config.provider];
  if (!create) {
    throw new Error(`Unknown storage provider: ${config.provider}`); // the price, paid here
  }
  return create(config[config.provider]);
}
```

Adding a provider is now a new class, one `register()` call and a config block — **zero edits to `createStorage()`**. That's "open for extension, closed for modification", the same idea as the [Open/Closed Principle](/blog/low-level-design/solid/open-closed-principle), now with a concrete reason to exist.

**The price:** the registry is open, so TypeScript can no longer prove the lookup finds anything. `registry[name]` may be `undefined` at runtime, yet `Record<string, Creator>` types it as `Creator`, so the compiler won't warn you (only `noUncheckedIndexedAccess` would). Stage 2's switch had that guarantee for free. I traded compile-time safety for extensibility — a real cost, not a free win.

## Stage 4: Abstract Factory

Real storage does more than upload — it also signs temporary URLs so a browser can read a private file. Build a separate factory per capability and each makes its **own** vendor decision:

```ts
createUploader();   // reads config -> S3Uploader
createUrlSigner();  // reads config differently -> GcsUrlSigner
```

Nothing forces those to agree. One config override during a migration, or one test that stubs only one of them, and you upload the file to S3 but hand the user a `googleapis.com` link. The link 404s and nothing throws — both objects are valid, they just aren't from the same vendor. That's a **mismatched family**, and it's miserable to debug.

The fix: one factory object per vendor that produces the **whole set**, so the vendor is picked once:

```ts
interface Uploader {
  upload(file: string, path: string): void;
}

interface UrlSigner {
  sign(path: string): string;
}

// The abstract factory: promises a matched set, names no vendor.
interface StorageFactory {
  createUploader(): Uploader;
  createUrlSigner(): UrlSigner;
}

class S3Factory implements StorageFactory {
  constructor(private bucket: string) {}
  createUploader(): Uploader { return new S3Uploader(this.bucket); }
  createUrlSigner(): UrlSigner { return new S3UrlSigner(this.bucket); }
}

class GcsFactory implements StorageFactory {
  constructor(private projectId: string) {}
  createUploader(): Uploader { return new GcsUploader(this.projectId); }
  createUrlSigner(): UrlSigner { return new GcsUrlSigner(this.projectId); }
}

// THE VENDOR DECISION, MADE EXACTLY ONCE.
function getStorageFactory(): StorageFactory {
  return config.provider === 'gcs'
    ? new GcsFactory(config.gcs.projectId)
    : new S3Factory(config.s3.bucket);
}

const factory = getStorageFactory();
factory.createUploader().upload('report.pdf', '/reports/2026/');
console.log(factory.createUrlSigner().sign('/reports/2026/report.pdf'));
```

`S3Factory` has no code path that returns a GCS part, so mixing vendors is unwritable. (Keep the concrete factories unexported in a real module, so nobody bypasses `getStorageFactory()`.)

**When not to use it:** for this example you could just put `upload()` and `sign()` on one `StorageProvider` interface — one object, two methods, the same guarantee, far less machinery. Abstract Factory earns its keep only when the family members must be **separate** objects: parts of the app get only the signer, the uploader holds an expensive connection you don't always want open, or they have different lifetimes.

## Stage 5: Factory Method (the real GoF pattern)

Everything above called a plain function — that's Simple Factory, which isn't in the Gang of Four book at all. **Factory Method** is different: a base class contains the **workflow** but leaves one creation step abstract, and each subclass overrides that step.

```ts
abstract class StorageClient {
  // THE FACTORY METHOD: no body here. Subclasses fill it in.
  protected abstract createUploader(): Uploader;

  // The shared workflow — the reason the base class exists.
  save(file: string, path: string): void {
    console.log(`[audit] saving ${file}`);          // shared step
    this.createUploader().upload(file, path);       // deferred to the subclass
    console.log('[audit] done');                    // shared step
  }
}

class S3Client extends StorageClient {
  constructor(private bucket: string) { super(); }
  protected createUploader(): Uploader { return new S3Uploader(this.bucket); }
}

class GcsClient extends StorageClient {
  constructor(private projectId: string) { super(); }
  protected createUploader(): Uploader { return new GcsUploader(this.projectId); }
}

const client: StorageClient = new S3Client('bucket1');
client.save('report.pdf', '/reports/2026/');
```

Creation is chosen by **inheritance**, not by a switch or a lookup. Use it when the surrounding steps are shared and one object varies. If there's no shared workflow to inherit, a plain function (Stages 1–3) is simpler and better — don't introduce a class hierarchy just to say `new`.

## Summary

| Stage | Fixes |
| --- | --- |
| 0 — No factory | (shows the pain) |
| 1 — Simple Factory | creation moves to one place |
| 2 — Config-driven | credentials leave the caller |
| 3 — Registry | add providers without editing the factory |
| 4 — Abstract Factory | vendor parts can't be mismatched |
| 5 — Factory Method | a subclass decides what to build inside a shared workflow |

The same six stages applied to a second domain: [Factory pattern, part 2: notifications](/blog/low-level-design/design-patterns/factory-pattern-notifications).

*Source: [DesignPatterns/factoryPattern.ts](https://github.com/priyanshu-34/LLD/blob/main/DesignPatterns/factoryPattern.ts) — run it with `npx tsx factoryPattern.ts`, type-check with `npx tsc --noEmit --strict factoryPattern.ts`.*
