/**
 * This module implements an immutable DateTime object.
 *
 * DateTime objects keep an internal state. But all provided functions look pure insofar as they
 * will always yield the same result whatever the state the object is in. The state is only used to
 * improve performance but does not alter the results.
 *
 * Unlike the Javascript Date objects and the Effect DateTime objects, DateTime objects handle both
 * the Gregorian and Iso calendars. So you can easily get/set the iso year and iso week of a
 * DateTime object.
 *
 * A DateTime object has a `zoneOffset` which is the difference in hours between the time in the
 * local zone and UTC time (e.g zoneOffset=1 for timezone +1:00). All the data in a DateTime object
 * is `zoneOffset-dependent`, except `timestamp` and `_zonedTimestamp`. An important thing to note
 * is that a DateTime object with a timestamp t and a zoneOffset zo has exactly the same date parts
 * (year, ordinalDay, month, monthDay, isoYear...) as a DateTime object with a timestamp t+zox3600
 * and a 0 zoneOffset. That's the reason for the _zonedTimestamp field which is equal to t+zox3600.
 * All calculations are performed UTC using _zonedTimestamp instead of timestamp.
 */

import {
	MArray,
	MFunction,
	MInputError,
	MInspectable,
	MNumber,
	MPipeable,
	MStruct,
	MTypes
} from '@parischap/effect-lib';
import {
	Either,
	Equal,
	Equivalence,
	Function,
	Hash,
	Inspectable,
	Number,
	Option,
	Pipeable,
	Predicate,
	Struct,
	flow,
	pipe
} from 'effect';
import * as CVNumberBase10Format from './NumberBase10Format.js';
import * as CVPlaceholder from './Placeholder.js';
import * as CVTemplate from './Template.js';

/**
 * Module tag
 *
 * @category Module tag
 */
export const moduleTag = '@parischap/conversions/DateTime/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Duration of a second in milliseconds
 *
 * @category Constants
 */
export const SECOND_MS = 1_000;

/**
 * Duration of a minute in milliseconds
 *
 * @category Constants
 */
export const MINUTE_MS = 60 * SECOND_MS;

/**
 * Duration of an hour in milliseconds
 *
 * @category Constants
 */
export const HOUR_MS = 60 * MINUTE_MS;

/**
 * Duration of a day in milliseconds
 *
 * @category Constants
 */
export const DAY_MS = 24 * HOUR_MS;

/**
 * Duration of a week in milliseconds
 *
 * @category Constants
 */
export const WEEK_MS = 7 * DAY_MS;

/**
 * Duration of a normal year in milliseconds
 *
 * @category Constants
 */
export const COMMON_YEAR_MS = 365 * DAY_MS;

/**
 * Duration of a leap year in milliseconds
 *
 * @category Constants
 */
export const LEAP_YEAR_MS = COMMON_YEAR_MS + DAY_MS;

/**
 * Duration of a short iso year in milliseconds
 *
 * @category Constants
 */
export const SHORT_YEAR_MS = 52 * WEEK_MS;

/**
 * Duration of a long iso year in milliseconds
 *
 * @category Constants
 */
export const LONG_YEAR_MS = SHORT_YEAR_MS + WEEK_MS;

/**
 * Local time zone offset in hours of the machine on which this code runs. The value is calculated
 * once at startup.
 *
 * @category Constants
 */
export const LOCAL_TIME_ZONE_OFFSET = -(new Date().getTimezoneOffset() / 60);

/**
 * Namespace for the data relative to a Month
 *
 * @category Models
 */

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

const _integer = CVNumberBase10Format.integer;
const _params = {
	fillChar: '0',
	numberBase10Format: _integer
};

const _tag = CVPlaceholder.Tag.fixedLengthToReal;
const _sep = CVPlaceholder.Separator;

/**
 * Namespace for the a Gregorian date
 *
 * It is important to note that the Gregorian calendar is periodic with a 400-year period as far as
 * leap years are concerned. Leap years are those that can be divided by 4, except those that can be
 * divided by 100 except those that can be divided by 400. So 2100, 2200, 2300 are not leap years.
 * But 2400 is a leap year.
 *
 * @category Models
 */
namespace GregorianDate {
	const _namespaceTag = moduleTag + 'GregorianDate/';
	const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
	type _TypeId = typeof _TypeId;

	/**
	 * Duration in milliseconds of a four-year period containing a leap year
	 *
	 * @category Constants
	 */
	const FOUR_YEARS_MS = 3 * COMMON_YEAR_MS + LEAP_YEAR_MS;

	/**
	 * Duration in milliseconds of a 100-year period that has a leap year every 4th year except the
	 * 100th year
	 *
	 * @category Constants
	 */
	const HUNDRED_YEARS_MS = 25 * FOUR_YEARS_MS - DAY_MS;

	/**
	 * Duration in milliseconds of a 400-year period that has a leap year every 4th year except the
	 * 100th year. But the 400th year is a leap year
	 *
	 * @category Constants
	 */
	const FOUR_HUNDRED_YEARS_MS = 4 * HUNDRED_YEARS_MS + DAY_MS;

	/** Timestamp of 1/1/2001 00:00:00:000+0:00 */
	const YEAR_START_2001_MS = 978_307_200_000;

	/** Number of days in each month of a leap year */
	const LEAP_YEAR_DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	/** Number of days in each month of a leap year */
	const COMMON_YEAR_DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	/**
	 * Type of a GregorianDate
	 *
	 * @category Models
	 */
	export interface Type extends Inspectable.Inspectable, Pipeable.Pipeable {
		/** Timestamp of any moment in the day represented by this GregorianDate */
		readonly timestamp: number;

		/** The year of this GregorianDate , range: [MIN_FULL_YEAR, MAX_FULL_YEAR] */
		readonly year: number;

		/** `true` if `year` is a leap year. `false` otherwise */
		readonly yearIsLeap: boolean;

		/** Timestamp of the first millisecond of UTC `year` */
		readonly yearStartTimestamp: number;

		/** Position in the year of the day of this GregorianDate, range:[1, 366] */
		readonly ordinalDay: number;

		/** Month of this GregorianDate, range:[1, 12] */
		readonly month: Option.Option<number>;

		/** Position in the month of the day of this GregorianDate, range:[1, 31] */
		readonly monthDay: Option.Option<number>;

		/** @internal */
		readonly _daysInMonth: ReadonlyArray<number>;
		readonly [_TypeId]: _TypeId;
	}

