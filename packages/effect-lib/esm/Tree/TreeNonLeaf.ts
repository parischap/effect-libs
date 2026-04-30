/**
 * Module that implements a non-leaf node of a tree. A `TreeNonLeaf<A, B>` holds a value of type `A`
 * and a forest (array of child trees). See the `Tree` module for the full API.
 */

import type * as MTypes from '../types/types.js';
import type * as MTreeForest from './TreeForest.js';

import * as MData from '../Data/Data.js';
import * as MTreeNode from './TreeNode.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Tree/TreeNonLeaf/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type of a TreeNonLeaf. An internal node holding a `value` of type `A` and a `forest` of children.
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
 * Constructor
 *
 * @category Constructors
 */
export const make = <A, B>(params: MTypes.Data<Type<A, B>>): Type<A, B> => Type.make(params);
