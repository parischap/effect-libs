/** A simple extension to the Effect BigDecimal module */

import { BigDecimal } from 'effect';
import * as MTypes from './types.js';

/**
 * Function that creates a Bigdecimal
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
