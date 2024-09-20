/**
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * A PropertyFilter is a function which lets you specify which properties of a record you want to
 * print. PropertyFilter's can be combined.
 *
 * Several PropertyFilter instances are provided by this module (removeNonFunctions,
 * removeNonEnumerables...). But you can define your own PropertyFilter's if the provided ones don't
 * suit your needs. All you have to do is provide a function that matches Type.
 *
 * @since 0.0.1
 */

import { MMatch, MTypes } from '@parischap/effect-lib';
import { Array, Boolean, flow, Function, pipe, Predicate, Struct } from 'effect';
import type * as Value from './Value.js';

/**
 * Type that represents a PropertyFilter. `value` is the Value (see Value.ts) representing the
 * record whose properties you are filtering and `properties` is an array of Value's representing
 * the properties of that record. Based on these two parameters, the function must return the array
 * of those properties that will be printed.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type {
	(value: Value.RecordType): (properties: Value.Properties) => Value.Properties;
}

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
	(value) =>
		Function.compose(self(value), that(value));

/**
 * PropertyFilter instance that keeps all properties
 *
 * @since 0.0.1
 * @category Instances
 */
export const keepAll: Type = () => Function.identity;

/**
 * PropertyFilter instance that removes properties of records whose value is not a function
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeNonFunctions: Type = () => (props: Value.Properties) =>
	Array.filter(props, Struct.get('hasFunctionValue'));

/**
 * PropertyFilter instance that removes properties of records whose value is a function
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeFunctions: Type = () => (props: Value.Properties) =>
	Array.filter(props, Predicate.not(Struct.get('hasFunctionValue')));

/**
 * PropertyFilter instance that removes non-enumerable properties
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeNonEnumerables: Type = () => (props: Value.Properties) =>
	Array.filter(props, Struct.get('hasEnumerableKey'));

/**
 * PropertyFilter instance that removes enumerable properties
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeEnumerables: Type = () => (props: Value.Properties) =>
	Array.filter(props, Predicate.not(Struct.get('hasEnumerableKey')));

/**
 * PropertyFilter instance that removes properties with a key of type `string`
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeStringKeys: Type = () => (props: Value.Properties) =>
	Array.filter(props, Struct.get('hasSymbolicKey'));

/**
 * PropertyFilter instance that removes properties with a key of type `symbol`
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeSymbolicKeys: Type = () => (props: Value.Properties) =>
	Array.filter(props, Predicate.not(Struct.get('hasSymbolicKey')));

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
 * @category Utils
 */
export const keepFulfillingKeyPredicate =
	(predicate: Predicate.Predicate<string>): Type =>
	() =>
		Array.filter(Predicate.struct({ stringKey: predicate, hasSymbolicKey: Boolean.not }));

/**
 * PropertyFilter instance that removes non-enumerable properties on arrays but keeps them on other
 * records
 *
 * @since 0.0.1
 * @category Instances
 */
export const removeNonEnumerablesOnArrays: Type = flow(
	Struct.get('value'),
	MMatch.make,
	MMatch.when(MTypes.isArray, () => Array.filter<Value.All>(Struct.get('hasEnumerableKey'))),
	MMatch.orElse(() => Function.identity)
);

/**
 * Function that returns a PropertyFilter instance that keeps only the `n` first properties of a
 * record
 *
 * @since 0.0.1
 * @category Utils
 */
export const take =
	(n: number): Type =>
	() =>
		Array.take(n);
