/* eslint-disable functional/no-expression-statements */
import { CVTemplateSeparator } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('CVTemplateSeparator', () => {
	const separator = CVTemplateSeparator.make('foo');

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(
				TEUtils.moduleTagFromTestFilePath(__filename),
				CVTemplateSeparator.moduleTag
			);
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(separator.pipe(CVTemplateSeparator.has));
		});

		it('.toString()', () => {
			TEUtils.strictEqual(separator.toString(), 'foo');
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(CVTemplateSeparator.has(separator));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(CVTemplateSeparator.has(new Date()));
			});
		});
	});

	describe('Parsing', () => {
		const parser = separator.parser(1);
		it('Not starting by value', () => {
			TEUtils.assertLeftMessage(
				parser(''),
				"Expected remaining text for separator at position 1 to start with 'foo'. Actual: ''"
			);
			TEUtils.assertLeft(parser('fo1 and bar'));
		});

		it('Passing', () => {
			TEUtils.assertRight(parser('foo and bar'), ' and bar');
		});
	});

	it('Formatting', () => {
		TEUtils.strictEqual(separator.formatter(), 'foo');
	});
});
