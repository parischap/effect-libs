/**
 * Module that implements a Tree. Adapted from FP-TS. Most functions are recursive but some are not.
 *
 * @since 0.0.6
 */

import * as Monoid from '@effect/typeclass/Monoid';
import {
	Array,
	Chunk,
	Equal,
	Equivalence,
	Function,
	Hash,
	Inspectable,
	MutableList,
	Option,
	pipe,
	Pipeable,
	Predicate,
	Struct,
	Tuple,
	Types
} from 'effect';
import * as MArray from './Array.js';
import * as MInspectable from './Inspectable.js';
import * as MPipeable from './Pipeable.js';
import * as MTypes from './types.js';

const moduleTag = '@parischap/effect-lib/Type/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * @since 0.0.6
 * @category Models
 */
export type Forest<A> = ReadonlyArray<Type<A>>;

/**
 * @since 0.0.6
 * @category Models
 */
export interface Type<out A> extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * The value
	 *
	 * @since 0.0.6
	 */
	readonly value: A;
	/**
	 * The children of `value`.
	 *
	 * @since 0.0.6
	 */
	readonly forest: Forest<A>;
	/** @internal */
	readonly [TypeId]: {
		readonly _A: Types.Covariant<A>;
	};
}

/**
 * Type guard
 *
 * @since 0.0.6
 * @category Guards
 */
export const has = (u: unknown): u is Type<unknown> => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence for the value property
 *
 * @since 0.0.6 Equivalence
 */
export const getEquivalence = <A>(
	isEquivalent: Equivalence.Equivalence<A>
): Equivalence.Equivalence<Type<A>> =>
	Equivalence.make((self, that) => isEquivalent(self.value, that.value));

/** Equivalence based on the equality of their values */
const _equivalence = getEquivalence(Equal.equals);

export {
	/**
	 * Equivalence
	 *
	 * @since 0.0.6
	 * @category Equivalences
	 */
	_equivalence as Equivalence
};

