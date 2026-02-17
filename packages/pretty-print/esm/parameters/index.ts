/**
 * This module implements the pretty-printing parameters.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import * as MData from '@parischap/effect-lib/MData'
import * as MDataEquivalenceBasedEquality from '@parischap/effect-lib/MDataEquivalenceBasedEquality'
import * as MStruct from '@parischap/effect-lib/MStruct'
import * as MTypes from '@parischap/effect-lib/MTypes'
import {flow, pipe} from 'effect'
import * as Array from 'effect/Array'
import * as HashMap from 'effect/HashMap'
import * as HashSet from 'effect/HashSet'
import * as Option from 'effect/Option'
import * as SortedMap from 'effect/SortedMap'
import * as SortedSet from 'effect/SortedSet'
import * as Struct from 'effect/Struct'

import * as Equivalence from 'effect/Equivalence'
import * as Hash from 'effect/Hash'
import * as Predicate from 'effect/Predicate'
import * as PPByPassers from '../internal/parameters/ByPassers.js';
import * as PPValue from '../internal/stringification/Value.js';
import * as PPByPasser from './ByPasser.js';
import * as PPMarkMap from './MarkMap.js';
import * as PPNonPrimitiveFormatter from './NonPrimitiveFormatter.js';
import * as PPNonPrimitiveParameters from './NonPrimitiveParameters.js';
import * as PPPrimitiveFormatter from './PrimitiveFormatter.js';
import * as PPPropertyFormatter from './PropertyFormatter.js';
import * as PPStyleMap from './StyleMap.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/parameters/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a PPParameters
 *
 * @category Models
 */
export class Type extends MDataEquivalenceBasedEquality.Class {
  /** Name of this. Useful for equality and debugging */
  readonly name: string;

  /** Map of ValueBasedStyler's used to style the different parts of a stringified value */
  readonly styleMap: PPStyleMap.Type;

  /** Map of the different marks that appear in a value to stringify */
  readonly markMap: PPMarkMap.Type;

  /**
   * Array of `PPByPasser` instances (see PPByPasser.ts): the first PPByPasser that returns a `some`
   * is used to display that value. If all PPByPasser's return a `none`, the normal stringification
   * process is applied.
   */
  readonly byPassers: PPByPassers.Type;

  /** PrimitiveFormatter (see PrimitiveFormatter.ts) instance used to format primitive values */
  readonly primitiveFormatter: PPPrimitiveFormatter.Type;

  /**
   * Maximum number of nested non-primitive values that will be opened. A value inferior or equal to
   * 0 means that only the value to stringify is shown, provided it is a primitive. If it is a
   * non-primitive value, it gets replaced by a message string that depends on the type of that
   * non-primitive value (e.g. [Object], [Array],...). Pass +Infinity to see all levels of any
   * non-primitive value.
   */
  readonly maxDepth: number;

  /**
   * Options that will apply to all non-primitive values other than those for which specific options
   * are provided. See specificNonPrimitiveOptions below
   */
  readonly generalNonPrimitiveParameters: PPNonPrimitiveParameters.Type;

