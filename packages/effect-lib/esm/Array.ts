/**
 * A simple extension to the Effect Array module
 *
 * @since 0.0.6
 */

import {
	Array,
	Boolean,
	Equal,
	Equivalence,
	Function,
	Number,
	Option,
	Order,
	Predicate,
	Record,
	Tuple,
	pipe
} from 'effect';
import * as MMatch from './Match.js';
import * as MOption from './Option.js';
import * as MTypes from './types.js';

/**
 * Returns true if the length of `self` is `l`
 *
 * @since 0.5.0
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
 * @since 0.0.6
 * @category Utils
 */
export const hasDuplicatesWith =
	<A>(isEquivalent: Equivalence.Equivalence<NoInfer<A>>) =>
	(self: ReadonlyArray<A>): boolean =>
		pipe(self, Array.dedupeWith(isEquivalent), hasLength(self.length), Boolean.not);

/**
 * Returns true if the provided ReadonlyArray contains duplicates
 *
 * @since 0.0.6
 * @category Utils
 */
export const hasDuplicates = hasDuplicatesWith(Equal.equivalence());

/**
 * Matches the elements of an array, applying functions to cases of empty arrays, arrays containing
 * a single element, and arrays containing two or more elements.
 *
 * @since 0.0.6
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
			MMatch.orElse(options.onEmpty)
		);

/**
 * Returns an array of the indexes of all elements of self matching the predicate
 *
 * @since 0.0.6
 * @category Utils
 */

export const findAll =
	<A>(predicate: Predicate.Predicate<NoInfer<A>>) =>
	(self: Iterable<A>): Array<number> =>
		Array.filterMap(self, (b, i) =>
			pipe(
				i,
				Option.liftPredicate(() => predicate(b))
			)
		);

/**
 * Takes all elements of self except the n last elements
 *
 * @since 0.0.6
 * @category Utils
 */
export const takeBut =
	(n: number) =>
	<A>(self: ReadonlyArray<A>): Array<A> =>
		Array.take(self, self.length - n);

/**
 * Takes all elements of self except the n first elements
 *
 * @since 0.0.6
 * @category Utils
 */
export const takeRightBut =
	(n: number) =>
	<A>(self: ReadonlyArray<A>): Array<A> =>
		Array.takeRight(self, self.length - n);

/**
 * This function provides a safe way to read a value at a particular index from the end of a
 * `ReadonlyArray`. Index `0` will return the last element of the array.
 *
 * @since 0.0.6
 * @category Utils
 */
export const getFromEnd =
	(index: number) =>
	<A>(self: ReadonlyArray<A>): Option.Option<A> =>
		Array.get(self, self.length - 1 - index);

/**
 * This function returns the longest sub-array common to self and that starting at index 0
 *
 * @since 0.0.6
 * @category Utils
 */
export const longestCommonSubArray =
	<A>(that: Iterable<A>) =>
	(self: Iterable<A>): Array<A> =>
		pipe(
			self,
			Array.zip(that),
			Array.takeWhile(([a1, a2]) => Equal.equals(a1, a2)),
			Array.map(Tuple.getFirst)
		);

/**
 * Extracts from an array the first item that matches the predicate. Returns the extracted item and
 * the remaining items.
 *
 * @since 0.0.6
 * @category Utils
 */
export const extractFirst: {
	<A, B extends A>(
		refinement: (a: NoInfer<A>, i: number) => a is B
	): (self: ReadonlyArray<A>) => MTypes.Pair<Option.Option<B>, MTypes.MutableArray<A>>;
	<A>(
		predicate: (a: NoInfer<A>, i: number) => boolean
	): (self: ReadonlyArray<A>) => MTypes.Pair<Option.Option<A>, MTypes.MutableArray<A>>;
} =
	<A>(predicate: (a: NoInfer<A>, i: number) => boolean) =>
	(self: ReadonlyArray<A>): [match: Option.Option<A>, remaining: Array<A>] =>
		pipe(self, Array.splitWhere(predicate), ([beforeMatch, fromMatch]) =>
			Array.matchLeft(fromMatch, {
				onEmpty: () => Tuple.make(Option.none(), beforeMatch),
				onNonEmpty: (head, tail) =>
					Tuple.make(Option.some(head), Array.appendAll(beforeMatch, tail))
			})
		);

