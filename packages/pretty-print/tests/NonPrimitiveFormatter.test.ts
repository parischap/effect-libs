/* eslint-disable functional/no-expression-statements */
import { ASText } from '@parischap/ansi-styles';
import { MTypes, MUtils } from '@parischap/effect-lib';
import {
	PPNonPrimitiveFormatter,
	PPOption,
	PPStringifiedValue,
	PPValue
} from '@parischap/pretty-print';
import { Equal, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('NonPrimitiveFormatter', () => {
	const utilInspectLike = PPOption.utilInspectLike;
	const valueBasedFormatterConstructor =
		PPOption.ValueBasedFormatterConstructor.fromOption(utilInspectLike);
	const markShowerConstructor = PPOption.MarkShowerConstructor.fromOption(utilInspectLike);
	const nonPrimitiveOption = PPOption.NonPrimitive.maps('Foo');

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(PPNonPrimitiveFormatter.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			const dummy = PPNonPrimitiveFormatter.make({
				id: 'SingleLine',
				action: () => () => () => PPStringifiedValue.empty
			});
			it('Matching', () => {
				expect(Equal.equals(PPNonPrimitiveFormatter.singleLine, dummy)).toBe(true);
			});

			it('Non-matching', () => {
				expect(
					Equal.equals(PPNonPrimitiveFormatter.singleLine, PPNonPrimitiveFormatter.tabify)
				).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(PPNonPrimitiveFormatter.singleLine.toString()).toBe(`SingleLine`);
		});

		it('.pipe()', () => {
			expect(PPNonPrimitiveFormatter.singleLine.pipe(PPNonPrimitiveFormatter.id)).toBe(
				'SingleLine'
			);
		});

		describe('has', () => {
			it('Matching', () => {
				expect(PPNonPrimitiveFormatter.has(PPNonPrimitiveFormatter.singleLine)).toBe(true);
			});
			it('Non matching', () => {
				expect(PPNonPrimitiveFormatter.has(new Date())).toBe(false);
			});
		});
	});

	it('singleLine', () => {
		expect(
			pipe(
				{ value: PPValue.fromTopValue({ a: 1, b: 2 }), header: ASText.fromString('Foo(2) ') },
				PPNonPrimitiveFormatter.singleLine.call(nonPrimitiveOption, {
					valueBasedFormatterConstructor,
					markShowerConstructor
				}),
				MTypes.isFunction
				/*Function.apply(
					Array.make(
						pipe('a : 1', ASText.fromString, PPStringifiedValue.fromText),
						pipe('b : 2', ASText.fromString, PPStringifiedValue.fromText)
					)
				),
				PPStringifiedValue.toUnstyledStrings*/
			)
		).toBe(true);
	});
});
