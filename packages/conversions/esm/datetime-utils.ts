/**
 * This module implements low-level functions used by the DateTime module. You should not need to
 * use this module
 */
import { MArray, MNumber, MTypes } from '@parischap/effect-lib';
import { Array, flow, Number, Option, pipe, Struct } from 'effect';

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
export const SHORT_ISO_YEAR_MS = 52 * WEEK_MS;

/**
 * Duration of a long iso year in milliseconds
 *
 * @category Constants
 */
export const LONG_ISO_YEAR_MS = SHORT_ISO_YEAR_MS + WEEK_MS;

/**
 * Local time zone offset in milliseconds of the machine on which this code runs. The value is
 * calculated once at startup.
 *
 * @category Constants
 */
export const LOCAL_TIME_ZONE_OFFSET_MS = new Date(0).getTimezoneOffset() * MINUTE_MS;

/**
 * Returns the index of tha last ordinal day a year
 *
 * @category Utils
 */
export const lastOrdinalDayIndex = (isLeap: boolean): number => (isLeap ? 365 : 364);

/**
 * Namespace for the data relative to a Month
 *
 * @category Models
 */

export namespace MonthDescriptor {
	/**
	 * Type of a MonthDescriptor
	 *
	 * @category Models
	 */
	export interface Type {
		/** The index of the month described by this MonthDescriptor, range: [0, 11] */
		readonly monthIndex: number;
		/** The index of the last day of the month described by this MonthDescriptor */
		readonly lastDayIndex: number;
		/**
		 * The number of milliseconds between the first millisecond of the year and the first
		 * millisecond of the month described by this MonthDescriptor
		 */
		readonly monthStartMs: number;
	}

	namespace Cache {
		export interface Type extends ReadonlyArray<MonthDescriptor.Type> {}

		const normalYear: Type = [
			{ monthIndex: 0, lastDayIndex: 30, monthStartMs: 0 },
			{ monthIndex: 1, lastDayIndex: 27, monthStartMs: 2678400000 },
			{ monthIndex: 2, lastDayIndex: 30, monthStartMs: 5097600000 },
			{ monthIndex: 3, lastDayIndex: 29, monthStartMs: 7776000000 },
			{ monthIndex: 4, lastDayIndex: 30, monthStartMs: 10368000000 },
			{ monthIndex: 5, lastDayIndex: 29, monthStartMs: 13046400000 },
			{ monthIndex: 6, lastDayIndex: 30, monthStartMs: 15638400000 },
			{ monthIndex: 7, lastDayIndex: 30, monthStartMs: 18316800000 },
			{ monthIndex: 8, lastDayIndex: 29, monthStartMs: 20995200000 },
			{ monthIndex: 9, lastDayIndex: 30, monthStartMs: 23587200000 },
			{ monthIndex: 10, lastDayIndex: 29, monthStartMs: 26265600000 },
			{ monthIndex: 11, lastDayIndex: 30, monthStartMs: 28857600000 }
		];

		const leapYear: Type = [
			{ monthIndex: 0, lastDayIndex: 30, monthStartMs: 0 },
			{ monthIndex: 1, lastDayIndex: 28, monthStartMs: 2678400000 },
			{ monthIndex: 2, lastDayIndex: 30, monthStartMs: 5184000000 },
			{ monthIndex: 3, lastDayIndex: 29, monthStartMs: 7862400000 },
			{ monthIndex: 4, lastDayIndex: 30, monthStartMs: 10454400000 },
			{ monthIndex: 5, lastDayIndex: 29, monthStartMs: 13132800000 },
			{ monthIndex: 6, lastDayIndex: 30, monthStartMs: 15724800000 },
			{ monthIndex: 7, lastDayIndex: 30, monthStartMs: 18403200000 },
			{ monthIndex: 8, lastDayIndex: 29, monthStartMs: 21081600000 },
			{ monthIndex: 9, lastDayIndex: 30, monthStartMs: 23673600000 },
			{ monthIndex: 10, lastDayIndex: 29, monthStartMs: 26352000000 },
			{ monthIndex: 11, lastDayIndex: 30, monthStartMs: 28944000000 }
		];

