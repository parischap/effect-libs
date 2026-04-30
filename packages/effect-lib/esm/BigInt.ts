/**
 * Extension to the Effect BigInt module providing safe constructors from primitives and numeric
 * predicates
 */

import { flow, pipe } from 'effect';
import * as BigInt from 'effect/BigInt';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as String from 'effect/String';

import type * as MTypes from './types/types.js';

/**
 * Type on which this module's functions operate
 *
 * @category Models
 */
export type Type = bigint;

/**
 * Constructs a `bigint` from a `string`, `number`, or `boolean`. Throws if the input is `NaN`,
 * `Infinity`, not an integer, or a string that does not represent a valid integer.
 *
 * @category Constructors
 */
export const fromPrimitiveOrThrow: MTypes.OneArgFunction<string | number | boolean, bigint> =
  BigInt.BigInt;

/**
 * Same as `fromPrimitiveOrThrow` but returns a `none` instead of throwing on invalid input.
 *
 * @category Constructors
 */
export const fromPrimitiveOption: MTypes.OneArgFunction<
  string | number | boolean,
  Option.Option<bigint>
> = Option.liftThrowable(fromPrimitiveOrThrow);

/**
 * Returns `true` if `self` is even
 *
 * @category Predicates
 */
export const isEven: Predicate.Predicate<Type> = (self) => self % 2n === 0n;

/**
 * Returns `true` if `self` is odd
 *
 * @category Predicates
 */
export const isOdd: Predicate.Predicate<Type> = Predicate.not(isEven);

/**
 * Returns the number of digits of `self` minus one (i.e. the integer part of the base-10
 * logarithm). Only valid for strictly positive bigints; behavior is undefined for zero or negative
 * values.
 *
 * @category Destructors
 */
export const unsafeLog10 = (self: Type): number =>
  pipe(self.toString(), String.length, Number.decrement);

/**
 * Safe version of `unsafeLog10`: returns a `some` of the integer part of the base-10 logarithm for
 * strictly positive bigints, or a `none` otherwise.
 *
 * @category Destructors
 */
export const log10: MTypes.OneArgFunction<Type, Option.Option<number>> = flow(
  Option.liftPredicate(BigInt.isGreaterThanOrEqualTo(0n)),
  Option.map(unsafeLog10),
);
