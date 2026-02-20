<!-- LTeX: language=en-US -->
<div align="center">

# CVNumberBase10Format

A safe, easy-to-use number/BigDecimal parser/formatter with almost all the options offered by the JavaScript INTL namespace: choice of the thousand separator, of the fractional separator, of the minimum and maximum number of fractional digits, of the rounding mode, of the sign display mode, of whether to show or not the integer part when it's zero, of whether to use a scientific or engineering notation, of the character to use as exponent mark... It can also be used as a `Schema` instead of the `Effect.Schema.NumberFromString` transformer.

</div>

## 1. Usage example

```ts
import { CVNumberBase10Format, CVSchema } from '@parischap/conversions';
import { pipe, Schema } from 'effect';

// Let's define some formats
const ukStyleUngroupedNumber = CVNumberBase10Format.ukStyleUngroupedNumber;
const ukStyleNumberWithEngineeringNotation = pipe(
  CVNumberBase10Format.ukStyleNumber,
  CVNumberBase10Format.withEngineeringScientificNotation,
);

const frenchStyleInteger = CVNumberBase10Format.frenchStyleInteger;

// Let's define a formatter
// Type: (value: BigDecimal | number) => string
const ukStyleWithEngineeringNotationFormatter = CVNumberBase10Format.toNumberFormatter(
  ukStyleNumberWithEngineeringNotation,
);

// Let's define a parser
// Type: (value: string ) => Option.Option<number>
const ungroupedUkStyleParser = CVNumberBase10Format.toRealParser(ukStyleUngroupedNumber);

// Let's define a parser that throws for non Effect users
// Type: (value: string ) => number
const throwingParser = CVNumberBase10Format.toThrowingRealParser(ukStyleUngroupedNumber);

// Result: '10.341e3'
console.log(ukStyleWithEngineeringNotationFormatter(10340.548));

// result: { _id: 'Option', _tag: 'Some', value: 10340.548 }
console.log(ungroupedUkStyleParser('10340.548'));

// result: { _id: 'Option', _tag: 'None' }
console.log(ungroupedUkStyleParser('10,340.548'));

// result: 10340.548
console.log(throwingParser('10340.548'));

// Using Schema
const schema = CVSchema.Real(frenchStyleInteger);

// Type: (value: string ) => Either.Either<number,ParseError>
const frenchStyleDecoder = Schema.decodeEither(schema);

// Type: (value: number ) => Either.Either<string,ParseError>
const frenchStyleEncoder = Schema.encodeEither(schema);

// Result: { _id: 'Either', _tag: 'Right', right: 1024 }
console.log(frenchStyleDecoder('1 024'));

// Error: Failed to convert string to a(n) potentially signed French-style integer
console.log(frenchStyleDecoder('1 024,56'));

// Result: { _id: 'Either', _tag: 'Right', right: '1 025' }
console.log(frenchStyleEncoder(1024.56));
```

## 2. CVNumberBase10Format instances

In the previous example, we used the `ukStyleNumber`, `ukStyleUngroupedNumber` and `frenchStyleInteger` `CVNumberBase10Format` instances.

You will find in the [API](https://parischap.github.io/effect-libs/conversions/NumberBase10Format.ts) the list of all pre-defined instances.

## 3. CVNumberBase10Format Instance modifiers

Sometimes, you will need to bring some small modifications to a pre-defined `CVNumberBase10Format` instance. For instance, in the previous example, we defined the `ukStyleNumberWithEngineeringNotation` instance by using the `withEngineeringScientificNotation` modifier on the `ukStyleNumber` pre-defined instance.

There are quite a few such modifiers whose list you will find in the [API](https://parischap.github.io/effect-libs/conversions/NumberBase10Format.ts).

## 4. CVNumberBase10Format in more details

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

  /** Scientific notation options. See CVNumberBase10FormatScientificNotationOption */
  readonly scientificNotationOption: CVNumberBase10FormatScientificNotationOption.Type;

  /** Rounding mode options. See CVRoundingOption.ts */
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
  minimumFractionalDigits: 0,
  maximumFractionalDigits: 3,
  eNotationChars: ['e', 'E'],
  scientificNotation: ScientificNotation.None,
  roundingMode: CVRoundingMode.Type.HalfExpand,
  signDisplay: SignDisplay.Negative,
});
```

## 5. Debugging and equality

`CVNumberBase10Format` objects implement a `.toString()` method and a `toDescription` destructor.
The `.toString()` method will display the name of the object and all available properties. The `toDescription` destructor will produce a short summary of the format.

For instance:

```ts
import { CVNumberBase10Format } from '@parischap/conversions';
import { pipe } from 'effect';

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
