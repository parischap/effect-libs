/* eslint-disable functional/no-expression-statements */
import { CVDateTime, CVDateTimeFormat } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { Either, pipe } from 'effect';
import { describe, it } from 'vitest';

const localTimeZoneOffsetMs = CVDateTime.LOCAL_TIME_ZONE_OFFSET * CVDateTime.HOUR_MS;

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
			tag('SSS')
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
			tag('SSS')
		]
	});

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVDateTimeFormat.moduleTag);
		});

		it('.toString()', () => {
			TEUtils.strictEqual(isoFormat.toString(), "'yyyy-MM-ddTHH:mm:ss,SSS' in 'en-US' context");
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
					parser('2025-13-01T22:54:12,543'),
					"Expected 'month' to be between 1 and 12 included. Actual: 13"
				);
			});

			it('Matching', () => {
				TEUtils.assertRight(
					pipe('2025-12-01T22:54:12,543', parser, Either.map(CVDateTime.timestamp)),
					Date.UTC(2025, 11, 1, 22, 54, 12, 543) - localTimeZoneOffsetMs
				);
			});
		});

		describe('Exhaustive Format', () => {
			const parser = CVDateTimeFormat.toParser(exhaustiveFormat);
			it('Non matching', () => {
				TEUtils.assertLeftMessage(
					parser('2025-13-01T22:54:12,543'),
					"Expected 'month' to be between 1 and 12 included. Actual: 13"
				);
			});

			it('Matching', () => {
				TEUtils.assertRight(
					pipe(
						'2025 2520252026 26202612 12DecDecember1 01',
						parser,
						Either.map(CVDateTime.timestamp)
					),
					Date.UTC(2025, 11, 1, 22, 54, 12, 543) - localTimeZoneOffsetMs
				);
			});
		});
	});

	describe('toFormatter', () => {
		describe('Exhaustive Format', () => {
			const formatter = CVDateTimeFormat.toFormatter(exhaustiveFormat);
			it('Non matching', () => {
				TEUtils.assertLeftMessage(
					formatter(CVDateTime.unsafeFromParts({ year: 10024 })),
					"Expected length of 'year' placeholder to be: 4. Actual: 5"
				);
			});

			it('Matching', () => {
				TEUtils.assertRight(
					pipe(formatter(CVDateTime.unsafeFromParts({ year: 2025, month: 8, monthDay: 13 }))),
					'2025-08-13T00:00:00,000'
				);
			});
		});
	});
});
