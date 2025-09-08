/**
 * This module implements a `CVNumberBase10Format` which describes the possible options to
 * format/parse a base-10 number or `BigDecimal` and implements the formatting/parsing algortithms
 */

import {
	MBigDecimal,
	MBigInt,
	MFunction,
	MInspectable,
	MMatch,
	MNumber,
	MPipeable,
	MPredicate,
	MRegExpString,
	MString,
	MStruct,
	MTypes
} from '@parischap/effect-lib';
import {
	Array,
	BigDecimal,
	BigInt,
	Either,
	flow,
	Function,
	Inspectable,
	Number,
	Option,
	pipe,
	Pipeable,
	Predicate,
	String,
	Struct,
	Tuple
} from 'effect';
import * as CVReal from './Real.js';
import * as CVRoundingMode from './RoundingMode.js';
import * as CVRoundingOption from './RoundingOption.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/conversions/NumberBase10Format/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents the possible sign display options
 *
 * @category Models
 */
export enum SignDisplay {
	/**
	 * Formatting: sign display for negative numbers only, including negative zero.
	 *
	 * Parsing: conversion will fail if a positive sign is used.
	 */
	Auto = 0,

	/**
	 * Formatting: sign display for all numbers.
	 *
	 * Parsing: conversion will fail if no sign is present
	 */
	Always = 1,

	/**
	 * Formatting: sign display for positive and negative numbers, but not zero
	 *
	 * Parsing: conversion will fail if a sign is not present for a value other than 0 or if a sign is
	 * present for 0.
	 */
	ExceptZero = 2,

	/**
	 * Formatting: sign display for negative numbers only, excluding negative zero.
	 *
	 * Parsing: conversion will fail if a positive sign is used or if a negative sign is used for 0.
	 */
	Negative = 3,

	/**
	 * Formatting: no sign display.
	 *
	 * Parsing: conversion will fail if any sign is present. The number will be treated as positive.
	 */
	Never = 4
}

/**
 * SignDisplay namespace
 *
 * @category Models
 */
export namespace SignDisplay {
	/**
	 * Type that represents the possible strings used to represent a sign
	 *
	 * @category Models
	 */
	export type SignString = '-' | '+' | '';

	/**
	 * Type that represents the possible values of a sign
	 *
	 * @category Models
	 */
	export type SignValue = -1 | 1;

	/**
	 * Type of a SignDisplay Parser
	 *
	 * @category Models
	 */
	export interface Parser
		extends MTypes.OneArgFunction<
			{ readonly sign: SignString; readonly isZero: boolean },
			Option.Option<SignValue>
		> {}

	const isPlusSign: Predicate.Predicate<SignString> = MPredicate.strictEquals('+');
	const isMinusSign: Predicate.Predicate<SignString> = MPredicate.strictEquals('-');
	const signStringToSignValue: MTypes.OneArgFunction<SignString, SignValue> = flow(
		Option.liftPredicate(isMinusSign),
		Option.as(-1 as const),
		Option.getOrElse(Function.constant(1 as const))
	);
	const hasASign: Parser = flow(
		Struct.get('sign'),
		Option.liftPredicate(String.isNonEmpty),
		Option.map(signStringToSignValue)
	);
	const hasNoSign: Parser = flow(
		Struct.get('sign'),
		Option.liftPredicate(String.isEmpty),
		Option.map(signStringToSignValue)
	);
	const hasNotPlusSign: Parser = flow(
		Struct.get('sign'),
		Option.liftPredicate(Predicate.not(isPlusSign)),
		Option.map(signStringToSignValue)
	);

	/**
	 * Builds a `Parser` implementing `self`
	 *
	 * @category Destructors
	 */
	export const toParser: MTypes.OneArgFunction<SignDisplay, Parser> = flow(
		MMatch.make,
		MMatch.whenIs(SignDisplay.Auto, Function.constant(hasNotPlusSign)),
		MMatch.whenIs(SignDisplay.Always, Function.constant(hasASign)),
		MMatch.whenIs(
			SignDisplay.ExceptZero,
			(): Parser =>
				flow(
					MMatch.make,
					MMatch.when(MPredicate.struct({ isZero: Function.identity }), hasNoSign),
					MMatch.orElse(hasASign)
				)
		),
		MMatch.whenIs(
			SignDisplay.Negative,
			(): Parser =>
				flow(
					MMatch.make,
					MMatch.when(MPredicate.struct({ isZero: Function.identity }), hasNoSign),
					MMatch.orElse(hasNotPlusSign)
				)
		),
		MMatch.whenIs(SignDisplay.Never, Function.constant(hasNoSign)),
		MMatch.exhaustive
	);

	/**
	 * Type of a SignDisplay Formatter
	 *
	 * @category Models
	 */
	export interface Formatter
		extends MTypes.OneArgFunction<
			{ readonly sign: SignValue; readonly isZero: boolean },
			SignString
		> {}

