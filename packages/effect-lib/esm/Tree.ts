/**
 * Module that implements a Tree<A,B> where the value of the non-leaf nodes is of type A and the
 * value of the leaf nodes is of type B. Adapted from FP-TS
 *
 * @since 0.5.0
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
import * as MInspectable from './Inspectable.js';
import * as MMatch from './Match.js';
import * as MPipeable from './Pipeable.js';
import * as MStruct from './Struct.js';
import * as MTypes from './types.js';

export const moduleTag = '@parischap/effect-lib/Tree/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;
const _TypeIdHash = Hash.hash(TypeId);

/**
 * Namespace of a Leaf
 *
 * @since 0.5.0
 * @category Models
 */
export namespace Leaf {
	/**
	 * Typeof a Leaf node
	 *
	 * @since 0.5.0
	 * @category Models
	 */
	export interface Type<out A, out B>
		extends Equal.Equal,
			Inspectable.Inspectable,
			Pipeable.Pipeable {
		/**
		 * Identifier of a Leaf
		 *
		 * @since 0.5.0
		 */
		readonly _tag: 'Leaf';

		/**
		 * Value of a Leaf node
		 *
		 * @since 0.5.0
		 */
		readonly value: B;

		/** @internal */
		readonly [TypeId]: {
			readonly _A: Types.Covariant<A>;
			readonly _B: Types.Covariant<B>;
		};
	}

	/**
	 * Type guard
	 *
	 * @since 0.5.0
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type<unknown, unknown> => Node.has(u) && Node.isLeaf(u);

	/**
	 * Returns an equivalence based on an equivalence of the type of the values
	 *
	 * @since 0.5.0 Equivalence
	 */
	export const getEquivalence =
		<B>(bEquivalence: Equivalence.Equivalence<B>): Equivalence.Equivalence<Type<unknown, B>> =>
		(self, that) =>
			bEquivalence(self.value, that.value);

	/**
	 * Equivalence based on Equal.equals
	 *
	 * @since 0.5.0
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type<unknown, unknown>> = getEquivalence(
		Equal.equals
	);

	const _make = <A, B>(params: MTypes.Data<Type<A, B>>): Type<A, B> =>
		MTypes.objectFromDataAndProto(Node.proto, params);

	/**
	 * Constructor
	 *
	 * @since 0.5.0
	 * @category Constructors
	 */
	export const make = <A, B>(value: B): Type<A, B> => _make({ value, _tag: 'Leaf' });
}

export namespace Node {
	/**
	 * Type of a Node
	 *
	 * @since 0.5.0
	 * @category Models
	 */
	export type Type<A, B> = Leaf.Type<A, B> | _Type<A, B>;

	/**
	 * Type guard
	 *
	 * @since 0.5.0
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type<unknown, unknown> => Predicate.hasProperty(u, TypeId);

	/**
	 * Type guard
	 *
	 * @since 0.5.0
	 * @category Guards
	 */
	export const isLeaf = <A, B>(u: Type<A, B>): u is Leaf.Type<A, B> => u._tag === 'Leaf';

	/**
	 * Returns an equivalence based on an equivalence of the subtypes
	 *
	 * @since 0.5.0 Equivalence
	 */
	export const getEquivalence = <A, B>(
		aEquivalence: Equivalence.Equivalence<A>,
		bEquivalence: Equivalence.Equivalence<B>
	): Equivalence.Equivalence<Type<A, B>> => {
		const leafEq = Leaf.getEquivalence(bEquivalence);
		// Do not create a variable with _getEquivalence(aEquivalence, bEquivalence) here. Equivalences on recursive structures must respect the structure termination process. So _getEquivalence(aEquivalence, bEquivalence) must only be called when this and that are not leaves.
		return (self, that) =>
			isLeaf(self) && isLeaf(that) ? leafEq(self, that)
			: !isLeaf(self) && !isLeaf(that) ? _getEquivalence(aEquivalence, bEquivalence)(self, that)
			: false;
	};

