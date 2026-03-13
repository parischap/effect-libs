/** Extension to the Effect Array module providing additional array operations such as cycle-aware unfolding, sorted merging, and early-exit mapping */

import { pipe } from 'effect';

import * as Array from 'effect/Array';
import * as Boolean from 'effect/Boolean';
import * as Either from 'effect/Either';
import * as Equal from 'effect/Equal';
import * as Equivalence from 'effect/Equivalence';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Order from 'effect/Order';
import * as Predicate from 'effect/Predicate';
import * as Record from 'effect/Record';
import * as Tuple from 'effect/Tuple';

import * as MMatch from './Match.js';
import * as MOption from './Option.js';
import * as MTypes from './Types/types.js';

/**
 * Type on which this module's functions operate
 *
 * @category Models
 */
export interface Type<out A> extends ReadonlyArray<A> {}

/**
 * Returns `true` if the length of `self` is `l`
 *
 * @category Predicates
 */
export const hasLength =
  (l: number) =>
  <A>(self: Type<A>): boolean =>
    self.length === l;

/**
 * Returns `true` if the provided `ReadonlyArray` contains duplicates using the provided `isEquivalent`
 * function.
 *
 * @category Predicates
 */
export const hasDuplicatesWith =
  <A>(isEquivalent: Equivalence.Equivalence<NoInfer<A>>) =>
  (self: Type<A>): boolean =>
    pipe(self, Array.dedupeWith(isEquivalent), hasLength(self.length), Boolean.not);

/**
 * Returns `true` if the provided `ReadonlyArray` contains duplicates using structural equality
 *
 * @category Predicates
 */
export const hasDuplicates = hasDuplicatesWith(Equal.equivalence());

/**
 * Pattern-matches an array by cardinality: applies `onEmpty` for empty arrays, `onSingleton` for
 * arrays with exactly one element, and `onOverTwo` for arrays with two or more elements.
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
 * Returns an array of the indexes of all elements of `self` that satisfy `predicate`
 *
 * @category Utils
 */

export const findAll =
  <A>(predicate: Predicate.Predicate<NoInfer<A>>) =>
  (self: Iterable<A>): Array<number> =>
    Array.filterMap(self, (b, i) =>
      pipe(
        i,
        Option.liftPredicate(() => predicate(b)),
      ),
    );

/**
 * Returns all elements of `self` except the last `n` elements. `n` must be a positive integer
 *
 * @category Utils
 */
export const takeBut =
  (n: number) =>
  <A>(self: Type<A>): Array<A> =>
    self.slice(0, -n);

/**
 * Returns all elements of `self` except the first `n` elements. `n` must be a positive integer
 *
 * @category Utils
 */
export const takeRightBut =
  (n: number) =>
  <A>(self: Type<A>): Array<A> =>
    self.slice(n);

/**
 * Returns the element at position `index` from the end of `self`, wrapped in an `Option`. Index `0`
 * returns the last element.
 *
 * @category Utils
 */
export const getFromEnd =
  (index: number) =>
  <A>(self: Type<A>): Option.Option<A> =>
    Array.get(self, self.length - 1 - index);

/**
 * Returns the longest common prefix between `self` and `that`, compared using `Equal.equals`
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
      Array.map(Tuple.getFirst),
    );

/**
 * Extracts the first element of `self` that satisfies `predicate` (or `refinement`). Returns a pair
 * of the extracted element (as an `Option`) and the remaining elements.
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
 * Flattens an array of arrays adding an index that will allow to reverse this operation with
 * groupByNum
 *
 * @category Utils
 * @example
 *   import { MArray } from '@parischap/effect-lib';
 *   import { pipe } from 'effect';
 *
 *   assert.deepStrictEqual(
 *     pipe(
 *       [
 *         [1, 2, 3],
 *         [3, 4, 5],
 *       ],
 *       MArray.ungroup,
 *     ),
 *     [
 *       [0, 1],
 *       [0, 2],
 *       [0, 3],
 *       [1, 3],
 *       [1, 4],
 *       [1, 5],
 *     ],
 *   );
 */
export const ungroup = <A>(as: Type<Type<A>>): Array<[number, A]> =>
  pipe(
    as,
    Array.map((as, i) => Array.map(as, (a) => Tuple.make(i, a))),
    Array.flatten,
  );

/**
 * The elements of self are mapped by a fValue function and grouped by a fKey function. Size is the
 * size of the output array. If fKey returns a negative index or an index superior or equal to size,
 * the corresponding value is ignored. There may be holes in the output array. Can be used to
 * reverse the ungroup function.
 *
 * @category Utils
 * @example
 *   import { MArray } from '@parischap/effect-lib';
 *   import { pipe, Tuple } from 'effect';
 *
 *   const foo: ReadonlyArray<readonly [number, number]> = [
 *     [0, 1],
 *     [0, 2],
 *     [0, 3],
 *     [1, 1],
 *     [1, 2],
 *     [1, 3],
 *   ];
 *
 *   assert.deepStrictEqual(
 *     pipe(foo, MArray.groupByNum({ size: 2, fKey: Tuple.getFirst, fValue: Tuple.getSecond })),
 *     [
 *       [1, 2, 3],
 *       [1, 2, 3],
 *     ],
 *   );
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
 * Same as Array.groupBy but with a value projection function
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
 * Returns a function that retrieves the element at a given index from `self`, returning an `Option`
 *
 * @category Destructors
 */
