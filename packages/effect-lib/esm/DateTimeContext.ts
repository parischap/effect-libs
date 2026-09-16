/**
 * This module implements a `MDateTimeContext` which provides, for each `MDateTimeFormat.Token`, the
 * `MTemplatePlaceholder` that can format/parse it. As some tokens are language-dependent, e.g.
 * weekday names, this module provides a constructor from locales, or from translated strings
 */

import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import * as Result from 'effect/Result';
import * as Struct from 'effect/Struct';
import * as Tuple from 'effect/Tuple';
import type * as Types from 'effect/Types';

import type * as MDateTime from './DateTime.js';
import type * as MTypes from './types/types.js';

import * as MArray from './Array.js';
import * as MData from './Data/Data.js';
import * as MInputError from './InputError.js';
import { DAY_MS } from './internal/DateTime/date-time-constants.js';
import * as MNumberBase10Format from './NumberBase10Format.js';
import * as MPredicate from './Predicate.js';
import * as MString from './String/String.js';
import * as MTemplatePlaceholder from './TemplatePart/TemplatePlaceholder.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/DateTimeContext/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Name of a part of a `MDateTime` (see `MDateTime.Parts`)
 *
 * @category Models
 */
export type PartName = keyof MDateTime.Parts;

/**
 * Array of the `MTemplatePlaceholder`'s that can format/parse each `MDateTimeFormat.Token`, indexed
 * by that token's numeric value
 *
 * @category Models
 */
export interface TemplatePlaceholders extends ReadonlyArray<
  MTemplatePlaceholder.Type<PartName, number>
> {}

/**
 * Array of the names of the seven days of a week
 *
 * @category Models
 */
export interface WeekDayNames extends Readonly<Types.TupleOf<7, string>> {}

/**
 * Array of the names of the twelve months of a year
 *
 * @category Models
 */
export interface MonthNames extends Readonly<Types.TupleOf<12, string>> {}

/**
 * Array of the names of the two periods in a day, e.g. AM or PM
 *
 * @category Models
 */
export interface DayPeriodNames extends Readonly<Types.TupleOf<2, string>> {}

/**
 * Each element of this array will be sent to Intl.DateTimeFormat to retrieve the corresponding
 * short and long day name in a given locale. 1/1/1970 was a Thursday, so we need to add 4 days so
 * the array starts on a Monday
 */
const WEEKDAY_DATES = pipe(
  7,
  Array.makeBy(flow(Number.multiply(DAY_MS), Number.sum(4 * DAY_MS))),
  Array.map((timestamp) => new Date(timestamp)),
);

/**
 * Each element of this array will be sent to Intl.DateTimeFormat to retrieve the corresponding
 * short and long month name in a given locale. We don't need to be on the first day of each month,
 * we only need to on one of the days of the correct month
 */
const MONTH_DATES = pipe(
  12,
  Array.makeBy(Number.multiply(31 * DAY_MS)),
  Array.map((timestamp) => new Date(timestamp)),
);

