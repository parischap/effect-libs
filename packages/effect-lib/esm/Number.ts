/**
 * Extension to the `effect/Number` module providing safe conversions from `bigint` and
 * `BigDecimal`, positive integer modulo, decimal shifting and truncation, and a few numeric
 * predicates.
 *
 * ## Mental model
 *
 * - **`Type`** is just `number`.
 * - Conversions come in `unsafe*` (lossy: too-large or non-finite values become `±Infinity` or `NaN`)
 *   and `*Option` (validating, returning `Option`) flavors.
 * - Use {@link intModulo} when you need a positive modulo (the JavaScript `%` operator is
 *   sign-preserving).
 *
 * ## Common tasks
 *
 * - **Convert from `bigint`**: {@link unsafeFromBigInt}, {@link fromBigInt}
 * - **Convert from `BigDecimal`**: {@link unsafeFromBigDecimal}, {@link fromBigDecimal}
 * - **Convert from `string`**: {@link unsafeFromString}
 * - **Arithmetic**: {@link opposite}, {@link intModulo}, {@link quotientAndRemainder}, {@link shift},
 *   {@link trunc}
 * - **Predicates**: {@link equals}, {@link isMultipleOf}
 * - **Sign**: {@link sign2}
 * - **Constants**: {@link MAX_SAFE_INTEGER}, {@link MIN_SAFE_INTEGER}
 *
 * ## Quickstart
 *
 * **Example** (Safe conversion and positive modulo)
 *
 * ```ts
 * import * as MNumber from '@parischap/effect-lib/MNumber';
 *
 * console.log(MNumber.fromBigInt(123n)); // Some(123)
 * console.log(MNumber.intModulo(3)(-7)); // 2 (vs. -7 % 3 === -1)
 * ```
 */

import { flow, pipe } from 'effect';
import * as BigDecimal from 'effect/BigDecimal';
import * as BigInt from 'effect/BigInt';
import * as Option from 'effect/Option';
import type * as Predicate from 'effect/Predicate';
import * as Tuple from 'effect/Tuple';

import type * as MBigDecimal from './BigDecimal.js';
import type * as MNumberBase10Format from './NumberBase10Format.js';
import type * as MTypes from './types/types.js';

import * as internalRoundingOptionCorrecter from './internal/RoundingOptionCorrecter.js';

/**
 * Type on which this module's functions operate.
 *
 * @category Models
 */
export type Type = number;

/**
 * `Number.MAX_SAFE_INTEGER` (2^53 − 1) and `Number.MIN_SAFE_INTEGER` (−(2^53 − 1)).
 *
 * @category Constants
 */
export const { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } = Number;

const bigIntMinSafeInteger = BigInt.BigInt(MIN_SAFE_INTEGER);
const bigIntMaxSafeInteger = BigInt.BigInt(MAX_SAFE_INTEGER);
const bigDecimalMinSafeInteger = BigDecimal.make(bigIntMinSafeInteger, 0);
const bigDecimalMaxSafeInteger = BigDecimal.make(bigIntMaxSafeInteger, 0);

/**
 * Builds a `number` from a `bigint` without range checks. Values outside the safe-integer range are
 * coerced to `±Infinity`.
 *
 * - Use only when the input is statically known to fit in a JavaScript `number`.
 *
 * **Example** (Lossy conversion)
 *
 * ```ts
 * import * as MNumber from '@parischap/effect-lib/MNumber';
 *
 * console.log(MNumber.unsafeFromBigInt(42n)); // 42
 * console.log(MNumber.unsafeFromBigInt(2n ** 100n)); // Infinity
 * ```
 *
 * @category Constructors
 *
 * @see {@link fromBigInt} — safe variant
 */
export const unsafeFromBigInt: MTypes.OneArgFunction<bigint, number> = Number;

/**
 * Builds a `number` from a `bigint`, returning `Option.some` when the input lies in
 * `[Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]` and `Option.none` otherwise.
 *
 * **Example** (Safe conversion)
 *
 * ```ts
 * import * as MNumber from '@parischap/effect-lib/MNumber';
 *
 * console.log(MNumber.fromBigInt(42n)); // Some(42)
 * console.log(MNumber.fromBigInt(2n ** 100n)); // None
 * ```
 *
 * @category Constructors
 *
 * @see {@link unsafeFromBigInt} — unchecked variant
 */
