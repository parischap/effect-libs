/**
 * This module implements a uniformly styled text (i.e. a text that is thorougly formatted with the
 * same style)
 */

import { MDataBase, MDataEquivalenceBasedEquality, MStruct, MTypes } from '@parischap/effect-lib';
import { Array, Equivalence, Hash, Predicate, String, Struct, flow, pipe } from 'effect';
import * as ASCode from './Code.js';
import * as ASStyleCharacteristics from './StyleCharacteristics.js';

export const moduleTag = '@parischap/ansi-styles/internal/UnistyledText/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

const _TypeIdHash = Hash.hash(_TypeId);

/**
 * Interface that represents a Unistyled text
 *
 * @category Models
 */
export class Type extends MDataEquivalenceBasedEquality.Class {
  /** The text to be styled */
  readonly text: string;

  /** The style to apply to the text */
  readonly style: ASStyleCharacteristics.Type;

  /** Class constructor */
  private constructor({ text, style }: MTypes.Data<Type>) {
    super();
    this.text = text;
    this.style = style;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Returns the `id` of `this` */
  [MDataBase.idSymbol](): string | (() => string) {
    return moduleTag;
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return pipe(
      this.text,
      Hash.hash,
      Hash.combine(Hash.hash(this.style)),
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
 * Equivalence based on the style
 *
 * @category Equivalences
 */
export const haveSameStyle: Equivalence.Equivalence<Type> = (self, that) =>
  ASStyleCharacteristics.equivalence(self.style, that.style);

/**
 * Equivalence based on the text
 *
 * @category Equivalences
 */
export const haveSameText: Equivalence.Equivalence<Type> = (self, that) => self.text === that.text;

/**
 * Equivalence based on the style and the text
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  haveSameText(self, that) && haveSameStyle(self, that);

/** Constructor */
export const make = (params: MTypes.Data<Type>): Type => Type.make(params);

/**
 * Gets the `text` property of `self`
 *
 * @category Destructors
 */
export const text: MTypes.OneArgFunction<Type, string> = Struct.get('text');

/**
 * Gets the `style` property of `self`
 *
 * @category Destructors
 */
export const style: MTypes.OneArgFunction<Type, ASStyleCharacteristics.Type> = Struct.get('style');

/**
 * Merges the characteristics of `style` with the `style` property of `self`. In case of conflict,
 * the characteristics in the `style` property of `self` will prevail.
 *
 * @category Utils
 */
export const applyStyleUnder = (
  style: ASStyleCharacteristics.Type,
): MTypes.OneArgFunction<Type, Type> =>
  flow(
    MStruct.evolve({
      style: ASStyleCharacteristics.mergeUnder(style),
    }),
    make,
  );

/**
 * Builds a new UniStyledText from the concatenation of several UniStyledText's. The style of the
 * resulting UnistyledText is the one of the first UnistyledText to be concatenated
 *
 * @category Constructors
 */
export const concat = (elems: MTypes.ReadonlyOverOne<Type>): Type =>
  make({
    text: pipe(elems, Array.map(text), Array.join('')),
    style: pipe(elems, Array.headNonEmpty, style),
  });

/**
 * Gets the length of `self` without the formatting
 *
 * @category Utils
 */
export const toLength: MTypes.OneArgFunction<Type, number> = flow(
  Struct.get('text'),
  String.length,
);

/**
 * Returns the ANSI string corresponding to self
 *
 * @category Destructors
 */
export const toAnsiString = (self: Type): string => {
  if (self.text.length === 0) return '';
  const startCode = ASStyleCharacteristics.toCode(self.style);
  return startCode.length === 0 ? self.text : startCode + self.text + ASCode.reset;
};
