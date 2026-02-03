/**
 * Same as StyleCharacteristics (see StyleCharacteristics.ts) but, as syntaxic sugar, styles are
 * callable functions that create Text's (see Text.ts). For instance, `const text =
 * ASStyle.red('foo')` will create a text containing the string 'foo' styled in red.
 */

import { MTypes } from '@parischap/effect-lib';
import { Equivalence, pipe, Struct } from 'effect';
import * as ASColorBase from './Color/Base.js';
import * as ASStyleCharacteristics from './internal/StyleCharacteristics.js';
import * as ASText from './Text.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/Style/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a Style used as an action
 *
 * @category Models
 */
export namespace Action {
  /**
   * Type of the action
   *
   * @category Models
   */
  export interface Type {
    (...args: ReadonlyArray<string | ASText.Type>): ASText.Type;
  }
}

/**
 * Type that represents a Style
 *
 * @category Models
 */
export interface Type extends Action.Type {
  /** StyleCharacteristics that define this Style */
  readonly style: ASStyleCharacteristics.Type;
  /** .toString() method */
  readonly toString: () => string;

  /** @internal */
  readonly [_TypeId]: _TypeId;
}

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  ASStyleCharacteristics.equivalence(self.style, that.style);

/** Base */
const base: MTypes.Proto<Type> = {
  [_TypeId]: _TypeId,
  toString(this: Type): string {
    return this.style.toString();
  },
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type =>
  Object.assign(
    ((...args) => ASText.fromStyleAndElems(params.style)(...args)) satisfies Action.Type,
    {
      ...params,
      ...base,
    },
  );

/**
 * Gets the `style` property of `self`
 *
 * @category Destructors
 */
export const style: MTypes.OneArgFunction<Type, ASStyleCharacteristics.Type> = Struct.get('style');

/**
 * Returns the id of `self`
 *
 * @category Destructors
 */
export const toString = (self: Type): string => self.toString();

/**
 * Builds a new Style by merging `self` and `that`. In case of conflict (e.g `self` contains `Bold`
 * and `that` contains `NotBold`), the style in `that` will prevail.
 *
 * @category Utils
 */
export const mergeOver =
  (that: Type) =>
  (self: Type): Type =>
    _make({
      style: pipe(self.style, ASStyleCharacteristics.mergeOver(that.style)),
    });

/**
 * Builds a new Style by merging `self` and `that`. In case of conflict (e.g `self` contains `Bold`
 * and `that` contains `NotBold`), the style in `self` will prevail.
 *
 * @category Utils
 */
export const mergeUnder =
  (that: Type) =>
  (self: Type): Type =>
    _make({
      style: pipe(self.style, ASStyleCharacteristics.mergeUnder(that.style)),
    });

/**
 * None Style instance, i.e. Style that performs no styling
 *
 * @category Instances
 */
export const none: Type = _make({ style: ASStyleCharacteristics.none });

/**
 * Bold Style instance
 *
 * @category Instances
 */
export const bold: Type = _make({ style: ASStyleCharacteristics.bold });

/**
 * NotBold Style instance
 *
 * @category Instances
 */
export const notBold: Type = _make({ style: ASStyleCharacteristics.notBold });

/**
 * Dim Style instance
 *
 * @category Instances
 */
export const dim: Type = _make({ style: ASStyleCharacteristics.dim });

/**
 * NotDim Style instance
 *
 * @category Instances
 */
export const notDim: Type = _make({ style: ASStyleCharacteristics.notDim });

/**
 * Italic Style instance
 *
 * @category Instances
 */
export const italic: Type = _make({ style: ASStyleCharacteristics.italic });

/**
 * NotItalic Style instance
 *
 * @category Instances
 */
export const notItalic: Type = _make({ style: ASStyleCharacteristics.notItalic });

/**
 * Underlined Style instance
 *
 * @category Instances
 */
export const underlined: Type = _make({ style: ASStyleCharacteristics.underlined });

/**
 * NotUnderlined Style instance
 *
 * @category Instances
 */
export const notUnderlined: Type = _make({ style: ASStyleCharacteristics.notUnderlined });

/**
 * Struck-through Style instance
 *
 * @category Instances
 */
export const struckThrough: Type = _make({ style: ASStyleCharacteristics.struckThrough });

/**
 * NotStruckThrough Style instance
 *
 * @category Instances
 */
export const notStruckThrough: Type = _make({
  style: ASStyleCharacteristics.notStruckThrough,
});

/**
 * Overlined Style instance
 *
 * @category Instances
 */
export const overlined: Type = _make({ style: ASStyleCharacteristics.overlined });

/**
 * NotOverlined Style instance
 *
 * @category Instances
 */
export const notOverlined: Type = _make({ style: ASStyleCharacteristics.notOverlined });

/**
 * Inversed Style instance
 *
 * @category Instances
 */
export const inversed: Type = _make({ style: ASStyleCharacteristics.inversed });

/**
 * NotInversed Style instance
 *
 * @category Instances
 */
export const notInversed: Type = _make({ style: ASStyleCharacteristics.notInversed });

/**
 * Hidden Style instance
 *
 * @category Instances
 */
export const hidden: Type = _make({ style: ASStyleCharacteristics.hidden });

/**
 * NotHidden Style instance
 *
 * @category Instances
 */
export const notHidden: Type = _make({ style: ASStyleCharacteristics.notHidden });

/**
 * Blinking Style instance
 *
 * @category Instances
 */
export const blinking: Type = _make({ style: ASStyleCharacteristics.blinking });

/**
 * NotBlinking Style instance
 *
 * @category Instances
 */
export const notBlinking: Type = _make({ style: ASStyleCharacteristics.notBlinking });

/**
 * Default foreground color Style instance
 *
 * @category Instances
 */
export const defaultColor: Type = _make({ style: ASStyleCharacteristics.foregroundDefaultColor });

/**
 * Builds a Style that applies `color` as foreground color
 *
 * @category Constructors
 */
export const color = (color: ASColorBase.Type): Type =>
  _make({ style: ASStyleCharacteristics.fromColorAsForegroundColor(color) });

/**
 * Original black color style instance
 *
 * @category Original instances
 */
export const black: Type = _make({ style: ASStyleCharacteristics.black });

/**
 * Original red color style instance
 *
 * @category Original instances
 */
export const red: Type = _make({ style: ASStyleCharacteristics.red });

/**
 * Original green color style instance
 *
 * @category Original instances
 */
export const green: Type = _make({ style: ASStyleCharacteristics.green });

/**
 * Original yellow color style instance
 *
 * @category Original instances
 */
export const yellow: Type = _make({ style: ASStyleCharacteristics.yellow });

/**
 * Original blue color style instance
 *
 * @category Original instances
 */
export const blue: Type = _make({ style: ASStyleCharacteristics.blue });

/**
 * Original magenta color style instance
 *
 * @category Original instances
 */
export const magenta: Type = _make({ style: ASStyleCharacteristics.magenta });

/**
 * Original cyan color style instance
 *
 * @category Original instances
 */
export const cyan: Type = _make({ style: ASStyleCharacteristics.cyan });

/**
 * Original white color style instance
 *
 * @category Original instances
 */
export const white: Type = _make({ style: ASStyleCharacteristics.white });
/**
 * Original bright black color style instance
 *
 * @category Original instances
 */
export const brightBlack: Type = _make({ style: ASStyleCharacteristics.brightBlack });

/**
 * Original bright red color style instance
 *
 * @category Original instances
 */
export const brightRed: Type = _make({ style: ASStyleCharacteristics.brightRed });

/**
 * Original bright green color style instance
 *
 * @category Original instances
 */
export const brightGreen: Type = _make({ style: ASStyleCharacteristics.brightGreen });

/**
 * Original bright yellow color style instance
 *
 * @category Original instances
 */
export const brightYellow: Type = _make({ style: ASStyleCharacteristics.brightYellow });

/**
 * Original bright blue color style instance
 *
 * @category Original instances
 */
export const brightBlue: Type = _make({ style: ASStyleCharacteristics.brightBlue });

/**
 * Original bright magenta color style instance
 *
 * @category Original instances
 */
export const brightMagenta: Type = _make({ style: ASStyleCharacteristics.brightMagenta });

/**
 * Original bright cyan color style instance
 *
 * @category Original instances
 */
export const brightCyan: Type = _make({ style: ASStyleCharacteristics.brightCyan });

/**
 * Original bright white color style instance
 *
 * @category Original instances
 */
export const brightWhite: Type = _make({ style: ASStyleCharacteristics.brightWhite });

/**
 * Default background color Style instance
 *
 * @category Instances
 */
export const bgDefaultColor: Type = _make({
  style: ASStyleCharacteristics.backgroundDefaultColor,
});

/**
 * Builds a Style that applies `color` as background color
 *
 * @category Constructors
 */
export const bgColor = (color: ASColorBase.Type): Type =>
  _make({ style: ASStyleCharacteristics.fromColorAsBackgroundColor(color) });

/**
 * Original black color style instance
 *
 * @category Original instances
 */
export const bgBlack: Type = _make({ style: ASStyleCharacteristics.bgBlack });

/**
 * Original red color style instance
 *
 * @category Original instances
 */
export const bgRed: Type = _make({ style: ASStyleCharacteristics.bgRed });

/**
 * Original green color style instance
 *
 * @category Original instances
 */
export const bgGreen: Type = _make({ style: ASStyleCharacteristics.bgGreen });

/**
 * Original yellow color style instance
 *
 * @category Original instances
 */
export const bgYellow: Type = _make({ style: ASStyleCharacteristics.bgYellow });

/**
 * Original blue color style instance
 *
 * @category Original instances
 */
export const bgBlue: Type = _make({ style: ASStyleCharacteristics.bgBlue });

/**
 * Original magenta color style instance
 *
 * @category Original instances
 */
export const bgMagenta: Type = _make({ style: ASStyleCharacteristics.bgMagenta });

/**
 * Original cyan color style instance
 *
 * @category Original instances
 */
export const bgCyan: Type = _make({ style: ASStyleCharacteristics.bgCyan });

/**
 * Original white color style instance
 *
 * @category Original instances
 */
export const bgWhite: Type = _make({ style: ASStyleCharacteristics.bgWhite });

/**
 * Original bright black color style instance
 *
 * @category Original instances
 */
export const bgBrightBlack: Type = _make({ style: ASStyleCharacteristics.bgBrightBlack });

/**
 * Original bright red color style instance
 *
 * @category Original instances
 */
export const bgBrightRed: Type = _make({ style: ASStyleCharacteristics.bgBrightRed });

/**
 * Original bright green color style instance
 *
 * @category Original instances
 */
export const bgBrightGreen: Type = _make({ style: ASStyleCharacteristics.bgBrightGreen });

/**
 * Original bright yellow color style instance
 *
 * @category Original instances
 */
export const bgBrightYellow: Type = _make({ style: ASStyleCharacteristics.bgBrightYellow });

/**
 * Original bright blue color style instance
 *
 * @category Original instances
 */
export const bgBrightBlue: Type = _make({ style: ASStyleCharacteristics.bgBrightBlue });

/**
 * Original bright magenta color style instance
 *
 * @category Original instances
 */
export const bgBrightMagenta: Type = _make({ style: ASStyleCharacteristics.bgBrightMagenta });

/**
 * Original bright cyan color style instance
 *
 * @category Original instances
 */
export const bgBrightCyan: Type = _make({ style: ASStyleCharacteristics.bgBrightCyan });

/**
 * Original bright white color style instance
 *
 * @category Original instances
 */
export const bgBrightWhite: Type = _make({ style: ASStyleCharacteristics.bgBrightWhite });
