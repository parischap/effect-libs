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

import {
  MDataBase,
  MDataEquivalenceBasedEquality,
  MString,
  MStruct,
  MTypes,
} from '@parischap/effect-lib';
import {
  Array,
  Equivalence,
  flow,
  Function,
  Hash,
  Number,
  Option,
  pipe,
  Predicate,
  Struct,
} from 'effect';
import * as ASAnsiCode from './AnsiCode.js';
import * as ASColorAll from './Color/All.js';
import { ASSequence } from './index.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/StyleCharacteristics/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

const _falseSome = Option.some(false);
const _trueSome = Option.some(true);

/**
 * Namespace of an optional color style characteristic
 *
 * @category Models
 */
namespace ColorOption {
  /**
   * Type of a ColorOption. In the innermost option, `none` means `default terminal color`
   *
   * @category Models
   */
  export type Type = OptionalCharacteristic.Type<Option.Option<ASColorAll.Type>>;

  /**
   * Equivalence
   *
   * @category Equivalences
   */
  export const equivalence = OptionalCharacteristic.getEquivalence(
    Option.getEquivalence(ASColorAll.equivalence),
  );

  /**
   * Returns a function that stringifies `self`
   *
   * @category Destructors
   */
  export const getToString = (prefix: string): MTypes.OneArgFunction<Type, string> =>
    OptionalCharacteristic.getToString(
      flow(
        Option.match({
          onNone: Function.constant('DefaultColor'),
          onSome: ASColorAll.toString,
        }),
        MString.prepend(prefix),
      ),
    );

  /**
   * Returns a function that returns the sequence of `self`
   *
   * @category Destructors
   */
  export const getToSequence = (
    offset: number,
  ): MTypes.OneArgFunction<Type, ASAnsiCode.ASSequence.Type> =>
    OptionalCharacteristic.getToSequence(
      flow(
        Option.match({
          onNone: pipe(39, Array.of, Function.constant),
          onSome: ASColorAll.toSequence,
        }),
        Array.modifyNonEmptyHead(Number.sum(offset)),
      ),
    );

  /**
   * Builds a new ColorOption by merging `self` and `that`. In case of conflict, `self` will
   * prevail.
   *
   * @category Utils
   */
  export const {
    mergeUnder,
  }: { readonly mergeUnder: MTypes.OneArgFunction<Type, MTypes.OneArgFunction<Type, Type>> } =
    OptionalCharacteristic;

  /**
   * Builds a new ColorOption by substracting `that` from `self`. `that` can be substracted from
   * `self` only if it is equal to `self`.
   *
   * @category Utils
   */
  export const difference: MTypes.OneArgFunction<
    Type,
    MTypes.OneArgFunction<Type, Type>
  > = OptionalCharacteristic.difference(equivalence);
}

/**
 * Type of a StyleCharacteristics
 *
 * @category Models
 */
export class Type extends MDataEquivalenceBasedEquality.Type<_TypeId> {
  /** BoldState of this style */
  readonly boldState: ASStyleCharacteristicOptionalTwoValue.Type.Type;

  /** DimState of this style */
  readonly dimState: ASStyleCharacteristicOptionalTwoValue.Type.Type;

  /** ItalicState of this style */
  readonly italicState: ASStyleCharacteristicOptionalTwoValue.Type.Type;

  /** UnderlinedState of this style */
  readonly underlinedState: ASStyleCharacteristicOptionalTwoValue.Type.Type;

  /** StruckThroughState of this style */
  readonly struckThroughState: ASStyleCharacteristicOptionalTwoValue.Type.Type;

  /** OverlinedState of this style */
  readonly overlinedState: ASStyleCharacteristicOptionalTwoValue.Type.Type;

  /** InversedState of this style */
  readonly inversedState: ASStyleCharacteristicOptionalTwoValue.Type.Type;

  /** HiddenState of this style */
  readonly hiddenState: ASStyleCharacteristicOptionalTwoValue.Type.Type;

  /** BlinkingState of this style */
  readonly blinkingState: ASStyleCharacteristicOptionalTwoValue.Type.Type;

  /** Foreground color of this style. */
  readonly fgColor: ColorOption.Type;

