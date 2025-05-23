/**
 * This module implements an immutable DateTime object.
 *
 * DateTime objects keep an internal state. But all provided functions look pure insofar as they
 * will always yield the same result whatever the state the object is in. The state is only used to
 * improve performance but does not alter the results.
 *
 * A DateTime object has a `timeZoneOffsetMs` which is the timestamp of date 1/1/1970 00:00:00:000
 * in zone +z (e.g timeZoneOffsetMs=-3_600_000 for timezone +1:00). All the data in a DateTime
 * object is `time-zone-offset-dependent`, except `timestamp` which is relative to 1/1/1970 UTC. An
 * important thing to note is that of a DateTime object with a timestamp t and a timeZoneOffsetMs
 * tzoMs has exactly the same date parts (year, ordinalDay, month, monthDay,iso year...) as a
 * DateTime object with a timestamp t-tzoMs and a 0 timeZoneOffset.
 */

import { MInputError, MInspectable, MNumber, MPipeable, MTypes } from '@parischap/effect-lib';
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
	Struct,
	flow,
	pipe
} from 'effect';

export const moduleTag = '@parischap/conversions/DateTime/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Duration of a second in milliseconds
 *
 * @category Constants
 */
const SECOND_MS = 1_000;

/**
 * Duration of a minute in milliseconds
 *
 * @category Constants
 */
const MINUTE_MS = 60 * SECOND_MS;

/**
 * Duration of an hour in milliseconds
 *
 * @category Constants
 */
const HOUR_MS = 60 * MINUTE_MS;

/**
 * Duration of a day in milliseconds
 *
 * @category Constants
 */
const DAY_MS = 24 * HOUR_MS;

/**
 * Duration of a week in milliseconds
 *
 * @category Constants
 */
const WEEK_MS = 7 * DAY_MS;

/**
 * Local time zone offset in hours of the machine on which this code runs. The value is calculated
 * once at startup.
 *
 * @category Constants
 */
const LOCAL_TIME_ZONE_OFFSET = new Date(0).getTimezoneOffset() / 60;

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

/**
 * Namespace for the data relative to a Gregorian year
 *
 * It is important to note that the Gregorian calendar is periodic with a 400-year period as far as
 * leap years are concerned. Leap years are those that can be divided by 4, except those that can be
 * divided by 100 except those that can be divided by 400. So 2100, 2200, 2300 are not leap years.
 * But 2400 is a leap year.
 *
 * @category Models
 */
namespace GregorianYear {
	/**
	 * Duration of a normal year in milliseconds
	 *
	 * @category Constants
	 */
	const NORMAL_YEAR_MS = 365 * DAY_MS;

	/**
	 * Duration of a leap year in milliseconds
	 *
	 * @category Constants
	 */
	const LEAP_YEAR_MS = NORMAL_YEAR_MS + DAY_MS;

	/**
	 * Duration in milliseconds of a four-year period containing a leap year
	 *
	 * @category Constants
	 */
	const FOUR_YEARS_MS = 3 * NORMAL_YEAR_MS + LEAP_YEAR_MS;

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

	/**
	 * Type of a GregorianYear
	 *
	 * @category Models
	 */
	export interface Type {
		/** The year described by this GregorianYear, range: [MIN_FULL_YEAR, MAX_FULL_YEAR] */
		readonly year: number;

		/** `true` if `year` is a leap year. `false` otherwise */
		readonly isLeap: boolean;

		/** Timestamp of the first millisecond of UTC `year` */
		readonly startTimestamp: number;
	}

