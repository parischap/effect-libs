/**
 * This module implements an immutable `CVDateTime` object.
 *
 * `CVDateTime` objects keep an internal state. But all provided functions are pure insofar as they
 * always yield the same result whatever the state the object is in. The state is only used to
 * improve performance but does not alter the results.
 *
 * Unlike the JavaScript `Date` objects and the Effect `DateTime` objects, `CVDateTime` objects
 * handle both the Gregorian and Iso calendars. So you can easily get/set the iso year and iso week
 * of a `CVDateTime` object.
 *
 * A `CVDateTime` object has a `zoneOffset` which is the difference in hours between the time in the
 * local zone and UTC time (e.g. `zoneOffset=1` for timezone +1:00). All the data in a `CVDateTime`
 * object is zoneOffset-dependent, except `timestamp`. An important thing to note is that a
 * `CVDateTime` object with a timestamp `t` and a zoneOffset `zo` has exactly the same date parts
 * (`year`, `ordinalDay`, `month`, `monthDay`, `isoYear`...) as a `CVDateTime` object with
 * `timestamp = t+zox3600` and `zoneOffset = 0`. That's the reason for the zonedTimestamp field
 * which is equal to `t+zox3600`. All calculations are performed UTC using zonedTimestamp instead of
 * timestamp.
 */

import * as MData from '@parischap/effect-lib/MData';
import * as MDataEquivalenceBasedEquality from '@parischap/effect-lib/MDataEquivalenceBasedEquality';
import * as MFunction from '@parischap/effect-lib/MFunction';
import * as MInputError from '@parischap/effect-lib/MInputError';
import * as MNumber from '@parischap/effect-lib/MNumber';
import * as MStruct from '@parischap/effect-lib/MStruct';
import * as MTypes from '@parischap/effect-lib/MTypes';
import { flow, pipe } from 'effect';
import * as DateTime from 'effect/DateTime';
import * as Either from 'effect/Either';
import * as Equivalence from 'effect/Equivalence';
import * as Function from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as Struct from 'effect/Struct';
import * as GregorianDate from '../internal/DateTime/GregorianDate.js';
import * as IsoDate from '../internal/DateTime/IsoDate.js';
import * as CVTime from '../internal/DateTime/Time.js';
import * as ZoneOffsetParts from '../internal/DateTime/ZoneOffsetParts.js';
import type * as CVDateTimeParts from './DateTimeParts.js';
import {
  DAY_MS,
  HOUR_MS,
  MAX_FULL_YEAR,
  MAX_TIMESTAMP,
  MIN_FULL_YEAR,
  MIN_TIMESTAMP,
  MINUTE_MS,
  SECOND_MS,
} from './dateTimeConstants.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/DateTime/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

export {
  /**
   * Maximal usable year (ECMA-262)
   *
   * @category Constants
   */
  MAX_FULL_YEAR,
  /**
   * Maximal usable timestamp (ECMA-262)
   *
   * @category Constants
   */
  MAX_TIMESTAMP,
  /**
   * Minimal usable year (ECMA-262)
   *
   * @category Constants
   */
  MIN_FULL_YEAR,
  /**
   * Minimal usable timestamp (ECMA-262)
   *
   * @category Constants
   */
  MIN_TIMESTAMP,
};

/**
 * Local time zone offset in hours of the machine on which this code runs. The value is calculated
 * once at startup.
 *
 * @category Constants
 */
export const LOCAL_TIME_ZONE_OFFSET = -(new Date().getTimezoneOffset() / 60);

/**
 * Type that represents a CVDateTime
 *
 * @category Models
 */
export class Type extends MDataEquivalenceBasedEquality.Class {
  /** Timestamp of this DateTime (timezone-independent) */
  readonly timestamp: number;

  /** GregorianDate of this DateTime, expressed in given timezone */
  readonly gregorianDate: Option.Option<GregorianDate.Type>;

  /** IsoDate of this DateTime, expressed in given timezone */
  readonly isoDate: Option.Option<IsoDate.Type>;

  /** Time of this DateTime, expressed in given timezone */
  readonly time: Option.Option<CVTime.Type>;

  /**
   * Offset in hours between the time of the zone for which all calculations of that DateTime object
   * will be carried out and UTC time (e.g zoneOffset=1 for timezone +1:00). Not necessarily an
   * integer, range: ]-13, 15[
   */
  readonly zoneOffset: number;

  /** ZoneOffset decomposed into its parts */
  readonly zoneOffsetParts: Option.Option<ZoneOffsetParts.Type>;

  /** Calculated field equal to timestamp + zoneOffsetx3600 */
  readonly zonedTimestamp: number;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return getIsoString(this);
    };
  }

  /** Class constructor */
  private constructor({
    timestamp,
    gregorianDate,
    isoDate,
    time,
    zoneOffset,
    zoneOffsetParts,
    zonedTimestamp,
  }: MTypes.Data<Type>) {
    super();
    this.timestamp = timestamp;
    this.gregorianDate = gregorianDate;
    this.isoDate = isoDate;
    this.time = time;
    this.zoneOffset = zoneOffset;
    this.zoneOffsetParts = zoneOffsetParts;
    this.zonedTimestamp = zonedTimestamp;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return 0;
  }

  /** Function that implements the equivalence of `this` and `that` */
  [MDataEquivalenceBasedEquality.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
  }

  /** Predicate that returns true if `that` has the same type marker as `this` */
  [MDataEquivalenceBasedEquality.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
    return Predicate.hasProperty(that, _TypeId);
  }
  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

const _make = (params: MTypes.Data<Type>): Type => Type.make(params);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  self.timestamp === that.timestamp;

/**
 * Returns the ISO representation of this DateTime
 *
 * @category Destructors
 */
export const getIsoString = (self: Type): string =>
  GregorianDate.getIsoString(_gregorianDate(self))
  + 'T'
  + CVTime.getIsoString(_time(self))
  + ZoneOffsetParts.getIsoString(_zoneOffsetParts(self));

const _uncalculated = {
  gregorianDate: Option.none(),
  isoDate: Option.none(),
  time: Option.none(),
  zoneOffsetParts: Option.none(),
};

/**
 * Constructor that creates a DateTime from a timestamp and a zoneOffset for which no calculations
 * have been carried out yet. The `zonedTimestamp` field is automatically calculated. Does not check
 * any input parameters
 */
const _uncalculatedFromTimestamp = (timestamp: number, zoneOffset: number): Type =>
  _make({
    ..._uncalculated,
    timestamp,
    zoneOffset,
    zonedTimestamp: timestamp + zoneOffset * HOUR_MS,
  });

