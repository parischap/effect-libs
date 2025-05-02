/**
 * This module implements an apparently immutable DateTime object. The object does keep an internal
 * state. All the functions look pure insofar as they will always yield the same result, whatever
 * the state of the object. But depending on the state, they will yield it more or less quickly.
 *
 * A DateTime object has a `timeZoneOffset` which is difference in hours between 1/1/1970
 * 00:00:00:000+z:00 and 1/1/1970 00:00:00:000+00:00 (e.g 1 for timezone +1:00). All the data in the
 * DateTimeObject is `timeZoneOffset-dependent`, except `timestamp` which is relative to UTC.
 */
import {
	MArray,
	MFunction,
	MInputError,
	MInspectable,
	MMatch,
	MNumber,
	MPipeable,
	MPredicate,
	MStruct,
	MTuple,
	MTypes
} from '@parischap/effect-lib';
import {
	Array,
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
	Tuple,
	flow,
	pipe
} from 'effect';

export const moduleTag = '@parischap/conversions/DateTime/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
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

namespace DaysInMonth {
	export interface Type extends ReadonlyArray<number> {}

	export const normalYear: Type = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	export const leapYear = Array.modify(normalYear, 1, Number.increment);
}

namespace MonthDescriptors {
	export interface Type extends ReadonlyArray<MonthDescriptor.Type> {}

	const fromDaysInMonth: MTypes.OneArgFunction<DaysInMonth.Type, Type> = flow(
		Array.mapAccum(0, (monthStartMs, nbDaysInMonth, monthIndex) =>
			Tuple.make(monthStartMs + nbDaysInMonth * DAY_MS, {
				monthIndex,
				lastDayIndex: nbDaysInMonth - 1,
				monthStartMs
			})
		),
		Tuple.getSecond
	);

	export const normalYear: Type = fromDaysInMonth(DaysInMonth.normalYear);
	export const leapYear: Type = fromDaysInMonth(DaysInMonth.leapYear);
}

namespace MonthDescriptor {
	export interface Type {
		readonly monthIndex: number;
		readonly lastDayIndex: number;
		readonly monthStartMs: number;
	}

	/**
	 * Builds a MonthDescriptor from a YearData
	 *
	 * @category Constructors
	 */
	export const fromYearData = (yearData: YearData.Type): Type =>
		pipe(
			yearData.isLeapYear ? MonthDescriptors.leapYear : MonthDescriptors.normalYear,
			Array.findLast(flow(Struct.get('monthStartMs'), Number.lessThanOrEqualTo(yearData.r1Year))),
			Option.getOrThrow
		);

	/**
	 * Builds a MonthDescriptor from a monthIndex
	 *
	 * @category Constructors
	 */
	export const fromMonthIndex = (isLeapYear: boolean): MTypes.OneArgFunction<number, Type> =>
		MArray.unsafeGetter(isLeapYear ? MonthDescriptors.leapYear : MonthDescriptors.normalYear);
}

/**
 * Namespace for the data relative to the year of a DateTime
 *
 * @category Models
 */
export namespace YearData {
	/**
	 * Type of a DateTime YearData
	 *
	 * @category Models
	 */
	export interface Type {
		/** The year of this DateTime, range: [MIN_FULL_YEAR, MAX_FULL_YEAR] */
		readonly year: number;

		/** True if `year` is a leap year. `false` otherwise */
		readonly isLeapYear: boolean;

		/**
		 * Time in ms between 1/1/1970 00:00:00:000+0:00 and the first day of year `year` at
		 * 00:00:00:000+0:00
		 */
		readonly yearStartMs: number;

		/** Time in ms between this DateTime and the start of the current year */
		readonly r1Year: number;
	}

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
		// r1Year is superior to NORMAL_YEAR_MS on very last day of each 4-year period except the last day of years 2100, 2200 and 2300.
		const r1Year = r4Years - offset1Year;

