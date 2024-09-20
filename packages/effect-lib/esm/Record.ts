/**
 * A simple extension to the Effect Record module
 *
 * @since 0.0.6
 */

import { Record } from 'effect';

/**
 * Unsafe get an element from a record. No checks, faster than the Effect version
 *
 * @since 0.0.6
 * @category Utils
 */
export const unsafeGet =
	(key: string) =>
	<A>(self: Record.ReadonlyRecord<string, A>): A =>
		// @ts-expect-error getting record content unsafely
		self[key];
