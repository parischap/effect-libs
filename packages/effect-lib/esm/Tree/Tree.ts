/**
 * Heterogeneous trees: each node is either a leaf carrying a value of type `B` or a non-leaf
 * carrying a value of type `A` and a forest of child trees.
 *
 * ## Mental model
 *
 * - **`Type<A, B>`** is a discriminated union of {@link "./TreeLeaf.js" | `MTreeLeaf.Type<B>`} and
 *   {@link "./TreeNonLeaf.js" | `MTreeNonLeaf.Type<A, B>`}.
 * - A "tree" with a single leaf is just a leaf — perfectly valid. When the API must guarantee a
 *   non-leaf root, take `MTreeNonLeaf.Type<A, B>` directly.
 * - {@link unfold} and {@link unfoldAndFold} build trees iteratively from a seed plus an `unfold`
 *   function returning either a leaf payload (`Result.fail`) or a non-leaf payload with child seeds
 *   (`Result.succeed`). Cycle detection is opt-in via a seed `Equivalence`.
 *
 * ## Common tasks
 *
 * - **Discriminate**: {@link isLeaf}, {@link isNonLeaf}
 * - **Build**: {@link unfold}, {@link unfoldAndFold}
 * - **Read values**: {@link value}
 * - **Compare**: {@link makeEquivalence}
 * - **Fold**: {@link fold}, {@link reduce}, {@link reduceRight}, {@link unfoldAndFold}
 * - **Map / extend**: {@link map}, {@link mapAccum}, {@link extendDown}, {@link extendUp}
 *
 * ## Quickstart
 *
 * **Example** (Build a tree from a seed and sum its leaves)
 *
 * ```ts
 * import { Result, pipe } from 'effect';
 * import * as MTree from '@parischap/effect-lib/Tree/Tree';
 *
 * const buildAndSum = pipe(
 *   3,
 *   MTree.unfoldAndFold({
 *     unfold: (n: number) =>
 *       n <= 0 ? Result.fail(0) : Result.succeed(['node' as const, [n - 1, n - 1]] as const),
 *     foldNonLeaf: (_value, children) => children.reduce((a, b) => a + b, 1),
 *     foldLeaf: (n) => n,
 *   }),
 * );
 * console.log(buildAndSum); // count of non-leaf nodes
 * ```
 */

import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import type * as Equivalence from 'effect/Equivalence';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Result from 'effect/Result';
import * as Struct from 'effect/Struct';
import * as Tuple from 'effect/Tuple';

import type * as MTypes from '../types/types.js';
import type * as MTreeForest from './TreeForest.js';

import * as MArray from '../Array.js';
import * as MMatch from '../Match.js';
import * as MPredicate from '../Predicate.js';
import * as MStruct from '../Struct.js';
import * as MTuple from '../Tuple.js';
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
 * Tests whether `u` is a leaf node.
 *
 * - Acts as a type guard narrowing the input to `MTreeLeaf.Type<B>`.
 *
 * @category Guards
 */
export const isLeaf = <A, B>(u: Type<A, B>): u is MTreeLeaf.Type<B> => u instanceof MTreeLeaf.Type;

/**
 * Tests whether `u` is a non-leaf node.
 *
 * - Acts as a type guard narrowing the input to `MTreeNonLeaf.Type<A, B>`.
 *
 * @category Guards
 */
export const isNonLeaf = <A, B>(u: Type<A, B>): u is MTreeNonLeaf.Type<A, B> =>
  u instanceof MTreeNonLeaf.Type;

