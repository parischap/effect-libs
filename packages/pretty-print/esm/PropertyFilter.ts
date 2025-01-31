/**
 * This module implements a type that takes care of filtering properties when printing non primitive
 * values.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { MInspectable, MPipeable, MPredicate, MTypes } from '@parischap/effect-lib';
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

const moduleTag = '@parischap/pretty-print/PropertyFilter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Namespace of a PropertyFilter used as an action
 *
 * @category Models
 */
export namespace Action {
	/**
	 * Type of the action
	 *
	 * @category Models
	 */
	export interface Type extends MTypes.OneArgFunction<PPValue.Properties.Type> {}
}

/**
 * Type that represents a PropertyFilter.
 *
 * @category Models
 */
export interface Type
	extends Action.Type,
		Equal.Equal,
		MInspectable.Inspectable,
		Pipeable.Pipeable {
	/** Id of this PropertyFilter instance. Useful for equality and debugging */
	readonly id: string;

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

/** Base */
const _TypeIdHash = Hash.hash(TypeId);
const base: MTypes.Proto<Type> = {
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
export const make = ({ id, action }: { readonly id: string; readonly action: Action.Type }): Type =>
	Object.assign(action.bind({}), {
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
 * PropertyFilter instance that keeps properties of records whose value is a function
 *
 * @category Instances
 */
export const keepFunctions: Type = make({
	id: 'keepFunctions',
	action: Array.filter(PPValue.Property.isFunction)
});

/**
 * PropertyFilter instance that keeps properties of records whose value is not a function
 *
 * @category Instances
 */
export const keepNonFunctions: Type = make({
	id: 'keepNonFunctions',
	action: Array.filter(Predicate.not(PPValue.Property.isFunction))
});

/**
 * PropertyFilter instance that keeps enumerable properties of records
 *
 * @category Instances
 */
export const keepEnumerables: Type = make({
	id: 'keepEnumerables',
	action: Array.filter(PPValue.Property.isEnumerable)
});

/**
 * PropertyFilter instance that keeps non-enumerable properties of records
 *
 * @category Instances
 */
export const keepNonEnumerables: Type = make({
	id: 'keepNonEnumerables',
	action: Array.filter(Predicate.not(PPValue.Property.isEnumerable))
});

/**
 * PropertyFilter instance that keeps properties of records with a symbolic key
 *
 * @category Instances
 */
export const keepSymbolicKeys: Type = make({
	id: 'keepSymbolicKeys',
	action: Array.filter(PPValue.Property.hasSymbolicKey)
});

/**
 * PropertyFilter instance that keeps properties of records with a string key
 *
 * @category Instances
 */
export const keepStringKeys: Type = make({
	id: 'keepStringKeys',
	action: Array.filter(Predicate.not(PPValue.Property.hasSymbolicKey))
});

/**
 * Constructor of a propertyFilter instance that keeps properties of records whose key is a string
 * that fulfills a predicate
 *
 * @category Constructors
 */
export const keepFulfillingKeyPredicate =
	(id: string) =>
	(predicate: Predicate.Predicate<string>): Type =>
		make({
			id,
			action: Array.filter(
				MPredicate.struct({ oneLineStringKey: predicate, hasSymbolicKey: Boolean.not })
			)
		});
