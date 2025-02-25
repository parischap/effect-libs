/**
 * This module implements a type that takes care of filtering properties when printing non primitive
 * values.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { MFunction, MInspectable, MPipeable, MPredicate, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Boolean,
	Equal,
	Equivalence,
	Hash,
	pipe,
	Pipeable,
	Predicate,
	Struct
} from 'effect';
import * as PPValue from './Value.js';
import * as PPValues from './Values.js';

export const moduleTag = '@parischap/pretty-print/ValueFilter/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a ValueFilter used as an action
 *
 * @category Models
 */
export namespace Action {
	/**
	 * Type of the action
	 *
	 * @category Models
	 */
	export interface Type extends MTypes.OneArgFunction<PPValues.Type> {}
}

/**
 * Type that represents a ValueFilter.
 *
 * @category Models
 */
export interface Type
	extends Action.Type,
		Equal.Equal,
		MInspectable.Inspectable,
		Pipeable.Pipeable {
	/** Id of this ValueFilter instance. Useful for equality and debugging */
	readonly id: string;

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

/** Base */
const _TypeIdHash = Hash.hash(_TypeId);
const base: MTypes.Proto<Type> = {
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
export const make = ({ id, action }: { readonly id: string; readonly action: Action.Type }): Type =>
	Object.assign(MFunction.clone(action), {
		id,
		...base
	});

/**
 * Returns the `id` property of `self`
 *
 * @category Destructors
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

/**
 * ValueFilter instance that removes properties of non-primitive values whose value is not a
 * function
 *
 * @category Instances
 */
export const removeNonFunctions: Type = make({
	id: 'RemoveNonFunctions',
	action: Array.filter(PPValue.isFunction)
});

/**
 * ValueFilter instance that removes properties of non-primitive values whose value is a function
 *
 * @category Instances
 */
export const removeFunctions: Type = make({
	id: 'RemoveFunctions',
	action: Array.filter(Predicate.not(PPValue.isFunction))
});

/**
 * ValueFilter instance that removes non-enumerable properties of non-primitive values
 *
 * @category Instances
 */
export const removeNonEnumerables: Type = make({
	id: 'RemoveNonEnumerables',
	action: Array.filter(PPValue.isEnumerable)
});

/**
 * ValueFilter instance that removes enumerable properties of non-primitive values
 *
 * @category Instances
 */
export const removeEnumerables: Type = make({
	id: 'RemoveEnumerables',
	action: Array.filter(Predicate.not(PPValue.isEnumerable))
});

/**
 * ValueFilter instance that removes properties of non-primitive values with a string key
 *
 * @category Instances
 */
export const removeStringKeys: Type = make({
	id: 'RemoveStringKeys',
	action: Array.filter(PPValue.hasSymbolicKey)
});

/**
 * ValueFilter instance that removes properties of non-primitive values with a symbolic key
 *
 * @category Instances
 */
export const removeSymbolicKeys: Type = make({
	id: 'RemoveSymbolicKeys',
	action: Array.filter(Predicate.not(PPValue.hasSymbolicKey))
});

/**
 * Constructor of a propertyFilter instance that removes properties of non-primitive values whose
 * key is:
 *
 * - A string that does not fulfill `predicate`
 * - A symbol
 *
 * @category Constructors
 */
export const removeNotFulfillingKeyPredicate = ({
	id,
	predicate
}: {
	readonly id: string;
	readonly predicate: Predicate.Predicate<string>;
}): Type =>
	make({
		id,
		action: Array.filter(
			MPredicate.struct({ oneLineStringKey: predicate, hasSymbolicKey: Boolean.not })
		)
	});
