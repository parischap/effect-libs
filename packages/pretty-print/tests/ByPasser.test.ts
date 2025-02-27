/* eslint-disable functional/no-expression-statements */
import { ASStyle } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import {
	PPByPasser,
	PPMarkShowerConstructor,
	PPOption,
	PPStringifiedValue,
	PPValue,
	PPValueBasedFormatterConstructor
} from '@parischap/pretty-print';
import { Array, Equal, Option, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('ByPasser', () => {
	const utilInspectLike = PPOption.darkModeUtilInspectLike;
	const valueBasedFormatterConstructor =
		PPValueBasedFormatterConstructor.fromOption(utilInspectLike);
	const markShowerConstructor = PPMarkShowerConstructor.fromOption(utilInspectLike);
	const constructors = {
		valueBasedFormatterConstructor,
		markShowerConstructor
	};

	const optionEq = Option.getEquivalence(PPStringifiedValue.equivalence);
	const empty = PPByPasser.empty;

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
				expect(Equal.equals(empty, dummy)).toBe(true);
			});

			it('Non-matching', () => {
				expect(Equal.equals(empty, PPByPasser.functionToName)).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(empty.toString()).toBe(`Empty`);
		});

		it('.pipe()', () => {
			expect(empty.pipe(PPByPasser.id)).toBe('Empty');
		});

		describe('has', () => {
			it('Matching', () => {
				expect(PPByPasser.has(empty)).toBe(true);
			});
			it('Non matching', () => {
				expect(PPByPasser.has(new Date())).toBe(false);
			});
		});
	});

	describe('functionToName', () => {
		const initializedFunctionToName = PPByPasser.functionToName.call(utilInspectLike, constructors);
		it('Applied to named function', () => {
			function foo(): string {
				return 'foo';
			}
			expect(
				optionEq(
					pipe(foo, PPValue.fromTopValue, initializedFunctionToName),
					pipe('[Function: foo]', ASStyle.green, PPStringifiedValue.fromText, Option.some)
				)
			).toBe(true);
		});

		it('Applied to unnamed function', () => {
			expect(
				optionEq(
					pipe((n: number) => n + 1, PPValue.fromTopValue, initializedFunctionToName),
					pipe('[Function: anonymous]', ASStyle.green, PPStringifiedValue.fromText, Option.some)
				)
			).toBe(true);
		});

		it('Applied to non-function value', () => {
			expect(pipe(3, PPValue.fromTopValue, initializedFunctionToName, Option.isNone)).toBe(true);
		});
	});

	describe('objectToString', () => {
		const initializedObjectToString = PPByPasser.objectToString.call(utilInspectLike, constructors);
		it('Applied to primitive', () => {
			expect(pipe(3, PPValue.fromTopValue, initializedObjectToString, Option.isNone)).toBe(true);
		});

		it('Applied to object without a .toString method', () => {
			expect(pipe({ a: 3 }, PPValue.fromTopValue, initializedObjectToString, Option.isNone)).toBe(
				true
			);
		});

		it('Applied to object with a .toString method', () => {
			expect(
				optionEq(
					pipe(
						{ a: 3, toString: (): string => 'foo\nbar' },
						PPValue.fromTopValue,
						initializedObjectToString
					),
					pipe(Array.make(ASStyle.yellow('foo'), ASStyle.yellow('bar')), Option.some)
				)
			).toBe(true);
		});

		it('Applied to a date', () => {
			expect(
				pipe(new Date(0), PPValue.fromTopValue, initializedObjectToString, Option.isSome)
			).toBe(true);
		});

		it('Applied to an array', () => {
			expect(pipe([1, 2], PPValue.fromTopValue, initializedObjectToString, Option.isNone)).toBe(
				true
			);
		});
	});
});
