/**
 * This module implements an immutable DateTime object.
 *
 * DateTime objects keep an internal state. But all provided functions look pure insofar as they
 * will always yield the same result whatever the state the object is in. The state is only used to
 * improve performance but does not alter the results.
 *
 * A DateTime object has a `timeZoneOffset` which is the difference in hours between UTC time and
 * time in the local zone (e.g timeZoneOffset=-1 for timezone +1:00). All the data in a DateTime
 * object is `time-zone-offset-dependent`, except `timestamp` which is relative to 1/1/1970 UTC. An
 * important thing to note is that of a DateTime object with a timestamp t and a timeZoneOffset tzo
 * has exactly the same date parts (year, ordinalDay, month, monthDay,iso year...) as a DateTime
 * object with a timestamp t-tzox3600 and a 0 timeZoneOffset.
 */

import {
	MArray,
	MInputError,
	MInspectable,
	MMatch,
	MNumber,
	MPipeable,
	MString,
	MStruct,
	MTuple,
	MTypes
} from '@parischap/effect-lib';
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
	String,
	Struct,
	flow,
	pipe
} from 'effect';
import { time } from 'effect/Console';

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
export const NORMAL_YEAR_MS = 365 * DAY_MS;

/**
 * Duration of a leap year in milliseconds
 *
 * @category Constants
 */
export const LEAP_YEAR_MS = NORMAL_YEAR_MS + DAY_MS;

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
 * Local time zone offset in milliseconds of the machine on which this code runs. The value is
 * calculated once at startup.
 *
 * @category Constants
 */
export const LOCAL_TIME_ZONE_OFFSET = new Date(0).getTimezoneOffset() / 60;

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
 * Namespace for a timestamp split in day and time parts
 *
 * @category Models
 */
namespace Timestamp {
	const _namespaceTag = moduleTag + 'Timestamp/';
	const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
	type _TypeId = typeof _TypeId;

	export interface Type extends Equal.Equal, MInspectable.Type, Pipeable.Pipeable {
		/** Integer representing the number of milliseconds elapsed since 1/1/1970 00:00:00:000+0:00 */
		readonly dayPart: number;
		/**
		 * Integer representing the number of milliseconds elapsed since the start of the day, range:[0,
		 * DAY-MS[
		 */
		readonly timePart: number;

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
		self.dayPart === that.dayPart && self.timePart === that.timePart;

	/** Proto */
	const _TypeIdHash = Hash.hash(_TypeId);
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: _TypeId,
		[Equal.symbol](this: Type, that: unknown): boolean {
			return has(that) && equivalence(this, that);
		},
		[Hash.symbol](this: Type) {
			return pipe(
				this.dayPart,
				Hash.hash,
				Hash.combine(this.timePart),
				Hash.combine(_TypeIdHash),
				Hash.cached(this)
			);
		},
		[MInspectable.IdSymbol](this: Type) {
			return pipe(this, getValue, MString.fromNumber(10));
		},
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	/**
	 * Constructor
	 *
	 * @category Constructors
	 */
	export const make = (params: MTypes.Data<Type>): Type =>
		MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Builds a Timestamp from the number of milliseconds elapsed since 1/1/1970 00:00:00:000+0:00
	 *
	 * @category Constructors
	 */
	export const fromTimestamp = (timestamp: number): Type => {
		const [dayPart, timePart] = MNumber.quotientAndRemainder(DAY_MS)(timestamp);
		return make({
			dayPart,
			timePart
		});
	};

	/**
	 * Instance that represents timestamp=0
	 *
	 * @category Constructors
	 */
	export const origin: Type = make({ dayPart: 0, timePart: 0 });

	/**
	 * Returns the dayPart of `self`
	 *
	 * @category Destructors
	 */
	export const dayPart: MTypes.OneArgFunction<Type, number> = Struct.get('dayPart');

	/**
	 * Returns the dayStartTimestamp of `self`
	 *
	 * @category Destructors
	 */
	export const timePart: MTypes.OneArgFunction<Type, number> = Struct.get('timePart');

	/**
	 * Returns a copy of `self` with dayPart set to `dayPart`
	 *
	 * @category Setters
	 */
	export const setDayPart = (dayPart: number): MTypes.OneArgFunction<Type> =>
		flow(MStruct.set({ dayPart }), make);

	/**
	 * Returns a copy of `self` with timePart set to `timePart`
	 *
	 * @category Setters
	 */
	export const setTimePart = (timePart: number): MTypes.OneArgFunction<Type> =>
		flow(MStruct.set({ timePart }), make);

	/**
	 * Returns the value of `self`
	 *
	 * @category Destructors
	 */
	export const getValue: MTypes.OneArgFunction<Type, number> = flow(
		MTuple.makeBothBy({ toFirst: dayPart, toSecond: timePart }),
		Function.tupled(Number.sum)
	);

	/**
	 * Returns a new instance of a Timestamp that represents `self` shifted by `timeZoneOffsetMs`
	 *
	 * @category Destructors
	 */
	export const zoned =
		(timeZoneOffsetMs: number) =>
		(self: Type): Type => {
			const tentativeTimePart = self.timePart + timeZoneOffsetMs;
			// timeZoneOffsetMs is strictly inferior to DAY_MS in absolute value. So no need to go into modulo calculations.
			const offset =
				tentativeTimePart >= DAY_MS ? DAY_MS
				: tentativeTimePart < 0 ? -DAY_MS
				: 0;

			return make({
				dayPart: self.dayPart + offset,
				timePart: tentativeTimePart - offset
			});
		};
}

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
namespace YearDescriptor {
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
	 * Type of a YearDescriptor
	 *
	 * @category Models
	 */
	export interface Type {
		/** The year described by this YearDescriptor, range: [MIN_FULL_YEAR, MAX_FULL_YEAR] */
		readonly year: number;

		/** `true` if `year` is a leap year. `false` otherwise */
		readonly isLeap: boolean;

		/** Timestamp of the first millisecond of UTC `year` */
		readonly startTimestamp: number;
	}

	/**
	 * Instance for the year to which timestamp = 0 belong
	 *
	 * @cayegory: Instances
	 */

	export const origin: Type = {
		year: 1970,
		isLeap: false,
		startTimestamp: 0
	};