  /**
   * Function that takes a non-primitive value and returns either a `none` if the
   * `generalNonPrimitiveParameters` must be applied for that non-primitive value or a `some` of the
   * specific parameters to apply for that non-primitive value.
   */
  readonly specificNonPrimitiveParameters: MTypes.OneArgFunction<
    PPValue.NonPrimitive,
    Option.Option<PPNonPrimitiveParameters.Type>
  >;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.name;
    };
  }

  /** Class constructor */
  private constructor({
    name,
    styleMap,
    markMap,
    byPassers,
    primitiveFormatter,
    maxDepth,
    generalNonPrimitiveParameters,
    specificNonPrimitiveParameters,
  }: MTypes.Data<Type>) {
    super();
    this.name = name;
    this.styleMap = styleMap;
    this.markMap = markMap;
    this.byPassers = byPassers;
    this.primitiveFormatter = primitiveFormatter;
    this.maxDepth = maxDepth;
    this.generalNonPrimitiveParameters = generalNonPrimitiveParameters;
    this.specificNonPrimitiveParameters = specificNonPrimitiveParameters;
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
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.name === self.name;

/**
 * Returns the `id` property of `self`
 *
 * @category Destructors
 */
export const name: MTypes.OneArgFunction<Type, string> = Struct.get('name');

/**
 * Returns the `styleMap` property of `self`
 *
 * @category Destructors
 */
export const styleMap: MTypes.OneArgFunction<Type, PPStyleMap.Type> = Struct.get('styleMap');

/**
 * `PPParameters` instance that pretty-prints a value in a way very similar to util.inspect.
 *
 * @category Instances
 */
export const utilInspectLike: Type = make({
  name: 'UtilInspectLike',
  styleMap: PPStyleMap.none,
  markMap: PPMarkMap.utilInspectLike,
  byPassers: Array.make(PPByPasser.functionToName, PPByPasser.objectToString),
  primitiveFormatter: PPPrimitiveFormatter.utilInspectLikeMaker(),
  maxDepth: 2,
  generalNonPrimitiveParameters: PPNonPrimitiveParameters.record,
  specificNonPrimitiveParameters: (value) => {
    const { content } = value;
    if (MTypes.isArray(content)) return Option.some(PPNonPrimitiveParameters.array);
    if (content instanceof Map) return Option.some(PPNonPrimitiveParameters.maps('Map'));
    if (content instanceof Set) return Option.some(PPNonPrimitiveParameters.setsAndArrays('Set'));
    if (content instanceof WeakMap) return Option.some(PPNonPrimitiveParameters.maps('WeakMap'));
    if (content instanceof WeakSet)
      return Option.some(PPNonPrimitiveParameters.setsAndArrays('WeakSet'));
    if (HashMap.isHashMap(content))
      return Option.some(PPNonPrimitiveParameters.maps('EffectHashMap'));
    if (SortedMap.isSortedMap(content))
      return Option.some(PPNonPrimitiveParameters.maps('EffectSortedMap'));
    if (HashSet.isHashSet(content))
      return Option.some(PPNonPrimitiveParameters.setsAndArrays('EffectHashSet'));
    if (SortedSet.isSortedSet(content))
      return Option.some(PPNonPrimitiveParameters.setsAndArrays('EffectSortedSet'));
    return pipe(content, MTypes.typedArrayName, Option.map(PPNonPrimitiveParameters.setsAndArrays));
  },
});

/**
 * `PPParameters` instance that pretty-prints a value in a way very similar to util.inspect with
 * colors adapted to a terminal in dark mode.
 *
 * @category Instances
 */
export const darkModeUtilInspectLike: Type = pipe(
  utilInspectLike,
  MStruct.append({
    name: 'DarkModeUtilInspectLike',
    styleMap: PPStyleMap.darkMode,
  }),
  make,
);

/**
 * `PPParameters` instance that treeifies a value
 *
 * @category Instances
 */
export const treeify: Type = make({
  name: 'Treeify',
  styleMap: PPStyleMap.none,
  markMap: PPMarkMap.utilInspectLike,
  byPassers: Array.empty(),
  primitiveFormatter: PPPrimitiveFormatter.utilInspectLikeMaker(),
  maxDepth: Infinity,
  generalNonPrimitiveParameters: pipe(
    PPNonPrimitiveParameters.record,
    MStruct.append({
      propertyFilters: Array.empty(),
      propertySortOrder: Option.none(),
      dedupeProperties: false,
      maxPropertyNumber: Infinity,
      propertyFormatter: PPPropertyFormatter.treeify,
      nonPrimitiveFormatter: PPNonPrimitiveFormatter.treeify,
    }),
    PPNonPrimitiveParameters.make,
  ),
  specificNonPrimitiveParameters: flow(
    utilInspectLike.specificNonPrimitiveParameters,
    Option.map(
      flow(
        MStruct.set({
          nonPrimitiveFormatter: PPNonPrimitiveFormatter.treeify,
          propertyFormatter: PPPropertyFormatter.treeify,
        }),
        PPNonPrimitiveParameters.make,
      ),
    ),
  ),
});

/**
 * `PPParameters` instance that treeifies a value with colors adapted to dark mode
 *
 * @category Instances
 */
export const darkModeTreeify: Type = pipe(
  treeify,
  MStruct.append({
    name: 'DarkModeTreeify',
    styleMap: PPStyleMap.darkMode,
  }),
  make,
);

/**
 * `PPParameters` instance that treeifies a value and hides the leaves
 *
 * @category Instances
 */
export const treeifyHideLeaves: Type = pipe(
  treeify,
  MStruct.append({
    name: 'TreeifyHideLeaves',
    generalNonPrimitiveParameters: pipe(
      treeify.generalNonPrimitiveParameters,
      MStruct.make({
        propertyFormatter: PPPropertyFormatter.treeifyHideLeafValues,
      }),
      PPNonPrimitiveParameters.make,
    ),
    specificNonPrimitiveParameters: flow(
      treeify.specificNonPrimitiveParameters,
      Option.map(
        flow(
          MStruct.set({
            propertyFormatter: PPPropertyFormatter.treeifyHideLeafValues,
          }),
          PPNonPrimitiveParameters.make,
        ),
      ),
    ),
  }),
  make,
);

/**
 * `PPParameters` instance that treeifies a value and hides the leaves with colors adapted to dark
 * mode
 *
 * @category Instances
 */
export const darkModeTreeifyHideLeaves: Type = make({
  ...treeifyHideLeaves,
  name: 'DarkModeTreeifyHideLeaves',
  styleMap: PPStyleMap.darkMode,
});
