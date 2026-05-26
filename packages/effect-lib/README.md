<!-- LTeX: language=en-US -->

## EFFECT-LIB

A collection of utility modules that extend the official [Effect](https://effect.website/) library.

All exports follow the `M`-prefix naming convention (e.g., `MArray`, `MMatch`, `MTree`) to avoid name collisions with the Effect modules they extend.

## Modules

| Module                            | Description                                                                                                                                                                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **MArray**                        | Extensions to `effect/Array`: additional predicates, fold/unfold operations with cycle detection, padding, grouping, and more                                                                                                                                |
| **MBigDecimal**                   | Conversions and utilities for `effect/BigDecimal`, including safe/unsafe construction from primitive values                                                                                                                                                  |
| **MBigInt**                       | Conversions, arithmetic predicates, and logarithm for `effect/BigInt`                                                                                                                                                                                        |
| **MCache**                        | A time-limited, capacity-bounded LRU cache built on `effect/Cache` with a `lifeSpan` (TTL in milliseconds)                                                                                                                                                   |
| **MChunk**                        | Extensions to `effect/Chunk`: duplicate detection, `findAll`, `takeBut`, and `takeRightBut`                                                                                                                                                                  |
| **MData**                         | A base class providing default `Inspectable` and `Pipeable` behavior for Effect data types                                                                                                                                                                   |
| **MEquivalenceBasedEqualityData** | A base class that derives `Equal.Equal` from an abstract `isEquivalentTo` method                                                                                                                                                                             |
| **MEither**                       | Extensions to `effect/Either`: flattening, optional extraction, and pair traversal                                                                                                                                                                           |
| **MFunction**                     | Extensions to `effect/Function`: memoization with `once`, `applyAsThis`, cloning, and constant helpers                                                                                                                                                       |
| **MInputError**                   | A tagged error for user-facing validation failures, with `assertInRange` and similar guards                                                                                                                                                                  |
| **MJson**                         | Effect-wrapped `JSON.stringify` and `JSON.parse` that fail on circular references or invalid input                                                                                                                                                           |
| **MMatch**                        | A lightweight, type-safe pattern-matcher that replaces `Effect.Match` for simple use cases. Supports predicate matching, refinement matching with exhaustiveness checking, `whenOr`, `whenAnd`, and `tryFunction`                                            |
| **MNumber**                       | Extensions to `effect/Number`: safe conversions from `BigInt` and `BigDecimal`, integer predicates, modulo, and `fromString`                                                                                                                                 |
| **MOption**                       | Extensions to `effect/Option`: construction from nullable-or-option values, and iterator unwrapping                                                                                                                                                          |
| **MPortError**                    | A tagged error for wrapping failures that arise when porting non-Effect functions into the Effect world                                                                                                                                                      |
| **MPredicate**                    | Extensions to `effect/Predicate`: type-level utilities (`Source`, `Target`, `Coverage`, mapping types), a `struct` combinator, and runtime guards for primitives, non-primitives, function arity, and sized arrays (`isSingleton`, `isPair`, `isOverOne`, …) |
| **MRecord**                       | Extensions to `effect/Record`: type-safe `unsafeGet`, `modify`, and `modifyAll`                                                                                                                                                                              |
| **MRegExp**                       | Ready-to-use `RegExp` instances (SemVer, email, line breaks) and `fromRegExpString`                                                                                                                                                                          |
| **MRegExpString**                 | Building blocks for composing regular-expression strings (unsigned integers, signed integers, identifiers, separators, etc.)                                                                                                                                 |
| **MString**                       | Extensions to `effect/String`: search with automatic `lastIndex` reset, padding with fill-position support, `removeNCharsEveryMChars`, SemVer/email predicates, and more                                                                                     |
| **MStringFillPosition**           | A small enum-like module for fill positions (`left` / `right`) used by `MString` padding functions                                                                                                                                                           |
| **MStringSearchResult**           | A value-object representing a regex match result, with `Equivalence`, `Order`, and `Hash` instances                                                                                                                                                          |
| **MStruct**                       | Extensions to `effect/Struct`: an `evolve` variant that only requires keys present in the patch object                                                                                                                                                       |
| **MTree**                         | A recursive tree/forest data structure with `fold`, `map`, `reduce`, and a cycle-safe `unfold`. Composed of `MTreeLeaf`, `MTreeNode`, `MTreeNonLeaf`, and `MTreeForest` sub-modules                                                                          |
| **MTuple**                        | Extensions to `effect/Tuple`: `of`, `replicate`, and `prependElement`                                                                                                                                                                                        |
| **MTypes**                        | Foundational primitive / container types and type-level utilities (`Object`, `NonPrimitive`, `Pair`, `Singleton`, `OverOne`, `OverTwo`, `Data`, `Tuple`, …). Runtime guards live in `MPredicate`                                                             |

## Changelog

### v0.12.0 — Effect v4

> **Ported to Effect v4** (`effect@4.0.0-beta`). The most significant update since the library's inception ()`MEither` renamed to `MResult`).

- Substantially expanded JSDoc comments across all modules with inline runnable examples.
- Fixed a bug in `MBigInt.log10` (incorrectly rejected `0`).
- **New modules:** `MBigDecimal`, `MBigInt`, `MData`, `MEquivalenceBasedEqualityData`, `MStringFillPosition`, `MStringSearchResult`, `MTypesCategory`.
- **`MPredicate` promoted.** All runtime type-guards previously living in `MTypes` have been moved to `MPredicate` (to match Effect's organization). `MTypes` is now purely type-level utilities.
- **`MString` reorganized** into a `String/` sub-folder; `MStringFillPosition` and `MStringSearchResult` are now separate importable modules for better tree-shaking.
- **`MTree` expanded** into a `Tree/` sub-folder: `MTree`, `MTreeLeaf`, `MTreeNode`, `MTreeNonLeaf`, `MTreeForest`.
- **`MData` replaces `Inspectable`/`Pipeable`** as the single base class that all Effect data types in this library extend. `MEquivalenceBasedEqualityData` extends `MData` with structural equality via an abstract `isEquivalentTo` method.
- **Renamed:** `BadArgumentError` → `MInputError`.
- **Removed:** `MBrand`, `MFs`, `MScopeOnce`, `MStream` — available natively in Effect v4 or retired as experimental.

### v0.6.0 → v0.11.0 — Sep 2025 (Effect 3.17.13)

- Six patch releases focusing on tree-shaking optimizations and bundler compatibility (`"sideEffects": false`).

### v0.5.0 — Mar 2025 (Effect 3.13.6)

- Updated to Effect 3.13.6 (dropped the `@effect/typeclass` peer dependency — no longer needed).
- Added **`MRegExpString`**: composable building blocks for constructing regular-expression strings (unsigned integers, signed integers, identifiers, separators, …).

### v0.4.0 — Oct 2024 (Effect 3.9.1)

- Updated to Effect 3.9.1 and `@effect/typeclass` 0.28.1.
- **Dual CJS + ESM output**: the package now ships both formats so it works with CommonJS and ESM consumers without any extra bundler configuration.
- Added **`MTree`**: a recursive tree/forest data structure with `fold`, `map`, `reduce`, and a cycle-safe `unfold`.
- Added **`MRegExp`**: ready-to-use `RegExp` instances (SemVer, email, line breaks) and `fromRegExpString`.
- Introduced `Inspectable` and `Pipeable` as explicit base-class modules (later unified into `MData`).
- Dropped `@parischap/js-lib` dependency entirely.

### v0.1.0 — Sep 2024 (Effect 3.8.x)

- Updated to Effect 3.8, which absorbed `@effect/schema` into the main `effect` package. The `MSchema` wrapper was removed accordingly; use `effect/Schema` directly.
- Added `SearchResult` (later renamed `MStringSearchResult`).
- Removed experimental and platform-specific modules with low adoption: `MEffect`, `MLimitedNumber`, `MScopeOnce`, `MStream`, `MFs`.

### v0.0.2 — Jul 2024

First public release. Targets Effect 3.5.6 with `@effect/schema 0.68.26` as a separate peer dependency. Provides extensions to: `Array`, `Cache`, `Chunk`, `Either`, `Function`, `Json`, `Match`, `Number`, `Option`, `Predicate`, `Record`, `String`, `Struct`, `Tuple`.

## Donate

[Any donations would be much appreciated](https://ko-fi.com/parischap) 😄

Please, star my repo if you think it's useful!

## Documentation

If you need to, take a look at the [API](https://parischap.github.io/effect-libs/docs/effect-lib).
