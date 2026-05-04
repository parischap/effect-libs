/**
 * Extensions to the Effect Array module providing predicates, indexed search, cardinality matching,
 * indexed (un)grouping, sorted-iterator merging/difference, and cycle-aware unfolding.
 *
 * ## Mental model
 *
 * - **`Type<A>`** is just `ReadonlyArray<A>`; functions never mutate the input.
 * - All functions are **curried, data-last** — call as `MArray.fn(arg)(self)` or `pipe(self,
 *   MArray.fn(arg))`. They are not data-first/data-last dual.
 * - Equality-based functions (e.g. {@link hasDuplicates}, {@link longestCommonSubArray},
 *   {@link differenceSorted}) compare with `Equal.equals`. The `*With` variants take an explicit
 *   `Equivalence`.
 *
 * ## Common tasks
 *
 * - **Predicates**: {@link hasLength}, {@link hasDuplicates}, {@link hasDuplicatesWith}
 * - **Search**: {@link findAll}, {@link extractFirst}, {@link getFromEnd},
 *   {@link longestCommonSubArray}
 * - **Pattern match**: {@link match012}
 * - **Unsafe access**: {@link unsafeGet}, {@link unsafeGetter}
 * - **Modify by position**: {@link modifyHead}, {@link modifyInit}, {@link modifyTail},
 *   {@link modifyLast}
 * - **Group / ungroup**: {@link ungroup}, {@link groupByNum}, {@link groupBy}
 * - **Split**: {@link splitAtFromRight}, {@link splitNonEmptyAtFromRight}
 * - **Map / reduce with short-circuit**: {@link mapUnlessNone}, {@link mapUnlessLeft},
 *   {@link reduceUnlessNone}, {@link reduceUnlessLeft}
 * - **Sorted operations**: {@link mergeSorted}, {@link differenceSorted}
 * - **Construct**: {@link unfold}, {@link unfoldNonEmpty}, {@link pad}
 * - **Format**: {@link removeEmptyAndJoin}
 *
 * ## Quickstart
 *
 * **Example** (Common predicates and indexed search)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 * import * as MPredicate from '@parischap/effect-lib/MPredicate';
 *
 * console.log(MArray.hasDuplicates([1, 2, 2, 3])); // true
 * console.log(pipe([1, 2, 3, 2], MArray.findAll(MPredicate.strictEquals(2)))); // [1, 3]
 * ```
 */

import { pipe } from 'effect';
import * as Array from 'effect/Array';
import * as Boolean from 'effect/Boolean';
import * as Equal from 'effect/Equal';
import type * as Equivalence from 'effect/Equivalence';
import type * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Order from 'effect/Order';
import type * as Predicate from 'effect/Predicate';
import * as Record from 'effect/Record';
import * as Result from 'effect/Result';
import * as Tuple from 'effect/Tuple';

import * as MFunction from './Function.js';
import * as MMatch from './Match.js';
import * as MOption from './Option.js';
import * as MTypes from './types/types.js';

/**
 * Type on which this module's functions operate.
 *
 * @category Models
 */
export interface Type<out A> extends ReadonlyArray<A> {}

/**
 * Returns `true` if the length of `self` is exactly `l`.
 *
 * - Use to assert that an array has a specific number of elements.
 * - Length comparison is `===`.
 *
 * **Example** (Length check)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(pipe([1, 2, 3], MArray.hasLength(3))); // true
 * console.log(pipe([1, 2, 3], MArray.hasLength(2))); // false
 * ```
 *
 * @category Predicates
 */
export const hasLength =
  (l: number) =>
  <A>(self: Type<A>): boolean =>
    self.length === l;

/**
 * Returns `true` if `self` contains at least one duplicate, comparing elements with the supplied
 * `Equivalence`.
 *
 * - Use when default equality is not adequate (e.g. comparing objects by a single field).
 * - Returns `false` for arrays with all-distinct elements.
 *
 * **Example** (Detecting duplicates with a custom equivalence)
 *
 * ```ts
 * import { Equivalence, pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * const byId = Equivalence.mapInput(Equivalence.number, (o: { readonly id: number }) => o.id);
 * console.log(pipe([{ id: 1 }, { id: 1 }], MArray.hasDuplicatesWith(byId))); // true
 * console.log(pipe([{ id: 1 }, { id: 2 }], MArray.hasDuplicatesWith(byId))); // false
 * ```
 *
 * @category Predicates
 *
 * @see {@link hasDuplicates} — variant using `Equal.equals`
 */
export const hasDuplicatesWith =
  <A>(isEquivalent: Equivalence.Equivalence<NoInfer<A>>) =>
  (self: Type<A>): boolean =>
    pipe(self, Array.dedupeWith(isEquivalent), hasLength(self.length), Boolean.not);

