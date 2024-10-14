/* eslint-disable functional/no-expression-statements */
import { MRegExpString } from '@parischap/effect-lib';
import { describe, expect, it } from 'vitest';

describe('MRegExpString', () => {
	describe('escape', () => {
		it('All together', () => {
			expect(MRegExpString.escape('\\ ^ $ * + ? . ( ) | { } [ ]')).toBe(
				'\\\\ \\^ \\$ \\* \\+ \\? \\. \\( \\) \\| \\{ \\} \\[ \\]'
			);
		});
	});
});
