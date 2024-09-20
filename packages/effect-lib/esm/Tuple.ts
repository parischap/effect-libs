/**
 * A simple extension to the Effect Tuple module
 *
 * @since 0.0.6
 */

import { Tuple, pipe } from 'effect';

/**
 * Creates a one element tuple. `MTuple.fromSingleValue` must be used preferably to `Tuple.make` in
 * functions that send a variable number of arguments like Array.map or Array.filter because a tuple
 * with several arguments may accidentally be built. For instance, `Array.map([1, 2, 3],
 * Tuple.make)` will return `[[1,0], [2,1], [3,2]]` whereas you might expect `[[1], [2], [3]]`.
 * That's because `Array.map` and `Array.filter` send a second argument with the position of the
 * value.
 *
 * @since 0.0.6
 * @category Constructors
 */
export const fromSingleValue = <A>(a: A): [A] => Tuple.make(a);

/**
 * Creates a two element tuple with the same value
 *
 * @since 0.0.6
 * @category Constructors
 */
export const makeBoth = <A>(a: A): [A, A] => Tuple.make(a, a);

/**
 * Creates a two element tuple applying two different functions to the same value
 *
 * @since 0.0.6
 * @category Constructors
 */
export const makeBothBy =
	<A, B, C>({
		toFirst,
		toSecond
	}: {
		readonly toFirst: (a: NoInfer<A>) => B;
		readonly toSecond: (a: NoInfer<A>) => C;
	}) =>
	(a: A): [B, C] =>
		pipe(a, makeBoth, Tuple.mapBoth({ onFirst: toFirst, onSecond: toSecond }));

/**
 * Prepends an element at the start of a tuple.
 *
 * @since 0.0.6
 * @category Utils
 */
export const prependElement =
	<B>(that: B) =>
	<A extends ReadonlyArray<unknown>>(self: A): [B, ...A] =>
		[that, ...self] as const;

/**
 * Returns the first two elements of a tuple
 *
 * @since 0.0.6
 * @category Utils
 */
export const firstTwo = <A, B, C extends ReadonlyArray<unknown>>(
	a: readonly [A, B, ...C]
): [A, B] => Tuple.make(a[0], a[1]);