/**
 * Flattens an array of arrays adding an index that will allow to reverse this operation with
 * groupByNum
 *
 * @since 0.0.6
 * @category Utils
 * @example
 * 	import { MArray } from '@parischap/effect-lib';
 * 	import { pipe } from 'effect';
 *
 * 	assert.deepStrictEqual(
 * 		pipe(
 * 			[
 * 				[1, 2, 3],
 * 				[3, 4, 5]
 * 			],
 * 			MArray.ungroup
 * 		),
 * 		[
 * 			[0, 1],
 * 			[0, 2],
 * 			[0, 3],
 * 			[1, 3],
 * 			[1, 4],
 * 			[1, 5]
 * 		]
 * 	);
 */
export const ungroup = <A>(as: ReadonlyArray<ReadonlyArray<A>>): Array<[number, A]> =>
	pipe(
		as,
		Array.map((as, i) => Array.map(as, (a) => Tuple.make(i, a))),
		Array.flatten
	);

/**
 * The elements of self are mapped by a fValue function and grouped by a fKey function. Size is the
 * size of the output array. If fKey returns a negative index or an index superior or equal to size,
 * the corresponding value is ignored. There may be holes in the output array. Can be used to
 * reverse the ungroup function.
 *
 * @since 0.0.6
 * @category Utils
 * @example
 * 	import { MArray } from '@parischap/effect-lib';
 * 	import { pipe, Tuple } from 'effect';
 *
 * 	const foo: ReadonlyArray<readonly [number, number]> = [
 * 		[0, 1],
 * 		[0, 2],
 * 		[0, 3],
 * 		[1, 1],
 * 		[1, 2],
 * 		[1, 3]
 * 	];
 *
 * 	assert.deepStrictEqual(
 * 		pipe(foo, MArray.groupByNum({ size: 2, fKey: Tuple.getFirst, fValue: Tuple.getSecond })),
 * 		[
 * 			[1, 2, 3],
 * 			[1, 2, 3]
 * 		]
 * 	);
 */
export const groupByNum =
	<A, B>({
		size,
		fKey,
		fValue
	}: {
		readonly size: number;
		readonly fKey: (a: NoInfer<A>) => number;
		readonly fValue: (a: NoInfer<A>) => B;
	}) =>
	(self: ReadonlyArray<A>): ReadonlyArray<ReadonlyArray<B>> => {
		const out = Array.makeBy(size, () => Array.empty<B>());
		for (let i = 0; i < self.length; i++) {
			const a = self[i] as A;
			const key = fKey(a);
			/* eslint-disable-next-line functional/immutable-data,functional/no-expression-statements,functional/prefer-readonly-type */
			if (key >= 0 && key < size) (out[key] as Array<B>).push(fValue(a));
		}
		return out;
	};

/**
 * Same as Array.groupBy but with a value projection function
 *
 * @since 0.0.6
 * @category Utils
 */