	/**
	 * Builds a `Formatter` implementing `self`
	 *
	 * @category Destructors
	 */
	export const toFormatter: MTypes.OneArgFunction<SignDisplay, Formatter> = flow(
		MMatch.make,
		MMatch.whenIs(
			SignDisplay.Auto,
			(): Formatter =>
				({ sign }) =>
					sign === -1 ? '-' : ''
		),
		MMatch.whenIs(
			SignDisplay.Always,
			(): Formatter =>
				({ sign }) =>
					sign === -1 ? '-' : '+'
		),
		MMatch.whenIs(
			SignDisplay.ExceptZero,
			(): Formatter =>
				({ sign, isZero }) =>
					isZero ? ''
					: sign === -1 ? '-'
					: '+'
		),
		MMatch.whenIs(
			SignDisplay.Negative,
			(): Formatter =>
				({ sign, isZero }) =>
					isZero || sign === 1 ? '' : '-'
		),
		MMatch.whenIs(SignDisplay.Never, (): Formatter => MFunction.constEmptyString),
		MMatch.exhaustive
	);
}

/**
 * Type that represents the possible scientific notation options
 *
 * @category Models
 */
export enum ScientificNotation {
	/**
	 * Formatting: scientific notation is not used.
	 *
	 * Parsing: conversion will fail if a scientific notation is present.
	 */
	None = 0,

	/**
	 * Formatting: scientific notation is not used.
	 *
	 * Parsing: scientific notation may be used but is not mandatory.
	 */
	Standard = 1,

	/**
	 * Formatting: scientific notation is used so that the absolute value of the mantissa m fulfills 1
	 * ≤ |m| < 10. Number 0 will be displayed as `0e0`.
	 *
	 * Parsing: the conversion will fail if the mantissa is not null and its value m does not fulfill
	 * 1 ≤ |m| < 10. Scientific notation may be used but is not mandatory. A string that does not
	 * contain a scientific notation is deemed equivalent to a string with a null exponent.
	 */
	Normalized = 2,

	/**
	 * Formatting: scientific notation is used so that the mantissa m fulfills 1 ≤ |m| < 1000 and the
	 * exponent is a multiple of 3. Number 0 will be displayed as `0e0`.
	 *
	 * Parsing: the conversion will fail if the mantissa is not null and its value m does not fulfill
	 * 1 ≤ |m| < 1000 or if the exponent is not a multiple of 3. Scientific notation may be used but
	 * is not mandatory. A string that does not contain a scientific notation is deemed equivalent to
	 * a string with a null exponent.
	 */
	Engineering = 3
}

/**
 * ScientificNotation namespace
 *
 * @category Models
 */
export namespace ScientificNotation {
	/**
	 * Type of a ScientificNotation Parser
	 *
	 * @category Models
	 */
	export interface Parser extends MTypes.OneArgFunction<string, Option.Option<number>> {}

	const _stringToExponent = flow(
		Option.liftPredicate(String.isNonEmpty),
		Option.map(MNumber.unsafeFromString),
		Option.orElseSome(Function.constant(0))
	);

	/**
	 * Builds a `Parser` implementing `self`
	 *
	 * @category Destructors
	 */
	export const toParser: MTypes.OneArgFunction<ScientificNotation, Parser> = flow(
		MMatch.make,
		MMatch.whenIs(ScientificNotation.None, () =>
			flow(Option.liftPredicate(String.isEmpty), Option.as(0))
		),
		MMatch.whenIsOr(
			ScientificNotation.Standard,
			ScientificNotation.Normalized,
			Function.constant(_stringToExponent)
		),
		MMatch.whenIs(ScientificNotation.Engineering, () =>
			flow(_stringToExponent, Option.filter(MNumber.isMultipleOf(3)))
		),
		MMatch.exhaustive
	);

	/**
	 * Type of a MantissaChecker
	 *
	 * @category Models
	 */
	export interface MantissaChecker
		extends MTypes.OneArgFunction<BigDecimal.BigDecimal, Option.Option<BigDecimal.BigDecimal>> {}

	const zeroOrinRange = (rangeTop: number): Predicate.Predicate<BigDecimal.BigDecimal> =>
		Predicate.or(
			BigDecimal.isZero,
			Predicate.and(
				BigDecimal.greaterThanOrEqualTo(BigDecimal.unsafeFromNumber(1)),
				BigDecimal.lessThan(BigDecimal.unsafeFromNumber(rangeTop))
			)
		);

	const zeroOrinOneToTenRange = zeroOrinRange(10);
	const zeroOrinOneToOneThousandRange = zeroOrinRange(1000);

	/**
	 * Builds a `Parser` implementing `self`
	 *
	 * @category Destructors
	 */
	export const toMantissaChecker: MTypes.OneArgFunction<ScientificNotation, MantissaChecker> = flow(
		MMatch.make,
		MMatch.whenIsOr(
			ScientificNotation.None,
			ScientificNotation.Standard,
			() => Option.some<BigDecimal.BigDecimal>
		),
		MMatch.whenIs(ScientificNotation.Normalized, () => Option.liftPredicate(zeroOrinOneToTenRange)),
		MMatch.whenIs(ScientificNotation.Engineering, () =>
			Option.liftPredicate(zeroOrinOneToOneThousandRange)
		),
		MMatch.exhaustive
	);

	/**
	 * Type of a MantissaAdjuster
	 *
	 * @category Models
	 */
	export interface MantissaAdjuster
		extends MTypes.OneArgFunction<
			BigDecimal.BigDecimal,
			readonly [adjustedMantissa: BigDecimal.BigDecimal, exponent: Option.Option<number>]
		> {}

