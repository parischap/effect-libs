/** Module that implements the abstract base class for all tree nodes. A `TreeNode` holds a `value` and is extended by `TreeLeaf` and `TreeNonLeaf`. See the `Tree` module for the full API. */

import * as Struct from 'effect/Struct';

import * as MData from '../Data/Data.js';
import * as MTypes from '../Types/types.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/Tree/TreeNode/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type of a TreeNode. Abstract base class holding a `value` of type `A`.
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
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Returns the `value` property of `self`
 *
 * @category Getters
 */
export const value: <A>(self: Type<A>) => A = Struct.get('value');