	/**
	 * Constructs the GregorianYear to which `timestamp` belongs
	 *
	 * @category Constructors
	 */
	export const fromTimestamp = (timestamp: number): Type => {
		/**
		 * The 100-year periods [2001, 2100], [2101, 2200], and [2201, 2300] all last HUNDRED_YEARS_MS.
		 * Those three 100-year periods can be divided in 24 periods that last FOUR_YEARS_MS
		 * (4xNORMAL_YEAR_MS + DAY_MS) and a final 4-year period that lasts FOUR_YEARS_MS - DAY_MS
		 * (4xNORMAL_YEAR_MS).
		 *
		 * The 100-year period [2301, 2400] lasts HUNDRED_YEARS_MS + DAY_MS. This period can be divided
		 * in 25 periods that last FOUR_YEARS_MS (4xNORMAL_YEAR_MS + DAY_MS).
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
		const q1Year = Math.min(3, Math.floor(r4Years / NORMAL_YEAR_MS));
		const offset1Year = q1Year * NORMAL_YEAR_MS;

		const isLeap = q1Year === 3 && (q4Years !== 24 || q100Years === 3);

		return {
			year: 2001 + 400 * q400Years + 100 * q100Years + 4 * q4Years + q1Year,
			isLeap,
			startTimestamp:
				YEAR_START_2001_MS + offset400Years + offset100Years + offset4Years + offset1Year
		};
	};

	/**
	 * Constructs the GregorianYear corresponding to UTC year `year`.
	 *
	 * @category Constructors
	 */
	export const fromYear = (year: number): Type => {
		const offset2001 = year - 2001;

		const [q400Years, r400Years] = MNumber.quotientAndRemainder(400)(offset2001);
		const [q100Years, r100Years] = MNumber.quotientAndRemainder(100)(r400Years);
		const [q4Years, r4Years] = MNumber.quotientAndRemainder(4)(r100Years);

		const isLeap = r4Years === 3 && (r100Years !== 99 || r400Years === 399);

		return {
			year,
			isLeap,
			startTimestamp:
				YEAR_START_2001_MS +
				q400Years * FOUR_HUNDRED_YEARS_MS +
				q100Years * HUNDRED_YEARS_MS +
				q4Years * FOUR_YEARS_MS +
				r4Years * NORMAL_YEAR_MS
		};
	};

	/**
	 * Returns the `year` property of `self`
	 *
	 * @category Destructors
	 */
	export const year: MTypes.OneArgFunction<Type, number> = Struct.get('year');

	/**
	 * Returns the `isLeap` property of `self`
	 *
	 * @category Destructors
	 */
	export const isLeap: MTypes.OneArgFunction<Type, boolean> = Struct.get('isLeap');

	/**
	 * Returns the `startTimestamp` property of `self`
	 *
	 * @category Destructors
	 */
	export const startTimestamp: MTypes.OneArgFunction<Type, number> = Struct.get('startTimestamp');

	/**
	 * Returns the duration of the year described by `self` in milliseconds
	 *
	 * @category Destructors
	 */
	export const getMsDuration = (self: Type): number =>
		self.isLeap ? LEAP_YEAR_MS : NORMAL_YEAR_MS;
}

/**
 * Namespace for the data relative to an iso year.
 *
 * An iso year starts on the first day of the first iso week. An iso week starts on a monday and
 * ends on a sunday. The first iso week of the year is the one that contains January 4th (see
 * Wikipedia).
 *
 * @category Models
 */
namespace IsoYear {
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
	 * Duration in milliseconds of an 6-iso-year period comprised of 1 long year and 5 short years
	 * (see Wikipedia)
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
	 * Type of an IsoYear
	 *
	 * @category Models
	 */
	export interface Type {
		/** The iso year described by this IsoYear, range: [MIN_FULL_YEAR, MAX_FULL_YEAR] */
		readonly year: number;

		/** Timestamp of the start of UTC iso year `year` */
		readonly startTimestamp: number;

		/** If true, iso year `year` counts 53 weeks. Otherwise, it counts 52 weeks */
		readonly isLong: boolean;
	}

