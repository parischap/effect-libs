/**
 * Leaf node of a tree: a value of type `B` with no children. Companion of
 * {@link "./TreeNonLeaf.js" | `MTreeNonLeaf`}; both are unioned into
 * {@link "./Tree.js" | `MTree.Type`}.
 *
 * ## Quickstart
 *
 * **Example** (Create a leaf)
 *
 * ```ts
 * import * as MTreeLeaf from '@parischap/effect-lib/Tree/TreeLeaf';
 *
 * const leaf = MTreeLeaf.make(42);
 * console.log(leaf.value); // 42
 * ```
 */

import type * as MTypes from '../types/types.js';

import * as MData from '../Data/Data.js';
import * as MTreeNode from './TreeNode.js';

/**
 * Module tag.
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Tree/TreeLeaf/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;
/**
 * Leaf node holding a `value` of type `B`. Has no children.
 *
 * @category Models
 */
export class Type<out B> extends MTreeNode.Type<B> {
  /** Class constructor */
  private constructor({ value }: MTypes.Data<Type<B>>) {
    super({ value });
  }

  /** Static constructor */
  static make<B>(params: MTypes.Data<Type<B>>): Type<B> {
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
 * Builds a leaf node carrying `value`.
 *
 * **Example**
 *
 * ```ts
 * import * as MTreeLeaf from '@parischap/effect-lib/Tree/TreeLeaf';
 *
 * console.log(MTreeLeaf.make(42).value); // 42
 * ```
 *
 * @category Constructors
 */
export const make = <B>(value: B): Type<B> => Type.make({ value });
