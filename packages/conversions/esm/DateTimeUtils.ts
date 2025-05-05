/**
 * This module implements low-level functions used by the DateTime module. You should not need to
 * use this module
 */
import { MArray, MNumber, MTypes } from '@parischap/effect-lib';
import { Array, Number, Option, Struct, Tuple, flow, pipe } from 'effect';

export const SECOND_MS = 1_000;
export const MINUTE_MS = 60 * SECOND_MS;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
export const WEEK_MS = 7 * DAY_MS;

const NORMAL_YEAR_MS = 365 * DAY_MS;
const LEAP_YEAR_MS = NORMAL_YEAR_MS + DAY_MS;

/**
 * Year y and year y + kx400 (where k is any integer) have the same number of days (so they are both
 * leap years, or both normal years). We can therefore restrict the study of leap years to a
 * 400-year period.
 *
 * 2100, 2200, 2300 are not leap years. But 2400 is a leap year.
 */
const FOUR_YEARS_MS = 3 * NORMAL_YEAR_MS + LEAP_YEAR_MS;
const HUNDRED_YEARS_MS = 25 * FOUR_YEARS_MS - DAY_MS;
const FOUR_HUNDRED_YEARS_MS = 4 * HUNDRED_YEARS_MS + DAY_MS;

// Time in ms between 1/1/1970 00:00:00:000+0:00 and 1/1/2001 00:00:00:000+0:00
const YEAR_START_2001_MS = 978_307_200_000;

/**
 * Local time zone offset in milliseconds of the machine on which this code runs. The value is
 * calculated once at startup.
 */
export const localTimeZoneOffsetMs = new Date(0).getTimezoneOffset() * MINUTE_MS;

const _modulo7 = MNumber.intModulo(7);
/**
 * Calculates the UTC weekDay (0 for monday, 6 for sunday) of a timestamp. Calculation is based on
 * the fact that 1/1/1970 was a UTC thursday.
 */
const _weekDayFromTimestamp = (timestamp: number): number =>
	_modulo7(Math.floor(timestamp / DAY_MS) + 3);

/**
 * Namespace for the data relative to iso weeks
 *
 * @category Models
 */

export namespace IsoWeekDescriptor {
	/**
	 * Type of an IsoWeekDescriptor
	 *
	 * @category Models
	 */
	export interface Type {
		/** WeekDay of the first day of the year, range [0,6] (0 for monday, 6 for sunday) */
		readonly firstYearDayWeekDay: number;

		/**
		 * Offset in ms between the first millisecond of the year and the first millisecond of the first
		 * iso week of the year. An iso week starts on a monday and ends on a sunday. The first iso week
		 * of the year is the one that contains January 4th (see Wikipedia).
		 */
		readonly firstIsoWeekMs: number;

		/** Index of the last iso week of the year */
		readonly lastIsoWeekIndex: number;
	}
}

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
}

namespace MonthDescriptorCache {
	export interface Type extends ReadonlyArray<MonthDescriptor.Type> {}

	const normalYearDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	const leapYearDaysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	const fromDaysInMonth: MTypes.OneArgFunction<ReadonlyArray<number>, Type> = flow(
		Array.mapAccum(0, (monthStartMs, nbDaysInMonth, monthIndex) =>
			Tuple.make(monthStartMs + nbDaysInMonth * DAY_MS, {
				monthIndex,
				lastDayIndex: nbDaysInMonth - 1,
				monthStartMs
			})
		),
		Tuple.getSecond
	);

	const normalYear: Type = fromDaysInMonth(normalYearDaysInMonth);
	const leapYear: Type = fromDaysInMonth(leapYearDaysInMonth);

	export const get = (isLeapYear: boolean): Type => (isLeapYear ? leapYear : normalYear);
}

/**
 * Namespace for the data relative to a year
 *
 * @category Models
 */
export namespace YearDescriptor {
	/**
	 * Type of a YearDescriptor
	 *
	 * @category Models
	 */
	export interface Type {
		/** The year described by this YearDescriptor, range: [MIN_FULL_YEAR, MAX_FULL_YEAR] */
		readonly year: number;

		/** True if `year` is a leap year. `false` otherwise */
		readonly isLeapYear: boolean;

		/** Timestamp of the first millisecond of `year` */
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
			isLeapYear: q1Year === 3 && (q4Years !== 24 || q100Years === 3),
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

		const isLeapYear = r4Years === 3 && (r100Years !== 99 || r400Years === 399);
		const startTimestamp =
			YEAR_START_2001_MS +
			q400Years * FOUR_HUNDRED_YEARS_MS +
			q100Years * HUNDRED_YEARS_MS +
			q4Years * FOUR_YEARS_MS +
			r4Years * NORMAL_YEAR_MS;

		return {
			year,
			isLeapYear,
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
	 * Returns the `isLeapYear` property of `self`
	 *
	 * @category Destructors
	 */
	export const isLeapYear: MTypes.OneArgFunction<Type, boolean> = Struct.get('isLeapYear');

	/**
	 * Returns the `startTimestamp` property of `self`
	 *
	 * @category Destructors
	 */
	export const startTimestamp: MTypes.OneArgFunction<Type, number> = Struct.get('startTimestamp');

	/**
	 * Returns the index of tha last ordinal day the year described by `self`
	 *
	 * @category Destructors
	 */
	export const getLastOrdinalDayIndex = (self: Type): number => (self.isLeapYear ? 365 : 364);

	/**
	 * Returns the duration of the year described by `self` in milliseconds
	 *
	 * @category Destructors
	 */
	export const getMsDuration = (self: Type): number =>
		self.isLeapYear ? LEAP_YEAR_MS : NORMAL_YEAR_MS;

	/**
	 * Builds the MonthDescriptor of the month to which the date provided as an offset in milliseconds
	 * from the start of the year described by `yearDescriptor` belongs.
	 *
	 * @category Destructors
	 */
	export const getMonthDescriptorFromYearOffset =
		(yearOffsetMs: number) =>
		(self: YearDescriptor.Type): MonthDescriptor.Type =>
			pipe(
				self.isLeapYear,
				MonthDescriptorCache.get,
				Array.findLast(flow(Struct.get('monthStartMs'), Number.lessThanOrEqualTo(yearOffsetMs))),
				Option.getOrThrow
			);

	/**
	 * Builds the MonthDescriptor of the `monthIndex`-th month of the year described by
	 * `yearDescriptor`
	 *
	 * @category Destructors
	 */
	export const getMonthDescriptorFromMonthIndex =
		(monthIndex: number) =>
		(self: YearDescriptor.Type): MonthDescriptor.Type =>
			pipe(self.isLeapYear, MonthDescriptorCache.get, MArray.unsafeGet(monthIndex));

	/**
	 * Returns the IsoWeekDescriptor of the year described by `self`
	 *
	 * @category Destructors
	 */
	export const getIsoWeekDescriptor = (self: Type): IsoWeekDescriptor.Type => {
		const firstYearDayWeekDay = _weekDayFromTimestamp(self.startTimestamp);
		return {
			firstYearDayWeekDay,
			firstIsoWeekMs: (_modulo7(3 - firstYearDayWeekDay) - 3) * DAY_MS,
			lastIsoWeekIndex:
				firstYearDayWeekDay === 3 || (firstYearDayWeekDay === 2 && self.isLeapYear) ? 52 : 51
		};
	};
}