/**
 * Constructor that creates a DateTime from a zonedTimestamp and a zoneOffset for which no
 * calculations have been carried out yet. The `timestamp` field is automatically calculated. Does
 * not check any input parameters
 */
const _uncalculatedFromZonedTimestamp = (zonedTimestamp: number, zoneOffset: number): Type =>
  _make({
    ..._uncalculated,
    timestamp: zonedTimestamp - zoneOffset * HOUR_MS,
    zoneOffset,
    zonedTimestamp: zonedTimestamp,
  });

/** Instance of an uncalculated DateTime that represents 1/1/1970 00:00:00:000+0:00 */

const _uncalculatedOrigin = _uncalculatedFromTimestamp(0, 0);

/**
 * Tries to build a `CVDateTime` from `timestamp`, the number of milliseconds since 1/1/1970
 * 00:00:00:000+0:00, and `zoneOffset` which gives the offset between the local time and the UTC
 * time. Returns a `Right` if successful, a `Left` otherwise.
 *
 * `timestamp` must be greater than or equal to MIN_TIMESTAMP and less than or equal to
 * MAX_TIMESTAMP.
 *
 * If `zoneOffset` is omitted, the local time zone offset of the machine this code is running on is
 * used.
 *
 * `zoneOffset` can be expressed as as a number of hours. In this case, it must be strictly greater
 * to -13 and strictly less than 15.
 *
 * It can also be expressed as an object containing three components:
 *
 * - `zoneHour` which must be greater than or equal to -12 and less than or equal to 14.
 * - `zoneMinute` which must be greater than or equal to 0 and less than or equal to 59.
 * - `zoneSecond` which must be greater than or equal to 0 and less than or equal to 59.
 *
 * Note that zoneHour=-0, zoneMinute=10, zoneSecond=0 is different from zoneHour=0, zoneMinute=10,
 * zoneSecond=0. The first corresponds to the string 'GMT-00:10', a negative 10-minute offset, the
 * second one to the string 'GMT+00:10', a positive 10-minute offset.
 *
 * `timestamp`, `zoneHour`, `zoneMinute` and `zoneSecond` should be integers. `zoneOffset`, when
 * expressed as a number of hours, does not need to be an integer.
 *
 * @category Constructors
 */
export const fromTimestamp = (
  timestamp: number,
  zoneOffset?:
    | number
    | {
        readonly zoneHour: number;
        readonly zoneMinute: number;
        readonly zoneSecond: number;
      },
): Either.Either<Type, MInputError.Type> =>
  pipe(
    _uncalculatedOrigin,
    _setTimestamp(timestamp),
    Either.flatMap(setZoneOffsetKeepTimestamp(zoneOffset)),
  );

/**
 * Same as `fromTimestamp` but returns directly a `CVDateTime` or throws if it cannot be built
 *
 * @category Constructors
 */
export const fromTimestampOrThrow: (
  timestamp: number,
  zoneOffset?:
    | number
    | {
        readonly zoneHour: number;
        readonly zoneMinute: number;
        readonly zoneSecond: number;
      },
) => Type = flow(fromTimestamp, Either.getOrThrowWith(Function.identity));

/**
 * Builds a `CVDateTime` using Date.now() as `timestamp`. `zoneOffset` is set to 0.
 *
 * @category Constructors
 */
export const now = (): Type => _uncalculatedFromTimestamp(Date.now(), 0);

/**
 * Tries to build a `CVDateTime` from the provided parts. Returns a `Right` if successful, a `Left`
 * otherwise.
 *
 * `year` must comprised in the range [MIN_FULL_YEAR, MAX_FULL_YEAR]. `ordinalDay` must be greater
 * than or equal to 1 and less than or equal to the number of days in the current year. `month` must
 * be greater than or equal to 1 (January) and less than or equal to 12 (December). `monthDay` must
 * be greater than or equal to 1 and less than or equal to the number of days in the current month.
 *
 * `isoYear` must be comprised in the range [MIN_FULL_YEAR, MAX_FULL_YEAR]. `isoWeek` must be
 * greater than or equal to 1 and less than or equal to the number of iso weeks in the current year.
 * `weekday` must be greater than or equal to 1 (monday) and less than or equal to 7 (sunday).
 *
 * If there is not sufficient information to determine the exact day of the year, i.e. none of the
 * three following tuples is fully determined [year, ordinalDay], [year, month, monthDay], [isoYear,
 * isoWeek, weekday], default values are determined in the following order (the first match stops
 * the process):
 *
 * - If `year` and `month` are set, `monthDay` is taken equal to 1.
 * - If `year` and `monthDay` are set, `month` is taken equal to 1.
 * - If `year` is set and both `month` and `monthDay` are undefined, the day is taken to be the first
 *   one in the year.
 * - If `isoYear` and `isoWeek` are set, `weekday` is taken equal to 1.
 * - If `isoYear` and `weekday` are set, `isoWeek` is taken equal to 1.
 * - If `isoYear` is set and both `isoWeek` and `weekday` are undefined, the day is taken to be the
 *   first one in the iso year.
 * - If both `year` and `isoYear` are undefined, an error is raised.
 *
 * `hour23` must be greater than or equal to 0 and less than or equal to 23. `hour11` must be
 * greater than or equal to 0 and less than or equal to 11. `meridiem` must be one of 0 (AM) or 12
 * (PM). If there is not sufficient information to determine the hour of the day, i.e. none of the
 * two following tuples is fully determined [hour23], [hour11, meridiem], default values are
 * determined as follows:
 *
 * - If `meridiem` is set, `hour11` is taken equal to 0.
 * - If `hour11` is set, `meridiem` is taken equal to 0.
 * - Otherwise, `meridiem` and `hour11` are taken equal to 0.
 *
 * `minute` must be greater than or equal to 0 and less than or equal to 59. If omitted, minute is
 * assumed to be 0.
 *
 * `second` must be greater than or equal to 0 and less than or equal to 59. If omitted, second is
 * assumed to be 0.
 *
 * `millisecond` must be greater than or equal to 0 and less than or equal to 999. If omitted,
 * millisecond is assumed to be 0.
 *
 * `zoneOffset` must be strictly greater than -13 and strictly less than 15. `zoneHour` must be
 * greater than or equal to -12 and less than or equal to 14. `zoneMinute` must be greater than or
 * equal to 0 and less than or equal to 59. `zoneSecond` must be greater than or equal to 0 and less
 * than or equal to 59.
 *
 * If there is not sufficient information to determine the exact time zone offset, i.e. none of the
 * two following tuples is fully determined [zoneOffset], [zoneHour, zoneMinute, zoneSecond],
 * default values are determined as follows :
 *
 * - If all parameters are undefined, the local time zone offset of the machine this code is running
 *   on is used. ATTENTION: unlike the javaScript Date constructor, fromParts uses the current time
 *   zone offset, not the one that prevails at the given date (so, in Paris, in winter, the time
 *   zone offset for date 20250714 is -1 and not -2).
 * - If any of `zoneHour`, `zoneMinute`, `zoneSecond` is defined, the remaining undefined parameters
 *   are taken equal to 0.
 *
 * Note that zoneHour=-0, zoneMinute=10, zoneSecond=0 is different from zoneHour=0, zoneMinute=10,
 * zoneSecond=0. The first corresponds to the string 'GMT-00:10', a negative 10-minute offset, the
 * second one to the string 'GMT+00:10', a positive 10-minute offset.
 *
 * `year`, `ordinalDay`, `month`, `monthDay`, `isoYear`, `isoWeek`, `weekDay`, `hour23`, `hour11`,
 * `minute`, `second`, `millisecond`, `zoneHour`, `zoneMinute` and `zoneSecond` should be integers.
 * `zoneOffset` does not need to be an integer.
 *
 * All parameters must be coherent. For instance, `year=1970`, `month=1`, `monthDay=1`, `weekday=0`
 * `zoneHour=0`, `zoneMinute=0` and `zoneSecond=0` will trigger an error because 1/1/1970
 * 00:00:00:000+0:00 is a thursday. `hour23=13` and `meridiem=0` will also trigger an error.
 *
 * @category Constructors
 */

