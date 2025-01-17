/**
 * This module implements two functions to pretty-print a value either as a Stringified (see
 * Stringified.ts) or as a string. It is the main module of this package.
 *
 * @since 0.0.1
 */

import { MTypes } from '@parischap/effect-lib';
import { Struct, flow } from 'effect';
import * as PPOption from './Option.js';
import * as PPString from './String.js';
import type * as PPStringifiedValue from './Stringified.js';
import * as PPValue from './Value.js';

/**
 * Pretty prints a value yielding the result as a Stringified
 *
 * @since 0.0.1
 * @category Utils
 */
export const asLines = (
	option: PPOption.Type = PPOption.unformattedSplitWhenTotalLengthExceeds40
): MTypes.OneArgFunction<unknown, PPStringifiedValue.Type> =>
	flow(PPValue.makeFromTopValue, PPValue.stringify(option));

/**
 * Pretty prints a value yielding the result as a string. The separator used to join all lines
 * together can be passed as parameter. It defaults to `\n`
 *
 * @since 0.0.1
 * @category Utils
 */
export const asString = (
	option: PPOption.Type & {
		readonly lineSep?: PPString.Type;
	} = PPOption.unformattedSplitWhenTotalLengthExceeds40
): MTypes.OneArgFunction<unknown, string> =>
	flow(
		asLines(option),
		PPString.join(option.lineSep ?? PPString.makeWith()('\n')),
		Struct.get('value')
	);