	/**
	 * Type guard
	 *
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

	/** Proto */
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: _TypeId,
		...MInspectable.BaseProto(_namespaceTag),
		...MPipeable.BaseProto
	};

	/** Constructor */
	const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

	const _makeWithInternals = (params: Omit<MTypes.Data<Type>, '_daysInMonth'>): Type =>
		_make({
			...params,
			_daysInMonth: params.yearIsLeap ? LEAP_YEAR_DAYS_IN_MONTH : COMMON_YEAR_DAYS_IN_MONTH
		});

	/**
	 * Constructs a GregorianDate from a timestamp
	 *
	 * @category Constructors
	 */
	export const fromTimestamp = (timestamp: number): Type => {
		/**
		 * The 100-year periods [2001, 2100], [2101, 2200], and [2201, 2300] all last HUNDRED_YEARS_MS.
		 * Those three 100-year periods can be divided in 24 periods that last FOUR_YEARS_MS
		 * (4xCOMMON_YEAR_MS + DAY_MS) and a final 4-year period that lasts FOUR_YEARS_MS - DAY_MS
		 * (4xCOMMON_YEAR_MS).
		 *
		 * The 100-year period [2301, 2400] lasts HUNDRED_YEARS_MS + DAY_MS. This period can be divided
		 * in 25 periods that last FOUR_YEARS_MS (4xCOMMON_YEAR_MS + DAY_MS).
		 */

		const offset2001 = timestamp - YEAR_START_2001_MS;

		const q400Years = Math.floor(offset2001 / FOUR_HUNDRED_YEARS_MS);
		const offset400Years = q400Years * FOUR_HUNDRED_YEARS_MS;
		const r400Years = offset2001 - offset400Years;

		// q100Years is equal to 4 on the last day of the 400-year period.
		const q100Years = Math.min(3, Math.floor(r400Years / HUNDRED_YEARS_MS));
		const offset100Years = q100Years * HUNDRED_YEARS_MS;
		// r100Years is superior to HUNDRED_YEARS_MS on the last day of the 400-year period
		const r100Years = r400Years - offset100Years;

		const q4Years = Math.floor(r100Years / FOUR_YEARS_MS);
		const offset4Years = q4Years * FOUR_YEARS_MS;
		const r4Years = r100Years - offset4Years;

		// q1Year is equal to 4 on the last day of each 4-year period except the last day of years 2100, 2200 and 2300.
		const q1Year = Math.min(3, Math.floor(r4Years / COMMON_YEAR_MS));
		const offset1Year = q1Year * COMMON_YEAR_MS;

		const yearIsLeap = q1Year === 3 && (q4Years !== 24 || q100Years === 3);

		const yearStartTimestamp =
			YEAR_START_2001_MS + offset400Years + offset100Years + offset4Years + offset1Year;

		return _makeWithInternals({
			timestamp,
			year: 2001 + 400 * q400Years + 100 * q100Years + 4 * q4Years + q1Year,
			yearIsLeap,
			yearStartTimestamp,
			ordinalDay: Math.floor((timestamp - yearStartTimestamp) / DAY_MS) + 1,
			month: Option.none(),
			monthDay: Option.none()
		});
	};

	/**
	 * If possible, returns a new GregorianDate having `year` set to `year` and the same `month` and
	 * `monthDay` as `self`. Returns a left of an error otherwise. `year` must be an integer comprised
	 * in the range [MIN_FULL_YEAR, MAX_FULL_YEAR]. If `self` represents a 29th of february, `year`
	 * must be a leap year.
	 *
	 * @category Setters
	 */
	export const setYear =
		(year: number) =>
		(self: Type): Either.Either<Type, MInputError.Type> =>
			Either.gen(function* () {
				const validatedYear = yield* pipe(
					year,
					MInputError.assertInRange({
						min: MIN_FULL_YEAR,
						max: MAX_FULL_YEAR,
						minIncluded: true,
						maxIncluded: true,
						offset: 0,
						name: "'year'"
					})
				);
				const offset2001 = validatedYear - 2001;

				const q400Years = Math.floor(offset2001 / 400);
				const r400Years = offset2001 - 400 * q400Years;

				const q100Years = Math.floor(r400Years / 100);
				const r100Years = r400Years - 100 * q100Years;

				const q4Years = Math.floor(r100Years / 4);
				const r4Years = r100Years - 4 * q4Years;

				const yearIsLeap = r4Years === 3 && (r100Years !== 99 || r400Years === 399);

				const yearStartTimestamp =
					YEAR_START_2001_MS +
					q400Years * FOUR_HUNDRED_YEARS_MS +
					q100Years * HUNDRED_YEARS_MS +
					q4Years * FOUR_YEARS_MS +
					r4Years * COMMON_YEAR_MS;

				const selfYearIsLeap = self.yearIsLeap;
				const selfOrdinalDay = self.ordinalDay;

				const ordinalDayOffset = yield* selfYearIsLeap === yearIsLeap || selfOrdinalDay < 60 ?
					Either.right(0)
				: selfYearIsLeap ?
					selfOrdinalDay === 60 ?
						Either.left(
							new MInputError.Type({
								message: `No February 29th on year ${year} which is not a leap year`
							})
						)
					:	Either.right(-1)
				:	Either.right(1);

				return _makeWithInternals({
					timestamp:
						self.timestamp +
						yearStartTimestamp -
						self.yearStartTimestamp +
						ordinalDayOffset * DAY_MS,
					year: validatedYear,
					yearIsLeap,
					yearStartTimestamp,
					ordinalDay: selfOrdinalDay + ordinalDayOffset,
					month: self.month,
					monthDay: self.monthDay
				});
			});

	/**
	 * If possible, returns a new GregorianDate having `month` set to `month` and the same `year` and
	 * `monthDay` as `self`. Returns a left of an error otherwise. `month` must be an integer greater
	 * than or equal to 1 (January) and less than or equal to 12 (December). `month` must also have at
	 * least `monthDay` days.
	 *
	 * @category Setters
	 */
	export const setMonth =
		(month: number) =>
		(self: Type): Either.Either<Type, MInputError.Type> =>
			Either.gen(function* () {
				const validatedMonth = yield* pipe(
					month,
					MInputError.assertInRange({
						min: 1,
						max: 12,
						minIncluded: true,
						maxIncluded: true,
						offset: 0,
						name: "'month'"
					})
				);

				const monthDay = yield* pipe(
					self,
					getMonthDay,
					Either.liftPredicate(
						Predicate.or(
							Number.lessThanOrEqualTo(28),
							Number.lessThanOrEqualTo(getNumberOfDaysInMonth(validatedMonth)(self))
						),
						(selfMonthDay) =>
							new MInputError.Type({
								message: `Month ${month} of year ${self.year} does not have ${selfMonthDay} days`
							})
					)
				);

				const ordinalDay = getMonthOffset(validatedMonth)(self) + monthDay;

				return pipe(
					self,
					MStruct.append({
						timestamp: self.timestamp + (ordinalDay - self.ordinalDay) * DAY_MS,
						ordinalDay,
						month: Option.some(validatedMonth)
					}),
					_make
				);
			});

	/**
	 * If possible, returns a new GregorianDate having `monthDay` set to `monthDay` and the same
	 * `year` and `month` as `self`. Returns a left of an error otherwise. `monthDay` must be an
	 * integer greater than or equal to 1 and less than or equal to the number of days in the current
	 * month.
	 *
	 * @category Setters
	 */
	export const setMonthDay =
		(monthDay: number) =>
		(self: Type): Either.Either<Type, MInputError.Type> =>
			Either.gen(function* () {
				const validatedMonthDay =
					monthDay <= 28 ? monthDay : (
						yield* pipe(
							monthDay,
							MInputError.assertInRange({
								min: 1,
								max: getNumberOfDaysInMonth(getMonth(self))(self),
								minIncluded: true,
								maxIncluded: true,
								offset: 0,
								name: "'monthDay'"
							})
						)
					);

				const ordinalDayOffset = validatedMonthDay - getMonthDay(self);

				return pipe(
					self,
					MStruct.append({
						timestamp: self.timestamp + ordinalDayOffset * DAY_MS,
						ordinalDay: self.ordinalDay + ordinalDayOffset,
						monthDay: Option.some(validatedMonthDay)
					}),
					_make
				);
			});

	/**
	 * If possible, returns a new GregorianDate having `ordinalDay` set to `ordinalDay` and the same
	 * `year` as `self`. Returns a left of an error otherwise. `ordinalDay` must be an integer greater
	 * than or equal to 1 and less than or equal to the number of days in the current year
	 *
	 * @category Setters
	 */
	export const setOrdinalDay =
		(ordinalDay: number) =>
		(self: Type): Either.Either<Type, MInputError.Type> =>
			Either.gen(function* () {
				const validatedOrdinalDay = yield* pipe(
					ordinalDay,
					MInputError.assertInRange({
						min: 1,
						max: getYearDurationInDays(self),
						minIncluded: true,
						maxIncluded: true,
						offset: 0,
						name: "'ordinalDay'"
					})
				);

				return pipe(
					self,
					MStruct.append({
						timestamp: self.timestamp + (validatedOrdinalDay - self.ordinalDay) * DAY_MS,
						ordinalDay: validatedOrdinalDay,
						month: Option.none(),
						monthDay: Option.none()
					}),
					_make
				);
			});

	/**
	 * Returns the `timestamp` property of `self`
	 *
	 * @category Destructors
	 */
	export const timestamp: MTypes.OneArgFunction<Type, number> = Struct.get('timestamp');

	/**
	 * Returns the `year` property of `self`
	 *
	 * @category Destructors
	 */
	export const year: MTypes.OneArgFunction<Type, number> = Struct.get('year');

	/**
	 * Returns the `yearIsLeap` property of `self`
	 *
	 * @category Destructors
	 */
	export const yearIsLeap: Predicate.Predicate<Type> = Struct.get('yearIsLeap');

	/**
	 * Returns the `yearStartTimestamp` property of `self`
	 *
	 * @category Destructors
	 */
	export const yearStartTimestamp: MTypes.OneArgFunction<Type, number> =
		Struct.get('yearStartTimestamp');

	/**
	 * Returns the `ordinalDay` property of `self`
	 *
	 * @category Destructors
	 */
	export const ordinalDay: MTypes.OneArgFunction<Type, number> = Struct.get('ordinalDay');

	/**
	 * Returns the `month` of `self`
	 *
	 * @category Destructors
	 */
	export const getMonth = (self: Type): number =>
		pipe(
			self.month,
			Option.getOrElse(() => {
				const ordinalDay = self.ordinalDay;
				const yearIsLeap = self.yearIsLeap;
				const adjustedOrdinalDay = ordinalDay - (yearIsLeap ? 1 : 0);
				const result =
					ordinalDay <= 31 ? 1
					: adjustedOrdinalDay <= 59 ? 2
					: Math.floor((adjustedOrdinalDay - 59) / 30.6 - 0.018) + 3;

				/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */
				(self as MTypes.WithMutable<Type, 'month'>).month = Option.some(result);
				return result;
			})
		);

	/**
	 * Returns the `monthDay` of `self`
	 *
	 * @category Destructors
	 */
	export const getMonthDay = (self: Type): number =>
		pipe(
			self.monthDay,
			Option.getOrElse(() => {
				const result = self.ordinalDay - getMonthOffset(getMonth(self))(self);

				/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */
				(self as MTypes.WithMutable<Type, 'monthDay'>).monthDay = Option.some(result);
				return result;
			})
		);

	/**
	 * Returns the duration of the year described by `self` in milliseconds
	 *
	 * @category Destructors
	 */
	export const getYearDurationInMs = (self: Type): number =>
		self.yearIsLeap ? LEAP_YEAR_MS : COMMON_YEAR_MS;

	/**
	 * Returns the duration of the year described by `self` in days
	 *
	 * @category Destructors
	 */
	export const getYearDurationInDays = (self: Type): number => (self.yearIsLeap ? 366 : 365);

	/**
	 * Returns the number of days from the start of the `year` property of `self` to the day before
	 * the first day of month `month`
	 *
	 * @category Destructors
	 */
	export const getMonthOffset =
		(month: number) =>
		(self: Type): number =>
			month === 1 ? 0
			: month === 2 ? 31
			: 30 * (month - 1) + Math.floor(0.6 * (month + 1)) - (self.yearIsLeap ? 2 : 3);

	/**
	 * Returns the number of days of month `month` of the `year` property of `self`
	 *
	 * @category Destructors
	 */
	export const getNumberOfDaysInMonth = (month: number): MTypes.OneArgFunction<Type, number> =>
		flow(Struct.get('_daysInMonth'), MArray.unsafeGet(month - 1));

	const _formatter = flow(
		CVTemplate.toFormatter(
			CVTemplate.make(
				_tag({ ..._params, name: 'year', length: 4 }),
				_sep.hyphen,
				_tag({ ..._params, name: 'month', length: 2 }),
				_sep.hyphen,
				_tag({ ..._params, name: 'monthDay', length: 2 })
			)
		),
		Either.getOrThrowWith(Function.identity)
	) as MTypes.OneArgFunction<
		{ readonly year: number; readonly month: number; readonly monthDay: number },
		string
	>;

	/**
	 * Returns the ISO representation of this Gregorian Date
	 *
	 * @category Destructors
	 */
	export const toIsoString: MTypes.OneArgFunction<Type, string> = flow(
		MStruct.enrichWith({ month: getMonth, monthDay: getMonthDay }),
		_formatter
	);
}

/**
 * Namespace for an IsoDate.
 *
 * An iso year starts on the first day of the first iso week. An iso week starts on a monday and
 * ends on a sunday. The first iso week of the year is the one that contains January 4th (see
 * Wikipedia).
 *
 * @category Models
 */
namespace IsoDate {
	const _namespaceTag = moduleTag + 'IsoDate/';
	const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
	type _TypeId = typeof _TypeId;

	/**
	 * Duration in milliseconds of a 6-iso-year period comprised of 1 long year and 5 short years (see
	 * Wikipedia)
	 *
	 * @category Constants
	 */
	const SIX_YEARS_MS = LONG_YEAR_MS + 5 * SHORT_YEAR_MS;

	/**
	 * Duration in milliseconds of an 11-iso-year period comprised of 2 long years and 9 short years
	 * (see Wikipedia)
	 *
	 * @category Constants
	 */
	const ELEVEN_YEARS_MS = 2 * LONG_YEAR_MS + 9 * SHORT_YEAR_MS;

	/**
	 * Duration in milliseconds of a 28-iso-year period comprised of 5 long years and 23 short years
	 * (see Wikipedia)
	 *
	 * @category Constants
	 */
	const TWENTY_EIGHT_YEARS_MS = 5 * LONG_YEAR_MS + 23 * SHORT_YEAR_MS;

	/**
	 * Duration in milliseconds of a 96-iso-year period comprised of 17 long years and 79 short years
	 * (see Wikipedia)
	 *
	 * @category Constants
	 */
	const NINETY_SIX_YEARS_MS = 17 * LONG_YEAR_MS + 79 * SHORT_YEAR_MS;

	/**
	 * Duration in milliseconds of a 100-iso-year period comprised of 18 long years and 82 short years
	 * (see Wikipedia)
	 *
	 * @category Constants
	 */
	const ONE_HUNDRED_YEARS_MS = 18 * LONG_YEAR_MS + 82 * SHORT_YEAR_MS;

	/**
	 * Duration in milliseconds of a 400-iso-year period comprised of 71 long years and 329 short
	 * years (see Wikipedia)
	 *
	 * @category Constants
	 */
	const FOUR_HUNDRED_YEARS_MS = 71 * LONG_YEAR_MS + 329 * SHORT_YEAR_MS;

	/**
	 * Timestamp of 03/01/2000 00:00:00:000+0:00
	 *
	 * @category Constants
	 */
	const YEAR_START_2000_MS = 946_857_600_000;

	/**
	 * Timestamp of 04/01/2010 00:00:00:000+0:00
	 *
	 * @category Constants
	 */
	const YEAR_START_2010_MS = 1_262_563_200_000;

	/**
	 * Type of an IsoYearDescriptor
	 *
	 * @category Models
	 */
	export interface Type extends Inspectable.Inspectable, Pipeable.Pipeable {
		/** Timestamp of any moment of the day represented by this IsoDate */
		readonly timestamp: number;

		/** The iso year of this IsoDate, range: [MIN_FULL_YEAR, MAX_FULL_YEAR] */
		readonly year: number;

		/** If true, iso year `year` counts 53 weeks. Otherwise, it counts 52 weeks */
		readonly yearIsLong: boolean;

		/** Timestamp of the first millisecond of UTC iso year `year` */
		readonly yearStartTimestamp: number;

		/** The iso week of this IsoYear, range:[1, 53] */
		readonly isoWeek: Option.Option<number>;

		/** The weekday of this DateTime, range:[1, 7], 1 is monday, 7 is sunday */
		readonly weekday: Option.Option<number>;

		/** @internal */
		readonly [_TypeId]: _TypeId;
	}

