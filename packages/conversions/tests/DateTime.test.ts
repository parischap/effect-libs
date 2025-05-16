/* eslint-disable functional/no-expression-statements */
import { CVDateTime, CVDateTimeUtils } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('CVDateTime', () => {
	const YEAR_START_2001_MS = 978_307_200_000;

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

	describe('ordinalDay', () => {
		// 01/01/2001 11:00:00:000
		const timestamp = YEAR_START_2001_MS + 11 * CVDateTimeUtils.HOUR_MS;
		it('timeZoneOffset=0', () => {
			const date = CVDateTime.unsafeFromTimestamp({
				timestamp,
				timeZoneOffset: 0
			});
			TEUtils.assertNone(date.ordinalDayIndex);
			TEUtils.strictEqual(CVDateTime.ordinalDay(date), 1);
			TEUtils.assertSome(date.ordinalDayIndex, 0);
		});

		it('timeZoneOffset=15', () => {
			const date = CVDateTime.unsafeFromTimestamp({
				timestamp,
				timeZoneOffset: 15
			});
			TEUtils.strictEqual(CVDateTime.ordinalDay(date), 2);
		});

		it('timestamp=0, timeZoneOffset=-12', () => {
			const date = CVDateTime.unsafeFromTimestamp({
				timestamp,
				timeZoneOffset: -12
			});
			TEUtils.strictEqual(CVDateTime.ordinalDay(date), 366);
		});
	});

	describe('month and monthDay', () => {
		// 30/11/2000 05:00:00:000
		const timestamp =
			YEAR_START_2001_MS - 32 * CVDateTimeUtils.DAY_MS + 5 * CVDateTimeUtils.HOUR_MS;
		it('month and then monthDay', () => {
			const date = CVDateTime.unsafeFromTimestamp({
				timestamp,
				timeZoneOffset: 0
			});
			TEUtils.assertNone(date.monthIndex);
			TEUtils.assertNone(date.monthDayIndex);
			TEUtils.strictEqual(CVDateTime.month(date), 11);
			TEUtils.assertSome(date.monthIndex, 10);
			TEUtils.assertNone(date.monthDayIndex);
			TEUtils.strictEqual(CVDateTime.monthDay(date), 30);
			TEUtils.assertSome(date.monthIndex, 10);
			TEUtils.assertSome(date.monthDayIndex, 29);
		});

		it('monthDay directly', () => {
			const date = CVDateTime.unsafeFromTimestamp({
				timestamp,
				timeZoneOffset: 0
			});
			TEUtils.assertNone(date.monthIndex);
			TEUtils.assertNone(date.monthDayIndex);
			TEUtils.strictEqual(CVDateTime.monthDay(date), 30);
			TEUtils.assertSome(date.monthIndex, 10);
			TEUtils.assertSome(date.monthDayIndex, 29);
		});
	});
});
