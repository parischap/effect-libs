/**
 * This module implements a `CVDateFormatContext` which is used when parsing or formatting dates
 * (see DateTimeFormat.ts) to provide the translations used by language specific tokens (e.g.
 * `MMMM`)
 */

import {
  MArray,
  MInputError,
  MInspectable,
  MPipeable,
  MPredicate,
  MString,
  MTypes,
} from '@parischap/effect-lib';
import {
  Array,
  Either,
  flow,
  HashMap,
  Number,
  Option,
  pipe,
  Pipeable,
  Predicate,
  Struct,
  Tuple,
} from 'effect';
import { DAY_MS } from './dateTimeConstants.js';
import * as CVNumberBase10Format from './NumberBase10Format.js';
import * as CVReal from './Real.js';
import * as CVTemplatePartPlaceholder from './TemplatePart/Placeholder.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/DateTimeFormatTemplate/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents all the possible tokens that can be used to format a `CVDateTime`
 *
 * @category Models
 */
export type Token =
  /* Gregorian year (ex: 2005) */
  | 'y'
  /* Gregorian year on 2 digits left-padded with 0's corresponding to years 2000-2099 (ex: 05 for 2005) */
  | 'yy'
  /* Gregorian year on 4 digits left-padded with 0's (ex: 2005, 0965) */
  | 'yyyy'
  /* Iso year (ex: 2005) */
  | 'R'
  /* Iso year on 2 digits left-padded with 0's corresponding to years 2000-2099 (ex: 05 for 2005) */
  | 'RR'
  /* Iso year on 4 digits left-padded with 0's (ex: 2005, 0965)*/
  | 'RRRR'
  /* Month (ex: 6) */
  | 'M'
  /* Month on 2 digits left-padded with 0's (ex: 06) */
  | 'MM'
  /* Short month name (ex: Jun) */
  | 'MMM'
  /* Long month name (ex: June) */
  | 'MMMM'
  /* IsoWeek (ex: 6) */
  | 'I'
  /* IsoWeek (ex: 06) */
  | 'II'
  /* Day of month (ex: 5) */
  | 'd'
  /* Day of month on 2 digits left-padded with 0's (ex: 05) */
  | 'dd'
  /* Day of year (ex: 97) */
  | 'D'
  /* Day of year on 3 digits left-padded with 0's (ex: 097) */
  | 'DDD'
  /* Weekday (ex: 1 for monday, 7 for sunday) */
  | 'i'
  /* Short weekday name (ex: Mon) */
  | 'iii'
  /* Long weekday name (ex: Monday) */
  | 'iiii'
  /* Meridiem (ex: 'AM' for 0, 'PM' for 12) */
  | 'a'
  /* Hour in the range 0..23 (ex:5, 14) */
  | 'H'
  /* Hour on 2 digits in the range 0..23 left-padded with 0's (ex:05, 14) */
  | 'HH'
  /* Hour in the range 0..11 (ex:5, 2) */
  | 'K'
  /* Hour on 2 digits in the range 0..11 left-padded with 0's (ex:05, 02) */
  | 'KK'
  /* Minute (ex: 5) */
  | 'm'
  /* Minute on 2 digits left-padded with 0's (ex: 05) */
  | 'mm'
  /* Second (ex: 5) */
  | 's'
  /* Second on 2 digits left-padded with 0's (ex: 05) */
  | 'ss'
  /* Millisecond (ex: 5) */
  | 'S'
  /* Millisecond on 3 digits left-padded with 0's (ex: 005) */
  | 'SSS'
  /* Hour part of the timezone offset (ex: 5) */
  | 'zH'
  /* Hour part of the timezone offset on 2 digits left-padded with 0's (ex: 05) */
  | 'zHzH'
  /* Minute part of the timezone offset (ex: 5) */
  | 'zm'
  /* Minute part of the timezone offset on 2 digits left-padded with 0's (ex: 05) */
  | 'zmzm'
  /* Second part of the timezone offset (ex: 5) */
  | 'zs'
  /* Second part of the timezone offset on 2 digits left-padded with 0's (ex: 05) */
  | 'zszs';

