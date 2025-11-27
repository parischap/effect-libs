<div align="center">

# pretty-print

An [`Effect`](https://effect.website/docs/introduction) library that produces the string representation of any value, in Node or the browser. Similar to util.inspect but with plenty of extra options: **treeifying, coloring, sorting, choosing what to display and how to display it...**. It supports natively Effect iterables like HashMap, HashSet,...

Non-recursive, tested and documented, optimized for tree-shaking, 100% Typescript, 100% functional, 100% parametrizable.

Can also be used by non-Effect users.

</div>

## Donate

[Any donations would be much appreciated](https://ko-fi.com/parischap) 😄

Please, star my repo if you think it's useful!

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

## Package size and tree-shaking

This is a modern library optimized for tree-shaking. Don't put too much focus on package size: a good part of it will go away at bundling. To give you an idea of how this library will impact the size of your project, [Bundlephobia](https://bundlephobia.com/package/@parischap/pretty-print) announces a size of 7kB once minified and gzipped.

## How to import?

This library supports named imports:

```ts
import { PPOption } from '@parischap/pretty-print';

pipe(3, PPOption.toStringifier(PPOption.darkModeUtilInspectLike), console.log);
```

and namespace imports:

```ts
import * as PPOption from '@parischap/pretty-print/PPStringifiedValue';

pipe(3, PPOption.toStringifier(PPOption.darkModeUtilInspectLike), console.log);
```

In this documentation, we'll use the first option. But if you value tree-shaking, you should use the second unless you use a bundler that implements deep scope analysis as for instance rollup, vite, webpack 5+.

## API

After reading this introduction, you may take a look at the [API](https://parischap.github.io/effect-libs/docs/pretty-print) documentation.

## Upgrading

Version 0.3.0 introduced many improvements and breaking changes. we apologize for any inconvenience caused and appreciate your understanding.

## Usage

Note that, throughout this document, the term `non-primitive value` refers to a value that is not a Javascript primitive. So it can represent javascript functions or non-null javascript objects (which of course include arrays).

### A) Using predefined `Option` instances

For a start, you can use one of the 6 predefined `Option` instances.

<a id="code_example"></a>

```ts
import { PPOption, PPStringifiedValue } from '@parischap/pretty-print';
import { HashMap, pipe } from 'effect';

const stringifier = PPOption.toStringifier(PPOption.darkModeUtilInspectLike);

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

console.log(pipe(toPrint, stringifier, PPStringifiedValue.toAnsiString()));
```

=> Output:

![util-inspect-like-example](readme-assets/util-inspect-like.png?sanitize=true)

In the previous example, we used the `darkModeUtilInspectLike` Option instance. As its name suggests, it pretty-prints values in a way very similar to the Javascript `util.inspect()` function using colors adapted to a dark-mode terminal (which is almost always the case). But if you don't need coloring, you can simply use the `utilInspectLike` Option instance instead. Do note how the Effect HashMap gets directly printed without any particular effort.

The remaining 4 predefined Option instances are all related to treeifying. For instance:

```ts
import { PPOption, PPStringifiedValue } from '@parischap/pretty-print';
import { HashMap, pipe } from 'effect';

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
  B: HashMap.make(['B1', null], ['B2', null]),
};

console.log(pipe(toPrint, stringifier, PPStringifiedValue.toAnsiString()));
```

=> Output:

![treeify-example](readme-assets/treeify.png?sanitize=true)

Again, do note how an array and an Effect HashMap get directly treeified without any particular effort.
As you have guessed, the `treeifyHideLeaves` Option instance does the same without coloring. And the treeify and darkModeTreeify Option instances also treeify without hiding the leaves (the `null` values in the previous example). Here's a simple example:

```ts
import { PPOption, PPStringifiedValue } from '@parischap/pretty-print';
import { pipe } from 'effect';

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

You can find a detailed description of the Option object in the [API](https://parischap.github.io/effect-libs/pretty-print/Option.ts.html#type-interface-3) documentation. As you will see, an Option instance has an id property. This id will be displayed instead of all the properties of the Option instance when logging to the console. Although it will have no execution impact, try to use meaningful ids to simplify debugging!

#### 1) Applying your own styles and colors

If you are not interested in going too deep into details, just remember that you need to use the `styleMap` property of the Option object to define the colors that the pretty-printer will use. For instance, this is how you could define the `darkModeUtilInspectLike` Option instance from the `utilInspectLike` Option instance if it didn't already exist:

```ts
import { PPOption, PPStyleMap } from '@parischap/pretty-print';

export const darkModeUtilInspectLike: PPOption.Type = PPOption.make({
  ...PPOption.utilInspectLike,
  id: 'DarkModeUtilInspectLike',
  styleMap: PPStyleMap.darkMode,
});
```

Just passing `PPStyleMap.darkMode` to the `styleMap` property does the trick. Inversely, you can suppress all colors from a colored Option instance by passing `PPStyleMap.none` to the `styleMap` property.

This package uses the [@parischap/ansi-styles](https://www.npmjs.com/package/@parischap/ansi-styles) package to apply styles to a stringified value. Please refer to the documentation of that package if you intend to define your own coloring options.

An Option instance has a `styleMap` property which, as its name suggests, is a map that associates the name of the part of a stringified value (e.g. the key/value separator when pretty-printing a non-primitive value,...) to a `ValueBasedStyler` which is nothing but an alias for a `ContextStyler` (see [@parischap/ansi-styles](https://parischap.github.io/effect-libs/ansi-styles/ContextStyler.ts.html)) whose Context object is a `Value` (see [Value.ts](https://parischap.github.io/effect-libs/pretty-print/Value.ts.html)).

A `Value` is an object that contains a value to pretty-print and contextual information about that value (its depth in the initial value to pretty-print, its depth in the prototypal chain of the object it belongs to, its type, the type of its key if it belongs to a non-primitive value...). For instance, in the object `{a:3, b:{d:5, c:6}}`, the value 3 has a depth of 1 and the values 5 and 6 a depth of 2. The [ValueBasedStyler.ts](https://parischap.github.io/effect-libs/pretty-print/ValueBasedStyler.ts.html) module defines three constructors:

- `makeDepthIndexed`: this constructor builds a ContextStyler that will use the `depth` property of the Value object it receives to choose which style to apply. This is for instance useful to style the curly-brackets that surround a non-primitive value when we want to use a different color at different depths.
- `makeTypeIndexed`: this constructor builds a ContextStyler that will use the `contentType` property of the Value object it receives to choose which style to apply. This is for instance useful to style different types of values in different colors (e.g. green for strings, cyan for symbols,...).
- `makeKeyTypeIndexed`: this constructor builds a ContextStyler that will use the `hasSymbolicKey` property of the Value object it receives to choose which style to apply. This is for instance useful to style symbolic property keys in cyan and string property keys in red.

Of course, you may create any other constructors that suit your needs and use them in your own StyleMap instances.

As already discussed, there are two predefined instances of StyleMap's:

- `darkMode` which uses ContextStyler's adapted to dark-mode terminals.
- `none` which does not perform any styling.

There is a `make` constructor that allows you to define other StyleMap's if you need to. Take a look at the code of the `darkMode` instance to better understand how a StyleMap works. Note that you can define more entries (called `partName`) than there are in the `darkMode` instance. For instance, you could create a `NonPrimitiveFormatter` that prints the length of the prototypal chain of an object in between pipes before the curly brackets. You could name that part `prototypalChainLength` and add it as an entry in your StyleMap instance. Note that if you refer to a `partName` that has not been defined in the styleMap, no error will be reported. Instead, the `none` Style will be used (i.e. no styling will be applied).

#### 2) Changing the default marks

We make use of predefined marks when pretty-printing a value. For instance, when we encounter a function `max` to pretty-print, we display it in the following way: `[Function: max]` which, in fact, is the following succession of marks: MessageStartDelimiter + FunctionNameStartDelimiter + function name + FunctionNameEndDelimiter + MessageEndDelimiter. As you will discover later, that behavior can be altered.

An Option instance has a `markMap` property which, as its name suggests, is a map that associates the name of a mark to a string and a style to use for that mark. For instance, the `FunctionNameStartDelimiter` mark is defined as `{ text: 'Function: ', partName: 'Message' }` meaning that the text 'Function: ' will be used to represent it and that this text will be styled using the `ValueBasedFormatter` associated to the `Message` partName in the styleMap.

The [MarkMap.ts](https://parischap.github.io/effect-libs/pretty-print/MarkMap.ts.html) module defines a single instance named `utilInspectLike`. You can use the make constructor to define your own instances if you need to. For instance, if you wanted the function name to be followed by '()', this is how you would define your own Option instance:

```ts
import { PPMarkMap, PPOption } from '@parischap/pretty-print';
import { HashMap } from 'effect';

export const withParentheses: PPOption.Type = PPOption.make({
  ...PPOption.utilInspectLike,
  id: 'WithParentheses',
  markMap: PPMarkMap.make({
    id: 'withParenteses',
    marks: HashMap.set(PPMarkMap.utilInspectLike.marks, 'FunctionNameEndDelimiter', {
      text: '()',
      partName: 'Message',
    }),
  }),
});
```

Similarly to StyleMap's, you can define your own entries in the MarkMap instances you define. And then use these extra entries in the ByPasser's... that you define. Note that if you refer to a mark that is not present in the markMap, an unstyled empty string will be used to represent it.

#### 3) Bypassing some values

There are situations where you want to display a non-primitive value in a simplified manner. For instance, you may prefer
printing a Date as a string rather than as an object with all its technical properties. This is what the byPassers property of an Option instance is for. This property contains an array of ByPasser's (see [ByPasser.ts](https://parischap.github.io/effect-libs/pretty-print/ByPasser.ts.html)) which are successively tried on the value to stringify. If any of the ByPasser's matches (returns a `some` of the representation of that non-primitive value), the value is by-passed by the returned representation. Otherwise, it will be stringified using the normal stringification process.

The `utilInspectLike` Option instance makes use of the two pre-defined ByPasser instances:

- the `functionToName` ByPasser instance replaces a function object by its function name preceded by the `MessageStartDelimiter` and `FunctionStartDelimiter` and followed by the `FunctionEndDelimiter` and `MessageEndDelimiter` as they are defined in the `markMap`.
- the `objectToString` ByPasser instance will replace any non-primitive value which is not an iterable or a function by the result of calling its toString method provided it defines one different from Object.prototype.toString. This ByPasser for instance works well with Javascript Date objects (because they define a .toString method).

You can use the make constructor to define your own ByPasser's if you need to. You can also define your own Option instance with fewer ByPasser's. For instance, this is how you would define an Option instance that displays functions as any other non-primitive value (for instance if you want to show some properties of the function object):

```ts
import { PPByPasser, PPOption } from '@parischap/pretty-print';

export const withoutFunctionByPasser = PPOption.make({
  ...PPOption.utilInspectLike,
  id: 'WithoutFunctionByPasser',
  byPassers: Array.of(PPByPasser.objectToString),
});
```

#### 4) Changing the look of primitive values

The `primitiveFormatter` property of an Option instance is in charge of formatting primitive values. The way primitive values are displayed is usually quite standard and you will seldom need to change that. There are two things that you might want to customize though:

- the formatting of numbers (with or without thousand separator, number of decimals, decimal separator,...)
- the maximal length of strings beyond which they shall be clipped.

To that extent, the [PrimitiveFormatter.ts](https://parischap.github.io/effect-libs/pretty-print/PrimitiveFormatter.ts.html) module defines a constructor `utilInspectLikeMaker` that takes two parameters: `maxStringLength` and `numberFormatter`. For example the `utilInspectLike` Option instance uses `PPPrimitiveFormatter.utilInspectLikeMaker({ id: 'UtilInspectLike', maxStringLength: 10000, numberFormatter: new Intl.NumberFormat() })` as value for its `primitiveFormatter` property.

There is also a `make` constructor in case you want to define an altogether different `PrimitiveFormatter` instance.

#### 5) Drilling further down into a non-primitive value

The `maxDepth` property of an Option instance lets you define how many levels of nested non-primitive values you want to display. 0 means that only the value to stringify is shown, provided it is a primitive. If it is a non-primitive value, it gets replaced by a message string that depends on the type of that non-primitive value (e.g. [Object], [Array],...). As you will see further down, the message that gets printed for a particular non-primitive value is defined in the `generalNonPrimitiveOption` and `specificNonPrimitiveOption` properties of an Option instance.

The `utilInspectLike` Option instance uses 2 for its `maxDepth` property.

#### 6) Customizing the way non-primitive values get displayed

The `generalNonPrimitiveOption` property of an Option instance is an object of type Option.NonPrimitive which contains a set of options that apply to all non-primitive values except those for which the function defined by the `specificNonPrimitiveOption` property returns a `Some<Option.NonPrimitive>` that will take precedence. So the `generalNonPrimitiveOption` property defines the non-primitive value options by default and the `specificNonPrimitiveOption` define options for specific type of non-primitive values like arrays, maps, sets,...

For example, the `utilInspectLike` Option instance defines a `generalNonPrimitiveOption` property with all the usual defaults used when printing a record (curly brackets,...). These defaults are overridden for arrays, TypedArray's, maps, sets, HashMaps, HashSets,... in the `specificNonPrimitiveOption` property.

You can see the documentation of all the properties of an Option.NonPrimitive in the [API](https://parischap.github.io/effect-libs/pretty-print/Option.ts.html#type-interface) documentation. The documentation of most pf he properties of an Option.NonPrimitive is rather clear. We will only cover here the most complex aspects.

##### i) Specifying the source of the properties

This package offers three ways of extracting the properties of a non-primitive value:

- Properties are obtained by calling Reflect.ownKeys on the non-primitive-value and its prototypes (until maxPrototypeDepth is reached). This is usually a good choice for records
- Properties are obtained by iterating over the non-primitive-value that must implement the Iterable protocol. Each value returned by the iterator is used to create a property with an auto-incremented numerical key (converted to a string). This is usually a good choice for arrays and sets.
- Properties are obtained by iterating over the non-primitive-value that must implement the Iterable protocol. The iterator must return a key/value pair. Otherwise, the returned value is ignored. This is usually a good choice for maps,...

##### ii) Filtering out properties

You can use the `propertyFilters` property to specify a list of filters to apply to the retrieved list of properties of a non-primitive value. The [PropertyFilter.ts](https://parischap.github.io/effect-libs/pretty-print/PropertyFilter.ts.html) module defines several instances that you can combine to reach the desired behavior. For example, the `utilInspectLike` Option instance uses `PPPropertyFilter.removeNonEnumerables` to remove all non-enumerable properties. There is a make constructor if you want to define more elaborate filters.

##### iii) Sorting properties

You can use the `propertySortOrder` property to sort the retrieved properties after filtering. The `utilInspectLike` Option instance does not apply any sorting. But you can easily pass one of the instances defined in the [ValueOrder.ts](https://parischap.github.io/effect-libs/pretty-print/ValueOrder.ts.html) module. You can also use the Effect Order module to combine the predefined instances into more elaborate Order's.

##### iv) Combining the stringified representation of the key and the stringified representation of the value of a property

You can use the `propertyFormatter` property to specify how to combine the stringified representation of the key and the stringified representation of the value of a property. The [PropertyFormatter.ts](https://parischap.github.io/effect-libs/pretty-print/PropertyFormatter.ts.html) module defines several instances which should cover most situations:

- `valueOnly` instance: as its name suggests, this instance ignores the stringified representation of the key. This is useful for arraylikes for which dsiplaying a numerical auto-incremented key brings no valuable information.
- `keyAndValue` instance: the last line of the stringified representation of the key and the first line of the stringified representation of the value are merged and separated by the keyValueSeparator. That's the usual way a record is displayed (e.g. 'a: 1').
- `treeify` instance: for a leaf: does the same as `keyAndValue`; for a non-leaf: appends the lines of the stringified representation of the value to the lines of the stringified representation of the key without any separator.
- `treeifyHideLeafValues` instance: for a leaf: prints only the stringified representation of the key; for a non-leaf: does the same as `treeify`.

But it also ships a `make` constructor in case you have some very specific needs.

##### v) Combining the stringified representations of all the properties: non-prilitive value marks, single-line vs multi-line output

You can use the `nonPrimitiveFormatter` property to specify how to combine the stringified representations of all the properties of a non-primitive value. A `NonPrimitiveFormatter` is in charge of adding marks that symbolize the type of the non-primitive value (e.g. curly brackets for records, square brackets for arrays,...), of adding a mark to seperate the stringified representation of all the properties (usually a comma or nothing when treeifying), and of splitting or not the result on several lines.

The [NonPrimitiveFormatter.ts](https://parischap.github.io/effect-libs/pretty-print/NonPrimitiveFormatter.ts.html) module defines several instances which should cover most situations:

- `singleLine` instance: this instance joins the stringified representation of all the properties in a single-line after adding separators and the marks that symbolize that non-primitive value.
- `tabify` instance: this instance concatenates the stringified representation of all the properties after adding tabs, separators and the marks that symbolize that non-primitive value.
- `treeify` instance: this instance concatenates the stringified representation of all the properties after adding tree marks.
- `splitOnConstituentNumberMaker` constructor: calls `singleLine` when the number of properties is inferior to the passed parameter; calls `tabify` otherwise.
- `splitOnLongestPropLengthMaker` constructor: calls `singleLine` when the length of the stringified representation of the longest property is inferior to the passed parameter; calls `tabify` otherwise.
- `splitOnTotalLengthMaker` constructor: calls `singleLine` when the length of the stringified representation of the whole non-primitive value printed on a single line is inferior to the passed parameter; calls `tabify` otherwise.

But it also ships a `make` constructor in case you have some very specific needs.

### C) Handling recursivity

This package handles recursivity similarly to the Javascript `util.inspect()` function. For instance:

```ts
import { PPOption, PPStringifiedValue } from '@parischap/pretty-print';
import { pipe } from 'effect';

const stringifier = PPOption.toStringifier(
  PPOption.make({ ...PPOption.utilInspectLike, maxDepth: +Infinity }),
);

const circular = {
  a: 1 as unknown,
  b: { inner: 1 as unknown, circular: 1 as unknown },
};

circular.a = [circular];
circular.b.inner = circular.b;
circular.b.circular = circular;

console.log(pipe(circular, stringifier, PPStringifiedValue.toAnsiString()));
```

=> Output:

![circularity-handling-example](readme-assets/circularity-handling.png?sanitize=true)
