/**
 * In this module, the term `record` refers to a non-null object, an array or a function.
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
import { Equal, Equivalence, Hash, Pipeable, Predicate } from 'effect';

const moduleTag = '@parischap/pretty-print/IndentMode/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Interface that defines an IndentMode
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this IndentMode instance. Useful for equality and debugging
	 *
	 * @since 0.0.1
	 */
	readonly id: string;
	/**
	 * Filler prepended to the first line of the stringified representation of each property except
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

/**
 * Equivalence
 *
 * @since 0.0.1
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
 * @since 0.0.1
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * IndentMode instance for tabified output. Uses 2 spaces as tabs.
 *
 * @since 0.0.1
 * @category Instances
 */
export const tab: Type = make({
	id: 'TabIndentMode',
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
export const tree: Type = make({
	id: 'TreeIndentMode',
	initPropFirstLine: '├─ ',
	lastPropFirstLine: '└─ ',
	initPropTailLines: '│  ',
	lastPropTailLines: '   '
});
