/**
 * An extension to the `effect/Schema` module: `Schema` instances, codecs and filters for number and
 * date formatting, parsing and comparison, and for templating.
 *
 * ## Mental model
 *
 * - A **codec** (`FiniteFromString`, `DateTimeFromString`, `Template`...) converts between a string
 *   (its encoded side) and a typed value (its decoded side). It is driven by a format object
 *   (`MNumberBase10Format`, `MDateTimeFormat` + `MDateTimeContext`, `MTemplate`) that is used both
 *   for parsing and for formatting.
 * - {@link DateTime} is the `Schema` of a `MDateTime`. Its encoded side is an object `{ timestamp,
 *   zoneOffset }`, so that a `MDateTime` can be serialized (JSON...) and generated for
 *   property-based testing (`Arbitrary`), e.g. when it is a field of a `MSchemaData` class.
 * - The **filters** (`isBetweenDateTime`...) check that a `MDateTime` is ordered with respect to
 *   given bounds. They are built with the `Schema.makeIs*` functions from {@link MDateTime.Order}.
 * - When a transformation fails, the issue carries a message that explains why.
 *
 * ## Common tasks
 *
 * - **Parse/format a number**: {@link FiniteFromString}, {@link BigDecimalFromString}
 * - **Parse/format a date-time**: {@link DateTimeFromString}, {@link DateFromString},
 *   {@link DateTimeZonedFromString}
 * - **Convert between date-time objects**: {@link DateFromDateTime},
 *   {@link DateTimeZonedFromDateTime}
 * - **Parse/format a structured text**: {@link Template}
 * - **Constrain a `MDateTime`**: {@link isGreaterThanDateTime},
 *   {@link isGreaterThanOrEqualToDateTime}, {@link isLessThanDateTime},
 *   {@link isLessThanOrEqualToDateTime}, {@link isBetweenDateTime}
 *
 * ## Gotchas
 *
 * - The filters on `MDateTime` compare timestamps and ignore the zone offset. Their bounds do not
 *   help `Arbitrary` to generate candidates: candidates are generated at random, then filtered.
 *
 * ## Quickstart
 *
 * **Example** (Parsing a number and constraining a `MDateTime`)
 *
 * ```ts
 * import { Schema } from 'effect';
 * import * as MDateTime from '@parischap/effect-lib/MDateTime';
 * import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
 * import * as MSchema from '@parischap/effect-lib/MSchema';
 *
 * const price = MSchema.FiniteFromString(MNumberBase10Format.frenchStyleNumber);
 * // 1024.56
 * console.log(Schema.decodeUnknownSync(price)('1 024,56'));
 *
 * const dateTime = MSchema.DateTime.check(
 *   MSchema.isGreaterThanOrEqualToDateTime(MDateTime.fromTimestampOrThrow(0)),
 * );
 * // Throws a `SchemaError`: Expected a value greater than or equal to 1970-01-01T00:00:00.000+00:00
 * Schema.decodeUnknownSync(dateTime)(MDateTime.fromTimestampOrThrow(-1));
 * ```
 *
 * @see {@link MDateTime.Order} — the `Order` the filters are built on
 */

import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import type * as BigDecimal from 'effect/BigDecimal';
import type * as DateTime from 'effect/DateTime';
import * as Effect from 'effect/Effect';
import * as Record from 'effect/Record';
import * as Result from 'effect/Result';
import * as Schema from 'effect/Schema';
import * as SchemaGetter from 'effect/SchemaGetter';
import * as SchemaIssue from 'effect/SchemaIssue';
import * as SchemaTransformation from 'effect/SchemaTransformation';
import * as Tuple from 'effect/Tuple';

import type * as MDateTimeContext from './DateTimeContext.js';
import type * as MDateTimeFormat from './DateTimeFormat.js';
import type * as MInputError from './InputError.js';
import type * as MNumberBase10Format from './NumberBase10Format.js';
import type * as MTemplate from './Template.js';
import type * as MTypes from './types/types.js';

