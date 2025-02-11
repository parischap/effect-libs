/**
 * This module implements a map of the different marks that appear in a value to stringify.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, HashMap, pipe, Pipeable, Predicate, Struct } from 'effect';

const moduleTag = '@parischap/pretty-print/MarkMap/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;
namespace Mark {
	export interface Type {
		/** The text to be displayed for this mark */
		readonly text: string;
		/**
		 * The name of the part that this mark belongs to. It will be used to determine the style to
		 * apply (see StyleMap.ts).
		 */
		readonly partName: string;
	}
}

namespace Marks {
	export interface Type extends HashMap.HashMap<string, Mark.Type> {}
}

/**
 * Interface that represents a MarkMap
 *
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/** Id of this MarkMap instance. Useful for equality and debugging. */
	readonly id: string;
	/** Map of the different marks that appear in a value to stringify */
	readonly marks: Marks.Type;

	/** @internal */
	readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/** Prototype */
const _TypeIdHash = Hash.hash(_TypeId);
const proto: MTypes.Proto<Type> = {
	[_TypeId]: _TypeId,
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
 * Returns the `id` property of `self`
 *
 * @category Destructors
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

/**
 * Returns the `marks` property of `self`
 *
 * @category Destructors
 */
export const marks: MTypes.OneArgFunction<Type, Marks.Type> = Struct.get('marks');

/**
 * Default MarkMap instance
 *
 * @category Instances
 */

export const defaults: Type = make({
	id: 'Defaults',
	marks: HashMap.make(
		['FunctionNameStartDelimiter', { text: 'Function: ', partName: 'Message' }],
		['FunctionNameEndDelimiter', { text: '', partName: 'Message' }],
		['MessageStartDelimiter', { text: '[', partName: 'Message' }],
		['MessageEndDelimiter', { text: ']', partName: 'Message' }],
		['CircularObject', { text: 'Circular *', partName: 'Message' }],
		['CircularReferenceStartDelimiter', { text: '<Ref *', partName: 'Message' }],
		['CircularReferenceEndDelimiter', { text: '> ', partName: 'Message' }],
		['TabIndent', { text: '  ', partName: 'Indentation' }],
		['TreeIndentForFirstLineOfInitProps', { text: '├─ ', partName: 'Indentation' }],
		['TreeIndentForTailLinesOfInitProps', { text: '│  ', partName: 'Indentation' }],
		['TreeIndentForFirstLineOfLastProp', { text: '└─ ', partName: 'Indentation' }],
		['TreeIndentForTailLinesOfLastProp', { text: '   ', partName: 'Indentation' }]
	)
});

/**
 * Default MarkMap instance but nullables are not shown
 *
 * @category Instances
 */

export const defaultsHideNullables: Type = make({
	id: 'DefaultsHideNullables',
	marks: pipe(
		defaults.marks,
		HashMap.set('NullValue', { text: '', partName: 'NullValue' }),
		HashMap.set('UndefinedValue', { text: '', partName: 'UndefinedValue' })
	)
});
