/**
 * An extension to the `effect/Schema` module that adds Schema instances for number and date
 * formatting and parsing and implements new brands
 */

import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import type * as BigDecimal from 'effect/BigDecimal';
import type * as DateTime from 'effect/DateTime';
import * as Effect from 'effect/Effect';
import * as Record from 'effect/Record';
import * as Result from 'effect/Result';
import * as Schema from 'effect/Schema';
import * as SchemaIssue from 'effect/SchemaIssue';
import * as SchemaTransformation from 'effect/SchemaTransformation';
import * as Tuple from 'effect/Tuple';

import type * as MTypes from './types/types.js';

import * as MBigDecimal from './BigDecimal.js';
import * as MDateTime from './DateTime.js';
import type * as MDateTimeContext from './DateTimeContext.js';
import type * as MDateTimeFormat from './DateTimeFormat.js';
import * as MMatch from './Match.js';
import * as MNumber from './Number.js';
import type * as MNumberBase10Format from './NumberBase10Format.js';
import * as MString from './String/String.js';
import type * as MTemplate from './Template.js';
import * as MTemplatePart from './TemplatePart/TemplatePart.js';
import * as MTemplatePlaceholder from './TemplatePart/TemplatePlaceholder.js';
import * as MTuple from './Tuple.js';

/**
 * A `Schema` that transforms a string into a number according to `format`. Read documentation of
 * module `NumberBase10Format.ts` for more details
 *
 * @category Utils
 */
export const FiniteFromString = (
  format: MNumberBase10Format.Type,
): Schema.Codec<number, string> => {
  const parseFunction = MNumber.parseFromString(format);
  const formatFunction = MString.parseFromNumber(format);
  return Schema.String.pipe(
    Schema.decodeTo(
      Schema.Finite,
      SchemaTransformation.transformOrFail({
        decode: (s) =>
          pipe(
            s,
            parseFunction,
            Result.fromOption(() => new SchemaIssue.InvalidValue(undefined, s)),
            Effect.fromResult,
          ),
        encode: (s) =>
          pipe(
            s,
            formatFunction,
            Result.fromOption(() => new SchemaIssue.InvalidValue(undefined, s)),
            Effect.fromResult,
          ),
      }),
    ),
  );
};

/**
 * A `Schema` that transforms a string into a `BigDecimal` according to `format`. Read
 * documentation of module `NumberBase10Format.ts` for more details
 *
 * @category Utils
 */
export const BigDecimalFromString = (
  format: MNumberBase10Format.Type,
): Schema.Codec<BigDecimal.BigDecimal, string> => {
  const parseFunction = MBigDecimal.parseFromString(format);
  const formatFunction = MString.parseFromNumberOrThrow(format);
  return Schema.String.pipe(
    Schema.decodeTo(
      Schema.BigDecimal,
      SchemaTransformation.transformOrFail({
        decode: (s) =>
          pipe(
            s,
            parseFunction,
            Result.fromOption(() => new SchemaIssue.InvalidValue(undefined, s)),
            Effect.fromResult,
          ),
        encode: flow(formatFunction, Effect.succeed),
      }),
    ),
  );
};

const DateTimeFromSelf: Schema.Codec<MDateTime.Type> = Schema.declare(
  (input: unknown): input is MDateTime.Type => input instanceof MDateTime.Type,
);

export {
  /**
   * A `Schema` that represents a `MDateTime`
   *
   * @category Instances
   */
  DateTimeFromSelf as DateTime,
};

/**
 * A `Schema` that transforms a `MDateTime` into a Javascript `Date`. Upon encoding, the
 * `MDateTime` object is created with the default timeZoneOffset of the machine this code is
 * running on
 *
 * @category Utils
 */
export const DateFromDateTime: Schema.Codec<Date, MDateTime.Type> = DateTimeFromSelf.pipe(
  Schema.decodeTo(
    Schema.Date,
    SchemaTransformation.transform({
      decode: MDateTime.toDate,
      encode: MDateTime.fromDate,
    }),
  ),
);

/**
 * A `Schema` that transforms a `MDateTime` into an `effect/DateTime.Zoned`. Both objects share the
 * same time zone offset
 *
 * @category Utils
 */
