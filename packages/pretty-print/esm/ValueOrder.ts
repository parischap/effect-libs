/**
 * This module implements an order on Value's (see Value.ts) that allows users to sort the
 * properties of records in the order that suits their needs.
 *
 * This module implements several ValueOrder instances. You can define your own if the provided ones
 * don't suit your needs. All you have to do is provide a function that matches Type.
 *
 * In this document, the term `record` refers to a non-null object, an array or a function.
 *
 * @since 0.0.1
 */

import { Order, Struct } from 'effect';
import type * as Value from './Value.js';

/**
 * Type that implements a ValueOrder. For non Effect users, Order<A> is a function that takes two
 * A's, self and that, and returns -1 if self < that, 0 if self === that and 1 if self > that.
 *
 * @since 0.0.1
 * @category Models
 */
export type Type = Order.Order<Value.All>;

/**
 * `ValueOrder` instance based on `prototypalDepth`, lowest depth first
 *
 * @since 0.0.1
 * @category Instances
 */
export const byPrototypalDepth: Type = Order.mapInput(Order.number, Struct.get('protoDepth'));
/**
 * `ValueOrder` instance based on `stringKey`
 *
 * @since 0.0.1
 * @category Instances
 */
export const byStringKey: Type = Order.mapInput(Order.string, Struct.get('stringKey'));

/**
 * `ValueOrder` instance based on the callability of the underlying value property (non functions
 * first, then functions)
 *
 * @since 0.0.1
 * @category Instances
 */
export const byCallability: Type = Order.mapInput(Order.boolean, Struct.get('hasFunctionValue'));

/**
 * `ValueOrder` instance based on the type of the key of the underlying value property (symbolic
 * keys first, then string keys)
 *
 * @since 0.0.1
 * @category Instances
 */
export const byType: Type = Order.mapInput(
	Order.reverse(Order.boolean),
	Struct.get('hasSymbolicKey')
);

/**
 * `ValueOrder` instance based on the enumerability of the key of the underlying value property
 * (non-enumerable keys first, then enumerable keys)
 *
 * @since 0.0.1
 * @category Instances
 */
export const byEnumerability: Type = Order.mapInput(Order.boolean, Struct.get('hasEnumerableKey'));
