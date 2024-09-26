/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * This module implements a type that takes care of indentation when printing a record on multiple
 * lines. It is used by the RecordFormatter module (see RecordFormatter.ts)
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.0.1
 */

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, Inspectable, Pipeable, Predicate } from 'effect';

const moduleTag = '@parischap/pretty-print/IndentMode/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Interface that defines an IndentMode
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this IndentMode instance. Useful when debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;
	/**
	 * Filler prepended to the first line of the stringified representation of each property, except
	 * the last, of a record
	 *
	 * @since 0.0.1
	 */
	readonly initPropFirstLine: string;
	/**
	 * Filler prepended to the first line of the stringified representation of the last property of a
	 * record
	 *
	 * @since 0.0.1
	 */
	readonly lastPropFirstLine: string;
	/**
	 * Filler prepended to the all lines but the first of the stringified representation of each
	 * property, except the last, of a record
	 *
	 * @since 0.0.1
	 */
	readonly initPropTailLines: string;
	/**
	 * Filler prepended to the all lines but the first of the stringified representation of the last
	 * property of a record
	 *
	 * @since 0.0.1
	 */
	readonly lastPropTailLines: string;
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
 * IndentMode instance for tabified output. Uses 2 spaces as tabs.
 *
 * @since 0.0.1
 * @category Instances
 */
export const tab: Type = _make({
	name: 'tabIndentMode',
	initPropFirstLine: '  ',
	lastPropFirstLine: '  ',
	initPropTailLines: '  ',
	lastPropTailLines: '  '
});

/**
 * IndentMode instance for treeified output. Uses horizontal and vertical lines as tabs.
 *
 * @since 0.0.1
 * @category Instances
 */
export const tree: Type = _make({
	name: 'treeIndentMode',
	initPropFirstLine: '├─ ',
	lastPropFirstLine: '└─ ',
	initPropTailLines: '│  ',
	lastPropTailLines: '   '
});
