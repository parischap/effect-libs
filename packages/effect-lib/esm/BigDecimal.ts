/** A simple extension to the Effect BigDecimal module */

import { BigDecimal, flow, Function, Option, pipe, Tuple } from 'effect';
import * as MBigInt from './BigInt.js';
import * as MTypes from './types.js';

const _bigDecimalMinSafeInteger = BigDecimal.make(BigInt(Number.MIN_SAFE_INTEGER), 0);
const _bigDecimalMaxSafeInteger = BigDecimal.make(BigInt(Number.MAX_SAFE_INTEGER), 0);
const _tupledMake = Function.tupled(BigDecimal.make);

/**
 * Function that creates a Bigdecimal from a scale and a string representing a bigint
 *
 * @category Constructors
 */
export const unsafeFromIntString = (
	scale: number
): MTypes.OneArgFunction<string, BigDecimal.BigDecimal> =>
	flow(MBigInt.unsafeFromString, Tuple.make, Tuple.appendElement(scale), _tupledMake);

/**
 * Function that converts a BigDecimal to a number. Returns a `some` if the BigDecimal is in the
 * 64-bit range of a number. Returns a `none` otherwise
 *
 * @category Destructors
 */
export const toNumber: MTypes.OneArgFunction<BigDecimal.BigDecimal, Option.Option<number>> = flow(
	Option.liftPredicate(
		BigDecimal.between({ minimum: _bigDecimalMinSafeInteger, maximum: _bigDecimalMaxSafeInteger })
	),
	Option.map(BigDecimal.unsafeToNumber)
);

/**
 * BigDecimal instance representing the 0 value
 *
 * @category Instances
 */
export const zero: BigDecimal.BigDecimal = BigDecimal.make(0n, 0);

/**
 * Truncates a BigDecimal after `precision` decimal digits. `precision` must be a positive finite
 * integer. If not provided, `precision` is taken equal to 0.
 *
 * @category Utils
 */
export const trunc = (precision = 0): MTypes.OneArgFunction<BigDecimal.BigDecimal> =>
	BigDecimal.scale(precision);

/**
 * Returns `truncatedPart`, `self` truncated after `precision` decimal digits, and `followingpart`,
 * the difference between `self` and `truncatedPart`. `precision` must be a positive finite integer.
 * If not provided, `precision` is taken equal to 0.
 *
 * @category Destructors
 */

export const truncatedAndFollowingParts =
	(precision = 0) =>
	(
		self: BigDecimal.BigDecimal
	): [truncatedPart: BigDecimal.BigDecimal, followingpart: BigDecimal.BigDecimal] => {
		const truncatedPart = pipe(self, trunc(precision));
		return Tuple.make(truncatedPart, BigDecimal.subtract(self, truncatedPart));
	};
