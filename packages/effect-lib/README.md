<!-- LTeX: language=en-US -->

## EFFECT-LIB

A collection of utility modules that extend the official [Effect](https://effect.website/) library. It is intended as a peer dependency for other packages in the `@parischap/effect-libs` monorepo, not as a standalone library.

All exports follow the `M`-prefix naming convention (e.g., `MArray`, `MMatch`, `MTree`) to avoid name collisions with the Effect modules they extend.

## Modules

| Module                            | Description                                                                                                                                                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MArray**                        | Extensions to `effect/Array`: additional predicates, fold/unfold operations with cycle detection, padding, grouping, and more                                                                                     |
| **MBigDecimal**                   | Conversions and utilities for `effect/BigDecimal`, including safe/unsafe construction from primitive values                                                                                                       |
| **MBigInt**                       | Conversions, arithmetic predicates, and logarithm for `effect/BigInt`                                                                                                                                             |
| **MCache**                        | A time-limited, capacity-bounded LRU cache built on `effect/Cache` with a `lifeSpan` (TTL in milliseconds)                                                                                                        |
| **MChunk**                        | Extensions to `effect/Chunk`: duplicate detection, `findAll`, `takeBut`, and `takeRightBut`                                                                                                                       |
| **MData**                         | A base class providing default `Inspectable` and `Pipeable` behavior for Effect data types                                                                                                                        |
| **MEquivalenceBasedEqualityData** | A base class that derives `Equal.Equal` from an abstract `isEquivalentTo` method                                                                                                                                  |
| **MEither**                       | Extensions to `effect/Either`: flattening, optional extraction, and pair traversal                                                                                                                                |
| **MFunction**                     | Extensions to `effect/Function`: memoization with `once`, `applyAsThis`, cloning, and constant helpers                                                                                                            |
| **MInputError**                   | A tagged error for user-facing validation failures, with `assertInRange` and similar guards                                                                                                                       |
| **MJson**                         | Effect-wrapped `JSON.stringify` and `JSON.parse` that fail on circular references or invalid input                                                                                                                |
| **MMatch**                        | A lightweight, type-safe pattern-matcher that replaces `Effect.Match` for simple use cases. Supports predicate matching, refinement matching with exhaustiveness checking, `whenOr`, `whenAnd`, and `tryFunction` |
| **MNumber**                       | Extensions to `effect/Number`: safe conversions from `BigInt` and `BigDecimal`, integer predicates, modulo, and `fromString`                                                                                      |
| **MOption**                       | Extensions to `effect/Option`: construction from nullable-or-option values, and iterator unwrapping                                                                                                               |
| **MPortError**                    | A tagged error for wrapping failures that arise when porting non-Effect functions into the Effect world                                                                                                           |
| **MPredicate**                    | Type-level utilities for `effect/Predicate`: `Source`, `Target`, `Coverage`, mapping types, and a `struct` combinator                                                                                             |
| **MRecord**                       | Extensions to `effect/Record`: type-safe `unsafeGet`, `modify`, and `modifyAll`                                                                                                                                   |
| **MRegExp**                       | Ready-to-use `RegExp` instances (SemVer, email, line breaks) and `fromRegExpString`                                                                                                                               |
| **MRegExpString**                 | Building blocks for composing regular-expression strings (unsigned integers, signed integers, identifiers, separators, etc.)                                                                                      |
| **MString**                       | Extensions to `effect/String`: search with automatic `lastIndex` reset, padding with fill-position support, `removeNCharsEveryMChars`, SemVer/email predicates, and more                                          |
| **MStringFillPosition**           | A small enum-like module for fill positions (`left` / `right`) used by `MString` padding functions                                                                                                                |
| **MStringSearchResult**           | A value-object representing a regex match result, with `Equivalence`, `Order`, and `Hash` instances                                                                                                               |
| **MStruct**                       | Extensions to `effect/Struct`: an `evolve` variant that only requires keys present in the patch object                                                                                                            |
| **MTree**                         | A recursive tree/forest data structure with `fold`, `map`, `reduce`, and a cycle-safe `unfold`. Composed of `MTreeLeaf`, `MTreeNode`, `MTreeNonLeaf`, and `MTreeForest` sub-modules                               |
| **MTuple**                        | Extensions to `effect/Tuple`: `fromSingleValue`, `makeBoth`, `makeBothBy`, `prependElement`, and `firstTwo`                                                                                                       |
| **MTypes**                        | Type-level predicates and guards for primitives, non-primitives, iterables, and sized arrays (`isSingleton`, `isPair`, etc.)                                                                                      |

## Donate

[Any donations would be much appreciated](https://ko-fi.com/parischap) 😄

Please, star my repo if you think it's useful!

## Documentation

If you need to, take a look at the [API](https://parischap.github.io/effect-libs/docs/effect-lib).
