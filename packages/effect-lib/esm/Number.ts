/** A simple extension to the Effect Number module */
import { Predicate } from 'effect';
import * as MTypes from './types.js';

/**
 * Constructs a number from a string. Does not check input format and can return NaN or Infinity
 *
 * @category Constructors
 */

export const unsafeFromString: MTypes.NumberFromString = (s) => +s;

/**
 * Modulo - Use only with finite integers - Unlike javascript remainder operator (%), this function
 * always returns a positive integer even if `self` or `divisor` is negative
 *
 * @category Utils
 */

export const intModulo =
	(divisor: number) =>
	(self: number): number =>
		self >= 0 ? self % divisor : (self % divisor) + divisor;

/**
 * Returns the `quotient` and `remainder` of the division of `self` by `divisor`. `remainder` always
 * has the sign of `divisor`. Use only with finite integers
 *
 * @category Utils
 */

export const quotientAndRemainder =
	(divisor: number) =>
	(self: number): [quotient: number, remainder: number] => {
		const quotient = Math.floor(self / divisor);
		return [quotient, self - quotient * divisor];
	};

/**
 * Returns the integer and fractional parts of a number. Use only with finite integers
 *
 * @category Utils
 */

export const decAndFracParts = (self: number): [decPart: number, fracPart: number] => {
	const decPart = Math.trunc(self);
	return [decPart, self - decPart];
};

/**
 * Returns true if the provided number is NaN, Infinity, +Infinity or -Infinity
 *
 * @category Predicates
 */
export const isNotFinite: Predicate.Predicate<number> = Predicate.not(Number.isFinite);

/**
 * Returns true if the provided number is not NaN, Infinity, +Infinity or -Infinity
 *
 * @category Utils
 */
export const isFinite: Predicate.Predicate<number> = Number.isFinite;

/**
 * Returns true if the provided number is an integer
 *
 * @category Predicates
 */
export const isInt: Predicate.Predicate<number> = Number.isInteger;

/**
 * Returns true if the provided number is not an integer
 *
 * @category Predicates
 */
export const isNotInt: Predicate.Predicate<number> = Predicate.not(Number.isInteger);

/**
 * Returns true if `self` is a multiple of `a`. Works even if `self` or `a` or both are negative
 *
 * @category Predicates
 */
export const isMultipleOf: (a: number) => Predicate.Predicate<number> = (a) => (self) =>
	self % a === 0;

/**
 * Returns `self` multiplied by 10^n
 *
 * @category Utils
 */
export const shift = (n: number) => (self: number) => self * Math.pow(10, n);
