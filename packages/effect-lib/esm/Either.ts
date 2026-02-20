/** A simple extension to the Effect Either module */

import { pipe } from 'effect';
import * as Cause from 'effect/Cause';
import * as Either from 'effect/Either';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as Tuple from 'effect/Tuple';
import * as MTuple from './Tuple.js';
import * as MTypes from './Types/types.js';

/**
 * Same as Effect.optionFromOptional but for Either's
 *
 * @category Utils
 */
export const optionFromOptional = <A, E>(
  self: Either.Either<A, E>,
): Either.Either<Option.Option<A>, Exclude<E, Cause.NoSuchElementException>> =>
  pipe(
    self,
    Either.map(Option.some),
    Either.orElse((e) =>
      e instanceof Cause.NoSuchElementException ?
        Either.right(Option.none<A>())
      : Either.left(e as Exclude<E, Cause.NoSuchElementException>),
    ),
  );

/**
 * Flattens two eithers into a single one
 *
 * @category Utils
 */
export const flatten: <R, L1, L2>(
  self: Either.Either<Either.Either<R, L1>, L2>,
) => Either.Either<R, L1 | L2> = Either.flatMap(Function.identity);

/**
 * Gets the value of an Either that can never be a left
 *
 * @category Utils
 */
export const getRightWhenNoLeft = <A>(self: Either.Either<A>): A =>
  (self as Either.Right<never, A>).right;

/**
 * Transforms an either of a tuple into a tuple of either's. Useful for instance for error
 * management in reduce or mapAccum
 *
 * @category Utils
 */
export const traversePair = <A, B, L>(
  self: Either.Either<MTypes.ReadonlyPair<A, B>, L>,
): MTypes.Pair<Either.Either<A, L>, Either.Either<B, L>> =>
  pipe(
    self,
    Either.map(Tuple.mapBoth({ onFirst: Either.right, onSecond: Either.right })),
    Either.getOrElse(MTuple.makeBothBy({ toFirst: Either.left, toSecond: Either.left })),
  );

/**
 * Recovers from the specified tagged error.
 *
 * @category Utils
 */
export const catchTag =
  <K extends E extends { readonly _tag: string } ? E['_tag'] : never, E, E1>(
    k: K,
    f: (e: Extract<E, { readonly _tag: K }>) => E1,
  ) =>
  <A>(self: Either.Either<A, E>): Either.Either<A, E1 | Exclude<E, { _tag: K }>> =>
    Either.mapLeft(self, (e) =>
      Predicate.isTagged(e, k) ?
        f(e as Extract<E, { readonly _tag: K }>)
      : (e as Exclude<E, { readonly _tag: K }>),
    );