  /** Background color of this style. */
  readonly bgColor: ColorOption.Type;

  /** Class constructor */
  private constructor({
    boldState,
    dimState,
    italicState,
    underlinedState,
    struckThroughState,
    overlinedState,
    inversedState,
    hiddenState,
    blinkingState,
    fgColor,
    bgColor,
  }: MTypes.Data<Type>) {
    super();
    this.boldState = boldState;
    this.dimState = dimState;
    this.italicState = italicState;
    this.underlinedState = underlinedState;
    this.struckThroughState = struckThroughState;
    this.overlinedState = overlinedState;
    this.inversedState = inversedState;
    this.hiddenState = hiddenState;
    this.blinkingState = blinkingState;
    this.fgColor = fgColor;
    this.bgColor = bgColor;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Returns the `id` of `this` */
  protected [MDataBase.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      const result =
        _boldStateId(this.boldState)
        + _dimStateId(this.dimState)
        + _italicStateId(this.italicState)
        + _underlinedStateId(this.underlinedState)
        + _struckThroughStateId(this.struckThroughState)
        + _overlinedStateId(this.overlinedState)
        + _inversedStateId(this.inversedState)
        + _hiddenStateId(this.hiddenState)
        + _blinkingStateId(this.blinkingState)
        + _fgColorId(this.fgColor)
        + _bgColorId(this.bgColor);
      return result === '' ? 'NoStyle' : result;
    };
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return 0;
  }

  /** Function that implements the equivalence of `this` and `that` */
  protected [MDataEquivalenceBasedEquality.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
  }

  /** Returns the TypeMarker of the class */
  protected get [MDataBase.typeMarkerSymbol](): _TypeId {
    return _TypeId;
  }
}

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  ASStyleCharacteristicOptionalTwoValue.Type.equivalence(self.boldState, that.boldState)
  && ASStyleCharacteristicOptionalTwoValue.Type.equivalence(self.dimState, that.dimState)
  && ASStyleCharacteristicOptionalTwoValue.Type.equivalence(self.italicState, that.italicState)
  && ASStyleCharacteristicOptionalTwoValue.Type.equivalence(
    self.underlinedState,
    that.underlinedState,
  )
  && ASStyleCharacteristicOptionalTwoValue.Type.equivalence(
    self.struckThroughState,
    that.struckThroughState,
  )
  && ASStyleCharacteristicOptionalTwoValue.Type.equivalence(
    self.overlinedState,
    that.overlinedState,
  )
  && ASStyleCharacteristicOptionalTwoValue.Type.equivalence(self.inversedState, that.inversedState)
  && ASStyleCharacteristicOptionalTwoValue.Type.equivalence(self.hiddenState, that.hiddenState)
  && ASStyleCharacteristicOptionalTwoValue.Type.equivalence(self.blinkingState, that.blinkingState)
  && ColorOption.equivalence(self.fgColor, that.fgColor)
  && ColorOption.equivalence(self.bgColor, that.bgColor);

/**
 * Returns the `boldState` property of `self`
 *
 * @category Destructors
 */
export const boldState: MTypes.OneArgFunction<
  Type,
  ASStyleCharacteristicOptionalTwoValue.Type.Type
> = Struct.get('boldState');

/**
 * Returns the `dimState` property of `self`
 *
 * @category Destructors
 */
export const dimState: MTypes.OneArgFunction<
  Type,
  ASStyleCharacteristicOptionalTwoValue.Type.Type
> = Struct.get('dimState');

/**
 * Returns the `italicState` property of `self`
 *
 * @category Destructors
 */
export const italicState: MTypes.OneArgFunction<
  Type,
  ASStyleCharacteristicOptionalTwoValue.Type.Type
> = Struct.get('italicState');

/**
 * Returns the `underlinedState` property of `self`
 *
 * @category Destructors
 */
export const underlinedState: MTypes.OneArgFunction<
  Type,
  ASStyleCharacteristicOptionalTwoValue.Type.Type
> = Struct.get('underlinedState');

/**
 * Returns the `struckThroughState` property of `self`
 *
 * @category Destructors
 */
