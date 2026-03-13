/** Extension to the Effect BigDecimal module providing safe constructors from primitives and truncation utilities */

import { flow, pipe } from 'effect';

import * as BigDecimal from 'effect/BigDecimal';
import * as Brand from 'effect/Brand';
import * as Either from 'effect/Either';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Tuple from 'effect/Tuple';

import * as MBigInt from './BigInt.js';
import * as MTypes from './Types/types.js';

/**
 * Type on which this module's functions operate
 *
 * @category Models
 */
export type Type = BigDecimal.BigDecimal;

const tupledMake = Function.tupled<readonly [value: bigint, scale: number], BigDecimal.BigDecimal>(
  BigDecimal.make,
);

/**
 * Creates a BigDecimal from a scale and a primitive value convertible to a bigint. Returns a `left`
 * if the conversion fails.
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
    Either.map(flow(Tuple.make, Tuple.appendElement(scale), tupledMake)),
  );

/**
 * Creates an Option of a BigDecimal from a scale and a primitive value convertible to a bigint.
 * Returns `none` if the conversion fails.
 *
 * @category Constructors
 */
export const fromPrimitiveOption = (
  scale: number,
): MTypes.OneArgFunction<string | number | boolean, Option.Option<BigDecimal.BigDecimal>> =>
  flow(
    MBigInt.fromPrimitiveOption,
    Option.map(flow(Tuple.make, Tuple.appendElement(scale), tupledMake)),
  );

/**
 * Creates a BigDecimal from a scale and a primitive value convertible to a bigint. Throws if the
 * conversion fails.
 *
 * @category Constructors
 */
export const fromPrimitiveOrThrow = (
  scale: number,
): MTypes.OneArgFunction<string | number | boolean, BigDecimal.BigDecimal> =>
  flow(MBigInt.fromPrimitiveOrThrow, Tuple.make, Tuple.appendElement(scale), tupledMake);

/**
 * BigDecimal instance representing the 0 value
 *
 * @category Instances
 */
export const zero: Type = BigDecimal.make(0n, 0);

/**
 * Truncates a BigDecimal after `precision` decimal digits. `precision` must be a positive finite
 * integer. If not provided, `precision` is taken equal to 0.
 *
 * @category Utils
 */
export const trunc = (precision = 0): MTypes.OneArgFunction<Type> =>
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
    self: Type,
  ): [truncatedPart: BigDecimal.BigDecimal, followingPart: BigDecimal.BigDecimal] => {
    const truncatedPart = pipe(self, trunc(precision));
    return Tuple.make(truncatedPart, BigDecimal.subtract(self, truncatedPart));
  };
