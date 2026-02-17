/**
 * This module implements a `CVDateTimeFormatContext` which is used as a mapping betwwen a
 * `CVDateTimeFormatPlaceHolder` and a `CVTemplatePlaceholder`. For each `CVDateTimeFormatToken`, it
 * contains a `CVDateTimeFormatPlaceHolder` which can format/parse that token. As some tokens are
 * language-dependent, e.g. weekday names, this module provides a constructor from locales, or from
 * translated strings
 */

import * as MArray from '@parischap/effect-lib/MArray'
import * as MData from '@parischap/effect-lib/MData'
import * as MInputError from '@parischap/effect-lib/MInputError'
import * as MPredicate from '@parischap/effect-lib/MPredicate'
import * as MString from '@parischap/effect-lib/MString'
import * as MTypes from '@parischap/effect-lib/MTypes'
import {flow, pipe} from 'effect'
import * as Array from 'effect/Array'
import * as Either from 'effect/Either'
import * as HashMap from 'effect/HashMap'
import * as Number from 'effect/Number'
import * as Option from 'effect/Option'
import * as Struct from 'effect/Struct'
import * as Tuple from 'effect/Tuple'
import { DAY_MS } from '../../../date-time/dateTimeConstants.js';
import * as CVDateTimeFormatTokenMap from '../../../internal/formatting/date-time-format/date-time-format-context/DateTimeFormatTokenMap.js';
import * as CVReal from '../../../primitive/Real.js';
import * as CVNumberBase10Format from '../../number-base10-format/index.js';
import * as CVTemplatePlaceholder from '../../template/TemplatePart/template-placeholder/index.js';
import * as CVDateTimeFormatToken from '../DateTimeFormatToken.js';
import * as CVDayPeriodNames from './DayPeriodNames.js';
import * as CVMonthNames from './MonthNames.js';
import * as CVWeekDayNames from './WeekDayNames.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag =
  '@parischap/conversions/formatting/date-time-format/date-time-format-context/';
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

