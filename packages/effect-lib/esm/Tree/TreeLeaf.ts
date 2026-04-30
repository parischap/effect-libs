/**
 * Module that implements a leaf node of a tree. A `TreeLeaf<B>` holds a value of type `B` and has
 * no children. See the `Tree` module for the full API.
 */

import type * as MTypes from '../types/types.js';

import * as MData from '../Data/Data.js';
import * as MTreeNode from './TreeNode.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Tree/TreeLeaf/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;
/**
 * Type of a TreeLeaf. A leaf node holding a `value` of type `B` with no children.
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
 * Constructor
 *
 * @category Constructors
 */
export const make = <B>(value: B): Type<B> => Type.make({ value });
