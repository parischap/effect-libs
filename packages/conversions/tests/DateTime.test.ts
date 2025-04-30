/* eslint-disable functional/no-expression-statements */
import { CVDateTime } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('CVDateTime', () => {
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVDateTime.moduleTag);
		});

		/*describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertEquals(utilInspectLike, PPMarkMap.make(utilInspectLike));
			});

			it('Non-matching', () => {
				TEUtils.assertFalse(
					Equal.equals(utilInspectLike, PPMarkMap.make({ ...utilInspectLike, id: 'Dummy' }))
				);
			});
		});

		it('.toString()', () => {
			TEUtils.strictEqual(utilInspectLike.toString(), `UtilInspectLike`);
		});

		it('.pipe()', () => {
			TEUtils.strictEqual(utilInspectLike.pipe(PPMarkMap.id), 'UtilInspectLike');
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(PPMarkMap.has(utilInspectLike));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(PPMarkMap.has(new Date()));
			});
		});*/
	});

	describe('YearData', () => {
		it('MAX_TIMESTAMP', () => {
			TEUtils.strictEqual(
				CVDateTime.MAX_TIMESTAMP,
				Date.UTC(CVDateTime.MAX_FULL_YEAR, 11, 31, 23, 59, 59, 999)
			);
		});

		it('MIN_TIMESTAMP', () => {
			TEUtils.strictEqual(CVDateTime.MIN_TIMESTAMP, Date.UTC(CVDateTime.MIN_FULL_YEAR));
		});

		describe('fromTimestamp', () => {
			describe('Last year of a 400-year period', () => {
				it('End of last day - After 1/1/2001', () => {
					const year = 2800;
					const endOfLastYearDay = Date.UTC(year, 11, 31, 23, 59, 59, 999);
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTime.YearData.fromTimestamp(endOfLastYearDay), {
						year: year,
						isLeapYear: true,
						yearStartMs: startOfFirstYearDay,
						r1Year: endOfLastYearDay - startOfFirstYearDay
					});
				});

				it('Start of last day - Before 1/1/2001', () => {
					const year = 2000;
					const startOfLastYearDay = Date.UTC(year, 11, 31);
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTime.YearData.fromTimestamp(startOfLastYearDay), {
						year: year,
						isLeapYear: true,
						yearStartMs: startOfFirstYearDay,
						r1Year: startOfLastYearDay - startOfFirstYearDay
					});
				});
			});

			describe('Last year of a 100-year period', () => {
				it('End of last day - After 1/1/2001', () => {
					const year = 2600;
					const endOfLastYearDay = Date.UTC(year, 11, 31, 23, 59, 59, 999);
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTime.YearData.fromTimestamp(endOfLastYearDay), {
						year: year,
						isLeapYear: false,
						yearStartMs: startOfFirstYearDay,
						r1Year: endOfLastYearDay - startOfFirstYearDay
					});
				});

				it('Start of last day - Before 1/1/2001', () => {
					const year = 1900;
					const startOfLastYearDay = Date.UTC(year, 11, 31);
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTime.YearData.fromTimestamp(startOfLastYearDay), {
						year: year,
						isLeapYear: false,
						yearStartMs: startOfFirstYearDay,
						r1Year: startOfLastYearDay - startOfFirstYearDay
					});
				});
			});

			describe('On any leap year', () => {
				it('Random date - After 1/1/2001', () => {
					const year = 2944;
					const anyYearDay = Date.UTC(year, 8, 15);
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTime.YearData.fromTimestamp(anyYearDay), {
						year: year,
						isLeapYear: true,
						yearStartMs: startOfFirstYearDay,
						r1Year: anyYearDay - startOfFirstYearDay
					});
				});

				it('Random date - Before 1/1/2001', () => {
					const year = 111;
					const anyYearDay = Date.UTC(year, 2, 31);
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTime.YearData.fromTimestamp(anyYearDay), {
						year: year,
						isLeapYear: false,
						yearStartMs: startOfFirstYearDay,
						r1Year: anyYearDay - startOfFirstYearDay
					});
				});
			});
		});

		describe('fromYearStart', () => {
			describe('Last year of a 400-year period', () => {
				it('After 1/1/2001', () => {
					const year = 2800;
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTime.YearData.fromYearStart(year), {
						year: year,
						isLeapYear: true,
						yearStartMs: startOfFirstYearDay,
						r1Year: 0
					});
				});

				it('Before 1/1/2001', () => {
					const year = 2000;
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTime.YearData.fromYearStart(year), {
						year: year,
						isLeapYear: true,
						yearStartMs: startOfFirstYearDay,
						r1Year: 0
					});
				});
			});

			describe('Last year of a 100-year period', () => {
				it('After 1/1/2001', () => {
					const year = 2600;
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTime.YearData.fromYearStart(year), {
						year: year,
						isLeapYear: false,
						yearStartMs: startOfFirstYearDay,
						r1Year: 0
					});
				});

				it('Before 1/1/2001', () => {
					const year = 1900;
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTime.YearData.fromYearStart(year), {
						year: year,
						isLeapYear: false,
						yearStartMs: startOfFirstYearDay,
						r1Year: 0
					});
				});
			});

			describe('On any leap year', () => {
				it('After 1/1/2001', () => {
					const year = 2944;
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTime.YearData.fromYearStart(year), {
						year: year,
						isLeapYear: true,
						yearStartMs: startOfFirstYearDay,
						r1Year: 0
					});
				});

				it('Before 1/1/2001', () => {
					const year = 111;
					const startOfFirstYearDay = Date.UTC(year, 0, 1);
					TEUtils.assertEquals(CVDateTime.YearData.fromYearStart(year), {
						year: year,
						isLeapYear: false,
						yearStartMs: startOfFirstYearDay,
						r1Year: 0
					});
				});
			});
		});
	});
});
