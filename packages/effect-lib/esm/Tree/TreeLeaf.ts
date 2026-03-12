/** Module that implements a TreeLeaf (see TreeAll for more details) */

import * as MTypes from '../Types/types.js';
import * as MTreeNode from './TreeNode.js';

export const moduleTag = '@parischap/effect-lib/Tree/TreeLeaf/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;
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
