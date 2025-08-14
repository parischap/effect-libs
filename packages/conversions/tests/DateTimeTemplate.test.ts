/* eslint-disable functional/no-expression-statements */
import { CVDateTime, CVDateTimeTemplate } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { Either, pipe } from 'effect';
import { describe, it } from 'vitest';

const localTimeZoneOffsetMs = CVDateTime.LOCAL_TIME_ZONE_OFFSET * CVDateTime.HOUR_MS;

describe('CVDateTimeTemplate', () => {
	const usContext = CVDateTimeTemplate.Context.us;

	describe('Context', () => {
		describe('Prototype and guards', () => {
			it('.toString()', () => {
				TEUtils.strictEqual(usContext.toString(), 'en-US');
			});

			it('.pipe()', () => {
				TEUtils.assertTrue(usContext.pipe(CVDateTimeTemplate.Context.has));
			});

			describe('has', () => {
				it('Matching', () => {
					TEUtils.assertTrue(CVDateTimeTemplate.Context.has(usContext));
				});
				it('Non matching', () => {
					TEUtils.assertFalse(CVDateTimeTemplate.Context.has(new Date()));
				});
			});
		});

		it('fromLocale', () => {
			TEUtils.assertSome(CVDateTimeTemplate.Context.fromLocale('en-US'));
		});
	});

	const tag = CVDateTimeTemplate.Placeholder.Tag.make;
	const sep = CVDateTimeTemplate.Placeholder.Separator.make;
	const template = CVDateTimeTemplate.make({
		context: usContext,
		placeholders: [tag('y'), sep('/'), tag('yyyy')]
	});

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(
				TEUtils.moduleTagFromTestFilePath(__filename),
				CVDateTimeTemplate.moduleTag
			);
		});

		it('.toString()', () => {
			TEUtils.strictEqual(template.toString(), "'y/yyyy' in 'en-US' context");
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(template.pipe(CVDateTimeTemplate.has));
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(CVDateTimeTemplate.has(template));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(CVDateTimeTemplate.has(new Date()));
			});
		});
	});

	describe('toParser', () => {
		const parser = CVDateTimeTemplate.toParser(template);
		it('Non matching', () => {
			TEUtils.assertLeftMessage(
				parser('125/0126'),
				"'year' placeholder is present twice in template and receives differing values '125' and '126'"
			);
		});

		it('Matching', () => {
			TEUtils.assertRight(
				pipe('125/0125', parser, Either.map(CVDateTime.timestamp)),
				Date.UTC(125) - localTimeZoneOffsetMs
			);
		});
	});

	describe('toFormatter', () => {
		const formatter = CVDateTimeTemplate.toFormatter(template);
		it('Non matching', () => {
			TEUtils.assertLeftMessage(
				formatter(CVDateTime.unsafeFromParts({ year: 10024 })),
				"Expected length of 'year' placeholder to be: 4. Actual: 5"
			);
		});

		it('Matching', () => {
			TEUtils.assertRight(
				pipe(formatter(CVDateTime.unsafeFromParts({ year: 2025, month: 8, monthDay: 13 }))),
				'2025/2025'
			);
		});
	});
});
