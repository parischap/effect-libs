<!-- LTeX: language=en-US -->
<div align="center">

# conversions

An [`Effect`](https://effect.website/docs/introduction) library to partially replace the native JavaScript INTL API.

Non-machine-dependent, safe, bidirectional (implements parsing and formatting), tested, documented, with lots of examples, optimized for tree-shaking, 100% Typescript, 100% functional.

Can also come in handy to non-Effect users.

</div>

## Table of Contents

- [Donate](#donate)
- [Installation](#installation)
- [Package size and tree-shaking](#package-size-and-tree-shaking)
- [How to import?](#how-to-import)
- [API](#api)
- [Upgrading](#upgrading)
- [In this package](#in-this-package)
- [Branding](#branding)
  - [Introduction](#1-introduction)
  - [Usage example](#2-usage-example)
- [Rounding](#rounding)
  - [Usage example](#1-usage-example)
  - [`CVRounderParams` instances](#3-cvrounderparams-instances)
  - [Debugging and equality](#4-debugging-and-equality)
- [Number parser / formatter](#number-parser--formatter)
  - [Usage example](#1-usage-example-1)
  - [`CVNumberBase10Format` instances](#2-cvnumberbase10format-instances)
  - [`CVNumberBase10Format` instance modifiers](#3-cvnumberbase10format-instance-modifiers)
  - [`CVNumberBase10Format` in more details](#4-cvnumberbase10format-in-more-details)
  - [Debugging and equality](#5-debugging-and-equality)
- [Templating](#templating)
  - [Usage example](#1-usage-example-2)
  - [Definitions](#2-definitions)
  - [`CVTemplateSeparator`'s](#3-cvtemplateseparators)
  - [`CVTemplatePlaceholder`'s](#4-cvtemplateplaceholders)
  - [A more complex example](#5-a-more-complex-example)
  - [Debugging](#6-debugging)
- [DateTime](#datetime)
  - [Introduction](#1-introduction-1)
  - [Usage example](#2-usage-example-1)
- [DateTime formatter](#datetime-formatter)
  - [Usage example](#1-usage-example-3)
  - [Available tokens](#2-available-tokens)
  - [`CVDateTimeFormatContext`](#3-cvdatetimeformatcontext)
  - [Debugging](#4-debugging)

## Donate

[Any donations would be much appreciated](https://ko-fi.com/parischap) 😄

Please, star my repo if you think it's useful!

## Installation

Depending on the package manager you use, run one of the following commands in your terminal:

- **Using npm:**

  ```sh
  npm install effect @parischap/effect-lib @parischap/conversions
  ```

- **Using pnpm:**

  ```sh
  pnpm add effect @parischap/effect-lib @parischap/conversions
  ```

- **Using yarn:**
  ```sh
  yarn add effect @parischap/effect-lib @parischap/conversions
  ```

## Package size and tree-shaking

This is a modern library optimized for tree-shaking. Don't put too much focus on package size: a good part of it will go away at bundling. To give you an idea of how this library will impact the size of your project, [Bundlephobia](https://bundlephobia.com/package/@parischap/conversions) announces a size of 15kB once minified and gzipped.

## How to import?

This library supports named imports:

```ts
import { CVRounder, CVRounderParams } from '@parischap/conversions';

console.log(CVRounder.number(CVRounderParams.halfExpand2));
```

and namespace imports:

```ts
import * as CVRounder from '@parischap/conversions/CVRounder';
import * as CVRounderParams from '@parischap/conversions/CVRounderParams';

console.log(CVRounder.number(CVRounderParams.halfExpand2));
```

In this documentation, we'll use the second option. You should do the same if you value tree-shaking.

## API

After reading this introduction, you may take a look at the [API](https://parischap.github.io/effect-libs/docs/conversions) documentation.

## Upgrading

Version 0.4.0 updated to Effect 4.0.0-beta.35. The main breaking changes are:

- `Schema.decodeEither` and `Schema.encodeEither` have been renamed to `Schema.decodeExit` and `Schema.encodeExit`
- `DateTime.unsafeMakeZoned` has been renamed to `DateTime.makeZonedUnsafe`
- `BigDecimal.unsafeDivide` has been renamed to `BigDecimal.divideUnsafe`

## In this package

This package contains:

- A [module to round numbers and BigDecimal's](#rounding) with the same rounding options as those offered by the JavaScript INTL API: Ceil, Floor, Expand, Trunc, HalfCeil...
- A safe, easy-to-use [number/BigDecimal parser/formatter](#number-parser--formatter) with almost all the options offered by the JavaScript INTL API: choice of the thousand separator, of the fractional separator, of the minimum and maximum number of fractional digits, of the rounding option, of the sign display mode, of whether to show or not the integer part when it's zero, of whether to use a scientific or engineering notation, of the character to use as exponent mark... It can also be used as a `Schema` instead of the `Effect.Schema.NumberFromString` transformer.
- An equivalent to the PHP [sprintf and sscanf functions](#templating) with real typing of the placeholders. Although `Effect.Schema` does offer the [`TemplateLiteralParser` API](https://effect.website/docs/schema/basic-usage/#templateliteralparser), the latter does not provide a solution to situations such as fixed length fields (potentially padded), numbers formatted otherwise than in the English format... This module can also be used as a `Schema`.
- A very easy to use [DateTime module](#datetime) that implements natively the ISO calendar (ISO year and ISO week). It is also faster than its `Effect` counterpart as it implements an internal state that's only used to speed up calculation times (but does not alter the result of functions; so `CVDateTime` functions can be viewed as pure from a user's perspective). It can therefore be useful in applications where time is of essence.
- A [DateTime parser/formatter](#datetime-formatter) which supports many of the available [Unicode tokens](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table). It can also be used as a `Schema` instead of the `Effect.Schema.Date` transformer.
- A few [brands](#branding) which come in handy in many projects such as email, semantic versioning, integer numbers, positive integer numbers, real numbers and positive real numbers. All these brands are also defined as `Schema`'s. Please read the [`Effect` documentation about Branding](https://effect.website/docs/code-style/branded-types/) if you are not familiar with this concept

Most functions of this package return a `Result` or an `Option` to signify the possibility of an error. However, if you are not an `Effect` user and do not care to learn more about it, you can simply use the `OrThrow` variant of the function. For instance, use `CVDateTime.setWeekdayOrThrow` instead of `CVDateTime.setWeekday`. As its name suggests, it will throw in case of failure.

## Branding

A few brands which come in handy in many projects such as email, semantic versioning, integer numbers, positive integer numbers, real numbers and positive real numbers. All these brands are also defined as `Schema`'s. Please read the [`Effect` documentation about Branding](https://effect.website/docs/code-style/branded-types/) if you are not familiar with this concept.

### 1. Introduction

In this package you will find the following [`Brand`'s](https://effect.website/docs/code-style/branded-types/):

- `CVEmail`: represents a valid email string
- `CVSemVer`: represents a valid semantic versioning string
- number: represents a valid floating-point number (+Infinity, Infinity, -Infinity, NaN not allowed). Can be used to represent a temperature, a height from sea-level,...
- `CVPositiveReal`: same as number but the number must be positive. Can be used to represent a price, a speed, ...
- `CVInteger`: same as number but the number must be an integer. Can be used to represent a floor in a lift, a signed quantity, ...
- `CVPositiveInteger`: same as `CVInteger` but the number must be positive. Can be used to represent an age, a quantity, ...

You will also find all the functions to convert from one brand to another. Do not hesitate to take a look at the [API](https://parischap.github.io/effect-libs/docs/conversions) to learn more about what this module offers in terms of branding.

### 2. Usage example

```ts
import { CVEmail } from '@parischap/conversions';

/** Let's try to create a CVEmail from a string that represents a valid email */
// Result: { _id: 'Result', _tag: 'Success', success: 'foo@bar.baz' }
console.log(CVEmail.fromString('foo@bar.baz'));

/** Let's try to create a CVEmail from a string that does not represents a valid email */
// Result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: [ { message: "'foo' does not represent a email", meta: undefined } ]
// }
console.log(CVEmail.fromString('foo'));

/**
 * Thanks to Typescript type-checking, whenever we use a variable of type CVEmail, we know for sure
 * it represents a valid email. Unless we force a string that does not represent an email into a
 * CVEmail. But the name of the function makes it clear that we are in danger zone and should know
 * what we are doing.
 */

// Result: 'foo'
console.log(CVEmail.unsafeFromString('foo'));
```

## Rounding

A module to round numbers and [BigDecimal](https://effect.website/docs/data-types/bigdecimal/)'s with the same rounding options as those offered by the JavaScript INTL namespace: Ceil, Floor, Expand, Trunc, HalfCeil...

### 1. Usage example

```ts
import * as CVRounder from '@parischap/conversions/CVRounder';
import * as CVRounderParams from '@parischap/conversions/CVRounderParams';
import * as CVRoundingOption from '@parischap/conversions/CVRoundingOption';
import * as BigDecimal from 'effect/BigDecimal';

// Here we define the parameters of the rounder:
// the result must have three fractional digits using the HalfEven rounding mode
const rounderParams = CVRounderParams.make({
  precision: 3,
  roundingOption: CVRoundingOption.Type.HalfEven,
});

// Let's define a number rounder from our parameters. Type: (value:number) => number
const numberRounder = CVRounder.number(rounderParams);
// Let's define a BigDecimal rounder from our parameters. Type: (value:BigDecimal) => BigDecimal
const bigDecimalRounder = CVRounder.bigDecimal(rounderParams);

/** Positive numbers with even last significant digit */
// Result: 12.457
console.log(numberRounder(12.4566));

// Result: 12.456
console.log(numberRounder(12.4565));

// Result: 12.456
console.log(numberRounder(12.4564));

/** Positive numbers with odd last significant digit */
// Result: 12.458
console.log(numberRounder(12.4576));

// Result: 12.458
console.log(numberRounder(12.4575));

// Result: 12.457
console.log(numberRounder(12.4574));

/** Negative numbers with even last significant digit */
// Result: -12.457
console.log(numberRounder(-12.4566));

// Result: -12.456
console.log(numberRounder(-12.4565));

// Result: -12.456
console.log(numberRounder(-12.4564));

/** Negative numbers with odd last significant digit */
// Result: -12.458
console.log(numberRounder(-12.4576));

// Result: -12.458
console.log(numberRounder(-12.4575));

// Result: -12.457
console.log(numberRounder(-12.4574));

// Result: -12.450000000000001 (javascript number loss of accuracy)
console.log(numberRounder(-12.45));

/** Diverse BigDecimal numbers */
// Result: BigDecimal.make(12457n, 3)
console.log(bigDecimalRounder(BigDecimal.make(124_566n, 4)));

// Result: BigDecimal.make(-12456n, 3)
console.log(bigDecimalRounder(BigDecimal.make(-124_565n, 4)));

// Result: BigDecimal.make(12450n, 3)
console.log(bigDecimalRounder(BigDecimal.make(1245n, 2)));
```

### 3. `CVRounderParams` instances

Instead of building your own `CVRounderParams`, you can use the `halfExpand2` `CVRounderParams` instance (`HalfExpand` rounding option with a precision of two fractional digits). It will come in handy in accounting apps of most countries. For example:

```ts
import * as CVRounder from '@parischap/conversions/CVRounder';
import * as CVRounderParams from '@parischap/conversions/CVRounderParams';

// Let's define a number rounder from halfExpand2. Type: (value:number) => number
const numberRounder = CVRounder.number(CVRounderParams.halfExpand2);

/** Positive number */
// Result: 12.456
console.log(numberRounder(12.46));

/** Negative number */
// Result: -12.46
console.log(numberRounder(-12.457));
```

### 4. Debugging and equality

`CVRoundingOption` objects implement `Effect` equivalence and equality based on equivalence and equality of the `precision` and `roundingOption` properties. They also implement a `.toString()` method. For instance:

```ts
import * as CVRounderParams from '@parischap/conversions/CVRounderParams';
import * as CVRoundingOption from '@parischap/conversions/CVRoundingOption';
import * as Equal from 'effect/Equal';

// Result: 'HalfExpandRounderWith2Precision'
console.log(CVRounderParams.halfExpand2);

const dummyOption1 = CVRounderParams.make({
  precision: 3,
  roundingOption: CVRoundingOption.Type.HalfEven,
});

const dummyOption2 = CVRounderParams.make({
  precision: 2,
  roundingOption: CVRoundingOption.Type.HalfExpand,
});

// Result: false
console.log(Equal.equals(CVRounderParams.halfExpand2, dummyOption1));

// Result: true
console.log(Equal.equals(CVRounderParams.halfExpand2, dummyOption2));
```

## Number parser / formatter

A safe, easy-to-use number/BigDecimal parser/formatter with almost all the options offered by the JavaScript INTL namespace: choice of the thousand separator, of the fractional separator, of the minimum and maximum number of fractional digits, of the rounding mode, of the sign display mode, of whether to show or not the integer part when it's zero, of whether to use a scientific or engineering notation, of the character to use as exponent mark... It can also be used as a `Schema` instead of the `Effect.Schema.NumberFromString` transformer.

### 1. Usage example

```ts
import { pipe } from 'effect';

import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVNumberBase10Formatter from '@parischap/conversions/CVNumberBase10Formatter';
import * as CVNumberBase10Parser from '@parischap/conversions/CVNumberBase10Parser';
import * as CVSchema from '@parischap/conversions/CVSchema';

import * as Schema from 'effect/Schema';

// Let's define some formats
const { ukStyleUngroupedNumber } = CVNumberBase10Format;
const ukStyleNumberWithEngineeringNotation = pipe(
  CVNumberBase10Format.ukStyleNumber,
  CVNumberBase10Format.withEngineeringScientificNotation,
);

const { frenchStyleInteger } = CVNumberBase10Format;

// Let's define a formatter
// Type: (value: BigDecimal | number) => string
const ukStyleWithEngineeringNotationFormatter = pipe(
  ukStyleNumberWithEngineeringNotation,
  CVNumberBase10Formatter.fromFormat,
  CVNumberBase10Formatter.format,
);

// Let's define a parser
// Type: (value: string ) => Option.Option<number>
const ungroupedUkStyleParser = pipe(
  ukStyleUngroupedNumber,
  CVNumberBase10Parser.fromFormat,
  CVNumberBase10Parser.parseAsNumber,
);

// Let's define a parser that throws for non Effect users
// Type: (value: string ) => number
const throwingParser = pipe(
  ukStyleUngroupedNumber,
  CVNumberBase10Parser.fromFormat,
  CVNumberBase10Parser.parseAsNumberOrThrow,
);

// Result: '10.341e3'
console.log(ukStyleWithEngineeringNotationFormatter(10_340.548));

// result: { _id: 'Option', _tag: 'Some', value: 10340.548 }
console.log(ungroupedUkStyleParser('10340.548'));

// result: { _id: 'Option', _tag: 'None' }
console.log(ungroupedUkStyleParser('10,340.548'));

// result: 10340.548
console.log(throwingParser('10340.548'));

// Using Schema
const schema = CVSchema.FiniteFromString(frenchStyleInteger);

// Type: (value: string ) => Exit.Exit<number, ParseError>
const frenchStyleDecoder = Schema.decodeExit(schema);

// Type: (value: number ) => Exit.Exit<string, ParseError>
const frenchStyleEncoder = Schema.encodeExit(schema);

// Result: { _id: 'Exit', _tag: 'Success', value: 1024 }
console.log(frenchStyleDecoder('1 024'));

// Error: Failed to convert string to a(n) potentially signed French-style integer
console.log(frenchStyleDecoder('1 024,56'));

// Result: { _id: 'Exit', _tag: 'Success', value: '1 025' }
console.log(frenchStyleEncoder(1024.56));
```

### 2. `CVNumberBase10Format` instances

In the previous example, we used the `ukStyleNumber`, `ukStyleUngroupedNumber` and `frenchStyleInteger` `CVNumberBase10Format` instances.

You will find in the [API](https://parischap.github.io/effect-libs/conversions/NumberBase10Format.ts) the list of all pre-defined instances.

### 3. `CVNumberBase10Format` instance modifiers

Sometimes, you will need to bring some small modifications to a pre-defined `CVNumberBase10Format` instance. For instance, in the previous example, we defined the `ukStyleNumberWithEngineeringNotation` instance by using the `withEngineeringScientificNotation` modifier on the `ukStyleNumber` pre-defined instance.

There are quite a few such modifiers whose list you will find in the [API](https://parischap.github.io/effect-libs/conversions/NumberBase10Format.ts).

### 4. `CVNumberBase10Format` in more details

If you have very specific needs, you can define your own CVNumberBase10Format instance that must comply with the following interface:

```ts
export interface Type {
  /**
   * Thousand separator. Use an empty string for no separator. Usually a string made of at most one
   * character different from `fractionalSeparator`. Will not throw otherwise but unexpected results
   * might occur.
   */
  readonly thousandSeparator: string;

  /**
   * Fractional separator. Usually a one-character string different from `thousandSeparator`. Will
   * not throw otherwise but unexpected results might occur.
   */
  readonly fractionalSeparator: string;

  /**
   * Formatting:
   *
   * - If `true`, numbers with a null integer part are displayed starting with `0`. Otherwise, they
   *   are displayed starting with `.` unless `maximumFractionalDigits===0`, in which case they are
   *   displayed starting with `0`.
   *
   * Parsing
   *
   * - If `true`, conversion will fail for numbers starting with `.` (after an optional sign).
   * - If `false`, conversion will fail for numbers starting with `0.` (after an optional sign).
   */
  readonly showNullIntegerPart: boolean;

  /**
   * If `integerPartPadding` is a `none`, no padding is applied. Otherwise the string
   * representation of the integer part of the mantissa will be padded with `fillChar`'s on the
   * left so that it is `length` characters long (thousand separator included).
   *
   * Formatting: `fillChar`'s are padded until the integer part occupies `length` characters.
   *
   * Parsing: conversion will fail if the integer part does not occupy exactly `length` characters.
   * Any leading `fillChar`'s are stripped.
   */
  readonly integerPartPadding: Option.Option<{
    readonly length: number;
    readonly fillChar: string;
  }>;

  /**
   * Minimim number of digits forming the fractional part of a number. Must be a positive integer
   * (>=0) less than or equal to `maximumFractionalDigits`.
   *
   * Formatting: the string will be right-padded with `0`'s if necessary to respect the condition
   *
   * Parsing: will fail if the input string does not respect this condition (the string must be
   * right-padded with `0`'s to respect the condition if necessary).
   */
  readonly minimumFractionalDigits: number;

  /**
   * Maximum number of digits forming the fractional part of a number. Must be an integer value
   * greater than or equal to `minimumFractionalDigits`. Can take the +Infinity value.
   *
   * Formatting: the number will be rounded using the roundingOption to respect the condition
   * (unless `maximumFractionalDigits` is `+Infinity`).
   *
   * Parsing: will fail if the input string has too many fractional digits.
   */
  readonly maximumFractionalDigits: number;

  /**
   * Possible characters to use to represent e-notation. Usually ['e','E']. Must be an array of
   * one-character strings. Will not throw otherwise but unexpected results will occur. Not used if
   * `scientificNotationOption === None`
   *
   * Formatting: the string at index 0 is used
   *
   * Parsing: the first character of the e-notation must be one of the one-character strings present
   * in the array
   */
  readonly eNotationChars: ReadonlyArray<string>;

  /** Scientific notation options. See CVNumberBase10FormatScientificNotationOption */
  readonly scientificNotationOption: CVNumberBase10FormatScientificNotationOption.Type;

  /** Rounding mode options used when formatting. See CVRoundingOption.ts */
  readonly roundingOption: CVRoundingOption.Type;

  /** Sign display options. See CVNumberBase10FormatSignDisplayOption.ts */
  readonly signDisplayOption: CVNumberBase10FormatSignDisplayOption.Type;
}
```

To build such an instance, you will need to use the `make` constructor. For instance, this is how you could redefine the `frenchStyleNumber` instance:

```ts
export const frenchStyleNumber = CVNumberBase10Format.make({
  thousandSeparator: ' ',
  fractionalSeparator: ',',
  showNullIntegerPart: true,
  integerPartPadding: Option.none(),
  minimumFractionalDigits: 0,
  maximumFractionalDigits: 3,
  eNotationChars: ['e', 'E'],
  scientificNotationOption: CVNumberBase10FormatScientificNotationOption.Type.None,
  roundingOption: CVRoundingOption.Type.HalfExpand,
  signDisplayOption: CVNumberBase10FormatSignDisplayOption.Type.Negative,
});
```

### 5. Debugging and equality

`CVNumberBase10Format` objects implement a `.toString()` method and a `toDescription` destructor.
The `.toString()` method will display the name of the object and all available properties. The `toDescription` destructor will produce a short summary of the format.

For instance:

```ts
import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import { pipe } from 'effect';

// Result:
// {
//   _id: '@parischap/conversions/NumberBase10Format/',
//   thousandSeparator: '',
//   fractionalSeparator: '.',
//   showNullIntegerPart: true,
//   integerPartPadding: { _id: 'Option', _tag: 'None' },
//   minimumFractionalDigits: 0,
//   maximumFractionalDigits: 3,
//   eNotationChars: [ 'e', 'E' ],
//   scientificNotationOption: 0,
//   roundingOption: 6,
//   signDisplayOption: 3
//  }
console.log(CVNumberBase10Format.ukStyleUngroupedNumber);

// Result: 'signed integer'
console.log(
  pipe(
    CVNumberBase10Format.ukStyleUngroupedNumber,
    CVNumberBase10Format.withSignDisplay,
    CVNumberBase10Format.withNDecimals(0),
    CVNumberBase10Format.toDescription,
  ),
);
```

## Templating

An equivalent to the PHP `sprintf` and `sscanf` functions with real typing of the placeholders. Although `Effect.Schema` does offer the [`TemplateLiteralParser` API](https://effect.website/docs/schema/basic-usage/#templateliteralparser), the latter does not provide a solution to situations such as fixed length fields (potentially padded), numbers formatted otherwise than in the English format... This module can also be used as a `Schema`.

### 1. Usage example

```ts
import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVSchema from '@parischap/conversions/CVSchema';
import * as CVTemplate from '@parischap/conversions/CVTemplate';
import * as CVTemplateFormatter from '@parischap/conversions/CVTemplateFormatter';
import * as CVTemplateParser from '@parischap/conversions/CVTemplateParser';
import * as CVTemplatePlaceholder from '@parischap/conversions/CVTemplatePlaceholder';
import * as CVTemplateSeparator from '@parischap/conversions/CVTemplateSeparator';
import * as MRegExpString from '@parischap/effect-lib/MRegExpString';

import * as Schema from 'effect/Schema';

// Let's define useful shortcuts
const ph = CVTemplatePlaceholder;
const sep = CVTemplateSeparator;

// Let's define a template: "#name is a #age-year old #kind."
const template = CVTemplate.make(
  // field named 'name' that must be a non-empty string containing no space characters
  ph.anythingBut({ name: 'name', forbiddenChars: [MRegExpString.space] }),
  // Immutable text
  sep.make(' is a '),
  // Field named 'age' that must represent an unsigned integer
  ph.number({
    name: 'age',
    numberBase10Format: CVNumberBase10Format.unsignedInteger,
  }),
  // Immutable text
  sep.make('-year old '),
  // field named 'kind' that must be a non-empty string containing no dot character
  ph.anythingBut({ name: 'kind', forbiddenChars: ['.'] }),
  // Immutable text
  sep.dot,
);

// Let's define a parser
const parser = CVTemplateParser.fromTemplate(template);

// And now a parse function. See how the return type matches the names and types of the placeholders
// Type: (value: string) => Result.Result<{
//    readonly name: string;
//    readonly age: number;
//    readonly kind: string;
// }, MInputError.Type>
const parse = CVTemplateParser.parse(parser);

// Let's define a parse function that throws for non Effect users.
// Type: (value: string) => {
//    readonly name: string;
//    readonly age: number;
//    readonly kind: string;
// }
const parseOrThrow = CVTemplateParser.parseOrThrow(parser);

// Let's define a formatter
const formatter = CVTemplateFormatter.fromTemplate(template);

// Let's define a format function.
// Type: (value: {
//    readonly name: string;
//    readonly age: number;
//    readonly kind: string;
//   }) => Result.Result<string, MInputError.Type>
const format = CVTemplateFormatter.format(formatter);

// Let's define a formatter that throws for Effect users.
// Type: (value: {
//    readonly name: string;
//    readonly age: number;
//    readonly kind: string;
//   }) => string, MInputError.Type
const formatOrThrow = CVTemplateFormatter.formatOrThrow(formatter);

// Result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: "Expected remaining text for separator at position 2 to start with ' is a '. Actual: ''",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(parse('John'));

// Result: { _id: 'Result', _tag: 'Success', success: { name: 'John', age: 47, kind: 'man' } }
console.log(parse('John is a 47-year old man.'));

// Result: { name: 'John', age: 47, kind: 'man' }
console.log(parseOrThrow('John is a 47-year old man.'));

// Result: { _id: 'Result', _tag: 'Success', success: 'Tom is a 15-year old boy.' }
console.log(
  format({
    name: 'Tom',
    age: 15,
    kind: 'boy',
  }),
);

// Result: 'Tom is a 15-year old boy.'
console.log(
  formatOrThrow({
    name: 'Tom',
    age: 15,
    kind: 'boy',
  }),
);

// Using Schema
const schema = CVSchema.Template(template);

// Type:(i: string) => Exit.Exit<{
//     readonly name: string;
//     readonly age: number;
//     readonly kind: string;
// }, Schema.SchemaError>
const decoder = Schema.decodeExit(schema);

// Type: (a: {
//     readonly name: string;
//     readonly age: number;
//     readonly kind: string;
// }) => Exit.Exit<string, Schema.SchemaError>
const encoder = Schema.encodeExit(schema);

// Result: { _id: 'Exit', _tag: 'Success', value: { name: 'John', age: 47, kind: 'man' } }
console.log(decoder('John is a 47-year old man.'));

// Result: { _id: 'Exit', _tag: 'Success', value: 'Tom is a 15-year old boy.' }
console.log(
  encoder({
    name: 'Tom',
    age: 15,
    kind: 'boy',
  }),
);
```

### 2. Definitions

A template is a model of a text that has always the same structure. In such a text, there are immutable and mutable parts. Let's take the following two texts as an example:

- text1 = "John is a 47-year-old man."
- text2 = "Jenny is a 5-year-old girl."

These two texts obviously share the same structure which is the template:

Placeholder1 is a Placeholder2-year-old Placeholder3.

Placeholder1, Placeholder2 and Placeholder3 are the mutable parts of the template. We call them `CVTemplatePlaceholder`'s.

" is a ", "-year-old " and "." are the immutable parts of the template. We call them `CVTemplateSeperator`'s.

From a text with the above structure, we can extract the values of Placeholder1, Placeholder2, and Placeholder3. In the present case:

- For text1: { Placeholder1 : 'John', Placeholder2 : '47', Placeholder3 : 'man' }
- For text2: { Placeholder1 : 'Jenny', Placeholder2 : '5', Placeholder3 : 'girl'}

Extracting the values of placeholders from a text according to a template is called parsing. The result of parsing is an object whose properties are named after the name of the placeholders they represent.

Inversely, given a template and the values of the placeholders that compose it (provided as the properties of an object), we can generate a text. This is called formatting. In the present case, with the object:

{ Placeholder1 : 'Tom', Placeholder2 : '15', Placeholder3 : 'boy' }

we will obtain the text: "Tom is a 15-year-old boy."

### 3. `CVTemplateSeparator`'s

A `CVTemplateSeparator` represents the immutable part of a template. Upon parsing, we must check that it is present as is in the text. Upon formatting, it must be inserted as is into the text.

To create a `CVTemplateSeparator`, you usually call the `CVTemplateSeparator.make` constructor. However, the `CVTemplateSeparator.ts` module exports a series of predefined `CVTemplateSeparator` instances, such as `CVTemplateSeparator.slash` and `CVTemplateSeparator.space`. You can find the list of all predefined `CVTemplateSeparator` instances in the [API](https://parischap.github.io/effect-libs/conversions/TemplatePart.ts).

### 4. `CVTemplatePlaceholder`'s

A `CVTemplatePlaceholder` represents the mutable part of a template. Each `CVTemplatePlaceholder` defines a parser and a formatter:

- The parser takes a text, consumes a part of that text, optionally converts the consumed part to a value of type T and, if successful, returns a `Success` of that value and of what has not been consumed. In case of failure, it returns a `Failure`.
- The formatter takes a value of type T, converts it to a string (if T is not string), checks that the result is coherent and, if so, inserts that string into the text. Otherwise, it returns a `Failure`.

There are several predefined Placeholder's:

- `fixedLength`: this Placeholder always reads/writes the same number of characters from/into the text.
- `paddedFixedLength`: same as `fixedLength` but the consumed text is trimmed off of a `fillChar` on the left or right and the written text is padded with a `fillChar` on the left or right.
- `number`: this Placeholder parses/formats a number according to the provided `CVNumberBase10Format`. If the format has a fixed length (i.e. the integer part is padded and the fractional digits are fixed), the parser reads exactly that many characters and tries to convert them. Otherwise it reads from the text all the characters that it can interpret as a number in the provided `CVNumberBase10Format`. The formatter converts the number to a string; if the format has a fixed length, it fails when the result does not have the expected length.
- `mappedLiterals`: this Placeholder takes as input a map that must define a bijection between a list of strings and a list of values. The parser tries to read from the text one of the strings in the list. Upon success, it returns the corresponding value. The formatter takes a value and tries to find it in the list. Upon success, it writes the corresponding string into the text.
- `numberMappedLiterals`: same as `mappedLiterals` but values are assumed to be of type number which is the most usual use case.
- `fulfilling`: the parser of this Placeholder reads as much of the text as it can that fulfills the passed regular expression. The formatter only accepts a string that matches the passed regular expression and writes it into the text.
- `anythingBut`: this is a special case of the `fulfilling` `CVTemplatePlaceholder`. The parser reads from the text until it meets one of the `forbiddenChars` passed as parameter (the result must be a non-empty string). The formatter will only accept a non-empty string that does not contain any of the forbidden chars and write it to the text.
- `toEnd`: this is another special case of the `fulfilling` `CVTemplatePlaceholder`. The parser reads all the remaining text. The formatter accepts any string and writes it. This `CVTemplatePlaceholder` should only be used as the last `CVTemplatePart` of a `CVTemplate`.

Each `CVTemplatePlaceholder` must be given a name that will be used as the name of the property of the result object of parsing or of the input object of formatting. This name needs not be unique inside a `CVTemplate`. The same name can appear several times. However, even if there are several `CVTemplatePlaceholder`'s with the same name, there will be only one property with that name. When parsing, this implies that all `CVTemplatePlaceholder`'s with the same name must yield the same value. When formatting, this implies that the value needs only be provided once and will be shared by all `CVTemplatePlaceholder`'s with that name.

If none of these `CVTemplatePlaceholder` instances suits you, you can define you own with the `make` constructor. You will find detailed explanations of the predefined `CVTemplatePlaceholder` instances and of the make constructor in the [API](https://parischap.github.io/effect-libs/conversions/TemplatePart.ts).

### 5. A more complex example

```ts
import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVTemplate from '@parischap/conversions/CVTemplate';
import * as CVTemplateFormatter from '@parischap/conversions/CVTemplateFormatter';
import * as CVTemplateParser from '@parischap/conversions/CVTemplateParser';
import * as CVTemplatePlaceholder from '@parischap/conversions/CVTemplatePlaceholder';
import * as CVTemplateSeparator from '@parischap/conversions/CVTemplateSeparator';

// Let's define useful shortcuts
const placeholder = CVTemplatePlaceholder;
const sep = CVTemplateSeparator;

// Let's define a date template that will look like: 'Today is #weekday, day number #weekday of the week.'
// Note that weekDay appears twice, once as a numberMappedLiterals placeholder, once as a number placeholder.
const template = CVTemplate.make(
  // Separator
  sep.make('Today is '),
  // numberMappedLiterals placeholder
  placeholder.numberMappedLiterals({
    name: 'weekday',
    keyValuePairs: [
      ['Monday', 1],
      ['Tuesday', 2],
      ['Wednesday', 3],
      ['Thursday', 4],
      ['Friday', 5],
      ['Saturday', 6],
      ['Sunday', 7],
    ],
  }),
  // Separator
  sep.make(', day number '),
  // Field named 'weekday' that must represent an unsigned integer
  placeholder.number({ name: 'weekday', numberBase10Format: CVNumberBase10Format.unsignedInteger }),
  // Separator
  sep.make(' of the week.'),
);

// Let's define a parser
const parser = CVTemplateParser.fromTemplate(template);

// Let's define a parse function. Note that there is only one `weekday` property
// Type: (value: string) => Result.Result<{
//    readonly weekday: number;
// }, MInputError.Type>>
const parse = CVTemplateParser.parse(parser);

// Let's define a formatter
const formatter = CVTemplateFormatter.fromTemplate(template);

// Let's define a format function. Note that there is only one `weekday` property
// Type: (value: {
//   readonly weekday: number;
//   }) => Result.Result<string, MInputError.Type>
const format = CVTemplateFormatter.format(formatter);

// Result: { _id: 'Result', _tag: 'Success', success: { weekday: 2 } }
console.log(parse('Today is Tuesday, day number 2 of the week.'));

// Result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: "#weekday is present more than once in template and receives differing values '4' and '2'",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(parse('Today is Thursday, day number 2 of the week.'));

// Result: { _id: 'Result', _tag: 'Success', success: 'Today is Saturday, day number 6 of the week.' }
console.log(format({ weekday: 6 }));

// Result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: '#weekday: expected one of [1, 2, 3, 4, 5, 6, 7]. Actual: 10',
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(format({ weekday: 10 }));
```

### 6. Debugging

`CVTemplate` objects implement a `.toString()` method that displays a synthetic description of the template followed by the description of each contained `CVTemplatePlaceholder`.

For instance:

```ts
import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVTemplate from '@parischap/conversions/CVTemplate';
import * as CVTemplatePlaceholder from '@parischap/conversions/CVTemplatePlaceholder';
import * as CVTemplateSeparator from '@parischap/conversions/CVTemplateSeparator';
import * as MRegExpString from '@parischap/effect-lib/MRegExpString';

// Let's define useful shortcuts
const ph = CVTemplatePlaceholder;
const sep = CVTemplateSeparator;

// Let's define a template: "#name is a #age-year old #kind."
const template = CVTemplate.make(
  // field named 'name' that must be a non-empty string containing no space characters
  ph.anythingBut({ name: 'name', forbiddenChars: [MRegExpString.space] }),
  // Immutable text
  sep.make(' is a '),
  // Field named 'age' that must represent an unsigned integer
  ph.number({
    name: 'age',
    numberBase10Format: CVNumberBase10Format.unsignedInteger,
  }),
  // Immutable text
  sep.make('-year old '),
  // field named 'kind' that must be a non-empty string containing no dot character
  ph.anythingBut({ name: 'kind', forbiddenChars: ['.'] }),
  // Immutable text
  sep.dot,
);

// Result:
// #name is a #age-year old #kind.

// #name: a non-empty string containing non of the following characters: [ \s ].
// #age: unsigned integer.
// #kind: a non-empty string containing non of the following characters: [ . ]
console.log(template);
```

## DateTime

A very easy to use DateTime module that implements natively the ISO calendar (ISO year and ISO week). It is also faster than its `Effect` counterpart as it implements an internal state that's only used to speed up calculation times (but does not alter the result of functions; so `CVDateTime` functions can be viewed as pure from a user's perspective). It can therefore be useful in applications where time is of essence.

### 1. Introduction

This package implements an immutable `CVDateTime` object: once created, the characteristics of a `CVDateTime` object will never change. However, the provided Setters functions allow you to get a copy of an existing `CVDateTime` object with just one characteristic modified.

Although immutable when considered from the outer world, `CVDateTime` objects do keep an internal state that is only used to improve performance (but does not alter results). `CVDateTime` functions can therefore be regarded as pure: they will always yield the same result whatever the state the object is in.

Unlike the JavaScript `Date` objects and the `Effect.DateTime` objects, `CVDateTime` objects handle both the Gregorian and ISO calendars. So you can easily get/set the ISO year and ISO week of a `CVDateTime` object.

A `CVDateTime` object has a `zoneOffset` which is the difference in hours between the time in the local zone and UTC time (e.g. `zoneOffset=1` for timezone +1:00). All the data in a `CVDateTime` object is zoneOffset-dependent, except `timestamp`.

You cannot create a `CVDateTime` object from a string. If you need to, use the `CVDateTimeFormat` module.

### 2. Usage example

```ts
import * as CVDateTime from '@parischap/conversions/CVDateTime';
import { pipe } from 'effect';

/** You can create a CVDateTime from a timestamp and timeZoneOffset expressed in hours */
// Result: '1970-01-01T05:15:00.000+05:15
console.log(CVDateTime.fromTimestampOrThrow(0, 5.25));

/**
 * You can create a CVDateTime from a timestamp and timeZoneOffset expressed in hours, minutes,
 * seconds
 */
// Result: '1970-01-01T05:15:00.000+05:15'
console.log(
  CVDateTime.fromTimestampOrThrow(0, {
    zoneHour: 5,
    zoneMinute: 15,
    zoneSecond: 0,
  }),
);

/**
 * You can create a CVDateTime from a timestamp without specifying a timeZoneOffset. In that case,
 * the timeZoneOffset of the machine the code runs on is applied
 */
// Result: '1970-01-01T02:00:00.000+02:00' (Was run in Paris during summertime)
console.log(CVDateTime.fromTimestampOrThrow(0));

/**
 * You can create a CVDateTime from DateTime.Parts
 *
 * See the documentation of function CVDateTime.fromParts to see when and how default values are
 * calculated if you don't provide enough information.
 *
 * Unlike the native Javascript Date object, you cannot pass out-of-range data (e.g month = 13,
 * monthDay=31 in April,...). If you pass too much information, all provided parameters must be
 * coherent.
 *
 * Let's see some examples
 */

// Result: { _id: 'Result', _tag: 'Success', success: '2025-01-25T00:00:00.765+00:00' }
console.log(
  CVDateTime.fromParts({
    year: 2025,
    month: 1,
    monthDay: 25,
    millisecond: 765,
    zoneOffset: 0,
  }),
);

// Result: { _id: 'Result', _tag: 'Success', success: '2025-12-30T11:00:00.000-12:00' }
console.log(
  CVDateTime.fromParts({
    isoYear: 2026,
    isoWeek: 1,
    weekday: 2,
    hour23: 11,
    zoneOffset: -12,
  }),
);

// Result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: "Expected 'hour11' to be between 0 (included) and 11 (included). Actual: 12",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(
  CVDateTime.fromParts({
    isoYear: 2026,
    isoWeek: 1,
    weekday: 2,
    hour11: 12,
    zoneOffset: -12,
  }),
);

// Result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: "Expected 'monthDay' to be between 1 (included) and 28 (included). Actual: 29",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(CVDateTime.fromParts({ year: 2025, month: 2, monthDay: 29, zoneOffset: 0 }));

// Result: {
// _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: "Expected 'isoWeek' to be: 9. Actual: 5",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(
  CVDateTime.fromParts({
    year: 2025,
    month: 2,
    monthDay: 28,
    isoWeek: 5,
    zoneOffset: 0,
  }),
);

/**
 * Once a CVDateTime is created, you can get any CVDateTime.Parts from it ising the provided
 * getters. Here are a few examples (you can see the whole list of getters in the API).
 */

const aDate = CVDateTime.fromPartsOrThrow({
  year: 1970,
  month: 8,
  monthDay: 31,
  zoneOffset: 0,
});

// Result: '1970'
console.log(CVDateTime.getYear(aDate));

// Result: '36'
console.log(CVDateTime.getIsoWeek(aDate));

// DO NOT DO THIS. It works but is slower because intermediate calculations are not saved
// Result: '1970 36'
console.log(
  CVDateTime.getYear(
    CVDateTime.fromPartsOrThrow({
      year: 1970,
      month: 8,
      monthDay: 31,
      zoneOffset: 0,
    }),
  ),
  CVDateTime.getIsoWeek(
    CVDateTime.fromPartsOrThrow({
      year: 1970,
      month: 8,
      monthDay: 31,
      zoneOffset: 0,
    }),
  ),
);

/**
 * Once a CVDateTime is created, you can modify any CVDateTime.Parts with the provided setters. Do
 * keep in mind that the initial CVDateTime object is unchanged: you get a copy with the modified
 * part. Here are a few examples (you can see the whole list of setters in the API).
 */
// Result: { _id: 'Result', _tag: 'Success', success: '1970-03-01T00:00:00.000+00:00' }
console.log(pipe(aDate, CVDateTime.setMonth(3)));

// result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: 'Month 6 of year 1970 does not have 31 days',
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(pipe(aDate, CVDateTime.setMonth(6)));

// Result: { _id: 'Result', _tag: 'Success', success: '1970-08-31T05:45:00.000+05:45' }
console.log(pipe(aDate, CVDateTime.setZoneOffsetKeepTimestamp(5.75)));

// Result: { _id: 'Result', _tag: 'Success', success: '1970-08-31T00:00:00.000+05:45' }
console.log(pipe(aDate, CVDateTime.setZoneOffsetKeepParts(5.75)));

/**
 * You can also modify the CVDateTime.Parts of an existing CVDateTime object with the provided
 * offsetters. Do keep in mind that the initial CVDateTime object is unchanged: you get a copy with
 * the modified part. Here are a few examples (you can see the whole list of offsetters in the
 * API).
 */
// Result: '1970-01-01T00:00:00.000+00:00'
console.log(pipe(aDate, CVDateTime.toFirstYearDay));

// Result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: 'No February 29th on year 2027 which is not a leap year',
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(
  pipe(
    CVDateTime.fromPartsOrThrow({
      year: 2024,
      month: 2,
      monthDay: 29,
      zoneOffset: 0,
    }),
    CVDateTime.offsetYears(3, false),
  ),
);

// Result: { _id: 'Result', _tag: 'Success', success: '2028-02-29T00:00:00.000+00:00' }
console.log(
  pipe(
    CVDateTime.fromPartsOrThrow({
      year: 2024,
      month: 2,
      monthDay: 29,
      zoneOffset: 0,
    }),
    CVDateTime.offsetYears(4, false),
  ),
);

/** And finally you can use one of the few provided predicates whose list you will find in the API */

// Result: true
console.log(CVDateTime.isLastMonthDay(aDate));

// Result: false
console.log(CVDateTime.isFirstMonthDay(aDate));
```

## DateTime formatter

A DateTime parser/formatter which supports many of the available [Unicode tokens](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table). It can also be used as a `Schema` instead of the `Effect.Schema.Date` transformer.

### 1. Usage example

```ts
import * as CVDateTime from '@parischap/conversions/CVDateTime';
import * as CVDateTimeFormat from '@parischap/conversions/CVDateTimeFormat';
import * as CVDateTimeFormatContext from '@parischap/conversions/CVDateTimeFormatContext';
import * as CVDateTimeFormatPlaceholder from '@parischap/conversions/CVDateTimeFormatPlaceholder';
import * as CVDateTimeFormatSeparator from '@parischap/conversions/CVDateTimeFormatSeparator';
import * as CVDateTimeFormatter from '@parischap/conversions/CVDateTimeFormatter';
import * as CVDateTimeParser from '@parischap/conversions/CVDateTimeParser';
import * as CVSchema from '@parischap/conversions/CVSchema';
import { flow } from 'effect';
import * as DateTime from 'effect/DateTime';
import * as Result from 'effect/Result';
import * as Schema from 'effect/Schema';

// Let's define useful shortcuts
const placeholder = CVDateTimeFormatPlaceholder.make;
const sep = CVDateTimeFormatSeparator;

// Let's define a context
const frenchContext = CVDateTimeFormatContext.fromLocaleOrThrow('fr-FR');

// Let's define a DateTimeFormat: iiii d MMMM yyyy (context-independent)
const frenchFormat = CVDateTimeFormat.make(
  placeholder('iiii'),
  sep.space,
  placeholder('d'),
  sep.space,
  placeholder('MMMM'),
  sep.space,
  placeholder('yyyy'),
);

// Let's define a parser (combines format + context)
const frenchParser = CVDateTimeParser.make({
  dateTimeFormat: frenchFormat,
  context: frenchContext,
});

// Let's define a formatter (combines format + context)
const frenchFormatter = CVDateTimeFormatter.make({
  dateTimeFormat: frenchFormat,
  context: frenchContext,
});

// Let's define a parse function
// Type: (dateString: string) => Result.Result<CVDateTime.Type, MInputError.Type>
const parser = CVDateTimeParser.parse(frenchParser);

// Let's define a format function
// Type: (date: CVDateTime.Type) => Result.Result<string, MInputError.Type>
const formatter = CVDateTimeFormatter.format(frenchFormatter);

// Let's define a parser to Effect.DateTime for Effect users
// Type: (dateString: string) => Result.Result<DateTime.Zoned, MInputError.Type>
const effectParser = flow(parser, Result.map(CVDateTime.toEffectDateTime));

// Let's define a formatter from Effect.DateTime for Effect users
// Type: (date: DateTime.Zoned) => Result.Result<string, MInputError.Type>
const effectFormatter = flow(CVDateTime.fromEffectDateTime, formatter);

// Let's define a parser that returns a Date or throws for non Effect users
// Type: (dateString: string) => Date
const jsParser = flow(CVDateTimeParser.parseOrThrow(frenchParser), CVDateTime.toDate);

// Let's define a formatter that takes a Date and throws for non Effect users
// Type: (date: Date) => string
const jsFormatter = flow(CVDateTime.fromDate, CVDateTimeFormatter.formatOrThrow(frenchFormatter));

// Result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: "Expected remaining text for #weekday to start with one of [lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche]. Actual: '20201210'",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(parser('20201210'));

// Result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: "Expected 'weekday' to be: 4. Actual: 1",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(parser('lundi 4 septembre 2025'));

// Result: { _id: 'Result', _tag: 'Success', success: '2025-09-04T00:00:00.000+02:00' }
console.log(parser('jeudi 4 septembre 2025'));

// Result: { _id: 'Result', _tag: 'Success', success: '2025-09-03T22:00:00.000Z' }
console.log(effectParser('jeudi 4 septembre 2025'));

// Result: '2025-09-03T22:00:00.000Z'
console.log(jsParser('jeudi 4 septembre 2025'));

// Result: { _id: 'Result', _tag: 'Success', success: 'jeudi 1 janvier 1970' }
console.log(formatter(CVDateTime.fromTimestampOrThrow(0, 0)));

// Result: { _id: 'Result', _tag: 'Success', success: 'jeudi 1 janvier 1970' }
console.log(effectFormatter(DateTime.makeZonedUnsafe(0, { timeZone: 0 })));

// Result: 'jeudi 1 janvier 1970'
console.log(jsFormatter(new Date(0)));

// Result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: 'Expected length of #year to be: 4. Actual: 5',
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(formatter(CVDateTime.fromPartsOrThrow({ year: 10_024 })));

// Using Schema
const schema = CVSchema.CVDateTimeFromString(frenchParser, frenchFormatter);

// For Effect users
const effectSchema = CVSchema.DateTimeZonedFromString(frenchParser, frenchFormatter);

// For non Effect users
const jsSchema = CVSchema.DateFromString(frenchParser, frenchFormatter);

// Type: (value: string) => Exit.Exit<CVDateTime.Type, ParseError>
const decoder = Schema.decodeExit(schema);

// Type: (value: CVDateTime.Type) => Exit.Exit<string, ParseError>
const encoder = Schema.encodeExit(schema);

// Type: (value: string) => Exit.Exit<DateTime.Zoned, ParseError>
const effectDecoder = Schema.decodeExit(effectSchema);

// Type: (value: DateTime.Zoned) => Exit.Exit<string, ParseError>
const effectEncoder = Schema.encodeExit(effectSchema);

// Type: (value: string) => Exit.Exit<Date, ParseError>
const jsDecoder = Schema.decodeExit(jsSchema);

// Type: (value: Date) => Exit.Exit<string, ParseError>
const jsEncoder = Schema.encodeExit(jsSchema);

// Result: { _id: 'Exit', _tag: 'Success', value: '2025-09-04T00:00:00.000+02:00' }
console.log(decoder('jeudi 4 septembre 2025'));

// Error: Expected 'weekday' to be: 4. Actual: 1
console.log(decoder('lundi 4 septembre 2025'));

// Result: { _id: 'Exit', _tag: 'Success', value: 'jeudi 1 janvier 1970' }
console.log(encoder(CVDateTime.fromTimestampOrThrow(0, 0)));

// Result: { _id: 'Exit', _tag: 'Success', value: '2025-09-03T22:00:00.000Z' }
console.log(effectDecoder('jeudi 4 septembre 2025'));

// Result: { _id: 'Exit', _tag: 'Success', value: 'jeudi 1 janvier 1970' }
console.log(effectEncoder(DateTime.makeZonedUnsafe(0, { timeZone: 0 })));

// Result: { _id: 'Exit', _tag: 'Success', value: 2025-09-03T22:00:00.000Z }
console.log(jsDecoder('jeudi 4 septembre 2025'));

// Result: { _id: 'Exit', _tag: 'Success', value: 'jeudi 1 janvier 1970' }
console.log(jsEncoder(new Date(0)));
```

### 2. Available tokens

Many of the available [Unicode tokens](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table) can be used to define `CVDateTimeFormat`'s. Here is a list of all currently available tokens:

```ts
export type Token =
  /* Gregorian year (ex: 2005) */
  | 'y'
  /* Gregorian year on 2 digits left-padded with 0's corresponding to years 2000-2099 (ex: 05 for 2005) */
  | 'yy'
  /* Gregorian year on 4 digits left-padded with 0's (ex: 2005, 0965) */
  | 'yyyy'
  /* Iso year (ex: 2005) */
  | 'R'
  /* Iso year on 2 digits left-padded with 0's corresponding to years 2000-2099 (ex: 05 for 2005) */
  | 'RR'
  /* Iso year on 4 digits left-padded with 0's (ex: 2005, 0965)*/
  | 'RRRR'
  /* Month (ex: 6) */
  | 'M'
  /* Month on 2 digits left-padded with 0's (ex: 06) */
  | 'MM'
  /* Short month name (ex: Jun) */
  | 'MMM'
  /* Long month name (ex: June) */
  | 'MMMM'
  /* IsoWeek (ex: 6) */
  | 'I'
  /* IsoWeek (ex: 06) */
  | 'II'
  /* Day of month (ex: 5) */
  | 'd'
  /* Day of month on 2 digits left-padded with 0's (ex: 05) */
  | 'dd'
  /* Day of year (ex: 97) */
  | 'D'
  /* Day of year on 3 digits left-padded with 0's (ex: 097) */
  | 'DDD'
  /* Weekday (ex: 1 for monday, 7 for sunday) */
  | 'i'
  /* Short weekday name (ex: Mon) */
  | 'iii'
  /* Long weekday name (ex: Monday) */
  | 'iiii'
  /* Meridiem (ex: 'AM' for 0, 'PM' for 12) */
  | 'a'
  /* Hour in the range 0..23 (ex:5, 14) */
  | 'H'
  /* Hour on 2 digits in the range 0..23 left-padded with 0's (ex:05, 14) */
  | 'HH'
  /* Hour in the range 0..11 (ex:5, 2) */
  | 'K'
  /* Hour on 2 digits in the range 0..11 left-padded with 0's (ex:05, 02) */
  | 'KK'
  /* Minute (ex: 5) */
  | 'm'
  /* Minute on 2 digits left-padded with 0's (ex: 05) */
  | 'mm'
  /* Second (ex: 5) */
  | 's'
  /* Second on 2 digits left-padded with 0's (ex: 05) */
  | 'ss'
  /* Millisecond (ex: 5) */
  | 'S'
  /* Millisecond on 3 digits left-padded with 0's (ex: 005) */
  | 'SSS'
  /* Hour part of the timezone offset (ex: 5) */
  | 'zH'
  /* Hour part of the timezone offset on 2 digits left-padded with 0's (ex: 05) */
  | 'zHzH'
  /* Minute part of the timezone offset (ex: 5) */
  | 'zm'
  /* Minute part of the timezone offset on 2 digits left-padded with 0's (ex: 05) */
  | 'zmzm'
  /* Second part of the timezone offset (ex: 5) */
  | 'zs'
  /* Second part of the timezone offset on 2 digits left-padded with 0's (ex: 05) */
  | 'zszs';
```

### 3. `CVDateTimeFormatContext`

Some of the available tokens are language specific. For instance the `MMMM` token is expected to display `december` in English and `décembre` in French. For this reason, you need to build a `CVDateTimeFormatContext` and combine it with a `CVDateTimeFormat` when constructing a `CVDateTimeParser` or a `CVDateTimeFormatter`. You can build a `CVDateTimeFormatContext` in one of the three following ways:

- You can use the provided `CVDateTimeFormatContext.enGB` instance (for Great Britain English language)
- You can build a `CVDateTimeFormatContext` from the name of a locale, e.g. `const frenchContext = CVDateTimeFormatContext.fromLocaleOrThrow("fr-FR")`
- If you have very specific needs or your locale is not available, you can build a `CVDateTimeFormatContext` by providing directly your translations to the `CVDateTimeFormatContext.fromNames` constructor.

### 4. Debugging

`CVDateTimeFormat`, `CVDateTimeParser`, and `CVDateTimeFormatter` objects all implement a `.toString()` method. `CVDateTimeFormat.toString()` returns a concatenation of all its parts (e.g. `iiii d MMMM yyyy`). `CVDateTimeParser.toString()` and `CVDateTimeFormatter.toString()` return a description combining the format name and context (e.g. `'iiii d MMMM yyyy' parser in 'fr-FR' context`). For instance:

```ts
import * as CVDateTimeFormat from '@parischap/conversions/CVDateTimeFormat';
import * as CVDateTimeFormatContext from '@parischap/conversions/CVDateTimeFormatContext';
import * as CVDateTimeFormatPlaceholder from '@parischap/conversions/CVDateTimeFormatPlaceholder';
import * as CVDateTimeFormatSeparator from '@parischap/conversions/CVDateTimeFormatSeparator';
import * as CVDateTimeFormatter from '@parischap/conversions/CVDateTimeFormatter';
import * as CVDateTimeParser from '@parischap/conversions/CVDateTimeParser';

// Let's define useful shortcuts
const placeholder = CVDateTimeFormatPlaceholder.make;
const sep = CVDateTimeFormatSeparator;

// Let's define a DateTimeFormat: iiii d MMMM yyyy (context-independent)
const frenchFormat = CVDateTimeFormat.make(
  placeholder('iiii'),
  sep.space,
  placeholder('d'),
  sep.space,
  placeholder('MMMM'),
  sep.space,
  placeholder('yyyy'),
);

// Result: iiii d MMMM yyyy
console.log(frenchFormat);

const frenchParser = CVDateTimeParser.make({
  dateTimeFormat: frenchFormat,
  context: CVDateTimeFormatContext.enGB,
});

// Result: 'iiii d MMMM yyyy' parser in 'en-GB' context
console.log(frenchParser);

const frenchFormatter = CVDateTimeFormatter.make({
  dateTimeFormat: frenchFormat,
  context: CVDateTimeFormatContext.enGB,
});

// Result: 'iiii d MMMM yyyy' formatter in 'en-GB' context
console.log(frenchFormatter);
```
