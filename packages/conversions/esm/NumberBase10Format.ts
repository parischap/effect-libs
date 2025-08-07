/**
 * This module implements conversions from number to string and string to number in base-10
 * notation.
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

export const moduleTag = '@parischap/conversions/NumberBase10Format/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Possible sign display options
 *
 * @category Models
 */
export enum SignDisplay {
	/**
	 * Conversion from number to string: sign display for negative numbers only, including negative
	 * zero.
	 *
	 * Conversion from string to number: conversion will fail if a positive sign is used.
	 */
	Auto = 0,

	/**
	 * Conversion from number to string: sign display for all numbers.
	 *
	 * Conversion from string to number: conversion will fail if no sign is present
	 */
	Always = 1,

	/**
	 * Conversion from number to string: sign display for positive and negative numbers, but not zero
	 *
	 * Conversion from string to number: conversion will fail if a sign is not present for a value
	 * other than 0 or if a sign is present for 0.
	 */
	ExceptZero = 2,

	/**
	 * Conversion from number to string: sign display for negative numbers only, excluding negative
	 * zero.
	 *
	 * Conversion from string to number: conversion will fail if a positive sign is used or if a
	 * negative sign is used for 0.
	 */
	Negative = 3,

	/**
	 * Conversion from number to string: no sign display.
	 *
	 * Conversion from string to number: conversion will fail if any sign is present. The number will
	 * be treated as positive.
	 */
	Never = 4
}

export namespace SignDisplay {
	/**
	 * Type that represents the possible strings for a sign
	 *
	 * @category Models
	 */
	export type SignString = '-' | '+' | '';

	/**
	 * Type that represents the possible values for a sign
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
 * Possible scientific notation options
 *
 * @category Models
 */
export enum ScientificNotation {
	/**
	 * Conversion from number to string: scientific notation is not used.
	 *
	 * Conversion from string to number: conversion will fail if a scientific notation is present.
	 */
	None = 0,

	/**
	 * Conversion from number to string: scientific notation is not used.
	 *
	 * Conversion from string to number: scientific notation may be used but is not mandatory.
	 */
	Standard = 1,

	/**
	 * Conversion from number to string: scientific notation is used so that the absolute value of the
	 * mantissa m fulfills 1 ≤ |m| < 10. Number 0 will be displayed as `0e0`.
	 *
	 * Conversion from string to number: the conversion will fail if the mantissa is not null and its
	 * value m does not fulfill 1 ≤ |m| < 10. Scientific notation may be used but is not mandatory. A
	 * string that does not contain a scientific notation is deemed equivalent to a string with a null
	 * exponent.
	 */
	Normalized = 2,

	/**
	 * Conversion from number to string: scientific notation is used so that the mantissa m fulfills 1
	 * ≤ |m| < 1000 and the exponent is a multiple of 3. Number 0 will be displayed as `0e0`.
	 *
	 * Conversion from string to number: the conversion will fail if the mantissa is not null and its
	 * value m does not fulfill 1 ≤ |m| < 1000 or if the exponent is not a multiple of 3. Scientific
	 * notation may be used but is not mandatory. A string that does not contain a scientific notation
	 * is deemed equivalent to a string with a null exponent.
	 */
	Engineering = 3
}

/**
 * Namespace for possible scientific notation options
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
 * Type that represents a NumberBase10Format.
 *
 * @category Models
 */
export interface Type extends MInspectable.Type, Pipeable.Pipeable {
	/** Descriptor of this NumberFormat instance. Used for debugging purposes only */
	readonly descriptor: string;

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
	 * Conversion from number to string:
	 *
	 * - If `true` or if `maximumFractionDigits===0`, numbers with a null integer part are displayed
	 *   starting with '0'. Otherwise, they are displayed starting with '.'.
	 *
	 * Conversion from string to number
	 *
	 * - If `true`, conversion will fail for numbers starting with '.' (after an optional sign).
	 * - If `false`, conversion will fail for numbers starting with '0.' (after an optional sign).
	 */
	readonly showNullIntegerPart: boolean;

	/**
	 * Minimim number of digits forming the fractional part of a number. Must be a positive integer
	 * (>=0) less than or equal to `maximumFractionDigits`.
	 *
	 * Conversion from number to string: the string will be right-padded with `0`'s if necessary to
	 * respect the condition
	 *
	 * Conversion from string to number: will fail if the input string does not respect this condition
	 * (the string must be right-padded with `0`'s to respect the condition if necessary).
	 */
	readonly minimumFractionDigits: number;

