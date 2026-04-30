/**
 * This module implements the pretty-printing parameters that govern how a specific category of non-
 * primitive values is displayed. A `PPParameters` instance holds an ordered array of
 * `PPNonPrimitiveParameters`. When stringifying a non-primitive value, **every** entry whose
 * `isApplicableTo` predicate matches is selected and the matching ones are merged together (lower-
 * index entries override higher-index ones); fields not specified by any of the merged entries fall
 * back to the record-like defaults exposed by `PPResolvedNonPrimitiveParameters.utilInspectLikeRecord`.
 *
 * Apart from `id` and `isApplicableTo`, every field is optional: an instance therefore acts as a
 * **partial override** layer. Use the `make` function to define your own.
 */

import type * as Equivalence from 'effect/Equivalence';
import * as Function from 'effect/Function';
import * as Hash from 'effect/Hash';
import type * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as Struct from 'effect/Struct';

import * as MData from '@parischap/effect-lib/MData';
import * as MEquivalenceBasedEqualityData from '@parischap/effect-lib/MEquivalenceBasedEqualityData';
import * as MTypes from '@parischap/effect-lib/MTypes';

import type * as PPPropertyFilter from './PropertyFilter.js';
import type * as PPValueOrder from './ValueOrder.js';

import * as PPByPasser from './ByPasser.js';
import * as PPNonPrimitiveFormatter from './NonPrimitiveFormatter.js';
import * as PPPropertyFormatter from './PropertyFormatter.js';
import * as PPPropertyNumberDisplayOption from './PropertyNumberDisplayOption.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/pretty-print/Parameters/NonPrimitiveParameters/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a `PPNonPrimitiveParameters`. Apart from `id` and `isApplicableTo`, every
 * field is optional: unset fields are filled in by
 * `PPResolvedNonPrimitiveParameters.fromApplicableNonPrimitiveParameters` from the record-like
 * defaults.
 *
 * @category Models
 */
export class Type extends MEquivalenceBasedEqualityData.Class {
  /** Id of `this` `PPNonPrimitiveParameters`. Used for equality and debugging */
  readonly id!: string;

  /**
   * Predicate that returns `true` if `this` `PPNonPrimitiveParameters` is applicable to
   * `nonPrimitive`.
   */
  readonly isApplicableTo!: Predicate.Predicate<MTypes.NonPrimitive>;

  /**
   * When `true`, the value's name (computed by `PPParameters.name`) is shown in the header before
   * the properties, separated by `headerSeparatorMark`. Property counts (when enabled via
   * `propertyNumberDisplayOption`) are inserted between the name and the separator. Example:
   * `Map(2) { 'a' => 1, 'b' => 2 }`.
   */
  declare readonly showName?: boolean;

  /**
   * Controls whether and how property counts are shown in the header. When not `None`, counts are
   * wrapped in `propertyNumberOpeningMark` / `propertyNumberClosingMark`. For `AllAndActual` and
   * `AllAndActualIfDifferent`, the two counts are separated by `propertyNumberSeparatorMark`.
   * Examples: `Map(2) { 'a' => 1 }` with `Actual`; `Map(5,2) { 'a' => 1 }` with `AllAndActual`.
   */
  declare readonly propertyNumberDisplayOption?: PPPropertyNumberDisplayOption.Type;

  /**
   * `PPByPasser` instance (see PPByPasser.ts) to apply to the non-primitive values to which `self`
   * is applicable. If you need to pass several `PPByPasser`'s, use the `PPByPasser.merge`
   * constructor.
   */
  declare readonly byPasser?: PPByPasser.Type;

  /**
   * Indicates the level in the prototypal chain of a non-primitive value down to which properties
   * are shown. `maxPrototypeDepth <= 0` means that no properties are shown. `maxPrototypeDepth = 1`
   * means that only the own properties of a non-primitive value are shown. `maxPrototypeDepth = 2`
   * means that only the own properties of a non-primitive value and that of its direct prototype
   * are shown...
   */
  declare readonly maxPrototypeDepth?: number;

  /**
   * `PPPropertyFilter` instance (see PropertyFilter.ts) to apply to the properties of non-primitive
   * values to which this is applicable. If you need to pass several `PPPropertyFilter` instances,
   * use the `PPPropertyFilter.merge` function.
   */
  declare readonly propertyFilter?: PPPropertyFilter.Type;

  /**
   * Order to use to sort the properties of that type of non-primitive values just after application
   * of the property filter. If `none` is passed, properties are not sorted.
   */
  declare readonly propertySortOrder?: Option.Option<PPValueOrder.Type>;

  /**
   * Non-primitive values can have several properties with the same key. For instance, the same key
   * can appear in an object and one or several of its prototypes. This option allows you to decide
   * if you want to keep all the properties with the same key. If `true`, only the first occurrence
   * of each property with the same key is kept. Sorting happens before deduping, so you can decide
   * which property will be first by choosing your `propertySortOrder` carefully (e.g. you may use
   * `PropertyOrder.byPrototypalDepth`). If `false`, all occurrences of the same property are kept.
   */
  declare readonly dedupeProperties?: boolean;

  /**
   * Maximal number of properties to keep for non-primitive values. Pass `+Infinity` to show all
   * properties. Keeps the `maxPropertyNumber` first properties after filtering, sorting and
   * deduping.
   */
  declare readonly maxPropertyNumber?: number;

  /**
   * `PPPropertyFormatter` instance which allows you to specify how to format properties of non-
   * primitive values (see PropertyFormatter.ts).
   */
  declare readonly propertyFormatter?: PPPropertyFormatter.Type;

