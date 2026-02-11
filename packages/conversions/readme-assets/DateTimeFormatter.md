<!-- LTeX: language=en-US -->
<div align="center">

# CVDateTimeFormatter

A DateTime parser/formatter which supports many of the available [unicode tokens](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table). It can also be used as a `Schema` instead of the `Effect.Schema.Date` transformer.

</div>

## 1. Usage example

```ts
import {
  CVDateTime,
  CVDateTimeFormat,
  CVDateTimeFormatContext,
  CVDateTimeFormatPlaceholder,
  CVDateTimeFormatSeparator,
  CVSchema,
} from '@parischap/conversions';
import { DateTime, Either, flow, Schema } from 'effect';

// Let's define useful shortcuts
const placeholder = CVDateTimeFormatPlaceholder.make;
const sep = CVDateTimeFormatSeparator;

// Let's define a context
const frenchContext = CVDateTimeFormatContext.fromLocaleOrThrow('fr-FR');

// Let's define a DateTimeFormat: iiii d MMMM yyyy
const frenchFormat = CVDateTimeFormat.make({
  context: frenchContext,
  parts: [
    placeholder('iiii'),
    sep.space,
    placeholder('d'),
    sep.space,
    placeholder('MMMM'),
    sep.space,
    placeholder('yyyy'),
  ],
});

// Let's define a parser
// Type: (dateString: string) => Either.Either<CVDateTime.Type, MInputError.Type>
const parser = CVDateTimeFormat.toParser(frenchFormat);

// Let's define a formatter
// Type: (date: CVDateTime.Type) => Either.Either<string, MInputError.Type>
const formatter = CVDateTimeFormat.toFormatter(frenchFormat);

// Let's define a parser to Effect.DateTime for Effect users
// Type: (dateString: string) => Either.Either<DateTime.Zoned, MInputError.Type>
const effectParser = flow(parser, Either.map(CVDateTime.toEffectDateTime));

// Let's define a formatter from Effect.DateTime for Effect users
// Type: (date: DateTime.Zoned) => Either.Either<string, MInputError.Type>
const effectFormatter = flow(CVDateTime.fromEffectDateTime, formatter);

// Let's define a parser that returns a date or throws for non Effect users
// Type: (dateString: string) => Date
const jsParser = flow(CVDateTimeFormat.toThrowingParser(frenchFormat), CVDateTime.toDate);

// Let's define a formatter that takes a date and throws for non Effect users
// Type: (date: Date) => string
const jsFormatter = flow(CVDateTime.fromDate, CVDateTimeFormat.toThrowingFormatter(frenchFormat));

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: "Expected remaining text for #weekday to start with one of [lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche]. Actual: '20201210'",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(parser('20201210'));

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: "Expected 'weekday' to be: 4. Actual: 1",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(parser('lundi 4 septembre 2025'));

// Result: { _id: 'Either', _tag: 'Right', right: '2025-09-04T00:00:00.000+02:00' }
console.log(parser('jeudi 4 septembre 2025'));

// Result: { _id: 'Either', _tag: 'Right', right: '2025-09-03T22:00:00.000Z' }
console.log(effectParser('jeudi 4 septembre 2025'));

// Result: '2025-09-03T22:00:00.000Z'
console.log(jsParser('jeudi 4 septembre 2025'));

// Result: { _id: 'Either', _tag: 'Right', right: 'jeudi 1 janvier 1970' }
console.log(formatter(CVDateTime.fromTimestampOrThrow(0, 0)));

// Result: { _id: 'Either', _tag: 'Right', right: 'jeudi 1 janvier 1970' }
console.log(effectFormatter(DateTime.unsafeMakeZoned(0, { timeZone: 0 })));

// Result: 'jeudi 1 janvier 1970'
console.log(jsFormatter(new Date(0)));

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: 'Expected length of #year to be: 4. Actual: 5',
//     _tag: '@parischap/effect-lib/InputError/'
//   }
console.log(formatter(CVDateTime.fromPartsOrThrow({ year: 10_024 })));

// Using Schema
const schema = CVSchema.DateTime(frenchFormat);

// For Effect users
const effectSchema = CVSchema.DateTimeZoned(frenchFormat);

// For non Effect users
const jsSchema = CVSchema.Date(frenchFormat);

// Type: (value: string ) => Either.Either<CVDateTime.Type,ParseError>
const decoder = Schema.decodeEither(schema);

// Type: (value: CVDateTime.Type ) => Either.Either<string,ParseError>
const encoder = Schema.encodeEither(schema);

// Type: (value: string ) => Either.Either<DateTime.Zoned,ParseError>
const effectDecoder = Schema.decodeEither(effectSchema);

// Type: (value: CVDateTime.Zoned ) => Either.Either<string,ParseError>
const effectEncoder = Schema.encodeEither(effectSchema);

// Type: (value: string ) => Either.Either<Date,ParseError>
const jsDecoder = Schema.decodeEither(jsSchema);

// Type: (value: Date ) => Either.Either<string,ParseError>
const jsEncoder = Schema.encodeEither(jsSchema);

// Result: { _id: 'Either', _tag: 'Right', right: '2025-09-04T00:00:00.000+02:00' }
console.log(decoder('jeudi 4 septembre 2025'));

// Error: Expected 'weekday' to be: 4. Actual: 1
console.log(decoder('lundi 4 septembre 2025'));

// Result: { _id: 'Either', _tag: 'Right', right: 'jeudi 1 janvier 1970' }
console.log(encoder(CVDateTime.fromTimestampOrThrow(0, 0)));

// Result: { _id: 'Either', _tag: 'Right', right: '2025-09-03T22:00:00.000Z' }
console.log(effectDecoder('jeudi 4 septembre 2025'));

// Result: { _id: 'Either', _tag: 'Right', right: 'jeudi 1 janvier 1970' }
console.log(effectEncoder(DateTime.unsafeMakeZoned(0, { timeZone: 0 })));

// Result: { _id: 'Either', _tag: 'Right', right: 2025-09-03T22:00:00.000Z }
console.log(jsDecoder('jeudi 4 septembre 2025'));

// Result: { _id: 'Either', _tag: 'Right', right: 'jeudi 1 janvier 1970' }
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

Some of the available tokens are language specific. For instance the `MMMM` token is expected to display `december` in English and `décembre` in French. For this reason, you need to build a `CVDateTimeFormatContext` before building a `CVDateTimeFormat`. You can build a `CVDateTimeFormatContext` in one of the three following ways:

- You can use the provided `CVDateTimeFormatContext.enGB` instance (for Great Britain English language)
- You can build a `CVDateTimeFormatContext` from the name of a locale, e.g. `const frenchContext = CVDateTimeFormatContext.fromLocaleOrThrow("fr-FR")`
- If you have very specific needs or your locale is not available, you can build a `CVDateTimeFormatContext` by providing directly your translations to the `CVDateTimeFormatContext.fromNames` constructor.

## 4. Debugging

`CVDateTimeFormat` objects implement a `.toString()` method which displays a synthetic description of the template followed by the description of each CVPlaceholder. For instance:

```ts
import {
  CVDateTimeFormat,
  CVDateTimeFormatContext,
  CVDateTimeFormatPlaceholder,
  CVDateTimeFormatSeparator,
} from '@parischap/conversions';

// Let's define useful shortcuts
const placeholder = CVDateTimeFormatPlaceholder.make;
const sep = CVDateTimeFormatSeparator;

// Let's define a DateTimeFormat: iiii d MMMM yyyy
const frenchFormat = CVDateTimeFormat.make({
  context: CVDateTimeFormatContext.enGB,
  parts: [
    placeholder('iiii'),
    sep.space,
    placeholder('d'),
    sep.space,
    placeholder('MMMM'),
    sep.space,
    placeholder('yyyy'),
  ],
});

// Result: "'iiii d MMMM yyyy' in 'en-GB' context"
console.log(frenchFormat);
```