	/**
	 * Constructs the YearDescriptor to which `timestamp` belongs
	 *
	 * @category Constructors
	 */
	export const fromTimestamp = (timestamp: Timestamp.Type): Type => {
		/**
		 * The 100-year periods [2001, 2100], [2101, 2200], and [2201, 2300] all last HUNDRED_YEARS_MS.
		 * Those three 100-year periods can be divided in 24 periods that last FOUR_YEARS_MS
		 * (4xNORMAL_YEAR_MS + DAY_MS) and a final 4-year period that lasts FOUR_YEARS_MS - DAY_MS
		 * (4xNORMAL_YEAR_MS).
		 *
		 * The 100-year period [2301, 2400] lasts HUNDRED_YEARS_MS + DAY_MS. This period can be divided
		 * in 25 periods that last FOUR_YEARS_MS (4xNORMAL_YEAR_MS + DAY_MS).
		 */
		const offset2001 = timestamp.dayPart - YEAR_START_2001_MS;

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
	 * Constructs the YearDescriptor corresponding to UTC year `year`.
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

	/**
	 * Returns the duration of the year described by `self` in days
	 *
	 * @category Destructors
	 */
	export const getDayDuration = (self: Type): number => (self.isLeap ? 366 : 365);

	/**
	 * Returns the number of days from the start of the year described by `self` to the day before the
	 * first day of month `month`
	 *
	 * @category Destructors
	 */
	export const getMonthOffset =
		(month: number) =>
		(self: Type): number =>
			month === 1 ? 0
			: month === 2 ? 31
			: 30 * (month - 1) + Math.floor(0.6 * (month + 1)) - (self.isLeap ? 2 : 3);

	/**
	 * Returns the number of days of month `month` of the year described by `self`
	 *
	 * @category Destructors
	 */
	export const getNumberOfDaysInMonth = (month: number): MTypes.OneArgFunction<Type, number> =>
		flow(
			MMatch.make,
			MMatch.when(isLeap, () => [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]),
			MMatch.orElse(() => [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]),
			MArray.unsafeGet(month - 1)
		);
}

/**
 * Namespace for the data relative to the day in a year.
 *
 * @category Models
 */
namespace DayDescriptor {
	/**
	 * Type of a DayDescriptor
	 *
	 * @category Models
	 */
	export interface Type {
		/** Position of this DayDescriptor (in the current year), range:[1, 366] */
		readonly ordinalDay: number;

		/** Month of this DayDescriptor, range:[1, 12] */
		readonly month: number;

		/** Position of this DayDescriptor (in the current month), range:[1, 31] */
		readonly monthDay: number;

		/** Timestamp of the start of the day described by this DayDescriptor */
		readonly startTimestamp: number;
	}

	/**
	 * Instance for the day to which timestamp = 0 belong
	 *
	 * @cayegory: Instances
	 */
	export const origin: Type = {
		ordinalDay: 1,
		month: 1,
		monthDay: 1,
		startTimestamp: 0
	};

	/**
	 * Constructs the DayDescriptor that corresponds to ordinal day `ordinalDay` of the year described
	 * by `yearDescriptor`.
	 *
	 * @category Constructors
	 */
	export const fromOrdinalDay = (yearDescriptor: YearDescriptor.Type, ordinalDay: number): Type => {
		const isLeap = yearDescriptor.isLeap;
		const adjustedOrdinalDay = ordinalDay - (isLeap ? 1 : 0);
		const month =
			ordinalDay <= 31 ? 1
			: adjustedOrdinalDay <= 59 ? 2
			: Math.floor((adjustedOrdinalDay - 59) / 30.6 - 0.018) + 3;

		return {
			ordinalDay,
			month,
			monthDay: pipe(
				yearDescriptor,
				YearDescriptor.getMonthOffset(month),
				MNumber.opposite,
				Number.sum(ordinalDay)
			),
			startTimestamp: yearDescriptor.startTimestamp + (ordinalDay - 1) * DAY_MS
		};
	};

	/**
	 * Constructs the DayDescriptor that corresponds to day `day` of month `month` of year
	 * `yearDescriptor`.
	 *
	 * @category Constructors
	 */
	export const fromYearMonthDay = (
		yearDescriptor: YearDescriptor.Type,
		month: number,
		monthDay: number
	): Type => {
		const ordinalDay = pipe(
			yearDescriptor,
			YearDescriptor.getMonthOffset(month),
			Number.sum(monthDay)
		);
		return {
			ordinalDay,
			month,
			monthDay,
			startTimestamp: yearDescriptor.startTimestamp + (ordinalDay - 1) * DAY_MS
		};
	};

	/**
	 * Constructs the DayDescriptor of timestamp `timestamp` located in the year described by
	 * `yearDescriptor`
	 *
	 * @category Constructors
	 */
	export const fromTimestamp = (
		yearDescriptor: YearDescriptor.Type,
		timestamp: Timestamp.Type
	): Type =>
		fromOrdinalDay(
			yearDescriptor,
			Math.floor((timestamp.dayPart - yearDescriptor.startTimestamp) / DAY_MS) + 1
		);
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
 * Namespace for the data relative to an iso year.
 *
 * An iso year starts on the first day of the first iso week. An iso week starts on a monday and
 * ends on a sunday. The first iso week of the year is the one that contains January 4th (see
 * Wikipedia).
 *
 * @category Models
 */
namespace IsoYearDescriptor {
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
	export interface Type {
		/** The iso year described by this IsoYearDescriptor, range: [MIN_FULL_YEAR, MAX_FULL_YEAR] */
		readonly isoYear: number;

		/** If true, iso year `year` counts 53 weeks. Otherwise, it counts 52 weeks */
		readonly isLong: boolean;

		/** Timestamp of the start of UTC iso year `year` */
		readonly startTimestamp: number;
	}

	/**
	 * Instance for the iso year to which timestamp = 0 belong
	 *
	 * @cayegory: Instances
	 */
	export const origin: Type = {
		isoYear: 1970,
		isLong: true,
		startTimestamp: -3 * DAY_MS
	};

