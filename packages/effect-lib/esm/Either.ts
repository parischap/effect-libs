import { Cause, Either, Function, Option, Predicate, Tuple, pipe } from 'effect';
import * as MTuple from './Tuple.js';

/**
 * Same as Effect.optionFromOptional
 */
export const optionFromOptional = <A, E>(
	self: Either.Either<A, E>
): Either.Either<Option.Option<A>, Exclude<E, Cause.NoSuchElementException>> =>
	pipe(
		self,
		Either.map(Option.some),
		Either.orElse((e) =>
			e instanceof Cause.NoSuchElementException ?
				Either.right(Option.none<A>())
			:	Either.left(e as Exclude<E, Cause.NoSuchElementException>)
		)
	);

/**
 * Flattens two eithers into a single one
 */
export const flatten: <R, L1, L2>(
	self: Either.Either<Either.Either<R, L1>, L2>
) => Either.Either<R, L1 | L2> = Either.flatMap(Function.identity);

/**
 * gets the value of the Either.Either when it can never be a left
 */
export const getRightWhenNoLeft = <A>(self: Either.Either<A, never>): A =>
	(self as Either.Right<never, A>).right;

/**
 * Transforms an either of a tuple into a tuple of either's. Useful for instance for error management in reduce or mapAccum
 */
export const traversePair = <A, B, L>(
	self: Either.Either<readonly [A, B], L>
): [Either.Either<A, L>, Either.Either<B, L>] =>
	pipe(
		self,
		Either.map(Tuple.mapBoth({ onFirst: Either.right, onSecond: Either.right })),
		Either.getOrElse(MTuple.makeBothBy({ toFirst: Either.left, toSecond: Either.left }))
	);

/**
 * Recovers from the specified tagged error.
 *
 * @category error handling
 */
export const catchTag =
	<K extends E extends { readonly _tag: string } ? E['_tag'] : never, E, E1>(
		k: K,
		f: (e: Extract<E, { readonly _tag: K }>) => E1
	) =>
	<A>(self: Either.Either<A, E>): Either.Either<A, E1 | Exclude<E, { _tag: K }>> =>
		Either.mapLeft(self, (e) =>
			Predicate.isTagged(e, k) ?
				f(e as Extract<E, { readonly _tag: K }>)
			:	(e as Exclude<E, { readonly _tag: K }>)
		);