/** Prototype */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const proto: MTypes.Proto<Type<any>> = {
	[TypeId]: {
		_A: MTypes.covariantValue
	},
	[Equal.symbol]<A>(this: Type<A>, that: unknown): boolean {
		return has(that) && _equivalence(this, that);
	},
	[Hash.symbol]<A>(this: Type<A>) {
		return Hash.cached(this, Hash.hash(this.value));
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = <A>(params: MTypes.Data<Type<A>>): Type<A> =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Utility type that returns the type of the value of a Tree
 *
 * @since 0.0.6
 * @category Utility types
 */

export type Infer<T extends Type<unknown>> = T extends Type<infer A> ? A : never;

/**
 * Builds a (possibly infinite) tree from a seed value.
 *
 * @since 0.0.6
 * @category Constructors
 */
export const unfoldTree = <B, A>(
	seed: B,
	/* eslint-disable-next-line functional/prefer-readonly-type */
	f: (seed: B) => [nextValue: A, nextSeeds: ReadonlyArray<B>]
): Type<A> =>
	pipe(seed, f, ([nextValue, nextSeeds]) =>
		_make({
			value: nextValue,
			forest: unfoldForest(nextSeeds, f)
		})
	);

/**
 * Builds a (possibly infinite) forest from a list of seed values.
 *
 * @since 0.0.6
 * @category Constructors
 */
export const unfoldForest = <B, A>(
	seeds: ReadonlyArray<B>,
	/* eslint-disable-next-line functional/prefer-readonly-type */
	f: (seed: B) => [nextValue: A, nextSeeds: ReadonlyArray<B>]
): Forest<A> => Array.map(seeds, (seed) => unfoldTree(seed, f));

/**
 * Fold a tree into a "summary" value in bottom-up order.
 *
 * For each node in the tree, apply `f` to the `value` and the result of applying `f` to each
 * `forest`.
 *
 * This is also known as the catamorphism on trees.
 *
 * @since 0.0.6
 * @category Utils
 */
export const fold =
	<B, A>(f: (a: NoInfer<A>, bs: ReadonlyArray<B>, level: number) => B) =>
	(self: Type<A>): B => {
		const go =
			(level: number) =>
			(fa: Type<A>): B =>
				f(fa.value, Array.map(fa.forest, go(level + 1)), level);
		return go(0)(self);
	};

/**
 * @since 0.0.6
 * @category Utils
 */
export const flatMap =
	<B, A>(f: (a: NoInfer<A>, level: number) => Type<B>) =>
	(self: Type<A>): Type<B> => {
		const go =
			(level: number) =>
			(self: Type<A>): Type<B> => {
				const { forest, value } = f(self.value, level);

				return _make({
					value,
					forest: Array.appendAll(forest, Array.map(self.forest, go(level + 1)))
				});
			};
		return go(0)(self);
	};

/**
 * Returns a new tree in which the value of each node is replaced by the result of a function that
 * takes the node as parameter in top-down order. More powerful than map which takes only the value
 * of the node as parameter
 *
 * @since 0.0.6
 * @category Utils
 */
export const extendDown =
	<B, A>(f: (fa: Type<NoInfer<A>>, level: number) => B) =>
	(self: Type<A>): Type<B> => {
		const go =
			(level: number) =>
			(self: Type<A>): Type<B> =>
				_make({
					value: f(self, level),
					forest: Array.map(self.forest, go(level + 1))
				});
		return go(0)(self);
	};

/**
 * Returns a new tree in which the value of each node is replaced by the result of a function that
 * takes the node as parameter in bottom-up order. More powerful than map which takes only the value
 * of the node as parameter
 *
 * @since 0.0.6
 * @category Utils
 */
export const extendUp =
	<B, A>(f: (fa: Type<NoInfer<A>>, level: number) => B) =>
	(self: Type<A>): Type<B> => {
		const go =
			(level: number) =>
			(self: Type<A>): Type<B> =>
				_make({
					forest: Array.map(self.forest, go(level + 1)),
					value: f(self, level)
				});
		return go(0)(self);
	};

/**
 * Copies a tree
 *
 * @since 0.0.6
 * @category Utils
 */
export const duplicate: <A>(self: Type<A>) => Type<Type<A>> = extendDown(Function.identity);

/**
 * Flattens two imbricate trees
 *
 * @since 0.0.6
 * @category Utils
 */
export const flatten: <A>(self: Type<Type<A>>) => Type<A> = flatMap(Function.identity);

/**
 * Maps a tree
 *
 * @since 0.0.6
 * @category Utils
 */
export const map =
	<B, A>(f: (a: NoInfer<A>, level: number) => B) =>
	(self: Type<A>): Type<B> => {
		const go =
			(level: number) =>
			(self: Type<A>): Type<B> =>
				_make({
					value: f(self.value, level),
					forest: Array.map(self.forest, go(level + 1))
				});
		return go(0)(self);
	};

/**
 * Top-down reduction - Children are processed from left to right
 *
 * @since 0.0.6
 * @category Utils
 */
export const reduce =
	<B, A>(b: B, f: (b: B, a: NoInfer<A>, level: number) => B) =>
	(self: Type<A>): B => {
		const go =
			(b: B, level: number) =>
			(self: Type<A>): B => {
				let r: B = f(b, self.value, level);
				const len = self.forest.length;
				for (let i = 0; i < len; i++) {
					/* eslint-disable-next-line functional/no-expression-statements */
					r = pipe(self.forest, MArray.unsafeGet(i), go(r, level + 1));
				}
				return r;
			};
		return go(b, 0)(self);
	};

/**
 * Reduce using a monoid to perform the concatenation
 *
 * @since 0.0.6
 * @category Utils
 */
export const foldMap =
	<B, A>(M: Monoid.Monoid<B>, f: (a: NoInfer<A>, level: number) => B) =>
	(self: Type<A>): B =>
		pipe(
			self,
			reduce(M.empty, (acc, a, level) => M.combine(acc, f(a, level)))
		);

/**
 * Top-down reduction - Children are processed from right to left
 *
 * @since 0.0.6
 * @category Utils
 */
export const reduceRight =
	<B, A>(b: B, f: (b: B, a: NoInfer<A>, level: number) => B) =>
	(self: Type<A>): B => {
		const go =
			(b: B, level: number) =>
			(self: Type<A>): B => {
				let r: B = f(b, self.value, level);
				const len = self.forest.length;
				for (let i = len - 1; i >= 0; i--) {
					/* eslint-disable-next-line functional/no-expression-statements */
					r = pipe(self.forest, MArray.unsafeGet(i), go(r, level + 1));
				}
				return r;
			};
		return go(b, 0)(self);
	};

/**
 * Build a (possibly infinite) tree from a seed value and an unfold function, then optionnally
 * applies a function f to each node of the tree starting from the leaves. The function detects
 * cycles based on equality of the values (type B) and reports them to the unfold function - Non
 * recursive
 *
 * @since 0.0.6
 * @category Constructors
 */
export const nonRecursiveUnfoldAndMap: {
	<A, B, C>(
		seed: A,
		/* eslint-disable-next-line functional/prefer-readonly-type */
		unfold: (seed: A, isCyclic: boolean) => [nextValue: B, nextSeeds: ReadonlyArray<A>],
		f: (value: B, children: ReadonlyArray<C>) => C
	): Type<C>;
	<A, B>(
		seed: A,
		/* eslint-disable-next-line functional/prefer-readonly-type */
		unfold: (seed: A, isCyclic: boolean) => [nextValue: B, nextSeeds: ReadonlyArray<A>]
	): Type<B>;
} = <A, B, C>(
	seed: A,
	/* eslint-disable-next-line functional/prefer-readonly-type */
	unfold: (seed: A, isCyclic: boolean) => [nextValue: B, nextSeeds: ReadonlyArray<A>],
	f?: (value: B, children: ReadonlyArray<C>) => C
): Type<C> => {
	let toHandle: Chunk.Chunk<
		readonly [seed: A, parent: Option.Option<Type<B>>, predecessors: ReadonlyArray<A>]
	> = Chunk.of(Tuple.make(seed, Option.none<Type<B>>(), Array.empty<A>()));
	let top = Option.none<Type<B>>();
	const reverseNodeList: MutableList.MutableList<Type<B>> = MutableList.empty<Type<B>>();
	do {
		/* eslint-disable-next-line functional/no-expression-statements */
		toHandle = pipe(
			toHandle,
			Chunk.reduce(
				Chunk.empty<
					readonly [seed: A, parent: Option.Option<Type<B>>, predecessors: ReadonlyArray<A>]
				>(),
				(nextToHandle, [seed, parent, predecessors]) => {
					const isCyclic = Array.contains(predecessors, seed);
					const nextPredecessors = Array.append(predecessors, seed);

					const [nextValue, nextSeeds] = unfold(seed, isCyclic);
					const node = _make({
						value: nextValue,
						forest: Array.empty()
					});
					/* eslint-disable-next-line functional/no-expression-statements */
					MutableList.prepend(reverseNodeList, node);
					const nodeOption = Option.some(node);
					/* eslint-disable-next-line functional/no-expression-statements */
					top = Option.orElse(top, () => nodeOption);
					if (Option.isSome(parent))
						/* eslint-disable-next-line functional/immutable-data, functional/prefer-readonly-type, functional/no-expression-statements */
						(parent.value.forest as Array<Type<B>>).push(node);

					return pipe(
						nextSeeds,
						Array.map((seed) => Tuple.make(seed, nodeOption, nextPredecessors)),
						Chunk.fromIterable,
						Chunk.prependAll(nextToHandle)
					);
				}
			)
		);
	} while (Chunk.size(toHandle) > 0);

	if (f !== undefined) {
		let currentNode: Type<B> | undefined;
		while ((currentNode = MutableList.shift(reverseNodeList)) !== undefined) {
			/* eslint-disable-next-line functional/immutable-data, functional/prefer-readonly-type,functional/no-expression-statements */
			(currentNode as unknown as { value: C }).value = f(
				currentNode.value,
				Array.map(currentNode.forest, Struct.get('value')) as unknown as ReadonlyArray<C>
			);
		}
	}

	return (top as unknown as Option.Some<Type<C>>).value;
};
