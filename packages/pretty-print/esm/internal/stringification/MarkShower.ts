/** This module implements a PPMarkShower */
import * as MData from '@parischap/effect-lib/MData'
import * as MTypes from '@parischap/effect-lib/MTypes'

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/internal/stringification/MarkShower/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a PPMarkShower
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return '';
    };
  }

  /** Class constructor */
  private constructor({ a }: MTypes.Data<Type>) {
    super();
    this.a = a;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Constructor of a PPMarkShower
 *
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type => Type.make(params);
