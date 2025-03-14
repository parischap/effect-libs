/** This module implements conversions from number to string and string to number in base-10 notation */

import {
	MFunction,
	MInspectable,
	MPipeable,
	MRegExpString,
	MString,
	MTypes
} from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, pipe, Pipeable, Predicate, Struct } from 'effect';
import * as CVNumberReader from './NumberReader.js';

const moduleTag = '@parischap/templater/NumberFormat10/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Possible rounding modes
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
	 * Round toward 0. This magnitude of the value is always reduced by rounding. Positive values
	 * round down. Negative values round "less negative"
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
 * Possible sign display options
 *
 * @category Models
 */
export enum SignDisplay {
	/** Sign display for negative numbers only, including negative zero */
	Auto = 0,
	/** Always display sign */
	Always = 1,
	/** Sign display for positive and negative numbers, but not zero */
	ExceptZero = 2,
	/** Sign display for negative numbers only, excluding negative zero */
	Negative = 3,
	/** Never display sign */
	Never = 4
}

/**
 * Possible e-notation options
 *
 * @category Models
 */
export enum ScientificNotation {
	/**
	 * Scientific notation is disallowed when converting from string to number and not used when
	 * converting from number to string
	 */
	None = 0,
	/**
	 * Scientific notation is allowed but not mandatory when converting from string to number. It is
	 * used when converting from number to string only if the `minimumIntegerDigits` and
	 * `maximumIntegerDigits` conditions are not respected otherwise.
	 */
	Standard = 1,
	/**
	 * The absolute value of the mantissa m must fulfill 1 ≤ |m| < 10 both when converting to and from
	 * string. When converting from number to string, the e-notation is not used if the exponent is 0.
	 * An e-notation with a null exponent is tolerated when converting from string to number
	 */
	Normalized = 2,
	/**
	 * The absolute value of the mantissa m must fulfill 1 ≤ |m| < 1000 and the exponent must be a
	 * multiple of 3 both when converting to and from string. When converting from number to string,
	 * the e-notation is not used if the exponent is 0. An e-notation with a null exponent is
	 * tolerated when converting from string to number
	 */
	Engineering = 3
}

