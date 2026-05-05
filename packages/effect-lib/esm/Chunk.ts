/**
 * Extension to the Effect Chunk module providing length and duplicate predicates, indexed search,
 * and slicing operations.
 *
 * ## Mental model
 *
 * - **`Chunk.Chunk<A>`** is an immutable, persistent sequence of elements of type `A`.
 * - All functions return new chunks; chunks are never mutated.
 * - Functions are **curried, data-last** — call as `MChunk.fn(arg)(chunk)` or `pipe(chunk,
 *   MChunk.fn(arg))`. They are not data-first/data-last dual.
 *
 * ## Common tasks
 *
 * - **Query**: {@link hasLength}, {@link hasDuplicates}
 * - **Search**: {@link findAll}
 * - **Slice**: {@link takeBut}, {@link takeRightBut}
 *
 * ## Quickstart
 *
 * **Example** (Indexed search and duplicate check)
 *
 * ```ts
 * import { Chunk, pipe } from 'effect';
 * import * as MChunk from '@parischap/effect-lib/MChunk';
 * import * as MPredicate from '@parischap/effect-lib/MPredicate';
 *
 * const chunk = Chunk.make(1, 2, 3, 2, 4);
 * console.log(MChunk.hasDuplicates(chunk)); // true
 * console.log(pipe(chunk, MChunk.findAll(MPredicate.strictEquals(2)))); // Chunk(1, 3)
 * ```
 */

import { pipe } from 'effect';
import * as Boolean from 'effect/Boolean';
import * as Chunk from 'effect/Chunk';
import type * as Predicate from 'effect/Predicate';
import * as Result from 'effect/Result';

import * as MFunction from './Function.js';

/**
 * Type on which this module's functions operate.
 *
 * @category Models
 */
export interface Type<out A> extends Chunk.Chunk<A> {}

/**
 * Returns `true` if the length of `self` is exactly `l`.
 *
 * - Use to assert that a chunk has a specific number of elements.
 * - Length comparison is `===`.
 *
 * **Example** (Length check)
 *
 * ```ts
 * import { Chunk, pipe } from 'effect';
 * import * as MChunk from '@parischap/effect-lib/MChunk';
 *
 * const chunk = Chunk.make(1, 2, 3);
 * console.log(pipe(chunk, MChunk.hasLength(3))); // true
 * console.log(pipe(chunk, MChunk.hasLength(2))); // false
 * ```
 *
 * @category Predicates
 */
export const hasLength =
  (l: number) =>
  <A>(self: Type<A>): boolean =>
    self.length === l;

/**
 * Returns `true` if `self` contains at least one duplicate, using `Equal.equals` for comparison.
 *
 * - Use to validate uniqueness constraints.
 * - Comparison uses Effect's `Equal.equals` (structural equality for `Equal`-aware types, otherwise
 *   `===`).
 * - Returns `false` for empty chunks.
 *
 * **Example** (Detecting duplicates)
 *
 * ```ts
 * import { Chunk } from 'effect';
 * import * as MChunk from '@parischap/effect-lib/MChunk';
 *
 * console.log(MChunk.hasDuplicates(Chunk.make(1, 2, 3))); // false
 * console.log(MChunk.hasDuplicates(Chunk.make(1, 2, 2, 3))); // true
 * ```
 *
 * @category Predicates
 */
export const hasDuplicates = <A>(self: Type<A>): boolean =>
  pipe(self, Chunk.dedupe, hasLength(self.length), Boolean.not);

/**
 * Returns a `Chunk` of the indexes of all elements of `self` satisfying `predicate`.
 *
 * - Use to locate every position matching a condition.
 * - Indexes are returned in ascending order.
 * - Returns an empty chunk when no element matches.
 *
 * **Example** (Indexes of matching elements)
 *
 * ```ts
 * import { Chunk, pipe } from 'effect';
 * import * as MChunk from '@parischap/effect-lib/MChunk';
 * import * as MPredicate from '@parischap/effect-lib/MPredicate';
 *
 * const chunk = Chunk.make(1, 2, 3, 2, 4);
 * console.log(pipe(chunk, MChunk.findAll(MPredicate.strictEquals(2)))); // Chunk(1, 3)
 * ```
 *
 * @category Utils
 */
export const findAll =
  <B extends A, A = B>(predicate: Predicate.Predicate<A>) =>
  (self: Type<B>): Chunk.Chunk<number> =>
    Chunk.filterMap(self, (b, i) =>
      pipe(
        i,
        Result.liftPredicate(() => predicate(b), MFunction.constFailVoid),
      ),
    );

/**
 * Returns a chunk containing all elements of `self` except the last `n`.
 *
 * - Use to drop a suffix of fixed size.
 * - When `n >= self.length`, returns an empty chunk.
 * - When `n <= 0`, returns `self` unchanged.
 *
 * **Example** (Drop trailing elements)
 *
 * ```ts
 * import { Chunk, pipe } from 'effect';
 * import * as MChunk from '@parischap/effect-lib/MChunk';
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5);
 * console.log(pipe(chunk, MChunk.takeBut(2))); // Chunk(1, 2, 3)
 * ```
 *
 * @category Utils
 *
 * @see {@link takeRightBut} — symmetric variant dropping the leading elements
 */
export const takeBut =
  (n: number) =>
  <A>(self: Type<A>): Chunk.Chunk<A> =>
    Chunk.take(self, Chunk.size(self) - n);

/**
 * Returns a chunk containing all elements of `self` except the first `n`.
 *
 * - Use to drop a prefix of fixed size.
 * - When `n >= self.length`, returns an empty chunk.
 * - When `n <= 0`, returns `self` unchanged.
 *
 * **Example** (Drop leading elements)
 *
 * ```ts
 * import { Chunk, pipe } from 'effect';
 * import * as MChunk from '@parischap/effect-lib/MChunk';
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5);
 * console.log(pipe(chunk, MChunk.takeRightBut(2))); // Chunk(3, 4, 5)
 * ```
 *
 * @category Utils
 *
 * @see {@link takeBut} — symmetric variant dropping the trailing elements
 */
export const takeRightBut =
  (n: number) =>
  <A>(self: Type<A>): Chunk.Chunk<A> =>
    Chunk.takeRight(self, Chunk.size(self) - n);
