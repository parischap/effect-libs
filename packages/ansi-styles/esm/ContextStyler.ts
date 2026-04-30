/**
 * This module implements a type that applies to a string or text a style that depends on a context
 * object. Two constructors are provided:
 *
 * - `makeConstant`: creates a ContextStyler that always applies the same style regardless of the
 *   context. Useful when a function expects a ContextStyler but should ignore the context.
 * - `makePaletteBased`: creates a ContextStyler that contains a Palette (an array of styles) and a
 *   function that transforms a context object into an index. The style that is applied is the one
 *   at position index (modulo the number of styles in the Palette).
 */

import { pipe } from 'effect';
import * as Function from 'effect/Function';
import * as String from 'effect/String';
import * as Struct from 'effect/Struct';

import * as MArray from '@parischap/effect-lib/MArray';
import * as MData from '@parischap/effect-lib/MData';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import * as ASPalette from './Palette.js';
import * as ASStyle from './Style.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/ContextStyler/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents an ASContextStyler
 *
 * @category Models
 */
export class Type<in C> extends MData.Class {
  /** Id of this ContextStyler instance. Useful for equality and debugging */
  readonly id: string;

  /** Function that takes a context c and returns an ASStyle */
  readonly style: (c: C) => ASStyle.Type;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type<unknown>) {
      return this.id;
    };
  }

  /** Class constructor */
  public constructor({ id, style }: MTypes.Data<Type<C>>) {
    super();
    this.id = id;
    this.style = style;
  }

  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
  }
}

/**
 * Type of an ASContextStyler to which any ASContextStyler can be assigned
 *
 * @category Models
 */
export interface Any extends Type<never> {}

/**
 * Type of an ASContextStyler that can be assigned to any ASContextStyler (i.e an ASContextStyler
 * that works with any context object)
 *
 * @category Models
 */
export interface Never extends Type<unknown> {}

/**
 * Constructor of a constant ContextStyler that always applies the same style regardless of the
 * context
 *
 * @category Constructors
 */
export const makeConstant = ({ style }: { readonly style: ASStyle.Type }): Type<unknown> =>
  new Type({
    id: `${ASStyle.toString(style)}Styler`,
    style: Function.constant(style),
  });

/**
 * Constructor of a palette-based ContextStyler that selects a style from a palette based on a
 * context object of type C. The `indexFromContext` function must return an integer index from a
 * value of type C. Use a named function or function declaration for `indexFromContext` (don't use
 * an arrow function), otherwise the name of this ContextStyler will be meaningless (e.g. `function
 * depth(c) { return c. depth; }`, not `(c)=>c.depth` ).
 *
 * @category Constructors
 */
export const makePaletteBased = <C>({
  palette,
  indexFromContext,
}: {
  readonly palette: ASPalette.Type;
  readonly indexFromContext: (c: C) => number;
}): Type<C> =>
  new Type({
    id: `${String.capitalize(indexFromContext.name)}Based${ASPalette.toString(palette)}Styler`,
    style: (c: C) => {
      const { styles } = palette;
      return pipe(styles, MArray.unsafeGet(indexFromContext(c) % styles.length));
    },
  });

/**
 * Gets the id of `self`
 *
 * @category Getters
 */
export const id: MTypes.OneArgFunction<Any, string> = Struct.get('id');

/**
 * Gets the style function of `self`
 *
 * @category Getters
 */
export const style: <C>(self: Type<C>) => Type<C>['style'] = Struct.get('style');

/**
 * None ASContextStyler instance: does not apply any style
 *
 * @category Instances
 */
export const none: Never = makeConstant({ style: ASStyle.none });

/**
 * Original black color instance
 *
 * @category Instances
 */
export const black: Never = makeConstant({ style: ASStyle.black });

/**
 * Original red color instance
 *
 * @category Instances
 */
export const red: Never = makeConstant({ style: ASStyle.red });

/**
 * Original green color instance
 *
 * @category Instances
 */
export const green: Never = makeConstant({ style: ASStyle.green });

/**
 * Original yellow color instance
 *
 * @category Instances
 */
export const yellow: Never = makeConstant({ style: ASStyle.yellow });

/**
 * Original blue color instance
 *
 * @category Instances
 */
export const blue: Never = makeConstant({ style: ASStyle.blue });

/**
 * Original magenta color instance
 *
 * @category Instances
 */
export const magenta: Never = makeConstant({ style: ASStyle.magenta });

/**
 * Original cyan color instance
 *
 * @category Instances
 */
export const cyan: Never = makeConstant({ style: ASStyle.cyan });

/**
 * Original white color instance
 *
 * @category Instances
 */
export const white: Never = makeConstant({ style: ASStyle.white });
