/**
 * A simple extension to the Effect Number module
 *
 * @since 0.0.6
 */

import { JsPatches } from '@parischap/js-lib';
import { Predicate } from 'effect';

/**
 * Constructs an integer from a string in base 10. Does not check input format and can return NaN
 *
 * @since 0.0.6
 * @category Constructors
 */

export const unsafeIntFromString = (s: string): number => parseInt(s, 10);

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

/**
 * Returns true if the provided number is NaN, +Infinity or -Infinity
 *
 * @since 0.3.4
 * @category Utils
 */

export const isNotFinite = Predicate.not(Number.isFinite);

/**
 * Returns true if the provided number is not NaN, +Infinity or -Infinity
 *
 * @since 0.3.4
 * @category Utils
 */

export const isFinite = Number.isFinite;
