/**
 * Module that implements a Tree<A,B> where the value of a non-leaf node is of type A and the value
 * of a leaf node is of type B. A non-leaf node also contains a forest, i.e. an array of trees.
 *
 * A Tree may have no leaf.
 *
 * A Tree may be composed of a single leaf. If this situation does not correspond to your need, you
 * may work with the type NonLeaf<A,B> instead. In all the provided functions, `self` can be a
 * Tree<A,B> or a NonLeaf<A,B>
 */

import {
  Array,
  Either,
  Equal,
  Equivalence,
  flow,
  Hash,
  Inspectable,
  Option,
  pipe,
  Pipeable,
  Struct,
  Tuple,
} from 'effect';
import * as MArray from './Array.js';
import * as MData from './Data.js';
import * as MMatch from './Match.js';
import * as MStruct from './Struct.js';
import * as MTuple from './Tuple.js';
import * as MTypes from './types.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Tree/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a Leaf
 *
 * @category Models
 */
export namespace Leaf {
  const _namespaceTag = '@parischap/effect-lib/Tree/Leaf/';
  const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
  type _TypeId = typeof _TypeId;
  /**
   * Typeof a Leaf node
   *
   * @category Models
   */
  export class Type<out B>
    extends MData.Class({ id: _namespaceTag, uniqueSymbol: _TypeId })
    implements Pipeable.Pipeable, Inspectable.Inspectable, Equal.Equal, Hash.Hash
  {
    /** Value of a Leaf node */
    readonly value: B;

    /** Class constructor */
    private constructor({ value }: MData.Extract<Type<B>>) {
      super();
      this.value = value;
    }

    /** Static constructor */
    static make<B>(params: MData.Extract<Type<B>>): Type<B> {
      return new Type(params);
    }
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
   * Constructor
   *
   * @category Constructors
   */
  export const make = <B>(value: B): Type<B> => Type.make({ value });

  /**
   * Returns the `value` property of `self`
   *
   * @category Destructors
   */
  export const value: <B>(self: Type<B>) => B = Struct.get('value');
}

/**
 * Namespace of a NonLeaf
 *
 * @category Models
 */
export namespace NonLeaf {
  const _namespaceTag = '@parischap/effect-lib/Tree/NonLeaf/';
  const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
  type _TypeId = typeof _TypeId;

  /**
   * Typeof a NonLeaf
   *
   * @category Models
   */
  export class Type<out A, out B>
    extends MData.Class({ id: _namespaceTag, uniqueSymbol: _TypeId })
    implements Pipeable.Pipeable, Inspectable.Inspectable, Equal.Equal, Hash.Hash
  {
    /** The value of a NonLeaf */
    readonly value: A;
    /** The children of a NonLeaf */
    readonly forest: Forest.Type<A, B>;

    /** Class constructor */
    private constructor({ value, forest }: MData.Extract<Type<A, B>>) {
      super();
      this.value = value;
      this.forest = forest;
    }

    /** Static constructor */
    static make<A, B>(params: MData.Extract<Type<A, B>>): Type<A, B> {
      return new Type(params);
    }
  }

  /**
   * Returns an equivalence based on an equivalence of the subtypes
   *
   * @since 0.5.0 Equivalence
   */
  export const getEquivalence = <A, B>(
    aEquivalence: Equivalence.Equivalence<A>,
    bEquivalence: Equivalence.Equivalence<B>,
  ): Equivalence.Equivalence<Type<A, B>> => {
    const forestEq = Forest.getEquivalence(aEquivalence, bEquivalence);
    return (self, that) =>
      aEquivalence(self.value, that.value) && forestEq(self.forest, that.forest);
  };

  /**
   * Constructor
   *
   * @category Constructors
   */
  export const make = <A, B>(params: MData.Extract<Type<A, B>>): Type<A, B> => Type.make(params);

