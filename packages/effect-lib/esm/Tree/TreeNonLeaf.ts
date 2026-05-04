/**
 * Internal (branching) node of a tree: a value of type `A` paired with a `forest` of child trees.
 * Companion of {@link "./TreeLeaf.js" | `MTreeLeaf`}; both are unioned into
 * {@link "./Tree.js" | `MTree.Type`}.
 *
 * ## Quickstart
 *
 * **Example** (Build a branch with two leaves)
 *
 * ```ts
 * import * as MTreeLeaf from '@parischap/effect-lib/Tree/TreeLeaf';
 * import * as MTreeNonLeaf from '@parischap/effect-lib/Tree/TreeNonLeaf';
 *
 * const branch = MTreeNonLeaf.make({
 *   value: 'root',
 *   forest: [MTreeLeaf.make('a'), MTreeLeaf.make('b')],
 * });
 * console.log(branch.value); // 'root'
 * console.log(branch.forest.length); // 2
 * ```
 */

import type * as MTypes from '../types/types.js';
import type * as MTreeForest from './TreeForest.js';

import * as MData from '../Data/Data.js';
import * as MTreeNode from './TreeNode.js';

/**
 * Module tag.
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Tree/TreeNonLeaf/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Internal node holding a `value` of type `A` and a `forest` of children of type
 * `MTreeForest.Type<A, B>`.
 *
 * @category Models
 */
export class Type<out A, out B> extends MTreeNode.Type<A> {
  /** The children of a NonLeaf */
  readonly forest: MTreeForest.Type<A, B>;

  /** Class constructor */
  private constructor({ value, forest }: MTypes.Data<Type<A, B>>) {
    super({ value });
    this.forest = forest;
  }

  /** Static constructor */
  static make<A, B>(params: MTypes.Data<Type<A, B>>): Type<A, B> {
    return new Type(params);
  }

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return moduleTag;
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Builds a non-leaf node from `value` and `forest`.
 *
 * @category Constructors
 */
export const make = <A, B>(params: MTypes.Data<Type<A, B>>): Type<A, B> => Type.make(params);