const { integer: _integer } = CVNumberBase10Format;
const _signedInteger = pipe(_integer, CVNumberBase10Format.withSignDisplay);
const _params = { fillChar: '0', numberBase10Format: _integer };

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
  const tokenMapEntries: ReadonlyArray<
    readonly [CVDateTimeFormatToken.Type, CVTemplatePlaceholder.Type<string, CVReal.Type>]
  > = [
    ['y', CVTemplatePlaceholder.real({ ..._params, name: 'year' })],
    [
      'yy',
      pipe(
        CVTemplatePlaceholder.fixedLengthToReal({ ..._params, name: 'year', length: 2 }),
        CVTemplatePlaceholder.modify({
          descriptorMapper: MString.append(' between 2000 and 2099 included'),
          postParser: function (this: CVTemplatePlaceholder.Type<'year', CVReal.Type>, value) {
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
          preFormatter: function (this: CVTemplatePlaceholder.Type<'year', CVReal.Type>, value) {
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
    ['yyyy', CVTemplatePlaceholder.fixedLengthToReal({ ..._params, name: 'year', length: 4 })],
    ['R', CVTemplatePlaceholder.real({ ..._params, name: 'isoYear' })],
    [
      'RR',
      pipe(
        CVTemplatePlaceholder.fixedLengthToReal({ ..._params, name: 'isoYear', length: 2 }),
        CVTemplatePlaceholder.modify({
          descriptorMapper: MString.append(' between 2000 and 2099 included'),
          postParser: function (this: CVTemplatePlaceholder.Type<'isoYear', CVReal.Type>, value) {
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
          preFormatter: function (this: CVTemplatePlaceholder.Type<'isoYear', CVReal.Type>, value) {
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
    ['RRRR', CVTemplatePlaceholder.fixedLengthToReal({ ..._params, name: 'isoYear', length: 4 })],
    ['M', CVTemplatePlaceholder.real({ ..._params, name: 'month' })],
    ['MM', CVTemplatePlaceholder.fixedLengthToReal({ ..._params, name: 'month', length: 2 })],
    [
      'MMM',
      CVTemplatePlaceholder.realMappedLiterals({
        name: 'month',
        keyValuePairs: pipe(
          shortMonthNames,
          Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i + 1))),
        ),
      }),
    ],
    [
      'MMMM',
      CVTemplatePlaceholder.realMappedLiterals({
        name: 'month',
        keyValuePairs: pipe(
          longMonthNames,
          Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i + 1))),
        ),
      }),
    ],
    [
      'I',
      CVTemplatePlaceholder.real({
        name: 'isoWeek',
        numberBase10Format: CVNumberBase10Format.integer,
      }),
    ],
    ['II', CVTemplatePlaceholder.fixedLengthToReal({ ..._params, name: 'isoWeek', length: 2 })],
    ['d', CVTemplatePlaceholder.real({ ..._params, name: 'monthDay' })],
    ['dd', CVTemplatePlaceholder.fixedLengthToReal({ ..._params, name: 'monthDay', length: 2 })],
    ['D', CVTemplatePlaceholder.real({ ..._params, name: 'ordinalDay' })],
    ['DDD', CVTemplatePlaceholder.fixedLengthToReal({ ..._params, name: 'ordinalDay', length: 3 })],
    ['i', CVTemplatePlaceholder.real({ ..._params, name: 'weekday' })],
    [
      'iii',
      CVTemplatePlaceholder.realMappedLiterals({
        name: 'weekday',
        keyValuePairs: pipe(
          shortWeekdayNames,
          Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i + 1))),
        ),
      }),
    ],
    [
      'iiii',
      CVTemplatePlaceholder.realMappedLiterals({
        name: 'weekday',
        keyValuePairs: pipe(
          longWeekdayNames,
          Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i + 1))),
        ),
      }),
    ],
    [
      'a',
      CVTemplatePlaceholder.realMappedLiterals({
        name: 'meridiem',
        keyValuePairs: pipe(
          dayPeriodNames,
          Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i * 12))),
        ),
      }),
    ],
    ['H', CVTemplatePlaceholder.real({ ..._params, name: 'hour23' })],
    ['HH', CVTemplatePlaceholder.fixedLengthToReal({ ..._params, name: 'hour23', length: 2 })],
    ['K', CVTemplatePlaceholder.real({ ..._params, name: 'hour11' })],
    ['KK', CVTemplatePlaceholder.fixedLengthToReal({ ..._params, name: 'hour11', length: 2 })],
    ['m', CVTemplatePlaceholder.real({ ..._params, name: 'minute' })],
    ['mm', CVTemplatePlaceholder.fixedLengthToReal({ ..._params, name: 'minute', length: 2 })],
    ['s', CVTemplatePlaceholder.real({ ..._params, name: 'second' })],
    ['ss', CVTemplatePlaceholder.fixedLengthToReal({ ..._params, name: 'second', length: 2 })],
    ['S', CVTemplatePlaceholder.real({ ..._params, name: 'millisecond' })],
    [
      'SSS',
      CVTemplatePlaceholder.fixedLengthToReal({ ..._params, name: 'millisecond', length: 3 }),
    ],
    [
      'zH',
      CVTemplatePlaceholder.real({
        ..._params,
        name: 'zoneHour',
        numberBase10Format: _signedInteger,
      }),
    ],
    [
      'zHzH',
      CVTemplatePlaceholder.fixedLengthToReal({
        ..._params,
        name: 'zoneHour',
        length: 3,
        numberBase10Format: _signedInteger,
      }),
    ],
    ['zm', CVTemplatePlaceholder.real({ ..._params, name: 'zoneMinute' })],
    [
      'zmzm',
      CVTemplatePlaceholder.fixedLengthToReal({ ..._params, name: 'zoneMinute', length: 2 }),
    ],
    ['zs', CVTemplatePlaceholder.real({ ..._params, name: 'zoneSecond' })],
    [
      'zszs',
      CVTemplatePlaceholder.fixedLengthToReal({ ..._params, name: 'zoneSecond', length: 2 }),
    ],
  ];

  return Type.make({
    name,
    tokenMap: HashMap.make(...tokenMapEntries),
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
    )) as unknown as CVWeekDayNames.Type;

    const longMonthNames = (yield* pipe(
      MONTH_DATES,
      MArray.mapUnlessNone(flow(toLongParts, _extractMonth)),
    )) as unknown as CVMonthNames.Type;

    const shortWeekdayNames = (yield* pipe(
      WEEKDAY_DATES,
      MArray.mapUnlessNone(flow(toShortParts, _extractWeekday)),
    )) as unknown as CVWeekDayNames.Type;

    const shortMonthNames = (yield* pipe(
      MONTH_DATES,
      MArray.mapUnlessNone(flow(toShortParts, _extractMonth)),
    )) as unknown as CVMonthNames.Type;

    const dayPeriodNames: CVDayPeriodNames.Type = ['am', 'pm'];

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
export const tokenMap: MTypes.OneArgFunction<Type, CVDateTimeFormatTokenMap.Type> =
  Struct.get('tokenMap');
