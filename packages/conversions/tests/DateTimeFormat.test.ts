/* eslint-disable functional/no-expression-statements */
import { CVDateTime, CVDateTimeFormat, CVDateTimeFormatContext } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { Either, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVDateTimeFormat', () => {
	const enGBContext = CVDateTimeFormatContext.enGB;

	const placeholder = CVDateTimeFormat.TemplatePart.Placeholder.make;
	const sep = CVDateTimeFormat.TemplatePart.Separator;
	const isoFormat = CVDateTimeFormat.make({
		context: enGBContext,
		templateparts: [
			placeholder('yyyy'),
			sep.hyphen,
			placeholder('MM'),
			sep.hyphen,
			placeholder('dd'),
			sep.make('T'),
			placeholder('HH'),
			sep.colon,
			placeholder('mm'),
			sep.colon,
			placeholder('ss'),
			sep.comma,
			placeholder('SSS'),
			placeholder('zHzH'),
			sep.colon,
			placeholder('zmzm')
		]
	});

	const exhaustiveFormat = CVDateTimeFormat.make({
		context: enGBContext,
		templateparts: [
			placeholder('y'),
			sep.space,
			placeholder('yy'),
			placeholder('yyyy'),
			placeholder('R'),
			sep.space,
			placeholder('RR'),
			placeholder('RRRR'),
			placeholder('M'),
			sep.space,
			placeholder('MM'),
			placeholder('MMM'),
			placeholder('MMMM'),
			placeholder('I'),
			sep.space,
			placeholder('II'),
			placeholder('d'),
			sep.space,
			placeholder('dd'),
			placeholder('D'),
			sep.space,
			placeholder('DDD'),
			placeholder('i'),
			sep.space,
			placeholder('iii'),
			placeholder('iiii'),
			placeholder('a'),
			placeholder('H'),
			sep.space,
			placeholder('HH'),
			placeholder('K'),
			sep.space,
			placeholder('KK'),
			placeholder('m'),
			sep.space,
			placeholder('mm'),
			placeholder('s'),
			sep.space,
			placeholder('ss'),
			placeholder('S'),
			sep.space,
			placeholder('SSS'),
			placeholder('zH'),
			sep.space,
			placeholder('zHzH'),
			placeholder('zm'),
			sep.space,
			placeholder('zmzm'),
			placeholder('zs'),
			sep.space,
			placeholder('zszs')
		]
	});

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVDateTimeFormat.moduleTag);
		});

		it('.toString()', () => {
			TEUtils.strictEqual(
				isoFormat.toString(),
				"'yyyy-MM-ddTHH:mm:ss,SSSzHzH:zmzm' in 'en-GB' context"
			);
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(isoFormat.pipe(CVDateTimeFormat.has));
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(CVDateTimeFormat.has(isoFormat));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(CVDateTimeFormat.has(new Date()));
			});
		});
	});

	describe('toParser', () => {
		describe('iso Format', () => {
			const parser = CVDateTimeFormat.toParser(isoFormat);
			it('Non matching', () => {
				TEUtils.assertLeftMessage(
					parser('2025-13-01T22:54:12,543+00:00'),
					"Expected 'month' to be between 1 (included) and 12 (included). Actual: 13"
				);
			});

			it('Matching', () => {
				TEUtils.assertRight(
					pipe('2025-12-01T22:54:12,543-03:22', parser, Either.map(CVDateTime.timestamp)),
					Date.UTC(2025, 11, 2, 2, 16, 12, 543)
				);
			});
		});

		describe('Exhaustive Format', () => {
			const parser = CVDateTimeFormat.toParser(exhaustiveFormat);
			it('Non matching', () => {
				TEUtils.assertLeftMessage(
					parser(
						'2025 2520252026 26202612 12DecDecember1 0130 30364 3641 MonMondayPM13 131 015 0553 53234 234+1 +0112 125 05'
					),
					"Expected 'monthDay' to be: 29. Actual: 30"
				);
				TEUtils.assertLeftMessage(
					parser(
						'2025 2520252026 26202612 12DecDecember1 0130 30364 3642 TueMondayPM13 131 015 0553 53234 234+1 +0112 125 05'
					),
					"#weekday is present more than once in template and receives differing values '2' and '1'"
				);
			});

			it('Matching', () => {
				TEUtils.assertRight(
					pipe(
						'2025 2520252026 26202612 12DecDecember1 0130 30364 3642 TueTuesdayPM13 131 015 0553 53234 234+1 +0112 125 05',
						parser,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2025, 11, 30, 11, 53, 48, 234)
				);
			});
		});
	});

	describe('toFormatter', () => {
		describe('iso Format', () => {
			const formatter = CVDateTimeFormat.toFormatter(isoFormat);
			it('Non matching', () => {
				TEUtils.assertLeftMessage(
					formatter(CVDateTime.fromPartsOrThrow({ year: 10024 })),
					'Expected length of #year to be: 4. Actual: 5'
				);
			});

			it('Matching', () => {
				TEUtils.assertRight(
					pipe(
						formatter(
							CVDateTime.fromPartsOrThrow({ year: 2025, month: 8, monthDay: 13, zoneMinute: 42 })
						)
					),
					'2025-08-13T00:00:00,000+00:42'
				);
			});
		});

		describe('Exhaustive Format', () => {
			const formatter = CVDateTimeFormat.toFormatter(exhaustiveFormat);

			it('Non matching', () => {
				TEUtils.assertLeftMessage(
					formatter(CVDateTime.fromPartsOrThrow({ year: 1925, month: 2, monthDay: 28 })),
					'Expected #year to be between 2000 (included) and 2099 (included). Actual: 1925'
				);
			});

			it('Matching', () => {
				TEUtils.assertRight(
					pipe(
						formatter(
							CVDateTime.fromPartsOrThrow({
								year: 2025,
								month: 2,
								monthDay: 28,
								minute: 54,
								zoneHour: -5
							})
						)
					),
					'2025 2520252025 2520252 02FebFebruary9 0928 2859 0595 FriFridayAM0 000 0054 540 000 000-5 -050 000 00'
				);
			});
		});
	});
});
