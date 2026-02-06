/**
 * This module implements a type that defines all the characteristics of a style, e.g. the
 * foreground and background colors, whether it's bold or not,... These characteristics are those of
 * the Select Graphic Rendition subset for which info can be found at
 * https://stackoverflow.com/questions/4842424/list-of-ansi-color-escape-sequences. Each
 * characteristic is defined as an option, `none` meaning that the corresponding characteristic has
 * not been set. It is important to note that although dim and bold use the same reset sequence
 * (i.e. 22), they are completely different characteristics (i.e. a style can be bold and dim at the
 * same time, or just bold, or just dim).
 */

import { MDataBase, MDataEquivalenceBasedEquality, MStruct, MTypes } from '@parischap/effect-lib';
import { Equivalence, flow, Hash, pipe, Predicate } from 'effect';
import * as AsColorBase from '../Color/Base.js';
import * as ASColorThreeBit from '../Color/ThreeBit.js';
import * as ASCode from './Code.js';
import * as ASSequence from './Sequence.js';
import * as ASStyleCharacteristicBackgroundColor from './StyleCharacteristic/BackgroundColor.js';
import * as ASStyleCharacteristicBlinking from './StyleCharacteristic/Blinking.js';
import * as ASStyleCharacteristicBold from './StyleCharacteristic/Bold.js';
import * as ASStyleCharacteristicColor from './StyleCharacteristic/Color.js';
import * as ASStyleCharacteristicDim from './StyleCharacteristic/Dim.js';
import * as ASStyleCharacteristicForegroundColor from './StyleCharacteristic/ForegroundColor.js';
import * as ASStyleCharacteristicHidden from './StyleCharacteristic/Hidden.js';
import * as ASStyleCharacteristicInversed from './StyleCharacteristic/Inversed.js';
import * as ASStyleCharacteristicItalic from './StyleCharacteristic/Italic.js';
import * as ASStyleCharacteristicOnOffOrMissing from './StyleCharacteristic/OnOffOrMissing.js';
import * as ASStyleCharacteristicOverlined from './StyleCharacteristic/Overlined.js';
import * as ASStyleCharacteristicPresentOrMissing from './StyleCharacteristic/PresentOrMissing.js';
import * as ASStyleCharacteristicStruckThrough from './StyleCharacteristic/StruckThrough.js';
import * as ASStyleCharacteristicUnderlined from './StyleCharacteristic/Underlined.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/internal/StyleCharacteristics/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

const _TypeIdHash = Hash.hash(_TypeId);

/**
 * Type of a StyleCharacteristics
 *
 * @category Models
 */
export class Type extends MDataEquivalenceBasedEquality.Class {
  /** BoldState of this style */
  readonly bold: ASStyleCharacteristicBold.Type;

  /** DimState of this style */
  readonly dim: ASStyleCharacteristicDim.Type;

  /** ItalicState of this style */
  readonly italic: ASStyleCharacteristicItalic.Type;

  /** UnderlinedState of this style */
  readonly underlined: ASStyleCharacteristicUnderlined.Type;

  /** StruckThroughState of this style */
  readonly struckThrough: ASStyleCharacteristicStruckThrough.Type;

  /** OverlinedState of this style */
  readonly overlined: ASStyleCharacteristicOverlined.Type;

  /** InversedState of this style */
  readonly inversed: ASStyleCharacteristicInversed.Type;

  /** HiddenState of this style */
  readonly hidden: ASStyleCharacteristicHidden.Type;

  /** BlinkingState of this style */
  readonly blinking: ASStyleCharacteristicBlinking.Type;

  /** Foreground color of this style. */
  readonly foregroundColor: ASStyleCharacteristicForegroundColor.Type;

  /** Background color of this style. */
  readonly backgroundColor: ASStyleCharacteristicBackgroundColor.Type;

