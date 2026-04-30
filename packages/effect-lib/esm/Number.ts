/**
 * Extension to the Effect Number module providing safe conversions from BigInt/BigDecimal, modular
 * arithmetic, and numeric predicates
 */
import { flow, pipe } from 'effect';
import * as BigDecimal from 'effect/BigDecimal';
import * as BigInt from 'effect/BigInt';
import * as Option from 'effect/Option';
import type * as Predicate from 'effect/Predicate';

import type * as MTypes from './types/types.js';

/**
 * Type on which this module's functions operate
 *
 * @category Models
 */
export type Type = number;

/**
 * Maximum safe integer (2^53 – 1) and minimum safe integer -(2^53 – 1) in JavaScript
 *
 * @category Constants
 */
export const { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } = Number;

const bigIntMinSafeInteger = BigInt.BigInt(MIN_SAFE_INTEGER);
const bigIntMaxSafeInteger = BigInt.BigInt(MAX_SAFE_INTEGER);
const bigDecimalMinSafeInteger = BigDecimal.make(bigIntMinSafeInteger, 0);
const bigDecimalMaxSafeInteger = BigDecimal.make(bigIntMaxSafeInteger, 0);

/**
 * Builds a number from a BigInt. No checks are carried out. If the number is too big or too small,
 * it is turned into +Infinity or -Infinity
 *
 * @category Constructors
 */
export const unsafeFromBigInt: MTypes.OneArgFunction<bigint, number> = Number;

/**
 * Builds a number from a BigInt. Returns a `some` if the BigInt is in the safe integer range
 * ([`Number.MIN_SAFE_INTEGER`, `Number.MAX_SAFE_INTEGER`]). Returns a `none` otherwise.
 *
 * @category Constructors
 */
export const fromBigIntOption: MTypes.OneArgFunction<bigint, Option.Option<number>> = flow(
  Option.liftPredicate(
    BigInt.between({ minimum: bigIntMinSafeInteger, maximum: bigIntMaxSafeInteger }),
  ),
  Option.map(unsafeFromBigInt),
);

/**
 * Builds a number from a BigDecimal. No checks are carried out. If the number is too big or too
 * small, it is turned into +Infinity or -Infinity
 *
 * @category Constructors
 */
export const unsafeFromBigDecimal: MTypes.OneArgFunction<BigDecimal.BigDecimal, number> =
  BigDecimal.toNumberUnsafe;

/**
 * Builds a number from a BigDecimal. Returns a `some` if the BigDecimal is in the safe integer
 * range ([`Number.MIN_SAFE_INTEGER`, `Number.MAX_SAFE_INTEGER`]). Returns a `none` otherwise.
 *
 * @category Constructors
 */
export const fromBigDecimalOption: MTypes.OneArgFunction<
  BigDecimal.BigDecimal,
  Option.Option<number>
> = flow(
  Option.liftPredicate(
    BigDecimal.between({ minimum: bigDecimalMinSafeInteger, maximum: bigDecimalMaxSafeInteger }),
  ),
  Option.map(unsafeFromBigDecimal),
);

/**
 * Returns the additive inverse (negation) of `self`
 *
 * @category Utils
 */
export const opposite = (self: Type) => -self;

/**
 * Constructs a number from a string. Return `NaN` if the string does not represent a number.
 * Returns Infinity if the string is 'Infinity' or '+Infinity' and -Infinity if the string is '-
 * Infinity'
 *
 * @category Constructors
 */
export const unsafeFromString: MTypes.NumberFromString = (s) => +s;

/**
 * Computes the positive remainder of the integer division of `self` by `divisor`. Unlike the `%`
 * operator, always returns a non-negative result even when `self` or `divisor` is negative. Use
 * only with finite integers.
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
 * Returns the `quotient` and `remainder` of the division of `self` by `divisor`. `remainder` always
 * has the sign of `divisor`. Use only with finite integers
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
 * Returns `true` if `self` and `n` differ by less than `Number.EPSILON`. Useful for floating-point
 * comparisons where exact equality is unreliable.
 *
 * @category Predicates
 */
export const equals =
  (n: number): Predicate.Predicate<Type> =>
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
  (self: Type): number =>
    pipe(self, shift(precision), Math.trunc, shift(-precision));

/**
 * Returns `true` if `self` is a multiple of `a`. Works correctly even when `self` or `a` or both
 * are negative.
 *
 * @category Predicates
 */
export const isMultipleOf: (a: number) => Predicate.Predicate<Type> = (a) => (self) =>
  self % a === 0;

/**
 * Returns `self` multiplied by `10^n`. Useful for decimal digit shifting operations.
 *
 * @category Utils
 */
export const shift = (n: number) => (self: Type) => self * 10 ** n;

/**
 * Returns the sign of `n` as `1` or `-1`. Unlike `Math.sign`, this function treats `0` and `+0` as
 * positive (returns `1`) while `-0` is treated as negative (returns `-1`).
 *
 * @category Utils
 */
export const sign2 = (n: number) => (Object.is(n, -0) || n < 0 ? -1 : 1);
