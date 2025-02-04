/**
 * Module that implements a Tree<A,B> where the value of a non-leaf node is of type A and the value
 * of a leaf node is of type B.
 *
 * A node may have no leaf.
 *
 * A Tree may be composed of a single leaf. If this situation does not correspond to your need, you
 * may work with the type NonLeaf<A,B> instead. In all the provided functions, self can be a
 * Tree<A,B> or a NonLeaf<A,B>
 */

import {
	Array,
	Either,
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
import * as MFunction from './Function.js';
import * as MInspectable from './Inspectable.js';
import * as MMatch from './Match.js';
import * as MPipeable from './Pipeable.js';
import * as MStruct from './Struct.js';
import * as MTuple from './Tuple.js';
import * as MTypes from './types.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/effect-lib/Tree/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;
const _TypeIdHash = Hash.hash(_TypeId);

/**
 * Namespace of a Leaf
 *
 * @category Models
 */
export namespace Leaf {
	/**
	 * Typeof a Leaf node
	 *
	 * @category Models
	 */
	export interface Type<out B> extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
		/** Identifier of a Leaf */
		readonly _tag: 'Leaf';

		/** Value of a Leaf node */
		readonly value: B;

		/** @internal */
		readonly [_TypeId]: {
			readonly _A: Types.Covariant<never>;
			readonly _B: Types.Covariant<B>;
		};
	}

	/**
	 * Returns an equivalence based on an equivalence of the type of the values
	 *
	 * @since 0.5.0 Equivalence
	 */
	export const getEquivalence =
		<B>(bEquivalence: Equivalence.Equivalence<B>): Equivalence.Equivalence<Type<B>> =>
		(self, that) =>
			bEquivalence(self.value, that.value);

	/**
	 * Equivalence based on Equal.equals
	 *
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type<unknown>> = getEquivalence(Equal.equals);

	const _make = <B>(params: MTypes.Data<Type<B>>): Type<B> =>
		MTypes.objectFromDataAndProto(proto, params) as never;

	/**
	 * Constructor
	 *
	 * @category Constructors
	 */
	export const make = <B>(value: B): Type<B> => _make({ value, _tag: 'Leaf' });
}

/**
 * Namespace of a Forest
 *
 * @category Models
 */
export namespace Forest {
	/**
	 * Type of a Forest
	 *
	 * @category Models
	 */
	export type Type<A, B> = ReadonlyArray<_Type<A, B>>;

	/**
	 * Returns an equivalence based on an equivalence of the subtypes
	 *
	 * @since 0.5.0 Equivalence
	 */
	export const getEquivalence = <A, B>(
		aEquivalence: Equivalence.Equivalence<A>,
		bEquivalence: Equivalence.Equivalence<B>
	): Equivalence.Equivalence<Type<A, B>> => {
		const arrayEq = Array.getEquivalence(_getEquivalence(aEquivalence, bEquivalence));
		return arrayEq;
	};
}

type _Type<A, B> = Type<A, B>;
/**
 * Type of a Tree
 *
 * @category Models
 */
export type Type<A, B> = Leaf.Type<B> | NonLeaf.Type<A, B>;

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type<unknown, unknown> => Predicate.hasProperty(u, _TypeId);

/**
 * Type guard
 *
 * @category Guards
 */
export const isLeaf = <A, B>(u: Type<A, B>): u is Leaf.Type<B> => u._tag === 'Leaf';

/**
 * Returns an equivalence based on an equivalence of the subtypes
 *
 * @category Equivalences
 */
export const getEquivalence = <A, B>(
	aEquivalence: Equivalence.Equivalence<A>,
	bEquivalence: Equivalence.Equivalence<B>
): Equivalence.Equivalence<Type<A, B>> => {
	const leafEq = Leaf.getEquivalence(bEquivalence);
	// Do not create a variable with NonLeaf.getEquivalence(aEquivalence, bEquivalence) here. Equivalences on recursive structures must respect the structure termination process. So _getEquivalence(aEquivalence, bEquivalence) must only be called when this and that are not leaves.
	return (self, that) =>
		isLeaf(self) && isLeaf(that) ? leafEq(self, that)
		: !isLeaf(self) && !isLeaf(that) ?
			NonLeaf.getEquivalence(aEquivalence, bEquivalence)(self, that)
		:	false;
};
const _getEquivalence = getEquivalence;

