/** A simple extension to the Effect BigDecimal module */

import { BigDecimal, pipe, Tuple } from 'effect';
import * as MBigInt from './BigInt.js';
import * as MNumber from './Number.js';
import * as MTypes from './types.js';

const bigDecimal10 = BigDecimal.make(10n, 0);
/**
 * Function that creates a Bigdecimal from a string representing an bigint and a scale
 *
 * @category Constructors
 */
export const unsafeFromIntString =
	(scale: number): MTypes.OneArgFunction<string, BigDecimal.BigDecimal> =>
	(s) =>
		BigDecimal.make(BigInt(s), scale);

/**
 * BigDecimal instance representing the 0 value
 *
 * @category Instances
 */
export const zero: BigDecimal.BigDecimal = BigDecimal.make(0n, 0);

/**
 * Truncates a BigDecimal after `precision` decimal digits. `precision` must be a positive finite
 * integer. If not provided, `precision` is taken equal to 0.
 *
 * @category Utils
 */
export const trunc = (precision = 0): MTypes.OneArgFunction<BigDecimal.BigDecimal> =>
	BigDecimal.scale(precision);

/**
 * Returns `truncatedPart`, `self` truncated after `precision` decimal digits, and `followingpart`,
 * the difference between `self` and `truncatedPart`. `precision` must be a positive finite integer.
 * If not provided, `precision` is taken equal to 0.
 *
 * @category Destructors
 */

export const truncatedAndFollowingParts =
	(precision = 0) =>
	(
		self: BigDecimal.BigDecimal
	): [truncatedPart: BigDecimal.BigDecimal, followingpart: BigDecimal.BigDecimal] => {
		const truncatedPart = pipe(self, trunc(precision));
		return Tuple.make(truncatedPart, BigDecimal.subtract(self, truncatedPart));
	};

/**
 * Rounds `self` at `precision` decimals using `roundingMode`. `precision` must be a finite positive
 * integer. Default `precision` is `0` and default `roundingMode` is `HalfExpand`.
 *
 * @category Utils
 */
export const round = ({
	precision = 0,
	roundingMode = MNumber.RoundingMode.HalfExpand
}: {
	readonly precision?: number;
	readonly roundingMode?: MNumber.RoundingMode;
} = {}): MTypes.OneArgFunction<BigDecimal.BigDecimal> => {
	const shiftValue = BigDecimal.make(1n, -precision);
	const shift = BigDecimal.multiply(shiftValue);
	const unshift = BigDecimal.unsafeDivide(shiftValue);
	const correcter = MNumber.RoundingMode.toCorrecter(roundingMode);

	return (self) => {
		const shiftedSelf = shift(self);
		const truncatedShiftedSelf = pipe(shiftedSelf, trunc());
		const firstFollowingDigit = pipe(
			shiftedSelf,
			BigDecimal.subtract(truncatedShiftedSelf),
			BigDecimal.multiply(bigDecimal10),
			trunc(),
			BigDecimal.unsafeToNumber
		);
		return pipe(
			truncatedShiftedSelf,
			BigDecimal.sum(
				pipe(
					{ firstFollowingDigit, isEven: MBigInt.isEven(truncatedShiftedSelf.value) },
					correcter,
					BigDecimal.unsafeFromNumber
				)
			),
			unshift
		);
	};
};
