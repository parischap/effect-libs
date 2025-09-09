#!/usr/bin/env node
import { MTypes } from '@parischap/effect-lib';
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
	Array.map((s) => `${s}`),
	Array.join(';'),
	(s) => '\x1b[' + s,
	(s) => s + 'm'
);

/**
 * Builds an AnsiString from a Sequence
 *
 * @category Constructors
 */
export const fromSequence: MTypes.OneArgFunction<Sequence, string> = flow(
	Option.liftPredicate(MTypes.isReadonlyOverOne),
	Option.map(fromNonEmptySequence),
	Option.getOrElse(() => '')
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

/* eslint-disable functional/no-expression-statements */
console.log(fromNonEmptySequence([3, 4]));
