/** @since 0.0.6 */
import { MBadArgumentError, MFunction, MNumber } from '@parischap/effect-lib';
import { Array, Either, Function, Number, Option, Struct, pipe } from 'effect';
import * as Errors from './Errors.js';

const moduleTag = '@parischap/date/Date/';

interface MonthDescriptor {
	readonly nbDaysInMonth: number;
	readonly monthStartMs: number;
}

interface Months extends ReadonlyArray<MonthDescriptor> {}

const MAX_FULL_YEAR_OFFSET = 273_789;
const MAX_FULL_YEAR = 1970 + MAX_FULL_YEAR_OFFSET;
const MIN_FULL_YEAR = 1970 - MAX_FULL_YEAR_OFFSET - 1;
const MAX_TIMESTAMP = 8_639_977_881_599_999;
const MIN_TIMESTAMP = -MAX_TIMESTAMP - 1;

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const NORMAL_YEAR_MS = 365 * DAY_MS;
//const LEAP_YEAR_MS = NORMAL_YEAR_MS + DAY_MS;
//const NORMAL_ISO_YEAR_MS = NORMAL_YEAR_MS - DAY_MS;
//const LONG_ISO_YEAR_MS = NORMAL_ISO_YEAR_MS + WEEK_MS;
const BISEXT_YEAR_MS = NORMAL_YEAR_MS + DAY_MS;
const FOUR_YEARS_MS = BISEXT_YEAR_MS + 3 * NORMAL_YEAR_MS;
const HUNDRED_YEARS_MS = 25 * FOUR_YEARS_MS - DAY_MS;
const FOUR_HUNDRED_YEARS_MS = 4 * HUNDRED_YEARS_MS + DAY_MS;
const YEAR_START_2001_MS = 978_307_200_000;
const normalYearMonths: Months = [
	{ nbDaysInMonth: 31, monthStartMs: 0 },
	{ nbDaysInMonth: 28, monthStartMs: 2678400000 },
	{ nbDaysInMonth: 31, monthStartMs: 5097600000 },
	{ nbDaysInMonth: 30, monthStartMs: 7776000000 },
	{ nbDaysInMonth: 31, monthStartMs: 10368000000 },
	{ nbDaysInMonth: 30, monthStartMs: 13046400000 },
	{ nbDaysInMonth: 31, monthStartMs: 15638400000 },
	{ nbDaysInMonth: 31, monthStartMs: 18316800000 },
	{ nbDaysInMonth: 30, monthStartMs: 20995200000 },
	{ nbDaysInMonth: 31, monthStartMs: 23587200000 },
	{ nbDaysInMonth: 30, monthStartMs: 26265600000 },
	{ nbDaysInMonth: 31, monthStartMs: 28857600000 }
];
const leapYearMonths = [
	{ nbDaysInMonth: 31, monthStartMs: 0 },
	{ nbDaysInMonth: 29, monthStartMs: 2678400000 },
	{ nbDaysInMonth: 31, monthStartMs: 5184000000 },
	{ nbDaysInMonth: 30, monthStartMs: 7862400000 },
	{ nbDaysInMonth: 31, monthStartMs: 10454400000 },
	{ nbDaysInMonth: 30, monthStartMs: 13132800000 },
	{ nbDaysInMonth: 31, monthStartMs: 15724800000 },
	{ nbDaysInMonth: 31, monthStartMs: 18403200000 },
	{ nbDaysInMonth: 30, monthStartMs: 21081600000 },
	{ nbDaysInMonth: 31, monthStartMs: 23673600000 },
	{ nbDaysInMonth: 30, monthStartMs: 26352000000 },
	{ nbDaysInMonth: 31, monthStartMs: 28944000000 }
];

/** @category Models */
export interface YearDescriptor {
	// expressed in given timezone, range: MIN_FULL_YEAR..MAX_FULL_YEAR
	readonly year: number;
	// true if `year` expressed in given timezone is a leap year
	readonly isLeapYear: boolean;
	// time in ms between 1/1/1970 00:00:00:000+z:00 and the first day of year `year` at 00:00:00:000+z:00
	readonly startTimestamp: number;
}

/** @category Models */
export interface MonthAndMonthDayData {
	// expressed in given timezone, range:1..12
	readonly month: number;
	// expressed in given timezone, range:1..31
	readonly monthDay: number;
}

/** @category Models */
export interface IsoWeekAndWeekDayData {
	// expressed in given timezone, range:1..53
	readonly isoWeek: number;
	// expressed in given timezone, range:1..7, 1 is monday, 7 is sunday
	readonly weekDay: number;
}

/** @category Models */
export interface Hour12AndMeridiem {
	// expressed in given timezone, range:0..11
	readonly hour12: number;
	// expressed in given timezone, meridiem offset in hours (0 for 'AM', 12 for 'PM')
	readonly meridiem: 0 | 12;
}

