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
			TEUtils.strictEqual(CVDateTime.origin.toString(), `1970-01-01 00:00:00:000 GMT+0000`);
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
							year: CVDateTime.year(startDate),
							isLeap: CVDateTime.isLeap(startDate),
							month: CVDateTime.month(startDate),
							monthDay: CVDateTime.monthDay(startDate),
							ordinalDay: CVDateTime.ordinalDay(startDate)
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
							year: CVDateTime.year(randomDate),
							isLeap: CVDateTime.isLeap(randomDate),
							month: CVDateTime.month(randomDate),
							monthDay: CVDateTime.monthDay(randomDate),
							ordinalDay: CVDateTime.ordinalDay(randomDate)
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
							year: CVDateTime.year(endDate),
							isLeap: CVDateTime.isLeap(endDate),
							month: CVDateTime.month(endDate),
							monthDay: CVDateTime.monthDay(endDate),
							ordinalDay: CVDateTime.ordinalDay(endDate)
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
								isoYear: CVDateTime.isoYear(startDate),
								isLong: CVDateTime.isLong(startDate),
								isoWeek: CVDateTime.isoWeek(startDate),
								weekDay: CVDateTime.weekDay(startDate)
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
								isoYear: CVDateTime.isoYear(randomDate),
								isLong: CVDateTime.isLong(randomDate),
								isoWeek: CVDateTime.isoWeek(randomDate),
								weekDay: CVDateTime.weekDay(randomDate)
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
								isoYear: CVDateTime.isoYear(endDate),
								isLong: CVDateTime.isLong(endDate),
								isoWeek: CVDateTime.isoWeek(endDate),
								weekDay: CVDateTime.weekDay(endDate)
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

		it('From date with hour24', () => {
			TEUtils.assertRight(
				pipe(
					{
						year: 2024,
						ordinalDay: 61,
						hour24: 17,
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
			TEUtils.assertRight(
				pipe(
					{
						isoYear: 2027,
						isoWeek: 52,
						weekDay: 6,
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
				Date.UTC(2028, 0, 1, 17, 43, 27, 654)
			);
		});

		describe('Default values', () => {
			it('Only year is set', () => {
				TEUtils.assertRight(
					pipe(
						{
							year: 2025,
							timeZoneOffset: 0
						},
						CVDateTime.fromParts,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2025, 0, 1)
				);
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
});
