/** This module defines constants used by the CVGregorianDate, CVIsoDate and CVDateTime modules */

/**
 * Duration of a second in milliseconds
 *
 * @category Constants
 */
export const SECOND_MS = 1000;

/**
 * Duration of a minute in milliseconds
 *
 * @category Constants
 */
export const MINUTE_MS = 60 * SECOND_MS;

/**
 * Duration of an hour in milliseconds
 *
 * @category Constants
 */
export const HOUR_MS = 60 * MINUTE_MS;

/**
 * Duration of a day in milliseconds
 *
 * @category Constants
 */
export const DAY_MS = 24 * HOUR_MS;

/**
 * Duration of a week in milliseconds
 *
 * @category Constants
 */
export const WEEK_MS = 7 * DAY_MS;

/**
 * Duration of a normal year in milliseconds
 *
 * @category Constants
 */
export const COMMON_YEAR_MS = 365 * DAY_MS;

/**
 * Duration of a leap year in milliseconds
 *
 * @category Constants
 */
export const LEAP_YEAR_MS = COMMON_YEAR_MS + DAY_MS;

/**
 * Duration of a short iso year in milliseconds
 *
 * @category Constants
 */
export const SHORT_YEAR_MS = 52 * WEEK_MS;

/**
 * Duration of a long iso year in milliseconds
 *
 * @category Constants
 */
export const LONG_YEAR_MS = SHORT_YEAR_MS + WEEK_MS;

/**
 * Duration in milliseconds of a four-year period containing a leap year
 *
 * @category Constants
 */
export const FOUR_YEARS_MS = 3 * COMMON_YEAR_MS + LEAP_YEAR_MS;

/**
 * Duration in milliseconds of a 100-year period that has a leap year every 4th year except the
 * 100th year
 *
 * @category Constants
 */
export const HUNDRED_YEARS_MS = 25 * FOUR_YEARS_MS - DAY_MS;

/**
 * Duration in milliseconds of a 400-year period that has a leap year every 4th year except the
 * 100th year. But the 400th year is a leap year
 *
 * @category Constants
 */
export const FOUR_HUNDRED_YEARS_MS = 4 * HUNDRED_YEARS_MS + DAY_MS;

/**
 * Namespace for the data relative to a Month
 *
 * @category Models
 */

const _MAX_FULL_YEAR_OFFSET = 273_790;

/**
 * Maximal usable year (ECMA-262)
 *
 * @category Constants
 */
export const MAX_FULL_YEAR = 1970 + _MAX_FULL_YEAR_OFFSET;

/**
 * Minimal usable year (ECMA-262)
 *
 * @category Constants
 */
export const MIN_FULL_YEAR = 1970 - _MAX_FULL_YEAR_OFFSET - 1;

/**
 * Maximal usable timestamp (ECMA-262)
 *
 * @category Constants
 */
export const MAX_TIMESTAMP = 8_640_000_000_000_000;

/**
 * Minimal usable timestamp (ECMA-262)
 *
 * @category Constants
 */
export const MIN_TIMESTAMP = -MAX_TIMESTAMP;
