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
import { TEUtils } from '@parischap/test-utils';
import { Array, Option, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('ByPasser', () => {
	const utilInspectLike = PPOption.darkModeUtilInspectLike;
	const valueBasedStylerConstructor = PPValueBasedStylerConstructor.fromOption(utilInspectLike);
	const markShowerConstructor = PPMarkShowerConstructor.fromOption(utilInspectLike);
	const constructors = {
		valueBasedStylerConstructor,
		markShowerConstructor
	};

	const empty = PPByPasser.empty;

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), PPByPasser.moduleTag);
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertEquals(
					empty,
					PPByPasser.make({
						id: 'Empty',
						action: () => () => Option.none()
					})
				);
			});

			it('Non-matching', () => {
				TEUtils.assertNotEquals(empty, PPByPasser.functionToName);
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
			TEUtils.assertSome(
				pipe(foo, PPValue.fromTopValue, initializedFunctionToName),
				pipe('[Function: foo]', ASStyle.green, PPStringifiedValue.fromText)
			);
		});

		it('Applied to unnamed function', () => {
			TEUtils.assertSome(
				pipe((n: number) => n + 1, PPValue.fromTopValue, initializedFunctionToName),
				pipe('[Function: anonymous]', ASStyle.green, PPStringifiedValue.fromText)
			);
		});

		it('Applied to non-function value', () => {
			TEUtils.assertNone(pipe(3, PPValue.fromTopValue, initializedFunctionToName));
		});
	});

	describe('objectToString', () => {
		const initializedObjectToString = PPByPasser.objectToString.call(utilInspectLike, constructors);
		it('Applied to primitive', () => {
			TEUtils.assertNone(pipe(3, PPValue.fromTopValue, initializedObjectToString));
		});

		it('Applied to object without a .toString method', () => {
			TEUtils.assertNone(pipe({ a: 3 }, PPValue.fromTopValue, initializedObjectToString));
		});

		it('Applied to object with a .toString method', () => {
			TEUtils.assertSome(
				pipe(
					{ a: 3, toString: (): string => 'foo\nbar' },
					PPValue.fromTopValue,
					initializedObjectToString
				),
				Array.make(ASStyle.yellow('foo'), ASStyle.yellow('bar'))
			);
		});

		it('Applied to a date', () => {
			TEUtils.assertTrue(
				pipe(new Date(0), PPValue.fromTopValue, initializedObjectToString, Option.isSome)
			);
		});

		it('Applied to an array', () => {
			TEUtils.assertNone(pipe([1, 2], PPValue.fromTopValue, initializedObjectToString));
		});
	});
});
