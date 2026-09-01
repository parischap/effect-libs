/**
 * This module implements a `MDateTimeFormat`, i.e. the description of the string representation of
 * a `MDateTime`. It supports many of the available Unicode tokens (see
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).
 *
 * A `MDateTimeFormat` is a plain, context-independent array of `string`'s (separators, printed as
 * is) and `Token`'s (placeholders, resolved against a `MDateTimeContext`). It carries no locale
 * information: to parse or format a date string, combine a `MDateTimeFormat` with a
 * `MDateTimeContext` via `MDateTime.format`/`MDateTime.parse`.
 */

/**
 * Type of a `MDateTimeToken` (see
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table). Values are dense
 * from `0` so a `MDateTimeContext` can resolve a token to its `MTemplatePlaceholder` by plain array
 * indexing.
 *
 * @category Models
 */
export enum Token {
  /* Gregorian year (ex: 2005) */
  y = 0,
  /* Gregorian year on 2 digits left-padded with 0's corresponding to years 2000-2099 (ex: 05 for 2005) */
  yy = 1,
  /* Gregorian year on 4 digits left-padded with 0's (ex: 2005, 0965) */
  yyyy = 2,
  /* Iso year (ex: 2005) */
  R = 3,
  /* Iso year on 2 digits left-padded with 0's corresponding to years 2000-2099 (ex: 05 for 2005) */
  RR = 4,
  /* Iso year on 4 digits left-padded with 0's (ex: 2005, 0965)*/
  RRRR = 5,
  /* Month (ex: 6) */
  M = 6,
  /* Month on 2 digits left-padded with 0's (ex: 06) */
  MM = 7,
  /* Short month name (ex: Jun) */
  MMM = 8,
  /* Long month name (ex: June) */
  MMMM = 9,
  /* IsoWeek (ex: 6) */
  I = 10,
  /* IsoWeek (ex: 06) */
  II = 11,
  /* Day of month (ex: 5) */
  d = 12,
  /* Day of month on 2 digits left-padded with 0's (ex: 05) */
  dd = 13,
  /* Day of year (ex: 97) */
  D = 14,
  /* Day of year on 3 digits left-padded with 0's (ex: 097) */
  DDD = 15,
  /* Weekday (ex: 1 for monday, 7 for sunday) */
  i = 16,
  /* Short weekday name (ex: Mon) */
  iii = 17,
  /* Long weekday name (ex: Monday) */
  iiii = 18,
  /* Meridiem (ex: 'AM' for 0, 'PM' for 12) */
  a = 19,
  /* Hour in the range 0..23 (ex:5, 14) */
  H = 20,
  /* Hour on 2 digits in the range 0..23 left-padded with 0's (ex:05, 14) */
  HH = 21,
  /* Hour in the range 0..11 (ex:5, 2) */
  K = 22,
  /* Hour on 2 digits in the range 0..11 left-padded with 0's (ex:05, 02) */
  KK = 23,
  /* Minute (ex: 5) */
  m = 24,
  /* Minute on 2 digits left-padded with 0's (ex: 05) */
  mm = 25,
  /* Second (ex: 5) */
  s = 26,
  /* Second on 2 digits left-padded with 0's (ex: 05) */
  ss = 27,
  /* Millisecond (ex: 5) */
  S = 28,
  /* Millisecond on 3 digits left-padded with 0's (ex: 005) */
  SSS = 29,
  /* Hour part of the timezone offset (ex: 5, -6) */
  zH = 30,
  /* Hour part of the timezone offset on 2 digits left-padded with 0's possibly prefixed by a minus sign (ex: 10, -05) */
  zHzH = 31,
  /* Minute part of the timezone offset (ex: 5) */
  zm = 32,
  /* Minute part of the timezone offset on 2 digits left-padded with 0's (ex: 05) */
  zmzm = 33,
  /* Second part of the timezone offset (ex: 5) */
  zs = 34,
  /* Second part of the timezone offset on 2 digits left-padded with 0's (ex: 05) */
  zszs = 35,
}

/**
 * Type that represents a `MDateTimeFormat`. Strings are separators (printed as is); `Token`'s are
 * placeholders resolved against a `MDateTimeContext`
 *
 * @category Models
 */
export interface Type extends ReadonlyArray<string | Token> {}

