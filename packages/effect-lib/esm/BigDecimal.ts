/**
 * Extension to the Effect BigDecimal module providing safe constructors from primitives and
 * truncation utilities.
 *
 * ## Mental model
 *
 * - **`BigDecimal`** is an arbitrary-precision decimal: a `bigint` value paired with a `scale` (the
 *   number of decimal digits).
 * - This module focuses on safely building `BigDecimal`'s from JavaScript primitives and on
 *   truncating their fractional part.
 *
 * ## Common tasks
 *
 * - **Construct**: {@link fromPrimitiveOption}
 * - **Instances**: {@link zero}
 * - **Truncate**: {@link trunc}, {@link truncatedAndFollowingParts}
 *
 * ## Quickstart
 *
 * **Example** (Construction and truncation)
 *
 * ```ts
 * import { Option, pipe } from 'effect';
 * import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
 *
 * const bd = pipe('3.14', MBigDecimal.fromPrimitiveOption(2), Option.getOrThrow);
 * console.log(pipe(bd, MBigDecimal.trunc(1))); // BigDecimal(31, 1) i.e. 3.1
 * ```
 *
 * @see {@link trunc} — truncate decimal digits
 */

import { flow, pipe } from 'effect';
import * as BigDecimal from 'effect/BigDecimal';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Tuple from 'effect/Tuple';

import type * as MTypes from './types/types.js';

import * as MBigInt from './BigInt.js';

/**
 * Type on which this module's functions operate.
 *
 * @category Models
 */
export type Type = BigDecimal.BigDecimal;

const tupledMake = Function.tupled<readonly [value: bigint, scale: number], BigDecimal.BigDecimal>(
  BigDecimal.make,
);

/**
 * Builds a `BigDecimal` from a `string`, `number` or `boolean` paired with `scale`. Returns
 * `Option.none` when the primitive cannot be converted to a `bigint`.
 *
 * - Use to build a `BigDecimal` from untrusted input without risking an exception.
 * - `scale` is the number of decimal digits attached to the resulting value.
 *
 * **Example** (Safe construction)
 *
 * ```ts
 * import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
 *
 * console.log(MBigDecimal.fromPrimitiveOption(2)('3.14')); // Some(BigDecimal(314, 2))
 * console.log(MBigDecimal.fromPrimitiveOption(2)('abc')); // None
 * ```
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
 * `BigDecimal` instance representing `0`.
 *
 * @category Instances
 */
export const zero: Type = BigDecimal.make(0n, 0);

/**
 * Truncates a `BigDecimal` after `precision` decimal digits.
 *
 * - Use to drop fractional digits beyond a given precision.
 * - Rounds towards zero.
 * - `precision` must be a non-negative finite integer; defaults to `0`.
 *
 * **Example** (Truncate to a given precision)
 *
 * ```ts
 * import { Option, pipe } from 'effect';
 * import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
 *
 * const bd = pipe('3.14159', MBigDecimal.fromPrimitiveOption(5), Option.getOrThrow);
 * console.log(pipe(bd, MBigDecimal.trunc(2))); // BigDecimal(314, 2) i.e. 3.14
 * ```
 *
 * @category Utils
 */
export const trunc = (precision = 0): MTypes.OneArgFunction<Type> => BigDecimal.scale(precision);

/**
 * Splits `self` into `[truncatedPart, followingPart]` where `truncatedPart` is `self` truncated
 * after `precision` decimal digits and `followingPart` is `self - truncatedPart`.
 *
 * - Use when both the truncated value and its remainder are needed (e.g. when building digit-by-digit
 *   formatters).
 * - `precision` must be a non-negative finite integer; defaults to `0`.
 *
 * **Example** (Separating truncated and remainder parts)
 *
 * ```ts
 * import { Option, pipe } from 'effect';
 * import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
 *
 * const bd = pipe('3.14159', MBigDecimal.fromPrimitiveOption(5), Option.getOrThrow);
 * const [truncated, following] = pipe(bd, MBigDecimal.truncatedAndFollowingParts(2));
 * // truncated ≡ 3.14, following ≡ 0.00159
 * ```
 *
 * @category Destructors
 *
 * @see {@link trunc} — return only the truncated part
 */

export const truncatedAndFollowingParts =
  (precision = 0) =>
  (self: Type): [truncatedPart: BigDecimal.BigDecimal, followingPart: BigDecimal.BigDecimal] => {
    const truncatedPart = pipe(self, trunc(precision));
    return Tuple.make(truncatedPart, BigDecimal.subtract(self, truncatedPart));
  };
