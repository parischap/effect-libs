/**
 * This module implements an order on Property values (see Value.ts) that allows users to sort the
 * properties of records in the order that suits their needs.
 *
 * This module implements several PropertyOrder instances. You can define your own if the provided
 * ones don't suit your needs. All you have to do is provide a function that matches Type.
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
export interface Type extends Order.Order<PPValue.Property.All> {}

/**
 * `PropertyOrder` instance based on `prototypalDepth`, lowest depth first
 *
 * @category Instances
 */
export const byPrototypalDepth: Type = Order.mapInput(Order.number, PPValue.Property.protoDepth);
/**
 * `PropertyOrder` instance based on `stringKey`
 *
 * @category Instances
 */
export const byOneLineStringKey: Type = Order.mapInput(
	Order.string,
	PPValue.Property.oneLineStringKey
);

/**
 * `PropertyOrder` instance based on the callability of the underlying value property (non functions
 * first, then functions)
 *
 * @category Instances
 */
export const byCallability: Type = Order.mapInput(
	Order.boolean,
	flow(PPValue.valueCategory, MFunction.strictEquals(MTypes.Category.Type.Function))
);

/**
 * `PropertyOrder` instance based on the type of the key of the underlying value property (symbolic
 * keys first, then string keys)
 *
 * @category Instances
 */
export const byType: Type = Order.mapInput(
	Order.reverse(Order.boolean),
	PPValue.Property.hasSymbolicKey
);

/**
 * `PropertyOrder` instance based on the enumerability of the key of the underlying value property
 * (non-enumerable keys first, then enumerable keys)
 *
 * @category Instances
 */
export const byEnumerability: Type = Order.mapInput(Order.boolean, PPValue.Property.isEnumerable);