export const fromParts = ({
  year,
  ordinalDay,
  month,
  monthDay,
  isoYear,
  isoWeek,
  weekday,
  hour23,
  hour11,
  meridiem,
  minute,
  second,
  millisecond,
  zoneOffset,
  zoneHour,
  zoneMinute,
  zoneSecond,
}: CVDateTimeParts.Type): Either.Either<Type, MInputError.Type> =>
  Either.gen(function* () {
    const zonedOrigin = yield* Either.gen(function* () {
      if (
        zoneOffset !== undefined
        || (zoneHour === undefined && zoneMinute === undefined && zoneSecond === undefined)
      ) {
        const result = yield* pipe(_uncalculatedOrigin, setZoneOffsetKeepParts(zoneOffset));

        if (zoneHour !== undefined)
          yield* pipe(
            zoneHour,
            MInputError.assertValue({
              expected: getZoneHour(result),
              name: "'zoneHour'",
            }),
          );
        if (zoneMinute !== undefined)
          yield* pipe(
            zoneMinute,
            MInputError.assertValue({ expected: getZoneMinute(result), name: "'zoneMinute'" }),
          );
        if (zoneSecond !== undefined)
          yield* pipe(
            zoneSecond,
            MInputError.assertValue({ expected: getZoneSecond(result), name: "'zoneSecond'" }),
          );
        return result;
      }
      return yield* pipe(
        _uncalculatedOrigin,
        setZoneOffsetKeepParts({
          zoneHour: zoneHour ?? 0,
          zoneMinute: zoneMinute ?? 0,
          zoneSecond: zoneSecond ?? 0,
        }),
      );
    });

    const withHour = yield* Either.gen(function* () {
      if (hour23 !== undefined) {
        const result = yield* setHour23(hour23)(zonedOrigin);
        if (hour11 !== undefined)
          yield* pipe(
            hour11,
            MInputError.assertValue({ expected: getHour11(result), name: "'hour11'" }),
          );
        if (meridiem !== undefined)
          yield* pipe(
            meridiem,
            MInputError.assertValue({ expected: getMeridiem(result), name: "'meridiem'" }),
          );
        return result;
      }
      const withHour11 = hour11 !== undefined ? yield* setHour11(hour11)(zonedOrigin) : zonedOrigin;
      return meridiem === 12 ? setMeridiem(12)(withHour11) : withHour11;
    });

    const withMinute = minute !== undefined ? yield* setMinute(minute)(withHour) : withHour;
    const withSecond = second !== undefined ? yield* setSecond(second)(withMinute) : withMinute;
    const withMillisecond =
      millisecond !== undefined ? yield* setMillisecond(millisecond)(withSecond) : withSecond;

    const hasYear = year !== undefined;
    const hasIsoYear = isoYear !== undefined;
    const hasIsoWeek = isoWeek !== undefined;
    const hasWeekday = weekday !== undefined;

    if (hasYear && !(hasIsoYear && hasIsoWeek && hasWeekday)) {
      const withYear = yield* setYear(year)(withMillisecond);
      const withDay = yield* Either.gen(function* () {
        if (ordinalDay !== undefined) {
          const result = yield* setOrdinalDay(ordinalDay)(withYear);
          if (month !== undefined)
            yield* pipe(
              month,
              MInputError.assertValue({ expected: getMonth(result), name: "'month'" }),
            );
          if (monthDay !== undefined)
            yield* pipe(
              monthDay,
              MInputError.assertValue({ expected: getMonthDay(result), name: "'monthDay'" }),
            );
          return result;
        }

        const withMonth = month !== undefined ? yield* setMonth(month)(withYear) : withYear;
        return monthDay !== undefined ? yield* setMonthDay(monthDay)(withMonth) : withMonth;
      });

      if (hasIsoYear)
        yield* pipe(
          isoYear,
          MInputError.assertValue({ expected: getIsoYear(withDay), name: "'isoYear'" }),
        );

      if (hasIsoWeek)
        yield* pipe(
          isoWeek,
          MInputError.assertValue({ expected: getIsoWeek(withDay), name: "'isoWeek'" }),
        );

      if (hasWeekday)
        yield* pipe(
          weekday,
          MInputError.assertValue({
            expected: getWeekday(withDay),
            name: "'weekday'",
          }),
        );
      return withDay;
    }

    if (!hasIsoYear)
      return yield* Either.left(
        new MInputError.Type({
          message: "One of 'year' and 'isoYear' must be be set",
        }),
      );

    const withIsoYear = yield* setIsoYear(isoYear)(withMillisecond);
    const withIsoWeek = yield* setIsoWeek(isoWeek ?? 1)(withIsoYear);
    const withWeekday = yield* setWeekday(weekday ?? 1)(withIsoWeek);
    if (hasYear)
      yield* pipe(
        year,
        MInputError.assertValue({ expected: getYear(withWeekday), name: "'year'" }),
      );

    if (month !== undefined)
      yield* pipe(
        month,
        MInputError.assertValue({ expected: getMonth(withWeekday), name: "'month'" }),
      );

    if (monthDay !== undefined)
      yield* pipe(
        monthDay,
        MInputError.assertValue({ expected: getMonthDay(withWeekday), name: "'monthDay'" }),
      );

    if (ordinalDay !== undefined)
      yield* pipe(
        ordinalDay,
        MInputError.assertValue({
          expected: getOrdinalDay(withWeekday),
          name: "'ordinalDay'",
        }),
      );

    return withWeekday;
  });

