/**
 * This module implements a ASContextStylerBase (see ContextStyler/Base.ts) that contains an
 * ASPalette (an array of styles) and a function that transforms a Context object into an index. The
 * style that is applied is the one at position index (modulo the number of styles in the
 * ASPalette).
 */

import { MArray } from '@parischap/effect-lib';
import { pipe, String } from 'effect';
import * as ASPalette from '../Palette.js';
import type * as ASStyle from '../Style.js';
import * as ASContextStylerBase from './Base.js';

/**
 * Namespace of a function that transforms a context into an index
 *
 * @category Models
 */
export namespace IndexFromContext {
  /**
   * Type of an IndexFromContext
   *
   * @category Models
   */
  export interface Type<in C> {
    (c: C): number;
  }
}

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/ContextStyler/Palette/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of an ASContextStylerWheel
 *
 * @category Models
 */
export class Type<in C> extends ASContextStylerBase.Type<C> {
  /** Palette from which a style will be chosen */
  readonly palette: ASPalette.Type;

  /** Function that transforms a Context object into a number */
  readonly indexFromContext: IndexFromContext.Type<C>;

  /** Function that takes a context c and returns an ASStyle */
  [ASContextStylerBase.toStyleSymbol](c: C): ASStyle.Type {
    const { styles } = this.palette;
    return pipe(styles, MArray.unsafeGet(this.indexFromContext(c) % styles.length));
  }

  /** Class constructor */
  protected constructor({
    palette,
    indexFromContext,
  }: {
    readonly palette: ASPalette.Type;
    readonly indexFromContext: IndexFromContext.Type<C>;
  }) {
    super({
      id: `${String.capitalize(indexFromContext.name)}Based${ASPalette.toString(palette)}Styler`,
    });
    this.palette = palette;
    this.indexFromContext = indexFromContext;
  }

  /** Static constructor */
  static make<C>(params: {
    readonly palette: ASPalette.Type;
    readonly indexFromContext: IndexFromContext.Type<C>;
  }): Type<C> {
    return new Type(params);
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
export const make = <C>(params: {
  readonly palette: ASPalette.Type;
  readonly indexFromContext: IndexFromContext.Type<C>;
}): Type<C> => Type.make(params);
