/**
 * This module implements a type that represents all the possible tokens that can be used to format
 * a `CVDateTime`
 */

/**
 * Type of a CVDateTimeToken
 *
 * @category Models
 */
export type Type =
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