/**
 * Same as `fromParts` but returns directly a `CVDateTime` or throws if it cannot be built
 *
 * @category Constructors
 */
export const fromPartsOrThrow: (parts: CVDateTimeParts.Type) => Type = flow(
  fromParts,
  Either.getOrThrowWith(Function.identity),
);

/**
 * Builds a `CVDateTime` from a Javascript `Date`
 *
 * @category Constructors
 */
export const fromDate = (date: Date): Type => fromTimestampOrThrow(date.getTime());

/**
 * Builds a `CVDateTime` from an `Effect.DateTime.Zoned`
 *
 * @category Constructors
 */
export const fromEffectDateTime = (date: DateTime.Zoned): Type =>
  fromTimestampOrThrow(DateTime.toEpochMillis(date), DateTime.zonedOffset(date));

/**
 * Builds a Javascript `Date` from a `CVDateTime`
 *
 * @category Conversions
 */
export const toDate = (self: Type): Date => new Date(timestamp(self));

/**
 * Builds an `Effect.DateTime.Zoned` from a `CVDateTime`
 *
 * @category Conversions
 */
export const toEffectDateTime = (self: Type): DateTime.Zoned =>
  DateTime.unsafeMakeZoned(timestamp(self), { timeZone: self.zoneOffset });

/**
 * Returns the timestamp of `self` as a number
 *
 * @category Getters
 */
export const timestamp: MTypes.OneArgFunction<Type, number> = Struct.get('timestamp');

/** Returns the `gregorianDate` of `self` for the given time zone */
const _gregorianDate = (self: Type): GregorianDate.Type =>
  pipe(
    self.gregorianDate,
    Option.getOrElse(() => {
      const result = GregorianDate.fromTimestamp(self.zonedTimestamp);
      (self as MTypes.WithMutable<Type, 'gregorianDate'>).gregorianDate = Option.some(result);
      return result;
    }),
  );

/**
 * Returns the (Gregorian) year of `self` for the given time zone
 *
 * @category Getters
 */
export const getYear: MTypes.OneArgFunction<Type, number> = flow(
  _gregorianDate,
  GregorianDate.year,
);

/**
 * Returns the ordinalDay of `self` for the given time zone
 *
 * @category Getters
 */
export const getOrdinalDay: MTypes.OneArgFunction<Type, number> = flow(
  _gregorianDate,
  GregorianDate.ordinalDay,
);

/**
 * Returns the month of `self` for the given time zone
 *
 * @category Getters
 */
export const getMonth: MTypes.OneArgFunction<Type, number> = flow(
  _gregorianDate,
  GregorianDate.getMonth,
);

/**
 * Returns the monthDay of `self` for the given time zone
 *
 * @category Getters
 */
export const getMonthDay: MTypes.OneArgFunction<Type, number> = flow(
  _gregorianDate,
  GregorianDate.getMonthDay,
);

/** Returns the isoDate of `self` for the given time zone */
const _isoDate = (self: Type): IsoDate.Type =>
  pipe(
    self.isoDate,
    Option.getOrElse(() => {
      const result = pipe(
        self.gregorianDate,
        Option.map(IsoDate.fromGregorianDate),
        Option.getOrElse(() => IsoDate.fromTimestamp(self.zonedTimestamp)),
      );
      (self as MTypes.WithMutable<Type, 'isoDate'>).isoDate = Option.some(result);
      return result;
    }),
  );

/**
 * Returns the isoYear of `self` for the given time zone
 *
 * @category Getters
 */
export const getIsoYear: MTypes.OneArgFunction<Type, number> = flow(_isoDate, IsoDate.year);

/**
 * Returns the isoWeek of `self` for the given time zone
 *
 * @category Getters
 */
export const getIsoWeek: MTypes.OneArgFunction<Type, number> = flow(_isoDate, IsoDate.getIsoWeek);

/**
 * Returns the weekday of `self` for the given time zone
 *
 * @category Getters
 */
export const getWeekday: MTypes.OneArgFunction<Type, number> = flow(_isoDate, IsoDate.getWeekday);

/** Returns the time of `self` for the given time zone */
const _time = (self: Type): CVTime.Type =>
  pipe(
    self.time,
    Option.getOrElse(() => {
      const result = pipe(self.zonedTimestamp, MNumber.intModulo(DAY_MS), CVTime.fromTimestamp);
      (self as MTypes.WithMutable<Type, 'time'>).time = Option.some(result);
      return result as never;
    }),
  );

/**
 * Returns the hour23 of `self` for the given time zone
 *
 * @category Getters
 */
export const getHour23: MTypes.OneArgFunction<Type, number> = flow(_time, CVTime.hour23);

/**
 * Returns the hour11 of `self` for the given time zone
 *
 * @category Getters
 */
export const getHour11: MTypes.OneArgFunction<Type, number> = flow(_time, CVTime.hour11);

/**
 * Returns the meridiem of `self` for the given time zone
 *
 * @category Getters
 */
export const getMeridiem: MTypes.OneArgFunction<Type, 0 | 12> = flow(_time, CVTime.meridiem);

/**
 * Returns the minute of `self` for the given time zone
 *
 * @category Getters
 */
export const getMinute: MTypes.OneArgFunction<Type, number> = flow(_time, CVTime.minute);

/**
 * Returns the second of `self` for the given time zone
 *
 * @category Getters
 */
export const getSecond: MTypes.OneArgFunction<Type, number> = flow(_time, CVTime.second);

/**
 * Returns the millisecond of `self` for the given time zone
 *
 * @category Getters
 */
export const getMillisecond: MTypes.OneArgFunction<Type, number> = flow(_time, CVTime.millisecond);

/** Returns the zoneOffsetParts of `self` */
const _zoneOffsetParts = (self: Type): ZoneOffsetParts.Type =>
  pipe(
    self.zoneOffsetParts,
    Option.getOrElse(() => {
      const result = ZoneOffsetParts.fromZoneOffset(self.zoneOffset);
      (self as MTypes.WithMutable<Type, 'zoneOffsetParts'>).zoneOffsetParts = Option.some(result);
      return result;
    }),
  );

/**
 * Returns the hour part of the zoneOffset of `self`
 *
 * @category Getters
 */