	/**
	 * Builds a `Parser` implementing `self`
	 *
	 * @category Destructors
	 */
	export const toMantissaAdjuster: MTypes.OneArgFunction<ScientificNotation, MantissaAdjuster> =
		flow(
			MMatch.make,
			MMatch.whenIsOr(
				ScientificNotation.None,
				ScientificNotation.Standard,
				(): MantissaAdjuster => flow(Tuple.make, Tuple.appendElement(Option.none()))
			),
			MMatch.whenIs(
				ScientificNotation.Normalized,
				(): MantissaAdjuster => (b) => {
					if (BigDecimal.isZero(b)) return Tuple.make(b, Option.some(0));
					const value = b.value;
					const log10 = MBigInt.unsafeLog10(BigInt.abs(value));

					return Tuple.make(BigDecimal.make(value, log10), Option.some(log10 - b.scale));
				}
			),
			MMatch.whenIs(
				ScientificNotation.Engineering,
				(): MantissaAdjuster => (b) => {
					if (BigDecimal.isZero(b)) return Tuple.make(b, Option.some(0));
					const value = b.value;
					const log10 = MBigInt.unsafeLog10(BigInt.abs(value)) - b.scale;
					const correctedLog10 = log10 - MNumber.intModulo(3)(log10);
					return Tuple.make(
						BigDecimal.make(value, correctedLog10 + b.scale),
						Option.some(correctedLog10)
					);
				}
			),
			MMatch.exhaustive
		);
}

/**
 * Type that represents a `CVNumberBase10Format`
 *
 * @category Models
 */
export interface Type extends Inspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Thousand separator. Use an empty string for no separator. Usually a string made of at most one
	 * character different from `fractionalSeparator`. Will not throw otherwise but unexpected results
	 * might occur.
	 */
	readonly thousandSeparator: string;

	/**
	 * Fractional separator. Usually a one-character string different from `thousandSeparator`. Will
	 * not throw otherwise but unexpected results might occur.
	 */
	readonly fractionalSeparator: string;

	/**
	 * Formatting:
	 *
	 * - If `true`, numbers with a null integer part are displayed starting with `0`. Otherwise, they
	 *   are displayed starting with `.` unless `maximumFractionalDigits===0`, in which case they are
	 *   displayed starting wiyh `0`.
	 *
	 * Parsing
	 *
	 * - If `true`, conversion will fail for numbers starting with `.` (after an optional sign).
	 * - If `false`, conversion will fail for numbers starting with `0.` (after an optional sign).
	 */
	readonly showNullIntegerPart: boolean;

	/**
	 * Minimim number of digits forming the fractional part of a number. Must be a positive integer
	 * (>=0) less than or equal to `maximumFractionalDigits`.
	 *
	 * Formatting: the string will be right-padded with `0`'s if necessary to respect the condition
	 *
	 * Parsing: will fail if the input string does not respect this condition (the string must be
	 * right-padded with `0`'s to respect the condition if necessary).
	 */
	readonly minimumFractionalDigits: number;

	/**
	 * Maximum number of digits forming the fractional part of a number. Must be an integer value
	 * greater than or equal to `minimumFractionalDigits`. Can take the +Infinity value.
	 *
	 * Formatting: the number will be rounded using the roundingMode to respect the condition (unless
	 * `maximumFractionalDigits` is `+Infinity`).
	 *
	 * Parsing: will fail if the input string has too many fractional digits.
	 */
	readonly maximumFractionalDigits: number;

	/**
	 * Possible characters to use to represent e-notation. Usually ['e','E']. Must be an array of
	 * one-character strings. Will not throw otherwise but unexpected results will occur. Not used if
	 * `scientificNotation === None`
	 *
	 * Formatting: the string at index 0 is used
	 *
	 * Parsing: the first character of the e-notation must be one of the one-character strings present
	 * in the array
	 */
	readonly eNotationChars: ReadonlyArray<string>;

	/** Scientific notation options. See ScientificNotation */
	readonly scientificNotation: ScientificNotation;

	/** Rounding mode options. See RoundingMode.ts */
	readonly roundingMode: CVRoundingMode.Type;

	/** Sign display options. See SignDisplay.ts */
	readonly signDisplay: SignDisplay;

	/** @internal */
	readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[_TypeId]: _TypeId,
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
 * Returns the `thousandSeparator` property of `self`
 *
 * @category Destructors
 */
export const thousandSeparator: MTypes.OneArgFunction<Type, string> =
	Struct.get('thousandSeparator');

/**
 * Returns the `fractionalSeparator` property of `self`
 *
 * @category Destructors
 */
export const fractionalSeparator: MTypes.OneArgFunction<Type, string> =
	Struct.get('fractionalSeparator');

/**
 * Returns the `showNullIntegerPart` property of `self`
 *
 * @category Destructors
 */
export const showNullIntegerPart: MTypes.OneArgFunction<Type, boolean> =
	Struct.get('showNullIntegerPart');

/**
 * Returns the `minimumFractionalDigits` property of `self`
 *
 * @category Destructors
 */
export const minimumFractionalDigits: MTypes.OneArgFunction<Type, number> =
	Struct.get('minimumFractionalDigits');

/**
 * Returns the `maximumFractionalDigits` property of `self`
 *
 * @category Destructors
 */
export const maximumFractionalDigits: MTypes.OneArgFunction<Type, number> =
	Struct.get('maximumFractionalDigits');

/**
 * Returns the `eNotationChar` property of `self`
 *
 * @category Destructors
 */
