import {
  CVDateTime,
  CVDateTimeFormat,
  CVDateTimeFormatContext,
  CVSchema,
} from "@parischap/conversions";
import { DateTime, Either, flow, Schema } from "effect";

// Let's define useful shortcuts
const placeholder = CVDateTimeFormat.TemplatePart.Placeholder.make;
const sep = CVDateTimeFormat.TemplatePart.Separator;

// Let's define a context
const frenchContext = CVDateTimeFormatContext.fromLocaleOrThrow("fr-FR");

// Let's define a DateTimeFormat: iiii d MMMM yyyy
const frenchFormat = CVDateTimeFormat.make({
  context: frenchContext,
  templateParts: [
    placeholder("iiii"),
    sep.space,
    placeholder("d"),
    sep.space,
    placeholder("MMMM"),
    sep.space,
    placeholder("yyyy"),
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
console.log(parser("20201210"));

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: "Expected 'weekday' to be: 4. Actual: 1",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(parser("lundi 4 septembre 2025"));

// Result: { _id: 'Either', _tag: 'Right', right: '2025-09-04T00:00:00.000+02:00' }
console.log(parser("jeudi 4 septembre 2025"));

// Result: { _id: 'Either', _tag: 'Right', right: '2025-09-03T22:00:00.000Z' }
console.log(effectParser("jeudi 4 septembre 2025"));

// Result: '2025-09-03T22:00:00.000Z'
console.log(jsParser("jeudi 4 septembre 2025"));

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
console.log(decoder("jeudi 4 septembre 2025"));

// Error: Expected 'weekday' to be: 4. Actual: 1
console.log(decoder("lundi 4 septembre 2025"));

// Result: { _id: 'Either', _tag: 'Right', right: 'jeudi 1 janvier 1970' }
console.log(encoder(CVDateTime.fromTimestampOrThrow(0, 0)));

// Result: { _id: 'Either', _tag: 'Right', right: '2025-09-03T22:00:00.000Z' }
console.log(effectDecoder("jeudi 4 septembre 2025"));

// Result: { _id: 'Either', _tag: 'Right', right: 'jeudi 1 janvier 1970' }
console.log(effectEncoder(DateTime.unsafeMakeZoned(0, { timeZone: 0 })));

// Result: { _id: 'Either', _tag: 'Right', right: 2025-09-03T22:00:00.000Z }
console.log(jsDecoder("jeudi 4 septembre 2025"));

// Result: { _id: 'Either', _tag: 'Right', right: 'jeudi 1 janvier 1970' }
console.log(jsEncoder(new Date(0)));
