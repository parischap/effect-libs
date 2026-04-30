import type * as MTypes from '../types/types.js';

import * as MData from '../Data/Data.js';

export const moduleTag = '@parischap/effect-lib/internal/CacheValueContainer/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Interface that represents a ValueContainer
 *
 * @category Models
 */
export class Type<out B> extends MData.Class {
  /** The value calculated by the LookUp function */
  readonly value: B;
  /** The time at which the value was calculated */
  readonly storeDate: number;
  /** Class constructor */

  private constructor(params: MTypes.Data<Type<B>>) {
    super();
    this.value = params.value;
    this.storeDate = params.storeDate;
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
export const make = <B>(params: MTypes.Data<Type<B>>): Type<B> => Type.make(params);
