/**
 * This module implements a Gregorian date, , i.e. a date for which the year, month and monthDay can
 * be calculated.
 *
 * It is important to note that the Gregorian calendar is periodic with a 400-year period as far as
 * leap years are concerned. Leap years are those that can be divided by 4, except those that can be
 * divided by 100 except those that can be divided by 400. So 2100, 2200, 2300 are not leap years.
 * But 2400 is a leap year.
 */

import { MArray, MData, MInputError, MString, MStruct, MTypes } from '@parischap/effect-lib';
import { Either, Function, Number, Option, Predicate, Struct, flow, pipe } from 'effect';
import {
  COMMON_YEAR_MS,
  DAY_MS,
  FOUR_HUNDRED_YEARS_MS,
  FOUR_YEARS_MS,
  HUNDRED_YEARS_MS,
  LEAP_YEAR_MS,
  MAX_FULL_YEAR,
  MIN_FULL_YEAR,
} from '../../date-time/dateTimeConstants.js';
import * as CVNumberBase10Format from '../../formatting/number-base10-format/index.js';
import * as CVTemplate from '../../formatting/template/index.js';
import * as CVTemplatePartPlaceholder from '../../formatting/template/TemplatePart/template-part-placeholder/index.js';
import * as CVTemplatePartSeparator from '../../formatting/template/TemplatePart/template-part-separator/index.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/internal/date-time/GregorianDate/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/** Number of days in each month of a leap year */
const LEAP_YEAR_DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Number of days in each month of a leap year */
const COMMON_YEAR_DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Timestamp of 1/1/2001 00:00:00:000+0:00 */
const YEAR_START_2001_MS = 978_307_200_000;

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
      _fixedLengthToReal({ ..._params, name: 'year', length: 4 }),
      _sep.hyphen,
      _fixedLengthToReal({ ..._params, name: 'month', length: 2 }),
      _sep.hyphen,
      _fixedLengthToReal({ ..._params, name: 'monthDay', length: 2 }),
    ),
  ),
  Either.getOrThrowWith(Function.identity),
) as unknown as MTypes.OneArgFunction<
  { readonly year: number; readonly month: number; readonly monthDay: number },
  string
>;

