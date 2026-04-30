/** This module implements the time part of a date */

import { pipe } from 'effect';
import * as Function from 'effect/Function';
import * as Number from 'effect/Number';
import * as Result from 'effect/Result';
import * as Struct from 'effect/Struct';

import * as MData from '@parischap/effect-lib/MData';
import * as MInputError from '@parischap/effect-lib/MInputError';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import { HOUR_MS, MINUTE_MS, SECOND_MS } from '../../DateTime/date-time-constants.js';
import * as CVNumberBase10Format from '../../formatting/NumberBase10Format/NumberBase10Format.js';
import * as CVTemplateFormatter from '../../formatting/template/TemplateFormatter.js';
import * as CVTemplatePlaceholder from '../../formatting/template/TemplatePart/TemplatePlaceholder/TemplatePlaceholder.js';
import * as CVTemplateSeparator from '../../formatting/template/TemplatePart/TemplateSeparator/TemplateSeparator.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/internal/DateTime/Time/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

const sep = CVTemplateSeparator;

const formatter = pipe(
  CVTemplateFormatter.fromTemplateParts(
    CVTemplatePlaceholder.number({
      name: 'hour23',
      numberBase10Format: CVNumberBase10Format.twoDigitUnsignedInteger,
    }),
    sep.colon,
    CVTemplatePlaceholder.number({
      name: 'minute',
      numberBase10Format: CVNumberBase10Format.twoDigitUnsignedInteger,
    }),
    sep.colon,
    CVTemplatePlaceholder.number({
      name: 'second',
      numberBase10Format: CVNumberBase10Format.twoDigitUnsignedInteger,
    }),
    sep.dot,
    CVTemplatePlaceholder.number({
      name: 'millisecond',
      numberBase10Format: CVNumberBase10Format.threeDigitUnsignedInteger,
    }),
  ),
  CVTemplateFormatter.format,
  Function.compose(Result.getOrThrowWith(Function.identity)),
);

