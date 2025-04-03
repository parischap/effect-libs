/** A simple extension to the Effect BigDecimal module */

import { BigDecimal, Tuple } from 'effect';
import * as MTypes from './types.js';

/**
 * Function that creates a Bigdecimal from a string representing an integer
 *
 * @category Constructors
 */
export const unsafeFromIntString =
	(scale: number): MTypes.OneArgFunction<string, BigDecimal.BigDecimal> =>
	(n) =>
		BigDecimal.make(BigInt(+n), scale);

/**
 * BigDecimal instance representing the 0 value
 *
 * @category Instances
 */
export const zero: BigDecimal.BigDecimal = BigDecimal.make(0n, 0);

/**
 * Identical to the Javascript trunc function but for BigDecimals
 *
 * @category Utils
 */
export const trunc = BigDecimal.scale(0);

/**
 * Returns the integer and fractional parts of a number. Use only with finite integers
 *
 * @category Utils
 */

export const integerAndFractionalParts = (
	self: BigDecimal.BigDecimal
): [decPart: BigDecimal.BigDecimal, fracPart: BigDecimal.BigDecimal] => {
	const decPart = trunc(self);
	return Tuple.make(decPart, BigDecimal.subtract(self, decPart));
};