	/**
	 * Equivalence based on Equal.equals
	 *
	 * @since 0.5.0
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type<unknown, unknown>> = getEquivalence(
		Equal.equals,
		Equal.equals
	);

	/** Prototype */
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	export const proto: MTypes.Proto<Type<any, any>> = {
		[TypeId]: {
			_A: MTypes.covariantValue,
			_B: MTypes.covariantValue
		},
		[Equal.symbol]<A, B>(this: Type<A, B>, that: unknown): boolean {
			return has(that) && equivalence(this, that);
		},
		[Hash.symbol]<A, B>(this: Type<A, B>) {
			return isLeaf(this) ?
					pipe(this.value, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this))
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
}

/**
 * Namespace of a Forest
 *
 * @since 0.5.0
 * @category Models
 */
export namespace Forest {
	/**
	 * Type of a forest
	 *
	 * @since 0.5.0
	 * @category Models
	 */
	export interface Type<out A, out B> extends ReadonlyArray<Node.Type<A, B>> {}

	/**
	 * Typeof the children of a node (at least one child)
	 *
	 * @since 0.5.0
	 * @category Models
	 */
	export type NonEmptyType<out A, out B> = Array.NonEmptyReadonlyArray<Node.Type<A, B>>;

	/**
	 * Returns an equivalence based on an equivalence of the subtypes
	 *
	 * @since 0.5.0 Equivalence
	 */
	export const getEquivalence =
		<A, B>(
			aEquivalence: Equivalence.Equivalence<A>,
			bEquivalence: Equivalence.Equivalence<B>
		): Equivalence.Equivalence<Type<A, B>> =>
		// Do not create a variable with Node.getEquivalence(aEquivalence, bEquivalence) here. Equivalences on recursive structures must respect the structure termination process. So Node.getEquivalence(aEquivalence, bEquivalence) must only be called when this and that are not empty arrays.
		(self, that) =>
			Array.isEmptyReadonlyArray(self) ?
				Array.isEmptyReadonlyArray(that) ?
					true
				:	false
			: Array.isEmptyReadonlyArray(that) ? false
			: Array.getEquivalence(Node.getEquivalence(aEquivalence, bEquivalence))(self, that);
}

/**
 * Typeof a Tree (non-leaf node)
 *
 * @since 0.5.0
 * @category Models
 */
export interface Type<out A, out B>
	extends Equal.Equal,
		Inspectable.Inspectable,
		Pipeable.Pipeable {
	/**
	 * Identifier of a Tree
	 *
	 * @since 0.5.0
	 */
	readonly _tag: 'Tree';

	/**
	 * The value of a Tree (non-leaf node)
	 *
	 * @since 0.5.0
	 */
	readonly value: A;
	/**
	 * The children of a Tree (non-leaf node)
	 *
	 * @since 0.5.0
	 */
	readonly forest: Forest.Type<A, B>;

	/** @internal */
	readonly [TypeId]: {
		readonly _A: Types.Covariant<A>;
		readonly _B: Types.Covariant<B>;
	};
}
type _Type<out A, out B> = Type<A, B>;

/**
 * Type guard
 *
 * @since 0.5.0
 * @category Guards
 */
export const has = (u: unknown): u is Type<unknown, unknown> => Node.has(u) && !Node.isLeaf(u);

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
	return (self, that) => aEquivalence(self.value, that.value) && forestEq(self.forest, that.forest);
};
const _getEquivalence = getEquivalence;

/**
 * Equivalence based on Equal.equals
 *
 * @since 0.5.0
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type<unknown, unknown>> = getEquivalence(
	Equal.equals,
	Equal.equals
);

const _make = <A, B>(params: MTypes.Data<Type<A, B>>): Type<A, B> =>
	MTypes.objectFromDataAndProto(Node.proto, params);

/**
 * Constructor
 *
 * @since 0.5.0
 * @category Constructors
 */
export const make = <A, B>(params: Omit<MTypes.Data<Type<A, B>>, '_tag'>): Type<A, B> =>
	_make({ ...params, _tag: 'Tree' });

