/**
 * This module implements an immutable `MDateTime` object.
 *
 * `MDateTime` objects keep an internal state. But all provided functions are pure insofar as they
 * always yield the same result whatever the state the object is in. The state is only used to
 * improve performance but does not alter the results.
 *
 * Unlike the JavaScript `Date` objects and the `effect/DateTime` objects, `MDateTime` objects
 * handle both the Gregorian and Iso calendars. So you can easily get/set the iso year and iso week
 * of a `MDateTime` object.
 *
 * A `MDateTime` object has a `zoneOffset` which is the difference in hours between the time in the
 * local zone and UTC time (e.g. `zoneOffset=1` for timezone +1:00). All the data in a `MDateTime`
 * object is zoneOffset-dependent, except `timestamp`. An important thing to note is that a
 * `MDateTime` object with a timestamp `t` and a zoneOffset `zo` has exactly the same date parts
 * (`year`, `ordinalDay`, `month`, `monthDay`, `isoYear`...) as a `MDateTime` object with `timestamp
 * = t+zox3600` and `zoneOffset = 0`. That's the reason for the zonedTimestamp field which is equal
 * to `t+zox3600`. All calculations are performed UTC using zonedTimestamp instead of timestamp.
 */

import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import * as DateTime from 'effect/DateTime';
import type * as Equivalence from 'effect/Equivalence';
import * as Function from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as Record from 'effect/Record';
import * as Result from 'effect/Result';
import * as Struct from 'effect/Struct';

import type * as MDateTimeContext from './DateTimeContext.js';
import type * as MDateTimeFormat from './DateTimeFormat.js';
import type * as MTypes from './types/types.js';

import * as MArray from './Array.js';
import * as MData from './Data/Data.js';
import * as MEquivalenceBasedEqualityData from './Data/EquivalenceBasedEqualityData.js';
import * as MFunction from './Function.js';
import * as MInputError from './InputError.js';
import {
  DAY_MS,
  HOUR_MS,
  MAX_FULL_YEAR,
  MAX_TIMESTAMP,
  MIN_FULL_YEAR,
  MIN_TIMESTAMP,
  MINUTE_MS,
  SECOND_MS,
} from './internal/DateTime/date-time-constants.js';
import * as GregorianDate from './internal/DateTime/GregorianDate.js';
import * as IsoDate from './internal/DateTime/IsoDate.js';
import * as Time from './internal/DateTime/Time.js';
import * as ZoneOffsetParts from './internal/DateTime/ZoneOffsetParts.js';
import * as MMatch from './Match.js';
import * as MNumber from './Number.js';
import * as MPredicate from './Predicate.js';
import * as MString from './String/String.js';
import * as MTemplate from './Template.js';
import * as MTemplatePart from './TemplatePart/TemplatePart.js';
import * as MTemplatePlaceholder from './TemplatePart/TemplatePlaceholder.js';
import * as MTemplateSeparator from './TemplatePart/TemplateSeparator.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/DateTime/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents the different parts of a `MDateTime`
 *
 * @category Models
 */
export interface Parts {
  /** The Gregorian year, range: [MIN_FULL_YEAR, MAX_FULL_YEAR] */
  readonly year?: number;
  /** Number of days elapsed since the start of year, range:[1, 366] */
  readonly ordinalDay?: number;
  /** Month in the current year, range:[1, 12] */
  readonly month?: number;
  /** Day in the current month, range:[1, 31] */
  readonly monthDay?: number;
  /** The iso year, range: [MIN_FULL_YEAR, MAX_FULL_YEAR] */
  readonly isoYear?: number;
  /** The iso week in the current iso year, range:[1, 53] */
  readonly isoWeek?: number;
  /** Week day in the current iso week, range:[1, 7], 1 is monday, 7 is sunday */
  readonly weekday?: number;
  /** Number of hours since the start of the current day, range:[0, 23] */
  readonly hour23?: number;
  /** Number of hours since the start of the current meridiem, range:[0, 11] */
  readonly hour11?: number;
  /** Meridiem offset of this DateTime in hours, 0 for 'AM', 12 for 'PM' */
  readonly meridiem?: 0 | 12;
  /** Number of minutes since the start of the current hour, range:[0, 59] */
  readonly minute?: number;
  /** Number of seconds, since the start of the current minute, range:[0, 59] */
  readonly second?: number;
  /** Number of milliseconds, since the start of the current second, range:[0, 999] */
  readonly millisecond?: number;
  /**
   * Offset in hours between the time in the local zone and UTC time (e.g zoneOffset=1 for timezone
   * +1:00). Not necessarily an integer, range: ]-13, 15[
   */
  readonly zoneOffset?: number;
  /** Hour part of the zoneOffset. Should be an integer in the range: [-12, 14] */
  readonly zoneHour?: number;
  /** Minute part of the zoneOffset. Should be an integer in the range: [0, 59] */
  readonly zoneMinute?: number;
  /** Second part of the zoneOffset. Should be an integer in the range: [0, 59] */
  readonly zoneSecond?: number;
}

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
export const LOCAL_TIME_ZONE_OFFSET: number = -(new Date().getTimezoneOffset() / 60);

const uncalculated = {
  _gregorianDate: Option.none(),
  _isoDate: Option.none(),
  _time: Option.none(),
  _zoneOffsetParts: Option.none(),
};

/**
 * Type that represents a MDateTime
 *
 * @category Models
 */
export class Type extends MEquivalenceBasedEqualityData.Class {
  /** Timestamp of this DateTime (timezone-independent) */
  readonly timestamp: number;

  /** GregorianDate of this DateTime, expressed in given timezone */
  private gregorianDate: Option.Option<GregorianDate.Type>;

  /** IsoDate of this DateTime, expressed in given timezone */
  private isoDate: Option.Option<IsoDate.Type>;

  /** Time of this DateTime, expressed in given timezone */
  private time: Option.Option<Time.Type>;

  /**
   * Offset in hours between the time of the zone for which all calculations of that DateTime object
   * will be carried out and UTC time (e.g zoneOffset=1 for timezone +1:00). Not necessarily an
   * integer, range: ]-13, 15[
   */
  readonly zoneOffset: number;

  /** ZoneOffset decomposed into its parts */
  private zoneOffsetParts: Option.Option<ZoneOffsetParts.Type>;

  /** Calculated field equal to timestamp + zoneOffsetx3600 */
  readonly zonedTimestamp: number;

