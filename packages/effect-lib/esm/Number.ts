/**
 * A simple extension to the Effect Number module
 *
 * @since 0.0.6
 */

import { JsPatches } from '@parischap/js-lib';

/**
 * Constructs an integer from a string. Does not check input format and can return NaN
 *
 * @since 0.0.6
 * @category Constructors
 */

export const unsafeIntFromString = (s: string): number => parseInt(s);

/**
 * Constructs a number from a string. Does not check input format and can return NaN
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
