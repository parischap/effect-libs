/**
 * This module implements a named, inspectable map from `PPPartName` values to `PPStyle`'s (see
 * Style.ts). A `PPStyleMap` therefore defines which style to apply to each visual element of a
 * stringified value. Two pre-built instances are provided: - `none`: no styling applied. -
 * `darkMode`: a color scheme suited to dark-mode terminals.
 *
 * Use the `make` function to define custom instances if the pre-built ones do not suit your needs.
 */

import { flow, pipe } from 'effect';
import type * as Equivalence from 'effect/Equivalence';
import * as Hash from 'effect/Hash';
import * as HashMap from 'effect/HashMap';
import * as Predicate from 'effect/Predicate';
import * as Struct from 'effect/Struct';

import * as ASContextStyler from '@parischap/ansi-styles/ASContextStyler';
import * as ASPalette from '@parischap/ansi-styles/ASPalette';
import * as ASStyle from '@parischap/ansi-styles/ASStyle';
import * as MData from '@parischap/effect-lib/MData';
import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import type * as PPPartName from './PartName.js';

import * as PPStyles from '../internal/Parameters/Styles.js';
import * as PPStyle from './Style.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/Parameters/StyleMap/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a PPStyleMap
 *
 * @category Models
 */
export class Type extends MEquivalenceBasedEqualityData.Class {
  /** Id of this PPStyleMap instance. Useful for equality and debugging. */
  readonly id: string;

  /** Map of Style's to be applied to the different parts of the value to stringify */
  readonly styles: PPStyles.Type;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.id;
    };
  }

  /** Class constructor */
  private constructor({ id, styles }: MTypes.Data<Type>) {
    super();
    this.id = id;
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
  [MEquivalenceBasedEqualityData.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
  }

  /** Predicate that returns true if `that` has the same type marker as `this` */
  [MEquivalenceBasedEqualityData.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
    return Predicate.hasProperty(that, TypeId);
  }
  /** Returns the TypeMarker of the class */
  protected get [TypeId](): TypeId {
    return TypeId;
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
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/**
 * Returns the `id` property of `self`
 *
 * @category Getters
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

/**
 * Returns the `styles` property of `self`
 *
 * @category Getters
 */
export const styles: MTypes.OneArgFunction<Type, PPStyles.Type> = Struct.get('styles');

/**
 * Returns the Style associated with `partName` which identifies a part of a stringified value.
 * Returns `ASContextStyler.none` if `partName` is not present in `self`.
 *
 * @category Destructors
 */
export const get = (partName: PPPartName.Type): MTypes.OneArgFunction<Type, PPStyle.Type> =>
  flow(styles, PPStyles.get(partName));

/**
 * StyleMap instance for ansi dark mode
 *
 * @category Instances
 */
export const darkMode: Type = make({
  id: 'DarkMode',
  styles: HashMap.make(
    /** Style used when a non primitive value is displayed by a bypasser or supersedes maxDepth */
    ['ByPassed', ASContextStyler.yellow] as const,
    [
      /** Style used to display a Primitive value */
      'PrimitiveValue',
      PPStyle.makeTypeIndexed(
        ASPalette.make(
          /** Style used to display a Primitive value of type string */
          ASStyle.green,
          /** Style used to display a Primitive value of type number */
          ASStyle.yellow,
          /** Style used to display a Primitive value of type bigint */
          ASStyle.yellow,
          /** Style used to display a Primitive value of type boolean */
          ASStyle.yellow,
          /** Style used to display a Primitive value of type symbol */
          ASStyle.cyan,
          /** Style used to display a null Primitive value */
          pipe(ASStyle.green, ASStyle.mergeOver(ASStyle.bold)),
          /** Style used to display an undefined Primitive value */
          ASStyle.green,
        ),
      ),
    ] as const,
    [
      /** Style used to display the property key of a non-primitive value */
      'PropertyKey',
      PPStyle.makeKeyTypeIndexed(
        ASPalette.make(
          /** Style used to display the string property key of a non-primitive value */
          ASStyle.red,
          /** Style used to display the symbolic property key of a non-primitive value */
          ASStyle.cyan,
        ),
      ),
    ] as const,
    /**
     * Style used to display the marks that indicate a property is on the prototype of a non-
     * primitive value
     */
    ['PrototypeMarks', ASContextStyler.green] as const,
    /** Style used to display the separator between the key and the value of a non-primitive value */
    ['KeyValueSeparator', ASContextStyler.white] as const,
    /** Style used to display the separator between two properties of a non-primitive value */
    ['InBetweenPropertySeparator', ASContextStyler.white] as const,
    /** Style used to display the delimiters around a non-primitive value */
    [
      'NonPrimitiveValueMarks',
      PPStyle.makeDepthIndexed(
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
    ] as const,
    /** Style used for the indentation marks (when they are visible, i.e. when treeifying) */
    ['Tab', ASContextStyler.green] as const,
    /** Style used for tags (non-primitive value name, circular reference marks) */
    ['Tag', ASContextStyler.green] as const,
  ),
});

/**
 * StyleMap instance that doesn't apply any formatting (uses the none ASContextStyler of the ansi-
 * styles library for all parts to be formatted)
 *
 * @category Instances
 */
export const none: Type = make({
  id: 'None',
  styles: HashMap.empty(),
});