export const struckThroughState: MTypes.OneArgFunction<
  Type,
  ASStyleCharacteristicOptionalTwoValue.Type.Type
> = Struct.get('struckThroughState');

/**
 * Returns the `overlinedState` property of `self`
 *
 * @category Destructors
 */
export const overlinedState: MTypes.OneArgFunction<
  Type,
  ASStyleCharacteristicOptionalTwoValue.Type.Type
> = Struct.get('overlinedState');

/**
 * Returns the `inversedState` property of `self`
 *
 * @category Destructors
 */
export const inversedState: MTypes.OneArgFunction<
  Type,
  ASStyleCharacteristicOptionalTwoValue.Type.Type
> = Struct.get('inversedState');

/**
 * Returns the `hiddenState` property of `self`
 *
 * @category Destructors
 */
export const hiddenState: MTypes.OneArgFunction<
  Type,
  ASStyleCharacteristicOptionalTwoValue.Type.Type
> = Struct.get('hiddenState');

/**
 * Returns the `blinkingState` property of `self`
 *
 * @category Destructors
 */
export const blinkingState: MTypes.OneArgFunction<
  Type,
  ASStyleCharacteristicOptionalTwoValue.Type.Type
> = Struct.get('blinkingState');

/**
 * Returns the `fgColor` property of `self`
 *
 * @category Destructors
 */
export const fgColor: MTypes.OneArgFunction<Type, ColorOption.Type> = Struct.get('fgColor');

/**
 * Returns the `bgColor` property of `self`
 *
 * @category Destructors
 */
export const bgColor: MTypes.OneArgFunction<Type, ColorOption.Type> = Struct.get('bgColor');

/**
 * Returns true if `self` has the bold state
 *
 * @category Predicates
 */
export const hasBold: Predicate.Predicate<Type> = (self) =>
  ASStyleCharacteristicOptionalTwoValue.Type.equivalence(self.boldState, _trueSome);

/**
 * Returns true if `self` has the notBold state
 *
 * @category Predicates
 */
export const hasNotBold: Predicate.Predicate<Type> = (self) =>
  ASStyleCharacteristicOptionalTwoValue.Type.equivalence(self.boldState, _falseSome);

/**
 * Returns true if `self` has the dim state
 *
 * @category Predicates
 */
export const hasDim: Predicate.Predicate<Type> = (self) =>
  ASStyleCharacteristicOptionalTwoValue.Type.equivalence(self.dimState, _trueSome);

/**
 * Returns true if `self` has the notDim state
 *
 * @category Predicates
 */
export const hasNotDim: Predicate.Predicate<Type> = (self) =>
  ASStyleCharacteristicOptionalTwoValue.Type.equivalence(self.dimState, _falseSome);

const _boldStateId = ASStyleCharacteristicOptionalTwoValue.Type.getToString(
  Function.constant('NotBold'),
  Function.constant('Bold'),
);
const _dimStateId = ASStyleCharacteristicOptionalTwoValue.Type.getToString(
  Function.constant('NotDim'),
  Function.constant('Dim'),
);
const _italicStateId = ASStyleCharacteristicOptionalTwoValue.Type.getToString(
  Function.constant('NotItalic'),
  Function.constant('Italic'),
);
const _underlinedStateId = ASStyleCharacteristicOptionalTwoValue.Type.getToString(
  Function.constant('NotUnderlined'),
  Function.constant('Underlined'),
);
const _struckThroughStateId = ASStyleCharacteristicOptionalTwoValue.Type.getToString(
  Function.constant('NotStruckThrough'),
  Function.constant('StruckThrough'),
);
const _overlinedStateId = ASStyleCharacteristicOptionalTwoValue.Type.getToString(
  Function.constant('NotOverlined'),
  Function.constant('Overlined'),
);
const _inversedStateId = ASStyleCharacteristicOptionalTwoValue.Type.getToString(
  Function.constant('NotInversed'),
  Function.constant('Inversed'),
);
const _hiddenStateId = ASStyleCharacteristicOptionalTwoValue.Type.getToString(
  Function.constant('NotHidden'),
  Function.constant('Hidden'),
);
const _blinkingStateId = ASStyleCharacteristicOptionalTwoValue.Type.getToString(
  Function.constant('NotBlinking'),
  Function.constant('Blinking'),
);
const _fgColorId = ColorOption.getToString('');
const _bgColorId = ColorOption.getToString('In');

