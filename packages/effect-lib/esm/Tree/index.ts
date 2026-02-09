/**
 * Module that implements a Tree<A,B> where the value of a non-leaf node is of type A and the value
 * of a leaf node is of type B. A non-leaf node also contains a forest, i.e. an array of trees.
 *
 * A Tree may have no leaf nodes.
 *
 * A Tree may be composed of a single leaf node. If this situation does not correspond to your need,
 * you may work with the type TreeNonLeaf<A,B> instead. In all the provided functions, `self` can be
 * a Tree<A,B> or a TreeNonLeaf<A,B>
 */

import { Array, Either, Equal, Equivalence, flow, Option, pipe, Struct, Tuple } from 'effect';
import * as MArray from '../Array.js';
import * as MMatch from '../Match.js';
import * as MStruct from '../Struct.js';
import * as MTuple from '../Tuple.js';
import * as MTypes from '../types/index.js';
import type * as MTreeForest from './TreeForest.js';
import * as MTreeLeaf from './TreeLeaf.js';
import * as MTreeNode from './TreeNode.js';
import * as MTreeNonLeaf from './TreeNonLeaf.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Tree/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of a Tree
 *
 * @category Models
 */
export type Type<A, B> = MTreeLeaf.Type<B> | MTreeNonLeaf.Type<A, B>;

/**
 * Type guard
 *
 * @category Guards
 */
export const isLeaf = <A, B>(u: Type<A, B>): u is MTreeLeaf.Type<B> => u instanceof MTreeLeaf.Type;

/**
 * Type guard
 *
 * @category Guards
 */
export const isNonLeaf = <A, B>(u: Type<A, B>): u is MTreeNonLeaf.Type<A, B> =>
  u instanceof MTreeNonLeaf.Type;

/**
 * Returns an equivalence based on an equivalence of the subtypes
 *
 * @category Equivalences
 */
export const getEquivalence = <A, B>(
  aEquivalence: Equivalence.Equivalence<A>,
  bEquivalence: Equivalence.Equivalence<B>,
): Equivalence.Equivalence<Type<A, B>> => {
  const forestEq = Array.getEquivalence(getEquivalence(aEquivalence, bEquivalence));
  return (self, that) =>
    isLeaf(self) && isLeaf(that) ? bEquivalence(self.value, that.value)
    : isNonLeaf(self) && isNonLeaf(that) ?
      aEquivalence(self.value, that.value) && forestEq(self.forest, that.forest)
    : false;
};

/**
 * Returns the `value` property of `self`
 *
 * @category Destructors
 */
export const value: <A, B>(self: Type<A, B>) => A | B = Struct.get('value');

/**
 * Non recursive function that generates an array of nodes from a seed value and an unfold function.
 * The unfold function takes a seed and returns either a left of a value of type B from which a leaf
 * is created or a right of a value of type A and an array of new seeds (possibly empty). A non leaf
 * is created from this value of type A and from the result of calling the unfold function on each
 * value of the array of new seeds. A cycle is detected if the same seed `s` is sent a second time
 * to function f (equivalence based on the `seedEquivalence` equivalence if provided or on
 * Equal.equals otherwise). In that case, `cycleSource` is a `some` of the `A` generated the first
 * time `s` was processed, hence giving the user a chance to modify it. Otherwise, `cycleSource` is
 * a `none`. The resulting array of nodes is ordered from the top of the tree and from left to
 * right.
 */
