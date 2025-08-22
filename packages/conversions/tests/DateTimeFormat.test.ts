/* eslint-disable functional/no-expression-statements */
import { CVDateTime, CVDateTimeFormat } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { Either, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVDateTimeFormat', () => {
	const usContext = CVDateTimeFormat.Context.us;

	describe('Context', () => {
		describe('Prototype and guards', () => {
			it('.toString()', () => {
				TEUtils.strictEqual(usContext.toString(), 'en-US');
			});

			it('.pipe()', () => {
				TEUtils.assertTrue(usContext.pipe(CVDateTimeFormat.Context.has));
			});

			describe('has', () => {
				it('Matching', () => {
					TEUtils.assertTrue(CVDateTimeFormat.Context.has(usContext));
				});
				it('Non matching', () => {
					TEUtils.assertFalse(CVDateTimeFormat.Context.has(new Date()));
				});
			});
		});

		it('fromLocale', () => {
			TEUtils.assertSome(CVDateTimeFormat.Context.fromLocale('en-US'));
		});
	});

	const tag = CVDateTimeFormat.Placeholder.Tag.make;
	const sep = CVDateTimeFormat.Placeholder.Separator;
	const isoFormat = CVDateTimeFormat.make({
		context: usContext,
		placeholders: [
			tag('yyyy'),
			sep.hyphen,
			tag('MM'),
			sep.hyphen,
			tag('dd'),
			sep.make('T'),
			tag('HH'),
			sep.colon,
			tag('mm'),
			sep.colon,
			tag('ss'),
			sep.comma,
			tag('SSS'),
			tag('zHzH'),
			sep.colon,
			tag('zmzm')
		]
	});

	const exhaustiveFormat = CVDateTimeFormat.make({
		context: usContext,
		placeholders: [
			tag('y'),
			sep.space,
			tag('yy'),
			tag('yyyy'),
			tag('R'),
			sep.space,
			tag('RR'),
			tag('RRRR'),
			tag('M'),
			sep.space,
			tag('MM'),
			tag('MMM'),
			tag('MMMM'),
			tag('I'),
			sep.space,
			tag('II'),
			tag('d'),
			sep.space,
			tag('dd'),
			tag('D'),
			sep.space,
			tag('DDD'),
			tag('i'),
			sep.space,
			tag('iii'),
			tag('iiii'),
			tag('a'),
			tag('H'),
			sep.space,
			tag('HH'),
			tag('K'),
			sep.space,
			tag('KK'),
			tag('m'),
			sep.space,
			tag('mm'),
			tag('s'),
			sep.space,
			tag('ss'),
			tag('S'),
			sep.space,
			tag('SSS'),
			tag('zH'),
			sep.space,
			tag('zHzH'),
			tag('zm'),
			sep.space,
			tag('zmzm'),
			tag('zs'),
			sep.space,
			tag('zszs')
		]
	});

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVDateTimeFormat.moduleTag);
		});

		it('.toString()', () => {
			TEUtils.strictEqual(
				isoFormat.toString(),
				"'yyyy-MM-ddTHH:mm:ss,SSSzHzH:zmzm' in 'en-US' context"
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
					"'weekday' placeholder is present more than once in template and receives differing values '2' and '1'"
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
					formatter(CVDateTime.unsafeFromParts({ year: 10024 })),
					"Expected length of 'year' placeholder to be: 4. Actual: 5"
				);
			});

			it('Matching', () => {
				TEUtils.assertRight(
					pipe(
						formatter(
							CVDateTime.unsafeFromParts({ year: 2025, month: 8, monthDay: 13, zoneMinute: 42 })
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
					formatter(CVDateTime.unsafeFromParts({ year: 1925, month: 2, monthDay: 28 })),
					"Expected 'year' placeholder to be between 2000 (included) and 2099 (included). Actual: 1925"
				);
			});

			it('Matching', () => {
				TEUtils.assertRight(
					pipe(
						formatter(
							CVDateTime.unsafeFromParts({
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
