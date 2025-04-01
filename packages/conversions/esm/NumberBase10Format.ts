/** This module implements conversions from number to string and string to number in base-10 notation */

import {
	MBigDecimal,
	MFunction,
	MInspectable,
	MMatch,
	MNumber,
	MPipeable,
	MRegExpString,
	MString,
	MTypes
} from '@parischap/effect-lib';
import {
	BigDecimal,
	Equal,
	Equivalence,
	flow,
	Function,
	Hash,
	Number,
	Option,
	pipe,
	Pipeable,
	Predicate,
	String,
	Struct,
	Tuple
} from 'effect';

export const moduleTag = '@parischap/templater/NumberFormat10/';
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

/**
 * Possible rounding modes - Only used when converting from number to string
 *
 * @category Models
 */
export enum RoundingMode {
	/** Round toward +∞. Positive values round up. Negative values round "more positive" */
	Ceil = 0,
	/** Round toward -∞. Positive values round down. Negative values round "more negative" */
	Floor = 1,
	/**
	 * Round away from 0. The magnitude of the value is always increased by rounding. Positive values
	 * round up. Negative values round "more negative"
	 */
	Expand = 2,
	/**
	 * Round toward 0. The magnitude of the value is always reduced by rounding. Positive values round
	 * down. Negative values round "less negative"
	 */
	Trunc = 3,
	/**
	 * Ties toward +∞. Values above the half-increment round like "ceil" (towards +∞), and below like
	 * "floor" (towards -∞). On the half-increment, values round like "ceil"
	 */
	HalfCeil = 4,
	/**
	 * Ties toward -∞. Values above the half-increment round like "ceil" (towards +∞), and below like
	 * "floor" (towards -∞). On the half-increment, values round like "floor"
	 */
	HalfFloor = 5,
	/**
	 * Ties away from 0. Values above the half-increment round like "expand" (away from zero), and
	 * below like "trunc" (towards 0). On the half-increment, values round like "expand"
	 */
	HalfExpand = 6,
	/**
	 * Ties toward 0. Values above the half-increment round like "expand" (away from zero), and below
	 * like "trunc" (towards 0). On the half-increment, values round like "trunc"
	 */
	halfTrunc = 7,
	/**
	 * Ties towards the nearest even integer. Values above the half-increment round like "expand"
	 * (away from zero), and below like "trunc" (towards 0). On the half-increment values round
	 * towards the nearest even digit
	 */
	halfEven = 8
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
	 * mantissa m fulfills 1 ≤ |m| < 10. The exponent part is only displayed if the exponent is
	 * different from 0.
	 *
	 * Conversion from string to number: the conversion will fail if the absolute value of the
	 * mantissa m does not fulfill 1 ≤ |m| < 10. Scientific notation may be used but is not mandatory.
	 * A string that does not contain a scientific notation is deemed equivalent to a string with a
	 * null exponent.
	 */
	Normalized = 2,

	/**
	 * Conversion from number to string: scientific notation is used so that the mantissa m fulfills 1
	 * ≤ |m| < 1000 and the exponent is a multiple of 3. The exponent part is only displayed if the
	 * exponent is different from 0.
	 *
	 * Conversion from string to number: the conversion will fail if the absolute value of the
	 * mantissa m does not fulfill 1 ≤ |m| < 1000 or if the exponent is not a multiple of 3.
	 * Scientific notation may be used but is not mandatory. A string that does not contain a
	 * scientific notation is deemed equivalent to a string with a null exponent.
	 */
	Engineering = 3
}

/**
 * Type that represents a NumberBase10Format.
 *
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Type, Pipeable.Pipeable {
	/** Id of this NumberFormat instance. Useful for equality and debugging */
	readonly id: string;

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
	 * (>=0).
	 *
	 * Conversion from number to string: the string will be right-padded with `0`'s if necessary to
	 * respect the condition
	 *
	 * Conversion from string to number: will fail if the input string does not respect this condition
	 * (the string must be right-padded with `0`'s to respect the condition if necessary).
	 */
	readonly minimumFractionDigits: number;

	/**
	 * Maximum number of digits forming the fractional part of a number. Must be an integer value.
	 * Will be taken equal to `minimumFractionDigits` if strictly less than that value.
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
	readonly roundingMode: RoundingMode;

	/** Sign display options. See SignDisplay */
	readonly signDisplay: SignDisplay;

	/** @internal */
	readonly [_TypeId]: _TypeId;
}

/**
 * S Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/** Prototype */