  /**
   * Returns the `gregorianDate` of `this` for the given time zone -Calculates it if necessary and
   * stores it for future use
   */
  get _gregorianDate(): GregorianDate.Type {
    return pipe(
      this.gregorianDate,
      Option.getOrElse(() => {
        const result = GregorianDate.fromTimestamp(this.zonedTimestamp);
        this.gregorianDate = Option.some(result);
        return result;
      }),
    );
  }

  /**
   * Returns the `isoDate` of `this` for the given time zone -Calculates it if necessary and stores
   * it for future use
   */
  get _isoDate(): IsoDate.Type {
    return pipe(
      this.isoDate,
      Option.getOrElse(() => {
        const result = pipe(
          this.gregorianDate,
          Option.map(IsoDate.fromGregorianDate),
          Option.getOrElse(() => IsoDate.fromTimestamp(this.zonedTimestamp)),
        );
        this.isoDate = Option.some(result);
        return result;
      }),
    );
  }

  /**
   * Returns the `time` of `this` for the given time zone -Calculates it if necessary and stores it
   * for future use
   */
  get _time(): Time.Type {
    return pipe(
      this.time,
      Option.getOrElse(() => {
        const result = pipe(this.zonedTimestamp, MNumber.intModulo(DAY_MS), Time.fromTimestamp);
        this.time = Option.some(result);
        return result;
      }),
    );
  }

