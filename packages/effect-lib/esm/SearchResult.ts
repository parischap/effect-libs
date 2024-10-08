/**
 * This module implements a type that represents the result of the search of a string in another
 * string. Used by the String module (see String.ts)
 *
 * @since 0.0.6
 */

import { Equal, Equivalence, Hash, Inspectable, Order, Predicate } from 'effect';
import * as MInspectable from './Inspectable.js';
import * as MTypes from './types.js';

const moduleTag = '@parischap/effect-lib/SearchResult/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Interface that represents a SearchResult
 *
 * @since 0.0.6
 * @category Models
 */
export interface Type extends Equal.Equal, Inspectable.Inspectable {
	/**
	 * The index where the match was found in the target string
	 *
	 * @since 0.0.6
	 */
	readonly startIndex: number;
	/**
	 * The index of the character following the match in the target string
	 *
	 * @since 0.0.6
	 */
	readonly endIndex: number;
	/**
	 * The match
	 *
	 * @since 0.0.6
	 */
	readonly match: string;
	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @since 0.0.6
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence
 *
 * @since 0.0.6
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
	that.startIndex === self.startIndex &&
	that.endIndex === self.endIndex &&
	that.match === self.match;

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return Hash.cached(this, Hash.structure(this));
	},
	...MInspectable.BaseProto(moduleTag)
};

/**
 * Constructor
 *
 * @since 0.0.6
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * SearchResult Order based on the startIndex
 *
 * @since 0.0.6
 * @category Ordering
 */
export const byStartIndex = Order.mapInput(Order.number, (self: Type) => self.startIndex);

/**
 * SearchResult Order based on the endIndex
 *
 * @since 0.0.6
 * @category Ordering
 */
export const byEndIndex = Order.mapInput(Order.number, (self: Type) => self.endIndex);

/**
 * SearchResult Order that gives precedence to the first longest SearchResult.
 *
 * @since 0.0.6
 * @category Ordering
 */
export const byLongestFirst = Order.combine(byStartIndex, Order.reverse(byEndIndex));

/**
 * Equivalence, two SearchResult's are considered equivalent if they overlap
 *
 * @since 0.0.6 Equivalence
 */
export const overlappingEquivalence: Equivalence.Equivalence<Type> = (self: Type, that: Type) =>
	self.endIndex >= that.startIndex && self.startIndex <= that.endIndex;