	/**
	 * Maximum number of digits forming the fractional part of a number. Must be an integer value
	 * greater than or equal to `minimumFractionDigits`. Can take the +Infinity value.
	 *
	 * Conversion from number to string: the number will be rounded using the roundingMode to respect
	 * the condition.
	 *
	 * Conversion from string to number: will fail if the input string does not respect this
	 * condition.
	 */
	readonly maximumFractionDigits: number;

	/**
	 * Possible characters to use to represent e-notation. Usually ['e','E']. Must be an array of
	 * one-character strings. Will not throw otherwise but unexpected results will occur. Not used if
	 * `scientificNotation === None`
	 *
	 * Conversion from number to string: the string at index 0 is used
	 *
	 * Conversion from string to number: the first character of the e-notation must be one of the
	 * one-character strings present in the array
	 */
	readonly eNotationChars: ReadonlyArray<string>;

	/** Scientific notation options. See ScientificNotation */
	readonly scientificNotation: ScientificNotation;

	/** Rounding mode options. See RoundingMode */
	readonly roundingMode: CVRoundingMode.Type;

	/** Sign display options. See SignDisplay */
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
	[MInspectable.IdSymbol](this: Type) {
		return this.descriptor;
	},
	...MInspectable.BaseProto(moduleTag),
	toJSON(this: Type): unknown {
		return this.descriptor !== '' ? this.descriptor : { _id: moduleTag, ...this };
	},
	toString(this: Type): string {
		return this.descriptor !== '' ? this.descriptor : Inspectable.BaseProto.toString.call(this);
	},
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
 * Returns the `descriptor` property of `self`
 *
 * @category Destructors
 */
export const descriptor: MTypes.OneArgFunction<Type, string> = Struct.get('descriptor');

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
 * Returns the `minimumFractionDigits` property of `self`
 *
 * @category Destructors
 */
export const minimumFractionDigits: MTypes.OneArgFunction<Type, number> =
	Struct.get('minimumFractionDigits');

/**
 * Returns the `maximumFractionDigits` property of `self`
 *
 * @category Destructors
 */
export const maximumFractionDigits: MTypes.OneArgFunction<Type, number> =
	Struct.get('maximumFractionDigits');

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
 * Returns a function that tries to read a number respecting the options represented by `self` from
 * the start of a string `text`. If successful, that function returns a `some` containing `readText`
 * (the part of `text` that could be analyzed as representing a number) and `value` (`readText`
 * converted to a BigDecimal value). Otherwise, it returns a `none`.
 *
 * @category Destructors
 */
export const toBigDecimalExtractor = (
	self: Type
): MTypes.OneArgFunction<
	string,
	Option.Option<[value: BigDecimal.BigDecimal, readText: string]>
> => {
	const removeThousandSeparator = MString.removeNCharsEveryMCharsFromRight({
		m: MRegExpString.DIGIT_GROUP_SIZE,
		n: self.thousandSeparator.length
	});

	const getParts = MString.matchAndGroups(
		pipe(self, MRegExpString.base10Number, MRegExpString.atStart, RegExp),
		4
	);

	const signParser = SignDisplay.toParser(self.signDisplay);

	const exponentParser = ScientificNotation.toParser(self.scientificNotation);

	const mantissaChecker = ScientificNotation.toMantissaChecker(self.scientificNotation);

	return (text) =>
		Option.gen(function* () {
			const [match, [signPart, mantissaIntegerPart, mantissaFractionalPart, exponentPart]] =
				yield* getParts(text);

			const mantissaFractionalPartLength = yield* pipe(
				mantissaFractionalPart,
				String.length,
				Option.liftPredicate(
					Number.between({
						minimum: self.minimumFractionDigits,
						maximum: self.maximumFractionDigits
					})
				)
			);

			const mantissa = yield* pipe(
				mantissaIntegerPart,
				Option.liftPredicate(String.isNonEmpty),
				Option.match({
					onNone: () =>
						self.showNullIntegerPart || mantissaFractionalPartLength === 0 ?
							Option.none()
						:	Option.some(MBigDecimal.zero),
					onSome: flow(
						self.showNullIntegerPart || mantissaFractionalPartLength === 0 ?
							Option.some
						:	Option.liftPredicate(Predicate.not(MPredicate.strictEquals('0'))),
						Option.map(flow(removeThousandSeparator, MBigDecimal.unsafeFromIntString(0)))
					)
				}),
				Option.map(
					BigDecimal.sum(
						pipe(
							mantissaFractionalPart,
							Option.liftPredicate(String.isNonEmpty),
							Option.map(MBigDecimal.unsafeFromIntString(mantissaFractionalPartLength)),
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
				pipe(
					BigDecimal.make(checkedMantissa.value, checkedMantissa.scale - exponent),
					BigDecimal.multiply(BigDecimal.unsafeFromNumber(sign))
				),
				match
			);
		});
};

/**
 * Same as `toBigDecimalExtractor` but returns a `Real` which is the most usual use case
 *
 * @category Destructors
 */
export const toRealExtractor = (
	self: Type
): MTypes.OneArgFunction<string, Option.Option<[value: CVReal.Type, readText: string]>> =>
	flow(
		toBigDecimalExtractor(self),
		Option.flatMap(
			flow(
				Tuple.mapBoth({
					onFirst: CVReal.fromBigDecimalOption,
					onSecond: Option.some
				}),
				Option.all
			)
		)
	);

/**
 * Returns a function that tries to read a number respecting the options represented by `self` from
 * the whole of a string `text`. If successful, that function returns a `some` of a BigDecimal.
 * Otherwise, it returns a `none`.
 *
 * @category Destructors
 */
export const toBigDecimalParser = (
	self: Type
): MTypes.OneArgFunction<string, Option.Option<BigDecimal.BigDecimal>> => {
	const extractor = toBigDecimalExtractor(self);
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
 * Same as `toBigDecimalParser` but returns a `Real` which is the most usual use case
 *
 * @category Destructors
 */
export const toRealParser = (
	self: Type
): MTypes.OneArgFunction<string, Option.Option<CVReal.Type>> =>
	flow(toBigDecimalParser(self), Option.flatMap(CVReal.fromBigDecimalOption));

/**
 * Returns a function that tries to write `number` respecting the options represented by `self`. If
 * successful, that function returns a `some` of `number` converted to a string. Otherwise, it
 * returns a `none`. `number` can be of type number or BigDecimal for better accuracy. There is a
 * difference between number and BigDecimal (and bigint) regarding the sign of 0. In Javascript,
 * Object.is(0,-0) is false whereas Object.is(0n,-0n) is true. So if the sign of zero is important
 * to you, prefer passing a number to the function. `0` as a BigDecimal will always be interpreted
 * as a positive `0` as we have no means of knowing if it is negative or positive.
 *
 * @category Destructors
 */
export const toNumberFormatter = (
	self: Type
): MTypes.OneArgFunction<BigDecimal.BigDecimal | CVReal.Type, string> => {
	const rounder =
		self.maximumFractionDigits === +Infinity ?
			Function.identity
		:	pipe(
				{
					precision: self.maximumFractionDigits,
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

		const signAsString = signFormatter({ sign, isZero: BigDecimal.isZero(absRounded) });

		const normalizedFractionalPart = BigDecimal.normalize(fractionalPart);

		const fractionalPartAsString = pipe(
			normalizedFractionalPart.value,
			Option.liftPredicate(Predicate.not(MBigInt.isZero)),
			Option.map(MString.fromNonNullablePrimitive),
			Option.getOrElse(MFunction.constEmptyString),
			String.padStart(normalizedFractionalPart.scale, '0'),
			String.padEnd(self.minimumFractionDigits, '0'),
			Option.liftPredicate(String.isNonEmpty),
			Option.map(MString.prepend(self.fractionalSeparator)),
			Option.getOrElse(MFunction.constEmptyString)
		);

		const integerPartAsString = pipe(
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
					condition: !self.showNullIntegerPart && fractionalPartAsString.length !== 0,
					f: MFunction.constEmptyString
				})
			),
			Either.merge
		);

		const exponentAsString = pipe(
			exponent,
			Option.map(flow(MString.fromNumber(10), MString.prepend(eNotationChar))),
			Option.getOrElse(MFunction.constEmptyString)
		);
		return signAsString + integerPartAsString + fractionalPartAsString + exponentAsString;
	};
};

/**
 * Combinator that returns a copy of self with `minimumFractionDigits` and `maximumFractionDigits`
 * set to `n`. `n` must be a finite positive integer.
 *
 * @category Utils
 */
export const withNDecimals =
	(decimalNumber: number, descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			minimumFractionDigits: decimalNumber,
			maximumFractionDigits: decimalNumber
		});

/**
 * Combinator that returns a copy of self with `maximumFractionDigits` set to `n`. `n` must be a
 * positive integer. Pass 0 for an integer format.
 *
 * @category Utils
 */
export const withMaxNDecimals =
	(maxDecimalNumber: number, descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			minimumFractionDigits: Math.min(self.minimumFractionDigits, maxDecimalNumber),
			maximumFractionDigits: maxDecimalNumber
		});

/**
 * Combinator that returns a copy of self with `minimumFractionDigits` set to `n`. `n` must be a
 * finite positive integer.
 *
 * @category Utils
 */
export const withMinNDecimals =
	(minDecimalNumber: number, descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			minimumFractionDigits: minDecimalNumber,
			maximumFractionDigits: Math.max(self.maximumFractionDigits, minDecimalNumber)
		});

/**
 * Combinator that returns a copy of self with `scientificNotation` set to `None`.
 *
 * @category Utils
 */
export const withNoScientificNotation =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			scientificNotation: ScientificNotation.None
		});