	/**
	 * Constructs the IsoYear to which `timestamp` belongs
	 *
	 * @category Constructors
	 */
	export const fromTimestamp = (timestamp: number): Type => {
		const [q400Years, r400Years] = pipe(
			timestamp,
			Number.subtract(YEAR_START_2000_MS),
			MNumber.quotientAndRemainder(FOUR_HUNDRED_YEARS_MS)
		);

		// The second one-hundred year period is a week shorter because it has 17 long years instead of 18
		// Also the hundred-th year must be put in the first one-hundred year period because it is not long
		const q100Years =
			r400Years < ONE_HUNDRED_YEARS_MS + SHORT_YEAR_MS ?
				0
			:	pipe(r400Years + WEEK_MS, Number.unsafeDivide(ONE_HUNDRED_YEARS_MS), Math.floor);

		const [q28Years, r28Years] = MNumber.quotientAndRemainder(TWENTY_EIGHT_YEARS_MS)(
			r400Years - q100Years * NINETY_SIX_YEARS_MS + SHORT_YEAR_MS
		);

		const [q11Years, r11Years] = MNumber.quotientAndRemainder(ELEVEN_YEARS_MS)(
			r28Years - ELEVEN_YEARS_MS
		);

		const [q6Years, r6Years] = MNumber.quotientAndRemainder(SIX_YEARS_MS)(r11Years);
		const isFirstSixYearPeriod = q6Years === 0;
		const q1Year = Math.min(Math.floor(r6Years / SHORT_YEAR_MS), isFirstSixYearPeriod ? 5 : 4);

		//console.log(q400Years, q100Years, q28Years, q11Years, q6Years, q1Year);
		return {
			year:
				2010 +
				q400Years * 400 +
				q100Years * 96 +
				q28Years * 28 +
				q11Years * 11 +
				q6Years * 6 +
				q1Year,
			startTimestamp:
				YEAR_START_2010_MS +
				q400Years * FOUR_HUNDRED_YEARS_MS +
				q100Years * NINETY_SIX_YEARS_MS +
				q28Years * TWENTY_EIGHT_YEARS_MS +
				q11Years * ELEVEN_YEARS_MS +
				q6Years * SIX_YEARS_MS +
				q1Year * SHORT_YEAR_MS,
			isLong: (isFirstSixYearPeriod && q1Year == 5) || (!isFirstSixYearPeriod && q1Year == 4)
		};
	};

	/**
	 * Builds the IsoYear correspondiong to UTC iso year `year`
	 *
	 * @category Constructors
	 */
	export const fromIsoYear = (isoYear: number): Type => {
		const [q400Years, r400Years] = pipe(
			isoYear,
			Number.subtract(2000),
			MNumber.quotientAndRemainder(400)
		);
		// year 100 needs to be treated in the first one-hundred year period because it is not a long year
		const q100Years = r400Years === 100 ? 0 : Math.floor(r400Years / 100);
		const [q28Years, r28Years] = MNumber.quotientAndRemainder(28)(r400Years - q100Years * 96 + 1);
		const [q11Years, r11Years] = MNumber.quotientAndRemainder(11)(r28Years - 11);

		return {
			year: isoYear,
			startTimestamp:
				YEAR_START_2010_MS +
				q400Years * FOUR_HUNDRED_YEARS_MS +
				q100Years * NINETY_SIX_YEARS_MS +
				q28Years * TWENTY_EIGHT_YEARS_MS +
				q11Years * ELEVEN_YEARS_MS +
				r11Years * SHORT_YEAR_MS +
				(r11Years > 5 ? WEEK_MS : 0),
			isLong: r11Years === 5 || r11Years === 10
		};
	};

	/**
	 * Returns the `year` property of `self`
	 *
	 * @category Destructors
	 */
	export const year: MTypes.OneArgFunction<Type, number> = Struct.get('year');

	/**
	 * Returns the `startTimestamp` property of `self`
	 *
	 * @category Destructors
	 */
	export const startTimestamp: MTypes.OneArgFunction<Type, number> = Struct.get('startTimestamp');

	/**
	 * Returns the `isLong` property of `self`
	 *
	 * @category Destructors
	 */
	export const isLong: MTypes.OneArgFunction<Type, boolean> = Struct.get('isLong');

	/**
	 * Returns the duration of the year described by `self` in milliseconds
	 *
	 * @category Destructors
	 */
	export const getMsDuration = (self: Type): number => (self.isLong ? LONG_YEAR_MS : SHORT_YEAR_MS);

	/**
	 * Returns the duration of the year described by `self` in milliseconds
	 *
	 * @category Destructors
	 */
	export const getLastIsoWeekIndex = (self: Type): number => (self.isLong ? 52 : 51);
}

/**
 * Namespace for the data relative to the day in a year.
 *
 * @category Models
 */
namespace GregorianDay {
	/**
	 * Type of a Day
	 *
	 * @category Models
	 */
	export interface Type {
		/** Position this GregorianDay (in the current year), range:[1, 366] */
		readonly ordinalDay: number;

		/** Month of this GregorianDay, range:[1, 12] */
		readonly month: number;

		/** Position of this GregorianDay (in the current month), range:[1, 31] */
		readonly monthDay: number;

		/** Timestamp of the start of the day described by this GregorianDay */
		readonly startTimestamp: number;
	}

