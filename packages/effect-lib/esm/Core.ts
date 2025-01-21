/** Module of helper functions used to avoid import circularity */

/**
 * Returns a new string where s has been prepended to self
 *
 * @category Utils
 */
export const prependString =
	(s: string) =>
	(self: string): string =>
		s + self;

/**
 * Returns a new string where s has been appended to self
 *
 * @category Utils
 */
export const appendString =
	(s: string) =>
	(self: string): string =>
		self + s;
