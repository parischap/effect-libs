/* eslint-disable functional/no-expression-statements */
import { CVDateTime } from '@parischap/conversions';
import { MArray } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Array, Either, flow, Number, Option, pipe, Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('CVDateTime', () => {
	/** Produces a random integer between 0 included and range excluded */
	const intRandom = (range: number): number =>
		pipe(Math.random(), Number.multiply(range), Math.floor);

	const origin = CVDateTime.fromTimestampOrThrow(0, 0);
	const now = CVDateTime.now();
	const feb29_2020 = CVDateTime.fromTimestampOrThrow(Date.UTC(2020, 1, 29), 0);

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVDateTime.moduleTag);
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertEquals(origin, CVDateTime.fromTimestampOrThrow(0, 1));
			});

			it('Non-matching', () => {
				TEUtils.assertNotEquals(origin, now);
			});
		});

		it('.toString()', () => {
			TEUtils.strictEqual(origin.toString(), '1970-01-01T00:00:00.000+00:00');
			TEUtils.strictEqual(
				CVDateTime.fromTimestampOrThrow(1_749_823_231_774, -3.765).toString(),
				'2025-06-13T10:14:37.774-03:45'
			);
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(now.pipe(CVDateTime.has));
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(CVDateTime.has(now));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(CVDateTime.has(new Date()));
			});
		});
	});

	it('fromTimestamp, year, yearIsLeap, month, monthDay, ordinalDay', () => {
		const [actualVector, expectedVector] = pipe(
			Array.range(1771, 2170),
			Array.map((baseYear) => {
				const year = baseYear + (intRandom(8) - 4) * 400;
				const startTimestamp = Date.UTC(year);
				const startDate = CVDateTime.fromTimestampOrThrow(startTimestamp, 0);
				const yearDuration = Date.UTC(year + 1) - startTimestamp;
				const yearIsLeap = Math.floor(yearDuration / CVDateTime.DAY_MS) === 366;
				const randomDuration = intRandom(yearDuration);
				const randomTimestamp = startTimestamp + randomDuration;
				const randomDate = CVDateTime.fromTimestampOrThrow(randomTimestamp, 0);
				const expectedRandomDate = new Date(randomTimestamp);
				const endTimestamp = startTimestamp + yearDuration - 1;
				const endDate = CVDateTime.fromTimestampOrThrow(endTimestamp, 0);

				return Array.make(
					Tuple.make(
						{
							startInput: startTimestamp,
							year: CVDateTime.getYear(startDate),
							yearIsLeap: CVDateTime.yearIsLeap(startDate),
							month: CVDateTime.getMonth(startDate),
							monthDay: CVDateTime.getMonthDay(startDate),
							ordinalDay: CVDateTime.getOrdinalDay(startDate)
						},
						{
							startInput: startTimestamp,
							year,
							yearIsLeap,
							month: 1,
							monthDay: 1,
							ordinalDay: 1
						}
					),
					Tuple.make(
						{
							randomInput: randomTimestamp,
							year: CVDateTime.getYear(randomDate),
							yearIsLeap: CVDateTime.yearIsLeap(randomDate),
							month: CVDateTime.getMonth(randomDate),
							monthDay: CVDateTime.getMonthDay(randomDate),
							ordinalDay: CVDateTime.getOrdinalDay(randomDate)
						},
						{
							randomInput: randomTimestamp,
							year,
							yearIsLeap: yearIsLeap,
							month: expectedRandomDate.getUTCMonth() + 1,
							monthDay: expectedRandomDate.getUTCDate(),
							ordinalDay: Math.floor(randomDuration / CVDateTime.DAY_MS) + 1
						}
					),
					Tuple.make(
						{
							endInput: endTimestamp,
							year: CVDateTime.getYear(endDate),
							yearIsLeap: CVDateTime.yearIsLeap(endDate),
							month: CVDateTime.getMonth(endDate),
							monthDay: CVDateTime.getMonthDay(endDate),
							ordinalDay: CVDateTime.getOrdinalDay(endDate)
						},
						{
							endInput: endTimestamp,
							year,
							yearIsLeap: yearIsLeap,
							month: 12,
							monthDay: 31,
							ordinalDay: yearIsLeap ? 366 : 365
						}
					)
				);
			}),
			Array.flatten,
			Array.unzip
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

		TEUtils.assertEquals(actualVector, expectedVector);
		/*
		const date = CVDateTime.fromTimestampOrThrow(31620067199999, 0)
		TEUtils.assertEquals({
							year: CVDateTime.year(date),
							yearIsLeap: CVDateTime.yearIsLeap(date),
							month: CVDateTime.month(date),
							monthDay: CVDateTime.monthDay(date),
							ordinalDay: CVDateTime.ordinalDay(date)
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
				const startDate = CVDateTime.fromTimestampOrThrow(startTimestamp, 0);

				const tentativeEndTimestamp = startTimestamp + CVDateTime.SHORT_YEAR_MS - 1;
				const tentativeEndMonthDay = new Date(tentativeEndTimestamp).getUTCDate();
				const isoYearIsLong = tentativeEndMonthDay >= 21 && tentativeEndMonthDay < 28;
				const endTimestamp = tentativeEndTimestamp + (isoYearIsLong ? CVDateTime.WEEK_MS : 0);
				const endDate = CVDateTime.fromTimestampOrThrow(endTimestamp, 0);
				const yearDurationInWeeks = isoYearIsLong ? 53 : 52;
				const yearDurationMs = endTimestamp - startTimestamp + 1;

				const isoWeekIndex = intRandom(yearDurationInWeeks);
				const weekdayIndex = intRandom(6);
				const randomTimestamp =
					startTimestamp + isoWeekIndex * CVDateTime.WEEK_MS + weekdayIndex * CVDateTime.DAY_MS;
				const randomDate = CVDateTime.fromTimestampOrThrow(randomTimestamp, 0);

				return Tuple.make(
					Array.make(
						Tuple.make(
							{
								startInput: startTimestamp,
								isoYear: CVDateTime.getIsoYear(startDate),
								isoYearIsLong: CVDateTime.isoYearIsLong(startDate),
								isoWeek: CVDateTime.getIsoWeek(startDate),
								weekday: CVDateTime.getWeekday(startDate)
							},
							{
								startInput: startTimestamp,
								isoYear: year,
								isoYearIsLong,
								isoWeek: 1,
								weekday: 1
							}
						),
						Tuple.make(
							{
								randomInput: randomTimestamp,
								isoYear: CVDateTime.getIsoYear(randomDate),
								isoYearIsLong: CVDateTime.isoYearIsLong(randomDate),
								isoWeek: CVDateTime.getIsoWeek(randomDate),
								weekday: CVDateTime.getWeekday(randomDate)
							},
							{
								randomInput: randomTimestamp,
								isoYear: year,
								isoYearIsLong,
								isoWeek: isoWeekIndex + 1,
								weekday: weekdayIndex + 1
							}
						),
						Tuple.make(
							{
								endInput: endTimestamp,
								isoYear: CVDateTime.getIsoYear(endDate),
								isoYearIsLong: CVDateTime.isoYearIsLong(endDate),
								isoWeek: CVDateTime.getIsoWeek(endDate),
								weekday: CVDateTime.getWeekday(endDate)
							},
							{
								endInput: endTimestamp,
								isoYear: year,
								isoYearIsLong,
								isoWeek: yearDurationInWeeks,
								weekday: 7
							}
						)
					),
					pipe(
						baseYear + 1,
						Option.liftPredicate(Number.lessThanOrEqualTo(2170)),
						Option.map(
							flow(Tuple.make, Tuple.appendElement(baseYearStartTimestamp + yearDurationMs))
						)
					)
				);
			}),
			Array.flatten,
			Array.unzip
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

		TEUtils.assertEquals(actualVector, expectedVector);

		/*const date = CVDateTime.fromTimestampOrThrow(-6216393600000, 0);
		TEUtils.assertEquals(
			{
				isoYearDescriptor: CVDateTime.isoYearDescriptor(date),
				isoYearIsLong: CVDateTime.isoYearIsLong(date),
				isoWeek: CVDateTime.isoWeek(date),
				weekday: CVDateTime.weekday(date)
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
			TEUtils.assertLeftMessage(
				CVDateTime.fromParts({}),
				"One of 'year' and 'isoYear' must be be set"
			);
		});

		it('From date with hour23 and zoneOffset', () => {
			const either = CVDateTime.fromParts({
				year: 2024,
				ordinalDay: 61,
				hour23: 17,
				minute: 43,
				second: 27,
				millisecond: 654,
				zoneOffset: 1
			});

			TEUtils.assertRight(either);
			const testDate = either.right;
			TEUtils.strictEqual(CVDateTime.timestamp(testDate), Date.UTC(2024, 2, 1, 16, 43, 27, 654));
			TEUtils.assertSome(testDate.gregorianDate);
			TEUtils.assertNone(testDate.isoDate);
			TEUtils.assertSome(testDate.time);
		});

		describe('From date with hour23 and zoneHour, zoneMinute, zoneSecond', () => {
			it('Positive offset', () => {
				TEUtils.assertRight(
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
							zoneSecond: 30
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2024, 2, 1, 16, 30, 57, 654)
				);
			});

			it('Negative offset, zoneHour !== 0', () => {
				TEUtils.assertRight(
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
							zoneSecond: 30
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2024, 2, 1, 18, 55, 57, 654)
				);
			});

			it('Negative offset, zoneHour=0', () => {
				TEUtils.assertRight(
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
							zoneSecond: 30
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2024, 2, 1, 17, 55, 57, 654)
				);
			});
		});

		it('From date with hour23 and zoneOffset, zoneHour, zoneMinute, zoneSecond', () => {
			TEUtils.assertRight(
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
						zoneSecond: 54
					},
					CVDateTime.fromParts,
					Either.map(CVDateTime.timestamp)
				),
				Date.UTC(2024, 2, 1, 16, 30, 33, 654)
			);
		});

		it('From date with hour11 and meridiem', () => {
			TEUtils.assertRight(
				pipe(
					{
						year: 2024,
						ordinalDay: 61,
						meridiem: 12,
						hour11: 5,
						minute: 43,
						second: 27,
						millisecond: 654,
						zoneOffset: -1
					},
					CVDateTime.fromParts,
					Either.map(CVDateTime.timestamp)
				),
				Date.UTC(2024, 2, 1, 18, 43, 27, 654)
			);
		});

		it('From isodate', () => {
			const either = CVDateTime.fromParts({
				isoYear: 2027,
				isoWeek: 52,
				weekday: 6,
				meridiem: 12,
				hour11: 5,
				minute: 43,
				second: 27,
				millisecond: 654,
				zoneOffset: 0
			});

			TEUtils.assertRight(either);
			const testDate = either.right;
			TEUtils.strictEqual(CVDateTime.timestamp(testDate), Date.UTC(2028, 0, 1, 17, 43, 27, 654));
			TEUtils.assertNone(testDate.gregorianDate);
			TEUtils.assertSome(testDate.isoDate);
			TEUtils.assertSome(testDate.time);
		});

		describe('Default values', () => {
			it('Only year is set', () => {
				const either = CVDateTime.fromParts({
					year: 2025,
					zoneOffset: 0
				});

				TEUtils.assertRight(either);
				const testDate = either.right;
				TEUtils.strictEqual(CVDateTime.timestamp(testDate), Date.UTC(2025, 0, 1));
				TEUtils.assertSome(testDate.gregorianDate);
				TEUtils.assertNone(testDate.isoDate);
				TEUtils.assertNone(testDate.time);
			});

			it('year and month are set', () => {
				TEUtils.assertRight(
					pipe(
						{
							year: 2025,
							month: 5,
							zoneOffset: 0
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2025, 4, 1)
				);
			});
			it('year and monthDay are set', () => {
				TEUtils.assertRight(
					pipe(
						{
							year: 2025,
							monthDay: 5,
							zoneOffset: 0
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2025, 0, 5)
				);
			});
			it('Only isoYear is set', () => {
				TEUtils.assertRight(
					pipe(
						{
							isoYear: 2025,
							zoneOffset: 0
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2024, 11, 30)
				);
			});
			it('isoYear and isoWeek are set', () => {
				TEUtils.assertRight(
					pipe(
						{
							isoYear: 2025,
							isoWeek: 5,
							zoneOffset: 0
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2025, 0, 27)
				);
			});
			it('isoYear and weekday are set', () => {
				TEUtils.assertRight(
					pipe(
						{
							isoYear: 2025,
							weekday: 5,
							zoneOffset: 0
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2025, 0, 3)
				);
			});
			it('A day is set and isoYear is passed', () => {
				const either = CVDateTime.fromParts({
					year: 2024,
					ordinalDay: 365,
					isoYear: 2025,
					zoneOffset: 0
				});
				TEUtils.assertRight(either);
				const testDate = either.right;
				TEUtils.strictEqual(CVDateTime.timestamp(testDate), Date.UTC(2024, 11, 30));
				TEUtils.assertSome(testDate.gregorianDate);
				TEUtils.assertSome(testDate.isoDate);
				TEUtils.assertNone(testDate.time);
			});

			it('An isoDay is set and year is passed', () => {
				const either = CVDateTime.fromParts({
					year: 2025,
					isoYear: 2025,
					isoWeek: 3,
					weekday: 4,
					zoneOffset: 0
				});
				TEUtils.assertRight(either);
				const testDate = either.right;
				TEUtils.strictEqual(CVDateTime.timestamp(testDate), Date.UTC(2025, 0, 16));
				TEUtils.assertSome(testDate.gregorianDate);
				TEUtils.assertSome(testDate.isoDate);
				TEUtils.assertNone(testDate.time);
			});

			it('Only meridiem is set', () => {
				TEUtils.assertRight(
					pipe(
						{
							year: 2024,
							ordinalDay: 75,
							meridiem: 12,
							zoneOffset: 2
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2024, 2, 15, 10)
				);
			});

			it('Only hour11 is set', () => {
				TEUtils.assertRight(
					pipe(
						{
							year: 2024,
							ordinalDay: 75,
							hour11: 5,
							zoneOffset: 0
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2024, 2, 15, 5)
				);
			});

			it('Only zoneMinute is set', () => {
				TEUtils.assertRight(
					pipe(
						{
							year: 2024,
							ordinalDay: 61,
							hour23: 17,
							minute: 43,
							second: 27,
							millisecond: 654,
							zoneMinute: 5
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2024, 2, 1, 17, 38, 27, 654)
				);
			});
		});

		describe('Out of range data', () => {
			it('zoneOffset', () => {
				TEUtils.assertLeftMessage(
					pipe({ year: 2025, zoneOffset: 15 }, CVDateTime.fromParts),
					"Expected 'zoneOffset' to be between -13 (excluded) and 15 (excluded). Actual: 15"
				);
			});

			it('zoneHour', () => {
				TEUtils.assertLeftMessage(
					pipe({ year: 2025, zoneHour: 15 }, CVDateTime.fromParts),
					"Expected 'zoneHour' to be between -12 (included) and 14 (included). Actual: 15"
				);
			});

			it('zoneMinute', () => {
				TEUtils.assertLeftMessage(
					pipe({ year: 2025, zoneMinute: 63 }, CVDateTime.fromParts),
					"Expected 'zoneMinute' to be between 0 (included) and 59 (included). Actual: 63"
				);
			});

			it('zoneSecond', () => {
				TEUtils.assertLeftMessage(
					pipe({ year: 2025, zoneSecond: -5 }, CVDateTime.fromParts),
					"Expected 'zoneSecond' to be between 0 (included) and 59 (included). Actual: -5"
				);
			});

			it('month', () => {
				TEUtils.assertLeftMessage(
					pipe({ year: 2025, month: 0 }, CVDateTime.fromParts),
					"Expected 'month' to be between 1 (included) and 12 (included). Actual: 0"
				);
			});

			it('monthDay', () => {
				TEUtils.assertLeftMessage(
					pipe({ year: 2025, month: 2, monthDay: 32 }, CVDateTime.fromParts),
					"Expected 'monthDay' to be between 1 (included) and 28 (included). Actual: 32"
				);
			});

			it('ordinalDay', () => {
				TEUtils.assertLeftMessage(
					pipe({ year: 2024, ordinalDay: 412 }, CVDateTime.fromParts),
					"Expected 'ordinalDay' to be between 1 (included) and 366 (included). Actual: 412"
				);
			});

			it('isoWeek', () => {
				TEUtils.assertLeftMessage(
					pipe({ isoYear: 2027, isoWeek: 53 }, CVDateTime.fromParts),
					"Expected 'isoWeek' to be between 1 (included) and 52 (included). Actual: 53"
				);
			});

			it('weekDay', () => {
				TEUtils.assertLeftMessage(
					pipe({ isoYear: 2027, weekday: 0 }, CVDateTime.fromParts),
					"Expected 'weekday' to be between 1 (included) and 7 (included). Actual: 0"
				);
			});

			it('hour23', () => {
				TEUtils.assertLeftMessage(
					pipe({ year: 2024, hour23: 24 }, CVDateTime.fromParts),
					"Expected 'hour23' to be between 0 (included) and 23 (included). Actual: 24"
				);
			});

			it('hour11', () => {
				TEUtils.assertLeftMessage(
					pipe({ year: 2024, meridiem: 0, hour11: -4 }, CVDateTime.fromParts),
					"Expected 'hour11' to be between 0 (included) and 11 (included). Actual: -4"
				);
			});

			it('minute', () => {
				TEUtils.assertLeftMessage(
					pipe({ year: 2024, minute: 60 }, CVDateTime.fromParts),
					"Expected 'minute' to be between 0 (included) and 59 (included). Actual: 60"
				);
			});

			it('second', () => {
				TEUtils.assertLeftMessage(
					pipe({ year: 2024, second: 67 }, CVDateTime.fromParts),
					"Expected 'second' to be between 0 (included) and 59 (included). Actual: 67"
				);
			});

			it('millisecond', () => {
				TEUtils.assertLeftMessage(
					pipe({ year: 2024, millisecond: 1023 }, CVDateTime.fromParts),
					"Expected 'millisecond' to be between 0 (included) and 999 (included). Actual: 1023"
				);
			});
		});
		it('Incoherent parts', () => {
			TEUtils.assertLeftMessage(
				pipe(
					{
						year: 2024,
						hour23: 5,
						meridiem: 12,
						zoneOffset: 0
					},
					CVDateTime.fromParts
				),
				"Expected 'meridiem' to be: 0. Actual: 12"
			);
			TEUtils.assertLeftMessage(
				pipe(
					{
						year: 2024,
						hour23: 5,
						meridiem: 0,
						hour11: 4,
						zoneOffset: 0
					},
					CVDateTime.fromParts
				),
				"Expected 'hour11' to be: 5. Actual: 4"
			);
			TEUtils.assertLeftMessage(
				pipe(
					{
						year: 2024,
						ordinalDay: 61,
						month: 2,
						zoneOffset: 0
					},
					CVDateTime.fromParts
				),
				"Expected 'month' to be: 3. Actual: 2"
			);
			TEUtils.assertLeftMessage(
				pipe(
					{
						year: 2024,
						ordinalDay: 61,
						monthDay: 2,
						zoneOffset: 0
					},
					CVDateTime.fromParts
				),
				"Expected 'monthDay' to be: 1. Actual: 2"
			);
			TEUtils.assertLeftMessage(
				pipe(
					{
						year: 2024,
						ordinalDay: 61,
						isoWeek: 12,
						zoneOffset: 0
					},
					CVDateTime.fromParts
				),
				"Expected 'isoWeek' to be: 9. Actual: 12"
			);
			TEUtils.assertLeftMessage(
				pipe(
					{
						year: 2024,
						ordinalDay: 61,
						weekday: 17,
						zoneOffset: 0
					},
					CVDateTime.fromParts
				),
				"Expected 'weekday' to be: 5. Actual: 17"
			);
			TEUtils.assertLeftMessage(
				pipe(
					{
						year: 2024,
						month: 3,
						monthDay: 1,
						weekday: 17,
						zoneOffset: 0
					},
					CVDateTime.fromParts
				),
				"Expected 'weekday' to be: 5. Actual: 17"
			);
			TEUtils.assertLeftMessage(
				pipe(
					{
						year: 2024,
						month: 12,
						monthDay: 30,
						isoYear: 2024,
						zoneOffset: 0
					},
					CVDateTime.fromParts
				),
				"Expected 'isoYear' to be: 2025. Actual: 2024"
			);
			TEUtils.assertLeftMessage(
				pipe(
					{
						isoYear: 2027,
						isoWeek: 52,
						weekday: 6,
						year: 2027,
						zoneOffset: 0
					},
					CVDateTime.fromParts
				),
				"Expected 'year' to be: 2028. Actual: 2027"
			);
			TEUtils.assertLeftMessage(
				pipe(
					{
						isoYear: 2027,
						isoWeek: 52,
						weekday: 6,
						month: 12,
						zoneOffset: 0
					},
					CVDateTime.fromParts
				),
				"Expected 'month' to be: 1. Actual: 12"
			);
			TEUtils.assertLeftMessage(
				pipe(
					{
						isoYear: 2027,
						isoWeek: 52,
						weekday: 6,
						monthDay: 5,
						zoneOffset: 0
					},
					CVDateTime.fromParts
				),
				"Expected 'monthDay' to be: 1. Actual: 5"
			);
			TEUtils.assertLeftMessage(
				pipe(
					{
						isoYear: 2027,
						isoWeek: 52,
						weekday: 6,
						ordinalDay: 5,
						zoneOffset: 0
					},
					CVDateTime.fromParts
				),
				"Expected 'ordinalDay' to be: 1. Actual: 5"
			);
			TEUtils.assertLeftMessage(
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
						zoneSecond: 53
					},
					CVDateTime.fromParts
				),
				"Expected 'zoneSecond' to be: 54. Actual: 53"
			);
		});
	});

	describe('Getters', () => {
		it('Get year, month, monthDay then all time parts', () => {
			const testDate = CVDateTime.fromTimestampOrThrow(1750670080496, 0);

			TEUtils.assertNone(testDate.gregorianDate);
			TEUtils.assertNone(testDate.isoDate);
			TEUtils.assertNone(testDate.time);

			TEUtils.strictEqual(CVDateTime.getYear(testDate), 2025);
			TEUtils.assertSome(testDate.gregorianDate);
			TEUtils.assertNone(testDate.isoDate);
			TEUtils.assertNone(testDate.time);

			TEUtils.strictEqual(CVDateTime.getMonth(testDate), 6);
			TEUtils.assertSome(testDate.gregorianDate);
			TEUtils.assertNone(testDate.isoDate);
			TEUtils.assertNone(testDate.time);

			TEUtils.strictEqual(CVDateTime.getMonthDay(testDate), 23);
			TEUtils.strictEqual(CVDateTime.getHour23(testDate), 9);
			TEUtils.assertSome(testDate.gregorianDate);
			TEUtils.assertNone(testDate.isoDate);
			TEUtils.assertSome(testDate.time);

			TEUtils.strictEqual(CVDateTime.getMinute(testDate), 14);
			TEUtils.strictEqual(CVDateTime.getSecond(testDate), 40);
			TEUtils.strictEqual(CVDateTime.getMillisecond(testDate), 496);
		});

		it('Get seconds then monthDay', () => {
			const testDate = CVDateTime.fromTimestampOrThrow(1750670080496, 0);
			TEUtils.strictEqual(CVDateTime.getSecond(testDate), 40);
			TEUtils.assertNone(testDate.gregorianDate);
			TEUtils.assertNone(testDate.isoDate);
			TEUtils.assertSome(testDate.time);

			TEUtils.strictEqual(CVDateTime.getMonthDay(testDate), 23);
			TEUtils.assertSome(testDate.gregorianDate);
			TEUtils.assertNone(testDate.isoDate);
			TEUtils.assertSome(testDate.time);

			TEUtils.strictEqual(CVDateTime.getHour23(testDate), 9);
			TEUtils.assertSome(testDate.gregorianDate);
			TEUtils.assertNone(testDate.isoDate);
			TEUtils.assertSome(testDate.time);
		});

		it('Get isoYear, isoWeek, weekday and milliseconds', () => {
			const testDate = CVDateTime.fromTimestampOrThrow(1750670080496, 0);
			TEUtils.strictEqual(CVDateTime.getIsoYear(testDate), 2025);
			TEUtils.assertNone(testDate.gregorianDate);
			TEUtils.assertSome(testDate.isoDate);
			TEUtils.assertNone(testDate.time);

			TEUtils.strictEqual(CVDateTime.getIsoWeek(testDate), 26);
			TEUtils.assertNone(testDate.gregorianDate);
			TEUtils.assertSome(testDate.isoDate);
			TEUtils.assertNone(testDate.time);

			TEUtils.strictEqual(CVDateTime.getWeekday(testDate), 1);
			TEUtils.strictEqual(CVDateTime.getMillisecond(testDate), 496);
			TEUtils.assertNone(testDate.gregorianDate);
			TEUtils.assertSome(testDate.isoDate);
			TEUtils.assertSome(testDate.time);
		});

		it('Get minutes, isoYear, weekday, year and monthDay', () => {
			const testDate = CVDateTime.fromTimestampOrThrow(1750670080496, 0);
			TEUtils.strictEqual(CVDateTime.getMinute(testDate), 14);
			TEUtils.assertNone(testDate.gregorianDate);
			TEUtils.assertNone(testDate.isoDate);
			TEUtils.assertSome(testDate.time);

			TEUtils.strictEqual(CVDateTime.getIsoYear(testDate), 2025);
			TEUtils.assertNone(testDate.gregorianDate);
			TEUtils.assertSome(testDate.isoDate);
			TEUtils.assertSome(testDate.time);

			TEUtils.strictEqual(CVDateTime.getWeekday(testDate), 1);
			TEUtils.assertNone(testDate.gregorianDate);
			TEUtils.assertSome(testDate.isoDate);
			TEUtils.assertSome(testDate.time);

			TEUtils.strictEqual(CVDateTime.getYear(testDate), 2025);
			TEUtils.assertSome(testDate.gregorianDate);
			TEUtils.assertSome(testDate.isoDate);
			TEUtils.assertSome(testDate.time);

			TEUtils.strictEqual(CVDateTime.getMonthDay(testDate), 23);
			TEUtils.assertSome(testDate.gregorianDate);
			TEUtils.assertSome(testDate.isoDate);
			TEUtils.assertSome(testDate.time);
		});

		describe('Get year, isoYear, isoWeek, weekday', () => {
			describe('isoYear and year are equal', () => {
				it('Start of year', () => {
					const testDate = CVDateTime.fromPartsOrThrow({
						year: 2022,
						month: 1,
						monthDay: 3,
						zoneOffset: 0
					});
					TEUtils.strictEqual(CVDateTime.getYear(testDate), 2022);
					TEUtils.strictEqual(CVDateTime.getIsoYear(testDate), 2022);
					TEUtils.strictEqual(CVDateTime.getIsoWeek(testDate), 1);
					TEUtils.strictEqual(CVDateTime.getWeekday(testDate), 1);
				});

				it('End of year', () => {
					const testDate = CVDateTime.fromPartsOrThrow({
						year: 2025,
						month: 12,
						monthDay: 28,
						zoneOffset: 0
					});
					TEUtils.strictEqual(CVDateTime.getYear(testDate), 2025);
					TEUtils.strictEqual(CVDateTime.getIsoYear(testDate), 2025);
					TEUtils.strictEqual(CVDateTime.getIsoWeek(testDate), 52);
					TEUtils.strictEqual(CVDateTime.getWeekday(testDate), 7);
				});
			});

			it('isoYear is year -1', () => {
				const testDate = CVDateTime.fromPartsOrThrow({
					year: 2022,
					month: 1,
					monthDay: 2,
					zoneOffset: 0
				});
				TEUtils.strictEqual(CVDateTime.getYear(testDate), 2022);
				TEUtils.strictEqual(CVDateTime.getIsoYear(testDate), 2021);
				TEUtils.strictEqual(CVDateTime.getIsoWeek(testDate), 52);
				TEUtils.strictEqual(CVDateTime.getWeekday(testDate), 7);
			});

			it('isoYear is year + 1', () => {
				const testDate = CVDateTime.fromPartsOrThrow({
					year: 2025,
					month: 12,
					monthDay: 29,
					zoneOffset: 0
				});
				TEUtils.strictEqual(CVDateTime.getYear(testDate), 2025);
				TEUtils.strictEqual(CVDateTime.getIsoYear(testDate), 2026);
				TEUtils.strictEqual(CVDateTime.getIsoWeek(testDate), 1);
				TEUtils.strictEqual(CVDateTime.getWeekday(testDate), 1);
			});
		});
	});

	describe('Setters', () => {
		describe('Not passing', () => {
			it('No February,29th in 2021', () => {
				TEUtils.assertLeftMessage(
					pipe(feb29_2020, CVDateTime.setYear(2021)),
					'No February 29th on year 2021 which is not a leap year'
				);
			});
			it('No june, 31st', () => {
				TEUtils.assertLeftMessage(
					pipe(
						{
							isoYear: 2027,
							isoWeek: 22,
							weekday: 1,
							zoneOffset: 0
						},
						CVDateTime.fromPartsOrThrow,
						CVDateTime.setMonth(6)
					),
					'Month 6 of year 2027 does not have 31 days'
				);
			});

			it('No 53rd week in 2024', () => {
				TEUtils.assertLeftMessage(
					pipe(
						{
							year: 2026,
							month: 12,
							monthDay: 29,
							zoneOffset: 0
						},
						CVDateTime.fromPartsOrThrow,
						CVDateTime.setIsoYear(2024)
					),
					'No 53rd week on iso year 2024 which is not a short year'
				);
			});
		});

		it('Passing', () => {
			const testDate = CVDateTime.fromPartsOrThrow({
				year: 2024,
				month: 6,
				monthDay: 23,
				hour23: 17,
				minute: 43,
				second: 27,
				millisecond: 654,
				zoneOffset: 1
			});
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setYear(2019), Either.map(CVDateTime.timestamp)),
				Date.UTC(2019, 5, 23, 16, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setMonth(1), Either.map(CVDateTime.timestamp)),
				Date.UTC(2024, 0, 23, 16, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setMonthDay(4), Either.map(CVDateTime.timestamp)),
				Date.UTC(2024, 5, 4, 16, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setOrdinalDay(4), Either.map(CVDateTime.timestamp)),
				Date.UTC(2024, 0, 4, 16, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setIsoYear(2027), Either.map(CVDateTime.timestamp)),
				Date.UTC(2027, 5, 27, 16, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setIsoWeek(4), Either.map(CVDateTime.timestamp)),
				Date.UTC(2024, 0, 28, 16, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setWeekday(4), Either.map(CVDateTime.timestamp)),
				Date.UTC(2024, 5, 20, 16, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setHour23(4), Either.map(CVDateTime.timestamp)),
				Date.UTC(2024, 5, 23, 3, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setHour11(4), Either.map(CVDateTime.timestamp)),
				Date.UTC(2024, 5, 23, 15, 43, 27, 654)
			);
			TEUtils.strictEqual(
				pipe(testDate, CVDateTime.setMeridiem(0), CVDateTime.timestamp),
				Date.UTC(2024, 5, 23, 4, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setMinute(15), Either.map(CVDateTime.timestamp)),
				Date.UTC(2024, 5, 23, 16, 15, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setSecond(15), Either.map(CVDateTime.timestamp)),
				Date.UTC(2024, 5, 23, 16, 43, 15, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setMillisecond(15), Either.map(CVDateTime.timestamp)),
				Date.UTC(2024, 5, 23, 16, 43, 27, 15)
			);
		});

		it('From non leap year to non leap year', () => {
			TEUtils.assertRight(
				pipe(
					{
						year: 2023,
						month: 2,
						monthDay: 28,
						zoneOffset: 0
					},
					CVDateTime.fromPartsOrThrow,
					CVDateTime.setYear(2019),
					Either.map(CVDateTime.timestamp)
				),
				Date.UTC(2019, 1, 28)
			);
			TEUtils.assertRight(
				pipe(
					{
						year: 2023,
						month: 3,
						monthDay: 1,
						zoneOffset: 0
					},
					CVDateTime.fromPartsOrThrow,
					CVDateTime.setYear(2019),
					Either.map(CVDateTime.timestamp)
				),
				Date.UTC(2019, 2, 1)
			);
		});

		it('From non leap year to leap year', () => {
			TEUtils.assertRight(
				pipe(
					{
						year: 2023,
						month: 2,
						monthDay: 28,
						zoneOffset: 0
					},
					CVDateTime.fromPartsOrThrow,
					CVDateTime.setYear(2024),
					Either.map(CVDateTime.timestamp)
				),
				Date.UTC(2024, 1, 28)
			);
			TEUtils.assertRight(
				pipe(
					{
						year: 2023,
						month: 3,
						monthDay: 1,
						zoneOffset: 0
					},
					CVDateTime.fromPartsOrThrow,
					CVDateTime.setYear(2024),
					Either.map(CVDateTime.timestamp)
				),
				Date.UTC(2024, 2, 1)
			);
		});

		it('From leap year to non leap year', () => {
			TEUtils.assertRight(
				pipe(
					{
						year: 2024,
						month: 2,
						monthDay: 28,
						zoneOffset: 0
					},
					CVDateTime.fromPartsOrThrow,
					CVDateTime.setYear(2023),
					Either.map(CVDateTime.timestamp)
				),
				Date.UTC(2023, 1, 28)
			);
			TEUtils.assertLeft(
				pipe(
					{
						year: 2024,
						month: 2,
						monthDay: 29,
						zoneOffset: 0
					},
					CVDateTime.fromPartsOrThrow,
					CVDateTime.setYear(2023)
				)
			);
			TEUtils.assertRight(
				pipe(
					{
						year: 2024,
						month: 3,
						monthDay: 1,
						zoneOffset: 0
					},
					CVDateTime.fromPartsOrThrow,
					CVDateTime.setYear(2023),
					Either.map(CVDateTime.timestamp)
				),
				Date.UTC(2023, 2, 1)
			);
		});

		it('From leap year to leap year', () => {
			TEUtils.assertRight(
				pipe(
					{
						year: 2024,
						month: 2,
						monthDay: 28,
						zoneOffset: 0
					},
					CVDateTime.fromPartsOrThrow,
					CVDateTime.setYear(2020),
					Either.map(CVDateTime.timestamp)
				),
				Date.UTC(2020, 1, 28)
			);
			TEUtils.assertRight(
				pipe(
					{
						year: 2024,
						month: 2,
						monthDay: 29,
						zoneOffset: 0
					},
					CVDateTime.fromPartsOrThrow,
					CVDateTime.setYear(2020),
					Either.map(CVDateTime.timestamp)
				),
				Date.UTC(2020, 1, 29)
			);
			TEUtils.assertRight(
				pipe(
					{
						year: 2024,
						month: 3,
						monthDay: 1,
						zoneOffset: 0
					},
					CVDateTime.fromPartsOrThrow,
					CVDateTime.setYear(2020),
					Either.map(CVDateTime.timestamp)
				),
				Date.UTC(2020, 2, 1)
			);
		});

		it('From isoDate to weekday with a setMonDay in between', () => {
			TEUtils.assertRight(
				pipe(
					{
						isoYear: 2027,
						isoWeek: 18,
						weekday: 2,
						zoneOffset: 0
					},
					CVDateTime.fromParts,
					Either.flatMap(CVDateTime.setMonthDay(20)),
					Either.map(CVDateTime.getWeekday)
				),
				4
			);
		});

		it('Change zoneOffset', () => {
			TEUtils.assertRight(
				pipe(
					{
						year: 2024,
						ordinalDay: 61,
						hour11: 7,
						meridiem: 0,
						zoneOffset: 1
					},
					CVDateTime.fromParts,
					Either.flatMap(CVDateTime.setZoneOffsetKeepTimestamp(-8)),
					Either.map(CVDateTime.getIsoString)
				),
				'2024-02-29T22:00:00.000-08:00'
			);

			TEUtils.assertRight(
				pipe(
					{
						year: 2024,
						ordinalDay: 61,
						hour11: 7,
						meridiem: 0,
						zoneOffset: 1
					},
					CVDateTime.fromParts,
					Either.flatMap(CVDateTime.setZoneOffsetKeepParts(-8)),
					Either.map(CVDateTime.getIsoString)
				),
				'2024-03-01T07:00:00.000-08:00'
			);
		});
	});

	describe('isFirstMonthDay', () => {
		it('Passing', () => {
			TEUtils.assertRight(
				pipe(feb29_2020, CVDateTime.offsetDays(1), Either.map(CVDateTime.isFirstMonthDay)),
				true
			);
		});

		it('Not passing', () => {
			TEUtils.assertFalse(pipe(CVDateTime.isFirstMonthDay(feb29_2020)));
		});
	});

	describe('isLastMonthDay', () => {
		it('Passing', () => {
			TEUtils.assertTrue(CVDateTime.isLastMonthDay(feb29_2020));
		});

		it('Not passing', () => {
			TEUtils.assertRight(
				pipe(
					feb29_2020,
					CVDateTime.setZoneOffsetKeepTimestamp(-1),
					Either.map(CVDateTime.isLastMonthDay)
				),
				false
			);
		});
	});

	describe('isFirstYearDay', () => {
		it('Passing', () => {
			TEUtils.assertRight(
				pipe(feb29_2020, CVDateTime.offsetDays(-59), Either.map(CVDateTime.isFirstYearDay)),
				true
			);
		});

		it('Not passing', () => {
			TEUtils.assertFalse(pipe(CVDateTime.isFirstYearDay(feb29_2020)));
		});
	});

	describe('isLastYearDay', () => {
		it('Passing', () => {
			TEUtils.assertRight(
				pipe(feb29_2020, CVDateTime.offsetDays(-60), Either.map(CVDateTime.isLastYearDay)),
				true
			);
		});

		it('Not passing', () => {
			TEUtils.assertFalse(pipe(CVDateTime.isLastYearDay(feb29_2020)));
		});
	});

	describe('isFirstIsoYearDay', () => {
		it('Passing', () => {
			TEUtils.assertRight(
				pipe(feb29_2020, CVDateTime.offsetDays(-61), Either.map(CVDateTime.isFirstIsoYearDay)),
				true
			);
		});

		it('Not passing', () => {
			TEUtils.assertFalse(pipe(CVDateTime.isFirstIsoYearDay(feb29_2020)));
		});
	});

	describe('isLastIsoYearDay', () => {
		it('Passing', () => {
			TEUtils.assertRight(
				pipe(feb29_2020, CVDateTime.offsetDays(-62), Either.map(CVDateTime.isLastIsoYearDay)),
				true
			);
		});

		it('Not passing', () => {
			TEUtils.assertFalse(pipe(CVDateTime.isLastIsoYearDay(feb29_2020)));
		});
	});

	it('toFirstMonthDay', () => {
		TEUtils.strictEqual(
			pipe(feb29_2020, CVDateTime.toFirstMonthDay, CVDateTime.timestamp),
			Date.UTC(2020, 1, 1)
		);
	});

	it('toLastMonthDay', () => {
		TEUtils.assertRight(
			pipe(feb29_2020, CVDateTime.offsetDays(-10), Either.map(CVDateTime.toLastMonthDay)),
			feb29_2020
		);
	});

	it('toFirstYearDay', () => {
		TEUtils.strictEqual(
			pipe(feb29_2020, CVDateTime.toFirstYearDay, CVDateTime.timestamp),
			Date.UTC(2020, 0, 1)
		);
	});

	it('toLastYearDay', () => {
		TEUtils.strictEqual(
			pipe(feb29_2020, CVDateTime.toLastYearDay, CVDateTime.timestamp),
			Date.UTC(2020, 11, 31)
		);
	});

	it('toFirstIsoYearDay', () => {
		TEUtils.strictEqual(
			pipe(feb29_2020, CVDateTime.toFirstIsoYearDay, CVDateTime.timestamp),
			Date.UTC(2019, 11, 30)
		);
	});

	it('toLastIsoYearWeek', () => {
		TEUtils.strictEqual(
			pipe(feb29_2020, CVDateTime.toLastIsoYearWeek, CVDateTime.timestamp),
			Date.UTC(2021, 0, 2)
		);
	});

	it('toLastIsoYearDay', () => {
		TEUtils.strictEqual(
			pipe(feb29_2020, CVDateTime.toLastIsoYearDay, CVDateTime.timestamp),
			Date.UTC(2021, 0, 3)
		);
	});

	it('offsetYears', () => {
		TEUtils.assertRight(
			pipe(feb29_2020, CVDateTime.offsetYears(4, false), Either.map(CVDateTime.timestamp)),
			Date.UTC(2024, 1, 29)
		);
	});

	describe('offsetMonths', () => {
		describe('Without respectMonthEnd', () => {
			it('Forward', () => {
				TEUtils.assertRight(
					pipe(feb29_2020, CVDateTime.offsetMonths(48, false), Either.map(CVDateTime.timestamp)),
					Date.UTC(2024, 1, 29)
				);
			});

			it('Backward', () => {
				TEUtils.assertRight(
					pipe(feb29_2020, CVDateTime.offsetMonths(-192, false), Either.map(CVDateTime.timestamp)),
					Date.UTC(2004, 1, 29)
				);
			});

			it('Not passing', () => {
				TEUtils.assertLeft(pipe(feb29_2020, CVDateTime.offsetMonths(12, false)));
			});
		});

		describe('With respectMonthEnd', () => {
			it('Forward', () => {
				TEUtils.assertRight(
					pipe(feb29_2020, CVDateTime.offsetMonths(1, true), Either.map(CVDateTime.timestamp)),
					Date.UTC(2020, 2, 31)
				);
			});

			it('Backward', () => {
				TEUtils.assertRight(
					pipe(feb29_2020, CVDateTime.offsetMonths(-2, true), Either.map(CVDateTime.timestamp)),
					Date.UTC(2019, 11, 31)
				);
			});
		});
	});

	it('offsetDays', () => {
		TEUtils.assertRight(
			pipe(feb29_2020, CVDateTime.offsetDays(-29), Either.map(CVDateTime.timestamp)),
			Date.UTC(2020, 0, 31)
		);
	});

	describe('offsetIsoYears', () => {
		const jan3_2021 = CVDateTime.fromTimestampOrThrow(Date.UTC(2021, 0, 3), 0);
		describe('Without respectYearEnd', () => {
			it('Forward', () => {
				TEUtils.assertRight(
					pipe(jan3_2021, CVDateTime.offsetIsoYears(6, false), Either.map(CVDateTime.timestamp)),
					Date.UTC(2027, 0, 3)
				);
			});

			it('Backward', () => {
				TEUtils.assertRight(
					pipe(jan3_2021, CVDateTime.offsetIsoYears(-5, false), Either.map(CVDateTime.timestamp)),
					Date.UTC(2016, 0, 3)
				);
			});

			it('Not passing', () => {
				TEUtils.assertLeft(pipe(jan3_2021, CVDateTime.offsetIsoYears(1, false)));
			});
		});

		describe('With respectYearEnd', () => {
			it('Forward', () => {
				TEUtils.assertRight(
					pipe(jan3_2021, CVDateTime.offsetIsoYears(1, true), Either.map(CVDateTime.timestamp)),
					Date.UTC(2022, 0, 2)
				);
			});

			it('Backward', () => {
				TEUtils.assertRight(
					pipe(jan3_2021, CVDateTime.offsetIsoYears(-1, true), Either.map(CVDateTime.timestamp)),
					Date.UTC(2019, 11, 29)
				);
			});
		});
	});

	it('offsetHours', () => {
		TEUtils.assertRight(
			pipe(feb29_2020, CVDateTime.offsetHours(48), Either.map(CVDateTime.timestamp)),
			Date.UTC(2020, 2, 2)
		);
	});

	it('offsetMinutes', () => {
		TEUtils.assertRight(
			pipe(feb29_2020, CVDateTime.offsetMinutes(-60), Either.map(CVDateTime.timestamp)),
			Date.UTC(2020, 1, 28, 23)
		);
	});

	it('offsetSeconds', () => {
		TEUtils.assertRight(
			pipe(feb29_2020, CVDateTime.offsetSeconds(-3600), Either.map(CVDateTime.timestamp)),
			Date.UTC(2020, 1, 28, 23)
		);
	});

	it('offsetMilliseconds', () => {
		TEUtils.assertRight(
			pipe(feb29_2020, CVDateTime.offsetMilliseconds(340), Either.map(CVDateTime.timestamp)),
			Date.UTC(2020, 1, 29, 0, 0, 0, 340)
		);
	});
});
