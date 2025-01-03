/**
 * This modules implements a command string that produces an ANSI style, e.g `\x1b[1m` for bold
 *
 * @since 0.0.1
 */

import { MFunction, MString, MTypes } from '@parischap/effect-lib';
import { Array, flow, Option } from 'effect';

/** Type of an ANSI string */
export type Type = string;

/**
 * Type that represents the sequence of a style characteristic (numbers between `\x1b[` and `m` used
 * to generate this ANSI style, e.g [1] for bold)
 *
 * @since 0.0.1
 */
export interface Sequence extends ReadonlyArray<number> {}

/**
 * Same as Sequence but must constain at least one number
 *
 * @since 0.0.1
 */
export interface NonEmptySequence extends MTypes.ReadonlyOverOne<number> {}

/**
 * Builds an AnsiString from a NonEmptySequence
 *
 * @since 0.0.1
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
 * @since 0.0.1
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
 * @since 0.0.1
 * @category Constructors
 */
export const empty: Type = '';

/**
 * Reset AnsiString instance
 *
 * @since 0.0.1
 * @category Constructors
 */
export const reset: Type = fromNonEmptySequence(Array.of(0));