/**
 * Returns an equivalence on `Type<A, B>` derived from an equivalence on `A` (non-leaf values) and
 * one on `B` (leaf values).
 *
 * - Two trees are equivalent iff they have the same shape and corresponding values match under the
 *   supplied equivalences.
 *
 * **Example**
 *
 * ```ts
 * import { Equivalence } from 'effect';
 * import * as MTree from '@parischap/effect-lib/Tree/Tree';
 * import * as MTreeLeaf from '@parischap/effect-lib/Tree/TreeLeaf';
 * import * as MTreeNonLeaf from '@parischap/effect-lib/Tree/TreeNonLeaf';
 *
 * const eq = MTree.makeEquivalence(Equivalence.string, Equivalence.number);
 * const tree1 = MTreeNonLeaf.make({
 *   value: 'root',
 *   forest: [MTreeLeaf.make(1), MTreeLeaf.make(2)],
 * });
 * const tree2 = MTreeNonLeaf.make({
 *   value: 'root',
 *   forest: [MTreeLeaf.make(1), MTreeLeaf.make(2)],
 * });
 * console.log(eq(tree1, tree2)); // true
 * ```
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
 * Returns the `value` field of `self`. Result type is `A | B` because `self` may be a leaf
 * (carrying `B`) or a non-leaf (carrying `A`).
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
                Option.liftPredicate(MPredicate.isOverOne),
              ),
            ),
          ),
        ),
      ),
      Array.flatten,
    );
  };

/**
 * Builds a tree by repeatedly applying an unfold function to seeds.
 *
 * - Non-recursive; uses a queue to process all nodes.
 * - The unfold function returns either a leaf value (Failure) or a non-leaf value with child seeds
 *   (Success).
 * - Optionally detects cycles using an equivalence on seeds.
 * - When a cycle is detected, `cycleSource` is passed as `some` to allow modification.
 *
 * **Example** (Build tree from seed)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as Result from 'effect/Result';
 * import * as MTree from '@parischap/effect-lib/Tree/Tree';
 *
 * const tree = MTree.unfold<number, string, number>((n) =>
 *   n === 0 ? Result.fail('leaf') : Result.succeed(['node', [n - 1]]),
 * )(3);
 * ```
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
 * Builds a tree and simultaneously folds it in bottom-up order.
 *
 * - Combines tree construction and folding for efficiency.
 * - Leaf nodes are folded using `foldLeaf`; non-leaf nodes using `foldNonLeaf` with accumulated
 *   children.
 * - Returns the final folded value (bottom-up aggregation).
 * - Optionally detects cycles using seed equivalence.
 *
 * **Example** (Build and fold tree)
 *
 * ```ts
 * import * as Result from 'effect/Result';
 * import * as MTree from '@parischap/effect-lib/Tree/Tree';
 *
 * const result = MTree.unfoldAndFold({
 *   unfold: (n) => (n === 0 ? Result.fail(1) : Result.succeed(['parent', [n - 1]])),
 *   foldLeaf: (val) => val,
 *   foldNonLeaf: (val, children) => val.length + children[0],
 * })(2);
 * ```
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
 * Folds a tree into a summary value in bottom-up order.
 *
 * - Processes leaves first, then combines results upward.
 * - Use to aggregate or transform tree data recursively.
 * - `foldLeaf` handles terminal nodes; `foldNonLeaf` combines parent values with folded children.
 * - Each function receives a `level` parameter for depth-aware logic.
 *
 * **Example** (Fold tree to sum)
 *
 * ```ts
 * import * as MTree from '@parischap/effect-lib/Tree/Tree';
 * import * as MTreeLeaf from '@parischap/effect-lib/Tree/TreeLeaf';
 * import * as MTreeNonLeaf from '@parischap/effect-lib/Tree/TreeNonLeaf';
 *
 * const tree = MTreeNonLeaf.make({
 *   value: 10,
 *   forest: [MTreeLeaf.make(5), MTreeLeaf.make(3)],
 * });
 * const sum = MTree.fold({
 *   foldLeaf: (n) => n,
 *   foldNonLeaf: (n, children) => n + children.reduce((a, b) => a + b, 0),
 * })(tree);
 * console.log(sum); // 18
 * ```
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
 * Maps a tree with an accumulator in a top-down pass.
 *
 * - Use to transform both structure and values while threading state through the tree.
 * - Leaf and non-leaf nodes processed separately with separate folding functions.
 * - Level parameter indicates depth (0 at root).
 * - Accumulator is passed down through the tree traversal.
 *
 * **Example** (Map with accumulator)
 *
 * ```ts
 * import * as MTree from '@parischap/effect-lib/Tree/Tree';
 * import * as MTreeLeaf from '@parischap/effect-lib/Tree/TreeLeaf';
 * import * as MTreeNonLeaf from '@parischap/effect-lib/Tree/TreeNonLeaf';
 *
 * const tree = MTreeNonLeaf.make({
 *   value: 'root',
 *   forest: [MTreeLeaf.make(1), MTreeLeaf.make(2)],
 * });
 * const result = MTree.mapAccum({
 *   accum: 0,
 *   fNonLeaf: (s, val) => [s + 1, val.toUpperCase()],
 *   fLeaf: (s, val) => val * 10,
 * })(tree);
 * ```
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
 * Maps a tree, transforming both leaf and non-leaf values.
 *
 * - Use to apply transformations to all node values.
 * - Non-leaf values transformed via `fNonLeaf`; leaf values via `fLeaf`.
 * - Both functions receive the node's level (0 at root) for depth-aware logic.
 * - Returns a new tree with transformed values (structure unchanged).
 *
 * **Example** (Map tree values)
 *
 * ```ts
 * import * as MTree from '@parischap/effect-lib/Tree/Tree';
 * import * as MTreeLeaf from '@parischap/effect-lib/Tree/TreeLeaf';
 * import * as MTreeNonLeaf from '@parischap/effect-lib/Tree/TreeNonLeaf';
 *
 * const tree = MTreeNonLeaf.make({
 *   value: 'node',
 *   forest: [MTreeLeaf.make(5), MTreeLeaf.make(3)],
 * });
 * const mapped = MTree.map({
 *   fNonLeaf: (val) => val.toUpperCase(),
 *   fLeaf: (num) => num * 2,
 * })(tree);
 * ```
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
 * Reduces a tree to a summary value, processing children left to right.
 *
 * - Top-down traversal accumulating a result value.
 * - Functions applied in order: non-leaf first, then each child in left-to-right order.
 * - Each function receives the accumulator, node value, and depth level.
 * - Use for aggregating properties or collecting information from the tree.
 *
 * **Example** (Reduce tree)
 *
 * ```ts
 * import * as MTree from '@parischap/effect-lib/Tree/Tree';
 * import * as MTreeLeaf from '@parischap/effect-lib/Tree/TreeLeaf';
 * import * as MTreeNonLeaf from '@parischap/effect-lib/Tree/TreeNonLeaf';
 *
 * const tree = MTreeNonLeaf.make({
 *   value: 1,
 *   forest: [MTreeLeaf.make(2), MTreeLeaf.make(3)],
 * });
 * const sum = MTree.reduce({
 *   z: 0,
 *   fNonLeaf: (acc, val) => acc + val,
 *   fLeaf: (acc, val) => acc + val,
 * })(tree);
 * console.log(sum); // 6
 * ```
 *
 * @category Utils
 */