/**
 * Returns `true` if `self` contains at least one duplicate, comparing elements with `Equal.equals`.
 *
 * - Use to validate uniqueness with default equality.
 * - Comparison uses Effect's `Equal.equals` (structural equality for `Equal`-aware types, otherwise
 *   `===`).
 *
 * **Example** (Detecting duplicates)
 *
 * ```ts
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(MArray.hasDuplicates([1, 2, 2, 3])); // true
 * console.log(MArray.hasDuplicates([1, 2, 3])); // false
 * ```
 *
 * @category Predicates
 *
 * @see {@link hasDuplicatesWith} — variant taking a custom `Equivalence`
 */
export const hasDuplicates = hasDuplicatesWith(Equal.asEquivalence());

/**
 * Pattern-matches `self` by cardinality: empty, singleton, or two-or-more.
 *
 * - Use to branch type-safely on array size.
 * - `onSingleton` receives the single element directly.
 * - `onOverTwo` receives `self` typed as `MTypes.ReadonlyOverTwo<A>` (two-or-more).
 *
 * **Example** (Cardinality match)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * const describe = MArray.match012({
 *   onEmpty: () => 'empty',
 *   onSingleton: (x: number) => `one: ${x}`,
 *   onOverTwo: (xs) => `many: ${xs.length}`,
 * });
 *
 * console.log(pipe([], describe)); // 'empty'
 * console.log(pipe([1], describe)); // 'one: 1'
 * console.log(pipe([1, 2, 3], describe)); // 'many: 3'
 * ```
 *
 * @category Utils
 */
export const match012 =
  <A, B, C = B, D = B>(options: {
    readonly onEmpty: Function.LazyArg<B>;
    readonly onSingleton: (self: NoInfer<A>) => C;
    readonly onOverTwo: (self: MTypes.ReadonlyOverTwo<NoInfer<A>>) => D;
  }) =>
  (self: Type<A>): B | C | D =>
    pipe(
      self,
      MMatch.make,
      MMatch.when(MTypes.isReadonlyOverTwo<A>, (overTwo) => options.onOverTwo(overTwo)),
      MMatch.when(MTypes.isReadonlySingleton<A>, (singleton) => options.onSingleton(singleton[0])),
      MMatch.orElse(options.onEmpty),
    );

/**
 * Returns the indexes of all elements of `self` satisfying `predicate`, in ascending order.
 *
 * - Use to locate every position matching a condition.
 * - Returns an empty array when no element matches.
 *
 * **Example** (Indexes of matching elements)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 * import * as MPredicate from '@parischap/effect-lib/MPredicate';
 *
 * console.log(pipe([1, 3, 2, 4], MArray.findAll(MPredicate.strictEquals(3)))); // [1]
 * console.log(pipe([1, 3, 2, 4, 3], MArray.findAll(MPredicate.strictEquals(3)))); // [1, 4]
 * ```
 *
 * @category Utils
 */

export const findAll =
  <A>(predicate: Predicate.Predicate<NoInfer<A>>) =>
  (self: Iterable<A>): Array<number> =>
    Array.filterMap(self, (b, i) =>
      pipe(
        i,
        Result.liftPredicate(() => predicate(b), MFunction.constFailVoid),
      ),
    );

/**
 * Returns all elements of `self` except the last `n`.
 *
 * - Use to drop a suffix of fixed size.
 * - When `n >= self.length`, returns an empty array.
 * - `n` should be a non-negative integer.
 *
 * **Example** (Drop trailing elements)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(pipe([1, 2, 3, 4], MArray.takeBut(2))); // [1, 2]
 * console.log(pipe([1, 2, 3], MArray.takeBut(5))); // []
 * ```
 *
 * @category Utils
 *
 * @see {@link takeRightBut} — symmetric variant dropping the leading elements
 */
export const takeBut =
  (n: number) =>
  <A>(self: Type<A>): Array<A> =>
    self.slice(0, -n);

/**
 * Returns all elements of `self` except the first `n`.
 *
 * - Use to drop a prefix of fixed size.
 * - When `n >= self.length`, returns an empty array.
 * - `n` should be a non-negative integer.
 *
 * **Example** (Drop leading elements)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(pipe([1, 2, 3, 4], MArray.takeRightBut(2))); // [3, 4]
 * console.log(pipe([1, 2, 3], MArray.takeRightBut(5))); // []
 * ```
 *
 * @category Utils
 *
 * @see {@link takeBut} — symmetric variant dropping the trailing elements
 */
export const takeRightBut =
  (n: number) =>
  <A>(self: Type<A>): Array<A> =>
    self.slice(n);

