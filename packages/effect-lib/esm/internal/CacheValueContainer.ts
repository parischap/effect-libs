import * as MDataBase from '../Data/Base.js';
import * as MTypes from '../types.js';

export const moduleTag = '@parischap/effect-lib/internal/CacheValueContainer/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Interface that represents a ValueContainer
 *
 * @category Models
 */
export class Type<out B> extends MDataBase.Class {
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
export const make = <B>(params: MTypes.Data<Type<B>>): Type<B> => Type.make(params);
