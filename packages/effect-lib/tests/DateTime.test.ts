import { assert, describe, it } from '@effect/vitest';
import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import * as Result from 'effect/Result';
import * as Tuple from 'effect/Tuple';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MArray from '@parischap/effect-lib/MArray';
import * as MDateTime from '@parischap/effect-lib/MDateTime';
import { DAY_MS, SHORT_YEAR_MS, WEEK_MS } from '@parischap/effect-lib/MDateTimeConstants';
import * as MDateTimeContext from '@parischap/effect-lib/MDateTimeContext';
import * as MDateTimeFormat from '@parischap/effect-lib/MDateTimeFormat';

describe('MDateTime', () => {
  /** Produces a random integer between 0 included and range excluded */
  const intRandom = (range: number): number =>
    pipe(Math.random(), Number.multiply(range), Math.floor);

  const origin = MDateTime.fromTimestampOrThrow(0, 0);
  const feb29_2020 = MDateTime.fromTimestampOrThrow(Date.UTC(2020, 1, 29), 0);

  describe('Tag, .toString()', () => {
    TestUtils.assertEquals(
      Option.some(MDateTime.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );

    it('.toString()', () => {
      assert.strictEqual(origin.toString(), '1970-01-01T00:00:00.000+00:00');
      assert.strictEqual(
        MDateTime.fromTimestampOrThrow(1_749_823_231_774, -3.765).toString(),
        '2025-06-13T10:14:37.774-03:45',
      );
    });
  });

  it('fromTimestamp, year, yearIsLeap, month, monthDay, ordinalDay', () => {
    const [actualVector, expectedVector] = pipe(
      Array.range(1771, 2170),
      Array.map((baseYear) => {
        const year = baseYear + (intRandom(8) - 4) * 400;
        const startTimestamp = Date.UTC(year);
        const startDate = MDateTime.fromTimestampOrThrow(startTimestamp, 0);
        const yearDuration = Date.UTC(year + 1) - startTimestamp;
        const yearIsLeap = Math.floor(yearDuration / DAY_MS) === 366;
        const randomDuration = intRandom(yearDuration);
        const randomTimestamp = startTimestamp + randomDuration;
        const randomDate = MDateTime.fromTimestampOrThrow(randomTimestamp, 0);
        const expectedRandomDate = new Date(randomTimestamp);
        const endTimestamp = startTimestamp + yearDuration - 1;
        const endDate = MDateTime.fromTimestampOrThrow(endTimestamp, 0);

        return Array.make(
          Tuple.make(
            {
              startInput: startTimestamp,
              year: MDateTime.getYear(startDate),
              yearIsLeap: MDateTime.yearIsLeap(startDate),
              month: MDateTime.getMonth(startDate),
              monthDay: MDateTime.getMonthDay(startDate),
              ordinalDay: MDateTime.getOrdinalDay(startDate),
            },
            {
              startInput: startTimestamp,
              year,
              yearIsLeap,
              month: 1,
              monthDay: 1,
              ordinalDay: 1,
            },
          ),
          Tuple.make(
            {
              randomInput: randomTimestamp,
              year: MDateTime.getYear(randomDate),
              yearIsLeap: MDateTime.yearIsLeap(randomDate),
              month: MDateTime.getMonth(randomDate),
              monthDay: MDateTime.getMonthDay(randomDate),
              ordinalDay: MDateTime.getOrdinalDay(randomDate),
            },
            {
              randomInput: randomTimestamp,
              year,
              yearIsLeap: yearIsLeap,
              month: expectedRandomDate.getUTCMonth() + 1,
              monthDay: expectedRandomDate.getUTCDate(),
              ordinalDay: Math.floor(randomDuration / DAY_MS) + 1,
            },
          ),
          Tuple.make(
            {
              endInput: endTimestamp,
              year: MDateTime.getYear(endDate),
              yearIsLeap: MDateTime.yearIsLeap(endDate),
              month: MDateTime.getMonth(endDate),
              monthDay: MDateTime.getMonthDay(endDate),
              ordinalDay: MDateTime.getOrdinalDay(endDate),
            },
            {
              endInput: endTimestamp,
              year,
              yearIsLeap: yearIsLeap,
              month: 12,
              monthDay: 31,
              ordinalDay: yearIsLeap ? 366 : 365,
            },
          ),
        );
      }),
      Array.flatten,
      Array.unzip,
    );

    /*const zippedVector = Array.zip(actualVector, expectedVector);
		for (const [actual, expected] of zippedVector) {
			if (
				actual.year !== expected.year ||
				actual.yearIsLeap !== expected.yearIsLeap ||
				actual.month !== expected.month ||
				actual.monthDay !== expected.monthDay ||
				actual.ordinalDay !== expected.ordinalDay
			) {
				console.log(actual, expected);
				break;
			}
		}*/

    TestUtils.assertEquals(actualVector, expectedVector);
    /*
		const date = MDateTime.fromTimestampOrThrow(31620067199999, 0)
		TestUtils.assertEquals({
							year: MDateTime.year(date),
							yearIsLeap: MDateTime.yearIsLeap(date),
							month: MDateTime.month(date),
							monthDay: MDateTime.monthDay(date),
							ordinalDay: MDateTime.ordinalDay(date)
						}, {
							year: 2971,
							yearIsLeap:false,
							month: 12,
							monthDay: 31,
							ordinalDay: 365
						});
		 */
  });

  it('fromTimestamp, isoYear, isoYearIsLong, week, weekday', () => {
    // Timestamp of 31/12/1770 00:00:00:000+0:00
    const YEAR_START_1771_MS = -6_279_897_600_000;
    const FOUR_HUNDRED_YEARS_MS = 12_622_780_800_000;
    const [actualVector, expectedVector] = pipe(
      Tuple.make(1771, YEAR_START_1771_MS),
      MArray.unfoldNonEmpty(([baseYear, baseYearStartTimestamp]) => {
        const offset = intRandom(8) - 4;
        const year = baseYear + offset * 400;
        const startTimestamp = baseYearStartTimestamp + offset * FOUR_HUNDRED_YEARS_MS;
        const startDate = MDateTime.fromTimestampOrThrow(startTimestamp, 0);

        const tentativeEndTimestamp = startTimestamp + SHORT_YEAR_MS - 1;
        const tentativeEndMonthDay = new Date(tentativeEndTimestamp).getUTCDate();
        const isoYearIsLong = tentativeEndMonthDay >= 21 && tentativeEndMonthDay < 28;
        const endTimestamp = tentativeEndTimestamp + (isoYearIsLong ? WEEK_MS : 0);
        const endDate = MDateTime.fromTimestampOrThrow(endTimestamp, 0);
        const yearDurationInWeeks = isoYearIsLong ? 53 : 52;
        const yearDurationMs = endTimestamp - startTimestamp + 1;

        const isoWeekIndex = intRandom(yearDurationInWeeks);
        const weekdayIndex = intRandom(6);
        const randomTimestamp = startTimestamp + isoWeekIndex * WEEK_MS + weekdayIndex * DAY_MS;
        const randomDate = MDateTime.fromTimestampOrThrow(randomTimestamp, 0);

        return Tuple.make(
          Array.make(
            Tuple.make(
              {
                startInput: startTimestamp,
                isoYear: MDateTime.getIsoYear(startDate),
                isoYearIsLong: MDateTime.isoYearIsLong(startDate),
                isoWeek: MDateTime.getIsoWeek(startDate),
                weekday: MDateTime.getWeekday(startDate),
              },
              {
                startInput: startTimestamp,
                isoYear: year,
                isoYearIsLong,
                isoWeek: 1,
                weekday: 1,
              },
            ),
            Tuple.make(
              {
                randomInput: randomTimestamp,
                isoYear: MDateTime.getIsoYear(randomDate),
                isoYearIsLong: MDateTime.isoYearIsLong(randomDate),
                isoWeek: MDateTime.getIsoWeek(randomDate),
                weekday: MDateTime.getWeekday(randomDate),
              },
              {
                randomInput: randomTimestamp,
                isoYear: year,
                isoYearIsLong,
                isoWeek: isoWeekIndex + 1,
                weekday: weekdayIndex + 1,
              },
            ),
            Tuple.make(
              {
                endInput: endTimestamp,
                isoYear: MDateTime.getIsoYear(endDate),
                isoYearIsLong: MDateTime.isoYearIsLong(endDate),
                isoWeek: MDateTime.getIsoWeek(endDate),
                weekday: MDateTime.getWeekday(endDate),
              },
              {
                endInput: endTimestamp,
                isoYear: year,
                isoYearIsLong,
                isoWeek: yearDurationInWeeks,
                weekday: 7,
              },
            ),
          ),
          pipe(
            baseYear + 1,
            Option.liftPredicate(Number.isLessThanOrEqualTo(2170)),
            Option.map(
              flow(Tuple.make, Tuple.appendElement(baseYearStartTimestamp + yearDurationMs)),
            ),
          ),
        );
      }),
      Array.flatten,
      Array.unzip,
    );

    /*const zippedVector = Array.zip(actualVector, expectedVector);
		for (const [actual, expected] of zippedVector) {
			if (
				actual.isoYear !== expected.isoYear ||
				actual.isoYearIsLong !== expected.isoYearIsLong ||
				actual.isoWeek !== expected.isoWeek ||
				actual.weekday !== expected.weekday
			) {
				console.log(actual, expected);
				break;
			}
		}*/

    TestUtils.assertEquals(actualVector, expectedVector);

    /*const date = MDateTime.fromTimestampOrThrow(-6216393600000, 0);
		TestUtils.assertEquals(
			{
				isoYearDescriptor: MDateTime.isoYearDescriptor(date),
				isoYearIsLong: MDateTime.isoYearIsLong(date),
				isoWeek: MDateTime.isoWeek(date),
				weekday: MDateTime.weekday(date)
			},
			{
				isoYearDescriptor: 1773,
				isoYearIsLong: false,
				isoWeek: 1,
				weekday: 1
			}
		);*/
  });

  describe('fromParts', () => {
    it('From nothing', () => {
      TestUtils.assertFailureMessage(
        MDateTime.fromParts({}),
        "One of 'year' and 'isoYear' must be be set",
      );
    });

    it('From date with hour23 and zoneOffset', () => {
      const result = MDateTime.fromParts({
        year: 2024,
        ordinalDay: 61,
        hour23: 17,
        minute: 43,
        second: 27,
        millisecond: 654,
        zoneOffset: 1,
      });

      TestUtils.assertSuccess(result);
      const testDate = result.success;
      assert.strictEqual(MDateTime.timestamp(testDate), Date.UTC(2024, 2, 1, 16, 43, 27, 654));
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.gregorianDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.isoDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.time);
    });

    describe('From date with hour23 and zoneHour, zoneMinute, zoneSecond', () => {
      it('Positive offset', () => {
        TestUtils.assertSuccess(
          pipe(
            {
              year: 2024,
              ordinalDay: 61,
              hour23: 17,
              minute: 43,
              second: 27,
              millisecond: 654,
              zoneHour: 1,
              zoneMinute: 12,
              zoneSecond: 30,
            },
            MDateTime.fromParts,
            Result.map(MDateTime.timestamp),
          ),
          Date.UTC(2024, 2, 1, 16, 30, 57, 654),
        );
      });

      it('Negative offset, zoneHour !== 0', () => {
        TestUtils.assertSuccess(
          pipe(
            {
              year: 2024,
              ordinalDay: 61,
              hour23: 17,
              minute: 43,
              second: 27,
              millisecond: 654,
              zoneHour: -1,
              zoneMinute: 12,
              zoneSecond: 30,
            },
            MDateTime.fromParts,
            Result.map(MDateTime.timestamp),
          ),
          Date.UTC(2024, 2, 1, 18, 55, 57, 654),
        );
      });

      it('Negative offset, zoneHour=0', () => {
        TestUtils.assertSuccess(
          pipe(
            {
              year: 2024,
              ordinalDay: 61,
              hour23: 17,
              minute: 43,
              second: 27,
              millisecond: 654,
              zoneHour: -0,
              zoneMinute: 12,
              zoneSecond: 30,
            },
            MDateTime.fromParts,
            Result.map(MDateTime.timestamp),
          ),
          Date.UTC(2024, 2, 1, 17, 55, 57, 654),
        );
      });
    });

    it('From date with hour23 and zoneOffset, zoneHour, zoneMinute, zoneSecond', () => {
      TestUtils.assertSuccess(
        pipe(
          {
            year: 2024,
            ordinalDay: 61,
            hour23: 17,
            minute: 43,
            second: 27,
            millisecond: 654,
            zoneOffset: 1.215,
            zoneHour: 1,
            zoneMinute: 12,
            zoneSecond: 54,
          },
          MDateTime.fromParts,
          Result.map(MDateTime.timestamp),
        ),
        Date.UTC(2024, 2, 1, 16, 30, 33, 654),
      );
    });

    it('From date with hour11 and meridiem', () => {
      TestUtils.assertSuccess(
        pipe(
          {
            year: 2024,
            ordinalDay: 61,
            meridiem: 12,
            hour11: 5,
            minute: 43,
            second: 27,
            millisecond: 654,
            zoneOffset: -1,
          },
          MDateTime.fromParts,
          Result.map(MDateTime.timestamp),
        ),
        Date.UTC(2024, 2, 1, 18, 43, 27, 654),
      );
    });

    it('From isodate', () => {
      const result = MDateTime.fromParts({
        isoYear: 2027,
        isoWeek: 52,
        weekday: 6,
        meridiem: 12,
        hour11: 5,
        minute: 43,
        second: 27,
        millisecond: 654,
        zoneOffset: 0,
      });

      TestUtils.assertSuccess(result);
      const testDate = result.success;
      assert.strictEqual(MDateTime.timestamp(testDate), Date.UTC(2028, 0, 1, 17, 43, 27, 654));
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.gregorianDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.isoDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.time);
    });

    describe('Default values', () => {
      it('Only year is set', () => {
        const result = MDateTime.fromParts({
          year: 2025,
          zoneOffset: 0,
        });

        TestUtils.assertSuccess(result);
        const testDate = result.success;
        assert.strictEqual(MDateTime.timestamp(testDate), Date.UTC(2025, 0, 1));
        // @ts-expect-error Accessing private member for test purposes
        TestUtils.assertSome(testDate.gregorianDate);
        // @ts-expect-error Accessing private member for test purposes
        TestUtils.assertNone(testDate.isoDate);
        // @ts-expect-error Accessing private member for test purposes
        TestUtils.assertNone(testDate.time);
      });

      it('year and month are set', () => {
        TestUtils.assertSuccess(
          pipe(
            {
              year: 2025,
              month: 5,
              zoneOffset: 0,
            },
            MDateTime.fromParts,
            Result.map(MDateTime.timestamp),
          ),
          Date.UTC(2025, 4, 1),
        );
      });
      it('year and monthDay are set', () => {
        TestUtils.assertSuccess(
          pipe(
            {
              year: 2025,
              monthDay: 5,
              zoneOffset: 0,
            },
            MDateTime.fromParts,
            Result.map(MDateTime.timestamp),
          ),
          Date.UTC(2025, 0, 5),
        );
      });
      it('Only isoYear is set', () => {
        TestUtils.assertSuccess(
          pipe(
            {
              isoYear: 2025,
              zoneOffset: 0,
            },
            MDateTime.fromParts,
            Result.map(MDateTime.timestamp),
          ),
          Date.UTC(2024, 11, 30),
        );
      });
      it('isoYear and isoWeek are set', () => {
        TestUtils.assertSuccess(
          pipe(
            {
              isoYear: 2025,
              isoWeek: 5,
              zoneOffset: 0,
            },
            MDateTime.fromParts,
            Result.map(MDateTime.timestamp),
          ),
          Date.UTC(2025, 0, 27),
        );
      });
      it('isoYear and weekday are set', () => {
        TestUtils.assertSuccess(
          pipe(
            {
              isoYear: 2025,
              weekday: 5,
              zoneOffset: 0,
            },
            MDateTime.fromParts,
            Result.map(MDateTime.timestamp),
          ),
          Date.UTC(2025, 0, 3),
        );
      });
      it('A day is set and isoYear is passed', () => {
        const result = MDateTime.fromParts({
          year: 2024,
          ordinalDay: 365,
          isoYear: 2025,
          zoneOffset: 0,
        });
        TestUtils.assertSuccess(result);
        const testDate = result.success;
        assert.strictEqual(MDateTime.timestamp(testDate), Date.UTC(2024, 11, 30));
        // @ts-expect-error Accessing private member for test purposes
        TestUtils.assertSome(testDate.gregorianDate);
        // @ts-expect-error Accessing private member for test purposes
        TestUtils.assertSome(testDate.isoDate);
        // @ts-expect-error Accessing private member for test purposes
        TestUtils.assertNone(testDate.time);
      });

      it('An isoDay is set and year is passed', () => {
        const result = MDateTime.fromParts({
          year: 2025,
          isoYear: 2025,
          isoWeek: 3,
          weekday: 4,
          zoneOffset: 0,
        });
        TestUtils.assertSuccess(result);
        const testDate = result.success;
        assert.strictEqual(MDateTime.timestamp(testDate), Date.UTC(2025, 0, 16));
        // @ts-expect-error Accessing private member for test purposes
        TestUtils.assertSome(testDate.gregorianDate);
        // @ts-expect-error Accessing private member for test purposes
        TestUtils.assertSome(testDate.isoDate);
        // @ts-expect-error Accessing private member for test purposes
        TestUtils.assertNone(testDate.time);
      });

      it('Only meridiem is set', () => {
        TestUtils.assertSuccess(
          pipe(
            {
              year: 2024,
              ordinalDay: 75,
              meridiem: 12,
              zoneOffset: 2,
            },
            MDateTime.fromParts,
            Result.map(MDateTime.timestamp),
          ),
          Date.UTC(2024, 2, 15, 10),
        );
      });

      it('Only hour11 is set', () => {
        TestUtils.assertSuccess(
          pipe(
            {
              year: 2024,
              ordinalDay: 75,
              hour11: 5,
              zoneOffset: 0,
            },
            MDateTime.fromParts,
            Result.map(MDateTime.timestamp),
          ),
          Date.UTC(2024, 2, 15, 5),
        );
      });

      it('Only zoneMinute is set', () => {
        TestUtils.assertSuccess(
          pipe(
            {
              year: 2024,
              ordinalDay: 61,
              hour23: 17,
              minute: 43,
              second: 27,
              millisecond: 654,
              zoneMinute: 5,
            },
            MDateTime.fromParts,
            Result.map(MDateTime.timestamp),
          ),
          Date.UTC(2024, 2, 1, 17, 38, 27, 654),
        );
      });
    });

    describe('Out of range data', () => {
      it('zoneOffset', () => {
        TestUtils.assertFailureMessage(
          pipe({ year: 2025, zoneOffset: 15 }, MDateTime.fromParts),
          "Expected 'zoneOffset' to be between -13 (excluded) and 15 (excluded). Actual: 15",
        );
      });

      it('zoneHour', () => {
        TestUtils.assertFailureMessage(
          pipe({ year: 2025, zoneHour: 15 }, MDateTime.fromParts),
          "Expected 'zoneHour' to be between -12 (included) and 14 (included). Actual: 15",
        );
      });

      it('zoneMinute', () => {
        TestUtils.assertFailureMessage(
          pipe({ year: 2025, zoneMinute: 63 }, MDateTime.fromParts),
          "Expected 'zoneMinute' to be between 0 (included) and 59 (included). Actual: 63",
        );
      });

      it('zoneSecond', () => {
        TestUtils.assertFailureMessage(
          pipe({ year: 2025, zoneSecond: -5 }, MDateTime.fromParts),
          "Expected 'zoneSecond' to be between 0 (included) and 59 (included). Actual: -5",
        );
      });

      it('month', () => {
        TestUtils.assertFailureMessage(
          pipe({ year: 2025, month: 0 }, MDateTime.fromParts),
          "Expected 'month' to be between 1 (included) and 12 (included). Actual: 0",
        );
      });

      it('monthDay', () => {
        TestUtils.assertFailureMessage(
          pipe({ year: 2025, month: 2, monthDay: 32 }, MDateTime.fromParts),
          "Expected 'monthDay' to be between 1 (included) and 28 (included). Actual: 32",
        );
      });

      it('ordinalDay', () => {
        TestUtils.assertFailureMessage(
          pipe({ year: 2024, ordinalDay: 412 }, MDateTime.fromParts),
          "Expected 'ordinalDay' to be between 1 (included) and 366 (included). Actual: 412",
        );
      });

      it('isoWeek', () => {
        TestUtils.assertFailureMessage(
          pipe({ isoYear: 2027, isoWeek: 53 }, MDateTime.fromParts),
          "Expected 'isoWeek' to be between 1 (included) and 52 (included). Actual: 53",
        );
      });

      it('weekDay', () => {
        TestUtils.assertFailureMessage(
          pipe({ isoYear: 2027, weekday: 0 }, MDateTime.fromParts),
          "Expected 'weekday' to be between 1 (included) and 7 (included). Actual: 0",
        );
      });

      it('hour23', () => {
        TestUtils.assertFailureMessage(
          pipe({ year: 2024, hour23: 24 }, MDateTime.fromParts),
          "Expected 'hour23' to be between 0 (included) and 23 (included). Actual: 24",
        );
      });

      it('hour11', () => {
        TestUtils.assertFailureMessage(
          pipe({ year: 2024, meridiem: 0, hour11: -4 }, MDateTime.fromParts),
          "Expected 'hour11' to be between 0 (included) and 11 (included). Actual: -4",
        );
      });

      it('minute', () => {
        TestUtils.assertFailureMessage(
          pipe({ year: 2024, minute: 60 }, MDateTime.fromParts),
          "Expected 'minute' to be between 0 (included) and 59 (included). Actual: 60",
        );
      });

      it('second', () => {
        TestUtils.assertFailureMessage(
          pipe({ year: 2024, second: 67 }, MDateTime.fromParts),
          "Expected 'second' to be between 0 (included) and 59 (included). Actual: 67",
        );
      });

      it('millisecond', () => {
        TestUtils.assertFailureMessage(
          pipe({ year: 2024, millisecond: 1023 }, MDateTime.fromParts),
          "Expected 'millisecond' to be between 0 (included) and 999 (included). Actual: 1023",
        );
      });
    });
    it('Incoherent parts', () => {
      TestUtils.assertFailureMessage(
        pipe(
          {
            year: 2024,
            hour23: 5,
            meridiem: 12,
            zoneOffset: 0,
          },
          MDateTime.fromParts,
        ),
        "Expected 'meridiem' to be: 0. Actual: 12",
      );
      TestUtils.assertFailureMessage(
        pipe(
          {
            year: 2024,
            hour23: 5,
            meridiem: 0,
            hour11: 4,
            zoneOffset: 0,
          },
          MDateTime.fromParts,
        ),
        "Expected 'hour11' to be: 5. Actual: 4",
      );
      TestUtils.assertFailureMessage(
        pipe(
          {
            year: 2024,
            ordinalDay: 61,
            month: 2,
            zoneOffset: 0,
          },
          MDateTime.fromParts,
        ),
        "Expected 'month' to be: 3. Actual: 2",
      );
      TestUtils.assertFailureMessage(
        pipe(
          {
            year: 2024,
            ordinalDay: 61,
            monthDay: 2,
            zoneOffset: 0,
          },
          MDateTime.fromParts,
        ),
        "Expected 'monthDay' to be: 1. Actual: 2",
      );
      TestUtils.assertFailureMessage(
        pipe(
          {
            year: 2024,
            ordinalDay: 61,
            isoWeek: 12,
            zoneOffset: 0,
          },
          MDateTime.fromParts,
        ),
        "Expected 'isoWeek' to be: 9. Actual: 12",
      );
      TestUtils.assertFailureMessage(
        pipe(
          {
            year: 2024,
            ordinalDay: 61,
            weekday: 17,
            zoneOffset: 0,
          },
          MDateTime.fromParts,
        ),
        "Expected 'weekday' to be: 5. Actual: 17",
      );
      TestUtils.assertFailureMessage(
        pipe(
          {
            year: 2024,
            month: 3,
            monthDay: 1,
            weekday: 17,
            zoneOffset: 0,
          },
          MDateTime.fromParts,
        ),
        "Expected 'weekday' to be: 5. Actual: 17",
      );
      TestUtils.assertFailureMessage(
        pipe(
          {
            year: 2024,
            month: 12,
            monthDay: 30,
            isoYear: 2024,
            zoneOffset: 0,
          },
          MDateTime.fromParts,
        ),
        "Expected 'isoYear' to be: 2025. Actual: 2024",
      );
      TestUtils.assertFailureMessage(
        pipe(
          {
            isoYear: 2027,
            isoWeek: 52,
            weekday: 6,
            year: 2027,
            zoneOffset: 0,
          },
          MDateTime.fromParts,
        ),
        "Expected 'year' to be: 2028. Actual: 2027",
      );
      TestUtils.assertFailureMessage(
        pipe(
          {
            isoYear: 2027,
            isoWeek: 52,
            weekday: 6,
            month: 12,
            zoneOffset: 0,
          },
          MDateTime.fromParts,
        ),
        "Expected 'month' to be: 1. Actual: 12",
      );
      TestUtils.assertFailureMessage(
        pipe(
          {
            isoYear: 2027,
            isoWeek: 52,
            weekday: 6,
            monthDay: 5,
            zoneOffset: 0,
          },
          MDateTime.fromParts,
        ),
        "Expected 'monthDay' to be: 1. Actual: 5",
      );
      TestUtils.assertFailureMessage(
        pipe(
          {
            isoYear: 2027,
            isoWeek: 52,
            weekday: 6,
            ordinalDay: 5,
            zoneOffset: 0,
          },
          MDateTime.fromParts,
        ),
        "Expected 'ordinalDay' to be: 1. Actual: 5",
      );
      TestUtils.assertFailureMessage(
        pipe(
          {
            year: 2024,
            ordinalDay: 61,
            hour23: 17,
            minute: 43,
            second: 27,
            millisecond: 654,
            zoneOffset: 1.215,
            zoneHour: 1,
            zoneMinute: 12,
            zoneSecond: 53,
          },
          MDateTime.fromParts,
        ),
        "Expected 'zoneSecond' to be: 54. Actual: 53",
      );
    });
  });

  describe('Getters', () => {
    it('Get year, month, monthDay then all time parts', () => {
      const testDate = MDateTime.fromTimestampOrThrow(1_750_670_080_496, 0);

      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.gregorianDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.isoDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.time);

      assert.strictEqual(MDateTime.getYear(testDate), 2025);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.gregorianDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.isoDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.time);

      assert.strictEqual(MDateTime.getMonth(testDate), 6);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.gregorianDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.isoDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.time);

      assert.strictEqual(MDateTime.getMonthDay(testDate), 23);
      assert.strictEqual(MDateTime.getHour23(testDate), 9);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.gregorianDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.isoDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.time);

      assert.strictEqual(MDateTime.getMinute(testDate), 14);
      assert.strictEqual(MDateTime.getSecond(testDate), 40);
      assert.strictEqual(MDateTime.getMillisecond(testDate), 496);
    });

    it('Get seconds then monthDay', () => {
      const testDate = MDateTime.fromTimestampOrThrow(1_750_670_080_496, 0);
      assert.strictEqual(MDateTime.getSecond(testDate), 40);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.gregorianDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.isoDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.time);

      assert.strictEqual(MDateTime.getMonthDay(testDate), 23);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.gregorianDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.isoDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.time);

      assert.strictEqual(MDateTime.getHour23(testDate), 9);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.gregorianDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.isoDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.time);
    });

    it('Get isoYear, isoWeek, weekday and milliseconds', () => {
      const testDate = MDateTime.fromTimestampOrThrow(1_750_670_080_496, 0);
      assert.strictEqual(MDateTime.getIsoYear(testDate), 2025);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.gregorianDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.isoDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.time);

      assert.strictEqual(MDateTime.getIsoWeek(testDate), 26);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.gregorianDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.isoDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.time);

      assert.strictEqual(MDateTime.getWeekday(testDate), 1);
      assert.strictEqual(MDateTime.getMillisecond(testDate), 496);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.gregorianDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.isoDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.time);
    });

    it('Get minutes, isoYear, weekday, year and monthDay', () => {
      const testDate = MDateTime.fromTimestampOrThrow(1_750_670_080_496, 0);
      assert.strictEqual(MDateTime.getMinute(testDate), 14);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.gregorianDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.isoDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.time);

      assert.strictEqual(MDateTime.getIsoYear(testDate), 2025);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.gregorianDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.isoDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.time);

      assert.strictEqual(MDateTime.getWeekday(testDate), 1);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertNone(testDate.gregorianDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.isoDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.time);

      assert.strictEqual(MDateTime.getYear(testDate), 2025);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.gregorianDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.isoDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.time);

      assert.strictEqual(MDateTime.getMonthDay(testDate), 23);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.gregorianDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.isoDate);
      // @ts-expect-error Accessing private member for test purposes
      TestUtils.assertSome(testDate.time);
    });

    describe('Get year, isoYear, isoWeek, weekday', () => {
      describe('isoYear and year are equal', () => {
        it('Start of year', () => {
          const testDate = MDateTime.fromPartsOrThrow({
            year: 2022,
            month: 1,
            monthDay: 3,
            zoneOffset: 0,
          });
          assert.strictEqual(MDateTime.getYear(testDate), 2022);
          assert.strictEqual(MDateTime.getIsoYear(testDate), 2022);
          assert.strictEqual(MDateTime.getIsoWeek(testDate), 1);
          assert.strictEqual(MDateTime.getWeekday(testDate), 1);
        });

        it('End of year', () => {
          const testDate = MDateTime.fromPartsOrThrow({
            year: 2025,
            month: 12,
            monthDay: 28,
            zoneOffset: 0,
          });
          assert.strictEqual(MDateTime.getYear(testDate), 2025);
          assert.strictEqual(MDateTime.getIsoYear(testDate), 2025);
          assert.strictEqual(MDateTime.getIsoWeek(testDate), 52);
          assert.strictEqual(MDateTime.getWeekday(testDate), 7);
        });
      });

      it('isoYear is year -1', () => {
        const testDate = MDateTime.fromPartsOrThrow({
          year: 2022,
          month: 1,
          monthDay: 2,
          zoneOffset: 0,
        });
        assert.strictEqual(MDateTime.getYear(testDate), 2022);
        assert.strictEqual(MDateTime.getIsoYear(testDate), 2021);
        assert.strictEqual(MDateTime.getIsoWeek(testDate), 52);
        assert.strictEqual(MDateTime.getWeekday(testDate), 7);
      });

      it('isoYear is year + 1', () => {
        const testDate = MDateTime.fromPartsOrThrow({
          year: 2025,
          month: 12,
          monthDay: 29,
          zoneOffset: 0,
        });
        assert.strictEqual(MDateTime.getYear(testDate), 2025);
        assert.strictEqual(MDateTime.getIsoYear(testDate), 2026);
        assert.strictEqual(MDateTime.getIsoWeek(testDate), 1);
        assert.strictEqual(MDateTime.getWeekday(testDate), 1);
      });
    });
  });

  describe('Setters', () => {
    describe('Not passing', () => {
      it('No February,29th in 2021', () => {
        TestUtils.assertFailureMessage(
          pipe(feb29_2020, MDateTime.setYear(2021)),
          'No February 29th on year 2021 which is not a leap year',
        );
      });
      it('No june, 31st', () => {
        TestUtils.assertFailureMessage(
          pipe(
            {
              isoYear: 2027,
              isoWeek: 22,
              weekday: 1,
              zoneOffset: 0,
            },
            MDateTime.fromPartsOrThrow,
            MDateTime.setMonth(6),
          ),
          'Month 6 of year 2027 does not have 31 days',
        );
      });

      it('No 53rd week in 2024', () => {
        TestUtils.assertFailureMessage(
          pipe(
            {
              year: 2026,
              month: 12,
              monthDay: 29,
              zoneOffset: 0,
            },
            MDateTime.fromPartsOrThrow,
            MDateTime.setIsoYear(2024),
          ),
          'No 53rd week on iso year 2024 which is not a short year',
        );
      });
    });

    it('Passing', () => {
      const testDate = MDateTime.fromPartsOrThrow({
        year: 2024,
        month: 6,
        monthDay: 23,
        hour23: 17,
        minute: 43,
        second: 27,
        millisecond: 654,
        zoneOffset: 1,
      });
      TestUtils.assertSuccess(
        pipe(testDate, MDateTime.setYear(2019), Result.map(MDateTime.timestamp)),
        Date.UTC(2019, 5, 23, 16, 43, 27, 654),
      );
      TestUtils.assertSuccess(
        pipe(testDate, MDateTime.setMonth(1), Result.map(MDateTime.timestamp)),
        Date.UTC(2024, 0, 23, 16, 43, 27, 654),
      );
      TestUtils.assertSuccess(
        pipe(testDate, MDateTime.setMonthDay(4), Result.map(MDateTime.timestamp)),
        Date.UTC(2024, 5, 4, 16, 43, 27, 654),
      );
      TestUtils.assertSuccess(
        pipe(testDate, MDateTime.setOrdinalDay(4), Result.map(MDateTime.timestamp)),
        Date.UTC(2024, 0, 4, 16, 43, 27, 654),
      );
      TestUtils.assertSuccess(
        pipe(testDate, MDateTime.setIsoYear(2027), Result.map(MDateTime.timestamp)),
        Date.UTC(2027, 5, 27, 16, 43, 27, 654),
      );
      TestUtils.assertSuccess(
        pipe(testDate, MDateTime.setIsoWeek(4), Result.map(MDateTime.timestamp)),
        Date.UTC(2024, 0, 28, 16, 43, 27, 654),
      );
      TestUtils.assertSuccess(
        pipe(testDate, MDateTime.setWeekday(4), Result.map(MDateTime.timestamp)),
        Date.UTC(2024, 5, 20, 16, 43, 27, 654),
      );
      TestUtils.assertSuccess(
        pipe(testDate, MDateTime.setHour23(4), Result.map(MDateTime.timestamp)),
        Date.UTC(2024, 5, 23, 3, 43, 27, 654),
      );
      TestUtils.assertSuccess(
        pipe(testDate, MDateTime.setHour11(4), Result.map(MDateTime.timestamp)),
        Date.UTC(2024, 5, 23, 15, 43, 27, 654),
      );
      assert.strictEqual(
        pipe(testDate, MDateTime.setMeridiem(0), MDateTime.timestamp),
        Date.UTC(2024, 5, 23, 4, 43, 27, 654),
      );
      TestUtils.assertSuccess(
        pipe(testDate, MDateTime.setMinute(15), Result.map(MDateTime.timestamp)),
        Date.UTC(2024, 5, 23, 16, 15, 27, 654),
      );
      TestUtils.assertSuccess(
        pipe(testDate, MDateTime.setSecond(15), Result.map(MDateTime.timestamp)),
        Date.UTC(2024, 5, 23, 16, 43, 15, 654),
      );
      TestUtils.assertSuccess(
        pipe(testDate, MDateTime.setMillisecond(15), Result.map(MDateTime.timestamp)),
        Date.UTC(2024, 5, 23, 16, 43, 27, 15),
      );
    });

    it('From non leap year to non leap year', () => {
      TestUtils.assertSuccess(
        pipe(
          {
            year: 2023,
            month: 2,
            monthDay: 28,
            zoneOffset: 0,
          },
          MDateTime.fromPartsOrThrow,
          MDateTime.setYear(2019),
          Result.map(MDateTime.timestamp),
        ),
        Date.UTC(2019, 1, 28),
      );
      TestUtils.assertSuccess(
        pipe(
          {
            year: 2023,
            month: 3,
            monthDay: 1,
            zoneOffset: 0,
          },
          MDateTime.fromPartsOrThrow,
          MDateTime.setYear(2019),
          Result.map(MDateTime.timestamp),
        ),
        Date.UTC(2019, 2, 1),
      );
    });

    it('From non leap year to leap year', () => {
      TestUtils.assertSuccess(
        pipe(
          {
            year: 2023,
            month: 2,
            monthDay: 28,
            zoneOffset: 0,
          },
          MDateTime.fromPartsOrThrow,
          MDateTime.setYear(2024),
          Result.map(MDateTime.timestamp),
        ),
        Date.UTC(2024, 1, 28),
      );
      TestUtils.assertSuccess(
        pipe(
          {
            year: 2023,
            month: 3,
            monthDay: 1,
            zoneOffset: 0,
          },
          MDateTime.fromPartsOrThrow,
          MDateTime.setYear(2024),
          Result.map(MDateTime.timestamp),
        ),
        Date.UTC(2024, 2, 1),
      );
    });

    it('From leap year to non leap year', () => {
      TestUtils.assertSuccess(
        pipe(
          {
            year: 2024,
            month: 2,
            monthDay: 28,
            zoneOffset: 0,
          },
          MDateTime.fromPartsOrThrow,
          MDateTime.setYear(2023),
          Result.map(MDateTime.timestamp),
        ),
        Date.UTC(2023, 1, 28),
      );
      TestUtils.assertFailure(
        pipe(
          {
            year: 2024,
            month: 2,
            monthDay: 29,
            zoneOffset: 0,
          },
          MDateTime.fromPartsOrThrow,
          MDateTime.setYear(2023),
        ),
      );
      TestUtils.assertSuccess(
        pipe(
          {
            year: 2024,
            month: 3,
            monthDay: 1,
            zoneOffset: 0,
          },
          MDateTime.fromPartsOrThrow,
          MDateTime.setYear(2023),
          Result.map(MDateTime.timestamp),
        ),
        Date.UTC(2023, 2, 1),
      );
    });

    it('From leap year to leap year', () => {
      TestUtils.assertSuccess(
        pipe(
          {
            year: 2024,
            month: 2,
            monthDay: 28,
            zoneOffset: 0,
          },
          MDateTime.fromPartsOrThrow,
          MDateTime.setYear(2020),
          Result.map(MDateTime.timestamp),
        ),
        Date.UTC(2020, 1, 28),
      );
      TestUtils.assertSuccess(
        pipe(
          {
            year: 2024,
            month: 2,
            monthDay: 29,
            zoneOffset: 0,
          },
          MDateTime.fromPartsOrThrow,
          MDateTime.setYear(2020),
          Result.map(MDateTime.timestamp),
        ),
        Date.UTC(2020, 1, 29),
      );
      TestUtils.assertSuccess(
        pipe(
          {
            year: 2024,
            month: 3,
            monthDay: 1,
            zoneOffset: 0,
          },
          MDateTime.fromPartsOrThrow,
          MDateTime.setYear(2020),
          Result.map(MDateTime.timestamp),
        ),
        Date.UTC(2020, 2, 1),
      );
    });

    it('From isoDate to weekday with a setMonDay in between', () => {
      TestUtils.assertSuccess(
        pipe(
          {
            isoYear: 2027,
            isoWeek: 18,
            weekday: 2,
            zoneOffset: 0,
          },
          MDateTime.fromParts,
          Result.flatMap(MDateTime.setMonthDay(20)),
          Result.map(MDateTime.getWeekday),
        ),
        4,
      );
    });

    it('Change zoneOffset', () => {
      TestUtils.assertSuccess(
        pipe(
          {
            year: 2024,
            ordinalDay: 61,
            hour11: 7,
            meridiem: 0,
            zoneOffset: 1,
          },
          MDateTime.fromParts,
          Result.flatMap(MDateTime.setZoneOffsetKeepTimestamp(-8)),
          Result.map(MDateTime.getIsoString),
        ),
        '2024-02-29T22:00:00.000-08:00',
      );

      TestUtils.assertSuccess(
        pipe(
          {
            year: 2024,
            ordinalDay: 61,
            hour11: 7,
            meridiem: 0,
            zoneOffset: 1,
          },
          MDateTime.fromParts,
          Result.flatMap(MDateTime.setZoneOffsetKeepParts(-8)),
          Result.map(MDateTime.getIsoString),
        ),
        '2024-03-01T07:00:00.000-08:00',
      );
    });
  });

  describe('isFirstMonthDay', () => {
    it('Passing', () => {
      TestUtils.assertSuccess(
        pipe(feb29_2020, MDateTime.offsetDays(1), Result.map(MDateTime.isFirstMonthDay)),
        true,
      );
    });

    it('Not passing', () => {
      assert.isFalse(pipe(MDateTime.isFirstMonthDay(feb29_2020)));
    });
  });

  describe('isLastMonthDay', () => {
    it('Passing', () => {
      assert.isTrue(MDateTime.isLastMonthDay(feb29_2020));
    });

    it('Not passing', () => {
      TestUtils.assertSuccess(
        pipe(
          feb29_2020,
          MDateTime.setZoneOffsetKeepTimestamp(-1),
          Result.map(MDateTime.isLastMonthDay),
        ),
        false,
      );
    });
  });

  describe('isFirstYearDay', () => {
    it('Passing', () => {
      TestUtils.assertSuccess(
        pipe(feb29_2020, MDateTime.offsetDays(-59), Result.map(MDateTime.isFirstYearDay)),
        true,
      );
    });

    it('Not passing', () => {
      assert.isFalse(pipe(MDateTime.isFirstYearDay(feb29_2020)));
    });
  });

  describe('isLastYearDay', () => {
    it('Passing', () => {
      TestUtils.assertSuccess(
        pipe(feb29_2020, MDateTime.offsetDays(-60), Result.map(MDateTime.isLastYearDay)),
        true,
      );
    });

    it('Not passing', () => {
      assert.isFalse(pipe(MDateTime.isLastYearDay(feb29_2020)));
    });
  });

  describe('isFirstIsoYearDay', () => {
    it('Passing', () => {
      TestUtils.assertSuccess(
        pipe(feb29_2020, MDateTime.offsetDays(-61), Result.map(MDateTime.isFirstIsoYearDay)),
        true,
      );
    });

    it('Not passing', () => {
      assert.isFalse(pipe(MDateTime.isFirstIsoYearDay(feb29_2020)));
    });
  });

  describe('isLastIsoYearDay', () => {
    it('Passing', () => {
      TestUtils.assertSuccess(
        pipe(feb29_2020, MDateTime.offsetDays(-62), Result.map(MDateTime.isLastIsoYearDay)),
        true,
      );
    });

    it('Not passing', () => {
      assert.isFalse(pipe(MDateTime.isLastIsoYearDay(feb29_2020)));
    });
  });

  it('toFirstMonthDay', () => {
    assert.strictEqual(
      pipe(feb29_2020, MDateTime.toFirstMonthDay, MDateTime.timestamp),
      Date.UTC(2020, 1, 1),
    );
  });

  it('toLastMonthDay', () => {
    TestUtils.assertSuccess(
      pipe(feb29_2020, MDateTime.offsetDays(-10), Result.map(MDateTime.toLastMonthDay)),
      feb29_2020,
    );
  });

  it('toFirstYearDay', () => {
    assert.strictEqual(
      pipe(feb29_2020, MDateTime.toFirstYearDay, MDateTime.timestamp),
      Date.UTC(2020, 0, 1),
    );
  });

  it('toLastYearDay', () => {
    assert.strictEqual(
      pipe(feb29_2020, MDateTime.toLastYearDay, MDateTime.timestamp),
      Date.UTC(2020, 11, 31),
    );
  });

  it('toFirstIsoYearDay', () => {
    assert.strictEqual(
      pipe(feb29_2020, MDateTime.toFirstIsoYearDay, MDateTime.timestamp),
      Date.UTC(2019, 11, 30),
    );
  });

  it('toLastIsoYearWeek', () => {
    assert.strictEqual(
      pipe(feb29_2020, MDateTime.toLastIsoYearWeek, MDateTime.timestamp),
      Date.UTC(2021, 0, 2),
    );
  });

  it('toLastIsoYearDay', () => {
    assert.strictEqual(
      pipe(feb29_2020, MDateTime.toLastIsoYearDay, MDateTime.timestamp),
      Date.UTC(2021, 0, 3),
    );
  });

  it('offsetYears', () => {
    TestUtils.assertSuccess(
      pipe(feb29_2020, MDateTime.offsetYears(4, false), Result.map(MDateTime.timestamp)),
      Date.UTC(2024, 1, 29),
    );
  });

  describe('offsetMonths', () => {
    describe('Without respectMonthEnd', () => {
      it('Forward', () => {
        TestUtils.assertSuccess(
          pipe(feb29_2020, MDateTime.offsetMonths(48, false), Result.map(MDateTime.timestamp)),
          Date.UTC(2024, 1, 29),
        );
      });

      it('Backward', () => {
        TestUtils.assertSuccess(
          pipe(feb29_2020, MDateTime.offsetMonths(-192, false), Result.map(MDateTime.timestamp)),
          Date.UTC(2004, 1, 29),
        );
      });

      it('Not passing', () => {
        TestUtils.assertFailure(pipe(feb29_2020, MDateTime.offsetMonths(12, false)));
      });
    });

    describe('With respectMonthEnd', () => {
      it('Forward', () => {
        TestUtils.assertSuccess(
          pipe(feb29_2020, MDateTime.offsetMonths(1, true), Result.map(MDateTime.timestamp)),
          Date.UTC(2020, 2, 31),
        );
      });

      it('Backward', () => {
        TestUtils.assertSuccess(
          pipe(feb29_2020, MDateTime.offsetMonths(-2, true), Result.map(MDateTime.timestamp)),
          Date.UTC(2019, 11, 31),
        );
      });
    });
  });

  it('offsetDays', () => {
    TestUtils.assertSuccess(
      pipe(feb29_2020, MDateTime.offsetDays(-29), Result.map(MDateTime.timestamp)),
      Date.UTC(2020, 0, 31),
    );
  });

  describe('offsetIsoYears', () => {
    const jan3_2021 = MDateTime.fromTimestampOrThrow(Date.UTC(2021, 0, 3), 0);
    describe('Without respectYearEnd', () => {
      it('Forward', () => {
        TestUtils.assertSuccess(
          pipe(jan3_2021, MDateTime.offsetIsoYears(6, false), Result.map(MDateTime.timestamp)),
          Date.UTC(2027, 0, 3),
        );
      });

      it('Backward', () => {
        TestUtils.assertSuccess(
          pipe(jan3_2021, MDateTime.offsetIsoYears(-5, false), Result.map(MDateTime.timestamp)),
          Date.UTC(2016, 0, 3),
        );
      });

      it('Not passing', () => {
        TestUtils.assertFailure(pipe(jan3_2021, MDateTime.offsetIsoYears(1, false)));
      });
    });

    describe('With respectYearEnd', () => {
      it('Forward', () => {
        TestUtils.assertSuccess(
          pipe(jan3_2021, MDateTime.offsetIsoYears(1, true), Result.map(MDateTime.timestamp)),
          Date.UTC(2022, 0, 2),
        );
      });

      it('Backward', () => {
        TestUtils.assertSuccess(
          pipe(jan3_2021, MDateTime.offsetIsoYears(-1, true), Result.map(MDateTime.timestamp)),
          Date.UTC(2019, 11, 29),
        );
      });
    });
  });

  it('offsetHours', () => {
    TestUtils.assertSuccess(
      pipe(feb29_2020, MDateTime.offsetHours(48), Result.map(MDateTime.timestamp)),
      Date.UTC(2020, 2, 2),
    );
  });

  it('offsetMinutes', () => {
    TestUtils.assertSuccess(
      pipe(feb29_2020, MDateTime.offsetMinutes(-60), Result.map(MDateTime.timestamp)),
      Date.UTC(2020, 1, 28, 23),
    );
  });

  it('offsetSeconds', () => {
    TestUtils.assertSuccess(
      pipe(feb29_2020, MDateTime.offsetSeconds(-3600), Result.map(MDateTime.timestamp)),
      Date.UTC(2020, 1, 28, 23),
    );
  });

  it('offsetMilliseconds', () => {
    TestUtils.assertSuccess(
      pipe(feb29_2020, MDateTime.offsetMilliseconds(340), Result.map(MDateTime.timestamp)),
      Date.UTC(2020, 1, 29, 0, 0, 0, 340),
    );
  });

  describe('format and parse', () => {
    const { Token } = MDateTimeFormat;
    const enGBContext = MDateTimeContext.enGB;

    const isoFormat = MDateTimeFormat.make(
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
      ',',
      Token.SSS,
      Token.zHzH,
      ':',
      Token.zmzm,
    );

    const exhaustiveFormat = MDateTimeFormat.make(
      Token.y,
      ' ',
      Token.yy,
      Token.yyyy,
      Token.R,
      ' ',
      Token.RR,
      Token.RRRR,
      Token.M,
      ' ',
      Token.MM,
      Token.MMM,
      Token.MMMM,
      Token.I,
      ' ',
      Token.II,
      Token.d,
      ' ',
      Token.dd,
      Token.D,
      ' ',
      Token.DDD,
      Token.i,
      ' ',
      Token.iii,
      Token.iiii,
      Token.a,
      Token.H,
      ' ',
      Token.HH,
      Token.K,
      ' ',
      Token.KK,
      Token.m,
      ' ',
      Token.mm,
      Token.s,
      ' ',
      Token.ss,
      Token.S,
      ' ',
      Token.SSS,
      Token.zH,
      ' ',
      Token.zHzH,
      Token.zm,
      ' ',
      Token.zmzm,
      Token.zs,
      ' ',
      Token.zszs,
    );

    describe('format', () => {
      describe('isoFormat / enGB', () => {
        const format = MDateTime.format(isoFormat, enGBContext);

        it('Non-matching: rejects a 5-digit year for a 4-digit format', () => {
          TestUtils.assertFailureMessage(
            format(MDateTime.fromPartsOrThrow({ year: 10_024 })),
            'Expected length of #year to be: 4. Actual: 5',
          );
        });

        it('Matching: produces the correct ISO string', () => {
          TestUtils.assertSuccess(
            format(
              MDateTime.fromPartsOrThrow({ year: 2025, month: 8, monthDay: 13, zoneMinute: 42 }),
            ),
            '2025-08-13T00:00:00,000+00:42',
          );
        });
      });

      describe('Exhaustive format / enGB', () => {
        const format = MDateTime.format(exhaustiveFormat, enGBContext);

        it('Non-matching: rejects a year outside the 2-digit range', () => {
          TestUtils.assertFailureMessage(
            format(MDateTime.fromPartsOrThrow({ year: 1925, month: 2, monthDay: 28 })),
            'Expected #year to be between 2000 (included) and 2099 (included). Actual: 1925',
          );
        });

        it('Matching: produces the correct exhaustive string', () => {
          TestUtils.assertSuccess(
            format(
              MDateTime.fromPartsOrThrow({
                year: 2025,
                month: 2,
                monthDay: 28,
                minute: 54,
                zoneHour: -5,
              }),
            ),
            '2025 2520252025 2520252 02FebFebruary9 0928 2859 0595 FriFridayAM0 000 0054 540 000 000-5 -050 000 00',
          );
        });
      });
    });

    describe('formatOrThrow', () => {
      const formatOrThrow = MDateTime.formatOrThrow(isoFormat, enGBContext);

      it('Matching: returns a string directly', () => {
        assert.strictEqual(
          formatOrThrow(
            MDateTime.fromPartsOrThrow({ year: 2025, month: 1, monthDay: 1, zoneHour: 0 }),
          ),
          '2025-01-01T00:00:00,000+00:00',
        );
      });

      it('Non-matching: throws on invalid input', () => {
        TestUtils.throws(() => formatOrThrow(MDateTime.fromPartsOrThrow({ year: 10_024 })));
      });
    });

    describe('parse', () => {
      describe('isoFormat / enGB', () => {
        const parse = MDateTime.parse(isoFormat, enGBContext);

        it('Non-matching: rejects month 13', () => {
          TestUtils.assertFailureMessage(
            parse('2025-13-01T22:54:12,543+00:00'),
            "Expected 'month' to be between 1 (included) and 12 (included). Actual: 13",
          );
        });

        it('Matching: produces the correct UTC timestamp', () => {
          TestUtils.assertSuccess(
            pipe('2025-12-01T22:54:12,543-03:22', parse, Result.map(MDateTime.timestamp)),
            Date.UTC(2025, 11, 2, 2, 16, 12, 543),
          );
        });
      });

      describe('Exhaustive format / enGB', () => {
        const parse = MDateTime.parse(exhaustiveFormat, enGBContext);

        it('Non-matching: rejects invalid monthDay combination', () => {
          TestUtils.assertFailureMessage(
            parse(
              '2025 2520252026 26202612 12DecDecember1 0130 30364 3641 MonMondayPM13 131 015 0553 53234 234+1 +0112 125 05',
            ),
            "Expected 'monthDay' to be: 29. Actual: 30",
          );
        });

        it('Non-matching: rejects conflicting weekday values', () => {
          TestUtils.assertFailureMessage(
            parse(
              '2025 2520252026 26202612 12DecDecember1 0130 30364 3642 TueMondayPM13 131 015 0553 53234 234+1 +0112 125 05',
            ),
            "#weekday is present more than once in template and receives differing values '2' and '1'",
          );
        });

        it('Matching: produces the correct UTC timestamp', () => {
          TestUtils.assertSuccess(
            pipe(
              '2025 2520252026 26202612 12DecDecember1 0130 30364 3642 TueTuesdayPM13 131 015 0553 53234 234+1 +0112 125 05',
              parse,
              Result.map(MDateTime.timestamp),
            ),
            Date.UTC(2025, 11, 30, 11, 53, 48, 234),
          );
        });
      });
    });

    describe('parseOrThrow', () => {
      const parseOrThrow = MDateTime.parseOrThrow(isoFormat, enGBContext);

      it('Matching: returns a MDateTime directly', () => {
        assert.strictEqual(
          MDateTime.timestamp(parseOrThrow('2025-06-15T10:30:00,000+00:00')),
          Date.UTC(2025, 5, 15, 10, 30, 0, 0),
        );
      });

      it('Non-matching: throws on invalid input', () => {
        TestUtils.throws(() => parseOrThrow('not-a-date'));
      });
    });
  });
});