export const eNotationChars: MTypes.OneArgFunction<Type, ReadonlyArray<string>> = Struct.get(
	'eNotationChars'
);

/**
 * Returns the `scientificNotation` property of `self`
 *
 * @category Destructors
 */
export const scientificNotation: MTypes.OneArgFunction<Type, ScientificNotation> =
	Struct.get('scientificNotation');

/**
 * Returns the `roundingMode` property of `self`
 *
 * @category Destructors
 */
export const roundingMode: MTypes.OneArgFunction<Type, CVRoundingMode.Type> =
	Struct.get('roundingMode');

/**
 * Returns the `signDisplay` property of `self`
 *
 * @category Destructors
 */
export const signDisplay: MTypes.OneArgFunction<Type, SignDisplay> = Struct.get('signDisplay');

/**
 * Returns a short description of `self`, e.g. 'signed integer'
 *
 * @category Destructors
 */
export const toDescription = (self: Type): string => {
	const {
		thousandSeparator,
		fractionalSeparator,
		minimumFractionalDigits,
		maximumFractionalDigits,
		scientificNotation,
		signDisplay
	} = self;

	const isInteger = maximumFractionalDigits <= 0;
	const isUngrouped = thousandSeparator === '';
	return (
		pipe(
			signDisplay,
			MMatch.make,
			MMatch.whenIs(SignDisplay.Always, Function.constant('signed ')),
			MMatch.whenIs(SignDisplay.Never, Function.constant('unsigned ')),
			MMatch.orElse(Function.constant('potentially signed '))
		) +
		(isUngrouped && isInteger ? ''
		: (isUngrouped || thousandSeparator === ' ') && (fractionalSeparator === ',' || isInteger) ?
			'French-style '
		: thousandSeparator === '.' && (fractionalSeparator === ',' || isInteger) ? 'Dutch-style '
		: (isUngrouped || thousandSeparator === ',') && (fractionalSeparator === '.' || isInteger) ?
			'UK-style '
		:	'') +
		(isInteger ? 'integer'
		: minimumFractionalDigits === maximumFractionalDigits ?
			`${minimumFractionalDigits}-decimal number`
		:	'number') +
		pipe(
			scientificNotation,
			MMatch.make,
			MMatch.whenIs(ScientificNotation.None, MFunction.constEmptyString),
			MMatch.whenIs(
				ScientificNotation.Standard,
				Function.constant(' in standard scientific notation')
			),
			MMatch.whenIs(
				ScientificNotation.Normalized,
				Function.constant(' in normalized scientific notation')
			),
			MMatch.whenIs(ScientificNotation.Engineering, Function.constant(' in engineering notation')),
			MMatch.exhaustive
		)
	);
};

const _toBigDecimalExtractor = (
	self: Type,
	fillChar = ''
): MTypes.OneArgFunction<
	string,
	Option.Option<[value: BigDecimal.BigDecimal, parsedText: string, sign: -1 | 1]>
> => {
	const removeThousandSeparator = MString.removeNCharsEveryMCharsFromRight({
		m: MRegExpString.DIGIT_GROUP_SIZE,
		n: self.thousandSeparator.length
	});

	const getParts = MString.matchAndGroups(
		pipe(
			self,
			MStruct.append({ fillChar }),
			MRegExpString.base10Number,
			MRegExpString.atStart,
			RegExp
		),
		5
	);

	const signParser = SignDisplay.toParser(self.signDisplay);

	const exponentParser = ScientificNotation.toParser(self.scientificNotation);

	const mantissaChecker = ScientificNotation.toMantissaChecker(self.scientificNotation);

	const fillCharIsZero = fillChar === '0';

	return (text) =>
		Option.gen(function* () {
			const [
				match,
				[signPart, fillChars, mantissaIntegerPart, mantissaFractionalPart, exponentPart]
			] = yield* getParts(text);

			const mantissaFractionalPartLength = yield* pipe(
				mantissaFractionalPart,
				String.length,
				Option.liftPredicate(
					Number.between({
						minimum: self.minimumFractionalDigits,
						maximum: self.maximumFractionalDigits
					})
				)
			);

			const mantissa = yield* pipe(
				mantissaIntegerPart,
				Option.liftPredicate(String.isNonEmpty),
				Option.match({
					// No integer part
					onNone: () =>
						(
							(!self.showNullIntegerPart && mantissaFractionalPartLength !== 0) ||
							(fillCharIsZero && fillChars.length !== 0)
						) ?
							Option.some(MBigDecimal.zero)
						:	Option.none(),
					// With integer part
					onSome: flow(
						self.showNullIntegerPart || mantissaFractionalPartLength === 0 ?
							Option.some
						:	Option.liftPredicate(Predicate.not(MPredicate.strictEquals('0'))),
						Option.map(flow(removeThousandSeparator, MBigDecimal.fromPrimitiveOrThrow(0)))
					)
				}),
				Option.map(
					BigDecimal.sum(
						pipe(
							mantissaFractionalPart,
							Option.liftPredicate(String.isNonEmpty),
							Option.map(MBigDecimal.fromPrimitiveOrThrow(mantissaFractionalPartLength)),
							Option.getOrElse(Function.constant(MBigDecimal.zero))
						)
					)
				)
			);

			const checkedMantissa = yield* mantissaChecker(mantissa);

			const sign = yield* signParser({
				isZero: BigDecimal.isZero(checkedMantissa),
				sign: signPart as SignDisplay.SignString
			});

			const exponent = yield* exponentParser(exponentPart);

			return Tuple.make(
				BigDecimal.make(checkedMantissa.value, checkedMantissa.scale - exponent),
				match,
				sign
			);
		});
};