  /**
   * Returns the `value` property of `self`
   *
   * @category Destructors
   */
  export const value: <A, B>(self: Type<A, B>) => A = Struct.get('value');
}

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
export const isLeaf = <A, B>(u: Type<A, B>): u is Leaf.Type<B> => u instanceof Leaf.Type;

/**
 * Type guard
 *
 * @category Guards
 */
export const isNonLeaf = <A, B>(u: Type<A, B>): u is NonLeaf.Type<A, B> =>
  u instanceof NonLeaf.Type;

/**
 * Returns an equivalence based on an equivalence of the subtypes
 *
 * @category Equivalences
 */
export const getEquivalence = <A, B>(
  aEquivalence: Equivalence.Equivalence<A>,
  bEquivalence: Equivalence.Equivalence<B>,
): Equivalence.Equivalence<Type<A, B>> => {
  const leafEq = Leaf.getEquivalence(bEquivalence);
  // Do not create a variable with NonLeaf.getEquivalence(aEquivalence, bEquivalence) here. Equivalences on recursive structures must respect the structure termination process. So getEquivalence(aEquivalence, bEquivalence) must only be called when this and that are not leaves.
  return (self, that) =>
    isLeaf(self) && isLeaf(that) ? leafEq(self, that)
    : isNonLeaf(self) && isNonLeaf(that) ?
      NonLeaf.getEquivalence(aEquivalence, bEquivalence)(self, that)
    : false;
};

/**
 * Returns the `value` property of `self`
 *
 * @category Destructors
 */
export const value: <A, B>(self: Type<A, B>) => A | B = Struct.get('value');

type _Type<A, B> = Type<A, B>;
const _getEquivalence = getEquivalence;
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
    bEquivalence: Equivalence.Equivalence<B>,
  ): Equivalence.Equivalence<Type<A, B>> => {
    const arrayEq = Array.getEquivalence(_getEquivalence(aEquivalence, bEquivalence));
    return arrayEq;
  };
}

const _unfold =
  <S, A, B>(
    f: (
      seed: S,
      cycleSource: Option.Option<A>,
    ) => Either.Either<MTypes.Pair<A, ReadonlyArray<S>>, B>,
    seedEquivalence: Equivalence.Equivalence<S>,
  ) =>
  (seed: S): MTypes.OverOne<Type<A, B>> => {
    const dontHandleCycles = MTypes.isOneArgFunction(f);

    return pipe(
      Array.of(Tuple.make(seed, Array.empty<[parent: S, parentValue: NonLeaf.Type<A, B>]>())),
      MArray.unfoldNonEmpty(
        flow(
          Array.map(([currentSeed, parents]) => {
            const containingNonLeafOption = pipe(parents, Array.last, Option.map(Tuple.getSecond));
            const [nextNode, nextSeeds]: [Leaf.Type<B> | NonLeaf.Type<A, B>, ReadonlyArray<S>] =
              pipe(
                f(
                  currentSeed,
                  dontHandleCycles ?
                    Option.none<A>()
                  : pipe(
                      parents,
                      Array.findFirst(([parentSeed]) => seedEquivalence(parentSeed, currentSeed)),
                      Option.map(flow(Tuple.getSecond, NonLeaf.value)),
                    ),
                ),
                Either.mapBoth({
                  onLeft: flow(Leaf.make, Tuple.make, Tuple.appendElement(Array.empty<S>())),
                  onRight: Tuple.mapFirst((value) =>
                    NonLeaf.make({ value, forest: Array.empty<Type<A, B>>() }),
                  ),
                }),
                Either.merge,
              );

            if (Option.isSome(containingNonLeafOption))
              (containingNonLeafOption.value.forest as Array<Type<A, B>>).push(nextNode);

            return 0 as never;
          }),
          Array.unzip,
          Tuple.mapSecond(flow(Array.flatten, Option.liftPredicate(Array.isNonEmptyArray))),
        ),
      ),
      Array.flatten,
    );
  };

