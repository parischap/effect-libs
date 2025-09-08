/**
 * This module defines the list of available rounding modes (see Intl.NumberFormat) that can be used
 * by a `CVRoundingOption` (see RoundingOption.ts)
 */

import { MMatch, MTypes } from '@parischap/effect-lib';
import { flow, Function, Struct } from 'effect';

/**
 * Type that represents the possible rounding modes
 *
 * @category Models
 */
export enum Type {
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

/**
 * Returns the name of `self`
 *
 * @category Destructors
 */
export const getName: MTypes.OneArgFunction<Type, string> = flow(
	MMatch.make,
	flow(
		MMatch.whenIs(Type.Ceil, Function.constant('Ceil')),
		MMatch.whenIs(Type.Floor, Function.constant('Floor')),
		MMatch.whenIs(Type.Expand, Function.constant('Expand')),
		MMatch.whenIs(Type.Trunc, Function.constant('Trunc')),
		MMatch.whenIs(Type.HalfCeil, Function.constant('HalfCeil')),
		MMatch.whenIs(Type.HalfFloor, Function.constant('HalfFloor')),
		MMatch.whenIs(Type.HalfExpand, Function.constant('HalfExpand')),
		MMatch.whenIs(Type.HalfTrunc, Function.constant('HalfTrunc')),
		MMatch.whenIs(Type.HalfEven, Function.constant('HalfEven'))
	),
	MMatch.exhaustive
);

/**
 * Type of a Correcter
 *
 * @category Models
 */
export interface Correcter
	extends MTypes.OneArgFunction<
		{
			readonly firstFollowingDigit: number;
			readonly isEven: boolean;
		},
		number
	> {}

/**
 * Builds a `Correcter` implementing `self`
 *
 * @category Destructors
 */
export const toCorrecter: MTypes.OneArgFunction<Type, Correcter> = flow(
	MMatch.make,
	flow(
		MMatch.whenIs(
			Type.Ceil,
			(): Correcter =>
				({ firstFollowingDigit }) =>
					firstFollowingDigit > 0 ? 1 : 0
		),
		MMatch.whenIs(
			Type.Floor,
			(): Correcter =>
				({ firstFollowingDigit }) =>
					firstFollowingDigit < 0 ? -1 : 0
		),
		MMatch.whenIs(Type.Expand, (): Correcter => flow(Struct.get('firstFollowingDigit'), Math.sign)),
		MMatch.whenIs(Type.Trunc, (): Correcter => Function.constant(0)),
		MMatch.whenIs(
			Type.HalfCeil,
			(): Correcter =>
				({ firstFollowingDigit }) =>
					firstFollowingDigit >= 5 ? 1
					: firstFollowingDigit < -5 ? -1
					: 0
		),
		MMatch.whenIs(
			Type.HalfFloor,
			(): Correcter =>
				({ firstFollowingDigit }) =>
					firstFollowingDigit > 5 ? 1
					: firstFollowingDigit <= -5 ? -1
					: 0
		),
		MMatch.whenIs(
			Type.HalfExpand,
			(): Correcter =>
				({ firstFollowingDigit }) =>
					firstFollowingDigit >= 5 ? 1
					: firstFollowingDigit <= -5 ? -1
					: 0
		),
		MMatch.whenIs(
			Type.HalfTrunc,
			(): Correcter =>
				({ firstFollowingDigit }) =>
					firstFollowingDigit > 5 ? 1
					: firstFollowingDigit < -5 ? -1
					: 0
		),
		MMatch.whenIs(
			Type.HalfEven,
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
