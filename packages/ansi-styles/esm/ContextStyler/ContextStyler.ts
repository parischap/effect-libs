/**
 * This module implements a type that applies to a string or text a style that depends on a context
 * object
 */

import * as MData from '@parischap/effect-lib/MData'
import * as MTypes from '@parischap/effect-lib/MTypes'
import * as Struct from 'effect/Struct'
import type * as ASStyle from '../Style.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/ContextStyler/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Symbol used to name the toStyle function
 *
 * @category Model symbols
 */
export const toStyleSymbol: unique symbol = Symbol.for(`${moduleTag}toStyle/`) as toStyleSymbol;
type toStyleSymbol = typeof toStyleSymbol;

/**
 * Type that represents an ASContextStyler
 *
 * @category Models
 */
export abstract class Type<in C> extends MData.Class {
  /** Id of this ContextStyler instance. Useful for equality and debugging */
  readonly id: string;

  /** Function that takes a context c and returns an ASStyle */
  abstract [toStyleSymbol](c: C): ASStyle.Type;

  /** Class constructor */
  protected constructor({ id }: MTypes.Data<Type<unknown>>) {
    super();
    this.id = id;
  }

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type<unknown>) {
      return this.id;
    };
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Gets the id of `self`
 *
 * @category Destructors
 */
export const id: MTypes.OneArgFunction<Type<never>, string> = Struct.get('id');

/**
 * Returns the style of `self` associated with Context `c`
 *
 * @category Destructors
 */
export const toStyle =
  <C>(self: Type<C>) =>
  (c: C): ASStyle.Type =>
    self[toStyleSymbol](c);