	/**
	 * Type guard
	 *
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

	/** Proto */
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: _TypeId,
		...MInspectable.BaseProto(_namespaceTag),
		...MPipeable.BaseProto
	};

	/** Constructor */
	const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Constructs an IsoDate from a timestamp
	 *
	 * @category Constructors
	 */
	export const fromTimestamp = (timestamp: number): Type => {
		const offset = timestamp - YEAR_START_2000_MS;

		const q400Years = Math.floor(offset / FOUR_HUNDRED_YEARS_MS);
		const r400Years = offset - q400Years * FOUR_HUNDRED_YEARS_MS;

		// The second one-hundred year period is a week shorter because it has 17 long years instead of 18
		// Also the hundred-th year must be put in the first one-hundred year period because it is not long
		const q100Years =
			r400Years < ONE_HUNDRED_YEARS_MS + SHORT_YEAR_MS ?
				0
			:	Math.floor((r400Years + WEEK_MS) / ONE_HUNDRED_YEARS_MS);

		const adjustedR400Years = r400Years - q100Years * NINETY_SIX_YEARS_MS + SHORT_YEAR_MS;
		const q28Years = Math.floor(adjustedR400Years / TWENTY_EIGHT_YEARS_MS);
		const r28Years = adjustedR400Years - q28Years * TWENTY_EIGHT_YEARS_MS;

		const adjustedR28Years = r28Years - ELEVEN_YEARS_MS;
		const q11Years = Math.floor(adjustedR28Years / ELEVEN_YEARS_MS);
		const r11Years = adjustedR28Years - q11Years * ELEVEN_YEARS_MS;

		const q6Years = Math.floor(r11Years / SIX_YEARS_MS);
		const r6Years = r11Years - q6Years * SIX_YEARS_MS;

		const isFirstSixYearPeriod = q6Years === 0;
		const q1Year = Math.min(Math.floor(r6Years / SHORT_YEAR_MS), isFirstSixYearPeriod ? 5 : 4);

		//console.log(q400Years, q100Years, q28Years, q11Years, q6Years, q1Year);
		return _make({
			timestamp,
			year:
				2010 +
				q400Years * 400 +
				q100Years * 96 +
				q28Years * 28 +
				q11Years * 11 +
				q6Years * 6 +
				q1Year,
			yearStartTimestamp:
				YEAR_START_2010_MS +
				q400Years * FOUR_HUNDRED_YEARS_MS +
				q100Years * NINETY_SIX_YEARS_MS +
				q28Years * TWENTY_EIGHT_YEARS_MS +
				q11Years * ELEVEN_YEARS_MS +
				q6Years * SIX_YEARS_MS +
				q1Year * SHORT_YEAR_MS,
			yearIsLong: (isFirstSixYearPeriod && q1Year == 5) || (!isFirstSixYearPeriod && q1Year == 4),
			isoWeek: Option.none(),
			weekday: Option.none()
		});
	};

	/**
	 * Constructs an IsoDate from a GregorianDate
	 *
	 * @category Constructors
	 */
	export const fromGregorianDate = (gregorianDate: GregorianDate.Type): Type => {
		// 0 is friday, 6 is thursday
		const yearStartWeekday = MNumber.intModulo(7)(
			Math.floor((gregorianDate.yearStartTimestamp - DAY_MS) / DAY_MS)
		);
		const yearIsLeap = gregorianDate.yearIsLeap;
		const minOrdinalDayIndex = 3 - yearStartWeekday;
		const ordinalDay = gregorianDate.ordinalDay;

		if (ordinalDay <= minOrdinalDayIndex) {
			const year = gregorianDate.year - 1;
			const yearIsLong =
				yearStartWeekday === 0 ||
				(yearStartWeekday === 1 &&
					!yearIsLeap &&
					((year % 4 == 0 && year % 100 != 0) || year % 400 == 0));
			return _make({
				timestamp: gregorianDate.timestamp,
				year,
				yearStartTimestamp:
					gregorianDate.yearStartTimestamp +
					(minOrdinalDayIndex - (yearIsLong ? 371 : 364)) * DAY_MS,
				yearIsLong,
				isoWeek: Option.none(),
				weekday: Option.none()
			});
		}

		const yearIsLong = yearStartWeekday === 6 || (yearStartWeekday === 5 && yearIsLeap);
		const maxOrdinalDay = minOrdinalDayIndex + (yearIsLong ? 371 : 364);

		if (ordinalDay > maxOrdinalDay) {
			const year = gregorianDate.year + 1;
			const yearIsLong =
				yearIsLeap ?
					yearStartWeekday === 4
				:	yearStartWeekday === 5 ||
					(yearStartWeekday === 4 && ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0));

			return _make({
				timestamp: gregorianDate.timestamp,
				year,
				yearStartTimestamp: gregorianDate.yearStartTimestamp + maxOrdinalDay * DAY_MS,
				yearIsLong,
				isoWeek: Option.none(),
				weekday: Option.none()
			});
		}

		return _make({
			timestamp: gregorianDate.timestamp,
			year: gregorianDate.year,
			yearStartTimestamp: gregorianDate.yearStartTimestamp + minOrdinalDayIndex * DAY_MS,
			yearIsLong,
			isoWeek: Option.none(),
			weekday: Option.none()
		});
	};

	/**
	 * If possible, returns a new IsoDate having `year` set to `year` and the same `isoWeek` and
	 * `weekday` as `self`. Returns a left of an error otherwise. `year` must be an integer comprised
	 * in the range [MIN_FULL_YEAR, MAX_FULL_YEAR]. If the isoWeek of `self` is equal to 53, `year`
	 * must be a long year.
	 *
	 * @category Setters
	 */
	export const setYear =
		(year: number) =>
		(self: Type): Either.Either<Type, MInputError.Type> =>
			Either.gen(function* () {
				const validatedYear = yield* pipe(
					year,
					MInputError.assertInRange({
						min: MIN_FULL_YEAR,
						max: MAX_FULL_YEAR,
						minIncluded: true,
						maxIncluded: true,
						offset: 0,
						name: "'year'"
					})
				);
				const offset = validatedYear - 2000;

				const q400Years = Math.floor(offset / 400);
				const r400Years = offset - q400Years * 400;

				// year 100 needs to be treated in the first one-hundred year period because it is not a long year
				const q100Years = r400Years === 100 ? 0 : Math.floor(r400Years / 100);

				const adjustedR400Years = r400Years - q100Years * 96 + 1;
				const q28Years = Math.floor(adjustedR400Years / 28);
				const r28Years = adjustedR400Years - q28Years * 28;

				const adjustedR28Years = r28Years - 11;
				const q11Years = Math.floor(adjustedR28Years / 11);
				const r11Years = adjustedR28Years - q11Years * 11;

				const yearStartTimestamp =
					YEAR_START_2010_MS +
					q400Years * FOUR_HUNDRED_YEARS_MS +
					q100Years * NINETY_SIX_YEARS_MS +
					q28Years * TWENTY_EIGHT_YEARS_MS +
					q11Years * ELEVEN_YEARS_MS +
					r11Years * SHORT_YEAR_MS +
					(r11Years > 5 ? WEEK_MS : 0);

				return yield* pipe(
					_make({
						timestamp: self.timestamp + yearStartTimestamp - self.yearStartTimestamp,
						year: validatedYear,
						yearStartTimestamp,
						yearIsLong: r11Years === 5 || r11Years === 10,
						isoWeek: Option.some(getIsoWeek(self)),
						weekday: Option.some(getWeekday(self))
					}),
					Either.liftPredicate(
						Predicate.or(yearIsLong, flow(getIsoWeek, Number.lessThan(53))),
						() =>
							new MInputError.Type({
								message: `No 53rd week on iso year ${year} which is not a short year`
							})
					)
				);
			});

	/**
	 * If possible, returns a new IsoDate having `isoWeek` set to `isoWeek` and the same `year` and
	 * `weekday` as `self`. Returns a left of an error otherwise. `isoWeek` must be an integer greater
	 * than or equal to 1 and less than or equal to the number of iso weeks in the current year.
	 *
	 * @category Setters
	 */
	export const setIsoWeek =
		(isoWeek: number) =>
		(self: Type): Either.Either<Type, MInputError.Type> =>
			Either.gen(function* () {
				const validatedIsoWeek = yield* pipe(
					isoWeek,
					MInputError.assertInRange({
						min: 1,
						max: getLastIsoWeek(self),
						minIncluded: true,
						maxIncluded: true,
						offset: 0,
						name: "'isoWeek'"
					})
				);

				const offset = validatedIsoWeek - getIsoWeek(self);
				return pipe(
					self,
					MStruct.evolve({
						timestamp: Number.sum(offset * WEEK_MS),
						isoWeek: pipe(validatedIsoWeek, Option.some, Function.constant)
					}),
					_make
				);
			});

	/**
	 * If possible, returns a new IsoDate having `weekday` set to `weekday` and the same `year` and
	 * `isoWeek` as `self`. Returns a left of an error otherwise. `weekday` must be an integer greater
	 * than or equal to 1 (monday) and less than or equal to 7 (sunday).
	 *
	 * @category Setters
	 */
	export const setWeekday =
		(weekday: number) =>
		(self: Type): Either.Either<Type, MInputError.Type> =>
			Either.gen(function* () {
				const validatedWeekday = yield* pipe(
					weekday,
					MInputError.assertInRange({
						min: 1,
						max: 7,
						minIncluded: true,
						maxIncluded: true,
						offset: 0,
						name: "'weekday'"
					})
				);

				const offset = validatedWeekday - getWeekday(self);
				return pipe(
					self,
					MStruct.evolve({
						timestamp: Number.sum(offset * DAY_MS),
						weekday: pipe(validatedWeekday, Option.some, Function.constant)
					}),
					_make
				);
			});

	/**
	 * Returns the `timestamp` property of `self`
	 *
	 * @category Destructors
	 */
	export const timestamp: MTypes.OneArgFunction<Type, number> = Struct.get('timestamp');

	/**
	 * Returns the `year` property of `self`
	 *
	 * @category Destructors
	 */
	export const year: MTypes.OneArgFunction<Type, number> = Struct.get('year');

	/**
	 * Returns the `yearStartTimestamp` property of `self`
	 *
	 * @category Destructors
	 */
	export const yearStartTimestamp: MTypes.OneArgFunction<Type, number> =
		Struct.get('yearStartTimestamp');

	/**
	 * Returns the `yearIsLong` property of `self`
	 *
	 * @category Destructors
	 */
	export const yearIsLong: Predicate.Predicate<Type> = Struct.get('yearIsLong');

	/**
	 * Returns the `isoWeek` of `self`
	 *
	 * @category Destructors
	 */
	export const getIsoWeek = (self: Type): number =>
		pipe(
			self.isoWeek,
			Option.getOrElse(() => {
				const result = Math.floor((self.timestamp - self.yearStartTimestamp) / WEEK_MS) + 1;
				/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */
				(self as MTypes.WithMutable<Type, 'isoWeek'>).isoWeek = Option.some(result);
				return result;
			})
		);

	/**
	 * Returns the `weekday` of `self`
	 *
	 * @category Destructors
	 */
	export const getWeekday = (self: Type): number =>
		pipe(
			self.weekday,
			Option.getOrElse(() => {
				const result =
					Math.floor(
						(self.timestamp - self.yearStartTimestamp - (getIsoWeek(self) - 1) * WEEK_MS) / DAY_MS
					) + 1;
				/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */
				(self as MTypes.WithMutable<Type, 'weekday'>).weekday = Option.some(result);
				return result;
			})
		);

	/**
	 * Returns the duration of the year described by `self` in milliseconds
	 *
	 * @category Destructors
	 */
	export const getMsDuration = (self: Type): number =>
		self.yearIsLong ? LONG_YEAR_MS : SHORT_YEAR_MS;

	/**
	 * Returns the duration of the year described by `self` in milliseconds
	 *
	 * @category Destructors
	 */
	export const getLastIsoWeek = (self: Type): number => (self.yearIsLong ? 53 : 52);

	const _formatter = flow(
		CVTemplate.toFormatter(
			CVTemplate.make(
				_tag({ ..._params, name: 'year', length: 4 }),
				_sep.make('-W'),
				_tag({ ..._params, name: 'isoWeek', length: 2 }),
				_sep.hyphen,
				_tag({ ..._params, name: 'weekday', length: 2 })
			)
		),
		Either.getOrThrowWith(Function.identity)
	) as MTypes.OneArgFunction<
		{ readonly year: number; readonly isoWeek: number; readonly weekday: number },
		string
	>;

	/**
	 * Returns the ISO representation of this Gregorian Date
	 *
	 * @category Destructors
	 */
	export const toIsoString: MTypes.OneArgFunction<Type, string> = flow(
		MStruct.enrichWith({ isoWeek: getIsoWeek, weekday: getWeekday }),
		_formatter
	);
}

/**
 * Namespace for the data relative to the time
 *
 * @category Models
 */
namespace Time {
	const _namespaceTag = moduleTag + 'Time/';
	const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
	type _TypeId = typeof _TypeId;

	/**
	 * Type of a Time
	 *
	 * @category Models
	 */
	export interface Type extends Inspectable.Inspectable, Pipeable.Pipeable {
		/** This Time expressed in milliseconds, range:[0, DAY_MS[ */
		readonly timestampOffset: number;

		/** Hour23 of this Time, range:[0, 23] */
		readonly hour23: number;

		/** Hour11 of this Time, range:[0, 11] */
		readonly hour11: number;

		/** Meridiem of this Time, 0 for 'AM', 12 for 'PM' */
		readonly meridiem: 0 | 12;

		/** Minute of this Time, range:[0, 59] */
		readonly minute: number;

