import * as utils from '@parischap/effect-date/utils';
import { MFunction } from '@parischap/effect-lib';
import { HashMap, Record, pipe } from 'effect';

export interface DefaultValue {
	(now: Date): number;
}

export interface Descriptor {
	readonly defaultValue: DefaultValue;
}

const Descriptor = MFunction.make<Descriptor>;

const struct = {
	d: Descriptor({
		defaultValue: (now) => {
			const cpy = new Date(now.getTime());
			return cpy.setHours(0, 0, 0, 0);
		}
	}),
	H: Descriptor({
		defaultValue: (now) => now.getHours() * utils.HOUR_MS
	}),
	m: Descriptor({ defaultValue: (now) => now.getMinutes() * utils.MINUTE_MS }),
	s: Descriptor({ defaultValue: (now) => now.getSeconds() * utils.SECOND_MS }),
	S: Descriptor({ defaultValue: (now) => now.getMilliseconds() }),
	Z: Descriptor({
		defaultValue: (now) => -now.getTimezoneOffset() * utils.MINUTE_MS
	})
};

export type Type = keyof typeof struct;

export const map: HashMap.HashMap<Type, Descriptor> = pipe(
	struct,
	Record.toEntries,
	HashMap.fromIterable
);
