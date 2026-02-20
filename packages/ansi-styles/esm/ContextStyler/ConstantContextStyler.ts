/**
 * This module implements a ASContextStyler (see ContextStyler/Base.ts) that returns the same style
 * whetever the context object c. Note that it is a optimized particular case of an
 * ASContextStylerWheel where the palette contains only one style and/or where the indexFromContext
 * function always returns the same number. However, the second case cannot be detected
 * automatically
 */

import * as ASStyle from '../Style.js';
import * as ASContextStyler from './ContextStyler.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/ContextStyler/ConstantContextStyler/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of an ASConstantContextStyler
 *
 * @category Models
 */
export class Type extends ASContextStyler.Type<never> {
  /** Style that is always returned by this ASConstantContextStyler */
  readonly style: ASStyle.Type;

  /** Function that takes a context c and returns an ASStyle */
  [ASContextStyler.toStyleSymbol](): ASStyle.Type {
    return this.style;
  }

  /** Class constructor */
  protected constructor({ style }: { readonly style: ASStyle.Type }) {
    super({
      id: `${ASStyle.toString(style)}Styler`,
    });
    this.style = style;
  }

  /** Static constructor */
  static make(params: { readonly style: ASStyle.Type }): Type {
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
export const make = (params: { readonly style: ASStyle.Type }): Type => Type.make(params);

/**
 * None ASConstantContextStyler instance: does not apply any style, does not provide a defaultText
 *
 * @category Instances
 */

export const none: Type = make({ style: ASStyle.none });

/**
 * Original black color instance
 *
 * @category Original instances
 */
export const black: Type = make({ style: ASStyle.black });

/**
 * Original red color instance
 *
 * @category Original instances
 */
export const red: Type = make({ style: ASStyle.red });

/**
 * Original green color instance
 *
 * @category Original instances
 */
export const green: Type = make({ style: ASStyle.green });

/**
 * Original yellow color instance
 *
 * @category Original instances
 */
export const yellow: Type = make({ style: ASStyle.yellow });

/**
 * Original blue color instance
 *
 * @category Original instances
 */
export const blue: Type = make({ style: ASStyle.blue });

/**
 * Original magenta color instance
 *
 * @category Original instances
 */
export const magenta: Type = make({ style: ASStyle.magenta });

/**
 * Original cyan color instance
 *
 * @category Original instances
 */
export const cyan: Type = make({ style: ASStyle.cyan });

/**
 * Original white color instance
 *
 * @category Original instances
 */
export const white: Type = make({ style: ASStyle.white });
