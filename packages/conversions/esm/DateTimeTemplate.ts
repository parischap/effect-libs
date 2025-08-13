/** This module implements a Template (see Template.ts) dedicated to parsing and formatting dates */

import {
	MArray,
	MInputError,
	MInspectable,
	MMatch,
	MPipeable,
	MPredicate,
	MString,
	MTypes
} from '@parischap/effect-lib';
import {
	Array,
	Either,
	flow,
	Function,
	HashMap,
	Number,
	Option,
	pipe,
	Pipeable,
	Predicate,
	Record,
	Struct,
	Tuple
} from 'effect';
import * as CVDateTime from './DateTime.js';
import * as CVNumberBase10Format from './NumberBase10Format.js';
import * as CVPlaceHolder from './PlaceHolder.js';
import * as CVPlaceHolders from './PlaceHolders.js';
import * as CVReal from './Real.js';
import * as CVTemplate from './Template.js';

/**
 * Module tag
 *
 * @category Module tag
 */
export const moduleTag = '@parischap/conversions/DateTimeTemplate/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents all the possible tag names that can be used to format a DateTime
 *
 * @category Models
 */
export type TagName =
	/* Gregorian year (ex: 2005) */
	| 'y'
	/* Gregorian year on 2 digits left-padded with 0's corresponding to years 2000-2099 (ex: 05 for 2005) */
	| 'yy'
	/* Gregorian year on 4 digits left-padded with 0's (ex: 2005, 0965) */
	| 'yyyy'
	/* Iso year (ex: 2005) */
	| 'R'
	/* Iso year on 2 digits left-padded with 0's corresponding to years 2000-2099 (ex: 05 for 2005) */
	| 'RR'
	/* Iso year on 4 digits left-padded with 0's (ex: 2005, 0965)*/
	| 'RRRR'
	/* Month (ex: 6) */
	| 'M'
	/* Month on 2 digits left-padded with 0's (ex: 06) */
	| 'MM'
	/* Short month name (ex: Jun) */
	| 'MMM'
	/* Long month name (ex: June) */
	| 'MMMM'
	/* IsoWeek (ex: 6) */
	| 'I'
	/* IsoWeek (ex: 06) */
	| 'II'
	/* Day of month (ex: 5) */
	| 'd'
	/* Day of month on 2 digits left-padded with 0's (ex: 05) */
	| 'dd'
	/* Day of year (ex: 97) */
	| 'D'
	/* Day of year on 3 digits left-padded with 0's (ex: 097) */
	| 'DDD'
	/* Weekday (ex: 1 for monday, 7 for sunday) */
	| 'i'
	/* Short weekday name (ex: Mon) */
	| 'iii'
	/* Long weekday name (ex: Monday) */
	| 'iiii'
	/* Meridiem (ex: 'AM' for 0, 'PM' for 12) */
	| 'a'
	/* Hour in the range 0..23 (ex:5, 14) */
	| 'H'
	/* Hour on 2 digits in the range 0..23 left-padded with 0's (ex:05, 14) */
	| 'HH'
	/* Hour in the range 0..11 (ex:5, 2) */
	| 'K'
	/* Hour on 2 digits in the range 0..11 left-padded with 0's (ex:05, 02) */
	| 'KK'
	/* Minute (ex: 5) */
	| 'm'
	/* Minute on 2 digits left-padded with 0's (ex: 05) */
	| 'mm'
	/* Second (ex: 5) */
	| 's'
	/* Second on 2 digits left-padded with 0's (ex: 05) */
	| 'ss'
	/* Millisecond (ex: 5) */
	| 'S'
	/* Millisecond on 3 digits left-padded with 0's (ex: 005) */
	| 'SSS';

namespace CVPlaceHolderMap {
	export interface Type
		extends HashMap.HashMap<TagName, CVPlaceHolder.Tag.Type<string, CVReal.Type>> {}
}
/**
 * Type that represents the names of the seven days of a week
 *
 * @category Models
 */
export type WeekDayNames = MTypes.Tuple<string, 7>;

/**
 * Type that represents the names of the twelve months of a year
 *
 * @category Models
 */
export type MonthNames = MTypes.Tuple<string, 12>;

/**
 * Type that represents the names of the day periods
 *
 * @category Models
 */
