/**
 * This module implements conversions from number to string and string to number in base-10
 * notation.
 */

import {
	MBigDecimal,
	MBrand,
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
	BigInt,
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

/**
 * Namespace for possible sign display options
 *
 * @category Models
 */
export namespace SignDisplay {
	/**
	 * Type of a SignDisplay Reader
	 *
	 * @category Models
	 */
	export interface Reader {
		(hasNullMantissa: boolean): (sign: string) => Option.Option<-1 | 1>;
	}

	const isPlusSign: Predicate.Predicate<string> = MFunction.strictEquals('+');
	const isMinusSign: Predicate.Predicate<string> = MFunction.strictEquals('-');
	const hasASign = Option.liftPredicate(String.isNonEmpty);
	const hasNoSign = Option.liftPredicate<string, string>(String.isEmpty);
	const hasNotPlusSign = Option.liftPredicate(Predicate.not(isPlusSign));

	/**
	 * Builds a `Reader` implementing `self`
	 *
	 * @category Destructors
	 */
	export const toReader: MTypes.OneArgFunction<SignDisplay, Reader> = flow(
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
						Option.liftPredicate(isMinusSign),
						Option.as(-1 as const),
						Option.getOrElse(Function.constant(1 as const))
					)
				)
			)
		)
	);

	/**
	 * Type of a SignDisplay Writer
	 *
	 * @category Models
	 */
	export interface Writer {
		({ sign, isZero }: { readonly sign: -1 | 1; readonly isZero: boolean }): '+' | '-' | '';
	}

	/**
	 * Builds a `Writer` implementing `self`
	 *
	 * @category Destructors
	 */
	export const toWriter: MTypes.OneArgFunction<SignDisplay, Reader> = flow(
		MMatch.make,
		MMatch.whenIs(
			SignDisplay.Auto,
			(): Writer =>
				({ sign }) =>
					sign === -1 ? '-' : ''
		),
		MMatch.whenIs(
			SignDisplay.Always,
			(): Writer =>
				({ sign }) =>
					sign === -1 ? '-' : '+'
		),
		MMatch.whenIs(
			SignDisplay.ExceptZero,
			(): Writer =>
				({ sign, isZero }) =>
					isZero ? ''
					: sign === -1 ? '-'
					: '+'
		),
		MMatch.whenIs(
			SignDisplay.Negative,
			(): Writer =>
				({ sign, isZero }) =>
					isZero || sign === 1 ? '' : '-'
		),
		MMatch.whenIs(SignDisplay.Never, (): Writer => MFunction.constEmptyString),
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
 * Namespace for possible scientific notation options
 *
 * @category Models
 */
export namespace ScientificNotation {
	/**
	 * Type of a ScientificNotation Reader
	 *
	 * @category Models
	 */
	export interface Reader {
		(exponent: string): Option.Option<number>;
	}

	const stringToExponentOption = flow(
		Option.liftPredicate(String.isNonEmpty),
		Option.map(MNumber.unsafeFromString),
		Option.orElseSome(Function.constant(0))
	);

	/**
	 * Builds a `Reader` implementing `self`
	 *
	 * @category Destructors
	 */
	export const toReader: MTypes.OneArgFunction<ScientificNotation, Reader> = flow(
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
	readonly roundingMode: MNumber.RoundingMode;

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
export const roundingMode: MTypes.OneArgFunction<Type, MNumber.RoundingMode> =
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
export const toNumberExtractor = (
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

	const signReader = SignDisplay.toReader(self.signDisplay);

	const exponentTransformer = ScientificNotation.toReader(self.scientificNotation);

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
						self.showNullIntegerPart || mantissaFractionalPartLength === 0 ?
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
				signReader(BigDecimal.Equivalence(mantissa, MBigDecimal.zero))
			);

			const exponent = yield* exponentTransformer(exponentPart);

			return Tuple.make(
				pipe(
					BigDecimal.make(mantissa.value, mantissa.scale - exponent),
					BigDecimal.multiply(BigDecimal.unsafeFromNumber(sign))
				),
				match
			);
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
	const extractor = toNumberExtractor(self);
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
export const toNumberWriter = (
	self: Type
): MTypes.OneArgFunction<BigDecimal.BigDecimal | MBrand.Real.Type, Option.Option<string>> => {
	const round =
		self.maximumFractionDigits === +Infinity ?
			Function.identity
		:	MBigDecimal.round({
				precision: self.maximumFractionDigits,
				roundingMode: self.roundingMode
			});

	return (number) =>
		Option.gen(function* () {
			const [sign, selfAsBigDecimal] =
				MTypes.isNumber(number) ?
					Tuple.make(
						number < 0 || Object.is(-0, number) ? (-1 as const) : (1 as const),
						BigDecimal.unsafeFromNumber(number)
					)
				:	Tuple.make(number.value < 0 ? (-1 as const) : (1 as const), number);

			const rounded = round(selfAsBigDecimal);
			const [truncatedPart, followingPart] = pipe(
				rounded,
				MBigDecimal.truncatedAndFollowingParts()
			);

			const bounderIntegerPart = yield* BigInt.toNumber(integerPart.value);

			return '';
		});
};

/**
 * NumberBase10Format instance that uses a comma as fractional separator and a space as thousand
 * separator. Used in countries like France, French-speaking Canada, French-speaking Belgium,
 * Denmark, Finland, Sweden...
 *
 * @category Instances
 */
export const commaAndSpace: Type = make({
	id: 'CommaAndSpace',
	thousandSeparator: ' ',
	fractionalSeparator: ',',
	showNullIntegerPart: true,
	minimumFractionDigits: 0,
	maximumFractionDigits: 3,
	eNotationChars: ['E', 'e'],
	scientificNotation: ScientificNotation.None,
	roundingMode: MNumber.RoundingMode.HalfExpand,
	signDisplay: SignDisplay.Auto
});

/**
 * NumberBase10Format instance that uses a comma as fractional separator and a dot as thousand
 * separator. Used in countries like Dutch-speaking Belgium, the Netherlands, Germany, Italy,
 * Norway, Croatia, Spain...
 *
 * @category Instances
 */
export const commaAndDot: Type = make({
	...commaAndSpace,
	id: 'CommaAndDot',
	thousandSeparator: '.'
});

/**
 * NumberBase10Format instance that uses a dot as fractional separator and a comma as thousand
 * separator. Used in countries like the UK, the US, English-speaking Canada, Australia, Thaïland,
 * Bosnia...
 *
 * @category Instances
 */
export const dotAndComma: Type = make({
	...commaAndSpace,
	id: 'DotAndComma',
	fractionalSeparator: '.',
	thousandSeparator: ','
});

/**
 * Combinator that returns a copy of self with `maximumFractionDigits` set to 0.
 *
 * @category Utils
 */
export const withNoDecimals = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithNoDecimals',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	});

/**
 * Combinator that returns a copy of self with `minimumFractionDigits` and `maximumFractionDigits`
 * set to 2.
 *
 * @category Utils
 */
export const withTwoDecimals = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithTwoDecimals',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

/**
 * Combinator that returns a copy of self with`maximumFractionDigits` set to +Infinity.
 *
 * @category Utils
 */
export const withUnlimitedDecimals = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithUnlimitedDecimals',
		maximumFractionDigits: +Infinity
	});

/**
 * Combinator that returns a copy of self with `scientificNotation` set to `None`.
 *
 * @category Utils
 */
export const withNoScientificNotation = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithNoScientificNotation',
		scientificNotation: ScientificNotation.None
	});

