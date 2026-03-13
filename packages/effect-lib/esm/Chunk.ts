/** Extension to the Effect Chunk module providing predicates and slicing operations */

import { pipe } from 'effect';

import * as Boolean from 'effect/Boolean';
import * as Chunk from 'effect/Chunk';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';

/**
 * Type on which this module's functions operate
 *
 * @category Models
 */
export interface Type<out A> extends Chunk.Chunk<A> {}

/**
 * Returns true if the length of `self` is `l`
 *
 * @category Predicates
 */
export const hasLength =
  (l: number) =>
  <A>(self: Type<A>): boolean =>
    self.length === l;

/**
 * Returns `true` if the provided Chunk contains duplicates
 *
 * @category Predicates
 */
export const hasDuplicates = <A>(self: Type<A>): boolean =>
  pipe(self, Chunk.dedupe, hasLength(self.length), Boolean.not);

/**
 * Returns a Chunk of the indexes of all elements of self matching the predicate
 *
 * @category Utils
 */
export const findAll =
  <B extends A, A = B>(predicate: Predicate.Predicate<A>) =>
  (self: Type<B>): Chunk.Chunk<number> =>
    Chunk.filterMap(self, (b, i) =>
      pipe(
        i,
        Option.liftPredicate(() => predicate(b)),
      ),
    );

/**
 * Returns a chunk containing all elements of self except the n last elements
 *
 * @category Utils
 */
export const takeBut =
  (n: number) =>
  <A>(self: Type<A>): Chunk.Chunk<A> =>
    Chunk.take(self, Chunk.size(self) - n);

/**
 * Returns a chunk containing all elements of self except the n first elements
 *
 * @category Utils
 */
export const takeRightBut =
  (n: number) =>
  <A>(self: Type<A>): Chunk.Chunk<A> =>
    Chunk.takeRight(self, Chunk.size(self) - n);