import * as MBigDecimal from './BigDecimal.js';
import * as MDateTime from './DateTime.js';
import { MAX_TIMESTAMP, MIN_TIMESTAMP } from './internal/DateTime/date-time-constants.js';
import * as MMatch from './Match.js';
import * as MNumber from './Number.js';
import * as MString from './String/String.js';
import * as MTemplatePart from './TemplatePart/TemplatePart.js';
import * as MTemplatePlaceholder from './TemplatePart/TemplatePlaceholder.js';
import * as MTuple from './Tuple.js';

/** Builds the issue reported when a transformation fails. `message` explains why */
const invalidValue = (message: string): SchemaIssue.InvalidValue =>
  new SchemaIssue.InvalidValue({ message });

/** Builds the issue reported when a transformation fails because of the given `MInputError` */
const fromInputError = (self: MInputError.Type): SchemaIssue.InvalidValue =>
  invalidValue(self.message);

/**
 * A `Schema` that transforms a string into a number according to `format`. Read documentation of
 * module `NumberBase10Format.ts` for more details
 *
 * - Decoding fails if the string does not respect `format`.
 * - Encoding fails if the number cannot be formatted according to `format`.
 *
 * **Example** (Parsing and formatting a French-style number)
 *
 * ```ts
 * import { Schema } from 'effect';
 * import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
 * import * as MSchema from '@parischap/effect-lib/MSchema';
 *
 * const schema = MSchema.FiniteFromString(MNumberBase10Format.frenchStyleNumber);
 *
 * // 1024.56
 * console.log(Schema.decodeUnknownSync(schema)('1 024,56'));
 * // '1 024,56'
 * console.log(Schema.encodeSync(schema)(1024.56));
 * ```
 *
 * @category Utils
 */
export const FiniteFromString = (
  format: MNumberBase10Format.Type,
): Schema.Codec<number, string> => {
  const parseFunction = MNumber.fromFormatAndString(format);
  const formatFunction = MString.fromFormatAndNumber(format);
  return Schema.String.pipe(
    Schema.decodeTo(
      Schema.Finite,
      SchemaTransformation.transformEffect({
        decode: (s) =>
          pipe(
            s,
            parseFunction,
            Result.fromOption(() => invalidValue('Expected a number written in the given format')),
            Effect.fromResult,
          ),
        encode: (n) =>
          pipe(
            n,
            formatFunction,
            Result.fromOption(() =>
              invalidValue('Expected a number that can be written in the given format'),
            ),
            Effect.fromResult,
          ),
      }),
    ),
  );
};

/**
 * A `Schema` that transforms a string into a `BigDecimal` according to `format`. Read documentation
 * of module `NumberBase10Format.ts` for more details
 *
 * - Decoding fails if the string does not respect `format`.
 *
 * **Example** (Parsing and formatting a French-style `BigDecimal`)
 *
 * ```ts
 * import { BigDecimal, Schema } from 'effect';
 * import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
 * import * as MSchema from '@parischap/effect-lib/MSchema';
 *
 * const schema = MSchema.BigDecimalFromString(MNumberBase10Format.frenchStyleNumber);
 *
 * // BigDecimal(1024.56)
 * console.log(Schema.decodeUnknownSync(schema)('1 024,56'));
 * // '1 024,56'
 * console.log(Schema.encodeSync(schema)(BigDecimal.make(102_456n, 2)));
 * ```
 *
 * @category Utils
 */
export const BigDecimalFromString = (
  format: MNumberBase10Format.Type,
): Schema.Codec<BigDecimal.BigDecimal, string> => {
  const parseFunction = MBigDecimal.fromFormatAndString(format);
  const formatFunction = MString.fromFormatAndNumberOrThrow(format);
  return Schema.String.pipe(
    Schema.decodeTo(
      Schema.BigDecimal,
      SchemaTransformation.transformEffect({
        decode: (s) =>
          pipe(
            s,
            parseFunction,
            Result.fromOption(() => invalidValue('Expected a number written in the given format')),
            Effect.fromResult,
          ),
        encode: flow(formatFunction, Effect.succeed),
      }),
    ),
  );
};