export const getter =
  <A>(self: Type<A>): MTypes.OneArgFunction<number, Option.Option<A>> =>
  (index) =>
    Array.get(self, index);

/**
 * Returns the element at `index` in `self` without bounds checking. Faster than the Effect version
 * but may return `undefined` for out-of-bounds indexes
 *
 * @category Utils
 */
export const unsafeGet =
  (index: number) =>
  <A>(self: Type<A>): A =>
    // @ts-expect-error getting array content unsafely
    self[index];

/**
 * Returns a function that retrieves the element at a given index from `self` without bounds checking
 *
 * @category Destructors
 */
export const unsafeGetter =
  <A>(self: Type<A>): MTypes.OneArgFunction<number, A> =>
  (index) =>
    unsafeGet(index)(self);

/**
 * Returns a copy of `self` with all elements except the last one transformed by `f`. Returns a copy
 * of `self` unchanged if it contains at most one element.
 *
 * @category Utils
 */
export const modifyInit =
  <S extends MTypes.AnyReadonlyArray, B>(f: (a: Array.ReadonlyArray.Infer<S>, i: number) => B) =>
  (self: S): Array.ReadonlyArray.With<S, B> =>
    Array.map(self, (elem, i) => (i < self.length - 1 ? f(elem, i) : elem));

/**
 * Returns a copy of `self` with all elements except the first one transformed by `f`. Returns a
 * copy of `self` unchanged if it contains at most one element.
 *
 * @category Utils
 */
export const modifyTail =
  <S extends MTypes.AnyReadonlyArray, B>(f: (a: Array.ReadonlyArray.Infer<S>, i: number) => B) =>
  (self: S): Array.ReadonlyArray.With<S, B> =>
    Array.map(self, (elem, i) => (i > 0 ? f(elem, i) : elem));

/**
 * Returns a copy of `self` with the last element transformed by `f`. Returns a copy of `self`
 * unchanged if it is empty.
 *
 * @category Utils
 */
export const modifyLast =
  <S extends MTypes.AnyReadonlyArray, B>(f: (a: Array.ReadonlyArray.Infer<S>) => B) =>
  (self: S): Array.ReadonlyArray.With<S, Array.ReadonlyArray.Infer<S> | B> =>
    Array.modify(self, self.length - 1, f);

/**
 * Returns a copy of `self` with the first element transformed by `f`. Returns a copy of `self`
 * unchanged if it is empty.
 *
 * @category Utils
 */
export const modifyHead =
  <S extends MTypes.AnyReadonlyArray, B>(f: (a: Array.ReadonlyArray.Infer<S>) => B) =>
  (self: S): Array.ReadonlyArray.With<S, Array.ReadonlyArray.Infer<S> | B> =>
    Array.modify(self, 0, f);

/**
 * Same as Array.unfold but with cycle detection and curried. A cycle is detected if the same seed
 * `s` is sent a second time to function f (equivalence based on the `seedEquivalence` equivalence
 * if provided or on Equal.equals otherwise). In that case, `cycleSource` is a `some` of the `a`
 * generated the first time `s` was processed, hence giving the user a chance to modify it.
 * Otherwise, `cycleSource` is a `none`.
 *
 * @category Constructors
 */
export const unfold =
  <S, A>(
    f: (s: S, cycleSource: Option.Option<NoInfer<A>>) => Option.Option<MTypes.Pair<A, S>>,
    seedEquivalence: Equivalence.Equivalence<S> = Equal.equals,
  ) =>
  (s: S): Array<A> => {
    if (MTypes.isOneArgFunction(f)) return Array.unfold(s, f);
    const knownAsAndBs = Array.empty<[S, A]>();
    const internalF = (s: S): Option.Option<MTypes.Pair<A, S>> => {
      const knownB = pipe(
        knownAsAndBs,
        Array.findFirst(([s1]) => seedEquivalence(s, s1)),
        Option.map(Tuple.getSecond),
      );
      const result = f(s, knownB);
      if (Option.isSome(result)) knownAsAndBs.push([s, Tuple.getFirst(result.value)]);
      return result;
    };
    return Array.unfold(s, internalF);
  };

/**
 * Same as `MArray.unfold` but `f` always returns an `A` and optionally an `S`. A cycle is detected
 * when the same seed `s` is seen a second time (compared using `seedEquivalence` if provided, or
 * `Equal.equals` otherwise). When a cycle is detected, `cycleSource` is `some` of the `A` value
 * generated the first time that seed was processed, allowing `f` to produce a different output and
 * break the cycle. When no cycle is detected, `cycleSource` is `none`.
 *
 * @category Constructors
 */