/**
 * Returns the element at position `index` counted from the end of `self` as an `Option`.
 *
 * - Use to access from the tail of an array.
 * - `index` is zero-based: `0` is the last element.
 * - Returns `Option.none` when `index` is out of bounds.
 *
 * **Example** (Indexed access from the end)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(pipe([1, 2, 3], MArray.getFromEnd(0))); // Some(3)
 * console.log(pipe([1, 2, 3], MArray.getFromEnd(1))); // Some(2)
 * console.log(pipe([1, 2, 3], MArray.getFromEnd(3))); // None
 * ```
 *
 * @category Utils
 */
export const getFromEnd =
  (index: number) =>
  <A>(self: Type<A>): Option.Option<A> =>
    Array.get(self, self.length - 1 - index);

/**
 * Returns the longest common prefix of `self` and `that`, comparing elements with `Equal.equals`.
 *
 * - Use to find the leading elements two arrays agree on.
 * - Returns an empty array when the first elements already differ.
 *
 * **Example** (Longest common prefix)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(pipe([1, 2, 4], MArray.longestCommonSubArray([1, 2, 3]))); // [1, 2]
 * console.log(pipe([0, 1], MArray.longestCommonSubArray([1, 2]))); // []
 * ```
 *
 * @category Utils
 */
export const longestCommonSubArray =
  <A>(that: Iterable<A>) =>
  (self: Iterable<A>): Array<A> =>
    pipe(
      self,
      Array.zip(that),
      Array.takeWhile(([a1, a2]) => Equal.equals(a1, a2)),
      Array.map(Tuple.get(0)),
    );

/**
 * Extracts the first element of `self` matching `predicate` (or `refinement`) and returns a pair of
 * the extracted element (as an `Option`) and the remaining elements in their original order.
 *
 * - Use to find and remove the first matching element in a single pass.
 * - When no element matches, returns `[Option.none(), self]`.
 * - Acts as a refinement-aware destructor: the extracted element is narrowed when a refinement is
 *   supplied.
 *
 * **Example** (Extract first matching element)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * const [match, rest] = pipe(
 *   [1, 3, 2, 4],
 *   MArray.extractFirst((n) => n > 2),
 * );
 * console.log(match); // Some(3)
 * console.log(rest); // [1, 2, 4]
 * ```
 *
 * @category Utils
 */
export const extractFirst: {
  <A, B extends A>(
    refinement: (a: NoInfer<A>, i: number) => a is B,
  ): (self: Type<A>) => MTypes.Pair<Option.Option<B>, Array<A>>;
  <A>(
    predicate: (a: NoInfer<A>, i: number) => boolean,
  ): (self: Type<A>) => MTypes.Pair<Option.Option<A>, Array<A>>;
} =
  <A>(predicate: (a: NoInfer<A>, i: number) => boolean) =>
  (self: Type<A>): [match: Option.Option<A>, remaining: Array<A>] =>
    pipe(self, Array.splitWhere(predicate), ([beforeMatch, fromMatch]) =>
      Array.matchLeft(fromMatch, {
        onEmpty: () => Tuple.make(Option.none(), beforeMatch),
        onNonEmpty: (head, tail) =>
          Tuple.make(Option.some(head), Array.appendAll(beforeMatch, tail)),
      }),
    );

/**
 * Flattens a two-dimensional array, tagging each element with the index of its source row.
 *
 * - Use as the inverse companion to {@link groupByNum}: `groupByNum` undoes `ungroup` when
 *   `fKey`/`fValue` extract the row index and the original element respectively.
 * - Order is preserved: rows are visited in order, and each row is flattened left to right.
 *
 * **Example** (Tagged flatten)
 *
 * ```ts
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(
 *   MArray.ungroup([
 *     [1, 2, 3],
 *     [4, 5],
 *   ]),
 * );
 * // [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5]]
 * ```
 *
 * @category Utils
 *
 * @see {@link groupByNum} — reverses {@link ungroup}
 */
export const ungroup = <A>(as: Type<Type<A>>): Array<[number, A]> =>
  pipe(
    as,
    Array.map((as, i) => Array.map(as, (a) => Tuple.make(i, a))),
    Array.flatten,
  );

/**
 * Maps the elements of `self` with `fValue` and groups the results by the numeric index returned by
 * `fKey`. The output is an array of length `size`. Elements whose key is negative or `>= size` are
 * dropped; rows for which no element maps are left as empty arrays.
 *
 * - Use to bucket elements into a fixed number of slots.
 * - Together with {@link ungroup} provides a round-trip: `groupByNum` reverses `ungroup`.
 *
 * **Example** (Bucketing by row index)
 *
 * ```ts
 * import { Tuple, pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * const input = [
 *   [0, 'a'],
 *   [0, 'b'],
 *   [1, 'c'],
 *   [1, 'd'],
 * ] as ReadonlyArray<[number, string]>;
 * console.log(
 *   pipe(input, MArray.groupByNum({ size: 2, fKey: Tuple.get(0), fValue: Tuple.get(1) })),
 * );
 * // [['a', 'b'], ['c', 'd']]
 * ```
 *
 * @category Utils
 *
 * @see {@link ungroup} — companion that produces `[index, value]` pairs
 */
