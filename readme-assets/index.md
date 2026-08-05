<!-- LTeX: language=en-US -->

# Packages

This monorepo publishes the four libraries listed below. Each is its own `npm` package with its own version, README, examples and `docgen` documentation.

| Package                                                                                               | Prefix | Description                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@parischap/effect-lib`](https://github.com/parischap/effect-libs/tree/main/packages/effect-lib)     | `M`    | Extension to the official `effect` package: extra utilities for `Array`, `BigDecimal`, `BigInt`, `Chunk`, `Number`, `Option`, `Result`, `String`, `Struct` plus a simpler pattern-matching module `Match`, a `Cache` with capacity and TTL that can be used out of an Effect, a regular expression builder, a cycle-safe `Tree`.        |
| [`@parischap/ansi-styles`](https://github.com/parischap/effect-libs/tree/main/packages/ansi-styles)   | `AS`   | Functional terminal styling with ANSI colors and formats.                                                                                                                                                                                                                                                                               |
| [`@parischap/conversions`](https://github.com/parischap/effect-libs/tree/main/packages/conversions)   | `CV`   | A partial, safer, bidirectional rewrite of the native `Intl` API: number and `BigDecimal` rounding, number and `DateTime` parsing/formatting, `sprintf`/`sscanf` templating. All also exposed as `Schema`'s. Also exports a functional DateTime object that implements natively the Iso calendar (faster than its `effect` counterpart) |
| [`@parischap/pretty-print`](https://github.com/parischap/effect-libs/tree/main/packages/pretty-print) | `PP`   | A non-recursive, fully configurable rewrite of `util.inspect` for Node.js or the browser. Supports treeifying, coloring, sorting, filtering and `effect` iterables (`HashMap`, `HashSet`, …) out of the box.                                                                                                                            |

## `@parischap/effect-lib` — extensions to `effect`

The base library used by every other package in this monorepo. Each module follows the `M`-prefix convention (e.g. `MArray`, `MOption`, `MMatch`) so it can be imported alongside its `effect` counterpart without name collisions. Highlights:

- **`MMatch`** — a lightweight, type-safe pattern-matcher with exhaustiveness checking, predicate matching, `whenOr`, `whenAnd` and `tryFunction`.
- **`MTree`** — a recursive tree/forest data structure with `fold`, `map`, `reduce` and a cycle-safe `unfold`.
- **`MCache`** — a time-limited, capacity-bounded LRU cache built on `effect/Cache` with a configurable `lifeSpan`.
- **`MTypes`** / **`MPredicate`** — foundational primitive and container types and runtime guards (`isSingleton`, `isPair`, `isOverOne`, …).
- Extensions to some core `effect` modules: `MArray`, `MBigDecimal`, `MBigInt`, `MChunk`, `MResult`, `MFunction`, `MNumber`, `MOption`, `MRecord`, `MRegExp`, `MString`, `MStruct`, `MTuple`.
- Tagged errors (`MInputError`, `MPortError`) for validation and porting non-`effect` code.

## `@parischap/ansi-styles` — terminal styling

Build styled terminal output by composing small, immutable `ASStyle` values. Styles compose via `ASStyle.combine` and can be canceled selectively. Includes:

- The 8 standard ANSI colors plus their bright variants, the 256-color palette, and full RGB.
- Format modifiers (bold, dim, italic, underline, …).
- An `ASText` type that carries styled segments and can be measured, sliced and concatenated without losing styling.

## `@parischap/conversions` — `Intl` replacement

A bidirectional, machine-independent set of utilities for working with numbers and dates. Most operations return a `Result` or `Option`; an `OrThrow` variant is provided for non-`effect` users. Contains:

- A **rounder** for `number` and `BigDecimal` with the same modes as `Intl` (Ceil, Floor, Expand, Trunc, HalfCeil, …).
- A **number parser/formatter** with full control over thousand and fractional separators, fractional-digit bounds, sign display, scientific/engineering notation and exponent mark. Also usable as a `Schema`.
- A **`DateTime` module** with native ISO calendar support (ISO year, ISO week) and an internal cache that makes recurring computations fast.
- A **`DateTime` parser/formatter** that supports a large subset of [Unicode date tokens](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table). Also usable as a `Schema`.
- A **templating** module (`sprintf`/`sscanf`-equivalent) with real placeholder typing — handles fixed-length fields, padded numbers and locale-aware number formatting that `Schema.TemplateLiteralParser` does not. Also usable as a `Schema`.
- Ready-to-use **brands**: `CVEmail`, `CVSemVer`, `CVPositiveReal`, `CVInteger`, `CVPositiveInteger`, … each also exposed as a `Schema`.

## `@parischap/pretty-print` — configurable `util.inspect`

A non-recursive stringifier for arbitrary JavaScript values. Built around a single `PPStringifier` configured by a `PPParameters` instance. Comes with six pre-built parameter sets:

- `utilInspectLike` / `darkModeUtilInspectLike` — produces output close to Node.js's `util.inspect`, with optional ANSI colors.
- `treeify` / `darkModeTreeify` — renders a value as an indented tree, with or without colors.
- `treeifyHideLeaves` / `darkModeTreeifyHideLeaves` — same as above but skips leaf values, useful to display a structure's shape.

For everything else (custom property filters, sort orders, primitive formatters, byPassers, depth limits, circularity handling, custom style maps, …) every aspect of the output is overridable through the `PPParameters` API. `effect` iterables such as `HashMap` and `HashSet` are supported natively.

# Dependency graph

```
                          effect-lib  ←  conversions
                              ↑                ↑
                              └── ansi-styles  ┘
                                      ↑
                                      └── pretty-print
```

Concretely:

- `effect-lib` has no peer dependency in this repo.
- `ansi-styles` and `conversions` peer-depend on `effect-lib`.
- `pretty-print` peer-depends on `effect-lib`, `ansi-styles` and `conversions`.

# Naming conventions

Every published package exposes its modules under a fixed prefix to avoid collisions with `effect` and with each other:

| Prefix | Package                   |
| ------ | ------------------------- |
| `M`    | `@parischap/effect-lib`   |
| `AS`   | `@parischap/ansi-styles`  |
| `CV`   | `@parischap/conversions`  |
| `PP`   | `@parischap/pretty-print` |

Throughout the documentation, an instance of a module's `Type` is referred to with its prefix in smart quotes — e.g. a `PPStringifier`, several `CVRounder`'s.