const _unfold =
  <S, A, B>(
    f: (
      seed: S,
      cycleSource: Option.Option<A>,
    ) => Either.Either<MTypes.Pair<A, ReadonlyArray<S>>, B>,
    seedEquivalence: Equivalence.Equivalence<S>,
  ) =>
  (seed: S): MTypes.OverOne<Type<A, B>> => {
    type Parent = [parent: S, parentValue: MTreeNonLeaf.Type<A, B>];
    type SeedAndParents = [seed: S, parents: Array<Parent>];
    const dontHandleCycles = MTypes.isOneArgFunction(f);

    return pipe(
      Array.of(Tuple.make(seed, Array.empty<Parent>())),
      MArray.unfoldNonEmpty<MTypes.OverOne<SeedAndParents>, MTypes.OverOne<Type<A, B>>>(
        flow(
          Array.map(([currentSeed, parents]) => {
            // Get the node that was created from the seed that generated currentSeed
            const containingNonLeafOption = pipe(parents, Array.last, Option.map(Tuple.getSecond));
            const [nextNode, nextSeedAndParents]: [Type<A, B>, Array<SeedAndParents>] = pipe(
              f(
                currentSeed,
                dontHandleCycles ?
                  Option.none<A>()
                : pipe(
                    parents,
                    Array.findFirst(([parentSeed]) => seedEquivalence(parentSeed, currentSeed)),
                    Option.map(flow(Tuple.getSecond, MTreeNode.value)),
                  ),
              ),
              Either.mapBoth({
                onLeft: flow(
                  MTreeLeaf.make,
                  Tuple.make,
                  Tuple.appendElement(Array.empty<SeedAndParents>()),
                ),
                onRight: ([value, nextSeeds]) => {
                  const nonLeaf = MTreeNonLeaf.make({ value, forest: Array.empty<Type<A, B>>() });
                  const nextParents = Array.append(
                    parents,
                    Tuple.make<Parent>(currentSeed, nonLeaf),
                  );
                  return Tuple.make(
                    nonLeaf,
                    Array.map(nextSeeds, (seed) => Tuple.make<SeedAndParents>(seed, nextParents)),
                  );
                },
              }),
              Either.merge,
            );

            if (Option.isSome(containingNonLeafOption))
              (containingNonLeafOption.value.forest as Array<Type<A, B>>).push(nextNode);

            return Tuple.make(nextNode, nextSeedAndParents);
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
        MMatch.when(
          isLeaf,
          MStruct.mutableEnrichWith({
            value: (node) => foldLeaf(node.value),
          }),
        ),
        MMatch.orElse(
          MStruct.mutableEnrichWith({
            value: (node) =>
              foldNonLeaf(
                node.value,
                Array.map(node.forest as unknown as MTreeForest.Type<C, C>, value),
              ),
            // Allow garbage collection
            forest: () => Array.empty(),
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
  foldNonLeaf: fNonLeaf,
  foldLeaf: fLeaf,
}: {
  readonly foldNonLeaf: (a: NoInfer<A>, bs: ReadonlyArray<C>, level: number) => C;
  readonly foldLeaf: (a: NoInfer<B>, level: number) => C;
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
      MMatch.when(isLeaf, (leaf) => MTreeLeaf.make(fLeaf(s, leaf.value, level))),
      MMatch.orElse((nonLeaf) => {
        const [nextS, value] = fNonLeaf(s, nonLeaf.value, level);
        return MTreeNonLeaf.make({
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
  readonly fLeaf: (leaf: MTreeLeaf.Type<NoInfer<B>>, level: number) => D;
}): MTypes.OneArgFunction<Type<A, B>, Type<C, D>> => {
  const go = (level: number): MTypes.OneArgFunction<Type<A, B>, Type<C, D>> =>
    flow(
      MMatch.make,
      MMatch.when(isLeaf, (leaf) => MTreeLeaf.make(fLeaf(leaf, level))),
      MMatch.orElse((nonLeaf) =>
        MTreeNonLeaf.make({
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
  readonly fLeaf: (leaf: MTreeLeaf.Type<NoInfer<B>>, level: number) => D;
}): MTypes.OneArgFunction<Type<A, B>, Type<C, D>> => {
  const go = (level: number): MTypes.OneArgFunction<Type<A, B>, Type<C, D>> =>
    flow(
      MMatch.make,
      MMatch.when(isLeaf, (leaf) => MTreeLeaf.make(fLeaf(leaf, level))),
      MMatch.orElse((nonLeaf) =>
        MTreeNonLeaf.make({
          forest: Array.map(nonLeaf.forest, go(level + 1)),
          value: fNonLeaf(nonLeaf, level),
        }),
      ),
    );

  return go(0);
};
