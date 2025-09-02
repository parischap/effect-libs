/** A simple extension to the Effect BigDecimal module */

import { BigDecimal, Brand, Either, flow, Function, Option, pipe, Tuple } from 'effect';
import * as MBigInt from './BigInt.js';
import * as MTypes from './types.js';

const _bigDecimalMinSafeInteger = BigDecimal.make(BigInt(Number.MIN_SAFE_INTEGER), 0);
const _bigDecimalMaxSafeInteger = BigDecimal.make(BigInt(Number.MAX_SAFE_INTEGER), 0);
const _tupledMake = Function.tupled(BigDecimal.make);

/**
 * Function that creates a Bigdecimal from a scale and a primitive representing a bigint
 *
 * @category Constructors
 */
export const fromPrimitive = (
	scale: number
): MTypes.OneArgFunction<
	string | number | boolean,
	Either.Either<BigDecimal.BigDecimal, Brand.Brand.BrandErrors>
> =>
	flow(
		MBigInt.fromPrimitive,
		Either.map(flow(Tuple.make, Tuple.appendElement(scale), _tupledMake))
	);

/**
 * Function that creates a Bigdecimal from a scale and a string representing a bigint
 *
 * @category Constructors
 */
export const fromPrimitiveOrThrows = (
	scale: number
): MTypes.OneArgFunction<string | number | boolean, BigDecimal.BigDecimal> =>
	flow(MBigInt.fromPrimitiveOrThrows, Tuple.make, Tuple.appendElement(scale), _tupledMake);

/**
 * Function that converts a BigDecimal to a number. No checks are carried out. If the number is too
 * big or too small, it is turned into +Infinity or -Infinity
 *
 * @category Destructors
 */
export const unsafeToNumber: MTypes.OneArgFunction<BigDecimal.BigDecimal, number> = Number;

/**
 * Function that converts a BigDecimal to a number. Returns a `some` if the BigDecimal is in the
 * 64-bit range of a number. Returns a `none` otherwise
 *
 * @category Destructors
 */
export const toNumberOption: MTypes.OneArgFunction<
	BigDecimal.BigDecimal,
	Option.Option<number>
> = flow(
	Option.liftPredicate(
		BigDecimal.between({ minimum: _bigDecimalMinSafeInteger, maximum: _bigDecimalMaxSafeInteger })
	),
	Option.map(BigDecimal.unsafeToNumber)
);

/**
 * Same as `toNumberOption` but returns an Either of a number.
 *
 * @category Destructors
 */
export const toNumber = (
	self: BigDecimal.BigDecimal
): Either.Either<number, Brand.Brand.BrandErrors> =>
	pipe(
		self,
		toNumberOption,
		Either.fromOption(() =>
			Brand.error(`BigDecimal '${self.toString()}' too big to be converted to number`)
		)
	);

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
