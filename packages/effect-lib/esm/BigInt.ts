/**
 * Extension to the Effect BigInt module providing safe constructors from primitives, parity
 * predicates, and a base-10 logarithm.
 *
 * ## Mental model
 *
 * - **`bigint`** is JavaScript's built-in arbitrary-precision integer.
 * - This module focuses on safe construction (`fromPrimitive*`), parity predicates, and a linear-time
 *   base-10 logarithm computed from the decimal representation.
 *
 * ## Common tasks
 *
 * - **Construct**: {@link fromPrimitiveOrThrow}, {@link fromPrimitiveOption}
 * - **Predicates**: {@link isEven}, {@link isOdd}
 * - **Destructors**: {@link log10}, {@link unsafeLog10}
 *
 * ## Quickstart
 *
 * **Example** (Safe construction and parity)
 *
 * ```ts
 * import * as MBigInt from '@parischap/effect-lib/MBigInt';
 *
 * console.log(MBigInt.fromPrimitiveOption('123')); // Some(123n)
 * console.log(MBigInt.fromPrimitiveOption('abc')); // None
 * console.log(MBigInt.isEven(4n)); // true
 * console.log(MBigInt.log10(100n)); // Some(2)
 * ```
 */

import { flow, pipe } from 'effect';
import * as BigInt from 'effect/BigInt';
import * as Number from 'effect/Number';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as String from 'effect/String';

import type * as MTypes from './types/types.js';

/**
 * Type on which this module's functions operate.
 *
 * @category Models
 */
export type Type = bigint;

/**
 * Builds a `bigint` from a `string`, `number`, or `boolean`. Throws when the input cannot be
 * converted (e.g. `NaN`, non-integer numbers, malformed strings).
 *
 * - Use when an exception on invalid input is acceptable (e.g. trusted constants).
 * - For untrusted input, prefer {@link fromPrimitiveOption}.
 *
 * **Example** (Throwing constructor)
 *
 * ```ts
 * import * as MBigInt from '@parischap/effect-lib/MBigInt';
 *
 * console.log(MBigInt.fromPrimitiveOrThrow('123')); // 123n
 * console.log(MBigInt.fromPrimitiveOrThrow(true)); // 1n
 * ```
 *
 * @category Constructors
 *
 * @see {@link fromPrimitiveOption} — non-throwing variant
 */
export const fromPrimitiveOrThrow: MTypes.OneArgFunction<string | number | boolean, bigint> =
  BigInt.BigInt;

/**
 * Same as {@link fromPrimitiveOrThrow} but returns `Option.none` instead of throwing on invalid
 * input.
 *
 * - Use to build a `bigint` from untrusted input.
 *
 * **Example** (Safe construction)
 *
 * ```ts
 * import * as MBigInt from '@parischap/effect-lib/MBigInt';
 *
 * console.log(MBigInt.fromPrimitiveOption('123')); // Some(123n)
 * console.log(MBigInt.fromPrimitiveOption('abc')); // None
 * ```
 *
 * @category Constructors
 */
export const fromPrimitiveOption: MTypes.OneArgFunction<
  string | number | boolean,
  Option.Option<bigint>
> = Option.liftThrowable(fromPrimitiveOrThrow);

/**
 * Returns `true` when `self` is even.
 *
 * **Example** (Even check)
 *
 * ```ts
 * import * as MBigInt from '@parischap/effect-lib/MBigInt';
 *
 * console.log(MBigInt.isEven(4n)); // true
 * console.log(MBigInt.isEven(5n)); // false
 * ```
 *
 * @category Predicates
 */
export const isEven: Predicate.Predicate<Type> = (self) => self % 2n === 0n;

/**
 * Returns `true` when `self` is odd.
 *
 * **Example** (Odd check)
 *
 * ```ts
 * import * as MBigInt from '@parischap/effect-lib/MBigInt';
 *
 * console.log(MBigInt.isOdd(5n)); // true
 * console.log(MBigInt.isOdd(4n)); // false
 * ```
 *
 * @category Predicates
 */
export const isOdd: Predicate.Predicate<Type> = Predicate.not(isEven);

/**
 * Returns `floor(log10(self))` (i.e. one less than the number of decimal digits) without input
 * validation.
 *
 * - Use when `self` is statically known to be strictly positive.
 * - Computed from the length of the decimal representation of `self`.
 * - For non-positive input the result is meaningless: `unsafeLog10(0n)` returns `0`, and for negative
 *   values the leading `'-'` sign is counted as a digit.
 *
 * **Example** (Unchecked base-10 logarithm)
 *
 * ```ts
 * import * as MBigInt from '@parischap/effect-lib/MBigInt';
 *
 * console.log(MBigInt.unsafeLog10(100n)); // 2
 * console.log(MBigInt.unsafeLog10(10n)); // 1
 * ```
 *
 * @category Destructors
 *
 * @see {@link log10} — safe variant returning `Option`
 */
export const unsafeLog10 = (self: Type): number =>
  pipe(self.toString(), String.length, Number.decrement);

/**
 * Safe variant of {@link unsafeLog10}: returns `Option.some(floor(log10(self)))` for strictly
 * positive `self`, otherwise `Option.none`.
 *
 * - Returns `Option.none` for `0n` and for strictly negative values.
 *
 * **Example** (Safe base-10 logarithm)
 *
 * ```ts
 * import * as MBigInt from '@parischap/effect-lib/MBigInt';
 *
 * console.log(MBigInt.log10(100n)); // Some(2)
 * console.log(MBigInt.log10(0n)); // None
 * console.log(MBigInt.log10(-5n)); // None
 * ```
 *
 * @category Destructors
 *
 * @see {@link unsafeLog10} — unchecked variant
 */
export const log10: MTypes.OneArgFunction<Type, Option.Option<number>> = flow(
  Option.liftPredicate(BigInt.isGreaterThan(0n)),
  Option.map(unsafeLog10),
);