/**
 * Combinator that returns a copy of self with `scientificNotation` set to `Standard`.
 *
 * @category Utils
 */
export const withStandardScientificNotation = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithStandardScientificNotation',
		scientificNotation: ScientificNotation.Standard
	});

/**
 * Combinator that returns a copy of self with `scientificNotation` set to `Normalized`.
 *
 * @category Utils
 */
export const withNormalizedScientificNotation = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithNormalizedScientificNotation',
		scientificNotation: ScientificNotation.Normalized
	});

/**
 * Combinator that returns a copy of self with `scientificNotation` set to `Engineering`.
 *
 * @category Utils
 */
export const withEngineeringScientificNotation = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithEngineeringScientificNotation',
		scientificNotation: ScientificNotation.Engineering
	});

/**
 * Combinator that returns a copy of self with `thousandSeparator` set to ''.
 *
 * @category Utils
 */
export const withoutThousandSeparator = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithoutThousandSeparator',
		thousandSeparator: ''
	});

/**
 * Combinator that returns a copy of self with `signDisplay` set to `Auto`.
 *
 * @category Utils
 */
export const withSignDisplayForNegative = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithSignDisplayForNegative',
		signDisplay: SignDisplay.Auto
	});

/**
 * Combinator that returns a copy of self with `signDisplay` set to `Always`.
 *
 * @category Utils
 */
