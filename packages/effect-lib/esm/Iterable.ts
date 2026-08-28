/**
 * Lazy Iterable-returning counterparts of select `MArray` functions: predicates, indexed search,
 * indexed (un)grouping, sorted-iterator merging/difference, and cycle-aware unfolding.
 *
 * ## Mental model
 *
 * - Every function accepts an `Iterable<A>` and returns a new `Iterable<B>`: nothing is computed
 *   until the result is iterated (e.g. spread with `[...result]` or consumed by a `for...of`).
 * - Each function has an eager `MArray` twin of the same name, with identical semantics — only
 *   eagerness differs.
 * - All functions are **curried, data-last** — call as `pipe(self, MIterable.fn(arg))`.
 * - Equality-based functions (e.g. {@link longestCommonSubArray}, {@link differenceSorted}) compare
 *   with `Equal.equals`.
 *
 * ## Common tasks
 *
 * - **Search**: {@link findAll}, {@link longestCommonSubArray}
 * - **Drop**: {@link takeRightBut}
 * - **Modify by position**: {@link modifyHead}, {@link modifyTail}
 * - **Ungroup**: {@link ungroup}
 * - **Sorted operations**: {@link mergeSorted}, {@link differenceSorted}
 * - **Construct**: {@link unfold}
 *
 * ## Gotchas
 *
 * - An Iterable returned by any function here can only be consumed once per source Iterable if that
 *   source is itself single-pass (e.g. a generator); re-iterating the result then re-reads the
 *   source from where it left off, not from the start. Sourcing from an `Array` (multi-pass) avoids
 *   this.
 *
 * ## Quickstart
 *
 * **Example** (Filtering lazily, materializing only at the end)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MIterable from '@parischap/effect-lib/MIterable';
 *
 * console.log([
 *   ...pipe(
 *     [1, 3, 2, 4, 3],
 *     MIterable.findAll((n) => n === 3),
 *   ),
 * ]); // [1, 4]
 * ```
 *
 * @see `MArray` — eager counterparts of these functions
 */
import { pipe } from 'effect';
import * as Array from 'effect/Array';
import * as Equal from 'effect/Equal';
import type * as Equivalence from 'effect/Equivalence';
import * as Iterable from 'effect/Iterable';
import * as Option from 'effect/Option';
import * as Order from 'effect/Order';
import type * as Predicate from 'effect/Predicate';
import * as Result from 'effect/Result';
import * as Tuple from 'effect/Tuple';

import type * as MTypes from './types/types.js';

import * as MFunction from './Function.js';
import * as MOption from './Option.js';

/**
 * Returns the indexes of all elements of `self` satisfying `predicate`, in ascending order.
 *
 * - Use to locate every position matching a condition.
 * - Yields no index when no element matches.
 * - Consumes `self` lazily, one element at a time.
 *
 * **Example** (Indexes of matching elements)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MIterable from '@parischap/effect-lib/MIterable';
 *
 * console.log([
 *   ...pipe(
 *     [1, 3, 2, 4, 3],
 *     MIterable.findAll((n) => n === 3),
 *   ),
 * ]); // [1, 4]
 * ```
 *
 * @category Utils
 *
 * @see `MArray.findAll` — eager counterpart
 */
export const findAll =
  <A>(predicate: Predicate.Predicate<NoInfer<A>>) =>
  (self: Iterable<A>): Iterable<number> =>
    Iterable.filterMap(self, (b, i) =>
      pipe(
        i,
        Result.liftPredicate(() => predicate(b), MFunction.constFailVoid),
      ),
    );

/**
 * Returns all elements of `self` except the first `n`.
 *
 * - Use to drop a prefix of fixed size.
 * - When `n >= size of self`, yields no element.
 * - `n` should be a non-negative integer.
 *
 * **Example** (Drop leading elements)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MIterable from '@parischap/effect-lib/MIterable';
 *
 * console.log([...pipe([1, 2, 3, 4], MIterable.takeRightBut(2))]); // [3, 4]
 * ```
 *
 * @category Utils
 *
 * @see `MArray.takeRightBut` — eager counterpart
 */
export const takeRightBut =
  (n: number) =>
  <A>(self: Iterable<A>): Iterable<A> =>
    Iterable.drop(self, n);

/**
 * Returns the longest common prefix of `self` and `that`, comparing elements with `Equal.equals`.
 *
 * - Use to find the leading elements two iterables agree on.
 * - Yields no element when the first elements already differ.
 * - Stops reading `self` and `that` as soon as a mismatch is found.
 *
 * **Example** (Longest common prefix)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MIterable from '@parischap/effect-lib/MIterable';
 *
 * console.log([...pipe([1, 2, 4], MIterable.longestCommonSubArray([1, 2, 3]))]); // [1, 2]
 * ```
 *
 * @category Utils
 *
 * @see `MArray.longestCommonSubArray` — eager counterpart
 */
export const longestCommonSubArray =
  <A>(that: Iterable<A>) =>
  (self: Iterable<A>): Iterable<A> =>
    pipe(
      self,
      Iterable.zip(that),
      Iterable.takeWhile(([a1, a2]) => Equal.equals(a1, a2)),
      Iterable.map(Tuple.get(0)),
    );

