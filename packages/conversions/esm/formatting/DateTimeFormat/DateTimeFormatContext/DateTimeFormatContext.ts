/**
 * This module implements a `CVDateTimeFormatContext` which is used as a mapping betwwen a
 * `CVDateTimeFormatPlaceHolder` and a `CVTemplatePlaceholder`. For each `CVDateTimeFormatToken`, it
 * contains a `CVDateTimeFormatPlaceHolder` which can format/parse that token. As some tokens are
 * language-dependent, e.g. weekday names, this module provides a constructor from locales, or from
 * translated strings
 */

import * as MArray from '@parischap/effect-lib/MArray';
import * as MData from '@parischap/effect-lib/MData';
import * as MInputError from '@parischap/effect-lib/MInputError';
import * as MPredicate from '@parischap/effect-lib/MPredicate';
import * as MString from '@parischap/effect-lib/MString';
import * as MTypes from '@parischap/effect-lib/MTypes';
import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import * as Either from 'effect/Either';
import * as HashMap from 'effect/HashMap';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import * as Struct from 'effect/Struct';
import * as Tuple from 'effect/Tuple';
import { DAY_MS } from '../../../DateTime/dateTimeConstants.js';
import * as CVDateTimeFormatTokenMap from '../../../internal/Formatting/DateTimeFormat/DateTimeFormatContext/DateTimeFormatTokenMap.js';
import * as CVDateTimePartName from '../../../internal/Formatting/DateTimeFormat/DateTimePartName.js';
import * as CVNumberBase10Format from '../../NumberBase10Format/NumberBase10Format.js';
import * as CVTemplatePlaceholder from '../../Template/TemplatePart/TemplatePlaceholder/TemplatePlaceholder.js';
import * as CVDateTimeFormatToken from '../DateTimeFormatToken.js';
import * as CVDayPeriodNames from './DayPeriodNames.js';
import * as CVMonthNames from './MonthNames.js';
import * as CVWeekDayNames from './WeekDayNames.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/Formatting/DateTimeFormat/DateTimeFormatContext/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

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
  const tokenMapEntries: ReadonlyArray<
    readonly [
      CVDateTimeFormatToken.Type,
      CVTemplatePlaceholder.Type<CVDateTimePartName.Type, number>,
    ]
  > = [
    [
      'y',
      CVTemplatePlaceholder.number({
        name: 'year',
        numberBase10Format: CVNumberBase10Format.unsignedInteger,
      }),
    ],
    [
      'yy',
      pipe(
        CVTemplatePlaceholder.number({
          name: 'year',
          numberBase10Format: CVNumberBase10Format.twoDigitUnsignedInteger,
        }),
        CVTemplatePlaceholder.modify({
          descriptorMapper: MString.append(' between 2000 and 2099 included'),
          postParser: function (this: CVTemplatePlaceholder.Type<'year', number>, value) {
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
          preFormatter: function (this: CVTemplatePlaceholder.Type<'year', number>, value) {
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
              Either.map(Number.subtract(2000)),
            );
          },
        }),
      ),
    ],
    [
      'yyyy',
      CVTemplatePlaceholder.number({
        name: 'year',
        numberBase10Format: CVNumberBase10Format.fourDigitUnsignedInteger,
      }),
    ],
    [
      'R',
      CVTemplatePlaceholder.number({
        name: 'isoYear',
        numberBase10Format: CVNumberBase10Format.unsignedInteger,
      }),
    ],
    [
      'RR',
      pipe(
        CVTemplatePlaceholder.number({
          name: 'isoYear',
          numberBase10Format: CVNumberBase10Format.twoDigitUnsignedInteger,
        }),
        CVTemplatePlaceholder.modify({
          descriptorMapper: MString.append(' between 2000 and 2099 included'),
          postParser: function (this: CVTemplatePlaceholder.Type<'isoYear', number>, value) {
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
          preFormatter: function (this: CVTemplatePlaceholder.Type<'isoYear', number>, value) {
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
              Either.map(Number.subtract(2000)),
            );
          },
        }),
      ),
    ],
    [
      'RRRR',
      CVTemplatePlaceholder.number({
        name: 'isoYear',
        numberBase10Format: CVNumberBase10Format.fourDigitUnsignedInteger,
      }),
    ],
    [
      'M',
      CVTemplatePlaceholder.number({
        name: 'month',
        numberBase10Format: CVNumberBase10Format.unsignedInteger,
      }),
    ],
    [
      'MM',
      CVTemplatePlaceholder.number({
        name: 'month',
        numberBase10Format: CVNumberBase10Format.twoDigitUnsignedInteger,
      }),
    ],
    [
      'MMM',
      CVTemplatePlaceholder.numberMappedLiterals({
        name: 'month',
        keyValuePairs: pipe(
          shortMonthNames,
          Array.map((name, i) => Tuple.make(name, i + 1)),
        ),
      }),
    ],
    [
      'MMMM',
      CVTemplatePlaceholder.numberMappedLiterals({
        name: 'month',
        keyValuePairs: pipe(
          longMonthNames,
          Array.map((name, i) => Tuple.make(name, i + 1)),
        ),
      }),
    ],
    [
      'I',
      CVTemplatePlaceholder.number({
        name: 'isoWeek',
        numberBase10Format: CVNumberBase10Format.unsignedInteger,
      }),
    ],
    [
      'II',
      CVTemplatePlaceholder.number({
        name: 'isoWeek',
        numberBase10Format: CVNumberBase10Format.twoDigitUnsignedInteger,
      }),
    ],
    [
      'd',
      CVTemplatePlaceholder.number({
        name: 'monthDay',
        numberBase10Format: CVNumberBase10Format.unsignedInteger,
      }),
    ],
    [
      'dd',
      CVTemplatePlaceholder.number({
        name: 'monthDay',
        numberBase10Format: CVNumberBase10Format.twoDigitUnsignedInteger,
      }),
    ],
    [
      'D',
      CVTemplatePlaceholder.number({
        name: 'ordinalDay',
        numberBase10Format: CVNumberBase10Format.unsignedInteger,
      }),
    ],
    [
      'DDD',
      CVTemplatePlaceholder.number({
        name: 'ordinalDay',
        numberBase10Format: CVNumberBase10Format.threeDigitUnsignedInteger,
      }),
    ],
    [
      'i',
      CVTemplatePlaceholder.number({
        name: 'weekday',
        numberBase10Format: CVNumberBase10Format.unsignedInteger,
      }),
    ],
    [
      'iii',
      CVTemplatePlaceholder.numberMappedLiterals({
        name: 'weekday',
        keyValuePairs: pipe(
          shortWeekdayNames,
          Array.map((name, i) => Tuple.make(name, i + 1)),
        ),
      }),
    ],
    [
      'iiii',
      CVTemplatePlaceholder.numberMappedLiterals({
        name: 'weekday',
        keyValuePairs: pipe(
          longWeekdayNames,
          Array.map((name, i) => Tuple.make(name, i + 1)),
        ),
      }),
    ],
    [
      'a',
      CVTemplatePlaceholder.numberMappedLiterals({
        name: 'meridiem',
        keyValuePairs: pipe(
          dayPeriodNames,
          Array.map((name, i) => Tuple.make(name, i * 12)),
        ),
      }),
    ],
    [
      'H',
      CVTemplatePlaceholder.number({
        name: 'hour23',
        numberBase10Format: CVNumberBase10Format.unsignedInteger,
      }),
    ],
    [
      'HH',
      CVTemplatePlaceholder.number({
        name: 'hour23',
        numberBase10Format: CVNumberBase10Format.twoDigitUnsignedInteger,
      }),
    ],
    [
      'K',
      CVTemplatePlaceholder.number({
        name: 'hour11',
        numberBase10Format: CVNumberBase10Format.unsignedInteger,
      }),
    ],
    [
      'KK',
      CVTemplatePlaceholder.number({
        name: 'hour11',
        numberBase10Format: CVNumberBase10Format.twoDigitUnsignedInteger,
      }),
    ],
    [
      'm',
      CVTemplatePlaceholder.number({
        name: 'minute',
        numberBase10Format: CVNumberBase10Format.unsignedInteger,
      }),
    ],
    [
      'mm',
      CVTemplatePlaceholder.number({
        name: 'minute',
        numberBase10Format: CVNumberBase10Format.twoDigitUnsignedInteger,
      }),
    ],
    [
      's',
      CVTemplatePlaceholder.number({
        name: 'second',
        numberBase10Format: CVNumberBase10Format.unsignedInteger,
      }),
    ],
    [
      'ss',
      CVTemplatePlaceholder.number({
        name: 'second',
        numberBase10Format: CVNumberBase10Format.twoDigitUnsignedInteger,
      }),
    ],
    [
      'S',
      CVTemplatePlaceholder.number({
        name: 'millisecond',
        numberBase10Format: CVNumberBase10Format.unsignedInteger,
      }),
    ],
    [
      'SSS',
      CVTemplatePlaceholder.number({
        name: 'millisecond',
        numberBase10Format: CVNumberBase10Format.threeDigitUnsignedInteger,
      }),
    ],
    [
      'zH',
      CVTemplatePlaceholder.number({
        name: 'zoneHour',
        numberBase10Format: CVNumberBase10Format.integer,
      }),
    ],
    [
      'zHzH',
      CVTemplatePlaceholder.number({
        name: 'zoneHour',
        numberBase10Format: CVNumberBase10Format.twoDigitInteger,
      }),
    ],
    [
      'zm',
      CVTemplatePlaceholder.number({
        name: 'zoneMinute',
        numberBase10Format: CVNumberBase10Format.unsignedInteger,
      }),
    ],
    [
      'zmzm',
      CVTemplatePlaceholder.number({
        name: 'zoneMinute',
        numberBase10Format: CVNumberBase10Format.twoDigitUnsignedInteger,
      }),
    ],
    [
      'zs',
      CVTemplatePlaceholder.number({
        name: 'zoneSecond',
        numberBase10Format: CVNumberBase10Format.unsignedInteger,
      }),
    ],
    [
      'zszs',
      CVTemplatePlaceholder.number({
        name: 'zoneSecond',
        numberBase10Format: CVNumberBase10Format.twoDigitUnsignedInteger,
      }),
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
