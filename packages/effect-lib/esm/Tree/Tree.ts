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

import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import type * as Equivalence from 'effect/Equivalence';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Result from 'effect/Result';
import * as Struct from 'effect/Struct';
import * as Tuple from 'effect/Tuple';

import type * as MTreeForest from './TreeForest.js';

import * as MArray from '../Array.js';
import * as MMatch from '../Match.js';
import * as MStruct from '../Struct.js';
import * as MTuple from '../Tuple.js';
import * as MTypes from '../types/types.js';
import * as MTreeLeaf from './TreeLeaf.js';
import * as MTreeNode from './TreeNode.js';
import * as MTreeNonLeaf from './TreeNonLeaf.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Tree/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

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
export const makeEquivalence = <A, B>(
  aEquivalence: Equivalence.Equivalence<A>,
  bEquivalence: Equivalence.Equivalence<B>,
): Equivalence.Equivalence<Type<A, B>> => {
  const forestEq = Array.makeEquivalence(makeEquivalence(aEquivalence, bEquivalence));
  return (self, that) =>
    isLeaf(self) && isLeaf(that)
      ? bEquivalence(self.value, that.value)
      : isNonLeaf(self) && isNonLeaf(that)
        ? aEquivalence(self.value, that.value) && forestEq(self.forest, that.forest)
        : false;
};

/**
 * Returns the `value` property of `self`
 *
 * @category Getters
 */
export const value: <A, B>(self: Type<A, B>) => A | B = Struct.get('value');

/**
 * Non recursive function that generates an array of nodes from a seed value and an unfold function.
 * The unfold function takes a seed and returns either a failure of a value of type B from which a
 * leaf is created or a success of a value of type A and an array of new seeds (possibly empty). A
 * non leaf is created from this value of type A and from the result of calling the unfold function
 * on each value of the array of new seeds. Cycle detection is enabled by passing a
 * `seedEquivalence`. When enabled, a cycle is detected if the same seed `s` is sent a second time
 * to `f` (compared using `seedEquivalence`). In that case, `cycleSource` is a `some` of the `A`
 * generated the first time `s` was processed, giving the user a chance to modify it. Otherwise,
 * `cycleSource` is a `none`. When `seedEquivalence` is omitted, no cycle detection is performed.
 * The resulting array of nodes is ordered from the top of the tree and from left to right.
 */
