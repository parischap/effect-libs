/* eslint-disable functional/no-expression-statements */
import { CVDateTimeUtils } from '@parischap/conversions';
import { MNumber, MTypes } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Array, flow, Number, pipe, Tuple } from 'effect';
import { describe, it } from 'vitest';

/** Produces a random integer between 0 included and range excluded */
const intRandom = (range: number): number =>
	pipe(Math.random(), Number.multiply(range), Math.floor);

/**
 * Calculates the UTC weekDayIndex (0 for UTC monday, 6 for UTC sunday) of a timestamp. Calculation
 * is based on the fact that 1/1/1970 was a UTC thursday.
 */
const weekDayIndexFromTimestamp: MTypes.OneArgFunction<number> = flow(
	Number.unsafeDivide(CVDateTimeUtils.DAY_MS),
	Math.floor,
	Number.sum(3),
	MNumber.intModulo(7)
);

/** Returns true if a year is a leap year */
const isLeapYear = (year: number): boolean =>
	(year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/**
 * Returns the offset in millisecond between the start of the civil year and the start of the iso
 * year. Takes the weekday index of the first day of the year as argument (0 for monday, 6 for
 * sunday)
 */
const firstIsoWeekMs: MTypes.OneArgFunction<number> = flow(
	MNumber.opposite,
	Number.sum(3),
	MNumber.intModulo(7),
	Number.subtract(3),
	Number.multiply(CVDateTimeUtils.DAY_MS)
);

/**
 * Returns true if an iso year is long (53 weeks). `yearStartWeekDayIndex` is the weekday index of
 * the first day of the year (0 for monday, 6 for sunday). `isLeapYear` is a boolean indicating if
 * the isoYear is a leap year
 */
const isLongIsoYear = (yearStartWeekDayIndex: number, isLeapYear: boolean): boolean =>
	yearStartWeekDayIndex === 3 || (yearStartWeekDayIndex === 2 && isLeapYear);

/** Four-hundred-year range with random 400-year offsets */
const yearVector = Array.map(Array.range(1771, 2170), Number.sum((intRandom(8) - 4) * 400));

describe('CVDateTimeUtils', () => {
	describe('weekDayIndexFromTimestamp', () => {
		it('1/1/1970', () => {
			TEUtils.strictEqual(weekDayIndexFromTimestamp(CVDateTimeUtils.DAY_MS / 2), 3);
		});

		it('Positive timestamp: 05/05/2025 00:00:00:000', () => {
			TEUtils.strictEqual(pipe(Date.UTC(2025, 4, 5), weekDayIndexFromTimestamp), 0);
		});

		it('Negative timestamp: 06/05/1970 23:59:59:999', () => {
			TEUtils.strictEqual(
				pipe(Date.UTC(1970, 4, 6, 23, 59, 59, 999), weekDayIndexFromTimestamp),
				2
			);
		});
	});

	describe('MonthDescriptor', () => {
		describe('getFromYearOffset', () => {
			const normalYearDecember1stOffsetMs = 28857600000;
			it('On December 15th of a normal year', () => {
				TEUtils.assertEquals(
					CVDateTimeUtils.MonthDescriptor.fromYearOffset(false)(
						normalYearDecember1stOffsetMs + 14 * CVDateTimeUtils.DAY_MS
					),
					{
						monthIndex: 11,
						lastDayIndex: 30,
						monthStartMs: normalYearDecember1stOffsetMs
					}
				);
			});

			it('On December 1st of a normal year', () => {
				TEUtils.assertEquals(
					CVDateTimeUtils.MonthDescriptor.fromYearOffset(false)(normalYearDecember1stOffsetMs),
					{
						monthIndex: 11,
						lastDayIndex: 30,
						monthStartMs: normalYearDecember1stOffsetMs
					}
				);
			});

			it('On November 30th of a leap year', () => {
				TEUtils.assertEquals(
					CVDateTimeUtils.MonthDescriptor.fromYearOffset(true)(normalYearDecember1stOffsetMs),
					{
						monthIndex: 10,
						lastDayIndex: 29,
						monthStartMs: 26352000000
					}
				);
			});
		});
	});

	describe('YearDescriptor', () => {
		it('fromTimestamp', () => {
			const [actualVector, expectedVector] = pipe(
				yearVector,
				Array.map((year) => {
					const isLeap = isLeapYear(year);
					const startTimestamp = Date.UTC(year);
					const yearDuration =
						isLeap ? CVDateTimeUtils.LEAP_YEAR_MS : CVDateTimeUtils.NORMAL_YEAR_MS;
					const randomTimestamp = startTimestamp + intRandom(yearDuration);
					const endTimestamp = startTimestamp + yearDuration - 1;
					const expected = {
						year,
						isLeap,
						startTimestamp
					};

					return Array.make(
						Tuple.make(
							{
								startInput: startTimestamp,
								...CVDateTimeUtils.YearDescriptor.fromTimestamp(startTimestamp)
							},
							{ startInput: startTimestamp, ...expected }
						),
						Tuple.make(
							{
								randomInput: randomTimestamp,
								...CVDateTimeUtils.YearDescriptor.fromTimestamp(randomTimestamp)
							},
							{ randomInput: randomTimestamp, ...expected }
						),
						Tuple.make(
							{
								endInput: endTimestamp,
								...CVDateTimeUtils.YearDescriptor.fromTimestamp(endTimestamp)
							},
							{ endInput: endTimestamp, ...expected }
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
					actual.startTimestamp !== expected.startTimestamp
				) {
					console.log(actual, expected);
					break;
				}
			}*/

			TEUtils.assertEquals(actualVector, expectedVector);
			/*TEUtils.assertEquals(
				CVDateTimeUtils.YearDescriptor.fromTimestamp(Date.UTC(571, 11, 31, 23, 59, 59, 999)),
				{
					year: 571,
					startTimestamp: -44148153600000,
					isLeap: false
				}
			);*/
		});

		it('fromYear', () => {
			const actualVector = Array.map(yearVector, CVDateTimeUtils.YearDescriptor.fromYear);
			const expectedVector = Array.map(yearVector, (year) => ({
				year,
				isLeap: isLeapYear(year),
				startTimestamp: Date.UTC(year)
			}));

			TEUtils.assertEquals(actualVector, expectedVector);
		});
	});

	describe('IsoYearDescriptor', () => {
		it('fromTimestamp', () => {
			const [actualVector, expectedVector] = pipe(
				yearVector,
				Array.map((isoYear) => {
					const yearStartTimeStamp = Date.UTC(isoYear);
					const yearStartWeekDayIndex = weekDayIndexFromTimestamp(yearStartTimeStamp);
					const startTimestamp = yearStartTimeStamp + firstIsoWeekMs(yearStartWeekDayIndex);
					const isLong = isLongIsoYear(yearStartWeekDayIndex, isLeapYear(isoYear));
					const yearDuration =
						isLong ? CVDateTimeUtils.LONG_ISO_YEAR_MS : CVDateTimeUtils.SHORT_ISO_YEAR_MS;
					const randomTimestamp = startTimestamp + intRandom(yearDuration);
					const endTimestamp = startTimestamp + yearDuration - 1;
					const expected = {
						year: isoYear,
						startTimestamp,
						isLong
					};
					return Array.make(
						Tuple.make(
							{
								startInput: startTimestamp,
								...CVDateTimeUtils.IsoYearDescriptor.fromTimestamp(startTimestamp)
							},
							{ startInput: startTimestamp, ...expected }
						),
						Tuple.make(
							{
								randomInput: randomTimestamp,
								...CVDateTimeUtils.IsoYearDescriptor.fromTimestamp(randomTimestamp)
							},
							{ randomInput: randomTimestamp, ...expected }
						),
						Tuple.make(
							{
								endInput: endTimestamp,
								...CVDateTimeUtils.IsoYearDescriptor.fromTimestamp(endTimestamp)
							},
							{ endInput: endTimestamp, ...expected }
						)
					);
				}),
				Array.flatten,
				Array.unzip
			);

			const zippedVector = Array.zip(actualVector, expectedVector);
			for (const [actual, expected] of zippedVector) {
				if (
					actual.year !== expected.year ||
					actual.isLong !== expected.isLong ||
					actual.startTimestamp !== expected.startTimestamp
				) {
					console.log(actual, expected);
					break;
				}
			}

			TEUtils.assertEquals(actualVector, expectedVector);
			/*TEUtils.assertEquals(CVDateTimeUtils.IsoYearDescriptor.fromTimestamp(16756934399999), {
				year: 2500,
				startTimestamp: 16725484800000,
				isLong: false
			});*/
		});

		it('fromIsoYear', () => {
			const actualVector = Array.map(yearVector, CVDateTimeUtils.IsoYearDescriptor.fromIsoYear);
			const expectedVector = Array.map(yearVector, (isoYear) => {
				const yearStartTimeStamp = Date.UTC(isoYear);
				const yearStartWeekDayIndex = weekDayIndexFromTimestamp(yearStartTimeStamp);
				return {
					year: isoYear,
					startTimestamp: yearStartTimeStamp + firstIsoWeekMs(yearStartWeekDayIndex),
					isLong: isLongIsoYear(yearStartWeekDayIndex, isLeapYear(isoYear))
				};
			});

			TEUtils.assertEquals(actualVector, expectedVector);
		});
	});
});