	/**
	 * Constructs the IsoYearDescriptor of the iso year to which `timestamp` belongs
	 *
	 * @category Constructors
	 */
	export const fromTimestamp = (timestamp: Timestamp.Type): Type => {
		const [q400Years, r400Years] = pipe(
			timestamp.dayPart,
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
			isoYear:
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
	 * Builds the IsoYearDescriptor correspondiong to UTC iso year `year`
	 *
	 * @category Constructors
	 */
	export const fromIsoYear = (isoYearDescriptor: number): Type => {
		const [q400Years, r400Years] = pipe(
			isoYearDescriptor,
			Number.subtract(2000),
			MNumber.quotientAndRemainder(400)
		);
		// year 100 needs to be treated in the first one-hundred year period because it is not a long year
		const q100Years = r400Years === 100 ? 0 : Math.floor(r400Years / 100);
		const [q28Years, r28Years] = MNumber.quotientAndRemainder(28)(r400Years - q100Years * 96 + 1);
		const [q11Years, r11Years] = MNumber.quotientAndRemainder(11)(r28Years - 11);

		return {
			isoYear: isoYearDescriptor,
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
	export const isoYear: MTypes.OneArgFunction<Type, number> = Struct.get('isoYear');

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
	export const getLastIsoWeek = (self: Type): number => (self.isLong ? 53 : 52);
}

/**
 * Namespace for the data relative to an iso day of an iso year.
 *
 * @category Models
 */
namespace IsoDayDescriptor {
	/**
	 * Type of an IsoDayDescriptor
	 *
	 * @category Models
	 */
	export interface Type {
		/** IsoWeek of this IsoDayDescriptor, range:[1, 53] */
		readonly isoWeek: number;

		/** WeekDay of this IsoDayDescriptor, range:[1, 7], 1 is monday, 7 is sunday */
		readonly weekDay: number;

		/** Timestamp of the start of the day described by this IsoDayDescriptor */
		readonly startTimestamp: number;
	}

	/**
	 * Instance for the iso day to which timestamp = 0 belong
	 *
	 * @cayegory: Instances
	 */
	export const origin: Type = {
		isoWeek: 1,
		weekDay: 4,
		startTimestamp: 0
	};

	/**
	 * Constructs the IsoDayDescriptor that corresponds to week day `weekDay` of iso week `isoWeek` of
	 * year `isoYearDescriptor`.
	 *
	 * @category Constructors
	 */
	export const fromWeekAndWeekDay = (
		isoYearDescriptor: IsoYearDescriptor.Type,
		isoWeek: number,
		weekDay: number
	): Type => ({
		isoWeek,
		weekDay,
		startTimestamp:
			isoYearDescriptor.startTimestamp + (isoWeek - 1) * WEEK_MS + (weekDay - 1) * DAY_MS
	});

	/**
	 * Constructs the IsoDayDescriptor of timestamp `timestamp` located in the iso year described by
	 * `isoYearDescriptor`
	 *
	 * @category Constructors
	 */
	export const fromTimestamp = (
		isoYearDescriptor: IsoYearDescriptor.Type,
		timestamp: Timestamp.Type
	): Type => {
		const [isoWeekIndex, weekOffsetMs] = MNumber.quotientAndRemainder(WEEK_MS)(
			timestamp.dayPart - isoYearDescriptor.startTimestamp
		);
		const weekDayIndex = Math.floor(weekOffsetMs / DAY_MS);
		return {
			isoWeek: isoWeekIndex + 1,
			weekDay: weekDayIndex + 1,
			startTimestamp:
				isoYearDescriptor.startTimestamp + isoWeekIndex * WEEK_MS + weekDayIndex * DAY_MS
		};
	};

	/**
	 * Returns the `isoWeek` property of `self`
	 *
	 * @category Destructors
	 */
	export const isoWeek: MTypes.OneArgFunction<Type, number> = Struct.get('isoWeek');

	/**
	 * Returns the `weekDay` property of `self`
	 *
	 * @category Destructors
	 */
	export const weekDay: MTypes.OneArgFunction<Type, number> = Struct.get('weekDay');

	/**
	 * Returns the `startTimestamp` property of `self`
	 *
	 * @category Destructors
	 */
	export const startTimestamp: MTypes.OneArgFunction<Type, number> = Struct.get('startTimestamp');
}

/**
 * Namespace for the data relative to the time
 *
 * @category Models
 */
namespace Time {
	/**
	 * Type of a Time
	 *
	 * @category Models
	 */
	export interface Type {
		/** Number of hours since the start of the current day, range:[0, 23] */
		readonly hour24: number;

		/** Hour12 of this DateTime, range:[0, 11] */
		readonly hour12: number;

		/** Meridiem offset of this DateTime in hours, 0 for 'AM', 12 for 'PM' */
		readonly meridiem: 0 | 12;

		/** Number of minutes since the start of the current hour, range:[0, 59] */
		readonly minute: number;

		/** Number of seconds, since sthe start of the current minute, range:[0, 59] */
		readonly second: number;

		/** Number of milliseconds, since sthe start of the current second, range:[0, 999] */
		readonly millisecond: number;

		/** Number of milliseconds between the start of the current day and the time reprensented by self */
		readonly timestampOffset: number;
	}

	/**
	 * Instance for the start of the day
	 *
	 * @cayegory: Instances
	 */
	export const origin: Type = {
		hour24: 0,
		hour12: 0,
		meridiem: 0,
		minute: 0,
		second: 0,
		millisecond: 0,
		timestampOffset: 0
	};

	/**
	 * Constructs the Time that corresponds to `timestampOffset` which is the offset in milliseconds
	 * from the start of a day
	 *
	 * @category Constructors
	 */
	export const fromTimestamp = (timestamp: Timestamp.Type): Type => {
		const timestampOffset = timestamp.timePart;
		const [hour24, rHour24] = MNumber.quotientAndRemainder(HOUR_MS)(timestampOffset);
		const [hour12, meridiem] = hour24 >= 12 ? ([hour24 - 12, 12] as const) : ([hour24, 0] as const);
		const [minute, rMinute] = MNumber.quotientAndRemainder(MINUTE_MS)(rHour24);
		const [second, millisecond] = MNumber.quotientAndRemainder(SECOND_MS)(rMinute);
		return {
			hour24,
			hour12,
			meridiem,
			minute,
			second,
			millisecond,
			timestampOffset
		};
	};

	/**
	 * Constructs a Time from the `hour24`, `minute`, `second` and `millisecond` parameters
	 *
	 * @category Constructors
	 */
	export const fromTime24 = (
		hour24: number,
		minute: number,
		second: number,
		millisecond: number
	): Type => {
		const isPast12 = hour24 >= 12;
		return {
			hour24,
			hour12: isPast12 ? hour24 - 12 : hour24,
			meridiem: isPast12 ? 12 : 0,
			minute,
			second,
			millisecond,
			timestampOffset: hour24 * HOUR_MS + minute * MINUTE_MS + second * SECOND_MS + millisecond
		};
	};

	/**
	 * Constructs a Time from the `hour12`, `meridiem`, `minute`, `second` and `millisecond`
	 * parameters
	 *
	 * @category Constructors
	 */
	export const fromTime12 = (
		hour12: number,
		meridiem: 0 | 12,
		minute: number,
		second: number,
		millisecond: number
	): Type => {
		const hour24 = meridiem + hour12;
		return {
			hour24,
			hour12,
			meridiem,
			minute,
			second,
			millisecond,
			timestampOffset: hour24 * HOUR_MS + minute * MINUTE_MS + second * SECOND_MS + millisecond
		};
	};

	/**
	 * Constructs a Time from parts
	 *
	 * `hour24` must be an integer greater than or equal to 0 and less than or equal to 23. `hour12`
	 * must be an integer greater than or equal to 0 and less than or equal to 11. `meridiem` must be
	 * one of 0 (AM) or 12 (PM). If there is not sufficient information to determine the hour of the
	 * day, i.e. none of the two following tuples is fully determined [hour24], [hour12, meridiem],
	 * default values are determined as follows:
	 *
	 * - If `meridiem` is set, `hour12` is taken equal to 0.
	 * - If `hour12` is set, `meridiem` is taken equal to 0.
	 * - Otherwise, `meridiem` and `hour12` are taken equal to 0.
	 *
	 * `minute` must be an integer greater than or equal to 0 and less than or equal to 59. If
	 * omitted, minute is assumed to be 0.
	 *
	 * `second` must be an integer greater than or equal to 0 and less than or equal to 59. If
	 * omitted, second is assumed to be 0.
	 *
	 * `millisecond` must be an integer greater than or equal to 0 and less than or equal to 999. If
	 * omitted, millisecond is assumed to be 0.
	 *
	 * All parameters must be coherent. For instance, `hour24=13` and `meridiem=0` will trigger an
	 * error.
	 *
	 * @category Constructors
	 */

	export const fromParts = ({
		hour24,
		hour12,
		meridiem,
		minute,
		second,
		millisecond
	}: {
		/** Number of hours since the start of the current day, range:[0, 23] */
		readonly hour24?: number;
		/** Number of hours since the start of the current meridiem, range:[0, 11] */
		readonly hour12?: number;
		/** Meridiem offset of this DateTime in hours, 0 for 'AM', 12 for 'PM' */
		readonly meridiem?: 0 | 12;
		/** Number of minutes since the start of the current hour, range:[0, 59] */
		readonly minute?: number;
		/** Number of seconds, since sthe start of the current minute, range:[0, 59] */
		readonly second?: number;
		/** Number of milliseconds, since sthe start of the current second, range:[0, 999] */
		readonly millisecond?: number;
	}): Either.Either<Type, MInputError.Type> =>
		Either.gen(function* () {
			const validatedMinute = yield* pipe(
				minute,
				Option.fromNullable,
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
				second,
				Option.fromNullable,
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
				millisecond,
				Option.fromNullable,
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

			if (hour24 !== undefined) {
				const validatedHour24 = yield* pipe(
					hour24,
					MInputError.assertInRange({
						min: 0,
						max: 23,
						offset: 0,
						name: "'hour24'"
					})
				);

				const result = Time.fromTime24(
					validatedHour24,
					validatedMinute,
					validatedSecond,
					validatedMillisecond
				);
				if (hour12 !== undefined)
					yield* pipe(
						hour12,
						MInputError.assertValue({ expected: result.hour12, name: "'hour12'" })
					);
				if (meridiem !== undefined)
					yield* pipe(
						meridiem,
						MInputError.assertValue({ expected: result.meridiem, name: "'meridiem'" })
					);
				return result;
			}

			const validatedHour12 =
				hour12 === undefined ? 0 : (
					yield* pipe(
						hour12,
						MInputError.assertInRange({
							min: 0,
							max: 11,
							offset: 0,
							name: "'hour12'"
						})
					)
				);

			const validatedMeridiem = meridiem ?? 0;

			return Time.fromTime12(
				validatedHour12,
				validatedMeridiem,
				validatedMinute,
				validatedSecond,
				validatedMillisecond
			);
		});

	/**
	 * Returns the `hour24` property of `self`
	 *
	 * @category Destructors
	 */
	export const hour24: MTypes.OneArgFunction<Type, number> = Struct.get('hour24');

	/**
	 * Returns the `hour12` property of `self`
	 *
	 * @category Destructors
	 */
	export const hour12: MTypes.OneArgFunction<Type, number> = Struct.get('hour12');

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

	/**
	 * Returns the `timestampOffset` property of `self`
	 *
	 * @category Destructors
	 */
	export const timestampOffset: MTypes.OneArgFunction<Type, number> = Struct.get('timestampOffset');
}

/**
 * Type of a DateTime
 *
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Type, Pipeable.Pipeable {
	/** Timestamp of this DateTime (timezone-independent) */
	readonly timestamp: Timestamp.Type;

	/** YearDescriptor of this DateTime, expressed in given timezone */
	readonly yearDescriptor: Option.Option<YearDescriptor.Type>;

	/** DayDescriptor of this DateTime, expressed in given timezone */
	readonly dayDescriptor: Option.Option<DayDescriptor.Type>;

	/** IsoYearDescriptor of this DateTime, expressed in given timezone */
	readonly isoYearDescriptor: Option.Option<IsoYearDescriptor.Type>;

	/** IsoDayDescriptor of this DateTime, expressed in given timezone */
	readonly isoDayDescriptor: Option.Option<IsoDayDescriptor.Type>;

	/** Time of this DateTime, expressed in given timezone */
	readonly time: Option.Option<Time.Type>;

	/**
	 * Offset in hours of the zone for which all calculations of that DateTime object will be carried
	 * out. Not necessarily an integer, range: [-12, 14]
	 */
	readonly timeZoneOffset: number;

	/** @internal */
	readonly _zonedTimestamp: Timestamp.Type;
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
	Timestamp.equivalence(self.timestamp, that.timestamp);

const _intToFixedLengthString = (length: number): MTypes.OneArgFunction<number, string> =>
	flow(MString.fromNumber(10), String.padStart(length, '0'));
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
		const timeZoneOffset = this.timeZoneOffset;
		const zoneHours = Math.trunc(timeZoneOffset);
		const zoneHoursSign = zoneHours >= 0 ? '+' : '-';

		const yearString = pipe(this, year, _intToFixedLengthString(4));
		const monthString = pipe(this, month, _intToFixedLengthString(2));
		const monthDayString = pipe(this, monthDay, _intToFixedLengthString(2));
		const hour24String = pipe(this, hour24, _intToFixedLengthString(2));
		const minuteString = pipe(this, minute, _intToFixedLengthString(2));
		const secondString = pipe(this, second, _intToFixedLengthString(2));
		const millisecondString = pipe(this, millisecond, _intToFixedLengthString(3));
		const zoneHoursString = pipe(zoneHours, Math.abs, _intToFixedLengthString(2));
		const zoneMinuteString = pipe(
			timeZoneOffset,
			Number.subtract(zoneHours),
			Math.abs,
			Number.multiply(60),
			_intToFixedLengthString(2)
		);

		return `${yearString}-${monthString}-${monthDayString} ${hour24String}:${minuteString}:${secondString}:${millisecondString} GMT${zoneHoursSign}${zoneHoursString}${zoneMinuteString}`;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor that checks the validity of the optional `timeZoneOffset` parameter and,
 *
 * - If `timestamp` is passed, calculates the internal `_zonedTimestamp` field,
 * - If `_zonedTimestamp` is passed, calculates the `timestamp` field,
 */
const _makeWithInternals = (
	params: {
		readonly timeZoneOffset: number | undefined;
	} & (
		| (Omit<MTypes.Data<Type>, 'timeZoneOffset' | '_zonedTimestamp'> & {
				readonly _zonedTimestamp: undefined;
		  })
		| (Omit<MTypes.Data<Type>, 'timeZoneOffset' | 'timestamp'> & {
				readonly timestamp: undefined;
		  })
	)
): Either.Either<Type, MInputError.Type> =>
	Either.gen(function* () {
		const validatedTimeZoneOffset = yield* pipe(
			params.timeZoneOffset,
			Option.fromNullable,
			Option.map(
				MInputError.assertInRange({
					min: -12,
					max: 14,
					offset: 0,
					name: "'timeZoneOffset'"
				})
			),
			Option.getOrElse(() => Either.right(LOCAL_TIME_ZONE_OFFSET))
		);

		if (params.timestamp !== undefined) {
			const timestamp = params.timestamp;
			return _make({
				...params,
				timeZoneOffset: validatedTimeZoneOffset,
				timestamp,
				_zonedTimestamp: Timestamp.zoned(validatedTimeZoneOffset * HOUR_MS)(timestamp)
			});
		}

		const _zonedTimestamp = params._zonedTimestamp;
		return _make({
			...params,
			timeZoneOffset: validatedTimeZoneOffset,
			timestamp: Timestamp.zoned(-validatedTimeZoneOffset * HOUR_MS)(_zonedTimestamp),
			_zonedTimestamp
		});
	});

/**
 * Tries to build a DateTime from a timestamp. Does not check the validity of the timestamp
 * parameter
 */
const _unsafeFromTimestamp = (
	timestamp: number,
	timeZoneOffset?: number
): Either.Either<Type, MInputError.Type> =>
	Either.gen(function* () {
		return yield* _makeWithInternals({
			yearDescriptor: Option.none(),
			dayDescriptor: Option.none(),
			isoYearDescriptor: Option.none(),
			isoDayDescriptor: Option.none(),
			time: Option.none(),
			timestamp: Timestamp.fromTimestamp(timestamp),
			timeZoneOffset,
			_zonedTimestamp: undefined
		});
	});

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
export const fromTimestamp = (
	timestamp: number,
	timeZoneOffset?: number
): Either.Either<Type, MInputError.Type> =>
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

		return yield* _unsafeFromTimestamp(validatedTimestamp, timeZoneOffset);
	});

/**
 * Same as fromTimestamp but returns directly the DateTime or throws if it cannot be built
 *
 * @category Constructors
 */
export const unsafeFromTimestamp = (timestamp: number, timeZoneOffset?: number): Type =>
	Either.getOrThrowWith(fromTimestamp(timestamp, timeZoneOffset), Function.identity);

/**
 * Builds a DateTime using Date.now() as timestamp. `timeZoneOffset` is a number, not necessarily an
 * integer, that represents the offset in hours of the zone for which all calculations of that
 * DateTime object will be carried out. It must be comprised in the range [-12, 14]. If omitted, the
 * offset of the local time zone of the machine this code is running on is used.
 *
 * @category Constructors
 */
export const now = (timeZoneOffset?: number): Type =>
	unsafeFromTimestamp(Date.now(), timeZoneOffset);

const _fromPartsAndTime = (parts: {
	readonly year?: number;
	readonly ordinalDay?: number;
	readonly month?: number;
	readonly monthDay?: number;
	readonly isoYear?: number;
	readonly isoWeek?: number;
	readonly weekDay?: number;
	readonly hour24?: number;
	readonly time: Time.Type;
	readonly timeZoneOffset?: number;
}): Either.Either<Type, MInputError.Type> =>
	Either.gen(function* () {
		const { year, ordinalDay, month, monthDay, isoYear, isoWeek, weekDay, time } = parts;

		const yearIsSet = year !== undefined;
		const isoYearIsSet = isoYear !== undefined;

		const hasDate =
			yearIsSet && (ordinalDay !== undefined || (month !== undefined && monthDay !== undefined));
		const hasIsoDate = isoYearIsSet && isoWeek !== undefined && weekDay !== undefined;

		if (hasDate || (yearIsSet && !hasIsoDate)) {
			const validatedYear = yield* pipe(
				year,
				MInputError.assertInRange({
					min: MIN_FULL_YEAR,
					max: MAX_FULL_YEAR,
					offset: 0,
					name: "'year'"
				})
			);

			const yearDescriptor = YearDescriptor.fromYear(validatedYear);

			const dayDescriptor = yield* ordinalDay !== undefined ?
				Either.gen(function* () {
					const validatedOrdinalDay = yield* pipe(
						ordinalDay,
						MInputError.assertInRange({
							min: 1,
							max: YearDescriptor.getDayDuration(yearDescriptor),
							offset: 0,
							name: "'ordinalDay'"
						})
					);
					const dayDescriptor = DayDescriptor.fromOrdinalDay(yearDescriptor, validatedOrdinalDay);
					if (month !== undefined)
						yield* pipe(
							month,
							MInputError.assertValue({ expected: dayDescriptor.month, name: "'month'" })
						);
					if (monthDay !== undefined)
						yield* pipe(
							monthDay,
							MInputError.assertValue({ expected: dayDescriptor.monthDay, name: "'monthDay'" })
						);
					return dayDescriptor;
				})
			:	Either.gen(function* () {
					const validatedMonth =
						month === undefined ? 1 : (
							yield* pipe(
								month,
								MInputError.assertInRange({
									min: 1,
									max: 12,
									offset: 0,
									name: "'month'"
								})
							)
						);
					const validatedMonthDay =
						monthDay === undefined ? 1 : (
							yield* pipe(
								monthDay,
								MInputError.assertInRange({
									min: 1,
									max: YearDescriptor.getNumberOfDaysInMonth(validatedMonth)(yearDescriptor),
									offset: 0,
									name: "'monthDay'"
								})
							)
						);
					return DayDescriptor.fromYearMonthDay(yearDescriptor, validatedMonth, validatedMonthDay);
				});

			const noDayParts = isoWeek === undefined && weekDay === undefined;

			const _zonedTimestamp = dayDescriptor.startTimestamp + time.timestampOffset;
			if (!isoYearIsSet && noDayParts)
				return yield* _makeWithInternals({
					timestamp: undefined,
					yearDescriptor: Option.some(yearDescriptor),
					dayDescriptor: Option.some(dayDescriptor),
					isoYearDescriptor: Option.none(),
					isoDayDescriptor: Option.none(),
					time: Option.some(time),
					timeZoneOffset: parts.timeZoneOffset,
					_zonedTimestamp
				});

			const isoYearDescriptor = IsoYearDescriptor.fromTimestamp(_zonedTimestamp);

			if (isoYear !== undefined)
				yield* pipe(
					isoYear,
					MInputError.assertValue({ expected: isoYearDescriptor.isoYear, name: "'isoYear'" })
				);

			if (noDayParts)
				return yield* _makeWithInternals({
					timestamp: undefined,
					yearDescriptor: Option.some(yearDescriptor),
					dayDescriptor: Option.some(dayDescriptor),
					isoYearDescriptor: Option.some(isoYearDescriptor),
					isoDayDescriptor: Option.none(),
					time: Option.some(time),
					timeZoneOffset: parts.timeZoneOffset,
					_zonedTimestamp
				});

			const isoDayDescriptor = IsoDayDescriptor.fromTimestamp(
				isoYearDescriptor,
				_zonedTimestamp - isoYearDescriptor.startTimestamp
			);

			if (isoWeek !== undefined)
				yield* pipe(
					isoWeek,
					MInputError.assertValue({ expected: isoDayDescriptor.isoWeek, name: "'isoWeek'" })
				);

			if (weekDay !== undefined)
				yield* pipe(
					weekDay,
					MInputError.assertValue({
						expected: isoDayDescriptor.weekDay,
						name: "'weekDay'"
					})
				);

			return yield* _makeWithInternals({
				timestamp: undefined,
				yearDescriptor: Option.some(yearDescriptor),
				dayDescriptor: Option.some(dayDescriptor),
				isoYearDescriptor: Option.some(isoYearDescriptor),
				isoDayDescriptor: Option.some(isoDayDescriptor),
				time: Option.some(time),
				timeZoneOffset: parts.timeZoneOffset,
				_zonedTimestamp
			});
		}

		if (!isoYearIsSet)
			return yield* Either.left(
				new MInputError.Type({
					message: "One of 'year' and 'isoYear' must be be set"
				})
			);

		const validatedIsoYear = yield* pipe(
			isoYear,
			MInputError.assertInRange({
				min: MIN_FULL_YEAR,
				max: MAX_FULL_YEAR,
				offset: 0,
				name: "'isoYear'"
			})
		);
		const isoYearDescriptor = IsoYearDescriptor.fromIsoYear(validatedIsoYear);

		const validatedIsoWeek =
			isoWeek === undefined ? 1 : (
				yield* pipe(
					isoWeek,
					MInputError.assertInRange({
						min: 1,
						max: IsoYearDescriptor.getLastIsoWeek(isoYearDescriptor),
						offset: 0,
						name: "'isoWeek'"
					})
				)
			);

		const validatedWeekDay =
			weekDay === undefined ? 1 : (
				yield* pipe(
					weekDay,
					MInputError.assertInRange({
						min: 1,
						max: 7,
						offset: 0,
						name: "'weekDay'"
					})
				)
			);

		const isoDayDescriptor = IsoDayDescriptor.fromWeekAndWeekDay(
			isoYearDescriptor,
			validatedIsoWeek,
			validatedWeekDay
		);

		const _zonedTimestamp = isoDayDescriptor.startTimestamp + time.timestampOffset;

		const noDayParts = ordinalDay === undefined && month === undefined && monthDay === undefined;

		if (year === undefined && noDayParts)
			return yield* _makeWithInternals({
				timestamp: undefined,
				yearDescriptor: Option.none(),
				dayDescriptor: Option.none(),
				isoYearDescriptor: Option.some(isoYearDescriptor),
				isoDayDescriptor: Option.some(isoDayDescriptor),
				time: Option.some(time),
				timeZoneOffset: parts.timeZoneOffset,
				_zonedTimestamp
			});

		const yearDescriptor = YearDescriptor.fromTimestamp(_zonedTimestamp);

		if (year !== undefined)
			yield* pipe(year, MInputError.assertValue({ expected: yearDescriptor.year, name: "'year'" }));

		if (noDayParts)
			return yield* _makeWithInternals({
				timestamp: undefined,
				yearDescriptor: Option.some(yearDescriptor),
				dayDescriptor: Option.none(),
				isoYearDescriptor: Option.some(isoYearDescriptor),
				isoDayDescriptor: Option.some(isoDayDescriptor),
				time: Option.some(time),
				timeZoneOffset: parts.timeZoneOffset,
				_zonedTimestamp
			});

		const dayDescriptor = DayDescriptor.fromTimestamp(
			yearDescriptor,
			_zonedTimestamp - yearDescriptor.startTimestamp
		);

		if (month !== undefined)
			yield* pipe(
				month,
				MInputError.assertValue({ expected: dayDescriptor.month, name: "'month'" })
			);

		if (monthDay !== undefined)
			yield* pipe(
				monthDay,
				MInputError.assertValue({ expected: dayDescriptor.monthDay, name: "'monthDay'" })
			);

		if (ordinalDay !== undefined)
			yield* pipe(
				ordinalDay,
				MInputError.assertValue({
					expected: dayDescriptor.ordinalDay,
					name: "'ordinalDay'"
				})
			);

		return yield* _makeWithInternals({
			timestamp: undefined,
			yearDescriptor: Option.some(yearDescriptor),
			dayDescriptor: Option.some(dayDescriptor),
			isoYearDescriptor: Option.some(isoYearDescriptor),
			isoDayDescriptor: Option.some(isoDayDescriptor),
			time: Option.some(time),
			timeZoneOffset: parts.timeZoneOffset,
			_zonedTimestamp
		});
	});

/**
 * Tries to build a DateTime from the provided DateTime parts. Returns a `right` of this DateTime if
 * successful. Returns a `left` of an error otherwise.
 *
 * `timeZoneOffset` is a number, not necessarily an integer, that represents the offset in hours of
 * the zone relative to which all other parameters are expressed. It should be comprised in the
 * range [-12, 14]. If omitted, the offset of the local time zone of the machine this code is
 * running on is used.
 *
 * `year` must be an integer comprised in the range [MIN_FULL_YEAR, MAX_FULL_YEAR]. `ordinalDay`
 * must be an integer greater than or equal to 1 and less than or equal to the number of days in the
 * current year. `month` must be an integer greater than or equal to 1 (January) and less than or
 * equal to 12 (December). `monthDay` must be an integer greater than or equal to 1 and less than or
 * equal to the number of days in the current month.
 *
 * `isoYear` must be an integer comprised in the range [MIN_FULL_YEAR, MAX_FULL_YEAR]. `isoWeek`
 * must be an integer greater than or equal to 1 and less than or equal to the number of iso weeks
 * in the current year. `weekDay` must be an integer greater than or equal to 1 (monday) and less
 * than or equal to 7 (sunday).
 *
 * If there is not sufficient information to determine the exact day of the year, i.e. none of the
 * three following tuples is fully determined [year, ordinalDay], [year, month, monthDay], [isoYear,
 * isoWeek, weekDay], default values are determined in the following order (the first match stops
 * the process):
 *
 * - If `year` and `month` are defined, `monthDay` is taken equal to 1.
 * - If `year` and `monthDay` are defined, `month` is taken equal to 1.
 * - If `year` is defined and both `month` and `monthDay` are undefined, the day is taken to be the
 *   first one in the year.
 * - If `isoYear` and `isoWeek` are defined, `weekDay` is taken equal to 1.
 * - If `isoYear` and `weekDay` are defined, `isoWeek` is taken equal to 1.
 * - If `isoYear` is defined and both `isoWeek` and `weekDay` are undefined, the day is taken to be
 *   the first one in the isoyear.
 * - If both `year` and `isoYear` are undefined, an error is raised.
 *
 * `hour24` must be an integer greater than or equal to 0 and less than or equal to 23. `hour12`
 * must be an integer greater than or equal to 0 and less than or equal to 11. `meridiem` must be
 * one of 0 (AM) or 12 (PM). If there is not sufficient information to determine the hour of the
 * day, i.e. none of the two following tuples is fully determined [hour24], [hour12, meridiem],
 * default values are determined as follows:
 *
 * - If `meridiem` is set, `hour12` is taken equal to 0.
 * - If `hour12` is set, `meridiem` is taken equal to 0.
 * - Otherwise, `meridiem` and `hour12` are taken equal to 0.
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

export const fromParts = (parts: {
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
	readonly weekDay?: number;
	/** Number of hours since the start of the current day, range:[0, 23] */
	readonly hour24?: number;
	/** Number of hours since the start of the current meridiem, range:[0, 11] */
	readonly hour12?: number;
	/** Meridiem offset of this DateTime in hours, 0 for 'AM', 12 for 'PM' */
	readonly meridiem?: 0 | 12;
	/** Number of minutes since the start of the current hour, range:[0, 59] */
	readonly minute?: number;
	/** Number of seconds, since sthe start of the current minute, range:[0, 59] */
	readonly second?: number;
	/** Number of milliseconds, since sthe start of the current second, range:[0, 999] */
	readonly millisecond?: number;
	/**
	 * Offset in hours of the zone for which all calculations will be carried out. Not necessarily an
	 * integer, range: [-12, 14]
	 */
	readonly timeZoneOffset?: number;
}): Either.Either<Type, MInputError.Type> =>
	Either.gen(function* () {
		const time = yield* Time.fromParts(parts);
		return yield* _fromPartsAndTime({ ...parts, time });
	});

/**
 * Instance of a DateTime that represents January 1st, 1970 in the Greenwich zone.
 *
 * @category Instances
 */
export const origin: Type = _make({
	timestamp: Timestamp.origin,
	yearDescriptor: Option.some(YearDescriptor.origin),
	dayDescriptor: Option.some(DayDescriptor.origin),
	isoYearDescriptor: Option.some(IsoYearDescriptor.origin),
	isoDayDescriptor: Option.some(IsoDayDescriptor.origin),
	time: Option.some(Time.origin),
	timeZoneOffset: 0,
	_zonedTimestamp: Timestamp.origin
});

/** Returns the timestamp of `self` as a Timestamp object */
const _timestamp: MTypes.OneArgFunction<Type, Timestamp.Type> = Struct.get('timestamp');

/**
 * Returns the timestamp of `self` as a number
 *
 * @category Destructors
 */
export const timestamp: MTypes.OneArgFunction<Type, number> = flow(_timestamp, Timestamp.getValue);

/** Returns the yearDescriptor of `self` for the given time zone */
const _yearDescriptor = (self: Type): YearDescriptor.Type =>
	pipe(
		self.yearDescriptor,
		Option.getOrElse(() => {
			const result = YearDescriptor.fromTimestamp(self._zonedTimestamp);
			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */
			(self as MTypes.WithMutable<Type, 'yearDescriptor'>).yearDescriptor = Option.some(result);
			return result;
		})
	);

/**
 * Returns the (Gregorian) year of `self` for the given time zone
 *
 * @category Destructors
 */
export const year: MTypes.OneArgFunction<Type, number> = flow(_yearDescriptor, YearDescriptor.year);

/**
 * Returns true if the (Gregorian) year of `self` for the given time zone is a leap year. Returns
 * false otherwise
 *
 * @category Destructors
 */
export const isLeap: MTypes.OneArgFunction<Type, boolean> = flow(
	_yearDescriptor,
	YearDescriptor.isLeap
);

/** Returns the dayDescriptor of `self` for the given time zone */
const _dayDescriptor = (self: Type): DayDescriptor.Type =>
	pipe(
		self.dayDescriptor,
		Option.getOrElse(() => {
			const yearDescriptor = _yearDescriptor(self);
			const result = DayDescriptor.fromTimestamp(yearDescriptor, self._zonedTimestamp);
			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */
			(self as MTypes.WithMutable<Type, 'dayDescriptor'>).dayDescriptor = Option.some(result);
			return result;
		})
	);

/**
 * Returns the ordinalDay of `self` for the given time zone
 *
 * @category Destructors
 */
export const ordinalDay: MTypes.OneArgFunction<Type, number> = flow(
	_dayDescriptor,
	DayDescriptor.ordinalDay
);

/**
 * Returns the month of `self` for the given time zone
 *
 * @category Destructors
 */
export const month: MTypes.OneArgFunction<Type, number> = flow(_dayDescriptor, DayDescriptor.month);

/**
 * Returns the monthDay of `self` for the given time zone
 *
 * @category Destructors
 */
export const monthDay: MTypes.OneArgFunction<Type, number> = flow(
	_dayDescriptor,
	DayDescriptor.monthDay
);

/** Returns the isoYearDescriptor of `self` for the given time zone */
const _isoYearDescriptor = (self: Type): IsoYearDescriptor.Type =>
	pipe(
		self.isoYearDescriptor,
		Option.getOrElse(() => {
			const result = IsoYearDescriptor.fromTimestamp(self._zonedTimestamp);
			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */
			(self as MTypes.WithMutable<Type, 'isoYearDescriptor'>).isoYearDescriptor =
				Option.some(result);
			return result;
		})
	);

/**
 * Returns the isoYear of `self` for the given time zone
 *
 * @category Destructors
 */
export const isoYear: MTypes.OneArgFunction<Type, number> = flow(
	_isoYearDescriptor,
	IsoYearDescriptor.isoYear
);

/**
 * Returns true if the isoYear of `self` for the given time zone is a long year. Returns false
 * otherwise
 *
 * @category Destructors
 */
export const isLong: MTypes.OneArgFunction<Type, boolean> = flow(
	_isoYearDescriptor,
	IsoYearDescriptor.isLong
);

/** Returns the isoDayDescriptor of `self` for the given time zone */
const _isoDayDescriptor = (self: Type): IsoDayDescriptor.Type =>
	pipe(
		self.isoDayDescriptor,
		Option.getOrElse(() => {
			const isoYearDescriptor = _isoYearDescriptor(self);
			const result = IsoDayDescriptor.fromTimestamp(isoYearDescriptor, self._zonedTimestamp);
			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */
			(self as MTypes.WithMutable<Type, 'isoDayDescriptor'>).isoDayDescriptor = Option.some(result);
			return result;
		})
	);

/**
 * Returns the isoWeek of `self` for the given time zone
 *
 * @category Destructors
 */
export const isoWeek: MTypes.OneArgFunction<Type, number> = flow(
	_isoDayDescriptor,
	IsoDayDescriptor.isoWeek
);

/**
 * Returns the weekDay of `self` for the given time zone
 *
 * @category Destructors
 */
export const weekDay: MTypes.OneArgFunction<Type, number> = flow(
	_isoDayDescriptor,
	IsoDayDescriptor.weekDay
);

/** Returns the time of `self` for the given time zone */
const _time = (self: Type): Time.Type =>
	pipe(
		self.time,
		Option.getOrElse(() => {
			const result = Time.fromTimestamp(self._zonedTimestamp);
			/* eslint-disable-next-line functional/immutable-data, functional/no-expression-statements */
			(self as MTypes.WithMutable<Type, 'time'>).time = Option.some(result);
			return result;
		})
	);

/**
 * Returns the hour24 of `self` for the given time zone
 *
 * @category Destructors
 */
export const hour24: MTypes.OneArgFunction<Type, number> = flow(_time, Time.hour24);

/**
 * Returns the hour12 of `self` for the given time zone
 *
 * @category Destructors
 */
export const hour12: MTypes.OneArgFunction<Type, number> = flow(_time, Time.hour12);

/**
 * Returns the meridiem of `self` for the given time zone
 *
 * @category Destructors
 */
export const meridiem: MTypes.OneArgFunction<Type, number> = flow(_time, Time.meridiem);

/**
 * Returns the minute of `self` for the given time zone
 *
 * @category Destructors
 */
export const minute: MTypes.OneArgFunction<Type, number> = flow(_time, Time.minute);

/**
 * Returns the second of `self` for the given time zone
 *
 * @category Destructors
 */
export const second: MTypes.OneArgFunction<Type, number> = flow(_time, Time.second);

/**
 * Returns the millisecond of `self` for the given time zone
 *
 * @category Destructors
 */
export const millisecond: MTypes.OneArgFunction<Type, number> = flow(_time, Time.millisecond);

/**
 * If possible, returns a right of a DateTime having year `year` and the same `month`, `monthDay`,
 * `hour24`, `minute`, `second`, `millisecond` and `timeZoneOffset` as `self`. Returns a `left` of
 * an error otherwise. `year` must be an integer comprised in the range [MIN_FULL_YEAR,
 * MAX_FULL_YEAR].
 *
 * @category Setters
 */
export const setYear =
	(year: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		_fromPartsAndTime({
			year,
			month: month(self),
			monthDay: monthDay(self),
			time: _time(self),
			timeZoneOffset: self.timeZoneOffset
		});

/**
 * If possible, returns a right of a DateTime having ordinalDay `ordinalDay` and the same `year`,
 * `hour24`, `minute`, `second`, `millisecond` and `timeZoneOffset` as `self`. Returns a `left` of
 * an error otherwise. `ordinalDay` must be an integer greater than or equal to 1 and less than or
 * equal to the number of days in the current year
 *
 * @category Setters
 */
export const setOrdinalDay =
	(ordinalDay: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		_fromPartsAndTime({
			year: year(self),
			ordinalDay,
			time: _time(self),
			timeZoneOffset: self.timeZoneOffset
		});

const _updateYearAndDay =
	({
		year,
		month,
		monthDay,
		ordinalDay
	}: {
		readonly year: number;
		readonly month?: number;
		readonly monthDay?: number;
		readonly ordinalDay?: number;
	}) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		Either.gen(function* () {
			const selfYearDescriptor = self.yearDescriptor;
			const yearDescriptor =
				Option.isSome(selfYearDescriptor) && selfYearDescriptor.value.year === year ?
					selfYearDescriptor.value
				:	yield* pipe(
						year,
						MInputError.assertInRange({
							min: MIN_FULL_YEAR,
							max: MAX_FULL_YEAR,
							offset: 0,
							name: "'year'"
						}),
						Either.map(YearDescriptor.fromYear)
					);

			const dayDescriptor = yield* ordinalDay !== undefined ?
				Either.gen(function* () {
					const validatedOrdinalDay = yield* pipe(
						ordinalDay,
						MInputError.assertInRange({
							min: 1,
							max: YearDescriptor.getDayDuration(yearDescriptor),
							offset: 0,
							name: "'ordinalDay'"
						})
					);
					const dayDescriptor = DayDescriptor.fromOrdinalDay(yearDescriptor, validatedOrdinalDay);
					if (month !== undefined)
						yield* pipe(
							month,
							MInputError.assertValue({ expected: dayDescriptor.month, name: "'month'" })
						);
					if (monthDay !== undefined)
						yield* pipe(
							monthDay,
							MInputError.assertValue({ expected: dayDescriptor.monthDay, name: "'monthDay'" })
						);
					return dayDescriptor;
				})
			:	Either.gen(function* () {
					const validatedMonth =
						month === undefined ? 1 : (
							yield* pipe(
								month,
								MInputError.assertInRange({
									min: 1,
									max: 12,
									offset: 0,
									name: "'month'"
								})
							)
						);
					const validatedMonthDay =
						monthDay === undefined ? 1 : (
							yield* pipe(
								monthDay,
								MInputError.assertInRange({
									min: 1,
									max: YearDescriptor.getNumberOfDaysInMonth(validatedMonth)(yearDescriptor),
									offset: 0,
									name: "'monthDay'"
								})
							)
						);
					return DayDescriptor.fromYearMonthDay(yearDescriptor, validatedMonth, validatedMonthDay);
				});
			return yield* _makeWithInternals({
				timestamp: undefined,
				yearDescriptor: Option.some(yearDescriptor),
				dayDescriptor: Option.some(dayDescriptor),
				isoYearDescriptor: Option.none(),
				isoDayDescriptor: Option.none(),
				time: self.time,
				timeZoneOffset: self.timeZoneOffset,
				_zonedTimestamp: Timestamp.setDayPart(dayDescriptor.startTimestamp)(self._zonedTimestamp)
			});
		});

/**
 * If possible, returns a right of a DateTime having month `month` and the same `year`, `monthDay`,
 * `hour24`, `minute`, `second`, `millisecond` and `timeZoneOffset` as `self`. Returns a `left` of
 * an error otherwise. `month` must be an integer greater than or equal to 1 (January) and less than
 * or equal to 12 (December)
 *
 * @category Setters
 */
export const setMonth =
	(month: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		_fromPartsAndTime({
			year: year(self),
			month,
			monthDay: monthDay(self),
			time: _time(self),
			timeZoneOffset: self.timeZoneOffset
		});

/**
 * If possible, returns a right of a DateTime having monthDay `monthDay` and the same `year`,
 * `month`, `hour24`, `minute`, `second`, `millisecond` and `timeZoneOffset` as `self`. Returns a
 * `left` of an error otherwise. `monthDay` must be an integer greater than or equal to 1 and less
 * than or equal to the number of days in the current month.
 *
 * @category Setters
 */
export const setMonthDay =
	(monthDay: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		_fromPartsAndTime({
			year: year(self),
			month: month(self),
			monthDay,
			time: _time(self),
			timeZoneOffset: self.timeZoneOffset
		});

/**
 * If possible, returns a right of a DateTime having isoYear `isoYear` and the same `isoWeek`,
 * `weekDay`, `hour24`, `minute`, `second`, `millisecond` and `timeZoneOffset` as `self`. Returns a
 * `left` of an error otherwise. `isoYear` must be an integer comprised in the range [MIN_FULL_YEAR,
 * MAX_FULL_YEAR].
 *
 * @category Setters
 */
export const setIsoYear =
	(isoYear: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		_fromPartsAndTime({
			isoYear,
			isoWeek: isoWeek(self),
			weekDay: weekDay(self),
			time: _time(self),
			timeZoneOffset: self.timeZoneOffset
		});

/**
 * If possible, returns a right of a DateTime having isoWeek `isoWeek` and the same `isoYear`,
 * `weekDay`, `hour24`, `minute`, `second`, `millisecond` and `timeZoneOffset` as `self`. Returns a
 * `left` of an error otherwise. `isoWeek` must be an integer greater than or equal to 1 and less
 * than or equal to the number of iso weeks in the current year.
 *
 * @category Setters
 */
export const setIsoWeek =
	(isoWeek: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		_fromPartsAndTime({
			isoYear: isoYear(self),
			isoWeek,
			weekDay: weekDay(self),
			time: _time(self),
			timeZoneOffset: self.timeZoneOffset
		});

/**
 * If possible, returns a right of a DateTime having weekDay `weekDay` and the same `isoYear`,
 * `isoWeek`, `hour24`, `minute`, `second`, `millisecond` and `timeZoneOffset` as `self`. Returns a
 * `left` of an error otherwise. `weekDay` must be an integer greater than or equal to 1 (monday)
 * and less than or equal to 7 (sunday).
 *
 * @category Setters
 */
export const setWeekDay =
	(weekDay: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		_fromPartsAndTime({
			isoYear: isoYear(self),
			isoWeek: isoWeek(self),
			weekDay,
			time: _time(self),
			timeZoneOffset: self.timeZoneOffset
		});

/**
 * If possible, returns a right of a DateTime having hour24 `hour24` and the same `year`,
 * `ordinalDay`, `minute`, `second`, `millisecond` and `timeZoneOffset` as `self`. Returns a `left`
 * of an error otherwise. `weekDay` must be an integer greater than or equal to 1 (monday) and less
 * than or equal to 7 (sunday).
 *
 * @category Setters
 */
export const setHour24 =
	(hour24: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> => {
		return _makeWithInternals({
			timestamp,
			yearDescriptor: Option.some(yearDescriptor),
			dayDescriptor: Option.some(dayDescriptor),
			isoYearDescriptor: Option.some(isoYearDescriptor),
			isoDayDescriptor: Option.some(isoDayDescriptor),
			time: Option.some(time),
			timeZoneOffset: parts.timeZoneOffset,
			offsetTimestamp: true
		});
	};

/**
 * If possible, returns a right of a copy of `self` with timeZoneOffset set to `timeZoneOffset`.
 * Returns a `left` of an error otherwise. `timeZoneOffset` is a number, not necessarily an integer,
 * that represents the offset in hours of the zone for which all calculations of that DateTime
 * object will be carried out. It must be comprised in the range [-12, 14]. If omitted, the offset
 * of the local time zone of the machine this code is running on is used.
 *
 * @category Setters
 */
export const setTimeZoneOffset =
	(timeZoneOffset?: number) =>
	(self: Type): Either.Either<Type, MInputError.Type> =>
		_unsafeFromTimestamp(timestamp(self), timeZoneOffset);
