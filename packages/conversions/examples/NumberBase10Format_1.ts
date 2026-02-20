import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVSchema from '@parischap/conversions/CVSchema';
import { pipe } from 'effect';
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
console.log(ukStyleWithEngineeringNotationFormatter(10_340.548));

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
