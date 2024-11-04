/**
 * This module implements two functions to pretty-print a value either as a StringifiedValue (see
 * StringifiedValue.ts) or as a string. It is the main module of this package.
 *
 * @since 0.0.1
 */

import { MTypes } from '@parischap/effect-lib';
import { Struct, flow } from 'effect';
import * as FormattedString from './FormattedString.js';
import * as Options from './Options.js';
import type * as StringifiedValue from './StringifiedValue.js';
import * as Value from './Value.js';

/**
 * Pretty prints a value yielding the result as a StringifiedValue
 *
 * @since 0.0.1
 * @category Utils
 */
export const asLines = (
	options: Options.Type = Options.uncoloredSplitWhenTotalLengthExceeds40
): MTypes.OneArgFunction<unknown, StringifiedValue.Type> =>
	flow(Value.makeFromTopValue(options), Value.stringify(options));

/**
 * Pretty prints a value yielding the result as a string. The separator used to join all lines
 * together can be passed as parameter. It defaults to `\n`
 *
 * @since 0.0.1
 * @category Utils
 */
export const asString = (
	options: Options.Type & {
		readonly lineSep?: FormattedString.Type;
	} = Options.uncoloredSplitWhenTotalLengthExceeds40
): MTypes.OneArgFunction<unknown, string> =>
	flow(
		asLines(options),
		FormattedString.join(options.lineSep ?? FormattedString.makeWith()('\n')),
		Struct.get('value')
	);
