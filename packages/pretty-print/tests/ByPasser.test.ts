/* eslint-disable functional/no-expression-statements */
import { ASStyle } from '@parischap/ansi-styles';
import {
	PPByPasser,
	PPMarkShowerConstructor,
	PPOption,
	PPStringifiedValue,
	PPValue,
	PPValueBasedStylerConstructor
} from '@parischap/pretty-print';
import { Array, Equal, Option, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('ByPasser', () => {
	const utilInspectLike = PPOption.darkModeUtilInspectLike;
	const valueBasedStylerConstructor = PPValueBasedStylerConstructor.fromOption(utilInspectLike);
	const markShowerConstructor = PPMarkShowerConstructor.fromOption(utilInspectLike);
	const constructors = {
		valueBasedStylerConstructor,
		markShowerConstructor
	};

	const optionEq = Option.getEquivalence(PPStringifiedValue.equivalence);
	const empty = PPByPasser.empty;

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), PPByPasser.moduleTag);
		});

		describe('Equal.equals', () => {
			const dummy = PPByPasser.make({
				id: 'Empty',
				action: () => () => Option.none()
			});
			it('Matching', () => {
				TEUtils.assertTrue(Equal.equals(empty, dummy));
			});

			it('Non-matching', () => {
				TEUtils.assertFalse(Equal.equals(empty, PPByPasser.functionToName));
			});
		});

		it('.toString()', () => {
			TEUtils.strictEqual(empty.toString(), `Empty`);
		});

		it('.pipe()', () => {
			TEUtils.strictEqual(empty.pipe(PPByPasser.id), 'Empty');
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(PPByPasser.has(empty));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(PPByPasser.has(new Date()));
			});
		});
	});

	describe('functionToName', () => {
		const initializedFunctionToName = PPByPasser.functionToName.call(utilInspectLike, constructors);
		it('Applied to named function', () => {
			function foo(): string {
				return 'foo';
			}
			TEUtils.assertTrue(
				optionEq(
					pipe(foo, PPValue.fromTopValue, initializedFunctionToName),
					pipe('[Function: foo]', ASStyle.green, PPStringifiedValue.fromText, Option.some)
				)
			);
		});

		it('Applied to unnamed function', () => {
			TEUtils.assertTrue(
				optionEq(
					pipe((n: number) => n + 1, PPValue.fromTopValue, initializedFunctionToName),
					pipe('[Function: anonymous]', ASStyle.green, PPStringifiedValue.fromText, Option.some)
				)
			);
		});

		it('Applied to non-function value', () => {
			TEUtils.assertTrue(pipe(3, PPValue.fromTopValue, initializedFunctionToName, Option.isNone));
		});
	});

	describe('objectToString', () => {
		const initializedObjectToString = PPByPasser.objectToString.call(utilInspectLike, constructors);
		it('Applied to primitive', () => {
			TEUtils.assertTrue(pipe(3, PPValue.fromTopValue, initializedObjectToString, Option.isNone));
		});

		it('Applied to object without a .toString method', () => {
			TEUtils.strictEqual(
				pipe({ a: 3 }, PPValue.fromTopValue, initializedObjectToString, Option.isNone),
				true
			);
		});

		it('Applied to object with a .toString method', () => {
			TEUtils.assertTrue(
				optionEq(
					pipe(
						{ a: 3, toString: (): string => 'foo\nbar' },
						PPValue.fromTopValue,
						initializedObjectToString
					),
					pipe(Array.make(ASStyle.yellow('foo'), ASStyle.yellow('bar')), Option.some)
				)
			);
		});

		it('Applied to a date', () => {
			TEUtils.assertTrue(
				pipe(new Date(0), PPValue.fromTopValue, initializedObjectToString, Option.isSome)
			);
		});

		it('Applied to an array', () => {
			TEUtils.strictEqual(
				pipe([1, 2], PPValue.fromTopValue, initializedObjectToString, Option.isNone),
				true
			);
		});
	});
});
