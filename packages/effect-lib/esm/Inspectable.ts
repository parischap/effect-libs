/**
 * A simple extension to the Effect Inspectable module
 *
 * @since 0.3.3
 */

import { Inspectable } from 'effect';

/**
 * Default prototype of an inspectable that adds the `toJSON` method
 *
 * @since 0.3.3
 * @category Instances
 */
export const BaseProto = (moduleTag: string): Inspectable.Inspectable => ({
	...Inspectable.BaseProto,
	toJSON(this: {}) {
		return { _id: () => moduleTag, ...this };
	}
});
