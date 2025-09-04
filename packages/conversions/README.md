<div align="center">

# conversions

An [Effect](https://effect.website/docs/introduction) library to replace the native javascript INTL namespace.

Non machine-dependent, safe, bidirectional (implements parsing and formatting), tested and documented, 100% Typescript, 100% functional.

Can also be used by non-Effect users.

</div>

## Donate

[Any donations would be much appreciated](https://ko-fi.com/parischap). 😄

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

Bundled and tree-shaken, this module is only about [30kB](https://bundlephobia.com/package/@parischap/pretty-print). Minified and gzipped, it falls to [7kB](https://bundlephobia.com/package/@parischap/pretty-print)! (source bundlephobia)

## API

After reading this introduction, you may take a look at the [API](https://parischap.github.io/effect-libs/docs/conversions) documentation.

## In this package

This package contains:

- a [module to round numbers and BigDecimals](#RoundingModule) with the same rounding options as those offered by the javascript INTL namespace: Ceil, Floor, Expand, Trunc, HalfCeil...
- a safe, easy-to-use [number/BigDecimal parser/formatter](#NumberParserFormatter) with almost all the options offered by the javascript INTL namespace: choice of the thousand separator, of the fractional separator, of the minimum and maximum number of fractional digits, of the rounding mode, of the sign display mode, of whether to show or not the integer part when it's zero, of whether to use a scientific or engineering notation, of the character to use as exponent mark... It can directly be used as a Schema instead of the existing Schema.NumberFromString transformer.
- an equivalent to the PHP [sprintf and sscanf functions](#Templating) with real typing of the placeholders. Although Effect Schema does offer the [TemplateLiteralParser API](https://effect.website/docs/schema/basic-usage/#templateliteralparser), the latter does not provide a solution to situations such as fixed length fields (potentially padded), numbers formatted otherwise than in the english format...
- a very easy to use [DateTime module](#DateTimeModule) that implements natively the Iso calendar (Iso year and iso week). It is also faster than its Effect counterpart because it implements an internal state that's only used to speed up calculation times (but does not alter the result of functions; so DateTime functions can be viewed as pure from a user's perspective). It can therefore be useful in applications where time is of essence.
- a DateTime parser/formatter which supports many of the available [unicode tokens](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table). It can directly be used as a Schema instead of the existing Schema.Date transformer.
- a few brands which come in handy in many projects such as email, semantic versioning, integer numbers, positive integer numbers, real numbers and positive real numbers. All these brands are also defined as Schemas.

Most functions of this package return an Either or an Option to signify the possibility of an error. However, if you are not an Effect user and do not want to learn more about it, you can simply use the `OrThrow` variant of the function. For instance, use `CVDateTime.setWeekdayOrThrow` instead of `CVDateTime.setWeekday`. As its name suggests, it will throw in case of an `Error`. Some functions return functions that return an `Either` or throw. In that case, the variant for non Effect users contains the word `Throwing`, e.g. use `CVDateTimeFormat.toThrowingFormatter` instead of `CVDateTimeFormat.toThrowingFormatter`.

### <a name="RoundingModule"></a>A) Rounding module

#### 1. Usage example

```ts
import { CVRoundingMode, CVRoundingOption } from "@parischap/conversions";
import { BigDecimal } from "effect";

// Here we define our rounding options:
// rounding at the third fractional digit using the HalfEven rounding mode
const roundingOption = CVRoundingOption.make({
	precision: 3,
	roundingMode: CVRoundingMode.Type.HalfEven,
});

// Let's define a number rounder from our options. Type: (value:number) => number
const numberRounder = CVRoundingOption.toNumberRounder(roundingOption);
// Let's define a BigDecimal rounder from our options. Type: (value:BigDecimal) => BigDecimal
const bigDecimalRounder = CVRoundingOption.toBigDecimalRounder(roundingOption);

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

// Result: -12.450000000000001
// (javascript floating-point numbers precision limitations)
console.log(numberRounder(-12.45));

/** Diverse BigDecimal numbers */
// Result: BigDecimal.make(12457n, 3)
console.log(bigDecimalRounder(BigDecimal.make(124566n, 4)));

// Result: BigDecimal.make(-12456n, 3)
console.log(bigDecimalRounder(BigDecimal.make(-124565n, 4)));

// Result: BigDecimal.make(12450n, 3)
console.log(bigDecimalRounder(BigDecimal.make(1245n, 2)));
```

### 2. Available rounding modes

The available rounding modes are defined in module RoundingMode.ts:

```ts
export enum Type {
	/** Round toward +∞. Positive values round up. Negative values round "more positive" */
	Ceil = 0,
	/** Round toward -∞. Positive values round down. Negative values round "more negative" */
	Floor = 1,
	/**
	 * Round away from 0. The magnitude of the value is always increased by rounding. Positive values
	 * round up. Negative values round "more negative"
	 */
	Expand = 2,
	/**
	 * Round toward 0. The magnitude of the value is always reduced by rounding. Positive values round
	 * down. Negative values round "less negative"
	 */
	Trunc = 3,
	/**
	 * Ties toward +∞. Values above the half-increment round like "ceil" (towards +∞), and below like
	 * "floor" (towards -∞). On the half-increment, values round like "ceil"
	 */
	HalfCeil = 4,
	/**
	 * Ties toward -∞. Values above the half-increment round like "ceil" (towards +∞), and below like
	 * "floor" (towards -∞). On the half-increment, values round like "floor"
	 */
	HalfFloor = 5,
	/**
	 * Ties away from 0. Values above the half-increment round like "expand" (away from zero), and
	 * below like "trunc" (towards 0). On the half-increment, values round like "expand"
	 */
	HalfExpand = 6,
	/**
	 * Ties toward 0. Values above the half-increment round like "expand" (away from zero), and below
	 * like "trunc" (towards 0). On the half-increment, values round like "trunc"
	 */
	HalfTrunc = 7,
	/**
	 * Ties towards the nearest even integer. Values above the half-increment round like "expand"
	 * (away from zero), and below like "trunc" (towards 0). On the half-increment values round
	 * towards the nearest even digit
	 */
	HalfEven = 8,
}
```

#### 3. CVRoundingOption instances

Instead of building your own CVRoundingOption, you can use the `halfExpand2` CVRoundingOption instance (`HalfExpand` rounding mode with a precision of two fractional digits). It will come in handy in accounting apps of most countries. For example:

```ts
import { CVRoundingOption } from "@parischap/conversions";

// Let's define a number rounder from halfExpand2. Type: (value:number) => number
const numberRounder = CVRoundingOption.toNumberRounder(
	CVRoundingOption.halfExpand2,
);

/** Positive number */
// Result: 12.456
console.log(numberRounder(12.46));

/** Negative number */
// Result: -12.46
console.log(numberRounder(-12.457));
```

#### 4. Debugging and equality

CVRoundingOption objects implement Effect equivalence and equality based on equivalence and equality of the precision and roundingMode properties. They also implement a .toString() method. For instance:

```ts
import { CVRoundingMode, CVRoundingOption } from "@parischap/conversions";
import { Equal } from "effect";

// Result: 'HalfExpandRounderWith2Precision'
console.log(CVRoundingOption.halfExpand2);

const dummyOption1 = CVRoundingOption.make({
	precision: 3,
	roundingMode: CVRoundingMode.Type.HalfEven,
});

const dummyOption2 = CVRoundingOption.make({
	precision: 2,
	roundingMode: CVRoundingMode.Type.HalfExpand,
});

// Result: false
console.log(Equal.equals(CVRoundingOption.halfExpand2, dummyOption1));

// Result: true
console.log(Equal.equals(CVRoundingOption.halfExpand2, dummyOption2));
```

### <a name="NumberParserFormatter"></a>B) Number and BigDecimal parser/formatter

#### 1. Usage example

```ts
import { CVNumberBase10Format, CVReal, CVSchema } from "@parischap/conversions";
import { pipe, Schema } from "effect";

// Let's define some formats
const ukStyleUngroupedNumber = CVNumberBase10Format.ukStyleUngroupedNumber;
const ukStyleNumberWithEngineeringNotation = pipe(
	CVNumberBase10Format.ukStyleNumber,
	CVNumberBase10Format.withEngineeringScientificNotation,
);

const frenchStyleInteger = CVNumberBase10Format.frenchStyleInteger;

// Let's define a formatter
// Type: (value: BigDecimal | CVReal.Type) => string
const ukStyleWithEngineeringNotationFormatter =
	CVNumberBase10Format.toNumberFormatter(ukStyleNumberWithEngineeringNotation);

// Let's define a parser
// Type: (value: string ) => CVReal.Type
const ungroupedUkStyleParser = CVNumberBase10Format.toRealParser(
	ukStyleUngroupedNumber,
);

// Result: '10.341e3'
console.log(
	ukStyleWithEngineeringNotationFormatter(CVReal.unsafeFromNumber(10340.548)),
);

// result: { _id: 'Option', _tag: 'Some', value: 10340.548 }
console.log(ungroupedUkStyleParser("10340.548"));

// result: { _id: 'Option', _tag: 'None' }
console.log(ungroupedUkStyleParser("10,340.548"));

// Using Schema
const schema = CVSchema.Real(frenchStyleInteger);

// Type: (value: string ) => Either.Either<CVReal.Type,ParseError>
const frenchStyleDecoder = Schema.decodeEither(schema);

// Type: (value: CVReal.Type ) => Either.Either<string,ParseError>
const frenchStyleEncoder = Schema.encodeEither(schema);

// Result: { _id: 'Either', _tag: 'Right', right: 1024 }
console.log(frenchStyleDecoder("1 024"));

// Error: Failed to convert string to Real
console.log(frenchStyleDecoder("1 024,56"));

// Result: { _id: 'Either', _tag: 'Right', right: '1 025' }
console.log(frenchStyleEncoder(CVReal.unsafeFromNumber(1024.56)));
```

#### 2. CVNumberBase10Format instances

In the previous example, we used the `ukStyleNumber`, `ukStyleUngroupedNumber` and `frenchStyleInteger` CVNumberBase10Format instances.

You will find in the [API](https://parischap.github.io/effect-libs/conversions/NumberBase10Format.ts) the list of all pre-defined instances.

#### 3. CVNumberBase10Format Instance modifiers

Sometimes, you will need to bring some small modifications to a pre-defined CVNumberBase10Format instance. For instance, in the previous example, we defined the `ukStyleNumberWithEngineeringNotation` instance by using the `withEngineeringScientificNotation` modifier on the `ukStyleNumber` pre-defined instance.

There are quite a few such modifiers whose list you will find in the [API](https://parischap.github.io/effect-libs/conversions/NumberBase10Format.ts).

#### 4. CVNumberBase10Format in more details

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
	 *   displayed starting wiyh `0`.
	 *
	 * Parsing
	 *
	 * - If `true`, conversion will fail for numbers starting with `.` (after an optional sign).
	 * - If `false`, conversion will fail for numbers starting with `0.` (after an optional sign).
	 */
	readonly showNullIntegerPart: boolean;

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
	 * Formatting: the number will be rounded using the roundingMode to respect the condition (unless
	 * `maximumFractionalDigits` is `+Infinity`).
	 *
	 * Parsing: will fail if the input string has too many fractional digits.
	 */
	readonly maximumFractionalDigits: number;

	/**
	 * Possible characters to use to represent e-notation. Usually ['e','E']. Must be an array of
	 * one-character strings. Will not throw otherwise but unexpected results will occur. Not used if
	 * `scientificNotation === None`
	 *
	 * Formatting: the string at index 0 is used
	 *
	 * Parsing: the first character of the e-notation must be one of the one-character strings present
	 * in the array
	 */
	readonly eNotationChars: ReadonlyArray<string>;

	/** Scientific notation options. See ScientificNotation */
	readonly scientificNotation: ScientificNotation;

	/** Rounding mode options. See RoundingMode.ts */
	readonly roundingMode: CVRoundingMode.Type;

	/** Sign display options. See SignDisplay.ts */
	readonly signDisplay: SignDisplay;
}
```

To build such an instance, you will need to use the `make` constructor. For instance, this is how you could redefine the `frenchStyleNumber` instance:

```ts
const frenchStyleNumber = CVNumberBase10Format.make({
	thousandSeparator: " ",
	fractionalSeparator: ",",
	showNullIntegerPart: true,
	minimumFractionalDigits: 0,
	maximumFractionalDigits: 3,
	eNotationChars: ["e", "E"],
	scientificNotation: ScientificNotation.None,
	roundingMode: CVRoundingMode.Type.HalfExpand,
	signDisplay: SignDisplay.Negative,
});
```

#### 5. Debugging and equality

CVNumberBase10Format objects implement a `.toString()` method and a `toDescription` destructor.
The `.toString()` method will display the name of the object and all available properties. The `toDescription` destructor will produce a short summary of the format.

For instance:

```ts
import { CVNumberBase10Format } from "@parischap/conversions";

// Result:
// {
//   _id: '@parischap/conversions/NumberBase10Format/',
//   thousandSeparator: '',
//   fractionalSeparator: '.',
//   showNullIntegerPart: true,
//   minimumFractionalDigits: 0,
//   maximumFractionalDigits: 3,
//   eNotationChars: [ 'e', 'E' ],
//   scientificNotation: 0,
//   roundingMode: 6,
//   signDisplay: 3
//  }
console.log(CVNumberBase10Format.ukStyleUngroupedNumber);

// Result: 'potentially signed UK-style number'
console.log(
	CVNumberBase10Format.toDescription(
		CVNumberBase10Format.ukStyleUngroupedNumber,
	),
);
```

### <a name="Templating"></a>C) Templating

#### 1. Usage example

```ts
import {
	CVNumberBase10Format,
	CVReal,
	CVTemplate,
	CVTemplatePlaceholder,
	CVTemplateSeparator,
} from "@parischap/conversions";
import { MRegExpString } from "@parischap/effect-lib";
import { pipe } from "effect";

// Let's define useful shortcuts
const ph = CVTemplatePlaceholder;
const sep = CVTemplateSeparator;

// Let's define a template: "#name is a #age-year old #kind."
const template = CVTemplate.make(
	// field named 'name' that must be a non-empty string containing no space characters
	ph.anythingBut({ name: "name", forbiddenChars: [MRegExpString.space] }),
	// Immutable text
	sep.make(" is a "),
	// Field named 'age' that must represent an unsigned integer
	ph.real({
		name: "age",
		numberBase10Format: pipe(
			CVNumberBase10Format.integer,
			CVNumberBase10Format.withoutSignDisplay,
		),
	}),
	// Immutable text
	sep.make("-year old "),
	// field named 'kind' that must be a non-empty string containing no dot character
	ph.anythingBut({ name: "kind", forbiddenChars: ["."] }),
	// Immutable text
	sep.dot,
);

// Let's define a parser. See how the return type matches the names and types of the placeholders
// Type: (value: string) => Either.Either<{
//    readonly name: string;
//    readonly age: CVReal.Type;
//    readonly kind: string;
// }, MInputError.Type>>
const parser = CVTemplate.toParser(template);

// Let's define a formatter. See how the return type matches the names and types of the placeholders
// Type: (value: {
//    readonly name: string;
//    readonly age: CVReal.Type;
//    readonly kind: string;
//   }) => Either.Either<string, MInputError.Type>
const formatter = CVTemplate.toFormatter(template);

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: "Expected remaining text for separator at position 2 to start with ' is a '. Actual: ''",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(parser("John"));

// Result: {
//   _id: 'Either',
//   _tag: 'Right',
//   right: { name: 'John', age: 47, kind: 'man' }
// }
console.log(parser("John is a 47-year old man."));

// Result: { _id: 'Either', _tag: 'Right', right: 'Tom is a 15-year old boy.' }
console.log(
	formatter({
		name: "Tom",
		age: CVReal.unsafeFromNumber(15),
		kind: "boy",
	}),
);
```

#### 2. Definitions

A template is a model of a text that has always the same structure. In such a text, there are immutable and mutable parts. Let's take the following two texts as an example:

- text1 = "John is a 47-year old man."
- text2 = "Jehnny is a 5-year old girl."

These two texts obviously share the same structure which is the template:

Placeholder1 is a Placeholder2-year old Placeholder3.

Placeholder1, Placeholder2 and Placeholder3 are the mutable parts of the template. They contain valuable information. We call them `TemplatePlaceholder`'s.

" is a " and "-year old " are the immutable parts of the template. We call them `TemplateSeperator`'s.

From a text with the above structure, we can extract the values of Placeholder1, Placeholder2, and Placeholder3. In the present case:

- For text1: { Placeholder1 : 'John', Placeholder2 : '47', Placeholder3 : 'man' }
- For text2: { Placeholder1 : 'Jehnny', Placeholder2 : '5', Placeholder3 : 'girl'}

Extracting the values of placeholders from a text according to a template is called parsing. The result of parsing is an object whose properties are named after the name of the placeholders they represent.

Inversely, given a template and the values of the placeholders that compose it (provided as the properties of an object), we can generate a text. This is called formatting. In the present case, with the object:

{ Placeholder1 : 'Tom', Placeholder2 : '15', Placeholder3 : 'boy' }

we will obtain the text: "Tom is a 15-year old boy."

#### 3. CVTemplateSeparator's

A `CVTemplateSeparator` represents the immutable part of a template. Upon parsing, we must check that it is present as is in the text. Upon formatting, it must be inserted as is into the text. A `CVTemplateSeparator` contains no valuable information

To create a `CVTemplateSeparator`, you usually call the `CVTemplateSeparator.make` constructor. However, the TemplateSeparator.ts module exports a series of predefined `CVTemplateSeparator` instances, such as `CVTemplateSeparator.slash` and `CVTemplateSeparator.space`. You can find the list of all predefined `CVTemplateSeparator` instances in the [API](https://parischap.github.io/effect-libs/conversions/TemplatePart.ts).

#### 4. CVTemplatePlaceholder's

A Placeholder represents the mutable part of a template. Each Placeholder defines a parser and a formatter: the parser takes a text, consumes a part of that text, optionnally converts the consumed part to a value of type T and, if successful, returns a right of that value and of what has not been consumed. In case of an error, it returns a left. The formatter takes a value of type T, converts it to a string (if T is not string), checks that the result is coherent and, if so, inserts that string into the text. Otherwise, it returns a left.

There are several predefined Placeholder's:

- `fixedLength`: this Placeholder always reads/writes the same number of characters from/into the text.
- `paddedFixedLength`: same as `fixedLength` but the consumed text is trimmed from a `fillChar` on the left or right and the written text is padded with a `fillChar` on the left or right.
- `fixedLengthToReal`: same as fixedLength but the parser tries to convert the consumed text into a `CVReal` using the passed `CVNumberBase10Format`. The formatter takes a `CVReal` and tries to convert and write it as an n-character string. You can pass a `fillChar` that is trimmed from the consumed text upon parsing and padded to the written text upon formatting.
- `real`: the parser of this Placeholder reads from the text all the characters that it can interpret as a number in the provided `CVNumberBase10Format` and converts the consumed text into a `CVReal`. The formatter takes a `CVReal` and converts it into a string according to the provided `CVNumberBase10Format`.
- `mappedLiterals`: this Placeholder takes as input a map that must define a bijection between a list of strings and a list of values. The parser tries to read from the text one of the strings in the list. Upon success, it returns the corresponding value. The formatter takes a value and tries to find it in the list. Upon success, it writes the corresponding string into the text.
- `fulfilling`: the parser of this Placeholder reads as much of the text as it can that fulfills the passed regular expression. The formatter only accepts a string that matches the passed regular expression and writes it into the text.
- `anythingBut`: this is a special case of the `fulfilling` placeholder. The parser of this Placeholder reads from the text until it meets one of the `forbiddenChars` passed as parameter (the result must be a non-empty string). The formatter will only accept a non-empty string that does not contain any of the forbidden chars and write it to the text.
- `toEnd`: this is another special case of the `fulfilling` placeholder. The parser of this Placeholder reads all the remaining text. The formatter accepts any string and writes it. This Placeholder should only be used as the last `CVTemplatePart` of a `CVTemplate`.

Each CVTemplatePlaceholder must be given a name that will be used as the name of the corresponding property in the result object of parsing or the input object of formatting. This name needs not be unique inside a template. The same name can appear several times. However, even if there are several `CVTemplatePlaceholder`'s with the same name, there will be only one property with that name in the result object of parsing or the input object of formatting. When parsing, this implies that all `CVTemplatePlaceholder`'s with the same name must yield the same value. When formatting, this implies that the value needs only be provided once and will be shared by all `CVTemplatePlaceholder`'s.

If none of these Placeholder instances suits you, you can define you own with the `make` constructor. You will find detailed explanations of the predefined Placeholder instances and of the make constructor in the [API](https://parischap.github.io/effect-libs/conversions/TemplatePart.ts).

#### 5. A more complex example

```ts
import {
	CVNumberBase10Format,
	CVReal,
	CVTemplate,
	CVTemplatePlaceholder,
	CVTemplateSeparator,
} from "@parischap/conversions";

// Let's define useful shortcuts
const placeholder = CVTemplatePlaceholder;
const sep = CVTemplateSeparator;

// Let's define a date template that will look like: 'Today is #weekday, day number #weekday of the week.'
// Note that weekDay appears twice, once as a mappedLiterals placeholder, once as a real placeholder.
const template = CVTemplate.make(
	// Separator
	sep.make("Today is "),
	// mappedLiterals placeHolder
	placeholder.mappedLiterals({
		name: "weekday",
		keyValuePairs: [
			["Monday", CVReal.unsafeFromNumber(1)],
			["Tuesday", CVReal.unsafeFromNumber(2)],
			["Wednesday", CVReal.unsafeFromNumber(3)],
			["Thursday", CVReal.unsafeFromNumber(4)],
			["Friday", CVReal.unsafeFromNumber(5)],
			["Saturday", CVReal.unsafeFromNumber(6)],
			["Sunday", CVReal.unsafeFromNumber(7)],
		],
	}),
	// Separator
	sep.make(", day number "),
	// Field named 'weekday' that must represent an integer
	placeholder.real({
		name: "weekday",
		numberBase10Format: CVNumberBase10Format.integer,
	}),
	// Separator
	sep.make(" of the week."),
);

// Let's define a parser. Note that there is only one `weekday` property
// Type: (value: string) => Either.Either<{
//    readonly weekday: CVReal.Type;
// }, MInputError.Type>>
const parser = CVTemplate.toParser(template);

// Let's define a formatter. Note that there is only one `weekday` property
// Type: (value: {
//   readonly weekday: CVReal.Type;
//   }) => Either.Either<string, MInputError.Type>
const formatter = CVTemplate.toFormatter(template);

// Result: { _id: 'Either', _tag: 'Right', right: { weekday: 2 } }
console.log(parser("Today is Tuesday, day number 2 of the week."));

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: "#weekday is present more than once in template and receives differing values '4' and '2'",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(parser("Today is Thursday, day number 2 of the week."));

// Result: {
//   _id: 'Either',
//   _tag: 'Right',
//   right: 'Today is Saturday, day number 6 of the week.'
// }
console.log(formatter({ weekday: CVReal.unsafeFromNumber(6) }));

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: '#weekday: expected one of [1, 2, 3, 4, 5, 6, 7]. Actual: 10',
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(formatter({ weekday: CVReal.unsafeFromNumber(10) }));
```

#### 6. Debugging

CVTemplate objects implement a `.toString()` method.
The `.toString()` method will display a synthetic description of the template followed by the description of each CVPlaceholder.

For instance:

```ts
import {
	CVNumberBase10Format,
	CVTemplate,
	CVTemplatePlaceholder,
	CVTemplateSeparator,
} from "@parischap/conversions";
import { MRegExpString } from "@parischap/effect-lib";
import { pipe } from "effect";

// Let's define useful shortcuts
const ph = CVTemplatePlaceholder;
const sep = CVTemplateSeparator;

// Let's define a template: "#name is a #age-year old #kind."
const template = CVTemplate.make(
	// field named 'name' that must be a non-empty string containing no space characters
	ph.anythingBut({ name: "name", forbiddenChars: [MRegExpString.space] }),
	// Immutable text
	sep.make(" is a "),
	// Field named 'age' that must represent an unsigned integer
	ph.real({
		name: "age",
		numberBase10Format: pipe(
			CVNumberBase10Format.integer,
			CVNumberBase10Format.withoutSignDisplay,
		),
	}),
	// Immutable text
	sep.make("-year old "),
	// field named 'kind' that must be a non-empty string containing no dot character
	ph.anythingBut({ name: "kind", forbiddenChars: ["."] }),
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

### <a name="DateTimeModule"></a>D) DateTime module

#### 1. Introduction

This package implements an immutable `CVDateTime` object: once created, the characteristics of a `CVDateTime` object will never change. However, the Setters functions allow you to get a copy of an existing `CVDateTime` object with just one charactreristic modified.

Although immutable from the outer world, `CVDateTime` objects do keep an internal state. But all functions available from the outside are pure: they will always yield the same result whatever the state the object is in. The state is only used to improve performance but does not alter the results.

Unlike the Javascript Date objects and the Effect DateTime objects, `CVDateTime` objects handle both
the Gregorian and Iso calendars. So you can easily get/set the iso year and iso week of a
`CVDateTime` object.

A `CVDateTime` object has a `zoneOffset` which is the difference in hours between the time in the local zone and UTC time (e.g zoneOffset=1 for timezone +1:00). All the data in a `CVDateTime` object is `zoneOffset-dependent`, except `timestamp`.

You cannot create a `CVDateTime` object from a string. In that case, use the `CVDateTimeFormat` module.

#### 2. Usage example