export const getZoneHour: MTypes.OneArgFunction<Type, number> = flow(
  _zoneOffsetParts,
  ZoneOffsetParts.zoneHour,
);

/**
 * Returns the minute part of the zoneOffset of `self`
 *
 * @category Getters
 */
export const getZoneMinute: MTypes.OneArgFunction<Type, number> = flow(
  _zoneOffsetParts,
  ZoneOffsetParts.zoneMinute,
);

/**
 * Returns the minute part of the zoneOffset of `self`
 *
 * @category Getters
 */
export const getZoneSecond: MTypes.OneArgFunction<Type, number> = flow(
  _zoneOffsetParts,
  ZoneOffsetParts.zoneSecond,
);

const _gregorianDateSetter = (self: Type): MTypes.OneArgFunction<GregorianDate.Type, Type> => {
  const selfTimestamp = _gregorianDate(self).timestamp;
  return (gregorianDate) => {
    const offset = gregorianDate.timestamp - selfTimestamp;

    return pipe(
      self,
      MStruct.evolve({
        timestamp: Number.sum(offset),
        gregorianDate: pipe(gregorianDate, Option.some, Function.constant),
        isoDate: Function.constant(Option.none()),
        zonedTimestamp: Number.sum(offset),
      }),
      _make,
    );
  };
};

const _isoDateSetter = (self: Type): MTypes.OneArgFunction<IsoDate.Type, Type> => {
  const selfTimestamp = _isoDate(self).timestamp;
  return (isoDate) => {
    const offset = isoDate.timestamp - selfTimestamp;
    return pipe(
      self,
      MStruct.evolve({
        timestamp: Number.sum(offset),
        gregorianDate: Function.constant(Option.none()),
        isoDate: pipe(isoDate, Option.some, Function.constant),
        zonedTimestamp: Number.sum(offset),
      }),
      _make,
    );
  };
};

const _timeSetter = (self: Type): MTypes.OneArgFunction<CVTime.Type, Type> => {
  const selfTimestampOffset = _time(self).timestampOffset;
  return (time) => {
    const offset = time.timestampOffset - selfTimestampOffset;
    return pipe(
      self,
      MStruct.evolve({
        timestamp: Number.sum(offset),
        time: pipe(time, Option.some, Function.constant),
        zonedTimestamp: Number.sum(offset),
      }),
      _make,
    );
  };
};

/**
 * If possible, returns a `Right` of a `CVDateTime` having year `year` and the same `month`,
 * `monthDay`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `Left` otherwise. `year` must be an integer comprised in the range [MIN_FULL_YEAR,
 * MAX_FULL_YEAR].
 *
 * @category Setters
 */