export const reduce = internalReduce(Array.reduce);

/**
 * Reduces a tree to a summary value, processing children right to left.
 *
 * - Top-down traversal accumulating a result value.
 * - Functions applied in order: non-leaf first, then each child in right-to-left order.
 * - Each function receives the accumulator, node value, and depth level.
 * - Similar to {@link reduce} but with reversed child processing order.
 *
 * **Example** (Reduce tree right-to-left)
 *
 * ```ts
 * import * as MTree from '@parischap/effect-lib/Tree/Tree';
 * import * as MTreeLeaf from '@parischap/effect-lib/Tree/TreeLeaf';
 * import * as MTreeNonLeaf from '@parischap/effect-lib/Tree/TreeNonLeaf';
 *
 * const tree = MTreeNonLeaf.make({
 *   value: 'A',
 *   forest: [MTreeLeaf.make('B'), MTreeLeaf.make('C')],
 * });
 * const result = MTree.reduceRight({
 *   z: '',
 *   fNonLeaf: (acc, val) => acc + val,
 *   fLeaf: (acc, val) => acc + val,
 * })(tree);
 * console.log(result); // "ACB"
 * ```
 *
 * @category Utils
 */
export const reduceRight = internalReduce(Array.reduceRight);

/**
 * Extends a tree in top-down order, transforming each node to a new value.
 *
 * - More powerful than {@link map}—receives the entire node (not just its value).
 * - Processes tree top-down: root first, then children level-by-level.
 * - Functions receive the node itself and its level for context-aware transformation.
 * - Use when transformation depends on position in tree or sibling relationships.
 *
 * **Example** (Extend down: tag by level)
 *
 * ```ts
 * import * as MTree from '@parischap/effect-lib/Tree/Tree';
 * import * as MTreeLeaf from '@parischap/effect-lib/Tree/TreeLeaf';
 * import * as MTreeNonLeaf from '@parischap/effect-lib/Tree/TreeNonLeaf';
 *
 * const tree = MTreeNonLeaf.make({
 *   value: 'root',
 *   forest: [MTreeLeaf.make('leaf')],
 * });
 * const extended = MTree.extendDown({
 *   fNonLeaf: (node, level) => `${node.value}@${level}`,
 *   fLeaf: (leaf, level) => `${leaf.value}@${level}`,
 * })(tree);
 * ```
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
 * Extends a tree in bottom-up order, transforming each node to a new value.
 *
 * - More powerful than {@link map}—receives the entire node (not just its value).
 * - Processes tree bottom-up: leaves first, then non-leaves up to root.
 * - Children are processed before their parent.
 * - Functions receive the node itself and its level for context-aware transformation.
 * - Use when transformation depends on processing children first.
 *
 * **Example** (Extend up: aggregate child count)
 *
 * ```ts
 * import * as MTree from '@parischap/effect-lib/Tree/Tree';
 * import * as MTreeLeaf from '@parischap/effect-lib/Tree/TreeLeaf';
 * import * as MTreeNonLeaf from '@parischap/effect-lib/Tree/TreeNonLeaf';
 *
 * const tree = MTreeNonLeaf.make({
 *   value: 'root',
 *   forest: [MTreeLeaf.make('a'), MTreeLeaf.make('b')],
 * });
 * const extended = MTree.extendUp({
 *   fNonLeaf: (node, level) => node.forest.length,
 *   fLeaf: (leaf, level) => 0,
 * })(tree);
 * ```
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
