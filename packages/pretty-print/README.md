<div align="center">

# pretty-print

An [Effect](https://effect.website/docs/introduction) library to pretty-print any value. Can be used similarly to JSON.stringify but with plenty of extra options: treeifying, coloring, sorting, choosing what to display and how to display it... Non-recursive, tested and documented, 100% Typescript, 100% functional, 100% parametrizable.

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

## Basics

> _You may skip this section and directly jump to the 'Usage' section if you want to make a basic usage of this package._

This package exports a Stringify module with two curried functions:

- Stringify.asLines which returns the printed value as an array of FormattedString's (for the moment, you can consider a FormattedString is the same as a normal string). This can be useful if you need to further format the output lines, e.g add an extra tab at the start of each line... The first argument to the asLines function is an optional `Options` object. The second argument is the value to print. Example:

```ts
import { Options, Stringify, FormattedString } from "@parischap/pretty-print";

// Create a FormattedString that contains a tab
const tab = FormattedString.makeWith()("\t");
// Create a FormattedString that contains a newline
const newline = FormattedString.makeWith()("\n");
// Create a stringify function with the uncoloredTabified options. It's useful to create such a function so you don't need to pass the options over and over again each time you need to stringify a value
const stringify = Stringify.asLines(Options.uncoloredTabified);
// Stringify value { a: 1, b: 2 } and add a tab at the start of each line of the result,
const stringified = stringify({ a: 1, b: 2 }).map(FormattedString.prepend(tab));
// Join the result into a string using the newline string as separator
const stringResult = FormattedString.join(newline)(stringified).value;
```

- Stringify.asString which does the same as Stringify.asLines but will join the output into a single string using an optional `lineSep` parameter passed in the `Options` object (if omitted, `lineSep` is taken equal to '\n'). It does basically all that the `asLines` example above did so it is the function that you will most often use. Example:

```ts
import { Options, Stringify, FormattedString } from "@parischap/pretty-print";

const stringify = Stringify.asString({
	...Options.uncoloredSingleLine,
	lineSep: FormattedString.makeWith()("\r"),
});
const stringified = stringify(42);
```

The value to print can be any value, not just objects.

## Usage

### 1) Using predefined option sets

The simplest way to use this library is to use one of the predefined option sets.

#### Uncolored tabified printing

```ts
import { Stringify } from "@parischap/pretty-print";
//import { Options } from '@parischap/pretty-print';

// Options.uncoloredTabifiedSplitWhenTotalLengthExceeds40 is the default option so you could also write Stringify.asString(Options.uncoloredTabifiedSplitWhenTotalLengthExceeds40);
const uncoloredTabifiedSplitWhenTotalLengthExceeds40 = Stringify.asString();

const toPrint = {
	a: 1,
	b: { a: 5, c: 8 },
	d: { e: true, f: { a: { k: { z: "foo", y: "bar" }, j: false } }, g: "aa" },
};

console.log(uncoloredTabifiedSplitWhenTotalLengthExceeds40(toPrint));
```

=> Output:

![uncolored-tabified-example](docs/assets/uncolored-tabified.png?sanitize=true)

As its name suggests, the `uncoloredTabifiedSplitWhenTotalLengthExceeds40` option will split an `array` or an `object` on several lines only when its total printable length exceeds 40 characters.

#### Tabified printing with ANSI colors adapted to a screen in dark mode

```ts
import { Options, Stringify } from "@parischap/pretty-print";

const ansiDarkTabifiedSplitWhenTotalLengthExceeds40 = Stringify.asString(
	Options.ansiDarkTabifiedSplitWhenTotalLengthExceeds40,
);

const toPrint = {
	a: 1,
	b: { a: 5, c: 8 },
	d: { e: true, f: { a: { k: { z: "foo", y: "bar" }, j: false } }, g: "aa" },
};

console.log(ansiDarkTabifiedSplitWhenTotalLengthExceeds40(toPrint));
```

=> Output:

![ansi-dark-tabified-example](docs/assets/ansi-dark-tabified.png?sanitize=true)

#### Treeified printing with ANSI colors adapted to a screen in dark mode

```ts
import { Options, Stringify } from "@parischap/pretty-print";

const ansiDarkTreeified = Stringify.asString(Options.ansiDarkTreeified);
const toPrint = {
	A: {
		A1: { A11: null, A12: { A121: null, A122: null, A123: null }, A13: null },
		A2: null,
		A3: null,
	},
	B: { B1: null, B2: null },
};

console.log(ansiDarkTreeified(toPrint));
```

=> Output:

![ansi-dark-treeified-example](docs/assets/ansi-dark-treeified.png?sanitize=true)

#### More predefined option sets

Here is a recap of all the predefined option sets:
| Name | Comments |
| :--- | :--- |
| uncoloredSingleLine | The value is always displayed on a single line, whatever its length |
| ansiDarkSingleLine | Same as `uncoloredSingleLine` but with ANSI colors adapted to a screen in darkmode |
| uncoloredTabified | Same as `uncoloredSingleLine` but each property of an `array` or `object` is always printed on a seperate line, whatever its length |
| ansiDarkTabified | Same as `uncoloredTabified` but with ANSI colors adapted to a screen in darkmode |
| uncoloredTabifiedSplitWhenTotalLengthExceeds40 | Same as `uncoloredSingleLine` but `arrays` and `objects` are split on several lines when the total length of their printable characters (i.e without formatting) is strictly superior to 40 |
| ansiDarkTabifiedSplitWhenTotalLengthExceeds40 | Same as uncoloredTabifiedSplitWhenTotalLengthExceeds40 but with ANSI colors adapted to a screen in darkmode |
| uncoloredTreeified | Same as `ansiDarkTabified` but the tabs are replaced by tree characters |
| ansiDarkTreeified | Same as `uncoloredTabified` but the tabs are replaced by tree characters |

### 2) Defining your own option sets

If you need more options than those offered by the predefined option sets, you can define your own option sets by using the `generator` function of the `Options` module. Note that this is an intermediate solution that gives you more options than the already discussed `Using predefined options sets` section but is only a subset of all available options that we will see in a later section.

The generator function takes a simple parameter whose type is:

```ts
type Param = {
	readonly stringDelimiter?: string;
	readonly bigIntMark?: string;
	readonly showNullableValues?: boolean;
	readonly basicRecordFormatter?: BasicRecordFormatter.All;
	readonly colorSet?: ColorSet.Type;
};
```

with the following default values:

```ts
const defaultValues = {
	stringDelimiter = "'",
	bigIntMark = "n",
	showNullableValues = true,
	basicRecordFormatter = BasicRecordFormatter.splitWhenTotalLengthExceeds40,
	colorSet = ColorSet.uncolored,
};
```

Let's explain in more details what each parameter does:

- `stringDelimiter`: the delimiter to display around strings
- `bigIntMark`: the mark to append to bigint numbers
- `showNullableValues`: if `true`, `null` and `undefined` are respectively printed as 'null' and 'undefined'; if `false`, they are not printed, which is useful for the tree-mode.
- `basicRecordFormatter`: this parameter allows you to define in which case you want `objects` and `arrays` displayed on a single line or on multiple lines and, in each case, if you want them displayed array-like or object-like. See module `BasicRecordFormatter.ts` for more information.
- `colorSet`:a color set defines which color to apply to each part of a stringified value. See module `ColorSet.ts` for more detailed information.

Let's see some examples to better grasp the effect of these parameters. In fact, all the predefined option sets already mentioned are defined from the generator function:

```ts
const uncoloredTabifiedSplitWhenTotalLengthExceeds40 = Options.generator();
const ansiDarkTabifiedSplitWhenTotalLengthExceeds40 = Options.generator({
	colorSet: ColorSet.ansiDarkMode,
});
const uncoloredSingleLine = Options.generator({
	basicRecordFormatter: BasicRecordFormatter.singleLine,
});
const ansiDarkSingleLine = Options.generator({
	basicRecordFormatter: BasicRecordFormatter.singleLine,
	colorSet: ColorSet.ansiDarkMode,
});
const uncoloredTabified = Options.generator({
	basicRecordFormatter: BasicRecordFormatter.tabified,
});
const ansiDarkTabified = Options.generator({
	basicRecordFormatter: BasicRecordFormatter.tabified,
	colorSet: ColorSet.ansiDarkMode,
});
const uncoloredTreeified = Options.generator({
	showNullableValues: false,
	basicRecordFormatter: BasicRecordFormatter.treeified,
});
const ansiDarkTreeified = Options.generator({
	showNullableValues: false,
	basicRecordFormatter: BasicRecordFormatter.treeified,
	colorSet: ColorSet.ansiDarkMode,
});
```

So you could easily enrich the predefined options with another palette of colors by defining your own ColorSet. You could also use html colors instead of ANSI colors. You could also use different delimiters or marks for arrays and objects by defining your own BasicRecordFormatter (in which case we strongly advise to copy the basicRecordFormatter closest to your needs and make the necessary modifications).

### 3) Creating your own Options object without using the generator function

This is the most complex solution but it will give you in-depth understanding of the stringification process and full control of its parameters.

#### A few definitions

- `Record`: in this package, we call `record` any value that satisfies the Typescript interface `interface Record { readonly [key: string | symbol]: any;}`. From a javascript perspective, this covers values different from `null` whose `typeof` is either 'object' (which includes arrays) or 'function'.
- `FormattedString`: a FormattedString is a string whose `printedLength` property does not include formatting characters. Formatting characters may be unicode characters or HTML characters or whatever you like. See module `FormattedString.ts` for more information. We need this module because we need to exclude formatting characters when splitting `records` based on their `printedLength`.
- `ValueLines`: defined in module `ValueWrapper.ts` as an array of FormattedString's. It represents the output of the stringification process. A value may be stringified in zero, one or more valueLines depending on the options you passed to the stringification function.
- `ValueWrapper`: Type that represents a value in its stringification context
