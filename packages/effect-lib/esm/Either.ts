/** Extension to the Effect Either module providing flattening, traversal, and optional error recovery */

import { pipe } from 'effect';

import * as Cause from 'effect/Cause';
import * as Either from 'effect/Either';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Tuple from 'effect/Tuple';

import * as MTuple from './Tuple.js';
import * as MTypes from './Types/types.js';

/**
 * Type on which this module's functions operate
 *
 * @category Models
 */
export type Type<out A, out E = never> = Either.Either<A, E>;

/**
 * Converts an `Either` whose left channel may contain a `NoSuchElementException` into an `Either`
 * of `Option`. A `NoSuchElementException` left becomes a `right` of `none`; other lefts are
 * preserved; rights are wrapped in `some`.
 *
 * @category Utils
 */
export const optionFromOptional = <A, E>(
  self: Type<A, E>,
): Type<Option.Option<A>, Exclude<E, Cause.NoSuchElementException>> =>
  pipe(
    self,
    Either.map(Option.some),
    Either.orElse((e) =>
      e instanceof Cause.NoSuchElementException
        ? Either.right(Option.none<A>())
        : Either.left(e as Exclude<E, Cause.NoSuchElementException>),
    ),
  );

/**
 * Flattens a nested `Either<Either<R, L1>, L2>` into a single `Either<R, L1 | L2>`
 *
 * @category Utils
 */
export const flatten: <R, L1, L2>(
  self: Type<Type<R, L1>, L2>,
) => Type<R, L1 | L2> = Either.flatMap(Function.identity);

/**
 * Extracts the right value from an `Either` whose left channel is `never`. This is a type-safe
 * assertion that the `Either` is always a `right`.
 *
 * @category Utils
 */
export const getRightWhenNoLeft = <A>(self: Type<A>): A =>
  (self as Either.Right<never, A>).right;

/**
 * Distributes an `Either` over a pair: transforms an `Either<[A, B], L>` into a
 * `[Either<A, L>, Either<B, L>]`. Useful for error propagation in reduce or mapAccum operations.
 *
 * @category Utils
 */
export const traversePair = <A, B, L>(
  self: Type<MTypes.ReadonlyPair<A, B>, L>,
): MTypes.Pair<Type<A, L>, Type<B, L>> =>
  pipe(
    self,
    Either.map(Tuple.mapBoth({ onFirst: Either.right, onSecond: Either.right })),
    Either.getOrElse(MTuple.makeBothBy({ toFirst: Either.left, toSecond: Either.left })),
  );