/**
 * Type that represents a CVGregorianDate
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** Timestamp of any moment in the day represented by this GregorianDate */
  readonly timestamp: number;

  /** The year of this GregorianDate , range: [MIN_FULL_YEAR, MAX_FULL_YEAR] */
  readonly year: number;

  /** `true` if `year` is a leap year. `false` otherwise */
  readonly yearIsLeap: boolean;

  /** Timestamp of the first millisecond of UTC `year` */
  readonly yearStartTimestamp: number;

  /** Position in the year of the day of this GregorianDate, range:[1, 366] */
  readonly ordinalDay: number;

  /** Month of this GregorianDate, range:[1, 12] */
  readonly month: Option.Option<number>;

  /** Position in the month of the day of this GregorianDate, range:[1, 31] */
  readonly monthDay: Option.Option<number>;

  /** Number on days in month `month` */
  readonly daysInMonth: ReadonlyArray<number>;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return moduleTag;
  }

  /** Class constructor */
  private constructor({
    timestamp,
    year,
    yearIsLeap,
    yearStartTimestamp,
    ordinalDay,
    month,
    monthDay,
    daysInMonth,
  }: MTypes.Data<Type>) {
    super();
    this.timestamp = timestamp;
    this.year = year;
    this.yearIsLeap = yearIsLeap;
    this.yearStartTimestamp = yearStartTimestamp;
    this.ordinalDay = ordinalDay;
    this.month = month;
    this.monthDay = monthDay;
    this.daysInMonth = daysInMonth;
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

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => Type.make(params);

const _makeWithInternals = (params: Omit<MTypes.Data<Type>, 'daysInMonth'>): Type =>
  _make({
    ...params,
    daysInMonth: params.yearIsLeap ? LEAP_YEAR_DAYS_IN_MONTH : COMMON_YEAR_DAYS_IN_MONTH,
  });

/**
 * Constructs a GregorianDate from a timestamp
 *
 * @category Constructors
 */
export const fromTimestamp = (timestamp: number): Type => {
  /**
   * The 100-year periods [2001, 2100], [2101, 2200], and [2201, 2300] all last HUNDRED_YEARS_MS.
   * Those three 100-year periods can be divided in 24 periods that last FOUR_YEARS_MS
   * (4xCOMMON_YEAR_MS + DAY_MS) and a final 4-year period that lasts FOUR_YEARS_MS - DAY_MS
   * (4xCOMMON_YEAR_MS).
   *
   * The 100-year period [2301, 2400] lasts HUNDRED_YEARS_MS + DAY_MS. This period can be divided in
   * 25 periods that last FOUR_YEARS_MS (4xCOMMON_YEAR_MS + DAY_MS).
   */

  const offset2001 = timestamp - YEAR_START_2001_MS;

  const q400Years = Math.floor(offset2001 / FOUR_HUNDRED_YEARS_MS);
  const offset400Years = q400Years * FOUR_HUNDRED_YEARS_MS;
  const r400Years = offset2001 - offset400Years;

  // q100Years is equal to 4 on the last day of the 400-year period.
  const q100Years = Math.min(3, Math.floor(r400Years / HUNDRED_YEARS_MS));
  const offset100Years = q100Years * HUNDRED_YEARS_MS;
  // r100Years is superior to HUNDRED_YEARS_MS on the last day of the 400-year period
  const r100Years = r400Years - offset100Years;

  const q4Years = Math.floor(r100Years / FOUR_YEARS_MS);
  const offset4Years = q4Years * FOUR_YEARS_MS;
  const r4Years = r100Years - offset4Years;

  // q1Year is equal to 4 on the last day of each 4-year period except the last day of years 2100, 2200 and 2300.
  const q1Year = Math.min(3, Math.floor(r4Years / COMMON_YEAR_MS));
  const offset1Year = q1Year * COMMON_YEAR_MS;

  const yearIsLeap = q1Year === 3 && (q4Years !== 24 || q100Years === 3);

  const yearStartTimestamp =
    YEAR_START_2001_MS + offset400Years + offset100Years + offset4Years + offset1Year;

  return _makeWithInternals({
    timestamp,
    year: 2001 + 400 * q400Years + 100 * q100Years + 4 * q4Years + q1Year,
    yearIsLeap,
    yearStartTimestamp,
    ordinalDay: Math.floor((timestamp - yearStartTimestamp) / DAY_MS) + 1,
    month: Option.none(),
    monthDay: Option.none(),
  });
};

/**
 * If possible, returns a new GregorianDate having `year` set to `year` and the same `month` and
 * `monthDay` as `self`. Returns a left of an error otherwise. `year` must be an integer comprised
 * in the range [MIN_FULL_YEAR, MAX_FULL_YEAR]. If `self` represents a 29th of february, `year` must
 * be a leap year.
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
      const offset2001 = validatedYear - 2001;

      const q400Years = Math.floor(offset2001 / 400);
      const r400Years = offset2001 - 400 * q400Years;

      const q100Years = Math.floor(r400Years / 100);
      const r100Years = r400Years - 100 * q100Years;

      const q4Years = Math.floor(r100Years / 4);
      const r4Years = r100Years - 4 * q4Years;

      const yearIsLeap = r4Years === 3 && (r100Years !== 99 || r400Years === 399);

      const yearStartTimestamp =
        YEAR_START_2001_MS
        + q400Years * FOUR_HUNDRED_YEARS_MS
        + q100Years * HUNDRED_YEARS_MS
        + q4Years * FOUR_YEARS_MS
        + r4Years * COMMON_YEAR_MS;

      const selfYearIsLeap = self.yearIsLeap;
      const selfOrdinalDay = self.ordinalDay;

      const ordinalDayOffset = yield* selfYearIsLeap === yearIsLeap || selfOrdinalDay < 60 ?
        Either.right(0)
      : selfYearIsLeap ?
        selfOrdinalDay === 60 ?
          Either.left(
            new MInputError.Type({
              message: `No February 29th on year ${MString.fromNumber(10)(year)} which is not a leap year`,
            }),
          )
        : Either.right(-1)
      : Either.right(1);

      return _makeWithInternals({
        timestamp:
          self.timestamp + yearStartTimestamp - self.yearStartTimestamp + ordinalDayOffset * DAY_MS,
        year: validatedYear,
        yearIsLeap,
        yearStartTimestamp,
        ordinalDay: selfOrdinalDay + ordinalDayOffset,
        month: self.month,
        monthDay: self.monthDay,
      });
    });

/**
 * If possible, returns a new GregorianDate having `month` set to `month` and the same `year` and
 * `monthDay` as `self`. Returns a left of an error otherwise. `month` must be an integer greater
 * than or equal to 1 (January) and less than or equal to 12 (December). `month` must also have at
 * least `monthDay` days.
 *
 * @category Setters
 */
export const setMonth =
  (month: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    Either.gen(function* () {
      const validatedMonth = yield* pipe(
        month,
        MInputError.assertInRange({
          min: 1,
          max: 12,
          minIncluded: true,
          maxIncluded: true,
          offset: 0,
          name: "'month'",
        }),
      );

      const monthDay = yield* pipe(
        self,
        getMonthDay,
        Either.liftPredicate(
          Predicate.or(
            Number.lessThanOrEqualTo(28),
            Number.lessThanOrEqualTo(getNumberOfDaysInMonth(validatedMonth)(self)),
          ),
          (selfMonthDay) =>
            new MInputError.Type({
              message: `Month ${MString.fromNumber(10)(month)} of year ${MString.fromNumber(10)(self.year)}\
 does not have ${MString.fromNumber(10)(selfMonthDay)} days`,
            }),
        ),
      );

      const ordinalDay = getMonthOffset(validatedMonth)(self) + monthDay;

      return pipe(
        self,
        MStruct.append({
          timestamp: self.timestamp + (ordinalDay - self.ordinalDay) * DAY_MS,
          ordinalDay,
          month: Option.some(validatedMonth),
        }),
        _make,
      );
    });

/**
 * If possible, returns a new GregorianDate having `monthDay` set to `monthDay` and the same `year`
 * and `month` as `self`. Returns a left of an error otherwise. `monthDay` must be an integer
 * greater than or equal to 1 and less than or equal to the number of days in the current month.
 *
 * @category Setters
 */
export const setMonthDay =
  (monthDay: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    Either.gen(function* () {
      const validatedMonthDay =
        monthDay <= 28 ? monthDay : (
          yield* pipe(
            monthDay,
            MInputError.assertInRange({
              min: 1,
              max: getNumberOfDaysInMonth(getMonth(self))(self),
              minIncluded: true,
              maxIncluded: true,
              offset: 0,
              name: "'monthDay'",
            }),
          )
        );

      const ordinalDayOffset = validatedMonthDay - getMonthDay(self);

      return pipe(
        self,
        MStruct.append({
          timestamp: self.timestamp + ordinalDayOffset * DAY_MS,
          ordinalDay: self.ordinalDay + ordinalDayOffset,
          monthDay: Option.some(validatedMonthDay),
        }),
        _make,
      );
    });

/**
 * If possible, returns a new GregorianDate having `ordinalDay` set to `ordinalDay` and the same
 * `year` as `self`. Returns a left of an error otherwise. `ordinalDay` must be an integer greater
 * than or equal to 1 and less than or equal to the number of days in the current year
 *
 * @category Setters
 */
export const setOrdinalDay =
  (ordinalDay: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    Either.gen(function* () {
      const validatedOrdinalDay = yield* pipe(
        ordinalDay,
        MInputError.assertInRange({
          min: 1,
          max: getYearDurationInDays(self),
          minIncluded: true,
          maxIncluded: true,
          offset: 0,
          name: "'ordinalDay'",
        }),
      );

      return pipe(
        self,
        MStruct.append({
          timestamp: self.timestamp + (validatedOrdinalDay - self.ordinalDay) * DAY_MS,
          ordinalDay: validatedOrdinalDay,
          month: Option.none(),
          monthDay: Option.none(),
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
 * Returns the `yearIsLeap` property of `self`
 *
 * @category Predicates
 */
export const yearIsLeap: Predicate.Predicate<Type> = Struct.get('yearIsLeap');

/**
 * Returns the `yearStartTimestamp` property of `self`
 *
 * @category Destructors
 */
export const yearStartTimestamp: MTypes.OneArgFunction<Type, number> =
  Struct.get('yearStartTimestamp');

/**
 * Returns the `ordinalDay` property of `self`
 *
 * @category Destructors
 */
export const ordinalDay: MTypes.OneArgFunction<Type, number> = Struct.get('ordinalDay');

/**
 * Returns the `month` of `self`
 *
 * @category Destructors
 */
export const getMonth = (self: Type): number =>
  pipe(
    self.month,
    Option.getOrElse(() => {
      const { ordinalDay } = self;
      const { yearIsLeap } = self;
      const adjustedOrdinalDay = ordinalDay - (yearIsLeap ? 1 : 0);
      const result =
        ordinalDay <= 31 ? 1
        : adjustedOrdinalDay <= 59 ? 2
        : Math.floor((adjustedOrdinalDay - 59) / 30.6 - 0.018) + 3;

      (self as MTypes.WithMutable<Type, 'month'>).month = Option.some(result);
      return result;
    }),
  );

/**
 * Returns the `monthDay` of `self`
 *
 * @category Destructors
 */
export const getMonthDay = (self: Type): number =>
  pipe(
    self.monthDay,
    Option.getOrElse(() => {
      const result = self.ordinalDay - getMonthOffset(getMonth(self))(self);

      (self as MTypes.WithMutable<Type, 'monthDay'>).monthDay = Option.some(result);
      return result;
    }),
  );

/**
 * Returns the duration of the year described by `self` in milliseconds
 *
 * @category Destructors
 */
export const getYearDurationInMs = (self: Type): number =>
  self.yearIsLeap ? LEAP_YEAR_MS : COMMON_YEAR_MS;

/**
 * Returns the duration of the year described by `self` in days
 *
 * @category Destructors
 */
export const getYearDurationInDays = (self: Type): number => (self.yearIsLeap ? 366 : 365);

/**
 * Returns the number of days from the start of the `year` property of `self` to the day before the
 * first day of month `month`
 *
 * @category Destructors
 */
export const getMonthOffset =
  (month: number) =>
  (self: Type): number =>
    month === 1 ? 0
    : month === 2 ? 31
    : 30 * (month - 1) + Math.floor(0.6 * (month + 1)) - (self.yearIsLeap ? 2 : 3);

/**
 * Returns the number of days of month `month` of the `year` property of `self`
 *
 * @category Destructors
 */
export const getNumberOfDaysInMonth = (month: number): MTypes.OneArgFunction<Type, number> =>
  flow(Struct.get('daysInMonth'), MArray.unsafeGet(month - 1));

/**
 * Returns the ISO representation of this Gregorian Date
 *
 * @category Destructors
 */
export const getIsoString: MTypes.OneArgFunction<Type, string> = flow(
  MStruct.enrichWith({ month: getMonth, monthDay: getMonthDay }),
  _formatter,
);