		/** Second of this Time, range:[0, 59] */
		readonly second: number;

		/** Millisecond of this Time, range:[0, 999] */
		readonly millisecond: number;

		/** @internal */
		readonly [_TypeId]: _TypeId;
	}

	/**
	 * Type guard
	 *
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

	/** Proto */
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: _TypeId,
		...MInspectable.BaseProto(_namespaceTag),
		...MPipeable.BaseProto
	};

	/** Constructor */
	const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Constructs the Time that corresponds to the passed `timestampOffset` which is the number of
	 * milliseconds from the start of the current day
	 *
	 * @category Constructors
	 */
	export const fromTimestamp = (timestampOffset: number): Type => {
		const hour23 = Math.floor(timestampOffset / HOUR_MS);
		const rHour23 = timestampOffset - hour23 * HOUR_MS;

		const [hour11, meridiem] = hour23 >= 12 ? ([hour23 - 12, 12] as const) : ([hour23, 0] as const);

		const minute = Math.floor(rHour23 / MINUTE_MS);
		const rMinute = rHour23 - minute * MINUTE_MS;

		const second = Math.floor(rMinute / SECOND_MS);

		return _make({
			timestampOffset,
			hour23,
			hour11,
			meridiem,
			minute,
			second,
			millisecond: rMinute - second * SECOND_MS
		});
	};

	/**
	 * If possible, returns a right of a copy of `self` with `hour23` set to `hour23`. Returns a left
	 * of an error otherwise. `hour23` must be an integer greater than or equal to 0 and less than or
	 * equal to 23
	 *
	 * @category Setters
	 */
	export const setHour23 =
		(hour23: number) =>
		(self: Type): Either.Either<Type, MInputError.Type> =>
			Either.gen(function* () {
				const validatedHour23 = yield* pipe(
					hour23,
					MInputError.assertInRange({
						min: 0,
						max: 23,
						minIncluded: true,
						maxIncluded: true,
						offset: 0,
						name: "'hour23'"
					})
				);

				const isPast12 = validatedHour23 >= 12;
				return _make({
					...self,
					timestampOffset: self.timestampOffset + (validatedHour23 - self.hour23) * HOUR_MS,
					hour23: validatedHour23,
					hour11: isPast12 ? hour23 - 12 : hour23,
					meridiem: isPast12 ? 12 : 0
				});
			});

	/**
	 * If possible, returns a right of a copy of `self` with `hour11` set to `hour11`. Returns a left
	 * of an error otherwise. `hour11` must be an integer greater than or equal to 0 and less than or
	 * equal to 11
	 *
	 * @category Setters
	 */
	export const setHour11 =
		(hour11: number) =>
		(self: Type): Either.Either<Type, MInputError.Type> =>
			Either.gen(function* () {
				const validatedHour11 = yield* pipe(
					hour11,
					MInputError.assertInRange({
						min: 0,
						max: 11,
						minIncluded: true,
						maxIncluded: true,
						offset: 0,
						name: "'hour11'"
					})
				);
				const validatedHour23 = self.meridiem + validatedHour11;
				return _make({
					...self,
					timestampOffset: self.timestampOffset + (validatedHour23 - self.hour23) * HOUR_MS,
					hour23: validatedHour23,
					hour11: validatedHour11
				});
			});

	/**
	 * Returns a copy of `self` with `meridiem` set to `merdiem`.
	 *
	 * @category Setters
	 */
	export const setMeridiem =
		(meridiem: 0 | 12) =>
		(self: Type): Type => {
			const validatedHour23 = self.hour11 + meridiem;
			return _make({
				...self,
				timestampOffset: self.timestampOffset + (validatedHour23 - self.hour23) * HOUR_MS,
				hour23: validatedHour23,
				meridiem
			});
		};

	/**
	 * If possible, returns a right of a copy of `self` with `minute` set to `minute`. Returns a left
	 * of an error otherwise. `minute` must be an integer greater than or equal to 0 and less than or
	 * equal to 59
	 *
	 * @category Setters
	 */
	export const setMinute =
		(minute: number) =>
		(self: Type): Either.Either<Type, MInputError.Type> =>
			Either.gen(function* () {
				const validatedMinute = yield* pipe(
					minute,
					MInputError.assertInRange({
						min: 0,
						max: 59,
						minIncluded: true,
						maxIncluded: true,
						offset: 0,
						name: "'minute'"
					})
				);

				return _make({
					...self,
					timestampOffset: self.timestampOffset + (validatedMinute - self.minute) * MINUTE_MS,
					minute: validatedMinute
				});
			});

	/**
	 * If possible, returns a right of a copy of `self` with `second` set to `second`. Returns a left
	 * of an error otherwise. `second` must be an integer greater than or equal to 0 and less than or
	 * equal to 59
	 *
	 * @category Setters
	 */
	export const setSecond =
		(second: number) =>
		(self: Type): Either.Either<Type, MInputError.Type> =>
			Either.gen(function* () {
				const validatedSecond = yield* pipe(
					second,
					MInputError.assertInRange({
						min: 0,
						max: 59,
						minIncluded: true,
						maxIncluded: true,
						offset: 0,
						name: "'second'"
					})
				);

				return _make({
					...self,
					timestampOffset: self.timestampOffset + (validatedSecond - self.second) * SECOND_MS,
					second: validatedSecond
				});
			});

	/**
	 * If possible, returns a right of a copy of `self` with `millisecond` set to `millisecond`.
	 * Returns a left of an error otherwise. `millisecond` must be an integer greater than or equal to
	 * 0 and less than or equal to 999
	 *
	 * @category Setters
	 */
	export const setMillisecond =
		(millisecond: number) =>
		(self: Type): Either.Either<Type, MInputError.Type> =>
			Either.gen(function* () {
				const validatedMillisecond = yield* pipe(
					millisecond,
					MInputError.assertInRange({
						min: 0,
						max: 999,
						minIncluded: true,
						maxIncluded: true,
						offset: 0,
						name: "'millisecond'"
					})
				);

				return _make({
					...self,
					timestampOffset: self.timestampOffset + validatedMillisecond - self.millisecond,
					millisecond: validatedMillisecond
				});
			});

	/**
	 * Returns the `timestampOffset` property of `self`
	 *
	 * @category Destructors
	 */
	export const timestampOffset: MTypes.OneArgFunction<Type, number> = Struct.get('timestampOffset');

	/**
	 * Returns the `hour23` property of `self`
	 *
	 * @category Destructors
	 */
	export const hour23: MTypes.OneArgFunction<Type, number> = Struct.get('hour23');
	/**
	 * Returns the `hour11` property of `self`
	 *
	 * @category Destructors
	 */
	export const hour11: MTypes.OneArgFunction<Type, number> = Struct.get('hour11');

	/**
	 * Returns the `meridiem` property of `self`
	 *
	 * @category Destructors
	 */
	export const meridiem: MTypes.OneArgFunction<Type, 0 | 12> = Struct.get('meridiem');

	/**
	 * Returns the `minute` property of `self`
	 *
	 * @category Destructors
	 */
	export const minute: MTypes.OneArgFunction<Type, number> = Struct.get('minute');

	/**
	 * Returns the `second` property of `self`
	 *
	 * @category Destructors
	 */
	export const second: MTypes.OneArgFunction<Type, number> = Struct.get('second');

	/**
	 * Returns the `millisecond` property of `self`
	 *
	 * @category Destructors
	 */
	export const millisecond: MTypes.OneArgFunction<Type, number> = Struct.get('millisecond');

	const _formatter = flow(
		CVTemplate.toFormatter(
			CVTemplate.make(
				_tag({ ..._params, name: 'hour23', length: 2 }),
				_sep.colon,
				_tag({ ..._params, name: 'minute', length: 2 }),
				_sep.colon,
				_tag({ ..._params, name: 'second', length: 2 }),
				_sep.dot,
				_tag({ ..._params, name: 'millisecond', length: 3 })
			)
		),
		Either.getOrThrowWith(Function.identity)
	) as MTypes.OneArgFunction<
		{
			readonly hour23: number;
			readonly minute: number;
			readonly second: number;
			readonly millisecond: number;
		},
		string
	>;

	/**
	 * Returns the ISO representation of this Gregorian Date
	 *
	 * @category Destructors
	 */
	export const toIsoString: MTypes.OneArgFunction<Type, string> = _formatter;
}

/**
 * Namespace for the data relative to the parts of a zone offset
 *
 * @category Models
 */
namespace ZoneOffsetParts {
	const _namespaceTag = moduleTag + 'ZoneOffsetParts/';
	const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
	type _TypeId = typeof _TypeId;

	/**
	 * Type of a ZoneOffsetParts. Note that ZoneOffsetParts with hour=-0, minute=10, second=0 is
	 * different from hour=0, minute=10, second=0. The first corresponds to the string 'GMT-00:10', a
	 * negative 10-minute offset, the second one to the string 'GMT+00:10', a positive 10-minute
	 * offset.
	 *
	 * @category Models
	 */
	export interface Type extends Inspectable.Inspectable, Pipeable.Pipeable {
		/** Hour part, range: [-12,14] */
		readonly zoneHour: number;

		/** Minute part, range: [0, 59] */
		readonly zoneMinute: number;

		/** Second part, range: [0, 59] */
		readonly zoneSecond: number;

		/** @internal */
		readonly [_TypeId]: _TypeId;
	}

	/**
	 * Type guard
	 *
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

	/** Proto */
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: _TypeId,
		...MInspectable.BaseProto(_namespaceTag),
		...MPipeable.BaseProto
	};

	export const _make = (params: MTypes.Data<Type>): Type =>
		MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Builds a ZoneOffsetParts from `zoneOffset`
	 *
	 * @category Constructors
	 */
	export const fromZoneOffset = (zoneOffset: number): Type => {
		const zoneHour = Math.trunc(zoneOffset);
		const minutesSeconds = Math.abs(zoneOffset - zoneHour) * 60;
		const zoneMinute = Math.trunc(minutesSeconds);
		const zoneSecond = Math.trunc((minutesSeconds - zoneMinute) * 60);

		return _make({ zoneHour, zoneMinute, zoneSecond });
	};

	/**
	 * Tries to build a ZoneOffsetParts from `zoneHour`, `zoneMinute`, `zoneSecond`. Returns a `some`
	 * if successful. A `none` otherwise.
	 *
	 * - `zoneHour` must be greater than or equal to -12 and less than or equal to 14.
	 * - `zoneMinute` must be greater than or equal to 0 and less than or equal to 59.
	 * - `zoneSecond` must be greater than or equal to 0 and less than or equal to 59.
	 *
	 * @category Constructors
	 */
	export const fromParts = ({
		zoneHour,
		zoneMinute,
		zoneSecond
	}: {
		readonly zoneHour: number;
		readonly zoneMinute: number;
		readonly zoneSecond: number;
	}): Either.Either<Type, MInputError.Type> =>
		Either.gen(function* () {
			const validatedHour = yield* pipe(
				zoneHour,
				MInputError.assertInRange({
					min: -12,
					max: 14,
					minIncluded: true,
					maxIncluded: true,
					offset: 0,
					name: "'zoneHour'"
				})
			);

			const validatedMinute = yield* pipe(
				zoneMinute,
				MInputError.assertInRange({
					min: 0,
					max: 59,
					minIncluded: true,
					maxIncluded: true,
					offset: 0,
					name: "'zoneMinute'"
				})
			);
			const validatedSecond = yield* pipe(
				zoneSecond,
				MInputError.assertInRange({
					min: 0,
					max: 59,
					minIncluded: true,
					maxIncluded: true,
					offset: 0,
					name: "'zoneSecond'"
				})
			);

			return _make({
				zoneHour: validatedHour,
				zoneMinute: validatedMinute,
				zoneSecond: validatedSecond
			});
		});

	/**
	 * Returns the `zoneHour` property of `self`
	 *
	 * @category Destructors
	 */
	export const zoneHour: MTypes.OneArgFunction<Type, number> = Struct.get('zoneHour');

	/**
	 * Returns the `zoneMinute` property of `self`
	 *
	 * @category Destructors
	 */
	export const zoneMinute: MTypes.OneArgFunction<Type, number> = Struct.get('zoneMinute');
	/**
	 * Returns the `zoneSecond` property of `self`
	 *
	 * @category Destructors
	 */
	export const zoneSecond: MTypes.OneArgFunction<Type, number> = Struct.get('zoneSecond');

	const _formatter = flow(
		CVTemplate.toFormatter(
			CVTemplate.make(
				_tag({
					..._params,
					name: 'zoneHour',
					length: 3,
					numberBase10Format: pipe(_integer, CVNumberBase10Format.withSignDisplay('signed integer'))
				}),
				_sep.colon,
				_tag({ ..._params, name: 'zoneMinute', length: 2 })
			)
		),
		Either.getOrThrowWith(Function.identity)
	) as MTypes.OneArgFunction<{ readonly zoneHour: number; readonly zoneMinute: number }, string>;

	/**
	 * Returns the ISO representation of this Gregorian Date
	 *
	 * @category Destructors
	 */
	export const toIsoString: MTypes.OneArgFunction<Type, string> = _formatter;

	/**
	 * Returns the value of `self` expressed in hours
	 *
	 * @category Destructors
	 */
	export const toHour = (self: Type): number => {
		const hour = self.zoneHour;
		const sign = MNumber.sign2(hour);
		return hour + sign * (self.zoneMinute / 60 + self.zoneSecond / 3600);
	};
}