/** @category Models */
export interface Type {
	// milliseconds since 1/1/1970 at 00:00:00:000+00:00
	readonly timestamp: Option.Option<number>;
	readonly yearData: Option.Option<YearDescriptor>;
	// expressed in given timezone, range:1..366
	readonly ordinalDay: Option.Option<number>;
	readonly monthAndMonthDayData: Option.Option<MonthAndMonthDayData>;
	readonly isoWeekAndWeekDayData: Option.Option<IsoWeekAndWeekDayData>;
	// expressed in given timezone, range:0..23
	readonly hour24: Option.Option<number>;
	readonly hour12AndMeridiem: Option.Option<Hour12AndMeridiem>;
	// expressed in given timezone, range:0..59
	readonly minute: Option.Option<number>;
	// expressed in given timezone, range:0..59
	readonly second: Option.Option<number>;
	// expressed in given timezone, range:0..999
	readonly millisecond: Option.Option<number>;
	// range: -12..14 in hours
	readonly timeZoneOffset: Option.Option<number>;
	// time in milliseconds between 1/1/1970 00:00:00:000+z:00 and the day expressed by this date at 00:00:00:000+z:00
	readonly dayMs: Option.Option<number>;
	// millisecond equivalent of the hours expressed by this date in the current timezone
	readonly hourMs: Option.Option<number>;
	// millisecond equivalent of the minutes expressed by this date in the current timezone
	readonly minuteMs: Option.Option<number>;
	/// millisecond equivalent of the seconds expressed by this date in the current timezone
	readonly secondMs: Option.Option<number>;
	// time in ms between 1/1/1970 00:00:00:000+00:00 and 1/1/1970 00:00:00:000+z:00, or timestamp of 1/1/1970 00:00:00:000 in the given timezone (e.g -HOUR_MS for timezone +1:00)
	readonly timeZoneOffsetMs: Option.Option<number>;
}

/** Returns the number of days in a year */
const _getNbDaysInYear = (isLeapYear: boolean): number => (isLeapYear ? 366 : 365);

/**
 * Calculates the UTC week day of a timestamp. Calculation is based on the fact that 4/1/1970 was a
 * UTC sunday.
 */
const _getWeekDayFromTimestamp = (timestamp: number): number => {
	const weekDay0 = MNumber.intModulo(7)(Math.floor(timestamp / DAY_MS) - 3);
	return weekDay0 === 0 ? 7 : weekDay0;
};

/**
 * Offset in ms between the 1st day of the year at 00:00:00:000 and the first day of the first iso
 * week of the year at 00:00:00:000. No input parameters check!
 */
const _unsafeGetFirstIsoWeekMs = (firstDayOfYearWeekDay: number): number =>
	(firstDayOfYearWeekDay <= 4 ? 1 - firstDayOfYearWeekDay : 8 - firstDayOfYearWeekDay) * DAY_MS;

/** Determines if an iso year is long (53 weeks) or short (52 weeks). No input parameters check! */
const _unsafeIsLongIsoYear = (firstDayOfYearWeekDay: number, isLeapYear: boolean): boolean =>
	firstDayOfYearWeekDay === 4 || (firstDayOfYearWeekDay === 3 && isLeapYear);

/** Calculates the number of iso weeks in a year. No input parameters check! */
const _unsafeGetNbIsoWeeksInYear = (firstDayOfYearWeekDay: number, isLeapYear: boolean): number =>
	_unsafeIsLongIsoYear(firstDayOfYearWeekDay, isLeapYear) ? 53 : 52;

