/* eslint-disable functional/no-expression-statements */
import { ASText } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { PPByPasser, PPOption, PPStringifiedValue, PPValue } from '@parischap/pretty-print';
import { Equal, Option, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('ByPasser', () => {
	const utilInspectLike = PPOption.utilInspectLike;
	const valueBasedFormatterConstructor =
		PPOption.ValueBasedFormatterConstructor.fromOption(utilInspectLike);
	const markShowerConstructor = PPOption.MarkShowerConstructor.fromOption(utilInspectLike);

	const optionEq = Option.getEquivalence(PPStringifiedValue.equivalence);

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(PPByPasser.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			const dummy = PPByPasser.make({
				id: 'Empty',
				action: () => () => Option.none()
			});
			it('Matching', () => {
				expect(Equal.equals(PPByPasser.empty, dummy)).toBe(true);
			});

			it('Non-matching', () => {
				expect(Equal.equals(PPByPasser.empty, PPByPasser.functionToName)).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(PPByPasser.empty.toString()).toBe(`Empty`);
		});

		it('.pipe()', () => {
			expect(PPByPasser.empty.pipe(PPByPasser.id)).toBe('Empty');
		});

		describe('has', () => {
			it('Matching', () => {
				expect(PPByPasser.has(PPByPasser.empty)).toBe(true);
			});
			it('Non matching', () => {
				expect(PPByPasser.has(new Date())).toBe(false);
			});
		});
	});

	describe('functionToName', () => {
		it('Applied to named function', () => {
			function foo(): string {
				return 'foo';
			}
			expect(
				optionEq(
					pipe(
						foo,
						PPValue.fromTopValue,
						PPByPasser.functionToName.call(utilInspectLike, {
							valueBasedFormatterConstructor,
							markShowerConstructor
						})
					),
					pipe('[Function: foo]', ASText.fromString, PPStringifiedValue.fromText, Option.some)
				)
			).toBe(true);
		});

		it('Applied to unnamed function', () => {
			expect(
				optionEq(
					pipe(
						(n: number) => n + 1,
						PPValue.fromTopValue,
						PPByPasser.functionToName.call(utilInspectLike, {
							valueBasedFormatterConstructor,
							markShowerConstructor
						})
					),
					pipe('[Function: anonymous]', ASText.fromString, PPStringifiedValue.fromText, Option.some)
				)
			).toBe(true);
		});

		it('Applied to non-function value', () => {
			expect(
				pipe(
					3,
					PPValue.fromTopValue,
					PPByPasser.functionToName.call(utilInspectLike, {
						valueBasedFormatterConstructor,
						markShowerConstructor
					}),
					Option.isNone
				)
			).toBe(true);
		});
	});

	describe('objectToString', () => {
		it('Applied to primitive', () => {
			expect(
				pipe(
					3,
					PPValue.fromTopValue,
					PPByPasser.objectToString.call(utilInspectLike, {
						valueBasedFormatterConstructor,
						markShowerConstructor
					}),
					Option.isNone
				)
			).toBe(true);
		});

		it('Applied to object without a .toString method', () => {
			expect(
				pipe(
					3,
					PPValue.fromTopValue,
					PPByPasser.objectToString.call(utilInspectLike, {
						valueBasedFormatterConstructor,
						markShowerConstructor
					}),
					Option.isNone
				)
			).toBe(true);
		});

		it('Applied to object without a .toString method', () => {
			expect(
				pipe(
					{ a: 3 },
					PPValue.fromTopValue,
					PPByPasser.objectToString.call(utilInspectLike, {
						valueBasedFormatterConstructor,
						markShowerConstructor
					}),
					Option.isNone
				)
			).toBe(true);
		});

		it('Applied to object with a .toString method', () => {
			expect(
				optionEq(
					pipe(
						{ a: 3, toString: (): string => 'foo' },
						PPValue.fromTopValue,
						PPByPasser.objectToString.call(utilInspectLike, {
							valueBasedFormatterConstructor,
							markShowerConstructor
						})
					),
					pipe('foo', ASText.fromString, PPStringifiedValue.fromText, Option.some)
				)
			).toBe(true);
		});
	});
});
