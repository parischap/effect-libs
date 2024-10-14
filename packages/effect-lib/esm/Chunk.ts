/**
 * A simple extension to the Effect Chunk module
 *
 * @since 0.0.6
 */

import { Boolean, Chunk, Option, Predicate, pipe } from 'effect';

/**
 * Returns true if the length of `self` is `l`
 *
 * @since 0.5.0
 * @category Predicates
 */
export const hasLength =
	(l: number) =>
	<A>(self: Chunk.Chunk<A>): boolean =>
		self.length === l;

/**
 * Returns true if the provided Chunk contains duplicates
 *
 * @since 0.0.6
 * @category Utils
 */
export const hasDuplicates = <A>(self: Chunk.Chunk<A>): boolean =>
	pipe(self, Chunk.dedupe, hasLength(self.length), Boolean.not);

/**
 * Returns a Chunk of the indexes of all elements of self matching the predicate
 *
 * @since 0.0.6
 * @category Utils
 */
export const findAll =
	<B extends A, A = B>(predicate: Predicate.Predicate<A>) =>
	(self: Chunk.Chunk<B>): Chunk.Chunk<number> =>
		Chunk.filterMap(self, (b, i) =>
			pipe(
				i,
				Option.liftPredicate(() => predicate(b))
			)
		);

/**
 * Returns a chunk containing all elements of self except the n last elements
 *
 * @since 0.0.6
 * @category Utils
 */
export const takeBut =
	(n: number) =>
	<A>(self: Chunk.Chunk<A>): Chunk.Chunk<A> =>
		Chunk.take(self, Chunk.size(self) - n);

/**
 * Returns a chunk containing all elements of self except the n first elements
 *
 * @since 0.0.6
 * @category Utils
 */
export const takeRightBut =
	(n: number) =>
	<A>(self: Chunk.Chunk<A>): Chunk.Chunk<A> =>
		Chunk.takeRight(self, Chunk.size(self) - n);
