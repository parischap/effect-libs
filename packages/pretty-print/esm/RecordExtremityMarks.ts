/**
 * This module implements a type that contains the marks used to print the extremities of a record.
 * It is used by the RecordMarks module (see RecordMarks.ts)
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { MInspectable, MPipeable, MString, MStruct, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, Option, pipe, Pipeable, Predicate } from 'effect';

const moduleTag = '@parischap/pretty-print/RecordExtremityMarks/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Interface that represents a RecordExtremityMarks
 *
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/** Id of this RecordExtremityMarks instance. Useful for equality and debugging */
	readonly id: string;
	/**
	 * Start mark - Note that passing an empty string is not the same as passing an `Option.none`. An
	 * empty string will result an a blank line when printing on multiple lines
	 */
	readonly start: Option.Option<string>;
	/**
	 * End mark - Note that passing an empty string is not the same as passing an `Option.none`. An
	 * empty string will result an a blank line when printing on multiple lines
	 */
	readonly end: Option.Option<string>;
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
 * Empty RecordExtremityMarks instance.
 *
 * @category Instances
 */
export const none: Type = make({
	id: 'NoMarks',
	start: Option.some(''),
	end: Option.none()
});

/**
 * RecordExtremityMarks instance for arrays output on multiple lines.
 *
 * @category Instances
 */
export const multiLineArray: Type = make({
	id: 'multiLineArrayExtremityMarks',
	start: Option.some('['),
	end: Option.some(']')
});

/**
 * RecordExtremityMarks instance for arrays output on a single line.
 *
 * @category Instances
 */
export const singleLineArray: Type = pipe(
	multiLineArray,
	MStruct.set({ id: 'SingleLineArrayExtremityMarks' }),
	make
);

/**
 * RecordExtremityMarks instance for object output on multiple lines.
 *
 * @category Instances
 */
export const multiLineObject: Type = make({
	id: 'MultiLineObjectExtremityMarks',
	start: Option.some('{'),
	end: Option.some('}')
});

/**
 * RecordExtremityMarks instance for objects output on a single line.
 *
 * @category Instances
 */
export const singleLineObject: Type = make({
	id: 'SingleLineObjectExtremityMarks',
	start: Option.map(multiLineObject.start, MString.append(' ')),
	end: Option.map(multiLineObject.end, MString.prepend(' '))
});
