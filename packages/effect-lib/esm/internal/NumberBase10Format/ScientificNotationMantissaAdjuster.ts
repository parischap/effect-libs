/**
 * This module implements a mantissa adjuster. It takes a number and returns a mantissa and an
 * optional exponent that respect the chosen scientific notation
 */

import { flow } from 'effect';
import * as BigDecimal from 'effect/BigDecimal';
import * as BigInt from 'effect/BigInt';
import * as Option from 'effect/Option';
import * as Tuple from 'effect/Tuple';

import type * as MTypes from '../../types/types.js';

import * as MBigInt from '../../BigInt.js';
import * as MMatch from '../../Match.js';
import * as MNumber from '../../Number.js';
import * as MNumberBase10Format from '../../NumberBase10Format.js';

/**
 * Type of a `ScientificNotationMantissaAdjuster`
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<
  BigDecimal.BigDecimal,
  readonly [adjustedMantissa: BigDecimal.BigDecimal, exponent: Option.Option<number>]
> {}

/**
 * Builds a `ScientificNotationMantissaAdjuster` implementing `self`
 *
 * @category Constructors
 */
export const fromScientificNotationOption: MTypes.OneArgFunction<
  MNumberBase10Format.ScientificNotationOption,
  Type
> = flow(
  MMatch.make,
  MMatch.whenIsOr(
    MNumberBase10Format.ScientificNotationOption.None,
    MNumberBase10Format.ScientificNotationOption.Standard,
    (): Type => flow(Tuple.make, Tuple.appendElement(Option.none())),
  ),
  MMatch.whenIs(MNumberBase10Format.ScientificNotationOption.Normalized, (): Type => (b) => {
    if (BigDecimal.isZero(b)) return Tuple.make(b, Option.some(0));
    const { value } = b;
    const log10 = MBigInt.unsafeLog10(BigInt.abs(value));

    return Tuple.make(BigDecimal.make(value, log10), Option.some(log10 - b.scale));
  }),
  MMatch.whenIs(MNumberBase10Format.ScientificNotationOption.Engineering, (): Type => (b) => {
    if (BigDecimal.isZero(b)) return Tuple.make(b, Option.some(0));
    const { value } = b;
    const log10 = MBigInt.unsafeLog10(BigInt.abs(value)) - b.scale;
    const correctedLog10 = log10 - MNumber.intModulo(3)(log10);
    return Tuple.make(
      BigDecimal.make(value, correctedLog10 + b.scale),
      Option.some(correctedLog10),
    );
  }),
  MMatch.exhaustive,
);