/**
 * Returns a function that tries to parse, from the start of a string `text`, a number respecting
 * the options represented by `self` and an optional `fillChar` parameter. If successful, that
 * function returns a `Some` containing `parsedText` (the part of `text` that could be analyzed as
 * representing a number) and `value` (`parsedText` converted to a BigDecimal value). Otherwise, it
 * returns a `None`. As `BigDecimal`'s provide no possibility to distinguish `-0n` and `0n`, parsing
 * '-0', '0', '+0' will yield the same result.
 *
 * `fillChar` is a character that may be used as filler between the sign and the number (or at the
 * start of the number if it is unsigned). It must be a one-character string (but no error is
 * triggered if it's not). You can use '0' as `fillChar` but you should not use any other digit
 * because the value of the number to parse would depend on the number of removed `fillChar`'s.
 *
 * @category Parsing
 */

export const toBigDecimalExtractor: (
	self: Type,
	fillChar?: string
) => MTypes.OneArgFunction<string, Option.Option<MTypes.Pair<BigDecimal.BigDecimal, string>>> =
	flow(
		_toBigDecimalExtractor,
		Function.compose(
			Option.map(([value, parsedText, sign]) =>
				Tuple.make(BigDecimal.multiply(value, BigDecimal.unsafeFromNumber(sign)), parsedText)
			)
		)
	);

/**
 * Same as `toBigDecimalExtractor` but the returned parser throws in case of failure
 *
 * @category Parsing
 */

export const toThrowingBigDecimalExtractor =
	(self: Type, fillChar?: string) =>
	(text: string): MTypes.Pair<BigDecimal.BigDecimal, string> =>
		pipe(
			text,
			toBigDecimalExtractor(self, fillChar),
			Option.getOrThrowWith(
				() => new Error(`A BigDecimal could not be parsed from the start of '${text}'`)
			)
		);

/**
 * Same as `toBigDecimalExtractor` but returns a `CVReal`. This is the most usual use case.
 * Furthermore, this function will return `-0` if your parse '-0' and `0` if you parse '0' or '+0'.
 *
 * @category Parsing
 */
export const toRealExtractor: (
	self: Type,
	fillChar?: string
) => MTypes.OneArgFunction<string, Option.Option<MTypes.Pair<CVReal.Type, string>>> = flow(
	_toBigDecimalExtractor,
	Function.compose(
		Option.flatMap(([value, parsedText, sign]) =>
			pipe(
				value,
				CVReal.fromBigDecimalOption,
				Option.map(
					flow(
						Number.multiply(sign) as unknown as MTypes.OneArgFunction<CVReal.Type>,
						Tuple.make,
						Tuple.appendElement(parsedText)
					)
				)
			)
		)
	)
);

/**
 * Same as `toRealExtractor` but the returned parser throws in case of failure
 *
 * @category Parsing
 */

export const toThrowingRealExtractor =
	(self: Type, fillChar?: string) =>
	(text: string): MTypes.Pair<CVReal.Type, string> =>
		pipe(
			text,
			toRealExtractor(self, fillChar),
			Option.getOrThrowWith(
				() => new Error(`A Real could not be parsed from the start of '${text}'`)
			)
		);

/**
 * Same as `toBigDecimalExtractor` but the whole of the input text must represent a number, not just
 * its start
 *
 * @category Parsing
 */
export const toBigDecimalParser = (
	self: Type,
	fillChar?: string
): MTypes.OneArgFunction<string, Option.Option<BigDecimal.BigDecimal>> => {
	const extractor = toBigDecimalExtractor(self, fillChar);
	return (text) =>
		pipe(
			text,
			extractor,
			Option.flatMap(
				flow(
					Option.liftPredicate(
						flow(Tuple.getSecond, String.length, MPredicate.strictEquals(text.length))
					),
					Option.map(Tuple.getFirst)
				)
			)
		);
};

/**
 * Same as `toBigDecimalParser` but the returned parser throws in case of failure
 *
 * @category Parsing
 */

export const toThrowingBigDecimalParser =
	(self: Type, fillChar?: string) =>
	(text: string): BigDecimal.BigDecimal =>
		pipe(
			text,
			toBigDecimalParser(self, fillChar),
			Option.getOrThrowWith(() => new Error(`A BigDecimal could not be parsed from '${text}'`))
		);

/**
 * Same as `toRealExtractor` but the whole of the input text must represent a number, not just its
 * start
 *
 * @category Parsing
 */
export const toRealParser = (
	self: Type,
	fillChar?: string
): MTypes.OneArgFunction<string, Option.Option<CVReal.Type>> => {
	const extractor = toRealExtractor(self, fillChar);
	return (text) =>
		pipe(
			text,
			extractor,
			Option.flatMap(
				flow(
					Option.liftPredicate(
						flow(Tuple.getSecond, String.length, MPredicate.strictEquals(text.length))
					),
					Option.map(Tuple.getFirst)
				)
			)
		);
};

