/**
 * A simple extension to the Effect Number module
 *
 * @since 0.0.6
 */

import { JsPatches } from '@parischap/js-lib';

/**
 * Constructs an integer from a string in base 10. Does not check input format and can return NaN
 *
 * @since 0.0.6
 * @category Constructors
 */

export const unsafeIntFromString = (s: string): number => parseInt(s, 10);

/**
 * Constructs a number from a string. Does not check input format and can return NaN, 'Infinity',
 * '+Infinity', '-Infinity'
 *
 * @since 0.0.6
 * @category Constructors
 */

export const unsafeFromString = (s: string): number => +s;

/**
 * Modulo - Use only with integers - Divisor must be positive.
 *
 * @since 0.0.6
 * @category Utils
 */

export const intModulo = JsPatches.intModulo;

/**
 * Returns true if the provided number is NaN, Infinity, +Infinity or -Infinity
 *
 * @since 0.3.4
 * @category Utils
 */
// DO NOT USE A TACIT FUNCTION because Number.isFinite takes an unknwon parameter
export const isNotFinite = (n: number) => !Number.isFinite(n);

/**
 * Returns true if the provided number is not NaN, Infinity, +Infinity or -Infinity
 *
 * @since 0.3.4
 * @category Utils
 */
// DO NOT USE A TACIT FUNCTION because Number.isFinite takes an unknwon parameter
export const isFinite = (n: number) => Number.isFinite(n);

/**
 * Returns true if the provided number is an integer
 *
 * @since 0.3.4
 * @category Utils
 */
// DO NOT USE A TACIT FUNCTION because Number.isInteger takes an unknwon parameter
export const isInt = (n: number) => Number.isInteger(n);

/**
 * Returns true if the provided number is not an integer
 *
 * @since 0.3.4
 * @category Utils
 */
// DO NOT USE A TACIT FUNCTION because Number.isInteger takes an unknwon parameter
export const isNotInt = (n: number) => !Number.isInteger(n);
