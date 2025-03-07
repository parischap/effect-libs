<div align="center">

# pretty-print

An [Effect](https://effect.website/docs/introduction) library that produces the string representation of any value, in Node or the browser. Similar to util.inspect but with plenty of extra options: **treeifying, coloring, sorting, choosing what to display and how to display it...**. It supports natively Effect iterables like HashMap, HashSet,...

Non-recursive, tested and documented, 100% Typescript, 100% functional, 100% parametrizable.

Can also be used by non-Effect users.

</div>

## Donate

[Any donations would be much appreciated](https://ko-fi.com/parischap). 😄

## Installation

Depending on the package manager you use, run one of the following commands in your terminal:

- **Using npm:**

  ```sh
  npm install effect @parischap/effect-lib @parischap/ansi-styles @parischap/pretty-print
  ```

- **Using pnpm:**

  ```sh
  pnpm add effect @parischap/effect-lib @parischap/ansi-styles @parischap/pretty-print
  ```

- **Using yarn:**
  ```sh
  yarn add effect @parischap/effect-lib @parischap/ansi-styles @parischap/pretty-print
  ```

We use three peerDependencies. If you are not an Effect user, the size may seem important. But, in fact, we use little of each peerDependency. Bundled, tree-shaken, minified, it's only about [24kB](https://bundlephobia.com/package/@parischap/pretty-print). Minified and gzipped, it falls to [5kB](https://bundlephobia.com/package/@parischap/pretty-print)! (source bundlephobia)

## API

After reading this introduction, you may take a look at the [API](https://parischap.github.io/effect-libs/docs/pretty-print) documentation.

## Upgrading

Version 0.3.0 introduced many improvements and breaking changes. we apologize for any inconvenience caused and appreciate your understanding.

## Usage

Note that, throughout this document, the term `non-primitive value` refers to a value that is not a Javascript primitive. So it can represent javascript functions or non-null javascript objects (which of course include arrays).

### A) Using predefined `Option` instances

For a start, you can use one of the 6 predefined `Option` instances.

```ts
import { PPOption, PPStringifiedValue } from "@parischap/pretty-print";
import { HashMap, pipe } from "effect";

const stringifier = PPOption.toStringifier(PPOption.darkModeUtilInspectLike);

const toPrint = {
	a: [7, 8],
	e: HashMap.make(["key1", 3], ["key2", 6]),
	b: { a: 5, c: 8 },
	f: Math.max,
	d: {
		e: true,
		f: { a: { k: { z: "foo", y: "bar" } } },
	},
};

console.log(pipe(toPrint, stringifier, PPStringifiedValue.toAnsiString()));
```

=> Output:

![util-inspect-like-example](readme-assets/util-inspect-like.png?sanitize=true)

In the previous example, we used the `darkModeUtilInspectLike` Option instance. As its name suggests, it pretty-prints values in a way very similar to the Javascript `util.inspect()` function using colors adapted to a dark-mode terminal (which is almost always the case). But if you don't need coloring, you can simply use the `utilInspectLike` Option instance instead. Do note how the Effect HashMap gets directly printed without any particular effort.

The remaining 4 predefined Option instances are all related to treeifying. For instance:

```ts
import { PPOption, PPStringifiedValue } from "@parischap/pretty-print";
import { HashMap, pipe } from "effect";

const stringifier = PPOption.toStringifier(PPOption.darkModeTreeifyHideLeaves);

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
	B: HashMap.make(["B1", null], ["B2", null]),
};

console.log(pipe(toPrint, stringifier, PPStringifiedValue.toAnsiString()));
```

=> Output:

![treeify-example](readme-assets/treeify.png?sanitize=true)

Again, do note how an array and an Effect HashMap get directly treeified without any particular effort.
As you have guessed, the `treeifyHideLeaves` Option instance does the same without coloring. And the treeify and darkModeTreeify Option instances also treeify without hiding the leaves (the `null` values in the previous example). Here's a simple example:

```ts
import { PPOption, PPStringifiedValue } from "@parischap/pretty-print";
import { pipe } from "effect";

const stringifier = PPOption.toStringifier(PPOption.darkModeTreeify);

const toPrint = {
	Vegetal: {
		Trees: {
			Oaks: 8,
			BirchTree: 3,
		},
		Fruit: { Apples: 8, Lemons: 5 },
	},
	Animal: {
		Mammals: {
			Dogs: 3,
			Cats: 2,
		},
	},
};

console.log(pipe(toPrint, stringifier, PPStringifiedValue.toAnsiString()));
```

=> Output:

![treeify-with-leaves-example](readme-assets/treeify-with-leaves.png?sanitize=true)

### B) Creating your own Option instances

You can find a detailed description of the Option object in the [API](https://parischap.github.io/effect-libs/pretty-print/Option.ts.html#type-interface-3) documentation.

#### 1) Applying your own styles and colors

If you are not interested in going too deep into details, just remember that you need to use the `styleMap` property of the Option object to define the colors that the pretty-printer will use. For instance, this is how you could define the `darkModeUtilInspectLike` Option instance from the `utilInspectLike` Option instance if it didn't already exist:

```ts
import { PPOption, PPStyleMap } from "@parischap/pretty-print";

export const darkModeUtilInspectLike: PPOption.Type = PPOption.make({
	...PPOption.utilInspectLike,
	id: "DarkModeUtilInspectLike",
	styleMap: PPStyleMap.darkMode,
});
```

Just passing `PPStyleMap.darkMode` to the `styleMap` property does the trick. Inversely, you can suppress all colors from a colored Option instance by passing `PPStyleMap.none` to the `styleMap` property.

This package uses the [@parischap/ansi-styles](https://www.npmjs.com/package/@parischap/ansi-styles) package to apply styles to a stringified value. Please refer to the documentation of that package if you intend to define your own coloring options.

An Option instance has a `styleMap` property which, as its name suggests, is a map that associates the name of the part of a stringified value (e.g. the key/value separator when pretty-printing a non-primitive value,...) to a `ValueBasedStyler` which is nothing but an alias for a `ContextStyler` (see [@parischap/ansi-styles](https://parischap.github.io/effect-libs/ansi-styles/ContextStyler.ts.html)) whose Context object is a `Value` (see Value.ts).

A `Value` is an object that contains a value to pretty-print and contextual information about that value (its depth in the initial value to pretty-print, its depth in the prototypal chain of the object it belongs to, its type, the type of its key if it belongs to a non-primitive value...). For instance, in the object `{a:3, b:{d:5, c:6}}`, the value 3 has a depth of 1 and the values 5 and 6 a depth of 2. The ValueBasedStyler.ts module defines three constructors:

- `makeDepthIndexed`: this constructor builds a ContextStyler that will use the `depth` property of the Value object it receives to choose which style to apply. This is for instance useful to style the curly-brackets that surround a non-primitive value when we want to use a different color at different depths.
- `makeTypeIndexed`: this constructor builds a ContextStyler that will use the `contentType` property of the Value object it receives to choose which style to apply. This is for instance useful to style different types of values in different colors (e.g. green for strings, cyan for symbols,...).
- `makeKeyTypeIndexed`: this constructor builds a ContextStyler that will use the `hasSymbolicKey` property of the Value object it receives to choose which style to apply. This is for instance useful to style symbolic property keys in cyan and string property keys in red.

Of course, you may create any other constructors that suit your needs and use them in your own StyleMap instances.

As already discussed, there are two predefined instances of StyleMap's:

- `darkMode` which uses ContextStyler's adapted to dark-mode terminals.
- `none` which does not perform any styling.

There is a `make` constructor that allows you to define other StyleMap's if you need to. Take a look at the code of the `darkMode` instance to better understand how a StyleMap works. Note that that you can define more entries than there are in the `darkMode` instance. For instance, you could create a NonPrimitiveFormatter that prints the length of the prototypal chain of an object in between pipes before the curly brackets. You could name that part `prototypalChainLength` and add it as an entry in your StyleMap instance. Note that if you refer to an entry that has not been defined in the styleMap, no error will be reported. Instead, the `none` Style will be used (i.e. no styling will be performed).

#### 2) Changing the default marks

We make use of predefined marks when pretty-printing a value. For instance, when we encounter a function `max` to pretty-print, we display it in the following way: `[Function: max]` which, in fact, is the following sucession of marks: MessageStartDelimiter + FunctionNameStartDelimiter + function name + FunctionNameEndDelimiter + MessageEndDelimiter. As you will discover later, that behavior can be altered.

An Option instance has a `markMap` property which, as its name suggests, is a map that associates the name of a mark to a string and a style to use for that mark. For instance, the `FunctionNameStartDelimiter` mark is defined as `{ text: 'Function: ', partName: 'Message' }` meaning that the text 'Function: ' will be used to represent it and that this text will be styled using the `Message` partName style defined in the styleMap.

The MarkMap.ts module defines a single instance named `utilInspectLike`. You can use the make constructor to define your own instances if you need to. For instance, if you wanted the function name to be followed by '()', this is how you would define your own Option instance:

```ts
import { PPMarkMap, PPOption } from "@parischap/pretty-print";
import { HashMap } from "effect";

export const withParentheses: PPOption.Type = PPOption.make({
	...PPOption.utilInspectLike,
	id: "WithParentheses",
	markMap: PPMarkMap.make({
		id: "withParenteses",
		marks: HashMap.set(
			PPMarkMap.utilInspectLike.marks,
			"FunctionNameEndDelimiter",
			{
				text: "()",
				partName: "Message",
			},
		),
	}),
});
```

As for StyleMap's, you can define your own entries in the MarkMap instances you define. And then use these extra entries in the ByPasser's... that you define. Note that if you refer to a mark that is not present in the markMap, an unstyled empty string to represent it.

#### 3) Bypassing some values

There are situations where you want to display an object in a simplified manner. For instance, you may prefer
printing a Date as a string rather than as an object with all its technical properties. This is what the byPassers property of an Option instance is for. This property contains an array of ByPasser's which are successively tried on the value to stringify. If any of the ByPasser's matches (returns a `some` of the representation of that object), the value is by-passed by its reresentation. Otherwise, it will be stringified using the normal stringification process.

The `utilInspectLike` Option instance makes use of the two pre-defined ByPasser instances:

- the `functionToName` ByPasser instance replaces a function object by its function name surrounded by the function delimiters and the message delimiters as defined in the `markMap`.
- the `objectToString` ByPasser instance will replace any non-primitive value which is not an iterable or a function and by the result of calling its toString method provided it is different from Object.prototype.toString. This is how for instance a Date object will be printed as a string (because it defines a .toString method).

You can use the make constructor to define your own ByPasser's if you need to. You can also define your own Option instance with fewer ByPasser's. For instance, this is how you would define an Option instance that displays functions as any other objects (for instance if you want to show some properties of the function object):

```ts
import { PPByPasser, PPOption } from "@parischap/pretty-print";

const noFunctionSpecificity = PPOption.make({
	...PPOption.utilInspectLike,
	id: "WithoutFunctionByPasser",
	byPassers: Array.of(PPByPasser.objectToString),
});
```

#### 4) Changing the look of primitive values

The `primitiveFormatter` property of an Option instance is in charge of formatting primitive values. The way primitive values are displayed is usually quite standard and you will seldom need to change that. There are two things that you might want to customize though:

- the formatting of numbers (with or without thousand separator, number of decimals, decimal separator,...)
- the maximal length of strings beyond which they shall be clipped.

To that extent, the PrimitiveFormatter.ts module defines a constructor `utilInspectLikeMaker` that takes a `maxStringLength` and a `numberFormatter` parameters. For instance the `utilInspectLike` Option instance uses `PPPrimitiveFormatter.utilInspectLikeMaker({ id: 'UtilInspectLike', maxStringLength: 10000, numberFormatter: new Intl.NumberFormat() })` as value for its `primitiveFormatter` property.

The PrimitiveFormatter.ts module also exports a `make` constructor in case you want to define an altogether different `PrimitiveFormatter` instance.

#### 5) Drilling further down into a non-primitive value

The `maxDepth` property of an Option instance lets you define how many levels of nested non-primitive values you want to display. 0 means that only the value to stringify is shown, provided it is a primitive. If it is a non-primitive value, it gets replaced by a message string that depends on the type of that non primitive value (e.g. [Object], [Array],...). As you will see further down, the message that gets printed is defined in the `generalNonPrimitiveOption` and `specificNonPrimitiveOption` properties of an Option instance.

#### 6) Customizing the way non-primitive values get displayed

### C) Handling recursivity

This package handles recursivity similarly to the Javascript `util.inspect()` function. For instance:

```ts
import { PPOption, PPStringifiedValue } from "@parischap/pretty-print";
import { pipe } from "effect";

const stringifier = PPOption.toStringifier(
	PPOption.make({ ...PPOption.utilInspectLike, maxDepth: +Infinity }),
);

const circular = {
	a: 1 as unknown,
	b: { inner: 1 as unknown, circular: 1 as unknown },
};
/* eslint-disable functional/immutable-data */
circular.a = [circular];
circular.b.inner = circular.b;
circular.b.circular = circular;
/* eslint-enable functional/immutable-data*/

console.log(pipe(circular, stringifier, PPStringifiedValue.toAnsiString()));
```

=> Output:

![circularity-handling-example](readme-assets/circularity-handling.png?sanitize=true)
