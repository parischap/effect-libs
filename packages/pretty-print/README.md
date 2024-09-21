<div align="center">

# pretty-print

An [Effect](https://effect.website/docs/introduction) library to pretty-print any value. Similar to util.inspect but with plenty of extra options: treeifying, coloring, sorting, choosing what to display and how to display it...

Non-recursive, tested and documented, 100% Typescript, 100% functional, 100% parametrizable.

Can also be used by non-effect users.

</div>

## Donate

[Any donations would be much appreciated](https://ko-fi.com/parischap). 😄

## Installation

Depending on the package manager you use, run one of the following commands in your terminal:

- **Using npm:**

  ```sh
  npm install effect @parischap/js-lib @parischap/effect-lib @parischap/pretty-print
  ```

- **Using pnpm:**

  ```sh
  pnpm add effect @parischap/js-lib @parischap/effect-lib @parischap/pretty-print
  ```

- **Using yarn:**
  ```sh
  yarn add effect @parischap/js-lib @parischap/effect-lib @parischap/pretty-print
  ```

We use three peerDependencies. If you are not an Effect user, the size may seem important. But, in fact, we use little of each peerDependency. Once bundled and tree-shaken, it's not that big any more!

## API

After reading this introduction, you make take a look at the [API documentation](https://parischap.github.io/effect-libs/docs/pretty-print).

## Usage

In this documentation, the term `record` refers to a non-null `object`, an `array` or a `function`.

### 1) Using predefined option instances

The simplest way to use this library is to use one of the predefined option instances.

#### Uncolored tabified printing

```ts
import { Stringify } from "@parischap/pretty-print";

const stringify = Stringify.asString();

const toPrint = {
	a: 1,
	b: { a: 5, c: 8 },
	d: { e: true, f: { a: { k: { z: "foo", y: "bar" }, j: false } }, g: "aa" },
};

console.log(stringify(toPrint));
```

=> Output:

![uncolored-tabified-example](readme-assets/uncolored-tabified.png?sanitize=true)

When you don't pass any `Options` instance to the asString function, it uses by default the uncoloredTabifiedSplitWhenTotalLengthExceeds40 `Options` instance. As its name suggests, this instance will split a record on several lines only when its total printable length exceeds 40 characters.

#### Tabified printing with ANSI colors adapted to a screen in dark mode

```ts
import { Options, Stringify } from "@parischap/pretty-print";

const stringify = Stringify.asString(
	Options.ansiDarkTabifiedSplitWhenTotalLengthExceeds40,
);

const toPrint = {
	a: 1,
	b: { a: 5, c: 8 },
	d: { e: true, f: { a: { k: { z: "foo", y: "bar" }, j: false } }, g: "aa" },
};

console.log(stringify(toPrint));
```

=> Output:

![ansi-dark-tabified-example](readme-assets/ansi-dark-tabified.png?sanitize=true)

#### Treeified printing with ANSI colors adapted to a screen in dark mode

```ts
import { Options, Stringify } from "@parischap/pretty-print";

const stringify = Stringify.asString(Options.ansiDarkTreeified);
const toPrint = {
	A: {
		A1: { A11: null, A12: { A121: null, A122: null, A123: null }, A13: null },
		A2: null,
		A3: null,
	},
	B: { B1: null, B2: null },
};

console.log(stringify(toPrint));
```

=> Output:

![ansi-dark-treeified-example](readme-assets/ansi-dark-treeified.png?sanitize=true)

#### More predefined option instances

You can find the whole list of predefined `Options` instances in the Instances section of the [Options](https://parischap.github.io/effect-libs/pretty-print/Options.ts.html#instances) documentation.

### 2) Defining your own option sets

You can view all available options in the [Options](https://parischap.github.io/effect-libs/pretty-print/Options.ts.html#type-interface) model.

You could create your own `Options` instance from scratch. But it is usually easier to start from one of the existing instances and to overwrite the parts you want to change. For instance, the `singleLine` Options instance does not show any of the properties of an object's prototype. It is defined in the following manner:

```ts
export const singleLine = (colorSet: ColorSet.Type): Type => ({
	maxDepth: 10,
	arrayLabel: pipe(
		"[Array]",
		FormattedString.makeWith(colorSet.otherValueColorer),
	),
	functionLabel: pipe(
		"(Function)",
		FormattedString.makeWith(colorSet.otherValueColorer),
	),
	objectLabel: pipe(
		"{Object}",
		FormattedString.makeWith(colorSet.otherValueColorer),
	),
	maxPrototypeDepth: 0,
	circularLabel: pipe(
		"(Circular)",
		FormattedString.makeWith(colorSet.otherValueColorer),
	),
	propertySortOrder: ValueOrder.byStringKey,
	dedupeRecordProperties: false,
	byPasser: ByPasser.objectAsValue(colorSet),
	propertyFilter: PropertyFilter.removeNonEnumerables,
	propertyFormatter: PropertyFormatter.defaultAuto(colorSet),
	recordFormatter: RecordFormatter.defaultSingleLine(colorSet),
});
```

Let's say we want to show the properties of the prototypes of any record in the value to pretty-print. We would define our own `Options` instance in the following manner:

```ts
import { Options } from "@parischap/pretty-print";

const ansiDarkSingleLineWithProto: Options.Type = {
	...Options.ansiDarkSingleLine,
	maxPrototypeDepth: +Infinity,
};
```

Let's say we want to hide enumerable properties and properties whose key is a string:

```ts
import { Options, PropertyFilter } from "@parischap/pretty-print";
import { pipe } from "effect";

const ansiDarkSingleLineWithSymbolicNonEnums: Options.Type = {
	...Options.ansiDarkSingleLine,
	propertyFilter: pipe(
		PropertyFilter.removeNonEnumerables,
		PropertyFilter.combine(PropertyFilter.removeStringKeys),
	),
};
```

Let's say we want to change the ByPasser. As you will see in the API, there are four predefined ByPasser instances. The `singleLine` Options instance uses [ByPasser.objectAsValue](https://parischap.github.io/effect-libs/pretty-print/ByPasser.ts.html#objectAsValue). Let's see what happens if we replace it with [ByPasser.objectAsRecord](https://parischap.github.io/effect-libs/pretty-print/ByPasser.ts.html#objectAsRecord) and apply this new `Options` instance to a Date object:

```ts
import {
	ByPasser,
	ColorSet,
	Options,
	Stringify,
} from "@parischap/pretty-print";

const toPrint = new Date(Date.UTC(2024, 8, 20));

const stringifyAsValue = Stringify.asString({
	...Options.ansiDarkSingleLine,
});

const stringifyAsRecord = Stringify.asString({
	...Options.ansiDarkSingleLine,
	byPasser: ByPasser.objectAsRecord(ColorSet.ansiDarkMode),
});

// As value: Fri Sep 20 2024 02:00:00 GMT+0200 (heure d’été d’Europe centrale)
console.log(`As value: ${stringifyAsValue(toPrint)}`);
// As record:
console.log(`As record: ${stringifyAsRecord(toPrint)}`);
```

Use the API to play with all the other options at your disposal!

### 3) Getting the result as an array of lines

Sometimes, you may want to get the result of pretty-printing as an array of lines. This can be useful if you need to further format the output lines, e.g add an extra tab at the start of each line... In this case, you will use the [Stringify.asLines](https://parischap.github.io/effect-libs/pretty-print/stringify.ts.html#aslines) function instead of the [Stringify.asString](https://parischap.github.io/effect-libs/pretty-print/stringify.ts.html#asString) function. This function takes the same parameters as the asString function but it returns a [StringifiedValue](https://parischap.github.io/effect-libs/pretty-print/StringifiedValue.ts.html) which is an array of [FormattedString's](https://parischap.github.io/effect-libs/pretty-print/FormattedString.ts.html).

The following example shows how to add a tab at the start of each line of the stringified result:

```ts
import { Options, Stringify, FormattedString } from "@parischap/pretty-print";
import { pipe, Struct } from "effect";

// Create a FormattedString that contains a tab
const tab = pipe("\t", FormattedString.makeWith());
// Create a FormattedString that contains a newline
const newline = pipe("\n", FormattedString.makeWith());
// Create a stringify function with the uncoloredTabified options.
const stringify = Stringify.asLines(Options.uncoloredTabified);
// Stringify value { a: 1, b: 2 } and add a tab at the start of each line of the result,
const stringified = stringify({ a: 1, b: 2 }).map(FormattedString.prepend(tab));
// Join the result into a string using the newline string as separator
const stringResult = pipe(
	stringified,
	FormattedString.join(newline),
	Struct.get("value"),
);
```

### 4) Changing the default line separator of the asString function

In fact, the [Stringify.asString](https://parischap.github.io/effect-libs/pretty-print/stringify.ts.html#asString) function does exactly what we saw in the previous example: it calls the [Stringify.asLines](https://parischap.github.io/effect-libs/pretty-print/stringify.ts.html#aslines) function and joins the result with a FormattedString representing a new line by adding it to the `Options` instance. But you can change the default string used to represent a new line:

```ts
import { FormattedString, Options, Stringify } from "@parischap/pretty-print";
import { pipe } from "effect";

// Create a FormattedString that contains a newline
const newline = pipe("\r\n", FormattedString.makeWith());

const stringify = Stringify.asString({
	...Options.ansiDarkTabifiedSplitWhenTotalLengthExceeds40,
	lineSep: newline,
});
```
