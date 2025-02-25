/**
 * This module implements a Type that represents an array of PropertyFilter's (see
 * PropertyFilter.ts)
 */
import { Array } from 'effect';
import * as PPPropertyFilter from './PropertyFilter.js';

/**
 * Type of a PropertyFilters
 *
 * @category Models
 */
export interface Type extends ReadonlyArray<PPPropertyFilter.Type> {}

/**
 * Empty PropertyFilters instance
 *
 * @category Instances
 */
export const empty: Type = Array.empty();

/**
 * Default PropertyFilters instance
 *
 * @category Instances
 */
export const defaults: Type = Array.of(PPPropertyFilter.removeNonEnumerables);

/**
 * Returns a PropertyFilter that is equivalent to `self`. The returned PropertyFilter executes
 * successively each PropertyFilter of `self`.
 *
 * @category Destructors
 */
export const toSyntheticPropertyFilterAction =
	(self: Type): PPPropertyFilter.Action.Type =>
	(properties) =>
		Array.reduce(self, properties, (remainingProperties, propertyFilter) =>
			propertyFilter(remainingProperties)
		);
