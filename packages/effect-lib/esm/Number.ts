/** A simple extension to the Effect Number module */
import { pipe, Predicate } from 'effect';
import * as MTypes from './types.js';

const TRIPLE_EPSILON = 3 * Number.EPSILON;

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
 * @category Destructors
 */

export const quotientAndRemainder =
	(divisor: number) =>
	(self: number): [quotient: number, remainder: number] => {
		const quotient = Math.floor(self / divisor);
		return [quotient, self - quotient * divisor];
	};

/**
 * Returns the absolute value of `self`
 *
 * @category Utils
 */
export const abs: MTypes.OneArgFunction<number> = Math.abs;

/**
 * Predicate that returns true if two numbers are equal
 *
 * @category Predicates
 */
export const equals =
	(n: number): Predicate.Predicate<number> =>
	(self) =>
		Math.abs(self - n) < TRIPLE_EPSILON;

/**
 * Truncates a number after `n` decimal digits. `n` must be a positive finite integer. If not
 * provided, `n` is taken equal to 0.
 *
 * @category Utils
 */
export const trunc =
	(n = 0) =>
	(self: number): number =>
		pipe(self, shift(n), Math.trunc, shift(-n));

/**
 * Returns `truncatedPart`, `self` truncated after `n` decimal digits, and followingpart, the
 * difference between `self` and `truncatedPart`. `n` must be a positive finite integer. If not
 * provided, `n` is taken equal to 0.
 *
 * @category Destructors
 */

export const truncatedAndFollowingParts =
	(n = 0) =>
	(self: number): [truncatedPart: number, followingpart: number] => {
		const truncatedPart = pipe(self, trunc(n));
		return [truncatedPart, self - truncatedPart];
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
 * @category Predicates
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
export const shift = (n: number) => (self: number) => self * 10 ** n;