  /**
   * `PPNonPrimitiveFormatter` instance: allows you to specify how to print a non-primitive value
   * from its stringified properties (see NonPrimitiveFormatter.ts).
   */
  declare readonly nonPrimitiveFormatter?: PPNonPrimitiveFormatter.Type;

  /**
   * Keys of the properties of a non-primitive value are not shown if `hideAutoGeneratedKeys` is
   * `true` and if all the keys of the properties of that non-primitive value have been generated
   * (this usually happens for an iterable when `maxPrototypeDepth` is equal to 0). Otherwise, the
   * keys are shown.
   */
  declare readonly hideAutoGeneratedKeys?: boolean;

  /**
   * When `true` and the non-primitive value is iterable, its elements are extracted via iteration
   * (in addition to its own keyed properties controlled by `maxPrototypeDepth`). When `false`,
   * iteration is skipped even when the value is iterable. Defaults to `true`. Set to `false` for
   * categories whose iteration is not meaningful for display, e.g. functions.
   */
  declare readonly extractIterableElements?: boolean;

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.id;
    };
  }

  /** Class constructor */
  constructor(params: MTypes.Data<Type>) {
    super();
    Object.assign(this, params);
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
 * Constructor of a `PPNonPrimitiveParameters`. Only `id` and `isApplicableTo` are required; every
 * other field is optional and falls back to the module-level default after merging.
 *
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type => new Type(params);

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
 * Returns the `isApplicableTo` property of `self`
 *
 * @category Getters
 */
export const isApplicableTo: MTypes.OneArgFunction<
  Type,
  Predicate.Predicate<MTypes.NonPrimitive>
> = Struct.get('isApplicableTo');

/**
 * `PPNonPrimitiveParameters` instance for functions. Functions are displayed as `util.inspect` does
 * (e.g. `[Function: foo]`, or `[Function: (anonymous)]` when the function has no name)
 *
 * @category Instances
 */
export const utilInspectLikeFunction: Type = make({
  id: 'UtilInspectLikeFunction',
  isApplicableTo: MTypes.isFunction,
  byPasser: PPByPasser.allWithName,
});

/**
 * `PPNonPrimitiveParameters` instance for iterables (Arrays, Maps, Sets, HashMaps, HashSets, typed
 * arrays...). Always shows the value's name and total element count in the header, e.g. `Map(1) {
 * 'A' => 2 }`. The name itself comes from `PPParameters.name`, whose default uses
 * `value.constructor.name`, so this transparently handles `Map`, `Set`, `WeakMap`, `WeakSet`,
 * `Int8Array`, `Float32Array`, etc. as well as user-defined iterable classes.
 *
 * @category Instances
 */
export const utilInspectLikeIterable: Type = make({
  id: 'UtilInspectLikeIterable',
  isApplicableTo: MTypes.isIterable,
  showName: true,
  propertyFormatter: PPPropertyFormatter.utilInspectLikeIterable,
  propertyNumberDisplayOption: PPPropertyNumberDisplayOption.Type.All,
  maxPrototypeDepth: 0,
  extractIterableElements: true,
  maxPropertyNumber: 100,
});

/**
 * `PPNonPrimitiveParameters` instance for arrays. Shows `[Array]` when `maxDepth` is exceeded;
 * otherwise displays the array as `util.inspect` does (e.g. `[ 3, 4 ]`). The contents are extracted
 * through iteration; properties of the array object (e.g. `length`) are not displayed unless you
 * change `maxPrototypeDepth` to 1 or more.
 *
 * Note: this instance must be placed **before** `utilInspectLikeIterable` in the
 * `nonPrimitiveParametersArray` (lower index = higher priority during merge). It explicitly resets
 * `showName`, `propertyNumberDisplayOption` and `propertyFormatter` because, when an array is
 * processed, `utilInspectLikeIterable` (which is also applicable) would otherwise contribute its
 * iterable-style values for those fields.
 *
 * @category Instances
 */
export const utilInspectLikeArray: Type = make({
  id: 'UtilInspectLikeArray',
  isApplicableTo: MTypes.isArray,
  nonPrimitiveFormatter: PPNonPrimitiveFormatter.utilInspectLikeArray,
  showName: false,
  propertyFormatter: PPPropertyFormatter.utilInspectLikeArrayAndRecord,
  propertyNumberDisplayOption: PPPropertyNumberDisplayOption.Type.None,
});

/**
 * Catch-all `PPNonPrimitiveParameters` instance used to treeify any non-primitive value. Shows leaf
 * keys regardless of whether the keys were auto-generated.
 *
 * @category Instances
 */
export const treeify: Type = make({
  id: 'Treeify',
  isApplicableTo: Function.constTrue,
  nonPrimitiveFormatter: PPNonPrimitiveFormatter.usualTreeify,
  propertyFormatter: PPPropertyFormatter.usualTreeify,
  hideAutoGeneratedKeys: false,
});

/**
 * Same as `treeify` but hides leaf values, only displaying their keys.
 *
 * @category Instances
 */
export const treeifyHideLeaves: Type = make({
  id: 'TreeifyHideLeaves',
  isApplicableTo: Function.constTrue,
  nonPrimitiveFormatter: PPNonPrimitiveFormatter.usualTreeify,
  propertyFormatter: PPPropertyFormatter.usualTreeifyHideLeaves,
  hideAutoGeneratedKeys: false,
});
