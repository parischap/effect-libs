import { flow } from 'effect';
import * as DateTime from 'effect/DateTime';
import * as Result from 'effect/Result';
import * as Schema from 'effect/Schema';

import * as MDateTime from '@parischap/effect-lib/MDateTime';
import * as MDateTimeContext from '@parischap/effect-lib/MDateTimeContext';
import * as MDateTimeFormat from '@parischap/effect-lib/MDateTimeFormat';
import * as MSchema from '@parischap/effect-lib/MSchema';

const { Token } = MDateTimeFormat;

// Let's define a context
const frenchContext = MDateTimeContext.fromLocaleOrThrow('fr-FR');

// Let's define a DateTimeFormat: iiii d MMMM yyyy (context-independent)
const frenchFormat = MDateTimeFormat.make(
  Token.iiii,
  ' ',
  Token.d,
  ' ',
  Token.MMMM,
  ' ',
  Token.yyyy,
);

// Let's define a parse function (combines format + context)
// Type: (dateString: string) => Result.Result<MDateTime.Type, MInputError.Type>
const parser = MDateTime.parse(frenchFormat, frenchContext);

// Let's define a format function (combines format + context)
// Type: (date: MDateTime.Type) => Result.Result<string, MInputError.Type>
const formatter = MDateTime.format(frenchFormat, frenchContext);

// Let's define a parser to effect/DateTime for `effect` users
// Type: (dateString: string) => Result.Result<DateTime.Zoned, MInputError.Type>
const effectParser = flow(parser, Result.map(MDateTime.toEffectDateTime));

// Let's define a formatter from effect/DateTime for `effect` users
// Type: (date: DateTime.Zoned) => Result.Result<string, MInputError.Type>
const effectFormatter = flow(MDateTime.fromEffectDateTime, formatter);

// Let's define a parser that returns a Date or throws for non-`effect` users
// Type: (dateString: string) => Date
const jsParser = flow(MDateTime.parseOrThrow(frenchFormat, frenchContext), MDateTime.toDate);

// Let's define a formatter that takes a Date and throws for non-`effect` users
// Type: (date: Date) => string
const jsFormatter = flow(MDateTime.fromDate, MDateTime.formatOrThrow(frenchFormat, frenchContext));

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
console.log(formatter(MDateTime.fromTimestampOrThrow(0, 0)));

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
console.log(formatter(MDateTime.fromPartsOrThrow({ year: 10_024 })));

// Using Schema
const schema = MSchema.DateTimeFromString(frenchFormat, frenchContext);

// For `effect` users
const effectSchema = MSchema.DateTimeZonedFromString(frenchFormat, frenchContext);

// For non-`effect` users
const jsSchema = MSchema.DateFromString(frenchFormat, frenchContext);

// Type: (value: string) => Exit.Exit<MDateTime.Type, ParseError>
const decoder = Schema.decodeExit(schema);

// Type: (value: MDateTime.Type) => Exit.Exit<string, ParseError>
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
console.log(encoder(MDateTime.fromTimestampOrThrow(0, 0)));

// Result: { _id: 'Exit', _tag: 'Success', value: '2025-09-03T22:00:00.000Z' }
console.log(effectDecoder('jeudi 4 septembre 2025'));

// Result: { _id: 'Exit', _tag: 'Success', value: 'jeudi 1 janvier 1970' }
console.log(effectEncoder(DateTime.makeZonedUnsafe(0, { timeZone: 0 })));

// Result: { _id: 'Exit', _tag: 'Success', value: 2025-09-03T22:00:00.000Z }
console.log(jsDecoder('jeudi 4 septembre 2025'));

// Result: { _id: 'Exit', _tag: 'Success', value: 'jeudi 1 janvier 1970' }
console.log(jsEncoder(new Date(0)));
