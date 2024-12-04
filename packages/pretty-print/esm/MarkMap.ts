/**
 * This module implements a type that represents Mark's (see Mark.ts) identified by their id to be
 * displayed when stringifying a value.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.3.0
 */

import { MInspectable, MPipeable, MStruct, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, flow, Hash, HashMap, Pipeable, Predicate } from 'effect';
import * as PPFormatMap from './FormatMap.js';
import * as PPMark from './Mark.js';

const moduleTag = '@parischap/pretty-print/MarkMap/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Interface that represents a FormatSet
 *
 * @since 0.3.0
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Id of this MarkMap instance. Useful for equality and debugging.
	 *
	 * @since 0.3.0
	 */
	readonly id: string;
	/**
	 * Format applied to the different parts of the value to stringify
	 *
	 * @since 0.3.0
	 */
	readonly marks: HashMap.HashMap<string, PPMark.Type>;

	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @since 0.3.0
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence
 *
 * @since 0.3.0
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return Hash.cached(this, Hash.hash(this.id));
	},
	[MInspectable.IdSymbol](this: Type) {
		return this.id;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/**
 * Constructor
 *
 * @since 0.3.0
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Returns a copy of `self` where all Mark's have been precalced.
 *
 * @since 0.3.0
 * @category Utils
 */
export const preCalc = (formatMap: PPFormatMap.Type): MTypes.OneArgFunction<Type> =>
	flow(
		MStruct.evolve({
			// No infer missing in HashMap.map
			marks: HashMap.map<PPMark.Type, PPMark.Type, string>(PPMark.preCalc(formatMap))
		}),
		make
	);
