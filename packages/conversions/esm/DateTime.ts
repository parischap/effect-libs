/**
 * This module implements an immutable DateTime object. DateTime objects do keep an internal state.
 * But all provided functions look pure insofar as they will always yield the same result whatever
 * the state the object is in. The state is only used to improve performance but does not alter the
 * results.
 *
 * A DateTime object has a `timeZoneOffsetMs` which is the timestamp of date 1/1/1970 00:00:00:000
 * in zone +z (e.g timeZoneOffsetMs=-3_600_000 for timezone +1:00). All the data in a DateTime
 * object is `time-zone-offset-dependent`, except `timestamp` which is relative to 1/1/1970 UTC. An
 * important thing to note is that of a DateTime object with a timestamp t and a timeZoneOffsetMs
 * tzoMs has exactly the same date parts (year, ordinalDay, month, monthDay,iso year...) as a
 * DateTime object with a timestamp t-tzoMs and a 0 timeZoneOffset.
 */

import { MInputError, MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import {
	Either,
	Equal,
	Equivalence,
	Function,
	Hash,
	Number,
	Option,
	Pipeable,
	Predicate,
	flow,
	pipe
} from 'effect';
import * as CVDateTimeUtils from './datetime-utils.js';

export const moduleTag = '@parischap/conversions/DateTime/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

const MAX_FULL_YEAR_OFFSET = 273_790;

/**
 * Maximal usable year (ECMA-262)
 *
 * @category Constants
 */
export const MAX_FULL_YEAR = 1970 + MAX_FULL_YEAR_OFFSET;

/**
 * Minimal usable year (ECMA-262)
 *
 * @category Constants
 */
export const MIN_FULL_YEAR = 1970 - MAX_FULL_YEAR_OFFSET - 1;

/**
 * Maximal usable timestamp (ECMA-262)
 *
 * @category Constants
 */
export const MAX_TIMESTAMP = 8_640_000_000_000_000;

/**
 * Minimal usable timestamp (ECMA-262)
 *
 * @category Constants
 */
export const MIN_TIMESTAMP = -MAX_TIMESTAMP;

/**
 * Type of a DateTime
 *
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Type, Pipeable.Pipeable {
	/** Number of milliseconds since 1/1/1970 at 00:00:00:000+00:00. Is timezone-independent */
	readonly timestamp: Option.Option<number>;

	/** YearDescriptor of this DateTime, expressed in given timezone */
	readonly yearDescriptor: Option.Option<CVDateTimeUtils.YearDescriptor.Type>;

	/** IsoYearDescriptor of this DateTime, expressed in given timezone */
	readonly isoYearDescriptor: Option.Option<CVDateTimeUtils.IsoYearDescriptor.Type>;

	/**
	 * Index of the day of this DateTime (in the current year). Expressed in given timezone, range:[0,
	 * 365]
	 */
	readonly ordinalDayIndex: Option.Option<number>;

	/** Index of the month of this DateTime. Expressed in given timezone, range:[0, 11] */
	readonly monthIndex: Option.Option<number>;

	/**
	 * Index of the day of this DateTime (in the current month). Expressed in given timezone,
	 * range:[0, 30]
	 */
	readonly monthDayIndex: Option.Option<number>;

	/** Index of the iso week of this DateTime. Expressed in given timezone, range:[0, 52] */
	readonly isoWeekIndex: Option.Option<number>;

	/**
	 * Index of the day of this DateTime (in the current iso week). Expressed in given timezone,
	 * range:[0, 6], 0 is monday, 6 is sunday
	 */
	readonly weekDayIndex: Option.Option<number>;

	/** Number of hours since the start of the current day. Expressed in given timezone, range:[0, 23] */
	readonly hour24: Option.Option<number>;

	/** Hour12 of this DateTime. Expressed in given timezone, range:[0, 11] */
	readonly hour12: Option.Option<number>;

	/** Meridiem offset of this DateTime in hours. Expressed in given timezone, 0 for 'AM', 12 for 'PM' */
	readonly meridiem: Option.Option<0 | 12>;

	/**
	 * Number of minutes since the start of the current hour. Expressed in given timezone, range:[0,
	 * 59]
	 */
	readonly minute: Option.Option<number>;

	/**
	 * Number of seconds, since sthe start of the current minute. Expressed in given timezone,
	 * range:[0, 59]
	 */
	readonly second: Option.Option<number>;

	/**
	 * Number of milliseconds, since sthe start of the current second. Expressed in given timezone,
	 * range:[0, 999]
	 */
	readonly millisecond: Option.Option<number>;

	/** Timestamp of 1/1/1970 00:00:00:000 in zone +z */
	readonly timeZoneOffsetMs: number;

	/** @internal */
	readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
	self.timestamp === that.timestamp;

/** Proto */
const _TypeIdHash = Hash.hash(_TypeId);
const proto: MTypes.Proto<Type> = {
	[_TypeId]: _TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return pipe(this.timestamp, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this));
	},
	[MInspectable.IdSymbol](this: Type) {
		return '';
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Tries to build a DateTime from `timestamp` and `timeZoneOffset`. Returns a `right` of this
 * DateTime if successful. Returns a `left` of an error otherwise. `timestamp` must be an integer
 * comprised in the range [MIN_TIMESTAMP, MAX_TIMESTAMP] representing the number of milliseconds
 * since 1/1/1970 00:00:00:000+0:00. `timeZoneOffset` is a number, not necessarily an integer, that
 * represents the offset in hours of the zone for which all calculations of that DateTime object
 * will be carried out. It should be comprised in the range ]-12, 15[. If omitted, the offset of the
 * local time zone of the machine this code is running on is used.
 *
 * @category Constructors
 */
export const fromTimestamp = ({
	timestamp,
	timeZoneOffset
}: {
	readonly timestamp: number;
	readonly timeZoneOffset?: number | undefined;
}): Either.Either<Type, MInputError.Type> =>
	Either.gen(function* () {
		const validatedTimestamp = yield* pipe(
			timestamp,
			MInputError.assertInRange({
				min: MIN_TIMESTAMP,
				max: MAX_TIMESTAMP,
				offset: 0,
				name: 'timestamp'
			})
		);

		const timeZoneOffsetMs = pipe(
			timeZoneOffset,
			Option.fromNullable,
			Option.map(Number.multiply(CVDateTimeUtils.HOUR_MS)),
			Option.getOrElse(Function.constant(CVDateTimeUtils.LOCAL_TIME_ZONE_OFFSET_MS))
		);

		return _make({
			timestamp: Option.some(validatedTimestamp),
			yearDescriptor: Option.none(),
			isoYearDescriptor: Option.none(),
			ordinalDayIndex: Option.none(),
			monthIndex: Option.none(),
			monthDayIndex: Option.none(),
			isoWeekIndex: Option.none(),
			weekDayIndex: Option.none(),
			hour24: Option.none(),
			hour12: Option.none(),
			meridiem: Option.none(),
			minute: Option.none(),
			second: Option.none(),
			millisecond: Option.none(),
			timeZoneOffsetMs
		});
	});

/**
 * Same as fromTimestamp but returns directly the DateTime or throws if it cannot be built
 *
 * @category Constructors
 */
export const unsafeFromTimestamp: MTypes.OneArgFunction<
	{
		readonly timestamp: number;
		readonly timeZoneOffset?: number | undefined;
	},
	Type
> = flow(fromTimestamp, Either.getOrThrowWith(Function.identity));

/**
 * Builds a DateTime using Date.now() as timestamp. You can optionally provide a timeZoneOffset. If
 * omitted, the offset of the local time zone of the machine this code is running on is used.
 *
 * @category Constructors
 */
export const now = (timeZoneOffset?: number): Type =>
	unsafeFromTimestamp({ timestamp: Date.now(), timeZoneOffset });

/**
 * Tries to build a DateTime from the provided DateTime parts. Returns a `right` of this DateTime if
 * successful. Returns a `left` of an error otherwise.
 *
 * `timeZoneOffset` is a number, not necessarily an integer, that represents the offset in hours of
 * the zone for which all other parameters are expressed. It should be comprised in the range ]-12,
 * 15[. If omitted, the offset of the local time zone of the machine this code is running on is
 * used.
 *
 * `year` must be an integer comprised in the range [MIN_FULL_YEAR, MAX_FULL_YEAR].
 *
 * `ordinalDay` must be an integer greater than or equal to 1 and less than or equal to the number
 * of days in the current year. `month` must be an integer greater than or equal to 1 (January) and
 * less than or equal to 12 (December). `monthDay` must be an integer greater than or equal to 1 and
 * less than or equal to the number of days in the current month. `isoWeek` must be an integer
 * greater than or equal to 1 and less than or equal to the number of iso weeks in the current year.
 * `weekDay` must be an integer greater than or equal to 1 (monday) and less than or equal to 7
 * (sunday). If there is not sufficient information to determine the day of the year (e.g. `month`
 * and `weekDay` are provided but `monthDay`, `ordinalDay`, and `isoWeek` are missing), the day of
 * the year is assumed to be January, 1st.
 *
 * `hour24` must be an integer greater than or equal to 0 and less than or equal to 23. `hour12`
 * must be an integer greater than or equal to 0 and less than or equal to 11. `meridiem` must be
 * one of 0 (AM) or 12 (PM). If there is not sufficient information to determine the hour of the day
 * (e.g. `hour12` is provided but `hour24`, and `meridiem` are missing), the hour of the day is
 * assumed to be 0.
 *
 * `minute` must be an integer greater than or equal to 0 and less than or equal to 59. If omitted,
 * minute is assumed to be 0.
 *
 * `second` must be an integer greater than or equal to 0 and less than or equal to 59. If omitted,
 * second is assumed to be 0.
 *
 * `millisecond` must be an integer greater than or equal to 0 and less than or equal to 999. If
 * omitted, millisecond is assumed to be 0.
 *
 * All parameters must be coherent. For instance, `year=1970`, `month=1`, `monthDay=1`, `weekDay=0`
 * and `timeZoneOffset=0` will trigger an error because 1/1/1970 00:00:00:000+0:00 is a thursday.
 * `hour24=13` and `meridiem=0` will also trigger an error.
 *
 * @category Constructors
 */
/*export const fromParts = ({
	year,
	ordinalDay,
	month,
	monthDay,
	isoWeek,
	weekDay,
	hour24,
	hour12,
	meridiem,
	minute,
	second,
	millisecond,
	timeZoneOffset
}: {
	readonly year: number;
	readonly ordinalDay?: number | undefined;
	readonly month?: number | undefined;
	readonly monthDay?: number | undefined;
	readonly isoWeek?: number | undefined;
	readonly weekDay?: number | undefined;
	readonly hour24?: number | undefined;
	readonly hour12?: number | undefined;
	readonly meridiem?: 0 | 12 | undefined;
	readonly minute?: number | undefined;
	readonly second?: number | undefined;
	readonly millisecond?: number | undefined;
	readonly timeZoneOffset?: number | undefined;
}): Either.Either<Type, MInputError.Type> =>
	Either.gen(function* () {
		const timeZoneOffsetMs =
			timeZoneOffset === undefined ?
				CVDateTimeUtils.LOCAL_TIME_ZONE_OFFSET_MS
			:	timeZoneOffset * CVDateTimeUtils.HOUR_MS;

		const validatedYear = yield* pipe(
			year,
			MInputError.assertInRange({
				min: MIN_FULL_YEAR,
				max: MAX_FULL_YEAR,
				offset: 0,
				name: "'year'"
			})
		);

		const yearDescriptor = CVDateTimeUtils.YearDescriptor.fromYear(validatedYear);

		const ordinalDayIndexOption = pipe(
			ordinalDay,
			Option.fromNullable,
			Option.map(Number.decrement)
		);
		const monthIndexOption = pipe(month, Option.fromNullable, Option.map(Number.decrement));
		const monthDayIndexOption = pipe(monthDay, Option.fromNullable, Option.map(Number.decrement));
		const isoWeekIndexOption = pipe(isoWeek, Option.fromNullable, Option.map(Number.decrement));
		const weekDayIndexOption = pipe(weekDay, Option.fromNullable, Option.map(Number.decrement));
		const hour24Option = Option.fromNullable(hour24);
		const hour12Option = Option.fromNullable(hour12);
		const meridiemOption = Option.fromNullable(meridiem);
		const minuteOption = Option.fromNullable(minute);
		const secondOption = Option.fromNullable(second);
		const millisecondOption = Option.fromNullable(millisecond);

		const dayOffsetMs = yield* Option.match(ordinalDayIndexOption, {
			onSome: (ordinalDayIndex) =>
				Either.gen(function* () {
					const validatedOrdinalDay = yield* pipe(
						ordinalDayIndex,
						CVDateTimeUtils.YearDescriptor.ordinalDayIndexChecker(yearDescriptor)
					);

					return validatedOrdinalDay * CVDateTimeUtils.DAY_MS;
				}),
			onNone: () =>
				Option.match(Option.product(monthIndexOption, monthDayIndexOption), {
					onSome: ([monthIndex, monthDayIndex]) =>
						Either.gen(function* () {
							const validatedMonthIndex = yield* pipe(
								monthIndex.value,
								MInputError.assertInRange({
									min: 0,
									max: 11,
									offset: 1,
									name: "'month'"
								})
							);

							const monthDescriptor = pipe(
								yearDescriptor,
								CVDateTimeUtils.YearDescriptor.getMonthDescriptorFromMonthIndex(validatedMonthIndex)
							);

							const validatedMonthDayIndex = yield* pipe(
								monthDayIndex.value,
								MInputError.assertInRange({
									min: 0,
									max: monthDescriptor.lastDayIndex,
									offset: 1,
									name: "'monthDay'"
								})
							);
							return monthDescriptor.monthStartMs + validatedMonthDayIndex * CVDateTimeUtils.DAY_MS;
						}),
					onNone: () =>
						Option.match(Option.product(isoWeekIndexOption, weekDayIndexOption), {
							onSome: ([isoWeekIndex, weekDayIndex]) =>
								Either.gen(function* () {
									const isoWeekDescriptor =
										CVDateTimeUtils.YearDescriptor.getIsoWeekDescriptor(yearDescriptor);

									const validatedIsoWeekIndex = yield* pipe(
										isoWeekIndex.value,
										MInputError.assertInRange({
											min: 0,
											max: isoWeekDescriptor.lastIsoWeekIndex,
											offset: 1,
											name: "'isoWeek'"
										})
									);

									const validatedWeekDayIndex = yield* pipe(
										weekDayIndex.value,
										MInputError.assertInRange({
											min: 0,
											max: 6,
											offset: 1,
											name: "'weekDay'"
										})
									);

									return (
										isoWeekDescriptor.firstIsoWeekMs +
										validatedIsoWeekIndex * CVDateTimeUtils.WEEK_MS +
										validatedWeekDayIndex * CVDateTimeUtils.DAY_MS
									);
								}),
							onNone: () => Either.right(0)
						})
				})
		});

		const hourOffsetMs = yield* pipe(
			optionalParams,
			MMatch.make,
			MMatch.when(MPredicate.struct({ hour24: Option.isSome }), ({ hour24 }) =>
				Either.gen(function* () {
					const validatedHour = yield* pipe(
						hour24.value,
						MInputError.assertInRange({
							min: 0,
							max: 23,
							offset: 0,
							name: "'hour24'"
						})
					);

					return validatedHour * CVDateTimeUtils.HOUR_MS;
				})
			),
			MMatch.when(
				MPredicate.struct({ hour12: Option.isSome, meridiem: Option.isSome }),
				({ hour12, meridiem }) =>
					Either.gen(function* () {
						const validatedHour12 = yield* pipe(
							hour12.value,
							MInputError.assertInRange({
								min: 0,
								max: 11,
								offset: 0,
								name: "'hour12'"
							})
						);

						return (validatedHour12 + meridiem.value) * CVDateTimeUtils.HOUR_MS;
					})
			),
			MMatch.orElse(() => Either.right(0))
		);

		const validatedMinute = yield* pipe(
			optionalParams.minute,
			Option.map(
				MInputError.assertInRange({
					min: 0,
					max: 59,
					offset: 0,
					name: "'minute'"
				})
			),
			Option.getOrElse(() => Either.right(0))
		);

		const validatedSecond = yield* pipe(
			optionalParams.second,
			Option.map(
				MInputError.assertInRange({
					min: 0,
					max: 59,
					offset: 0,
					name: "'second'"
				})
			),
			Option.getOrElse(() => Either.right(0))
		);

		const validatedMillisecond = yield* pipe(
			optionalParams.millisecond,
			Option.map(
				MInputError.assertInRange({
					min: 0,
					max: 999,
					offset: 0,
					name: "'millisecond'"
				})
			),
			Option.getOrElse(() => Either.right(0))
		);

		return _make({
			timestamp:
				yearDescriptor.startTimestamp +
				dayOffsetMs +
				hourOffsetMs +
				validatedMinute * CVDateTimeUtils.MINUTE_MS +
				validatedSecond * CVDateTimeUtils.SECOND_MS +
				validatedMillisecond -
				timeZoneOffsetMs,
			yearDescriptor,
			...optionalParams,
			timeZoneOffsetMs
		});
	}) as never;*/

/**
 * Returns the timestamp of `self`
 *
 * @category Destructors
 */
export const timestamp = (self: Type): number =>
	pipe(
		Option.getOrElse(self.timestamp, () => {
			const result = pipe(
				self.isoYearDescriptor,
				Option.map(CVDateTimeUtils.IsoYearDescriptor.startTimestamp),
				Option.getOrElse(() => 1)
			);
			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */ /* @ts-expect-error ordinalDayIndex must look immutable from the outer world*/
			self.yearDescriptor = Option.some(result);
			return result as never;
		})
	);

/**
 * Returns the offset in milliseconds between the date represented by `self` and the start of the
 * year this date belongs to
 */
const _getYearOffsetMs = (self: Type): number =>
	self.timestamp - self.timeZoneOffsetMs - self.yearDescriptor.startTimestamp;

/** Returns the yearDescriptor of `self` */
const _yearDescriptor = (self: Type): CVDateTimeUtils.YearDescriptor.Type =>
	pipe(
		self.yearDescriptor,
		Option.getOrElse(() => {
			const result = 1;
			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */ /* @ts-expect-error ordinalDayIndex must look immutable from the outer world*/
			self.yearDescriptor = Option.some(result);
			return result;
		})
	);

/** Returns the ordinalDayIndex of `self` */
const _ordinalDayIndex = (self: Type): number =>
	pipe(
		self.ordinalDayIndex,
		Option.getOrElse(() => {
			const result = pipe(
				self,
				_getYearOffsetMs,
				Number.unsafeDivide(CVDateTimeUtils.DAY_MS),
				Math.floor
			);
			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */ /* @ts-expect-error ordinalDayIndex must look immutable from the outer world*/
			self.ordinalDayIndex = Option.some(result);
			return result;
		})
	);

/**
 * Returns the ordinalDay of `self`
 *
 * @category Destructors
 */
export const ordinalDay: MTypes.OneArgFunction<Type, number> = flow(
	_ordinalDayIndex,
	Number.increment
);

/** Returns the monthIndex of `self` */
const _monthIndex = (self: Type): number =>
	pipe(
		self.monthIndex,
		Option.getOrElse(() => {
			const result = pipe(
				self,
				_getYearOffsetMs,
				CVDateTimeUtils.MonthDescriptorCache.getFromYearOffset(self.yearDescriptor.isLeapYear),
				CVDateTimeUtils.MonthDescriptor.monthIndex
			);
			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */ /* @ts-expect-error ordinalDayIndex must look immutable from the outer world*/
			self.monthIndex = Option.some(result);
			return result;
		})
	);

/**
 * Returns the month of `self`
 *
 * @category Destructors
 */
export const month: MTypes.OneArgFunction<Type, number> = flow(_monthIndex, Number.increment);

/** Returns the monthDayIndex of `self` */
const _monthDayIndex = (self: Type): number =>
	pipe(
		self.monthDayIndex,
		Option.getOrElse(() => {
			const monthStartMs = pipe(
				self,
				_monthIndex,
				CVDateTimeUtils.MonthDescriptorCache.getFromMonthIndex(self.yearDescriptor.isLeapYear),
				CVDateTimeUtils.MonthDescriptor.monthStartMs
			);
			const result = pipe(
				self,
				_getYearOffsetMs,
				Number.subtract(monthStartMs),
				Number.unsafeDivide(CVDateTimeUtils.DAY_MS),
				Math.floor
			);
			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */ /* @ts-expect-error ordinalDayIndex must look immutable from the outer world*/
			self.monthDayIndex = Option.some(result);
			return result;
		})
	);

/**
 * Returns the monthDay of `self`
 *
 * @category Destructors
 */
export const monthDay: MTypes.OneArgFunction<Type, number> = flow(_monthDayIndex, Number.increment);

/** Returns the isoYear of `self` */
export const isoYear = (self: Type): number =>
	pipe(
		self.isoYear,
		Option.getOrElse(() => {
			const yearOffsetMs = _getYearOffsetMs(self);
			const yearDescriptor = self.yearDescriptor;
			const year = yearDescriptor.year;
			const firstYearDayWeekDayIndex = CVDateTimeUtils.weekDayIndexFromTimestamp(
				self.yearDescriptor.startTimestamp
			);
			const firstIsoWeekStartOffsetMs = CVDateTimeUtils.isoYearOffsetMs(firstYearDayWeekDayIndex);
			const lastIsoWeekEndOffsetMs =
				firstIsoWeekStartOffsetMs +
				CVDateTimeUtils.isoYearDuration(firstYearDayWeekDayIndex, yearDescriptor.isLeapYear);
			const result =
				year +
				(yearOffsetMs < firstIsoWeekStartOffsetMs ? -1
				: yearOffsetMs >= lastIsoWeekEndOffsetMs ? +1
				: 0);

			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */ /* @ts-expect-error ordinalDayIndex must look immutable from the outer world*/
			self.isoYear = Option.some(result);
			return result;
		})
	);

const _isoWeekIndex = (self: Type): number =>
	pipe(
		self.isoWeekIndex,
		Option.getOrElse(() => {
			const _isoYear = isoYear(self);

			const result = 0;
			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */ /* @ts-expect-error ordinalDayIndex must look immutable from the outer world*/
			self.isoWeekIndex = Option.some(result);
			return result;
		})
	);

/**
 * Returns the isoWeek of `self`
 *
 * @category Destructors
 */
export const isoWeek: MTypes.OneArgFunction<Type, number> = flow(_isoWeekIndex, Number.increment);

/**
 * If successful, returns a right of a copy of `self` with the ordinalDay set to `ordinalDay`.
 * Otherwise returns a left of an inputError. `ordinalDay` must be an integer greater than or equal
 * to 1 and less than or equal to the number of days in the current year.
 *
 * @category Utils
 */
export const setOrdinalDay =
	(ordinalDay: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		Either.gen(function* () {
			const ordinalDayIndex = ordinalDay - 1;

			const validatedOrdinalDayIndex = yield* pipe(
				ordinalDayIndex,
				MInputError.assertInRange({
					min: 0,
					max: CVDateTimeUtils.YearDescriptor.getLastOrdinalDayIndex(self.yearDescriptor),
					offset: 1,
					name: "'ordinalDay'"
				})
			);
			return _make({
				...self,
				timestamp:
					self.yearDescriptor.startTimestamp + validatedOrdinalDayIndex * CVDateTimeUtils.DAY_MS,
				ordinalDayIndex: Option.some(ordinalDayIndex),
				monthIndex: Option.none(),
				monthDayIndex: Option.none(),
				isoWeekIndex: Option.none(),
				weekDayIndex: Option.none()
			});
		});

//`monthDay` must be an integer greater than or equal to 1 and less than or equal to the number of days in the current month.

/*const ordinalDay0 = Math.floor(r1Year / DAY_MS);
		const offsetOrdinalDay = ordinalDay0 * DAY_MS;
		const dayMs = startTimestamp + offsetOrdinalDay;
		const rOrdinalDay0 = r1Year - offsetOrdinalDay;

		const hour24 = Math.floor(rOrdinalDay0 / HOUR_MS);
		const hourMs = hour24 * HOUR_MS;
		const rHour24 = rOrdinalDay0 - hourMs;

		const minute = Math.floor(rHour24 / MINUTE_MS);
		const minuteMs = minute * MINUTE_MS;
		const rMinute = rHour24 - minuteMs;

		const second = Math.floor(rMinute / SECOND_MS);
		const secondMs = second * SECOND_MS;
		const millisecond = rMinute - secondMs;*/