export const groupBy =
	<A, B>({
		fKey,
		fValue
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
 * @since 0.5.0
 * @category Utils
 */
export const getter =
	<A>(self: ReadonlyArray<A>): MTypes.OneArgFunction<number, Option.Option<A>> =>
	(index) =>
		Array.get(self, index);

/**
 * Unsafe gets an element from an array. No bounds check, faster than the Effect version
 *
 * @since 0.0.6
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
 * @since 0.5.0
 * @category Utils
 */
export const unsafeGetter =
	<A>(self: ReadonlyArray<A>): MTypes.OneArgFunction<number, A> =>
	(index) =>
		unsafeGet(index)(self);

/**
 * Returns a copy of self with all elements but the last modified by a function f. Returns a copy of
 * self if it contains at most one element.
 *
 * @since 0.0.6
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
 * @since 0.0.6
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
 * @since 0.0.6
 * @category Utils
 */
export const modifyLast =
	<A, B>(f: (a: A) => B) =>
	(self: ReadonlyArray<A>): Array<A | B> =>
		Array.modify(self, self.length - 1, f);

/**
 * Returns a copy of self with the first element modified by a function f. Returns a copy of self if
 * it contains no elements.
 *
 * @since 0.0.6
 * @category Utils
 */
export const modifyHead =
	<A, B>(f: (a: A) => B) =>
	(self: ReadonlyArray<A>): Array<A | B> =>
		Array.modify(self, 0, f);

/**
 * Same as Array.unfold but with cycle detection and curried
 *
 * @since 0.5.0
 * @category Constructors
 */
export const unfold =
	<A, B>(f: (a: A, isCyclical: boolean) => Option.Option<MTypes.Pair<B, A>>) =>
	(a: A): Array<B> => {
		if (MTypes.isOneArgFunction(f)) return Array.unfold(a, f);
		const knownAs = Array.empty<A>();
		const internalF = (a: A) => {
			const isCyclical = Array.contains(knownAs, a);
			/* eslint-disable-next-line functional/no-expression-statements, functional/immutable-data */
			knownAs.push(a);
			return f(a, isCyclical);
		};
		return Array.unfold(a, internalF);
	};

/**
 * Same as unfold but f always returns a B and an Option<A>
 *
 * @since 0.5.0
 * @category Constructors
 */
export const unfoldNonEmpty =
	<A, B>(f: (a: A, isCyclical: boolean) => MTypes.Pair<B, Option.Option<A>>) =>
	(a: A): MTypes.OverOne<B> => {
		const internalF = (aOption: Option.Option<A>, isCyclical: boolean) =>
			Option.map(aOption, (a) => f(a, isCyclical));
		return pipe(a, Option.some, unfold(internalF)) as unknown as MTypes.OverOne<B>;
	};

/**
 * Splits `self` into two segments, with the last segment containing a maximum of `n` elements. The
 * value of `n` can be `0`.
 *
 * @since 0.5.0
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
 * @since 0.5.0
 * @category Utils
 */
export const splitNonEmptyAtFromRight =
	(n: number) =>
	<A>(self: MTypes.OverOne<A>): [beforeIndex: Array<A>, fromIndex: MTypes.OverOne<A>] =>
		pipe(self, splitAtFromRight(n)) as never;

/**
 * Merges two sorted Iterables into a sorted array. Elements in `self` are assured to be before
 * equal elements in `that` in the resulting array. The sorting order `o` must also be the one that
 * was used to sort `self` and `that`
 *
 * @since 0.5.0
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
				MOption.fromNextIteratorValue(thatIterator)
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
											Tuple.make(MOption.fromNextIteratorValue(selfIterator), thatValueOption)
										)
									)
								:	Option.some(
										Tuple.make(
											thatValue,
											Tuple.make(selfValueOption, MOption.fromNextIteratorValue(thatIterator))
										)
									),
							onNone: () =>
								Option.some(
									Tuple.make(
										selfValue,
										Tuple.make(MOption.fromNextIteratorValue(selfIterator), Option.none())
									)
								)
						}),
					onNone: () =>
						Option.match(thatValueOption, {
							onSome: (thatValue) =>
								Option.some(
									Tuple.make(
										thatValue,
										Tuple.make(Option.none(), MOption.fromNextIteratorValue(thatIterator))
									)
								),
							onNone: () => Option.none()
						})
				})
			)
		);
	};

/**
 * Removes all elements of `that` from `self`. The sorting order `o` must also be the one that was
 * used to sort `self` and `that`
 *
 * @since 0.5.0
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
				MOption.fromNextIteratorValue(thatIterator)
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
											Tuple.make(MOption.fromNextIteratorValue(selfIterator), thatValueOption)
										)
									)
								: Equal.equals(selfValue, thatValue) ?
									Option.some(
										Tuple.make(
											Array.empty(),
											Tuple.make(
												MOption.fromNextIteratorValue(selfIterator),
												MOption.fromNextIteratorValue(thatIterator)
											)
										)
									)
								:	Option.some(
										Tuple.make(
											Array.empty(),
											Tuple.make(selfValueOption, MOption.fromNextIteratorValue(thatIterator))
										)
									),
							onNone: () =>
								Option.some(
									Tuple.make(
										Array.of(selfValue),
										Tuple.make(MOption.fromNextIteratorValue(selfIterator), Option.none())
									)
								)
						}),
					onNone: () =>
						Option.none<
							MTypes.Pair<MTypes.MutableArray<A>, MTypes.Pair<Option.Option<A>, Option.Option<A>>>
						>()
				})
			),
			Array.flatten
		);
	};

/**
 * Equivalence for arrays of numbers. To be removed when Equal.equals will handle Arrays properly
 * (from Effect 4.0 onwards)
 */
export const numberEquivalence = Array.getEquivalence(Number.Equivalence);
