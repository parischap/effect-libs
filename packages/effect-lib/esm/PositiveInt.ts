/**
 * This module implements a type that represents a positive integer and related functions. NaN,
 * +Infinity and -Infinity not allowed)
 *
 * @since 0.3.4
 */

import type * as MBrand from './Brand.js';
import type * as MInt from './Int.js';
import * as MIntRange from './IntRange.js';
import type * as MReal from './Real.js';

/**
 * Type for positive integers
 *
 * @since 0.3.4
 * @category Instances
 */
export type Type = MIntRange.Type<0, typeof Infinity>;

/**
 * Constructs a PositiveInt from a number without any verifications
 *
 * @since 0.3.4
 * @category Constructors
 */
export const unsafeFromNumber: MBrand.RefinedConstructor<number, Type> = MIntRange.unsafeFromNumber(
	0,
	+Infinity
);

/**
 * Constructs a PositiveInt from a number. Throws an error if the provided number is not an integer,
 * not positive or not finite
 *
 * @since 0.3.4
 * @category Constructors
 */
export const fromNumber: MBrand.RefinedConstructor<number, Type> = MIntRange.fromNumber(
	0,
	+Infinity
);

/**
 * Constructs a PositiveInt from a Real. Throws an error if the provided number is not a positive
 * integer
 *
 * @since 0.3.4
 * @category Constructors
 */
export const fromReal: MBrand.RefinedConstructor<MReal.Type, Type> = MIntRange.fromReal(
	0,
	+Infinity
);

/**
 * Constructs a PositiveInt from an Int. Throws an error if the provided Int is not positive
 *
 * @since 0.3.4
 * @category Constructors
 */
export const fromInt: MBrand.RefinedConstructor<MInt.Type, Type> = MIntRange.fromInt(0, +Infinity);
