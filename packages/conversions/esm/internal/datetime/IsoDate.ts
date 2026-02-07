/**
 * This module implements an IsoDate, i.e. a date for which the isoYear, isoWeek and isoDay can be
 * calculated.
 *
 * An iso year starts on the first day of the first iso week. An iso week starts on a monday and
 * ends on a sunday. The first iso week of the year is the one that contains January 4th (see
 * Wikipedia).
 *
 * @category Models
 */

import { MData, MInputError, MNumber, MString, MStruct, MTypes } from '@parischap/effect-lib';
import { Either, Function, Number, Option, Predicate, Struct, flow, pipe } from 'effect';
import {
  DAY_MS,
  LONG_YEAR_MS,
  MAX_FULL_YEAR,
  MIN_FULL_YEAR,
  SHORT_YEAR_MS,
  WEEK_MS,
} from '../../DateTime/dateTimeConstants.js';
import * as CVNumberBase10Format from '../../formatting/NumberBase10Format.js';
import * as CVTemplate from '../../formatting/Template.js';
import * as CVTemplatePartPlaceholder from '../../formatting/TemplatePart/Placeholder/index.js';
import * as CVTemplatePartSeparator from '../../formatting/TemplatePart/Separator.js';
import type * as CVGregorianDate from './GregorianDate.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/internal/datetime/IsoDate/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Duration in milliseconds of a 6-iso-year period comprised of 1 long year and 5 short years (see
 * Wikipedia)
 *
 * @category Constants
 */
const SIX_YEARS_MS = LONG_YEAR_MS + 5 * SHORT_YEAR_MS;

/**
 * Duration in milliseconds of an 11-iso-year period comprised of 2 long years and 9 short years
 * (see Wikipedia)
 *
 * @category Constants
 */
const ELEVEN_YEARS_MS = 2 * LONG_YEAR_MS + 9 * SHORT_YEAR_MS;

/**
 * Duration in milliseconds of a 28-iso-year period comprised of 5 long years and 23 short years
 * (see Wikipedia)
 *
 * @category Constants
 */
const TWENTY_EIGHT_YEARS_MS = 5 * LONG_YEAR_MS + 23 * SHORT_YEAR_MS;

/**
 * Duration in milliseconds of a 96-iso-year period comprised of 17 long years and 79 short years
 * (see Wikipedia)
 *
 * @category Constants
 */
const NINETY_SIX_YEARS_MS = 17 * LONG_YEAR_MS + 79 * SHORT_YEAR_MS;

/**
 * Duration in milliseconds of a 100-iso-year period comprised of 18 long years and 82 short years
 * (see Wikipedia)
 *
 * @category Constants
 */
const ONE_HUNDRED_YEARS_MS = 18 * LONG_YEAR_MS + 82 * SHORT_YEAR_MS;

/**
 * Duration in milliseconds of a 400-iso-year period comprised of 71 long years and 329 short years
 * (see Wikipedia)
 *
 * @category Constants
 */
const FOUR_HUNDRED_YEARS_MS = 71 * LONG_YEAR_MS + 329 * SHORT_YEAR_MS;

/**
 * Timestamp of 03/01/2000 00:00:00:000+0:00
 *
 * @category Constants
 */
const YEAR_START_2000_MS = 946_857_600_000;

/**
 * Timestamp of 04/01/2010 00:00:00:000+0:00
 *
 * @category Constants
 */
const YEAR_START_2010_MS = 1_262_563_200_000;

const _fixedLengthToReal = CVTemplatePartPlaceholder.fixedLengthToReal;
const _sep = CVTemplatePartSeparator;
const _integer = CVNumberBase10Format.integer;
const _params = {
  fillChar: '0',
  numberBase10Format: _integer,
};

