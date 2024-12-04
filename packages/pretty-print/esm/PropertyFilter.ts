/**
 * In this module, the term `record` refers to a non-null object, an array or a function.
 *
 * This module implements a type that takes care of filtering properties when printing records.
 * PropertyFilter's can be combined.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.0.1
 */

import { MInspectable, MMatch, MPipeable, MPredicate, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Boolean,
	Equal,
	Equivalence,
	flow,
	Function,
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
 * Type of the action of this PropertyFilter. `value` is the Value (see Value.ts) representing the
 * record whose properties are to be filtered and `properties` is an array of Value's representing
 * the properties of that record. Based on these two parameters, the function must return the array
 * of those properties that will be printed.
 */
interface ActionType {
	(value: PPValue.RecordType): (properties: PPValue.Properties) => PPValue.Properties;
}
/**
 * Type that represents a PropertyFilter.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Id of this PropertyFilter instance. Useful for equality and debugging
	 *
	 * @since 0.0.1
	 */
	readonly id: string;

	/**
	 * Action of this PropertyFilter.
	 *
	 * @since 0.0.1
	 */
	readonly action: ActionType;

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
 * Returns the `action` of `self`
 *
 * @since 0.3.0
 * @category Destructors
 */
export const action = (self: Type): ActionType => self.action;

/**
 * Combines two propertyFilters into one. The action of `self` is applied before the action of
 * `that`
 *
 * @since 0.0.1
 * @category Utils
 * @example
 * 	import { PropertyFilter } from '@parischap/pretty-print';
 * 	import { pipe } from 'effect';
 *
 * 	// Creates a propertyFilter that keeps the 5 first properties of a record after removing non-enumerable and symbolic properties
 * 	export const simpleFilter = pipe(
 * 		PropertyFilter.removeNonEnumerables,
 * 		PropertyFilter.combine(PropertyFilter.removeSymbolicKeys),
 * 		PropertyFilter.combine(PropertyFilter.take(5))
 * 	);
 */
export const combine =
	(that: Type) =>
	(self: Type): Type =>
		make({
			id: `${self.id}+${that.id}`,
			action: (value) => Function.compose(self.action(value), that.action(value))
		});

/**
 * PropertyFilter instance that keeps all properties
 *
 * @since 0.0.1
 * @category Instances
 */
export const keepAll: Type = make({ id: 'keepAll', action: () => Function.identity });

/**
 * PropertyFilter instance that removes properties of records whose value is not a function
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeNonFunctions: Type = make({
	id: 'RemoveNonFunctions',
	action: () => Array.filter(PPValue.isRecordWithFunctionValue)
});

/**
 * PropertyFilter instance that removes properties of records whose value is a function
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeFunctions: Type = make({
	id: 'RemoveFunctions',
	action: () => Array.filter(Predicate.not(PPValue.isRecordWithFunctionValue))
});

/**
 * PropertyFilter instance that removes non-enumerable properties
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeNonEnumerables: Type = make({
	id: 'RemoveNonEnumerables',
	action: () => Array.filter(Struct.get('hasEnumerableKey'))
});

/**
 * PropertyFilter instance that removes enumerable properties
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeEnumerables: Type = make({
	id: 'RemoveEnumerables',
	action: () => Array.filter(Predicate.not(Struct.get('hasEnumerableKey')))
});

/**
 * PropertyFilter instance that removes properties with a key of type `string`
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeStringKeys: Type = make({
	id: 'RemoveStringKeys',
	action: () => Array.filter(Struct.get('hasSymbolicKey'))
});

/**
 * PropertyFilter instance that removes properties with a key of type `symbol`
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeSymbolicKeys: Type = make({
	id: 'RemoveSymbolicKeys',
	action: () => Array.filter(Predicate.not(Struct.get('hasSymbolicKey')))
});

/**
 * PropertyFilter instance that removes properties which are non-enumerable, whose key is symbolic
 * or whosevalue is a function
 *
 * @since 0.0.1
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
 * @since 0.0.1
 * @category Instances
 */
export const keepFulfillingKeyPredicate =
	(id: string) =>
	(predicate: Predicate.Predicate<string>): Type =>
		make({
			id,
			action: () =>
				Array.filter(MPredicate.struct({ stringKey: predicate, hasSymbolicKey: Boolean.not }))
		});

/**
 * PropertyFilter instance that removes non-enumerable properties on arrays but keeps them on other
 * records
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeNonEnumerablesOnArrays: Type = make({
	id: 'RemoveNonEnumerablesOnArrays',
	action: flow(
		MMatch.make,
		MMatch.when(PPValue.isArray, () => Array.filter<PPValue.All>(Struct.get('hasEnumerableKey'))),
		MMatch.orElse(() => Function.identity)
	)
});

/**
 * Function that returns a PropertyFilter instance that keeps only the `n` first properties of a
 * record
 *
 * @since 0.0.1
 * @category Instances
 */
export const take = (n: number): Type =>
	make({ id: `Take ${n} first prop(s)`, action: () => Array.take(n) });
