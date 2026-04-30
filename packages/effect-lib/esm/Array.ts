/**
 * Extension to the Effect Array module providing additional array operations such as cycle-aware
 * unfolding, sorted merging, and early-exit mapping
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
 * Returns `true` if the provided `ReadonlyArray` contains duplicates using the provided
 * `isEquivalent` function.
 *
 * @category Predicates
 */
export const hasDuplicatesWith =
  <A>(isEquivalent: Equivalence.Equivalence<NoInfer<A>>) =>
  (self: Type<A>): boolean =>
    pipe(self, Array.dedupeWith(isEquivalent), hasLength(self.length), Boolean.not);

/**
 * Returns `true` if the provided `ReadonlyArray` contains duplicates using Equal.equals
 *
 * @category Predicates
 */
export const hasDuplicates = hasDuplicatesWith(Equal.asEquivalence());

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
        Result.liftPredicate(() => predicate(b), MFunction.constFailVoid),
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
      Array.map(Tuple.get(0)),
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
 *
 * @example
 *   import { MArray } from '@parischap/effect-lib';
 *   import { pipe } from 'effect';
 *
 *   assert.deepStrictEqual(
 *   pipe([[1, 2, 3], [3, 4, 5]], MArray.ungroup),
 *   [[0, 1], [0, 2], [0, 3], [1, 3], [1, 4], [1, 5]],
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
 *
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
 *     pipe(foo, MArray.groupByNum({ size: 2, fKey: Tuple.get(0), fValue: Tuple.get(1) })),
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
 * Returns a function that retrieves the element at a given index from `self` without bounds
 * checking
 *
 * @category Destructors
 */
export const unsafeGetter =
  <A>(self: Type<A>): MTypes.OneArgFunction<number, A> =>
  (index) =>
    unsafeGet(index)(self);

/**
 * Utility type that changes the type of all the elements of an array or tuple
 *
 * @category Utility types
 */
export type With<S extends MTypes.AnyReadonlyArray, A> = { [k in keyof S]: A };

/**
 * Returns a copy of `self` with all elements except the last one transformed by `f`. Returns a copy
 * of `self` unchanged if `self` contains at most one element.
 *
 * @category Utils
 */
export const modifyInit =
  <S extends MTypes.AnyReadonlyArray, B>(f: (a: Array.ReadonlyArray.Infer<S>, i: number) => B) =>
  (self: S): With<S, Array.ReadonlyArray.Infer<S> | B> => {
    const lastIndex = self.length - 1;
    return Array.map(self, (elem, i) => (i < lastIndex ? f(elem, i) : elem)) as never;
  };

/**
 * Returns a copy of `self` with all elements except the first one transformed by `f`. Returns a
 * copy of `self` unchanged if it contains at most one element.
 *
 * @category Utils
 */
export const modifyTail =
  <S extends MTypes.AnyReadonlyArray, B>(f: (a: Array.ReadonlyArray.Infer<S>, i: number) => B) =>
  (self: S): With<S, Array.ReadonlyArray.Infer<S> | B> =>
    Array.map(self, (elem, i) => (i > 0 ? f(elem, i) : elem)) as never;

/**
 * Returns a copy of `self` with the last element transformed by `f`. Returns a copy of `self`
 * unchanged if `self` is empty.
 *
 * @category Utils
 */
export const modifyLast =
  <S extends MTypes.AnyReadonlyArray, B>(f: (a: Array.ReadonlyArray.Infer<S>) => B) =>
  (self: S): With<S, Array.ReadonlyArray.Infer<S> | B> => {
    const lastIndex = self.length - 1;
    return Array.map(self, (elem, i) => (i === lastIndex ? f(elem) : elem)) as never;
  };

/**
 * Returns a copy of `self` with the first element transformed by `f`. Returns a copy of `self`
 * unchanged if it is empty.
 *
 * @category Utils
 */
export const modifyHead =
  <S extends MTypes.AnyReadonlyArray, B>(f: (a: Array.ReadonlyArray.Infer<S>) => B) =>
  (self: S): With<S, Array.ReadonlyArray.Infer<S> | B> =>
    Array.map(self, (elem, i) => (i === 0 ? f(elem) : elem)) as never;

/**
 * Same as `Array.unfold` but curried and with optional cycle detection. Cycle detection is enabled
 * by passing a `seedEquivalence`. When enabled, a cycle is detected if the same seed `s` is sent a
 * second time to `f` (compared using `seedEquivalence`). In that case, `cycleSource` is a `some`
 * of the `A` generated the first time `s` was processed, giving the user a chance to modify it.
 * Otherwise, `cycleSource` is a `none`. When `seedEquivalence` is omitted, no cycle detection is
 * performed and `f` does not receive a `cycleSource` parameter.
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
    if (seedEquivalence === undefined)
      return Array.unfold(s, (s) => f(s, Option.none()));
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
 * Same as `MArray.unfold` but `f` always returns an `A` and optionally an `S`. Cycle detection is
 * enabled by passing a `seedEquivalence`. When enabled, a cycle is detected if the same seed `s`
 * is sent a second time to `f` (compared using `seedEquivalence`). In that case, `cycleSource` is
 * a `some` of the `A` generated the first time `s` was processed, giving the user a chance to
 * modify it. Otherwise, `cycleSource` is a `none`. When `seedEquivalence` is omitted, no cycle
 * detection is performed and `f` does not receive a `cycleSource` parameter.
 *
 * @category Constructors
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
        ? unfold((sOption: Option.Option<S>) =>
            Option.map(sOption, (s) => f(s, Option.none())),
          )
        : unfold(
            (sOption: Option.Option<S>, cycleSource: Option.Option<A>) =>
              Option.map(sOption, (s) => f(s, cycleSource)),
            Option.makeEquivalence(seedEquivalence),
          ),
    ) as unknown as MTypes.OverOne<A>;

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
 * Maps each element of `self` using `f`, returning a success of the mapped array if all calls
 * succeed. Returns the first failure encountered.
 *
 * @category Destructors
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
 * Reduces `self` using `f`, returning a success of the accumulated value if all steps succeed.
 * Returns the first failure encountered.
 *
 * @category Destructors
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
 * Returns the elements of `self` that are not present in `that`. Both `self` and `that` must
 * already be sorted according to order `o`. Uses `Equal.equals` for element comparison.
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
 * Same as `Array.pad` but the return type is a fixed-size `Tuple` instead of a plain array
 *
 * @category Utils
 */
export const pad = <A, T, N extends number>(
  n: N,
  fill: T,
): MTypes.OneArgFunction<Type<A>, MTypes.Tuple<A | T, N>> => Array.pad(n, fill) as never;

/**
 * Removes empty string parts from `self` and joins the remaining strings using `sep`. Useful when
 * parts of the array come from an external source and might be empty strings that must not add an
 * extra separator
 *
 * @category Utils
 */
export const removeEmptyAndJoin = (sep: string): MTypes.OneArgFunction<Iterable<string>, string> =>
  Array.reduce('', (acc, elem) =>
    acc.length === 0 ? elem : elem.length === 0 ? acc : `${acc}${sep}${elem}`,
  );