const _unfold =
	<S, A, B>(
		f: (
			seed: S,
			isCyclical: boolean
			/* eslint-disable-next-line functional/prefer-readonly-type */
		) => Either.Either<[nextValue: A, nextSeeds: ReadonlyArray<S>], B>
	) =>
	(seed: S): Forest.NonEmptyType<A, B> => {
		const dontHandleCycles = MTypes.isOneArgFunction(f);

		return pipe(
			[
				Leaf.make(
					// MArray.unfold cycle detection will not work here. So we have to reimplement it
					Tuple.make(seed, Array.empty<S>())
				)
			],
			MArray.unfoldNonEmpty(
				flow(
					Array.map((node) => {
						const [currentSeed, predecessors] = node.value;
						const isCyclical = Array.contains(predecessors, currentSeed);
						return pipe(
							f(currentSeed, isCyclical),
							Either.mapBoth({
								onLeft: (nextValue) =>
									pipe(
										node,
										MStruct.mutableEnrichWith({
											value: Function.constant(nextValue)
										}),
										(node) => Tuple.make(node as unknown as Leaf.Type<A, B>),
										Tuple.appendElement(Array.empty())
									),
								onRight: ([nextValue, nextSeeds]) => {
									const nextNodes = Array.map(nextSeeds, (seed) =>
										Leaf.make(
											Tuple.make(
												seed,
												dontHandleCycles ? predecessors : Array.append(predecessors, currentSeed)
											)
										)
									);
									return pipe(
										node,
										MStruct.mutableEnrichWith({
											value: Function.constant(nextValue),
											_tag: Function.constant('Tree' as const),
											forest: Function.constant(nextNodes as unknown as Forest.Type<A, B>)
										}),
										(node) => Tuple.make(node as Type<A, B>),
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
		) as never;
	};

/**
 * Non recursive function that builds a (possibly infinite) tree from a seed value and an unfold
 * function. Cycle detection based on equality of the seeds (type S) reported to the unfold
 * function.
 *
 * @since 0.5.0
 * @category Constructors
 */

export const unfold =
	<S, A, B>(
		f: (
			seed: S,
			isCyclical: boolean
			/* eslint-disable-next-line functional/prefer-readonly-type */
		) => Either.Either<[nextValue: A, nextSeeds: ReadonlyArray<S>], B>
	) =>
	(seed: S): Type<A, B> =>
		pipe(seed, _unfold(f), Array.headNonEmpty) as never;

/**
 * Non recursive function that builds a (possibly infinite) tree from a seed value and an unfold
 * function, then applies a function f to the value of each node and the result of applying f to the
 * children of the node (see fold below). Cycle detection based on equality of the seeds (type S)
 * reported to the unfold function.
 *
 * @since 0.5.0
 * @category Constructors
 */

export const unfoldAndFold =
	<S, A, B>({
		unfold,
		fold
	}: {
		readonly unfold: (
			seed: S,
			isCyclical: boolean
			/* eslint-disable-next-line functional/prefer-readonly-type */
		) => Either.Either<[nextValue: A, nextSeeds: ReadonlyArray<S>], B>;
		readonly fold: (value: A, children: ReadonlyArray<B>) => B;
	}) =>
	(seed: S): B =>
		pipe(
			seed,
			_unfold(unfold),
			Array.reverse,
			Array.map(
				flow(
					MMatch.make,
					MMatch.when(Node.isLeaf, Function.identity),
					MMatch.orElse(
						MStruct.mutableEnrichWith({
							value: (node) =>
								fold(
									node.value,
									Array.map(node.forest as unknown as Forest.Type<B, B>, Struct.get('value'))
								)
						})
					)
				)
			),
			Array.lastNonEmpty,
			Struct.get('value')
		);

/**
 * Folds a tree into a "summary" value in bottom-up order.
 *
 * For each node in the tree, applies `f` to the `value` and the result of applying `f` to each
 * `forest`.
 *
 * This is also known as the catamorphism on trees.
 *
 * @since 0.5.0
 * @category Utils
 */
export const fold = <A, B>(
	f: (a: NoInfer<A>, bs: ReadonlyArray<B>, level: number) => B
): MTypes.OneArgFunction<Type<A, B>, B> => {
	const go =
		(level: number) =>
		(self: Node.Type<A, B>): B =>
			Node.isLeaf(self) ? self.value : f(self.value, Array.map(self.forest, go(level + 1)), level);

	return go(0);
};

/**
 * Maps a tree
 *
 * @since 0.5.0
 * @category Utils
 */
export const map = <A, B, C, D>({
	fNonLeaf,
	fLeaf
}: {
	readonly fNonLeaf: (a: NoInfer<A>, level: number) => C;
	readonly fLeaf: (b: NoInfer<B>, level: number) => D;
}): MTypes.OneArgFunction<Type<A, B>, Type<C, D>> => {
	const goLeaf =
		(level: number) =>
		(self: Leaf.Type<A, B>): Leaf.Type<C, D> =>
			Leaf.make<C, D>(fLeaf(self.value, level));

	const goNonLeaf =
		(level: number) =>
		(self: Type<A, B>): Type<C, D> =>
			make({
				value: fNonLeaf(self.value, level),
				forest: Array.map(
					self.forest,
					flow(
						MMatch.make,
						MMatch.when(Node.isLeaf, goLeaf(level + 1)),
						MMatch.orElse(goNonLeaf(level + 1))
					)
				)
			});

	return goNonLeaf(0);
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
		const goLeaf =
			(z: Z, level: number) =>
			(self: Leaf.Type<A, B>): Z =>
				fLeaf(z, self.value, level);

		const goNonLeaf =
			(z: Z, level: number) =>
			(self: Type<A, B>): Z =>
				arrReduceFunction(self.forest, fNonLeaf(z, self.value, level), (z, node) =>
					pipe(
						node,
						MMatch.make,
						MMatch.when(Node.isLeaf, goLeaf(z, level + 1)),
						MMatch.orElse(goNonLeaf(z, level + 1))
					)
				);

		return goNonLeaf(z, 0);
	};

/**
 * Top-down reduction - Children are processed from left to right
 *
 * @since 0.5.0
 * @category Utils
 */
export const reduce = _reduce(Array.reduce);

/**
 * Top-down reduction - Children are processed from right to left
 *
 * @since 0.5.0
 * @category Utils
 */
export const reduceRight = _reduce(Array.reduceRight);

/**
 * Returns a new tree in which the value of each node is replaced by the result of a function that
 * takes the node as parameter in top-down order. More powerful than map which takes only the value
 * of the node as parameter
 *
 * @since 0.5.0
 * @category Utils
 */
export const extendDown = <A, B, C, D>({
	fNonLeaf,
	fLeaf
}: {
	readonly fNonLeaf: (tree: Type<NoInfer<A>, NoInfer<B>>, level: number) => C;
	readonly fLeaf: (leaf: Leaf.Type<NoInfer<A>, NoInfer<B>>, level: number) => D;
}): MTypes.OneArgFunction<Type<A, B>, Type<C, D>> => {
	const goLeaf =
		(level: number) =>
		(self: Leaf.Type<A, B>): Leaf.Type<C, D> =>
			Leaf.make<C, D>(fLeaf(self, level));

	const goNonLeaf =
		(level: number) =>
		(self: Type<A, B>): Type<C, D> =>
			make({
				value: fNonLeaf(self, level),
				forest: Array.map(
					self.forest,
					flow(
						MMatch.make,
						MMatch.when(Node.isLeaf, goLeaf(level + 1)),
						MMatch.orElse(goNonLeaf(level + 1))
					)
				)
			});

	return goNonLeaf(0);
};

/**
 * Returns a new tree in which the value of each node is replaced by the result of a function that
 * takes the node as parameter in bottom-up order. More powerful than map which takes only the value
 * of the node as parameter
 *
 * @since 0.5.0
 * @category Utils
 */
export const extendUp = <A, B, C, D>({
	fNonLeaf,
	fLeaf
}: {
	readonly fNonLeaf: (tree: Type<NoInfer<A>, NoInfer<B>>, level: number) => C;
	readonly fLeaf: (leaf: Leaf.Type<NoInfer<A>, NoInfer<B>>, level: number) => D;
}): MTypes.OneArgFunction<Type<A, B>, Type<C, D>> => {
	const goLeaf =
		(level: number) =>
		(self: Leaf.Type<A, B>): Leaf.Type<C, D> =>
			Leaf.make<C, D>(fLeaf(self, level));

	const goNonLeaf =
		(level: number) =>
		(self: Type<A, B>): Type<C, D> =>
			make({
				forest: Array.map(
					self.forest,
					flow(
						MMatch.make,
						MMatch.when(Node.isLeaf, goLeaf(level + 1)),
						MMatch.orElse(goNonLeaf(level + 1))
					)
				),
				value: fNonLeaf(self, level)
			});

	return goNonLeaf(0);
};