export const unfoldNonEmpty =
  <S, A>(
    f: (s: S, cycleSource: Option.Option<NoInfer<A>>) => MTypes.Pair<A, Option.Option<S>>,
    seedEquivalence: Equivalence.Equivalence<S> = Equal.equals,
  ) =>
  (s: S): MTypes.OverOne<A> => {
    const internalF = (
      sOption: Option.Option<S>,
      cycleSource: Option.Option<A>,
    ): Option.Option<MTypes.Pair<A, Option.Option<S>>> =>
      Option.map(sOption, (s) => f(s, cycleSource));
    const seedOptionEquivalence = Option.getEquivalence(seedEquivalence);
    return pipe(
      s,
      Option.some,
      unfold(internalF, seedOptionEquivalence),
    ) as unknown as MTypes.OverOne<A>;
  };

/**
 * Splits `self` into two segments, with the second segment containing at most `n` elements. `n` can
 * be `0`.
 *
 * @category Utils
 */
export const splitAtFromRight =
  (n: number) =>
  <A>(self: Type<A>): [beforeIndex: Array<A>, fromIndex: Array<A>] =>
    Array.splitAt(self, Math.max(0, self.length - n));

/**
 * Same as `splitAtFromRight` but guarantees the second segment is non-empty. `n` must be `>=1`.
 *
 * @category Utils
 */
export const splitNonEmptyAtFromRight =
  (n: number) =>
  <A>(self: MTypes.ReadonlyOverOne<A>): [beforeIndex: Array<A>, fromIndex: MTypes.OverOne<A>] =>
    pipe(self, splitAtFromRight(n)) as never;

/**
 * Maps each element of `self` using `f`, returning a `some` of the mapped array if all calls
 * succeed. Returns a `none` as soon as `f` returns a `none` for any element.
 *
 * @category Destructors
 */
export const mapUnlessNone =
  <A, B>(f: (a: A, i: number) => Option.Option<B>) =>
  <S extends Type<A>>(self: S): Option.Option<Array.ReadonlyArray.With<S, B>> =>
    pipe(self, Array.filterMapWhile(f), Option.liftPredicate(hasLength(self.length))) as never;

/**
 * Maps each element of `self` using `f`, returning a `right` of the mapped array if all calls
 * succeed. Returns the first `left` encountered.
 *
 * @category Destructors
 */
export const mapUnlessLeft =
  <A, B, C>(f: (a: A, i: number) => Either.Either<B, C>) =>
  <S extends Type<A>>(self: S): Either.Either<Array.ReadonlyArray.With<S, B>, C> =>
    Either.gen(function* () {
      const { length } = self;
      const result = Array.allocate<B>(length);

      for (let i = 0; i < length; i++) {
        result[i] = yield* f(self[i] as A, i);
      }
      return result as never;
    });
/**
 * Reduces `self` using `f`, returning a `some` of the accumulated value if all steps succeed.
 * Returns a `none` as soon as `f` returns `none`.
 *
 * @category Destructors
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
 * Reduces `self` using `f`, returning a `right` of the accumulated value if all steps succeed.
 * Returns the first `left` encountered.
 *
 * @category Destructors
 */
export const reduceUnlessLeft =
  <B, A, C>(b: B, f: (b: B, a: A, i: number) => Either.Either<B, C>) =>
  (self: Iterable<A>): Either.Either<B, C> =>
    Either.gen(function* () {
      let result = b,
        i = 0;

      for (const a of self) {
        result = yield* f(result, a, i++);
      }
      return result;
    });

/**
 * Merges two sorted iterables into a single sorted array. The merge is stable: elements from `self`
 * appear before equal elements from `that`. Both `self` and `that` must already be sorted according
 * to order `o`.
 *
 * @category Utils
 */
export const mergeSorted =
  <A>(o: Order.Order<A>) =>
  (that: Iterable<A>) =>
  (self: Iterable<A>): Array<A> => {
    const lessThanOrEqualTo = Order.lessThanOrEqualTo(o);
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
                lessThanOrEqualTo(selfValue, thatValue)
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
 * Returns the elements of `self` that are not present in `that`. Both `self` and `that` must
 * already be sorted according to order `o`. Uses `Equal.equals` for element comparison.
 *
 * @category Utils
 */
export const differenceSorted =
  <A>(o: Order.Order<A>) =>
  (that: Iterable<A>) =>
  (self: Iterable<A>): Array<A> => {
    const lessThan = Order.lessThan(o);
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
                lessThan(selfValue, thatValue)
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
 * Same as `Array.pad` but the return type is a fixed-size `Tuple` instead of a plain array
 *
 * @category Utils
 */
export const pad = <A, T, N extends number>(
  n: N,
  fill: T,
): MTypes.OneArgFunction<Type<A>, MTypes.Tuple<A | T, N>> => Array.pad(n, fill) as never;
