/**
 * An extension to the `Effect.Schema` module that adds Schema instances for number and date
 * formatting and parsing and implements new brands
 */

import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import type * as BigDecimal from 'effect/BigDecimal';
import type * as DateTime from 'effect/DateTime';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as Record from 'effect/Record';
import * as Result from 'effect/Result';
import * as Schema from 'effect/Schema';
import * as SchemaIssue from 'effect/SchemaIssue';
import * as SchemaTransformation from 'effect/SchemaTransformation';
import * as Tuple from 'effect/Tuple';

import * as MMatch from '@parischap/effect-lib/MMatch';
import * as MResult from '@parischap/effect-lib/MResult';
import * as MTuple from '@parischap/effect-lib/MTuple';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import type * as CVNumberBase10Format from './NumberBase10Format/NumberBase10Format.js';
import type * as CVTemplate from './template/Template.js';

import * as CVDateTime from '../DateTime/DateTime.js';
import * as CVDateTimeFormatter from './DateTimeFormat/DateTimeFormatter.js';
import * as CVDateTimeParser from './DateTimeFormat/DateTimeParser.js';
import * as CVNumberBase10Formatter from './NumberBase10Format/NumberBase10Formatter.js';
import * as CVNumberBase10Parser from './NumberBase10Format/NumberBase10Parser.js';
import * as CVTemplateFormatter from './template/TemplateFormatter.js';
import * as CVTemplateParser from './template/TemplateParser.js';
import * as CVTemplatePart from './template/TemplatePart/TemplatePart.js';
import * as CVTemplatePlaceholder from './template/TemplatePart/TemplatePlaceholder/TemplatePlaceholder.js';

/**
 * A `Schema` that transforms a string into a number according to the `format`. Read documentation
 * of module NumberBase10Format.ts for more details
 *
 * @category Utils
 */
export const FiniteFromString = (
  format: CVNumberBase10Format.Type,
): Schema.Codec<number, string> => {
  const parseFunction = pipe(
    format,
    CVNumberBase10Parser.fromFormat,
    CVNumberBase10Parser.parseAsNumber,
  );
  const formatFunction = pipe(
    format,
    CVNumberBase10Formatter.fromFormat,
    CVNumberBase10Formatter.format,
  );
  return Schema.String.pipe(
    Schema.decodeTo(
      Schema.Finite,
      SchemaTransformation.transformOrFail({
        decode: (s) =>
          pipe(
            s,
            parseFunction,
            Result.fromOption(() => new SchemaIssue.InvalidValue(Option.some(s))),
            MResult.asEffect,
          ),
        encode: flow(formatFunction, Effect.succeed),
      }),
    ),
  );
};

/**
 * A `Schema` that transforms a string into a `BigDecimal` according to `format`. Read documentation
 * of module NumberBase10Format.ts for more details
 *
 * @category Utils
 */
export const BigDecimalFromString = (
  format: CVNumberBase10Format.Type,
): Schema.Codec<BigDecimal.BigDecimal, string> => {
  const parseFunction = pipe(
    format,
    CVNumberBase10Parser.fromFormat,
    CVNumberBase10Parser.parseAsBigDecimal,
  );
  const formatFunction = pipe(
    format,
    CVNumberBase10Formatter.fromFormat,
    CVNumberBase10Formatter.format,
  );
  return Schema.String.pipe(
    Schema.decodeTo(
      Schema.BigDecimal,
      SchemaTransformation.transformOrFail({
        decode: (s) =>
          pipe(
            s,
            parseFunction,
            Result.fromOption(() => new SchemaIssue.InvalidValue(Option.some(s))),
            MResult.asEffect,
          ),
        encode: flow(formatFunction, Effect.succeed),
      }),
    ),
  );
};

const CVDateTimeFromSelf: Schema.Codec<CVDateTime.Type> = Schema.declare(
  (input: unknown): input is CVDateTime.Type => input instanceof CVDateTime.Type,
);

type CVDateTimeFromSelf = typeof CVDateTimeFromSelf;

export {
  /**
   * A `Schema` that represents a `CVDateTime`
   *
   * @category Instances
   */
  CVDateTimeFromSelf as CVDateTime,
};

/**
 * A `Schema` that transforms a `CVDateTime` into a Javascript `Date`. Upon encoding, the
 * `CVDateTime` object is created with the default timeZoneOffset of the machine this code is
 * running on
 *
 * @category Utils
 */
export const DateFromCVDateTime: Schema.Codec<Date, CVDateTime.Type> = CVDateTimeFromSelf.pipe(
  Schema.decodeTo(
    Schema.Date,
    SchemaTransformation.transform({
      decode: CVDateTime.toDate,
      encode: CVDateTime.fromDate,
    }),
  ),
);

