/** This module contains constants useful for date/time calculations */
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
	 * Duration in milliseconds of an 6-iso-year period comprised of 1 long year and 5 short years
	 * (see Wikipedia)
	 *
	 * @category Constants
	 */
	const SIX_ISO_YEARS_MS = LONG_ISO_YEAR_MS + 5 * SHORT_ISO_YEAR_MS;

	/**
	 * Duration in milliseconds of an 11-iso-year period comprised of 2 long years and 9 short years
	 * (see Wikipedia)
	 *
	 * @category Constants
	 */
	const ELEVEN_ISO_YEARS_MS = 2 * LONG_ISO_YEAR_MS + 9 * SHORT_ISO_YEAR_MS;

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
	 * Timestamp of 04/01/2010 00:00:00:000+0:00
	 *
	 * @category Constants
	 */
	const ISO_YEAR_START_2010_MS = 1_262_563_200_000;

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
	 * Builds the IsoYearDescriptor of the UTC year to which `timestamp` belongs
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
			r400Years - q100Years * NINETY_SIX_ISO_YEARS_MS + SHORT_ISO_YEAR_MS
		);

		const [q11Years, r11Years] = MNumber.quotientAndRemainder(ELEVEN_ISO_YEARS_MS)(
			r28Years - ELEVEN_ISO_YEARS_MS
		);

		const [q6Years, r6Years] = MNumber.quotientAndRemainder(SIX_ISO_YEARS_MS)(r11Years);
		const isFirstSixYearPeriod = q6Years === 0;
		const q1Year = Math.min(Math.floor(r6Years / SHORT_ISO_YEAR_MS), isFirstSixYearPeriod ? 5 : 4);

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
				ISO_YEAR_START_2010_MS +
				q400Years * FOUR_HUNDRED_ISO_YEARS_MS +
				q100Years * NINETY_SIX_ISO_YEARS_MS +
				q28Years * TWENTY_EIGHT_ISO_YEARS_MS +
				q11Years * ELEVEN_ISO_YEARS_MS +
				q6Years * SIX_ISO_YEARS_MS +
				q1Year * SHORT_ISO_YEAR_MS,
			isLong: (isFirstSixYearPeriod && q1Year == 5) || (!isFirstSixYearPeriod && q1Year == 4)
		};
	};

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
		const [q28Years, r28Years] = MNumber.quotientAndRemainder(28)(r400Years - q100Years * 96 + 1);
		const [q11Years, r11Years] = MNumber.quotientAndRemainder(11)(r28Years - 11);

		return {
			year: isoYear,
			startTimestamp:
				ISO_YEAR_START_2010_MS +
				q400Years * FOUR_HUNDRED_ISO_YEARS_MS +
				q100Years * NINETY_SIX_ISO_YEARS_MS +
				q28Years * TWENTY_EIGHT_ISO_YEARS_MS +
				q11Years * ELEVEN_ISO_YEARS_MS +
				r11Years * SHORT_ISO_YEAR_MS +
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
	export const getMsDuration = (self: Type): number =>
		self.isLong ? LONG_ISO_YEAR_MS : SHORT_ISO_YEAR_MS;

	/**
	 * Returns the duration of the year described by `self` in milliseconds
	 *
	 * @category Destructors
	 */
	export const getLastIsoWeekIndex = (self: Type): number => (self.isLong ? 52 : 51);
}
