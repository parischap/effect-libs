/** A simple extension to the Effect Number module */
import { pipe, Predicate } from 'effect';
import * as MTypes from './types.js';

/** Maximum safe integer in JavaScript (2^53 – 1). */
export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

/** Minimum safe integer in JavaScript -(2^53 – 1). */
export const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;

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
	(self: number): number => {
		const rest = self % divisor;
		return rest < 0 ? rest + Math.abs(divisor) : rest;
	};

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
		Math.abs(self - n) < Number.EPSILON;

/**
 * Truncates a number after `precision` decimal digits. `precision` must be a positive finite
 * integer. If not provided, `precision` is taken equal to 0.
 *
 * @category Utils
 */
export const trunc =
	(precision = 0) =>
	(self: number): number =>
		pipe(self, shift(precision), Math.trunc, shift(-precision));

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
