/**
 * An extension to the `Effect.Schema` module that adds Schema instances for number and date
 * formatting and parsing and implements new brands
 */

import * as MMatch from '@parischap/effect-lib/MMatch';
import * as MTuple from '@parischap/effect-lib/MTuple';
import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import * as BigDecimal from 'effect/BigDecimal';
import * as DateTime from 'effect/DateTime';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import * as ParseResult from 'effect/ParseResult';
import * as Record from 'effect/Record';
import * as Schema from 'effect/Schema';
import * as CVDateTime from '../DateTime/DateTime.js';
import * as CVTemplateParts from '../internal/Formatting/Template/TemplateParts.js';
import * as CVDateTimeFormatter from './DateTimeFormat/DateTimeFormatter.js';
import * as CVDateTimeParser from './DateTimeFormat/DateTimeParser.js';
import * as CVNumberBase10Format from './NumberBase10Format/NumberBase10Format.js';
import * as CVNumberBase10Formatter from './NumberBase10Format/NumberBase10Formatter.js';
import * as CVNumberBase10Parser from './NumberBase10Format/NumberBase10Parser.js';
import * as CVTemplate from './Template/Template.js';
import * as CVTemplateFormatter from './Template/TemplateFormatter.js';
import * as CVTemplateParser from './Template/TemplateParser.js';
import * as CVTemplatePart from './Template/TemplatePart/TemplatePart.js';
import * as CVTemplatePlaceholder from './Template/TemplatePart/TemplatePlaceholder/TemplatePlaceholder.js';

/**
 * A `Schema` that transforms a string into a number according to the `format`. Read documentation
 * of module NumberBase10Format.ts for more details
 *
 * @category Utils
 */
export const Number = (format: CVNumberBase10Format.Type): Schema.Schema<number, string> => {
  const parser = pipe(format, CVNumberBase10Parser.fromFormat, CVNumberBase10Parser.parseAsNumber);
  const formatter = pipe(
    format,
    CVNumberBase10Formatter.fromFormat,
    CVNumberBase10Formatter.format,
  );
  return Schema.transformOrFail(Schema.String, Schema.Number, {
    strict: true,
    decode: (input, _options, ast) =>
      pipe(
        input,
        parser,
        Either.fromOption(
          () =>
            new ParseResult.Type(
              ast,
              input,
              'Failed to convert string to a(n) ' + CVNumberBase10Format.toDescription(format),
            ),
        ),
      ),
    encode: flow(formatter, ParseResult.succeed),
  });
};

const BigDecimalFromString = (
  format: CVNumberBase10Format.Type,
): Schema.Schema<BigDecimal.BigDecimal, string> => {
  const parser = pipe(
    format,
    CVNumberBase10Parser.fromFormat,
    CVNumberBase10Parser.parseAsBigDecimal,
  );
  const formatter = pipe(
    format,
    CVNumberBase10Formatter.fromFormat,
    CVNumberBase10Formatter.format,
  );
  return Schema.transformOrFail(Schema.String, Schema.BigDecimalFromSelf, {
    strict: true,
    decode: (input, _options, ast) =>
      pipe(
        input,
        parser,
        Option.map(ParseResult.succeed),
        Option.getOrElse(() =>
          ParseResult.fail(
            new ParseResult.Type(
              ast,
              input,
              'Failed to convert string to a(n) ' + CVNumberBase10Format.toDescription(format),
            ),
          ),
        ),
      ),
    encode: flow(formatter, ParseResult.succeed),
  });
};

export {
  /**
   * A `Schema` that transforms a string into a `BigDecimal` according to `format`. Read documentation
   * of module NumberBase10Format.ts for more details
   *
   * @category Utils
   */
  BigDecimalFromString as BigDecimal,
};

/**
 * A `Schema` that represents a `CVDateTime`
 *
 * @category Instances
 */
export const DateTimeFromSelf = Schema.declare(
  (input: unknown): input is CVDateTime.Type => input instanceof CVDateTime.Type,
);

/**
 * A `Schema` that transforms a `CVDateTime` into a Javascript `Date`. Upon encoding, the
 * `CVDateTime` object is created with the default timeZoneOffset of the machine this code is
 * running on
 *
 * @category Utils
 */
export const DateFromDateTime: Schema.Schema<Date, CVDateTime.Type> = Schema.transform(
  DateTimeFromSelf,
  Schema.DateFromSelf,
  {
    strict: true,
    decode: CVDateTime.toDate,
    encode: CVDateTime.fromDate,
  },
);

