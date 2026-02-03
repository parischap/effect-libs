/**
 * Same as StyleCharacteristics (see StyleCharacteristics.ts) but, as syntaxic sugar, styles are
 * callable functions that create Text's (see Text.ts). For instance, `const text =
 * ASStyle.red('foo')` will create a text containing the string 'foo' styled in red.
 */

import { MTypes } from '@parischap/effect-lib';
import { Equivalence, pipe, Struct } from 'effect';
import * as ASColorBase from './Color/Base.js';
import * as ASColorThreeBit from './Color/ThreeBit.js';
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
export const black: Type = color(ASColorThreeBit.black);

/**
 * Original red color style instance
 *
 * @category Original instances
 */
export const red: Type = color(ASColorThreeBit.red);

/**
 * Original green color style instance
 *
 * @category Original instances
 */
export const green: Type = color(ASColorThreeBit.green);

/**
 * Original yellow color style instance
 *
 * @category Original instances
 */
export const yellow: Type = color(ASColorThreeBit.yellow);

/**
 * Original blue color style instance
 *
 * @category Original instances
 */
export const blue: Type = color(ASColorThreeBit.blue);

/**
 * Original magenta color style instance
 *
 * @category Original instances
 */
export const magenta: Type = color(ASColorThreeBit.magenta);

/**
 * Original cyan color style instance
 *
 * @category Original instances
 */
export const cyan: Type = color(ASColorThreeBit.cyan);

/**
 * Original white color style instance
 *
 * @category Original instances
 */
export const white: Type = color(ASColorThreeBit.white);
/**
 * Original bright black color style instance
 *
 * @category Original instances
 */
export const brightBlack: Type = color(ASColorThreeBit.brightBlack);

/**
 * Original bright red color style instance
 *
 * @category Original instances
 */
export const brightRed: Type = color(ASColorThreeBit.brightRed);

/**
 * Original bright green color style instance
 *
 * @category Original instances
 */
export const brightGreen: Type = color(ASColorThreeBit.brightGreen);

/**
 * Original bright yellow color style instance
 *
 * @category Original instances
 */
export const brightYellow: Type = color(ASColorThreeBit.brightYellow);

/**
 * Original bright blue color style instance
 *
 * @category Original instances
 */
export const brightBlue: Type = color(ASColorThreeBit.brightBlue);

/**
 * Original bright magenta color style instance
 *
 * @category Original instances
 */
export const brightMagenta: Type = color(ASColorThreeBit.brightMagenta);

/**
 * Original bright cyan color style instance
 *
 * @category Original instances
 */
export const brightCyan: Type = color(ASColorThreeBit.brightCyan);

/**
 * Original bright white color style instance
 *
 * @category Original instances
 */
export const brightWhite: Type = color(ASColorThreeBit.brightWhite);
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
export const bgBlack: Type = bgColor(ASColorThreeBit.black);

/**
 * Original red color style instance
 *
 * @category Original instances
 */
export const bgRed: Type = bgColor(ASColorThreeBit.red);

/**
 * Original green color style instance
 *
 * @category Original instances
 */
export const bgGreen: Type = bgColor(ASColorThreeBit.green);

/**
 * Original yellow color style instance
 *
 * @category Original instances
 */
export const bgYellow: Type = bgColor(ASColorThreeBit.yellow);

/**
 * Original blue color style instance
 *
 * @category Original instances
 */
export const bgBlue: Type = bgColor(ASColorThreeBit.blue);

/**
 * Original magenta color style instance
 *
 * @category Original instances
 */
export const bgMagenta: Type = bgColor(ASColorThreeBit.magenta);

/**
 * Original cyan color style instance
 *
 * @category Original instances
 */
export const bgCyan: Type = bgColor(ASColorThreeBit.cyan);

/**
 * Original white color style instance
 *
 * @category Original instances
 */
export const bgWhite: Type = bgColor(ASColorThreeBit.white);

/**
 * Original bright black color style instance
 *
 * @category Original instances
 */
export const bgBrightBlack: Type = bgColor(ASColorThreeBit.brightBlack);

/**
 * Original bright red color style instance
 *
 * @category Original instances
 */
export const bgBrightRed: Type = bgColor(ASColorThreeBit.brightRed);

/**
 * Original bright green color style instance
 *
 * @category Original instances
 */
export const bgBrightGreen: Type = bgColor(ASColorThreeBit.brightGreen);

/**
 * Original bright yellow color style instance
 *
 * @category Original instances
 */
export const bgBrightYellow: Type = bgColor(ASColorThreeBit.brightYellow);

/**
 * Original bright blue color style instance
 *
 * @category Original instances
 */
export const bgBrightBlue: Type = bgColor(ASColorThreeBit.brightBlue);

/**
 * Original bright magenta color style instance
 *
 * @category Original instances
 */
export const bgBrightMagenta: Type = bgColor(ASColorThreeBit.brightMagenta);

/**
 * Original bright cyan color style instance
 *
 * @category Original instances
 */
export const bgBrightCyan: Type = bgColor(ASColorThreeBit.brightCyan);

/**
 * Original bright white color style instance
 *
 * @category Original instances
 */
export const bgBrightWhite: Type = bgColor(ASColorThreeBit.brightWhite);