export const groupByNum =
  <A, B>({
    size,
    fKey,
    fValue,
  }: {
    readonly size: number;
    readonly fKey: (a: NoInfer<A>) => number;
    readonly fValue: (a: NoInfer<A>) => B;
  }) =>
  (self: Type<A>): ReadonlyArray<ReadonlyArray<B>> => {
    const out = Array.makeBy(size, () => Array.empty<B>());

    for (const a of self) {
      const key = fKey(a);
      if (key >= 0 && key < size) out[key]!.push(fValue(a));
    }
    return out;
  };

/**
 * Like `Array.groupBy` but applies `fValue` to each element before collecting it into its bucket.
 *
 * - Use to group and project in a single pass.
 * - Each bucket is guaranteed non-empty (typed `MTypes.OverOne<B>`).
 *
 * **Example** (Group with projection)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * const data = [
 *   { type: 'a', value: 1 },
 *   { type: 'a', value: 2 },
 *   { type: 'b', value: 3 },
 * ] as const;
 *
 * console.log(
 *   pipe(data, MArray.groupBy({ fKey: (item) => item.type, fValue: (item) => item.value })),
 * );
 * // { a: [1, 2], b: [3] }
 * ```
 *
 * @category Utils
 */
export const groupBy =
  <A, B>({
    fKey,
    fValue,
  }: {
    readonly fKey: (a: NoInfer<A>) => string;
    readonly fValue: (a: NoInfer<A>) => B;
  }) =>
  (self: Iterable<A>): Record<string, MTypes.OverOne<B>> =>
    pipe(self, Array.groupBy(fKey), Record.map(Array.map(fValue)));

/**
 * Same as Array.groupBy but stores the results in a map instead of an object. It is then possible
 * to use keys others than strings.
 */
/*export const groupByInMap =
	<A, B, C>(fKey: (a: A) => C, fValue: (a: A) => B) =>
	(self: Type<A>): HashMap.HashMap<C, MTypes.OverOne<B>> => {
		return HashMap.mutate(HashMap.empty<C, MTypes.OverOne<B>>(), (map) => {
			for (const a of self) {
				const c = fKey(a);
				const b = fValue(a);
				HashMap.modifyAt(map, c, (o) =>
					pipe(
						o,
						Option.map((v) => {
							v.push(b);
							return v;
						}),
						Option.orElse(() => Option.some(Array.of(b)))
					)
				);
			}
		});
	};*/

/**
 * Returns a function that retrieves the element at a given index from `self`, wrapped in an
 * `Option`.
 *
 * - Use to precompute a getter once when the same array will be queried many times.
 * - The returned function is curried for the index and returns `Option.none` for out-of-bounds
 *   accesses.
 *
 * **Example** (Reusable safe getter)
 *
 * ```ts
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * const get = MArray.getter([1, 2, 3]);
 * console.log(get(0)); // Some(1)
 * console.log(get(5)); // None
 * ```
 *
 * @category Destructors
 */
export const getter =
  <A>(self: Type<A>): MTypes.OneArgFunction<number, Option.Option<A>> =>
  (index) =>
    Array.get(self, index);

/**
 * Returns the element of `self` at `index` without bounds checking.
 *
 * - Use only when bounds are guaranteed by construction; otherwise prefer `Array.get`.
 * - Returns `undefined` (typed as `A`) for out-of-bounds indexes.
 *
 * **Example** (Unchecked access)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(pipe([1, 2, 3], MArray.unsafeGet(0))); // 1
 * console.log(pipe([1, 2, 3], MArray.unsafeGet(10))); // undefined
 * ```
 *
 * @category Utils
 *
 * @see {@link getter} — safe alternative returning `Option`
 */
export const unsafeGet =
  (index: number) =>
  <A>(self: Type<A>): A =>
    // @ts-expect-error getting array content unsafely
    self[index];

/**
 * Returns a function that retrieves the element of `self` at a given index without bounds checking.
 *
 * - Use to precompute an unchecked getter when the same array will be queried many times under a
 *   bounds invariant.
 * - May return `undefined` (typed as `A`) for out-of-bounds indexes.
 *
 * **Example** (Reusable unsafe getter)
 *
 * ```ts
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * const get = MArray.unsafeGetter([1, 2, 3]);
 * console.log(get(1)); // 2
 * ```
 *
 * @category Destructors
 *
 * @see {@link getter} — safe alternative returning `Option`
 */
