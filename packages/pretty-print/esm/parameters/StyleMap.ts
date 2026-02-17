/**
 * This module implements a map of PPValueBasedStyler's (ValueBasedStyler.ts). These ContextStyler's
 * are used to style the different parts of a stringified value. The keys of the map are strings
 * that identify a part of a stringified value. Same as PPStyles but as a marked, named and
 * inspectable object
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import * as ASConstantContextStyler from '@parischap/ansi-styles/ASConstantContextStyler'
import * as ASPalette from '@parischap/ansi-styles/ASPalette'
import * as ASStyle from '@parischap/ansi-styles/ASStyle'
import * as MData from '@parischap/effect-lib/MData'
import * as MDataEquivalenceBasedEquality from '@parischap/effect-lib/MDataEquivalenceBasedEquality'
import * as MTypes from '@parischap/effect-lib/MTypes'
import {pipe} from 'effect'
import * as Equivalence from 'effect/Equivalence'
import * as Hash from 'effect/Hash'
import * as HashMap from 'effect/HashMap'
import * as Predicate from 'effect/Predicate'
import * as Struct from 'effect/Struct'
import * as PPStyles from '../internal/parameters/Styles.js';
import * as PPValueBasedStyler from './ValueBasedStyler.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/StyleMap/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a PPStyleMap
 *
 * @category Models
 */
export class Type extends MDataEquivalenceBasedEquality.Class {
  /** Id of this PPStyleMap instance. Useful for equality and debugging. */
  readonly name: string;

  /** Map of Style's to be applied to the different parts of the value to stringify */
  readonly styles: PPStyles.Type;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.name;
    };
  }

  /** Class constructor */
  private constructor({ name, styles }: MTypes.Data<Type>) {
    super();
    this.name = name;
    this.styles = styles;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return 0;
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
 * Constructor of a PPStyleMap
 *
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type => Type.make(params);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.name === self.name;

/**
 * Returns the `id` property of `self`
 *
 * @category Destructors
 */
export const name: MTypes.OneArgFunction<Type, string> = Struct.get('name');

/**
 * Returns the ValueBasedStyler associated with `partName` which identifies a part of a stringified
 * value. Returns `ASContextStyler.none` if `partName` is not present in `self`.
 *
 * @category Destructors
 */
export const get = (self: Type, partName: string): PPValueBasedStyler.Type =>
  PPStyles.get(self.styles, partName);

/**
 * StyleMap instance for ansi dark mode
 *
 * @category Instances
 */
export const darkMode: Type = make({
  name: 'DarkMode',
  styles: HashMap.make(
    ['Message', ASConstantContextStyler.green],
    ['ToStringedObject', ASConstantContextStyler.yellow],
    [
      'PrimitiveValue',
      PPValueBasedStyler.makeTypeIndexed(
        ASPalette.make(
          // string
          ASStyle.green,
          // number
          ASStyle.yellow,
          // bigint
          ASStyle.yellow,
          // boolean
          ASStyle.yellow,
          // symbol
          ASStyle.cyan,
          // null
          pipe(ASStyle.green, ASStyle.mergeOver(ASStyle.bold)),
          // undefined
          ASStyle.green,
        ),
      ),
    ],
    [
      'PropertyKey',
      PPValueBasedStyler.makeKeyTypeIndexed(
        ASPalette.make(
          // string key
          ASStyle.red,
          // symbolic key
          ASStyle.cyan,
        ),
      ),
    ],
    ['PrototypeDelimiters', ASConstantContextStyler.green],
    ['KeyValueSeparator', ASConstantContextStyler.white],
    ['InBetweenPropertySeparator', ASConstantContextStyler.white],
    [
      'NonPrimitiveValueDelimiters',
      PPValueBasedStyler.makeDepthIndexed(
        ASPalette.make(
          ASStyle.red,
          ASStyle.green,
          ASStyle.yellow,
          ASStyle.blue,
          ASStyle.magenta,
          ASStyle.cyan,
          ASStyle.white,
        ),
      ),
    ],
    ['Indentation', ASConstantContextStyler.green],
    ['NonPrimitiveValueName', ASConstantContextStyler.green],
    ['NonPrimitiveValueIdSeparator', ASConstantContextStyler.green],
    ['PropertyNumbers', ASConstantContextStyler.green],
    ['PropertyNumberSeparator', ASConstantContextStyler.green],
    ['PropertyNumberDelimiters', ASConstantContextStyler.green],
  ),
});

/**
 * StyleMap instance that doesn't apply any formatting (uses the none ASConstantContextStyler of the
 * ansi-styles library for all parts to be formatted)
 *
 * @category Instances
 */
export const none: Type = make({
  name: 'None',
  styles: HashMap.empty(),
});
