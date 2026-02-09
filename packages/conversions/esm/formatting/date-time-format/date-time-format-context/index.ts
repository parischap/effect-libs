/**
 * This module implements a `CVDateTimeFormatContext` which is used when parsing or formatting dates
 * (see DateTimeFormat.ts) to provide the translations used by language specific tokens (e.g.
 * `MMMM`)
 */

import { MArray, MData, MInputError, MPredicate, MString, MTypes } from '@parischap/effect-lib';
import { Array, Either, flow, HashMap, Number, Option, pipe, Struct, Tuple } from 'effect';
import { DAY_MS } from '../../../date-time/dateTimeConstants.js';
import * as CVDateTimeFormatTokenMap from '../../../internal/formatting/date-time-format/date-time-format-context/DateTimeFormatTokenMap.js';
import * as CVReal from '../../../primitive/Real.js';
import * as CVNumberBase10Format from '../../number-base10-format/index.js';
import * as CVDateTimeFormatPlaceholder from '../DateTimeFormatPart/DateTimeFormatPlaceholder.js';
import * as CVDayPeriodNames from './DayPeriodNames.js';
import * as CVMonthNames from './MonthNames.js';
import * as CVWeekDayNames from './WeekDayNames.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag =
  '@parischap/conversions/formatting/date-time-format/DateTimeFormatContext/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

const WEEKDAY_DATES = pipe(
  7,
  Array.makeBy(flow(Number.multiply(DAY_MS), Number.sum(4 * DAY_MS))),
  Array.map((timestamp) => new Date(timestamp)),
);

const MONTH_DATES = pipe(
  12,
  Array.makeBy(Number.multiply(31 * DAY_MS)),
  Array.map((timestamp) => new Date(timestamp)),
);

