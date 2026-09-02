/**
 * Extension to the `effect/BigDecimal` module providing safe constructors from primitives and
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

import type * as MNumberBase10Format from './NumberBase10Format.js';
import type * as MTypes from './types/types.js';

import * as MBigInt from './BigInt.js';
import * as internalRoundingOptionCorrecter from './internal/RoundingOptionCorrecter.js';

/**
 * Type on which this module's functions operate.
 *
 * @category Models
 */
export type Type = BigDecimal.BigDecimal;

/**
 * Type that represents the possible rounding modes (see `Intl.NumberFormat`)
 *
 * @category Models
 */
export enum RoundingOption {
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
  HalfEven = 8,
}

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

const bigDecimal10 = BigDecimal.make(10n, 0);

/**
 * Returns a function that rounds a `BigDecimal` to `precision` decimal digits according to
 * `option`.
 *
 * - Use a precomputed rounder when the same `precision`/`option` pair will be applied many times.
 *
 * **Example** (Round to two decimal digits, half away from zero)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as BigDecimal from 'effect/BigDecimal';
 * import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
 *
 * const round = MBigDecimal.round(2, MBigDecimal.RoundingOption.HalfExpand);
 * console.log(pipe(BigDecimal.make(124_566n, 4), round)); // BigDecimal(12457n, 2) i.e. 124.57
 * ```
 *
 * @category Utils
 */
export const round = (precision: number, option: RoundingOption): MTypes.OneArgFunction<Type> => {
  const shiftValue = BigDecimal.make(1n, -precision);
  const shift = BigDecimal.multiply(shiftValue);
  const unshift = BigDecimal.divideUnsafe(shiftValue);
  const correcter = internalRoundingOptionCorrecter.fromRoundingOption(option);

  return (self) => {
    const shiftedSelf = shift(self);
    const truncatedShiftedSelf = pipe(shiftedSelf, trunc());
    const firstFollowingDigit = pipe(
      shiftedSelf,
      BigDecimal.subtract(truncatedShiftedSelf),
      BigDecimal.multiply(bigDecimal10),
      trunc(),
      BigDecimal.toNumberUnsafe,
    );
    return pipe(
      truncatedShiftedSelf,
      BigDecimal.sum(
        pipe(
          { firstFollowingDigit, isEven: MBigInt.isEven(truncatedShiftedSelf.value) },
          correcter,
          BigDecimal.fromNumberUnsafe,
        ),
      ),
      unshift,
    );
  };
};

/**
 * Returns a function that tries to extract, from the start of a string, a `BigDecimal` respecting
 * `format`. If successful, returns a `some` of a `[value, match]` pair where `match` is the part of
 * the string that could be analyzed as representing a number. Otherwise, returns a `none`.
 *
 * - Use a precomputed extractor when the same `format` will be applied many times.
 *
 * **Example** (Extract a `BigDecimal` from the start of a string)
 *
 * ```ts
 * import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
 * import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
 *
 * const extract = MBigDecimal.extractFromString(MNumberBase10Format.frenchStyleNumber);
 * console.log(extract('-45,50Dummy')); // Some([BigDecimal(-4550n, 2), '-45,50'])
 * ```
 *
 * @category Constructors
 */
export const extractFromString = (
  format: MNumberBase10Format.Type,
): MTypes.OneArgFunction<string, Option.Option<[value: Type, match: string]>> => {
  const bigDecimalExtractor = format._bigDecimalExtractor;
  return flow(
    bigDecimalExtractor,
    Option.map(({ value, match, sign }) =>
      Tuple.make(BigDecimal.multiply(value, BigDecimal.fromNumberUnsafe(sign)), match),
    ),
  );
};

/**
 * Same as `extractFromString` but throws in case of failure
 *
 * @category Constructors
 */
export const extractFromStringOrThrow = (
  format: MNumberBase10Format.Type,
): MTypes.OneArgFunction<string, [value: Type, match: string]> => {
  const extractor = extractFromString(format);
  return (text) =>
    pipe(
      text,
      extractor,
      Option.getOrThrowWith(
        () => new Error(`A BigDecimal could not be parsed from the start of '${text}'`),
      ),
    );
};

/**
 * Returns a function that tries to convert a whole string into a `BigDecimal` respecting `format`.
 * Unlike `extractFromString`, the whole of the input string must represent a number.
 *
 * - Use a precomputed parser when the same `format` will be applied many times.
 *
 * **Example** (Parse a `BigDecimal` from a whole string)
 *
 * ```ts
 * import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
 * import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
 *
 * const parse = MBigDecimal.parseFromString(MNumberBase10Format.frenchStyleNumber);
 * console.log(parse('-45,50')); // Some(BigDecimal(-4550n, 2))
 * console.log(parse('-45,50Dummy')); // None
 * ```
 *
 * @category Constructors
 */
export const parseFromString = (
  format: MNumberBase10Format.Type,
): MTypes.OneArgFunction<string, Option.Option<Type>> => {
  const bigDecimalExtractor = format._bigDecimalExtractor;
  return flow(
    bigDecimalExtractor,
    Option.filter(({ match, input }) => match.length === input.length),
    Option.map(({ value, sign }) => BigDecimal.multiply(value, BigDecimal.fromNumberUnsafe(sign))),
  );
};

/**
 * Same as `parseFromString` but throws in case of failure
 *
 * @category Constructors
 */
export const parseFromStringOrThrow = (
  format: MNumberBase10Format.Type,
): MTypes.OneArgFunction<string, Type> => {
  const parser = parseFromString(format);
  return (text) =>
    pipe(
      text,
      parser,
      Option.getOrThrowWith(() => new Error(`A BigDecimal could not be parsed from '${text}'`)),
    );
};