export const unsafeGetter =
  <A>(self: Type<A>): MTypes.OneArgFunction<number, A> =>
  (index) =>
    unsafeGet(index)(self);

/**
 * Utility type that replaces the type of every element of an array or tuple with `A`.
 *
 * @category Utility types
 */
export type With<S extends MTypes.AnyReadonlyArray, A> = { [k in keyof S]: A };

/**
 * Returns a copy of `self` with every element except the last transformed by `f`.
 *
 * - Use to apply a transformation to all elements but the trailing one.
 * - Returns `self` unchanged when it has zero or one elements.
 *
 * **Example** (Modify all but the last)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(
 *   pipe(
 *     [1, 2, 3, 4],
 *     MArray.modifyInit((x) => x * 2),
 *   ),
 * ); // [2, 4, 6, 4]
 * console.log(
 *   pipe(
 *     [5],
 *     MArray.modifyInit((x) => x * 2),
 *   ),
 * ); // [5]
 * ```
 *
 * @category Utils
 *
 * @see {@link modifyTail} — symmetric variant keeping the head fixed
 */
export const modifyInit =
  <S extends MTypes.AnyReadonlyArray, B>(f: (a: Array.ReadonlyArray.Infer<S>, i: number) => B) =>
  (self: S): With<S, Array.ReadonlyArray.Infer<S> | B> => {
    const lastIndex = self.length - 1;
    return Array.map(self, (elem, i) => (i < lastIndex ? f(elem, i) : elem)) as never;
  };

/**
 * Returns a copy of `self` with every element except the first transformed by `f`.
 *
 * - Use to apply a transformation to all elements but the leading one.
 * - Returns `self` unchanged when it has zero or one elements.
 *
 * **Example** (Modify all but the first)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(
 *   pipe(
 *     [1, 2, 3, 4],
 *     MArray.modifyTail((x) => x * 2),
 *   ),
 * ); // [1, 4, 6, 8]
 * console.log(
 *   pipe(
 *     [5],
 *     MArray.modifyTail((x) => x * 2),
 *   ),
 * ); // [5]
 * ```
 *
 * @category Utils
 *
 * @see {@link modifyInit} — symmetric variant keeping the last element fixed
 */
export const modifyTail =
  <S extends MTypes.AnyReadonlyArray, B>(f: (a: Array.ReadonlyArray.Infer<S>, i: number) => B) =>
  (self: S): With<S, Array.ReadonlyArray.Infer<S> | B> =>
    Array.map(self, (elem, i) => (i > 0 ? f(elem, i) : elem)) as never;

/**
 * Returns a copy of `self` with the last element transformed by `f`.
 *
 * - Use to update only the trailing element.
 * - Returns an empty copy when `self` is empty.
 *
 * **Example** (Modify last element)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(
 *   pipe(
 *     [1, 2, 3],
 *     MArray.modifyLast((x) => x * 2),
 *   ),
 * ); // [1, 2, 6]
 * console.log(
 *   pipe(
 *     [],
 *     MArray.modifyLast((x) => x * 2),
 *   ),
 * ); // []
 * ```
 *
 * @category Utils
 *
 * @see {@link modifyHead} — symmetric variant updating the first element
 */
export const modifyLast =
  <S extends MTypes.AnyReadonlyArray, B>(f: (a: Array.ReadonlyArray.Infer<S>) => B) =>
  (self: S): With<S, Array.ReadonlyArray.Infer<S> | B> => {
    const lastIndex = self.length - 1;
    return Array.map(self, (elem, i) => (i === lastIndex ? f(elem) : elem)) as never;
  };

/**
 * Returns a copy of `self` with the first element transformed by `f`.
 *
 * - Use to update only the leading element.
 * - Returns an empty copy when `self` is empty.
 *
 * **Example** (Modify first element)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(
 *   pipe(
 *     [1, 2, 3],
 *     MArray.modifyHead((x) => x * 2),
 *   ),
 * ); // [2, 2, 3]
 * console.log(
 *   pipe(
 *     [],
 *     MArray.modifyHead((x) => x * 2),
 *   ),
 * ); // []
 * ```
 *
 * @category Utils
 *
 * @see {@link modifyLast } — symmetric variant updating the last element
 */
export const modifyHead =
  <S extends MTypes.AnyReadonlyArray, B>(f: (a: Array.ReadonlyArray.Infer<S>) => B) =>
  (self: S): With<S, Array.ReadonlyArray.Infer<S> | B> =>
    Array.map(self, (elem, i) => (i === 0 ? f(elem) : elem)) as never;

