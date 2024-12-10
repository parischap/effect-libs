import { MString, MTypes } from '@parischap/effect-lib';
import { Array, flow, Function, Option } from 'effect';

/**
 * Type that represents the sequence of a style characteristic (numbers between `\x1b[` and `m` used
 * to generate this ANSI style, e.g [1] for bold)
 *
 * @since 0.0.1
 */
export interface Sequence extends Array<number> {}

/**
 * Same as Sequence but must constain at least one number
 *
 * @since 0.0.1
 */
export interface NonEmptySequence extends Array.NonEmptyArray<number> {}

export const fromNonEmptySequenceToSequenceString: MTypes.OneArgFunction<NonEmptySequence, string> =
	flow(
		Array.map(MString.fromNumber(10)),
		Array.join(';'),
		MString.prepend('\x1b['),
		MString.append('m')
	);

export const fromSequenceToSequenceString: MTypes.OneArgFunction<Sequence, string> = flow(
	Option.liftPredicate(Array.isNonEmptyArray),
	Option.map(fromNonEmptySequenceToSequenceString),
	Option.getOrElse(Function.constant(''))
);
