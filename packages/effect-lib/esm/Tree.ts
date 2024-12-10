/**
 * Module that implements a Tree. Adapted from FP-TS. All nodes in the tree have the same type. If
 * you need a tree with a specific type for leaves, just create a Tree<A|B> where B woud be the
 * specifi type of the values of the leaves. From a type perspective, the only non-existent allowed
 * situation is that of a node with a value of type B (leaf) that has children. But if your are
 * confident that the tree was built properly, you can just ignore these non exitent children for
 * leaves.
 *
 * @since 0.0.6
 */

import * as Monoid from '@effect/typeclass/Monoid';
import {
	Array,
	Equal,
	Equivalence,
	flow,
	Function,
	Hash,
	Inspectable,
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

export const moduleTag = '@parischap/effect-lib/Tree/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * @since 0.0.6
 * @category Models
 */
export interface Forest<A> extends ReadonlyArray<Type<A>> {}

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
 * Returns an equivalence based on an equivalence of the subtype
 *
 * @since 0.5.0 Equivalence
 */
export const getEquivalence = <A>(
	isEquivalent: Equivalence.Equivalence<A>
): Equivalence.Equivalence<Type<A>> => {
	const internalEquivalence: Equivalence.Equivalence<Type<A>> = (self, that) =>
		isEquivalent(self.value, that.value) && forestEq(self.forest, that.forest);
	const forestEq: Equivalence.Equivalence<ReadonlyArray<Type<A>>> =
		Array.getEquivalence(internalEquivalence);
	return internalEquivalence;
};

/**
 * Equivalence based on Equal.equals
 *
 * @since 0.5.0
 * @category Equivalences
 */
export const equivalence = getEquivalence(Equal.equals);

/** Prototype */
const _TypeIdHash = Hash.hash(TypeId);
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const proto: MTypes.Proto<Type<any>> = {
	[TypeId]: {
		_A: MTypes.covariantValue
	},
	[Equal.symbol]<A>(this: Type<A>, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol]<A>(this: Type<A>) {
		return pipe(
			this.value,
			Hash.hash,
			Hash.combine(Hash.array(this.forest)),
			Hash.combine(_TypeIdHash),
			Hash.cached(this)
		);
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/**
 * Constructor
 *
 * @since 0.5.0
 * @category Constructors
 */
export const make = <A>(params: MTypes.Data<Type<A>>): Type<A> =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Utility type that returns the type of the value of a Tree
 *
 * @since 0.0.6
 * @category Utility types
 */

export type Infer<T extends Type<unknown>> = T extends Type<infer A> ? A : never;

/** Sets the value and forest of `self` */
const _mutableSet = <A>(self: Type<unknown>, value: A, forest: Forest<A>): Type<A> => {
	/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements, functional/prefer-readonly-type */
	(self as { value: A }).value = value;
	/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements, functional/prefer-readonly-type */
	(self as { forest: Forest<A> }).forest = forest;
	return self as Type<A>;
};

/**
 * Non recursive function that builds a (possibly infinite) tree from a seed value and an unfold
 * function, then optionnally applies a function f to the value of each node and the result of
 * applying f to the children of the node (see fold below). Cycle detection based on equality of the
 * seeds (type A) reported to the unfold function. The reason for grouping unfold with MapAccum is
 * that we have already calculated the order in which to perform the fold and we can mutate te tree
 * as it has been created by this function.
 *
 * @since 0.0.6
 * @category Constructors
 */
export const unfoldAndMapAccum =
	<A, B, C = B>(
		/* eslint-disable-next-line functional/prefer-readonly-type */
		unfold: (seed: A, isCyclical: boolean) => [nextValue: B, nextSeeds: ReadonlyArray<A>],
		f?: (value: B, children: ReadonlyArray<C>) => C
	) =>
	(seed: A): Type<C> => {
		const dontHandleCycles = MTypes.isOneArgFunction(unfold);

		return pipe(
			make({
				// MArray.unfold cycle detection will not work here. So we have to reimplement it
				value: Tuple.make(seed, Array.empty<A>()),
				forest: Array.empty()
			}),
			Array.of,
			MArray.unfold<Forest<readonly [seed: A, predecessors: ReadonlyArray<A>]>, Forest<B>>(
				flow(
					Option.liftPredicate(Array.isNonEmptyReadonlyArray),
					Option.map(
						flow(
							Array.map((node) => {
								const value = node.value;
								const currentSeed = Tuple.getFirst(value);
								const predecessors = Tuple.getSecond(value);
								const isCyclical = Array.contains(predecessors, currentSeed);
								const nextPredecessors =
									dontHandleCycles ? predecessors : Array.append(predecessors, currentSeed);
								const [nextValue, nextSeeds] = unfold(currentSeed, isCyclical);

								const nextNodes = Array.map(nextSeeds, (seed) =>
									make({
										value: Tuple.make(seed, nextPredecessors),
										forest: Array.empty()
									})
								);

								return Tuple.make(
									_mutableSet(node, nextValue, nextNodes as unknown as Forest<B>),
									nextNodes
								);
							}),
							Array.unzip,
							Tuple.mapSecond(Array.flatten)
						)
					)
				)
			),
			Array.flatten,
			Array.reverse,
			f === undefined ?
				Function.unsafeCoerce<Forest<B>, Forest<C>>
			:	Array.map((node) =>
					_mutableSet(
						node,
						f(
							node.value,
							Array.map(node.forest, Struct.get('value')) as unknown as ReadonlyArray<C>
						),
						node.forest as unknown as Forest<C>
					)
				),
			(arr) => Array.lastNonEmpty(arr as Array.NonEmptyArray<Type<C>>)
		);
	};

/**
 * Folds a tree into a "summary" value in bottom-up order.
 *
 * For each node in the tree, applies `f` to the `value` and the result of applying `f` to each
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

				return make({
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
				make({
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
				make({
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
				make({
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