export type DayPeriodNames = MTypes.Tuple<string, 2>;

/**
 * Namespace for a PlaceHolder
 *
 * @category Models
 */
export namespace PlaceHolder {
	const _tag = moduleTag + 'PlaceHolder/';
	/**
	 * Type of a PlaceHolder
	 *
	 * @category Models
	 */
	export type Type = Tag.Type | Separator.Type;

	/**
	 * Type guard
	 *
	 * @category Guards
	 */
	export const isTag = (u: Type): u is Tag.Type => Tag.has(u);

	/**
	 * Type guard
	 *
	 * @category Guards
	 */
	export const isSeparator = (u: Type): u is Separator.Type => Separator.has(u);

	/**
	 * Namespace for a PlaceHolder that represents a part of a date time
	 *
	 * @category Models
	 */
	export namespace Tag {
		const _namespaceTag = _tag + 'Tag/';
		const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
		type _TypeId = typeof _TypeId;

		/**
		 * Type that represents a DateTimePlaceHolder
		 *
		 * @category Model
		 */

		export interface Type extends MInspectable.Type, Pipeable.Pipeable {
			/** Name of this PlaceHolder */
			readonly name: TagName;

			/** @internal */
			readonly [_TypeId]: _TypeId;
		}

		/**
		 * Type guard
		 *
		 * @category Guards
		 */
		export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

		/** Prototype */
		const proto: MTypes.Proto<Type> = {
			[_TypeId]: _TypeId,
			[MInspectable.IdSymbol](this: Type) {
				return this.name;
			},
			...MInspectable.BaseProto(moduleTag),
			...MPipeable.BaseProto
		};

		const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

		/**
		 * DateTimePlaceHolder constructor
		 *
		 * @category Constructors
		 */
		export const make = (name: TagName): Type => _make({ name });

		/**
		 * Returns the `name` property of `self`
		 *
		 * @category Destructors
		 */
		export const name: MTypes.OneArgFunction<Type, TagName> = Struct.get('name');
	}

	/**
	 * Namespace for a PlaceHolder that represents separator
	 *
	 * @category Models
	 */
	export namespace Separator {
		const _namespaceTag = _tag + 'Separator/';
		const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
		type _TypeId = typeof _TypeId;

		/**
		 * Type that represents a SeparatorPlaceHolder
		 *
		 * @category Model
		 */

		export interface Type extends MInspectable.Type, Pipeable.Pipeable {
			/** The separator */
			readonly value: string;

			/** @internal */
			readonly [_TypeId]: _TypeId;
		}

		/**
		 * Type guard
		 *
		 * @category Guards
		 */
		export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

		/** Prototype */
		const proto: MTypes.Proto<Type> = {
			[_TypeId]: _TypeId,
			[MInspectable.IdSymbol](this: Type) {
				return this.value;
			},
			...MInspectable.BaseProto(moduleTag),
			...MPipeable.BaseProto
		};

		const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

		/**
		 * DateTimePlaceHolder constructor
		 *
		 * @category Constructors
		 */
		export const make = (value: string): Type => _make({ value });

		/**
		 * Returns the `value` property of `self`
		 *
		 * @category Destructors
		 */
		export const value: MTypes.OneArgFunction<Type, string> = Struct.get('value');
	}
}

/**
 * Namespace PlaceHolders
 *
 * @category Models
 */
export namespace PlaceHolders {
	export interface Type extends ReadonlyArray<PlaceHolder.Type> {}
}

/**
 * Namespace for the context of a DateTimeTemplate.
 *
 * @category Models
 */
export namespace Context {
	const _namespaceTag = moduleTag + 'Context/';
	const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
	type _TypeId = typeof _TypeId;

	const WEEKDAY_DATES = pipe(
		7,
		Array.makeBy(flow(Number.multiply(CVDateTime.DAY_MS), Number.sum(4 * CVDateTime.DAY_MS))),
		Array.map((timestamp) => new Date(timestamp))
	);

	const MONTH_DATES = pipe(
		12,
		Array.makeBy(Number.multiply(31 * CVDateTime.DAY_MS)),
		Array.map((timestamp) => pipe(new Date(timestamp)))
	);

	/**
	 * Type that represents a Context.
	 *
	 * @category Model
	 */

