/**
 * This module implements a `CVTemplatePartSeparator` which constitutes the mutable parts of a
 * `CVTemplate` (see Template.ts and TemplatePart.ts)
 */

import { MData, MTypes } from '@parischap/effect-lib';
import { Struct } from 'effect';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag =
  '@parischap/conversions/formatting/template/TemplatePart/template-part-separator/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a Separator
 *
 * @category Models
 */
export class Type extends MData.Class {
  /** The string representing this separator */
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
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

const _make = (params: MTypes.Data<Type>): Type => Type.make(params);

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (value: string): Type => _make({ value });

/**
 * Returns the `value` property of `self`
 *
 * @category Destructors
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
