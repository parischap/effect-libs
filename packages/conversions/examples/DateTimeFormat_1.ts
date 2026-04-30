import { flow } from 'effect';
import * as DateTime from 'effect/DateTime';
import * as Result from 'effect/Result';
import * as Schema from 'effect/Schema';

import * as CVDateTime from '@parischap/conversions/CVDateTime';
import * as CVDateTimeFormat from '@parischap/conversions/CVDateTimeFormat';
import * as CVDateTimeFormatContext from '@parischap/conversions/CVDateTimeFormatContext';
import * as CVDateTimeFormatPlaceholder from '@parischap/conversions/CVDateTimeFormatPlaceholder';
import * as CVDateTimeFormatSeparator from '@parischap/conversions/CVDateTimeFormatSeparator';
import * as CVDateTimeFormatter from '@parischap/conversions/CVDateTimeFormatter';
import * as CVDateTimeParser from '@parischap/conversions/CVDateTimeParser';
import * as CVSchema from '@parischap/conversions/CVSchema';

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