/**
 * Type that represents a MDateTimeContext
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** Name : usually the locale this `MDateTimeContext` was built from. Or a country name */
  readonly name: string;

  /** `TemplatePlaceholders` of this `MDateTimeContext` */
  readonly tokenMap: TemplatePlaceholders;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.name;
    };
  }

  /** Class constructor */
  constructor({ name, tokenMap }: MTypes.Data<Type>) {
    super();
    this.name = name;
    this.tokenMap = tokenMap;
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Constructs a `MDateTimeContext` from translations provided as strings
 *
 * @category Constructors
 */
export const fromNames = ({
  name,
  shortWeekdayNames,
  longWeekdayNames,
  shortMonthNames,
  longMonthNames,
  dayPeriodNames,
}: {
  /* Name of this Context*/
  readonly name: string;

  /** Array of the short weekday names */
  readonly shortWeekdayNames: WeekDayNames;

  /** Array of the long weekday names */
  readonly longWeekdayNames: WeekDayNames;

  /** Array of the short month names */
  readonly shortMonthNames: MonthNames;

  /** Array of the long month names */
  readonly longMonthNames: MonthNames;

  /** Array of the day period names ('AM', 'PM') */
  readonly dayPeriodNames: DayPeriodNames;
}): Type => {
  /* Indexed in the same order as `MDateTimeFormat.Token`: y, yy, yyyy, R, RR, RRRR, M, MM, MMM,
     MMMM, I, II, d, dd, D, DDD, i, iii, iiii, a, H, HH, K, KK, m, mm, s, ss, S, SSS, zH, zHzH, zm,
     zmzm, zs, zszs */
  const tokenMap: TemplatePlaceholders = [
    MTemplatePlaceholder.number({
      name: 'year',
      numberBase10Format: MNumberBase10Format.unsignedInteger,
    }),
    pipe(
      MTemplatePlaceholder.number({
        name: 'year',
        numberBase10Format: MNumberBase10Format.twoDigitUnsignedInteger,
      }),
      MTemplatePlaceholder.modify({
        descriptorMapper: MString.append(' between 2000 and 2099 included'),
        postParser: function (this: MTemplatePlaceholder.Type<'year', number>, value) {
          return pipe(
            value,
            Number.sum(2000),
            MInputError.assertInRange({
              min: 2000,
              max: 2099,
              minIncluded: true,
              maxIncluded: true,
              offset: -2000,
              name: this.label,
            }),
          );
        },
        preFormatter: function (this: MTemplatePlaceholder.Type<'year', number>, value) {
          return pipe(
            value,
            MInputError.assertInRange({
              min: 2000,
              max: 2099,
              minIncluded: true,
              maxIncluded: true,
              offset: 0,
              name: this.label,
            }),
            Result.map(Number.subtract(2000)),
          );
        },
      }),
    ),
    MTemplatePlaceholder.number({
      name: 'year',
      numberBase10Format: MNumberBase10Format.fourDigitUnsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'isoYear',
      numberBase10Format: MNumberBase10Format.unsignedInteger,
    }),
    pipe(
      MTemplatePlaceholder.number({
        name: 'isoYear',
        numberBase10Format: MNumberBase10Format.twoDigitUnsignedInteger,
      }),
      MTemplatePlaceholder.modify({
        descriptorMapper: MString.append(' between 2000 and 2099 included'),
        postParser: function (this: MTemplatePlaceholder.Type<'isoYear', number>, value) {
          return pipe(
            value,
            Number.sum(2000),
            MInputError.assertInRange({
              min: 2000,
              max: 2099,
              minIncluded: true,
              maxIncluded: true,
              offset: -2000,
              name: this.label,
            }),
          );
        },
        preFormatter: function (this: MTemplatePlaceholder.Type<'isoYear', number>, value) {
          return pipe(
            value,
            MInputError.assertInRange({
              min: 2000,
              max: 2099,
              minIncluded: true,
              maxIncluded: true,
              offset: 0,
              name: this.label,
            }),
            Result.map(Number.subtract(2000)),
          );
        },
      }),
    ),
    MTemplatePlaceholder.number({
      name: 'isoYear',
      numberBase10Format: MNumberBase10Format.fourDigitUnsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'month',
      numberBase10Format: MNumberBase10Format.unsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'month',
      numberBase10Format: MNumberBase10Format.twoDigitUnsignedInteger,
    }),
    MTemplatePlaceholder.numberMappedLiterals({
      name: 'month',
      keyValuePairs: pipe(
        shortMonthNames,
        Array.map((monthName, i) => Tuple.make(monthName, i + 1)),
      ),
    }),
    MTemplatePlaceholder.numberMappedLiterals({
      name: 'month',
      keyValuePairs: pipe(
        longMonthNames,
        Array.map((monthName, i) => Tuple.make(monthName, i + 1)),
      ),
    }),
    MTemplatePlaceholder.number({
      name: 'isoWeek',
      numberBase10Format: MNumberBase10Format.unsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'isoWeek',
      numberBase10Format: MNumberBase10Format.twoDigitUnsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'monthDay',
      numberBase10Format: MNumberBase10Format.unsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'monthDay',
      numberBase10Format: MNumberBase10Format.twoDigitUnsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'ordinalDay',
      numberBase10Format: MNumberBase10Format.unsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'ordinalDay',
      numberBase10Format: MNumberBase10Format.threeDigitUnsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'weekday',
      numberBase10Format: MNumberBase10Format.unsignedInteger,
    }),
    MTemplatePlaceholder.numberMappedLiterals({
      name: 'weekday',
      keyValuePairs: pipe(
        shortWeekdayNames,
        Array.map((weekdayName, i) => Tuple.make(weekdayName, i + 1)),
      ),
    }),
    MTemplatePlaceholder.numberMappedLiterals({
      name: 'weekday',
      keyValuePairs: pipe(
        longWeekdayNames,
        Array.map((weekdayName, i) => Tuple.make(weekdayName, i + 1)),
      ),
    }),
    MTemplatePlaceholder.numberMappedLiterals({
      name: 'meridiem',
      keyValuePairs: pipe(
        dayPeriodNames,
        Array.map((dayPeriodName, i) => Tuple.make(dayPeriodName, i * 12)),
      ),
    }),
    MTemplatePlaceholder.number({
      name: 'hour23',
      numberBase10Format: MNumberBase10Format.unsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'hour23',
      numberBase10Format: MNumberBase10Format.twoDigitUnsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'hour11',
      numberBase10Format: MNumberBase10Format.unsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'hour11',
      numberBase10Format: MNumberBase10Format.twoDigitUnsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'minute',
      numberBase10Format: MNumberBase10Format.unsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'minute',
      numberBase10Format: MNumberBase10Format.twoDigitUnsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'second',
      numberBase10Format: MNumberBase10Format.unsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'second',
      numberBase10Format: MNumberBase10Format.twoDigitUnsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'millisecond',
      numberBase10Format: MNumberBase10Format.unsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'millisecond',
      numberBase10Format: MNumberBase10Format.threeDigitUnsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'zoneHour',
      numberBase10Format: MNumberBase10Format.signedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'zoneHour',
      numberBase10Format: MNumberBase10Format.twoDigitSignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'zoneMinute',
      numberBase10Format: MNumberBase10Format.unsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'zoneMinute',
      numberBase10Format: MNumberBase10Format.twoDigitUnsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'zoneSecond',
      numberBase10Format: MNumberBase10Format.unsignedInteger,
    }),
    MTemplatePlaceholder.number({
      name: 'zoneSecond',
      numberBase10Format: MNumberBase10Format.twoDigitUnsignedInteger,
    }),
  ];

  return new Type({ name, tokenMap });
};

/**
 * `MDateTimeContext` instance for Great-Britain English language
 *
 * @category Instances
 */
export const enGB: Type = fromNames({
  name: 'en-GB',
  longWeekdayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  shortWeekdayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  longMonthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  shortMonthNames: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  dayPeriodNames: ['AM', 'PM'],
});

const safeDateTimeFormat = Option.liftThrowable(Intl.DateTimeFormat);

const extractType = (
  type: 'weekday' | 'month',
): MTypes.OneArgFunction<ReadonlyArray<Intl.DateTimeFormatPart>, Option.Option<string>> =>
  flow(
    Array.findFirst(flow(Struct.get('type'), MPredicate.strictEquals(type))),
    Option.map(Struct.get('value')),
  );

const extractWeekday = extractType('weekday');
const extractMonth = extractType('month');

/**
 * Tries to build a `MDateTimeContext` from locale `locale`. Returns a `Some` if successful. Returns
 * a `None` otherwise (non-existent or unavailable locale,...),
 *
 * @category Constructors
 */
export const fromLocale = (locale: string): Option.Option<Type> =>
  Option.gen(function* () {
    const longDateTimeFormatInLocale = yield* safeDateTimeFormat(locale, {
      timeZone: 'UTC',
      weekday: 'long',
      month: 'long',
    });

    const toLongParts = Intl.DateTimeFormat.prototype.formatToParts.bind(
      longDateTimeFormatInLocale,
    );

    const shortDateTimeFormatInLocale = yield* safeDateTimeFormat(locale, {
      timeZone: 'UTC',
      weekday: 'short',
      month: 'short',
    });

    const toShortParts = Intl.DateTimeFormat.prototype.formatToParts.bind(
      shortDateTimeFormatInLocale,
    );

    const longWeekdayNames = (yield* pipe(
      WEEKDAY_DATES,
      MArray.mapUnlessNone(flow(toLongParts, extractWeekday)),
    )) as unknown as WeekDayNames;

    const longMonthNames = (yield* pipe(
      MONTH_DATES,
      MArray.mapUnlessNone(flow(toLongParts, extractMonth)),
    )) as unknown as MonthNames;

    const shortWeekdayNames = (yield* pipe(
      WEEKDAY_DATES,
      MArray.mapUnlessNone(flow(toShortParts, extractWeekday)),
    )) as unknown as WeekDayNames;

    const shortMonthNames = (yield* pipe(
      MONTH_DATES,
      MArray.mapUnlessNone(flow(toShortParts, extractMonth)),
    )) as unknown as MonthNames;

    const dayPeriodNames: DayPeriodNames = ['AM', 'PM'];

    return fromNames({
      name: locale,
      shortWeekdayNames,
      longWeekdayNames,
      shortMonthNames,
      longMonthNames,
      dayPeriodNames,
    });
  });

/**
 * Same as `fromLocale` but returns directly a `MDateTimeContext` or throws in case of an error
 *
 * @category Constructors
 */
export const fromLocaleOrThrow = (locale: string): Type =>
  pipe(
    locale,
    fromLocale,
    Option.getOrThrowWith(
      () => new Error(`A MDateTimeContext could not be built for locale '${locale}'`),
    ),
  );

/**
 * Returns the `name` property of `self`
 *
 * @category Getters
 */
export const name: MTypes.OneArgFunction<Type, string> = Struct.get('name');

/**
 * Returns the `tokenMap` property of `self`
 *
 * @category Getters
 */
export const tokenMap: MTypes.OneArgFunction<Type, TemplatePlaceholders> = Struct.get('tokenMap');
