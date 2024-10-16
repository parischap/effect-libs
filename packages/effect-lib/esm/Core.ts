/**
 * Module of helper functions used to avoid import circularity
 *
 * @since 0.5.0
 */

/**
 * Returns a new string where s has been prepended to self
 *
 * @since 0.5.0
 * @category Utils
 */
export const prependString =
	(s: string) =>
	(self: string): string =>
		s + self;

/**
 * Returns a new string where s has been appended to self
 *
 * @since 0.5.0
 * @category Utils
 */
export const appendString =
	(s: string) =>
	(self: string): string =>
		self + s;
