/** A simple extension to the Effect Array module */

import {
  Array,
  Boolean,
  Either,
  Equal,
  Equivalence,
  Function,
  Option,
  Order,
  Predicate,
  Record,
  Tuple,
  pipe,
} from 'effect';
import * as MMatch from './Match.js';
import * as MOption from './Option.js';
import * as MTypes from './types/index.js';
/**
 * https://typescript-eslint.io/rules/no-unnecessary-type-parameters Returns true if the length of
 * `self` is `l`
 *
 * @category Predicates
 */
export const hasLength =
  (l: number) =>
  <A>(self: ReadonlyArray<A>): boolean =>
    self.length === l;

/**
 * Returns true if the provided ReadonlyArray contains duplicates using the provided isEquivalent
 * function
 *
 * @category Utils
 */
export const hasDuplicatesWith =
  <A>(isEquivalent: Equivalence.Equivalence<NoInfer<A>>) =>
  (self: ReadonlyArray<A>): boolean =>
    pipe(self, Array.dedupeWith(isEquivalent), hasLength(self.length), Boolean.not);

/**
 * Returns true if the provided ReadonlyArray contains duplicates
 *
 * @category Utils
 */
export const hasDuplicates = hasDuplicatesWith(Equal.equivalence());

/**
 * Matches the elements of an array, applying functions to cases of empty arrays, arrays containing
 * a single element, and arrays containing two or more elements.
 *
 * @category Utils
 */
export const match012 =
  <A, B, C = B, D = B>(options: {
    readonly onEmpty: Function.LazyArg<B>;
    readonly onSingleton: (self: NoInfer<A>) => C;
    readonly onOverTwo: (self: MTypes.ReadonlyOverTwo<NoInfer<A>>) => D;
  }) =>
  (self: ReadonlyArray<A>): B | C | D =>
    pipe(
      self,
      MMatch.make,
      MMatch.when(MTypes.isReadonlyOverTwo<A>, (overTwo) => options.onOverTwo(overTwo)),
      MMatch.when(MTypes.isReadonlySingleton<A>, (singleton) => options.onSingleton(singleton[0])),
      MMatch.orElse(options.onEmpty),
    );

/**
 * Returns an array of the indexes of all elements of self matching the predicate
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
 * Takes all elements of self except the n last elements. `n` should be positive
 *
 * @category Utils
 */
export const takeBut =
  (n: number) =>
  <A>(self: ReadonlyArray<A>): Array<A> =>
    self.slice(0, -n);

/**
 * Takes all elements of self except the n first elements. `n` should be positive
 *
 * @category Utils
 */
export const takeRightBut =
  (n: number) =>
  <A>(self: ReadonlyArray<A>): Array<A> =>
    self.slice(n);

/**
 * This function provides a safe way to read a value at a particular index from the end of a
 * `ReadonlyArray`. Index `0` will return the last element of the array.
 *
 * @category Utils
 */
export const getFromEnd =
  (index: number) =>
  <A>(self: ReadonlyArray<A>): Option.Option<A> =>
    Array.get(self, self.length - 1 - index);

/**
 * This function returns the longest sub-array common to self and that starting at index 0
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
 * Extracts from an array the first item that matches the predicate. Returns the extracted item and
 * the remaining items.
 *
 * @category Utils
 */