/**
 * Constructs a `MDateTimeFormat` from the given `string` separators and `Token`'s
 *
 * @category Constructors
 */
export const make = (...parts: Type): Type => parts;

/**
 * `MDateTimeFormat` instance for the basic ISO 8601 date format (YYYYMMDD, e.g. `20050605`).
 *
 * @category Instances
 */
export const basicIso8601: Type = make(Token.yyyy, Token.MM, Token.dd);

/**
 * `MDateTimeFormat` instance for the ISO 8601 date format (YYYY-MM-DD, e.g. `2005-06-05`).
 *
 * @category Instances
 */
export const iso8601: Type = make(Token.yyyy, '-', Token.MM, '-', Token.dd);

/**
 * `MDateTimeFormat` instance for the US date format (MM/DD/YYYY, e.g. `06/05/2005`).
 *
 * @category Instances
 */
export const usDate: Type = make(Token.MM, '/', Token.dd, '/', Token.yyyy);

/**
 * `MDateTimeFormat` instance for the European date format with slashes (DD/MM/YYYY, e.g.
 * `05/06/2005`).
 *
 * @category Instances
 */
export const euDate: Type = make(Token.dd, '/', Token.MM, '/', Token.yyyy);

/**
 * `MDateTimeFormat` instance for the European date format with dots (DD.MM.YYYY, e.g.
 * `05.06.2005`).
 *
 * @category Instances
 */
export const euDotDate: Type = make(Token.dd, '.', Token.MM, '.', Token.yyyy);

/**
 * `MDateTimeFormat` instance for the ISO 8601 date-time format without milliseconds (YYYY-MM-
 * DDTHH:mm:ss, e.g. `2005-06-05T14:05:05`).
 *
 * @category Instances
 */
export const isoDateTime: Type = make(
  Token.yyyy,
  '-',
  Token.MM,
  '-',
  Token.dd,
  'T',
  Token.HH,
  ':',
  Token.mm,
  ':',
  Token.ss,
);

/**
 * `MDateTimeFormat` instance for the ISO 8601 date-time format with milliseconds (YYYY-MM-
 * DDTHH:mm:ss.SSS, e.g. `2005-06-05T14:05:05.007`).
 *
 * @category Instances
 */
export const isoDateTimeMs: Type = make(
  Token.yyyy,
  '-',
  Token.MM,
  '-',
  Token.dd,
  'T',
  Token.HH,
  ':',
  Token.mm,
  ':',
  Token.ss,
  '.',
  Token.SSS,
);

/**
 * `MDateTimeFormat` instance for the 24-hour time format without seconds (HH:mm, e.g. `14:05`).
 *
 * @category Instances
 */
export const time24h: Type = make(Token.HH, ':', Token.mm);

/**
 * `MDateTimeFormat` instance for the 24-hour time format with seconds (HH:mm:ss, e.g. `14:05:05`).
 *
 * @category Instances
 */
export const time24hWithSeconds: Type = make(Token.HH, ':', Token.mm, ':', Token.ss);

/**
 * `MDateTimeFormat` instance for the 12-hour time format without seconds (KK:mm a, e.g. `02:05
 * PM`).
 *
 * @category Instances
 */
export const time12h: Type = make(Token.KK, ':', Token.mm, ' ', Token.a);

/**
 * `MDateTimeFormat` instance for the 12-hour time format with seconds (KK:mm:ss a, e.g. `02:05:05
 * PM`).
 *
 * @category Instances
 */
export const time12hWithSeconds: Type = make(
  Token.KK,
  ':',
  Token.mm,
  ':',
  Token.ss,
  ' ',
  Token.a,
);

/**
 * `MDateTimeFormat` instance for a long date format (MMMM d, yyyy, e.g. `June 5, 2005`). The month
 * name is locale-dependent and requires an appropriate `MDateTimeContext`.
 *
 * @category Instances
 */
export const longDate: Type = make(Token.MMMM, ' ', Token.d, ',', ' ', Token.yyyy);

/**
 * `MDateTimeFormat` instance for a short date format (MMM d, yyyy, e.g. `Jun 5, 2005`). The
 * abbreviated month name is locale-dependent and requires an appropriate `MDateTimeContext`.
 *
 * @category Instances
 */
export const shortDate: Type = make(Token.MMM, ' ', Token.d, ',', ' ', Token.yyyy);
