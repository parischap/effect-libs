import { CVDateTime } from "@parischap/conversions";
import { pipe } from "effect";

/** You can create a CVDateTime from a timestamp and timeZoneOffset expressed in hours */
// Result: '1970-01-01T05:15:00.000+05:15
console.log(CVDateTime.fromTimestampOrThrow(0, 5.25));

/**
 * You can create a CVDateTime from a timestamp and timeZoneOffset expressed in hours, minutes,
 * seconds
 */
// Result: '1970-01-01T05:15:00.000+05:15'
console.log(CVDateTime.fromTimestampOrThrow(0, { zoneHour: 5, zoneMinute: 15, zoneSecond: 0 }));

/**
 * You can create a CVDateTime from a timestamp without specifying a timeZoneOffset. In that case,
 * the timeZoneOffset of the machine the code runs on is applied
 */
// Result: '1970-01-01T02:00:00.000+02:00' (Was run in Paris during summertime)
console.log(CVDateTime.fromTimestampOrThrow(0));

/**
 * You can create a CVDateTime from DateTime.Parts
 *
 * See the documentation of function CVDateTime.fromParts to see when and how default values are
 * calculated if you don't provide enough information.
 *
 * Unlike the native Javascript Date object, you cannot pass out-of-range data (e.g month = 13,
 * monthDay=31 in April,...). If you pass too much information, all provided parameters must be
 * coherent.
 *
 * Let's see some examples
 */

// Result: { _id: 'Either', _tag: 'Right', right: '2025-01-25T00:00:00.765+00:00' }
console.log(
  CVDateTime.fromParts({ year: 2025, month: 1, monthDay: 25, millisecond: 765, zoneOffset: 0 }),
);

// Result: { _id: 'Either', _tag: 'Right', right: '2025-12-30T11:00:00.000-12:00' }
console.log(
  CVDateTime.fromParts({ isoYear: 2026, isoWeek: 1, weekday: 2, hour23: 11, zoneOffset: -12 }),
);

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: "Expected 'hour11' to be between 0 (included) and 11 (included). Actual: 12",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(
  CVDateTime.fromParts({ isoYear: 2026, isoWeek: 1, weekday: 2, hour11: 12, zoneOffset: -12 }),
);

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: "Expected 'monthDay' to be between 1 (included) and 28 (included). Actual: 29",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(CVDateTime.fromParts({ year: 2025, month: 2, monthDay: 29, zoneOffset: 0 }));

// Result: {
// _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: "Expected 'isoWeek' to be: 9. Actual: 5",
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(
  CVDateTime.fromParts({ year: 2025, month: 2, monthDay: 28, isoWeek: 5, zoneOffset: 0 }),
);

/**
 * Once a CVDateTime is created, you can get any CVDateTime.Parts from it ising the provided
 * getters. Here are a few examples (you can see the whole list of getters in the API).
 */

const aDate = CVDateTime.fromPartsOrThrow({ year: 1970, month: 8, monthDay: 31, zoneOffset: 0 });

// Result: '1970'
console.log(CVDateTime.getYear(aDate));

// Result: '36'
console.log(CVDateTime.getIsoWeek(aDate));

// DO NOT DO THIS. It works but is slower because intermediate calculations are not saved
// Result: '1970 36'
console.log(
  CVDateTime.getYear(
    CVDateTime.fromPartsOrThrow({ year: 1970, month: 8, monthDay: 31, zoneOffset: 0 }),
  ),
  CVDateTime.getIsoWeek(
    CVDateTime.fromPartsOrThrow({ year: 1970, month: 8, monthDay: 31, zoneOffset: 0 }),
  ),
);

/**
 * Once a CVDateTime is created, you can modify any CVDateTime.Parts with the provided setters. Do
 * keep in mind that the initial CVDateTime object is unchanged: you get a copy with the modified
 * part. Here are a few examples (you can see the whole list of setters in the API).
 */
// Result: { _id: 'Either', _tag: 'Right', right: '1970-03-01T00:00:00.000+00:00' }
console.log(pipe(aDate, CVDateTime.setMonth(3)));

// result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: 'Month 6 of year 1970 does not have 31 days',
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(pipe(aDate, CVDateTime.setMonth(6)));

// Result: { _id: 'Either', _tag: 'Right', right: '1970-08-31T05:45:00.000+05:45' }
console.log(pipe(aDate, CVDateTime.setZoneOffsetKeepTimestamp(5.75)));

// Result: { _id: 'Either', _tag: 'Right', right: '1970-08-31T00:00:00.000+05:45' }
console.log(pipe(aDate, CVDateTime.setZoneOffsetKeepParts(5.75)));

/**
 * You can also modify the CVDateTime.Parts of an existing CVDateTime object with the provided
 * offsetters. Do keep in mind that the initial CVDateTime object is unchanged: you get a copy with
 * the modified part. Here are a few examples (you can see the whole list of offsetters in the
 * API).
 */
// Result: '1970-01-01T00:00:00.000+00:00'
console.log(pipe(aDate, CVDateTime.toFirstYearDay));

// Result: {
//   _id: 'Either',
//   _tag: 'Left',
//   left: {
//     message: 'No February 29th on year 2027 which is not a leap year',
//     _tag: '@parischap/effect-lib/InputError/'
//   }
// }
console.log(
  pipe(
    CVDateTime.fromPartsOrThrow({ year: 2024, month: 2, monthDay: 29, zoneOffset: 0 }),
    CVDateTime.offsetYears(3, false),
  ),
);

// Result: { _id: 'Either', _tag: 'Right', right: '2028-02-29T00:00:00.000+00:00' }
console.log(
  pipe(
    CVDateTime.fromPartsOrThrow({ year: 2024, month: 2, monthDay: 29, zoneOffset: 0 }),
    CVDateTime.offsetYears(4, false),
  ),
);

/** And finally you can use one of the few provided predicates whose list you will find in the API */

// Result: true
console.log(CVDateTime.isLastMonthDay(aDate));

// Result: false
console.log(CVDateTime.isFirstMonthDay(aDate));
