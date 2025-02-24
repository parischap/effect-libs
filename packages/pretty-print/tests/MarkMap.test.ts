/* eslint-disable functional/no-expression-statements */
import { MUtils } from '@parischap/effect-lib';
import { PPMarkMap } from '@parischap/pretty-print';
import { Equal, HashMap } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MarkMap', () => {
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(PPMarkMap.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			const dummy = PPMarkMap.make({
				id: 'DefaultsHideNullables',
				marks: HashMap.empty()
			});
			it('Matching', () => {
				expect(Equal.equals(PPMarkMap.defaultsHideNullables, dummy)).toBe(true);
			});

			it('Non-matching', () => {
				expect(Equal.equals(PPMarkMap.defaultsHideNullables, PPMarkMap.defaults)).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(PPMarkMap.defaults.toString()).toBe(`Defaults`);
		});

		it('.pipe()', () => {
			expect(PPMarkMap.defaults.pipe(PPMarkMap.id)).toBe('Defaults');
		});

		describe('has', () => {
			it('Matching', () => {
				expect(PPMarkMap.has(PPMarkMap.defaults)).toBe(true);
			});
			it('Non matching', () => {
				expect(PPMarkMap.has(new Date())).toBe(false);
			});
		});
	});
});
