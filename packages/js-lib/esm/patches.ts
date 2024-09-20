/**
 * This module provides patches to the javascript in-built functions
 *
 * @since 0.0.4
 */

/**
 * Modulo - Use only with integers - Divisor must be positive. This implementation is slightly
 * faster than ((self % divisor) + divisor) % divisor
 *
 * @since 0.0.4
 * @category Utils
 */

export const intModulo =
	(divisor: number) =>
	(self: number): number =>
		self >= 0 ? self % divisor : (self % divisor) + divisor;