/**
 * Encoded side of a `MDateTime` for serialization and property-based testing: an object that
 * contains its `timestamp` and its `zoneOffset`. `zoneOffset` is strictly between -13 and 15, i.e.
 * its integer part is between -12 and 14
 */
const dateTimeEncodedFields = {
  timestamp: Schema.Int.check(Schema.isBetween({ minimum: MIN_TIMESTAMP, maximum: MAX_TIMESTAMP })),
  zoneOffset: Schema.Finite.check(
    Schema.isBetween({
      minimum: -13,
      maximum: 15,
      exclusiveMinimum: true,
      exclusiveMaximum: true,
    }),
  ),
};

/** Transformation between a `MDateTime` and its encoded side described by `dateTimeEncodedFields` */
const dateTimeTransformation = SchemaTransformation.transformEffect({
  decode: ({
    timestamp,
    zoneOffset,
  }: {
    readonly timestamp: number;
    readonly zoneOffset: number;
  }) =>
    pipe(
      MDateTime.fromTimestamp(timestamp, zoneOffset),
      Result.mapError(fromInputError),
      Effect.fromResult,
    ),
  encode: (self: MDateTime.Type) =>
    Effect.succeed({ timestamp: self.timestamp, zoneOffset: self.zoneOffset }),
});

const DateTimeFromSelf: Schema.Codec<MDateTime.Type> = Schema.declare(
  (input: unknown): input is MDateTime.Type => input instanceof MDateTime.Type,
  {
    expected: 'MDateTime',
    toFormatter: () => MDateTime.getIsoString,
    toCodec: () =>
      Schema.link<MDateTime.Type>()(Schema.Struct(dateTimeEncodedFields), dateTimeTransformation),
    // Candidates are restricted to a realistic range: years 1900 to 2100 and integer zone offsets
    toCodecArbitrary: () =>
      Schema.link<MDateTime.Type>()(
        Schema.Struct({
          timestamp: Schema.Int.check(
            Schema.isBetween({ minimum: Date.UTC(1900, 0, 1), maximum: Date.UTC(2100, 0, 1) }),
          ),
          zoneOffset: Schema.Int.check(Schema.isBetween({ minimum: -12, maximum: 14 })),
        }),
        {
          decode: SchemaGetter.transform(({ timestamp, zoneOffset }) =>
            MDateTime.fromTimestampOrThrow(timestamp, zoneOffset),
          ),
          encode: SchemaGetter.transform((self) => ({
            timestamp: self.timestamp,
            zoneOffset: self.zoneOffset,
          })),
        },
      ),
  },
);

export {
  /**
   * A `Schema` that represents a `MDateTime`
   *
   * - Its encoded side (serialization) is an object `{ timestamp, zoneOffset }`.
   * - Errors refer to it as `MDateTime`.
   * - `Arbitrary` generates `MDateTime`'s between years 1900 and 2100 with integer zone offsets.
   *
   * **Example** (Serializing a `MDateTime` to JSON)
   *
   * ```ts
   * import { Schema } from 'effect';
   * import * as MDateTime from '@parischap/effect-lib/MDateTime';
   * import * as MSchema from '@parischap/effect-lib/MSchema';
   *
   * const jsonCodec = Schema.toCodecJson(MSchema.DateTime);
   *
   * // { timestamp: 0, zoneOffset: 2 }
   * console.log(Schema.encodeSync(jsonCodec)(MDateTime.fromTimestampOrThrow(0, 2)));
   * ```
   *
   * @category Instances
   */
  DateTimeFromSelf as DateTime,
};

