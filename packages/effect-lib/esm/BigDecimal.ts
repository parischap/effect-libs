/** A simple extension to the Effect BigDecimal module */

import { BigDecimal, pipe, Tuple } from 'effect';
import * as MTypes from './types.js';

/**
 * Function that creates a Bigdecimal from a string representing an bigint and a scale
 *
 * @category Constructors
 */
export const unsafeFromIntString =
	(scale: number): MTypes.OneArgFunction<string, BigDecimal.BigDecimal> =>
	(s) =>
		BigDecimal.make(BigInt(s), scale);

/**
 * BigDecimal instance representing the 0 value
 *
 * @category Instances
 */
export const zero: BigDecimal.BigDecimal = BigDecimal.make(0n, 0);

/**
 * Truncates a BigDecimal after `n` decimal digits. `n` must be a positive finite integer. If not
 * provided, `n` is taken equal to 0.
 *
 * @category Utils
 */
export const trunc = (n = 0): MTypes.OneArgFunction<BigDecimal.BigDecimal> => BigDecimal.scale(n);

/**
 * Returns `truncatedPart`, `self` truncated after `n` decimal digits, and `followingpart`, the
 * difference between `self` and `truncatedPart`. `n` must be a positive finite integer. If not
 * provided, `n` is taken equal to 0.
 *
 * @category Destructors
 */

export const truncatedAndFollowingParts =
	(n = 0) =>
	(
		self: BigDecimal.BigDecimal
	): [truncatedPart: BigDecimal.BigDecimal, followingpart: BigDecimal.BigDecimal] => {
		const truncatedPart = pipe(self, trunc(n));
		return Tuple.make(truncatedPart, BigDecimal.subtract(self, truncatedPart));
	};
