/* eslint-disable functional/no-expression-statements */
import { CVDateTime } from '@parischap/conversions';
import { MArray } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Array, flow, Number, Option, pipe, Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('CVDateTime', () => {
	/** Produces a random integer between 0 included and range excluded */
	const intRandom = (range: number): number =>
		pipe(Math.random(), Number.multiply(range), Math.floor);

	const now = CVDateTime.now();
	const origin = CVDateTime.unsafeFromTimestamp(0, 0);

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVDateTime.moduleTag);
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertEquals(origin, CVDateTime.unsafeFromTimestamp(0, 1));
			});

			it('Non-matching', () => {
				TEUtils.assertNotEquals(origin, now);
			});
		});

		/*it('.toString()', () => {
			TEUtils.strictEqual(utilInspectLike.toString(), `UtilInspectLike`);
		});*/

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

	it('year, isLeap, month, monthDay, ordinalDay', () => {
		const [actualVector, expectedVector] = pipe(
			Array.range(1771, 2170),
			Array.map((baseYear) => {
				const year = baseYear + (intRandom(8) - 4) * 400;
				const startTimestamp = Date.UTC(year);
				const startDate = CVDateTime.unsafeFromTimestamp(startTimestamp, 0);
				const yearDuration = Date.UTC(year + 1) - startTimestamp;
				const expectedIsLeap = Math.floor(yearDuration / CVDateTime.DAY_MS) === 366;
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
							isLeap: expectedIsLeap,
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
							isLeap: expectedIsLeap,
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
							isLeap: expectedIsLeap,
							month: 12,
							monthDay: 31,
							ordinalDay: expectedIsLeap ? 366 : 365
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

	it('isoYear, isLong, week, weekDay', () => {
		// Timestamp of 31/12/1770 00:00:00:000+0:00
		const YEAR_START_1771_MS = -6_279_897_600_000;
		const FOUR_HUNDRED_YEARS_MS = 12_622_780_800_000;
		const [actualVector, expectedVector] = pipe(
			Tuple.make(1771, YEAR_START_1771_MS),
			MArray.unfoldNonEmpty(([baseYear, baseStartTimestamp]) => {
				const yearOffset = intRandom(8) - 4;
				const year = baseYear + yearOffset * 400;
				const startTimestamp = baseStartTimestamp + yearOffset * FOUR_HUNDRED_YEARS_MS;
				const startDate = CVDateTime.unsafeFromTimestamp(startTimestamp, 0);

				const tentativeEndTimestamp = startTimestamp + CVDateTime.SHORT_YEAR_MS - 1;
				const tentativeEndMonthDay = new Date(tentativeEndTimestamp).getUTCDate();
				const isLong = tentativeEndMonthDay >= 21 && tentativeEndMonthDay < 28;
				const endTimestamp = tentativeEndTimestamp + (isLong ? CVDateTime.WEEK_MS : 0);
				const endDate = CVDateTime.unsafeFromTimestamp(endTimestamp, 0);

				const isoWeekIndex = intRandom(isLong ? 53 : 52);
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
								isoWeek: isLong ? 53 : 52,
								weekDay: 7
							}
						)
					),
					pipe(
						baseYear + 1,
						Option.liftPredicate(Number.lessThanOrEqualTo(2170)),
						Option.map(
							flow(
								Tuple.make,
								Tuple.appendElement(
									baseStartTimestamp + (isLong ? CVDateTime.LONG_YEAR_MS : CVDateTime.SHORT_YEAR_MS)
								)
							)
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
				isoYear: CVDateTime.isoYear(date),
				isLong: CVDateTime.isLong(date),
				isoWeek: CVDateTime.isoWeek(date),
				weekDay: CVDateTime.weekDay(date)
			},
			{
				isoYear: 1773,
				isLong: false,
				isoWeek: 1,
				weekDay: 1
			}
		);*/
	});
});