/**
 * Type that represents a CVIsoDate
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** Timestamp of any moment of the day represented by this IsoDate */
  readonly timestamp: number;

  /** The Iso year of this IsoDate, range: [MIN_FULL_YEAR, MAX_FULL_YEAR] */
  readonly year: number;

  /** If true, iso year `year` counts 53 weeks. Otherwise, it counts 52 weeks */
  readonly yearIsLong: boolean;

  /** Timestamp of the first millisecond of UTC iso year `year` */
  readonly yearStartTimestamp: number;

  /** The Iso week of this IsoDate, range:[1, 53] */
  readonly isoWeek: Option.Option<number>;

  /** The weekday of this IsoDate, range:[1, 7], 1 is monday, 7 is sunday */
  readonly weekday: Option.Option<number>;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return moduleTag;
  }

  /** Class constructor */
  private constructor({
    timestamp,
    year,
    yearIsLong,
    yearStartTimestamp,
    isoWeek,
    weekday,
  }: MTypes.Data<Type>) {
    super();
    this.timestamp = timestamp;
    this.year = year;
    this.yearIsLong = yearIsLong;
    this.yearStartTimestamp = yearStartTimestamp;
    this.isoWeek = isoWeek;
    this.weekday = weekday;
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
 * Constructs an IsoDate from a timestamp
 *
 * @category Constructors
 */
export const fromTimestamp = (timestamp: number): Type => {
  const offset = timestamp - YEAR_START_2000_MS;

  const q400Years = Math.floor(offset / FOUR_HUNDRED_YEARS_MS);
  const r400Years = offset - q400Years * FOUR_HUNDRED_YEARS_MS;

  // The second one-hundred year period is a week shorter because it has 17 long years instead of 18
  // Also the hundred-th year must be put in the first one-hundred year period because it is not long
  const q100Years =
    r400Years < ONE_HUNDRED_YEARS_MS + SHORT_YEAR_MS ?
      0
    : Math.floor((r400Years + WEEK_MS) / ONE_HUNDRED_YEARS_MS);

  const adjustedR400Years = r400Years - q100Years * NINETY_SIX_YEARS_MS + SHORT_YEAR_MS;
  const q28Years = Math.floor(adjustedR400Years / TWENTY_EIGHT_YEARS_MS);
  const r28Years = adjustedR400Years - q28Years * TWENTY_EIGHT_YEARS_MS;

  const adjustedR28Years = r28Years - ELEVEN_YEARS_MS;
  const q11Years = Math.floor(adjustedR28Years / ELEVEN_YEARS_MS);
  const r11Years = adjustedR28Years - q11Years * ELEVEN_YEARS_MS;

  const q6Years = Math.floor(r11Years / SIX_YEARS_MS);
  const r6Years = r11Years - q6Years * SIX_YEARS_MS;

  const isFirstSixYearPeriod = q6Years === 0;
  const q1Year = Math.min(Math.floor(r6Years / SHORT_YEAR_MS), isFirstSixYearPeriod ? 5 : 4);

  //console.log(q400Years, q100Years, q28Years, q11Years, q6Years, q1Year);
  return _make({
    timestamp,
    year:
      2010
      + q400Years * 400
      + q100Years * 96
      + q28Years * 28
      + q11Years * 11
      + q6Years * 6
      + q1Year,
    yearStartTimestamp:
      YEAR_START_2010_MS
      + q400Years * FOUR_HUNDRED_YEARS_MS
      + q100Years * NINETY_SIX_YEARS_MS
      + q28Years * TWENTY_EIGHT_YEARS_MS
      + q11Years * ELEVEN_YEARS_MS
      + q6Years * SIX_YEARS_MS
      + q1Year * SHORT_YEAR_MS,
    yearIsLong: (isFirstSixYearPeriod && q1Year === 5) || (!isFirstSixYearPeriod && q1Year === 4),
    isoWeek: Option.none(),
    weekday: Option.none(),
  });
};

/**
 * Constructs an IsoDate from a GregorianDate
 *
 * @category Constructors
 */
export const fromGregorianDate = (gregorianDate: CVGregorianDate.Type): Type => {
  // 0 is friday, 6 is thursday
  const yearStartWeekday = MNumber.intModulo(7)(
    Math.floor((gregorianDate.yearStartTimestamp - DAY_MS) / DAY_MS),
  );
  const { yearIsLeap } = gregorianDate;
  const minOrdinalDayIndex = 3 - yearStartWeekday;
  const { ordinalDay } = gregorianDate;

  if (ordinalDay <= minOrdinalDayIndex) {
    const year = gregorianDate.year - 1;
    const yearIsLong =
      yearStartWeekday === 0
      || (yearStartWeekday === 1
        && !yearIsLeap
        && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0));
    return _make({
      timestamp: gregorianDate.timestamp,
      year,
      yearStartTimestamp:
        gregorianDate.yearStartTimestamp + (minOrdinalDayIndex - (yearIsLong ? 371 : 364)) * DAY_MS,
      yearIsLong,
      isoWeek: Option.none(),
      weekday: Option.none(),
    });
  }

  const yearIsLong = yearStartWeekday === 6 || (yearStartWeekday === 5 && yearIsLeap);
  const maxOrdinalDay = minOrdinalDayIndex + (yearIsLong ? 371 : 364);

  if (ordinalDay > maxOrdinalDay) {
    const year = gregorianDate.year + 1;
    const yearIsLong =
      yearIsLeap ?
        yearStartWeekday === 4
      : yearStartWeekday === 5
        || (yearStartWeekday === 4 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0));

    return _make({
      timestamp: gregorianDate.timestamp,
      year,
      yearStartTimestamp: gregorianDate.yearStartTimestamp + maxOrdinalDay * DAY_MS,
      yearIsLong,
      isoWeek: Option.none(),
      weekday: Option.none(),
    });
  }

  return _make({
    timestamp: gregorianDate.timestamp,
    year: gregorianDate.year,
    yearStartTimestamp: gregorianDate.yearStartTimestamp + minOrdinalDayIndex * DAY_MS,
    yearIsLong,
    isoWeek: Option.none(),
    weekday: Option.none(),
  });
};

