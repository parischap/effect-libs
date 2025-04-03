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
 * Truncates a BigDecimal after `n` decimal digits. `n` must be a positive integer. If not provided,
 * `n` is taken equal to 0.
 *
 * @category Utils
 */
export const trunc = (n = 0): MTypes.OneArgFunction<BigDecimal.BigDecimal> => BigDecimal.scale(n);

/**
 * Returns the integer and fractional parts of a number. Use only with finite integers
 *
 * @category Utils
 */

export const integerAndFractionalParts = (
	self: BigDecimal.BigDecimal
): [decPart: BigDecimal.BigDecimal, fracPart: BigDecimal.BigDecimal] => {
	const integerPart = pipe(self, trunc());
	return Tuple.make(integerPart, BigDecimal.subtract(self, integerPart));
};
