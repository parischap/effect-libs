/** A simple extension to the Effect BigDecimal module */

import { BigDecimal, Brand, Either, flow, Function, Option, pipe, Tuple } from "effect";
import * as MBigInt from "./BigInt.js";
import * as MTypes from "./types.js";

const _tupledMake = Function.tupled<readonly [value: bigint, scale: number], BigDecimal.BigDecimal>(
  BigDecimal.make,
);

/**
 * Function that creates a Bigdecimal from a scale and a primitive representing a bigint
 *
 * @category Constructors
 */
export const fromPrimitive = (
  scale: number,
): MTypes.OneArgFunction<
  string | number | boolean,
  Either.Either<BigDecimal.BigDecimal, Brand.Brand.BrandErrors>
> =>
  flow(
    MBigInt.fromPrimitive,
    Either.map(flow(Tuple.make, Tuple.appendElement(scale), _tupledMake)),
  );

/**
 * Function that creates an Option of a Bigdecimal from a scale and a primitive representing a
 * bigint
 *
 * @category Constructors
 */
export const fromPrimitiveOption = (
  scale: number,
): MTypes.OneArgFunction<string | number | boolean, Option.Option<BigDecimal.BigDecimal>> =>
  flow(
    MBigInt.fromPrimitiveOption,
    Option.map(flow(Tuple.make, Tuple.appendElement(scale), _tupledMake)),
  );

/**
 * Function that creates a Bigdecimal from a scale and a string representing a bigint
 *
 * @category Constructors
 */
export const fromPrimitiveOrThrow = (
  scale: number,
): MTypes.OneArgFunction<string | number | boolean, BigDecimal.BigDecimal> =>
  flow(MBigInt.fromPrimitiveOrThrow, Tuple.make, Tuple.appendElement(scale), _tupledMake);

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
    self: BigDecimal.BigDecimal,
  ): [truncatedPart: BigDecimal.BigDecimal, followingpart: BigDecimal.BigDecimal] => {
    const truncatedPart = pipe(self, trunc(precision));
    return Tuple.make(truncatedPart, BigDecimal.subtract(self, truncatedPart));
  };
