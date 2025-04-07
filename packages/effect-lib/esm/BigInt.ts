/** A simple extension to the Effect BigInt module */

import { flow, Number, Option, pipe, Predicate, String } from 'effect';
import * as MTypes from './types.js';

/**
 * Constructs a bigint from a number
 *
 * @category Constructors
 */
export const unsafeFromNumber: MTypes.OneArgFunction<number, bigint> = BigInt;

/**
 * Returns `true` if `self` is positive
 *
 * @category Predicates
 */
export const isPositive: Predicate.Predicate<bigint> = (self) => self > 0n;

/**
 * Returns `true` if `self` is negative
 *
 * @category Predicates
 */
export const isNegative: Predicate.Predicate<bigint> = (self) => self < 0n;

/**
 * Returns `true` if `self` is zero
 *
 * @category Predicates
 */
export const isZero: Predicate.Predicate<bigint> = (self) => self === 0n;

/**
 * Returns `true` if `self` is even
 *
 * @category Predicates
 */
export const isEven: Predicate.Predicate<bigint> = (self) => self % 2n === 0n;

/**
 * Returns `true` if `self` is even
 *
 * @category Predicates
 */
export const isOdd: Predicate.Predicate<bigint> = Predicate.not(isEven);

/**
 * Calculates the base-10 log of a bigint
 *
 * @category Destructors
 */
export const unsafeLog10 = (self: bigint): number =>
	pipe(self.toString(), String.length, Number.decrement);

/**
 * Calculates the base-10 log of a bigint
 *
 * @category Destructors
 */
export const log10: MTypes.OneArgFunction<bigint, Option.Option<number>> = flow(
	Option.liftPredicate(isPositive),
	Option.map(unsafeLog10)
);
