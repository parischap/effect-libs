<!-- LTeX: language=en-US -->

# Table of Contents

- [In this package](#in-this-package)
- [Usage](#usage)
  - [MCache](#mcache)
  - [MEquivalenceBasedEqualityData](#mequivalencebasedequalitydata)
  - [MMatch](#mmatch)
  - [MOption](#moption)
  - [MString](#mstring)
  - [MTree](#mtree)
- [Changelog](#changelog)

# In this package

This package contains the following modules, all prefixed with `M` to avoid name collisions with the official `effect` modules they extend:

| Module                            | Description                                                                                                                                                                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **MArray**                        | Extensions to `effect/Array`: additional predicates, fold/unfold operations with cycle detection, padding, grouping, and more                                                                                                                                |
| **MBigDecimal**                   | Conversions and utilities for `effect/BigDecimal`, including safe/unsafe construction from primitive values                                                                                                                                                  |
| **MBigInt**                       | Conversions, arithmetic predicates, and logarithm for `effect/BigInt`                                                                                                                                                                                        |
| **MCache**                        | A time-limited, capacity-bounded LRU cache with a `lifeSpan` (TTL in milliseconds)                                                                                                                                                                           |
| **MChunk**                        | Extensions to `effect/Chunk`: duplicate detection, `findAll`, `takeBut`, and `takeRightBut`                                                                                                                                                                  |
| **MData**                         | A base class providing default `Inspectable` and `Pipeable` behavior for `effect` data types                                                                                                                                                                 |
| **MEquivalenceBasedEqualityData** | A base class that derives `Equal.Equal` from an abstract `isEquivalentTo` method                                                                                                                                                                             |
| **MFunction**                     | Extensions to `effect/Function`: memoization with `once`, `applyAsThis`, cloning, and constant helpers                                                                                                                                                       |
| **MInputError**                   | A tagged error for user-facing validation failures, with `assertInRange` and similar guards                                                                                                                                                                  |
| **MMatch**                        | A lightweight, type-safe pattern-matcher that replaces `effect/Match` for simple use cases. Supports predicate matching, refinement matching with exhaustiveness checking, `whenOr`, `whenAnd`, and `tryFunction`                                            |
| **MNumber**                       | Extensions to `effect/Number`: safe conversions from `BigInt` and `BigDecimal`, integer predicates, modulo, and `fromString`                                                                                                                                 |
| **MOption**                       | Extensions to `effect/Option`: construction from nullable-or-option values, and iterator unwrapping                                                                                                                                                          |
| **MPortError**                    | A tagged error for wrapping failures that arise when porting non-`effect` functions into the `effect` world                                                                                                                                                  |
| **MPredicate**                    | Extensions to `effect/Predicate`: type-level utilities (`Source`, `Target`, `Coverage`, mapping types), a `struct` combinator, and runtime guards for primitives, non-primitives, function arity, and sized arrays (`isSingleton`, `isPair`, `isOverOne`, …) |
| **MRecord**                       | Extensions to `effect/Record`: type-safe `unsafeGet`, `modify`, and `modifyAll`                                                                                                                                                                              |
| **MRegExp**                       | Ready-to-use `RegExp` instances (SemVer, email, line breaks) and `fromRegExpString`                                                                                                                                                                          |
| **MRegExpString**                 | Building blocks for composing regular-expression strings (unsigned integers, signed integers, identifiers, separators, etc.)                                                                                                                                 |
| **MResult**                       | Extensions to `effect/Result`: flattening and optional extraction                                                                                                                                                                                            |
| **MString**                       | Extensions to `effect/String`: search with automatic `lastIndex` reset, padding with fill-position support, `removeNCharsEveryMChars`, SemVer/email predicates, and more                                                                                     |
| **MStringFillPosition**           | A small enum-like module for fill positions (`left` / `right`) used by `MString` padding functions                                                                                                                                                           |
| **MStringSearchResult**           | A value-object representing a regex match result, with `Equivalence`, `Order`, and `Hash` instances                                                                                                                                                          |
| **MStruct**                       | Extensions to `effect/Struct`: an `evolve` variant that only requires keys present in the patch object                                                                                                                                                       |
| **MTree**                         | A recursive tree/forest data structure with `fold`, `map`, `reduce`, and a cycle-safe `unfold`. Composed of `MTreeLeaf`, `MTreeNode`, `MTreeNonLeaf`, and `MTreeForest` sub-modules                                                                          |
| **MTuple**                        | Extensions to `effect/Tuple`: `of`, `replicate`, and `prependElement`                                                                                                                                                                                        |
| **MTypes**                        | Foundational primitive / container types and type-level utilities (`Object`, `NonPrimitive`, `Pair`, `Singleton`, `OverOne`, `OverTwo`, `Data`, `Tuple`, …). Runtime guards live in `MPredicate`                                                             |

# Usage

This package groups many small, independent extension modules. Rather than walking through all of them, this section shows a runnable example for a representative subset — the rest follow the same data-last, `pipe`-friendly style and are documented individually via JSDoc.

## MCache

A mutable, optionally bounded and TTL-limited cache built around a user-supplied lookup function. Keys are compared with `Equal.equals`; the lookup can be recursive, in which case the cache also detects circularity.

```ts
import { Tuple, pipe } from 'effect';
import * as MCache from '@parischap/effect-lib/MCache';

const cache = MCache.make({
  lookUp: ({ key }: { readonly key: number }) => Tuple.make(key * 2, true),
  capacity: 100,
  lifeSpan: 60_000, // 1 minute
});

// Result: 10
console.log(pipe(cache, MCache.get(5)));
```

## MEquivalenceBasedEqualityData

A base class for value objects that derive `Equal.Equal` from a user-defined equivalence instead of structural equality. Subclasses implement a same-type-marker guard, the equivalence itself, and a consistent hash.

```ts
import { Equal, Hash } from 'effect';
import * as MData from '@parischap/effect-lib/MData';
import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';

class UserId extends MEquivalenceBasedEqualityData.Class {
  constructor(readonly value: number) {
    super();
  }
  [MData.idSymbol]() {
    return '@example/UserId/';
  }
  [MEquivalenceBasedEqualityData.hasSameTypeMarkerAsSymbol](that: unknown) {
    return that instanceof UserId;
  }
  [MEquivalenceBasedEqualityData.isEquivalentToSymbol](that: this) {
    return this.value === that.value;
  }
  [Hash.symbol]() {
    return Hash.number(this.value);
  }
}

// Result: true
console.log(Equal.equals(new UserId(1), new UserId(1)));

// Result: false
console.log(Equal.equals(new UserId(1), new UserId(2)));
```

## MMatch

A lightweight, type-safe pattern-matcher that replaces `effect/Match` for simple use cases: predicate matching, refinement matching with exhaustiveness checking, `whenOr`, `whenAnd`, and `tryFunction`.

```ts
import { pipe } from 'effect';
import * as MMatch from '@parischap/effect-lib/MMatch';
import * as Number from 'effect/Number';

const sign = (n: number) =>
  pipe(
    n,
    MMatch.make,
    MMatch.when(Number.isLessThan(0), () => 'negative'),
    MMatch.when(Number.isGreaterThan(0), () => 'positive'),
    MMatch.orElse(() => 'zero'),
  );

// Result: 'positive'
console.log(sign(5));

// Result: 'zero'
console.log(sign(0));
```

## MString

Extensions to `effect/String`: indexed search, custom-character trimming, padding, splitting (including bit-aligned chunking), indented multi-line formatting, and lightweight predicates (SemVer, e-mail, digit, …).

```ts
import { Option, pipe } from 'effect';
import * as MString from '@parischap/effect-lib/MString';
import * as MStringFillPosition from '@parischap/effect-lib/MStringFillPosition';

const found = pipe('hello world', MString.search('world'));
// Result: Some(6)
console.log(Option.map(found, (r) => r.startIndex));

// Result: '00042'
console.log(
  pipe(
    '42',
    MString.pad({ length: 5, fillChar: '0', fillPosition: MStringFillPosition.Type.Left }),
  ),
);
```

## MTree

A recursive tree/forest data structure with `fold`, `map`, `reduce`, and a cycle-safe `unfold`. Each node is either a leaf carrying a value of type `B` or a non-leaf carrying a value of type `A` plus a forest of child trees.

```ts
import { Result, pipe } from 'effect';
import * as MTree from '@parischap/effect-lib/MTree';

const buildAndSum = pipe(
  3,
  MTree.unfoldAndFold({
    unfold: (n: number) =>
      n <= 0 ? Result.fail(0) : Result.succeed(['node' as const, [n - 1, n - 1]] as const),
    foldNonLeaf: (_value, children) => children.reduce((a, b) => a + b, 1),
    foldLeaf: (n) => n,
  }),
);
// Result: count of non-leaf nodes in the built tree
console.log(buildAndSum);
```

# Changelog

## 0.13.0 → 23.0

Improved documentation.

## 0.12.0 — effect v4

> **Ported to effect v4** (`effect@4.0.0-beta`). The most significant update since the library's inception ()`MEither` renamed to `MResult`.

- Substantially expanded JSDoc comments across all modules with inline runnable examples.
- Fixed a bug in `MBigInt.log10` (incorrectly rejected `0`).
- **New modules:** `MBigDecimal`, `MBigInt`, `MData`, `MEquivalenceBasedEqualityData`, `MStringFillPosition`, `MStringSearchResult`, `MTypesCategory`.
- **`MPredicate` promoted.** All runtime type-guards previously living in `MTypes` have been moved to `MPredicate` (to match `effect`'s organization). `MTypes` is now purely type-level utilities.
- **`MString` reorganized** into a `String/` sub-folder; `MStringFillPosition` and `MStringSearchResult` are now separate importable modules for better tree-shaking.
- **`MTree` expanded** into a `Tree/` sub-folder: `MTree`, `MTreeLeaf`, `MTreeNode`, `MTreeNonLeaf`, `MTreeForest`.
- **`MData` replaces `Inspectable`/`Pipeable`** as the single base class that all `effect` data types in this library extend. `MEquivalenceBasedEqualityData` extends `MData` with structural equality via an abstract `isEquivalentTo` method.
- **Renamed:** `BadArgumentError` → `MInputError`.
- **Removed:** `MBrand`, `MFs`, `MScopeOnce`, `MStream` — available natively in `effect` v4 or retired as experimental.

## 0.6.0 → 0.11.0 – Sep 2025 (effect 3.17.13)

- Six patch releases focusing on tree-shaking optimizations and bundler compatibility (`"sideEffects": false`).

## 0.5.0 – Mar 2025 (effect 3.13.6)

- Updated to effect 3.13.6 (dropped the `@effect/typeclass` peer dependency — no longer needed).
- Added **`MRegExpString`**: composable building blocks for constructing regular-expression strings (unsigned integers, signed integers, identifiers, separators, …).

## 0.4.0 – Oct 2024 (effect 3.9.1)

- Updated to effect 3.9.1 and `@effect/typeclass` 0.28.1.
- **Dual CJS + ESM output**: the package now ships both formats so it works with CommonJS and ESM consumers without any extra bundler configuration.
- Added **`MTree`**: a recursive tree/forest data structure with `fold`, `map`, `reduce`, and a cycle-safe `unfold`.
- Added **`MRegExp`**: ready-to-use `RegExp` instances (SemVer, email, line breaks) and `fromRegExpString`.
- Introduced `Inspectable` and `Pipeable` as explicit base-class modules (later unified into `MData`).
- Dropped `@parischap/js-lib` dependency entirely.

## 0.1.0 – Sep 2024 (effect 3.8.x)

- Updated to effect 3.8, which absorbed `@effect/schema` into the main `effect` package. The `MSchema` wrapper was removed accordingly; use `effect/Schema` directly.
- Added `SearchResult` (later renamed `MStringSearchResult`).
- Removed experimental and platform-specific modules with low adoption: `MEffect`, `MLimitedNumber`, `MScopeOnce`, `MStream`, `MFs`.

## 0.0.2 – Jul 2024

First public release. Targets effect 3.5.6 with `@effect/schema 0.68.26` as a separate peer dependency. Provides extensions to: `Array`, `Cache`, `Chunk`, `Result`, `Function`, `Json`, `Match`, `Number`, `Option`, `Predicate`, `Record`, `String`, `Struct`, `Tuple`.
