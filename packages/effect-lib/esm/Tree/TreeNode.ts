/** Module that implements a TreeNode (see TreeAll for more details) */

import { Struct } from 'effect';
import * as MData from '../Data/index.js';
import * as MTypes from '../types.js';

export const moduleTag = '@parischap/effect-lib/Tree/TreeNode/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Typeof a Leaf node
 *
 * @category Models
 */
export abstract class Type<out A> extends MData.Class {
  /** Value of a node */
  readonly value: A;

  /** Class constructor */
  protected constructor({ value }: MTypes.Data<Type<A>>) {
    super();
    this.value = value;
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Returns the `value` property of `self`
 *
 * @category Destructors
 */
export const value: <A>(self: Type<A>) => A = Struct.get('value');