const _TypeIdHash = Hash.hash(_TypeId);
const proto: MTypes.Proto<Type> = {
	[_TypeId]: _TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return pipe(this.id, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this));
	},
	[MInspectable.IdSymbol](this: Type) {
		return this.id;
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
 * Returns the `id` property of `self`
 *
 * @category Destructors
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

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
export const roundingMode: MTypes.OneArgFunction<Type, RoundingMode> = Struct.get('roundingMode');

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
export const toNumberExtracter = (
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

	const isPlusSign: Predicate.Predicate<string> = MFunction.strictEquals('+');
	const hasASign = Option.liftPredicate(String.isNonEmpty);
	const hasNoSign = Option.liftPredicate<string, string>(String.isEmpty);
	const hasNotPlusSign = Option.liftPredicate(Predicate.not(isPlusSign));

	const signTransformer = pipe(
		self.signDisplay,
		MMatch.make,
		MMatch.whenIs(SignDisplay.Auto, () => () => hasNotPlusSign),
		MMatch.whenIs(SignDisplay.Always, () => () => hasASign),
		MMatch.whenIs(SignDisplay.ExceptZero, () =>
			flow(
				MMatch.make<boolean>,
				MMatch.whenIs(true, Function.constant(hasNoSign)),
				MMatch.orElse(Function.constant(hasASign))
			)
		),
		MMatch.whenIs(SignDisplay.Negative, () =>
			flow(
				MMatch.make<boolean>,
				MMatch.whenIs(true, Function.constant(hasNoSign)),
				MMatch.orElse(Function.constant(hasNotPlusSign))
			)
		),
		MMatch.whenIs(SignDisplay.Never, () => () => hasNoSign),
		MMatch.exhaustive,
		Function.compose(
			Function.compose(
				Option.map(
					flow(
						Option.liftPredicate(isPlusSign),
						Option.as(1 as const),
						Option.getOrElse(Function.constant(-1 as const))
					)
				)
			)
		)
	);

	const stringToExponentOption = flow(
		Option.liftPredicate(String.isNonEmpty),
		Option.map(MNumber.unsafeFromString),
		Option.orElseSome(Function.constant(0))
	);

	const exponentTransformer = pipe(
		self.scientificNotation,
		MMatch.make,
		MMatch.whenIs(ScientificNotation.None, () =>
			flow(Option.liftPredicate(String.isEmpty), Option.as(0))
		),
		MMatch.whenIsOr(
			ScientificNotation.Standard,
			ScientificNotation.Normalized,
			() => stringToExponentOption
		),
		MMatch.whenIs(ScientificNotation.Engineering, () =>
			flow(stringToExponentOption, Option.filter(MNumber.isMultipleOf(3)))
		),
		MMatch.exhaustive
	);

	const mantissaIntegerPartChecker = pipe(
		self.scientificNotation,
		MMatch.make,
		MMatch.whenIsOr(
			ScientificNotation.None,
			ScientificNotation.Standard,
			() => Option.some<BigDecimal.BigDecimal>
		),
		MMatch.whenIs(ScientificNotation.Normalized, () =>
			Option.liftPredicate(
				Predicate.and(
					BigDecimal.greaterThanOrEqualTo(BigDecimal.unsafeFromNumber(1)),
					BigDecimal.lessThan(BigDecimal.unsafeFromNumber(10))
				)
			)
		),
		MMatch.whenIs(ScientificNotation.Engineering, () =>
			Option.liftPredicate(
				Predicate.and(
					BigDecimal.greaterThanOrEqualTo(BigDecimal.unsafeFromNumber(1)),
					BigDecimal.lessThan(BigDecimal.unsafeFromNumber(1000))
				)
			)
		),
		MMatch.exhaustive
	);

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
						self.showNullIntegerPart ?
							Option.some
						:	Option.liftPredicate(Predicate.not(MFunction.strictEquals('0'))),
						Option.map(flow(removeThousandSeparator, MBigDecimal.unsafeFromIntString(0)))
					)
				}),
				Option.flatMap(mantissaIntegerPartChecker),
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

			const sign = yield* pipe(
				signPart,
				signTransformer(BigDecimal.Equivalence(mantissa, MBigDecimal.zero))
			);

			const exponent = yield* exponentTransformer(exponentPart);

			return Tuple.make(
				pipe(
					mantissa,
					BigDecimal.multiply(BigDecimal.unsafeFromNumber(sign)),
					BigDecimal.scale(mantissa.scale - exponent)
				),
				match
			);
			some;
		});
};

/**
 * Returns a function that tries to read a number respecting the options represented by `self` from
 * the whole of a string `text`. If successful, that function returns a `some` of a BigDecimal.
 * Otherwise, it returns a `none`.
 *
 * @category Destructors
 */
export const toNumberReader = (
	self: Type
): MTypes.OneArgFunction<string, Option.Option<BigDecimal.BigDecimal>> => {
	const extractor = toNumberExtracter(self);
	return (text) =>
		pipe(
			text,
			extractor,
			Option.flatMap(
				flow(
					Option.liftPredicate(
						flow(Tuple.getSecond, String.length, MFunction.strictEquals(text.length))
					),
					Option.map(Tuple.getFirst)
				)
			)
		);
};

/**
 * Options instance that represents a UK-style number
 *
 * @category Instances
 */
export const uk: Type = make({
	id: 'ukNumberFormet',
	thousandSeparator: ',',
	fractionalSeparator: '.',
	showNullIntegerPart: true,
	minimumFractionDigits: 0,
	maximumFractionDigits: 3,
	eNotationChars: ['E', 'e'],
	scientificNotation: ScientificNotation.None,
	roundingMode: RoundingMode.HalfExpand,
	signDisplay: SignDisplay.Auto
});
