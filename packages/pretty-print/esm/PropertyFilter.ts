/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * This module implements a type that takes care of filtering properties when printing records.
 * PropertyFilter's can be combined.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.0.1
 */

import { MInspectable, MMatch, MPipeable, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Boolean,
	Equal,
	Equivalence,
	flow,
	Function,
	Hash,
	Inspectable,
	pipe,
	Pipeable,
	Predicate,
	Struct
} from 'effect';
import type * as Value from './Value.js';

const moduleTag = '@parischap/pretty-print/PropertyFilter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a PropertyFilter.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this PropertyFilter instance. Useful when debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;
	/**
	 * Action of this PropertyFilter. `value` is the Value (see Value.ts) representing the record
	 * whose properties are to be filtered and `properties` is an array of Value's representing the
	 * properties of that record. Based on these two parameters, the function must return the array of
	 * those properties that will be printed.
	 *
	 * @since 0.0.1
	 */
	readonly action: (value: Value.RecordType) => (properties: Value.Properties) => Value.Properties;
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
		_make({
			name: `${self.name}+${that.name}`,
			action: (value) => Function.compose(self.action(value), that.action(value))
		});

/**
 * PropertyFilter instance that keeps all properties
 *
 * @since 0.0.1
 * @category Instances
 */
export const keepAll: Type = _make({ name: 'keepAll', action: () => Function.identity });

/**
 * PropertyFilter instance that removes properties of records whose value is not a function
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeNonFunctions: Type = _make({
	name: 'removeNonFunctions',
	action: () => (props: Value.Properties) => Array.filter(props, Struct.get('hasFunctionValue'))
});

/**
 * PropertyFilter instance that removes properties of records whose value is a function
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeFunctions: Type = _make({
	name: 'removeFunctions',
	action: () => (props: Value.Properties) =>
		Array.filter(props, Predicate.not(Struct.get('hasFunctionValue')))
});

/**
 * PropertyFilter instance that removes non-enumerable properties
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeNonEnumerables: Type = _make({
	name: 'removeNonEnumerables',
	action: () => (props: Value.Properties) => Array.filter(props, Struct.get('hasEnumerableKey'))
});

/**
 * PropertyFilter instance that removes enumerable properties
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeEnumerables: Type = _make({
	name: 'removeEnumerables',
	action: () => (props: Value.Properties) =>
		Array.filter(props, Predicate.not(Struct.get('hasEnumerableKey')))
});

/**
 * PropertyFilter instance that removes properties with a key of type `string`
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeStringKeys: Type = _make({
	name: 'removeStringKeys',
	action: () => (props: Value.Properties) => Array.filter(props, Struct.get('hasSymbolicKey'))
});

/**
 * PropertyFilter instance that removes properties with a key of type `symbol`
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeSymbolicKeys: Type = _make({
	name: 'removeSymbolicKeys',
	action: () => (props: Value.Properties) =>
		Array.filter(props, Predicate.not(Struct.get('hasSymbolicKey')))
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
	(name: string) =>
	(predicate: Predicate.Predicate<string>): Type =>
		_make({
			name,
			action: () =>
				Array.filter(Predicate.struct({ stringKey: predicate, hasSymbolicKey: Boolean.not }))
		});

/**
 * PropertyFilter instance that removes non-enumerable properties on arrays but keeps them on other
 * records
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeNonEnumerablesOnArrays: Type = _make({
	name: 'removeNonEnumerablesOnArrays',
	action: flow(
		Struct.get('value'),
		MMatch.make,
		MMatch.when(MTypes.isArray, () => Array.filter<Value.All>(Struct.get('hasEnumerableKey'))),
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
	_make({ name: `Take ${n} first prop(s)`, action: () => Array.take(n) });