export const setYear =
  (year: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    pipe(self, _gregorianDate, GregorianDate.setYear(year), Either.map(_gregorianDateSetter(self)));

/**
 * Same as `setYear` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setYearOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setYear,
  Function.compose(Either.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Right` of a `CVDateTime` having ordinalDay `ordinalDay` and the same
 * `year`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a `Left`
 * of an error otherwise. `ordinalDay` must be an integer greater than or equal to 1 and less than
 * or equal to the number of days in the current year
 *
 * @category Setters
 */
export const setOrdinalDay =
  (ordinalDay: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    pipe(
      self,
      _gregorianDate,
      GregorianDate.setOrdinalDay(ordinalDay),
      Either.map(_gregorianDateSetter(self)),
    );

/**
 * Same as `setOrdinalDay` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setOrdinalDayOrThrow: MTypes.OneArgFunction<
  number,
  MTypes.OneArgFunction<Type>
> = flow(setOrdinalDay, Function.compose(Either.getOrThrowWith(Function.identity)));

/**
 * If possible, returns a `Right` of a `CVDateTime` having month `month` and the same `year`,
 * `monthDay`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `Left` of an error otherwise. `month` must be an integer greater than or equal to 1 (January) and
 * less than or equal to 12 (December)
 *
 * @category Setters
 */
export const setMonth =
  (month: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    pipe(
      self,
      _gregorianDate,
      GregorianDate.setMonth(month),
      Either.map(_gregorianDateSetter(self)),
    );

/**
 * Same as `setMonth` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setMonthOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setMonth,
  Function.compose(Either.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Right` of a `CVDateTime` having monthDay `monthDay` and the same `year`,
 * `month`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a `Left`
 * of an error otherwise. `monthDay` must be an integer greater than or equal to 1 and less than or
 * equal to the number of days in the current month.
 *
 * @category Setters
 */
export const setMonthDay =
  (monthDay: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    pipe(
      self,
      _gregorianDate,
      GregorianDate.setMonthDay(monthDay),
      Either.map(_gregorianDateSetter(self)),
    );

/**
 * Same as `setMonthDay` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setMonthDayOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setMonthDay,
  Function.compose(Either.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Right` of a `CVDateTime` having isoYear `isoYear` and the same `isoWeek`,
 * `weekday`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `Left` of an error otherwise. `isoYear` must be an integer comprised in the range [MIN_FULL_YEAR,
 * MAX_FULL_YEAR].
 *
 * @category Setters
 */
export const setIsoYear =
  (isoYear: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    pipe(self, _isoDate, IsoDate.setYear(isoYear), Either.map(_isoDateSetter(self)));

/**
 * Same as `setIsoYear` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setIsoYearOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setIsoYear,
  Function.compose(Either.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a Right of a `CVDateTime` having isoWeek `isoWeek` and the same `isoYear`,
 * `weekday`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `Left` of an error otherwise. `isoWeek` must be an integer greater than or equal to 1 and less
 * than or equal to the number of iso weeks in the current year.
 *
 * @category Setters
 */
export const setIsoWeek =
  (isoWeek: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    pipe(self, _isoDate, IsoDate.setIsoWeek(isoWeek), Either.map(_isoDateSetter(self)));

/**
 * Same as `setIsoWeek` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setIsoWeekOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setIsoWeek,
  Function.compose(Either.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Right` of a `CVDateTime` having weekday `weekday` and the same `isoYear`,
 * `isoWeek`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `Left` of an error otherwise. `weekday` must be an integer greater than or equal to 1 (monday)
 * and less than or equal to 7 (sunday).
 *
 * @category Setters
 */
export const setWeekday =
  (weekday: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    pipe(self, _isoDate, IsoDate.setWeekday(weekday), Either.map(_isoDateSetter(self)));

/**
 * Same as `setWeekday` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setWeekdayOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setWeekday,
  Function.compose(Either.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Right` of a `CVDateTime` having hour23 `hour23` and the same `year`,
 * `ordinalDay`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a `Left` of
 * an error otherwise. `hour23` must be an integer greater than or equal to 0 and less than or equal
 * to 23
 *
 * @category Setters
 */
export const setHour23 =
  (hour23: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    pipe(self, _time, CVTime.setHour23(hour23), Either.map(_timeSetter(self)));

/**
 * Same as `setHour23` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setHour23OrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setHour23,
  Function.compose(Either.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a Right of a `CVDateTime` having hour11 `hour11` and the same `year`,
 * `ordinalDay`, `meridiem`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `Left` of an error otherwise. `hour11` must be an integer greater than or equal to 0 and less
 * than or equal to 11.
 *
 * @category Setters
 */
export const setHour11 =
  (hour11: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    pipe(self, _time, CVTime.setHour11(hour11), Either.map(_timeSetter(self)));

/**
 * Same as `setHour11` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setHour11OrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setHour11,
  Function.compose(Either.getOrThrowWith(Function.identity)),
);

/**
 * Returns a `CVDateTime` having meridiem `meridiem` and the same `year`, `ordinalDay`, `hour11`,
 * `minute`, `second`, `millisecond` and `zoneOffset` as `self`
 *
 * @category Setters
 */
export const setMeridiem =
  (meridiem: 0 | 12) =>
  (self: Type): Type =>
    pipe(self, _time, CVTime.setMeridiem(meridiem), _timeSetter(self));

/**
 * If possible, returns a `Right` of a `CVDateTime` having minute `minute` and the same `year`,
 * `ordinalDay`, `hour23`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a `Left` of
 * an error otherwise. `minute` must be an integer greater than or equal to 0 and less than or equal
 * to 59
 *
 * @category Setters
 */
export const setMinute =
  (minute: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    pipe(self, _time, CVTime.setMinute(minute), Either.map(_timeSetter(self)));

/**
 * Same as `setMinute` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setMinuteOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setMinute,
  Function.compose(Either.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a Right of a `CVDateTime` having second `second` and the same `year`,
 * `ordinalDay`, `hour23`, `minute`, `millisecond` and `zoneOffset` as `self`. Returns a `Left` of
 * an error otherwise. `second` must be an integer greater than or equal to 0 and less than or equal
 * to 59
 *
 * @category Setters
 */
export const setSecond =
  (second: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    pipe(self, _time, CVTime.setSecond(second), Either.map(_timeSetter(self)));

/**
 * Same as `setSecond` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setSecondOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setSecond,
  Function.compose(Either.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Right` of a `CVDateTime` having millisecond `millisecond` and the same
 * `year`, `ordinalDay`, `hour23`, `minute`, `second` and `zoneOffset` as `self`. Returns a `Left`
 * of an error otherwise. `millisecond` must be an integer greater than or equal to 0 and less than
 * or equal to 999.
 *
 * @category Setters
 */
export const setMillisecond =
  (millisecond: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    pipe(self, _time, CVTime.setMillisecond(millisecond), Either.map(_timeSetter(self)));

/**
 * Same as `setMillisecond` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setMillisecondOrThrow: MTypes.OneArgFunction<
  number,
  MTypes.OneArgFunction<Type>
> = flow(setMillisecond, Function.compose(Either.getOrThrowWith(Function.identity)));

/**
 * If possible, returns a `Right` of a copy of `self` with timestamp set to `timestamp`. Returns a
 * `Left` of an error otherwise. `timestamp` must be an integer comprised in the range
 * [MIN_TIMESTAMP, MAX_TIMESTAMP] representing the number of milliseconds since 1/1/1970
 * 00:00:00:000+0:00.
 */
const _setTimestamp =
  (timestamp: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    Either.gen(function* () {
      const validatedTimestamp = yield* pipe(
        timestamp,
        MInputError.assertInRange({
          min: MIN_TIMESTAMP,
          max: MAX_TIMESTAMP,
          minIncluded: true,
          maxIncluded: true,
          offset: 0,
          name: 'timestamp',
        }),
      );

      return _uncalculatedFromTimestamp(validatedTimestamp, self.zoneOffset);
    });

const _setZoneOffset =
  (
    keepTimestamp: boolean,
    zoneOffset:
      | number
      | {
          readonly zoneHour: number;
          readonly zoneMinute: number;
          readonly zoneSecond: number;
        } = LOCAL_TIME_ZONE_OFFSET,
  ) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    Either.gen(function* () {
      const buildFromZoneOffset = (validatedZoneOffset: number) =>
        keepTimestamp ?
          _uncalculatedFromTimestamp(self.timestamp, validatedZoneOffset)
        : _uncalculatedFromZonedTimestamp(self.zonedTimestamp, validatedZoneOffset);

      if (MTypes.isPrimitive(zoneOffset)) {
        const validatedZoneOffset = yield* pipe(
          zoneOffset,
          MInputError.assertInRange({
            min: -13,
            max: 15,
            minIncluded: false,
            maxIncluded: false,
            offset: 0,
            name: "'zoneOffset'",
          }),
        );
        return buildFromZoneOffset(validatedZoneOffset);
      }

      const zoneOffsetParts = yield* ZoneOffsetParts.fromParts(zoneOffset);

      const result = pipe(zoneOffsetParts, ZoneOffsetParts.toHour, buildFromZoneOffset);

      (result as MTypes.WithMutable<Type, 'zoneOffsetParts'>).zoneOffsetParts =
        Option.some(zoneOffsetParts);

      return result;
    });

/**
 * If possible, returns a `Right` of a copy of `self` with the same `timestamp` and zoneOffset set
 * to `zoneOffset`.
 *
 * If `zoneOffset` is omitted, the local time zone offset of the machine this code is running on is
 * used.
 *
 * `zoneOffset` can be expressed as as a number of hours. In this case, it must be strictly greater
 * to -13 and strictly less than 15.
 *
 * It can also be expressed as an object containing three components:
 *
 * - `zoneHour` which must be greater than or equal to -12 and less than or equal to 14.
 * - `zoneMinute` which must be greater than or equal to 0 and less than or equal to 59.
 * - `zoneSecond` which must be greater than or equal to 0 and less than or equal to 59.
 *
 * `zoneHour`, `zoneMinute` and `zoneSecond` should be integers. `zoneOffset`, when expressed as a
 * number of hours, does not need to be an integer.
 *
 * @category Setters
 */
export const setZoneOffsetKeepTimestamp = (
  zoneOffset?:
    | number
    | {
        readonly zoneHour: number;
        readonly zoneMinute: number;
        readonly zoneSecond: number;
      },
): MTypes.OneArgFunction<Type, Either.Either<Type, MInputError.Type>> =>
  _setZoneOffset(true, zoneOffset);

/**
 * Same as `setZoneOffsetKeepTimestamp` but returns directly a `CVDateTime` or throws in case of an
 * error
 *
 * @category Setters
 */
export const setZoneOffsetKeepTimestampOrThrow: MTypes.OneArgFunction<
  | number
  | {
      readonly zoneHour: number;
      readonly zoneMinute: number;
      readonly zoneSecond: number;
    },
  MTypes.OneArgFunction<Type>
> = flow(setZoneOffsetKeepTimestamp, Function.compose(Either.getOrThrowWith(Function.identity)));

/**
 * If possible, returns a `Right` of a copy of `self` with the same parts (except `zoneOffset`) and
 * zoneOffset set to `zoneOffset`.
 *
 * See `setZoneOffsetKeepTimestamp` for more details
 *
 * @category Setters
 */
export const setZoneOffsetKeepParts = (
  zoneOffset?:
    | number
    | {
        readonly zoneHour: number;
        readonly zoneMinute: number;
        readonly zoneSecond: number;
      },
): MTypes.OneArgFunction<Type, Either.Either<Type, MInputError.Type>> =>
  _setZoneOffset(false, zoneOffset);

/**
 * Same as `setZoneOffsetKeepTimestamp` but returns directly a `CVDateTime` or throws in case of an
 * error
 *
 * @category Setters
 */
export const setZoneOffsetKeepPartsOrThrow: MTypes.OneArgFunction<
  | number
  | {
      readonly zoneHour: number;
      readonly zoneMinute: number;
      readonly zoneSecond: number;
    },
  MTypes.OneArgFunction<Type>
> = flow(setZoneOffsetKeepParts, Function.compose(Either.getOrThrowWith(Function.identity)));

/**
 * Returns true if the (Gregorian) year of `self` for the given time zone is a leap year. Returns
 * false otherwise
 *
 * @category Predicates
 */
export const yearIsLeap: Predicate.Predicate<Type> = flow(_gregorianDate, GregorianDate.yearIsLeap);

/**
 * Returns true if the isoYear of `self` for the given time zone is a long year. Returns false
 * otherwise
 *
 * @category Predicates
 */
export const isoYearIsLong: Predicate.Predicate<Type> = flow(_isoDate, IsoDate.yearIsLong);

/**
 * Returns true if `self` is the first day of a month in the given timezone
 *
 * @category Predicates
 */

export const isFirstMonthDay: Predicate.Predicate<Type> = (self) => getMonthDay(self) === 1;

/**
 * Returns true if `self` is the last day of a month in the given timezone
 *
 * @category Predicates
 */

export const isLastMonthDay: Predicate.Predicate<Type> = (self) =>
  getMonthDay(self)
  === pipe(self, _gregorianDate, GregorianDate.getNumberOfDaysInMonth(getMonth(self)));

/**
 * Returns true if `self` is the first day of a year in the given timezone
 *
 * @category Predicates
 */

export const isFirstYearDay: Predicate.Predicate<Type> = (self) => getOrdinalDay(self) === 1;

/**
 * Returns true if `self` is the last day of a year in the given timezone
 *
 * @category Predicates
 */

export const isLastYearDay: Predicate.Predicate<Type> = (self) =>
  getOrdinalDay(self) === pipe(self, _gregorianDate, GregorianDate.getYearDurationInDays);

/**
 * Returns true if `self` is the first day of an iso year in the given timezone
 *
 * @category Predicates
 */

export const isFirstIsoYearDay: Predicate.Predicate<Type> = (self) =>
  getIsoWeek(self) === 1 && getWeekday(self) === 1;

/**
 * Returns true if `self` is the last day of an iso year in the given timezone
 *
 * @category Predicates
 */
export const isLastIsoYearDay: Predicate.Predicate<Type> = (self) =>
  getIsoWeek(self) === pipe(self, _isoDate, IsoDate.getLastIsoWeek) && getWeekday(self) === 7;

/**
 * Returns a copy of `self` where `monthDay` is set to the first day of the current month. All time
 * parts (`hour23`, `hour11`, `meridiem`, `minute`, `second`, `millisecond`) are left unchanged
 *
 * @category Offsetters
 */
export const toFirstMonthDay: MTypes.OneArgFunction<Type> = setMonthDayOrThrow(1);

/**
 * Returns a copy of `self` where `monthDay` is set to the last day of the current month. All time
 * parts (`hour23`, `hour11`, `meridiem`, `minute`, `second`, `millisecond`) are left unchanged
 *
 * @category Offsetters
 */
export const toLastMonthDay = (self: Type): Type =>
  setMonthDayOrThrow(
    pipe(self, _gregorianDate, GregorianDate.getNumberOfDaysInMonth(getMonth(self))),
  )(self);

/**
 * Returns a copy of `self` where `ordinalDay` is set to the first day of the current year. All time
 * parts (`hour23`, `hour11`, `meridiem`, `minute`, `second`, `millisecond`) are left unchanged
 *
 * @category Offsetters
 */
export const toFirstYearDay = (self: Type): Type => setOrdinalDayOrThrow(1)(self);

/**
 * Returns a copy of `self` where `ordinalDay` is set to the last day of the current year. All time
 * parts (`hour23`, `hour11`, `meridiem`, `minute`, `second`, `millisecond`) are left unchanged
 *
 * @category Offsetters
 */
export const toLastYearDay = (self: Type): Type =>
  setOrdinalDayOrThrow(pipe(self, _gregorianDate, GregorianDate.getYearDurationInDays))(self);

/**
 * Returns a copy of `self` where `isoWeek` and `weekday` are set to 1. All time parts (`hour23`,
 * `hour11`, `meridiem`, `minute`, `second`, `millisecond`) are left unchanged
 *
 * @category Offsetters
 */
export const toFirstIsoYearDay: MTypes.OneArgFunction<Type> = flow(
  setIsoWeekOrThrow(1),
  setWeekdayOrThrow(1),
);

/**
 * Returns a copy of `self` where `isoWeek` is set to the last week of the current iso year.
 * `weekday` and all time parts (`hour23`, `hour11`, `meridiem`, `minute`, `second`, `millisecond`)
 * are left unchanged
 *
 * @category Offsetters
 */
export const toLastIsoYearWeek = (self: Type): Type =>
  pipe(self, setIsoWeekOrThrow(pipe(self, _isoDate, IsoDate.getLastIsoWeek)));

/**
 * Returns a copy of `self` where `isoWeek` is set to the last week of the current iso year and
 * `weekday` is set to 7. All time parts (`hour23`, `hour11`, `meridiem`, `minute`, `second`,
 * `millisecond`) are left unchanged
 *
 * @category Offsetters
 */
export const toLastIsoYearDay = (self: Type): Type =>
  pipe(self, toLastIsoYearWeek, setWeekdayOrThrow(7));

/**
 * If possible, returns a `Right` of a copy of `self` offset by `offset` years and having the same
 * `month`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a `Left`
 * of an error otherwise. If `respectMonthEnd` is true and `self` is on the last day of a month, the
 * new DateTime object's monthDay will be the last of the target month. Otherwise, it will be the
 * same as `self`
 *
 * @category Offsetters
 */
export const offsetYears = (
  offset: number,
  respectMonthEnd: boolean,
): MTypes.OneArgFunction<Type, Either.Either<Type, MInputError.Type>> =>
  offsetMonths(offset * 12, respectMonthEnd);

/**
 * Same as `offsetYears` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Offsetters
 */
export const offsetYearsOrThrow: (
  offset: number,
  respectMonthEnd: boolean,
) => MTypes.OneArgFunction<Type> = flow(
  offsetYears,
  Function.compose(Either.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Right` of a copy of `self` offset by `offset` months and having the same
 * `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a `Left` of an
 * error otherwise. If `respectMonthEnd` is true and `self` is on the last day of a month, the new
 * DateTime object's monthDay will be the last of the target month. Otherwise, it will be the same
 * as `self`'s
 *
 * @category Offsetters
 */
export const offsetMonths =
  (offset: number, respectMonthEnd: boolean) =>
  (self: Type): Either.Either<Type, MInputError.Type> => {
    const [yearOffset, targetMonthIndex] = pipe(
      self,
      getMonth,
      Number.sum(offset - 1),
      MNumber.quotientAndRemainder(12),
    );
    const offsetToLastMonthDay = respectMonthEnd && isLastMonthDay(self);

    return pipe(
      self,
      offsetToLastMonthDay ? setMonthDayOrThrow(1) : Function.identity,
      setMonthOrThrow(targetMonthIndex + 1),
      setYear(getYear(self) + yearOffset),
      Either.map(MFunction.fIfTrue({ condition: offsetToLastMonthDay, f: toLastMonthDay })),
    );
  };

/**
 * Same as `offsetMonths` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Offsetters
 */
export const offsetMonthsOrThrow: (
  offset: number,
  respectMonthEnd: boolean,
) => MTypes.OneArgFunction<Type> = flow(
  offsetMonths,
  Function.compose(Either.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Right` of a copy of `self` offset by `offset` days. Returns a `Left` of
 * an error otherwise.
 *
 * @category Offsetters
 */
export const offsetDays = (
  offset: number,
): MTypes.OneArgFunction<Type, Either.Either<Type, MInputError.Type>> =>
  offsetMilliseconds(offset * DAY_MS);

/**
 * Same as `offsetDays` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Offsetters
 */
export const offsetDaysOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  offsetDays,
  Function.compose(Either.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Right` of a copy of `self` offset by `offset` iso years and having the
 * same `weekday`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `Left` of an error otherwise. If `respectYearEnd` is true and `self` is on the last day of an iso
 * year, the new DateTime object's isoWeek will be the last of the target iso year. Otherwise, it
 * will be the same as `self`'s.
 *
 * @category Offsetters
 */
export const offsetIsoYears =
  (offset: number, respectYearEnd: boolean) =>
  (self: Type): Either.Either<Type, MInputError.Type> => {
    const offsetToLastIsoYearDay = respectYearEnd && isLastIsoYearDay(self);

    return pipe(
      self,
      offsetToLastIsoYearDay ? setIsoWeekOrThrow(1) : Function.identity,
      setIsoYear(getIsoYear(self) + offset),
      Either.map(MFunction.fIfTrue({ condition: offsetToLastIsoYearDay, f: toLastIsoYearWeek })),
    );
  };

/**
 * Same as `offsetIsoYears` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Offsetters
 */
export const offsetIsoYearsOrThrow: (
  offset: number,
  respectYearEnd: boolean,
) => MTypes.OneArgFunction<Type> = flow(
  offsetIsoYears,
  Function.compose(Either.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Right` of a copy of `self` offset by `offset` hours. Returns a `Left` of
 * an error otherwise.
 *
 * @category Offsetters
 */
export const offsetHours = (
  offset: number,
): MTypes.OneArgFunction<Type, Either.Either<Type, MInputError.Type>> =>
  offsetMilliseconds(offset * HOUR_MS);

/**
 * Same as `offsetHours` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Offsetters
 */
export const offsetHoursOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  offsetHours,
  Function.compose(Either.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Right` of a copy of `self` offset by `offset` minutes. Returns a `Left`
 * of an error otherwise.
 *
 * @category Offsetters
 */
export const offsetMinutes = (
  offset: number,
): MTypes.OneArgFunction<Type, Either.Either<Type, MInputError.Type>> =>
  offsetMilliseconds(offset * MINUTE_MS);

/**
 * Same as `offsetMinutes` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Offsetters
 */
export const offsetMinutesOrThrow: MTypes.OneArgFunction<
  number,
  MTypes.OneArgFunction<Type>
> = flow(offsetMinutes, Function.compose(Either.getOrThrowWith(Function.identity)));

/**
 * If possible, returns a `Right` of a copy of `self` offset by `offset` seconds. Returns a `Left`
 * of an error otherwise.
 *
 * @category Offsetters
 */
export const offsetSeconds = (
  offset: number,
): MTypes.OneArgFunction<Type, Either.Either<Type, MInputError.Type>> =>
  offsetMilliseconds(offset * SECOND_MS);

/**
 * Same as `offsetSeconds` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Offsetters
 */
export const offsetSecondsOrThrow: MTypes.OneArgFunction<
  number,
  MTypes.OneArgFunction<Type>
> = flow(offsetSeconds, Function.compose(Either.getOrThrowWith(Function.identity)));

/**
 * If possible, returns a `Right` of a copy of `self` offset by `offset` milliseconds. Returns a
 * `Left` of an error otherwise.
 *
 * @category Offsetters
 */
export const offsetMilliseconds =
  (offset: number) =>
  (self: Type): Either.Either<Type, MInputError.Type> =>
    _setTimestamp(timestamp(self) + offset)(self);

/**
 * Same as `offsetMilliseconds` but returns directly a `CVDateTime` or throws in case of an error
 *
 * @category Offsetters
 */
export const offsetMillisecondsOrThrow: MTypes.OneArgFunction<
  number,
  MTypes.OneArgFunction<Type>
> = flow(offsetMilliseconds, Function.compose(Either.getOrThrowWith(Function.identity)));
