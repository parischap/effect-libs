/**
 * This module implements the top-level parameters that configure the stringification process. A
 * `PPParameters` instance bundles together a `PPStyleMap`, a `PPPrimitiveFormatter`, and one or
 * more `PPNonPrimitiveParameters` instances, plus global settings that govern depth limits,
 * circular-reference marks, and property-count formatting.
 *
 * Use the `make` function to define custom instances if the pre-built ones do not suit your needs.
 */

import { flow, pipe } from 'effect';
import * as Array from 'effect/Array';
import type * as Equivalence from 'effect/Equivalence';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as String from 'effect/String';
import * as Struct from 'effect/Struct';

import * as MData from '@parischap/effect-lib/MData';
import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';
import * as MFunction from '@parischap/effect-lib/MFunction';
import * as MMatch from '@parischap/effect-lib/MMatch';
import * as MRecord from '@parischap/effect-lib/MRecord';
import * as MString from '@parischap/effect-lib/MString';
import * as MStruct from '@parischap/effect-lib/MStruct';
import * as MTypes from '@parischap/effect-lib/MTypes';

import * as PPNonPrimitiveParameters from './NonPrimitiveParameters.js';
import * as PPPrimitiveFormatter from './PrimitiveFormatter.js';
import * as PPStyleMap from './StyleMap.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/Parameters/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a `PPParameters`
 *
 * @category Models
 */
export class Type extends MEquivalenceBasedEqualityData.Class {
  /** Id of `this`. Useful for equality and debugging */
  readonly id: string;

  /** The `PPStyleMap` that assigns a style to each visual element of the output */
  readonly styleMap: PPStyleMap.Type;

  /** The `PPPrimitiveFormatter` used to convert primitive values to their string representation */
  readonly primitiveFormatter: PPPrimitiveFormatter.Type;

  /**
   * Non-empty array of `PPNonPrimitiveParameters`. When a non-primitive value is encountered,
   * **every** entry whose `isApplicableTo` predicate returns `true` is selected and the matching
   * entries are merged into a single fully-resolved set of parameters; lower-index entries override
   * higher-index ones, and any field not specified by any matching entry falls back to the module-
   * level default in `PPNonPrimitiveParameters.defaultParams`. Elements should therefore be ordered
   * in decreasing specificity.
   */
  readonly nonPrimitiveParametersArray: MTypes.OverOne<PPNonPrimitiveParameters.Type>;

  /**
   * Function that derives the display name from any non-primitive value. The name is shown in two
   * places:
   *
   * - Surrounded by `openingTagMark` / `closingTagMark` when `maxDepth` is exceeded (e.g. `[Array]`,
   *   `[Function: foo]`).
   * - In the header before the properties when the applicable `PPNonPrimitiveParameters.showName` is
   *   `true` (e.g. the `Map` in `Map(2) { 'a' => 1, 'b' => 2 }`).
   *
   * The default implementation returns `'Function: <name>'` (or `'Function: (anonymous)'`) for
   * functions, then tries Effect's `toJSON()._id` convention, then falls back to
   * `value.constructor.name`. This transparently covers `Map`, `Set`, `WeakMap`, `WeakSet`, all
   * typed arrays, and user-defined classes.
   */
  readonly name: (nonPrimitive: MTypes.NonPrimitive) => string;

  /**
   * Maximum number of nested non-primitive values that will be opened. A value of 0 or less means
   * that only the value to stringify is shown if it is primitive; if it is non-primitive it is
   * replaced by a tag that depends on its type (e.g. `[Object]`, `[Array]`). Pass `+Infinity` to
   * expand all levels.
   */
  readonly maxDepth: number;

  /**
   * Mark prepended to tags — both the header tag shown when `maxDepth` is exceeded and the
   * circular-reference tag
   */
  readonly openingTagMark: string;

  /**
   * Mark appended to tags — both the header tag shown when `maxDepth` is exceeded and the circular-
   * reference tag
   */
  readonly closingTagMark: string;

  /**
   * Text inserted in place of a non-primitive value that has already appeared higher up in the
   * output tree, indicating a circular reference (e.g. `Circular *1`)
   */
  readonly circularReferenceTag: string;

  /**
   * Mark prepended to the representation of a non-primitive value that is referenced again deeper
   * in the tree (e.g. `<Ref *1>`)
   */
  readonly circularAnchorOpeningMark: string;

  /**
   * Mark appended to the representation of a non-primitive value that is referenced again deeper in
   * the tree
   */
  readonly circularAnchorClosingMark: string;

  /**
   * Separator inserted between the header of a non-primitive value and the opening bracket of its
   * properties (e.g. the space in `Map(2) { 'a' => 1 }`)
   */
  readonly headerSeparatorMark: string;

  /**
   * Separator used between the two property counts inside the header (e.g. the `,` in `Map(5,2) { …
   * }`), applicable when `propertyNumberDisplayOption` is `AllAndActual` or
   * `AllAndActualIfDifferent`
   */
  readonly propertyNumberSeparatorMark: string;

  /**
   * Mark placed before the property count(s) in the header (e.g. the `(` in `Map(2) { … }`),
   * applicable when `propertyNumberDisplayOption` is not `None`
   */
  readonly propertyNumberOpeningMark: string;