export const withSignDisplay = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithSignDisplay',
		signDisplay: SignDisplay.Always
	});

/**
 * Combinator that returns a copy of self with `signDisplay` set to `ExceptZero`.
 *
 * @category Utils
 */
export const withSignDisplayExceptZero = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithSignDisplayExceptZero',
		signDisplay: SignDisplay.ExceptZero
	});

/**
 * Combinator that returns a copy of self with `signDisplay` set to `Negative`.
 *
 * @category Utils
 */
export const withSignDisplayForNegativeExceptZero = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithSignDisplayForNegativeExceptZero',
		signDisplay: SignDisplay.Negative
	});

/**
 * Combinator that returns a copy of self with `signDisplay` set to `Never`.
 *
 * @category Utils
 */
export const withoutSignDisplay = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithoutSignDisplay',
		signDisplay: SignDisplay.Never
	});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `Ceil`.
 *
 * @category Utils
 */
export const withCeilRoundingMode = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithCeilRoundingMode',
		roundingMode: MNumber.RoundingMode.Ceil
	});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `Floor`.
 *
 * @category Utils
 */
export const withFloorRoundingMode = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithFloorRoundingMode',
		roundingMode: MNumber.RoundingMode.Floor
	});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `Expand`.
 *
 * @category Utils
 */
export const withExpandRoundingMode = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithExpandRoundingMode',
		roundingMode: MNumber.RoundingMode.Expand
	});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `Trunc`.
 *
 * @category Utils
 */
export const withTruncRoundingMode = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithTruncRoundingMode',
		roundingMode: MNumber.RoundingMode.Trunc
	});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `HalfCeil`.
 *
 * @category Utils
 */
export const withHalfCeilRoundingMode = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithHalfCeilRoundingMode',
		roundingMode: MNumber.RoundingMode.HalfCeil
	});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `HalfFloor`.
 *
 * @category Utils
 */
export const withHalfFloorRoundingMode = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithHalfFloorRoundingMode',
		roundingMode: MNumber.RoundingMode.HalfFloor
	});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `HalfExpand`.
 *
 * @category Utils
 */
export const withHalfExpandRoundingMode = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithHalfExpandRoundingMode',
		roundingMode: MNumber.RoundingMode.HalfExpand
	});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `HalfTrunc`.
 *
 * @category Utils
 */
export const withHalfTruncRoundingMode = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithHalfTruncRoundingMode',
		roundingMode: MNumber.RoundingMode.halfTrunc
	});

/**
 * Combinator that returns a copy of self with `roundingMode` set to `HalfEven`.
 *
 * @category Utils
 */
export const withHalfEvenRoundingMode = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithHalfEvenRoundingMode',
		roundingMode: MNumber.RoundingMode.halfEven
	});

/**
 * Combinator that returns a copy of self with `showNullIntegerPart` set to `false`.
 *
 * @category Utils
 */
export const withNullIntegerPartNotShowing = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithNullIntegerPartNotShowing',
		showNullIntegerPart: false
	});

/**
 * Combinator that returns a copy of self with `showNullIntegerPart` set to `true`.
 *
 * @category Utils
 */
export const withNullIntegerPartShowing = (self: Type): Type =>
	make({
		...self,
		id: self.id + 'WithNullIntegerPartShowing',
		showNullIntegerPart: true
	});
