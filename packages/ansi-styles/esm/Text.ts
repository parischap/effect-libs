/**
 * This module implements a styled text, i.e. an array of UniStyled where a UniStyled is a string
 * formatted in a given style.
 */

import {
  MArray,
  MDataBase,
  MDataEquivalenceBasedEquality,
  MFunction,
  MMatch,
  MPredicate,
  MString,
  MTypes,
} from '@parischap/effect-lib';
import {
  Array,
  Equivalence,
  Hash,
  Number,
  Option,
  Predicate,
  String,
  Struct,
  Tuple,
  flow,
  pipe,
} from 'effect';
import * as ASCode from './internal/Code.js';
import * as ASStyleCharacteristics from './internal/StyleCharacteristics.js';
import * as ASUnistyledText from './internal/UnistyledText.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/Text/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Interface that represents a Text
 *
 * @category Models
 */
export class Type extends MDataEquivalenceBasedEquality.Type {
  /* The text as an array of UniStyled */
  readonly uniStyledTexts: ReadonlyArray<ASUnistyledText.Type>;

  /** Class constructor */
  private constructor({ uniStyledTexts }: MTypes.Data<Type>) {
    super();
    this.uniStyledTexts = uniStyledTexts;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Returns the `id` of `this` */
  protected [MDataBase.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return toAnsiString(this);
    };
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return pipe(this.uniStyledTexts, Hash.array, Hash.cached(this));
  }

  /** Function that implements the equivalence of `this` and `that` */
  protected [MDataEquivalenceBasedEquality.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
  }

  /** Predicate that returns true if `that` has the same type marker as `this` */
  protected [MDataEquivalenceBasedEquality.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
    return Predicate.hasProperty(that, _TypeId);
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

const _equivalence = Array.getEquivalence(ASUnistyledText.equivalence);
/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  _equivalence(self.uniStyledTexts, that.uniStyledTexts);

const _haveSameTextequivalence = Array.getEquivalence(ASUnistyledText.haveSameText);
/**
 * Equivalence
 *
 * @category Equivalences
 */
export const haveSameText: Equivalence.Equivalence<Type> = (self, that) =>
  _haveSameTextequivalence(self.uniStyledTexts, that.uniStyledTexts);

/**
 * Returns the `uniStyledTexts` property of `self`
 *
 * @category Destructors
 */
export const uniStyledTexts: MTypes.OneArgFunction<
  Type,
  ReadonlyArray<ASUnistyledText.Type>
> = Struct.get('uniStyledTexts');

/**
 * Returns the length of `self` without the length of the styling
 *
 * @category Destructors
 */
export const toLength: MTypes.OneArgFunction<Type, number> = flow(
  uniStyledTexts,
  Array.map(ASUnistyledText.toLength),
  Number.sumAll,
);

/**
 * Predicate that returns true if `self` is empty
 *
 * @category Predicates
 */

export const isEmpty: Predicate.Predicate<Type> = flow(toLength, MPredicate.strictEquals(0));

/**
 * Predicate that returns true if `self` is not empty
 *
 * @category Predicates
 */

export const isNotEmpty: Predicate.Predicate<Type> = Predicate.not(isEmpty);

/**
 * Builds a Text by applying a StyleCharacteristics to some strings and other Text's
 *
 * @category Constructors
 */

export const fromStyleAndElems =
  (style: ASStyleCharacteristics.Type) =>
  (...elems: ReadonlyArray<string | Type>): Type =>
    Type.make({
      uniStyledTexts: pipe(
        elems,
        Array.filterMap(
          flow(
            MMatch.make,
            MMatch.when(
              MTypes.isString,
              flow(
                Option.liftPredicate(String.isNonEmpty),
                Option.map((text) => pipe({ text, style }, ASUnistyledText.make, Array.of)),
              ),
            ),
            MMatch.orElse(
              flow(
                Struct.get('uniStyledTexts'),
                Array.map(ASUnistyledText.applyStyleUnder(style)),
                Option.some,
              ),
            ),
          ),
        ),
        Array.flatten,
        Array.match({
          onEmpty: () => Array.empty<ASUnistyledText.Type>(),
          onNonEmpty: flow(
            Array.groupWith(ASUnistyledText.haveSameStyle),
            Array.map(ASUnistyledText.concat),
          ),
        }),
      ),
    });

/**
 * Builds a new Text by concatenating all passed Texts or strings
 *
 * @category Utils
 */
export const concat: (...elems: ReadonlyArray<string | Type>) => Type = fromStyleAndElems(
  ASStyleCharacteristics.none,
);

/**
 * An empty Text
 *
 * @category Instances
 */
export const empty: Type = concat();

/**
 * A Text instance that represents a linebreak
 *
 * @category Instances
 */
export const lineBreak: Type = concat(`\n`);

/**
 * Builds a Text from a string withoout applying any style
 *
 * @category Constructors
 */
export const fromString: MTypes.OneArgFunction<string, Type> = concat;

/**
 * Returns the ANSI string corresponding to self
 *
 * @category Destructors
 */
export const toAnsiString: MTypes.OneArgFunction<Type, string> = flow(
  uniStyledTexts,
  MArray.match012({
    onEmpty: MFunction.constEmptyString,
    onSingleton: ASUnistyledText.toAnsiString,
    onOverTwo: flow(
      Array.map(ASUnistyledText.applyStyleUnder(ASStyleCharacteristics.defaults)),
      Array.reduce(
        Tuple.make('', ASStyleCharacteristics.defaults),
        ([text, context], uniStyled) => {
          const toApply = pipe(uniStyled.style, ASStyleCharacteristics.substractContext(context));

          return pipe(
            toApply,
            ASStyleCharacteristics.toCode,
            MString.prepend(text),
            MString.append(uniStyled.text),
            Tuple.make,
            Tuple.appendElement(pipe(context, ASStyleCharacteristics.mergeOver(toApply))),
          );
        },
      ),
      Tuple.getFirst,
      MString.append(ASCode.reset),
    ),
  }),
);

/**
 * Returns the string corresponding to self without any styling
 *
 * @category Destructors
 */
export const toUnstyledString: MTypes.OneArgFunction<Type, string> = flow(
  uniStyledTexts,
  Array.map(ASUnistyledText.text),
  Array.join(''),
);

/**
 * Builds a new Text by appending `that` to `self`
 *
 * @category Utils
 */
export const append =
  (that: Type) =>
  (self: Type): Type =>
    concat(self, that);

/**
 * Builds a new Text by prepending `that` to `self`
 *
 * @category Utils
 */
export const prepend =
  (that: Type) =>
  (self: Type): Type =>
    concat(that, self);

/**
 * Builds a new Text by prepending `startText` and appending 'endText' to `self`
 *
 * @category Utils
 */
export const surround = (startText: Type, endText: Type): MTypes.OneArgFunction<Type> =>
  flow(prepend(startText), append(endText));

/**
 * Builds a new Text by joining all passed Texts and adding `self` as separator in between
 *
 * @category Utils
 */
export const join =
  (self: Type) =>
  (arr: ReadonlyArray<Type>): Type =>
    concat(...pipe(arr, Array.intersperse(self)));

/**
 * Builds a new Text by repeating `n` times the passed Text. `n` must be a strictly positive
 * integer.
 *
 * @category Utils
 */
export const repeat =
  (n: number) =>
  (self: Type): Type =>
    concat(...pipe(self, Array.replicate(n)));
