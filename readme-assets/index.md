<!-- LTeX: language=en-US -->

# Packages

This monorepo publishes the three libraries listed below. Each is its own NPM package with its own version, README, examples and `docgen` documentation.

`@parischap/conversions` is archived: its contents moved into `@parischap/effect-lib` (see below). It is kept on disk, unmodified, only to publish a final deprecation notice.

| Package                                                                                               | Prefix | Description                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@parischap/effect-lib`](https://github.com/parischap/effect-libs/tree/main/packages/effect-lib)     | `M`    | Extension to the official `effect` package: extra utilities for `Array`, `BigDecimal`, `BigInt`, `Chunk`, `Number`, `Option`, `Result`, `String`, `Struct` plus a simpler pattern-matching module `Match`, a `Cache` with capacity and TTL, simpler than `effect/Cache `but not to be used to cache computations of `Effect`'s, a regular expression builder, a cycle-safe `Tree`, number/`BigDecimal` rounding and parsing/formatting, `DateTime` parsing/formatting with native Iso calendar support, and `sprintf`/`sscanf` templating. |
| [`@parischap/ansi-styles`](https://github.com/parischap/effect-libs/tree/main/packages/ansi-styles)   | `AS`   | Functional terminal styling with ANSI colors and formats.                                                                                                                                                                                                                                                                                                                          |
| [`@parischap/pretty-print`](https://github.com/parischap/effect-libs/tree/main/packages/pretty-print) | `PP`   | A non-recursive, fully configurable rewrite of `util.inspect` for Node.js or the browser. Supports treeifying, coloring, sorting, filtering and `effect` iterables (`HashMap`, `HashSet`, …) out of the box.                                                                                                                                                                       |

## `@parischap/effect-lib` — extensions to `effect`

The base library used by every other package in this monorepo. Each module follows the `M`-prefix convention (e.g. `MArray`, `MOption`, `MMatch`) so it can be imported alongside its `effect` counterpart without name collisions. Highlights:

- **`MMatch`** — a lightweight, type-safe pattern-matcher with exhaustiveness checking, predicate matching, `whenOr`, `whenAnd` and `tryFunction`.
- **`MTree`** — a recursive tree/forest data structure with `fold`, `map`, `reduce` and a cycle-safe `unfold`.
- **`MCache`** — a time-limited, capacity-bounded LRU cache with a configurable `lifeSpan`. Cannot be used with an effectful lookup function.
- **`MTypes`** / **`MPredicate`** — foundational primitive and container types and runtime guards (`isSingleton`, `isPair`, `isOverOne`, …).
- Extensions to some core `effect` modules: `MArray`, `MBigDecimal`, `MBigInt`, `MChunk`, `MResult`, `MFunction`, `MIterable`, `MNumber`, `MOption`, `MRecord`, `MRegExp`, `MString`, `MStruct`, `MTuple`.
- Tagged errors (`MInputError`, `MPortError`) for validation and porting non-`effect` code.
- A partial, safer, bidirectional rewrite of the native `Intl` API: `MNumber.round`/`MBigDecimal.round`, a `MNumberBase10Format`-driven number/`BigDecimal` parser/formatter (`MNumber`/`MBigDecimal`/`MString` constructors), `MDateTime` parsing/formatting (`MDateTime.format`/`parse` combining a `MDateTimeFormat` and a `MDateTimeContext`), and `sprintf`/`sscanf`-style templating (`MTemplate`, `MString.templateFormat`/`templateParse`). All also exposed as `MSchema` codecs. `MDateTime` implements natively the Iso calendar (faster than its `effect` counterpart).

## `@parischap/ansi-styles` — terminal styling

Build styled terminal output by composing small, immutable `ASStyle` values. Styles compose via `ASStyle.combine` and can be canceled selectively. Includes:

- The 8 standard ANSI colors plus their bright variants, the 256-color palette, and full RGB.
- Format modifiers (bold, dim, italic, underline, …).
- An `ASText` type that carries styled segments and can be measured, sliced and concatenated without losing styling.

## `@parischap/pretty-print` — configurable `util.inspect`

A non-recursive stringifier for arbitrary JavaScript values. Built around a single `PPStringifier` configured by a `PPParameters` instance. Comes with six pre-built parameter sets:

- `utilInspectLike` / `darkModeUtilInspectLike` — produces output close to Node.js's `util.inspect`, with optional ANSI colors.
- `treeify` / `darkModeTreeify` — renders a value as an indented tree, with or without colors.
- `treeifyHideLeaves` / `darkModeTreeifyHideLeaves` — same as above but skips leaf values, useful to display a structure's shape.

For everything else (custom property filters, sort orders, primitive formatters, byPassers, depth limits, circularity handling, custom style maps, …) every aspect of the output is overridable through the `PPParameters` API. `effect` iterables such as `HashMap` and `HashSet` are supported natively.

# Dependency graph

```
                          effect-lib
                              ↑
                              └── ansi-styles
                                      ↑
                                      └── pretty-print
```

Concretely:

- `effect-lib` has no peer dependency in this repo.
- `ansi-styles` peer-depends on `effect-lib`.
- `pretty-print` peer-depends on `effect-lib` and `ansi-styles`.

# Naming conventions

Every published package exposes its modules under a fixed prefix to avoid collisions with `effect` and with each other:

| Prefix | Package                   |
| ------ | ------------------------- |
| `AS`   | `@parischap/ansi-styles`  |
| `M`    | `@parischap/effect-lib`   |
| `PP`   | `@parischap/pretty-print` |

Throughout the documentation, an instance of a module's `Type` is referred to with its prefix in smart quotes — e.g. a `PPStringifier`, several `MTemplatePlaceholder`'s.