export const extractFirst: {
  <A, B extends A>(
    refinement: (a: NoInfer<A>, i: number) => a is B,
  ): (self: ReadonlyArray<A>) => MTypes.Pair<Option.Option<B>, Array<A>>;
  <A>(
    predicate: (a: NoInfer<A>, i: number) => boolean,
  ): (self: ReadonlyArray<A>) => MTypes.Pair<Option.Option<A>, Array<A>>;
} =
  <A>(predicate: (a: NoInfer<A>, i: number) => boolean) =>
  (self: ReadonlyArray<A>): [match: Option.Option<A>, remaining: Array<A>] =>
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
export const ungroup = <A>(as: ReadonlyArray<ReadonlyArray<A>>): Array<[number, A]> =>
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
  (self: ReadonlyArray<A>): ReadonlyArray<ReadonlyArray<B>> => {
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
	(self: ReadonlyArray<A>): HashMap.HashMap<C, MTypes.OverOne<B>> => {
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
 * Same as get but with flipped parameters
 *
 * @category Destructors
 */
export const getter =
  <A>(self: ReadonlyArray<A>): MTypes.OneArgFunction<number, Option.Option<A>> =>
  (index) =>
    Array.get(self, index);

/**
 * Unsafe gets an element from an array. No bounds check, faster than the Effect version
 *
 * @category Utils
 */
export const unsafeGet =
  (index: number) =>
  <A>(self: ReadonlyArray<A>): A =>
    // @ts-expect-error getting array content unsafely
    self[index];

/**
 * Same as unsafeGet but with flipped parameters
 *
 * @category Destructors
 */
export const unsafeGetter =
  <A>(self: ReadonlyArray<A>): MTypes.OneArgFunction<number, A> =>
  (index) =>
    unsafeGet(index)(self);

/**
 * Returns a copy of self with all elements but the last modified by a function f. Returns a copy of
 * self if it contains at most one element.
 *
 * @category Utils
 */
export const modifyInit =
  <S extends MTypes.AnyReadonlyArray, B>(f: (a: Array.ReadonlyArray.Infer<S>, i: number) => B) =>
  (self: S): Array.ReadonlyArray.With<S, B> =>
    Array.map(self, (elem, i) => (i < self.length - 1 ? f(elem, i) : elem));

/**
 * Returns a copy of self with all elements but the first modified by a function f . Returns a copy
 * of self if it contains at most one element.
 *
 * @category Utils
 */
export const modifyTail =
  <S extends MTypes.AnyReadonlyArray, B>(f: (a: Array.ReadonlyArray.Infer<S>, i: number) => B) =>
  (self: S): Array.ReadonlyArray.With<S, B> =>
    Array.map(self, (elem, i) => (i > 0 ? f(elem, i) : elem));

/**
 * Returns a copy of self with the last element modified by a function f. Returns a copy of self if
 * it contains no elements.
 *
 * @category Utils
 */
export const modifyLast =
  <S extends MTypes.AnyReadonlyArray, B>(f: (a: Array.ReadonlyArray.Infer<S>) => B) =>
  (self: S): Array.ReadonlyArray.With<S, Array.ReadonlyArray.Infer<S> | B> =>
    Array.modify(self, self.length - 1, f);

/**
 * Returns a copy of self with the first element modified by a function f. Returns a copy of self if
 * it contains no elements.
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
 * Same as `MArray.unfold` but f always returns an `A` and optionnaly an `S`. A cycle is detected if
 * the same seed `s` is sent a second time to function f (equivalence based on the `seedEquivalence`
 * equivalence if provided or on Equal.equals otherwise). In that case, `cycleSource` is a `some` of
 * the `a` generated the first time `s` was processed, hence giving the user a chance to modify it.
 * Otherwise, `cycleSource` is a `none`.
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
 * Splits `self` into two segments, with the last segment containing a maximum of `n` elements. The
 * value of `n` can be `0`.
 *
 * @category Utils
 */
export const splitAtFromRight =
  (n: number) =>
  <A>(self: ReadonlyArray<A>): [beforeIndex: Array<A>, fromIndex: Array<A>] =>
    Array.splitAt(self, Math.max(0, self.length - n));

/**
 * Splits `self` into two segments, with the last segment containing a maximum of `n` elements. The
 * value of `n` must be `>=1`.
 *
 * @category Utils
 */
export const splitNonEmptyAtFromRight =
  (n: number) =>
  <A>(self: MTypes.ReadonlyOverOne<A>): [beforeIndex: Array<A>, fromIndex: MTypes.OverOne<A>] =>
    pipe(self, splitAtFromRight(n)) as never;

/**
 * Mapping with early exit in case of failure (`none`)
 *
 * @category Destructors
 */
export const mapUnlessNone =
  <A, B>(f: (a: A, i: number) => Option.Option<B>) =>
  <S extends ReadonlyArray<A>>(self: S): Option.Option<Array.ReadonlyArray.With<S, B>> =>
    pipe(self, Array.filterMapWhile(f), Option.liftPredicate(hasLength(self.length))) as never;

/**
 * Mapping with early exit in case of failure (`left`)
 *
 * @category Destructors
 */
export const mapUnlessLeft =
  <A, B, C>(f: (a: A, i: number) => Either.Either<B, C>) =>
  <S extends ReadonlyArray<A>>(self: S): Either.Either<Array.ReadonlyArray.With<S, B>, C> =>
    Either.gen(function* () {
      const { length } = self;
      const result = Array.allocate<B>(length);

      for (let i = 0; i < length; i++) {
        result[i] = yield* f(self[i] as A, i);
      }
      return result as never;
    });
/**
 * Reduce with early exit in case of failure (`none`)
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
 * Reduce with early exit in case of failure (`left`)
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
 * Merges two sorted Iterables into a sorted array. Elements in `self` are assured to be before
 * equal elements in `that` in the resulting array. The sorting order `o` must also be the one that
 * was used to sort `self` and `that`
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
                lessThanOrEqualTo(selfValue, thatValue) ?
                  Option.some(
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
 * Removes all elements of `that` from `self`. The sorting order `o` must also be the one that was
 * used to sort `self` and `that`
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
                lessThan(selfValue, thatValue) ?
                  Option.some(
                    Tuple.make(
                      Array.of(selfValue),
                      Tuple.make(MOption.fromNextIteratorValue(selfIterator), thatValueOption),
                    ),
                  )
                : Equal.equals(selfValue, thatValue) ?
                  Option.some(
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
 * Same as Array.pad but returns a tuple
 *
 * @category Utils
 */
export const pad = <A, T, N extends number>(
  n: N,
  fill: T,
): MTypes.OneArgFunction<ReadonlyArray<A>, MTypes.Tuple<A | T, N>> => Array.pad(n, fill) as never;