/**
 * A `Schema` that transforms a `MDateTime` into a Javascript `Date`. Upon encoding, the `MDateTime`
 * object is created with the default timeZoneOffset of the machine this code is running on
 *
 * **Example** (Converting a `MDateTime` into a `Date`)
 *
 * ```ts
 * import { Schema } from 'effect';
 * import * as MDateTime from '@parischap/effect-lib/MDateTime';
 * import * as MSchema from '@parischap/effect-lib/MSchema';
 *
 * // 0
 * console.log(
 *   Schema.decodeUnknownSync(MSchema.DateFromDateTime)(
 *     MDateTime.fromTimestampOrThrow(0),
 *   ).getTime(),
 * );
 * ```
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
 * **Example** (Converting a `MDateTime` into an `effect/DateTime.Zoned`)
 *
 * ```ts
 * import { DateTime, Schema } from 'effect';
 * import * as MDateTime from '@parischap/effect-lib/MDateTime';
 * import * as MSchema from '@parischap/effect-lib/MSchema';
 *
 * // 0
 * console.log(
 *   DateTime.toEpochMillis(
 *     Schema.decodeUnknownSync(MSchema.DateTimeZonedFromDateTime)(
 *       MDateTime.fromTimestampOrThrow(0, 8),
 *     ),
 *   ),
 * );
 * ```
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
 * - Decoding fails, with the reason in the error message, if the string does not respect
 *   `dateTimeFormat`.
 * - Encoding fails if the `MDateTime` cannot be formatted according to `dateTimeFormat`.
 *
 * **Example** (Parsing a French-style date)
 *
 * ```ts
 * import { Schema } from 'effect';
 * import * as MDateTimeContext from '@parischap/effect-lib/MDateTimeContext';
 * import * as MDateTimeFormat from '@parischap/effect-lib/MDateTimeFormat';
 * import * as MSchema from '@parischap/effect-lib/MSchema';
 *
 * const { Token } = MDateTimeFormat;
 * const format = MDateTimeFormat.make(Token.dd, '/', Token.MM, '/', Token.yyyy);
 * const schema = MSchema.DateTimeFromString(
 *   format,
 *   MDateTimeContext.fromLocaleOrThrow('fr-FR'),
 * );
 *
 * // A `MDateTime` for 25 August 2025
 * console.log(Schema.decodeUnknownSync(schema)('25/08/2025'));
 * ```
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
      SchemaTransformation.transformEffect({
        decode: (s) => pipe(s, parseFunction, Result.mapError(fromInputError), Effect.fromResult),
        encode: (d) => pipe(d, formatFunction, Result.mapError(fromInputError), Effect.fromResult),
      }),
    ),
  );
};

/**
 * A `Schema` that transforms a string into a Javascript `Date` according to the given
 * `dateTimeFormat` and `dateTimeContext`. Read documentation of module `DateTime.ts` for more
 * details.
 *
 * - Same as {@link DateTimeFromString} followed by {@link DateFromDateTime}.
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
 * - Same as {@link DateTimeFromString} followed by {@link DateTimeZonedFromDateTime}.
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
 * A `Schema` that transforms a string into an object according to `template`. Read documentation of
 * module `Template.ts` for more details
 *
 * - Decoding fails, with the reason in the error message, if the string does not match `template`.
 * - Encoding fails if the object cannot be formatted according to `template`.
 *
 * **Example** (Parsing a sentence)
 *
 * ```ts
 * import { Schema } from 'effect';
 * import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
 * import * as MRegExpString from '@parischap/effect-lib/MRegExpString';
 * import * as MSchema from '@parischap/effect-lib/MSchema';
 * import * as MTemplate from '@parischap/effect-lib/MTemplate';
 * import * as MTemplatePlaceholder from '@parischap/effect-lib/MTemplatePlaceholder';
 * import * as MTemplateSeparator from '@parischap/effect-lib/MTemplateSeparator';
 *
 * const ph = MTemplatePlaceholder;
 * const sep = MTemplateSeparator;
 *
 * // "#name is a #age-year old #kind."
 * const template = MTemplate.make(
 *   ph.anythingBut({ name: 'name', forbiddenChars: [MRegExpString.space] }),
 *   sep.make(' is a '),
 *   ph.number({ name: 'age', numberBase10Format: MNumberBase10Format.unsignedInteger }),
 *   sep.make('-year old '),
 *   ph.anythingBut({ name: 'kind', forbiddenChars: ['.'] }),
 *   sep.dot,
 * );
 *
 * // { name: 'Jon', age: 24, kind: 'dog' }
 * console.log(Schema.decodeSync(MSchema.Template(template))('Jon is a 24-year old dog.'));
 * ```
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
      SchemaTransformation.transformEffect({
        decode: (s) => pipe(s, parseFunction, Result.mapError(fromInputError), Effect.fromResult),
        encode: (d) => pipe(d, formatFunction, Result.mapError(fromInputError), Effect.fromResult),
      }),
    ),
  );
};

/**
 * Options shared by the `Schema.makeIs*` functions below: the filters compare timestamps (see
 * `MDateTime.Order`) and write the bounds as ISO strings in error messages
 */
