/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * This module implements a type that contains the marks used when printing a record. It is used by
 * the RecordFormatter module (see RecordFormatter.ts)
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.0.1
 */

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, Inspectable, Pipeable, Predicate } from 'effect';
import * as RecordExtremityMarks from './RecordExtremityMarks.js';

const moduleTag = '@parischap/pretty-print/RecordMarks/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Interface that represents a RecordMarks
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this RecordMarks instance. Useful when debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;
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
	readonly arrayMarks: RecordExtremityMarks.Type;
	/**
	 * Marks inserted at the start/end of an object.
	 *
	 * @since 0.0.1
	 */
	readonly objectMarks: RecordExtremityMarks.Type;
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

/** Equivalence */
const _equivalence: Equivalence.Equivalence<Type> = (self: Type, that: Type) =>
	that.name === self.name;

export {
	/**
	 * Equivalence
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	_equivalence as Equivalence
};

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && _equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return Hash.cached(this, Hash.hash(this.name));
	},
	...MInspectable.BaseProto(moduleTag),
	toJSON(this: Type) {
		return this.name === '' ? this : this.name;
	},
	...MPipeable.BaseProto
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor without a name
 *
 * @since 0.0.1
 * @category Constructors
 */
export const make = (params: Omit<MTypes.Data<Type>, 'name'>): Type =>
	_make({ ...params, name: '' });

/**
 * Returns a copy of `self` with `name` set to `name`
 *
 * @since 0.0.1
 * @category Utils
 */
export const setName =
	(name: string) =>
	(self: Type): Type =>
		_make({ ...self, name: name });

/**
 * Empty RecordMarks instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const none: Type = _make({
	name: 'noMarks',
	propertySeparator: '',
	arrayMarks: RecordExtremityMarks.none,
	objectMarks: RecordExtremityMarks.none
});

/**
 * RecordMarks instance for array and object output on multiple lines.
 *
 * @since 0.0.1
 * @category Instances
 */
export const multiLine: Type = _make({
	name: 'multiLineRecordMarks',
	propertySeparator: ',',
	arrayMarks: RecordExtremityMarks.multiLineArray,
	objectMarks: RecordExtremityMarks.multiLineObject
});

/**
 * Default RecordMarks instance for array and object output on single lines.
 *
 * @since 0.0.1
 * @category Instances
 */
export const singleLine: Type = _make({
	name: 'singleLineRecordMarks',
	propertySeparator: multiLine.propertySeparator + ' ',
	arrayMarks: RecordExtremityMarks.singleLineArray,
	objectMarks: RecordExtremityMarks.singleLineObject
});