  /**
   * Returns the `zoneOffsetParts` of `self` -Calculates it if necessary and stores it for future
   * use
   */
  get _zoneOffsetParts(): ZoneOffsetParts.Type {
    return pipe(
      this.zoneOffsetParts,
      Option.getOrElse(() => {
        const result = ZoneOffsetParts.fromZoneOffset(this.zoneOffset);
        this.zoneOffsetParts = Option.some(result);
        return result;
      }),
    );
  }

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return getIsoString(this);
    };
  }

  /** Class constructor */
  private constructor({
    timestamp,
    _gregorianDate,
    _isoDate,
    _time,
    zoneOffset,
    _zoneOffsetParts,
    zonedTimestamp,
  }: {
    readonly timestamp: number;
    readonly _gregorianDate: Option.Option<GregorianDate.Type>;
    readonly _isoDate: Option.Option<IsoDate.Type>;
    readonly _time: Option.Option<Time.Type>;
    readonly zoneOffset: number;
    readonly _zoneOffsetParts: Option.Option<ZoneOffsetParts.Type>;
    readonly zonedTimestamp: number;
  }) {
    super();
    this.timestamp = timestamp;
    this.gregorianDate = _gregorianDate;
    this.isoDate = _isoDate;
    this.time = _time;
    this.zoneOffset = zoneOffset;
    this.zoneOffsetParts = _zoneOffsetParts;
    this.zonedTimestamp = zonedTimestamp;
  }

  /**
   * Constructor that creates a DateTime from a timestamp and a zoneOffset for which no calculations
   * have been carried out yet. The `zonedTimestamp` field is automatically calculated. Does not
   * check any input parameters
   */
  private static uncalculatedFromTimestamp(timestamp: number, zoneOffset: number): Type {
    return new Type({
      ...uncalculated,
      timestamp,
      zoneOffset,
      zonedTimestamp: timestamp + zoneOffset * HOUR_MS,
    });
  }

  /**
   * Constructor that creates a DateTime from a zonedTimestamp and a zoneOffset for which no
   * calculations have been carried out yet. The `timestamp` field is automatically calculated. Does
   * not check any input parameters
   */
  private static uncalculatedFromZonedTimestamp(zonedTimestamp: number, zoneOffset: number): Type {
    return new Type({
      ...uncalculated,
      timestamp: zonedTimestamp - zoneOffset * HOUR_MS,
      zoneOffset,
      zonedTimestamp: zonedTimestamp,
    });
  }

  /**
   * If possible, returns a `Success` of a copy of `self` with timestamp set to `timestamp`. Returns
   * a `Failure` of an error otherwise. `timestamp` must be an integer comprised in the range
   * [MIN_TIMESTAMP, MAX_TIMESTAMP] representing the number of milliseconds since 1/1/1970
   * 00:00:00:000+0:00.
   */
  _setTimestamp(timestamp: number): Result.Result<Type, MInputError.Type> {
    return pipe(
      timestamp,
      MInputError.assertInRange({
        min: MIN_TIMESTAMP,
        max: MAX_TIMESTAMP,
        minIncluded: true,
        maxIncluded: true,
        offset: 0,
        name: 'timestamp',
      }),
      Result.map((validatedTimestamp) =>
        Type.uncalculatedFromTimestamp(validatedTimestamp, this.zoneOffset),
      ),
    );
  }

  /**
   * If possible, returns a `Success` of a copy of `self` with zoneOffset set to `zoneOffset`.
   * Returns a `Failure` of an error otherwise. `timestamp` must be an integer comprised in the
   * range [MIN_TIMESTAMP, MAX_TIMESTAMP] representing the number of milliseconds since 1/1/1970
   * 00:00:00:000+0:00.
   */
  _setZoneOffset(
    keepTimestamp: boolean,
    zoneOffset:
      | number
      | {
          readonly zoneHour: number;
          readonly zoneMinute: number;
          readonly zoneSecond: number;
        } = LOCAL_TIME_ZONE_OFFSET,
  ): Result.Result<Type, MInputError.Type> {
    const { timestamp, zonedTimestamp } = this;
    return Result.gen(function* () {
      const buildFromZoneOffset = (validatedZoneOffset: number) =>
        keepTimestamp
          ? Type.uncalculatedFromTimestamp(timestamp, validatedZoneOffset)
          : Type.uncalculatedFromZonedTimestamp(zonedTimestamp, validatedZoneOffset);

      if (MPredicate.isPrimitive(zoneOffset)) {
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

      result.zoneOffsetParts = Option.some(zoneOffsetParts);

      return result;
    });
  }

  /**
   * Tries to build a `MDateTime` from `timestamp`, the number of milliseconds since 1/1/1970
   * 00:00:00:000+0:00, and `zoneOffset` which gives the offset between the local time and the UTC
   * time. Returns a `Success` if successful, a `Failure` otherwise.
   *
   * `timestamp` must be greater than or equal to MIN_TIMESTAMP and less than or equal to
   * MAX_TIMESTAMP.
   *
   * If `zoneOffset` is omitted, the local time zone offset of the machine this code is running on
   * is used.
   *
   * `zoneOffset` can be expressed as a number of hours. In this case, it must be strictly greater
   * to
   *
   * - 13 and strictly less than 15.
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
   */
  static fromTimestamp(
    timestamp: number,
    zoneOffset?:
      | number
      | {
          readonly zoneHour: number;
          readonly zoneMinute: number;
          readonly zoneSecond: number;
        },
  ): Result.Result<Type, MInputError.Type> {
    return Result.flatMap(
      Type.uncalculatedFromTimestamp(0, 0)._setTimestamp(timestamp),
      setZoneOffsetKeepTimestamp(zoneOffset),
    );
  }

  /** Builds a `MDateTime` using Date.now() as `timestamp`. `zoneOffset` is set to 0. */
  static now(): Type {
    return Type.uncalculatedFromTimestamp(Date.now(), 0);
  }

  /**
   * Tries to build a `MDateTime` from the provided parts. Returns a `Success` if successful, a
   * `Failure` otherwise.
   *
   * `year` must comprised in the range [MIN_FULL_YEAR, MAX_FULL_YEAR]. `ordinalDay` must be greater
   * than or equal to 1 and less than or equal to the number of days in the current year. `month`
   * must be greater than or equal to 1 (January) and less than or equal to 12 (December).
   * `monthDay` must be greater than or equal to 1 and less than or equal to the number of days in
   * the current month.
   *
   * `isoYear` must be comprised in the range [MIN_FULL_YEAR, MAX_FULL_YEAR]. `isoWeek` must be
   * greater than or equal to 1 and less than or equal to the number of iso weeks in the current
   * year. `weekday` must be greater than or equal to 1 (monday) and less than or equal to 7
   * (sunday).
   *
   * If there is not sufficient information to determine the exact day of the year, i.e. none of the
   * three following tuples is fully determined [year, ordinalDay], [year, month, monthDay],
   * [isoYear, isoWeek, weekday], default values are determined in the following order (the first
   * match stops the process):
   *
   * - If `year` and `month` are set, `monthDay` is taken equal to 1.
   * - If `year` and `monthDay` are set, `month` is taken equal to 1.
   * - If `year` is set and both `month` and `monthDay` are undefined, the day is taken to be the
   *   first one in the year.
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
   * equal to 0 and less than or equal to 59. `zoneSecond` must be greater than or equal to 0 and
   * less than or equal to 59.
   *
   * If there is not sufficient information to determine the exact time zone offset, i.e. none of
   * the two following tuples is fully determined [zoneOffset], [zoneHour, zoneMinute, zoneSecond],
   * default values are determined as follows :
   *
   * - If all parameters are undefined, the local time zone offset of the machine this code is running
   *   on is used. ATTENTION: unlike the JavaScript Date constructor, fromParts uses the current
   *   time zone offset, not the one that prevails at the given date (so, in Paris, in winter, the
   *   time zone offset for date 20250714 is -1 and not -2).
   * - If any of `zoneHour`, `zoneMinute`, `zoneSecond` is defined, the remaining undefined parameters
   *   are taken equal to 0.
   *
   * Note that zoneHour=-0, zoneMinute=10, zoneSecond=0 is different from zoneHour=0, zoneMinute=10,
   * zoneSecond=0. The first corresponds to the string 'GMT-00:10', a negative 10-minute offset, the
   * second one to the string 'GMT+00:10', a positive 10-minute offset.
   *
   * `year`, `ordinalDay`, `month`, `monthDay`, `isoYear`, `isoWeek`, `weekday`, `hour23`, `hour11`,
   * `minute`, `second`, `millisecond`, `zoneHour`, `zoneMinute` and `zoneSecond` should be
   * integers. `zoneOffset` does not need to be an integer.
   *
   * All parameters must be coherent. For instance, `year=1970`, `month=1`, `monthDay=1`,
   * `weekday=0` `zoneHour=0`, `zoneMinute=0` and `zoneSecond=0` will trigger an error because
   * 1/1/1970 00:00:00:000+0:00 is a thursday. `hour23=13` and `meridiem=0` will also trigger an
   * error.
   *
   * @category Constructors
   */

  static fromParts({
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
  }: Parts): Result.Result<Type, MInputError.Type> {
    return Result.gen(function* () {
      const zonedOrigin = yield* Result.gen(function* () {
        if (
          zoneOffset !== undefined ||
          (zoneHour === undefined && zoneMinute === undefined && zoneSecond === undefined)
        ) {
          const result = yield* pipe(
            Type.uncalculatedFromTimestamp(0, 0),
            setZoneOffsetKeepParts(zoneOffset),
          );

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
          Type.uncalculatedFromTimestamp(0, 0),
          setZoneOffsetKeepParts({
            zoneHour: zoneHour ?? 0,
            zoneMinute: zoneMinute ?? 0,
            zoneSecond: zoneSecond ?? 0,
          }),
        );
      });

      const withHour = yield* Result.gen(function* () {
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
        const withHour11 =
          hour11 !== undefined ? yield* setHour11(hour11)(zonedOrigin) : zonedOrigin;
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
        const withDay = yield* Result.gen(function* () {
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
        return yield* Result.fail(
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
  }

  /** Returns a copy of `this` with `_gregorianDate` set to `gregorianDate` */
  _setGregorianDate(gregorianDate: GregorianDate.Type): Type {
    const selfTimestamp = this._gregorianDate.timestamp;
    const offset = gregorianDate.timestamp - selfTimestamp;
    return new Type({
      timestamp: this.timestamp + offset,
      _gregorianDate: Option.some(gregorianDate),
      _isoDate: Option.none(),
      _time: this.time,
      zoneOffset: this.zoneOffset,
      _zoneOffsetParts: this.zoneOffsetParts,
      zonedTimestamp: this.zonedTimestamp + offset,
    });
  }

  /** Returns a copy of this with `isoDate` set to `isoDate` */
  _setIsoDate(isoDate: IsoDate.Type): Type {
    const selfTimestamp = this._isoDate.timestamp;
    const offset = isoDate.timestamp - selfTimestamp;
    return new Type({
      timestamp: this.timestamp + offset,
      _gregorianDate: Option.none(),
      _isoDate: Option.some(isoDate),
      _time: this.time,
      zoneOffset: this.zoneOffset,
      _zoneOffsetParts: this.zoneOffsetParts,
      zonedTimestamp: this.zonedTimestamp + offset,
    });
  }

  /** Returns a copy of this with `time` set to `time` */
  _setTime(time: Time.Type): Type {
    const selfTimestampOffset = this._time.timestampOffset;
    const offset = time.timestampOffset - selfTimestampOffset;
    return new Type({
      timestamp: this.timestamp + offset,
      _gregorianDate: this.gregorianDate,
      _isoDate: this.isoDate,
      _time: Option.some(time),
      zoneOffset: this.zoneOffset,
      _zoneOffsetParts: this.zoneOffsetParts,
      zonedTimestamp: this.zonedTimestamp + offset,
    });
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return 0;
  }

  /** Function that implements the equivalence of `this` and `that` */
  [MEquivalenceBasedEqualityData.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
  }

  /** Predicate that returns true if `that` has the same type marker as `this` */
  [MEquivalenceBasedEqualityData.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
    return Predicate.hasProperty(that, TypeId);
  }
  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

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
  GregorianDate.getIsoString(self._gregorianDate) +
  'T' +
  Time.getIsoString(self._time) +
  ZoneOffsetParts.getIsoString(self._zoneOffsetParts);

/**
 * Tries to build a `MDateTime` from `timestamp`, the number of milliseconds since 1/1/1970
 * 00:00:00:000+0:00, and `zoneOffset` which gives the offset between the local time and the UTC
 * time. Returns a `Success` if successful, a `Failure` otherwise.
 *
 * `timestamp` must be greater than or equal to MIN_TIMESTAMP and less than or equal to
 * MAX_TIMESTAMP.
 *
 * If `zoneOffset` is omitted, the local time zone offset of the machine this code is running on is
 * used.
 *
 * `zoneOffset` can be expressed as a number of hours. In this case, it must be strictly greater to
 *
 * - 13 and strictly less than 15.
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
): Result.Result<Type, MInputError.Type> => Type.fromTimestamp(timestamp, zoneOffset);

/**
 * Same as `fromTimestamp` but returns directly a `MDateTime` or throws if it cannot be built
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
) => Type = flow(fromTimestamp, Result.getOrThrowWith(Function.identity));

/**
 * Builds a `MDateTime` using Date.now() as `timestamp`. `zoneOffset` is set to 0.
 *
 * @category Constructors
 */
export const now = (): Type => Type.now();

/**
 * Tries to build a `MDateTime` from the provided parts. Returns a `Success` if successful, a
 * `Failure` otherwise.
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
 *   on is used. ATTENTION: unlike the JavaScript Date constructor, fromParts uses the current time
 *   zone offset, not the one that prevails at the given date (so, in Paris, in winter, the time
 *   zone offset for date 20250714 is -1 and not -2).
 * - If any of `zoneHour`, `zoneMinute`, `zoneSecond` is defined, the remaining undefined parameters
 *   are taken equal to 0.
 *
 * Note that zoneHour=-0, zoneMinute=10, zoneSecond=0 is different from zoneHour=0, zoneMinute=10,
 * zoneSecond=0. The first corresponds to the string 'GMT-00:10', a negative 10-minute offset, the
 * second one to the string 'GMT+00:10', a positive 10-minute offset.
 *
 * `year`, `ordinalDay`, `month`, `monthDay`, `isoYear`, `isoWeek`, `weekday`, `hour23`, `hour11`,
 * `minute`, `second`, `millisecond`, `zoneHour`, `zoneMinute` and `zoneSecond` should be integers.
 * `zoneOffset` does not need to be an integer.
 *
 * All parameters must be coherent. For instance, `year=1970`, `month=1`, `monthDay=1`, `weekday=0`
 * `zoneHour=0`, `zoneMinute=0` and `zoneSecond=0` will trigger an error because 1/1/1970
 * 00:00:00:000+0:00 is a thursday. `hour23=13` and `meridiem=0` will also trigger an error.
 *
 * @category Constructors
 */

export const fromParts = (params: Parts): Result.Result<Type, MInputError.Type> =>
  Type.fromParts(params);

/**
 * Same as `fromParts` but returns directly a `MDateTime` or throws if it cannot be built
 *
 * @category Constructors
 */
export const fromPartsOrThrow: (parts: Parts) => Type = flow(
  fromParts,
  Result.getOrThrowWith(Function.identity),
);

/**
 * Builds a `MDateTime` from a Javascript `Date`
 *
 * @category Constructors
 */
export const fromDate = (date: Date): Type => fromTimestampOrThrow(date.getTime());

/**
 * Builds a `MDateTime` from an `effect/DateTime.Zoned`
 *
 * @category Constructors
 */
export const fromEffectDateTime = (date: DateTime.Zoned): Type =>
  fromTimestampOrThrow(DateTime.toEpochMillis(date), DateTime.zonedOffset(date));

/**
 * Builds a Javascript `Date` from a `MDateTime`
 *
 * @category Utils
 */
export const toDate = (self: Type): Date => new Date(timestamp(self));

/**
 * Builds an `effect/DateTime.Zoned` from a `MDateTime`
 *
 * @category Utils
 */
export const toEffectDateTime = (self: Type): DateTime.Zoned =>
  DateTime.makeZonedUnsafe(timestamp(self), { timeZone: self.zoneOffset });

/**
 * Returns the timestamp property of `self` as a number
 *
 * @category Getters
 */
export const timestamp: MTypes.OneArgFunction<Type, number> = Struct.get('timestamp');

/**
 * Returns the `gregorianDate` property of `self`
 *
 * @category Getters
 */
export const gregorianDate: MTypes.OneArgFunction<Type, GregorianDate.Type> =
  Struct.get('_gregorianDate');

/**
 * Returns the `isoDate` property of `self`
 *
 * @category Getters
 */
export const isoDate: MTypes.OneArgFunction<Type, IsoDate.Type> = Struct.get('_isoDate');

/**
 * Returns the `time` property of `self`
 *
 * @category Getters
 */
export const time: MTypes.OneArgFunction<Type, Time.Type> = Struct.get('_time');

/**
 * Returns the `zoneOffsetParts` property of `self`
 *
 * @category Getters
 */
export const zoneOffsetParts: MTypes.OneArgFunction<Type, ZoneOffsetParts.Type> =
  Struct.get('_zoneOffsetParts');

/**
 * Returns the (Gregorian) year of `self` for the given time zone
 *
 * @category Destructors
 */
export const getYear: MTypes.OneArgFunction<Type, number> = flow(gregorianDate, GregorianDate.year);

/**
 * Returns the ordinalDay of `self` for the given time zone
 *
 * @category Destructors
 */
export const getOrdinalDay: MTypes.OneArgFunction<Type, number> = flow(
  gregorianDate,
  GregorianDate.ordinalDay,
);

/**
 * Returns the month of `self` for the given time zone
 *
 * @category Destructors
 */
export const getMonth: MTypes.OneArgFunction<Type, number> = flow(
  gregorianDate,
  GregorianDate.getMonth,
);

/**
 * Returns the monthDay of `self` for the given time zone
 *
 * @category Destructors
 */
export const getMonthDay: MTypes.OneArgFunction<Type, number> = flow(
  gregorianDate,
  GregorianDate.getMonthDay,
);

/**
 * Returns the isoYear of `self` for the given time zone
 *
 * @category Destructors
 */
export const getIsoYear: MTypes.OneArgFunction<Type, number> = flow(isoDate, IsoDate.year);

/**
 * Returns the isoWeek of `self` for the given time zone
 *
 * @category Destructors
 */
export const getIsoWeek: MTypes.OneArgFunction<Type, number> = flow(isoDate, IsoDate.getIsoWeek);

/**
 * Returns the weekday of `self` for the given time zone
 *
 * @category Destructors
 */
export const getWeekday: MTypes.OneArgFunction<Type, number> = flow(isoDate, IsoDate.getWeekday);

/**
 * Returns the hour23 of `self` for the given time zone
 *
 * @category Destructors
 */
export const getHour23: MTypes.OneArgFunction<Type, number> = flow(time, Time.hour23);

/**
 * Returns the hour11 of `self` for the given time zone
 *
 * @category Destructors
 */
export const getHour11: MTypes.OneArgFunction<Type, number> = flow(time, Time.hour11);

/**
 * Returns the meridiem of `self` for the given time zone
 *
 * @category Destructors
 */
export const getMeridiem: MTypes.OneArgFunction<Type, 0 | 12> = flow(time, Time.meridiem);

/**
 * Returns the minute of `self` for the given time zone
 *
 * @category Destructors
 */
export const getMinute: MTypes.OneArgFunction<Type, number> = flow(time, Time.minute);

/**
 * Returns the second of `self` for the given time zone
 *
 * @category Destructors
 */
export const getSecond: MTypes.OneArgFunction<Type, number> = flow(time, Time.second);

/**
 * Returns the millisecond of `self` for the given time zone
 *
 * @category Destructors
 */
export const getMillisecond: MTypes.OneArgFunction<Type, number> = flow(time, Time.millisecond);

/**
 * Returns the hour part of the zoneOffset of `self`
 *
 * @category Destructors
 */
export const getZoneHour: MTypes.OneArgFunction<Type, number> = flow(
  zoneOffsetParts,
  ZoneOffsetParts.zoneHour,
);

/**
 * Returns the minute part of the zoneOffset of `self`
 *
 * @category Destructors
 */
export const getZoneMinute: MTypes.OneArgFunction<Type, number> = flow(
  zoneOffsetParts,
  ZoneOffsetParts.zoneMinute,
);

/**
 * Returns the second part of the zoneOffset of `self`
 *
 * @category Destructors
 */
export const getZoneSecond: MTypes.OneArgFunction<Type, number> = flow(
  zoneOffsetParts,
  ZoneOffsetParts.zoneSecond,
);

/**
 * If possible, returns a `Success` of a `MDateTime` having year `year` and the same `month`,
 * `monthDay`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `Failure` otherwise. `year` must be an integer comprised in the range [MIN_FULL_YEAR,
 * MAX_FULL_YEAR].
 *
 * @category Setters
 */
export const setYear =
  (year: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    pipe(
      self,
      gregorianDate,
      GregorianDate.setYear(year),
      Result.map(self._setGregorianDate.bind(self)),
    );

/**
 * Same as `setYear` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setYearOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setYear,
  Function.compose(Result.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Success` of a `MDateTime` having ordinalDay `ordinalDay` and the same
 * `year`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `Failure` of an error otherwise. `ordinalDay` must be an integer greater than or equal to 1 and
 * less than or equal to the number of days in the current year
 *
 * @category Setters
 */
export const setOrdinalDay =
  (ordinalDay: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    pipe(
      self,
      gregorianDate,
      GregorianDate.setOrdinalDay(ordinalDay),
      Result.map(self._setGregorianDate.bind(self)),
    );

/**
 * Same as `setOrdinalDay` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setOrdinalDayOrThrow: MTypes.OneArgFunction<
  number,
  MTypes.OneArgFunction<Type>
> = flow(setOrdinalDay, Function.compose(Result.getOrThrowWith(Function.identity)));

/**
 * If possible, returns a `Success` of a `MDateTime` having month `month` and the same `year`,
 * `monthDay`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `Failure` of an error otherwise. `month` must be an integer greater than or equal to 1 (January)
 * and less than or equal to 12 (December)
 *
 * @category Setters
 */
export const setMonth =
  (month: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    pipe(
      self,
      gregorianDate,
      GregorianDate.setMonth(month),
      Result.map(self._setGregorianDate.bind(self)),
    );

/**
 * Same as `setMonth` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setMonthOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setMonth,
  Function.compose(Result.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Success` of a `MDateTime` having monthDay `monthDay` and the same `year`,
 * `month`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `Failure` of an error otherwise. `monthDay` must be an integer greater than or equal to 1 and
 * less than or equal to the number of days in the current month.
 *
 * @category Setters
 */
export const setMonthDay =
  (monthDay: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    pipe(
      self,
      gregorianDate,
      GregorianDate.setMonthDay(monthDay),
      Result.map(self._setGregorianDate.bind(self)),
    );

/**
 * Same as `setMonthDay` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setMonthDayOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setMonthDay,
  Function.compose(Result.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Success` of a `MDateTime` having isoYear `isoYear` and the same
 * `isoWeek`, `weekday`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`.
 * Returns a `Failure` of an error otherwise. `isoYear` must be an integer comprised in the range
 * [MIN_FULL_YEAR, MAX_FULL_YEAR].
 *
 * @category Setters
 */
export const setIsoYear =
  (isoYear: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    pipe(self, isoDate, IsoDate.setYear(isoYear), Result.map(self._setIsoDate.bind(self)));

/**
 * Same as `setIsoYear` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setIsoYearOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setIsoYear,
  Function.compose(Result.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Success` of a `MDateTime` having isoWeek `isoWeek` and the same
 * `isoYear`, `weekday`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`.
 * Returns a `Failure` of an error otherwise. `isoWeek` must be an integer greater than or equal to
 * 1 and less than or equal to the number of iso weeks in the current year.
 *
 * @category Setters
 */
export const setIsoWeek =
  (isoWeek: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    pipe(self, isoDate, IsoDate.setIsoWeek(isoWeek), Result.map(self._setIsoDate.bind(self)));

/**
 * Same as `setIsoWeek` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setIsoWeekOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setIsoWeek,
  Function.compose(Result.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Success` of a `MDateTime` having weekday `weekday` and the same
 * `isoYear`, `isoWeek`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`.
 * Returns a `Failure` of an error otherwise. `weekday` must be an integer greater than or equal to
 * 1 (monday) and less than or equal to 7 (sunday).
 *
 * @category Setters
 */
export const setWeekday =
  (weekday: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    pipe(self, isoDate, IsoDate.setWeekday(weekday), Result.map(self._setIsoDate.bind(self)));

/**
 * Same as `setWeekday` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setWeekdayOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setWeekday,
  Function.compose(Result.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Success` of a `MDateTime` having hour23 `hour23` and the same `year`,
 * `ordinalDay`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a `Failure`
 * of an error otherwise. `hour23` must be an integer greater than or equal to 0 and less than or
 * equal to 23
 *
 * @category Setters
 */
export const setHour23 =
  (hour23: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    pipe(self, time, Time.setHour23(hour23), Result.map(self._setTime.bind(self)));

/**
 * Same as `setHour23` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setHour23OrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setHour23,
  Function.compose(Result.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Success` of a `MDateTime` having hour11 `hour11` and the same `year`,
 * `ordinalDay`, `meridiem`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `Failure` of an error otherwise. `hour11` must be an integer greater than or equal to 0 and less
 * than or equal to 11.
 *
 * @category Setters
 */
export const setHour11 =
  (hour11: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    pipe(self, time, Time.setHour11(hour11), Result.map(self._setTime.bind(self)));

/**
 * Same as `setHour11` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setHour11OrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setHour11,
  Function.compose(Result.getOrThrowWith(Function.identity)),
);

/**
 * Returns a `MDateTime` having meridiem `meridiem` and the same `year`, `ordinalDay`, `hour11`,
 * `minute`, `second`, `millisecond` and `zoneOffset` as `self`
 *
 * @category Setters
 */
export const setMeridiem =
  (meridiem: 0 | 12) =>
  (self: Type): Type =>
    pipe(self, time, Time.setMeridiem(meridiem), self._setTime.bind(self));

/**
 * If possible, returns a `Success` of a `MDateTime` having minute `minute` and the same `year`,
 * `ordinalDay`, `hour23`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a `Failure`
 * of an error otherwise. `minute` must be an integer greater than or equal to 0 and less than or
 * equal to 59
 *
 * @category Setters
 */
export const setMinute =
  (minute: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    pipe(self, time, Time.setMinute(minute), Result.map(self._setTime.bind(self)));

/**
 * Same as `setMinute` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setMinuteOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setMinute,
  Function.compose(Result.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Success` of a `MDateTime` having second `second` and the same `year`,
 * `ordinalDay`, `hour23`, `minute`, `millisecond` and `zoneOffset` as `self`. Returns a `Failure`
 * of an error otherwise. `second` must be an integer greater than or equal to 0 and less than or
 * equal to 59
 *
 * @category Setters
 */
export const setSecond =
  (second: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    pipe(self, time, Time.setSecond(second), Result.map(self._setTime.bind(self)));

/**
 * Same as `setSecond` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setSecondOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  setSecond,
  Function.compose(Result.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Success` of a `MDateTime` having millisecond `millisecond` and the same
 * `year`, `ordinalDay`, `hour23`, `minute`, `second` and `zoneOffset` as `self`. Returns a
 * `Failure` of an error otherwise. `millisecond` must be an integer greater than or equal to 0 and
 * less than or equal to 999.
 *
 * @category Setters
 */
export const setMillisecond =
  (millisecond: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    pipe(self, time, Time.setMillisecond(millisecond), Result.map(self._setTime.bind(self)));

/**
 * Same as `setMillisecond` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Setters
 */
export const setMillisecondOrThrow: MTypes.OneArgFunction<
  number,
  MTypes.OneArgFunction<Type>
> = flow(setMillisecond, Function.compose(Result.getOrThrowWith(Function.identity)));

/**
 * If possible, returns a `Success` of a copy of `self` with the same `timestamp` and zoneOffset set
 * to `zoneOffset`.
 *
 * If `zoneOffset` is omitted, the local time zone offset of the machine this code is running on is
 * used.
 *
 * `zoneOffset` can be expressed as a number of hours. In this case, it must be strictly greater to
 *
 * - 13 and strictly less than 15.
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
export const setZoneOffsetKeepTimestamp =
  (
    zoneOffset?:
      | number
      | {
          readonly zoneHour: number;
          readonly zoneMinute: number;
          readonly zoneSecond: number;
        },
  ) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    self._setZoneOffset(true, zoneOffset);

/**
 * Same as `setZoneOffsetKeepTimestamp` but returns directly a `MDateTime` or throws in case of an
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
> = flow(setZoneOffsetKeepTimestamp, Function.compose(Result.getOrThrowWith(Function.identity)));

/**
 * If possible, returns a `Success` of a copy of `self` with the same parts (except `zoneOffset`)
 * and zoneOffset set to `zoneOffset`.
 *
 * See `setZoneOffsetKeepTimestamp` for more details
 *
 * @category Setters
 */
export const setZoneOffsetKeepParts =
  (
    zoneOffset?:
      | number
      | {
          readonly zoneHour: number;
          readonly zoneMinute: number;
          readonly zoneSecond: number;
        },
  ) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    self._setZoneOffset(false, zoneOffset);

/**
 * Same as `setZoneOffsetKeepParts` but returns directly a `MDateTime` or throws in case of an error
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
> = flow(setZoneOffsetKeepParts, Function.compose(Result.getOrThrowWith(Function.identity)));

/**
 * Returns true if the (Gregorian) year of `self` for the given time zone is a leap year. Returns
 * false otherwise
 *
 * @category Predicates
 */
export const yearIsLeap: Predicate.Predicate<Type> = flow(gregorianDate, GregorianDate.yearIsLeap);

/**
 * Returns true if the isoYear of `self` for the given time zone is a long year. Returns false
 * otherwise
 *
 * @category Predicates
 */
export const isoYearIsLong: Predicate.Predicate<Type> = flow(isoDate, IsoDate.yearIsLong);

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
  getMonthDay(self) ===
  pipe(self, gregorianDate, GregorianDate.getNumberOfDaysInMonth(getMonth(self)));

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
  getOrdinalDay(self) === pipe(self, gregorianDate, GregorianDate.getYearDurationInDays);

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
  getIsoWeek(self) === pipe(self, isoDate, IsoDate.getLastIsoWeek) && getWeekday(self) === 7;

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
    pipe(self, gregorianDate, GregorianDate.getNumberOfDaysInMonth(getMonth(self))),
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
  setOrdinalDayOrThrow(pipe(self, gregorianDate, GregorianDate.getYearDurationInDays))(self);

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
  pipe(self, setIsoWeekOrThrow(pipe(self, isoDate, IsoDate.getLastIsoWeek)));

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
 * If possible, returns a `Success` of a copy of `self` offset by `offset` years and having the same
 * `month`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `Failure` of an error otherwise. If `respectMonthEnd` is true and `self` is on the last day of a
 * month, the new DateTime object's monthDay will be the last of the target month. Otherwise, it
 * will be the same as `self`
 *
 * @category Offsetters
 */
export const offsetYears = (
  offset: number,
  respectMonthEnd: boolean,
): MTypes.OneArgFunction<Type, Result.Result<Type, MInputError.Type>> =>
  offsetMonths(offset * 12, respectMonthEnd);

/**
 * Same as `offsetYears` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Offsetters
 */
export const offsetYearsOrThrow: (
  offset: number,
  respectMonthEnd: boolean,
) => MTypes.OneArgFunction<Type> = flow(
  offsetYears,
  Function.compose(Result.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Success` of a copy of `self` offset by `offset` months and having the
 * same `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a `Failure`
 * of an error otherwise. If `respectMonthEnd` is true and `self` is on the last day of a month, the
 * new DateTime object's monthDay will be the last of the target month. Otherwise, it will be the
 * same as `self`'s
 *
 * @category Offsetters
 */
export const offsetMonths =
  (offset: number, respectMonthEnd: boolean) =>
  (self: Type): Result.Result<Type, MInputError.Type> => {
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
      Result.map(MFunction.fIfTrue({ condition: offsetToLastMonthDay, f: toLastMonthDay })),
    );
  };

/**
 * Same as `offsetMonths` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Offsetters
 */
export const offsetMonthsOrThrow: (
  offset: number,
  respectMonthEnd: boolean,
) => MTypes.OneArgFunction<Type> = flow(
  offsetMonths,
  Function.compose(Result.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Success` of a copy of `self` offset by `offset` days. Returns a `Failure`
 * of an error otherwise.
 *
 * @category Offsetters
 */
export const offsetDays = (
  offset: number,
): MTypes.OneArgFunction<Type, Result.Result<Type, MInputError.Type>> =>
  offsetMilliseconds(offset * DAY_MS);

/**
 * Same as `offsetDays` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Offsetters
 */
export const offsetDaysOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  offsetDays,
  Function.compose(Result.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Success` of a copy of `self` offset by `offset` iso years and having the
 * same `weekday`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `Failure` of an error otherwise. If `respectYearEnd` is true and `self` is on the last day of an
 * iso year, the new DateTime object's isoWeek will be the last of the target iso year. Otherwise,
 * it will be the same as `self`'s.
 *
 * @category Offsetters
 */
export const offsetIsoYears =
  (offset: number, respectYearEnd: boolean) =>
  (self: Type): Result.Result<Type, MInputError.Type> => {
    const offsetToLastIsoYearDay = respectYearEnd && isLastIsoYearDay(self);

    return pipe(
      self,
      offsetToLastIsoYearDay ? setIsoWeekOrThrow(1) : Function.identity,
      setIsoYear(getIsoYear(self) + offset),
      Result.map(MFunction.fIfTrue({ condition: offsetToLastIsoYearDay, f: toLastIsoYearWeek })),
    );
  };

/**
 * Same as `offsetIsoYears` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Offsetters
 */
export const offsetIsoYearsOrThrow: (
  offset: number,
  respectYearEnd: boolean,
) => MTypes.OneArgFunction<Type> = flow(
  offsetIsoYears,
  Function.compose(Result.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Success` of a copy of `self` offset by `offset` hours. Returns a
 * `Failure` of an error otherwise.
 *
 * @category Offsetters
 */
export const offsetHours = (
  offset: number,
): MTypes.OneArgFunction<Type, Result.Result<Type, MInputError.Type>> =>
  offsetMilliseconds(offset * HOUR_MS);

/**
 * Same as `offsetHours` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Offsetters
 */
export const offsetHoursOrThrow: MTypes.OneArgFunction<number, MTypes.OneArgFunction<Type>> = flow(
  offsetHours,
  Function.compose(Result.getOrThrowWith(Function.identity)),
);

/**
 * If possible, returns a `Success` of a copy of `self` offset by `offset` minutes. Returns a
 * `Failure` of an error otherwise.
 *
 * @category Offsetters
 */
export const offsetMinutes = (
  offset: number,
): MTypes.OneArgFunction<Type, Result.Result<Type, MInputError.Type>> =>
  offsetMilliseconds(offset * MINUTE_MS);

/**
 * Same as `offsetMinutes` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Offsetters
 */
export const offsetMinutesOrThrow: MTypes.OneArgFunction<
  number,
  MTypes.OneArgFunction<Type>
> = flow(offsetMinutes, Function.compose(Result.getOrThrowWith(Function.identity)));

/**
 * If possible, returns a `Success` of a copy of `self` offset by `offset` seconds. Returns a
 * `Failure` of an error otherwise.
 *
 * @category Offsetters
 */
export const offsetSeconds = (
  offset: number,
): MTypes.OneArgFunction<Type, Result.Result<Type, MInputError.Type>> =>
  offsetMilliseconds(offset * SECOND_MS);

/**
 * Same as `offsetSeconds` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Offsetters
 */
export const offsetSecondsOrThrow: MTypes.OneArgFunction<
  number,
  MTypes.OneArgFunction<Type>
> = flow(offsetSeconds, Function.compose(Result.getOrThrowWith(Function.identity)));

/**
 * If possible, returns a `Success` of a copy of `self` offset by `offset` milliseconds. Returns a
 * `Failure` of an error otherwise.
 *
 * @category Offsetters
 */
export const offsetMilliseconds =
  (offset: number) =>
  (self: Type): Result.Result<Type, MInputError.Type> =>
    self._setTimestamp(timestamp(self) + offset);

/**
 * Same as `offsetMilliseconds` but returns directly a `MDateTime` or throws in case of an error
 *
 * @category Offsetters
 */
export const offsetMillisecondsOrThrow: MTypes.OneArgFunction<
  number,
  MTypes.OneArgFunction<Type>
> = flow(offsetMilliseconds, Function.compose(Result.getOrThrowWith(Function.identity)));

const toTemplateParts = (
  dateTimeFormat: MDateTimeFormat.Type,
  dateTimeContext: MDateTimeContext.Type,
): ReadonlyArray<MTemplatePart.Type<string, any>> =>
  pipe(
    dateTimeFormat,
    Array.map((part) =>
      Predicate.isString(part)
        ? MTemplateSeparator.make(part)
        : MArray.unsafeGet(part)(dateTimeContext.tokenMap),
    ),
  );

const dateTimePartReader =
  (f: MTypes.OneArgFunction<Type, number>) =>
  (
    name: string,
  ): Option.Option<readonly [name: string, reader: MTypes.OneArgFunction<Type, number>]> =>
    Option.some([name, f]);

/**
 * Returns a function that tries to format `self` into a string according to `dateTimeFormat` and
 * `dateTimeContext`.
 *
 * - Use a precomputed formatter when the same `dateTimeFormat`/`dateTimeContext` pair will be applied
 *   many times.
 *
 * **Example** (Format a `MDateTime` as an ISO date)
 *
 * ```ts
 * import * as MDateTime from '@parischap/effect-lib/MDateTime';
 * import * as MDateTimeContext from '@parischap/effect-lib/MDateTimeContext';
 * import * as MDateTimeFormat from '@parischap/effect-lib/MDateTimeFormat';
 *
 * const format = MDateTime.format(MDateTimeFormat.iso8601, MDateTimeContext.enGB);
 * console.log(format(MDateTime.fromTimestampOrThrow(0, 0))); // Success('1970-01-01')
 * ```
 *
 * @category Destructors
 */
export const format = (
  dateTimeFormat: MDateTimeFormat.Type,
  dateTimeContext: MDateTimeContext.Type,
): MTypes.OneArgFunction<Type, Result.Result<string, MInputError.Type>> => {
  const templateParts = toTemplateParts(dateTimeFormat, dateTimeContext);

  const toParts: Record<string, MTypes.OneArgFunction<Type, number>> = pipe(
    templateParts,
    Array.filterMap(
      flow(
        MMatch.make,
        MMatch.when(MTemplatePart.isSeparator, () => Option.none()),
        MMatch.when(
          MTemplatePart.isPlaceholder,
          flow(
            MTemplatePlaceholder.name,
            MMatch.make,
            flow(
              MMatch.whenIs('year', dateTimePartReader(getYear)),
              MMatch.whenIs('ordinalDay', dateTimePartReader(getOrdinalDay)),
              MMatch.whenIs('month', dateTimePartReader(getMonth)),
              MMatch.whenIs('monthDay', dateTimePartReader(getMonthDay)),
              MMatch.whenIs('isoYear', dateTimePartReader(getIsoYear)),
              MMatch.whenIs('isoWeek', dateTimePartReader(getIsoWeek)),
              MMatch.whenIs('weekday', dateTimePartReader(getWeekday)),
              MMatch.whenIs('hour23', dateTimePartReader(getHour23)),
              MMatch.whenIs('hour11', dateTimePartReader(getHour11)),
            ),
            flow(
              MMatch.whenIs('meridiem', dateTimePartReader(getMeridiem)),
              MMatch.whenIs('minute', dateTimePartReader(getMinute)),
              MMatch.whenIs('second', dateTimePartReader(getSecond)),
              MMatch.whenIs('millisecond', dateTimePartReader(getMillisecond)),
              MMatch.whenIs('zoneHour', dateTimePartReader(getZoneHour)),
              MMatch.whenIs('zoneMinute', dateTimePartReader(getZoneMinute)),
              MMatch.whenIs('zoneSecond', dateTimePartReader(getZoneSecond)),
            ),
            MMatch.orElse(() => Option.none()),
          ),
        ),
        MMatch.exhaustive,
        Result.fromOption(MFunction.constFailVoid),
      ),
    ),
    Record.fromEntries,
  );

  const templateFormat = pipe(
    templateParts,
    Function.tupled(MTemplate.make),
    MString.templateFormat,
  );

  return (self) => pipe(toParts, Record.map(Function.apply(self)), templateFormat);
};

/**
 * Same as `format` but throws in case of failure
 *
 * @category Destructors
 */
export const formatOrThrow = (
  dateTimeFormat: MDateTimeFormat.Type,
  dateTimeContext: MDateTimeContext.Type,
): MTypes.OneArgFunction<Type, string> => {
  const formatter = format(dateTimeFormat, dateTimeContext);
  return flow(formatter, Result.getOrThrowWith(Function.identity));
};

/**
 * Returns a function that tries to parse a string into a `MDateTime` according to `dateTimeFormat`
 * and `dateTimeContext`.
 *
 * - Use a precomputed parser when the same `dateTimeFormat`/`dateTimeContext` pair will be applied
 *   many times.
 *
 * **Example** (Parse an ISO date into a `MDateTime`)
 *
 * ```ts
 * import * as MDateTime from '@parischap/effect-lib/MDateTime';
 * import * as MDateTimeContext from '@parischap/effect-lib/MDateTimeContext';
 * import * as MDateTimeFormat from '@parischap/effect-lib/MDateTimeFormat';
 *
 * const parse = MDateTime.parse(MDateTimeFormat.iso8601, MDateTimeContext.enGB);
 * console.log(parse('1970-01-01')); // Success(MDateTime with timestamp 0)
 * ```
 *
 * @category Constructors
 */
export const parse = (
  dateTimeFormat: MDateTimeFormat.Type,
  dateTimeContext: MDateTimeContext.Type,
): MTypes.OneArgFunction<string, Result.Result<Type, MInputError.Type>> => {
  const templateParts = toTemplateParts(dateTimeFormat, dateTimeContext);
  const templateParse = pipe(templateParts, Function.tupled(MTemplate.make), MString.templateParse);

  return flow(
    templateParse,
    Result.flatMap((parts) => fromParts(parts as Parts)),
  );
};

/**
 * Same as `parse` but throws in case of failure
 *
 * @category Constructors
 */
export const parseOrThrow = (
  dateTimeFormat: MDateTimeFormat.Type,
  dateTimeContext: MDateTimeContext.Type,
): MTypes.OneArgFunction<string, Type> => {
  const parser = parse(dateTimeFormat, dateTimeContext);
  return flow(parser, Result.getOrThrowWith(Function.identity));
};
