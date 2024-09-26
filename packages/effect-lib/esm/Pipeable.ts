import { Pipeable } from 'effect';

export const BaseProto: Pipeable.Pipeable = {
	pipe(this: {}) {
		/* eslint-disable-next-line prefer-rest-params */
		return Pipeable.pipeArguments(this, arguments);
	}
};