/**
 * Type of a DateTime
 *
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Type, Pipeable.Pipeable {
	/** Timestamp of this DateTime (timezone-independent) */
	readonly timestamp: number;

	/** GregorianDate of this DateTime, expressed in given timezone */
	readonly gregorianDate: Option.Option<GregorianDate.Type>;

	/** IsoDate of this DateTime, expressed in given timezone */
	readonly isoDate: Option.Option<IsoDate.Type>;

	/** Time of this DateTime, expressed in given timezone */
	readonly time: Option.Option<Time.Type>;

	/**
	 * Offset in hours between the time of the zone for which all calculations of that DateTime object
	 * will be carried out and UTC time (e.g zoneOffset=1 for timezone +1:00). Not necessarily an
	 * integer, range: ]-13, 15[
	 */
	readonly zoneOffset: number;

	/** ZoneOffset decomposed into its parts */
	readonly zoneOffsetParts: Option.Option<ZoneOffsetParts.Type>;

	/** @internal */
	readonly _zonedTimestamp: number;
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
		return toIsoString(this);
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Returns the ISO representation of this DateTime
 *
 * @category Destructors
 */
export const toIsoString = (self: Type): string =>
	GregorianDate.toIsoString(_gregorianDate(self)) +
	'T' +
	Time.toIsoString(_time(self)) +
	ZoneOffsetParts.toIsoString(_zoneOffsetParts(self));

const _uncalculated = {
	gregorianDate: Option.none(),
	isoDate: Option.none(),
	time: Option.none(),
	zoneOffsetParts: Option.none()
};

/**
 * Constructor that creates a DateTime from a timestamp and a zoneOffset for which no calculations
 * have been carried out yet. The `_zonedTimestamp` field is automatically calculated. Does not
 * check any input parameters
 */
const _uncalculatedFromTimestamp = (timestamp: number, zoneOffset: number): Type =>
	_make({
		..._uncalculated,
		timestamp,
		zoneOffset,
		_zonedTimestamp: timestamp + zoneOffset * HOUR_MS
	});

/**
 * Constructor that creates a DateTime from a zonedTimestamp and a zoneOffset for which no
 * calculations have been carried out yet. The `timestamp` field is automatically calculated. Does
 * not check any input parameters
 */
const _uncalculatedFromZonedTimestamp = (zonedTimestamp: number, zoneOffset: number): Type =>
	_make({
		..._uncalculated,
		timestamp: zonedTimestamp - zoneOffset * HOUR_MS,
		zoneOffset,
		_zonedTimestamp: zonedTimestamp
	});

/** Instance of an uncalculated DateTime that represents 1/1/1970 00:00:00:000+0:00 */

const _uncalculatedOrigin = _uncalculatedFromTimestamp(0, 0);

/**
 * Tries to build a DateTime from `timestamp`, the number of milliseconds since 1/1/1970
 * 00:00:00:000+0:00, and `zoneOffset` which gives the offset between the local time and the UTC
 * time. Returns a `right` of a DateTime if successful.
 *
 * `timestamp` must be greater than or equal to MIN_TIMESTAMP and less than or equal to
 * MAX_TIMESTAMP.
 *
 * If `zoneOffset` is omitted, the local time zone offset of the machine this code is running on is
 * used.
 *
 * `zoneOffset` can be expressed as as a number of hours. In this case, it must be strictly greater
 * to -13 and strictly less than 15.
 *
 * It can also be expressed as an object containing three components:
 *
 * - `zoneHour` which must be greater than or equal to -12 and less than or equal to 14.
 * - `zoneMinute` which must be greater than or equal to 0 and less than or equal to 59.
 * - `zoneSecond` which must be greater than or equal to 0 and less than or equal to 59.
 *
 * Note that zoneHour=-0, zoneMinute=10, zoneSecond=0 is different from zoneHour=0, zoneMinute=10,
 * zoneSecond=0. The first corresponds to the string 'GMT-00:10', a negative 10-minute offset, the
 * second one to the string 'GMT+00:10', a positive 10-minute offset.
 *
 * `timestamp`, `zoneHour`, `zoneMinute` and `zoneSecond` should be integers. `zoneOffset`, when
 * expressed as a number of hours, does not need to be an integer.
 *
 * @category Constructors
 */
export const fromTimestamp = (
	timestamp: number,
	zoneOffset?:
		| number
		| {
				readonly zoneHour: number;
				readonly zoneMinute: number;
				readonly zoneSecond: number;
		  }
): Either.Either<Type, MInputError.Type> =>
	pipe(
		_uncalculatedOrigin,
		setTimestamp(timestamp),
		Either.flatMap(_setZoneOffset(true, zoneOffset))
	);

/**
 * Same as fromTimestamp but returns directly the DateTime or throws if it cannot be built
 *
 * @category Constructors
 */
export const unsafeFromTimestamp = (
	timestamp: number,
	zoneOffset?:
		| number
		| {
				readonly zoneHour: number;
				readonly zoneMinute: number;
				readonly zoneSecond: number;
		  }
): Type => Either.getOrThrowWith(fromTimestamp(timestamp, zoneOffset), Function.identity);

/**
 * Builds a DateTime using Date.now() as timestamp. `zoneOffset` is set to 0.
 *
 * @category Constructors
 */
export const now = (): Type => _uncalculatedFromTimestamp(Date.now(), 0);

/**
 * Namespace for the different parts of a date
 *
 * @category Models
 */
export namespace Parts {
	/**
	 * Type of a Parts
	 *
	 * @category Models
	 */
	export interface Type {
		/** The Gregorian year, range: [MIN_FULL_YEAR, MAX_FULL_YEAR] */
		readonly year?: number;
		/** Number of days elapsed since the start of year, range:[1, 366] */
		readonly ordinalDay?: number;
		/** Month in the current year, range:[1, 12] */
		readonly month?: number;
		/** Day in the current month, range:[1, 12] */
		readonly monthDay?: number;
		/** The iso year, range: [MIN_FULL_YEAR, MAX_FULL_YEAR] */
		readonly isoYear?: number;
		/** The iso week in the current iso year, range:[1, 53] */
		readonly isoWeek?: number;
		/** Week day in the current iso week, range:[1, 7], 1 is monday, 7 is sunday */
		readonly weekday?: number;
		/** Number of hours since the start of the current day, range:[0, 23] */
		readonly hour23?: number;
		/** Number of hours since the start of the current meridiem, range:[0, 11] */
		readonly hour11?: number;
		/** Meridiem offset of this DateTime in hours, 0 for 'AM', 12 for 'PM' */
		readonly meridiem?: 0 | 12;
		/** Number of minutes since the start of the current hour, range:[0, 59] */
		readonly minute?: number;
		/** Number of seconds, since sthe start of the current minute, range:[0, 59] */
		readonly second?: number;
		/** Number of milliseconds, since sthe start of the current second, range:[0, 999] */
		readonly millisecond?: number;
		/**
		 * Offset in hours between the time in the local zone and UTC time (e.g zoneOffset=1 for
		 * timezone +1:00). Not necessarily an integer, range: ]-13, 15[
		 */
		readonly zoneOffset?: number;
		/** Hour part of the zoneOffset. Should be an integer in the range: [-12, 14] */
		readonly zoneHour?: number;
		/** Minute part of the zoneOffset. Should be an integer in the range: [0, 59] */
		readonly zoneMinute?: number;
		/** Second part of the zoneOffset. Should be an integer in the range: [0, 59] */
		readonly zoneSecond?: number;
	}
}
/**
 * Tries to build a DateTime from the provided DateTime parts. Returns a `right` of this DateTime if
 * successful. Returns a `left` of an error otherwise.
 *
 * `year` must comprised in the range [MIN_FULL_YEAR, MAX_FULL_YEAR]. `ordinalDay` must be greater
 * than or equal to 1 and less than or equal to the number of days in the current year. `month` must
 * be greater than or equal to 1 (January) and less than or equal to 12 (December). `monthDay` must
 * be greater than or equal to 1 and less than or equal to the number of days in the current month.
 *
 * `isoYear` must be comprised in the range [MIN_FULL_YEAR, MAX_FULL_YEAR]. `isoWeek` must be
 * greater than or equal to 1 and less than or equal to the number of iso weeks in the current year.
 * `weekday` must be greater than or equal to 1 (monday) and less than or equal to 7 (sunday).
 *
 * If there is not sufficient information to determine the exact day of the year, i.e. none of the
 * three following tuples is fully determined [year, ordinalDay], [year, month, monthDay], [isoYear,
 * isoWeek, weekday], default values are determined in the following order (the first match stops
 * the process):
 *
 * - If `year` and `month` are set, `monthDay` is taken equal to 1.
 * - If `year` and `monthDay` are set, `month` is taken equal to 1.
 * - If `year` is set and both `month` and `monthDay` are undefined, the day is taken to be the first
 *   one in the year.
 * - If `isoYear` and `isoWeek` are set, `weekday` is taken equal to 1.
 * - If `isoYear` and `weekday` are set, `isoWeek` is taken equal to 1.
 * - If `isoYear` is set and both `isoWeek` and `weekday` are undefined, the day is taken to be the
 *   first one in the iso year.
 * - If both `year` and `isoYear` are undefined, an error is raised.
 *
 * `hour23` must be greater than or equal to 0 and less than or equal to 23. `hour11` must be
 * greater than or equal to 0 and less than or equal to 11. `meridiem` must be one of 0 (AM) or 12
 * (PM). If there is not sufficient information to determine the hour of the day, i.e. none of the
 * two following tuples is fully determined [hour23], [hour11, meridiem], default values are
 * determined as follows:
 *
 * - If `meridiem` is set, `hour11` is taken equal to 0.
 * - If `hour11` is set, `meridiem` is taken equal to 0.
 * - Otherwise, `meridiem` and `hour11` are taken equal to 0.
 *
 * `minute` must be greater than or equal to 0 and less than or equal to 59. If omitted, minute is
 * assumed to be 0.
 *
 * `second` must be greater than or equal to 0 and less than or equal to 59. If omitted, second is
 * assumed to be 0.
 *
 * `millisecond` must be greater than or equal to 0 and less than or equal to 999. If omitted,
 * millisecond is assumed to be 0.
 *
 * `zoneOffset` must be strictly greater to -13 and strictly less than 15. `zoneHour` must be
 * greater than or equal to -12 and less than or equal to 14. `zoneMinute` must be greater than or
 * equal to 0 and less than or equal to 59. `zoneSecond` must be greater than or equal to 0 and less
 * than or equal to 59.
 *
 * If there is not sufficient information to determine the exact time zone offset, i.e. none of the
 * two following tuples is fully determined [zoneOffset], [zoneHour, zoneMinute, zoneSecond],
 * default values are determined as follows :
 *
 * - If all parameters are undefined, the local time zone offset of the machine this code is running
 *   on is used.
 * - If any of `zoneHour`, `zoneMinute`, `zoneSecond`, the undefined parameters are taken equal to 0.
 *
 * Note that zoneHour=-0, zoneMinute=10, zoneSecond=0 is different from zoneHour=0, zoneMinute=10,
 * zoneSecond=0. The first corresponds to the string 'GMT-00:10', a negative 10-minute offset, the
 * second one to the string 'GMT+00:10', a positive 10-minute offset.
 *
 * `year`, `ordinalDay`, `month`, `monthDay`, `isoYear`, `isoWeek`, `weekDay`, `hour23`, `hour11`,
 * `minute`, `second`, `millisecond`, `zoneHour`, `zoneMinute` and `zoneSecond` should be integers.
 * `zoneOffset` does not need to be an integer.
 *
 * All parameters must be coherent. For instance, `year=1970`, `month=1`, `monthDay=1`, `weekday=0`
 * `zoneHour=0`, `zoneMinute=0` and `zoneSecond=0` will trigger an error because 1/1/1970
 * 00:00:00:000+0:00 is a thursday. `hour23=13` and `meridiem=0` will also trigger an error.
 *
 * @category Constructors
 */