	export interface Type extends MInspectable.Type, Pipeable.Pipeable {
		/** Name of this Context: usually the locale this Context wes built from. Or a country name */
		readonly name: string;

		/** Maps that contains all the possible PlaceHolder's for that Congtext */
		readonly placeHolderMap: CVPlaceHolderMap.Type;

		/** @internal */
		readonly [_TypeId]: _TypeId;
	}

	/**
	 * Type guard
	 *
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

	/** Prototype */
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: _TypeId,
		[MInspectable.IdSymbol](this: Type) {
			return this.name;
		},
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Context constructor
	 *
	 * @category Constructors
	 */
	export const fromNames = ({
		name,
		shortWeekdayNames,
		longWeekdayNames,
		shortMonthNames,
		longMonthNames,
		dayPeriodNames
	}: {
		/* Name of this Context*/
		readonly name: string;

		/** Array of the short weekday names */
		readonly shortWeekdayNames: WeekDayNames;

		/** Array of the long weekday names */
		readonly longWeekdayNames: WeekDayNames;

		/** Array of the short month names */
		readonly shortMonthNames: MonthNames;

		/** Array of the long month names */
		readonly longMonthNames: MonthNames;

		/** Array of the day period names ('AM', 'PM') */
		readonly dayPeriodNames: DayPeriodNames;
	}): Type => {
		const params = {
			fillChar: '0',
			padPosition: MString.PadPosition.Left,
			disallowEmptyString: true,
			numberBase10Format: CVNumberBase10Format.integer
		};

		const placeHolderEntries: ReadonlyArray<
			readonly [TagName, CVPlaceHolder.Tag.Type<string, CVReal.Type>]
		> = [
			['y', CVPlaceHolder.Tag.real({ ...params, name: 'year' })],
			[
				'yy',
				pipe(
					CVPlaceHolder.Tag.fixedLengthToReal({ ...params, name: 'year', length: 2 }),
					CVPlaceHolder.Tag.modify({
						descriptorMapper: MString.append(' between 2000 and 2099 included'),
						postParser: (value, name) =>
							pipe(
								value,
								MInputError.assertInRange({ min: 2000, max: 2000, offset: 0, name }),
								Either.map(flow(Number.subtract(2000), CVReal.unsafeFromNumber))
							),
						preFormatter: flow(Number.sum(2000), CVReal.unsafeFromNumber, Either.right)
					})
				)
			],
			['yyyy', CVPlaceHolder.Tag.fixedLengthToReal({ ...params, name: 'year', length: 4 })],
			['R', CVPlaceHolder.Tag.real({ ...params, name: 'isoYear' })],
			[
				'RR',
				pipe(
					CVPlaceHolder.Tag.fixedLengthToReal({ ...params, name: 'isoYear', length: 2 }),
					CVPlaceHolder.Tag.modify({
						descriptorMapper: MString.append(' between 2000 and 2099 included'),
						postParser: (value, name) =>
							pipe(
								value,
								MInputError.assertInRange({ min: 2000, max: 2000, offset: 0, name }),
								Either.map(flow(Number.subtract(2000), CVReal.unsafeFromNumber))
							),
						preFormatter: flow(Number.sum(2000), CVReal.unsafeFromNumber, Either.right)
					})
				)
			],
			['RRRR', CVPlaceHolder.Tag.fixedLengthToReal({ ...params, name: 'isoYear', length: 4 })],
			['M', CVPlaceHolder.Tag.real({ ...params, name: 'month' })],
			['MM', CVPlaceHolder.Tag.fixedLengthToReal({ ...params, name: 'month', length: 2 })],
			[
				'MMM',
				CVPlaceHolder.Tag.mappedLiterals({
					...params,
					name: 'month',
					keyValuePairs: pipe(
						shortMonthNames,
						Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i + 1)))
					)
				})
			],
			[
				'MMMM',
				CVPlaceHolder.Tag.mappedLiterals({
					...params,
					name: 'month',
					keyValuePairs: pipe(
						longMonthNames,
						Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i + 1)))
					)
				})
			],
			['I', CVPlaceHolder.Tag.real({ ...params, name: 'isoWeek' })],
			['II', CVPlaceHolder.Tag.fixedLengthToReal({ ...params, name: 'isoWeek', length: 2 })],
			['d', CVPlaceHolder.Tag.real({ ...params, name: 'monthDay' })],
			['dd', CVPlaceHolder.Tag.fixedLengthToReal({ ...params, name: 'monthDay', length: 2 })],
			['D', CVPlaceHolder.Tag.real({ ...params, name: 'ordinalDay' })],
			['DDD', CVPlaceHolder.Tag.fixedLengthToReal({ ...params, name: 'ordinalDay', length: 3 })],
			['i', CVPlaceHolder.Tag.real({ ...params, name: 'weekday' })],
			[
				'iii',
				CVPlaceHolder.Tag.mappedLiterals({
					...params,
					name: 'weekday',
					keyValuePairs: pipe(
						shortWeekdayNames,
						Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i + 1)))
					)
				})
			],
			[
				'iiii',
				CVPlaceHolder.Tag.mappedLiterals({
					...params,
					name: 'weekday',
					keyValuePairs: pipe(
						longWeekdayNames,
						Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i + 1)))
					)
				})
			],
			[
				'a',
				CVPlaceHolder.Tag.mappedLiterals({
					...params,
					name: 'meridiem',
					keyValuePairs: pipe(
						dayPeriodNames,
						Array.map((name, i) => Tuple.make(name, CVReal.unsafeFromNumber(i * 12)))
					)
				})
			],
			['H', CVPlaceHolder.Tag.real({ ...params, name: 'hour23' })],
			['HH', CVPlaceHolder.Tag.fixedLengthToReal({ ...params, name: 'hour23', length: 2 })],
			['K', CVPlaceHolder.Tag.real({ ...params, name: 'hour11' })],
			['KK', CVPlaceHolder.Tag.fixedLengthToReal({ ...params, name: 'hour11', length: 2 })],
			['m', CVPlaceHolder.Tag.real({ ...params, name: 'minute' })],
			['mm', CVPlaceHolder.Tag.fixedLengthToReal({ ...params, name: 'minute', length: 2 })],
			['s', CVPlaceHolder.Tag.real({ ...params, name: 'second' })],
			['ss', CVPlaceHolder.Tag.fixedLengthToReal({ ...params, name: 'second', length: 2 })],
			['S', CVPlaceHolder.Tag.real({ ...params, name: 'millisecond' })],
			['SSS', CVPlaceHolder.Tag.fixedLengthToReal({ ...params, name: 'millisecond', length: 3 })]
		];

		return _make({
			name,
			placeHolderMap: HashMap.make(...placeHolderEntries)
		});
	};

	export const us: Type = fromNames({
		name: 'en-US',
		longWeekdayNames: [
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday',
			'Sunday'
		],
		shortWeekdayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
		longMonthNames: [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		],
		shortMonthNames: [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec'
		],
		dayPeriodNames: ['AM', 'PM']
	});

	const _safeDateTimeFormat = Option.liftThrowable(Intl.DateTimeFormat);

	const _extractType = (
		type: 'weekday' | 'month'
	): MTypes.OneArgFunction<ReadonlyArray<Intl.DateTimeFormatPart>, Option.Option<string>> =>
		flow(
			Array.findFirst(flow(Struct.get('type'), MPredicate.strictEquals(type))),
			Option.map(Struct.get('value'))
		);

	const _extractWeekday = _extractType('weekday');
	const _extractMonth = _extractType('month');

	/**
	 * Tries to build a DateTimeTemplate from locale `locale`. Returns a `some` if successful.
	 * Otherwise (non-existent or unavailable locale,...), returns a `none`
	 *
	 * @category Constructors
	 */
	export const fromLocale = (locale: string): Option.Option<Type> =>
		Option.gen(function* () {
			const longDateTimeFormatInLocale = yield* _safeDateTimeFormat(locale, {
				timeZone: 'UTC',
				weekday: 'long',
				month: 'long'
			});

			const toLongParts = Intl.DateTimeFormat.prototype.formatToParts.bind(
				longDateTimeFormatInLocale
			);

			const shortDateTimeFormatInLocale = yield* _safeDateTimeFormat(locale, {
				timeZone: 'UTC',
				weekday: 'short',
				month: 'short'
			});

			const toShortParts = Intl.DateTimeFormat.prototype.formatToParts.bind(
				shortDateTimeFormatInLocale
			);

			const longWeekdayNames = (yield* pipe(
				WEEKDAY_DATES,
				MArray.mapUnlessNone(flow(toLongParts, _extractWeekday))
			)) as unknown as WeekDayNames;

			const longMonthNames = (yield* pipe(
				MONTH_DATES,
				MArray.mapUnlessNone(flow(toLongParts, _extractMonth))
			)) as unknown as MonthNames;

			const shortWeekdayNames = (yield* pipe(
				WEEKDAY_DATES,
				MArray.mapUnlessNone(flow(toShortParts, _extractWeekday))
			)) as unknown as WeekDayNames;

			const shortMonthNames = (yield* pipe(
				MONTH_DATES,
				MArray.mapUnlessNone(flow(toShortParts, _extractMonth))
			)) as unknown as MonthNames;

			const dayPeriodNames: DayPeriodNames = ['am', 'pm'];

			return fromNames({
				name: locale,
				shortWeekdayNames,
				longWeekdayNames,
				shortMonthNames,
				longMonthNames,
				dayPeriodNames
			});
		});

	/**
	 * Returns the `name` property of `self`
	 *
	 * @category Destructors
	 */
	export const name: MTypes.OneArgFunction<Type, string> = Struct.get('name');

	/**
	 * Returns the `placeHolderMap` property of `self`
	 *
	 * @category Destructors
	 */
	export const placeHolderMap: MTypes.OneArgFunction<Type, CVPlaceHolderMap.Type> =
		Struct.get('placeHolderMap');
}

