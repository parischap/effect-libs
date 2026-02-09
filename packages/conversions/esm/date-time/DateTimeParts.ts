/** Module that implements a Type that represents the different parts of a date time */

/**
 * Type of a CVDateTimeParts
 *
 * @category Models
 */
export interface Type {
  /** The Gregorian year, range: [MIN_FULL_YEAR, MAX_FULL_YEAR] */
  readonly year?: number;
  /** Number of days elapsed since the start of year, range:[1, 366] */
  readonly ordinalDay?: number;
  /** Month in the current year, range:[1, 12] */
  readonly month?: number;
  /** Day in the current month, range:[1, 12] */
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
  /** Number of seconds, since sthe start of the current minute, range:[0, 59] */
  readonly second?: number;
  /** Number of milliseconds, since sthe start of the current second, range:[0, 999] */
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