		export const _get = (isLeapYear: boolean): Type => (isLeapYear ? leapYear : normalYear);
	}

	/**
	 * Returns the `monthIndex` property of `self`
	 *
	 * @category Destructors
	 */
	export const monthIndex: MTypes.OneArgFunction<Type, number> = Struct.get('monthIndex');

	/**
	 * Returns the `lastDayIndex` property of `self`
	 *
	 * @category Destructors
	 */
	export const lastDayIndex: MTypes.OneArgFunction<Type, number> = Struct.get('lastDayIndex');

	/**
	 * Returns the `monthStartMs` property of `self`
	 *
	 * @category Destructors
	 */
	export const monthStartMs: MTypes.OneArgFunction<Type, number> = Struct.get('monthStartMs');

	/**
	 * Returns the MonthDescriptor of the month to which the date provided as an offset in
	 * milliseconds from the start of a year (`yearOffsetMs`) belongs.
	 *
	 * @category Constructors
	 */
	export const fromYearOffset =
		(isLeapYear: boolean) =>
		(yearOffsetMs: number): Type =>
			pipe(
				isLeapYear,
				Cache._get,
				Array.findLast(flow(Struct.get('monthStartMs'), Number.lessThanOrEqualTo(yearOffsetMs))),
				Option.getOrThrow
			);

	/**
	 * Returns the MonthDescriptor of the `monthIndex`-th month of a year
	 *
	 * @category Constructors
	 */
	export const fromMonthIndex = (isLeapYear: boolean): MTypes.OneArgFunction<number, Type> =>
		MArray.unsafeGetter(Cache._get(isLeapYear));
}

/**
 * Namespace for the data relative to a year.
 *
 * Year y and year y + kx400 (where k is any integer) have the same number of days (so they are both
 * leap years, or both normal years). We can therefore restrict the study of leap years to a
 * 400-year period.
 *
 * 2100, 2200, 2300 are not leap years. But 2400 is a leap year.
 *
 * @category Models
 */
export namespace YearDescriptor {
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

		/** True if `year` is a leap year. `false` otherwise */
		readonly isLeap: boolean;

