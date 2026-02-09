/** Module that implements a TreeLeaf (see TreeAll for more details) */

import * as MData from '../Data/index.js';
import * as MTypes from '../types/index.js';
import * as MTreeNode from './TreeNode.js';

export const moduleTag = '@parischap/effect-lib/Tree/TreeLeaf/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;
/**
 * Typeof a Leaf node
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
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = <B>(value: B): Type<B> => Type.make({ value });