/**
 * Returns the id of `self`
 *
 * @category Destructors
 */
export const toString = (self: Type): string => self.toString();

const _boldStateToSequence = ASStyleCharacteristicOptionalTwoValue.Type.getToSequence(
  ASSequence.notBoldNotDim,
  1,
);
const _dimStateToSequence = ASStyleCharacteristicOptionalTwoValue.Type.getToSequence(22, 2);
const _italicStateToSequence = ASStyleCharacteristicOptionalTwoValue.Type.getToSequence(23, 3);
const _underlinedStateToSequence = ASStyleCharacteristicOptionalTwoValue.Type.getToSequence(24, 4);
const _blinkingStateToSequence = ASStyleCharacteristicOptionalTwoValue.Type.getToSequence(25, 5);
const _inversedStateToSequence = ASStyleCharacteristicOptionalTwoValue.Type.getToSequence(27, 7);
const _hiddenStateToSequence = ASStyleCharacteristicOptionalTwoValue.Type.getToSequence(28, 8);
const _struckThroughStateToSequence = ASStyleCharacteristicOptionalTwoValue.Type.getToSequence(
  29,
  9,
);
const _overlinedStateToSequence = ASStyleCharacteristicOptionalTwoValue.Type.getToSequence(55, 53);

const _fgColorToSequence = ColorOption.getToSequence(0);
const _bgColorToSequence = ColorOption.getToSequence(10);

/**
 * Returns the sequence corresponding to `self`
 *
 * @category Destructors
 */
export const toSequence = (self: Type): ASAnsiCode.ASSequence.Type => {
  const isNotDimPresent = hasNotDim(self);
  return pipe(
    // Useless to send both notBold and notDim because they have the same value
    hasNotBold(self) && isNotDimPresent ? Array.of(_boldStateToSequence(self.boldState))
      // Send notDim before bold otherwise bold will never take effect
    : isNotDimPresent ?
      Array.make(_dimStateToSequence(self.dimState), _boldStateToSequence(self.boldState))
    : Array.make(_boldStateToSequence(self.boldState), _dimStateToSequence(self.dimState)),
    Array.appendAll(
      Array.make(
        _italicStateToSequence(self.italicState),
        _underlinedStateToSequence(self.underlinedState),
        _struckThroughStateToSequence(self.struckThroughState),
        _overlinedStateToSequence(self.overlinedState),
        _inversedStateToSequence(self.inversedState),
        _hiddenStateToSequence(self.hiddenState),
        _blinkingStateToSequence(self.blinkingState),
        _fgColorToSequence(self.fgColor),
        _bgColorToSequence(self.bgColor),
      ),
    ),
    Array.flatten,
  );
};

/**
 * Returns the ANSI string corresponding to `self`
 *
 * @category Destructors
 */
