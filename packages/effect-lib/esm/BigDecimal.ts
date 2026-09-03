/**
 * Extension to the `effect/BigDecimal` module providing rounding and formatting utilities.
 *
 * ## Mental model
 *
 * - **`BigDecimal`** is an arbitrary-precision decimal: a `bigint` value paired with a `scale` (the
 *   number of decimal digits).
 * - This module focuses on rounding their fractional part and formatting to string.
 *
 * ## Common tasks
 *
 * - **Instances**: {@link zero}
 * - **Rounding**: {@link round}, {@link roundedAndRest}
 *
 * ## Quickstart
 *
 * **Example** rounding
 *
 * ```ts
 * import { BigDecimal, Option, pipe } from 'effect';
 * import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
 *
 * const bd = pipe('3.14', BigDecimal.fromNumber, Option.getOrThrow);
 * const truncater = MBigDecimal.round(1, MNumberBase10Format.RoundingOption.Trunc);
 * console.log(truncater(bd)); // BigDecimal(31, 1) i.e. 3.1
 * ```
 *
 * @see {@link round} — truncate decimal digits
 */

import { flow, pipe } from 'effect';
import * as BigDecimal from 'effect/BigDecimal';
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
 * `BigDecimal` instance representing `0`.
 *
 * @category Instances
 */
export const zero: Type = BigDecimal.make(0n, 0);

/**
 * Splits `self` into `[roundedPart, followingPart]` where `truncatedPart` is `self` truncated after
 * `precision` decimal digits and `followingPart` is `self - truncatedPart`.
 *
 * - Use when both the truncated value and its remainder are needed (e.g. when building digit-by-digit
 *   formatters).
 * - `precision` must be a non-negative finite integer; defaults to `0`.
 *
 * **Example** (Separating truncated and remainder parts)
 *
 * ```ts
 * import { BigDecimal, Option, pipe } from 'effect';
 * import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
 *
 * const bd = pipe('3.1459', BigDecimal.fromNumber, Option.getOrThrow);
 * const [rounded, rest] = pipe(
 *   bd,
 *   MBigDecimal.roundedAndRest(2, MNumberBase10Format.RoundingOption.Trunc),
 * );
 * // rounded ≡ 3.14, rest ≡ 0.00159
 * ```
 *
 * @category Destructors
 */

export const roundedAndRest =
  (precision: number, option: MNumberBase10Format.RoundingOption) =>
  (self: Type): [rounded: BigDecimal.BigDecimal, rest: BigDecimal.BigDecimal] => {
    const rounded = pipe(self, round(precision, option));
    return Tuple.make(rounded, BigDecimal.subtract(self, rounded));
  };

const bigDecimal10 = BigDecimal.make(10n, 0);
const trunc = (precision = 0): MTypes.OneArgFunction<Type> => BigDecimal.scale(precision);

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
 * import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
 *
 * const round = MBigDecimal.round(2, MNumberBase10Format.RoundingOption.HalfExpand);
 * console.log(pipe(BigDecimal.make(124_566n, 4), round)); // BigDecimal(12457n, 2) i.e. 124.57
 * ```
 *
 * @category Utils
 */
export const round = (
  precision: number,
  option: MNumberBase10Format.RoundingOption,
): MTypes.OneArgFunction<Type> => {
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
 * const extract = MBigDecimal.fromFormatAndStringStart(MNumberBase10Format.frenchStyleNumber);
 * console.log(extract('-45,50Dummy')); // Some([BigDecimal(-4550n, 2), '-45,50'])
 * ```
 *
 * @category Constructors
 */
export const fromFormatAndStringStart = (
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
 * Same as `fromFormatAndStringStart` but throws in case of failure
 *
 * @category Constructors
 */
export const fromFormatAndStringStartOrThrow = (
  format: MNumberBase10Format.Type,
): MTypes.OneArgFunction<string, [value: Type, match: string]> => {
  const extractor = fromFormatAndStringStart(format);
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
 * Unlike `fromFormatAndStringStart`, the whole of the input string must represent a number.
 *
 * - Use a precomputed parser when the same `format` will be applied many times.
 *
 * **Example** (Parse a `BigDecimal` from a whole string)
 *
 * ```ts
 * import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
 * import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
 *
 * const parse = MBigDecimal.fromFormatAndString(MNumberBase10Format.frenchStyleNumber);
 * console.log(parse('-45,50')); // Some(BigDecimal(-4550n, 2))
 * console.log(parse('-45,50Dummy')); // None
 * ```
 *
 * @category Constructors
 */
export const fromFormatAndString = (
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
 * Same as `fromFormatAndString` but throws in case of failure
 *
 * @category Constructors
 */
export const fromFormatAndStringOrThrow = (
  format: MNumberBase10Format.Type,
): MTypes.OneArgFunction<string, Type> => {
  const parser = fromFormatAndString(format);
  return (text) =>
    pipe(
      text,
      parser,
      Option.getOrThrowWith(() => new Error(`A BigDecimal could not be parsed from '${text}'`)),
    );
};
