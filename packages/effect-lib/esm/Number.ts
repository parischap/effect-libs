/** A simple extension to the Effect Number module */

/**
 * Constructs a number from a string. Does not check input format and can return NaN or Infinity
 *
 * @category Constructors
 */

export const unsafeFromString = (s: string): number => +s;

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
 * Returns the decimal and fractional parts of a number. Use only with finite integers
 *
 * @category Utils
 */

export const decAndFracParts = (self: number): [decPart: number, fracPart: number] => {
	const decPart = Math.floor(self) + (self < 0 ? 1 : 0);
	return [decPart, self - decPart];
};

/**
 * Returns true if the provided number is NaN, Infinity, +Infinity or -Infinity
 *
 * @category Utils
 */
// DO NOT USE A TACIT FUNCTION because Number.isFinite takes an unknown parameter
export const isNotFinite = (self: number) => !Number.isFinite(self);

/**
 * Returns true if the provided number is not NaN, Infinity, +Infinity or -Infinity
 *
 * @category Utils
 */
// DO NOT USE A TACIT FUNCTION because Number.isFinite takes an unknwon parameter
export const isFinite = (self: number) => Number.isFinite(self);

/**
 * Returns true if the provided number is an integer
 *
 * @category Utils
 */
// DO NOT USE A TACIT FUNCTION because Number.isInteger takes an unknwon parameter
export const isInt = (self: number) => Number.isInteger(self);

/**
 * Returns true if the provided number is not an integer
 *
 * @category Utils
 */
// DO NOT USE A TACIT FUNCTION because Number.isInteger takes an unknwon parameter
export const isNotInt = (self: number) => !Number.isInteger(self);

/**
 * Returns `self` multiplied by 10^n
 *
 * @category Utils
 */
export const shift = (n: number) => (self: number) => self * Math.pow(10, n);