/**
 * Flattens a two-dimensional iterable, tagging each element with the index of its source row.
 *
 * - Use as the lazy companion to `MArray.groupByNum`.
 * - Order is preserved: rows are visited in order, and each row is flattened left to right.
 *
 * **Example** (Tagged flatten)
 *
 * ```ts
 * import * as MIterable from '@parischap/effect-lib/MIterable';
 *
 * console.log([
 *   ...MIterable.ungroup([
 *     [1, 2, 3],
 *     [4, 5],
 *   ]),
 * ]); // [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5]]
 * ```
 *
 * @category Utils
 *
 * @see `MArray.ungroup` — eager counterpart
 */
export const ungroup = <A>(as: Iterable<Iterable<A>>): Iterable<[number, A]> =>
  Iterable.flatMap(as, (row, i) => Iterable.map(row, (a) => Tuple.make(i, a)));

/**
 * Returns a copy of `self` with every element except the first transformed by `f`.
 *
 * - Use to apply a transformation to all elements but the leading one.
 * - Yields `self` unchanged when it has zero or one elements.
 *
 * **Example** (Modify all but the first)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MIterable from '@parischap/effect-lib/MIterable';
 *
 * console.log([
 *   ...pipe(
 *     [1, 2, 3, 4],
 *     MIterable.modifyTail((x) => x * 2),
 *   ),
 * ]); // [1, 4, 6, 8]
 * ```
 *
 * @category Utils
 *
 * @see `MArray.modifyTail` — eager counterpart
 */
export const modifyTail =
  <A, B>(f: (a: NoInfer<A>, i: number) => B) =>
  (self: Iterable<A>): Iterable<A | B> =>
    Iterable.map(self, (elem, i) => (i > 0 ? f(elem, i) : elem));

/**
 * Returns a copy of `self` with the first element transformed by `f`.
 *
 * - Use to update only the leading element.
 * - Yields no element when `self` is empty.
 *
 * **Example** (Modify first element)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MIterable from '@parischap/effect-lib/MIterable';
 *
 * console.log([
 *   ...pipe(
 *     [1, 2, 3],
 *     MIterable.modifyHead((x) => x * 2),
 *   ),
 * ]); // [2, 2, 3]
 * ```
 *
 * @category Utils
 *
 * @see `MArray.modifyHead` — eager counterpart
 */
export const modifyHead =
  <A, B>(f: (a: NoInfer<A>) => B) =>
  (self: Iterable<A>): Iterable<A | B> =>
    Iterable.map(self, (elem, i) => (i === 0 ? f(elem) : elem));

/**
 * Curried version of `Iterable.unfold` with optional cycle detection.
 *
 * - Without `seedEquivalence`, keep generating until `f` returns `Option.none`.
 * - With `seedEquivalence`, every seed is recorded as it is produced; if the same seed reappears,
 *   `cycleSource` is a `some` of the `A` produced the first time that seed was processed, allowing
 *   the caller to break the cycle.
 * - Nothing is computed until the result is iterated: `f` runs once per element actually pulled.
 *
 * **Example** (Unfold without cycle detection)
 *
 * ```ts
 * import { Option, pipe } from 'effect';
 * import * as MIterable from '@parischap/effect-lib/MIterable';
 *
 * console.log([
 *   ...pipe(
 *     0,
 *     MIterable.unfold((n) => (n < 3 ? Option.some([n, n + 1] as const) : Option.none())),
 *   ),
 * ]); // [0, 1, 2]
 * ```
 *
 * @category Constructors
 *
 * @see `MArray.unfold` — eager counterpart
 */
export const unfold: {
  <S, A>(f: (s: S) => Option.Option<MTypes.Pair<A, S>>): (s: S) => Iterable<A>;
  <S, A>(
    f: (s: S, cycleSource: Option.Option<NoInfer<A>>) => Option.Option<MTypes.Pair<A, S>>,
    seedEquivalence: Equivalence.Equivalence<S>,
  ): (s: S) => Iterable<A>;
} =
  <S, A>(
    f: (s: S, cycleSource: Option.Option<A>) => Option.Option<MTypes.Pair<A, S>>,
    seedEquivalence?: Equivalence.Equivalence<S>,
  ) =>
  (s: S): Iterable<A> => ({
    [Symbol.iterator]() {
      let seed = s;
      const knownAsAndBs = Array.empty<[S, A]>();
      return {
        next(): IteratorResult<A> {
          const cycleSource =
            seedEquivalence === undefined
              ? Option.none<A>()
              : pipe(
                  knownAsAndBs,
                  Array.findFirst(([s1]) => seedEquivalence(seed, s1)),
                  Option.map(Tuple.get(1)),
                );
          const result = f(seed, cycleSource);
          if (Option.isNone(result)) return { done: true, value: undefined };
          const [a, nextSeed] = result.value;
          if (seedEquivalence !== undefined) knownAsAndBs.push([seed, a]);
          seed = nextSeed;
          return { done: false, value: a };
        },
      };
    },
  });

