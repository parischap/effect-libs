/**
 * This module implements a `MTemplateSeparator` which constitutes the immutable parts of a
 * `MTemplate` (see Template.ts and TemplatePart.ts)
 */

import * as Struct from 'effect/Struct';

import type * as MTypes from '../types/types.js';

import * as MData from '../Data/Data.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/TemplatePart/TemplateSeparator/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

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
  protected get [TypeId](): TypeId {
    return TypeId;
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