/**
 * A `Schema` that transforms a `CVDateTime` into an `Effect.DateTime.Zoned`. Both objects share the
 * same time zone offset
 *
 * @category Utils
 */
export const DateTimeZonedFromCVDateTime: Schema.Codec<DateTime.Zoned, CVDateTime.Type> =
  CVDateTimeFromSelf.pipe(
    Schema.decodeTo(
      Schema.DateTimeZoned,
      SchemaTransformation.transform({
        decode: CVDateTime.toEffectDateTime,
        encode: CVDateTime.fromEffectDateTime,
      }),
    ),
  );

/**
 * A `Schema` that transforms a string into a `CVDateTime` according to the given `parser` and
 * `formatter`. Read documentation of modules DateTimeParser.ts and DateTimeFormatter.ts for more
 * details.
 *
 * @category Utils
 */
export const CVDateTimeFromString = (
  parser: CVDateTimeParser.Type,
  formatter: CVDateTimeFormatter.Type,
): Schema.Codec<CVDateTime.Type, string> => {
  const parseFunction = CVDateTimeParser.parse(parser);
  const formatFunction = CVDateTimeFormatter.format(formatter);
  return Schema.String.pipe(
    Schema.decodeTo(
      CVDateTimeFromSelf,
      SchemaTransformation.transformOrFail({
        decode: (s) =>
          pipe(
            s,
            parseFunction,
            Result.mapError(() => new SchemaIssue.InvalidValue(Option.some(s))),
            MResult.asEffect,
          ),
        encode: (d) =>
          pipe(
            d,
            formatFunction,
            Result.mapError(() => new SchemaIssue.InvalidValue(Option.some(d))),
            MResult.asEffect,
          ),
      }),
    ),
  );
};

/**
 * A `Schema` that transforms a string into a Javascript `Date` according to the given `parser` and
 * `formatter`. Read documentation of modules DateTimeParser.ts and DateTimeFormatter.ts for more
 * details.
 *
 * @category Utils
 */
export const DateFromString = (
  parser: CVDateTimeParser.Type,
  formatter: CVDateTimeFormatter.Type,
): Schema.Codec<Date, string> =>
  CVDateTimeFromString(parser, formatter).pipe(Schema.decodeTo(DateFromCVDateTime));

/**
 * A `Schema` that transforms a string into an `Effect.DateTime.Zoned` according to the given
 * `parser` and `formatter`. Read documentation of modules DateTimeParser.ts and
 * DateTimeFormatter.ts for more details.
 *
 * @category Utils
 */
export const DateTimeZonedFromString = (
  parser: CVDateTimeParser.Type,
  formatter: CVDateTimeFormatter.Type,
): Schema.Codec<DateTime.Zoned, string> =>
  CVDateTimeFromString(parser, formatter).pipe(Schema.decodeTo(DateTimeZonedFromCVDateTime));

/**
 * A `Schema` that transforms a string into an object according to `template`. Read documentation of
 * module Template.ts for more details
 *
 * @category Utils
 */
export const Template = <PlaceholderTypes extends MTypes.NonPrimitive>(
  template: CVTemplate.Type<PlaceholderTypes>,
): Schema.Codec<PlaceholderTypes, string> => {
  const parseFunction = pipe(template, CVTemplateParser.fromTemplate, CVTemplateParser.parse);
  const formatFunction = pipe(
    template,
    CVTemplateFormatter.fromTemplate,
    CVTemplateFormatter.format,
  );

  const schemaOutput = pipe(
    template.templateParts,
    Array.filterMap(
      flow(
        MMatch.make,
        MMatch.when(CVTemplatePart.isSeparator, () => Result.failVoid),
        MMatch.when(
          CVTemplatePart.isPlaceholder,
          flow(
            MTuple.replicate(2),
            Tuple.evolve(
              Tuple.make(CVTemplatePlaceholder.name, CVTemplatePlaceholder.tSchemaInstance),
            ),
            Result.succeed,
          ),
        ),
        MMatch.exhaustive,
      ),
    ),
    Record.fromEntries,
    Schema.Struct,
  ) as Schema.Codec<PlaceholderTypes>;

  return Schema.String.pipe(
    Schema.decodeTo(
      schemaOutput,
      SchemaTransformation.transformOrFail({
        decode: (s) =>
          pipe(
            s,
            parseFunction,
            Result.mapError(() => new SchemaIssue.InvalidValue(Option.some(s))),
            MResult.asEffect,
          ),
        encode: (d) =>
          pipe(
            d,
            formatFunction,
            Result.mapError(() => new SchemaIssue.InvalidValue(Option.some(d))),
            MResult.asEffect,
          ),
      }),
    ),
  ) as never;
};