	/**
	 * Returns the number of days from the start of the year to the day before the first day of month
	 * `month`
	 */
	const _monthOffset = (month: number, isLeap: boolean): number =>
		month === 1 ? 0
		: month === 2 ? 31
		: 30 * (month - 1) + Math.floor(0.6 * (month + 1)) - (isLeap ? 2 : 3);
	/**
	 * Constructs the GregorianDay that corresponds to ordinalDayIndex `ordinalDayIndex` of year
	 * `gregorianYear`.
	 *
	 * @category Constructors
	 */
	export const fromOrdinalDay = (gregorianYear: GregorianYear.Type, ordinalDay: number): Type => {
		const isLeap = gregorianYear.isLeap;
		const adjustedOrdinalDay = ordinalDay - (isLeap ? 1 : 0);
		const month =
			ordinalDay <= 31 ? 1
			: adjustedOrdinalDay <= 59 ? 2
			: Math.floor((adjustedOrdinalDay - 59) / 30.6 - 0.018) + 3;

		return {
			ordinalDay,
			month,
			monthDay: ordinalDay - _monthOffset(month, isLeap),
			startTimestamp: gregorianYear.startTimestamp + (ordinalDay - 1) * DAY_MS
		};
	};

	/**
	 * Constructs the GregorianDay that corresponds to day `day` of month `month` of year
	 * `gregorianYear`.
	 *
	 * @category Constructors
	 */
	export const fromYearMonthDay = (
		gregorianYear: GregorianYear.Type,
		month: number,
		monthDay: number
	): Type => {
		const ordinalDay = monthDay + _monthOffset(month, gregorianYear.isLeap);
		return {
			ordinalDay,
			month,
			monthDay,
			startTimestamp: gregorianYear.startTimestamp + (ordinalDay - 1) * DAY_MS
		};
	};

	/**
	 * Constructs the GregorianDay that contains the timestamp calculated as a `timestampOffset` from
	 * the start of `gregorianYear`
	 *
	 * @category Constructors
	 */
	export const fromTimestamp = (
		timestampOffset: number,
		gregorianYear: GregorianYear.Type
	): Type => {
		const ordinalDayIndex = Math.floor(timestampOffset / DAY_MS);
		return fromOrdinalDay(gregorianYear, ordinalDayIndex);
	};

	/**
	 * Returns the `ordinalDay` property of `self`
	 *
	 * @category Destructors
	 */
	export const ordinalDay: MTypes.OneArgFunction<Type, number> = Struct.get('ordinalDay');

	/**
	 * Returns the `month` property of `self`
	 *
	 * @category Destructors
	 */
	export const month: MTypes.OneArgFunction<Type, number> = Struct.get('month');

	/**
	 * Returns the `monthDay` property of `self`
	 *
	 * @category Destructors
	 */
	export const monthDay: MTypes.OneArgFunction<Type, number> = Struct.get('monthDay');

	/**
	 * Returns the `startTimestamp` property of `self`
	 *
	 * @category Destructors
	 */
	export const startTimestamp: MTypes.OneArgFunction<Type, number> = Struct.get('startTimestamp');
}

/**
 * Type of a DateTime
 *
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Type, Pipeable.Pipeable {
	/** Number of milliseconds since 1/1/1970 at 00:00:00:000+00:00 (timezone-independent) */
	readonly timestamp: number;

	/** GregorianYear of this DateTime, expressed in given timezone */
	readonly gregorianYear: Option.Option<GregorianYear.Type>;

	/** GregorianDay of this DateTime, expressed in given timezone */
	readonly gregorianDay: Option.Option<GregorianDay.Type>;

	/** IsoYear of this DateTime, expressed in given timezone */
	readonly isoYear: Option.Option<IsoYear.Type>;

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

	/**
	 * Offset in hours of the zone for which all calculations of that DateTime object will be carried
	 * out. Not necessarily an integer, range: [-12, 14]
	 */
	readonly timeZoneOffset: number;

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
		return '';
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Tries to build a DateTime from `timestamp` and `timeZoneOffset`. Returns a `right` of a DateTime
 * if successful. Returns a `left` of an error otherwise. `timestamp` must be an integer comprised
 * in the range [MIN_TIMESTAMP, MAX_TIMESTAMP] representing the number of milliseconds since
 * 1/1/1970 00:00:00:000+0:00. `timeZoneOffset` is a number, not necessarily an integer, that
 * represents the offset in hours of the zone for which all calculations of that DateTime object
 * will be carried out. It must be comprised in the range [-12, 14]. If omitted, the offset of the
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