const internalUnfold =
  <S, A, B>(
    f: (
      seed: S,
      cycleSource: Option.Option<A>,
    ) => Result.Result<MTypes.Pair<A, ReadonlyArray<S>>, B>,
    seedEquivalence?: Equivalence.Equivalence<S>,
  ) =>
  (seed: S): MTypes.OverOne<Type<A, B>> => {
    type Parent = [parent: S, parentValue: MTreeNonLeaf.Type<A, B>];
    type SeedAndParents = [seed: S, parents: Array<Parent>];

    return pipe(
      Array.of(Tuple.make(seed, Array.empty<Parent>())),
      MArray.unfoldNonEmpty<MTypes.OverOne<SeedAndParents>, MTypes.OverOne<Type<A, B>>>(
        flow(
          Array.map(([currentSeed, parents]) => {
            // Get the node that was created from the seed that generated currentSeed
            const containingNonLeafOption = pipe(parents, Array.last, Option.map(Tuple.get(1)));
            const [nextNode, nextSeedAndParents]: [Type<A, B>, Array<SeedAndParents>] = pipe(
              f(
                currentSeed,
                seedEquivalence === undefined
                  ? Option.none<A>()
                  : pipe(
                      parents,
                      Array.findFirst(([parentSeed]) => seedEquivalence(parentSeed, currentSeed)),
                      Option.map(flow(Tuple.get(1), MTreeNode.value)),
                    ),
              ),
              Result.mapBoth({
                onFailure: flow(
                  MTreeLeaf.make,
                  Tuple.make,
                  Tuple.appendElement(Array.empty<SeedAndParents>()),
                ),
                onSuccess: ([value, nextSeeds]) => {
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
              Result.merge,
            );

            if (Option.isSome(containingNonLeafOption))
              (containingNonLeafOption.value.forest as Array<Type<A, B>>).push(nextNode);

            return Tuple.make(nextNode, nextSeedAndParents);
          }),
          Array.unzip,
          Tuple.evolve(
            Tuple.make(
              Function.identity,
              flow(
                Array.flatten<MTypes.OverOne<ReadonlyArray<SeedAndParents>>>,
                Option.liftPredicate(MTypes.isOverOne),
              ),
            ),
          ),
        ),
      ),
      Array.flatten,
    );
  };

/**
 * Non recursive function that builds a (possibly infinite) tree from a seed value and an unfold
 * function. The unfold function takes a seed and returns either a failure of a value of type B from
 * which a leaf is created or a success of a value of type A and an array of new seeds (possibly
 * empty). A non leaf is created from this value of type A and from the result of calling the unfold
 * function on each value of the array of new seeds. Cycle detection is enabled by passing a
 * `seedEquivalence`. When enabled, a cycle is detected if the same seed `s` is sent a second time
 * to `f` (compared using `seedEquivalence`). In that case, `cycleSource` is a `some` of the `A`
 * generated the first time `s` was processed, giving the user a chance to modify it. Otherwise,
 * `cycleSource` is a `none`. When `seedEquivalence` is omitted, no cycle detection is performed and
 * `f` does not receive a `cycleSource` parameter.
 *
 * @category Constructors
 */

export const unfold: {
  <S, A, B>(
    f: (seed: S) => Result.Result<MTypes.Pair<A, ReadonlyArray<S>>, B>,
  ): MTypes.OneArgFunction<S, Type<A, B>>;
  <S, A, B>(
    f: (
      seed: S,
      cycleSource: Option.Option<NoInfer<A>>,
    ) => Result.Result<MTypes.Pair<A, ReadonlyArray<S>>, B>,
    seedEquivalence: Equivalence.Equivalence<S>,
  ): MTypes.OneArgFunction<S, Type<A, B>>;
} = <S, A, B>(
  f: (seed: S, cycleSource: Option.Option<A>) => Result.Result<MTypes.Pair<A, ReadonlyArray<S>>, B>,
  seedEquivalence?: Equivalence.Equivalence<S>,
): MTypes.OneArgFunction<S, Type<A, B>> =>
  flow(internalUnfold(f, seedEquivalence), Array.headNonEmpty);

/**
 * Non recursive function that builds a (possibly infinite) tree from a seed value and an unfold
 * function (see unfold), then applies a function `foldNonLeaf` to the value of each non-leaf node
 * and the result of recursively folding its children, and `foldLeaf` to each leaf value (see `fold`
 * below). Cycle detection is enabled by passing a `seedEquivalence`. When enabled, a cycle is
 * detected if the same seed `s` is sent a second time to `unfold` (compared using
 * `seedEquivalence`). In that case, `cycleSource` is a `some` of the value of the non-leaf that was
 * created from that seed, giving the user a chance to modify it. Otherwise, `cycleSource` is a
 * `none`. When `seedEquivalence` is omitted, no cycle detection is performed and `unfold` does not
 * receive a `cycleSource` parameter.
 *
 * @category Constructors
 */

export const unfoldAndFold: {
  <A, B, S = A, C = B>(opts: {
    readonly unfold: (
      seed: S,
      cycleSource: Option.Option<NoInfer<A>>,
    ) => Result.Result<MTypes.Pair<A, ReadonlyArray<S>>, B>;
    readonly foldNonLeaf: (value: A, children: ReadonlyArray<C>) => C;
    readonly foldLeaf: (value: B) => C;
    readonly seedEquivalence: Equivalence.Equivalence<S>;
  }): MTypes.OneArgFunction<S, C>;
  <A, B, S = A, C = B>(opts: {
    readonly unfold: (seed: S) => Result.Result<MTypes.Pair<A, ReadonlyArray<S>>, B>;
    readonly foldNonLeaf: (value: A, children: ReadonlyArray<C>) => C;
    readonly foldLeaf: (value: B) => C;
  }): MTypes.OneArgFunction<S, C>;
} = <A, B, S = A, C = B>({
  unfold,
  foldNonLeaf,
  foldLeaf,
  seedEquivalence,
}: {
  readonly unfold: (
    seed: S,
    cycleSource: Option.Option<A>,
  ) => Result.Result<MTypes.Pair<A, ReadonlyArray<S>>, B>;
  readonly foldNonLeaf: (value: A, children: ReadonlyArray<C>) => C;
  readonly foldLeaf: (value: B) => C;
  readonly seedEquivalence?: Equivalence.Equivalence<S>;
}): MTypes.OneArgFunction<S, C> =>
  flow(
    internalUnfold(unfold, seedEquivalence),
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

const internalReduce =
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
 * Top-down reduction -Children are processed from left to right
 *
 * @category Utils
 */
export const reduce = internalReduce(Array.reduce);

/**
 * Top-down reduction -Children are processed from right to left
 *
 * @category Utils
 */
export const reduceRight = internalReduce(Array.reduceRight);

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