/**
 * Type that represents a CVDateTimeFormatContext
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** Name : usually the locale this `CVDateTimeFormatContext` was built from. Or a country name */
  readonly name: string;

  /** TokenMap of this `CVDateTimeFormatContext` */
  readonly tokenMap: CVDateTimeFormatTokenMap.Type;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.name;
    };
  }

  /** Class constructor */
  private constructor({ name, tokenMap }: MTypes.Data<Type>) {
    super();
    this.name = name;
    this.tokenMap = tokenMap;
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
  readonly shortWeekdayNames: CVWeekDayNames.Type;

  /** Array of the long weekday names */
  readonly longWeekdayNames: CVWeekDayNames.Type;

  /** Array of the short month names */
  readonly shortMonthNames: CVMonthNames.Type;

  /** Array of the long month names */
  readonly longMonthNames: CVMonthNames.Type;

  /** Array of the day period names ('AM', 'PM') */
  readonly dayPeriodNames: CVDayPeriodNames.Type;
}): Type => {
  const { integer } = CVNumberBase10Format;
  const signedInteger = pipe(integer, CVNumberBase10Format.withSignDisplay);
  const params = { fillChar: '0', numberBase10Format: integer };

  const templatepartEntries: ReadonlyArray<
    readonly [Token, CVDateTimeFormatPlaceholder.Type<string, CVReal.Type>]
  > = [
    ['y', CVDateTimeFormatPlaceholder.real({ ...params, name: 'year' })],
    [
      'yy',
      pipe(
        CVDateTimeFormatPlaceholder.fixedLengthToReal({ ...params, name: 'year', length: 2 }),
        CVDateTimeFormatPlaceholder.modify({
          descriptorMapper: MString.append(' between 2000 and 2099 included'),
          postParser: function (
            this: CVDateTimeFormatPlaceholder.Type<'year', CVReal.Type>,
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
            this: CVDateTimeFormatPlaceholder.Type<'year', CVReal.Type>,
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
    ['yyyy', CVDateTimeFormatPlaceholder.fixedLengthToReal({ ...params, name: 'year', length: 4 })],
    ['R', CVDateTimeFormatPlaceholder.real({ ...params, name: 'isoYear' })],
    [
      'RR',
      pipe(
        CVDateTimeFormatPlaceholder.fixedLengthToReal({ ...params, name: 'isoYear', length: 2 }),
        CVDateTimeFormatPlaceholder.modify({
          descriptorMapper: MString.append(' between 2000 and 2099 included'),
          postParser: function (
            this: CVDateTimeFormatPlaceholder.Type<'isoYear', CVReal.Type>,
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
            this: CVDateTimeFormatPlaceholder.Type<'isoYear', CVReal.Type>,
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
      CVDateTimeFormatPlaceholder.fixedLengthToReal({ ...params, name: 'isoYear', length: 4 }),
    ],
    ['M', CVDateTimeFormatPlaceholder.real({ ...params, name: 'month' })],
    ['MM', CVDateTimeFormatPlaceholder.fixedLengthToReal({ ...params, name: 'month', length: 2 })],
    [
      'MMM',
      CVDateTimeFormatPlaceholder.realMappedLiterals({
        name: 'month',
        keyValuePairs: pipe(
          shortMonthNames,
          Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i + 1))),
        ),
      }),
    ],
    [
      'MMMM',
      CVDateTimeFormatPlaceholder.realMappedLiterals({
        name: 'month',
        keyValuePairs: pipe(
          longMonthNames,
          Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i + 1))),
        ),
      }),
    ],
    [
      'I',
      CVDateTimeFormatPlaceholder.real({
        name: 'isoWeek',
        numberBase10Format: CVNumberBase10Format.integer,
      }),
    ],
    [
      'II',
      CVDateTimeFormatPlaceholder.fixedLengthToReal({ ...params, name: 'isoWeek', length: 2 }),
    ],
    ['d', CVDateTimeFormatPlaceholder.real({ ...params, name: 'monthDay' })],
    [
      'dd',
      CVDateTimeFormatPlaceholder.fixedLengthToReal({ ...params, name: 'monthDay', length: 2 }),
    ],
    ['D', CVDateTimeFormatPlaceholder.real({ ...params, name: 'ordinalDay' })],
    [
      'DDD',
      CVDateTimeFormatPlaceholder.fixedLengthToReal({ ...params, name: 'ordinalDay', length: 3 }),
    ],
    ['i', CVDateTimeFormatPlaceholder.real({ ...params, name: 'weekday' })],
    [
      'iii',
      CVDateTimeFormatPlaceholder.realMappedLiterals({
        name: 'weekday',
        keyValuePairs: pipe(
          shortWeekdayNames,
          Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i + 1))),
        ),
      }),
    ],
    [
      'iiii',
      CVDateTimeFormatPlaceholder.realMappedLiterals({
        name: 'weekday',
        keyValuePairs: pipe(
          longWeekdayNames,
          Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i + 1))),
        ),
      }),
    ],
    [
      'a',
      CVDateTimeFormatPlaceholder.realMappedLiterals({
        name: 'meridiem',
        keyValuePairs: pipe(
          dayPeriodNames,
          Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i * 12))),
        ),
      }),
    ],
    ['H', CVDateTimeFormatPlaceholder.real({ ...params, name: 'hour23' })],
    ['HH', CVDateTimeFormatPlaceholder.fixedLengthToReal({ ...params, name: 'hour23', length: 2 })],
    ['K', CVDateTimeFormatPlaceholder.real({ ...params, name: 'hour11' })],
    ['KK', CVDateTimeFormatPlaceholder.fixedLengthToReal({ ...params, name: 'hour11', length: 2 })],
    ['m', CVDateTimeFormatPlaceholder.real({ ...params, name: 'minute' })],
    ['mm', CVDateTimeFormatPlaceholder.fixedLengthToReal({ ...params, name: 'minute', length: 2 })],
    ['s', CVDateTimeFormatPlaceholder.real({ ...params, name: 'second' })],
    ['ss', CVDateTimeFormatPlaceholder.fixedLengthToReal({ ...params, name: 'second', length: 2 })],
    ['S', CVDateTimeFormatPlaceholder.real({ ...params, name: 'millisecond' })],
    [
      'SSS',
      CVDateTimeFormatPlaceholder.fixedLengthToReal({ ...params, name: 'millisecond', length: 3 }),
    ],
    [
      'zH',
      CVDateTimeFormatPlaceholder.real({
        ...params,
        name: 'zoneHour',
        numberBase10Format: signedInteger,
      }),
    ],
    [
      'zHzH',
      CVDateTimeFormatPlaceholder.fixedLengthToReal({
        ...params,
        name: 'zoneHour',
        length: 3,
        numberBase10Format: signedInteger,
      }),
    ],
    ['zm', CVDateTimeFormatPlaceholder.real({ ...params, name: 'zoneMinute' })],
    [
      'zmzm',
      CVDateTimeFormatPlaceholder.fixedLengthToReal({ ...params, name: 'zoneMinute', length: 2 }),
    ],
    ['zs', CVDateTimeFormatPlaceholder.real({ ...params, name: 'zoneSecond' })],
    [
      'zszs',
      CVDateTimeFormatPlaceholder.fixedLengthToReal({ ...params, name: 'zoneSecond', length: 2 }),
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
