/**
 * This module implements a date-time placeholder that is one of the two possible kinds of a
 * CVDateTimeFormatPart
 */

import { MData, MTypes } from '@parischap/effect-lib';
import { Struct } from 'effect';
import * as CVDateTimeFormatToken from '../DateTimeFormatToken.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag =
  '@parischap/conversions/formatting/date-time-format/DateTimeFormatPart/DateTimeFormatPlaceholder';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a CVDateTimeFormatPlaceholder
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** Name of this Placeholder */
  readonly name: CVDateTimeFormatToken.Type;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.name;
    };
  }

  /** Class constructor */
  private constructor({ name }: MTypes.Data<Type>) {
    super();
    this.name = name;
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
 * Placeholder constructor
 *
 * @category Constructors
 */
export const make = (name: CVDateTimeFormatToken.Type): Type => Type.make({ name });

/**
 * Returns the `name` property of `self`
 *
 * @category Destructors
 */
export const name: MTypes.OneArgFunction<Type, CVDateTimeFormatToken.Type> = Struct.get('name');
