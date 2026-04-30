import { pipe } from 'effect';
import * as Schema from 'effect/Schema';

import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';
import * as CVNumberBase10Formatter from '@parischap/conversions/CVNumberBase10Formatter';
import * as CVNumberBase10Parser from '@parischap/conversions/CVNumberBase10Parser';
import * as CVSchema from '@parischap/conversions/CVSchema';

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