		/** Timestamp of the first millisecond of UTC `year` */
		readonly startTimestamp: number;
	}

	/**
	 * Builds the YearDescriptor of the UTC year to which `timestamp` belongs
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

		return {
			year: 2001 + 400 * q400Years + 100 * q100Years + 4 * q4Years + q1Year,
			isLeap: q1Year === 3 && (q4Years !== 24 || q100Years === 3),
			startTimestamp:
				YEAR_START_2001_MS + offset400Years + offset100Years + offset4Years + offset1Year
		};
	};

	/**
	 * Builds the YearDescriptor of UTC year `year`
	 *
	 * @category Constructors
	 */
	export const fromYear = (year: number): Type => {
		const offset2001 = year - 2001;

		const [q400Years, r400Years] = MNumber.quotientAndRemainder(400)(offset2001);
		const [q100Years, r100Years] = MNumber.quotientAndRemainder(100)(r400Years);
		const [q4Years, r4Years] = MNumber.quotientAndRemainder(4)(r100Years);

		const isLeap = r4Years === 3 && (r100Years !== 99 || r400Years === 399);
		const startTimestamp =
			YEAR_START_2001_MS +
			q400Years * FOUR_HUNDRED_YEARS_MS +
			q100Years * HUNDRED_YEARS_MS +
			q4Years * FOUR_YEARS_MS +
			r4Years * NORMAL_YEAR_MS;

		return {
			year,
			isLeap,
			startTimestamp
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
export namespace IsoYearDescriptor {
	/**
	 * Duration in milliseconds of a 28-iso-year period comprised of 5 long years and 23 short years
	 * (see Wikipedia)
	 *
	 * @category Constants
	 */
	const TWENTY_EIGHT_ISO_YEARS_MS = 5 * LONG_ISO_YEAR_MS + 23 * SHORT_ISO_YEAR_MS;

	/**
	 * Duration in milliseconds of a 96-iso-year period comprised of 17 long years and 79 short years
	 * (see Wikipedia)
	 *
	 * @category Constants
	 */
	const NINETY_SIX_ISO_YEARS_MS = 17 * LONG_ISO_YEAR_MS + 79 * SHORT_ISO_YEAR_MS;

	/**
	 * Duration in milliseconds of a 100-iso-year period comprised of 18 long years and 82 short years
	 * (see Wikipedia)
	 *
	 * @category Constants
	 */
	const ONE_HUNDRED_ISO_YEARS_MS = 18 * LONG_ISO_YEAR_MS + 82 * SHORT_ISO_YEAR_MS;

	/**
	 * Duration in milliseconds of a 400-iso-year period comprised of 71 long years and 329 short
	 * years (see Wikipedia)
	 *
	 * @category Constants
	 */
	const FOUR_HUNDRED_ISO_YEARS_MS = 71 * LONG_ISO_YEAR_MS + 329 * SHORT_ISO_YEAR_MS;

	/**
	 * Timestamp of 03/01/2000 00:00:00:000+0:00
	 *
	 * @category Constants
	 */
	const ISO_YEAR_START_2000_MS = 946_857_600_000;

	/**
	 * Timestamp of 31/12/2012 00:00:00:000+0:00
	 *
	 * @category Constants
	 */
	const ISO_YEAR_START_2013_MS = 1_356_912_000_000;

	namespace Offset {
		namespace Cache {
			export interface Type extends ReadonlyArray<Offset.Type> {}

			export const twentyEightYear: Type = [
				{ yearOffset: 0, timestampOffset: -410054400000, isLong: false },
				{ yearOffset: 1, timestampOffset: -378604800000, isLong: false },
				{ yearOffset: 2, timestampOffset: -347155200000, isLong: false },
				{ yearOffset: 3, timestampOffset: -315705600000, isLong: false },
				{ yearOffset: 4, timestampOffset: -284256000000, isLong: true },
				{ yearOffset: 5, timestampOffset: -252201600000, isLong: false },
				{ yearOffset: 6, timestampOffset: -220752000000, isLong: false },
				{ yearOffset: 7, timestampOffset: -189302400000, isLong: false },
				{ yearOffset: 8, timestampOffset: -157852800000, isLong: false },
				{ yearOffset: 9, timestampOffset: -126403200000, isLong: true },
				{ yearOffset: 10, timestampOffset: -94348800000, isLong: false },
				{ yearOffset: 11, timestampOffset: -62899200000, isLong: false },
				{ yearOffset: 12, timestampOffset: -31449600000, isLong: false },
				{ yearOffset: 13, timestampOffset: 0, isLong: false },
				{ yearOffset: 14, timestampOffset: 31449600000, isLong: false },
				{ yearOffset: 15, timestampOffset: 62899200000, isLong: true },
				{ yearOffset: 16, timestampOffset: 94953600000, isLong: false },
				{ yearOffset: 17, timestampOffset: 126403200000, isLong: false },
				{ yearOffset: 18, timestampOffset: 157852800000, isLong: false },
				{ yearOffset: 19, timestampOffset: 189302400000, isLong: false },
				{ yearOffset: 20, timestampOffset: 220752000000, isLong: true },
				{ yearOffset: 21, timestampOffset: 252806400000, isLong: false },
				{ yearOffset: 22, timestampOffset: 284256000000, isLong: false },
				{ yearOffset: 23, timestampOffset: 315705600000, isLong: false },
				{ yearOffset: 24, timestampOffset: 347155200000, isLong: false },
				{ yearOffset: 25, timestampOffset: 378604800000, isLong: false },
				{ yearOffset: 26, timestampOffset: 410054400000, isLong: true },
				{ yearOffset: 27, timestampOffset: 442108800000, isLong: false }
			];
		}

		export interface Type {
			readonly yearOffset: number;
			readonly timestampOffset: number;
			readonly isLong: boolean;
		}

		/**
		 * Builds an offset from a year offset
		 *
		 * @category Constructors
		 */
		export const fromYearOffset: MTypes.OneArgFunction<number, Type> = MArray.unsafeGetter(
			Cache.twentyEightYear
		);

		/**
		 * Builds an offset from a timestamp offset
		 *
		 * @category Constructors
		 */
		export const fromTimestampOffset = (timestampOffset: number): Type =>
			pipe(
				Cache.twentyEightYear,
				Array.findLast(
					flow(Struct.get('timestampOffset'), Number.lessThanOrEqualTo(timestampOffset))
				),
				Option.getOrThrow
			);
	}

	/**
	 * Type of an IsoYearDescriptor
	 *
	 * @category Models
	 */
	export interface Type {
		/** The iso year described by this IsoYearDescriptor, range: [MIN_FULL_YEAR, MAX_FULL_YEAR] */
		readonly year: number;

		/** Timestamp of the start of UTC iso year `year` */
		readonly startTimestamp: number;

		/** If true, iso year year counts 53 weeks. Otherwise, it counts 52 weeks */
		readonly isLong: boolean;
	}

	/**
	 * Builds the IsoYearDescriptor of UTC iso year `year`
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
		const [q28Years, r28Years] = MNumber.quotientAndRemainder(28)(r400Years - q100Years * 96);
		const offset = Offset.fromYearOffset(r28Years);

		return {
			year: isoYear,
			startTimestamp:
				ISO_YEAR_START_2013_MS +
				q400Years * FOUR_HUNDRED_ISO_YEARS_MS +
				q100Years * NINETY_SIX_ISO_YEARS_MS +
				q28Years * TWENTY_EIGHT_ISO_YEARS_MS +
				offset.timestampOffset,
			isLong: offset.isLong
		};
	};

	/**
	 * Returns the MonthDescriptor of the month to which the date provided as an offset in
	 * milliseconds from the start of a year (`yearOffsetMs`) belongs.
	 *
	 * @category Constructors
	 */
	export const fromTimestamp = (timestamp: number): Type => {
		const [q400Years, r400Years] = pipe(
			timestamp,
			Number.subtract(ISO_YEAR_START_2000_MS),
			MNumber.quotientAndRemainder(FOUR_HUNDRED_ISO_YEARS_MS)
		);

		// The second one-hundred year period is a week shorter because it has 17 long years instead of 18
		// Also the hundred-th year must be put in the first one-hundred year period because it is not long
		const q100Years =
			r400Years < ONE_HUNDRED_ISO_YEARS_MS + SHORT_ISO_YEAR_MS ?
				0
			:	pipe(r400Years + WEEK_MS, Number.unsafeDivide(ONE_HUNDRED_ISO_YEARS_MS), Math.floor);

		const [q28Years, r28Years] = MNumber.quotientAndRemainder(TWENTY_EIGHT_ISO_YEARS_MS)(
			r400Years - q100Years * NINETY_SIX_ISO_YEARS_MS
		);

		const offset = Offset.fromTimestampOffset(
			r28Years + ISO_YEAR_START_2000_MS - ISO_YEAR_START_2013_MS
		);

		//console.log(q400Years, r400Years, q100Years, q28Years, r28Years, offset);
		return {
			year: 2000 + q400Years * 400 + q100Years * 96 + q28Years * 28 + offset.yearOffset,
			startTimestamp:
				ISO_YEAR_START_2013_MS +
				q400Years * FOUR_HUNDRED_ISO_YEARS_MS +
				q100Years * NINETY_SIX_ISO_YEARS_MS +
				q28Years * TWENTY_EIGHT_ISO_YEARS_MS +
				offset.timestampOffset,
			isLong: offset.isLong
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
	export const getMsDuration = (self: Type): number =>
		self.isLong ? LONG_ISO_YEAR_MS : SHORT_ISO_YEAR_MS;

	/**
	 * Returns the duration of the year described by `self` in milliseconds
	 *
	 * @category Destructors
	 */
	export const getLastIsoWeekIndex = (self: Type): number => (self.isLong ? 52 : 51);
}
