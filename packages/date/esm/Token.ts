import { MBadArgumentError, MFunction, MMatch, MNumber, MTuple } from '@parischap/effect-lib';
import { MRegExpString } from '@parischap/js-lib';
import { Array, Either, HashMap, HashSet, Number, Record, String, Tuple, flow, pipe } from 'effect';
import { compose } from 'effect/Function';
import * as MergedToken from './MergedToken.js';

const moduleTag = '@parischap/date/Token/';

export interface TokenToMergedToken {
	(
		locale?: string
	): Either.Either<
		(
			tokenValue: string
		) => Either.Either<
			number,
			MBadArgumentError.DisallowedValue<string> | MBadArgumentError.OutOfRange
		>,
		MBadArgumentError.DisallowedValue<string>
	>;
}

export interface Descriptor {
	readonly name: string;
	readonly label: string;
	readonly parsePattern: RegExp;
	readonly tokenToMergedToken: TokenToMergedToken;
	readonly mergedToken: MergedToken.Type;
}
const Descriptor = MFunction.make<Descriptor>;
const getFullName = (self: Descriptor) => `${self.name}(${self.label})`;

// Regular expressions
const twoDigits = new RegExp(MRegExpString.digit + MRegExpString.digit);
const threeDigits = new RegExp(MRegExpString.digit + MRegExpString.digit + MRegExpString.digit);
const fourDigits = new RegExp(
	MRegExpString.digit + MRegExpString.digit + MRegExpString.digit + MRegExpString.digit
);
const unsignedBase10Int = new RegExp(MRegExpString.unsignedBase10Int);
const anyWord = new RegExp(MRegExpString.anyWord);

/** Returns an error for an unknown locale */
const localeError = (
	locale: string,
	functionName: string
): MBadArgumentError.DisallowedValue<string> =>
	new MBadArgumentError.DisallowedValue({
		actual: locale,
		allowedValues: HashSet.make('fr-FR', 'en-US', '...'),
		positions: [],
		id: 'locale',
		moduleTag,
		functionName
	});

/** Returns an error for a disallowed token value */
const disallowedTokenValue =
	(allowedValues: HashMap.HashMap<string, number>) =>
	(tokenValue: string): Either.Either<number, MBadArgumentError.DisallowedValue<string>> =>
		pipe(
			tokenValue,
			MBadArgumentError.DisallowedValue.checkAndMap({
				allowedValues,
				id: 'tokenValue',
				moduleTag,
				functionName: 'tokenToMergedToken'
			})
		);
/**
 * Creates a map that associates the name (short or long) of a month in the given locale to its
 * number (1-12)
 */
const monthsMapForLocale = MFunction.memoize(+Infinity)(
	({
		format,
		locale
	}: {
		format: 'long' | 'short';
		locale: string | undefined;
	}): Either.Either<HashMap.HashMap<string, number>, MBadArgumentError.DisallowedValue<string>> =>
		Either.gen(function* () {
			const localeIntl = yield* pipe(
				Either.try({
					try: () => new Intl.DateTimeFormat(locale, { month: format }),
					catch: () => localeError(locale ?? '', 'monthsMapForLocale')
				})
			);
			return pipe(
				Array.range(1, 12),
				Array.map((n) => Tuple.make(localeIntl.format(new Date(2023, n)), n)),
				HashMap.fromIterable
			);
		}),
	(self, that) => self.format === that.format && self.locale === that.locale
);

/**
 * Creates a map that associates the name (short or long) of a weekday in the given locale to its
 * number (1-12)
 */
const weekDaysMapForLocale = MFunction.memoize(+Infinity)(
	({
		format,
		locale
	}: {
		format: 'long' | 'short';
		locale: string | undefined;
	}): Either.Either<HashMap.HashMap<string, number>, MBadArgumentError.DisallowedValue<string>> =>
		Either.gen(function* () {
			const localeIntl = yield* pipe(
				Either.try({
					try: () => new Intl.DateTimeFormat(locale, { weekday: format }),
					catch: () => localeError(locale ?? '', 'weekDaysMapForLocale')
				})
			);
			return pipe(
				Array.range(1, 7),
				// October 1st, 2023 is a sunday
				Array.map((n) => Tuple.make(localeIntl.format(new Date(2023, 10, n)), n)),
				HashMap.fromIterable
			);
		}),
	(self, that) => self.format === that.format && self.locale === that.locale
);

