/** Module that implements a TreeNonLeaf (see TreeAll for more details) */

import * as MDataBase from '../Data/Base.js';
import * as MTypes from '../types.js';
import type * as MTreeForest from './Forest.js';
import * as MTreeNode from './Node.js';

export const moduleTag = '@parischap/effect-lib/Tree/NonLeaf/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Typeof a NonLeaf
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
  [MDataBase.idSymbol](): string | (() => string) {
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
export const make = <A, B>(params: MTypes.Data<Type<A, B>>): Type<A, B> => Type.make(params);
