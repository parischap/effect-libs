/* eslint-disable functional/no-expression-statements */
import { ASContextFormatter, ASText } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { PPStyleMap, PPValue } from '@parischap/pretty-print';
import { Equal, Function, HashMap, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('StyleMap', () => {
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(PPStyleMap.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			const dummy = PPStyleMap.make({
				id: 'None',
				styles: HashMap.empty()
			});
			it('Matching', () => {
				expect(Equal.equals(PPStyleMap.none, dummy)).toBe(true);
			});

			it('Non-matching', () => {
				expect(Equal.equals(PPStyleMap.darkMode, PPStyleMap.none)).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(PPStyleMap.none.toString()).toBe(`None`);
		});

		it('.pipe()', () => {
			expect(PPStyleMap.none.pipe(PPStyleMap.id)).toBe('None');
		});

		describe('has', () => {
			it('Matching', () => {
				expect(PPStyleMap.has(PPStyleMap.none)).toBe(true);
			});
			it('Non matching', () => {
				expect(PPStyleMap.has(new Date())).toBe(false);
			});
		});
	});

	describe('get', () => {
		it('Existing partname', () => {
			expect(
				pipe(PPStyleMap.darkMode, PPStyleMap.get('Message'), ASContextFormatter.Unistyled.has)
			).toBe(true);
		});

		it('Missing partname', () => {
			expect(
				pipe(
					PPStyleMap.none,
					PPStyleMap.get('Message'),
					Function.apply(PPValue.fromTopValue(null)),
					Function.apply('foo'),
					ASText.toAnsiString
				)
			).toBe('foo');
		});
	});
});
