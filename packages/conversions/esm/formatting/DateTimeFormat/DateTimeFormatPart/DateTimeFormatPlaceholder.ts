/**
 * This module implements a `CVDateTimeFormatPlaceholder`, which is one of the two constituents of a
 * `CVDateTimeFormatPart`. To parse/format a `CVDateTime`, a `CVDateTimeFormatPlaceholder` is
 * converted to a `CVTemplatePlaceholder` thanks to a `CVDateTimeFormatContext` which contains a
 * mapping between the two based on the `CVDateTimeFormatToken` key
 */

import * as MData from '@parischap/effect-lib/MData';
import * as MTypes from '@parischap/effect-lib/MTypes';
import * as Struct from 'effect/Struct';
import * as CVDateTimeFormatToken from '../DateTimeFormatToken.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag =
  '@parischap/conversions/Formatting/DateTimeFormat/DateTimeFormatPart/DateTimeFormatPlaceholder/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a CVDateTimeFormatPlaceholder
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** Name of this Placeholder */
  readonly token: CVDateTimeFormatToken.Type;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.token;
    };
  }

  /** Class constructor */
  private constructor({ token }: MTypes.Data<Type>) {
    super();
    this.token = token;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Placeholder constructor
 *
 * @category Constructors
 */
export const make = (token: CVDateTimeFormatToken.Type): Type => Type.make({ token });

/**
 * Returns the `token` property of `self`
 *
 * @category Destructors
 */
export const token: MTypes.OneArgFunction<Type, CVDateTimeFormatToken.Type> = Struct.get('token');