export const fromBigInt: MTypes.OneArgFunction<bigint, Option.Option<number>> = flow(
  Option.liftPredicate(
    BigInt.between({ minimum: bigIntMinSafeInteger, maximum: bigIntMaxSafeInteger }),
  ),
  Option.map(unsafeFromBigInt),
);

/**
 * Builds a `number` from a `BigDecimal` without range checks. Values outside the safe-integer range
 * are coerced to `±Infinity`.
 *
 * @category Constructors
 *
 * @see {@link fromBigDecimal} — safe variant
 */
export const unsafeFromBigDecimal: MTypes.OneArgFunction<BigDecimal.BigDecimal, number> =
  BigDecimal.toNumberUnsafe;

/**
 * Builds a `number` from a `BigDecimal`, returning `Option.some` when the input lies in
 * `[Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]` and `Option.none` otherwise.
 *
 * @category Constructors
 *
 * @see {@link unsafeFromBigDecimal} — unchecked variant
 */
export const fromBigDecimal: MTypes.OneArgFunction<
  BigDecimal.BigDecimal,
  Option.Option<number>
> = flow(
  Option.liftPredicate(
    BigDecimal.between({ minimum: bigDecimalMinSafeInteger, maximum: bigDecimalMaxSafeInteger }),
  ),
  Option.map(unsafeFromBigDecimal),
);

/**
 * Returns the additive inverse of `self` (i.e. `-self`).
 *
 * **Example** (Negation)
 *
 * ```ts
 * import * as MNumber from '@parischap/effect-lib/MNumber';
 *
 * console.log(MNumber.opposite(3)); // -3
 * console.log(MNumber.opposite(-3)); // 3
 * ```
 *
 * @category Utils
 */
export const opposite = (self: Type) => -self;

/**
 * Builds a `number` from a `string`. Returns `NaN` when the string is not a valid numeric literal.
 *
 * - `'Infinity'` / `'+Infinity'` produce `Infinity`; `'-Infinity'` produces `-Infinity`.
 *
 * **Example** (String to number)
 *
 * ```ts
 * import * as MNumber from '@parischap/effect-lib/MNumber';
 *
 * console.log(MNumber.unsafeFromString('42')); // 42
 * console.log(MNumber.unsafeFromString('abc')); // NaN
 * ```
 *
 * @category Constructors
 */
export const unsafeFromString: MTypes.NumberFromString = (s) => +s;

/**
 * Returns the non-negative remainder of the integer division of `self` by `divisor`.
 *
 * - Use when a positive remainder is needed (the built-in `%` preserves the sign of `self`).
 * - Both inputs must be finite integers; otherwise the result is meaningless.
 *
 * **Example** (Positive integer modulo)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MNumber from '@parischap/effect-lib/MNumber';
 *
 * console.log(pipe(-7, MNumber.intModulo(3))); // 2
 * console.log(pipe(7, MNumber.intModulo(3))); // 1
 * ```
 *
 * @category Utils
 */
export const intModulo = (divisor: number): MTypes.OneArgFunction<Type> => {
  const absDivisor = Math.abs(divisor);
  return (self) => {
    const rest = self % divisor;
    return rest + (rest >= 0 ? 0 : absDivisor);
  };
};

/**
 * Returns `[quotient, remainder]` for the Euclidean division of `self` by `divisor`. The remainder
 * carries the sign of `divisor`.
 *
 * - Both inputs must be finite integers; otherwise the result is meaningless.
 *
 * **Example** (Quotient and remainder)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MNumber from '@parischap/effect-lib/MNumber';
 *
 * console.log(pipe(7, MNumber.quotientAndRemainder(3))); // [2, 1]
 * console.log(pipe(-7, MNumber.quotientAndRemainder(3))); // [-3, 2]
 * ```
 *
 * @category Destructors
 */
export const quotientAndRemainder =
  (divisor: number) =>
  (self: Type): [quotient: number, remainder: number] => {
    const quotient = Math.floor(self / divisor);
    return [quotient, self - quotient * divisor];
  };

