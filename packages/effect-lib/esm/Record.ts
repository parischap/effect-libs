import { Record } from 'effect';

export const unsafeGet =
	(key: string) =>
	<A>(self: Record.ReadonlyRecord<string, A>): A =>
		// @ts-expect-error getting record content unsafely
		self[key];
