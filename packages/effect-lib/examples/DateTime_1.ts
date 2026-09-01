import { pipe } from 'effect';

import * as MDateTime from '@parischap/effect-lib/MDateTime';

/** You can create a MDateTime from a timestamp and timeZoneOffset expressed in hours */
// Result: '1970-01-01T05:15:00.000+05:15
console.log(MDateTime.fromTimestampOrThrow(0, 5.25));

/**
 * You can create a MDateTime from a timestamp and timeZoneOffset expressed in hours, minutes,
 * seconds
 */
// Result: '1970-01-01T05:15:00.000+05:15'
console.log(MDateTime.fromTimestampOrThrow(0, { zoneHour: 5, zoneMinute: 15, zoneSecond: 0 }));

/**
 * You can create a MDateTime from a timestamp without specifying a timeZoneOffset. In that case,
 * the timeZoneOffset of the machine the code runs on is applied
 */
// Result: '1970-01-01T02:00:00.000+02:00' (Was run in Paris during summertime)
console.log(MDateTime.fromTimestampOrThrow(0));

/**
 * You can create a MDateTime from DateTime.Parts
 *
 * See the documentation of function MDateTime.fromParts to see when and how default values are
 * calculated if you don't provide enough information.
 *
 * Unlike the native Javascript Date object, you cannot pass out-of-range data (e.g month = 13,
 * monthDay=31 in April,...). If you pass too much information, all provided parameters must be
 * coherent.
 *
 * Let's see some examples
 */

// Result: { _id: 'Result', _tag: 'Success', success: '2025-01-25T00:00:00.765+00:00' }
console.log(
  MDateTime.fromParts({ year: 2025, month: 1, monthDay: 25, millisecond: 765, zoneOffset: 0 }),
);

// Result: { _id: 'Result', _tag: 'Success', success: '2025-12-30T11:00:00.000-12:00' }
console.log(
  MDateTime.fromParts({ isoYear: 2026, isoWeek: 1, weekday: 2, hour23: 11, zoneOffset: -12 }),
);

// Result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: "Expected 'hour11' to be between 0 (included) and 11 (included). Actual: 12",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(
  MDateTime.fromParts({ isoYear: 2026, isoWeek: 1, weekday: 2, hour11: 12, zoneOffset: -12 }),
);

// Result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: "Expected 'monthDay' to be between 1 (included) and 28 (included). Actual: 29",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(MDateTime.fromParts({ year: 2025, month: 2, monthDay: 29, zoneOffset: 0 }));

// Result: {
// _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: "Expected 'isoWeek' to be: 9. Actual: 5",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(
  MDateTime.fromParts({ year: 2025, month: 2, monthDay: 28, isoWeek: 5, zoneOffset: 0 }),
);

/**
 * Once a MDateTime is created, you can get any MDateTime.Parts from it ising the provided
 * getters. Here are a few examples (you can see the whole list of getters in the API).
 */

const aDate = MDateTime.fromPartsOrThrow({ year: 1970, month: 8, monthDay: 31, zoneOffset: 0 });

// Result: '1970'
console.log(MDateTime.getYear(aDate));

// Result: '36'
console.log(MDateTime.getIsoWeek(aDate));

// DO NOT DO THIS. It works but is slower because intermediate calculations are not saved
// Result: '1970 36'
console.log(
  MDateTime.getYear(
    MDateTime.fromPartsOrThrow({ year: 1970, month: 8, monthDay: 31, zoneOffset: 0 }),
  ),
  MDateTime.getIsoWeek(
    MDateTime.fromPartsOrThrow({ year: 1970, month: 8, monthDay: 31, zoneOffset: 0 }),
  ),
);

/**
 * Once a MDateTime is created, you can modify any MDateTime.Parts with the provided setters. Do
 * keep in mind that the initial MDateTime object is unchanged: you get a copy with the modified
 * part. Here are a few examples (you can see the whole list of setters in the API).
 */
// Result: { _id: 'Result', _tag: 'Success', success: '1970-03-01T00:00:00.000+00:00' }
console.log(pipe(aDate, MDateTime.setMonth(3)));

// result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: 'Month 6 of year 1970 does not have 31 days',
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(pipe(aDate, MDateTime.setMonth(6)));

// Result: { _id: 'Result', _tag: 'Success', success: '1970-08-31T05:45:00.000+05:45' }
console.log(pipe(aDate, MDateTime.setZoneOffsetKeepTimestamp(5.75)));

// Result: { _id: 'Result', _tag: 'Success', success: '1970-08-31T00:00:00.000+05:45' }
console.log(pipe(aDate, MDateTime.setZoneOffsetKeepParts(5.75)));

/**
 * You can also modify the MDateTime.Parts of an existing MDateTime object with the provided
 * offsetters. Do keep in mind that the initial MDateTime object is unchanged: you get a copy with
 * the modified part. Here are a few examples (you can see the whole list of offsetters in the
 * API).
 */
// Result: '1970-01-01T00:00:00.000+00:00'
console.log(pipe(aDate, MDateTime.toFirstYearDay));

// Result: {
//   _id: 'Result',
//   _tag: 'Failure',
//   failure: {
//     message: 'No February 29th on year 2027 which is not a leap year',
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(
  pipe(
    MDateTime.fromPartsOrThrow({ year: 2024, month: 2, monthDay: 29, zoneOffset: 0 }),
    MDateTime.offsetYears(3, false),
  ),
);

// Result: { _id: 'Result', _tag: 'Success', success: '2028-02-29T00:00:00.000+00:00' }
console.log(
  pipe(
    MDateTime.fromPartsOrThrow({ year: 2024, month: 2, monthDay: 29, zoneOffset: 0 }),
    MDateTime.offsetYears(4, false),
  ),
);

/** And finally you can use one of the few provided predicates whose list you will find in the API */

// Result: true
console.log(MDateTime.isLastMonthDay(aDate));

// Result: false
console.log(MDateTime.isFirstMonthDay(aDate));