export const fromParts = ({
	year,
	ordinalDay,
	month,
	monthDay,
	isoYear,
	isoWeek,
	weekday,
	hour23,
	hour11,
	meridiem,
	minute,
	second,
	millisecond,
	zoneOffset,
	zoneHour,
	zoneMinute,
	zoneSecond
}: Parts.Type): Either.Either<Type, MInputError.Type> =>
	Either.gen(function* () {
		const zonedOrigin = yield* Either.gen(function* () {
			if (
				zoneOffset !== undefined ||
				(zoneHour === undefined && zoneMinute === undefined && zoneSecond === undefined)
			) {
				const result = yield* pipe(_uncalculatedOrigin, _setZoneOffset(false, zoneOffset));

				if (zoneHour !== undefined)
					yield* pipe(
						zoneHour,
						MInputError.assertValue({
							expected: getZoneHour(result),
							name: "'zoneHour'"
						})
					);
				if (zoneMinute !== undefined)
					yield* pipe(
						zoneMinute,
						MInputError.assertValue({ expected: getZoneMinute(result), name: "'zoneMinute'" })
					);
				if (zoneSecond !== undefined)
					yield* pipe(
						zoneSecond,
						MInputError.assertValue({ expected: getZoneSecond(result), name: "'zoneSecond'" })
					);
				return result;
			}
			return yield* pipe(
				_uncalculatedOrigin,
				_setZoneOffset(false, {
					zoneHour: zoneHour ?? 0,
					zoneMinute: zoneMinute ?? 0,
					zoneSecond: zoneSecond ?? 0
				})
			);
		});

		const withHour = yield* Either.gen(function* () {
			if (hour23 !== undefined) {
				const result = yield* setHour23(hour23)(zonedOrigin);
				if (hour11 !== undefined)
					yield* pipe(
						hour11,
						MInputError.assertValue({ expected: getHour11(result), name: "'hour11'" })
					);
				if (meridiem !== undefined)
					yield* pipe(
						meridiem,
						MInputError.assertValue({ expected: getMeridiem(result), name: "'meridiem'" })
					);
				return result;
			}
			const withHour11 = hour11 !== undefined ? yield* setHour11(hour11)(zonedOrigin) : zonedOrigin;
			return meridiem === 12 ? setMeridiem(12)(withHour11) : withHour11;
		});

		const withMinute = minute !== undefined ? yield* setMinute(minute)(withHour) : withHour;
		const withSecond = second !== undefined ? yield* setSecond(second)(withMinute) : withMinute;
		const withMillisecond =
			millisecond !== undefined ? yield* setMillisecond(millisecond)(withSecond) : withSecond;

		const hasYear = year !== undefined;
		const hasIsoYear = isoYear !== undefined;
		const hasIsoWeek = isoWeek !== undefined;
		const hasWeekday = weekday !== undefined;

		if (hasYear && !(hasIsoYear && hasIsoWeek && hasWeekday)) {
			const withYear = yield* setYear(year)(withMillisecond);
			const withDay = yield* Either.gen(function* () {
				if (ordinalDay !== undefined) {
					const result = yield* setOrdinalDay(ordinalDay)(withYear);
					if (month !== undefined)
						yield* pipe(
							month,
							MInputError.assertValue({ expected: getMonth(result), name: "'month'" })
						);
					if (monthDay !== undefined)
						yield* pipe(
							monthDay,
							MInputError.assertValue({ expected: getMonthDay(result), name: "'monthDay'" })
						);
					return result;
				}

				const withMonth = month !== undefined ? yield* setMonth(month)(withYear) : withYear;
				return monthDay !== undefined ? yield* setMonthDay(monthDay)(withMonth) : withMonth;
			});

			if (hasIsoYear)
				yield* pipe(
					isoYear,
					MInputError.assertValue({ expected: getIsoYear(withDay), name: "'isoYear'" })
				);

			if (hasIsoWeek)
				yield* pipe(
					isoWeek,
					MInputError.assertValue({ expected: getIsoWeek(withDay), name: "'isoWeek'" })
				);

			if (hasWeekday)
				yield* pipe(
					weekday,
					MInputError.assertValue({
						expected: getWeekday(withDay),
						name: "'weekday'"
					})
				);
			return withDay;
		}

		if (!hasIsoYear)
			return yield* Either.left(
				new MInputError.Type({
					message: "One of 'year' and 'isoYear' must be be set"
				})
			);

		const withIsoYear = yield* setIsoYear(isoYear)(withMillisecond);
		const withIsoWeek = yield* setIsoWeek(isoWeek ?? 1)(withIsoYear);
		const withWeekday = yield* setWeekday(weekday ?? 1)(withIsoWeek);
		if (hasYear)
			yield* pipe(
				year,
				MInputError.assertValue({ expected: getYear(withWeekday), name: "'year'" })
			);

		if (month !== undefined)
			yield* pipe(
				month,
				MInputError.assertValue({ expected: getMonth(withWeekday), name: "'month'" })
			);

		if (monthDay !== undefined)
			yield* pipe(
				monthDay,
				MInputError.assertValue({ expected: getMonthDay(withWeekday), name: "'monthDay'" })
			);

		if (ordinalDay !== undefined)
			yield* pipe(
				ordinalDay,
				MInputError.assertValue({
					expected: getOrdinalDay(withWeekday),
					name: "'ordinalDay'"
				})
			);

		return withWeekday;
	});

/**
 * Same as fromParts but returns directly the DateTime or throws if it cannot be built
 *
 * @category Constructors
 */
export const unsafeFromParts = (parts: Parts.Type) =>
	Either.getOrThrowWith(fromParts(parts), Function.identity);

/**
 * Returns the timestamp of `self` as a number
 *
 * @category Destructors
 */
export const timestamp: MTypes.OneArgFunction<Type, number> = Struct.get('timestamp');

/** Returns the gregorianDate of `self` for the given time zone */
const _gregorianDate = (self: Type): GregorianDate.Type =>
	pipe(
		self.gregorianDate,
		Option.getOrElse(() => {
			const result = GregorianDate.fromTimestamp(self._zonedTimestamp);
			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */
			(self as MTypes.WithMutable<Type, 'gregorianDate'>).gregorianDate = Option.some(result);
			return result;
		})
	);

/**
 * Returns the (Gregorian) year of `self` for the given time zone
 *
 * @category Destructors
 */
export const getYear: MTypes.OneArgFunction<Type, number> = flow(
	_gregorianDate,
	GregorianDate.year
);

/**
 * Returns true if the (Gregorian) year of `self` for the given time zone is a leap year. Returns
 * false otherwise
 *
 * @category Destructors
 */
export const yearIsLeap: MTypes.OneArgFunction<Type, boolean> = flow(
	_gregorianDate,
	GregorianDate.yearIsLeap
);

/**
 * Returns the ordinalDay of `self` for the given time zone
 *
 * @category Destructors
 */
export const getOrdinalDay: MTypes.OneArgFunction<Type, number> = flow(
	_gregorianDate,
	GregorianDate.ordinalDay
);

/**
 * Returns the month of `self` for the given time zone
 *
 * @category Destructors
 */
export const getMonth: MTypes.OneArgFunction<Type, number> = flow(
	_gregorianDate,
	GregorianDate.getMonth
);

/**
 * Returns the monthDay of `self` for the given time zone
 *
 * @category Destructors
 */
export const getMonthDay: MTypes.OneArgFunction<Type, number> = flow(
	_gregorianDate,
	GregorianDate.getMonthDay
);

/** Returns the isoDate of `self` for the given time zone */
const _isoDate = (self: Type): IsoDate.Type =>
	pipe(
		self.isoDate,
		Option.getOrElse(() => {
			const result = pipe(
				self.gregorianDate,
				Option.map(IsoDate.fromGregorianDate),
				Option.getOrElse(() => IsoDate.fromTimestamp(self._zonedTimestamp))
			);
			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */
			(self as MTypes.WithMutable<Type, 'isoDate'>).isoDate = Option.some(result);
			return result;
		})
	);

/**
 * Returns the isoYear of `self` for the given time zone
 *
 * @category Destructors
 */
export const getIsoYear: MTypes.OneArgFunction<Type, number> = flow(_isoDate, IsoDate.year);

/**
 * Returns true if the isoYear of `self` for the given time zone is a long year. Returns false
 * otherwise
 *
 * @category Destructors
 */
export const isoYearIsLong: MTypes.OneArgFunction<Type, boolean> = flow(
	_isoDate,
	IsoDate.yearIsLong
);

/**
 * Returns the isoWeek of `self` for the given time zone
 *
 * @category Destructors
 */
export const getIsoWeek: MTypes.OneArgFunction<Type, number> = flow(_isoDate, IsoDate.getIsoWeek);

/**
 * Returns the weekday of `self` for the given time zone
 *
 * @category Destructors
 */
export const getWeekday: MTypes.OneArgFunction<Type, number> = flow(_isoDate, IsoDate.getWeekday);

/** Returns the time of `self` for the given time zone */
const _time = (self: Type): Time.Type =>
	pipe(
		self.time,
		Option.getOrElse(() => {
			const result = pipe(self._zonedTimestamp, MNumber.intModulo(DAY_MS), Time.fromTimestamp);
			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */
			(self as MTypes.WithMutable<Type, 'time'>).time = Option.some(result);
			return result as never;
		})
	);

/**
 * Returns the hour23 of `self` for the given time zone
 *
 * @category Destructors
 */
export const getHour23: MTypes.OneArgFunction<Type, number> = flow(_time, Time.hour23);

/**
 * Returns the hour11 of `self` for the given time zone
 *
 * @category Destructors
 */
export const getHour11: MTypes.OneArgFunction<Type, number> = flow(_time, Time.hour11);

/**
 * Returns the meridiem of `self` for the given time zone
 *
 * @category Destructors
 */
export const getMeridiem: MTypes.OneArgFunction<Type, 0 | 12> = flow(_time, Time.meridiem);

/**
 * Returns the minute of `self` for the given time zone
 *
 * @category Destructors
 */
export const getMinute: MTypes.OneArgFunction<Type, number> = flow(_time, Time.minute);

/**
 * Returns the second of `self` for the given time zone
 *
 * @category Destructors
 */
export const getSecond: MTypes.OneArgFunction<Type, number> = flow(_time, Time.second);

/**
 * Returns the millisecond of `self` for the given time zone
 *
 * @category Destructors
 */
export const getMillisecond: MTypes.OneArgFunction<Type, number> = flow(_time, Time.millisecond);

/** Returns the zoneOffsetParts of `self` */
const _zoneOffsetParts = (self: Type): ZoneOffsetParts.Type =>
	pipe(
		self.zoneOffsetParts,
		Option.getOrElse(() => {
			const result = ZoneOffsetParts.fromZoneOffset(self.zoneOffset);
			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */
			(self as MTypes.WithMutable<Type, 'zoneOffsetParts'>).zoneOffsetParts = Option.some(result);
			return result;
		})
	);

/**
 * Returns the hour part of the zoneOffset of `self`
 *
 * @category Destructors
 */
export const getZoneHour: MTypes.OneArgFunction<Type, number> = flow(
	_zoneOffsetParts,
	ZoneOffsetParts.zoneHour
);

/**
 * Returns the minute part of the zoneOffset of `self`
 *
 * @category Destructors
 */
export const getZoneMinute: MTypes.OneArgFunction<Type, number> = flow(
	_zoneOffsetParts,
	ZoneOffsetParts.zoneMinute
);

/**
 * Returns the minute part of the zoneOffset of `self`
 *
 * @category Destructors
 */
export const getZoneSecond: MTypes.OneArgFunction<Type, number> = flow(
	_zoneOffsetParts,
	ZoneOffsetParts.zoneSecond
);