/**
 * Combinator that returns a copy of self with `scientificNotation` set to `Standard`.
 *
 * @category Utils
 */
export const withStandardScientificNotation =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			scientificNotation: ScientificNotation.Standard
		});

/**
 * Combinator that returns a copy of self with `scientificNotation` set to `Normalized`.
 *
 * @category Utils
 */
export const withNormalizedScientificNotation =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			scientificNotation: ScientificNotation.Normalized
		});

/**
 * Combinator that returns a copy of self with `scientificNotation` set to `Engineering`.
 *
 * @category Utils
 */
export const withEngineeringScientificNotation =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			scientificNotation: ScientificNotation.Engineering
		});

/**
 * Combinator that returns a copy of self with `thousandSeparator` set to ''.
 *
 * @category Utils
 */
export const withoutThousandSeparator =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			thousandSeparator: ''
		});

/**
 * Combinator that returns a copy of self with `signDisplay` set to `Auto`.
 *
 * @category Utils
 */
export const withSignDisplayForNegative =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			signDisplay: SignDisplay.Auto
		});

/**
 * Combinator that returns a copy of self with `signDisplay` set to `Always`.
 *
 * @category Utils
 */
export const withSignDisplay =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			signDisplay: SignDisplay.Always
		});

/**
 * Combinator that returns a copy of self with `signDisplay` set to `ExceptZero`.
 *
 * @category Utils
 */
