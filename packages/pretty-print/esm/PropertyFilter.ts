/**
 * This module implements a type that takes care of filtering properties when printing records.
 * PropertyFilter's can be combined.
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
	Function,
	Hash,
	pipe,
	Pipeable,
	Predicate,
	Struct
} from 'effect';
import * as PPProperties from './Properties.js';
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
	export interface Type extends MTypes.OneArgFunction<PPProperties.Type> {}
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
 * Combines two propertyFilters into one. The action of `self` is applied before the action of
 * `that`
 *
 * @category Utils
 */
export const combine =
	(that: Type) =>
	(self: Type): Type =>
		make({
			id: `${self.id}+${that.id}`,
			action: Function.compose(self, that)
		});

/**
 * PropertyFilter instance that keeps all properties
 *
 * @category Instances
 */
export const keepAll: Type = make({ id: 'keepAll', action: Function.identity });

/**
 * PropertyFilter instance that removes properties of records whose value is not a function
 *
 * @category Instances
 */
export const removeNonFunctions: Type = make({
	id: 'RemoveNonFunctions',
	action: Array.filter(PPValue.isFunction)
});

/**
 * PropertyFilter instance that removes properties of records whose value is a function
 *
 * @category Instances
 */
export const removeFunctions: Type = make({
	id: 'RemoveFunctions',
	action: Array.filter(Predicate.not(PPValue.isFunction))
});

/**
 * PropertyFilter instance that removes non-enumerable properties
 *
 * @category Instances
 */
export const removeNonEnumerables: Type = make({
	id: 'RemoveNonEnumerables',
	action: Array.filter(Struct.get('hasEnumerableKey'))
});

/**
 * PropertyFilter instance that removes enumerable properties
 *
 * @category Instances
 */
export const removeEnumerables: Type = make({
	id: 'RemoveEnumerables',
	action: Array.filter(Predicate.not(Struct.get('hasEnumerableKey')))
});

/**
 * PropertyFilter instance that removes properties with a key of type `string`
 *
 * @category Instances
 */
export const removeStringKeys: Type = make({
	id: 'RemoveStringKeys',
	action: Array.filter(Struct.get('hasSymbolicKey'))
});

/**
 * PropertyFilter instance that removes properties with a key of type `symbol`
 *
 * @category Instances
 */
export const removeSymbolicKeys: Type = make({
	id: 'RemoveSymbolicKeys',
	action: Array.filter(Predicate.not(Struct.get('hasSymbolicKey')))
});

/**
 * PropertyFilter instance that removes properties which are non-enumerable, whose key is symbolic
 * or whose value is a function
 *
 * @category Instances
 */
export const enumerableNonFunctionStringKeys: Type = pipe(
	removeNonEnumerables,
	combine(removeSymbolicKeys),
	combine(removeFunctions)
);

/**
 * Function that returns a propertyFilter instance that keeps only properties whose key is a string
 * that fulfills a predicate
 *
 * @category Instances
 */
export const keepFulfillingKeyPredicate =
	(id: string) =>
	(predicate: Predicate.Predicate<string>): Type =>
		make({
			id,
			action: Array.filter(MPredicate.struct({ stringKey: predicate, hasSymbolicKey: Boolean.not }))
		});

/**
 * PropertyFilter instance that removes non-enumerable properties on arrays but keeps them on other
 * records
 *
 * @category Instances
 */
export const removeNonEnumerablesOnArrays: Type = make({
	id: 'RemoveNonEnumerablesOnArrays',
	action: Array.filter<PPValue.All>(
		Predicate.and(Struct.get('hasEnumerableKey'), Struct.get('belongsToArray'))
	)
});

/**
 * Function that returns a PropertyFilter instance that keeps only the `n` first properties of a
 * record
 *
 * @category Instances
 */
export const take = (n: number): Type =>
	make({ id: `Take ${n} first prop(s)`, action: Array.take(n) });