  /**
   * Mark placed after the property count(s) in the header (e.g. the `)` in `Map(2) { … }`),
   * applicable when `propertyNumberDisplayOption` is not `None`
   */
  readonly propertyNumberClosingMark: string;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.id;
    };
  }

  /** Class constructor */
  private constructor({
    id,
    styleMap,
    primitiveFormatter,
    nonPrimitiveParametersArray,
    name,
    maxDepth,
    openingTagMark,
    closingTagMark,
    circularReferenceTag,
    circularAnchorOpeningMark,
    circularAnchorClosingMark,
    headerSeparatorMark,
    propertyNumberSeparatorMark,
    propertyNumberOpeningMark,
    propertyNumberClosingMark,
  }: MTypes.Data<Type>) {
    super();
    this.id = id;
    this.styleMap = styleMap;
    this.primitiveFormatter = primitiveFormatter;
    this.nonPrimitiveParametersArray = nonPrimitiveParametersArray;
    this.name = name;
    this.maxDepth = maxDepth;
    this.openingTagMark = openingTagMark;
    this.closingTagMark = closingTagMark;
    this.circularReferenceTag = circularReferenceTag;
    this.circularAnchorOpeningMark = circularAnchorOpeningMark;
    this.circularAnchorClosingMark = circularAnchorClosingMark;
    this.headerSeparatorMark = headerSeparatorMark;
    this.propertyNumberSeparatorMark = propertyNumberSeparatorMark;
    this.propertyNumberOpeningMark = propertyNumberOpeningMark;
    this.propertyNumberClosingMark = propertyNumberClosingMark;
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
 * Constructor of a PPParameters
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
 * Returns the `styleMap` property of `self`
 *
 * @category Getters
 */
export const styleMap: MTypes.OneArgFunction<Type, PPStyleMap.Type> = Struct.get('styleMap');

/**
 * `PPParameters` instance that pretty-prints a value in a style very similar to `util.inspect`,
 * without any color styling
 *
 * @category Instances
 */
export const utilInspectLike: Type = make({
  primitiveFormatter: PPPrimitiveFormatter.utilInspectLike,
  name: (nonPrimitive) =>
    pipe(
      nonPrimitive,
      MMatch.make,
      MMatch.when(
        MTypes.isFunction,
        flow(
          MFunction.name,
          Option.liftPredicate(String.isNonEmpty),
          Option.getOrElse(() => '(anonymous)'),
          MString.prepend('Function: '),
        ),
      ),
      MMatch.tryFunction(
        flow(
          MRecord.tryZeroParamFunction({ functionName: 'toJSON' }),
          Option.filter(Predicate.hasProperty('_id')),
          Option.map(Struct.get('_id')),
          Option.filter(MTypes.isString),
        ),
      ),
      MMatch.orElse((u): string => {
        const ctorName: unknown = (u as { readonly constructor?: { readonly name?: unknown } })
          .constructor?.name;
        return MTypes.isString(ctorName) && ctorName !== '' ? ctorName : 'Object';
      }),
    ),
  openingTagMark: '[',
  closingTagMark: ']',
  circularReferenceTag: 'Circular *',
  circularAnchorOpeningMark: '<Ref *',
  circularAnchorClosingMark: '>',
  headerSeparatorMark: ' ',
  propertyNumberSeparatorMark: ',',
  propertyNumberOpeningMark: '(',
  propertyNumberClosingMark: ')',
  id: 'UtilInspectLike',
  styleMap: PPStyleMap.none,
  maxDepth: 2,
  nonPrimitiveParametersArray: Array.make(
    PPNonPrimitiveParameters.utilInspectLikeFunction,
    PPNonPrimitiveParameters.utilInspectLikeArray,
    PPNonPrimitiveParameters.utilInspectLikeIterable,
  ),
});

/**
 * `PPParameters` instance that pretty-prints a value in a way very similar to `util.inspect` with
 * colors adapted to a terminal in dark mode.
 *
 * @category Instances
 */
export const darkModeUtilInspectLike: Type = pipe(
  utilInspectLike,
  MStruct.append({
    id: 'DarkModeUtilInspectLike',
    styleMap: PPStyleMap.darkMode,
  }),
  make,
);

/**
 * `PPParameters` instance that renders a value as a tree (without color styling)
 *
 * @category Instances
 */
export const treeify: Type = pipe(
  utilInspectLike,
  MStruct.append({
    id: 'Treeify',
    maxDepth: Infinity,
    nonPrimitiveParametersArray: [
      PPNonPrimitiveParameters.treeify,
      ...utilInspectLike.nonPrimitiveParametersArray,
    ],
  }),
  make,
);

/**
 * `PPParameters` instance that renders a value as a tree with colors adapted to dark-mode
 * terminals
 *
 * @category Instances
 */
export const darkModeTreeify: Type = pipe(
  treeify,
  MStruct.append({
    id: 'DarkModeTreeify',
    styleMap: PPStyleMap.darkMode,
  }),
  make,
);

/**
 * `PPParameters` instance that renders a value as a tree and hides leaf values (only keys are
 * shown), useful for inspecting an object's shape
 *
 * @category Instances
 */
export const treeifyHideLeaves: Type = pipe(
  treeify,
  MStruct.append({
    id: 'TreeifyHideLeaves',
    nonPrimitiveParametersArray: [
      PPNonPrimitiveParameters.treeifyHideLeaves,
      ...utilInspectLike.nonPrimitiveParametersArray,
    ],
  }),
  make,
);

/**
 * `PPParameters` instance that renders a value as a tree with hidden leaf values, using colors
 * adapted to dark-mode terminals
 *
 * @category Instances
 */
export const darkModeTreeifyHideLeaves: Type = pipe(
  treeifyHideLeaves,
  MStruct.append({
    id: 'DarkModeTreeifyHideLeaves',
    styleMap: PPStyleMap.darkMode,
  }),
  make,
);