/**
 * Curried version of `Array.unfold` with optional cycle detection.
 *
 * - Without `seedEquivalence`, behaves like a curried `Array.unfold`: keep generating until `f`
 *   returns `Option.none`.
 * - With `seedEquivalence`, every seed is recorded; if the same seed reappears, `cycleSource` is a
 *   `some` of the `A` produced the first time that seed was processed, allowing the caller to break
 *   the cycle.
 *
 * **Example** (Unfold without cycle detection)
 *
 * ```ts
 * import { Option, pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * const result = pipe(
 *   0,
 *   MArray.unfold((n) => (n < 3 ? Option.some([n, n + 1] as const) : Option.none())),
 * );
 * console.log(result); // [0, 1, 2]
 * ```
 *
 * @category Constructors
 */
export const unfold: {
  <S, A>(f: (s: S) => Option.Option<MTypes.Pair<A, S>>): (s: S) => Array<A>;
  <S, A>(
    f: (s: S, cycleSource: Option.Option<NoInfer<A>>) => Option.Option<MTypes.Pair<A, S>>,
    seedEquivalence: Equivalence.Equivalence<S>,
  ): (s: S) => Array<A>;
} =
  <S, A>(
    f: (s: S, cycleSource: Option.Option<A>) => Option.Option<MTypes.Pair<A, S>>,
    seedEquivalence?: Equivalence.Equivalence<S>,
  ) =>
  (s: S): Array<A> => {
    if (seedEquivalence === undefined) return Array.unfold(s, (s) => f(s, Option.none()));
    const knownAsAndBs = Array.empty<[S, A]>();
    const internalF = (s: S): Option.Option<MTypes.Pair<A, S>> => {
      const knownB = pipe(
        knownAsAndBs,
        Array.findFirst(([s1]) => seedEquivalence(s, s1)),
        Option.map(Tuple.get(1)),
      );
      const result = f(s, knownB);
      if (Option.isSome(result)) knownAsAndBs.push([s, Tuple.get(result.value, 0)]);
      return result;
    };
    return Array.unfold(s, internalF);
  };

/**
 * Variant of {@link unfold} where each step always produces an `A` and optionally a next seed `S`,
 * guaranteeing a non-empty result.
 *
 * - Use when at least one element must be produced.
 * - Cycle detection works the same way as in {@link unfold}.
 *
 * **Example** (Unfold a non-empty array)
 *
 * ```ts
 * import { Option, pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * const result = pipe(
 *   0,
 *   MArray.unfoldNonEmpty((n) => [n, n < 2 ? Option.some(n + 1) : Option.none()] as const),
 * );
 * console.log(result); // [0, 1, 2]
 * ```
 *
 * @category Constructors
 *
 * @see {@link unfold} — variant returning a possibly empty array
 */
export const unfoldNonEmpty: {
  <S, A>(f: (s: S) => MTypes.Pair<A, Option.Option<S>>): (s: S) => MTypes.OverOne<A>;
  <S, A>(
    f: (s: S, cycleSource: Option.Option<NoInfer<A>>) => MTypes.Pair<A, Option.Option<S>>,
    seedEquivalence: Equivalence.Equivalence<S>,
  ): (s: S) => MTypes.OverOne<A>;
} =
  <S, A>(
    f: (s: S, cycleSource: Option.Option<A>) => MTypes.Pair<A, Option.Option<S>>,
    seedEquivalence?: Equivalence.Equivalence<S>,
  ) =>
  (s: S): MTypes.OverOne<A> =>
    pipe(
      s,
      Option.some,
      seedEquivalence === undefined
        ? unfold((sOption: Option.Option<S>) => Option.map(sOption, (s) => f(s, Option.none())))
        : unfold(
            (sOption: Option.Option<S>, cycleSource: Option.Option<A>) =>
              Option.map(sOption, (s) => f(s, cycleSource)),
            Option.makeEquivalence(seedEquivalence),
          ),
    ) as unknown as MTypes.OverOne<A>;

/**
 * Splits `self` into two segments, the second containing at most the last `n` elements.
 *
 * - Use to take a fixed-size suffix while keeping the rest.
 * - When `n >= self.length`, the first segment is empty.
 * - `n` must be a non-negative integer; `0` puts everything in the first segment.
 *
 * **Example** (Split from the right)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(pipe([1, 2, 3, 4, 5], MArray.splitAtFromRight(2))); // [[1, 2, 3], [4, 5]]
 * console.log(pipe([1, 2, 3], MArray.splitAtFromRight(0))); // [[1, 2, 3], []]
 * ```
 *
 * @category Utils
 */
