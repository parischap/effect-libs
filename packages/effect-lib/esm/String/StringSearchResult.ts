/**
 * Result type of the search operations exposed by {@link "./String.js" | `MString`}: a substring
 * match together with the half-open `[startIndex, endIndex)` range it covers.
 *
 * ## Mental model
 *
 * - **`Type`** is an `Equal`-aware value object built on
 *   {@link "../Data/EquivalenceBasedEqualityData.js" | `MEquivalenceBasedEqualityData.Class`}.
 * - Two results are equal iff their `startIndex`, `endIndex` and `match` all coincide.
 * - The {@link areOverlapping} `Equivalence` is **not** an equality — two matches may overlap without
 *   being equal.
 * - Three orderings are provided: by start, by end, and a "longest first" ordering useful when
 *   resolving overlapping matches.
 *
 * ## Common tasks
 *
 * - **Construct**: {@link make}
 * - **Compare**: {@link equivalence}, {@link areOverlapping}
 * - **Order**: {@link byStartIndex}, {@link byEndIndex}, {@link byLongestFirst}
 * - **Field access**: {@link startIndex}, {@link endIndex}, {@link match}
 */

import type * as Equivalence from 'effect/Equivalence';
import * as Hash from 'effect/Hash';
import * as Order from 'effect/Order';
import * as Predicate from 'effect/Predicate';
import * as Struct from 'effect/Struct';

import type * as MTypes from '../types/types.js';

import * as MData from '../Data/Data.js';
import * as MEquivalenceBasedEqualityData from '../Data/EquivalenceBasedEqualityData.js';

/**
 * Module tag.
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/effect-lib/String/StringSearchResult/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type of a search result: the matched substring and its `[startIndex, endIndex)` range.
 *
 * @category Models
 */
export class Type extends MEquivalenceBasedEqualityData.Class {
  /** The index where the match was found in the target string */
  readonly startIndex: number;
  /** The index of the character following the match in the target string */
  readonly endIndex: number;
  /** The match */
  readonly match: string;

  /** Class constructor */
  private constructor({ startIndex, endIndex, match }: MTypes.Data<Type>) {
    super();
    this.startIndex = startIndex;
    this.endIndex = endIndex;
    this.match = match;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Returns the `id` of `this` */
  [MData.idSymbol](): string | (() => string) {
    return moduleTag;
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
 * Builds a search result.
 *
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type => Type.make(params);

/**
 * `Equivalence` that holds when two results share `startIndex`, `endIndex` and `match`. This is the
 * equivalence used by `Equal.equals` on instances.
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  self.startIndex === that.startIndex &&
  self.endIndex === that.endIndex &&
  self.match === that.match;

/**
 * `Equivalence` that holds when two results' ranges overlap (touching at a single index counts as
 * overlapping). Not an equality; use {@link equivalence} for that.
 *
 * @category Equivalences
 */
export const areOverlapping: Equivalence.Equivalence<Type> = (self, that) =>
  self.endIndex >= that.startIndex && self.startIndex <= that.endIndex;

/**
 * Ordering on `startIndex` (ascending).
 *
 * @category Ordering
 */
export const byStartIndex: Order.Order<Type> = Order.mapInput(
  Order.Number,
  (self: Type) => self.startIndex,
);

/**
 * Ordering on `endIndex` (ascending).
 *
 * @category Ordering
 */
export const byEndIndex: Order.Order<Type> = Order.mapInput(
  Order.Number,
  (self: Type) => self.endIndex,
);

/**
 * Ordering that places the longest match first when two results share the same `startIndex`.
 *
 * - Use to disambiguate overlapping matches in favor of the most specific one.
 *
 * @category Ordering
 */
export const byLongestFirst: Order.Order<Type> = Order.combine(
  byStartIndex,
  Order.flip(byEndIndex),
);

/**
 * Returns the `startIndex` field of `self`.
 *
 * @category Getters
 */
export const startIndex: MTypes.OneArgFunction<Type, number> = Struct.get('startIndex');

/**
 * Returns the `endIndex` field of `self`.
 *
 * @category Getters
 */
export const endIndex: MTypes.OneArgFunction<Type, number> = Struct.get('endIndex');

/**
 * Returns the `match` field of `self`.
 *
 * @category Getters
 */
export const match: MTypes.OneArgFunction<Type, string> = Struct.get('match');