const dateTimeOptions = {
  order: MDateTime.Order,
  formatter: MDateTime.getIsoString,
} as const;

/**
 * A filter that checks that a `MDateTime` is strictly later than a given `MDateTime`
 *
 * - Compares timestamps: the zone offset is ignored.
 * - Fails with the message `Expected a value greater than <bound>`.
 *
 * **Example** (Checking that a `MDateTime` is after the epoch)
 *
 * ```ts
 * import { Schema } from 'effect';
 * import * as MDateTime from '@parischap/effect-lib/MDateTime';
 * import * as MSchema from '@parischap/effect-lib/MSchema';
 *
 * const schema = MSchema.DateTime.check(
 *   MSchema.isGreaterThanDateTime(MDateTime.fromTimestampOrThrow(0)),
 * );
 *
 * // Passes
 * Schema.decodeUnknownSync(schema)(MDateTime.fromTimestampOrThrow(1));
 * // Throws a `SchemaError`: Expected a value greater than 1970-01-01T00:00:00.000+00:00
 * Schema.decodeUnknownSync(schema)(MDateTime.fromTimestampOrThrow(0));
 * ```
 *
 * @category Filters
 *
 * @see {@link isGreaterThanOrEqualToDateTime} — inclusive version
 */
export const isGreaterThanDateTime = Schema.makeIsGreaterThan(dateTimeOptions);

/**
 * A filter that checks that a `MDateTime` is later than or equal to a given `MDateTime`
 *
 * - Compares timestamps: the zone offset is ignored.
 * - Fails with the message `Expected a value greater than or equal to <bound>`.
 *
 * **Example** (Checking that a `MDateTime` is not before the epoch)
 *
 * ```ts
 * import { Schema } from 'effect';
 * import * as MDateTime from '@parischap/effect-lib/MDateTime';
 * import * as MSchema from '@parischap/effect-lib/MSchema';
 *
 * const schema = MSchema.DateTime.check(
 *   MSchema.isGreaterThanOrEqualToDateTime(MDateTime.fromTimestampOrThrow(0)),
 * );
 *
 * // Passes
 * Schema.decodeUnknownSync(schema)(MDateTime.fromTimestampOrThrow(0));
 * // Throws a `SchemaError`: Expected a value greater than or equal to 1970-01-01T00:00:00.000+00:00
 * Schema.decodeUnknownSync(schema)(MDateTime.fromTimestampOrThrow(-1));
 * ```
 *
 * @category Filters
 *
 * @see {@link isGreaterThanDateTime} — exclusive version
 */
export const isGreaterThanOrEqualToDateTime = Schema.makeIsGreaterThanOrEqualTo(dateTimeOptions);