/**
 * Stably merges two iterables already sorted according to `o`.
 *
 * - Both inputs must already be sorted by `o`.
 * - The merge is stable: equal elements from `self` precede equal elements from `that`.
 * - Reads one element ahead from each input at a time; never materializes either input fully.
 *
 * **Example** (Merge sorted iterables)
 *
 * ```ts
 * import { Order, pipe } from 'effect';
 * import * as MIterable from '@parischap/effect-lib/MIterable';
 *
 * console.log([...pipe([1, 3, 5], MIterable.mergeSorted(Order.number)([2, 4, 6]))]); // [1, 2, 3, 4, 5, 6]
 * ```
 *
 * @category Utils
 *
 * @see `MArray.mergeSorted` — eager counterpart
 */
export const mergeSorted =
  <A>(o: Order.Order<A>) =>
  (that: Iterable<A>) =>
  (self: Iterable<A>): Iterable<A> => {
    const isLessThanOrEqualTo = Order.isLessThanOrEqualTo(o);
    const selfIterator = self[Symbol.iterator]();
    const thatIterator = that[Symbol.iterator]();
    return pipe(
      Tuple.make(
        MOption.fromNextIteratorValue(selfIterator),
        MOption.fromNextIteratorValue(thatIterator),
      ),
      unfold(([selfValueOption, thatValueOption]) =>
        Option.match(selfValueOption, {
          onSome: (selfValue) =>
            Option.match(thatValueOption, {
              onSome: (thatValue) =>
                isLessThanOrEqualTo(selfValue, thatValue)
                  ? Option.some(
                      Tuple.make(
                        selfValue,
                        Tuple.make(MOption.fromNextIteratorValue(selfIterator), thatValueOption),
                      ),
                    )
                  : Option.some(
                      Tuple.make(
                        thatValue,
                        Tuple.make(selfValueOption, MOption.fromNextIteratorValue(thatIterator)),
                      ),
                    ),
              onNone: () =>
                Option.some(
                  Tuple.make(
                    selfValue,
                    Tuple.make(MOption.fromNextIteratorValue(selfIterator), Option.none()),
                  ),
                ),
            }),
          onNone: () =>
            Option.match(thatValueOption, {
              onSome: (thatValue) =>
                Option.some(
                  Tuple.make(
                    thatValue,
                    Tuple.make(Option.none(), MOption.fromNextIteratorValue(thatIterator)),
                  ),
                ),
              onNone: () => Option.none(),
            }),
        }),
      ),
    );
  };

/**
 * Returns the elements of `self` not present in `that`. Element equality is `Equal.equals`.
 *
 * - Use to compute a sorted set difference in a single lazy linear pass.
 * - Both inputs must already be sorted according to `o`; otherwise the result is undefined.
 * - Reads one element ahead from each input at a time; never materializes either input fully.
 *
 * **Example** (Sorted difference)
 *
 * ```ts
 * import { Order, pipe } from 'effect';
 * import * as MIterable from '@parischap/effect-lib/MIterable';
 *
 * console.log([...pipe([1, 2, 3, 4, 5], MIterable.differenceSorted(Order.number)([2, 4]))]); // [1, 3, 5]
 * ```
 *
 * @category Utils
 *
 * @see `MArray.differenceSorted` — eager counterpart
 */
export const differenceSorted =
  <A>(o: Order.Order<A>) =>
  (that: Iterable<A>) =>
  (self: Iterable<A>): Iterable<A> => {
    const isLessThan = Order.isLessThan(o);
    const selfIterator = self[Symbol.iterator]();
    const thatIterator = that[Symbol.iterator]();
    return pipe(
      Tuple.make(
        MOption.fromNextIteratorValue(selfIterator),
        MOption.fromNextIteratorValue(thatIterator),
      ),
      unfold(([selfValueOption, thatValueOption]) =>
        Option.match(selfValueOption, {
          onSome: (selfValue) =>
            Option.match(thatValueOption, {
              onSome: (thatValue) =>
                isLessThan(selfValue, thatValue)
                  ? Option.some(
                      Tuple.make(
                        Array.of(selfValue),
                        Tuple.make(MOption.fromNextIteratorValue(selfIterator), thatValueOption),
                      ),
                    )
                  : Equal.equals(selfValue, thatValue)
                    ? Option.some(
                        Tuple.make(
                          Array.empty(),
                          Tuple.make(
                            MOption.fromNextIteratorValue(selfIterator),
                            MOption.fromNextIteratorValue(thatIterator),
                          ),
                        ),
                      )
                    : Option.some(
                        Tuple.make(
                          Array.empty(),
                          Tuple.make(selfValueOption, MOption.fromNextIteratorValue(thatIterator)),
                        ),
                      ),
              onNone: () =>
                Option.some(
                  Tuple.make(
                    Array.of(selfValue),
                    Tuple.make(MOption.fromNextIteratorValue(selfIterator), Option.none()),
                  ),
                ),
            }),
          onNone: () =>
            Option.none<MTypes.Pair<Array<A>, MTypes.Pair<Option.Option<A>, Option.Option<A>>>>(),
        }),
      ),
      Iterable.flatten,
    );
  };