export const splitAtFromRight =
  (n: number) =>
  <A>(self: Type<A>): [beforeIndex: Array<A>, fromIndex: Array<A>] =>
    Array.splitAt(self, Math.max(0, self.length - n));

/**
 * Variant of {@link splitAtFromRight} for non-empty arrays where the second segment is guaranteed
 * non-empty.
 *
 * - `n` must be `>= 1`.
 * - Returns the second segment typed as `MTypes.OverOne<A>`.
 *
 * **Example** (Non-empty split from the right)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(pipe([1, 2, 3, 4] as const, MArray.splitNonEmptyAtFromRight(2))); // [[1, 2], [3, 4]]
 * ```
 *
 * @category Utils
 */
export const splitNonEmptyAtFromRight =
  (n: number) =>
  <A>(self: MTypes.ReadonlyOverOne<A>): [beforeIndex: Array<A>, fromIndex: MTypes.OverOne<A>] =>
    pipe(self, splitAtFromRight(n)) as never;

/**
 * Maps every element of `self` with `f`, returning `Option.some` of the mapped array if every call
 * succeeds, or `Option.none` as soon as one call returns `Option.none`.
 *
 * - Use when every element must be mappable for the operation to make sense.
 * - Short-circuits on the first `Option.none` returned by `f`.
 *
 * **Example** (Map with possible failure)
 *
 * ```ts
 * import { Option, pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * const safeDiv = (x: number) => (x !== 0 ? Option.some(10 / x) : Option.none());
 *
 * console.log(pipe([2, 5], MArray.mapUnlessNone(safeDiv))); // Some([5, 2])
 * console.log(pipe([2, 0, 5], MArray.mapUnlessNone(safeDiv))); // None
 * ```
 *
 * @category Destructors
 *
 * @see {@link mapUnlessLeft} — variant carrying an explicit error
 */
export const mapUnlessNone =
  <S extends MTypes.AnyReadonlyArray, B>(
    f: (a: Array.ReadonlyArray.Infer<S>, i: number) => Option.Option<B>,
  ) =>
  (self: S): Option.Option<Array.ReadonlyArray.With<S, B>> => {
    const fResult = (a: Array.ReadonlyArray.Infer<S>, i: number) =>
      Result.fromOption(f(a, i), MFunction.constFailVoid);
    return pipe(
      self,
      Array.takeWhileFilter(fResult),
      Option.liftPredicate(hasLength(self.length)),
    ) as never;
  };

/**
 * Maps every element of `self` with `f`, returning `Result.success` of the mapped array if every
 * call succeeds, or the first failure encountered.
 *
 * - Use when each step can produce a typed error.
 * - Short-circuits on the first failure returned by `f`.
 *
 * **Example** (Map with error handling)
 *
 * ```ts
 * import { Result, pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * const parseIntSafe = (s: string) => {
 *   const n = parseInt(s);
 *   return Number.isNaN(n) ? Result.fail(`Invalid number: ${s}`) : Result.succeed(n);
 * };
 *
 * console.log(pipe(['1', '2', '3'], MArray.mapUnlessLeft(parseIntSafe))); // Success([1, 2, 3])
 * console.log(pipe(['1', 'x', '3'], MArray.mapUnlessLeft(parseIntSafe))); // Failure('Invalid number: x')
 * ```
 *
 * @category Destructors
 *
 * @see {@link mapUnlessNone} — variant using `Option`
 */
export const mapUnlessLeft =
  <S extends MTypes.AnyReadonlyArray, B, C>(
    f: (a: Array.ReadonlyArray.Infer<S>, i: number) => Result.Result<B, C>,
  ) =>
  (self: S): Result.Result<Array.ReadonlyArray.With<S, B>, C> =>
    Result.gen(function* () {
      const { length } = self;
      const result = Array.allocate<B>(length);

      for (let i = 0; i < length; i++) {
        result[i] = yield* f(self[i] as Array.ReadonlyArray.Infer<S>, i);
      }
      return result as never;
    });

/**
 * Reduces `self` with `f`, returning `Option.some` of the final accumulator if every step succeeds,
 * or `Option.none` as soon as one step returns `Option.none`.
 *
 * - Use when reducing with a step that may fail without context.
 * - Short-circuits on the first `Option.none`.
 *
 * **Example** (Reduce with possible failure)
 *
 * ```ts
 * import { Option, pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * const safeAdd = (acc: number, x: number) => (x >= 0 ? Option.some(acc + x) : Option.none());
 *
 * console.log(pipe([1, 2, 3], MArray.reduceUnlessNone(0, safeAdd))); // Some(6)
 * console.log(pipe([1, -1, 3], MArray.reduceUnlessNone(0, safeAdd))); // None
 * ```
 *
 * @category Destructors
 *
 * @see {@link reduceUnlessLeft} — variant carrying an explicit error
 */