/**
 * Equivalence based on Equal.equals
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type<unknown, unknown>> = getEquivalence(
	Equal.equals,
	Equal.equals
);

/** Prototype */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const proto: MTypes.Proto<Type<any, any>> = {
	[_TypeId]: {
		_A: MTypes.covariantValue,
		_B: MTypes.covariantValue
	},
	[Equal.symbol]<A, B>(this: Type<A, B>, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol]<A, B>(this: Type<A, B>) {
		return isLeaf(this) ?
				pipe(
					this.value,
					Hash.hash,
					Hash.combine(Hash.hash(this._tag)),
					Hash.combine(_TypeIdHash),
					Hash.cached(this)
				)
			:	pipe(
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

const _unfold =
	<S, A, B>(
		f: (
			seed: S,
			cyclicalRef: Option.Option<A>
		) => Either.Either<MTypes.Pair<A, ReadonlyArray<S>>, B>
	) =>
	(seed: S): MTypes.OverOne<Type<A, B>> => {
		const dontHandleCycles = MTypes.isOneArgFunction(f);

		return pipe(
			Array.of(
				Leaf.make(
					// MArray.unfold cycle detection will not work here. So we have to reimplement it
					Tuple.make(seed, Array.empty<S>(), Array.empty<A>())
				)
			),
			MArray.unfoldNonEmpty(
				flow(
					Array.map((node) => {
						const [currentSeed, predecessors, predecessorsValue] = node.value;
						const index = Array.findFirstIndex(predecessors, MFunction.strictEquals(currentSeed));

						return pipe(
							f(currentSeed, pipe(index, Option.map(MArray.unsafeGetter(predecessorsValue)))),
							Either.mapBoth({
								onLeft: (nextValue) =>
									pipe(
										node,
										MStruct.mutableEnrichWith({
											value: Function.constant(nextValue)
										}),
										(node) => Tuple.make(node as Leaf.Type<B>),
										Tuple.appendElement(Array.empty())
									),
								onRight: ([nextValue, nextSeeds]) => {
									const nextNodes = Array.map(nextSeeds, (seed) =>
										Leaf.make(
											Tuple.make(
												seed,
												dontHandleCycles ? predecessors : Array.append(predecessors, currentSeed),
												dontHandleCycles ? predecessorsValue : (
													Array.append(predecessorsValue, nextValue)
												)
											)
										)
									);
									return pipe(
										node,
										MStruct.mutableEnrichWith({
											_tag: Function.constant('NonLeaf' as const),
											value: Function.constant(nextValue),
											forest: Function.constant(nextNodes)
										}),
										(node) => Tuple.make(node as unknown as NonLeaf.Type<A, B>),
										Tuple.appendElement(nextNodes)
									);
								}
							}),
							Either.merge
						);
					}),
					Array.unzip,
					Tuple.mapSecond(flow(Array.flatten, Option.liftPredicate(Array.isNonEmptyArray)))
				)
			),
			Array.flatten
		);
	};

/**
 * Non recursive function that builds a (possibly infinite) tree from a seed value and an unfold
 * function. A cycle is reported when a seed has itself as a direct parent. In that case, function
 * `f` receives as `cyclicalRef` argument a `some` of the tree node that was created from that
 * seed.
 *
 * @category Constructors
 */

export const unfold =
	<S, A, B>(
		f: (
			seed: S,
			cyclicalRef: Option.Option<A>
		) => Either.Either<MTypes.Pair<A, ReadonlyArray<S>>, B>
	) =>
	(seed: S): Type<A, B> =>
		pipe(seed, _unfold(f), Array.headNonEmpty);

/**
 * Non recursive function that builds a (possibly infinite) tree from a seed value and an unfold
 * function, then applies a function f to the value of each node and the result of applying f to the
 * children of the node (see fold below). A cycle is reported when a seed has itself as a direct
 * parent. In that case, function `unfold` receives as `cyclicalRef` argument a `some` of the tree
 * node that wad created from that seed.
 *
 * @category Constructors
 */

export const unfoldAndFold =
	<A, B, S = A, C = B>({
		unfold,
		foldNonLeaf,
		foldLeaf
	}: {
		readonly unfold: (
			seed: S,
			cyclicalRef: Option.Option<A>
		) => Either.Either<MTypes.Pair<A, ReadonlyArray<S>>, B>;
		readonly foldNonLeaf: (value: A, children: ReadonlyArray<B>) => C;
		readonly foldLeaf: (value: B) => C;
	}) =>
	(seed: S): C =>
		pipe(
			seed,
			_unfold(unfold),
			Array.reverse,
			Array.map(
				flow(
					MMatch.make,
					MMatch.when(
						isLeaf,
						MStruct.mutableEnrichWith({
							value: (node) => foldLeaf(node.value)
						})
					),
					MMatch.orElse(
						MStruct.mutableEnrichWith({
							value: (node) =>
								foldNonLeaf(
									node.value,
									Array.map(node.forest as Forest.Type<B, B>, Struct.get('value'))
								)
						})
					)
				)
			),
			Array.lastNonEmpty,
			Struct.get('value')
		);

/**
 * Folds a tree into a "summary" value in bottom-up order with.
 *
 * For each Leaf in the tree, applies `fLeaf`. For each NonLeaf in the tree, applies `fNonLeaf` to
 * the `value` property and the result of applying `fNonLeaf` or `fLeaf` to each node in the
 * `forest` property.
 *
 * This is also known as the catamorphism on trees.
 *
 * @category Utils
 */
export const fold = <A, B, C>({
	fNonLeaf,
	fLeaf
}: {
	readonly fNonLeaf: (a: NoInfer<A>, bs: ReadonlyArray<C>, level: number) => C;
	readonly fLeaf: (a: NoInfer<B>, level: number) => C;
}): MTypes.OneArgFunction<Type<A, B>, C> => {
	const go =
		(level: number) =>
		(self: Type<A, B>): C =>
			isLeaf(self) ?
				fLeaf(self.value, level + 1)
			:	fNonLeaf(self.value, Array.map(self.forest, go(level + 1)), level);

	return go(0);
};

/**
 * Maps a tree with an accumulator
 *
 * @category Utils
 */
export const mapAccum = <S, A, B, C, D>({
	accum,
	fNonLeaf,
	fLeaf
}: {
	readonly accum: S;
	readonly fNonLeaf: (s: S, a: NoInfer<A>, level: number) => MTypes.Pair<S, C>;
	readonly fLeaf: (s: S, b: NoInfer<B>, level: number) => D;
}): MTypes.OneArgFunction<Type<A, B>, Type<C, D>> => {
	const go = (s: S, level: number): MTypes.OneArgFunction<Type<A, B>, Type<C, D>> =>
		flow(
			MMatch.make,
			MMatch.when(isLeaf, (leaf) => Leaf.make(fLeaf(s, leaf.value, level))),
			MMatch.orElse((nonLeaf) => {
				const [nextS, value] = fNonLeaf(s, nonLeaf.value, level);
				return NonLeaf.make({
					value,
					forest: Array.map(nonLeaf.forest, go(nextS, level + 1))
				});
			})
		);

	return go(accum, 0);
};

/**
 * Maps a tree
 *
 * @category Utils
 */
export const map = <A, B, C, D>({
	fNonLeaf,
	fLeaf
}: {
	readonly fNonLeaf: (a: NoInfer<A>, level: number) => C;
	readonly fLeaf: (b: NoInfer<B>, level: number) => D;
}): MTypes.OneArgFunction<Type<A, B>, Type<C, D>> => {
	const internalFNonLeaf = (_: number, a: A, level: number) =>
		pipe(fNonLeaf(a, level), Tuple.make, MTuple.prependElement(0));
	const internalFLeaf = (_: number, b: B, level: number) => fLeaf(b, level);
	return mapAccum({ accum: 0, fNonLeaf: internalFNonLeaf, fLeaf: internalFLeaf });
};

const _reduce =
	(arrReduceFunction: typeof Array.reduce) =>
	<A, B, Z>({
		z,
		fNonLeaf,
		fLeaf
	}: {
		readonly z: Z;
		readonly fNonLeaf: (z: Z, a: NoInfer<A>, level: number) => Z;
		readonly fLeaf: (z: Z, b: NoInfer<B>, level: number) => Z;
	}): MTypes.OneArgFunction<Type<A, B>, Z> => {
		const go = (z: Z, level: number): MTypes.OneArgFunction<Type<A, B>, Z> =>
			flow(
				MMatch.make,
				MMatch.when(isLeaf, (leaf) => fLeaf(z, leaf.value, level)),
				MMatch.orElse((nonLeaf) =>
					arrReduceFunction(nonLeaf.forest, fNonLeaf(z, nonLeaf.value, level), (acc, node) =>
						go(acc, level + 1)(node)
					)
				)
			);

		return go(z, 0);
	};

/**
 * Top-down reduction - Children are processed from left to right
 *
 * @category Utils
 */
export const reduce = _reduce(Array.reduce);

/**
 * Top-down reduction - Children are processed from right to left
 *
 * @category Utils
 */
export const reduceRight = _reduce(Array.reduceRight);

/**
 * Returns a new tree in which the value of each node is replaced by the result of a function that
 * takes the node as parameter in top-down order. More powerful than map which takes only the value
 * of the node as parameter
 *
 * @category Utils
 */
export const extendDown = <A, B, C, D>({
	fNonLeaf,
	fLeaf
}: {
	readonly fNonLeaf: (tree: Type<NoInfer<A>, NoInfer<B>>, level: number) => C;
	readonly fLeaf: (leaf: Leaf.Type<NoInfer<B>>, level: number) => D;
}): MTypes.OneArgFunction<Type<A, B>, Type<C, D>> => {
	const go = (level: number): MTypes.OneArgFunction<Type<A, B>, Type<C, D>> =>
		flow(
			MMatch.make,
			MMatch.when(isLeaf, (leaf) => Leaf.make(fLeaf(leaf, level))),
			MMatch.orElse((nonLeaf) =>
				NonLeaf.make({
					value: fNonLeaf(nonLeaf, level),
					forest: Array.map(nonLeaf.forest, go(level + 1))
				})
			)
		);

	return go(0);
};

/**
 * Returns a new tree in which the value of each node is replaced by the result of a function that
 * takes the node as parameter in bottom-up order. More powerful than map which takes only the value
 * of the node as parameter
 *
 * @category Utils
 */
export const extendUp = <A, B, C, D>({
	fNonLeaf,
	fLeaf
}: {
	readonly fNonLeaf: (tree: Type<NoInfer<A>, NoInfer<B>>, level: number) => C;
	readonly fLeaf: (leaf: Leaf.Type<NoInfer<B>>, level: number) => D;
}): MTypes.OneArgFunction<Type<A, B>, Type<C, D>> => {
	const go = (level: number): MTypes.OneArgFunction<Type<A, B>, Type<C, D>> =>
		flow(
			MMatch.make,
			MMatch.when(isLeaf, (leaf) => Leaf.make(fLeaf(leaf, level))),
			MMatch.orElse((nonLeaf) =>
				NonLeaf.make({
					forest: Array.map(nonLeaf.forest, go(level + 1)),
					value: fNonLeaf(nonLeaf, level)
				})
			)
		);

	return go(0);
};

/**
 * Namespace of a NonLeaf
 *
 * @category Models
 */
export namespace NonLeaf {
	/**
	 * Typeof a NonLeaf
	 *
	 * @category Models
	 */
	export interface Type<out A, out B>
		extends Equal.Equal,
			Inspectable.Inspectable,
			Pipeable.Pipeable {
		/** Identifier of a NonLeaf */
		readonly _tag: 'NonLeaf';

		/** The value of a NonLeaf */
		readonly value: A;
		/** The children of a NonLeaf */
		readonly forest: Forest.Type<A, B>;

		/** @internal */
		readonly [_TypeId]: {
			readonly _A: Types.Covariant<A>;
			readonly _B: Types.Covariant<B>;
		};
	}

	/**
	 * Returns an equivalence based on an equivalence of the subtypes
	 *
	 * @since 0.5.0 Equivalence
	 */
	export const getEquivalence = <A, B>(
		aEquivalence: Equivalence.Equivalence<A>,
		bEquivalence: Equivalence.Equivalence<B>
	): Equivalence.Equivalence<Type<A, B>> => {
		const forestEq = Forest.getEquivalence(aEquivalence, bEquivalence);
		return (self, that) =>
			aEquivalence(self.value, that.value) && forestEq(self.forest, that.forest);
	};

	/**
	 * Equivalence based on Equal.equals
	 *
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type<unknown, unknown>> = getEquivalence(
		Equal.equals,
		Equal.equals
	);

	const _make = <A, B>(params: MTypes.Data<Type<A, B>>): Type<A, B> =>
		MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Constructor
	 *
	 * @category Constructors
	 */
	export const make = <A, B>(params: Omit<MTypes.Data<Type<A, B>>, '_tag'>): Type<A, B> =>
		_make({ ...params, _tag: 'NonLeaf' });
}