/**
 * Type that represents a NumberFormat.
 *
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Type, Pipeable.Pipeable {
	/** Id of this NumberFormat instance. Useful for equality and debugging */
	readonly id: string;

	/**
	 * Thousand separator. Use an empty string for no separator. Usually a string made of at most one
	 * character but not mandatory. Should be different from `fractionalSeparator`. Will not throw
	 * otherwise but unexpected results might occur
	 */
	readonly thousandSeparator: string;

	/**
	 * Fractional separator. Usually a one-character string but not mandatory. Should not be an empty
	 * string and be different from `thousandSeparator`. Will not throw otherwise but unexpected
	 * results might occur
	 */
	readonly fractionalSeparator: string;

	/**
	 * Minimim number of digits forming the integer part of a number. Must be a positive integer less
	 * than or equal to `maximumIntegerDigits`. Will be clipped to that range otherwise.
	 *
	 * Conversion from number to string:
	 *
	 * - If `scientificNotation===None`, the string will be left-padded with `0`'s if necessary (it will
	 *   not if not necessary, so numbers with a null integer part will be displayed starting with '.'
	 *   when using `minimumIntegerDigits===0` and with '0.' or '0' when using
	 *   `minimumIntegerDigits===1`). Converting the number 0 to a string will fail when using
	 *   `minimumIntegerDigits===0`
	 * - If `scientificNotation===Standard`, an e-notation will be used if necessary to respect the
	 *   condition
	 * - In all other situations, the conversion will fail if the condition is not respeected. For
	 *   instance, trying to use `minimumIntegerDigits!==1` with `scientificNotation===Normalized`
	 *   will fail
	 *
	 * Conversion from string to number: will fail if the input string does not respect this condition
	 * (the string must be left-padded with `0`'s to respect the condition if necessary but only if
	 * `scientificNotation===None`).
	 */
	readonly minimumIntegerDigits: number;

	/**
	 * Maximum number of digits forming the integer part of a number. Must be a positive integer. Will
	 * be taken equal to 0 if not positive. You should not set `maximumIntegerDigits` and
	 * `maximumFractionDigits` simultaneously to 0 because conversions will always fail.
	 *
	 * Conversion from number to string:
	 *
	 * - If `scientificNotation===Standard`, an e-notation will be used if necessary to respect the
	 *   condition
	 * - In all other situations, the conversion will fail if the condition is not respected.
	 *
	 * Conversion from string to number: the conversion will fail if the condition is not respected.
	 */
	readonly maximumIntegerDigits: number;

	/**
	 * Minimim number of digits forming the fractional part of a number. Must be a positive integer
	 * less than or equal to `maximumFractionDigits`. Will be clipped to that range otherwise.
	 *
	 * Conversion from number to string: the string will be right-padded with `0`'s if necessary to
	 * respect the condition
	 *
	 * Conversion from string to number: will fail if the input string does not respect this condition
	 * (the string must be right-padded with `0`'s to respect the condition if necessary).
	 */
	readonly minimumFractionDigits: number;

	/**
	 * Maximum number of digits forming the fractional part of a number. Must be a positive integer.
	 * Will be taken equal to 0 if not positive. You should not set `maximumIntegerDigits` and
	 * `maximumFractionDigits` simultaneously to 0 because conversions will always fail.
	 *
	 * Conversion from number to string: the number will be rounded using the roundingMode to respect
	 * the condition. Rounding may cause the `minimumIntegerDigits` and `minimumIntegerDigits`
	 * conditions to fail.
	 *
	 * Conversion from string to number: will fail if the input string does not respect this
	 * condition.
	 */
	readonly maximumFractionDigits: number;

	/**
	 * Characters to use to represent e-notation. Usually ['e','E']
	 *
	 * Conversion from number to string: the string at index 0 is used
	 *
	 * Conversion from string to number: the e-notation must be one of the strings present in the
	 * array
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
 * Returns the `minimumIntegerDigits` property of `self`
 *
 * @category Destructors
 */
export const minimumIntegerDigits: MTypes.OneArgFunction<Type, number> =
	Struct.get('minimumIntegerDigits');

/**
 * Returns the `maximumIntegerDigits` property of `self`
 *
 * @category Destructors
 */
export const maximumIntegerDigits: MTypes.OneArgFunction<Type, number> =
	Struct.get('maximumIntegerDigits');

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
 * Returns the `signDisplay` property of `self`
 *
 * @category Destructors
 */
export const toNumberReader = (self: Type): CVNumberReader.Type => {
	const signPart = pipe(MRegExpString.sign, MRegExpString.optional, MRegExpString.capture);

	const eNotationPart = ENotationOptions.toRegExpString(eNotationOptions);

	const decimalPart = MRegExpString.capture(
		maxDecimalDigits <= 0 ? MRegExpString.optional('0')
		: minDecimalDigits <= 0 ?
			pipe(MRegExpString.positiveInt(maxDecimalDigits, 1, thousandsSep), MRegExpString.optional)
		:	MRegExpString.strictlyPositiveInt(maxDecimalDigits, minDecimalDigits, thousandsSep)
	);

	const fractionalPart =
		maxFractionalDigits <= 0 ?
			MRegExpString.emptyCapture
		:	pipe(
				MRegExpString.digit,
				MRegExpString.repeatBetween(Math.max(1, minFractionalDigits), maxFractionalDigits),
				MRegExpString.capture,
				MString.prepend(MRegExpString.escape(fractionalSep)),
				MFunction.fIfTrue({ condition: minFractionalDigits <= 0, f: MRegExpString.optional })
			);

	return signPart + decimalPart + fractionalPart + eNotationPart;
	return (text) => 1;
};
