/**
 * This module implements a `CVDateTimeFormatSeparator`, which is one of the two constituents of a
 * `CVDateTimeFormatPart`. To parse/format a `CVDateTime`, a `CVDateTimeFormatSeparator` is
 * converted to a `CVTemplateSeparator` with the same value. It is an aesthetic element that makes
 * the date easier to read for a human (e.g. a slash). But it contains no information pertaining to
 * the `CVDateTime` itself.
 */

import * as Struct from 'effect/Struct';

import * as MData from '@parischap/effect-lib/MData';
import type * as MTypes from '@parischap/effect-lib/MTypes';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag =
  '@parischap/conversions/formatting/DateTimeFormat/DateTimeFormatPart/DateTimeFormatSeparator/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a CVDateTimeFormatSeparator
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** The separator */
  readonly value: string;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.value;
    };
  }

  /** Class constructor */
  private constructor({ value }: MTypes.Data<Type>) {
    super();
    this.value = value;
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
 * Separator constructor
 *
 * @category Constructors
 */
export const make = (value: string): Type => Type.make({ value });

/**
 * Returns the `value` property of `self`
 *
 * @category Getters
 */
export const value: MTypes.OneArgFunction<Type, string> = Struct.get('value');

/**
 * Slash Separator instance
 *
 * @category Instances
 */
export const slash: Type = make('/');

/**
 * Backslash Separator instance
 *
 * @category Instances
 */
export const backslash: Type = make('\\');

/**
 * Dot Separator instance
 *
 * @category Instances
 */
export const dot: Type = make('.');

/**
 * Hyphen Separator instance
 *
 * @category Instances
 */
export const hyphen: Type = make('-');

/**
 * Colon Separator instance
 *
 * @category Instances
 */
export const colon: Type = make(':');

/**
 * Comma Separator instance
 *
 * @category Instances
 */
export const comma: Type = make(',');

/**
 * Space Separator instance
 *
 * @category Instances
 */
export const space: Type = make(' ');
