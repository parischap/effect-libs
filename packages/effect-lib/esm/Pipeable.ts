/** A simple extension to the Effect Pipeable module */

import { Pipeable } from 'effect';

/**
 * Default prototype of a Pipeable
 *
 * @category Instances
 */
export const BaseProto: Pipeable.Pipeable = {
	pipe(this: {}) {
		/* eslint-disable-next-line prefer-rest-params */
		return Pipeable.pipeArguments(this, arguments);
	}
};