export const withSignDisplayExceptZero =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			signDisplay: SignDisplay.ExceptZero
		});

/**
 * Combinator that returns a copy of self with `signDisplay` set to `Negative`.
 *
 * @category Utils
 */
export const withSignDisplayForNegativeExceptZero =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			signDisplay: SignDisplay.Negative
		});

/**
 * Combinator that returns a copy of self with `signDisplay` set to `Never`.
 *
 * @category Utils
 */
export const withoutSignDisplay =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			signDisplay: SignDisplay.Never
		});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `Ceil`.
 *
 * @category Utils
 */
export const withCeilRoundingMode =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			roundingMode: CVRoundingMode.Type.Ceil
		});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `Floor`.
 *
 * @category Utils
 */
export const withFloorRoundingMode =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			roundingMode: CVRoundingMode.Type.Floor
		});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `Expand`.
 *
 * @category Utils
 */
export const withExpandRoundingMode =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			roundingMode: CVRoundingMode.Type.Expand
		});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `Trunc`.
 *
 * @category Utils
 */
export const withTruncRoundingMode =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			roundingMode: CVRoundingMode.Type.Trunc
		});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `HalfCeil`.
 *
 * @category Utils
 */
export const withHalfCeilRoundingMode =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			roundingMode: CVRoundingMode.Type.HalfCeil
		});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `HalfFloor`.
 *
 * @category Utils
 */
export const withHalfFloorRoundingMode =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			roundingMode: CVRoundingMode.Type.HalfFloor
		});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `HalfExpand`.
 *
 * @category Utils
 */
export const withHalfExpandRoundingMode =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			roundingMode: CVRoundingMode.Type.HalfExpand
		});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `HalfTrunc`.
 *
 * @category Utils
 */
export const withHalfTruncRoundingMode =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			roundingMode: CVRoundingMode.Type.HalfTrunc
		});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `HalfEven`.
 *
 * @category Utils
 */
export const withHalfEvenRoundingMode =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			roundingMode: CVRoundingMode.Type.HalfEven
		});

/**
 * Combinator that returns a copy of self with `showNullIntegerPart` set to `false`.
 *
 * @category Utils
 */
export const withNullIntegerPartNotShowing =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			showNullIntegerPart: false
		});

/**
 * Combinator that returns a copy of self with `showNullIntegerPart` set to `true`.
 *
 * @category Utils
 */
export const withNullIntegerPartShowing =
	(descriptor = '') =>
	(self: Type): Type =>
		make({
			...self,
			descriptor,
			showNullIntegerPart: true
		});

