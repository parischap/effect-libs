/* eslint-disable functional/no-expression-statements */
import { CVNumberBase10Format, CVReal, CVSchema } from '@parischap/conversions';
import { pipe, Schema } from 'effect';

// Let's define some formats
const ukStyleUngroupedNumber = CVNumberBase10Format.ukStyleUngroupedNumber;
const ukStyleNumberWithEngineeringNotation = pipe(
	CVNumberBase10Format.ukStyleNumber,
	CVNumberBase10Format.withEngineeringScientificNotation
);

const frenchStyleInteger = CVNumberBase10Format.frenchStyleInteger;

// Let's define a formatter
// Type: (value: BigDecimal | CVReal.Type) => string
const ukStyleWithEngineeringNotationFormatter = CVNumberBase10Format.toNumberFormatter(
	ukStyleNumberWithEngineeringNotation
);

// Let's define a parser
// Type: (value: string ) => CVReal.Type
const ungroupedUkStyleParser = CVNumberBase10Format.toRealParser(ukStyleUngroupedNumber);

// Result: '10.341e3'
console.log(ukStyleWithEngineeringNotationFormatter(CVReal.unsafeFromNumber(10340.548)));

// result: { _id: 'Option', _tag: 'Some', value: 10340.548 }
console.log(ungroupedUkStyleParser('10340.548'));

// result: { _id: 'Option', _tag: 'None' }
console.log(ungroupedUkStyleParser('10,340.548'));

// Using Schema
const schema = CVSchema.Real(frenchStyleInteger);

// Type: (value: string ) => Either.Either<CVReal.Type,ParseError>
const frenchStyleDecoder = Schema.decodeEither(schema);

// Type: (value: CVReal.Type ) => Either.Either<string,ParseError>
const frenchStyleEncoder = Schema.encodeEither(schema);

// Result: { _id: 'Either', _tag: 'Right', right: 1024 }
console.log(frenchStyleDecoder('1 024'));

// Error: Failed to convert string to Real
console.log(frenchStyleDecoder('1 024,56'));

// Result: { _id: 'Either', _tag: 'Right', right: '1 025' }
console.log(frenchStyleEncoder(CVReal.unsafeFromNumber(1024.56)));
