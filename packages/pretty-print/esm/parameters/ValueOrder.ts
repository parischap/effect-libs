/**
 * This module implements a type that represents an order on the properties of a non-primitive
 * value. A `PPValueOrder` can be used as the `propertySortOrder` field of a
 * `PPNonPrimitiveParameters` so that properties are sorted before being formatted. Several
 * pre-built orderings are provided (by prototypal depth, by key, by callability, by key type, by
 * enumerability, by source). They can be combined with `Order.combine` from the Effect library if
 * a multi-criteria order is needed.
 */

import { flow, pipe } from 'effect';
import * as Order from 'effect/Order';

import * as MTypesCategory from '@parischap/effect-lib/MTypesCategory';

import * as PPValue from '../internal/stringification/Value.js';

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
export const byProtoDepth: Type = Order.mapInput(Order.Number, PPValue.protoDepth);

/**
 * Order instance based on the `oneLineStringKey` property
 *
 * @category Ordering
 */
export const byOneLineStringKey: Type = Order.mapInput(Order.String, PPValue.oneLineStringKey);

/**
 * Order instance based on the callability of the `content` property (non functions first, then
 * functions)
 *
 * @category Ordering
 */
export const byCallability: Type = Order.mapInput(
  Order.Boolean,
  flow(PPValue.contentType, MTypesCategory.isFunction),
);

/**
 * Order instance based on the type of the key associated to the value (symbolic keys first, then
 * string keys)
 *
 * @category Ordering
 */
export const byKeyType: Type = Order.mapInput(Order.flip(Order.Boolean), PPValue.hasSymbolicKey);

/**
 * Order instance based on the enumerability of the property to which the value belongs (non-
 * enumerable keys first, then enumerable keys)
 *
 * @category Ordering
 */
export const byEnumerability: Type = Order.mapInput(Order.Boolean, PPValue.isEnumerable);

/**
 * Order instance based on the source of the property (first from iterating on the non primitive
 * value then from Object.ownKeys)
 *
 * @category Ordering
 */
export const bySource: Type = pipe(
  Order.Boolean,
  Order.mapInput(PPValue.isFromIterator),
  Order.flip,
);
