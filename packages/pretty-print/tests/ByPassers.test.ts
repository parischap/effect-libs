/* eslint-disable functional/no-expression-statements */
import { ASStyle } from '@parischap/ansi-styles';
import {
	PPByPasser,
	PPByPassers,
	PPMarkShowerConstructor,
	PPOption,
	PPStringifiedValue,
	PPValue,
	PPValueBasedStylerConstructor
} from '@parischap/pretty-print';
import { TEUtils } from '@parischap/test-utils';
import { Array, Option, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('ByPassers', () => {
	const utilInspectLike = PPOption.darkModeUtilInspectLike;
	const valueBasedStylerConstructor = PPValueBasedStylerConstructor.fromOption(utilInspectLike);
	const markShowerConstructor = PPMarkShowerConstructor.fromOption(utilInspectLike);
	const constructors = {
		valueBasedStylerConstructor,
		markShowerConstructor
	};

	const byPassers: PPByPassers.Type = Array.make(
		PPByPasser.functionToName,
		PPByPasser.objectToString
	);

	describe('initializedSyntheticByPasser', () => {
		const initializedSyntheticByPasser = PPByPassers.toSyntheticByPasser(byPassers).call(
			utilInspectLike,
			constructors
		);

		it('Applied to named function', () => {
			function foo(): string {
				return 'foo';
			}
			TEUtils.assertEquals(
				pipe(foo, PPValue.fromTopValue, initializedSyntheticByPasser),
				pipe('[Function: foo]', ASStyle.green, PPStringifiedValue.fromText, Option.some)
			);
		});

		it('Applied to object with a .toString method', () => {
			TEUtils.assertEquals(
				pipe(
					{ a: 3, toString: (): string => 'foo\nbar' },
					PPValue.fromTopValue,
					initializedSyntheticByPasser
				),
				pipe(Array.make(ASStyle.yellow('foo'), ASStyle.yellow('bar')), Option.some)
			);
		});

		it('Applied to primitive', () => {
			TEUtils.assertNone(pipe(3, PPValue.fromTopValue, initializedSyntheticByPasser));
		});
	});
});
