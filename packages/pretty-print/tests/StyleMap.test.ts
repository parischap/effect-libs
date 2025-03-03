/* eslint-disable functional/no-expression-statements */
import { ASContextStyler, ASText } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { PPStyleMap, PPValue } from '@parischap/pretty-print';
import { Equal, Function, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('StyleMap', () => {
	const none = PPStyleMap.none;
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(PPStyleMap.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			const dummy = PPStyleMap.make(none);
			it('Matching', () => {
				expect(Equal.equals(none, dummy)).toBe(true);
			});

			it('Non-matching', () => {
				expect(Equal.equals(none, PPStyleMap.darkMode)).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(none.toString()).toBe(`None`);
		});

		it('.pipe()', () => {
			expect(none.pipe(PPStyleMap.id)).toBe('None');
		});

		describe('has', () => {
			it('Matching', () => {
				expect(PPStyleMap.has(none)).toBe(true);
			});
			it('Non matching', () => {
				expect(PPStyleMap.has(new Date())).toBe(false);
			});
		});
	});

	describe('get', () => {
		it('Existing partname', () => {
			expect(
				pipe(PPStyleMap.darkMode, PPStyleMap.get('Message'), ASContextStyler.Unistyled.has)
			).toBe(true);
		});

		it('Missing partname', () => {
			expect(
				pipe(
					none,
					PPStyleMap.get('Message'),
					Function.apply(PPValue.fromTopValue(null)),
					Function.apply('foo'),
					ASText.toAnsiString
				)
			).toBe('foo');
		});
	});
});
