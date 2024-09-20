/* eslint-disable functional/no-expression-statements */
import { JsRegExp } from '@parischap/js-lib';
import { describe, expect, it } from 'vitest';

describe('JsRegExp', () => {
	describe('escape', () => {
		it('All together', () => {
			expect(JsRegExp.escape('\\ ^ $ * + ? . ( ) | { } [ ]')).toBe(
				'\\\\ \\^ \\$ \\* \\+ \\? \\. \\( \\) \\| \\{ \\} \\[ \\]'
			);
		});
	});
});