export const DateTimeZonedFromDateTime: Schema.Codec<DateTime.Zoned, MDateTime.Type> =
  DateTimeFromSelf.pipe(
    Schema.decodeTo(
      Schema.DateTimeZoned,
      SchemaTransformation.transform({
        decode: MDateTime.toEffectDateTime,
        encode: MDateTime.fromEffectDateTime,
      }),
    ),
  );

/**
 * A `Schema` that transforms a string into a `MDateTime` according to the given `dateTimeFormat`
 * and `dateTimeContext`. Read documentation of module `DateTime.ts` for more details.
 *
 * @category Utils
 */
export const DateTimeFromString = (
  dateTimeFormat: MDateTimeFormat.Type,
  dateTimeContext: MDateTimeContext.Type,
): Schema.Codec<MDateTime.Type, string> => {
  const parseFunction = MDateTime.parse(dateTimeFormat, dateTimeContext);
  const formatFunction = MDateTime.format(dateTimeFormat, dateTimeContext);
  return Schema.String.pipe(
    Schema.decodeTo(
      DateTimeFromSelf,
      SchemaTransformation.transformOrFail({
        decode: (s) =>
          pipe(
            s,
            parseFunction,
            Result.mapError(() => new SchemaIssue.InvalidValue(undefined, s)),
            Effect.fromResult,
          ),
        encode: (d) =>
          pipe(
            d,
            formatFunction,
            Result.mapError(() => new SchemaIssue.InvalidValue(undefined, d)),
            Effect.fromResult,
          ),
      }),
    ),
  );
};

/**
 * A `Schema` that transforms a string into a Javascript `Date` according to the given
 * `dateTimeFormat` and `dateTimeContext`. Read documentation of module `DateTime.ts` for more
 * details.
 *
 * @category Utils
 */
export const DateFromString = (
  dateTimeFormat: MDateTimeFormat.Type,
  dateTimeContext: MDateTimeContext.Type,
): Schema.Codec<Date, string> =>
  DateTimeFromString(dateTimeFormat, dateTimeContext).pipe(Schema.decodeTo(DateFromDateTime));

/**
 * A `Schema` that transforms a string into an `effect/DateTime.Zoned` according to the given
 * `dateTimeFormat` and `dateTimeContext`. Read documentation of module `DateTime.ts` for more
 * details.
 *
 * @category Utils
 */
export const DateTimeZonedFromString = (
  dateTimeFormat: MDateTimeFormat.Type,
  dateTimeContext: MDateTimeContext.Type,
): Schema.Codec<DateTime.Zoned, string> =>
  DateTimeFromString(dateTimeFormat, dateTimeContext).pipe(
    Schema.decodeTo(DateTimeZonedFromDateTime),
  );

/**
 * A `Schema` that transforms a string into an object according to `template`. Read documentation
 * of module `Template.ts` for more details
 *
 * @category Utils
 */
export const Template = <PlaceholderTypes extends MTypes.Object>(
  template: MTemplate.Type<PlaceholderTypes>,
): Schema.Codec<PlaceholderTypes, string> => {
  const parseFunction = MString.templateParse(template);
  const formatFunction = MString.templateFormat(template);

  const schemaOutput = pipe(
    template.templateParts,
    Array.filterMap(
      flow(
        MMatch.make,
        MMatch.when(MTemplatePart.isSeparator, () => Result.failVoid),
        MMatch.when(
          MTemplatePart.isPlaceholder,
          flow(
            MTuple.replicate(2),
            Tuple.evolve(
              Tuple.make(MTemplatePlaceholder.name, MTemplatePlaceholder.tSchemaInstance),
            ),
            Result.succeed,
          ),
        ),
        MMatch.exhaustive,
      ),
    ),
    Record.fromEntries,
    Schema.Struct,
  ) as unknown as Schema.Codec<PlaceholderTypes>;

  return Schema.String.pipe(
    Schema.decodeTo(
      schemaOutput,
      SchemaTransformation.transformOrFail({
        decode: (s) =>
          pipe(
            s,
            parseFunction,
            Result.mapError(() => new SchemaIssue.InvalidValue(undefined, s)),
            Effect.fromResult,
          ),
        encode: (d) =>
          pipe(
            d,
            formatFunction,
            Result.mapError(() => new SchemaIssue.InvalidValue(undefined, d)),
            Effect.fromResult,
          ),
      }),
    ),
  );
};
