/**
 * This module implements a type that represents the result of the search of a string in another
 * string. Used by the String module (see String.ts)
 *
 * @since 0.0.6
 */

import { Equal, Equivalence, Hash, Inspectable, Order, Predicate } from 'effect';
import * as MTypes from './types.js';

const moduleTag = '@parischap/effect-lib/SearchResult/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;

/**
 * @since 0.0.6
 * @category Symbol
 */
export type TypeId = typeof TypeId;

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
 * Returns true if `u` is a SearchResult
 *
 * @since 0.0.6
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

/** SearchResult equivalence */
const _equivalence: Equivalence.Equivalence<Type> = (self: Type, that: Type) =>
	that.startIndex === self.startIndex &&
	that.endIndex === self.endIndex &&
	that.match === self.match;

export {
	/**
	 * SearchResult equivalence
	 *
	 * @since 0.0.6
	 * @category Instances
	 */
	_equivalence as Equivalence
};

/** SearchResult prototype */
const searchResultProto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && _equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return Hash.cached(this, Hash.structure(this));
	},
	toJSON(this: Type) {
		return {
			startIndex: Inspectable.toJSON(this.startIndex),
			endIndex: Inspectable.toJSON(this.endIndex),
			match: Inspectable.toJSON(this.match)
		};
	},
	[Inspectable.NodeInspectSymbol](this: Type) {
		return this.toJSON();
	},
	toString(this: Type) {
		return Inspectable.format(this.toJSON());
	}
};

/**
 * Constructs a SearchResult
 *
 * @since 0.0.6
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(searchResultProto, params);

/**
 * Order on a Type based on the startIndex
 *
 * @since 0.0.6
 * @category Ordering
 */
export const byStartIndex = Order.mapInput(Order.number, (self: Type) => self.startIndex);

/**
 * Order on a Type based on the endIndex
 *
 * @since 0.0.6
 * @category Ordering
 */
export const byEndIndex = Order.mapInput(Order.number, (self: Type) => self.endIndex);

/**
 * Order on a Type based primarily on the startIndex and secondly on the reversed endIndex. So, if
 * two searchResults have the same startIndex, the one with the lowest endIndex will have
 * precedence.
 *
 * @since 0.0.6
 * @category Ordering
 */
export const byStartIndexAndReverseEndIndex = Order.combine(
	byStartIndex,
	Order.reverse(byEndIndex)
);
