/** This module implements a Template (see Template.ts) dedicated to parsing and formatting dates */

import { MInputError, MInspectable, MPipeable, MPredicate, MTypes } from '@parischap/effect-lib';
import { Array, Either, flow, Number, Option, pipe, Pipeable, Predicate, Struct } from 'effect';
import * as CVDateTime from './DateTime.js';

export const moduleTag = '@parischap/conversions/DateTimeTemplate/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

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
 * Type that represents a Template.
 *
 * @category Models
 */

export interface Type extends MInspectable.Type, Pipeable.Pipeable {
	/** The locale this DateTimeTemplate was built for */
	readonly locale: string;

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
		return `Parser and formatter for '${this.locale}' dates and times`;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor Tries to build a DateTimeTemplate for `locale`. Returns a `some` if successful.
 * Otherwise, it returns a `none` (e.g. the locale is unavailable or non-existent)
 *
 * @category Constructors
 */
const _safeDateTimeFormat = Option.liftThrowable(Intl.DateTimeFormat);

const _extractType = (
	type: 'weekday' | 'month'
): MTypes.OneArgFunction<ReadonlyArray<Intl.DateTimeFormatPart>, Option.Option<string>> =>
	flow(
		Array.findFirst(flow(Struct.get('type'), MPredicate.strictEquals(type))),
		Option.map(Struct.get('value'))
	);

const _extractWeekDay = _extractType('weekday');
const _extractMonth = _extractType('month');

export const make = (locale: string): Option.Option<Type> =>
	Option.gen(function* () {
		const longDateTimeFormat = yield* _safeDateTimeFormat(locale, {
			timeZone: 'UTC',
			weekday: 'long',
			month: 'long'
		});

		const longDateTimeFormatToParts =
			Intl.DateTimeFormat.prototype.formatToParts.bind(longDateTimeFormat);

		const shortDateTimeFormat = yield* _safeDateTimeFormat(locale, {
			timeZone: 'UTC',
			weekday: 'short',
			month: 'short'
		});

		const shortDateTimeFormatToParts =
			Intl.DateTimeFormat.prototype.formatToParts.bind(shortDateTimeFormat);

		// January 1st, 1970 is a thursday
		const mondayOffsetMs = 4 * CVDateTime.DAY_MS;

		const weekDayDates = pipe(
			Array.makeBy(7, flow(Number.multiply(CVDateTime.DAY_MS), Number.sum(mondayOffsetMs))),
			Array.map((timestamp) => new Date(timestamp))
		);

		const monthOffsetMs = 31 * CVDateTime.DAY_MS;

		const monthDates = pipe(
			Array.makeBy(12, Number.multiply(monthOffsetMs)),
			Array.map((timestamp) => new Date(timestamp))
		);

		const longWeekDayNames = yield* pipe(
			weekDayDates,
			Array.map(flow(longDateTimeFormatToParts, _extractWeekDay)),
			Option.all
		);

		const shortWeekDayNames = yield* pipe(
			weekDayDates,
			Array.map(flow(shortDateTimeFormatToParts, _extractWeekDay)),
			Option.all
		);

		const longMonthNames = yield* pipe(
			monthDates,
			Array.map(flow(longDateTimeFormatToParts, _extractMonth)),
			Option.all
		);

		const shortMonthNames = yield* pipe(
			monthDates,
			Array.map(flow(shortDateTimeFormatToParts, _extractMonth)),
			Option.all
		);

		console.log(longWeekDayNames);
		console.log(shortWeekDayNames);
		console.log(longMonthNames);
		console.log(shortMonthNames);
		return 0 as never;
	});
