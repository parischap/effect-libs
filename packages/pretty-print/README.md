<!-- LTeX: language=en-US -->
<div align="center">

# pretty-print

An [`Effect`](https://effect.website/docs/introduction) library that produces the string representation of any JavaScript value, in Node.js or the browser. Similar to `util.inspect` but with extensive configurability: **treeifying, coloring, sorting, filtering, choosing what to display and how to display it...**. Supports Effect iterables such as `HashMap` and `HashSet` natively.

Non-recursive, tested and documented, optimized for tree-shaking, 100% TypeScript, 100% functional, 100% configurable.

Can also be used by non-Effect users.

</div>

## Donate

[Any donations would be much appreciated](https://ko-fi.com/parischap) 😄

Please star the repo if you find it useful!

## Installation

Depending on the package manager you use, run one of the following commands in your terminal:

- **npm:**

  ```sh
  npm install effect @parischap/effect-lib @parischap/ansi-styles @parischap/pretty-print
  ```

- **pnpm:**

  ```sh
  pnpm add effect @parischap/effect-lib @parischap/ansi-styles @parischap/pretty-print
  ```

- **yarn:**

  ```sh
  yarn add effect @parischap/effect-lib @parischap/ansi-styles @parischap/pretty-print
  ```

## Package size and tree-shaking

This library is optimized for tree-shaking. [Bundlephobia](https://bundlephobia.com/package/@parischap/pretty-print) announces a size of roughly 7 KB once minified and gzipped — a significant portion of which will be eliminated by your bundler.

## How to import

This library supports named imports from the barrel:

```ts
import { PPParameters, PPStringifier, PPStringifiedValue } from '@parischap/pretty-print';
```

and namespace imports from individual modules (recommended when tree-shaking matters):

```ts
import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPStringifier from '@parischap/pretty-print/PPStringifier';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
```

The examples in this document use the namespace-import style.

## API

After reading this introduction you may consult the full [API documentation](https://parischap.github.io/effect-libs/docs/pretty-print).

## Overview

> Throughout this document, **non-primitive value** means any JavaScript value that is not a primitive — in other words, a function or a non-null object (arrays included).

The central type is `PPStringifier` (module `PPStringifier`). It is built from a `PPParameters` instance (module `PPParameters`) and exposes a single `stringify` function:

```
stringify: (value: unknown) => PPStringifiedValue.Type
```

`PPStringifiedValue.Type` is a non-empty array of `ASText.Type` (one entry per output line). It can be rendered to a terminal string with `PPStringifiedValue.toAnsiString()` or to plain strings with `PPStringifiedValue.toUnstyledStrings`.

## Usage

### A) Using the six pre-built `PPParameters` instances

For most use-cases, one of the six pre-built instances will do.

#### `utilInspectLike` / `darkModeUtilInspectLike`

These two instances produce output very similar to Node.js's `util.inspect()`. The `darkMode` variant adds ANSI color codes suited to a dark-mode terminal.

```ts
import { pipe } from 'effect';
import * as HashMap from 'effect/HashMap';

import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPStringifier from '@parischap/pretty-print/PPStringifier';

const { stringify } = PPStringifier.make(PPParameters.darkModeUtilInspectLike);

const toPrint = {
  a: [7, 8],
  e: HashMap.make(['key1', 3], ['key2', 6]),
  b: { a: 5, c: 8 },
  f: Math.max,
  d: {
    e: true,
    f: { a: { k: { z: 'foo', y: 'bar' } } },
  },
};

console.log(pipe(toPrint, stringify, PPStringifiedValue.toAnsiString()));
```

→ Output:

![util-inspect-like-example](readme-assets/util-inspect-like.png?sanitize=true)

Note how the Effect `HashMap` is pretty-printed without any extra configuration. By default `maxDepth` is `2`, so deeply nested values are replaced by a tag such as `[Object]`.

#### `treeify` / `darkModeTreeify`

These two instances render values as a tree, showing all leaf values alongside their keys.

```ts
import { pipe } from 'effect';

import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPStringifier from '@parischap/pretty-print/PPStringifier';

const { stringify } = PPStringifier.make(PPParameters.darkModeTreeify);

const toPrint = {
  Vegetal: {
    Trees: { Oaks: 8, BirchTree: 3 },
    Fruit: { Apples: 8, Lemons: 5 },
  },
  Animal: {
    Mammals: { Dogs: 3, Cats: 2 },
  },
};

console.log(pipe(toPrint, stringify, PPStringifiedValue.toAnsiString()));
```

→ Output:

![treeify-with-leaves-example](readme-assets/treeify-with-leaves.png?sanitize=true)

#### `treeifyHideLeaves` / `darkModeTreeifyHideLeaves`

Same as above but leaf values are hidden — only the key is shown. Useful for inspecting the shape of a large object.

```ts
import { pipe } from 'effect';
import * as HashMap from 'effect/HashMap';

import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPStringifier from '@parischap/pretty-print/PPStringifier';

const { stringify } = PPStringifier.make(PPParameters.darkModeTreeifyHideLeaves);

const toPrint = {
  A: {
    A1: {
      A11: null,
      A12: [{ A121: null, A122: null, A123: null }, { A124: null }],
      A13: null,
    },
    A2: null,
    A3: null,
  },
  B: HashMap.make(['B1', null], ['B2', null]),
};

console.log(pipe(toPrint, stringify, PPStringifiedValue.toAnsiString()));
```

→ Output:

![treeify-example](readme-assets/treeify.png?sanitize=true)

Note how the array and the Effect `HashMap` are treeified transparently.

### B) Circular-reference handling

Circular references are handled the same way as in `util.inspect`. Each non-primitive value that is referenced more than once in the traversal is tagged with `<Ref *N>` at its first occurrence, and replaced by `[Circular *N]` at subsequent ones.

```ts
import { pipe } from 'effect';

import * as MStruct from '@parischap/effect-lib/MStruct';
import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPStringifier from '@parischap/pretty-print/PPStringifier';

const { stringify } = pipe(
  PPParameters.utilInspectLike,
  MStruct.append({
    id: 'UtilInspectLikeInfiniteDepth',
    maxDepth: +Infinity,
  }),
  PPParameters.make,
  PPStringifier.make,
);

const circular: Record<string, unknown> = { a: 1, b: { inner: 1, circular: 1 } };
(circular['b'] as Record<string, unknown>)['inner'] = circular['b'];
(circular['b'] as Record<string, unknown>)['circular'] = circular;
circular['a'] = [circular];

console.log(pipe(circular, stringify, PPStringifiedValue.toAnsiString()));
```

→ Output:

![circularity-handling-example](readme-assets/circularity-handling.png?sanitize=true)

### C) Building your own `PPParameters`

`PPParameters.make` accepts an object whose fields correspond to the `PPParameters.Type` class. You can spread an existing instance and override only the fields you need. All customizable aspects are described in the sections that follow.

#### 1) Applying colors and styles — `PPStyleMap`

`PPParameters.Type` has a `styleMap` field of type `PPStyleMap.Type`. A `PPStyleMap` is a map from a **part name** (a string that identifies a visual element of the output, e.g. `'PropertyKey'`, `'KeyValueSeparator'`, `'ByPassed'`…) to a `PPStyle.Type`.

A `PPStyle.Type` is an alias for `ASContextStyler.Type<PPValue.Any>` — a context-dependent styler whose context is the `PPValue` being rendered. This allows colors to vary with depth, value type, key type, etc. Three constructors are available in the `PPStyle` module:

- `PPStyle.makeDepthIndexed(palette)` — picks a color from `palette` using the current nesting depth. Useful for bracket coloring.
- `PPStyle.makeTypeIndexed(palette)` — picks a color from `palette` using the content's runtime type (string, number, boolean…).
- `PPStyle.makeKeyTypeIndexed(palette)` — picks index `0` for string keys and index `1` for symbolic keys.

Two `PPStyleMap` instances are pre-built:

- `PPStyleMap.none` — no styling (plain text).
- `PPStyleMap.darkMode` — ANSI colors suitable for dark-mode terminals.

To suppress all colors from a colored instance, pass `PPStyleMap.none` to `styleMap`. To add colors to a plain instance, pass `PPStyleMap.darkMode`. For example, `darkModeUtilInspectLike` is simply:

```ts
import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPStyleMap from '@parischap/pretty-print/PPStyleMap';

export const darkModeUtilInspectLike = PPParameters.make({
  ...PPParameters.utilInspectLike,
  id: 'DarkModeUtilInspectLike',
  styleMap: PPStyleMap.darkMode,
});
```

Use `PPStyleMap.make` to define your own style maps. Refer to the [@parischap/ansi-styles](https://www.npmjs.com/package/@parischap/ansi-styles) documentation for the full styling API. If a part name is not present in the style map, the `none` style is silently used.

#### 2) Formatting primitive values — `PPPrimitiveFormatter`

`PPParameters.Type` has a `primitiveFormatter` field of type `PPPrimitiveFormatter.Type`. It converts a primitive value to a plain string. The pre-built `PPPrimitiveFormatter.utilInspectLike` instance:

- Wraps strings in single quotes and truncates them at 10 000 characters.
- Formats numbers and bigints with `toString()` (base 10).
- Displays `null`, `undefined`, booleans and symbols with their usual string representation.

The `utilInspectLikeMaker` constructor lets you customize the quote character, the maximum string length, and the number/bigint formatters:

```ts
import * as MString from '@parischap/effect-lib/MString';
import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPPrimitiveFormatter from '@parischap/pretty-print/PPPrimitiveFormatter';

// Truncate strings at 200 characters and format numbers with 2 decimal places
const myFormatter = PPPrimitiveFormatter.utilInspectLikeMaker({
  id: 'MyFormatter',
  maxStringLength: 200,
  quoteChar: "'",
  numberFormatter: new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format,
  bigintFormatter: MString.fromNumber(10),
});

export const withCustomPrimitiveFormatter = PPParameters.make({
  ...PPParameters.utilInspectLike,
  id: 'WithCustomPrimitiveFormatter',
  primitiveFormatter: myFormatter,
});
```

Use `PPPrimitiveFormatter.make` for an entirely custom formatter.

#### 3) Configuring non-primitive values — `PPNonPrimitiveParameters`

`PPParameters.Type` has a `nonPrimitiveParametersArray` field: a non-empty ordered array of `PPNonPrimitiveParameters.Type` instances. When a non-primitive value is encountered during stringification, **every** entry whose `isApplicableTo` predicate returns `true` is selected, and the matching entries are merged into a single fully-resolved set of parameters. Lower-index entries override higher-index ones, and any field that is not specified by any matching entry falls back to a record-like default that mimics `util.inspect` for plain objects (single quotes, `: ` separator, `{ }` brackets, splits at 80 characters, displays only own enumerable properties, bypasses dates and regular expressions, etc.). Entries should therefore be ordered in decreasing specificity.

This design allows you to apply different rules to functions, arrays, iterables and plain records — which is exactly what `utilInspectLike` does:

```
nonPrimitiveParametersArray: [
  utilInspectLikeFunction,   // matches functions
  utilInspectLikeArray,      // matches arrays
  utilInspectLikeIterable,   // matches iterables (Map, Set, HashMap…)
]
```

For an array (which is also iterable), both `utilInspectLikeArray` and `utilInspectLikeIterable` match and are merged; `utilInspectLikeArray` wins on the fields it specifies because it appears at a lower index. For a plain record, no entry matches, so the record-like defaults take over.

The following pre-built instances are available in `PPNonPrimitiveParameters`:

| Instance                  | Applies to        | Notes                                                              |
| ------------------------- | ----------------- | ------------------------------------------------------------------ |
| `utilInspectLikeFunction` | functions         | shows `[Function: name]`                                           |
| `utilInspectLikeArray`    | arrays            | shows `[ 1, 2, 3 ]`                                                |
| `utilInspectLikeIterable` | iterables         | shows `Map(2) { 'a' => 1, 'b' => 2 }`; caps at 100 elements        |
| `treeify`                 | any non-primitive | tree rendering, shows leaf values                                  |
| `treeifyHideLeaves`       | any non-primitive | tree rendering, hides leaf values                                  |

`PPNonPrimitiveParameters.make` accepts all the fields of `PPNonPrimitiveParameters.Type`. Apart from `id` and `isApplicableTo`, every field is optional: any unset field is filled in by the merge defaults described above. You can spread an existing instance and override only the fields you need. The most important fields are described below.

##### `isApplicableTo`

A predicate `(value: MTypes.NonPrimitive) => boolean` that determines whether this instance handles a given non-primitive value.

##### `byPasser`

A `PPByPasser.Type` instance applied before the normal rendering pipeline. If the bypasser returns a `some`, its string content is used directly and all other steps are skipped. This is useful for values that have a meaningful `toString` — for example `Date`. Four pre-built instances exist:

- `PPByPasser.empty` — never bypasses (always returns `none`).
- `PPByPasser.toStringable` — calls `.toString()` on the value's content and returns `some` of the result, but only when the `toString` method is not `Object.prototype.toString` (i.e. when the value defines a custom or overridden implementation). Dates, custom classes that override `toString`, and arrays all qualify.
- `PPByPasser.allWithName` — displays the value as its name surrounded by `openingTagMark` and `closingTagMark` (e.g. `[Function: foo]`). Always returns a `some`. Used by `utilInspectLikeFunction` to render functions.
- `PPByPasser.dateAndRegExp` — calls `.toISOString()` on `Date`'s and `.toString()` on `RegExp`'s; returns a `none` for all other values. This is the default `byPasser` baked into the merge defaults, so dates and regular expressions are pretty-printed even when no `PPNonPrimitiveParameters` explicitly sets a `byPasser`.

Use `PPByPasser.merge` to combine several bypassers into one (the first matching bypasser wins):

```ts
import * as PPByPasser from '@parischap/pretty-print/PPByPasser';
import * as PPNonPrimitiveParameters from '@parischap/pretty-print/PPNonPrimitiveParameters';
import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as Array from 'effect/Array';

// Record formatter where dates use toISOString and any other custom-toString
// objects use their toString
export const withDateAndCustomToStringBypass = PPParameters.make({
  ...PPParameters.utilInspectLike,
  id: 'WithDateAndCustomToStringBypass',
  nonPrimitiveParametersArray: Array.make(
    PPNonPrimitiveParameters.utilInspectLikeFunction,
    PPNonPrimitiveParameters.utilInspectLikeArray,
    PPNonPrimitiveParameters.utilInspectLikeIterable,
    PPNonPrimitiveParameters.make({
      id: 'RecordWithCustomToStringBypass',
      isApplicableTo: () => true,
      byPasser: PPByPasser.merge({
        id: 'DateAndRegExpAndToStringable',
        byPassers: [PPByPasser.dateAndRegExp, PPByPasser.toStringable],
      }),
    }),
  ),
});
```

##### `maxDepth` (global) and `maxPrototypeDepth`

`PPParameters.Type` has a global `maxDepth` field: the maximum number of non-primitive levels to expand. When exceeded, the value is replaced by a tag such as `[Object]` or `[Array]`.

`PPNonPrimitiveParameters.Type` has a `maxPrototypeDepth` field: how many levels of the prototypal chain to inspect when extracting properties with `Reflect.ownKeys`. A value of `0` shows no properties at all; `1` shows only own properties; `2` adds the direct prototype's properties; and so on. Iterable contents are always extracted regardless of this setting.

##### `propertyFilter`

A `PPPropertyFilter.Type` instance that filters the extracted properties. Pre-built instances in `PPPropertyFilter`:

- `none` — removes nothing (keeps everything).
- `removeNonEnumerables` — keeps only enumerable properties (the merge default).
- `removeEnumerables` — keeps only non-enumerable properties.
- `removeFunctions` — removes properties whose value is a function.
- `removeNonFunctions` — keeps only properties whose value is a function.
- `removeStringKeys` — removes properties with a string key.
- `removeSymbolicKeys` — removes properties with a symbolic key.

Use `PPPropertyFilter.merge` to combine several filters into one (a property is kept only if every filter keeps it), `PPPropertyFilter.removeNotFulfillingKeyPredicateMaker` to filter by string-key predicate, and `PPPropertyFilter.make` for fully custom logic.

##### `propertySortOrder`

An `Option.Option<PPValueOrder.Type>` that sorts properties after filtering. Pass `Option.none()` to keep the natural order (the merge default). The `PPValueOrder` module provides ready-made orderings:

- `byProtoDepth` — own properties first, then inherited ones.
- `byOneLineStringKey` — alphabetical by string key.
- `byCallability` — non-functions first, then functions.
- `byKeyType` — symbolic keys first, then string keys.
- `byEnumerability` — non-enumerable keys first, then enumerable ones.
- `bySource` — properties extracted from iteration first, then properties extracted via `Reflect.ownKeys`.

Use `Order.combine` from `effect/Order` to layer several orderings into a multi-criteria sort.

##### `propertyFormatter`

A `PPPropertyFormatter.Type` instance that combines the stringified key with the stringified value of each property. Pre-built instances:

- `valueOnly` — ignores the key entirely (used for arrays where auto-generated numeric keys add no information).
- `utilInspectLikeArrayAndRecord` — separates key and value with `: ` on the same line (e.g. `a: 1`). The merge default.
- `utilInspectLikeIterable` — separates key and value with ` => ` (e.g. `'key' => 1`).
- `usualTreeify` — for both leaf and non-leaf properties: appends the value lines after the key lines with no separator (tree layout).
- `usualTreeifyHideLeaves` — for leaf properties: shows only the key; for non-leaf properties: same as `usualTreeify`.

The constructors `keyAndValue`, `treeify` and `treeifyHideLeaves` let you customize the key/value separator mark and the prototype-depth decoration marks (a prefix and a suffix repeated as many times as the depth of the property in the prototypal chain). Use `PPPropertyFormatter.make` for fully custom logic.

##### `nonPrimitiveFormatter`

A `PPNonPrimitiveFormatter.Type` instance that assembles the formatted properties into the final representation of the non-primitive value, adding brackets and separators. Pre-built instances:

- `utilInspectLikeRecord` — uses `{ }` brackets and `,` separators; switches from single-line to multi-line when the total length exceeds 80 characters.
- `utilInspectLikeArray` — same but uses `[ ]` brackets.
- `usualTreeify` — treeifies using `├─`, `│`, `└─` characters.

Several constructors let you define your own brackets, indentation marks and split policies:

- `singleLine` — always renders on a single line.
- `tabify` — always renders on multiple lines with `tabMark` indentation.
- `treeify` — tree-style rendering with custom indentation marks.
- `splitOnTotalLength` — single-line if the total rendered length is `<= limit`, otherwise multi-line.
- `splitOnConstituentNumber` — single-line if the number of properties is `<= limit`, otherwise multi-line.
- `splitOnLongestPropLength` — single-line if the length of the longest property is `<= limit`, otherwise multi-line.

Use `PPNonPrimitiveFormatter.make` for fully custom assembly.

##### `showName` and `propertyNumberDisplayOption`

`showName: true` prepends the value's type name to the header (e.g. `Map` in `Map(2) { 'a' => 1, 'b' => 2 }`). The name itself is derived by the `name` function of `PPParameters.Type` from the raw value: it returns `'Function: <name>'` for functions, then tries Effect's `toJSON()._id` convention, then falls back to `value.constructor.name` (which transparently covers `Map`, `Set`, `WeakMap`, `WeakSet`, all typed arrays and user-defined classes).

`propertyNumberDisplayOption` controls whether and how property counts appear in the header. Property counts are wrapped in `propertyNumberOpeningMark` / `propertyNumberClosingMark`. Options:

- `None` — no count shown (e.g. `{ 'a' => 1 }`).
- `All` — count of properties retrieved from the source (e.g. `Map(5) { 'a' => 1 }` when 5 entries existed before filtering).
- `Actual` — count of properties actually displayed, after filtering, deduping and `maxPropertyNumber` (e.g. `Map(2) { 'a' => 1 }`).
- `AllAndActual` — both counts, separated by `propertyNumberSeparatorMark` (e.g. `Map(5,2) { 'a' => 1 }`).
- `AllAndActualIfDifferent` — same as `AllAndActual`, but the actual count is hidden when it equals the all count.

##### `hideAutoGeneratedKeys`

When `hideAutoGeneratedKeys` is `true` **and** all extracted properties have auto-generated keys (i.e. they came from an iterator with no explicit key, as in a plain array), the keys are suppressed in the output. This is what produces `[ 1, 2, 3 ]` instead of `[ 0: 1, 1: 2, 2: 3 ]` for arrays.

##### `extractIterableElements`, `dedupeProperties` and `maxPropertyNumber`

- `extractIterableElements` (default `false`, set to `true` by `utilInspectLikeIterable`): when `true` and the value is iterable, its elements are extracted by iteration in addition to its keyed properties. Set to `false` for categories whose iteration is not meaningful for display (e.g. functions).
- `dedupeProperties` (default `false`): a non-primitive value can have several properties with the same key (e.g. when `maxPrototypeDepth > 1` causes a property to appear both on the value and on its prototype). When `true`, only the first occurrence is kept. Sorting happens before deduping, so combine with `propertySortOrder: PPValueOrder.byProtoDepth` to keep the own-property version.
- `maxPropertyNumber` (default `+Infinity`, capped at `100` by `utilInspectLikeIterable`): keeps the first `maxPropertyNumber` properties after filtering, sorting and deduping.

#### 4) Depth limit — `maxDepth`

`PPParameters.Type.maxDepth` limits how many nested non-primitive levels are expanded. When a non-primitive value lies at a depth equal to or greater than `maxDepth`, it is replaced by a bracketed tag whose text is derived from its type (e.g. `[Object]`, `[Array]`, `[Function: max]`, `[Map]`…). Pass `+Infinity` to expand all levels:

```ts
import { pipe } from 'effect';

import * as MStruct from '@parischap/effect-lib/MStruct';
import * as PPParameters from '@parischap/pretty-print/PPParameters';

export const allDepths = pipe(
  PPParameters.utilInspectLike,
  MStruct.append({
    id: 'AllDepths',
    maxDepth: +Infinity,
  }),
  PPParameters.make,
);
```

#### 5) Rendering the output — `PPStringifiedValue`

`stringify` returns a `PPStringifiedValue.Type` (a non-empty array of styled text lines). The `PPStringifiedValue` module provides utilities to convert it:

- `PPStringifiedValue.toAnsiString()` — joins lines with `\n`, preserving ANSI color codes.
- `PPStringifiedValue.toUnstyledStrings` — returns a plain `string[]`, stripping all styling.
- `PPStringifiedValue.toAnsiString(separator)` — joins lines with a custom separator.

### D) Worked examples

The following runnable examples illustrate each customization point. They live in [`examples/`](examples/) and can all be run together with `pnpm examples`.

#### Bypassing dates and regular expressions

The default `PPByPasser.dateAndRegExp` (baked into the merge defaults) renders `Date` instances via `.toISOString()` and `RegExp` instances via `.toString()` instead of as objects:

```ts
import { pipe } from 'effect';

import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPStringifier from '@parischap/pretty-print/PPStringifier';

const { stringify } = PPStringifier.make(PPParameters.darkModeUtilInspectLike);

const toPrint = {
  createdAt: new Date(0),
  updatedAt: new Date('2026-04-30T10:00:00Z'),
  emailPattern: /^[\w.+-]+@[\w-]+\.[\w.-]+$/i,
  ids: [/^abc/, /xyz$/g],
};

console.log(pipe(toPrint, stringify, PPStringifiedValue.toAnsiString()));
```

→ Output:

![with-date-and-regexp-example](readme-assets/with-date-and-regexp.png?sanitize=true)

#### Inspecting the prototypal chain

`maxPrototypeDepth: 4` walks three levels of prototype, and `propertySortOrder: PPValueOrder.byProtoDepth` keeps own properties first. Inherited keys are decorated with one `@` per prototype-chain step:

```ts
class Animal {
  constructor(public readonly species: string, public readonly legs: number) {}
}
class Dog extends Animal {
  constructor(public readonly name: string) { super('dog', 4); }
}
class WorkingDog extends Dog {
  constructor(name: string, public readonly job: string) { super(name); }
}
```

→ Output:

![with-prototype-chain-example](readme-assets/with-prototype-chain.png?sanitize=true)

See [`examples/with-prototype-chain.ts`](examples/with-prototype-chain.ts) for the full configuration.

#### Custom style map

A `PPStyleMap` built with `PPStyle.makeDepthIndexed` for brackets and `PPStyle.makeTypeIndexed` for primitives — bracket color cycles with depth, primitive color reflects the runtime type:

→ Output:

![with-custom-style-map-example](readme-assets/with-custom-style-map.png?sanitize=true)

See [`examples/with-custom-style-map.ts`](examples/with-custom-style-map.ts) for the full configuration.

#### Custom primitive formatter

`PPPrimitiveFormatter.utilInspectLikeMaker` integrates with `Intl.NumberFormat` for grouping separators and fixed-decimal formatting; it also lets you cap string length and pick the quote character:

```ts
const myFormatter = PPPrimitiveFormatter.utilInspectLikeMaker({
  id: 'TwoDecimalsAndShortStrings',
  maxStringLength: 30,
  quoteChar: '"',
  numberFormatter: new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format,
  bigintFormatter: MString.fromNumber(10),
});
```

→ Output:

![with-custom-primitive-formatter-example](readme-assets/with-custom-primitive-formatter.png?sanitize=true)

See [`examples/with-custom-primitive-formatter.ts`](examples/with-custom-primitive-formatter.ts) for the full configuration.

#### Filtering and sorting properties

Combining a `PPPropertyFilter` and a `PPValueOrder` lets you tailor what shows up and in what order. Here, function-valued properties are removed, and the remaining properties are sorted alphabetically:

```ts
const recordWithFilterAndSort = PPNonPrimitiveParameters.make({
  id: 'RecordWithFilterAndSort',
  isApplicableTo: () => true,
  propertyFilter: PPPropertyFilter.removeFunctions,
  propertySortOrder: Option.some(PPValueOrder.byOneLineStringKey),
});
```

→ Output:

![with-property-filter-and-sort-example](readme-assets/with-property-filter-and-sort.png?sanitize=true)

See [`examples/with-property-filter-and-sort.ts`](examples/with-property-filter-and-sort.ts) for the full configuration.