/**
 * Same as `toRealParser` but the returned parser throws in case of failure
 *
 * @category Parsing
 */

export const toThrowingRealParser =
	(self: Type, fillChar?: string) =>
	(text: string): CVReal.Type =>
		pipe(
			text,
			toRealParser(self, fillChar),
			Option.getOrThrowWith(() => new Error(`A Real could not be parsed from '${text}'`))
		);

/**
 * Returns a function that tries to format a `number` respecting the options represented by
 * `self`and an optional parameter `fillChars`. If successful, that function returns a `Some` of the
 * formatted number. Otherwise, it returns a `None`. `number` can be of type number or `BigDecimal`
 * for better accuracy. There is a difference between number and `BigDecimal` (and bigint) regarding
 * the sign of 0. In Javascript, Object.is(0,-0) is false whereas Object.is(0n,-0n) is true. So if
 * the sign of zero is important to you, prefer passing a number to the function. `0` as a
 * BigDecimal will always be interpreted as a positive `0` as we have no means of knowing if it is
 * negative or positive.
 *
 * `fillChars` is a string whose first characters will be inserted between the sign and the number
 * (or at the start of the number if it is unsigned) so that the formatted number has at least the
 * same number of characters as fillChars (e.g. the result will be '-02' if you try to format the
 * value -2 with fillChars = '000')
 *
 * @category Formatting
 */
export const toNumberFormatter = (
	self: Type,
	fillChars = ''
): MTypes.OneArgFunction<BigDecimal.BigDecimal | CVReal.Type, string> => {
	const rounder =
		self.maximumFractionalDigits === +Infinity ?
			Function.identity
		:	pipe(
				{
					precision: self.maximumFractionalDigits,
					roundingMode: self.roundingMode
				},
				CVRoundingOption.make,
				CVRoundingOption.toBigDecimalRounder
			);
	const signFormatter = SignDisplay.toFormatter(self.signDisplay);
	const mantissaAdjuster = ScientificNotation.toMantissaAdjuster(self.scientificNotation);
	const hasThousandSeparator = self.thousandSeparator !== '';
	const eNotationChar = pipe(
		self.eNotationChars,
		Array.get(0),
		Option.getOrElse(MFunction.constEmptyString)
	);
	const takeNFirstCharsOfFillChars = MFunction.flipDual(String.takeLeft)(fillChars);

	return (number) => {
		const [sign, selfAsBigDecimal] =
			MTypes.isNumber(number) ?
				Tuple.make(
					number < 0 || Object.is(-0, number) ? (-1 as const) : (1 as const),
					BigDecimal.unsafeFromNumber(number)
				)
			:	Tuple.make(number.value < 0 ? (-1 as const) : (1 as const), number);

		const [adjusted, exponent] = mantissaAdjuster(selfAsBigDecimal);
		const absRounded = pipe(adjusted, rounder, BigDecimal.abs);
		const [integerPart, fractionalPart] = pipe(
			absRounded,
			MBigDecimal.truncatedAndFollowingParts()
		);

		const signString = signFormatter({ sign, isZero: BigDecimal.isZero(absRounded) });

		const normalizedFractionalPart = BigDecimal.normalize(fractionalPart);

		const fractionalPartString = pipe(
			normalizedFractionalPart.value,
			Option.liftPredicate(Predicate.not(MBigInt.isZero)),
			Option.map(MString.fromNonNullablePrimitive),
			Option.getOrElse(MFunction.constEmptyString),
			String.padStart(normalizedFractionalPart.scale, '0'),
			String.padEnd(self.minimumFractionalDigits, '0'),
			Option.liftPredicate(String.isNonEmpty),
			Option.map(MString.prepend(self.fractionalSeparator)),
			Option.getOrElse(MFunction.constEmptyString)
		);

		const integerPartString = pipe(
			integerPart.value.toString(),
			MFunction.fIfTrue({
				condition: hasThousandSeparator,
				f: flow(
					MString.splitEquallyRestAtStart(MRegExpString.DIGIT_GROUP_SIZE),
					Array.intersperse(self.thousandSeparator),
					Array.join('')
				)
			}),
			Either.liftPredicate(
				Predicate.not(MPredicate.strictEquals('0')),
				MFunction.fIfTrue({
					condition: !self.showNullIntegerPart && fractionalPartString.length !== 0,
					f: MFunction.constEmptyString
				})
			),
			Either.merge
		);

		const exponentString = pipe(
			exponent,
			Option.map(flow(MString.fromNumber(10), MString.prepend(eNotationChar))),
			Option.getOrElse(MFunction.constEmptyString)
		);

		const numberString = integerPartString + fractionalPartString + exponentString;

		const pad = pipe(
			fillChars.length,
			Number.subtract(signString.length),
			Number.subtract(numberString.length),
			Number.max(0),
			takeNFirstCharsOfFillChars
		);

		return signString + pad + numberString;
	};
};

/**
 * Returns a copy of `self` with `minimumFractionalDigits` and `maximumFractionalDigits` set to `n`.
 * `n` must be a finite positive integer
 *
 * @category Modifiers
 */
export const withNDecimals = (decimalNumber: number): MTypes.OneArgFunction<Type> =>
	flow(
		MStruct.append({
			minimumFractionalDigits: decimalNumber,
			maximumFractionalDigits: decimalNumber
		}),
		make
	);

