/**
 * Extension to the Effect Tuple module providing safe single-element construction, element
 * replication, and prefix prepending.
 *
 * ## Mental model
 *
 * - **Tuples** are fixed-length arrays whose element types are tracked individually by TypeScript.
 * - This module focuses on a small set of constructors and editing helpers; combine them with
 *   Effect's `Tuple` for the rest.
 *
 * ## Common tasks
 *
 * - **Construct**: {@link of}, {@link replicate}
 * - **Edit**: {@link prependElement}
 *
 * ## Quickstart
 *
 * **Example** (Build a `[1]` tuple from `Array.map`)
 *
 * ```ts
 * import { Array, pipe } from 'effect';
 * import * as MTuple from '@parischap/effect-lib/MTuple';
 *
 * console.log(pipe([1, 2, 3], Array.map(MTuple.of))); // [[1], [2], [3]]
 * ```
 */

import * as Array from 'effect/Array';
import * as Tuple from 'effect/Tuple';

import type * as MTypes from './types/types.js';

/**
 * Builds a single-element tuple `[a]`.
 *
 * - Prefer this over `Tuple.make` inside callbacks of variadic-aware iterators (`Array.map`,
 *   `Array.filter`, …): those iterators pass extra arguments (the index, the source) and
 *   `Tuple.make`, being variadic, would silently include them. For example, `pipe([1, 2, 3],
 *   Array.map(Tuple.make))` yields `[[1, 0], [2, 1], [3, 2]]` rather than the probably-intended
 *   `[[1], [2], [3]]`.
 *
 * **Example** (Single-element tuple)
 *
 * ```ts
 * import { Array, pipe } from 'effect';
 * import * as MTuple from '@parischap/effect-lib/MTuple';
 *
 * console.log(pipe([1, 2, 3], Array.map(MTuple.of))); // [[1], [2], [3]]
 * ```
 *
 * @category Constructors
 */
export const of = <A>(a: A): [A] => Tuple.make(a);

/**
 * Builds a tuple of length `n` whose every element is `a`.
 *
 * - `n` is captured at the type level, so the result is typed `Tuple<A, N>`.
 *
 * **Example** (Replicate a value)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MTuple from '@parischap/effect-lib/MTuple';
 *
 * console.log(pipe('x', MTuple.replicate(3))); // ['x', 'x', 'x']
 * ```
 *
 * @category Constructors
 */
export const replicate =
  <N extends number>(n: N) =>
  <A>(a: A): MTypes.Tuple<A, N> =>
    Array.replicate(a, n) as never;

/**
 * Returns `[that, ...self]`, prepending `that` to the head of `self` while preserving the tuple
 * type.
 *
 * **Example** (Prepend an element)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MTuple from '@parischap/effect-lib/MTuple';
 *
 * console.log(pipe([2, 3] as const, MTuple.prependElement(1))); // [1, 2, 3]
 * ```
 *
 * @category Utils
 */
export const prependElement =
  <B>(that: B) =>
  <A extends ReadonlyArray<unknown>>(self: A): [B, ...A] =>
    [that, ...self] as const;
