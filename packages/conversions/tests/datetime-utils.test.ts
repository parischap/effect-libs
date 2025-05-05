/* eslint-disable functional/no-expression-statements */
import { CVDateTimeUtils } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVDateTimeUtils', () => {
	describe('weekDayFromTimestamp', () => {
		it('1/1/1970', () => {
			TEUtils.strictEqual(CVDateTimeUtils.weekDayFromTimestamp(CVDateTimeUtils.DAY_MS / 2), 3);
		});

		it('Positive timestamp', () => {
			TEUtils.strictEqual(pipe(Date.UTC(2025, 4, 5), CVDateTimeUtils.weekDayFromTimestamp), 0);
		});

		it('Negative timestamp', () => {
			TEUtils.strictEqual(
				pipe(Date.UTC(1970, 4, 6, 23, 59, 59, 999), CVDateTimeUtils.weekDayFromTimestamp),
				2
			);
		});
	});

	describe('YearDescriptor', () => {
		describe('fromTimestamp', () => {
			describe('Last year of 400-year period', () => {
				it('End of last day - After 1/1/2001', () => {
					const year = 2800;
					const endOfLastYearDay = Date.UTC(year, 11, 31, 23, 59, 59, 999);
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTimeUtils.YearDescriptor.fromTimestamp(endOfLastYearDay), {
						year: year,
						isLeapYear: true,
						startTimestamp: startOfFirstYearDay
					});
				});

				it('Start of last day - Before 1/1/2001', () => {
					const year = 2000;
					const startOfLastYearDay = Date.UTC(year, 11, 31);
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTimeUtils.YearDescriptor.fromTimestamp(startOfLastYearDay), {
						year: year,
						isLeapYear: true,
						startTimestamp: startOfFirstYearDay
					});
				});
			});

			describe('Last year of a 100-year period', () => {
				it('End of last day - After 1/1/2001', () => {
					const year = 2600;
					const endOfLastYearDay = Date.UTC(year, 11, 31, 23, 59, 59, 999);
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTimeUtils.YearDescriptor.fromTimestamp(endOfLastYearDay), {
						year: year,
						isLeapYear: false,
						startTimestamp: startOfFirstYearDay
					});
				});

				it('Start of last day - Before 1/1/2001', () => {
					const year = 1900;
					const startOfLastYearDay = Date.UTC(year, 11, 31);
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTimeUtils.YearDescriptor.fromTimestamp(startOfLastYearDay), {
						year: year,
						isLeapYear: false,
						startTimestamp: startOfFirstYearDay
					});
				});
			});

			describe('On any leap year', () => {
				it('Random date - After 1/1/2001', () => {
					const year = 2944;
					const anyYearDay = Date.UTC(year, 8, 15);
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTimeUtils.YearDescriptor.fromTimestamp(anyYearDay), {
						year: year,
						isLeapYear: true,
						startTimestamp: startOfFirstYearDay
					});
				});

				it('Random date - Before 1/1/2001', () => {
					const year = 111;
					const anyYearDay = Date.UTC(year, 2, 31);
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTimeUtils.YearDescriptor.fromTimestamp(anyYearDay), {
						year: year,
						isLeapYear: false,
						startTimestamp: startOfFirstYearDay
					});
				});
			});
		});

		describe('fromYear', () => {
			describe('Last year of a 400-year period', () => {
				it('After 1/1/2001', () => {
					const year = 2800;
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTimeUtils.YearDescriptor.fromYear(year), {
						year: year,
						isLeapYear: true,
						startTimestamp: startOfFirstYearDay
					});
				});

				it('Before 1/1/2001', () => {
					const year = 2000;
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTimeUtils.YearDescriptor.fromYear(year), {
						year: year,
						isLeapYear: true,
						startTimestamp: startOfFirstYearDay
					});
				});
			});

			describe('Last year of a 100-year period', () => {
				it('After 1/1/2001', () => {
					const year = 2600;
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTimeUtils.YearDescriptor.fromYear(year), {
						year: year,
						isLeapYear: false,
						startTimestamp: startOfFirstYearDay
					});
				});

				it('Before 1/1/2001', () => {
					const year = 1900;
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTimeUtils.YearDescriptor.fromYear(year), {
						year: year,
						isLeapYear: false,
						startTimestamp: startOfFirstYearDay
					});
				});
			});

			describe('On any leap year', () => {
				it('After 1/1/2001', () => {
					const year = 2944;
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTimeUtils.YearDescriptor.fromYear(year), {
						year: year,
						isLeapYear: true,
						startTimestamp: startOfFirstYearDay
					});
				});

				it('Before 1/1/2001', () => {
					const year = 111;
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTimeUtils.YearDescriptor.fromYear(year), {
						year: year,
						isLeapYear: false,
						startTimestamp: startOfFirstYearDay
					});
				});
			});
		});

		describe('getLastOrdinalDayIndex', () => {
			it('Leap year', () => {
				TEUtils.strictEqual(
					pipe(
						2800,
						CVDateTimeUtils.YearDescriptor.fromYear,
						CVDateTimeUtils.YearDescriptor.getLastOrdinalDayIndex
					),
					365
				);
			});

			it('Normal year', () => {
				TEUtils.strictEqual(
					pipe(
						2025,
						CVDateTimeUtils.YearDescriptor.fromYear,
						CVDateTimeUtils.YearDescriptor.getLastOrdinalDayIndex
					),
					364
				);
			});
		});

		describe('getMonthDescriptorFromYearOffset', () => {
			it('On December 15th', () => {
				TEUtils.assertEquals(
					pipe(
						2800,
						CVDateTimeUtils.YearDescriptor.fromYear,
						CVDateTimeUtils.YearDescriptor.getMonthDescriptorFromYearOffset(
							28944000000 + 14 * CVDateTimeUtils.DAY_MS
						)
					),
					{
						monthIndex: 11,
						lastDayIndex: 30,
						monthStartMs: 28944000000
					}
				);
			});

			it('On December 1st', () => {
				TEUtils.assertEquals(
					pipe(
						2800,
						CVDateTimeUtils.YearDescriptor.fromYear,
						CVDateTimeUtils.YearDescriptor.getMonthDescriptorFromYearOffset(28944000000)
					),
					{
						monthIndex: 11,
						lastDayIndex: 30,
						monthStartMs: 28944000000
					}
				);
			});

			it('Same timestamp on normal and leap year', () => {
				TEUtils.assertEquals(
					pipe(
						-711,
						CVDateTimeUtils.YearDescriptor.fromYear,
						CVDateTimeUtils.YearDescriptor.getMonthDescriptorFromYearOffset(13046400000)
					),
					{
						monthIndex: 5,
						lastDayIndex: 29,
						monthStartMs: 13046400000
					}
				);
				TEUtils.assertEquals(
					pipe(
						2800,
						CVDateTimeUtils.YearDescriptor.fromYear,
						CVDateTimeUtils.YearDescriptor.getMonthDescriptorFromYearOffset(13046400000)
					),
					{
						monthIndex: 4,
						lastDayIndex: 30,
						monthStartMs: 10454400000
					}
				);
			});
		});

		describe('getIsoWeekDescriptor', () => {
			it('Short year', () => {
				TEUtils.assertEquals(
					pipe(
						2025,
						CVDateTimeUtils.YearDescriptor.fromYear,
						CVDateTimeUtils.YearDescriptor.getIsoWeekDescriptor
					),
					{
						firstYearDayWeekDay: 2,
						firstIsoWeekMs: -2 * CVDateTimeUtils.DAY_MS,
						lastIsoWeekIndex: 51
					}
				);

				TEUtils.assertEquals(
					pipe(
						1627,
						CVDateTimeUtils.YearDescriptor.fromYear,
						CVDateTimeUtils.YearDescriptor.getIsoWeekDescriptor
					),
					{
						firstYearDayWeekDay: 4,
						firstIsoWeekMs: 3 * CVDateTimeUtils.DAY_MS,
						lastIsoWeekIndex: 51
					}
				);
			});

			it('Long year', () => {
				TEUtils.assertEquals(
					pipe(
						2426,
						CVDateTimeUtils.YearDescriptor.fromYear,
						CVDateTimeUtils.YearDescriptor.getIsoWeekDescriptor
					),
					{
						firstYearDayWeekDay: 3,
						firstIsoWeekMs: -3 * CVDateTimeUtils.DAY_MS,
						lastIsoWeekIndex: 52
					}
				);

				TEUtils.assertEquals(
					pipe(
						1716,
						CVDateTimeUtils.YearDescriptor.fromYear,
						CVDateTimeUtils.YearDescriptor.getIsoWeekDescriptor
					),
					{
						firstYearDayWeekDay: 2,
						firstIsoWeekMs: -2 * CVDateTimeUtils.DAY_MS,
						lastIsoWeekIndex: 52
					}
				);
			});
		});
	});
});