export const toAnsiCode: MTypes.OneArgFunction<Type, ASAnsiCode.Type> = flow(
  toSequence,
  ASAnsiCode.fromSequence,
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
      boldState: pipe(
        self.boldState,
        ASStyleCharacteristicOptionalTwoValue.Type.mergeUnder(that.boldState),
      ),
      dimState: pipe(
        self.dimState,
        ASStyleCharacteristicOptionalTwoValue.Type.mergeUnder(that.dimState),
      ),
      italicState: pipe(
        self.italicState,
        ASStyleCharacteristicOptionalTwoValue.Type.mergeUnder(that.italicState),
      ),
      underlinedState: pipe(
        self.underlinedState,
        ASStyleCharacteristicOptionalTwoValue.Type.mergeUnder(that.underlinedState),
      ),
      struckThroughState: pipe(
        self.struckThroughState,
        ASStyleCharacteristicOptionalTwoValue.Type.mergeUnder(that.struckThroughState),
      ),
      overlinedState: pipe(
        self.overlinedState,
        ASStyleCharacteristicOptionalTwoValue.Type.mergeUnder(that.overlinedState),
      ),
      inversedState: pipe(
        self.inversedState,
        ASStyleCharacteristicOptionalTwoValue.Type.mergeUnder(that.inversedState),
      ),
      hiddenState: pipe(
        self.hiddenState,
        ASStyleCharacteristicOptionalTwoValue.Type.mergeUnder(that.hiddenState),
      ),
      blinkingState: pipe(
        self.blinkingState,
        ASStyleCharacteristicOptionalTwoValue.Type.mergeUnder(that.blinkingState),
      ),
      fgColor: pipe(self.fgColor, ColorOption.mergeUnder(that.fgColor)),
      bgColor: pipe(self.bgColor, ColorOption.mergeUnder(that.bgColor)),
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
    mergeUnder(self)(that);

/**
 * Builds a new StyleCharacteristics by removing from `self` the StyleCharacteristic's of `that`.
 *
 * @category Utils
 */
export const difference =
  (that: Type) =>
  (self: Type): Type =>
    Type.make({
      boldState: pipe(
        self.boldState,
        ASStyleCharacteristicOptionalTwoValue.Type.difference(that.boldState),
      ),
      dimState: pipe(
        self.dimState,
        ASStyleCharacteristicOptionalTwoValue.Type.difference(that.dimState),
      ),
      italicState: pipe(
        self.italicState,
        ASStyleCharacteristicOptionalTwoValue.Type.difference(that.italicState),
      ),
      underlinedState: pipe(
        self.underlinedState,
        ASStyleCharacteristicOptionalTwoValue.Type.difference(that.underlinedState),
      ),
      struckThroughState: pipe(
        self.struckThroughState,
        ASStyleCharacteristicOptionalTwoValue.Type.difference(that.struckThroughState),
      ),
      overlinedState: pipe(
        self.overlinedState,
        ASStyleCharacteristicOptionalTwoValue.Type.difference(that.overlinedState),
      ),
      inversedState: pipe(
        self.inversedState,
        ASStyleCharacteristicOptionalTwoValue.Type.difference(that.inversedState),
      ),
      hiddenState: pipe(
        self.hiddenState,
        ASStyleCharacteristicOptionalTwoValue.Type.difference(that.hiddenState),
      ),
      blinkingState: pipe(
        self.blinkingState,
        ASStyleCharacteristicOptionalTwoValue.Type.difference(that.blinkingState),
      ),
      fgColor: pipe(self.fgColor, ColorOption.difference(that.fgColor)),
      bgColor: pipe(self.bgColor, ColorOption.difference(that.bgColor)),
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
        Type.make(pipe(target, MStruct.set({ boldState: _trueSome })))
      : hasDim(self) && hasNotBold(target) ?
        Type.make(pipe(target, MStruct.set({ dimState: _trueSome })))
      : target
    );
  };

/**
 * Empty StyleCharacteristics
 *
 * @category Instances
 */
export const none: Type = Type.make({
  boldState: Option.none(),
  dimState: Option.none(),
  italicState: Option.none(),
  underlinedState: Option.none(),
  struckThroughState: Option.none(),
  overlinedState: Option.none(),
  inversedState: Option.none(),
  hiddenState: Option.none(),
  blinkingState: Option.none(),
  fgColor: Option.none(),
  bgColor: Option.none(),
});

/**
 * Default StyleCharacteristics
 *
 * @category Instances
 */
export const defaults: Type = Type.make({
  boldState: _falseSome,
  dimState: _falseSome,
  italicState: _falseSome,
  underlinedState: _falseSome,
  struckThroughState: _falseSome,
  overlinedState: _falseSome,
  inversedState: _falseSome,
  hiddenState: _falseSome,
  blinkingState: _falseSome,
  fgColor: Option.some(Option.none()),
  bgColor: Option.some(Option.none()),
});

/**
 * Bold StyleCharacteristics
 *
 * @category Instances
 */
export const bold: Type = Type.make(pipe(none, MStruct.set({ boldState: _trueSome })));

/**
 * NotBold StyleCharacteristics
 *
 * @category Instances
 */
export const notBold: Type = Type.make(pipe(none, MStruct.set({ boldState: _falseSome })));

/**
 * Dim StyleCharacteristics
 *
 * @category Instances
 */
export const dim: Type = Type.make(pipe(none, MStruct.set({ dimState: _trueSome })));

/**
 * NotDim StyleCharacteristics
 *
 * @category Instances
 */
export const notDim: Type = Type.make(pipe(none, MStruct.set({ dimState: _falseSome })));

/**
 * Italic StyleCharacteristics
 *
 * @category Instances
 */
export const italic: Type = Type.make(pipe(none, MStruct.set({ italicState: _trueSome })));

/**
 * NotItalic StyleCharacteristics
 *
 * @category Instances
 */
export const notItalic: Type = Type.make(pipe(none, MStruct.set({ italicState: _falseSome })));

/**
 * Underlined StyleCharacteristics
 *
 * @category Instances
 */
export const underlined: Type = Type.make(pipe(none, MStruct.set({ underlinedState: _trueSome })));

/**
 * NotUnderlined StyleCharacteristics
 *
 * @category Instances
 */
export const notUnderlined: Type = Type.make(
  pipe(none, MStruct.set({ underlinedState: _falseSome })),
);

/**
 * StruckThrough StyleCharacteristics
 *
 * @category Instances
 */
export const struckThrough: Type = Type.make(
  pipe(none, MStruct.set({ struckThroughState: _trueSome })),
);

/**
 * NotStruckThrough StyleCharacteristics
 *
 * @category Instances
 */
export const notStruckThrough: Type = Type.make(
  pipe(none, MStruct.set({ struckThroughState: _falseSome })),
);

/**
 * Overlined StyleCharacteristics
 *
 * @category Instances
 */
export const overlined: Type = Type.make(pipe(none, MStruct.set({ overlinedState: _trueSome })));

/**
 * NotOverlined StyleCharacteristics
 *
 * @category Instances
 */
export const notOverlined: Type = Type.make(
  pipe(none, MStruct.set({ overlinedState: _falseSome })),
);

/**
 * Inversed StyleCharacteristics
 *
 * @category Instances
 */
export const inversed: Type = Type.make(pipe(none, MStruct.set({ inversedState: _trueSome })));

/**
 * NotInversed StyleCharacteristics
 *
 * @category Instances
 */
export const notInversed: Type = Type.make(pipe(none, MStruct.set({ inversedState: _falseSome })));

/**
 * Hidden StyleCharacteristics
 *
 * @category Instances
 */
export const hidden: Type = Type.make(pipe(none, MStruct.set({ hiddenState: _trueSome })));

/**
 * NotHidden StyleCharacteristics
 *
 * @category Instances
 */
export const notHidden: Type = Type.make(pipe(none, MStruct.set({ hiddenState: _falseSome })));

/**
 * Blinking StyleCharacteristics
 *
 * @category Instances
 */
export const blinking: Type = Type.make(pipe(none, MStruct.set({ blinkingState: _trueSome })));

/**
 * NotBlinking StyleCharacteristics
 *
 * @category Instances
 */
export const notBlinking: Type = Type.make(pipe(none, MStruct.set({ blinkingState: _falseSome })));

/**
 * Default foreground color StyleCharacteristics
 *
 * @category Instances
 */
export const fgDefaultColor: Type = Type.make(
  pipe(none, MStruct.set({ fgColor: Option.some(Option.none()) })),
);

/**
 * Builds a StyleCharacteristics that applies `color` as foreground color
 *
 * @category Constructors
 */
export const fromColorAsForegroundColor = (color: ASColorAll.Type): Type =>
  Type.make(pipe(none, MStruct.set({ fgColor: Option.some(Option.some(color)) })));

/**
 * Default foreground color StyleCharacteristics
 *
 * @category Instances
 */
export const bgDefaultColor: Type = Type.make(
  pipe(none, MStruct.set({ bgColor: Option.some(Option.none()) })),
);

/**
 * Builds a StyleCharacteristics that applies `color` as background color
 *
 * @category Constructors
 */
export const fromColorAsBackgroundColor = (color: ASColorAll.Type): Type =>
  Type.make(pipe(none, MStruct.set({ bgColor: Option.some(Option.some(color)) })));