		return {
			year: 2001 + 400 * q400Years + 100 * q100Years + 4 * q4Years + q1Year,
			isLeapYear: q1Year === 3 && (q4Years !== 24 || q100Years === 3),
			yearStartMs:
				YEAR_START_2001_MS + offset400Years + offset100Years + offset4Years + offset1Year,
			r1Year
		};
	};

	export const fromYearStart = (year: number): Type => {
		const offset2001 = year - 2001;

		const [q400Years, r400Years] = MNumber.quotientAndRemainder(400)(offset2001);
		const [q100Years, r100Years] = MNumber.quotientAndRemainder(100)(r400Years);
		const [q4Years, r4Years] = MNumber.quotientAndRemainder(4)(r100Years);

		const isLeapYear = r4Years === 3 && (r100Years !== 99 || r400Years === 399);
		const yearStartMs =
			YEAR_START_2001_MS +
			q400Years * FOUR_HUNDRED_YEARS_MS +
			q100Years * HUNDRED_YEARS_MS +
			q4Years * FOUR_YEARS_MS +
			r4Years * NORMAL_YEAR_MS;

		return {
			year,
			isLeapYear,
			yearStartMs,
			r1Year: 0
		};
	};
}

const MAX_FULL_YEAR_OFFSET = 285_423;

/**
 * Maximal usable year
 *
 * @category Constants
 */
export const MAX_FULL_YEAR = 1970 + MAX_FULL_YEAR_OFFSET;

/**
 * Minimal usable year
 *
 * @category Constants
 */
export const MIN_FULL_YEAR = 1970 - MAX_FULL_YEAR_OFFSET - 1;

/**
 * Maximal usable timestamp.
 *
 * @category Constants
 */
export const MAX_TIMESTAMP = pipe(
	MAX_FULL_YEAR,
	YearData.fromYearStart,
	({ yearStartMs, isLeapYear }) => yearStartMs + (isLeapYear ? LEAP_YEAR_MS : NORMAL_YEAR_MS)
);

/**
 * Minimal usable timestamp
 *
 * @category Constants
 */
export const MIN_TIMESTAMP = pipe(MIN_FULL_YEAR, YearData.fromYearStart, Struct.get('yearStartMs'));