/**
 * Returns `true` when `self` and `n` differ by less than `Number.EPSILON`.
 *
 * - Use to compare floating-point numbers where exact `===` is unreliable.
 * - This is an absolute, not relative, tolerance — it is not appropriate for very large magnitudes.
 *
 * **Example** (Floating-point equality)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MNumber from '@parischap/effect-lib/MNumber';
 *
 * console.log(pipe(0.1 + 0.2, MNumber.equals(0.3))); // true
 * ```
 *
 * @category Predicates
 */
export const equals =
  (n: number): Predicate.Predicate<Type> =>
  (self) =>
    Math.abs(self - n) < Number.EPSILON;

/**
 * Truncates `self` to `precision` decimal digits.
 *
 * - `precision` must be a non-negative finite integer; defaults to `0`.
 * - Rounds towards zero.
 *
 * **Example** (Truncation)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MNumber from '@parischap/effect-lib/MNumber';
 *
 * console.log(pipe(3.14159, MNumber.trunc(2))); // 3.14
 * console.log(pipe(3.7, MNumber.trunc())); // 3
 * ```
 *
 * @category Utils
 */
export const trunc =
  (precision = 0) =>
  (self: Type): number =>
    pipe(self, shift(precision), Math.trunc, shift(-precision));

/**
 * Returns `true` when `self` is a multiple of `a`.
 *
 * - Works for any signs of `self` and `a`.
 *
 * **Example** (Multiplicity check)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MNumber from '@parischap/effect-lib/MNumber';
 *
 * console.log(pipe(10, MNumber.isMultipleOf(2))); // true
 * console.log(pipe(-9, MNumber.isMultipleOf(3))); // true
 * ```
 *
 * @category Predicates
 */
export const isMultipleOf: (a: number) => Predicate.Predicate<Type> = (a) => (self) =>
  self % a === 0;

/**
 * Multiplies `self` by `10^n` (i.e. shifts the decimal point by `n` positions).
 *
 * - Use as the building block of decimal-aware truncation/rounding.
 *
 * **Example** (Decimal shift)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MNumber from '@parischap/effect-lib/MNumber';
 *
 * console.log(pipe(1.5, MNumber.shift(2))); // 150
 * console.log(pipe(150, MNumber.shift(-2))); // 1.5
 * ```
 *
 * @category Utils
 */
export const shift = (n: number) => (self: Type) => self * 10 ** n;

/**
 * Returns a function that rounds `self` to `precision` decimal digits according to `option`.
 *
 * - Use a precomputed rounder when the same `precision`/`option` pair will be applied many times.
 *
 * **Example** (Round to three decimal digits, half to even)
 *
 * ```ts
 * import { pipe } from 'effect';
 * import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
 * import * as MNumber from '@parischap/effect-lib/MNumber';
 *
 * const round = MNumber.round(3, MBigDecimal.RoundingOption.HalfEven);
 * console.log(pipe(12.4565, round)); // 12.456
 * ```
 *
 * @category Utils
 */
export const round = (
  precision: number,
  option: MBigDecimal.RoundingOption,
): MTypes.OneArgFunction<Type> => {
  const shiftMultiplicand = pipe(1, shift(precision));
  const unshiftMultiplicand = 1 / shiftMultiplicand;
  const correcter = internalRoundingOptionCorrecter.fromRoundingOption(option);

  return (self) => {
    const shiftedSelf = shiftMultiplicand * self;
    const truncatedShiftedSelf = Math.trunc(shiftedSelf);
    const firstFollowingDigit = Math.trunc((shiftedSelf - truncatedShiftedSelf) * 10);
    return (
      unshiftMultiplicand *
      (truncatedShiftedSelf +
        correcter({ firstFollowingDigit, isEven: truncatedShiftedSelf % 2 === 0 }))
    );
  };
};

/**
 * Returns the sign of `n` as either `1` or `-1`. Treats `+0` (and the unsigned literal `0`) as
 * positive and `-0` as negative.
 *
 * - Differs from `Math.sign`, which returns `0`/`-0` for those inputs.
 *
 * **Example** (Sign with `±0` distinction)
 *
 * ```ts
 * import * as MNumber from '@parischap/effect-lib/MNumber';
 *
 * console.log(MNumber.sign2(3)); // 1
 * console.log(MNumber.sign2(-3)); // -1
 * console.log(MNumber.sign2(0)); // 1
 * console.log(MNumber.sign2(-0)); // -1
 * ```
 *
 * @category Utils
 */