namespace TokenMap {
  /**
   * Type that represents a map between a `Token` and the `CVPlaceholder` that implements it
   *
   * @category Models
   */
  export interface Type extends HashMap.HashMap<
    Token,
    CVTemplatePartPlaceholder.Type<string, CVReal.Type>
  > {}
}

/**
 * Type that represents the names of the seven days of a week
 *
 * @category Models
 */
export interface WeekDayNames extends MTypes.Tuple<string, 7> {}

/**
 * Type that represents the names of the twelve months of a year
 *
 * @category Models
 */
export interface MonthNames extends MTypes.Tuple<string, 12> {}

/**
 * Type that represents the names of the day periods, e.g. AM or PM
 *
 * @category Models
 */
export interface DayPeriodNames extends MTypes.Tuple<string, 2> {}

const WEEKDAY_DATES = pipe(
  7,
  Array.makeBy(flow(Number.multiply(DAY_MS), Number.sum(4 * DAY_MS))),
  Array.map((timestamp) => new Date(timestamp)),
);

const MONTH_DATES = pipe(
  12,
  Array.makeBy(Number.multiply(31 * DAY_MS)),
  Array.map((timestamp) => pipe(new Date(timestamp))),
);

/**
 * Type that represents a `CVDateTimeFormatContext`
 *
 * @category Model
 */
export interface Type extends MInspectable.Type, Pipeable.Pipeable {
  /** Name : usually the locale this `CVDateTimeFormatContext` was built from. Or a country name */
  readonly name: string;

  /** TokenMap of this `CVDateTimeFormatContext` */
  readonly tokenMap: TokenMap.Type;