  /** Class constructor */
  private constructor({
    bold,
    dim,
    italic,
    underlined,
    struckThrough,
    overlined,
    inversed,
    hidden,
    blinking,
    foregroundColor,
    backgroundColor,
  }: MTypes.Data<Type>) {
    super();
    this.bold = bold;
    this.dim = dim;
    this.italic = italic;
    this.underlined = underlined;
    this.struckThrough = struckThrough;
    this.overlined = overlined;
    this.inversed = inversed;
    this.hidden = hidden;
    this.blinking = blinking;
    this.foregroundColor = foregroundColor;
    this.backgroundColor = backgroundColor;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Returns the `id` of `this` */
  [MDataBase.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      const result = `${this.bold.toString()}${this.dim.toString()}${this.italic.toString()}${this.underlined.toString()}\
${this.struckThrough.toString()}${this.overlined.toString()}${this.inversed.toString()}${this.hidden.toString()}\
${this.blinking.toString()}${this.foregroundColor.toString()}${this.backgroundColor.toString()}`;
      return result.length === 0 ? 'NoStyle' : result;
    };
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return pipe(
      this.bold,
      Hash.hash,
      Hash.combine(Hash.hash(this.dim)),
      Hash.combine(Hash.hash(this.italic)),
      Hash.combine(Hash.hash(this.underlined)),
      Hash.combine(Hash.hash(this.struckThrough)),
      Hash.combine(Hash.hash(this.overlined)),
      Hash.combine(Hash.hash(this.inversed)),
      Hash.combine(Hash.hash(this.hidden)),
      Hash.combine(Hash.hash(this.blinking)),
      Hash.combine(Hash.hash(this.foregroundColor)),
      Hash.combine(Hash.hash(this.backgroundColor)),
      Hash.combine(_TypeIdHash),
      Hash.cached(this),
    );
  }

  /** Function that implements the equivalence of `this` and `that` */
  [MDataEquivalenceBasedEquality.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
  }

