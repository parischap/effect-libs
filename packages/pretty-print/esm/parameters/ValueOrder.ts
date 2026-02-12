/**
 * Module that implements an Order on PPValue.Any
 *
 * You can define your own if the provided instances don't suit your needs
 */

import { MTypesCategory } from '@parischap/effect-lib';
import { flow, Order } from 'effect';
import * as PPValue from '../internal/Value.js';

/**
 * Type of a PPValueOrder
 *
 * @category Models
 */
export interface Type extends Order.Order<PPValue.Any> {}
/**
 * Order instance based on the `protoDepth` property, lowest depth first
 *
 * @category Ordering
 */
export const byProtoDepth: Type = Order.mapInput(Order.number, PPValue.protoDepth);

/**
 * Order instance based on the `oneLineStringKey` property
 *
 * @category Ordering
 */
export const byOneLineStringKey: Type = Order.mapInput(Order.string, PPValue.oneLineStringKey);

/**
 * Order instance based on the callability of the `content` property (non functions first, then
 * functions)
 *
 * @category Ordering
 */
export const byCallability: Type = Order.mapInput(
  Order.boolean,
  flow(PPValue.contentType, MTypesCategory.isFunction),
);

/**
 * Order instance based on the type of the key associated to the value (symbolic keys first, then
 * string keys)
 *
 * @category Ordering
 */
export const byKeyType: Type = Order.mapInput(Order.reverse(Order.boolean), PPValue.hasSymbolicKey);

/**
 * Order instance based on the enumerability of the property to which the value belongs
 * (non-enumerable keys first, then enumerable keys)
 *
 * @category Ordering
 */
export const byEnumerability: Type = Order.mapInput(Order.boolean, PPValue.isEnumerable);
