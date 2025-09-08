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
		const parser = CVTemplateSeparator.toParser(separator);
		it('Not starting by value', () => {
			TEUtils.assertLeftMessage(
				parser(1, ''),
				"Expected remaining text for separator at position 1 to start with 'foo'. Actual: ''"
			);
			TEUtils.assertLeft(parser(1, 'fo1 and bar'));
		});

		it('Passing', () => {
			TEUtils.assertRight(parser(1, 'foo and bar'), ' and bar');
		});
	});
});