/** Calculates yearData from a year. No input parameters check */
const _unsafeCalcYearData = (year: number): YearDescriptor => {
	// 2001 is the start of a 400-year period whose last year is bissextile
	const offset2001 = year - 2001;
	const q400Years = Math.floor(offset2001 / 400);
	const offset400Years = q400Years * 400;
	const r400Years = offset2001 - offset400Years;
	const q100Years = Math.floor(r400Years / 100);
	const offset100Years = q100Years * 100;
	const r100Years = r400Years - offset100Years;
	const q4Years = Math.floor(r100Years / 4);
	const offset4Years = q4Years * 4;
	const r4Years = r100Years - offset4Years;

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

/** Calculates yearData from a year */
const _calcYearData = (year: number): Either.Either<YearDescriptor, MBadArgumentError.OutOfRange> =>
	pipe(
		year,
		MBadArgumentError.OutOfRange.check({
			min: MIN_FULL_YEAR,
			max: MAX_FULL_YEAR,
			id: 'year',
			moduleTag,
			functionName: 'setYear'
		}),
		Either.map(_unsafeCalcYearData)
	);

/**
 * Returns the local time zone offset in hours of the machine on which this code runs. Result is
 * cached. So result will become wrong if you change the local timeZoneOffset
 *
 * @category Utils
 */
export const localTimeZoneOffset: () => number = MFunction.once(
	() => new Date(0).getTimezoneOffset() / 60
);

/**
 * Creates an empty Date
 *
 * @category Constructors
 */
export const empty = (): Type => ({
	timestamp: Option.none(),
	yearData: Option.none(),
	ordinalDay: Option.none(),
	monthAndMonthDayData: Option.none(),
	isoWeekAndWeekDayData: Option.none(),
	hour24: Option.none(),
	hour12AndMeridiem: Option.none(),
	minute: Option.none(),
	second: Option.none(),
	millisecond: Option.none(),
	timeZoneOffset: Option.none(),
	dayMs: Option.none(),
	hourMs: Option.none(),
	minuteMs: Option.none(),
	secondMs: Option.none(),
	timeZoneOffsetMs: Option.none()
});

/**
 * Creates a Date with the specified parameters. Only the year is mandatory. All other values
 * default to their lowest possible value except the timeZoneOffset which defaults to your local
 * timeZoneOffset. No input parameters check
 *
 * @category Constructors
 */
export const unsafeMake = (
	year: number,
	month = 1,
	monthDay = 1,
	hour24 = 0,
	minute = 0,
	second = 0,
	millisecond = 0,
	timeZoneOffset = localTimeZoneOffset()
): Type =>
	pipe(
		empty(),
		unsafeSetYearMonthAndMonthDay(year, month, monthDay),
		unsafeSetHour24(hour24),
		unsafeSetMinute(minute),
		unsafeSetSecond(second),
		unsafeSetMillisecond(millisecond),
		setTimeZoneOffset(timeZoneOffset)
	);

/**
 * Creates a Date with the specified parameters. Only the year is mandatory. All other values
 * default to their lowest possible value except the timeZoneOffset which defaults to your local
 * timeZoneOffset.
 *
 * @category Constructors
 */
export const make = (
	year: number,
	month = 1,
	monthDay = 1,
	hour24 = 0,
	minute = 0,
	second = 0,
	millisecond = 0,
	timeZoneOffset = localTimeZoneOffset()
): Either.Either<Type, MBadArgumentError.OutOfRange> =>
	pipe(
		empty(),
		setYearMonthAndMonthDay(year, month, monthDay),
		Either.flatMap(setHour24(hour24)),
		Either.flatMap(setMinute(minute)),
		Either.flatMap(setSecond(second)),
		Either.flatMap(setMillisecond(millisecond)),
		Either.map(setTimeZoneOffset(timeZoneOffset))
	);

/**
 * Creates a Date from a timestamp. No input parameters check
 *
 * @category Constructors
 */
export const unsafeMakeFromTimestamp = (timestamp: number, timeZoneOffset: number): Type => {
	const timeZoneOffsetMs = -timeZoneOffset * HOUR_MS;
	// 2001 is the start of a 400-year period whose last year is bissextile
	const offset2001 = timestamp - YEAR_START_2001_MS - timeZoneOffsetMs;

	const q400Years = Math.floor(offset2001 / FOUR_HUNDRED_YEARS_MS);
	const offset400Years = q400Years * FOUR_HUNDRED_YEARS_MS;
	const r400Years = offset2001 - offset400Years;

	const q100Years = Math.floor(r400Years / HUNDRED_YEARS_MS);
	const offset100Years = q100Years * HUNDRED_YEARS_MS;
	const r100Years = r400Years - offset100Years;

	const q4Years = Math.floor(r100Years / FOUR_YEARS_MS);
	const offset4Years = q4Years * FOUR_YEARS_MS;
	const r4Years = r100Years - offset4Years;

	const q1Year = Math.floor(r4Years / NORMAL_YEAR_MS);
	const offset1Year = q1Year * NORMAL_YEAR_MS;
	const r1Year = r4Years - offset1Year;

	const year = 2001 + 400 * q400Years + 100 * q100Years + 4 * q4Years + q1Year;
	const isLeapYear = q1Year === 3 && (q4Years !== 24 || q100Years === 3);
	const startTimestamp =
		YEAR_START_2001_MS + offset100Years + offset4Years + offset1Year + offset400Years;

	const ordinalDay0 = Math.floor(r1Year / DAY_MS);
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
	const millisecond = rMinute - secondMs;

	return {
		...empty(),
		timestamp: Option.some(timestamp),
		yearData: Option.some({
			year,
			isLeapYear,
			startTimestamp: startTimestamp
		}),
		ordinalDay: Option.some(ordinalDay0 + 1),
		hour24: Option.some(hour24),
		minute: Option.some(minute),
		second: Option.some(second),
		millisecond: Option.some(millisecond),
		timeZoneOffset: Option.some(timeZoneOffset),
		dayMs: Option.some(dayMs),
		hourMs: Option.some(hourMs),
		minuteMs: Option.some(minuteMs),
		secondMs: Option.some(secondMs),
		timeZoneOffsetMs: Option.some(timeZoneOffsetMs)
	};
};

/**
 * Creates a Date from a timestamp.
 *
 * @category Constructors
 */
export const makeFromTimestamp = (
	timestamp: number,
	timeZoneOffset: number
): Either.Either<Type, MBadArgumentError.OutOfRange> =>
	Either.gen(function* () {
		const checkedTimestamp = yield* pipe(
			timestamp,
			MBadArgumentError.OutOfRange.check({
				min: MIN_TIMESTAMP,
				max: MAX_TIMESTAMP,
				id: 'timestamp',
				moduleTag,
				functionName: 'makeFromTimestamp'
			})
		);
		const checkedTimeZoneOffset = yield* pipe(
			timeZoneOffset,
			MBadArgumentError.OutOfRange.check({
				min: -12,
				max: 14,
				id: 'timeZoneOffset',
				moduleTag,
				functionName: 'makeFromTimestamp'
			})
		);
		return unsafeMakeFromTimestamp(checkedTimestamp, checkedTimeZoneOffset);
	});

/**
 * Returns a copy of self with ordinalDay set to the passed value. No input parameters check
 *
 * @category Setters
 */
export const unsafeSetYearAndOrdinalDay =
	(year: number, ordinalDay: number) =>
	(self: Type): Type => {
		const yearData = _unsafeCalcYearData(year);
		return {
			...self,
			timestamp: Option.none(),
			yearData: Option.some(yearData),
			ordinalDay: Option.some(ordinalDay),
			monthAndMonthDayData: Option.none(),
			isoWeekAndWeekDayData: Option.none(),
			dayMs: Option.some(yearData.startTimestamp + (ordinalDay - 1) * DAY_MS)
		};
	};

/**
 * Returns a copy of self with ordinalDay set to the passed value.
 *
 * @category Setters
 */
export const setYearAndOrdinalDay =
	(year: number, ordinalDay: number) =>
	(self: Type): Either.Either<Type, MBadArgumentError.OutOfRange> =>
		Either.gen(function* () {
			const checkedYearData = yield* pipe(_calcYearData(year));
			const checkedOrdinalDay = yield* pipe(
				ordinalDay,
				MBadArgumentError.OutOfRange.check({
					min: 1,
					max: _getNbDaysInYear(checkedYearData.isLeapYear),
					id: 'ordinalDay',
					moduleTag,
					functionName: 'setYearAndOrdinalDay'
				})
			);
			return {
				...self,
				timestamp: Option.none(),
				yearData: Option.some(checkedYearData),
				ordinalDay: Option.some(checkedOrdinalDay),
				monthAndMonthDayData: Option.none(),
				isoWeekAndWeekDayData: Option.none(),
				dayMs: Option.some(checkedYearData.startTimestamp + (checkedOrdinalDay - 1) * DAY_MS)
			};
		});

/**
 * Returns a copy of self with year, month and monthDay set to the passed values. No input
 * parameters check
 *
 * @category Setters
 */
export const unsafeSetYearMonthAndMonthDay =
	(year: number, month: number, monthDay: number) =>
	(self: Type): Type => {
		const yearData = _unsafeCalcYearData(year);
		const monthDescriptor = (yearData.isLeapYear ? leapYearMonths : normalYearMonths)[
			month - 1
		] as MonthDescriptor;
		return {
			...self,
			timestamp: Option.none(),
			yearData: Option.some(yearData),
			ordinalDay: Option.none(),
			monthAndMonthDayData: Option.some({
				month,
				monthDay
			}),
			isoWeekAndWeekDayData: Option.none(),
			dayMs: Option.some(
				yearData.startTimestamp + monthDescriptor.monthStartMs + (monthDay - 1) * DAY_MS
			)
		};
	};

/**
 * Returns a copy of self with year, month and monthDay set to the passed values.
 *
 * @category Setters
 */
export const setYearMonthAndMonthDay =
	(year: number, month: number, monthDay: number) =>
	(self: Type): Either.Either<Type, MBadArgumentError.OutOfRange> =>
		Either.gen(function* () {
			const checkedYearData = yield* pipe(_calcYearData(year));
			const checkedMonth = yield* pipe(
				month,
				MBadArgumentError.OutOfRange.check({
					min: 1,
					max: 12,
					id: 'month',
					moduleTag,
					functionName: 'setYearMonthAndMonthDay'
				})
			);
			const checkedMonthDescriptor = (
				checkedYearData.isLeapYear ? leapYearMonths : normalYearMonths)[
				checkedMonth - 1
			] as MonthDescriptor;
			const checkedMonthDay = yield* pipe(
				monthDay,
				MBadArgumentError.OutOfRange.check({
					min: 1,
					max: checkedMonthDescriptor.nbDaysInMonth,
					id: 'monthDay',
					moduleTag,
					functionName: 'setYearMonthAndMonthDay'
				})
			);
			return {
				...self,
				timestamp: Option.none(),
				yearData: Option.some(checkedYearData),
				ordinalDay: Option.none(),
				monthAndMonthDayData: Option.some({
					month: checkedMonth,
					monthDay: checkedMonthDay
				}),
				isoWeekAndWeekDayData: Option.none(),
				dayMs: Option.some(
					checkedYearData.startTimestamp +
						checkedMonthDescriptor.monthStartMs +
						(checkedMonthDay - 1) * DAY_MS
				)
			};
		});

/**
 * Returns a copy of self with year, isoWeek and weekDay set to the passed values. No input
 * parameters check
 *
 * @category Setters
 */
export const unsafeSetYearIsoWeekAndWeekDay =
	(year: number, isoWeek: number, weekDay: number) =>
	(self: Type): Type => {
		const yearData = _unsafeCalcYearData(year);

		return {
			...self,
			timestamp: Option.none(),
			yearData: Option.some(yearData),
			ordinalDay: Option.none(),
			monthAndMonthDayData: Option.none(),
			isoWeekAndWeekDayData: Option.some({ isoWeek, weekDay }),
			dayMs: Option.some(
				yearData.startTimestamp +
					_unsafeGetFirstIsoWeekMs(_getWeekDayFromTimestamp(yearData.startTimestamp)) +
					(isoWeek - 1) * WEEK_MS +
					(weekDay - 1) * DAY_MS
			)
		};
	};

/**
 * Returns a copy of self with year, isoWeek and weekDay set to the passed values.
 *
 * @category Setters
 */
export const setYearIsoWeekAndWeekDay =
	(year: number, isoWeek: number, weekDay: number) =>
	(self: Type): Either.Either<Type, MBadArgumentError.OutOfRange> =>
		Either.gen(function* () {
			const checkedYearData = yield* pipe(_calcYearData(year));
			const firstDayOfYearWeekDay = _getWeekDayFromTimestamp(checkedYearData.startTimestamp);
			const checkedIsoWeek = yield* pipe(
				isoWeek,
				MBadArgumentError.OutOfRange.check({
					min: 1,
					max: _unsafeGetNbIsoWeeksInYear(firstDayOfYearWeekDay, checkedYearData.isLeapYear),
					id: 'isoWeek',
					moduleTag,
					functionName: 'setYearIsoWeekAndWeekDay'
				})
			);
			const checkedWeekDay = yield* pipe(
				weekDay,
				MBadArgumentError.OutOfRange.check({
					min: 1,
					max: 7,
					id: 'weekDay',
					moduleTag,
					functionName: 'setYearIsoWeekAndWeekDay'
				})
			);
			return {
				...self,
				timestamp: Option.none(),
				yearData: Option.some(checkedYearData),
				ordinalDay: Option.none(),
				monthAndMonthDayData: Option.none(),
				isoWeekAndWeekDayData: Option.some({
					isoWeek: checkedIsoWeek,
					weekDay: checkedWeekDay
				}),
				dayMs: Option.some(
					checkedYearData.startTimestamp +
						_unsafeGetFirstIsoWeekMs(firstDayOfYearWeekDay) +
						(checkedIsoWeek - 1) * WEEK_MS +
						(checkedWeekDay - 1) * DAY_MS
				)
			};
		});

/**
 * Returns a copy of self with hour24 set to the passed value. No input parameters check
 *
 * @category Setters
 */
export const unsafeSetHour24 =
	(hour24: number) =>
	(self: Type): Type => ({
		...self,
		timestamp: Option.none(),
		hour24: Option.some(hour24),
		hour12AndMeridiem: Option.none(),
		hourMs: Option.some(hour24 * HOUR_MS)
	});

/**
 * Returns a copy of self with hour24 set to the passed value.
 *
 * @category Setters
 */
export const setHour24 =
	(hour24: number) =>
	(self: Type): Either.Either<Type, MBadArgumentError.OutOfRange> =>
		pipe(
			hour24,
			MBadArgumentError.OutOfRange.check({
				min: 0,
				max: 23,
				id: 'hour24',
				moduleTag,
				functionName: 'setHour24'
			}),
			Either.map(Function.flip(unsafeSetHour24)(self))
		);

/**
 * Returns a copy of self with hour12 and meridiem set to the passed values. No input parameters
 * check
 *
 * @category Setters
 */
export const unsafeSetHour12AndMeridiem =
	(hour12: number, meridiem: 0 | 12) =>
	(self: Type): Type => ({
		...self,
		timestamp: Option.none(),
		hour24: Option.some(hour12 + meridiem),
		hour12AndMeridiem: Option.some({ hour12, meridiem }),
		hourMs: Option.some((hour12 + meridiem) * HOUR_MS)
	});

/**
 * Returns a copy of self with hour12 and meridiem set to the passed values.
 *
 * @category Setters
 */
export const setHour12AndMeridiem =
	(hour12: number, meridiem: 0 | 12) =>
	(self: Type): Either.Either<Type, MBadArgumentError.OutOfRange> =>
		pipe(
			hour12,
			MBadArgumentError.OutOfRange.check({
				min: 0,
				max: 11,
				id: 'hour12',
				moduleTag,
				functionName: 'setHour12AndMeridiem'
			}),
			Either.map((checkedHour12) => pipe(self, unsafeSetHour12AndMeridiem(checkedHour12, meridiem)))
		);

/**
 * Returns a copy of self with minute set to the passed value. No input parameters check
 *
 * @category Setters
 */
export const unsafeSetMinute =
	(minute: number) =>
	(self: Type): Type => ({
		...self,
		timestamp: Option.none(),
		minute: Option.some(minute),
		minuteMs: Option.some(minute * MINUTE_MS)
	});

/**
 * Returns a copy of self with minute set to the passed value.
 *
 * @category Setters
 */
export const setMinute =
	(minute: number) =>
	(self: Type): Either.Either<Type, MBadArgumentError.OutOfRange> =>
		pipe(
			minute,
			MBadArgumentError.OutOfRange.check({
				min: 0,
				max: 59,
				id: 'minute',
				moduleTag,
				functionName: 'setMinute'
			}),
			Either.map(Function.flip(unsafeSetMinute)(self))
		);

/**
 * Returns a copy of self with second set to the passed value. No input parameters check
 *
 * @category Setters
 */
export const unsafeSetSecond =
	(second: number) =>
	(self: Type): Type => ({
		...self,
		timestamp: Option.none(),
		second: Option.some(second),
		secondMs: Option.some(second * SECOND_MS)
	});

/**
 * Returns a copy of self with second set to the passed value.
 *
 * @category Setters
 */
export const setSecond =
	(second: number) =>
	(self: Type): Either.Either<Type, MBadArgumentError.OutOfRange> =>
		pipe(
			second,
			MBadArgumentError.OutOfRange.check({
				min: 0,
				max: 59,
				id: 'second',
				moduleTag,
				functionName: 'setSecond'
			}),
			Either.map(Function.flip(unsafeSetSecond)(self))
		);

/**
 * Returns a copy of self with millisecond set to the passed value. No input parameters check
 *
 * @category Setters
 */
export const unsafeSetMillisecond =
	(millisecond: number) =>
	(self: Type): Type => ({
		...self,
		timestamp: Option.none(),
		millisecond: Option.some(millisecond)
	});

/**
 * Returns a copy of self with millisecond set to the passed value.
 *
 * @category Setters
 */
export const setMillisecond =
	(millisecond: number) =>
	(self: Type): Either.Either<Type, MBadArgumentError.OutOfRange> =>
		pipe(
			millisecond,
			MBadArgumentError.OutOfRange.check({
				min: 0,
				max: 999,
				id: 'millisecond',
				moduleTag,
				functionName: 'setMillisecond'
			}),
			Either.map(Function.flip(unsafeSetMillisecond)(self))
		);

/**
 * Returns a copy of self with timeZoneOffset set to the passed value. Timestamp is modified
 * accordingly
 *
 * @category Setters
 */
export const setTimeZoneOffset =
	(timeZoneOffset: number) =>
	(self: Type): Type => ({
		...self,
		timestamp: Option.none(),
		timeZoneOffset: Option.some(timeZoneOffset),
		timeZoneOffsetMs: Option.some(-timeZoneOffset * HOUR_MS)
	});

/**
 * Returns a copy of self with hour, minute, second, millisecond and timeZoneOffset set to 0 for
 * those that have not been set yet
 *
 * - @category setters
 */
export const setUnsetToZero = (self: Type): Type => {
	return {
		...self,
		hour24: pipe(
			self.hourMs,
			Option.flatMap(() => self.hour24),
			Option.orElse(() => Option.some(0))
		),
		hour12AndMeridiem: pipe(
			self.hourMs,
			Option.flatMap(() => self.hour12AndMeridiem),
			Option.orElse(() => Option.some({ hour12: 0, meridiem: 0 as const }))
		),
		minute: pipe(
			self.minuteMs,
			Option.flatMap(() => self.minute),
			Option.orElse(() => Option.some(0))
		),
		second: pipe(
			self.secondMs,
			Option.flatMap(() => self.second),
			Option.orElse(() => Option.some(0))
		),
		millisecond: Option.orElse(self.millisecond, () => Option.some(0)),
		timeZoneOffset: pipe(
			self.timeZoneOffsetMs,
			Option.flatMap(() => self.timeZoneOffset),
			Option.orElse(() => Option.some(0))
		),
		dayMs: Option.none(),
		hourMs: pipe(
			self.hourMs,
			Option.flatMap(() => self.hourMs),
			Option.orElse(() => Option.some(0))
		),
		minuteMs: pipe(
			self.minuteMs,
			Option.flatMap(() => self.minuteMs),
			Option.orElse(() => Option.some(0))
		),
		secondMs: pipe(
			self.secondMs,
			Option.flatMap(() => self.secondMs),
			Option.orElse(() => Option.some(0))
		),
		timeZoneOffsetMs: pipe(
			self.timeZoneOffsetMs,
			Option.flatMap(() => self.timeZoneOffsetMs),
			Option.orElse(() => Option.some(0))
		)
	};
};

/**
 * Returns the timestamp of the Date if enough enformation was provided to calculate it
 *
 * @category Getters
 */
export const getTimeStamp = (self: Type): Either.Either<number, Errors.MissingData> =>
	pipe(
		self.timestamp,
		Option.orElse(() =>
			pipe(
				Array.make(
					self.dayMs,
					self.hourMs,
					self.minuteMs,
					self.secondMs,
					self.millisecond,
					self.timeZoneOffsetMs
				),
				Option.all,
				Option.map(Number.sumAll)
			)
		),
		Either.fromOption(() => new Errors.MissingData())
	);

/**
 * Returns the year of the Date if enough enformation was provided to calculate it
 *
 * @category Getters
 */
export const getYear = (self: Type): Either.Either<number, Errors.MissingData> =>
	pipe(
		self.yearData,
		Option.map(Struct.get('year')),
		Either.fromOption(() => new Errors.MissingData())
	);

/**
 * Returns the ordinalDay of the Date if enough enformation was provided to calculate it
 *
 * @category Getters
 */
export const getOrdinalDay = (self: Type): Either.Either<number, Errors.MissingData> =>
	pipe(
		self.ordinalDay,
		// ordinalDay may have been unset by setYearMonthAndMonthDay, unsafeSetYearMonthAndMonthDay, setYearIsoWeekAndWeekDay, unsafeSetYearIsoWeekAndWeekDay
		Option.orElse(() => Option.map(self.dayMs, Number.unsafeDivide(DAY_MS))),
		Either.fromOption(() => new Errors.MissingData())
	);

/**
 * Returns the month and monthDay of the Date if enough enformation was provided to calculate them.
 * If you are only interested in the month or the monthDay, use getMonth or getMonthDay instead.
 *
 * @category Getters
 */
export const getMonthAndMonthDay = (
	self: Type
): Either.Either<MonthAndMonthDayData, Errors.MissingData> =>
	pipe(
		self.monthAndMonthDayData,
		Option.orElse(() =>
			pipe(
				Option.product(self.dayMs, self.yearData),
				Option.map(([dayMs, { startTimestamp, isLeapYear }]) => {
					const offset = dayMs - startTimestamp;
					// Raw coding for performance sake
					const months = isLeapYear ? leapYearMonths : normalYearMonths;
					let month0 = 11;
					let monthStartMs;
					let monthDescriptor;

					for (; month0 >= 0; month0--) {
						/* eslint-disable-next-line functional/no-expression-statements */
						monthDescriptor = months[month0] as MonthDescriptor;
						/* eslint-disable-next-line functional/no-expression-statements */
						monthStartMs = monthDescriptor.monthStartMs;
						if (monthStartMs <= offset) break;
					}
					// @ts-expect-error monthStartMs cannot be undefined
					return {
						month: month0 + 1,
						monthDay: Math.floor((offset - monthStartMs) / DAY_MS) + 1
					};
				})
			)
		),
		Either.fromOption(() => new Errors.MissingData())
	);

/**
 * Returns the month of the Date if enough enformation was provided to calculate it. If you are also
 * interested in the monthDay, use getMonthAndMonthDay instead.
 *
 * @category Getters
 */
export const getMonth = (self: Type): Either.Either<number, Errors.MissingData> =>
	pipe(self, getMonthAndMonthDay, Either.map(Struct.get('month')));

/**
 * Returns the monthDay of the Date if enough enformation was provided to calculate it. If you are
 * also interested in the month, use getMonthAndMonthDay instead.
 *
 * @category Getters
 */
export const getMonthDay = (self: Type): Either.Either<number, Errors.MissingData> =>
	pipe(self, getMonthAndMonthDay, Either.map(Struct.get('monthDay')));

/**
 * Returns the isoWeek and weekDay of the Date if enough enformation was provided to calculate them.
 * If you are only interested in the isoWeek or the weekDay, use getIsoWeek or getWeekDay instead.
 *
 * @category Getters
 */
export const getIsoWeekAndWeekDay = (
	self: Type
): Either.Either<IsoWeekAndWeekDayData, Errors.MissingData> =>
	pipe(
		self.isoWeekAndWeekDayData,
		Option.orElse(() =>
			pipe(
				Option.product(self.dayMs, self.yearData),
				Option.map(([dayMs, { startTimestamp }]) => {
					const offset =
						dayMs -
						startTimestamp -
						_unsafeGetFirstIsoWeekMs(_getWeekDayFromTimestamp(startTimestamp));
					const isoWeek0 = Math.floor(offset / WEEK_MS);
					return {
						isoWeek: isoWeek0 + 1,
						weekDay: Math.floor((offset - isoWeek0 * WEEK_MS) / DAY_MS) + 1
					};
				})
			)
		),
		Either.fromOption(() => new Errors.MissingData())
	);

/**
 * Returns the isoWeek of the Date if enough enformation was provided to calculate it. If you are
 * also interested in the weekDay, use getIsoWeekAndWeekDay instead.
 *
 * @category Getters
 */
export const getIsoWeek = (self: Type): Either.Either<number, Errors.MissingData> =>
	pipe(self, getIsoWeekAndWeekDay, Either.map(Struct.get('isoWeek')));

/**
 * Returns the weekDay of the Date if enough enformation was provided to calculate it. If you are
 * also interested in the isoWeek, use getIsoWeekAndWeekDay instead.
 *
 * @category Getters
 */
export const getWeekDay = (self: Type): Either.Either<number, Errors.MissingData> =>
	pipe(self, getIsoWeekAndWeekDay, Either.map(Struct.get('weekDay')));

/**
 * Returns the hour24 of the Date if enough enformation was provided to calculate it.
 *
 * @category Getters
 */
export const getHour24 = (self: Type): Either.Either<number, Errors.MissingData> =>
	pipe(
		self.hour24,
		Either.fromOption(() => new Errors.MissingData())
	);

/**
 * Returns the hour12 and meridiem of the Date if enough enformation was provided to calculate them.
 * If you are only interested in the hour12 or the meridiem, use getHour12 or getMeridiem instead.
 *
 * @category Getters
 */
export const getHour12AndMeridiem = (
	self: Type
): Either.Either<Hour12AndMeridiem, Errors.MissingData> =>
	pipe(
		self.hour12AndMeridiem,
		Option.orElse(() =>
			Option.map(self.hourMs, (hourMs) => {
				const hour24 = hourMs / HOUR_MS;
				const meridiem = hour24 >= 12 ? (12 as const) : (0 as const);
				return { hour12: hour24 - meridiem, meridiem };
			})
		),
		Either.fromOption(() => new Errors.MissingData())
	);

/**
 * Returns the hour12 of the Date if enough enformation was provided to calculate it. If you are
 * also interested in the meridiem, use getHour12AndMeridiem instead.
 *
 * @category Getters
 */
export const getHour12 = (self: Type): Either.Either<number, Errors.MissingData> =>
	pipe(self, getHour12AndMeridiem, Either.map(Struct.get('hour12')));

/**
 * Returns the meridiem of the Date if enough enformation was provided to calculate it. If you are
 * also interested in the hour12, use getHour12AndMeridiem instead.
 *
 * @category Getters
 */
export const getMeridiem = (self: Type): Either.Either<number, Errors.MissingData> =>
	pipe(self, getHour12AndMeridiem, Either.map(Struct.get('meridiem')));

/**
 * Returns the minute of the Date if enough enformation was provided to calculate it.
 *
 * @category Getters
 */
export const getMinute = (self: Type): Either.Either<number, Errors.MissingData> =>
	pipe(
		self.minute,
		Either.fromOption(() => new Errors.MissingData())
	);

/**
 * Returns the second of the Date if enough enformation was provided to calculate it.
 *
 * @category Getters
 */
export const getSecond = (self: Type): Either.Either<number, Errors.MissingData> =>
	pipe(
		self.second,
		Either.fromOption(() => new Errors.MissingData())
	);

/**
 * Returns the millisecond of the Date if enough enformation was provided to calculate it.
 *
 * @category Getters
 */
export const getMillisecond = (self: Type): Either.Either<number, Errors.MissingData> =>
	pipe(
		self.millisecond,
		Either.fromOption(() => new Errors.MissingData())
	);

/**
 * Returns the timeZoneOffset of the Date if it was provided.
 *
 * @category Getters
 */
export const getTimeZoneOffset = (self: Type): Either.Either<number, Errors.MissingData> =>
	pipe(
		self.timeZoneOffset,
		Either.fromOption(() => new Errors.MissingData())
	);

/**
 * Adds an offset in ms to the Date.
 *
 * @category Utils
 */
export const addMillisecondOffset =
	(offset: number) =>
	(self: Type): Either.Either<Type, Errors.MissingData | MBadArgumentError.OutOfRange> =>
		Either.gen(function* () {
			const timestamp = yield* pipe(self, getTimeStamp);
			const timeZoneOffset = yield* pipe(self, getTimeZoneOffset);
			return yield* pipe(makeFromTimestamp(timestamp + offset, timeZoneOffset));
		});

/**
 * Adds an offset in seconds to the Date.
 *
 * @category Utils
 */
export const addSecondOffset =
	(offset: number) =>
	(self: Type): Either.Either<Type, Errors.MissingData | MBadArgumentError.OutOfRange> =>
		pipe(self, addMillisecondOffset(offset * SECOND_MS));

/**
 * Adds an offset in minutes to the Date.
 *
 * @category Utils
 */
export const addMinuteOffset =
	(offset: number) =>
	(self: Type): Either.Either<Type, Errors.MissingData | MBadArgumentError.OutOfRange> =>
		pipe(self, addMillisecondOffset(offset * MINUTE_MS));

/**
 * Adds an offset in hours to the Date.
 *
 * @category Utils
 */
export const addHourOffset =
	(offset: number) =>
	(self: Type): Either.Either<Type, Errors.MissingData | MBadArgumentError.OutOfRange> =>
		pipe(self, addMillisecondOffset(offset * HOUR_MS));

/**
 * Adds an offset in days to the Date.
 *
 * @category Utils
 */
export const addDayOffset =
	(offset: number) =>
	(self: Type): Either.Either<Type, Errors.MissingData | MBadArgumentError.OutOfRange> =>
		pipe(self, addMillisecondOffset(offset * DAY_MS));

/**
 * Adds an offset in weeks to the Date.
 *
 * @category Utils
 */
export const addWeekOffset =
	(offset: number) =>
	(self: Type): Either.Either<Type, Errors.MissingData | MBadArgumentError.OutOfRange> =>
		pipe(self, addMillisecondOffset(offset * WEEK_MS));

/**
 * Adds an offset in months to the Date.
 *
 * @category Utils
 */
export const addMonthOffset =
	(offset: number) =>
	(self: Type): Either.Either<Type, Errors.MissingData | MBadArgumentError.OutOfRange> =>
		Either.gen(function* () {
			const year = yield* pipe(self, getYear);
			const { month, monthDay } = yield* pipe(self, getMonthAndMonthDay);
			const targetMonth0 = month - 1 + offset;
			const yearOffset =
				targetMonth0 < 0 ? Math.floor((targetMonth0 + 1) / 12) - 1 : Math.floor(targetMonth0 / 12);
			const monthOffset = targetMonth0 - yearOffset * 12;
			return yield* pipe(
				self,
				setYearMonthAndMonthDay(year + yearOffset, month + monthOffset, monthDay)
			);
		});

/**
 * Adds an offset in years to the Date.
 *
 * @category Utils
 */
export const addYearOffset =
	(offset: number) =>
	(self: Type): Either.Either<Type, Errors.MissingData | MBadArgumentError.OutOfRange> =>
		Either.gen(function* () {
			const year = yield* pipe(self, getYear);
			const { month, monthDay } = yield* pipe(self, getMonthAndMonthDay);
			return yield* pipe(self, setYearMonthAndMonthDay(year + offset, month, monthDay));
		});
