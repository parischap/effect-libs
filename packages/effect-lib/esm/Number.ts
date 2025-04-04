/** A simple extension to the Effect Number module */
import { flow, Function, pipe, Predicate, Struct } from 'effect';
import * as MMatch from './Match.js';
import * as MTypes from './types.js';

/**
 * Constructs a number from a string. Does not check input format and can return NaN or Infinity
 *
 * @category Constructors
 */

export const unsafeFromString: MTypes.NumberFromString = (s) => +s;

/**
 * Modulo - Use only with finite integers - Unlike javascript remainder operator (%), this function
 * always returns a positive integer even if `self` or `divisor` is negative
 *
 * @category Utils
 */

export const intModulo =
	(divisor: number) =>
	(self: number): number =>
		self >= 0 ? self % divisor : (self % divisor) + divisor;

/**
 * Returns the `quotient` and `remainder` of the division of `self` by `divisor`. `remainder` always
 * has the sign of `divisor`. Use only with finite integers
 *
 * @category Destructors
 */

export const quotientAndRemainder =
	(divisor: number) =>
	(self: number): [quotient: number, remainder: number] => {
		const quotient = Math.floor(self / divisor);
		return [quotient, self - quotient * divisor];
	};

/**
 * Returns the absolute value of `self`
 *
 * @category Utils
 */
export const abs: MTypes.OneArgFunction<number> = Math.abs;

/**
 * Predicate that returns true if two numbers are equal
 *
 * @category Predicates
 */
export const equals =
	(n: number): Predicate.Predicate<number> =>
	(self) =>
		Math.abs(self - n) < Number.EPSILON;

/**
 * Truncates a number after `precision` decimal digits. `precision` must be a positive finite
 * integer. If not provided, `precision` is taken equal to 0.
 *
 * @category Utils
 */
export const trunc =
	(precision = 0) =>
	(self: number): number =>
		pipe(self, shift(precision), Math.trunc, shift(-precision));

/**
 * Returns true if the provided number is NaN, Infinity, +Infinity or -Infinity
 *
 * @category Predicates
 */
export const isNotFinite: Predicate.Predicate<number> = Predicate.not(Number.isFinite);

/**
 * Returns true if the provided number is not NaN, Infinity, +Infinity or -Infinity
 *
 * @category Predicates
 */
export const isFinite: Predicate.Predicate<number> = Number.isFinite;

/**
 * Returns true if the provided number is an integer
 *
 * @category Predicates
 */
export const isInt: Predicate.Predicate<number> = Number.isInteger;

/**
 * Returns true if the provided number is not an integer
 *
 * @category Predicates
 */
export const isNotInt: Predicate.Predicate<number> = Predicate.not(Number.isInteger);

/**
 * Returns true if `self` is a multiple of `a`. Works even if `self` or `a` or both are negative
 *
 * @category Predicates
 */
export const isMultipleOf: (a: number) => Predicate.Predicate<number> = (a) => (self) =>
	self % a === 0;

/**
 * Returns `self` multiplied by 10^n
 *
 * @category Utils
 */
export const shift = (n: number) => (self: number) => self * 10 ** n;

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
	HalfTrunc = 7,
	/**
	 * Ties towards the nearest even integer. Values above the half-increment round like "expand"
	 * (away from zero), and below like "trunc" (towards 0). On the half-increment values round
	 * towards the nearest even digit
	 */
	HalfEven = 8
}

export namespace RoundingMode {
	/**
	 * Type of a RoundingMode Correcter
	 *
	 * @category Models
	 */
	export interface Correcter {
		({
			firstFollowingDigit,
			isEven
		}: {
			readonly firstFollowingDigit: number;
			readonly isEven: boolean;
		}): number;
	}

	/**
	 * Builds a `Correcter` implementing `self`
	 *
	 * @category Destructors
	 */
	export const toCorrecter: MTypes.OneArgFunction<RoundingMode, Correcter> = flow(
		MMatch.make,
		flow(
			MMatch.whenIs(
				RoundingMode.Ceil,
				(): Correcter =>
					({ firstFollowingDigit }) =>
						firstFollowingDigit > 0 ? 1 : 0
			),
			MMatch.whenIs(
				RoundingMode.Floor,
				(): Correcter =>
					({ firstFollowingDigit }) =>
						firstFollowingDigit < 0 ? -1 : 0
			),
			MMatch.whenIs(
				RoundingMode.Expand,
				(): Correcter => flow(Struct.get('firstFollowingDigit'), Math.sign)
			),
			MMatch.whenIs(RoundingMode.Trunc, (): Correcter => Function.constant(0)),
			MMatch.whenIs(
				RoundingMode.HalfCeil,
				(): Correcter =>
					({ firstFollowingDigit }) =>
						firstFollowingDigit >= 5 ? 1
						: firstFollowingDigit < -5 ? -1
						: 0
			),
			MMatch.whenIs(
				RoundingMode.HalfFloor,
				(): Correcter =>
					({ firstFollowingDigit }) =>
						firstFollowingDigit > 5 ? 1
						: firstFollowingDigit <= -5 ? -1
						: 0
			),
			MMatch.whenIs(
				RoundingMode.HalfExpand,
				(): Correcter =>
					({ firstFollowingDigit }) =>
						firstFollowingDigit >= 5 ? 1
						: firstFollowingDigit <= -5 ? -1
						: 0
			),
			MMatch.whenIs(
				RoundingMode.HalfTrunc,
				(): Correcter =>
					({ firstFollowingDigit }) =>
						firstFollowingDigit > 5 ? 1
						: firstFollowingDigit < -5 ? -1
						: 0
			),
			MMatch.whenIs(
				RoundingMode.HalfEven,
				(): Correcter =>
					({ firstFollowingDigit, isEven }) =>
						firstFollowingDigit > 5 ? 1
						: firstFollowingDigit < -5 ? -1
						: firstFollowingDigit === 5 ?
							isEven ? 0
							:	1
						: firstFollowingDigit === -5 ?
							isEven ? 0
							:	-1
						:	0
			)
		),
		MMatch.exhaustive
	);
}
/**
 * Rounds `self` at `precision` decimals using `roundingMode`. `precision` must be a finite positive
 * integer. `precision` must be a finite positive integer. Default `precision` is `0` and default
 * `roundingMode` is `HalfExpand`.
 */
export const round = ({
	precision = 0,
	roundingMode = RoundingMode.HalfExpand
}: {
	readonly precision?: number;
	readonly roundingMode?: RoundingMode;
} = {}): MTypes.OneArgFunction<number> => {
	const shiftMultiplicand = pipe(1, shift(precision));
	const unshiftMultiplicand = 1.0 / shiftMultiplicand;
	const correcter = RoundingMode.toCorrecter(roundingMode);

	return (self) => {
		const shiftedSelf = shiftMultiplicand * self;
		const truncatedShiftedSelf = Math.trunc(shiftedSelf);
		const firstFollowingDigit = Math.trunc((shiftedSelf - truncatedShiftedSelf) * 10);
		return (
			unshiftMultiplicand *
			(truncatedShiftedSelf +
				correcter({ firstFollowingDigit, isEven: truncatedShiftedSelf % 2 == 0 }))
		);
	};
};