/** Creates a map that associates a meridiem to its numerical offset in hours (0 or 12) */
const meridiemMap = HashMap.make(['AM', 0], ['PM', 12]);

/** Converts a string token value representing an integer to its integer value */
const numberFromString: TokenToMergedToken = MFunction.once(() =>
	Either.right(flow(MNumber.unsafeIntFromString, Either.right))
);
/**
 * Converts a string representing a time zone offset in the form `+hh:mm` or `+hhmm` to its hour
 * numeric value
 */
const numberFromZoneString: TokenToMergedToken = MFunction.once(() =>
	Either.right(
		flow(
			MTuple.makeBothBy({
				toFirst: String.takeLeft(3),
				toSecond: String.takeRight(2)
			}),
			Tuple.mapBoth({
				onFirst: flow(MNumber.unsafeIntFromString, Either.right),
				onSecond: flow(
					MNumber.unsafeIntFromString,
					MBadArgumentError.OutOfRange.check({
						min: 0,
						max: 59,
						id: 'tokenValue',
						moduleTag,
						functionName: 'tokenToMergedToken'
					})
				)
			}),
			Either.all,
			Either.map(([hours, minutes]) => hours + minutes / 60.0)
		)
	)
);

const array = Array.make(
	// Must be followed by a non-digit
	Descriptor({
		name: 'y',
		label: 'year',
		parsePattern: unsignedBase10Int,
		tokenToMergedToken: numberFromString,
		mergedToken: 'year'
	}),
	//  Interpreted as > 1960
	Descriptor({
		name: 'yy',
		label: '2-digit year',
		parsePattern: twoDigits,
		tokenToMergedToken: MFunction.once(() =>
			Either.right((tokenValue) =>
				Either.right(
					pipe(
						tokenValue,
						MNumber.unsafeIntFromString,
						MMatch.make,
						MMatch.when(Number.lessThanOrEqualTo(60), Number.sum(2000)),
						MMatch.orElse(Number.sum(1900))
					)
				)
			)
		),
		mergedToken: 'year'
	}),
	Descriptor({
		name: 'yyyy',
		label: '4-digit year',
		parsePattern: fourDigits,
		tokenToMergedToken: numberFromString,
		mergedToken: 'year'
	}),
	// Integer between 1 and 365 or 366 - Must be followed by a non-digit
	Descriptor({
		name: 'o',
		label: 'year day',
		parsePattern: unsignedBase10Int,
		tokenToMergedToken: numberFromString,
		mergedToken: 'ordinalDay'
	}),
	// Integer between 1 and 365 or 366
	Descriptor({
		name: 'ooo',
		label: '3-digit year day',
		parsePattern: threeDigits,
		tokenToMergedToken: numberFromString,
		mergedToken: 'ordinalDay'
	}),
	// Integer betwwen 1-12. Must be followed by a non-digit
	Descriptor({
		name: 'M',
		label: 'month',
		parsePattern: unsignedBase10Int,
		tokenToMergedToken: numberFromString,
		mergedToken: 'month'
	}),
	// Integer betwwen 1-12
	Descriptor({
		name: 'MM',
		label: '2-digit month',
		parsePattern: twoDigits,
		tokenToMergedToken: numberFromString,
		mergedToken: 'month'
	}),
	// Month as an abbreviated localized string - Must be followed by a non-word character
	Descriptor({
		name: 'MMM',
		label: 'month short name',
		parsePattern: anyWord,
		tokenToMergedToken: MFunction.memoize(Infinity)((locale: string | undefined) =>
			pipe(monthsMapForLocale({ format: 'short', locale }), Either.map(disallowedTokenValue))
		),
		mergedToken: 'month'
	}),
	// Month as an unabbreviated localized string - Must be followed by a non-word character
	Descriptor({
		name: 'MMMM',
		label: 'month long name',
		parsePattern: anyWord,
		tokenToMergedToken: MFunction.memoize(Infinity)((locale: string | undefined) =>
			pipe(monthsMapForLocale({ format: 'long', locale }), Either.map(disallowedTokenValue))
		),
		mergedToken: 'month'
	}),
	// Integer betwwen 1 and 29, 30 or 31 - Must be followed by a non-digit
	Descriptor({
		name: 'd',
		label: 'day of month',
		parsePattern: unsignedBase10Int,
		tokenToMergedToken: numberFromString,
		mergedToken: 'monthDay'
	}),
	// Integer betwwen 1 and 29, 30 or 31
	Descriptor({
		name: 'dd',
		label: '2-digit day of month',
		parsePattern: twoDigits,
		tokenToMergedToken: numberFromString,
		mergedToken: 'monthDay'
	}),
	// Integer between 1 and 52 or 53 - Must be followed by a non-digit
	Descriptor({
		name: 'W',
		label: 'week number',
		parsePattern: unsignedBase10Int,
		tokenToMergedToken: numberFromString,
		mergedToken: 'isoWeek'
	}),
	// Integer between 1 and 52 or 53
	Descriptor({
		name: 'WW',
		label: '2-digit ISO week number',
		parsePattern: twoDigits,
		tokenToMergedToken: numberFromString,
		mergedToken: 'isoWeek'
	}),
	// Integer betwwen 1 and 7 (Monday is 1, Sunday is 7) - Must be followed by a non-digit
	Descriptor({
		name: 'E',
		label: 'weekday',
		parsePattern: unsignedBase10Int,
		tokenToMergedToken: numberFromString,
		mergedToken: 'weekDay'
	}),
	// Weekday, as an abbreviated localized string - Must be followed by a non-word character
	Descriptor({
		name: 'EEE',
		label: 'weekday short name',
		parsePattern: anyWord,
		tokenToMergedToken: MFunction.memoize(Infinity)((locale: string | undefined) =>
			pipe(weekDaysMapForLocale({ format: 'short', locale }), Either.map(disallowedTokenValue))
		),
		mergedToken: 'weekDay'
	}),
	// Weekday, as an unabbreviated localized string - Must be followed by a non-word character
	Descriptor({
		name: 'EEEE',
		label: 'weekday long name',
		parsePattern: anyWord,
		tokenToMergedToken: MFunction.memoize(Infinity)((locale: string | undefined) =>
			pipe(weekDaysMapForLocale({ format: 'long', locale }), Either.map(disallowedTokenValue))
		),
		mergedToken: 'weekDay'
	}),
	// Integer betwwen 0 and 23 - Must be followed by a non-digit
	Descriptor({
		name: 'H',
		label: 'hour24',
		parsePattern: unsignedBase10Int,
		tokenToMergedToken: numberFromString,
		mergedToken: 'hour24'
	}),
	// Integer betwwen 0 and 23
	Descriptor({
		name: 'HH',
		label: '2-digit hour24',
		parsePattern: twoDigits,
		tokenToMergedToken: numberFromString,
		mergedToken: 'hour24'
	}),
	// Integer betwwen 0 and 11 - Must be followed by a non-digit
	Descriptor({
		name: 'h',
		label: 'hour12',
		parsePattern: unsignedBase10Int,
		tokenToMergedToken: numberFromString,
		mergedToken: 'hour12'
	}),
	// Integer betwwen 0 and 11
	Descriptor({
		name: 'hh',
		label: '2-digit hour12',
		parsePattern: twoDigits,
		tokenToMergedToken: numberFromString,
		mergedToken: 'hour12'
	}),
	// Meridiem - Allowed values 'AM','PM' - Can be uppercase or lowercase
	Descriptor({
		name: 'a',
		label: 'meridiem',
		parsePattern: new RegExp(MRegExpString.anyWordLetter + MRegExpString.anyWordLetter),
		tokenToMergedToken: MFunction.once(() =>
			flow(String.toUpperCase, disallowedTokenValue(meridiemMap), Either.right)
		),
		mergedToken: 'meridiem'
	}),
	// Integer betwwen 0 and 59 - Must be followed by a non-digit
	Descriptor({
		name: 'm',
		label: 'minute',
		parsePattern: unsignedBase10Int,
		tokenToMergedToken: numberFromString,
		mergedToken: 'minute'
	}),
	// Integer betwwen 0 and 59
	Descriptor({
		name: 'mm',
		label: '2-digit minute',
		parsePattern: twoDigits,
		tokenToMergedToken: numberFromString,
		mergedToken: 'minute'
	}),
	// Integer betwwen 0 and 59 - Must be followed by a non-digit
	Descriptor({
		name: 's',
		label: 'second',
		parsePattern: unsignedBase10Int,
		tokenToMergedToken: numberFromString,
		mergedToken: 'second'
	}),
	// Integer betwwen 0 and 59
	Descriptor({
		name: 'ss',
		label: '2-digit second',
		parsePattern: twoDigits,
		tokenToMergedToken: numberFromString,
		mergedToken: 'second'
	}),
	// Integer betwwen 0 and 999 - Must be followed by a non-digit
	Descriptor({
		name: 'S',
		label: 'millisecond',
		parsePattern: unsignedBase10Int,
		tokenToMergedToken: numberFromString,
		mergedToken: 'millisecond'
	}),
	// Integer betwwen 0 and 999
	Descriptor({
		name: 'SSS',
		label: '3-digit millisecond',
		parsePattern: threeDigits,
		tokenToMergedToken: numberFromString,
		mergedToken: 'millisecond'
	}),
	// ex: +5 - Must be followed by a non-digit
	Descriptor({
		name: 'Z',
		label: 'narrow zone offset',
		parsePattern: new RegExp(MRegExpString.sign + MRegExpString.unsignedBase10Int),
		tokenToMergedToken: numberFromString,
		mergedToken: 'timeZoneOffset'
	}),
	// ex: +05:00
	Descriptor({
		name: 'ZZ',
		label: 'short zone offset',
		parsePattern: new RegExp(
			MRegExpString.sign +
				MRegExpString.digit +
				MRegExpString.digit +
				':' +
				MRegExpString.digit +
				MRegExpString.digit
		),
		tokenToMergedToken: numberFromZoneString,
		mergedToken: 'timeZoneOffset'
	}),
	// ex: +0500
	Descriptor({
		name: 'ZZZ',
		label: 'techie zone offset',
		parsePattern: new RegExp(
			MRegExpString.sign +
				MRegExpString.digit +
				MRegExpString.digit +
				MRegExpString.digit +
				MRegExpString.digit
		),
		tokenToMergedToken: numberFromZoneString,
		mergedToken: 'timeZoneOffset'
	})
);

export const [tokens, [tokenPatterns, [mergedTokens, tokenToMergedTokens]]] = pipe(
	array,
	Array.map(({ name, label, parsePattern, tokenToMergedToken, mergedToken }) => ({
		parsePattern,
		mergedToken: {
			key: mergedToken,
			descriptor: pipe(
				mergedToken,
				MBadArgumentError.DisallowedValue.checkAndMap({
					allowedValues: MergedToken.map,
					id: 'mergedToken',
					moduleTag,
					functionName: 'mapWithMergedToken'
				})
			)
		},
		tokenToMergedToken: flow(
			tokenToMergedToken,
			Either.map(compose(Either.mapLeft(MBadArgumentError.mapId(() => `${token}(${label})`))))
		)
	})),
	Record.toEntries,
	Array.unzip,
	Tuple.mapSecond(
		flow(
			Array.map(({ parsePattern, mergedToken, tokenToMergedToken }) =>
				Tuple.make(parsePattern, Tuple.make(mergedToken, tokenToMergedToken))
			),
			Array.unzip,
			Tuple.mapSecond(Array.unzip)
		)
	)
);
