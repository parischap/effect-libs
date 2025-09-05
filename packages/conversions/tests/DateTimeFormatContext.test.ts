/* eslint-disable functional/no-expression-statements */
import { CVDateTimeFormatContext } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('CVDateTimeFormatContext', () => {
	const enGBContext = CVDateTimeFormatContext.enGB;

	describe('Prototype and guards', () => {
		it('.toString()', () => {
			TEUtils.strictEqual(enGBContext.toString(), 'en-GB');
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(enGBContext.pipe(CVDateTimeFormatContext.has));
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(CVDateTimeFormatContext.has(enGBContext));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(CVDateTimeFormatContext.has(new Date()));
			});
		});
	});

	it('fromLocale', () => {
		TEUtils.assertSome(CVDateTimeFormatContext.fromLocale('en-US'));
	});
});
