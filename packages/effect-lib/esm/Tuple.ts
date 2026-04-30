/** Extension to the Effect Tuple module providing additional constructors and manipulation utilities */

import * as Array from 'effect/Array';
import * as Tuple from 'effect/Tuple';

import type * as MTypes from './types/types.js';

/**
 * Creates a one element tuple. `MTuple.of` must be used preferably to `Tuple.make` in functions
 * that send a variable number of arguments like Array.map or Array.filter because a tuple with
 * several arguments may accidentally be built. For instance, `Array.map([1, 2, 3], Tuple.make)`
 * will return `[[1,0], [2,1], [3,2]]` whereas you might expect `[[1], [2], [3]]`. That's because
 * `Array.map` and `Array.filter` send a second argument with the position of the value.
 *
 * @category Constructors
 */
export const of = <A>(a: A): [A] => Tuple.make(a);

/**
 * Creates a two element tuple with the same value
 *
 * @category Constructors
 */
export const replicate =
  <N extends number>(n: N) =>
  <A>(a: A): MTypes.Tuple<A, N> =>
    Array.replicate(a, n) as never;

/**
 * Prepends an element at the start of a tuple.
 *
 * @category Utils
 */
export const prependElement =
  <B>(that: B) =>
  <A extends ReadonlyArray<unknown>>(self: A): [B, ...A] =>
    [that, ...self] as const;
