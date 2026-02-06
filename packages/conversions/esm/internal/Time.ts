/** This modulke implements the time part of a date */

import { MData, MInputError, MTypes } from '@parischap/effect-lib';
import { Either, Function, Number, Struct, flow, pipe } from 'effect';
import * as CVNumberBase10Format from '../NumberBase10Format.js';
import * as CVTemplate from '../Template.js';
import * as CVTemplatePartPlaceholder from '../TemplatePart/Placeholder.js';
import * as CVTemplatePartSeparator from '../TemplatePart/Separator.js';
import { HOUR_MS, MINUTE_MS, SECOND_MS } from '../dateTimeConstants.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/internal/Time/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

const _fixedLengthToReal = CVTemplatePartPlaceholder.fixedLengthToReal;
const _sep = CVTemplatePartSeparator;
const _integer = CVNumberBase10Format.integer;
const _params = {
  fillChar: '0',
  numberBase10Format: _integer,
};
const _formatter = flow(
  CVTemplate.toFormatter(
    CVTemplate.make(
      _fixedLengthToReal({ ..._params, name: 'hour23', length: 2 }),
      _sep.colon,
      _fixedLengthToReal({ ..._params, name: 'minute', length: 2 }),
      _sep.colon,
      _fixedLengthToReal({ ..._params, name: 'second', length: 2 }),
      _sep.dot,
      _fixedLengthToReal({ ..._params, name: 'millisecond', length: 3 }),
    ),
  ),
  Either.getOrThrowWith(Function.identity),
) as MTypes.OneArgFunction<
  {
    readonly hour23: number;
    readonly minute: number;
    readonly second: number;
    readonly millisecond: number;
  },
  string
>;

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
  private constructor({
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

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

const _make = (params: MTypes.Data<Type>): Type => Type.make(params);

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

  return _make({
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
 * If possible, returns a right of a copy of `self` with `hour23` set to `hour23`. Returns a left of
 * an error otherwise. `hour23` must be an integer greater than or equal to 0 and less than or equal
 * to 23
 *
 * @category Setters
 */
export const setHour23 =
  (hour23: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    Either.gen(function* () {
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
          hour11: Function.constant(isPast12 ? hour23 - 12 : hour23),
          meridiem: Function.constant(isPast12 ? (12 as const) : (0 as const)),
        }),
        _make,
      );
    });

/**
 * If possible, returns a right of a copy of `self` with `hour11` set to `hour11`. Returns a left of
 * an error otherwise. `hour11` must be an integer greater than or equal to 0 and less than or equal
 * to 11
 *
 * @category Setters
 */
export const setHour11 =
  (hour11: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    Either.gen(function* () {
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
        _make,
      );
    });

/**
 * Returns a copy of `self` with `meridiem` set to `merdiem`.
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
      _make,
    );
  };

/**
 * If possible, returns a right of a copy of `self` with `minute` set to `minute`. Returns a left of
 * an error otherwise. `minute` must be an integer greater than or equal to 0 and less than or equal
 * to 59
 *
 * @category Setters
 */
export const setMinute =
  (minute: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    Either.gen(function* () {
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
        _make,
      );
    });

/**
 * If possible, returns a right of a copy of `self` with `second` set to `second`. Returns a left of
 * an error otherwise. `second` must be an integer greater than or equal to 0 and less than or equal
 * to 59
 *
 * @category Setters
 */
export const setSecond =
  (second: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    Either.gen(function* () {
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
        _make,
      );
    });

/**
 * If possible, returns a right of a copy of `self` with `millisecond` set to `millisecond`. Returns
 * a left of an error otherwise. `millisecond` must be an integer greater than or equal to 0 and
 * less than or equal to 999
 *
 * @category Setters
 */
export const setMillisecond =
  (millisecond: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    Either.gen(function* () {
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
        _make,
      );
    });

/**
 * Returns the `timestampOffset` property of `self`
 *
 * @category Destructors
 */
export const timestampOffset: MTypes.OneArgFunction<Type, number> = Struct.get('timestampOffset');

/**
 * Returns the `hour23` property of `self`
 *
 * @category Destructors
 */
export const hour23: MTypes.OneArgFunction<Type, number> = Struct.get('hour23');
/**
 * Returns the `hour11` property of `self`
 *
 * @category Destructors
 */
export const hour11: MTypes.OneArgFunction<Type, number> = Struct.get('hour11');

/**
 * Returns the `meridiem` property of `self`
 *
 * @category Destructors
 */
export const meridiem: MTypes.OneArgFunction<Type, 0 | 12> = Struct.get('meridiem');

/**
 * Returns the `minute` property of `self`
 *
 * @category Destructors
 */
export const minute: MTypes.OneArgFunction<Type, number> = Struct.get('minute');

/**
 * Returns the `second` property of `self`
 *
 * @category Destructors
 */
export const second: MTypes.OneArgFunction<Type, number> = Struct.get('second');

/**
 * Returns the `millisecond` property of `self`
 *
 * @category Destructors
 */
export const millisecond: MTypes.OneArgFunction<Type, number> = Struct.get('millisecond');

/**
 * Returns the ISO representation of this Gregorian Date
 *
 * @category Destructors
 */
export const getIsoString: MTypes.OneArgFunction<Type, string> = _formatter;
