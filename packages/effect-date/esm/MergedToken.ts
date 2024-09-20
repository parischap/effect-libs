import { MFunction } from '@parischap/effect-lib';
import { HashMap, Record, pipe } from 'effect';

/*export interface DateToMergedToken {
	(date: Date.Components): number;
}*/

export interface Descriptor {
	readonly label: string;
	//readonly dateToMergedToken: DateToMergedToken;
}

const Descriptor = MFunction.make<Descriptor>;

// year must be in first position
const struct = {
	year: Descriptor({ label: 'year' }),
	ordinalDay: Descriptor({
		label: 'year day',
		dateToMergedToken: (date) => date.ordinalDay
	}),
	month: Descriptor({ label: 'month' }),
	monthDay: Descriptor({ label: 'day of month' }),
	isoWeek: Descriptor({
		label: 'week number'
	}),
	weekDay: Descriptor({
		label: 'weekday'
	}),
	hour24: Descriptor({ label: 'hour in 24-hour format' }),
	hour12: Descriptor({
		label: 'hour in 12-hour format'
	}),
	meridiem: Descriptor({
		label: 'meridiem'
	}),
	minute: Descriptor({ label: 'minute' }),
	second: Descriptor({ label: 'second' }),
	millisecond: Descriptor({ label: 'millisecond' }),
	timeZoneOffset: Descriptor({ label: 'zone offset' })
};

export type Type = keyof typeof struct;

export const map: HashMap.HashMap<Type, Descriptor> = pipe(
	struct,
	Record.toEntries,
	HashMap.fromIterable
);

/*export const name = (self: Type): string =>
	pipe(
		map,
		HashMap.get(self),
		Option.getOrThrowWith(() => new Error(`Abnormal Error. ${self} not found in MergedToken.map`)),
		({ label }) => `${self}(${label})`
	);*/
