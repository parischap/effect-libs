/**
 * Modulo - Use only with integers - Divisor must be positive. This implementation is slightly faster than ((self % divisor) + divisor) % divisor
 */

export const intModulo =
	(divisor: number) =>
	(self: number): number =>
		self >= 0 ? self % divisor : (self % divisor) + divisor;
