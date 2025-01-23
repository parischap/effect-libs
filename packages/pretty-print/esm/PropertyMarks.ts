/**
 * This module implements a type that contains the marks used to print the properties of a record.
 * It is used by the PropertyFormatter module (see PropertyFormatter.ts)
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, pipe, Pipeable, Predicate } from 'effect';

const moduleTag = '@parischap/pretty-print/PropertyMarks/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Interface that lets you specify the marks to print when the key of the property is printed
 *
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/** Id of this PropertyMarks instance. Useful for equality and debugging */
	readonly id: string;
	/** Mark used to seperate the key and the value */
	readonly keyValueSeparator: string;
	/** Mark to prepend to the key as many times as the depth of the property in the prototypal chain */
	readonly prototypePrefix: string;
	/** Mark to append to the key as many times as the depth of the property in the prototypal chain */
	readonly prototypeSuffix: string;
	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/** Prototype */
const _TypeIdHash = Hash.hash(TypeId);
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return pipe(this.id, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this));
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
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * PropertyMarks instance for objects
 *
 * @category Instances
 */
export const object: Type = make({
	id: 'ObjectPropertyMarks',
	keyValueSeparator: ': ',
	prototypePrefix: '',
	prototypeSuffix: '@'
});