const _gregorianDateSetter = (self: Type): MTypes.OneArgFunction<GregorianDate.Type, Type> => {
	const selfTimestamp = _gregorianDate(self).timestamp;
	return (gregorianDate) => {
		const offset = gregorianDate.timestamp - selfTimestamp;

		return pipe(
			self,
			MStruct.evolve({
				timestamp: Number.sum(offset),
				gregorianDate: pipe(gregorianDate, Option.some, Function.constant),
				isoDate: Function.constant(Option.none()),
				_zonedTimestamp: Number.sum(offset)
			}),
			_make
		);
	};
};

const _isoDateSetter = (self: Type): MTypes.OneArgFunction<IsoDate.Type, Type> => {
	const selfTimestamp = _isoDate(self).timestamp;
	return (isoDate) => {
		const offset = isoDate.timestamp - selfTimestamp;
		return pipe(
			self,
			MStruct.evolve({
				timestamp: Number.sum(offset),
				gregorianDate: Function.constant(Option.none()),
				isoDate: pipe(isoDate, Option.some, Function.constant),
				_zonedTimestamp: Number.sum(offset)
			}),
			_make
		);
	};
};

const _timeSetter = (self: Type): MTypes.OneArgFunction<Time.Type, Type> => {
	const selfTimestampOffset = _time(self).timestampOffset;
	return (time) => {
		const offset = time.timestampOffset - selfTimestampOffset;
		return pipe(
			self,
			MStruct.evolve({
				timestamp: Number.sum(offset),
				time: pipe(time, Option.some, Function.constant),
				_zonedTimestamp: Number.sum(offset)
			}),
			_make
		);
	};
};

/**
 * If possible, returns a right of a DateTime having year `year` and the same `month`, `monthDay`,
 * `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a `left` of an
 * error otherwise. `year` must be an integer comprised in the range [MIN_FULL_YEAR,
 * MAX_FULL_YEAR].
 *
 * @category Setters
 */