/**
 * NumberBase10Format instance that uses a comma as fractional separator and a space as thousand
 * separator. Used in countries like France, French-speaking Canada, French-speaking Belgium,
 * Denmark, Finland, Sweden...
 *
 * @category Instances
 */
export const frenchStyleThreeDecimalNumber: Type = make({
	descriptor: 'French-style three-decimal number',
	thousandSeparator: ' ',
	fractionalSeparator: ',',
	showNullIntegerPart: true,
	minimumFractionDigits: 0,
	maximumFractionDigits: 3,
	eNotationChars: ['E', 'e'],
	scientificNotation: ScientificNotation.None,
	roundingMode: CVRoundingMode.Type.HalfExpand,
	signDisplay: SignDisplay.Negative
});

/**
 * NumberBase10Format instance that uses a comma as fractional separator and no thousand separator.
 * Used in countries like France, French-speaking Canada, French-speaking Belgium, Denmark, Finland,
 * Sweden...
 *
 * @category Instances
 */
export const frenchStyleUngroupedThreeDecimalNumber: Type = pipe(
	frenchStyleThreeDecimalNumber,
	withoutThousandSeparator('French-style three-decimal number (no digit grouping)')
);

/**
 * French-style integer NumberBase10Format instance. Used in countries like France, French-speaking
 * Canada, French-speaking Belgium, Denmark, Finland, Sweden...
 *
 * @category Instances
 */
export const frenchStyleInteger: Type = pipe(
	frenchStyleThreeDecimalNumber,
	withMaxNDecimals(0, 'French-style integer')
);

/**
 * NumberBase10Format instance that uses a comma as fractional separator and a dot as thousand
 * separator. Used in countries like Dutch-speaking Belgium, the Netherlands, Germany, Italy,
 * Norway, Croatia, Spain...
 *
 * @category Instances
 */
export const dutchStyleThreeDecimalNumber: Type = pipe(
	frenchStyleThreeDecimalNumber,
	MStruct.append({
		descriptor: 'Dutch-style three-decimal number',
		thousandSeparator: '.'
	}),
	make
);

/**
 * NumberBase10Format instance that uses a comma as fractional separator and no thousand separator.
 * Used in countries like Dutch-speaking Belgium, the Netherlands, Germany, Italy, Norway, Croatia,
 * Spain...
 *
 * @category Instances
 */
export const dutchStyleUngroupedThreeDecimalNumber: Type = pipe(
	dutchStyleThreeDecimalNumber,
	withoutThousandSeparator('Dutch-style three-decimal number (no digit grouping)')
);

/**
 * Dutch-style integer NumberBase10Format instance. Used in countries like Dutch-speaking Belgium,
 * the Netherlands, Germany, Italy, Norway, Croatia, Spain...
 *
 * @category Instances
 */
export const dutchStyleInteger: Type = pipe(
	dutchStyleThreeDecimalNumber,
	withMaxNDecimals(0, 'Dutch-style integer')
);

/**
 * NumberBase10Format instance that uses a dot as fractional separator and a comma as thousand
 * separator. Used in countries like the UK, the US, English-speaking Canada, Australia, Thaïland,
 * Bosnia...
 *
 * @category Instances
 */
export const ukStyleThreeDecimalNumber: Type = pipe(
	frenchStyleThreeDecimalNumber,
	MStruct.append({
		descriptor: 'Uk-style three-decimal number',
		fractionalSeparator: '.',
		thousandSeparator: ','
	}),
	make
);

/**
 * NumberBase10Format instance that uses a dot as fractional separator and no thousand separator.
 * Used in countries like the UK, the US, English-speaking Canada, Australia, Thaïland, Bosnia...
 *
 * @category Instances
 */
export const ukStyleUngroupedThreeDecimalNumber: Type = pipe(
	ukStyleThreeDecimalNumber,
	withoutThousandSeparator('Uk-style three-decimal number (no digit grouping)')
);

/**
 * Uk-style integer NumberBase10Format instance. Used in countries like the UK, the US,
 * English-speaking Canada, Australia, Thaïland, Bosnia...
 *
 * @category Instances
 */
export const ukStyleInteger: Type = pipe(
	ukStyleThreeDecimalNumber,
	withMaxNDecimals(0, 'Uk-style integer')
);

/**
 * Integer NumberBase10Format instance with no thousand separator
 *
 * @category Instances
 */
export const integer: Type = pipe(frenchStyleInteger, withoutThousandSeparator('integer'));
