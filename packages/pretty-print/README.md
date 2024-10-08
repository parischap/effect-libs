<div align="center">

# pretty-print

An [Effect](https://effect.website/docs/introduction) library that produces the string representation of any value, in Node or the browser. Similar to util.inspect but with plenty of extra options: **treeifying, coloring, sorting, choosing what to display and how to display it...**

Non-recursive, tested and documented, 100% Typescript, 100% functional, 100% parametrizable.

Can also be used by non-Effect users.

</div>

## Donate

[Any donations would be much appreciated](https://ko-fi.com/parischap). 😄

## Installation

Depending on the package manager you use, run one of the following commands in your terminal:

- **Using npm:**

  ```sh
  npm install effect @parischap/effect-lib @parischap/pretty-print
  ```

- **Using pnpm:**

  ```sh
  pnpm add effect @parischap/effect-lib @parischap/pretty-print
  ```

- **Using yarn:**
  ```sh
  yarn add effect @parischap/effect-lib @parischap/pretty-print
  ```

We use two peerDependencies. If you are not an Effect user, the size may seem important. But, in fact, we use little of each peerDependency. Bundled, tree-shaken, minified, it's only about [18kB](https://bundlephobia.com/package/@parischap/pretty-print). Minified and gzipped, it falls to [4kB](https://bundlephobia.com/package/@parischap/pretty-print)! (source bundlephobia)

## API

After reading this introduction, you may take a look at the [API](https://parischap.github.io/effect-libs/docs/pretty-print) documentation.

## Usage

In this documentation, the term `record` refers to a non-null `object`, an `array` or a `function`.

### 1) Using predefined `Options` instances

The simplest way to use this library is to use one of the predefined `Options` instances.

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

When you don't pass any `Options` instance to the asString function, it uses by default the `uncoloredSplitWhenTotalLengthExceeds40` instance. As its name suggests, this instance will split a record on several lines only when its total printable length exceeds 40 characters.

#### Tabified printing with ANSI colors adapted to a screen in dark mode

```ts
import { Options, Stringify } from "@parischap/pretty-print";

const stringify = Stringify.asString(
	Options.ansiDarkSplitWhenTotalLengthExceeds40,
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

Note how the color of parentheses changes in function of the depth of the nested object. You can change these colors by modifying the property `recordDelimitersColorWheel` of the passed colorSet parameter (see [ColorSet](https://parischap.github.io/effect-libs/pretty-print/ColorSet.ts.html#type-interface)). You could also change altogether the way a record is printed by writing your own [RecordFormatter](https://parischap.github.io/effect-libs/pretty-print/RecordFormatter.ts.html).

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

### 2) Defining your own Options instances

You can view all available options in the [Options](https://parischap.github.io/effect-libs/pretty-print/Options.ts.html#type-interface) model.

You could create your own `Options` instance from scratch. But it is usually easier to start from one of the existing instances and to overwrite the parts you want to change. Most of the time, you will start from the `singleLine` Options instance which is defined in the following manner:

```ts
export const singleLine = (colorSet: ColorSet.Type): Type =>
	_make({
		name: colorSet.name + "SingleLine",
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
		propertyFormatter: PropertyFormatter.recordLike(colorSet),
		recordFormatter: RecordFormatter.singleLine(colorSet),
	});
```

1. Let's see how we would modify it to hide enumerable properties and properties whose key is a string:

```ts
import { PropertyFilter, Options } from "@parischap/pretty-print";
import { pipe } from "effect";

const ansiDarkSingleLineWithSymbolicNonEnums: Options.Type = Options.make({
	...Options.ansiDarkSingleLine,

	propertyFilter: pipe(
		PropertyFilter.removeNonEnumerables,
		PropertyFilter.combine(PropertyFilter.removeStringKeys),
	),
});
```

In this example, we use the [PropertyFilter.combine](https://parischap.github.io/effect-libs/pretty-print/PropertyFilter.ts.html#combine) function to combine the effects of [PropertyFilter.removeNonEnumerables](https://parischap.github.io/effect-libs/pretty-print/PropertyFilter.ts.html#removenonenumerables) and [PropertyFilter.removeStringKeys](https://parischap.github.io/effect-libs/pretty-print/PropertyFilter.ts.html#removenonenumerables). Note that combining order may be important even though it is not in this case.

2. Let's walk through a more complex example. In the following code, we will modify `Options.ansiDarkSingleLine` to show the properties borne by the prototype of an object and see the effect of sorting and deduping:

```ts
import { Options, Stringify, ValueOrder } from "@parischap/pretty-print";
import { Order } from "effect";

const singleLine = Stringify.asString(Options.ansiDarkSingleLine);
const singleLineWithProto = Stringify.asString(
	Options.make({
		...Options.ansiDarkSingleLine,
		maxPrototypeDepth: +Infinity,
	}),
);
const dedupedSingleLineWithProto = Stringify.asString(
	Options.make({
		...Options.ansiDarkSingleLine,
		maxPrototypeDepth: +Infinity,
		propertySortOrder: Order.combine(
			ValueOrder.byStringKey,
			ValueOrder.byPrototypalDepth,
		),
		dedupeRecordProperties: true,
	}),
);

const proto = {
	a: 10,
	c: 20,
};

const toPrint = Object.assign(Object.create(proto), {
	a: 50,
	b: 30,
}) as unknown;

// { a: 50, b: 30 }
console.log(singleLine(toPrint));
// { a: 50, a@: 10, b: 30, c@: 20 }
console.log(singleLineWithProto(toPrint));
// { a@: 10, b: 30, c@: 20 }
console.log(dedupedSingleLineWithProto(toPrint));
```

In this example, the `singleLine` stringifier is the default stringifier. It does not show properties of prototypes.

In the `singleLineWithProto` stringifier, we only add the line `maxPrototypeDepth: +Infinity` to indicate we want to see prototypes of all records to any depth. Note in the result that we now have two `a` properties, of which one is followed by the `@` character to indicate it is borne by the first prototype in the prototypal chain. If it were the second prototype, it would be followed by '@@', ...

Now, it may not be necessary to show these two `a` properties. During execution, the one borne by the prototype will not be used. In the `dedupedSingleLineWithProto` stringifier, we use the [Effect](https://effect.website/docs/introduction) `Order.combine` function to sort our properties first by key (see [ValueOrder.byStringKey](https://parischap.github.io/effect-libs/pretty-print/ValueOrder.ts.html#bystringkey)), then by depth in the proptotypal chain (see [ValueOrder.byPrototypalDepth](https://parischap.github.io/effect-libs/pretty-print/ValueOrder.ts.html#byprototypaldepth)). Then we set [Options.dedupeRecordProperties](https://parischap.github.io/effect-libs/pretty-print/Options.ts.html#type-interface) to keep only the first of several properties with the same name. Now, in the result, we see the `a` property borne by the object itself and the `c` property borne by its prototype.

Note: of course, the mark used to show a property is borne by a prototype (`@` by default) can be altered. If you just want to change the mark or the place where it is printed, you can simply define a new [PropertyMarks](https://parischap.github.io/effect-libs/pretty-print/RecordMarks.ts.html#type-interface) instance and modify with it the [PropertyFormatter](https://parischap.github.io/effect-libs/pretty-print/PropertyFormatter.ts.html) given to the `Options` instance:

```ts
import {
	Stringify,
	PropertyMarks,
	PropertyFormatter,
	ColorSet,
	Options,
} from "@parischap/pretty-print";
// Now, properties on prototypes will be prefixed with `_`
const myPropertyMarks: PropertyMarks.Type = {
	...PropertyMarks.object,
	prototypePrefix: "_",
	prototypeSuffix: "",
};
const myObjectAndArrayLikePropertyFormatter =
	PropertyFormatter.valueForArraysKeyAndValueForOthers(myPropertyMarks);
const mySingleLineWithProtoStringifyer = Stringify.asString({
	...Options.ansiDarkSingleLine,
	maxPrototypeDepth: +Infinity,
	propertyFormatter: myObjectAndArrayLikePropertyFormatter(
		ColorSet.ansiDarkMode,
	),
});
```

But you could also define a completely different [PropertyFormatter](https://parischap.github.io/effect-libs/pretty-print/PropertyFormatter.ts.html).

3. Let's see how to change the [ByPasser](https://parischap.github.io/effect-libs/pretty-print/ByPasser.ts.html) which lets you apply a special treatment for certain values. There are four predefined ByPasser instances. As you can see above, the `singleLine` Options instance uses [ByPasser.objectAsValue](https://parischap.github.io/effect-libs/pretty-print/ByPasser.ts.html#objectAsValue). Let's see what happens on a Date object if we replace it with [ByPasser.objectAsRecord](https://parischap.github.io/effect-libs/pretty-print/ByPasser.ts.html#objectAsRecord):

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

When printed as a record, the string representation of a Date object is an empty string. A Date object is a special object with no properties. Using the `ByPasser.objectAsValue` instance makes more sense in that case!

4. Finally, what if we want to define an uncoloredSplitWhenTotalLengthExceeds50 stringifier instead of the predefined `uncoloredSplitWhenTotalLengthExceeds40`. Well, simply write:

```ts
import { ColorSet, Options, RecordFormatter } from "@parischap/pretty-print";

const splitWhenTotalLengthExceeds50 = (colorSet: ColorSet.Type): Options.Type =>
	Options.make({
		...Options.singleLine(colorSet),
		recordFormatter: RecordFormatter.splitOnTotalLength(40)(colorSet),
	});

const uncoloredSplitWhenTotalLengthExceeds50 = splitWhenTotalLengthExceeds50(
	ColorSet.uncolored,
);
```

We have now covered the most usual use cases. But don't forget you can define your own [ByPasser](https://parischap.github.io/effect-libs/pretty-print/ByPasser.ts.html), [PropertyFilter](https://parischap.github.io/effect-libs/pretty-print/PropertyFilter.ts.html), [PropertyFormatter](https://parischap.github.io/effect-libs/pretty-print/PropertyFormatter.ts.html) and [RecordFormatter](https://parischap.github.io/effect-libs/pretty-print/RecordFormatter.ts.html) if you need something really specific. Use the [API](https://parischap.github.io/effect-libs/docs/pretty-print) documentation to get the best out of this package!

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
	...Options.ansiDarkSplitWhenTotalLengthExceeds40,
	lineSep: newline,
});
```