/**
 * Non recursive function that builds a (possibly infinite) tree from a seed value and an unfold
 * function. The unfold function takes a seed and returns either a left of a value of type B from
 * which a leaf is created or a right of a value of type A and an array of new seeds (possibly
 * empty). A non leaf is created from this value of type A and from the result of calling the unfold
 * function on each value of the array of new seeds. A cycle is detected if the same seed `s` is
 * sent a second time to function f (equivalence based on the `seedEquivalence` equivalence if
 * provided or on Equal.equals otherwise). In that case, `cycleSource` is a `some` of the `A`
 * generated the first time `s` was processed, hence giving the user a chance to modify it.
 * Otherwise, `cycleSource` is a `none`.
 *
 * @category Constructors
 */

export const unfold = <S, A, B>(
  f: (seed: S, cycleSource: Option.Option<A>) => Either.Either<MTypes.Pair<A, ReadonlyArray<S>>, B>,
  seedEquivalence: Equivalence.Equivalence<S> = Equal.equals,
): MTypes.OneArgFunction<S, Type<A, B>> => flow(_unfold(f, seedEquivalence), Array.headNonEmpty);

/**
 * Non recursive function that builds a (possibly infinite) tree from a seed value and an unfold
 * function (see unfold), then applies a function f to the value of each node and the result of
 * applying f to the children of the node (see fold below).A cycle is reported when a seed has a
 * value equal to itself (in terms of Equal.equals) as a direct parent. In that case, function `f`
 * receives as `cycleSource` argument a `some` of the value of the non-leaf that was created from
 * that seed.
 *
 * @category Constructors
 */

export const unfoldAndFold = <A, B, S = A, C = B>({
  unfold,
  foldNonLeaf,
  foldLeaf,
  seedEquivalence = Equal.equals,
}: {
  readonly unfold: (
    seed: S,
    cycleSource: Option.Option<A>,
  ) => Either.Either<MTypes.Pair<A, ReadonlyArray<S>>, B>;
  readonly foldNonLeaf: (value: A, children: ReadonlyArray<C>) => C;
  readonly foldLeaf: (value: B) => C;
  readonly seedEquivalence?: Equivalence.Equivalence<S>;
}): MTypes.OneArgFunction<S, C> =>
  flow(
    _unfold(unfold, seedEquivalence),
    Array.reverse,
    Array.map(
      flow(
        MMatch.make,
        MMatch.when(isLeaf, Struct.evolve({ value: foldLeaf })),
        MMatch.orElse(
          MStruct.mutableEnrichWith({
            value: (node) =>
              foldNonLeaf(
                node.value,
                Array.map(node.forest as unknown as Forest.Type<C, C>, value),
              ),
          }),
        ),
      ),
    ),
    Array.lastNonEmpty,
    Struct.get('value'),
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
  fLeaf,
}: {
  readonly fNonLeaf: (a: NoInfer<A>, bs: ReadonlyArray<C>, level: number) => C;
  readonly fLeaf: (a: NoInfer<B>, level: number) => C;
}): MTypes.OneArgFunction<Type<A, B>, C> => {
  const go = (level: number): MTypes.OneArgFunction<Type<A, B>, C> =>
    flow(
      MMatch.make,
      MMatch.when(isLeaf, (self) => fLeaf(self.value, level + 1)),
      MMatch.orElse((self) => fNonLeaf(self.value, Array.map(self.forest, go(level + 1)), level)),
    );

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
  fLeaf,
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
          forest: Array.map(nonLeaf.forest, go(nextS, level + 1)),
        });
      }),
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
  fLeaf,
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
    fLeaf,
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
            go(acc, level + 1)(node),
          ),
        ),
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
  fLeaf,
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
          forest: Array.map(nonLeaf.forest, go(level + 1)),
        }),
      ),
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
  fLeaf,
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
          value: fNonLeaf(nonLeaf, level),
        }),
      ),
    );

  return go(0);
};