/**
 * A `Schema` that transforms a `CVDateTime` into an `Effect.DateTime.Zoned`. Both objects share the
 * same time zone offset
 *
 * @category Utils
 */
export const DateTimeZonedFromDateTime: Schema.Schema<DateTime.Zoned, CVDateTime.Type> =
  Schema.transform(DateTimeFromSelf, Schema.DateTimeZonedFromSelf, {
    strict: true,
    decode: CVDateTime.toEffectDateTime,
    encode: CVDateTime.fromEffectDateTime,
  });

const DateTimeFromString = (
  parser: CVDateTimeParser.Type,
  formatter: CVDateTimeFormatter.Type,
): Schema.Schema<CVDateTime.Type, string> => {
  const parse = CVDateTimeParser.parse(parser);
  const format = CVDateTimeFormatter.format(formatter);
  return Schema.transformOrFail(Schema.String, DateTimeFromSelf, {
    strict: true,
    decode: (input, _options, ast) =>
      pipe(
        input,
        parse,
        Either.mapLeft((inputError) => new ParseResult.Type(ast, input, inputError.message)),
      ),
    encode: (input, _options, ast) =>
      pipe(
        input,
        format,
        Either.mapLeft((inputError) => new ParseResult.Type(ast, input, inputError.message)),
      ),
  });
};

export {
  /**
   * A `Schema` that transforms a string into a `CVDateTime` according to the given `parser` and
   * `formatter`. Read documentation of modules DateTimeParser.ts and DateTimeFormatter.ts for more
   * details.
   *
   * @category Utils
   */
  DateTimeFromString as DateTime,
};

/**
 * A `Schema` that transforms a string into a Javascript `Date` according to the given `parser` and
 * `formatter`. Read documentation of modules DateTimeParser.ts and DateTimeFormatter.ts for more
 * details.
 *
 * @category Utils
 */
export const Date = (
  parser: CVDateTimeParser.Type,
  formatter: CVDateTimeFormatter.Type,
): Schema.Schema<Date, string> =>
  Schema.compose(DateTimeFromString(parser, formatter), DateFromDateTime);

/**
 * A `Schema` that transforms a string into an `Effect.DateTime.Zoned` according to the given
 * `parser` and `formatter`. Read documentation of modules DateTimeParser.ts and
 * DateTimeFormatter.ts for more details.
 *
 * @category Utils
 */
export const DateTimeZoned = (
  parser: CVDateTimeParser.Type,
  formatter: CVDateTimeFormatter.Type,
): Schema.Schema<DateTime.Zoned, string> =>
  Schema.compose(DateTimeFromString(parser, formatter), DateTimeZonedFromDateTime);

/**
 * A `Schema` that transforms a string into an object according to `template`. Read documentation of
 * module Template.ts for more details
 *
 * @category Utils
 */
export const Template = <const PS extends CVTemplateParts.Type>(
  template: CVTemplate.Type<PS>,
): Schema.Schema<
  {
    readonly [k in keyof PS as PS[k] extends CVTemplatePlaceholder.Any ?
      CVTemplatePlaceholder.ExtractName<PS[k]>
    : never]: PS[k] extends CVTemplatePlaceholder.Any ? CVTemplatePlaceholder.ExtractType<PS[k]>
    : never;
  },
  string
> => {
  const parser = pipe(template, CVTemplateParser.fromTemplate, CVTemplateParser.parse);
  const formatter = pipe(template, CVTemplateFormatter.fromTemplate, CVTemplateFormatter.format);

  const schemaOutput = pipe(
    template.templateParts,
    Array.filterMap(
      flow(
        MMatch.make,
        MMatch.when(CVTemplatePart.isSeparator, () => Option.none()),
        MMatch.when(
          CVTemplatePart.isPlaceholder,
          flow(
            MTuple.makeBothBy({
              toFirst: CVTemplatePlaceholder.name,
              toSecond: CVTemplatePlaceholder.tSchemaInstance,
            }),
            Option.some,
          ),
        ),
        MMatch.exhaustive,
      ),
    ),
    Record.fromEntries,
    Schema.Struct,
  );

  return Schema.transformOrFail(Schema.String, schemaOutput, {
    strict: true,
    decode: (input, _options, ast) =>
      pipe(
        input,
        parser,
        Either.mapLeft((inputError) => new ParseResult.Type(ast, input, inputError.message)),
      ) as never,
    encode: (input, _options, ast) =>
      pipe(
        input as never,
        formatter,
        Either.mapLeft((inputError) => new ParseResult.Type(ast, input, inputError.message)),
      ),
  }) as never;
};
