/**
 * A simple extension to the Effect Option module
 *
 * @since 0.0.6
 */

import { Either, Option, flow } from 'effect';

/**
 * Type that synthesizes two different ways to represent an optional value. Useful to open a dev to
 * non effect users
 *
 * @since 0.0.6
 * @category Models
 */
export type OptionOrNullable<A> = Option.Option<A> | null | undefined | A;

/**
 * Converts an `OptionOrNullable` into an `Option`.
 *
 * @since 0.0.6
 * @category Utils
 */
export const fromOptionOrNullable = <A>(a: OptionOrNullable<A>): Option.Option<A> =>
	Option.isOption(a) ? a : Option.fromNullable(a);

/**
 * Transforms an `Option` of an `Either` in an `Either` of an `Option`
 *
 * @since 0.0.6
 * @category Utils
 */
export const traverseEither = <R, L>(
	o: Option.Option<Either.Either<R, L>>
): Either.Either<Option.Option<R>, L> =>
	Option.match(o, {
		onNone: () => Either.right(Option.none()),
		onSome: Either.match({ onLeft: Either.left, onRight: flow(Option.some, Either.right) })
	});

/**
 * Reads the next value of an Iterator into an Option
 *
 * @since 0.0.6
 * @category Utils
 */
export const fromNextIteratorValue = <A>(iterator: Iterator<A>): Option.Option<A> => {
	const next = iterator.next();
	return next.done === false ? Option.some(next.value) : Option.none();
};
