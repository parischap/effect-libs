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
import * as CVDateTime from '../date-time/index.js';
import * as CVTemplateParts from '../internal/formatting/template/TemplateParts.js';
import * as CVDateTimeFormat from './date-time-format/index.js';
import * as CVNumberBase10Format from './number-base10-format/index.js';
import * as CVTemplate from './template/index.js';
import * as CVTemplatePart from './template/TemplatePart/index.js';
import * as CVTemplatePlaceholder from './template/TemplatePart/template-placeholder/index.js';

/**
 * A `Schema` that transforms a string into a number according to the `format`. Read documentation
 * of module NumberBase10Format.ts for more details
 *
 * @category Schema transformations
 */
export const Real = (format: CVNumberBase10Format.Type): Schema.Schema<number, string> => {
  const parser = CVNumberBase10Format.toRealParser(format);
  const formatter = CVNumberBase10Format.toNumberFormatter(format);
  return Schema.transformOrFail(Schema.String, RealFromSelf, {
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
  const parser = CVNumberBase10Format.toBigDecimalParser(format);
  const formatter = CVNumberBase10Format.toNumberFormatter(format);
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
   * @category Schema transformations
   */
  BigDecimalFromString as BigDecimal,
};

/**
 * A `Schema` that represents a `CVDateTime`
 *
 * @category Schema instances
 */
export const DateTimeFromSelf = Schema.declare(
  (input: unknown): input is CVDateTime.Type => input instanceof CVDateTime.Type,
);

/**
 * A `Schema` that transforms a `CVDateTime` into a Javascript `Date`. Upon encoding, the
 * `CVDateTime` object is created with the default timeZoneOffset of the machine this code is
 * running on
 *
 * @category Schema transformations
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
 * @category Schema transformations
 */
export const DateTimeZonedFromDateTime: Schema.Schema<DateTime.Zoned, CVDateTime.Type> =
  Schema.transform(DateTimeFromSelf, Schema.DateTimeZonedFromSelf, {
    strict: true,
    decode: CVDateTime.toEffectDateTime,
    encode: CVDateTime.fromEffectDateTime,
  });

const DateTimeFromString = (
  format: CVDateTimeFormat.Type,
): Schema.Schema<CVDateTime.Type, string> => {
  const parser = CVDateTimeFormat.toParser(format);
  const formatter = CVDateTimeFormat.toFormatter(format);
  return Schema.transformOrFail(Schema.String, DateTimeFromSelf, {
    strict: true,
    decode: (input, _options, ast) =>
      pipe(
        input,
        parser,
        Either.mapLeft((inputError) => new ParseResult.Type(ast, input, inputError.message)),
      ),
    encode: (input, _options, ast) =>
      pipe(
        input,
        formatter,
        Either.mapLeft((inputError) => new ParseResult.Type(ast, input, inputError.message)),
      ),
  });
};

export {
  /**
   * A `Schema` that transforms a string into a `CVDateTime` according to `format`. Read documentation
   * of module DateTimeFormat.ts for more details
   *
   * @category Schema transformations
   */
  DateTimeFromString as DateTime,
};

/**
 * A `Schema` that transforms a string into a Javascript `Date` according to `format`. Read
 * documentation of module DateTimeFormat.ts for more details
 *
 * @category Schema transformations
 */
export const Date = (format: CVDateTimeFormat.Type): Schema.Schema<Date, string> =>
  Schema.compose(DateTimeFromString(format), DateFromDateTime);

/**
 * A `Schema` that transforms a string into an `Effect.DateTime.Zoned` according to `format`. Read
 * documentation of module DateTimeFormat.ts for more details
 *
 * @category Schema transformations
 */
export const DateTimeZoned = (
  format: CVDateTimeFormat.Type,
): Schema.Schema<DateTime.Zoned, string> =>
  Schema.compose(DateTimeFromString(format), DateTimeZonedFromDateTime);

/**
 * A `Schema` that transforms a string into an object according to template. Read documentation of
 * module Template.ts for more details
 *
 * @category Schema transformations
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
  const parser = CVTemplate.toParser(template);
  const formatter = CVTemplate.toFormatter(template);

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
