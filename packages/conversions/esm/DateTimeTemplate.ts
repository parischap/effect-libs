/** This module implements a Template (see Template.ts) dedicated to parsing and formatting dates */

import {
	MArray,
	MInputError,
	MInspectable,
	MPipeable,
	MPredicate,
	MString,
	MTypes
} from '@parischap/effect-lib';
import {
	Array,
	Either,
	flow,
	HashMap,
	Number,
	Option,
	pipe,
	Pipeable,
	Predicate,
	Struct
} from 'effect';
import * as CVDateTime from './DateTime.js';
import * as CVNumberBase10Format from './NumberBase10Format.js';
import * as CVPlaceHolder from './PlaceHolder.js';
import * as CVReal from './Real.js';

/**
 * Module tag
 *
 * @category Module tag
 */
export const moduleTag = '@parischap/conversions/DateTimeTemplate/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents the possible names for parts of a DateTime
 *
 * @category Models
 */
export type PartName = 'y' | 'yy' | 'yyyy';

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
	export type Type = Part.Type | Separator.Type;

	/**
	 * Namespace for a PlaceHolder that represents a part of a date time
	 *
	 * @category Models
	 */
	export namespace Part {
		const _namespaceTag = _tag + 'Part/';
		const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
		type _TypeId = typeof _TypeId;

		/**
		 * Type that represents a DateTimePlaceHolder
		 *
		 * @category Model
		 */

		export interface Type extends MInspectable.Type, Pipeable.Pipeable {
			/** Name of this PlaceHolder */
			readonly name: PartName;

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

		/**
		 * DateTimePlaceHolder constructor
		 *
		 * @category Constructors
		 */
		export const make = (params: MTypes.Data<Type>): Type =>
			MTypes.objectFromDataAndProto(proto, params);

		/**
		 * Returns the `name` property of `self`
		 *
		 * @category Destructors
		 */
		export const name: MTypes.OneArgFunction<Type, PartName> = Struct.get('name');
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

		/**
		 * DateTimePlaceHolder constructor
		 *
		 * @category Constructors
		 */
		export const make = (params: MTypes.Data<Type>): Type =>
			MTypes.objectFromDataAndProto(proto, params);

		/**
		 * Returns the `value` property of `self`
		 *
		 * @category Destructors
		 */
		export const value: MTypes.OneArgFunction<Type, string> = Struct.get('value');
	}
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

	const DAY_PERIOD_DATES = pipe(
		Array.make(0, 13 * CVDateTime.HOUR_MS),
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

		/** Array of the short weekday names */
		readonly placeHolderMap: HashMap.HashMap<PartName, CVPlaceHolder.All>;

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

	/**
	 * Context constructor
	 *
	 * @category Constructors
	 */
	export const make = (params: MTypes.Data<Type>): Type =>
		MTypes.objectFromDataAndProto(proto, params);

	const _safeDateTimeFormat = Option.liftThrowable(Intl.DateTimeFormat);

	const _extractType = (
		type: 'weekday' | 'month' | 'dayPeriod'
	): MTypes.OneArgFunction<ReadonlyArray<Intl.DateTimeFormatPart>, Option.Option<string>> =>
		flow(
			Array.findFirst(flow(Struct.get('type'), MPredicate.strictEquals(type))),
			Option.map(Struct.get('value'))
		);

	const _extractWeekday = _extractType('weekday');
	const _extractMonth = _extractType('month');
	const _extractDayPeriod = _extractType('dayPeriod');

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
				month: 'long',
				dayPeriod: 'long'
			});

			const toLongParts = Intl.DateTimeFormat.prototype.formatToParts.bind(
				longDateTimeFormatInLocale
			);

			const shortDateTimeFormatInLocale = yield* _safeDateTimeFormat(locale, {
				timeZone: 'UTC',
				weekday: 'short',
				month: 'short',
				dayPeriod: 'short'
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

			const longDayPeriodNames = (yield* pipe(
				DAY_PERIOD_DATES,
				MArray.mapUnlessNone(flow(toLongParts, _extractDayPeriod))
			)) as unknown as DayPeriodNames;

			const shortWeekdayNames = (yield* pipe(
				WEEKDAY_DATES,
				MArray.mapUnlessNone(flow(toShortParts, _extractWeekday))
			)) as unknown as WeekDayNames;

			const shortMonthNames = (yield* pipe(
				MONTH_DATES,
				MArray.mapUnlessNone(flow(toShortParts, _extractMonth))
			)) as unknown as MonthNames;

			const shortDayPeriodNames = (yield* pipe(
				DAY_PERIOD_DATES,
				MArray.mapUnlessNone(flow(toShortParts, _extractDayPeriod))
			)) as unknown as DayPeriodNames;

			return make({
				name: locale,
				shortWeekdayNames,
				longWeekdayNames,
				shortMonthNames,
				longMonthNames,
				shortDayPeriodNames,
				longDayPeriodNames
			});
		});

	/**
	 * Returns the `name` property of `self`
	 *
	 * @category Destructors
	 */
	export const name: MTypes.OneArgFunction<Type, string> = Struct.get('name');

	/**
	 * Returns the `shortWeekdayNames` property of `self`
	 *
	 * @category Destructors
	 */
	export const shortWeekdayNames: MTypes.OneArgFunction<Type, WeekDayNames> =
		Struct.get('shortWeekdayNames');

	/**
	 * Returns the `longWeekdayNames` property of `self`
	 *
	 * @category Destructors
	 */
	export const longWeekdayNames: MTypes.OneArgFunction<Type, WeekDayNames> =
		Struct.get('longWeekdayNames');

	/**
	 * Returns the `shortMonthNames` property of `self`
	 *
	 * @category Destructors
	 */
	export const shortMonthNames: MTypes.OneArgFunction<Type, MonthNames> =
		Struct.get('shortMonthNames');

	/**
	 * Returns the `longMonthNames` property of `self`
	 *
	 * @category Destructors
	 */
	export const longMonthNames: MTypes.OneArgFunction<Type, MonthNames> =
		Struct.get('longMonthNames');

	/**
	 * Returns the `shortDayPeriodNames` property of `self`
	 *
	 * @category Destructors
	 */
	export const shortDayPeriodNames: MTypes.OneArgFunction<Type, DayPeriodNames> =
		Struct.get('shortDayPeriodNames');

	/**
	 * Returns the `longDayPeriodNames` property of `self`
	 *
	 * @category Destructors
	 */
	export const longDayPeriodNames: MTypes.OneArgFunction<Type, DayPeriodNames> =
		Struct.get('longDayPeriodNames');
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
	/** The descriptor of this DateTimeTemplate */
	readonly descriptor: string;

	/** The parser of this DateTimeTemplate */
	readonly parser: Parser.Type;

	/** The formatter of this DateTimeTemplate */
	readonly formatter: Formatter.Type;

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
		return this.descriptor;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

export const make = ({
	context,
	placeHolders
}: {
	readonly context: Context.Type;
	readonly placeHolders: ReadonlyArray<PlaceHolder.Type>;
}): Type => {
	const placeholderParams = {
		fillChar: '0',
		padPosition: MString.PadPosition.Left,
		disallowEmptyString: true,
		numberBase10Format: CVNumberBase10Format.integer
	};

	const placeHolderMap: HashMap.HashMap<
		string,
		CVPlaceHolder.Type<string, CVReal.Type>
	> = HashMap.make([
		'yyyy',
		CVPlaceHolder.fixedLengthToReal({ ...placeholderParams, id: 'yyyy', length: 4 })
	]);
	return 0 as never;
};
