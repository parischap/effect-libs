/**
 * This module implements a type that represents the result of the search of a string in another
 * string.
 */

import { Equivalence, Hash, Order, Predicate, Struct } from 'effect';
import * as MDataEquivalenceBasedEquality from '../Data/DataEquivalenceBasedEquality.js';
import * as MData from '../Data/index.js';
import * as MTypes from '../types/index.js';

export const moduleTag = '@parischap/effect-lib/string/StringSearchResult/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a SearchResult
 *
 * @category Models
 */
export class Type extends MDataEquivalenceBasedEquality.Class {
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
 * Equivalence that considers two SearchResult's to be equivalent when all their fields are equal
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  self.startIndex === that.startIndex
  && self.endIndex === that.endIndex
  && self.match === that.match;

/**
 * Equivalence that considers two SearchResult's to be equivalent when they overlap
 *
 * @category Equivalences
 */
export const areOverlapping: Equivalence.Equivalence<Type> = (self, that) =>
  self.endIndex >= that.startIndex && self.startIndex <= that.endIndex;

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type => Type.make(params);

/**
 * SearchResult Order based on the startIndex
 *
 * @category Ordering
 */
export const byStartIndex: Order.Order<Type> = Order.mapInput(
  Order.number,
  (self: Type) => self.startIndex,
);

/**
 * SearchResult Order based on the endIndex
 *
 * @category Ordering
 */
export const byEndIndex: Order.Order<Type> = Order.mapInput(
  Order.number,
  (self: Type) => self.endIndex,
);

/**
 * SearchResult Order that gives precedence to the first longest SearchResult.
 *
 * @category Ordering
 */
export const byLongestFirst: Order.Order<Type> = Order.combine(
  byStartIndex,
  Order.reverse(byEndIndex),
);

/**
 * Returns the `startIndex` property of `self`
 *
 * @category Destructors
 */
export const startIndex: MTypes.OneArgFunction<Type, number> = Struct.get('startIndex');

/**
 * Returns the `endIndex` property of `self`
 *
 * @category Destructors
 */
export const endIndex: MTypes.OneArgFunction<Type, number> = Struct.get('endIndex');

/**
 * Returns the `match` property of `self`
 *
 * @category Destructors
 */
export const match: MTypes.OneArgFunction<Type, string> = Struct.get('match');
