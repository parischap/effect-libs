/**
 * This module implements a type that contains the marks used when printing a record. It is used by
 * the RecordFormatter module (see RecordFormatter.ts)
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.0.1
 */

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, pipe, Pipeable, Predicate } from 'effect';
import * as PPRecordExtremityMarks from './RecordExtremityMarks.js';

const moduleTag = '@parischap/pretty-print/RecordMarks/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Interface that represents a RecordMarks
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Id of this RecordMarks instance. Useful for equality and debugging
	 *
	 * @since 0.0.1
	 */
	readonly id: string;
	/**
	 * Separator inserted between the properties of a record
	 *
	 * @since 0.0.1
	 */
	readonly propertySeparator: string;
	/**
	 * Marks inserted at the start/end of an array.
	 *
	 * @since 0.0.1
	 */
	readonly arrayMarks: PPRecordExtremityMarks.Type;
	/**
	 * Marks inserted at the start/end of an object.
	 *
	 * @since 0.0.1
	 */
	readonly objectMarks: PPRecordExtremityMarks.Type;
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
 * @since 0.0.1
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Empty RecordMarks instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const none: Type = make({
	id: 'NoMarks',
	propertySeparator: '',
	arrayMarks: PPRecordExtremityMarks.none,
	objectMarks: PPRecordExtremityMarks.none
});

/**
 * RecordMarks instance for array and object output on multiple lines.
 *
 * @since 0.0.1
 * @category Instances
 */
export const multiLine: Type = make({
	id: 'MultiLineRecordMarks',
	propertySeparator: ',',
	arrayMarks: PPRecordExtremityMarks.multiLineArray,
	objectMarks: PPRecordExtremityMarks.multiLineObject
});

/**
 * Default RecordMarks instance for array and object output on single lines.
 *
 * @since 0.0.1
 * @category Instances
 */
export const singleLine: Type = make({
	id: 'SingleLineRecordMarks',
	propertySeparator: multiLine.propertySeparator + ' ',
	arrayMarks: PPRecordExtremityMarks.singleLineArray,
	objectMarks: PPRecordExtremityMarks.singleLineObject
});
