/** This modules implements a command string that produces an ANSI style, e.g. `\x1b[1m` for bold */

import { MFunction, MString, MTypes } from '@parischap/effect-lib';
import { Array, flow, Option } from 'effect';

/**
 * Type of an ANSI string
 *
 * @category Models
 */
export type Type = string;

/**
 * Type that represents the sequence of a command string (the numbers separated by a semicolon
 * between `\x1b[` and `m`, e.g. [1,31] for bold red)
 *
 * @category Models
 */
export interface Sequence extends ReadonlyArray<number> {}

/**
 * Same as Sequence but must constain at least one number
 *
 * @category Models
 */
export interface NonEmptySequence extends MTypes.ReadonlyOverOne<number> {}

/**
 * Builds an AnsiString from a NonEmptySequence
 *
 * @category Constructors
 */
export const fromNonEmptySequence: MTypes.OneArgFunction<NonEmptySequence, string> = flow(
	Array.map(MString.fromNumber(10)),
	Array.join(';'),
	MString.prepend('\x1b['),
	MString.append('m')
);

/**
 * Builds an AnsiString from a Sequence
 *
 * @category Constructors
 */
export const fromSequence: MTypes.OneArgFunction<Sequence, string> = flow(
	Option.liftPredicate(MTypes.isReadonlyOverOne),
	Option.map(fromNonEmptySequence),
	Option.getOrElse(MFunction.constEmptyString)
);

/**
 * Empty AnsiString instance
 *
 * @category Instances
 */
export const empty: Type = '';

/**
 * Reset AnsiString instance
 *
 * @category Instances
 */
export const reset: Type = fromNonEmptySequence(Array.of(0));
