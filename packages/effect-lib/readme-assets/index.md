<!-- LTeX: language=en-US -->

# Table of Contents

- [In this package](#in-this-package)
- [Usage](#usage)
  - [MCache](#mcache)
  - [MDateTime](#mdatetime)
  - [MEquivalenceBasedEqualityData](#mequivalencebasedequalitydata)
  - [MMatch](#mmatch)
  - [MNumberBase10Format](#mnumberbase10format)
  - [MOption](#moption)
  - [MString](#mstring)
  - [MTemplate](#mtemplate)
  - [MTree](#mtree)
- [Changelog](#changelog)

# In this package

This package contains the following modules, all prefixed with `M` to avoid name collisions with the official `effect` modules they extend:

| Module                            | Description                                                                                                                                                                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **MArray**                        | Extensions to `effect/Array`: additional predicates, fold/unfold operations with cycle detection, padding, grouping, and more                                                                                                                                |
| **MBigDecimal**                   | Conversions and utilities for `effect/BigDecimal`, including safe/unsafe construction from primitive values                                                                                                                                                  |
| **MBigInt**                       | Conversions, arithmetic predicates, and logarithm for `effect/BigInt`                                                                                                                                                                                        |
| **MCache**                        | A time-limited, capacity-bounded LRU cache with a `lifeSpan` (TTL in milliseconds). To be used only in a non-concurrent environment: will not work to cache `Effect` computations.                                                                           |
| **MChunk**                        | Extensions to `effect/Chunk`: duplicate detection, `findAll`, `takeBut`, and `takeRightBut`                                                                                                                                                                  |
| **MData**                         | A base class providing default `Inspectable` and `Pipeable` behavior for `effect` data types, honoring the `Redactable` protocol when a subclass implements it                                                                                               |
| **MDateTime**                     | An immutable date-time object natively handling both the Gregorian and ISO calendars (ISO year/week getters and setters), with an internal cache for performance. Exposes `format`/`parse` combining a `MDateTimeFormat` and a `MDateTimeContext`            |
| **MDateTimeContext**              | Locale data (month/weekday/day-period names) paired with the `MTemplatePlaceholder`'s that resolve each `MDateTimeFormat.Token`. Build from a locale name or from explicit translations                                                                      |
| **MDateTimeFormat**               | A context-independent date-time format: an array of separators (plain strings) and `Token`'s (Unicode date-field symbols such as `yyyy`, `MMMM`, `HH`)                                                                                                       |
| **MEquivalenceBasedEqualityData** | A base class that derives `Equal.Equal` from an abstract `isEquivalentTo` method                                                                                                                                                                             |
| **MFunction**                     | Extensions to `effect/Function`: memoization with `once`, `applyAsThis`, cloning, and constant helpers                                                                                                                                                       |
| **MInputError**                   | A tagged error for user-facing validation failures, with `assertInRange` and similar guards                                                                                                                                                                  |
| **MIterable**                     | Lazy Iterable-returning counterparts of select `MArray` functions (`findAll`, `takeRightBut`, `longestCommonSubArray`, `ungroup`, `modifyHead`, `modifyTail`, `unfold`, `mergeSorted`, `differenceSorted`): nothing is computed until the result is iterated |
| **MMatch**                        | A lightweight, type-safe pattern-matcher that replaces `effect/Match` for simple use cases. Supports predicate matching, refinement matching with exhaustiveness checking, `whenOr`, `whenAnd`, and `tryFunction`                                            |
| **MNumber**                       | Extensions to `effect/Number`: safe conversions from `BigInt` and `BigDecimal`, integer predicates, modulo, `fromString`, rounding (`round`), and safe parsing according to a `MNumberBase10Format` (`fromFormatAndString`, `fromFormatAndStringStart`)      |
| **MNumberBase10Format**           | A composable description of how to parse/format a base-10 number or `BigDecimal`: thousand/fractional separators, padding, rounding, sign display, scientific notation. Usable directly or through `MString`/`MSchema`                                       |
| **MOption**                       | Extensions to `effect/Option`: construction from nullable-or-option values, and iterator unwrapping                                                                                                                                                          |
| **MPortError**                    | A tagged error for wrapping failures that arise when porting non-`effect` functions into the `effect` world                                                                                                                                                  |
| **MPredicate**                    | Extensions to `effect/Predicate`: type-level utilities (`Source`, `Target`, `Coverage`, mapping types), a `struct` combinator, and runtime guards for primitives, non-primitives, function arity, and sized arrays (`isSingleton`, `isPair`, `isOverOne`, …) |
| **MRecord**                       | Extensions to `effect/Record`: type-safe `unsafeGet`, `modify`, and `modifyAll`                                                                                                                                                                              |
| **MRegExp**                       | Ready-to-use `RegExp` instances (SemVer, email, line breaks) and `fromRegExpString`                                                                                                                                                                          |
| **MRegExpString**                 | Building blocks for composing regular-expression strings (unsigned integers, signed integers, identifiers, separators, etc.)                                                                                                                                 |
| **MResult**                       | Extensions to `effect/Result`: flattening and optional extraction                                                                                                                                                                                            |
| **MSchema**                       | Extension to `effect/Schema`: codecs for numbers/`BigDecimal`'s (`MNumberBase10Format`-driven), `MDateTime` (from a `Date`, an `effect/DateTime.Zoned`, or a string via `MDateTimeFormat`/`MDateTimeContext`), and `MTemplate`-driven object codecs          |
| **MString**                       | Extensions to `effect/String`: search with automatic `lastIndex` reset, padding with fill-position support, `removeNCharsEveryMChars`, SemVer/email predicates, number parsing/formatting via `MNumberBase10Format`, and templating via `MTemplate`          |
| **MStringFillPosition**           | A small enum-like module for fill positions (`left` / `right`) used by `MString` padding functions                                                                                                                                                           |
| **MStringSearchResult**           | A value-object representing a regex match result, with `Equivalence`, `Order`, and `Hash` instances                                                                                                                                                          |
| **MStruct**                       | Extensions to `effect/Struct`: an `evolve` variant that only requires keys present in the patch object                                                                                                                                                       |
| **MTemplate**                     | A `sprintf`/`sscanf`-like model of a text with a fixed structure — immutable `MTemplateSeparator`'s and typed, named `MTemplatePlaceholder`'s. Parsed/formatted through `MString.templateParse`/`templateFormat` or `MSchema.Template`                       |
| **MTree**                         | A recursive tree/forest data structure with `fold`, `map`, `reduce`, and a cycle-safe `unfold`. Composed of `MTreeLeaf`, `MTreeNode`, `MTreeNonLeaf`, and `MTreeForest` sub-modules                                                                          |
| **MTuple**                        | Extensions to `effect/Tuple`: `of`, `replicate`, and `prependElement`                                                                                                                                                                                        |
| **MTypes**                        | Foundational primitive / container types and type-level utilities (`Object`, `NonPrimitive`, `Pair`, `Singleton`, `OverOne`, `OverTwo`, `Data`, `Tuple`, …). Runtime guards live in `MPredicate`                                                             |

# Usage

This package groups many small, independent extension modules. Rather than walking through all of them, this section shows a runnable example for a representative subset — the rest follow the same data-last, `pipe`-friendly style and are documented individually via JSDoc.

## MCache

A mutable, optionally bounded and TTL-limited cache built around a user-supplied lookup function. Keys are compared with `Equal.equals`; the lookup can be recursive, in which case the cache also detects circularity. To be used only in a non-concurrent environment: will not work to cache `Effect` computations.

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

## MDateTime

An immutable date-time object that natively handles both the Gregorian and ISO calendars, so you can get/set the ISO year and ISO week directly. It keeps an internal cache to speed up repeated calculations, but every function is pure from the caller's perspective. A `MDateTime` cannot be built from a string directly — combine a `MDateTimeFormat` with a `MDateTimeContext` and use `MDateTime.parse`/`format` for that.

```ts
import * as MDateTime from '@parischap/effect-lib/MDateTime';
import * as MDateTimeContext from '@parischap/effect-lib/MDateTimeContext';
import * as MDateTimeFormat from '@parischap/effect-lib/MDateTimeFormat';

const { Token } = MDateTimeFormat;

// iiii d MMMM yyyy, e.g. "Thursday 4 September 2025"
const format = MDateTimeFormat.make(Token.iiii, ' ', Token.d, ' ', Token.MMMM, ' ', Token.yyyy);
const parse = MDateTime.parse(format, MDateTimeContext.enGB);

// Result: Success, a MDateTime with timestamp Date.UTC(2025, 8, 4)
console.log(parse('Thursday 4 September 2025'));

// Result: Success('Thursday 1 January 1970')
console.log(MDateTime.format(format, MDateTimeContext.enGB)(MDateTime.fromTimestampOrThrow(0, 0)));
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

## MNumberBase10Format

A safe, easy-to-use number/`BigDecimal` parser/formatter with almost all the options offered by the JavaScript `Intl` namespace: thousand and fractional separators, minimum/maximum fractional digits, rounding mode, sign display, integer-part padding, scientific/engineering notation, exponent character. Many pre-defined instances (`frenchStyleNumber`, `ukStyleInteger`, `signedInteger`, …) and modifiers (`withNDecimals`, `withEngineeringScientificNotation`, …) are provided. Parsing and formatting are exposed as `MNumber`/`MBigDecimal` constructors, `MString` constructors, and `MSchema` codecs.

```ts
import * as MNumber from '@parischap/effect-lib/MNumber';
import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
import * as MString from '@parischap/effect-lib/MString';

const format = MNumberBase10Format.frenchStyleNumber;

// Result: Some('1 024,56')
console.log(MString.fromFormatAndNumber(format)(1024.56));

// Result: Some(1024.56)
console.log(MNumber.fromFormatAndString(format)('1 024,56'));
```

## MString

Extensions to `effect/String`: indexed search, custom-character trimming, padding, splitting (including bit-aligned chunking), indented multi-line formatting, lightweight predicates (SemVer, e-mail, digit, …), number parsing/formatting via `MNumberBase10Format`, and templating via `MTemplate`.

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

## MTemplate

An equivalent to the PHP `sprintf` and `sscanf` functions with real typing of the placeholders. A template models a text with a fixed structure made of immutable `MTemplateSeparator`'s and typed, named `MTemplatePlaceholder`'s (`fixedLength`, `paddedFixedLength`, `number`, `mappedLiterals`, `fulfilling`, `anythingBut`, `toEnd`, …). Parsing extracts an object keyed by the placeholder names; formatting does the reverse. Can also be used as a `MSchema.Template` codec.

```ts
import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
import * as MRegExpString from '@parischap/effect-lib/MRegExpString';
import * as MString from '@parischap/effect-lib/MString';
import * as MTemplate from '@parischap/effect-lib/MTemplate';
import * as MTemplatePlaceholder from '@parischap/effect-lib/MTemplatePlaceholder';
import * as MTemplateSeparator from '@parischap/effect-lib/MTemplateSeparator';

// Template: "#name is a #age-year old #kind."
const template = MTemplate.make(
  MTemplatePlaceholder.anythingBut({ name: 'name', forbiddenChars: [MRegExpString.space] }),
  MTemplateSeparator.make(' is a '),
  MTemplatePlaceholder.number({
    name: 'age',
    numberBase10Format: MNumberBase10Format.unsignedInteger,
  }),
  MTemplateSeparator.make('-year old '),
  MTemplatePlaceholder.anythingBut({ name: 'kind', forbiddenChars: ['.'] }),
  MTemplateSeparator.dot,
);

// Result: Success({ name: 'John', age: 47, kind: 'man' })
console.log(MString.templateParse(template)('John is a 47-year old man.'));

// Result: Success('Tom is a 15-year old boy.')
console.log(MString.templateFormat(template)({ name: 'Tom', age: 15, kind: 'boy' }));
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

## 0.27.0

- **`MData.Class`** now honors the `Redactable` protocol: if a subclass also implements
  `Redactable.Redactable`, `toJSON`, `toString`, and the Node.js inspection hook return
  `Redactable.getRedacted(this)` instead of the normal `_id` + properties view.
- **Renamed** the format-driven `MNumberBase10Format` constructors/parsers, so their names read in
  value-then-source order and no longer clash with the safe/throwing `*OrThrow` naming convention:
  - `MBigDecimal.extractFromString` → `fromFormatAndStringStart`
  - `MBigDecimal.extractFromStringOrThrow` → `fromFormatAndStringStartOrThrow`
  - `MBigDecimal.parseFromString` → `fromFormatAndString`
  - `MBigDecimal.parseFromStringOrThrow` → `fromFormatAndStringOrThrow`
  - `MNumber.extractFromString` → `fromFormatAndStringStart`
  - `MNumber.extractFromStringOrThrow` → `fromFormatAndStringStartOrThrow`
  - `MNumber.parseFromString` → `fromFormatAndString`
  - `MNumber.parseFromStringOrThrow` → `fromFormatAndStringOrThrow`
  - `MString.parseFromNumber` → `fromFormatAndNumber`
  - `MString.parseFromNumberOrThrow` → `fromFormatAndNumberOrThrow`
- **Renamed** the safe constructors bearing a now-inconsistent `*Option` suffix to their plain base
  name:
  - `MBigDecimal.fromPrimitiveOption` → `fromPrimitive`
  - `MBigInt.fromPrimitiveOption` → `fromPrimitive`
  - `MNumber.fromBigDecimalOption` → `fromBigDecimal`
  - `MNumber.fromBigIntOption` → `fromBigInt`
- **Moved** `MBigDecimal.RoundingOption` to `MNumberBase10Format.RoundingOption`, alongside
  `ScientificNotationOption` and `SignDisplayOption`. `MBigDecimal.round` and `MNumber.round` take
  a `MNumberBase10Format.RoundingOption` now.
  - **Removed** `MNumber.MAX_SAFE_INTEGER`, `MNumber.MAX_SAFE_INTEGER`, `MNumber.trunc`, `MBigDecimal.fromPrimitive`, `MBigDecimal.trunc`, `MTypes.EmptyArray`, `MTypes.EmptyReadonlyArray`, `MTypes.RefinementFrom`.
- **Renamed** `MBigDecimal.truncatedAndFollowingParts` to `MBigDecimal.roundedAndRest`

## 0.26.0

- Removed `MTypes.Tuple` (alias to `Types.TupleOf`).
- Renamed `MPredicate.struct` to `MPredicate.Struct` (`Predicate.struct` has been renamed `Predicate.Struct`)
- **New:** `MPredicate.isFunction` — guards `unknown` down to a function of any arity.
- **New:** `MPredicate.isNoArgFunction` — arity guard for nullary callbacks, alongside the existing
  `isOneArgFunction` and `isTwoArgFunction`.
- **Absorbed the `@parischap/conversions` package.**; its rounding, number-formatting, templating, and date-time
  functionality moved here, re-prefixed `CV` → `M` and reshaped to fit as extensions of existing modules instead of a separate package:
  - **New modules:** `MDateTime`, `MDateTimeContext`, `MDateTimeFormat`, `MNumberBase10Format`,
    `MSchema`, `MTemplate`, `MTemplatePart`, `MTemplatePlaceholder`, `MTemplateSeparator`.
  - **`MNumber.round` / `MBigDecimal.round`** replace the former `CVRounder`/`CVRounderParams`
    duo: `round(precision, option)` returns a precomputed rounder directly, no intermediate
    params object. `MBigDecimal.RoundingOption` replaces `CVRoundingOption`.
  - **`MNumber.parseFromString` / `extractFromString`** and their `MBigDecimal` counterparts
    replace `CVNumberBase10Parser`; **`MString.parseFromNumber`** (and `OrThrow`) replaces
    `CVNumberBase10Formatter`. `parseFromString` on `MBigDecimal` now correctly preserves the
    sign of negative values (the former `CVNumberBase10Parser.parseAsBigDecimal` silently
    dropped it).
  - **`MString.templateFormat` / `templateParse`** (and their `OrThrow` variants) replace
    `CVTemplateFormatter`/`CVTemplateParser`; both now take a `MTemplate` directly (the
    `fromTemplateParts` shortcut was dropped — build a `MTemplate` first).
  - **`MDateTimeFormat.Token`** is now a dense integer enum instead of a string union, so a
    `MDateTimeFormat` is a plain `ReadonlyArray<string | Token>` (strings are separators, no
    `MTemplateSeparator`/`MDateTimeFormatPlaceholder` wrapping needed). `MDateTime.format` /
    `parse` replace `CVDateTimeFormatter`/`CVDateTimeParser`, taking the format and context
    directly instead of a combined wrapper object.
  - `MDateTimeContext` absorbs the former `MonthNames`/`WeekDayNames`/`DayPeriodNames` and token
    map as plain interfaces/arrays.
- Removed `MFunction.proto`, `globalThis.Function` now exported as `MFunction.Function`
- **New module:** `MIterable` — lazy Iterable-returning counterparts of `MArray`'s `findAll`,
  `takeRightBut`, `longestCommonSubArray`, `ungroup`, `modifyHead`, `modifyTail`, `unfold`,
  `mergeSorted`, and `differenceSorted`; nothing is computed until the result is iterated.
- Fixed a bug in `MArray.takeBut` (`takeBut(0)` returned an empty array instead of a copy of the
  input).
- **Demoted** `MTreeNode` and `MTreeForest` to `esm/internal/`

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