  /** @internal */
  readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

/** Prototype */
const _proto: MTypes.Proto<Type> = {
  [_TypeId]: _TypeId,
  [MInspectable.IdSymbol](this: Type) {
    return this.name;
  },
  ...MInspectable.BaseProto(moduleTag),
  ...MPipeable.BaseProto,
};

const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(_proto, params);

/**
 * Constructs a `CVDateTimeFormatContext` from translations provided as strings
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
  const { integer } = CVNumberBase10Format;
  const signedInteger = pipe(integer, CVNumberBase10Format.withSignDisplay);
  const params = { fillChar: '0', numberBase10Format: integer };

  const templatepartEntries: ReadonlyArray<
    readonly [Token, CVTemplatePartPlaceholder.Type<string, CVReal.Type>]
  > = [
    ['y', CVTemplatePartPlaceholder.real({ ...params, name: 'year' })],
    [
      'yy',
      pipe(
        CVTemplatePartPlaceholder.fixedLengthToReal({ ...params, name: 'year', length: 2 }),
        CVTemplatePartPlaceholder.modify({
          descriptorMapper: MString.append(' between 2000 and 2099 included'),
          postParser: function (this: CVTemplatePartPlaceholder.Type<'year', CVReal.Type>, value) {
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
              Either.map(CVReal.unsafeFromNumber),
            );
          },
          preFormatter: function (
            this: CVTemplatePartPlaceholder.Type<'year', CVReal.Type>,
            value,
          ) {
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
              Either.map(flow(Number.subtract(2000), CVReal.unsafeFromNumber)),
            );
          },
        }),
      ),
    ],
    ['yyyy', CVTemplatePartPlaceholder.fixedLengthToReal({ ...params, name: 'year', length: 4 })],
    ['R', CVTemplatePartPlaceholder.real({ ...params, name: 'isoYear' })],
    [
      'RR',
      pipe(
        CVTemplatePartPlaceholder.fixedLengthToReal({ ...params, name: 'isoYear', length: 2 }),
        CVTemplatePartPlaceholder.modify({
          descriptorMapper: MString.append(' between 2000 and 2099 included'),
          postParser: function (
            this: CVTemplatePartPlaceholder.Type<'isoYear', CVReal.Type>,
            value,
          ) {
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
              Either.map(CVReal.unsafeFromNumber),
            );
          },
          preFormatter: function (
            this: CVTemplatePartPlaceholder.Type<'isoYear', CVReal.Type>,
            value,
          ) {
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
              Either.map(flow(Number.subtract(2000), CVReal.unsafeFromNumber)),
            );
          },
        }),
      ),
    ],
    [
      'RRRR',
      CVTemplatePartPlaceholder.fixedLengthToReal({ ...params, name: 'isoYear', length: 4 }),
    ],
    ['M', CVTemplatePartPlaceholder.real({ ...params, name: 'month' })],
    ['MM', CVTemplatePartPlaceholder.fixedLengthToReal({ ...params, name: 'month', length: 2 })],
    [
      'MMM',
      CVTemplatePartPlaceholder.realMappedLiterals({
        name: 'month',
        keyValuePairs: pipe(
          shortMonthNames,
          Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i + 1))),
        ),
      }),
    ],
    [
      'MMMM',
      CVTemplatePartPlaceholder.realMappedLiterals({
        name: 'month',
        keyValuePairs: pipe(
          longMonthNames,
          Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i + 1))),
        ),
      }),
    ],
    [
      'I',
      CVTemplatePartPlaceholder.real({
        name: 'isoWeek',
        numberBase10Format: CVNumberBase10Format.integer,
      }),
    ],
    ['II', CVTemplatePartPlaceholder.fixedLengthToReal({ ...params, name: 'isoWeek', length: 2 })],
    ['d', CVTemplatePartPlaceholder.real({ ...params, name: 'monthDay' })],
    ['dd', CVTemplatePartPlaceholder.fixedLengthToReal({ ...params, name: 'monthDay', length: 2 })],
    ['D', CVTemplatePartPlaceholder.real({ ...params, name: 'ordinalDay' })],
    [
      'DDD',
      CVTemplatePartPlaceholder.fixedLengthToReal({ ...params, name: 'ordinalDay', length: 3 }),
    ],
    ['i', CVTemplatePartPlaceholder.real({ ...params, name: 'weekday' })],
    [
      'iii',
      CVTemplatePartPlaceholder.realMappedLiterals({
        name: 'weekday',
        keyValuePairs: pipe(
          shortWeekdayNames,
          Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i + 1))),
        ),
      }),
    ],
    [
      'iiii',
      CVTemplatePartPlaceholder.realMappedLiterals({
        name: 'weekday',
        keyValuePairs: pipe(
          longWeekdayNames,
          Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i + 1))),
        ),
      }),
    ],
    [
      'a',
      CVTemplatePartPlaceholder.realMappedLiterals({
        name: 'meridiem',
        keyValuePairs: pipe(
          dayPeriodNames,
          Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i * 12))),
        ),
      }),
    ],
    ['H', CVTemplatePartPlaceholder.real({ ...params, name: 'hour23' })],
    ['HH', CVTemplatePartPlaceholder.fixedLengthToReal({ ...params, name: 'hour23', length: 2 })],
    ['K', CVTemplatePartPlaceholder.real({ ...params, name: 'hour11' })],
    ['KK', CVTemplatePartPlaceholder.fixedLengthToReal({ ...params, name: 'hour11', length: 2 })],
    ['m', CVTemplatePartPlaceholder.real({ ...params, name: 'minute' })],
    ['mm', CVTemplatePartPlaceholder.fixedLengthToReal({ ...params, name: 'minute', length: 2 })],
    ['s', CVTemplatePartPlaceholder.real({ ...params, name: 'second' })],
    ['ss', CVTemplatePartPlaceholder.fixedLengthToReal({ ...params, name: 'second', length: 2 })],
    ['S', CVTemplatePartPlaceholder.real({ ...params, name: 'millisecond' })],
    [
      'SSS',
      CVTemplatePartPlaceholder.fixedLengthToReal({ ...params, name: 'millisecond', length: 3 }),
    ],
    [
      'zH',
      CVTemplatePartPlaceholder.real({
        ...params,
        name: 'zoneHour',
        numberBase10Format: signedInteger,
      }),
    ],
    [
      'zHzH',
      CVTemplatePartPlaceholder.fixedLengthToReal({
        ...params,
        name: 'zoneHour',
        length: 3,
        numberBase10Format: signedInteger,
      }),
    ],
    ['zm', CVTemplatePartPlaceholder.real({ ...params, name: 'zoneMinute' })],
    [
      'zmzm',
      CVTemplatePartPlaceholder.fixedLengthToReal({ ...params, name: 'zoneMinute', length: 2 }),
    ],
    ['zs', CVTemplatePartPlaceholder.real({ ...params, name: 'zoneSecond' })],
    [
      'zszs',
      CVTemplatePartPlaceholder.fixedLengthToReal({ ...params, name: 'zoneSecond', length: 2 }),
    ],
  ];

  return _make({
    name,
    tokenMap: HashMap.make(...templatepartEntries),
  });
};

/**
 * `CVDateTimeFormatContext` instance for Great-Britain English language
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

const _safeDateTimeFormat = Option.liftThrowable(Intl.DateTimeFormat);

const _extractType = (
  type: 'weekday' | 'month',
): MTypes.OneArgFunction<ReadonlyArray<Intl.DateTimeFormatPart>, Option.Option<string>> =>
  flow(
    Array.findFirst(flow(Struct.get('type'), MPredicate.strictEquals(type))),
    Option.map(Struct.get('value')),
  );

const _extractWeekday = _extractType('weekday');
const _extractMonth = _extractType('month');

/**
 * Tries to build a `CVDateTimeFormatContext` from locale `locale`. Returns a `Some` if successful.
 * Returns a `None` otherwise (non-existent or unavailable locale,...),
 *
 * @category Constructors
 */
export const fromLocale = (locale: string): Option.Option<Type> =>
  Option.gen(function* () {
    const longDateTimeFormatInLocale = yield* _safeDateTimeFormat(locale, {
      timeZone: 'UTC',
      weekday: 'long',
      month: 'long',
    });

    const toLongParts = Intl.DateTimeFormat.prototype.formatToParts.bind(
      longDateTimeFormatInLocale,
    );

    const shortDateTimeFormatInLocale = yield* _safeDateTimeFormat(locale, {
      timeZone: 'UTC',
      weekday: 'short',
      month: 'short',
    });

    const toShortParts = Intl.DateTimeFormat.prototype.formatToParts.bind(
      shortDateTimeFormatInLocale,
    );

    const longWeekdayNames = (yield* pipe(
      WEEKDAY_DATES,
      MArray.mapUnlessNone(flow(toLongParts, _extractWeekday)),
    )) as unknown as WeekDayNames;

    const longMonthNames = (yield* pipe(
      MONTH_DATES,
      MArray.mapUnlessNone(flow(toLongParts, _extractMonth)),
    )) as unknown as MonthNames;

    const shortWeekdayNames = (yield* pipe(
      WEEKDAY_DATES,
      MArray.mapUnlessNone(flow(toShortParts, _extractWeekday)),
    )) as unknown as WeekDayNames;

    const shortMonthNames = (yield* pipe(
      MONTH_DATES,
      MArray.mapUnlessNone(flow(toShortParts, _extractMonth)),
    )) as unknown as MonthNames;

    const dayPeriodNames: DayPeriodNames = ['am', 'pm'];

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
 * Same as `fromLocale` but returns directly a `CVDateTimeFormatContext` or throws in case of an
 * error
 *
 * @category Constructors
 */
export const fromLocaleOrThrow = (locale: string): Type =>
  pipe(
    locale,
    fromLocale,
    Option.getOrThrowWith(
      () => new Error(`A CVDateTimeFormat.Context could not be built for locale '${locale}'`),
    ),
  );

/**
 * Returns the `name` property of `self`
 *
 * @category Destructors
 */
export const name: MTypes.OneArgFunction<Type, string> = Struct.get('name');

/**
 * Returns the `tokenMap` property of `self`
 *
 * @category Destructors
 */
export const tokenMap: MTypes.OneArgFunction<Type, TokenMap.Type> = Struct.get('tokenMap');