		const validatedTimeZoneOffset = yield* pipe(
			timeZoneOffset,
			Option.fromNullable,
			Option.map(
				flow(
					MInputError.assertInRange({
						min: -12,
						max: 14,
						offset: 0,
						name: 'timeZoneOffset'
					})
				)
			),
			Option.getOrElse(() => Either.right(LOCAL_TIME_ZONE_OFFSET))
		);

		return _make({
			timestamp: validatedTimestamp,
			gregorianYear: Option.none(),
			gregorianDay: Option.none(),
			isoYear: Option.none(),
			isoWeekIndex: Option.none(),
			weekDayIndex: Option.none(),
			hour24: Option.none(),
			hour12: Option.none(),
			meridiem: Option.none(),
			minute: Option.none(),
			second: Option.none(),
			millisecond: Option.none(),
			timeZoneOffset: validatedTimeZoneOffset,
			_zonedTimestamp: validatedTimestamp - validatedTimeZoneOffset
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
 * Builds a DateTime using Date.now() as timestamp. `timeZoneOffset` is a number, not necessarily an
 * integer, that represents the offset in hours of the zone for which all calculations of that
 * DateTime object will be carried out. It must be comprised in the range [-12, 14]. If omitted, the
 * offset of the local time zone of the machine this code is running on is used.
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

		const yearDescriptor = CVDateTimeUtils.GregorianDate.fromYear(validatedYear);

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
						CVDateTimeUtils.GregorianDate.ordinalDayIndexChecker(yearDescriptor)
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
								CVDateTimeUtils.GregorianDate.getMonthDescriptorFromMonthIndex(validatedMonthIndex)
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
										CVDateTimeUtils.GregorianDate.getIsoWeekDescriptor(yearDescriptor);

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
export const timestamp: MTypes.OneArgFunction<Type, number> = Struct.get('timestamp');

/** Returns the gregorianYear of `self` for the given time zone */
const _gregorianYear = (self: Type): GregorianYear.Type =>
	pipe(
		self.gregorianYear,
		Option.getOrElse(() => {
			const result = GregorianYear.fromTimestamp(self._zonedTimestamp);
			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */ /* @ts-expect-error ordinalDayIndex must look immutable from the outer world*/
			self.gregorianYear = Option.some(result);
			return result;
		})
	);

/**
 * Returns the (Gregorian) year of `self` for the given time zone
 *
 * @category Destructors
 */
export const year: MTypes.OneArgFunction<Type, number> = flow(_gregorianYear, GregorianYear.year);

/**
 * Returns true if the (Gregorian) year of `self` for the given time zone is a leap year. Returns
 * false otherwise
 *
 * @category Destructors
 */
export const isLeap: MTypes.OneArgFunction<Type, boolean> = flow(
	_gregorianYear,
	GregorianYear.isLeap
);

/** Returns the isoYear of `self` for the given time zone */
const _isoYear = (self: Type): IsoYear.Type =>
	pipe(
		self.isoYear,
		Option.getOrElse(() => {
			const result = IsoYear.fromTimestamp(self._zonedTimestamp);
			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */ /* @ts-expect-error ordinalDayIndex must look immutable from the outer world*/
			self.isoYear = Option.some(result);
			return result;
		})
	);

/**
 * Returns the isoYear of `self` for the given time zone
 *
 * @category Destructors
 */
export const isoYear: MTypes.OneArgFunction<Type, number> = flow(_isoYear, IsoYear.year);

/**
 * Returns true if the (Gregorian) year of `self` for the given time zone is a leap year. Returns
 * false otherwise
 *
 * @category Destructors
 */
export const islong: MTypes.OneArgFunction<Type, boolean> = flow(_isoYear, IsoYear.isLong);

/** Returns the ordinalDayIndex of `self` */
const _ordinalDayIndex = (self: Type): number =>
	pipe(
		self.ordinalDayIndex,
		Option.getOrElse(() => {
			const result = pipe(
				self,
				_gregorianYear,
				GregorianYear.startTimestamp,
				MNumber.opposite,
				Number.sum(self._zonedTimestamp),
				Number.unsafeDivide(DAY_MS),
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
					max: CVDateTimeUtils.GregorianDate.getLastOrdinalDayIndex(self.yearDescriptor),
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
