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

import * as MData from '@parischap/effect-lib/MData';
import * as MDataEquivalenceBasedEquality from '@parischap/effect-lib/MDataEquivalenceBasedEquality';
import * as MStruct from '@parischap/effect-lib/MStruct';
import * as MTypes from '@parischap/effect-lib/MTypes';
import { flow, pipe } from 'effect';
import * as Equivalence from 'effect/Equivalence';
import * as Hash from 'effect/Hash';
import * as Predicate from 'effect/Predicate';
import * as AsColor from '../Color/Color.js';
import * as ASThreeBitColor from '../Color/ThreeBitColor.js';
import * as ASCode from './Code.js';
import * as ASSequence from './Sequence.js';
import * as ASBackgroundColorStyleCharacteristic from './StyleCharacteristic/OptionalStyleCharacteristic/ColorOptionalStyleCharacteristic/BackgroundColorStyleCharacteristic.js';
import * as ASColorOptionalStyleCharacteristic from './StyleCharacteristic/OptionalStyleCharacteristic/ColorOptionalStyleCharacteristic/ColorOptionalStyleCharacteristic.js';
import * as ASForegroundColorStyleCharacteristic from './StyleCharacteristic/OptionalStyleCharacteristic/ColorOptionalStyleCharacteristic/ForegroundColorStyleCharacteristic.js';
import * as ASBlinkingStyleCharacteristic from './StyleCharacteristic/OptionalStyleCharacteristic/OnOffOptionalStyleCharacteristic/BlinkingStyleCharacteristic.js';
import * as ASBoldStyleCharacteristic from './StyleCharacteristic/OptionalStyleCharacteristic/OnOffOptionalStyleCharacteristic/BoldStyleCharacteristic.js';
import * as ASDimStyleCharacteristic from './StyleCharacteristic/OptionalStyleCharacteristic/OnOffOptionalStyleCharacteristic/DimStyleCharacteristic.js';
import * as ASHiddenStyleCharacteristic from './StyleCharacteristic/OptionalStyleCharacteristic/OnOffOptionalStyleCharacteristic/HiddenStyleCharacteristic.js';
import * as ASInversedStyleCharacteristic from './StyleCharacteristic/OptionalStyleCharacteristic/OnOffOptionalStyleCharacteristic/InversedStyleCharacteristic.js';
import * as ASItalicStyleCharacteristic from './StyleCharacteristic/OptionalStyleCharacteristic/OnOffOptionalStyleCharacteristic/ItalicStyleCharacteristic.js';
import * as ASOnOffOptionalStyleCharacteristic from './StyleCharacteristic/OptionalStyleCharacteristic/OnOffOptionalStyleCharacteristic/OnOffOptionalStyleCharacteristic.js';
import * as ASOverlinedStyleCharacteristic from './StyleCharacteristic/OptionalStyleCharacteristic/OnOffOptionalStyleCharacteristic/OverlinedStyleCharacteristic.js';
import * as ASStruckThroughStyleCharacteristic from './StyleCharacteristic/OptionalStyleCharacteristic/OnOffOptionalStyleCharacteristic/StruckThroughStyleCharacteristic.js';
import * as ASUnderlinedStyleCharacteristic from './StyleCharacteristic/OptionalStyleCharacteristic/OnOffOptionalStyleCharacteristic/UnderlinedStyleCharacteristic.js';
import * as ASOptionalStyleCharacteristic from './StyleCharacteristic/OptionalStyleCharacteristic/OptionalStyleCharacteristic.js';

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
  readonly boldStyleCharacteristic: ASBoldStyleCharacteristic.Type;

  /** DimState of this style */
  readonly dimStyleCharacteristic: ASDimStyleCharacteristic.Type;

  /** ItalicState of this style */
  readonly italicStyleCharacteristic: ASItalicStyleCharacteristic.Type;

  /** UnderlinedState of this style */
  readonly underlinedStyleCharacteristic: ASUnderlinedStyleCharacteristic.Type;

  /** StruckThroughState of this style */
  readonly struckThroughStyleCharacteristic: ASStruckThroughStyleCharacteristic.Type;

  /** OverlinedState of this style */
  readonly overlinedStyleCharacteristic: ASOverlinedStyleCharacteristic.Type;

  /** InversedState of this style */
  readonly inversedStyleCharacteristic: ASInversedStyleCharacteristic.Type;

  /** HiddenState of this style */
  readonly hiddenStyleCharacteristic: ASHiddenStyleCharacteristic.Type;

  /** BlinkingState of this style */
  readonly blinkingStyleCharacteristic: ASBlinkingStyleCharacteristic.Type;

  /** Foreground color of this style. */
  readonly foregroundColorStyleCharacteristic: ASForegroundColorStyleCharacteristic.Type;

  /** Background color of this style. */
  readonly backgroundColorStyleCharacteristic: ASBackgroundColorStyleCharacteristic.Type;

  /** Class constructor */
  private constructor({
    boldStyleCharacteristic,
    dimStyleCharacteristic,
    italicStyleCharacteristic,
    underlinedStyleCharacteristic,
    struckThroughStyleCharacteristic,
    overlinedStyleCharacteristic,
    inversedStyleCharacteristic,
    hiddenStyleCharacteristic,
    blinkingStyleCharacteristic,
    foregroundColorStyleCharacteristic,
    backgroundColorStyleCharacteristic,
  }: MTypes.Data<Type>) {
    super();
    this.boldStyleCharacteristic = boldStyleCharacteristic;
    this.dimStyleCharacteristic = dimStyleCharacteristic;
    this.italicStyleCharacteristic = italicStyleCharacteristic;
    this.underlinedStyleCharacteristic = underlinedStyleCharacteristic;
    this.struckThroughStyleCharacteristic = struckThroughStyleCharacteristic;
    this.overlinedStyleCharacteristic = overlinedStyleCharacteristic;
    this.inversedStyleCharacteristic = inversedStyleCharacteristic;
    this.hiddenStyleCharacteristic = hiddenStyleCharacteristic;
    this.blinkingStyleCharacteristic = blinkingStyleCharacteristic;
    this.foregroundColorStyleCharacteristic = foregroundColorStyleCharacteristic;
    this.backgroundColorStyleCharacteristic = backgroundColorStyleCharacteristic;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      const result = `${this.boldStyleCharacteristic.toString()}${this.dimStyleCharacteristic.toString()}\
${this.italicStyleCharacteristic.toString()}${this.underlinedStyleCharacteristic.toString()}\
${this.struckThroughStyleCharacteristic.toString()}${this.overlinedStyleCharacteristic.toString()}\
${this.inversedStyleCharacteristic.toString()}${this.hiddenStyleCharacteristic.toString()}\
${this.blinkingStyleCharacteristic.toString()}${this.foregroundColorStyleCharacteristic.toString()}\
${this.backgroundColorStyleCharacteristic.toString()}`;
      return result.length === 0 ? 'NoStyle' : result;
    };
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return pipe(
      this.boldStyleCharacteristic,
      Hash.hash,
      Hash.combine(Hash.hash(this.dimStyleCharacteristic)),
      Hash.combine(Hash.hash(this.italicStyleCharacteristic)),
      Hash.combine(Hash.hash(this.underlinedStyleCharacteristic)),
      Hash.combine(Hash.hash(this.struckThroughStyleCharacteristic)),
      Hash.combine(Hash.hash(this.overlinedStyleCharacteristic)),
      Hash.combine(Hash.hash(this.inversedStyleCharacteristic)),
      Hash.combine(Hash.hash(this.hiddenStyleCharacteristic)),
      Hash.combine(Hash.hash(this.blinkingStyleCharacteristic)),
      Hash.combine(Hash.hash(this.foregroundColorStyleCharacteristic)),
      Hash.combine(Hash.hash(this.backgroundColorStyleCharacteristic)),
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
  ASOnOffOptionalStyleCharacteristic.equivalence(
    self.boldStyleCharacteristic,
    that.boldStyleCharacteristic,
  )
  && ASOnOffOptionalStyleCharacteristic.equivalence(
    self.dimStyleCharacteristic,
    that.dimStyleCharacteristic,
  )
  && ASOnOffOptionalStyleCharacteristic.equivalence(
    self.italicStyleCharacteristic,
    that.italicStyleCharacteristic,
  )
  && ASOnOffOptionalStyleCharacteristic.equivalence(
    self.underlinedStyleCharacteristic,
    that.underlinedStyleCharacteristic,
  )
  && ASOnOffOptionalStyleCharacteristic.equivalence(
    self.struckThroughStyleCharacteristic,
    that.struckThroughStyleCharacteristic,
  )
  && ASOnOffOptionalStyleCharacteristic.equivalence(
    self.overlinedStyleCharacteristic,
    that.overlinedStyleCharacteristic,
  )
  && ASOnOffOptionalStyleCharacteristic.equivalence(
    self.inversedStyleCharacteristic,
    that.inversedStyleCharacteristic,
  )
  && ASOnOffOptionalStyleCharacteristic.equivalence(
    self.hiddenStyleCharacteristic,
    that.hiddenStyleCharacteristic,
  )
  && ASOnOffOptionalStyleCharacteristic.equivalence(
    self.blinkingStyleCharacteristic,
    that.blinkingStyleCharacteristic,
  )
  && ASColorOptionalStyleCharacteristic.equivalence(
    self.foregroundColorStyleCharacteristic,
    that.foregroundColorStyleCharacteristic,
  )
  && ASColorOptionalStyleCharacteristic.equivalence(
    self.backgroundColorStyleCharacteristic,
    that.backgroundColorStyleCharacteristic,
  );

/**
 * Returns true if `self` has the bold style characteristic
 *
 * @category Predicates
 */
export const hasBold: Predicate.Predicate<Type> = (self) =>
  ASOnOffOptionalStyleCharacteristic.equivalence(
    self.boldStyleCharacteristic,
    ASBoldStyleCharacteristic.on,
  );

/**
 * Returns true if `self` has the not the bold style characteristic
 *
 * @category Predicates
 */
export const hasNotBold: Predicate.Predicate<Type> = (self) =>
  ASOnOffOptionalStyleCharacteristic.equivalence(
    self.boldStyleCharacteristic,
    ASBoldStyleCharacteristic.off,
  );

/**
 * Returns true if `self` has the dim style characteristic
 *
 * @category Predicates
 */
export const hasDim: Predicate.Predicate<Type> = (self) =>
  ASOnOffOptionalStyleCharacteristic.equivalence(
    self.dimStyleCharacteristic,
    ASDimStyleCharacteristic.on,
  );

/**
 * Returns true if `self` has the not the dim style characteristic
 *
 * @category Predicates
 */
export const hasNotDim: Predicate.Predicate<Type> = (self) =>
  ASOnOffOptionalStyleCharacteristic.equivalence(
    self.dimStyleCharacteristic,
    ASDimStyleCharacteristic.off,
  );

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
    ...(hasNotBold(self) && _hasNotDim ?
      ASOptionalStyleCharacteristic.toSequence(self.boldStyleCharacteristic)
      // Send notDim before bold otherwise bold will never take effect
    : _hasNotDim ?
      [
        ...ASOptionalStyleCharacteristic.toSequence(self.dimStyleCharacteristic),
        ...ASOptionalStyleCharacteristic.toSequence(self.boldStyleCharacteristic),
      ]
      // In case hasNotBold, send bold before dim otherwise dim will never take effect
    : [
        ...ASOptionalStyleCharacteristic.toSequence(self.boldStyleCharacteristic),
        ...ASOptionalStyleCharacteristic.toSequence(self.dimStyleCharacteristic),
      ]),
    ...ASOptionalStyleCharacteristic.toSequence(self.italicStyleCharacteristic),
    ...ASOptionalStyleCharacteristic.toSequence(self.underlinedStyleCharacteristic),
    ...ASOptionalStyleCharacteristic.toSequence(self.struckThroughStyleCharacteristic),
    ...ASOptionalStyleCharacteristic.toSequence(self.overlinedStyleCharacteristic),
    ...ASOptionalStyleCharacteristic.toSequence(self.inversedStyleCharacteristic),
    ...ASOptionalStyleCharacteristic.toSequence(self.hiddenStyleCharacteristic),
    ...ASOptionalStyleCharacteristic.toSequence(self.blinkingStyleCharacteristic),
    ...ASOptionalStyleCharacteristic.toSequence(self.foregroundColorStyleCharacteristic),
    ...ASOptionalStyleCharacteristic.toSequence(self.backgroundColorStyleCharacteristic),
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
      boldStyleCharacteristic: ASOptionalStyleCharacteristic.PresentOrElse(
        self.boldStyleCharacteristic,
        that.boldStyleCharacteristic,
      ),
      dimStyleCharacteristic: ASOptionalStyleCharacteristic.PresentOrElse(
        self.dimStyleCharacteristic,
        that.dimStyleCharacteristic,
      ),
      italicStyleCharacteristic: ASOptionalStyleCharacteristic.PresentOrElse(
        self.italicStyleCharacteristic,
        that.italicStyleCharacteristic,
      ),
      underlinedStyleCharacteristic: ASOptionalStyleCharacteristic.PresentOrElse(
        self.underlinedStyleCharacteristic,
        that.underlinedStyleCharacteristic,
      ),
      struckThroughStyleCharacteristic: ASOptionalStyleCharacteristic.PresentOrElse(
        self.struckThroughStyleCharacteristic,
        that.struckThroughStyleCharacteristic,
      ),
      overlinedStyleCharacteristic: ASOptionalStyleCharacteristic.PresentOrElse(
        self.overlinedStyleCharacteristic,
        that.overlinedStyleCharacteristic,
      ),
      inversedStyleCharacteristic: ASOptionalStyleCharacteristic.PresentOrElse(
        self.inversedStyleCharacteristic,
        that.inversedStyleCharacteristic,
      ),
      hiddenStyleCharacteristic: ASOptionalStyleCharacteristic.PresentOrElse(
        self.hiddenStyleCharacteristic,
        that.hiddenStyleCharacteristic,
      ),
      blinkingStyleCharacteristic: ASOptionalStyleCharacteristic.PresentOrElse(
        self.blinkingStyleCharacteristic,
        that.blinkingStyleCharacteristic,
      ),
      foregroundColorStyleCharacteristic: ASOptionalStyleCharacteristic.PresentOrElse(
        self.foregroundColorStyleCharacteristic,
        that.foregroundColorStyleCharacteristic,
      ),
      backgroundColorStyleCharacteristic: ASOptionalStyleCharacteristic.PresentOrElse(
        self.backgroundColorStyleCharacteristic,
        that.backgroundColorStyleCharacteristic,
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
      boldStyleCharacteristic: ASOptionalStyleCharacteristic.orWhenEquals(
        self.boldStyleCharacteristic,
        that.boldStyleCharacteristic,
        ASBoldStyleCharacteristic.missing,
      ),
      dimStyleCharacteristic: ASOptionalStyleCharacteristic.orWhenEquals(
        self.dimStyleCharacteristic,
        that.dimStyleCharacteristic,
        ASDimStyleCharacteristic.missing,
      ),
      italicStyleCharacteristic: ASOptionalStyleCharacteristic.orWhenEquals(
        self.italicStyleCharacteristic,
        that.italicStyleCharacteristic,
        ASItalicStyleCharacteristic.missing,
      ),
      underlinedStyleCharacteristic: ASOptionalStyleCharacteristic.orWhenEquals(
        self.underlinedStyleCharacteristic,
        that.underlinedStyleCharacteristic,
        ASUnderlinedStyleCharacteristic.missing,
      ),
      struckThroughStyleCharacteristic: ASOptionalStyleCharacteristic.orWhenEquals(
        self.struckThroughStyleCharacteristic,
        that.struckThroughStyleCharacteristic,
        ASStruckThroughStyleCharacteristic.missing,
      ),
      overlinedStyleCharacteristic: ASOptionalStyleCharacteristic.orWhenEquals(
        self.overlinedStyleCharacteristic,
        that.overlinedStyleCharacteristic,
        ASOverlinedStyleCharacteristic.missing,
      ),
      inversedStyleCharacteristic: ASOptionalStyleCharacteristic.orWhenEquals(
        self.inversedStyleCharacteristic,
        that.inversedStyleCharacteristic,
        ASInversedStyleCharacteristic.missing,
      ),
      hiddenStyleCharacteristic: ASOptionalStyleCharacteristic.orWhenEquals(
        self.hiddenStyleCharacteristic,
        that.hiddenStyleCharacteristic,
        ASHiddenStyleCharacteristic.missing,
      ),
      blinkingStyleCharacteristic: ASOptionalStyleCharacteristic.orWhenEquals(
        self.blinkingStyleCharacteristic,
        that.blinkingStyleCharacteristic,
        ASBlinkingStyleCharacteristic.missing,
      ),
      foregroundColorStyleCharacteristic: ASOptionalStyleCharacteristic.orWhenEquals(
        self.foregroundColorStyleCharacteristic,
        that.foregroundColorStyleCharacteristic,
        ASForegroundColorStyleCharacteristic.missing,
      ),
      backgroundColorStyleCharacteristic: ASOptionalStyleCharacteristic.orWhenEquals(
        self.backgroundColorStyleCharacteristic,
        that.backgroundColorStyleCharacteristic,
        ASBackgroundColorStyleCharacteristic.missing,
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
        Type.make(
          pipe(target, MStruct.set({ boldStyleCharacteristic: ASBoldStyleCharacteristic.on })),
        )
      : hasDim(self) && hasNotBold(target) ?
        Type.make(
          pipe(target, MStruct.set({ dimStyleCharacteristic: ASDimStyleCharacteristic.on })),
        )
      : target
    );
  };

/**
 * Empty StyleCharacteristics
 *
 * @category Instances
 */
export const none: Type = Type.make({
  boldStyleCharacteristic: ASBoldStyleCharacteristic.missing,
  dimStyleCharacteristic: ASDimStyleCharacteristic.missing,
  italicStyleCharacteristic: ASItalicStyleCharacteristic.missing,
  underlinedStyleCharacteristic: ASUnderlinedStyleCharacteristic.missing,
  struckThroughStyleCharacteristic: ASStruckThroughStyleCharacteristic.missing,
  overlinedStyleCharacteristic: ASOverlinedStyleCharacteristic.missing,
  inversedStyleCharacteristic: ASInversedStyleCharacteristic.missing,
  hiddenStyleCharacteristic: ASHiddenStyleCharacteristic.missing,
  blinkingStyleCharacteristic: ASBlinkingStyleCharacteristic.missing,
  foregroundColorStyleCharacteristic: ASForegroundColorStyleCharacteristic.missing,
  backgroundColorStyleCharacteristic: ASBackgroundColorStyleCharacteristic.missing,
});

/**
 * Default StyleCharacteristics
 *
 * @category Instances
 */
export const defaults: Type = Type.make({
  boldStyleCharacteristic: ASBoldStyleCharacteristic.off,
  dimStyleCharacteristic: ASDimStyleCharacteristic.off,
  italicStyleCharacteristic: ASItalicStyleCharacteristic.off,
  underlinedStyleCharacteristic: ASUnderlinedStyleCharacteristic.off,
  struckThroughStyleCharacteristic: ASStruckThroughStyleCharacteristic.off,
  overlinedStyleCharacteristic: ASOverlinedStyleCharacteristic.off,
  inversedStyleCharacteristic: ASInversedStyleCharacteristic.off,
  hiddenStyleCharacteristic: ASHiddenStyleCharacteristic.off,
  blinkingStyleCharacteristic: ASBlinkingStyleCharacteristic.off,
  foregroundColorStyleCharacteristic: ASForegroundColorStyleCharacteristic.defaultColor,
  backgroundColorStyleCharacteristic: ASBackgroundColorStyleCharacteristic.defaultColor,
});

/**
 * Bold StyleCharacteristics instance
 *
 * @category Instances
 */
export const bold: Type = Type.make(
  pipe(none, MStruct.set({ boldStyleCharacteristic: ASBoldStyleCharacteristic.on })),
);

/**
 * NotBold StyleCharacteristics instance
 *
 * @category Instances
 */
export const notBold: Type = Type.make(
  pipe(none, MStruct.set({ boldStyleCharacteristic: ASBoldStyleCharacteristic.off })),
);

/**
 * Dim StyleCharacteristics instance
 *
 * @category Instances
 */
export const dim: Type = Type.make(
  pipe(none, MStruct.set({ dimStyleCharacteristic: ASDimStyleCharacteristic.on })),
);

/**
 * NotDim StyleCharacteristics instance
 *
 * @category Instances
 */
export const notDim: Type = Type.make(
  pipe(none, MStruct.set({ dimStyleCharacteristic: ASDimStyleCharacteristic.off })),
);

/**
 * Italic StyleCharacteristics instance
 *
 * @category Instances
 */
export const italic: Type = Type.make(
  pipe(none, MStruct.set({ italicStyleCharacteristic: ASItalicStyleCharacteristic.on })),
);

/**
 * NotItalic StyleCharacteristics instance
 *
 * @category Instances
 */
export const notItalic: Type = Type.make(
  pipe(none, MStruct.set({ italicStyleCharacteristic: ASItalicStyleCharacteristic.off })),
);

/**
 * Underlined StyleCharacteristics instance
 *
 * @category Instances
 */
export const underlined: Type = Type.make(
  pipe(none, MStruct.set({ underlinedStyleCharacteristic: ASUnderlinedStyleCharacteristic.on })),
);

/**
 * NotUnderlined StyleCharacteristics instance
 *
 * @category Instances
 */
export const notUnderlined: Type = Type.make(
  pipe(none, MStruct.set({ underlinedStyleCharacteristic: ASUnderlinedStyleCharacteristic.off })),
);

/**
 * StruckThrough StyleCharacteristics instance
 *
 * @category Instances
 */
export const struckThrough: Type = Type.make(
  pipe(
    none,
    MStruct.set({ struckThroughStyleCharacteristic: ASStruckThroughStyleCharacteristic.on }),
  ),
);

/**
 * NotStruckThrough StyleCharacteristics instance
 *
 * @category Instances
 */
export const notStruckThrough: Type = Type.make(
  pipe(
    none,
    MStruct.set({ struckThroughStyleCharacteristic: ASStruckThroughStyleCharacteristic.off }),
  ),
);

/**
 * Overlined StyleCharacteristics instance
 *
 * @category Instances
 */
export const overlined: Type = Type.make(
  pipe(none, MStruct.set({ overlinedStyleCharacteristic: ASOverlinedStyleCharacteristic.on })),
);

/**
 * NotOverlined StyleCharacteristics instance
 *
 * @category Instances
 */
export const notOverlined: Type = Type.make(
  pipe(none, MStruct.set({ overlinedStyleCharacteristic: ASOverlinedStyleCharacteristic.off })),
);

/**
 * Inversed StyleCharacteristics instance
 *
 * @category Instances
 */
export const inversed: Type = Type.make(
  pipe(none, MStruct.set({ inversedStyleCharacteristic: ASInversedStyleCharacteristic.on })),
);

/**
 * NotInversed StyleCharacteristics instance
 *
 * @category Instances
 */
export const notInversed: Type = Type.make(
  pipe(none, MStruct.set({ inversedStyleCharacteristic: ASInversedStyleCharacteristic.off })),
);

/**
 * Hidden StyleCharacteristics instance
 *
 * @category Instances
 */
export const hidden: Type = Type.make(
  pipe(none, MStruct.set({ hiddenStyleCharacteristic: ASHiddenStyleCharacteristic.on })),
);

/**
 * NotHidden StyleCharacteristics instance
 *
 * @category Instances
 */
export const notHidden: Type = Type.make(
  pipe(none, MStruct.set({ hiddenStyleCharacteristic: ASHiddenStyleCharacteristic.off })),
);

/**
 * Blinking StyleCharacteristics instance
 *
 * @category Instances
 */
export const blinking: Type = Type.make(
  pipe(none, MStruct.set({ blinkingStyleCharacteristic: ASBlinkingStyleCharacteristic.on })),
);

/**
 * NotBlinking StyleCharacteristics instance
 *
 * @category Instances
 */
export const notBlinking: Type = Type.make(
  pipe(none, MStruct.set({ blinkingStyleCharacteristic: ASBlinkingStyleCharacteristic.off })),
);

/**
 * Default foreground color StyleCharacteristics instance
 *
 * @category Instances
 */
export const foregroundDefaultColor: Type = Type.make(
  pipe(
    none,
    MStruct.set({
      foregroundColorStyleCharacteristic: ASForegroundColorStyleCharacteristic.defaultColor,
    }),
  ),
);

/**
 * Builds a StyleCharacteristics that applies `color` as foreground color
 *
 * @category Constructors
 */
export const fromColorAsForegroundColor = (color: AsColor.Type): Type =>
  Type.make(
    pipe(
      none,
      MStruct.set({
        foregroundColorStyleCharacteristic: ASForegroundColorStyleCharacteristic.fromColor(color),
      }),
    ),
  );

/**
 * Original black color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const black: Type = fromColorAsForegroundColor(ASThreeBitColor.black);

/**
 * Original red color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const red: Type = fromColorAsForegroundColor(ASThreeBitColor.red);

/**
 * Original green color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const green: Type = fromColorAsForegroundColor(ASThreeBitColor.green);

/**
 * Original yellow color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const yellow: Type = fromColorAsForegroundColor(ASThreeBitColor.yellow);

/**
 * Original blue color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const blue: Type = fromColorAsForegroundColor(ASThreeBitColor.blue);

/**
 * Original magenta color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const magenta: Type = fromColorAsForegroundColor(ASThreeBitColor.magenta);

/**
 * Original cyan color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const cyan: Type = fromColorAsForegroundColor(ASThreeBitColor.cyan);

/**
 * Original white color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const white: Type = fromColorAsForegroundColor(ASThreeBitColor.white);
/**
 * Original bright black color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const brightBlack: Type = fromColorAsForegroundColor(ASThreeBitColor.brightBlack);

/**
 * Original bright red color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const brightRed: Type = fromColorAsForegroundColor(ASThreeBitColor.brightRed);

/**
 * Original bright green color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const brightGreen: Type = fromColorAsForegroundColor(ASThreeBitColor.brightGreen);

/**
 * Original bright yellow color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const brightYellow: Type = fromColorAsForegroundColor(ASThreeBitColor.brightYellow);

/**
 * Original bright blue color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const brightBlue: Type = fromColorAsForegroundColor(ASThreeBitColor.brightBlue);

/**
 * Original bright magenta color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const brightMagenta: Type = fromColorAsForegroundColor(ASThreeBitColor.brightMagenta);

/**
 * Original bright cyan color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const brightCyan: Type = fromColorAsForegroundColor(ASThreeBitColor.brightCyan);

/**
 * Original bright white color StyleCharacteristics instance
 *
 * @category Original instances
 */
export const brightWhite: Type = fromColorAsForegroundColor(ASThreeBitColor.brightWhite);

/**
 * Default background color StyleCharacteristics
 *
 * @category Instances
 */
export const backgroundDefaultColor: Type = Type.make(
  pipe(
    none,
    MStruct.set({
      backgroundColorStyleCharacteristic: ASBackgroundColorStyleCharacteristic.defaultColor,
    }),
  ),
);

/**
 * Builds a StyleCharacteristics that applies `color` as background color
 *
 * @category Constructors
 */
export const fromColorAsBackgroundColor = (color: AsColor.Type): Type =>
  Type.make(
    pipe(
      none,
      MStruct.set({
        backgroundColorStyleCharacteristic: ASBackgroundColorStyleCharacteristic.fromColor(color),
      }),
    ),
  );

/**
 * Original black color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBlack: Type = fromColorAsBackgroundColor(ASThreeBitColor.black);

/**
 * Original red color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgRed: Type = fromColorAsBackgroundColor(ASThreeBitColor.red);

/**
 * Original green color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgGreen: Type = fromColorAsBackgroundColor(ASThreeBitColor.green);

/**
 * Original yellow color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgYellow: Type = fromColorAsBackgroundColor(ASThreeBitColor.yellow);

/**
 * Original blue color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBlue: Type = fromColorAsBackgroundColor(ASThreeBitColor.blue);

/**
 * Original magenta color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgMagenta: Type = fromColorAsBackgroundColor(ASThreeBitColor.magenta);

/**
 * Original cyan color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgCyan: Type = fromColorAsBackgroundColor(ASThreeBitColor.cyan);

/**
 * Original white color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgWhite: Type = fromColorAsBackgroundColor(ASThreeBitColor.white);

/**
 * Original bright black color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBrightBlack: Type = fromColorAsBackgroundColor(ASThreeBitColor.brightBlack);

/**
 * Original bright red color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBrightRed: Type = fromColorAsBackgroundColor(ASThreeBitColor.brightRed);

/**
 * Original bright green color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBrightGreen: Type = fromColorAsBackgroundColor(ASThreeBitColor.brightGreen);

/**
 * Original bright yellow color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBrightYellow: Type = fromColorAsBackgroundColor(ASThreeBitColor.brightYellow);

/**
 * Original bright blue color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBrightBlue: Type = fromColorAsBackgroundColor(ASThreeBitColor.brightBlue);

/**
 * Original bright magenta color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBrightMagenta: Type = fromColorAsBackgroundColor(ASThreeBitColor.brightMagenta);

/**
 * Original bright cyan color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBrightCyan: Type = fromColorAsBackgroundColor(ASThreeBitColor.brightCyan);

/**
 * Original bright white color StyleCharacteristics instance as background color
 *
 * @category Original instances
 */
export const bgBrightWhite: Type = fromColorAsBackgroundColor(ASThreeBitColor.brightWhite);