/**
 * Type that represents a CVTime
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** This Time expressed in milliseconds, range:[0, DAY_MS[ */
  readonly timestampOffset: number;

  /** Hour23 of this Time, range:[0, 23] */
  readonly hour23: number;

  /** Hour11 of this Time, range:[0, 11] */
  readonly hour11: number;

  /** Meridiem of this Time, 0 for 'AM', 12 for 'PM' */
  readonly meridiem: 0 | 12;

  /** Minute of this Time, range:[0, 59] */
  readonly minute: number;

  /** Second of this Time, range:[0, 59] */
  readonly second: number;

  /** Millisecond of this Time, range:[0, 999] */
  readonly millisecond: number;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return moduleTag;
  }

  /** Class constructor */
  constructor({
    timestampOffset,
    hour23,
    hour11,
    meridiem,
    minute,
    second,
    millisecond,
  }: MTypes.Data<Type>) {
    super();
    this.timestampOffset = timestampOffset;
    this.hour23 = hour23;
    this.hour11 = hour11;
    this.meridiem = meridiem;
    this.minute = minute;
    this.second = second;
    this.millisecond = millisecond;
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

const make = (params: MTypes.Data<Type>): Type => new Type(params);

/**
 * Constructs the Time that corresponds to the passed `timestampOffset` which is the number of
 * milliseconds from the start of the current day
 *
 * @category Constructors
 */
export const fromTimestamp = (timestampOffset: number): Type => {
  const hour23 = Math.floor(timestampOffset / HOUR_MS);
  const rHour23 = timestampOffset - hour23 * HOUR_MS;

  const [hour11, meridiem] = hour23 >= 12 ? ([hour23 - 12, 12] as const) : ([hour23, 0] as const);

  const minute = Math.floor(rHour23 / MINUTE_MS);
  const rMinute = rHour23 - minute * MINUTE_MS;

  const second = Math.floor(rMinute / SECOND_MS);

  return make({
    timestampOffset,
    hour23,
    hour11,
    meridiem,
    minute,
    second,
    millisecond: rMinute - second * SECOND_MS,
  });
};

/**
 * If possible, returns a success of a copy of `self` with `hour23` set to `hour23`. Returns a
 * failure of an error otherwise. `hour23` must be an integer greater than or equal to 0 and less
 * than or equal to 23
 *
 * @category Setters
 */
export const setHour23 =
  (hour23: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    Result.gen(function* () {
      const validatedHour23 = yield* pipe(
        hour23,
        MInputError.assertInRange({
          min: 0,
          max: 23,
          minIncluded: true,
          maxIncluded: true,
          offset: 0,
          name: "'hour23'",
        }),
      );

      const isPast12 = validatedHour23 >= 12;
      return pipe(
        self,
        Struct.evolve({
          timestampOffset: Number.sum((validatedHour23 - self.hour23) * HOUR_MS),
          hour23: Function.constant(validatedHour23),
          hour11: Function.constant(isPast12 ? validatedHour23 - 12 : validatedHour23),
          meridiem: Function.constant(isPast12 ? (12 as const) : (0 as const)),
        }),
        make,
      );
    });

/**
 * If possible, returns a success of a copy of `self` with `hour11` set to `hour11`. Returns a
 * failure of an error otherwise. `hour11` must be an integer greater than or equal to 0 and less
 * than or equal to 11
 *
 * @category Setters
 */
export const setHour11 =
  (hour11: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    Result.gen(function* () {
      const validatedHour11 = yield* pipe(
        hour11,
        MInputError.assertInRange({
          min: 0,
          max: 11,
          minIncluded: true,
          maxIncluded: true,
          offset: 0,
          name: "'hour11'",
        }),
      );
      const validatedHour23 = self.meridiem + validatedHour11;
      return pipe(
        self,
        Struct.evolve({
          timestampOffset: Number.sum((validatedHour23 - self.hour23) * HOUR_MS),
          hour23: Function.constant(validatedHour23),
          hour11: Function.constant(validatedHour11),
        }),
        make,
      );
    });

/**
 * Returns a copy of `self` with `meridiem` set to `meridiem`.
 *
 * @category Setters
 */
export const setMeridiem =
  (meridiem: 0 | 12) =>
  (self: Type): Type => {
    const validatedHour23 = self.hour11 + meridiem;
    return pipe(
      self,
      Struct.evolve({
        timestampOffset: Number.sum((validatedHour23 - self.hour23) * HOUR_MS),
        hour23: Function.constant(validatedHour23),
        meridiem: Function.constant(meridiem),
      }),
      make,
    );
  };

/**
 * If possible, returns a success of a copy of `self` with `minute` set to `minute`. Returns a
 * failure of an error otherwise. `minute` must be an integer greater than or equal to 0 and less
 * than or equal to 59
 *
 * @category Setters
 */
export const setMinute =
  (minute: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    Result.gen(function* () {
      const validatedMinute = yield* pipe(
        minute,
        MInputError.assertInRange({
          min: 0,
          max: 59,
          minIncluded: true,
          maxIncluded: true,
          offset: 0,
          name: "'minute'",
        }),
      );

      return pipe(
        self,
        Struct.evolve({
          timestampOffset: Number.sum((validatedMinute - self.minute) * MINUTE_MS),
          minute: Function.constant(validatedMinute),
        }),
        make,
      );
    });

/**
 * If possible, returns a success of a copy of `self` with `second` set to `second`. Returns a
 * failure of an error otherwise. `second` must be an integer greater than or equal to 0 and less
 * than or equal to 59
 *
 * @category Setters
 */
export const setSecond =
  (second: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    Result.gen(function* () {
      const validatedSecond = yield* pipe(
        second,
        MInputError.assertInRange({
          min: 0,
          max: 59,
          minIncluded: true,
          maxIncluded: true,
          offset: 0,
          name: "'second'",
        }),
      );

      return pipe(
        self,
        Struct.evolve({
          timestampOffset: Number.sum((validatedSecond - self.second) * SECOND_MS),
          second: Function.constant(validatedSecond),
        }),
        make,
      );
    });

/**
 * If possible, returns a success of a copy of `self` with `millisecond` set to `millisecond`.
 * Returns a left of an error otherwise. `millisecond` must be an integer greater than or equal to 0
 * and less than or equal to 999
 *
 * @category Setters
 */
export const setMillisecond =
  (millisecond: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    Result.gen(function* () {
      const validatedMillisecond = yield* pipe(
        millisecond,
        MInputError.assertInRange({
          min: 0,
          max: 999,
          minIncluded: true,
          maxIncluded: true,
          offset: 0,
          name: "'millisecond'",
        }),
      );

      return pipe(
        self,
        Struct.evolve({
          timestampOffset: Number.sum(validatedMillisecond - self.millisecond),
          millisecond: Function.constant(validatedMillisecond),
        }),
        make,
      );
    });

/**
 * Returns the `timestampOffset` property of `self`
 *
 * @category Getters
 */
export const timestampOffset: MTypes.OneArgFunction<Type, number> = Struct.get('timestampOffset');

/**
 * Returns the `hour23` property of `self`
 *
 * @category Getters
 */
export const hour23: MTypes.OneArgFunction<Type, number> = Struct.get('hour23');
/**
 * Returns the `hour11` property of `self`
 *
 * @category Getters
 */
export const hour11: MTypes.OneArgFunction<Type, number> = Struct.get('hour11');

/**
 * Returns the `meridiem` property of `self`
 *
 * @category Getters
 */
export const meridiem: MTypes.OneArgFunction<Type, 0 | 12> = Struct.get('meridiem');

/**
 * Returns the `minute` property of `self`
 *
 * @category Getters
 */
export const minute: MTypes.OneArgFunction<Type, number> = Struct.get('minute');

/**
 * Returns the `second` property of `self`
 *
 * @category Getters
 */
export const second: MTypes.OneArgFunction<Type, number> = Struct.get('second');

/**
 * Returns the `millisecond` property of `self`
 *
 * @category Getters
 */
export const millisecond: MTypes.OneArgFunction<Type, number> = Struct.get('millisecond');

/**
 * Returns the ISO representation of this Gregorian Date
 *
 * @category Destructors
 */
export const getIsoString: MTypes.OneArgFunction<Type, string> = formatter;