/**
 * A filter that checks that a `MDateTime` is strictly earlier than a given `MDateTime`
 *
 * - Compares timestamps: the zone offset is ignored.
 * - Fails with the message `Expected a value less than <bound>`.
 *
 * **Example** (Checking that a `MDateTime` is before the epoch)
 *
 * ```ts
 * import { Schema } from 'effect';
 * import * as MDateTime from '@parischap/effect-lib/MDateTime';
 * import * as MSchema from '@parischap/effect-lib/MSchema';
 *
 * const schema = MSchema.DateTime.check(
 *   MSchema.isLessThanDateTime(MDateTime.fromTimestampOrThrow(0)),
 * );
 *
 * // Passes
 * Schema.decodeUnknownSync(schema)(MDateTime.fromTimestampOrThrow(-1));
 * // Throws a `SchemaError`: Expected a value less than 1970-01-01T00:00:00.000+00:00
 * Schema.decodeUnknownSync(schema)(MDateTime.fromTimestampOrThrow(0));
 * ```
 *
 * @category Filters
 *
 * @see {@link isLessThanOrEqualToDateTime} — inclusive version
 */
export const isLessThanDateTime = Schema.makeIsLessThan(dateTimeOptions);

/**
 * A filter that checks that a `MDateTime` is earlier than or equal to a given `MDateTime`
 *
 * - Compares timestamps: the zone offset is ignored.
 * - Fails with the message `Expected a value less than or equal to <bound>`.
 *
 * **Example** (Checking that a `MDateTime` is not after the epoch)
 *
 * ```ts
 * import { Schema } from 'effect';
 * import * as MDateTime from '@parischap/effect-lib/MDateTime';
 * import * as MSchema from '@parischap/effect-lib/MSchema';
 *
 * const schema = MSchema.DateTime.check(
 *   MSchema.isLessThanOrEqualToDateTime(MDateTime.fromTimestampOrThrow(0)),
 * );
 *
 * // Passes
 * Schema.decodeUnknownSync(schema)(MDateTime.fromTimestampOrThrow(0));
 * // Throws a `SchemaError`: Expected a value less than or equal to 1970-01-01T00:00:00.000+00:00
 * Schema.decodeUnknownSync(schema)(MDateTime.fromTimestampOrThrow(1));
 * ```
 *
 * @category Filters
 *
 * @see {@link isLessThanDateTime} — exclusive version
 */
export const isLessThanOrEqualToDateTime = Schema.makeIsLessThanOrEqualTo(dateTimeOptions);

/**
 * A filter that checks that a `MDateTime` is within a range
 *
 * - Compares timestamps: the zone offset is ignored.
 * - The bounds are inclusive unless `exclusiveMinimum` or `exclusiveMaximum` is `true`.
 * - Fails with the message `Expected a value between <minimum> and <maximum>`, followed by
 *   `(excluded)` after an excluded bound.
 *
 * **Example** (Checking that a `MDateTime` is within the first second of the epoch)
 *
 * ```ts
 * import { Schema } from 'effect';
 * import * as MDateTime from '@parischap/effect-lib/MDateTime';
 * import * as MSchema from '@parischap/effect-lib/MSchema';
 *
 * const schema = MSchema.DateTime.check(
 *   MSchema.isBetweenDateTime({
 *     minimum: MDateTime.fromTimestampOrThrow(0),
 *     maximum: MDateTime.fromTimestampOrThrow(1000),
 *     exclusiveMaximum: true,
 *   }),
 * );
 *
 * // Passes
 * Schema.decodeUnknownSync(schema)(MDateTime.fromTimestampOrThrow(999));
 * // Throws a `SchemaError`: Expected a value between 1970-01-01T00:00:00.000+00:00 and
 * // 1970-01-01T00:00:01.000+00:00 (excluded)
 * Schema.decodeUnknownSync(schema)(MDateTime.fromTimestampOrThrow(1000));
 * ```
 *
 * @category Filters
 */
export const isBetweenDateTime = Schema.makeIsBetween(dateTimeOptions);