/**
 * Namespace of a DateTimeTemplate Parser
 *
 * @category Models
 */
export namespace Parser {
	/**
	 * Type that describes a DateTimeTemplate Parser
	 *
	 * @category Models
	 */
	export interface Type
		extends MTypes.OneArgFunction<string, Either.Either<CVDateTime.Type, MInputError.Type>> {}
}

/**
 * Namespace of a DateTimeTemplate Formatter
 *
 * @category Models
 */
export namespace Formatter {
	/**
	 * Type that describes a DateTimeTemplate Formatter
	 *
	 * @category Models
	 */
	export interface Type
		extends MTypes.OneArgFunction<CVDateTime.Type, Either.Either<string, MInputError.Type>> {}
}

/**
 * Type that represents a DateTimeTemplate.
 *
 * @category Models
 */
export interface Type extends MInspectable.Type, Pipeable.Pipeable {
	/** The Context of this DateTimeTemplate */
	readonly context: Context.Type;

	/** The array of PlaceHolder's contituting this DateTimeTemplate */
	readonly placeHolders: PlaceHolders.Type;

	/** @internal */
	readonly _template: CVTemplate.Type<CVPlaceHolders.Type<CVReal.Type>>;

	readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[_TypeId]: _TypeId,
	[MInspectable.IdSymbol](this: Type) {
		return pipe(
			this.placeHolders,
			Array.map((p) => p.toString()),
			Array.join(''),
			MString.prepend("'"),
			MString.append(`' in '${this.context.name}' context`)
		);
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Builds a DateTimeTemplate from a Context `context` and an array of PlaceHolder's `placeHolders`
 *
 * @category Constructors
 */
export const make = ({
	context,
	placeHolders
}: {
	readonly context: Context.Type;
	readonly placeHolders: ReadonlyArray<PlaceHolder.Type>;
}): Type => {
	const getter = (name: TagName): CVPlaceHolder.Tag.Type<string, CVReal.Type> =>
		pipe(
			context.placeHolderMap,
			HashMap.get(name),
			Option.getOrThrowWith(
				() => new Error(`Abnormal error: no PlaceHolder was defined for tag name '${name}'`)
			)
		);

	const template: CVTemplate.Type<CVPlaceHolders.Type<CVReal.Type>> = pipe(
		placeHolders,
		Array.map((p, pos) =>
			pipe(
				p,
				MMatch.make,
				MMatch.when(PlaceHolder.isTag, flow(PlaceHolder.Tag.name, getter)),
				MMatch.when(PlaceHolder.isSeparator, ({ value }) =>
					CVPlaceHolder.Separator.make({ pos: pos + 1, value })
				),
				MMatch.exhaustive
			)
		),
		(p) => CVTemplate.make(...p)
	);

	return _make({
		context,
		placeHolders,
		_template: template
	});
};

/**
 * Returns the `context` property of `self`
 *
 * @category Destructors
 */
export const context: MTypes.OneArgFunction<Type, Context.Type> = Struct.get('context');

/**
 * Returns the `placeHolders` property of `self`
 *
 * @category Destructors
 */
export const placeHolders: MTypes.OneArgFunction<Type, PlaceHolders.Type> =
	Struct.get('placeHolders');

/**
 * Returns a function that parses a text into a DateTime according to 'self' . The returned DateTime
 * timeZoneOffset is set to the time zone offset of the machine this code is running on.
 *
 * @category Destructors
 */

export const toParser = (self: Type): Parser.Type => {
	return flow(
		CVTemplate.toParser(self._template),
		Either.flatMap((o) => CVDateTime.fromParts(o as CVDateTime.Parts.Type))
	);
};

/**
 * Returns a function that formats a DateTime according to 'self'. The timeZoneOffset used to format
 * the DateTime is this of the DateTime object.
 *
 * @category Destructors
 */

export const toFormatter = (self: Type): Formatter.Type => {
	const toParts: Record<string, MTypes.OneArgFunction<CVDateTime.Type, number>> = pipe(
		self._template.placeHolders,
		Array.filterMap(
			flow(
				MMatch.make,
				MMatch.when(CVPlaceHolder.isSeparator, () => Option.none()),
				MMatch.when(
					CVPlaceHolder.isTag,
					flow(
						CVPlaceHolder.Tag.name,
						MMatch.make,
						flow(
							MMatch.whenIs(
								'year',
								flow(Tuple.make, Tuple.appendElement(CVDateTime.getYear), Option.some)
							),
							MMatch.whenIs(
								'ordinalDay',
								flow(Tuple.make, Tuple.appendElement(CVDateTime.getOrdinalDay), Option.some)
							),
							MMatch.whenIs(
								'month',
								flow(Tuple.make, Tuple.appendElement(CVDateTime.getMonth), Option.some)
							),
							MMatch.whenIs(
								'monthDay',
								flow(Tuple.make, Tuple.appendElement(CVDateTime.getMonthDay), Option.some)
							),
							MMatch.whenIs(
								'isoYear',
								flow(Tuple.make, Tuple.appendElement(CVDateTime.getIsoYear), Option.some)
							),
							MMatch.whenIs(
								'isoWeek',
								flow(Tuple.make, Tuple.appendElement(CVDateTime.getIsoWeek), Option.some)
							),
							MMatch.whenIs(
								'weekday',
								flow(Tuple.make, Tuple.appendElement(CVDateTime.getWeekday), Option.some)
							),
							MMatch.whenIs(
								'hour23',
								flow(Tuple.make, Tuple.appendElement(CVDateTime.getHour23), Option.some)
							),
							MMatch.whenIs(
								'hour11',
								flow(Tuple.make, Tuple.appendElement(CVDateTime.getHour11), Option.some)
							)
						),
						MMatch.whenIs(
							'meridiem',
							flow(Tuple.make, Tuple.appendElement(CVDateTime.getMeridiem), Option.some)
						),
						MMatch.whenIs(
							'minute',
							flow(Tuple.make, Tuple.appendElement(CVDateTime.getMinute), Option.some)
						),
						MMatch.whenIs(
							'second',
							flow(Tuple.make, Tuple.appendElement(CVDateTime.getSecond), Option.some)
						),
						MMatch.whenIs(
							'millisecond',
							flow(Tuple.make, Tuple.appendElement(CVDateTime.getMillisecond), Option.some)
						),
						MMatch.orElse(() => Option.none())
					)
				),
				MMatch.exhaustive
			) as MTypes.OneArgFunction<
				CVPlaceHolder.Type<string, CVReal.Type>,
				Option.Option<readonly [string, MTypes.OneArgFunction<CVDateTime.Type, number>]>
			>
		),
		Record.fromEntries
	);

	return (d) =>
		pipe(toParts, Record.map(Function.apply(d)), CVTemplate.toFormatter(self._template));
};