/**
 * If possible, returns a new IsoDate having `year` set to `year` and the same `isoWeek` and
 * `weekday` as `self`. Returns a left of an error otherwise. `year` must be an integer comprised in
 * the range [MIN_FULL_YEAR, MAX_FULL_YEAR]. If the isoWeek of `self` is equal to 53, `year` must be
 * a long year.
 *
 * @category Setters
 */
export const setYear =
  (year: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    Either.gen(function* () {
      const validatedYear = yield* pipe(
        year,
        MInputError.assertInRange({
          min: MIN_FULL_YEAR,
          max: MAX_FULL_YEAR,
          minIncluded: true,
          maxIncluded: true,
          offset: 0,
          name: "'year'",
        }),
      );
      const offset = validatedYear - 2000;

      const q400Years = Math.floor(offset / 400);
      const r400Years = offset - q400Years * 400;

      // year 100 needs to be treated in the first one-hundred year period because it is not a long year
      const q100Years = r400Years === 100 ? 0 : Math.floor(r400Years / 100);

      const adjustedR400Years = r400Years - q100Years * 96 + 1;
      const q28Years = Math.floor(adjustedR400Years / 28);
      const r28Years = adjustedR400Years - q28Years * 28;

      const adjustedR28Years = r28Years - 11;
      const q11Years = Math.floor(adjustedR28Years / 11);
      const r11Years = adjustedR28Years - q11Years * 11;

      const yearStartTimestamp =
        YEAR_START_2010_MS
        + q400Years * FOUR_HUNDRED_YEARS_MS
        + q100Years * NINETY_SIX_YEARS_MS
        + q28Years * TWENTY_EIGHT_YEARS_MS
        + q11Years * ELEVEN_YEARS_MS
        + r11Years * SHORT_YEAR_MS
        + (r11Years > 5 ? WEEK_MS : 0);

      return yield* pipe(
        _make({
          timestamp: self.timestamp + yearStartTimestamp - self.yearStartTimestamp,
          year: validatedYear,
          yearStartTimestamp,
          yearIsLong: r11Years === 5 || r11Years === 10,
          isoWeek: Option.some(getIsoWeek(self)),
          weekday: Option.some(getWeekday(self)),
        }),
        Either.liftPredicate(
          Predicate.or(yearIsLong, flow(getIsoWeek, Number.lessThan(53))),
          () =>
            new MInputError.Type({
              message: `No 53rd week on iso year ${MString.fromNumber(10)(year)} which is not a short year`,
            }),
        ),
      );
    });

/**
 * If possible, returns a new IsoDate having `isoWeek` set to `isoWeek` and the same `year` and
 * `weekday` as `self`. Returns a left of an error otherwise. `isoWeek` must be an integer greater
 * than or equal to 1 and less than or equal to the number of iso weeks in the current year.
 *
 * @category Setters
 */
export const setIsoWeek =
  (isoWeek: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    Either.gen(function* () {
      const validatedIsoWeek = yield* pipe(
        isoWeek,
        MInputError.assertInRange({
          min: 1,
          max: getLastIsoWeek(self),
          minIncluded: true,
          maxIncluded: true,
          offset: 0,
          name: "'isoWeek'",
        }),
      );

      const offset = validatedIsoWeek - getIsoWeek(self);
      return pipe(
        self,
        MStruct.evolve({
          timestamp: Number.sum(offset * WEEK_MS),
          isoWeek: pipe(validatedIsoWeek, Option.some, Function.constant),
        }),
        _make,
      );
    });

/**
 * If possible, returns a new IsoDate having `weekday` set to `weekday` and the same `year` and
 * `isoWeek` as `self`. Returns a left of an error otherwise. `weekday` must be an integer greater
 * than or equal to 1 (monday) and less than or equal to 7 (sunday).
 *
 * @category Setters
 */
export const setWeekday =
  (weekday: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    Either.gen(function* () {
      const validatedWeekday = yield* pipe(
        weekday,
        MInputError.assertInRange({
          min: 1,
          max: 7,
          minIncluded: true,
          maxIncluded: true,
          offset: 0,
          name: "'weekday'",
        }),
      );

      const offset = validatedWeekday - getWeekday(self);
      return pipe(
        self,
        MStruct.evolve({
          timestamp: Number.sum(offset * DAY_MS),
          weekday: pipe(validatedWeekday, Option.some, Function.constant),
        }),
        _make,
      );
    });

/**
 * Returns the `timestamp` property of `self`
 *
 * @category Destructors
 */
export const timestamp: MTypes.OneArgFunction<Type, number> = Struct.get('timestamp');

/**
 * Returns the `year` property of `self`
 *
 * @category Destructors
 */
export const year: MTypes.OneArgFunction<Type, number> = Struct.get('year');

/**
 * Returns the `yearStartTimestamp` property of `self`
 *
 * @category Destructors
 */
export const yearStartTimestamp: MTypes.OneArgFunction<Type, number> =
  Struct.get('yearStartTimestamp');

/**
 * Returns the `yearIsLong` property of `self`
 *
 * @category Predicates
 */
export const yearIsLong: Predicate.Predicate<Type> = Struct.get('yearIsLong');

/**
 * Returns the `isoWeek` of `self`
 *
 * @category Destructors
 */
export const getIsoWeek = (self: Type): number =>
  pipe(
    self.isoWeek,
    Option.getOrElse(() => {
      const result = Math.floor((self.timestamp - self.yearStartTimestamp) / WEEK_MS) + 1;
      (self as MTypes.WithMutable<Type, 'isoWeek'>).isoWeek = Option.some(result);
      return result;
    }),
  );

/**
 * Returns the `weekday` of `self`
 *
 * @category Destructors
 */
export const getWeekday = (self: Type): number =>
  pipe(
    self.weekday,
    Option.getOrElse(() => {
      const result =
        Math.floor(
          (self.timestamp - self.yearStartTimestamp - (getIsoWeek(self) - 1) * WEEK_MS) / DAY_MS,
        ) + 1;
      (self as MTypes.WithMutable<Type, 'weekday'>).weekday = Option.some(result);
      return result;
    }),
  );

/**
 * Returns the duration of the year described by `self` in milliseconds
 *
 * @category Destructors
 */
export const getMsDuration = (self: Type): number =>
  self.yearIsLong ? LONG_YEAR_MS : SHORT_YEAR_MS;

/**
 * Returns the duration of the year described by `self` in milliseconds
 *
 * @category Destructors
 */
export const getLastIsoWeek = (self: Type): number => (self.yearIsLong ? 53 : 52);

const _formatter = flow(
  CVTemplate.toFormatter(
    CVTemplate.make(
      _fixedLengthToReal({ ..._params, name: 'year', length: 4 }),
      _sep.make('-W'),
      _fixedLengthToReal({ ..._params, name: 'isoWeek', length: 2 }),
      _sep.hyphen,
      _fixedLengthToReal({ ..._params, name: 'weekday', length: 2 }),
    ),
  ),
  Either.getOrThrowWith(Function.identity),
) as MTypes.OneArgFunction<
  { readonly year: number; readonly isoWeek: number; readonly weekday: number },
  string
>;

/**
 * Returns the ISO representation of this Gregorian Date
 *
 * @category Destructors
 */
export const getIsoString: MTypes.OneArgFunction<Type, string> = flow(
  MStruct.enrichWith({ isoWeek: getIsoWeek, weekday: getWeekday }),
  _formatter,
);