export const sign2 = (n: number) => (Object.is(n, -0) || n < 0 ? -1 : 1);

/*
 * Combines `format`'s `_bigDecimalExtractor` with a `number` conversion, keeping the sign of the
 * mantissa apart so `-0` can be told apart from `0` (`BigDecimal` cannot make that distinction)
 */
const toNumberExtractor = (
  format: MNumberBase10Format.Type,
): MTypes.OneArgFunction<
  string,
  Option.Option<{ readonly value: number; readonly match: string; readonly input: string }>
> => {
  const bigDecimalExtractor = format._bigDecimalExtractor;
  return flow(
    bigDecimalExtractor,
    Option.flatMap(({ value, match, sign, input }) =>
      pipe(
        value,
        fromBigDecimal,
        Option.map((n) => ({ value: sign * n, match, input })),
      ),
    ),
  );
};

/**
 * Returns a function that tries to extract, from the start of a string, a `number` respecting
 * `format`. If successful, returns a `some` of a `[value, match]` pair where `match` is the part of
 * the string that could be analyzed as representing a number. Otherwise, returns a `none`. Unlike
 * `BigDecimal`, `number` distinguishes `-0` from `0`.
 *
 * - Use a precomputed extractor when the same `format` will be applied many times.
 *
 * **Example** (Extract a `number` from the start of a string)
 *
 * ```ts
 * import * as MNumber from '@parischap/effect-lib/MNumber';
 * import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
 *
 * const extract = MNumber.fromFormatAndStringStart(MNumberBase10Format.frenchStyleNumber);
 * console.log(extract('-45,50Dummy')); // Some([-45.5, '-45,50'])
 * ```
 *
 * @category Constructors
 */
export const fromFormatAndStringStart = (
  format: MNumberBase10Format.Type,
): MTypes.OneArgFunction<string, Option.Option<[value: number, match: string]>> => {
  const numberExtractor = toNumberExtractor(format);
  return flow(
    numberExtractor,
    Option.map(({ value, match }) => Tuple.make(value, match)),
  );
};

/**
 * Same as `fromFormatAndStringStart` but throws in case of failure
 *
 * @category Constructors
 */
export const fromFormatAndStringStartOrThrow = (
  format: MNumberBase10Format.Type,
): MTypes.OneArgFunction<string, [value: number, match: string]> => {
  const extractor = fromFormatAndStringStart(format);
  return (text) =>
    pipe(
      text,
      extractor,
      Option.getOrThrowWith(
        () => new Error(`A number could not be parsed from the start of '${text}'`),
      ),
    );
};

/**
 * Returns a function that tries to convert a whole string into a `number` respecting `format`.
 * Unlike `fromFormatAndStringStart`, the whole of the input string must represent a number.
 *
 * - Use a precomputed parser when the same `format` will be applied many times.
 *
 * **Example** (Parse a `number` from a whole string)
 *
 * ```ts
 * import * as MNumber from '@parischap/effect-lib/MNumber';
 * import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
 *
 * const parse = MNumber.fromFormatAndString(MNumberBase10Format.frenchStyleNumber);
 * console.log(parse('-45,50')); // Some(-45.5)
 * console.log(parse('-45,50Dummy')); // None
 * ```
 *
 * @category Constructors
 */
export const fromFormatAndString = (
  format: MNumberBase10Format.Type,
): MTypes.OneArgFunction<string, Option.Option<number>> => {
  const numberExtractor = toNumberExtractor(format);
  return flow(
    numberExtractor,
    Option.filter(({ match, input }) => match.length === input.length),
    Option.map(({ value }) => value),
  );
};

/**
 * Same as `fromFormatAndString` but throws in case of failure
 *
 * @category Constructors
 */
export const fromFormatAndStringOrThrow = (
  format: MNumberBase10Format.Type,
): MTypes.OneArgFunction<string, number> => {
  const parser = fromFormatAndString(format);
  return (text) =>
    pipe(
      text,
      parser,
      Option.getOrThrowWith(() => new Error(`A number could not be parsed from '${text}'`)),
    );
};
