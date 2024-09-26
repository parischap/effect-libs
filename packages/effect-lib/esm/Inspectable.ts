import { Inspectable } from 'effect';

export const BaseProto = (moduleTag: string): Inspectable.Inspectable => ({
	...Inspectable.BaseProto,
	toJSON(this: {}) {
		return { _id: () => moduleTag, ...this };
	}
});
