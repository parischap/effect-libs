import { Array, Equal, Function, Option, Predicate, Record, Tuple, pipe } from 'effect';
import * as MFunction from './Function.js';
import * as MMatch from './Match.js';
import * as MTypes from './types.js';

//const moduleTag = '@parischap/effect-lib/ReadonlyArray/';

/**
 * Creates a one element array. Starting a flow construct with a function that can accept a variable number of arguments, like Array.make is dangerous because that function may then be called by a function that sends a variable number of arguments like Array.map or Array.filter. We may then construct a tuple with two elements whereas we thought we were building one with one. In that case, prefer using fromSingleValue
 *
 * @category constructor
 */
export const fromSingleValue = <A>(a: A): Array<A> => Array.of(a);

/**
 * Returns true if the provided ReadonlyArray contains duplicates using the provided isEquivalent function
 * @category utils
 * @since 1.0.0
 */
export const hasDuplicatesWith =
	<A>(isEquivalent: (self: NoInfer<A>, that: NoInfer<A>) => boolean) =>
	(self: ReadonlyArray<A>): boolean =>
		pipe(self, Array.dedupeWith(isEquivalent), Array.length, MFunction.strictEquals(self.length));

/**
 * Returns true if the provided ReadonlyArray contains duplicates
 * @category utils
 * @since 1.0.0
 */
export const hasDuplicates = hasDuplicatesWith(Equal.equivalence());

export const match012 =
	<A, B, C = B, D = B>(options: {
		readonly onEmpty: Function.LazyArg<B>;
		readonly onSingleton: (self: NoInfer<A>) => C;
		readonly onOverTwo: (self: MTypes.OverTwo<NoInfer<A>>) => D;
	}) =>
	(self: ReadonlyArray<A>): B | C | D =>
		pipe(
			self as MTypes.EmptyArray | MTypes.Singleton<A> | MTypes.OverTwo<A>,
			MMatch.make,
			MMatch.when(MTypes.isOverTwo<A>, (overTwo) => options.onOverTwo(overTwo)),
			MMatch.when(MTypes.isSingleton<A>, (singleton) => options.onSingleton(singleton[0])),
			MMatch.orElse(options.onEmpty)
		);
/**
 * Returns an array of the indexes of all elements of self matching the predicate
 *
 * @since 1.0.0
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
 */
export const takeBut =
	(n: number) =>
	<A>(self: ReadonlyArray<A>): Array<A> =>
		Array.take(self, self.length - n);

/**
 * Takes all elements of self except the n first elements
 */
export const takeRightBut =
	(n: number) =>
	<A>(self: ReadonlyArray<A>): Array<A> =>
		Array.takeRight(self, self.length - n);

/**
 * This function provides a safe way to read a value at a particular index from the end of a `ReadonlyArray`.
 */
export const getFromEnd =
	(index: number) =>
	<A>(self: ReadonlyArray<A>): Option.Option<A> =>
		Array.get(self, self.length - 1 - index);

/**
 * This function extracts the longest sub-array common to self and that starting at index 0
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
 * Extracts from an array the first item that matches the predicate. Returns the extracted item and the remaining items.
 */
export const extractFirst: {
	<A, B extends A>(
		refinement: (a: NoInfer<A>, i: number) => a is B
		// eslint-disable-next-line functional/prefer-readonly-type -- Return type
	): (self: ReadonlyArray<A>) => [match: Option.Option<B>, remaining: Array<A>];
	<A>(
		predicate: (a: NoInfer<A>, i: number) => boolean
		// eslint-disable-next-line functional/prefer-readonly-type -- Return type
	): (self: ReadonlyArray<A>) => [match: Option.Option<A>, remaining: Array<A>];
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
 * Flattens an array of arrays of A's adding an index that will allow to reverse this operation with fromIndexedFlattened
 */
export const ungroup = <A>(as: ReadonlyArray<ReadonlyArray<A>>): ReadonlyArray<[number, A]> =>
	pipe(
		as,
		Array.map((as, i) => Array.map(as, (a) => Tuple.make(i, a))),
		Array.flatten
	);

/**
 * Opposite operation of ungroup. Same as Array.groupBy but uses a number key. If fKey returns a negative index or an index superior or equal to size, the corresponding value is ignored
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
			// eslint-disable-next-line functional/immutable-data,functional/no-expression-statements,functional/prefer-readonly-type
			if (key >= 0 && key < size) (out[key] as Array<B>).push(fValue(a));
		}
		return out;
	};

/**
 * Same as Array.groupBy but with a value projection function
 */
export const groupBy =
	<A, B>({
		fKey,
		fValue
	}: {
		readonly fKey: (a: NoInfer<A>) => string;
		readonly fValue: (a: NoInfer<A>) => B;
	}) =>
	(self: Iterable<A>): Record<string, Array.NonEmptyArray<B>> =>
		pipe(self, Array.groupBy(fKey), Record.map(Array.map(fValue)));

/**
 * Same as Array.groupBy but stores the results in a map instead of an object which allows to use keys others than strings.
 */
/*export const groupByInMap =
	<A, B, C>(fKey: (a: A) => C, fValue: (a: A) => B) =>
	(self: ReadonlyArray<A>): HashMap.HashMap<C, Array.NonEmptyArray<B>> => {
		return HashMap.mutate(HashMap.empty<C, Array.NonEmptyArray<B>>(), (map) => {
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
 * Unsafe get an element from an array. No bounds check, Faster than the Readonly version
 */
export const unsafeGet =
	(index: number) =>
	<A>(self: ReadonlyArray<A>): A =>
		// @ts-expect-error getting array content unsafely
		self[index];

/**
 * Modify all elements of an array except the last. Returns a copy of self if it contains only one element.
 */
export const modifyInit =
	<S extends Readonly<MTypes.AnyArray>, B>(f: (a: Array.ReadonlyArray.Infer<S>, i: number) => B) =>
	(self: S): Array.ReadonlyArray.With<S, B> =>
		Array.map(self, (elem, i) => (i < self.length - 1 ? f(elem, i) : elem));

/**
 * Modify all elements of an array except the first. Returns a copy of self if it contains only one element.
 */
export const modifyTail =
	<S extends Readonly<MTypes.AnyArray>, B>(f: (a: Array.ReadonlyArray.Infer<S>, i: number) => B) =>
	(self: S): Array.ReadonlyArray.With<S, B> =>
		Array.map(self, (elem, i) => (i > 0 ? f(elem, i) : elem));

/**
 * Modify the last element of an array. Returns a copy of self if it contains no elements.
 */
export const modifyLast =
	<A, B>(f: (a: A) => B) =>
	(self: ReadonlyArray<A>): Array<A | B> =>
		Array.modify(self, self.length - 1, f);

/**
 * Modify the first element of an array. Returns a copy of self if it contains no elements.
 */
export const modifyHead =
	<A, B>(f: (a: A) => B) =>
	(self: ReadonlyArray<A>): Array<A | B> =>
		Array.modify(self, 0, f);
