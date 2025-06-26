/* eslint-disable functional/no-expression-statements */
import { CVDateTime } from '@parischap/conversions';
import { MArray } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Array, Either, flow, Number, Option, pipe, Struct, Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('CVDateTime', () => {
	/** Produces a random integer between 0 included and range excluded */
	const intRandom = (range: number): number =>
		pipe(Math.random(), Number.multiply(range), Math.floor);

	const now = CVDateTime.now();

	const feb29_2020 = CVDateTime.unsafeFromTimestamp(Date.UTC(2020, 1, 29), 0);

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVDateTime.moduleTag);
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertEquals(CVDateTime.origin, CVDateTime.unsafeFromTimestamp(0, 1));
			});

			it('Non-matching', () => {
				TEUtils.assertNotEquals(CVDateTime.origin, now);
			});
		});

		it('.toString()', () => {
			//TEUtils.strictEqual(CVDateTime.origin.toString(), `1970-01-01 00:00:00:000 GMT+0000`);
			TEUtils.strictEqual(
				CVDateTime.unsafeFromTimestamp(1_749_823_231_774, -3.75).toString(),
				'2025-06-13 10:15:31:774 GMT-0345'
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

	it('fromTimestamp, year, isLeap, month, monthDay, ordinalDay', () => {
		const [actualVector, expectedVector] = pipe(
			Array.range(1771, 2170),
			Array.map((baseYear) => {
				const year = baseYear + (intRandom(8) - 4) * 400;
				const startTimestamp = Date.UTC(year);
				const startDate = CVDateTime.unsafeFromTimestamp(startTimestamp, 0);
				const yearDuration = Date.UTC(year + 1) - startTimestamp;
				const isLeap = Math.floor(yearDuration / CVDateTime.DAY_MS) === 366;
				const randomDuration = intRandom(yearDuration);
				const randomTimestamp = startTimestamp + randomDuration;
				const randomDate = CVDateTime.unsafeFromTimestamp(randomTimestamp, 0);
				const expectedRandomDate = new Date(randomTimestamp);
				const endTimestamp = startTimestamp + yearDuration - 1;
				const endDate = CVDateTime.unsafeFromTimestamp(endTimestamp, 0);

				return Array.make(
					Tuple.make(
						{
							startInput: startTimestamp,
							year: CVDateTime.getYear(startDate),
							isLeap: CVDateTime.isLeap(startDate),
							month: CVDateTime.getMonth(startDate),
							monthDay: CVDateTime.getMonthDay(startDate),
							ordinalDay: CVDateTime.getOrdinalDay(startDate)
						},
						{
							startInput: startTimestamp,
							year,
							isLeap,
							month: 1,
							monthDay: 1,
							ordinalDay: 1
						}
					),
					Tuple.make(
						{
							randomInput: randomTimestamp,
							year: CVDateTime.getYear(randomDate),
							isLeap: CVDateTime.isLeap(randomDate),
							month: CVDateTime.getMonth(randomDate),
							monthDay: CVDateTime.getMonthDay(randomDate),
							ordinalDay: CVDateTime.getOrdinalDay(randomDate)
						},
						{
							randomInput: randomTimestamp,
							year,
							isLeap: isLeap,
							month: expectedRandomDate.getUTCMonth() + 1,
							monthDay: expectedRandomDate.getUTCDate(),
							ordinalDay: Math.floor(randomDuration / CVDateTime.DAY_MS) + 1
						}
					),
					Tuple.make(
						{
							endInput: endTimestamp,
							year: CVDateTime.getYear(endDate),
							isLeap: CVDateTime.isLeap(endDate),
							month: CVDateTime.getMonth(endDate),
							monthDay: CVDateTime.getMonthDay(endDate),
							ordinalDay: CVDateTime.getOrdinalDay(endDate)
						},
						{
							endInput: endTimestamp,
							year,
							isLeap: isLeap,
							month: 12,
							monthDay: 31,
							ordinalDay: isLeap ? 366 : 365
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
				actual.isLeap !== expected.isLeap ||
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
		const date = CVDateTime.unsafeFromTimestamp(31620067199999, 0)
		TEUtils.assertEquals({
							year: CVDateTime.year(date),
							isLeap: CVDateTime.isLeap(date),
							month: CVDateTime.month(date),
							monthDay: CVDateTime.monthDay(date),
							ordinalDay: CVDateTime.ordinalDay(date)
						}, {
							year: 2971,
							isLeap:false,
							month: 12,
							monthDay: 31,
							ordinalDay: 365
						});
		 */
	});

	it('fromTimestamp, isoYear, isLong, week, weekDay', () => {
		// Timestamp of 31/12/1770 00:00:00:000+0:00
		const YEAR_START_1771_MS = -6_279_897_600_000;
		const FOUR_HUNDRED_YEARS_MS = 12_622_780_800_000;
		const [actualVector, expectedVector] = pipe(
			Tuple.make(1771, YEAR_START_1771_MS),
			MArray.unfoldNonEmpty(([baseYear, baseYearStartTimestamp]) => {
				const offset = intRandom(8) - 4;
				const year = baseYear + offset * 400;
				const startTimestamp = baseYearStartTimestamp + offset * FOUR_HUNDRED_YEARS_MS;
				const startDate = CVDateTime.unsafeFromTimestamp(startTimestamp, 0);

				const tentativeEndTimestamp = startTimestamp + CVDateTime.SHORT_YEAR_MS - 1;
				const tentativeEndMonthDay = new Date(tentativeEndTimestamp).getUTCDate();
				const isLong = tentativeEndMonthDay >= 21 && tentativeEndMonthDay < 28;
				const endTimestamp = tentativeEndTimestamp + (isLong ? CVDateTime.WEEK_MS : 0);
				const endDate = CVDateTime.unsafeFromTimestamp(endTimestamp, 0);
				const yearDurationInWeeks = isLong ? 53 : 52;
				const yearDurationMs = endTimestamp - startTimestamp + 1;

				const isoWeekIndex = intRandom(yearDurationInWeeks);
				const weekDayIndex = intRandom(6);
				const randomTimestamp =
					startTimestamp + isoWeekIndex * CVDateTime.WEEK_MS + weekDayIndex * CVDateTime.DAY_MS;
				const randomDate = CVDateTime.unsafeFromTimestamp(randomTimestamp, 0);

				return Tuple.make(
					Array.make(
						Tuple.make(
							{
								startInput: startTimestamp,
								isoYear: CVDateTime.getIsoYear(startDate),
								isLong: CVDateTime.isLong(startDate),
								isoWeek: CVDateTime.getIsoWeek(startDate),
								weekDay: CVDateTime.getWeekDay(startDate)
							},
							{
								startInput: startTimestamp,
								isoYear: year,
								isLong,
								isoWeek: 1,
								weekDay: 1
							}
						),
						Tuple.make(
							{
								randomInput: randomTimestamp,
								isoYear: CVDateTime.getIsoYear(randomDate),
								isLong: CVDateTime.isLong(randomDate),
								isoWeek: CVDateTime.getIsoWeek(randomDate),
								weekDay: CVDateTime.getWeekDay(randomDate)
							},
							{
								randomInput: randomTimestamp,
								isoYear: year,
								isLong,
								isoWeek: isoWeekIndex + 1,
								weekDay: weekDayIndex + 1
							}
						),
						Tuple.make(
							{
								endInput: endTimestamp,
								isoYear: CVDateTime.getIsoYear(endDate),
								isLong: CVDateTime.isLong(endDate),
								isoWeek: CVDateTime.getIsoWeek(endDate),
								weekDay: CVDateTime.getWeekDay(endDate)
							},
							{
								endInput: endTimestamp,
								isoYear: year,
								isLong,
								isoWeek: yearDurationInWeeks,
								weekDay: 7
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
				actual.isLong !== expected.isLong ||
				actual.isoWeek !== expected.isoWeek ||
				actual.weekDay !== expected.weekDay
			) {
				console.log(actual, expected);
				break;
			}
		}*/

		TEUtils.assertEquals(actualVector, expectedVector);

		/*const date = CVDateTime.unsafeFromTimestamp(-6216393600000, 0);
		TEUtils.assertEquals(
			{
				isoYearDescriptor: CVDateTime.isoYearDescriptor(date),
				isLong: CVDateTime.isLong(date),
				isoWeek: CVDateTime.isoWeek(date),
				weekDay: CVDateTime.weekDay(date)
			},
			{
				isoYearDescriptor: 1773,
				isLong: false,
				isoWeek: 1,
				weekDay: 1
			}
		);*/
	});

	describe('fromParts', () => {
		it('From nothing', () => {
			TEUtils.assertLeft(CVDateTime.fromParts({}));
		});

		it('From date with hour24 and timeZoneOffset', () => {
			const testDate = CVDateTime.fromParts({
				year: 2024,
				ordinalDay: 61,
				hour24: 17,
				minute: 43,
				second: 27,
				millisecond: 654,
				timeZoneOffset: 1
			});

			TEUtils.assertRight(testDate);
			const right = testDate.right;
			TEUtils.strictEqual(
				CVDateTime.timestamp(right),
				Date.UTC(2024, 2, 1, 17, 43, 27, 654) - CVDateTime.HOUR_MS
			);
			TEUtils.assertSome(right.yearDescriptor);
			TEUtils.assertSome(right.dayDescriptor);
			TEUtils.assertNone(right.isoYearDescriptor);
			TEUtils.assertNone(right.isoDayDescriptor);
			TEUtils.assertSome(right.time);
		});

		it('From date with hour12 and meridiem', () => {
			TEUtils.assertRight(
				pipe(
					{
						year: 2024,
						ordinalDay: 61,
						meridiem: 12,
						hour12: 5,
						minute: 43,
						second: 27,
						millisecond: 654,
						timeZoneOffset: 0
					},
					CVDateTime.fromParts,
					Either.map(CVDateTime.timestamp)
				),
				Date.UTC(2024, 2, 1, 17, 43, 27, 654)
			);
		});

		it('From isodate', () => {
			const testDate = CVDateTime.fromParts({
				isoYear: 2027,
				isoWeek: 52,
				weekDay: 6,
				meridiem: 12,
				hour12: 5,
				minute: 43,
				second: 27,
				millisecond: 654,
				timeZoneOffset: 0
			});

			TEUtils.assertRight(testDate);
			const right = testDate.right;
			TEUtils.strictEqual(CVDateTime.timestamp(right), Date.UTC(2028, 0, 1, 17, 43, 27, 654));
			TEUtils.assertNone(right.yearDescriptor);
			TEUtils.assertNone(right.dayDescriptor);
			TEUtils.assertSome(right.isoYearDescriptor);
			TEUtils.assertSome(right.isoDayDescriptor);
			TEUtils.assertSome(right.time);
		});

		describe('Default values', () => {
			it('Only year is set', () => {
				const testDate = CVDateTime.fromParts({
					year: 2025,
					timeZoneOffset: 0
				});

				TEUtils.assertRight(testDate);
				const right = testDate.right;
				TEUtils.strictEqual(CVDateTime.timestamp(right), Date.UTC(2025, 0, 1));
				TEUtils.assertSome(right.yearDescriptor);
				TEUtils.assertSome(right.dayDescriptor);
				TEUtils.assertNone(right.isoYearDescriptor);
				TEUtils.assertNone(right.isoDayDescriptor);
				TEUtils.assertSome(right.time);
			});

			it('year and month are set', () => {
				TEUtils.assertRight(
					pipe(
						{
							year: 2025,
							month: 5,
							timeZoneOffset: 0
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
							timeZoneOffset: 0
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
							timeZoneOffset: 0
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
							timeZoneOffset: 0
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2025, 0, 27)
				);
			});
			it('isoYear and weekDay are set', () => {
				TEUtils.assertRight(
					pipe(
						{
							isoYear: 2025,
							weekDay: 5,
							timeZoneOffset: 0
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2025, 0, 3)
				);
			});
			it('A day is set and isoYear is passed', () => {
				TEUtils.assertRight(
					pipe(
						{
							year: 2024,
							ordinalDay: 365,
							isoYear: 2025,
							timeZoneOffset: 0
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2024, 11, 30)
				);
			});
			it('An isoDay is set and year is passed', () => {
				TEUtils.assertRight(
					pipe(
						{
							year: 2025,
							isoYear: 2025,
							isoWeek: 3,
							weekDay: 4,
							timeZoneOffset: 0
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2025, 0, 16)
				);
			});

			it('Only meridiem is set', () => {
				TEUtils.assertRight(
					pipe(
						{
							year: 2024,
							ordinalDay: 75,
							meridiem: 12,
							timeZoneOffset: 0
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2024, 2, 15, 12)
				);
			});

			it('Only hour12 is set', () => {
				TEUtils.assertRight(
					pipe(
						{
							year: 2024,
							ordinalDay: 75,
							hour12: 5,
							timeZoneOffset: 0
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2024, 2, 15, 5)
				);
			});
		});

		it('Out of range data', () => {
			TEUtils.assertLeft(
				pipe(
					{ year: 2025, timeZoneOffset: 15 },
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'timeZoneOffset' to be between -12 and 14 included. Actual: 15"
			);

			TEUtils.assertLeft(
				pipe({ year: 2025, month: 0 }, CVDateTime.fromParts, Either.mapLeft(Struct.get('message'))),
				"Expected 'month' to be between 1 and 12 included. Actual: 0"
			);
			TEUtils.assertLeft(
				pipe(
					{ year: 2025, month: 2, monthDay: 32 },
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'monthDay' to be between 1 and 28 included. Actual: 32"
			);
			TEUtils.assertLeft(
				pipe(
					{ year: 2024, ordinalDay: 412 },
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'ordinalDay' to be between 1 and 366 included. Actual: 412"
			);
			TEUtils.assertLeft(
				pipe(
					{ isoYear: 2027, isoWeek: 53 },
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'isoWeek' to be between 1 and 52 included. Actual: 53"
			);
			TEUtils.assertLeft(
				pipe(
					{ isoYear: 2027, weekDay: 0 },
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'weekDay' to be between 1 and 7 included. Actual: 0"
			);
			TEUtils.assertLeft(
				pipe(
					{ year: 2024, hour24: 24 },
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'hour24' to be between 0 and 23 included. Actual: 24"
			);
			TEUtils.assertLeft(
				pipe(
					{ year: 2024, meridiem: 0, hour12: -4 },
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'hour12' to be between 0 and 11 included. Actual: -4"
			);
			TEUtils.assertLeft(
				pipe(
					{ year: 2024, minute: 60 },
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'minute' to be between 0 and 59 included. Actual: 60"
			);
			TEUtils.assertLeft(
				pipe(
					{ year: 2024, second: 67 },
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'second' to be between 0 and 59 included. Actual: 67"
			);
			TEUtils.assertLeft(
				pipe(
					{ year: 2024, millisecond: 1023 },
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'millisecond' to be between 0 and 999 included. Actual: 1023"
			);
		});
		it('Incoherent parts', () => {
			TEUtils.assertLeft(
				pipe(
					{
						year: 2024,
						hour24: 5,
						meridiem: 12,
						timeZoneOffset: 0
					},
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'meridiem' to be: 0. Actual: 12"
			);
			TEUtils.assertLeft(
				pipe(
					{
						year: 2024,
						hour24: 5,
						meridiem: 0,
						hour12: 4,
						timeZoneOffset: 0
					},
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'hour12' to be: 5. Actual: 4"
			);
			TEUtils.assertLeft(
				pipe(
					{
						year: 2024,
						ordinalDay: 61,
						month: 2,
						timeZoneOffset: 0
					},
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'month' to be: 3. Actual: 2"
			);
			TEUtils.assertLeft(
				pipe(
					{
						year: 2024,
						ordinalDay: 61,
						monthDay: 2,
						timeZoneOffset: 0
					},
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'monthDay' to be: 1. Actual: 2"
			);
			TEUtils.assertLeft(
				pipe(
					{
						year: 2024,
						ordinalDay: 61,
						isoWeek: 12,
						timeZoneOffset: 0
					},
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'isoWeek' to be: 9. Actual: 12"
			);
			TEUtils.assertLeft(
				pipe(
					{
						year: 2024,
						ordinalDay: 61,
						weekDay: 17,
						timeZoneOffset: 0
					},
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'weekDay' to be: 5. Actual: 17"
			);
			TEUtils.assertLeft(
				pipe(
					{
						year: 2024,
						month: 3,
						monthDay: 1,
						weekDay: 17,
						timeZoneOffset: 0
					},
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'weekDay' to be: 5. Actual: 17"
			);
			TEUtils.assertLeft(
				pipe(
					{
						year: 2024,
						month: 12,
						monthDay: 30,
						isoYear: 2024,
						timeZoneOffset: 0
					},
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'isoYear' to be: 2025. Actual: 2024"
			);
			TEUtils.assertLeft(
				pipe(
					{
						isoYear: 2027,
						isoWeek: 52,
						weekDay: 6,
						year: 2027,
						timeZoneOffset: 0
					},
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'year' to be: 2028. Actual: 2027"
			);
			TEUtils.assertLeft(
				pipe(
					{
						isoYear: 2027,
						isoWeek: 52,
						weekDay: 6,
						month: 12,
						timeZoneOffset: 0
					},
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'month' to be: 1. Actual: 12"
			);
			TEUtils.assertLeft(
				pipe(
					{
						isoYear: 2027,
						isoWeek: 52,
						weekDay: 6,
						monthDay: 5,
						timeZoneOffset: 0
					},
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'monthDay' to be: 1. Actual: 5"
			);
			TEUtils.assertLeft(
				pipe(
					{
						isoYear: 2027,
						isoWeek: 52,
						weekDay: 6,
						ordinalDay: 5,
						timeZoneOffset: 0
					},
					CVDateTime.fromParts,
					Either.mapLeft(Struct.get('message'))
				),
				"Expected 'ordinalDay' to be: 1. Actual: 5"
			);
		});
	});

	describe('Getters', () => {
		it('Get year, month, monthDay then all time parts', () => {
			const testDate = CVDateTime.unsafeFromTimestamp(1750670080496, 0);

			TEUtils.assertNone(testDate.yearDescriptor);
			TEUtils.assertNone(testDate.dayDescriptor);
			TEUtils.assertNone(testDate.isoYearDescriptor);
			TEUtils.assertNone(testDate.isoDayDescriptor);
			TEUtils.assertNone(testDate.time);

			TEUtils.strictEqual(CVDateTime.getYear(testDate), 2025);
			TEUtils.assertSome(testDate.yearDescriptor);
			TEUtils.assertNone(testDate.dayDescriptor);
			TEUtils.assertNone(testDate.isoYearDescriptor);
			TEUtils.assertNone(testDate.isoDayDescriptor);
			TEUtils.assertNone(testDate.time);

			TEUtils.strictEqual(CVDateTime.getMonth(testDate), 6);
			TEUtils.assertSome(testDate.yearDescriptor);
			TEUtils.assertSome(testDate.dayDescriptor);
			TEUtils.assertNone(testDate.isoYearDescriptor);
			TEUtils.assertNone(testDate.isoDayDescriptor);
			TEUtils.assertNone(testDate.time);

			TEUtils.strictEqual(CVDateTime.getMonthDay(testDate), 23);
			TEUtils.strictEqual(CVDateTime.getHour24(testDate), 9);
			TEUtils.assertSome(testDate.yearDescriptor);
			TEUtils.assertSome(testDate.dayDescriptor);
			TEUtils.assertNone(testDate.isoYearDescriptor);
			TEUtils.assertNone(testDate.isoDayDescriptor);
			TEUtils.assertSome(testDate.time);

			TEUtils.strictEqual(CVDateTime.getMinute(testDate), 14);
			TEUtils.strictEqual(CVDateTime.getSecond(testDate), 40);
			TEUtils.strictEqual(CVDateTime.getMillisecond(testDate), 496);
		});

		it('Get seconds then monthDay', () => {
			const testDate = CVDateTime.unsafeFromTimestamp(1750670080496, 0);
			TEUtils.strictEqual(CVDateTime.getSecond(testDate), 40);
			TEUtils.assertNone(testDate.yearDescriptor);
			TEUtils.assertNone(testDate.dayDescriptor);
			TEUtils.assertNone(testDate.isoYearDescriptor);
			TEUtils.assertNone(testDate.isoDayDescriptor);
			TEUtils.assertSome(testDate.time);

			TEUtils.strictEqual(CVDateTime.getMonthDay(testDate), 23);
			TEUtils.strictEqual(CVDateTime.getHour24(testDate), 9);
			TEUtils.assertSome(testDate.yearDescriptor);
			TEUtils.assertSome(testDate.dayDescriptor);
			TEUtils.assertNone(testDate.isoYearDescriptor);
			TEUtils.assertNone(testDate.isoDayDescriptor);
			TEUtils.assertSome(testDate.time);
		});

		it('Get isoYear, isoWeek, weekDay and milliseconds', () => {
			const testDate = CVDateTime.unsafeFromTimestamp(1750670080496, 0);
			TEUtils.strictEqual(CVDateTime.getIsoYear(testDate), 2025);
			TEUtils.assertNone(testDate.yearDescriptor);
			TEUtils.assertNone(testDate.dayDescriptor);
			TEUtils.assertSome(testDate.isoYearDescriptor);
			TEUtils.assertNone(testDate.isoDayDescriptor);
			TEUtils.assertNone(testDate.time);

			TEUtils.strictEqual(CVDateTime.getIsoWeek(testDate), 26);
			TEUtils.assertNone(testDate.yearDescriptor);
			TEUtils.assertNone(testDate.dayDescriptor);
			TEUtils.assertSome(testDate.isoYearDescriptor);
			TEUtils.assertSome(testDate.isoDayDescriptor);
			TEUtils.assertNone(testDate.time);

			TEUtils.strictEqual(CVDateTime.getWeekDay(testDate), 1);
			TEUtils.strictEqual(CVDateTime.getMillisecond(testDate), 496);
			TEUtils.assertNone(testDate.yearDescriptor);
			TEUtils.assertNone(testDate.dayDescriptor);
			TEUtils.assertSome(testDate.isoYearDescriptor);
			TEUtils.assertSome(testDate.isoDayDescriptor);
			TEUtils.assertSome(testDate.time);
		});

		it('Get minutes, isoYear, weekDay, year and monthDay', () => {
			const testDate = CVDateTime.unsafeFromTimestamp(1750670080496, 0);
			TEUtils.strictEqual(CVDateTime.getMinute(testDate), 14);
			TEUtils.assertNone(testDate.yearDescriptor);
			TEUtils.assertNone(testDate.dayDescriptor);
			TEUtils.assertNone(testDate.isoYearDescriptor);
			TEUtils.assertNone(testDate.isoDayDescriptor);
			TEUtils.assertSome(testDate.time);

			TEUtils.strictEqual(CVDateTime.getIsoYear(testDate), 2025);
			TEUtils.assertNone(testDate.yearDescriptor);
			TEUtils.assertNone(testDate.dayDescriptor);
			TEUtils.assertSome(testDate.isoYearDescriptor);
			TEUtils.assertNone(testDate.isoDayDescriptor);
			TEUtils.assertSome(testDate.time);

			TEUtils.strictEqual(CVDateTime.getWeekDay(testDate), 1);
			TEUtils.assertNone(testDate.yearDescriptor);
			TEUtils.assertNone(testDate.dayDescriptor);
			TEUtils.assertSome(testDate.isoYearDescriptor);
			TEUtils.assertSome(testDate.isoDayDescriptor);
			TEUtils.assertSome(testDate.time);

			TEUtils.strictEqual(CVDateTime.getYear(testDate), 2025);
			TEUtils.assertSome(testDate.yearDescriptor);
			TEUtils.assertNone(testDate.dayDescriptor);
			TEUtils.assertSome(testDate.isoYearDescriptor);
			TEUtils.assertSome(testDate.isoDayDescriptor);
			TEUtils.assertSome(testDate.time);

			TEUtils.strictEqual(CVDateTime.getMonthDay(testDate), 23);
			TEUtils.assertSome(testDate.yearDescriptor);
			TEUtils.assertSome(testDate.dayDescriptor);
			TEUtils.assertSome(testDate.isoYearDescriptor);
			TEUtils.assertSome(testDate.isoDayDescriptor);
			TEUtils.assertSome(testDate.time);
		});
	});

	describe('Setters', () => {
		describe('Not passing', () => {
			it('No February,29th in 2021', () => {
				TEUtils.assertLeft(pipe(feb29_2020, CVDateTime.setYear(2021)));
			});
			it('No june, 31st', () => {
				TEUtils.assertLeft(
					pipe(
						{
							isoYear: 2027,
							isoWeek: 22,
							weekDay: 1,
							timeZoneOffset: 0
						},
						CVDateTime.unsafeFromParts,
						CVDateTime.setMonth(6)
					)
				);
			});

			it('No 53rd week in 2024', () => {
				TEUtils.assertLeft(
					pipe(
						{
							year: 2026,
							month: 12,
							monthDay: 29,
							timeZoneOffset: 0
						},
						CVDateTime.unsafeFromParts,
						CVDateTime.setIsoYear(2024)
					)
				);
			});
		});

		it('Passing', () => {
			const testDate = CVDateTime.unsafeFromParts({
				year: 2025,
				month: 6,
				monthDay: 23,
				hour24: 17,
				minute: 43,
				second: 27,
				millisecond: 654,
				timeZoneOffset: 1
			});
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setYear(2019), Either.map(CVDateTime.timestamp)),
				Date.UTC(2019, 5, 23, 16, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setMonth(4), Either.map(CVDateTime.timestamp)),
				Date.UTC(2025, 3, 23, 16, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setMonthDay(4), Either.map(CVDateTime.timestamp)),
				Date.UTC(2025, 5, 4, 16, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setOrdinalDay(4), Either.map(CVDateTime.timestamp)),
				Date.UTC(2025, 0, 4, 16, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setIsoYear(2027), Either.map(CVDateTime.timestamp)),
				Date.UTC(2027, 5, 28, 16, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setIsoWeek(4), Either.map(CVDateTime.timestamp)),
				Date.UTC(2025, 0, 20, 16, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setWeekDay(4), Either.map(CVDateTime.timestamp)),
				Date.UTC(2025, 5, 26, 16, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setHour24(4), Either.map(CVDateTime.timestamp)),
				Date.UTC(2025, 5, 23, 3, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setHour12(4), Either.map(CVDateTime.timestamp)),
				Date.UTC(2025, 5, 23, 15, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setMeridiem(0), Either.map(CVDateTime.timestamp)),
				Date.UTC(2025, 5, 23, 4, 43, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setMinute(15), Either.map(CVDateTime.timestamp)),
				Date.UTC(2025, 5, 23, 16, 15, 27, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setSecond(15), Either.map(CVDateTime.timestamp)),
				Date.UTC(2025, 5, 23, 16, 43, 15, 654)
			);
			TEUtils.assertRight(
				pipe(testDate, CVDateTime.setMillisecond(15), Either.map(CVDateTime.timestamp)),
				Date.UTC(2025, 5, 23, 16, 43, 27, 15)
			);
		});

		it('Set weekDay, set monthDay, get weekDay', () => {
			const testDate = CVDateTime.fromParts({
				isoYear: 2027,
				isoWeek: 18,
				weekDay: 2,
				monthDay: 4,
				timeZoneOffset: 0
			});
			TEUtils.assertRight(testDate);
			const modifiedDate = Either.flatMap(testDate, CVDateTime.setMonthDay(20));
			TEUtils.assertRight(modifiedDate);
			TEUtils.strictEqual(CVDateTime.getWeekDay(modifiedDate.right), 4);
		});

		it('Change timeZoneOffset', () => {
			const testDate = CVDateTime.fromParts({
				year: 2025,
				ordinalDay: 114,
				hour12: 7,
				meridiem: 0,
				timeZoneOffset: 1
			});
			TEUtils.assertRight(testDate);
			const modifiedDate = Either.flatMap(testDate, CVDateTime.setTimeZoneOffset(-8));
			TEUtils.assertRight(modifiedDate);
			TEUtils.strictEqual(CVDateTime.getHour24(modifiedDate.right), 22);
			TEUtils.strictEqual(CVDateTime.getOrdinalDay(modifiedDate.right), 113);
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
				pipe(feb29_2020, CVDateTime.setTimeZoneOffset(-1), Either.map(CVDateTime.isLastMonthDay)),
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

	it('toLastIsoYearDay', () => {
		TEUtils.strictEqual(
			pipe(feb29_2020, CVDateTime.toLastIsoYearDay, CVDateTime.timestamp),
			Date.UTC(2021, 0, 3)
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
});
