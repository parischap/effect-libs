/** Extension to the Effect BigInt module providing safe constructors from primitives and numeric predicates */

import { flow, pipe } from 'effect';

import * as Brand from 'effect/Brand';
import * as Either from 'effect/Either';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as String from 'effect/String';

import * as MTypes from './Types/types.js';

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
  BigInt;

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
 * Same as `fromPrimitiveOrThrow` but returns a `left` of `BrandErrors` instead of throwing on
 * invalid input.
 *
 * @category Constructors
 */
export const fromPrimitive = (
  i: string | number | boolean,
): Either.Either<bigint, Brand.Brand.BrandErrors> =>
  Either.try({ try: () => BigInt(i), catch: (e) => Brand.error((e as Error).message) });

/**
 * Returns `true` if `self` is positive
 *
 * @category Predicates
 */
export const isPositive: Predicate.Predicate<Type> = (self) => self > 0n;

/**
 * Returns `true` if `self` is negative
 *
 * @category Predicates
 */
export const isNegative: Predicate.Predicate<Type> = (self) => self < 0n;

/**
 * Returns `true` if `self` is zero
 *
 * @category Predicates
 */
export const isZero: Predicate.Predicate<Type> = (self) => self === 0n;

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
  Option.liftPredicate(isPositive),
  Option.map(unsafeLog10),
);
