/* eslint-disable functional/no-expression-statements */
import { CVTemplatePart, CVTemplatePlaceholder, CVTemplateSeparator } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('CVTemplatePart', () => {
	const separator = CVTemplateSeparator.make('foo');
	const threeChars = CVTemplatePlaceholder.fixedLength({ name: 'foo', length: 3 });

	describe('isPlaceholder', () => {
		it('Not passing', () => {
			TEUtils.assertFalse(CVTemplatePart.isPlaceholder(separator));
		});

		it('Passing', () => {
			TEUtils.assertTrue(CVTemplatePart.isPlaceholder(threeChars));
		});
	});

	describe('isSeparator', () => {
		it('Not passing', () => {
			TEUtils.assertFalse(CVTemplatePart.isSeparator(threeChars));
		});

		it('Passing', () => {
			TEUtils.assertTrue(CVTemplatePart.isSeparator(separator));
		});
	});
});
