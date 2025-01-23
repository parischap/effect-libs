/**
 * This module implements an order on Value's (see Value.ts) that allows users to sort the
 * properties of records in the order that suits their needs.
 *
 * This module implements several ValueOrder instances. You can define your own if the provided ones
 * don't suit your needs. All you have to do is provide a function that matches Type.
 */

import { MFunction, MTypes } from '@parischap/effect-lib';
import { flow, Order } from 'effect';
import * as PPValue from './Value.js';

/**
 * Type that implements a ValueOrder. For non Effect users, Order<A> is a function that takes two
 * A's, self and that, and returns -1 if self < that, 0 if self === that and 1 if self > that.
 *
 * @category Models
 */
export interface Type extends Order.Order<PPValue.All> {}

/**
 * `ValueOrder` instance based on `prototypalDepth`, lowest depth first
 *
 * @category Instances
 */
export const byPrototypalDepth: Type = Order.mapInput(Order.number, PPValue.protoDepth);
/**
 * `ValueOrder` instance based on `stringKey`
 *
 * @category Instances
 */
export const byStringKey: Type = Order.mapInput(Order.string, PPValue.stringKey);

/**
 * `ValueOrder` instance based on the callability of the underlying value property (non functions
 * first, then functions)
 *
 * @category Instances
 */
export const byCallability: Type = Order.mapInput(
	Order.boolean,
	flow(PPValue.valueCategory, MFunction.strictEquals(MTypes.Category.Type.Function))
);

/**
 * `ValueOrder` instance based on the type of the key of the underlying value property (symbolic
 * keys first, then string keys)
 *
 * @category Instances
 */
export const byType: Type = Order.mapInput(Order.reverse(Order.boolean), PPValue.hasSymbolicKey);

/**
 * `ValueOrder` instance based on the enumerability of the key of the underlying value property
 * (non-enumerable keys first, then enumerable keys)
 *
 * @category Instances
 */
export const byEnumerability: Type = Order.mapInput(Order.boolean, PPValue.hasEnumerableKey);
