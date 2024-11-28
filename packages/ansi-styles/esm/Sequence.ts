/**
 * This module implements an array of numbers that represents the sequence of numbers to output
 * between `\x1b[` and `m` to produce an ansi-style. For instance [31] is the Sequence for the
 * Original red color and [38,5,9] the sequence for the EightBitRed color.
 *
 * @since 0.0.1
 */

import { MString, MTypes } from '@parischap/effect-lib';
import { Array, flow, Function, Number, Option } from 'effect';

/**
 * Type that represents a Sequence
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Array<number> {}

/**
 * Type that represents a non empty Sequence
 *
 * @since 0.0.1
 * @category Models
 */
export interface NonEmptyType extends Array.NonEmptyArray<number> {}

/**
 * Builds a sequence string from `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const toSequenceString: MTypes.OneArgFunction<NonEmptyType, string> = flow(
	Array.map(MString.fromNumber(10)),
	Array.join(';'),
	MString.prepend('\x1b['),
	MString.append('m')
);

/**
 * Empty Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const empty: Type = Array.empty();

/**
 * Reset Sequence instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const reset: NonEmptyType = Array.of(0);

const _resetString: string = toSequenceString(reset);
/**
 * Builds a StringTransformer from `self`. This StringTransformer sends the sequence string that
 * corresponds to `self`, then the string it receives as argument and finally the reset sequence
 * string.
 *
 * @since 0.0.1
 * @category Destructors
 */
export const toStringTransformer: MTypes.OneArgFunction<Type, MTypes.StringTransformer> = flow(
	Option.liftPredicate(Array.isNonEmptyArray),
	Option.map(
		flow(toSequenceString, MString.prepend, Function.compose(MString.append(_resetString)))
	),
	Option.getOrElse(() => Function.identity)
);

/**
 * Turns a foreground color sequence into a background color sequence.
 *
 * @since 0.0.1
 * @category Utils
 */
export const toBgSequence: MTypes.OneArgFunction<NonEmptyType, NonEmptyType> =
	Array.modifyNonEmptyHead(Number.sum(10));
