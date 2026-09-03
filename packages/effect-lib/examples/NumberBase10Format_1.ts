import { pipe } from 'effect';
import * as Schema from 'effect/Schema';

import * as MNumber from '@parischap/effect-lib/MNumber';
import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
import * as MSchema from '@parischap/effect-lib/MSchema';
import * as MString from '@parischap/effect-lib/MString';

// Let's define some formats
const { ukStyleUngroupedNumber } = MNumberBase10Format;
const ukStyleNumberWithEngineeringNotation = pipe(
  MNumberBase10Format.ukStyleNumber,
  MNumberBase10Format.withEngineeringScientificNotation,
);

const { frenchStyleInteger } = MNumberBase10Format;

// Let's define a formatter
// Type: (value: BigDecimal | number) => Option.Option<string>
const ukStyleWithEngineeringNotationFormatter = MString.fromFormatAndNumber(
  ukStyleNumberWithEngineeringNotation,
);

// Let's define a formatter that throws for non-`effect` users
// Type: (value: BigDecimal | number) => string
const throwingFormatter = MString.fromFormatAndNumberOrThrow(ukStyleNumberWithEngineeringNotation);

// Let's define a parser
// Type: (value: string ) => Option.Option<number>
const ungroupedUkStyleParser = MNumber.fromFormatAndString(ukStyleUngroupedNumber);

// Let's define a parser that throws for non-`effect` users
// Type: (value: string ) => number
const throwingParser = MNumber.fromFormatAndStringOrThrow(ukStyleUngroupedNumber);

// Result: { _id: 'Option', _tag: 'Some', value: '10.341e3' }
console.log(ukStyleWithEngineeringNotationFormatter(10_340.548));

// Result: { _id: 'Option', _tag: 'None' }
console.log(ukStyleWithEngineeringNotationFormatter(Infinity));

// Result: '10.341e3'
console.log(throwingFormatter(10_340.548));

// result: { _id: 'Option', _tag: 'Some', value: 10340.548 }
console.log(ungroupedUkStyleParser('10340.548'));

// result: { _id: 'Option', _tag: 'None' }
console.log(ungroupedUkStyleParser('10,340.548'));

// result: 10340.548
console.log(throwingParser('10340.548'));

// Using Schema
const schema = MSchema.FiniteFromString(frenchStyleInteger);

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
