/**
 * In this module, the term `record` refers to a non-null object, an array or a function.
 *
 * This module implements a type that contains the marks used to print the extremities of a record.
 * It is used by the RecordMarks module (see RecordMarks.ts)
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.0.1
 */

import { MInspectable, MPipeable, MString, MStruct, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, Option, pipe, Pipeable, Predicate } from 'effect';

const moduleTag = '@parischap/pretty-print/RecordExtremityMarks/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Interface that represents a RecordExtremityMarks
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this RecordExtremityMarks instance. Useful for equality and debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;
	/**
	 * Start mark - Note that passing an empty string is not the same as passing an `Option.none`. An
	 * empty string will result an a blank line when printing on multiple lines
	 *
	 * @since 0.0.1
	 */
	readonly start: Option.Option<string>;
	/**
	 * End mark - Note that passing an empty string is not the same as passing an `Option.none`. An
	 * empty string will result an a blank line when printing on multiple lines
	 *
	 * @since 0.0.1
	 */
	readonly end: Option.Option<string>;
	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @since 0.0.1
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.name === self.name;

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return Hash.cached(this, Hash.hash(this.name));
	},
	[MInspectable.NameSymbol](this: Type) {
		return this.name;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/**
 * Constructor
 *
 * @since 0.0.1
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Empty RecordExtremityMarks instance.
 *
 * @since 0.0.1
 * @category Instances
 */
export const none: Type = make({
	name: 'NoMarks',
	start: Option.some(''),
	end: Option.none()
});

/**
 * RecordExtremityMarks instance for arrays output on multiple lines.
 *
 * @since 0.0.1
 * @category Instances
 */
export const multiLineArray: Type = make({
	name: 'multiLineArrayExtremityMarks',
	start: Option.some('['),
	end: Option.some(']')
});

/**
 * RecordExtremityMarks instance for arrays output on a single line.
 *
 * @since 0.0.1
 * @category Instances
 */
export const singleLineArray: Type = pipe(
	multiLineArray,
	MStruct.set({ name: 'SingleLineArrayExtremityMarks' }),
	make
);

/**
 * RecordExtremityMarks instance for object output on multiple lines.
 *
 * @since 0.0.1
 * @category Instances
 */
export const multiLineObject: Type = make({
	name: 'MultiLineObjectExtremityMarks',
	start: Option.some('{'),
	end: Option.some('}')
});

/**
 * RecordExtremityMarks instance for objects output on a single line.
 *
 * @since 0.0.1
 * @category Instances
 */
export const singleLineObject: Type = make({
	name: 'SingleLineObjectExtremityMarks',
	start: Option.map(multiLineObject.start, MString.append(' ')),
	end: Option.map(multiLineObject.end, MString.prepend(' '))
});