  /** Predicate that returns true if `that` has the same type marker as `this` */
  [MDataEquivalenceBasedEquality.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
    return Predicate.hasProperty(that, _TypeId);
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}
/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  ASStyleCharacteristicOnOffOrMissing.equivalence(self.bold, that.bold)
  && ASStyleCharacteristicOnOffOrMissing.equivalence(self.dim, that.dim)
  && ASStyleCharacteristicOnOffOrMissing.equivalence(self.italic, that.italic)
  && ASStyleCharacteristicOnOffOrMissing.equivalence(self.underlined, that.underlined)
  && ASStyleCharacteristicOnOffOrMissing.equivalence(self.struckThrough, that.struckThrough)
  && ASStyleCharacteristicOnOffOrMissing.equivalence(self.overlined, that.overlined)
  && ASStyleCharacteristicOnOffOrMissing.equivalence(self.inversed, that.inversed)
  && ASStyleCharacteristicOnOffOrMissing.equivalence(self.hidden, that.hidden)
  && ASStyleCharacteristicOnOffOrMissing.equivalence(self.blinking, that.blinking)
  && ASStyleCharacteristicColor.equivalence(self.foregroundColor, that.foregroundColor)
  && ASStyleCharacteristicColor.equivalence(self.backgroundColor, that.backgroundColor);

/**
 * Returns true if `self` has the bold style
 *
 * @category Predicates
 */
export const hasBold: Predicate.Predicate<Type> = (self) =>
  ASStyleCharacteristicOnOffOrMissing.equivalence(self.bold, ASStyleCharacteristicBold.on);

/**
 * Returns true if `self` has the notBold state
 *
 * @category Predicates
 */
export const hasNotBold: Predicate.Predicate<Type> = (self) =>
  ASStyleCharacteristicOnOffOrMissing.equivalence(self.bold, ASStyleCharacteristicBold.off);

/**
 * Returns true if `self` has the dim state
 *
 * @category Predicates
 */
export const hasDim: Predicate.Predicate<Type> = (self) =>
  ASStyleCharacteristicOnOffOrMissing.equivalence(self.dim, ASStyleCharacteristicDim.on);

/**
 * Returns true if `self` has the notDim state
 *
 * @category Predicates
 */
export const hasNotDim: Predicate.Predicate<Type> = (self) =>
  ASStyleCharacteristicOnOffOrMissing.equivalence(self.dim, ASStyleCharacteristicDim.off);

/**
 * Returns the id of `self`
 *
 * @category Destructors
 */
export const toString = (self: Type): string => self.toString();

/**
 * Returns the sequence corresponding to `self`
 *
 * @category Destructors
 */
export const toSequence = (self: Type): ASSequence.Type => {
  const _hasNotDim = hasNotDim(self);
  return [
    // Useless to send both notBold and notDim because they have the same value
    ...(hasNotBold(self) && _hasNotDim ? ASStyleCharacteristicPresentOrMissing.toSequence(self.bold)
      // Send notDim before bold otherwise bold will never take effect
    : _hasNotDim ?
      [
        ...ASStyleCharacteristicPresentOrMissing.toSequence(self.dim),
        ...ASStyleCharacteristicPresentOrMissing.toSequence(self.bold),
      ]
      // In case hasNotBold, send bold before dim otherwise dim will never take effect
    : [
        ...ASStyleCharacteristicPresentOrMissing.toSequence(self.bold),
        ...ASStyleCharacteristicPresentOrMissing.toSequence(self.dim),
      ]),
    ...ASStyleCharacteristicPresentOrMissing.toSequence(self.italic),
    ...ASStyleCharacteristicPresentOrMissing.toSequence(self.underlined),
    ...ASStyleCharacteristicPresentOrMissing.toSequence(self.struckThrough),
    ...ASStyleCharacteristicPresentOrMissing.toSequence(self.overlined),
    ...ASStyleCharacteristicPresentOrMissing.toSequence(self.inversed),
    ...ASStyleCharacteristicPresentOrMissing.toSequence(self.hidden),
    ...ASStyleCharacteristicPresentOrMissing.toSequence(self.blinking),
    ...ASStyleCharacteristicPresentOrMissing.toSequence(self.foregroundColor),
    ...ASStyleCharacteristicPresentOrMissing.toSequence(self.backgroundColor),
  ];
};

/**
 * Returns the ANSI code corresponding to `self`
 *
 * @category Destructors
 */
export const toCode: MTypes.OneArgFunction<Type, ASCode.Type> = flow(
  toSequence,
  ASCode.fromSequence,
);

/**
 * Builds a new StyleCharacteristics by merging `self` and `that`. In case of conflict (e.g `self`
 * contains `Bold` and `that` contains `NotBold`), the characteristics in `self` will prevail.
 *
 * @category Utils
 */
export const mergeUnder =
  (that: Type) =>
  (self: Type): Type =>
    Type.make({
      bold: ASStyleCharacteristicPresentOrMissing.PresentOrElse(self.bold, that.bold),
      dim: ASStyleCharacteristicPresentOrMissing.PresentOrElse(self.dim, that.dim),
      italic: ASStyleCharacteristicPresentOrMissing.PresentOrElse(self.italic, that.italic),
      underlined: ASStyleCharacteristicPresentOrMissing.PresentOrElse(
        self.underlined,
        that.underlined,
      ),
      struckThrough: ASStyleCharacteristicPresentOrMissing.PresentOrElse(
        self.struckThrough,
        that.struckThrough,
      ),
      overlined: ASStyleCharacteristicPresentOrMissing.PresentOrElse(
        self.overlined,
        that.overlined,
      ),
      inversed: ASStyleCharacteristicPresentOrMissing.PresentOrElse(self.inversed, that.inversed),
      hidden: ASStyleCharacteristicPresentOrMissing.PresentOrElse(self.hidden, that.hidden),
      blinking: ASStyleCharacteristicPresentOrMissing.PresentOrElse(self.blinking, that.blinking),
      foregroundColor: ASStyleCharacteristicPresentOrMissing.PresentOrElse(
        self.foregroundColor,
        that.foregroundColor,
      ),
      backgroundColor: ASStyleCharacteristicPresentOrMissing.PresentOrElse(
        self.backgroundColor,
        that.backgroundColor,
      ),
    });

/**
 * Builds a new StyleCharacteristics by merging `self` and `that`. In case of conflict (e.g `self`
 * contains `Bold` and `that` contains `NotBold`), the characteristics in `that` will prevail.
 *
 * @category Utils
 */
export const mergeOver =
  (that: Type) =>
  (self: Type): Type =>
    pipe(that, mergeUnder(self));

/**
 * Builds a new StyleCharacteristics by removing from `self` the StyleCharacteristic's of `that`.
 *
 * @category Utils
 */
export const difference =
  (that: Type) =>
  (self: Type): Type =>
    Type.make({
      bold: ASStyleCharacteristicPresentOrMissing.orWhenEquals(
        self.bold,
        that.bold,
        ASStyleCharacteristicBold.missing,
      ),
      dim: ASStyleCharacteristicPresentOrMissing.orWhenEquals(
        self.dim,
        that.dim,
        ASStyleCharacteristicDim.missing,
      ),
      italic: ASStyleCharacteristicPresentOrMissing.orWhenEquals(
        self.italic,
        that.italic,
        ASStyleCharacteristicItalic.missing,
      ),
      underlined: ASStyleCharacteristicPresentOrMissing.orWhenEquals(
        self.underlined,
        that.underlined,
        ASStyleCharacteristicUnderlined.missing,
      ),
      struckThrough: ASStyleCharacteristicPresentOrMissing.orWhenEquals(
        self.struckThrough,
        that.struckThrough,
        ASStyleCharacteristicStruckThrough.missing,
      ),
      overlined: ASStyleCharacteristicPresentOrMissing.orWhenEquals(
        self.overlined,
        that.overlined,
        ASStyleCharacteristicOverlined.missing,
      ),
      inversed: ASStyleCharacteristicPresentOrMissing.orWhenEquals(
        self.inversed,
        that.inversed,
        ASStyleCharacteristicInversed.missing,
      ),
      hidden: ASStyleCharacteristicPresentOrMissing.orWhenEquals(
        self.hidden,
        that.hidden,
        ASStyleCharacteristicHidden.missing,
      ),
      blinking: ASStyleCharacteristicPresentOrMissing.orWhenEquals(
        self.blinking,
        that.blinking,
        ASStyleCharacteristicBlinking.missing,
      ),
      foregroundColor: ASStyleCharacteristicPresentOrMissing.orWhenEquals(
        self.foregroundColor,
        that.foregroundColor,
        ASStyleCharacteristicForegroundColor.missing,
      ),
      backgroundColor: ASStyleCharacteristicPresentOrMissing.orWhenEquals(
        self.backgroundColor,
        that.backgroundColor,
        ASStyleCharacteristicBackgroundColor.missing,
      ),
    });

/**
 * Builds a new StyleCharacteristics by removing from `self` the StyleCharacteristic's of `context`.
 * Same as difference above but:
 *
 * - If `self` and `context` contain `bold` and `self` also contains `notDim` and `context` does not
 *   contain `notdim`, then do not remove `bold`.
 * - If `self` and `context` contain `dim` and `self` also contains `notBold` and `context` does not
 *   contain `notBold`, then do not remove `dim`
 *
 * @category Utils
 */
export const substractContext =
  (context: Type) =>
  (self: Type): Type => {
    const target = pipe(self, difference(context));
    return (
      hasBold(self) && hasNotDim(target) ?
        Type.make(pipe(target, MStruct.set({ bold: ASStyleCharacteristicBold.on })))
      : hasDim(self) && hasNotBold(target) ?
        Type.make(pipe(target, MStruct.set({ dim: ASStyleCharacteristicDim.on })))
      : target
    );
  };

/**
 * Empty StyleCharacteristics
 *
 * @category Instances
 */
export const none: Type = Type.make({
  bold: ASStyleCharacteristicBold.missing,
  dim: ASStyleCharacteristicDim.missing,
  italic: ASStyleCharacteristicItalic.missing,
  underlined: ASStyleCharacteristicUnderlined.missing,
  struckThrough: ASStyleCharacteristicStruckThrough.missing,
  overlined: ASStyleCharacteristicOverlined.missing,
  inversed: ASStyleCharacteristicInversed.missing,
  hidden: ASStyleCharacteristicHidden.missing,
  blinking: ASStyleCharacteristicBlinking.missing,
  foregroundColor: ASStyleCharacteristicForegroundColor.missing,
  backgroundColor: ASStyleCharacteristicBackgroundColor.missing,
});

/**
 * Default StyleCharacteristics
 *
 * @category Instances
 */
export const defaults: Type = Type.make({
  bold: ASStyleCharacteristicBold.off,
  dim: ASStyleCharacteristicDim.off,
  italic: ASStyleCharacteristicItalic.off,
  underlined: ASStyleCharacteristicUnderlined.off,
  struckThrough: ASStyleCharacteristicStruckThrough.off,
  overlined: ASStyleCharacteristicOverlined.off,
  inversed: ASStyleCharacteristicInversed.off,
  hidden: ASStyleCharacteristicHidden.off,
  blinking: ASStyleCharacteristicBlinking.off,
  foregroundColor: ASStyleCharacteristicForegroundColor.defaultColor,
  backgroundColor: ASStyleCharacteristicBackgroundColor.defaultColor,
});

/**
 * Bold StyleCharacteristics instance
 *
 * @category Instances
 */
export const bold: Type = Type.make(
  pipe(none, MStruct.set({ bold: ASStyleCharacteristicBold.on })),
);

/**
 * NotBold StyleCharacteristics instance
 *
 * @category Instances
 */
export const notBold: Type = Type.make(
  pipe(none, MStruct.set({ bold: ASStyleCharacteristicBold.off })),
);

/**
 * Dim StyleCharacteristics instance
 *
 * @category Instances
 */
export const dim: Type = Type.make(pipe(none, MStruct.set({ dim: ASStyleCharacteristicDim.on })));

/**
 * NotDim StyleCharacteristics instance
 *
 * @category Instances
 */
export const notDim: Type = Type.make(
  pipe(none, MStruct.set({ dim: ASStyleCharacteristicDim.off })),
);

/**
 * Italic StyleCharacteristics instance
 *
 * @category Instances
 */
export const italic: Type = Type.make(
  pipe(none, MStruct.set({ italic: ASStyleCharacteristicItalic.on })),
);

/**
 * NotItalic StyleCharacteristics instance
 *
 * @category Instances
 */
export const notItalic: Type = Type.make(
  pipe(none, MStruct.set({ italic: ASStyleCharacteristicItalic.off })),
);

/**
 * Underlined StyleCharacteristics instance
 *
 * @category Instances
 */
export const underlined: Type = Type.make(
  pipe(none, MStruct.set({ underlined: ASStyleCharacteristicUnderlined.on })),
);

/**
 * NotUnderlined StyleCharacteristics instance
 *
 * @category Instances
 */
export const notUnderlined: Type = Type.make(
  pipe(none, MStruct.set({ underlined: ASStyleCharacteristicUnderlined.off })),
);

/**
 * StruckThrough StyleCharacteristics instance
 *
 * @category Instances
 */
export const struckThrough: Type = Type.make(
  pipe(none, MStruct.set({ struckThrough: ASStyleCharacteristicStruckThrough.on })),
);

/**
 * NotStruckThrough StyleCharacteristics instance
 *
 * @category Instances
 */
export const notStruckThrough: Type = Type.make(
  pipe(none, MStruct.set({ struckThrough: ASStyleCharacteristicStruckThrough.off })),
);

/**
 * Overlined StyleCharacteristics instance
 *
 * @category Instances
 */
export const overlined: Type = Type.make(
  pipe(none, MStruct.set({ overlined: ASStyleCharacteristicOverlined.on })),
);

/**
 * NotOverlined StyleCharacteristics instance
 *
 * @category Instances
 */
export const notOverlined: Type = Type.make(
  pipe(none, MStruct.set({ overlined: ASStyleCharacteristicOverlined.off })),
);

/**
 * Inversed StyleCharacteristics instance
 *
 * @category Instances
 */
export const inversed: Type = Type.make(
  pipe(none, MStruct.set({ inversed: ASStyleCharacteristicInversed.on })),
);

/**
 * NotInversed StyleCharacteristics instance
 *
 * @category Instances
 */
export const notInversed: Type = Type.make(
  pipe(none, MStruct.set({ inversed: ASStyleCharacteristicInversed.off })),
);

/**
 * Hidden StyleCharacteristics instance
 *
 * @category Instances
 */
export const hidden: Type = Type.make(
  pipe(none, MStruct.set({ hidden: ASStyleCharacteristicHidden.on })),
);

/**
 * NotHidden StyleCharacteristics instance
 *
 * @category Instances
 */
export const notHidden: Type = Type.make(
  pipe(none, MStruct.set({ hidden: ASStyleCharacteristicHidden.off })),
);

/**
 * Blinking StyleCharacteristics instance
 *
 * @category Instances
 */
export const blinking: Type = Type.make(
  pipe(none, MStruct.set({ blinking: ASStyleCharacteristicBlinking.on })),
);

/**
 * NotBlinking StyleCharacteristics instance
 *
 * @category Instances
 */
export const notBlinking: Type = Type.make(
  pipe(none, MStruct.set({ blinking: ASStyleCharacteristicBlinking.off })),
);

/**
 * Default foreground color StyleCharacteristics instance
 *
 * @category Instances
 */
export const foregroundDefaultColor: Type = Type.make(
  pipe(none, MStruct.set({ foregroundColor: ASStyleCharacteristicForegroundColor.defaultColor })),
);

/**
 * Builds a StyleCharacteristics that applies `color` as foreground color
 *
 * @category Constructors
 */
export const fromColorAsForegroundColor = (color: AsColorBase.Type): Type =>
  Type.make(
    pipe(
      none,
      MStruct.set({ foregroundColor: ASStyleCharacteristicForegroundColor.fromColor(color) }),
    ),
  );

/**
 * Original black color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const black: Type = fromColorAsForegroundColor(ASColorThreeBit.black);

/**
 * Original red color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const red: Type = fromColorAsForegroundColor(ASColorThreeBit.red);

/**
 * Original green color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const green: Type = fromColorAsForegroundColor(ASColorThreeBit.green);

/**
 * Original yellow color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const yellow: Type = fromColorAsForegroundColor(ASColorThreeBit.yellow);

/**
 * Original blue color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const blue: Type = fromColorAsForegroundColor(ASColorThreeBit.blue);

/**
 * Original magenta color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const magenta: Type = fromColorAsForegroundColor(ASColorThreeBit.magenta);

/**
 * Original cyan color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const cyan: Type = fromColorAsForegroundColor(ASColorThreeBit.cyan);

/**
 * Original white color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const white: Type = fromColorAsForegroundColor(ASColorThreeBit.white);
/**
 * Original bright black color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const brightBlack: Type = fromColorAsForegroundColor(ASColorThreeBit.brightBlack);

/**
 * Original bright red color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const brightRed: Type = fromColorAsForegroundColor(ASColorThreeBit.brightRed);

/**
 * Original bright green color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const brightGreen: Type = fromColorAsForegroundColor(ASColorThreeBit.brightGreen);

/**
 * Original bright yellow color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const brightYellow: Type = fromColorAsForegroundColor(ASColorThreeBit.brightYellow);

/**
 * Original bright blue color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const brightBlue: Type = fromColorAsForegroundColor(ASColorThreeBit.brightBlue);

/**
 * Original bright magenta color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const brightMagenta: Type = fromColorAsForegroundColor(ASColorThreeBit.brightMagenta);

/**
 * Original bright cyan color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const brightCyan: Type = fromColorAsForegroundColor(ASColorThreeBit.brightCyan);

/**
 * Original bright white color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const brightWhite: Type = fromColorAsForegroundColor(ASColorThreeBit.brightWhite);

/**
 * Default background color StyleCharacteristics
 *
 * @category Instances
 */
export const backgroundDefaultColor: Type = Type.make(
  pipe(none, MStruct.set({ backgroundColor: ASStyleCharacteristicBackgroundColor.defaultColor })),
);

/**
 * Builds a StyleCharacteristics that applies `color` as background color
 *
 * @category Constructors
 */
export const fromColorAsBackgroundColor = (color: AsColorBase.Type): Type =>
  Type.make(
    pipe(
      none,
      MStruct.set({ backgroundColor: ASStyleCharacteristicBackgroundColor.fromColor(color) }),
    ),
  );

/**
 * Original black color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBlack: Type = fromColorAsBackgroundColor(ASColorThreeBit.black);

/**
 * Original red color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgRed: Type = fromColorAsBackgroundColor(ASColorThreeBit.red);

/**
 * Original green color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgGreen: Type = fromColorAsBackgroundColor(ASColorThreeBit.green);

/**
 * Original yellow color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgYellow: Type = fromColorAsBackgroundColor(ASColorThreeBit.yellow);

/**
 * Original blue color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBlue: Type = fromColorAsBackgroundColor(ASColorThreeBit.blue);

/**
 * Original magenta color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgMagenta: Type = fromColorAsBackgroundColor(ASColorThreeBit.magenta);

/**
 * Original cyan color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgCyan: Type = fromColorAsBackgroundColor(ASColorThreeBit.cyan);

/**
 * Original white color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgWhite: Type = fromColorAsBackgroundColor(ASColorThreeBit.white);

/**
 * Original bright black color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBrightBlack: Type = fromColorAsBackgroundColor(ASColorThreeBit.brightBlack);

/**
 * Original bright red color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBrightRed: Type = fromColorAsBackgroundColor(ASColorThreeBit.brightRed);

/**
 * Original bright green color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBrightGreen: Type = fromColorAsBackgroundColor(ASColorThreeBit.brightGreen);

/**
 * Original bright yellow color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBrightYellow: Type = fromColorAsBackgroundColor(ASColorThreeBit.brightYellow);

/**
 * Original bright blue color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBrightBlue: Type = fromColorAsBackgroundColor(ASColorThreeBit.brightBlue);

/**
 * Original bright magenta color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBrightMagenta: Type = fromColorAsBackgroundColor(ASColorThreeBit.brightMagenta);

/**
 * Original bright cyan color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBrightCyan: Type = fromColorAsBackgroundColor(ASColorThreeBit.brightCyan);

/**
 * Original bright white color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBrightWhite: Type = fromColorAsBackgroundColor(ASColorThreeBit.brightWhite);