export const reduceUnlessNone =
  <B, A>(b: B, f: (b: B, a: A, i: number) => Option.Option<B>) =>
  (self: Iterable<A>): Option.Option<B> =>
    Option.gen(function* () {
      let result = b,
        i = 0;

      for (const a of self) {
        result = yield* f(result, a, i++);
      }
      return result;
    });

/**
 * Reduces `self` with `f`, returning `Result.success` of the final accumulator if every step
 * succeeds, or the first failure encountered.
 *
 * - Use when reducing with a step that can produce a typed error.
 * - Short-circuits on the first failure.
 *
 * **Example** (Reduce with error handling)
 *
 * ```ts
 * import { Result, pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * const safeSum = (acc: number, x: string) => {
 *   const n = parseInt(x);
 *   return Number.isNaN(n) ? Result.fail(`Invalid: ${x}`) : Result.succeed(acc + n);
 * };
 *
 * console.log(pipe(['1', '2', '3'], MArray.reduceUnlessLeft(0, safeSum))); // Success(6)
 * console.log(pipe(['1', 'x', '3'], MArray.reduceUnlessLeft(0, safeSum))); // Failure('Invalid: x')
 * ```
 *
 * @category Destructors
 *
 * @see {@link reduceUnlessNone} — variant using `Option`
 */
export const reduceUnlessLeft =
  <B, A, C>(b: B, f: (b: B, a: A, i: number) => Result.Result<B, C>) =>
  (self: Iterable<A>): Result.Result<B, C> =>
    Result.gen(function* () {
      let result = b,
        i = 0;

      for (const a of self) {
        result = yield* f(result, a, i++);
      }
      return result;
    });

/**
 * Stably merges two iterables already sorted according to `o`.
 *
 * - Both inputs must already be sorted by `o`.
 * - The merge is stable: equal elements from `self` precede equal elements from `that`.
 *
 * **Example** (Merge sorted iterables)
 *
 * ```ts
 * import { Order, pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(pipe([1, 3, 5], MArray.mergeSorted(Order.number)([2, 4, 6]))); // [1, 2, 3, 4, 5, 6]
 * ```
 *
 * @category Utils
 */
export const mergeSorted =
  <A>(o: Order.Order<A>) =>
  (that: Iterable<A>) =>
  (self: Iterable<A>): Array<A> => {
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
 * Returns the elements of `self` not present in `that`. Both iterables must already be sorted
 * according to `o`. Element equality is `Equal.equals`.
 *
 * - Use to compute a sorted set difference in a single linear pass.
 * - Both inputs must be sorted; otherwise the result is undefined.
 *
 * **Example** (Sorted difference)
 *
 * ```ts
 * import { Order, pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(pipe([1, 2, 3, 4, 5], MArray.differenceSorted(Order.number)([2, 4]))); // [1, 3, 5]
 * ```
 *
 * @category Utils
 */
export const differenceSorted =
  <A>(o: Order.Order<A>) =>
  (that: Iterable<A>) =>
  (self: Iterable<A>): Array<A> => {
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
      Array.flatten,
    );
  };

/**
 * Same as `Array.pad` but the result is typed as a fixed-size `Tuple` of length `N` instead of a
 * plain array.
 *
 * - Use when the resulting length is part of the type and downstream code relies on it.
 * - Pads with `fill` when shorter than `n`; truncates when longer.
 *
 * **Example** (Padding to a fixed length)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(pipe([1, 2, 3], MArray.pad(5, 0))); // [1, 2, 3, 0, 0]
 * ```
 *
 * @category Utils
 */
export const pad = <A, T, N extends number>(
  n: N,
  fill: T,
): MTypes.OneArgFunction<Type<A>, MTypes.Tuple<A | T, N>> => Array.pad(n, fill) as never;

/**
 * Joins the strings of `self` with `sep`, ignoring empty strings so they do not introduce extra
 * separators.
 *
 * - Use when assembling fragments coming from heterogeneous sources where some may be empty.
 * - The output never contains two consecutive `sep`'s nor a leading/trailing `sep`.
 *
 * **Example** (Joining without empty fragments)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MArray from '@parischap/effect-lib/MArray';
 *
 * console.log(pipe(['a', '', 'b', '', 'c'], MArray.removeEmptyAndJoin(', '))); // 'a, b, c'
 * ```
 *
 * @category Utils
 */
export const removeEmptyAndJoin = (sep: string): MTypes.OneArgFunction<Iterable<string>, string> =>
  Array.reduce('', (acc, elem) =>
    acc.length === 0 ? elem : elem.length === 0 ? acc : `${acc}${sep}${elem}`,
  );