/**
 * Returns a copy of `self` with `maximumFractionalDigits` set to `n`. `n` must be a positive
 * integer (`+Infinity` allowed). Pass 0 for an integer format
 *
 * @category Modifiers
 */
export const withMaxNDecimals =
	(maxDecimalNumber: number) =>
	(self: Type): Type =>
		pipe(
			self,
			MStruct.append({
				minimumFractionalDigits: Math.min(self.minimumFractionalDigits, maxDecimalNumber),
				maximumFractionalDigits: maxDecimalNumber
			}),
			make
		);

/**
 * Returns a copy of `self` with `minimumFractionalDigits` set to `n`. `n` must be a finite positive
 * integer
 *
 * @category Modifiers
 */
export const withMinNDecimals =
	(minDecimalNumber: number) =>
	(self: Type): Type =>
		pipe(
			self,
			MStruct.append({
				minimumFractionalDigits: minDecimalNumber,
				maximumFractionalDigits: Math.max(self.maximumFractionalDigits, minDecimalNumber)
			}),
			make
		);

/**
 * Returns a copy of `self` with `scientificNotation` set to `None`
 *
 * @category Modifiers
 */
export const withNoScientificNotation: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		scientificNotation: ScientificNotation.None
	}),
	make
);

/**
 * Returns a copy of `self` with `scientificNotation` set to `Standard`
 *
 * @category Modifiers
 */
export const withStandardScientificNotation: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		scientificNotation: ScientificNotation.Standard
	}),
	make
);

/**
 * Returns a copy of `self` with `scientificNotation` set to `Normalized`
 *
 * @category Modifiers
 */
export const withNormalizedScientificNotation: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		scientificNotation: ScientificNotation.Normalized
	}),
	make
);

/**
 * Returns a copy of `self` with `scientificNotation` set to `Engineering`
 *
 * @category Modifiers
 */
export const withEngineeringScientificNotation: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		scientificNotation: ScientificNotation.Engineering
	}),
	make
);

/**
 * Returns a copy of `self` with `thousandSeparator` set to `thousandSeparator`
 *
 * @category Modifiers
 */
export const withThousandSeparator = (thousandSeparator: string): MTypes.OneArgFunction<Type> =>
	flow(
		MStruct.append({
			thousandSeparator
		}),
		make
	);

/**
 * Returns a copy of `self` with `thousandSeparator` set to ''
 *
 * @category Modifiers
 */
export const withoutThousandSeparator: MTypes.OneArgFunction<Type> = withThousandSeparator('');

/**
 * Returns a copy of `self` with `fractionalSeparator` set to `fractionalSeparator`
 *
 * @category Modifiers
 */
export const withFractionalSeparator = (fractionalSeparator: string): MTypes.OneArgFunction<Type> =>
	flow(
		MStruct.append({
			fractionalSeparator: fractionalSeparator
		}),
		make
	);

/**
 * Returns a copy of `self` with `signDisplay` set to `Auto`
 *
 * @category Modifiers
 */
export const withSignDisplayForNegative: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		signDisplay: SignDisplay.Auto
	}),
	make
);

/**
 * Returns a copy of `self` with `signDisplay` set to `Always`
 *
 * @category Modifiers
 */
export const withSignDisplay: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		signDisplay: SignDisplay.Always
	}),
	make
);

/**
 * Returns a copy of `self` with `signDisplay` set to `ExceptZero`
 *
 * @category Modifiers
 */
export const withSignDisplayExceptZero: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		signDisplay: SignDisplay.ExceptZero
	}),
	make
);

/**
 * Returns a copy of `self` with `signDisplay` set to `Negative`
 *
 * @category Modifiers
 */
export const withSignDisplayForNegativeExceptZero: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		signDisplay: SignDisplay.Negative
	}),
	make
);

/**
 * Returns a copy of `self` with `signDisplay` set to `Never`
 *
 * @category Modifiers
 */
export const withoutSignDisplay: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		signDisplay: SignDisplay.Never
	}),
	make
);

/**
 * Returns a copy of `self` with `roundingMode` set to `Ceil`
 *
 * @category Modifiers
 */
export const withCeilRoundingMode: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		roundingMode: CVRoundingMode.Type.Ceil
	}),
	make
);
/**
 * Returns a copy of `self` with `roundingMode` set to `Floor`
 *
 * @category Modifiers
 */
export const withFloorRoundingMode: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		roundingMode: CVRoundingMode.Type.Floor
	}),
	make
);

/**
 * Returns a copy of `self` with `roundingMode` set to `Expand`
 *
 * @category Modifiers
 */
export const withExpandRoundingMode: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		roundingMode: CVRoundingMode.Type.Expand
	}),
	make
);

/**
 * Returns a copy of `self` with `roundingMode` set to `Trunc`
 *
 * @category Modifiers
 */
export const withTruncRoundingMode: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		roundingMode: CVRoundingMode.Type.Trunc
	}),
	make
);

/**
 * Returns a copy of `self` with `roundingMode` set to `HalfCeil`
 *
 * @category Modifiers
 */
export const withHalfCeilRoundingMode: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		roundingMode: CVRoundingMode.Type.HalfCeil
	}),
	make
);

/**
 * Returns a copy of `self` with `roundingMode` set to `HalfFloor`
 *
 * @category Modifiers
 */
export const withHalfFloorRoundingMode: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		roundingMode: CVRoundingMode.Type.HalfFloor
	}),
	make
);