export const setYear =
	(year: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		pipe(self, _gregorianDate, GregorianDate.setYear(year), Either.map(_gregorianDateSetter(self)));

/**
 * Same as setYear but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeSetYear = (year: number): MTypes.OneArgFunction<Type> =>
	flow(setYear(year), Either.getOrThrowWith(Function.identity));

/**
 * If possible, returns a right of a DateTime having ordinalDay `ordinalDay` and the same `year`,
 * `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a `left` of an
 * error otherwise. `ordinalDay` must be an integer greater than or equal to 1 and less than or
 * equal to the number of days in the current year
 *
 * @category Setters
 */
export const setOrdinalDay =
	(ordinalDay: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		pipe(
			self,
			_gregorianDate,
			GregorianDate.setOrdinalDay(ordinalDay),
			Either.map(_gregorianDateSetter(self))
		);

/**
 * Same as setOrdinalDay but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeSetOrdinalDay = (ordinalDay: number): MTypes.OneArgFunction<Type> =>
	flow(setOrdinalDay(ordinalDay), Either.getOrThrowWith(Function.identity));

/**
 * If possible, returns a right of a DateTime having month `month` and the same `year`, `monthDay`,
 * `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a `left` of an
 * error otherwise. `month` must be an integer greater than or equal to 1 (January) and less than or
 * equal to 12 (December)
 *
 * @category Setters
 */
export const setMonth =
	(month: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		pipe(
			self,
			_gregorianDate,
			GregorianDate.setMonth(month),
			Either.map(_gregorianDateSetter(self))
		);

/**
 * Same as setMonth but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeSetMonth = (month: number): MTypes.OneArgFunction<Type> =>
	flow(setMonth(month), Either.getOrThrowWith(Function.identity));

/**
 * If possible, returns a right of a DateTime having monthDay `monthDay` and the same `year`,
 * `month`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a `left`
 * of an error otherwise. `monthDay` must be an integer greater than or equal to 1 and less than or
 * equal to the number of days in the current month.
 *
 * @category Setters
 */
export const setMonthDay =
	(monthDay: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		pipe(
			self,
			_gregorianDate,
			GregorianDate.setMonthDay(monthDay),
			Either.map(_gregorianDateSetter(self))
		);

/**
 * Same as setMonthDay but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeSetMonthDay = (monthDay: number): MTypes.OneArgFunction<Type> =>
	flow(setMonthDay(monthDay), Either.getOrThrowWith(Function.identity));

/**
 * If possible, returns a right of a DateTime having isoYear `isoYear` and the same `isoWeek`,
 * `weekday`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `left` of an error otherwise. `isoYear` must be an integer comprised in the range [MIN_FULL_YEAR,
 * MAX_FULL_YEAR].
 *
 * @category Setters
 */
export const setIsoYear =
	(isoYear: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		pipe(self, _isoDate, IsoDate.setYear(isoYear), Either.map(_isoDateSetter(self)));

/**
 * Same as setIsoYear but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeSetIsoYear = (isoYear: number): MTypes.OneArgFunction<Type> =>
	flow(setIsoYear(isoYear), Either.getOrThrowWith(Function.identity));

/**
 * If possible, returns a right of a DateTime having isoWeek `isoWeek` and the same `isoYear`,
 * `weekday`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `left` of an error otherwise. `isoWeek` must be an integer greater than or equal to 1 and less
 * than or equal to the number of iso weeks in the current year.
 *
 * @category Setters
 */
export const setIsoWeek =
	(isoWeek: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		pipe(self, _isoDate, IsoDate.setIsoWeek(isoWeek), Either.map(_isoDateSetter(self)));

/**
 * Same as setIsoWeek but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeSetIsoWeek = (isoWeek: number): MTypes.OneArgFunction<Type> =>
	flow(setIsoWeek(isoWeek), Either.getOrThrowWith(Function.identity));

/**
 * If possible, returns a right of a DateTime having weekday `weekday` and the same `isoYear`,
 * `isoWeek`, `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `left` of an error otherwise. `weekday` must be an integer greater than or equal to 1 (monday)
 * and less than or equal to 7 (sunday).
 *
 * @category Setters
 */
export const setWeekday =
	(weekday: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		pipe(self, _isoDate, IsoDate.setWeekday(weekday), Either.map(_isoDateSetter(self)));

/**
 * Same as setWeekday but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeSetWeekday = (weekday: number): MTypes.OneArgFunction<Type> =>
	flow(setWeekday(weekday), Either.getOrThrowWith(Function.identity));

/**
 * If possible, returns a right of a DateTime having hour23 `hour23` and the same `year`,
 * `ordinalDay`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a `left` of
 * an error otherwise. `hour23` must be an integer greater than or equal to 0 and less than or equal
 * to 23
 *
 * @category Setters
 */
export const setHour23 =
	(hour23: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		pipe(self, _time, Time.setHour23(hour23), Either.map(_timeSetter(self)));

/**
 * Same as setHour23 but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeSetHour23 = (hour23: number): MTypes.OneArgFunction<Type> =>
	flow(setHour23(hour23), Either.getOrThrowWith(Function.identity));

/**
 * If possible, returns a right of a DateTime having hour11 `hour11` and the same `year`,
 * `ordinalDay`, `meridiem`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a
 * `left` of an error otherwise. `hour11` must be an integer greater than or equal to 0 and less
 * than or equal to 11.
 *
 * @category Setters
 */
export const setHour11 =
	(hour11: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		pipe(self, _time, Time.setHour11(hour11), Either.map(_timeSetter(self)));

/**
 * Same as setHour11 but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeSetHour11 = (hour11: number): MTypes.OneArgFunction<Type> =>
	flow(setHour11(hour11), Either.getOrThrowWith(Function.identity));

/**
 * Returns a DateTime having meridiem `meridiem` and the same `year`, `ordinalDay`, `hour11`,
 * `minute`, `second`, `millisecond` and `zoneOffset` as `self`
 *
 * @category Setters
 */
export const setMeridiem =
	(meridiem: 0 | 12) =>
	(self: Type): Type =>
		pipe(self, _time, Time.setMeridiem(meridiem), _timeSetter(self));

/**
 * If possible, returns a right of a DateTime having minute `minute` and the same `year`,
 * `ordinalDay`, `hour23`, `second`, `millisecond` and `zoneOffset` as `self`. Returns a `left` of
 * an error otherwise. `minute` must be an integer greater than or equal to 0 and less than or equal
 * to 59
 *
 * @category Setters
 */
export const setMinute =
	(minute: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		pipe(self, _time, Time.setMinute(minute), Either.map(_timeSetter(self)));

/**
 * Same as setMinute but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeSetMinute = (minute: number): MTypes.OneArgFunction<Type> =>
	flow(setMinute(minute), Either.getOrThrowWith(Function.identity));

/**
 * If possible, returns a right of a DateTime having second `second` and the same `year`,
 * `ordinalDay`, `hour23`, `minute`, `millisecond` and `zoneOffset` as `self`. Returns a `left` of
 * an error otherwise. `second` must be an integer greater than or equal to 0 and less than or equal
 * to 59
 *
 * @category Setters
 */
export const setSecond =
	(second: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		pipe(self, _time, Time.setSecond(second), Either.map(_timeSetter(self)));

/**
 * Same as setSecond but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeSetSecond = (second: number): MTypes.OneArgFunction<Type> =>
	flow(setSecond(second), Either.getOrThrowWith(Function.identity));

/**
 * If possible, returns a right of a DateTime having millisecond `millisecond` and the same `year`,
 * `ordinalDay`, `hour23`, `minute`, `second` and `zoneOffset` as `self`. Returns a `left` of an
 * error otherwise. `millisecond` must be an integer greater than or equal to 0 and less than or
 * equal to 999.
 *
 * @category Setters
 */
export const setMillisecond =
	(millisecond: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		pipe(self, _time, Time.setMillisecond(millisecond), Either.map(_timeSetter(self)));

/**
 * Same as setMillisecond but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeSetMillisecond = (millisecond: number): MTypes.OneArgFunction<Type> =>
	flow(setMillisecond(millisecond), Either.getOrThrowWith(Function.identity));

/**
 * If possible, returns a right of a copy of `self` with timestamp set to `timestamp`. Returns a
 * `left` of an error otherwise. `timestamp` must be an integer comprised in the range
 * [MIN_TIMESTAMP, MAX_TIMESTAMP] representing the number of milliseconds since 1/1/1970
 * 00:00:00:000+0:00.
 *
 * @category Setters
 */
export const setTimestamp =
	(timestamp: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		Either.gen(function* () {
			const validatedTimestamp = yield* pipe(
				timestamp,
				MInputError.assertInRange({
					min: MIN_TIMESTAMP,
					max: MAX_TIMESTAMP,
					minIncluded: true,
					maxIncluded: true,
					offset: 0,
					name: 'timestamp'
				})
			);

			return _uncalculatedFromTimestamp(validatedTimestamp, self.zoneOffset);
		});

/**
 * Same as setTimestamp but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeSetTimestamp = (timestamp: number): MTypes.OneArgFunction<Type> =>
	flow(setTimestamp(timestamp), Either.getOrThrowWith(Function.identity));

/*
 * If `keepTimestamp` is true, `_zonedTimestamp` is also modified. Otherwise `timestamp` is also
 * modified.
 * */
const _setZoneOffset =
	(
		keepTimestamp: boolean,
		zoneOffset:
			| number
			| {
					readonly zoneHour: number;
					readonly zoneMinute: number;
					readonly zoneSecond: number;
			  } = LOCAL_TIME_ZONE_OFFSET
	) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		Either.gen(function* () {
			const buildFromZoneOffset = (validatedZoneOffset: number) =>
				keepTimestamp ?
					_uncalculatedFromTimestamp(self.timestamp, validatedZoneOffset)
				:	_uncalculatedFromZonedTimestamp(self._zonedTimestamp, validatedZoneOffset);

			if (MTypes.isPrimitive(zoneOffset)) {
				const validatedZoneOffset = yield* pipe(
					zoneOffset,
					MInputError.assertInRange({
						min: -13,
						max: 15,
						minIncluded: false,
						maxIncluded: false,
						offset: 0,
						name: "'zoneOffset'"
					})
				);
				return buildFromZoneOffset(validatedZoneOffset);
			}

			const zoneOffsetParts = yield* ZoneOffsetParts.fromParts(zoneOffset);

			const result = pipe(zoneOffsetParts, ZoneOffsetParts.toHour, buildFromZoneOffset);

			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */
			(result as MTypes.WithMutable<Type, 'zoneOffsetParts'>).zoneOffsetParts =
				Option.some(zoneOffsetParts);

			return result;
		});

/**
 * If possible, returns a right of a copy of `self` with zoneOffset set to `zoneOffset`.
 *
 * If `zoneOffset` is omitted, the local time zone offset of the machine this code is running on is
 * used.
 *
 * `zoneOffset` can be expressed as as a number of hours. In this case, it must be strictly greater
 * to -13 and strictly less than 15.
 *
 * It can also be expressed as an object containing three components:
 *
 * - `zoneHour` which must be greater than or equal to -12 and less than or equal to 14.
 * - `zoneMinute` which must be greater than or equal to 0 and less than or equal to 59.
 * - `zoneSecond` which must be greater than or equal to 0 and less than or equal to 59.
 *
 * `zoneHour`, `zoneMinute` and `zoneSecond` should be integers. `zoneOffset`, when expressed as a
 * number of hours, does not need to be an integer.
 *
 * @category Setters
 */
export const setZoneOffset = (
	zoneOffset?:
		| number
		| {
				readonly zoneHour: number;
				readonly zoneMinute: number;
				readonly zoneSecond: number;
		  }
): MTypes.OneArgFunction<Type, Either.Either<Type, MInputError.Type>> =>
	_setZoneOffset(true, zoneOffset);

/**
 * Same as setZoneOffset but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeSetZoneOffset = (
	zoneOffset?:
		| number
		| {
				readonly zoneHour: number;
				readonly zoneMinute: number;
				readonly zoneSecond: number;
		  }
): MTypes.OneArgFunction<Type> =>
	flow(setZoneOffset(zoneOffset), Either.getOrThrowWith(Function.identity));

/**
 * Returns true if self is the first day of a month in the given timezone
 *
 * @category Predicates
 */

export const isFirstMonthDay: Predicate.Predicate<Type> = (self) => getMonthDay(self) === 1;

/**
 * Returns true if self is the last day of a month in the given timezone
 *
 * @category Predicates
 */

export const isLastMonthDay: Predicate.Predicate<Type> = (self) =>
	getMonthDay(self) ===
	pipe(self, _gregorianDate, GregorianDate.getNumberOfDaysInMonth(getMonth(self)));

/**
 * Returns true if self is the first day of a year in the given timezone
 *
 * @category Predicates
 */

export const isFirstYearDay: Predicate.Predicate<Type> = (self) => getOrdinalDay(self) === 1;

/**
 * Returns true if self is the last day of a year in the given timezone
 *
 * @category Predicates
 */

export const isLastYearDay: Predicate.Predicate<Type> = (self) =>
	getOrdinalDay(self) === pipe(self, _gregorianDate, GregorianDate.getYearDurationInDays);

/**
 * Returns true if self is the first day of an iso year in the given timezone
 *
 * @category Predicates
 */

export const isFirstIsoYearDay: Predicate.Predicate<Type> = (self) =>
	getIsoWeek(self) === 1 && getWeekday(self) === 1;

/**
 * Returns true if self is the last day of an iso year in the given timezone
 *
 * @category Predicates
 */
export const isLastIsoYearDay: Predicate.Predicate<Type> = (self) =>
	getIsoWeek(self) === pipe(self, _isoDate, IsoDate.getLastIsoWeek) && getWeekday(self) === 7;

/**
 * Returns a copy of `self` where `monthDay` is set to the first day of the current month. All time
 * parts (`hour23`, `hour11`, `meridiem`, `minute`, `second`, `millisecond`) are left unchanged
 *
 * @category Offsetters
 */
export const toFirstMonthDay: MTypes.OneArgFunction<Type> = unsafeSetMonthDay(1);

/**
 * Returns a copy of `self` where `monthDay` is set to the last day of the current month. All time
 * parts (`hour23`, `hour11`, `meridiem`, `minute`, `second`, `millisecond`) are left unchanged
 *
 * @category Offsetters
 */
export const toLastMonthDay = (self: Type): Type =>
	unsafeSetMonthDay(
		pipe(self, _gregorianDate, GregorianDate.getNumberOfDaysInMonth(getMonth(self)))
	)(self);

/**
 * Returns a copy of `self` where `ordinalDay` is set to the first day of the current year. All time
 * parts (`hour23`, `hour11`, `meridiem`, `minute`, `second`, `millisecond`) are left unchanged
 *
 * @category Offsetters
 */
export const toFirstYearDay = (self: Type): Type => unsafeSetOrdinalDay(1)(self);

/**
 * Returns a copy of `self` where `ordinalDay` is set to the last day of the current year. All time
 * parts (`hour23`, `hour11`, `meridiem`, `minute`, `second`, `millisecond`) are left unchanged
 *
 * @category Offsetters
 */
export const toLastYearDay = (self: Type): Type =>
	unsafeSetOrdinalDay(pipe(self, _gregorianDate, GregorianDate.getYearDurationInDays))(self);

/**
 * Returns a copy of `self` where `isoWeek` and `weekday` are set to 1. All time parts (`hour23`,
 * `hour11`, `meridiem`, `minute`, `second`, `millisecond`) are left unchanged
 *
 * @category Offsetters
 */
export const toFirstIsoYearDay: MTypes.OneArgFunction<Type> = flow(
	unsafeSetIsoWeek(1),
	unsafeSetWeekday(1)
);

/**
 * Returns a copy of `self` where `isoWeek` is set to the last week of the current iso year.
 * `weekday` and all time parts (`hour23`, `hour11`, `meridiem`, `minute`, `second`, `millisecond`)
 * are left unchanged
 *
 * @category Offsetters
 */
export const toLastIsoYearWeek = (self: Type): Type =>
	pipe(self, unsafeSetIsoWeek(pipe(self, _isoDate, IsoDate.getLastIsoWeek)));

/**
 * Returns a copy of `self` where `isoWeek` is set to the last week of the current iso year and
 * `weekday` is set to 7. All time parts (`hour23`, `hour11`, `meridiem`, `minute`, `second`,
 * `millisecond`) are left unchanged
 *
 * @category Offsetters
 */
export const toLastIsoYearDay = (self: Type): Type =>
	pipe(self, toLastIsoYearWeek, unsafeSetWeekday(7));

/**
 * If possible, returns a copy of `self` offset by `offset` years and having the same `month`,
 * `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. If `respectMonthEnd` is
 * true and `self` is on the last day of a month, the new DateTime object's monthDay will be the
 * last of the target month. Otherwise, it will be the same as `self`'s. Returns a `left` of an
 * error otherwise.
 *
 * @category Offsetters
 */
export const offsetYears = (
	offset: number,
	respectMonthEnd: boolean
): MTypes.OneArgFunction<Type, Either.Either<Type, MInputError.Type>> =>
	offsetMonths(offset * 12, respectMonthEnd);

/**
 * Same as offsetYears but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeOffsetYears = (
	offset: number,
	respectMonthEnd: boolean
): MTypes.OneArgFunction<Type> =>
	flow(offsetYears(offset, respectMonthEnd), Either.getOrThrowWith(Function.identity));

/**
 * If possible, returns a copy of `self` offset by `offset` months and having the same `hour23`,
 * `minute`, `second`, `millisecond` and `zoneOffset` as `self`. If `respectMonthEnd` is true and
 * `self` is on the last day of a month, the new DateTime object's monthDay will be the last of the
 * target month. Otherwise, it will be the same as `self`'s. Returns a `left` of an error if the
 * DateTime object can
 *
 * @category Offsetters
 */
export const offsetMonths =
	(offset: number, respectMonthEnd: boolean) =>
	(self: Type): Either.Either<Type, MInputError.Type> => {
		const [yearOffset, targetMonthIndex] = pipe(
			self,
			getMonth,
			Number.sum(offset - 1),
			MNumber.quotientAndRemainder(12)
		);
		const offsetToLastMonthDay = respectMonthEnd && isLastMonthDay(self);

		return pipe(
			self,
			offsetToLastMonthDay ? unsafeSetMonthDay(1) : Function.identity,
			unsafeSetMonth(targetMonthIndex + 1),
			setYear(getYear(self) + yearOffset),
			Either.map(MFunction.fIfTrue({ condition: offsetToLastMonthDay, f: toLastMonthDay }))
		);
	};

/**
 * Same as offsetMonths but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeOffsetMonths = (
	offset: number,
	respectMonthEnd: boolean
): MTypes.OneArgFunction<Type> =>
	flow(offsetMonths(offset, respectMonthEnd), Either.getOrThrowWith(Function.identity));

/**
 * Returns a copy of `self` offset by `offset` days
 *
 * @category Offsetters
 */
export const offsetDays = (
	offset: number
): MTypes.OneArgFunction<Type, Either.Either<Type, MInputError.Type>> =>
	offsetMilliseconds(offset * DAY_MS);

/**
 * Same as offsetDays but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeOffsetDays = (offset: number): MTypes.OneArgFunction<Type> =>
	flow(offsetDays(offset), Either.getOrThrowWith(Function.identity));

/**
 * If possible, returns a copy of `self` offset by `offset` iso years and having the same `weekday`,
 * `hour23`, `minute`, `second`, `millisecond` and `zoneOffset` as `self`. If `respectYearEnd` is
 * true and `self` is on the last day of an iso year, the new DateTime object's isoWeek will be the
 * last of the target iso year. Otherwise, it will be the same as `self`'s. Returns a `left` of an
 * error otherwise.
 *
 * @category Offsetters
 */
export const offsetIsoYears =
	(offset: number, respectYearEnd: boolean) =>
	(self: Type): Either.Either<Type, MInputError.Type> => {
		const offsetToLastIsoYearDay = respectYearEnd && isLastIsoYearDay(self);

		return pipe(
			self,
			offsetToLastIsoYearDay ? unsafeSetIsoWeek(1) : Function.identity,
			setIsoYear(getIsoYear(self) + offset),
			Either.map(MFunction.fIfTrue({ condition: offsetToLastIsoYearDay, f: toLastIsoYearWeek }))
		);
	};

/**
 * Same as offsetIsoYears but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeOffsetIsoYears = (
	offset: number,
	respectYearEnd: boolean
): MTypes.OneArgFunction<Type> =>
	flow(offsetIsoYears(offset, respectYearEnd), Either.getOrThrowWith(Function.identity));

/**
 * Returns a copy of `self` offset by `offset` hours
 *
 * @category Offsetters
 */
export const offsetHours = (
	offset: number
): MTypes.OneArgFunction<Type, Either.Either<Type, MInputError.Type>> =>
	offsetMilliseconds(offset * HOUR_MS);

/**
 * Same as offsetHours but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeOffsetHours = (offset: number): MTypes.OneArgFunction<Type> =>
	flow(offsetHours(offset), Either.getOrThrowWith(Function.identity));

/**
 * Returns a copy of `self` offset by `offset` minutes
 *
 * @category Offsetters
 */
export const offsetMinutes = (
	offset: number
): MTypes.OneArgFunction<Type, Either.Either<Type, MInputError.Type>> =>
	offsetMilliseconds(offset * MINUTE_MS);

/**
 * Same as offsetMinutes but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeOffsetMinutes = (offset: number): MTypes.OneArgFunction<Type> =>
	flow(offsetMinutes(offset), Either.getOrThrowWith(Function.identity));

/**
 * Returns a copy of `self` offset by `offset` seconds
 *
 * @category Offsetters
 */
export const offsetSeconds = (
	offset: number
): MTypes.OneArgFunction<Type, Either.Either<Type, MInputError.Type>> =>
	offsetMilliseconds(offset * SECOND_MS);

/**
 * Same as offsetSeconds but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeOffsetSeconds = (offset: number): MTypes.OneArgFunction<Type> =>
	flow(offsetSeconds(offset), Either.getOrThrowWith(Function.identity));

/**
 * Returns a copy of `self` offset by `offset` milliseconds
 *
 * @category Offsetters
 */
export const offsetMilliseconds =
	(offset: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		setTimestamp(timestamp(self) + offset)(self);

/**
 * Same as offsetMilliseconds but returns directly a DateTime or throws in case of an error
 *
 * @category Setters
 */
export const unsafeOffsetMilliseconds = (offset: number): MTypes.OneArgFunction<Type> =>
	flow(offsetMilliseconds(offset), Either.getOrThrowWith(Function.identity));
