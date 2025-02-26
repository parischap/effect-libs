/* eslint-disable functional/no-expression-statements */
import { MUtils } from '@parischap/effect-lib';
import { PPMarkMap } from '@parischap/pretty-print';
import { Equal } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MarkMap', () => {
	const utilInspectLike = PPMarkMap.utilInspectLike;

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(PPMarkMap.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			const dummy = PPMarkMap.make(utilInspectLike);
			it('Matching', () => {
				expect(Equal.equals(utilInspectLike, dummy)).toBe(true);
			});

			it('Non-matching', () => {
				expect(Equal.equals(utilInspectLike, PPMarkMap.defaultsHideNullables)).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(utilInspectLike.toString()).toBe(`Defaults`);
		});

		it('.pipe()', () => {
			expect(utilInspectLike.pipe(PPMarkMap.id)).toBe('Defaults');
		});

		describe('has', () => {
			it('Matching', () => {
				expect(PPMarkMap.has(utilInspectLike)).toBe(true);
			});
			it('Non matching', () => {
				expect(PPMarkMap.has(new Date())).toBe(false);
			});
		});
	});
});