/**
 * Returns a copy of `self` with `roundingMode` set to `HalfExpand`
 *
 * @category Modifiers
 */
export const withHalfExpandRoundingMode: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		roundingMode: CVRoundingMode.Type.HalfExpand
	}),
	make
);

/**
 * Returns a copy of `self` with `roundingMode` set to `HalfTrunc`
 *
 * @category Modifiers
 */
export const withHalfTruncRoundingMode: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		roundingMode: CVRoundingMode.Type.HalfTrunc
	}),
	make
);

/**
 * Returns a copy of `self` with `roundingMode` set to `HalfEven`
 *
 * @category Modifiers
 */
export const withHalfEvenRoundingMode: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		roundingMode: CVRoundingMode.Type.HalfEven
	}),
	make
);

/**
 * Returns a copy of `self` with `showNullIntegerPart` set to `false`
 *
 * @category Modifiers
 */
export const withNullIntegerPartNotShowing: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		showNullIntegerPart: false
	}),
	make
);

/**
 * Returns a copy of `self` with `showNullIntegerPart` set to `true`
 *
 * @category Modifiers
 */
export const withNullIntegerPartShowing: MTypes.OneArgFunction<Type> = flow(
	MStruct.append({
		showNullIntegerPart: true
	}),
	make
);

/**
 * `CVNumberBase10Format` instance that uses a comma as fractional separator, a space as thousand
 * separator and shows at most three fractional digits. Used in countries like France,
 * French-speaking Canada, French-speaking Belgium, Denmark, Finland, Sweden...
 *
 * @category Instances
 */
export const frenchStyleNumber: Type = make({
	thousandSeparator: ' ',
	fractionalSeparator: ',',
	showNullIntegerPart: true,
	minimumFractionalDigits: 0,
	maximumFractionalDigits: 3,
	eNotationChars: ['e', 'E'],
	scientificNotation: ScientificNotation.None,
	roundingMode: CVRoundingMode.Type.HalfExpand,
	signDisplay: SignDisplay.Negative
});

/**
 * `CVNumberBase10Format` instance that uses a comma as fractional separator, no thousand separator
 * and shows at most three fractional digits. Used in countries like France, French-speaking Canada,
 * French-speaking Belgium, Denmark, Finland, Sweden...
 *
 * @category Instances
 */
export const frenchStyleUngroupedNumber: Type = pipe(frenchStyleNumber, withoutThousandSeparator);

/**
 * French-style integer `CVNumberBase10Format` instance. Used in countries like France,
 * French-speaking Canada, French-speaking Belgium, Denmark, Finland, Sweden...
 *
 * @category Instances
 */
export const frenchStyleInteger: Type = pipe(frenchStyleNumber, withMaxNDecimals(0));

/**
 * `CVNumberBase10Format` instance that uses a comma as fractional separator, a dot as thousand
 * separator and shows at most three fractional digits. Used in countries like Dutch-speaking
 * Belgium, the Netherlands, Germany, Italy, Norway, Croatia, Spain...
 *
 * @category Instances
 */
export const dutchStyleNumber: Type = pipe(
	frenchStyleNumber,
	MStruct.append({
		thousandSeparator: '.'
	}),
	make
);

/**
 * `CVNumberBase10Format` instance that uses a comma as fractional separator, no thousand separator
 * and shows at most three fractional digits. Used in countries like Dutch-speaking Belgium, the
 * Netherlands, Germany, Italy, Norway, Croatia, Spain...
 *
 * @category Instances
 */
export const dutchStyleUngroupedNumber: Type = pipe(dutchStyleNumber, withoutThousandSeparator);

/**
 * Dutch-style integer `CVNumberBase10Format` instance. Used in countries like Dutch-speaking
 * Belgium, the Netherlands, Germany, Italy, Norway, Croatia, Spain...
 *
 * @category Instances
 */
export const dutchStyleInteger: Type = pipe(dutchStyleNumber, withMaxNDecimals(0));

/**
 * `CVNumberBase10Format` instance that uses a dot as fractional separator, a comma as thousand
 * separator and shows at most three fractional digits. Used in countries like the UK, the US,
 * English-speaking Canada, Australia, Thaïland, Bosnia...
 *
 * @category Instances
 */
export const ukStyleNumber: Type = pipe(
	frenchStyleNumber,
	MStruct.append({
		fractionalSeparator: '.',
		thousandSeparator: ','
	}),
	make
);

/**
 * `CVNumberBase10Format` instance that uses a dot as fractional separator, no thousand separator
 * and shows at most three fractional digits. Used in countries like the UK, the US,
 * English-speaking Canada, Australia, Thaïland, Bosnia...
 *
 * @category Instances
 */
export const ukStyleUngroupedNumber: Type = pipe(ukStyleNumber, withoutThousandSeparator);

/**
 * Uk-style integer `CVNumberBase10Format` instance. Used in countries like the UK, the US,
 * English-speaking Canada, Australia, Thaïland, Bosnia...
 *
 * @category Instances
 */
export const ukStyleInteger: Type = pipe(ukStyleNumber, withMaxNDecimals(0));

/**
 * Integer `CVNumberBase10Format` instance with no thousand separator
 *
 * @category Instances
 */
export const integer: Type = pipe(frenchStyleInteger, withoutThousandSeparator);
