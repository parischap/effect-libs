/**
 * A simple extension to the Effect Pipeable module
 *
 * @since 0.3.3
 */

import { Pipeable } from 'effect';

/**
 * Default prototype of a Pipeable
 *
 * @since 0.3.3
 * @category Instances
 */
export const BaseProto: Pipeable.Pipeable = {
	pipe(this: {}) {
		/* eslint-disable-next-line prefer-rest-params */
		return Pipeable.pipeArguments(this, arguments);
	}
};
