<!-- LTeX: language=en-US -->
<div align="center">

# CVDateTimeFormatter

A DateTime parser/formatter which supports many of the available [unicode tokens](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table). It can also be used as a `Schema` instead of the `Effect.Schema.Date` transformer.

</div>

## 1. Usage example

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

## 2. Available tokens

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

## 3. CVDateTimeFormatContext

Some of the available tokens are language specific. For instance the `MMMM` token is expected to display `december` in English and `décembre` in French. For this reason, you need to build a `CVDateTimeFormatContext` and combine it with a `CVDateTimeFormat` when constructing a `CVDateTimeParser` or a `CVDateTimeFormatter`. You can build a `CVDateTimeFormatContext` in one of the three following ways:

- You can use the provided `CVDateTimeFormatContext.enGB` instance (for Great Britain English language)
- You can build a `CVDateTimeFormatContext` from the name of a locale, e.g. `const frenchContext = CVDateTimeFormatContext.fromLocaleOrThrow("fr-FR")`
- If you have very specific needs or your locale is not available, you can build a `CVDateTimeFormatContext` by providing directly your translations to the `CVDateTimeFormatContext.fromNames` constructor.

## 4. Debugging

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