/**
 * Type of a DateTime
 *
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Type, Pipeable.Pipeable {
	/** Number of milliseconds since 1/1/1970 at 00:00:00:000+00:00. Is timezone-independent */
	readonly timestamp: number;

	/** YearData of this DateTime, expressed in given timezone */
	readonly yearData: YearData.Type;

	/** Number of days since the start of the current year. Expressed in given timezone, range:[0, 365] */
	readonly ordinalDay: Option.Option<number>;

	/** Month of this DateTime. Expressed in given timezone, range:[0, 11] */
	readonly month: Option.Option<number>;

	/** MonthDay of this DateTime. Expressed in given timezone, range:[0, 30] */
	readonly monthDay: Option.Option<number>;

	/** IsoWeek of this DateTime. Expressed in given timezone, range:[0, 52] */
	readonly isoWeek: Option.Option<number>;

	/** WeekDay of this DateTime. Expressed in given timezone, range:[0, 6], 0 is sunday, 6 is saturday */
	readonly weekDay: Option.Option<number>;

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
	 * Time in hours between 1/1/1970 00:00:00:000+z:00 and 1/1/1970 00:00:00:000+00:00 (e.g 1 for
	 * timezone +1:00). Does not have to be an integer. Should be comprised in the range ]-12, 15[
	 */
	readonly timeZoneOffset: number;

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

// Returns the local time zone offset in hours of the machine on which this code runs. Result is cached. So result will become wrong if you change the local timeZoneOffset
const _localTimeZoneOffset: () => number = MFunction.once(
	() => new Date(0).getTimezoneOffset() / 60
);

/**
 * Tries to build a DateTime from `timestamp` and `timeZoneOffset`. Returns a `right` of this
 * DateTime if successful. Returns a `left` of an error otherwise. `timestamp` must be an integer
 * comprised in the range [MIN_TIMESTAMP, MAX_TIMESTAMP] representing the number of milliseconds
 * since 1/1/1970 00:00:00:000+0:00. `timeZoneOffset` is a number, not necessarily an integer, that
 * represents the offset in hours of the zone for which all calculations of that DateTime object
 * will be carried out. It should be comprised in the range ]-12, 15[.
 *
 * @category Constructors
 */
export const fromTimestamp = ({
	timestamp,
	timeZoneOffset = 0
}: {
	readonly timestamp: number;
	readonly timeZoneOffset?: number;
}): Either.Either<Type, MInputError.Type> =>
	pipe(
		timestamp + timeZoneOffset * HOUR_MS,
		MInputError.assertInRange({
			min: MIN_TIMESTAMP,
			max: MAX_TIMESTAMP,
			offset: -timeZoneOffset * HOUR_MS,
			name: 'timestamp'
		}),
		Either.map(
			flow(
				YearData.fromTimestamp,
				MStruct.make('yearData'),
				MStruct.prepend({
					timestamp,
					timeZoneOffset,
					ordinalDay: Option.none(),
					month: Option.none(),
					monthDay: Option.none(),
					isoWeek: Option.none(),
					weekDay: Option.none(),
					hour24: Option.none(),
					hour12: Option.none(),
					meridiem: Option.none(),
					minute: Option.none(),
					second: Option.none(),
					millisecond: Option.none()
				}),
				_make
			)
		)
	);

/**
 * Same as fromTimestamp but returns directly the DateTime or throws if it cannot be built
 *
 * @category Constructors
 */
export const unsafeFromTimestamp: MTypes.OneArgFunction<
	{
		readonly timestamp: number;
		readonly timeZoneOffset?: number;
	},
	Type
> = flow(fromTimestamp, Either.getOrThrowWith(Function.identity));

/**
 * Builds a DateTime using Date.now() as timestamp.
 *
 * @category Constructors
 */
export const now = (timeZoneOffset = 0): Type =>
	unsafeFromTimestamp({ timestamp: Date.now(), timeZoneOffset });

/**
 * Tries to build a DateTime from `params`. Returns a `right` of this DateTime if successful.
 * Returns a `left` of an error otherwise.
 *
 * `timeZoneOffset` is a number, not necessarily an integer, that represents the offset in hours of
 * the zone for which all other parameters are expressed. It should be comprised in the range ]-12,
 * 15[.
 *
 * `year` must be an integer comprised in the range [MIN_FULL_YEAR, MAX_FULL_YEAR].
 *
 * `ordinalDay` must be an integer greater than or equal to 1 and less than or equal to the number
 * of days of the current year. `month` must be an integer greater than or equal to 1 (January) and
 * less than or equal to 12 (December). `monthDay` must be an integer greater than or equal to 1 and
 * less than or equal to the number of days of the current month. `isoWeek` must be an integer
 * greater than or equal to 1 and less than or equal to the number of iso weeks of the current year.
 * `weekDay` must be an integer greater than or equal to 0 (sunday) and less than or equal to 6
 * (saturday). If you don't pass sufficient information to determine the day of the year (e.g. you
 * pass `month` and `weekDay` but `monthDay`, `ordinalDay`, and `isoWeek` are missing), the returned
 * DayeTime will represent the first day of the year.
 *
 * `hour24` must be an integer greater than or equal to 0 and less than or equal to 23. `hour12`
 * must be an integer greater than or equal to 0 and less than or equal to 11. `meridiem` must be
 * one of 0 (AM) or 12 (PM). If you don't pass sufficient information to determine the hour of the
 * day (e.g. you pass `hour12` but `hour24`, and `meridiem` are missing), the returned DayeTime will
 * represent the first hour of the day.
 *
 * `minute` must be an integer greater than or equal to 0 and less than or equal to 59. `second`
 * must be an integer greater than or equal to 0 and less than or equal to 59. `millisecond` must be
 * an integer greater than or equal to 0 and less than or equal to 999.
 *
 * All parameters must be coherent. For instance, you will get an error if you pass `year=1970`,
 * `month=1`, `monthDay=1`, `weekDay=0` and `timeZoneOffset=0` because 1/1/1970 00:00:00:000+0:00
 * was a thursday. You will also get an error if you pass `hour24=13` and `meridiem=0`.
 *
 * @category Constructors
 */
export const fromParts = (params: {
	readonly year: number;
	readonly ordinalDay?: number;
	readonly month?: number;
	readonly monthDay?: number;
	readonly isoWeek?: number;
	readonly weekDay?: number;
	readonly hour24?: number;
	readonly hour12?: number;
	readonly meridiem?: 0 | 12;
	readonly minute?: number;
	readonly second?: number;
	readonly millisecond?: number;
	readonly timeZoneOffset?: number;
}): Either.Either<Type, MInputError.Type> =>
	Either.gen(function* () {
		const paramsAsOptions = {
			year: params.year,
			ordinalDay: pipe(
				params.ordinalDay,
				Option.fromNullable,
				Option.map(Number.decrement),
				Either.left
			),
			month: pipe(params.month, Option.fromNullable, Option.map(Number.decrement), Either.left),
			monthDay: pipe(
				params.monthDay,
				Option.fromNullable,
				Option.map(Number.decrement),
				Either.left
			),
			isoWeek: pipe(params.isoWeek, Option.fromNullable, Option.map(Number.decrement), Either.left),
			weekDay: pipe(params.weekDay, Option.fromNullable, Either.left),
			hour24: pipe(params.hour24, Option.fromNullable, Either.left),
			hour12: pipe(params.hour12, Option.fromNullable, Either.left),
			meridiem: pipe(params.meridiem, Option.fromNullable, Either.left),
			minute: pipe(params.minute, Option.fromNullable, Either.left),
			second: pipe(params.second, Option.fromNullable, Either.left),
			millisecond: pipe(params.millisecond, Option.fromNullable, Either.left),
			timeZoneOffset: pipe(
				params.timeZoneOffset,
				Option.fromNullable,
				Option.getOrElse(Function.constant(0))
			)
		};

		const validatedYear = yield* pipe(
			paramsAsOptions.year,
			MInputError.assertInRange({
				min: MIN_FULL_YEAR,
				max: MAX_FULL_YEAR,
				offset: 0,
				name: "'year'"
			})
		);

		const yearData = YearData.fromYearStart(validatedYear);
		const isLeapYear = yearData.isLeapYear;

		const [yearStartOffsetMsEither, paramsToCheck] = pipe(
			paramsAsOptions,
			MMatch.make,
			MMatch.when(
				MPredicate.struct({ ordinalDay: Option.isSome }),
				MTuple.makeBothBy({
					toFirst: flow(
						Struct.get('ordinalDay'),
						Struct.get('value'),
						MInputError.assertInRange({
							min: 0,
							max: isLeapYear ? 365 : 364,
							offset: 1,
							name: "'ordinalDay'"
						}),
						Either.map(Number.multiply(DAY_MS))
					),
					toSecond: MStruct.append({ ordinalDay: Option.none() })
				})
			),
			MMatch.when(
				MPredicate.struct({ month: Option.isSome, monthDay: Option.isSome }),
				MTuple.makeBothBy({
					toFirst: ({ month, monthDay }) =>
						Either.gen(function* () {
							const validatedMonth = yield* pipe(
								month.value,
								MInputError.assertInRange({
									min: 0,
									max: 11,
									offset: 1,
									name: "'month'"
								})
							);

							const monthDescriptor = pipe(
								validatedMonth,
								MonthDescriptor.fromMonthIndex(isLeapYear)
							);

							const validatedMonthDay = yield* pipe(
								monthDay.value,
								MInputError.assertInRange({
									min: 0,
									max: monthDescriptor.lastDayIndex,
									offset: 1,
									name: "'monthDay'"
								})
							);
							return monthDescriptor.monthStartMs + validatedMonthDay * DAY_MS;
						}),
					toSecond: MStruct.append({ month: Option.none(), monthDay: Option.none() })
				})
			),
			MMatch.when(
				MPredicate.struct({ isoWeek: Option.isSome, weekDay: Option.isSome }),
				MTuple.makeBothBy({
					toFirst: ({ isoWeek, weekDay }) =>
						Either.gen(function* () {
							const validatedMonth = yield* pipe(
								month.value,
								MInputError.assertInRange({
									min: 0,
									max: 11,
									offset: 1,
									name: "'month'"
								})
							);

							const monthDescriptor = pipe(
								validatedMonth,
								MonthDescriptor.fromMonthIndex(isLeapYear)
							);

							const validatedMonthDay = yield* pipe(
								monthDay.value,
								MInputError.assertInRange({
									min: 0,
									max: monthDescriptor.lastDayIndex,
									offset: 1,
									name: "'monthDay'"
								})
							);
							return monthDescriptor.monthStartMs + validatedMonthDay * DAY_MS;
						}),
					toSecond: MStruct.append({ month: Option.none(), monthDay: Option.none() })
				})
			),
			MMatch.orElse(flow(Tuple.make, MTuple.prependElement(Either.right(0))))
		);

		const yearStartOffsetMs = yield* yearStartOffsetMsEither;

		return 0 as never;
	});
/*const ordinalDay0 = Math.floor(r1Year / DAY_MS);
		const offsetOrdinalDay = ordinalDay0 * DAY_MS;
		const dayMs = yearStartMs + offsetOrdinalDay;
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

/** Returns the number of days in a year */
//const _getNbDaysInYear = (isLeapYear: boolean): number => (isLeapYear ? 366 : 365);

/**
 * Calculates the UTC week day of a timestamp. Calculation is based on the fact that 4/1/1970 was a
 * UTC sunday.
 */
/*const _getWeekDayFromTimestamp = (timestamp: number): number => {
	const weekDay0 = MNumber.intModulo(7)(Math.floor(timestamp / DAY_MS) - 3);
	return weekDay0 === 0 ? 7 : weekDay0;
};*/

/**
 * Offset in ms between the 1st day of the year at 00:00:00:000 and the first day of the first iso
 * week of the year at 00:00:00:000. No input parameters check!
 */
/*const _unsafeGetFirstIsoWeekMs = (firstDayOfYearWeekDay: number): number =>
	(firstDayOfYearWeekDay <= 4 ? 1 - firstDayOfYearWeekDay : 8 - firstDayOfYearWeekDay) * DAY_MS;*/

/** Determines if an iso year is long (53 weeks) or short (52 weeks). No input parameters check! */
/*const _unsafeIsLongIsoYear = (firstDayOfYearWeekDay: number, isLeapYear: boolean): boolean =>
	firstDayOfYearWeekDay === 4 || (firstDayOfYearWeekDay === 3 && isLeapYear);*/

/** Calculates the number of iso weeks in a year. No input parameters check! */
/*const _unsafeGetNbIsoWeeksInYear = (firstDayOfYearWeekDay: number, isLeapYear: boolean): number =>
	_unsafeIsLongIsoYear(firstDayOfYearWeekDay, isLeapYear) ? 53 : 52;*/

/**
 * Returns the local time zone offset in hours of the machine on which this code runs. Result is
 * cached. So result will become wrong if you change the local timeZoneOffset
 *
 * @category Utils
 */
/*export const localTimeZoneOffset: () => number = MFunction.once(
	() => new Date(0).getTimezoneOffset() / 60
);*/
