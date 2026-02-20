/**
 * This module implements a mantissa adjuster. It takes a number a,nd returns a mantissa and an
 * optional exponent that respect the chosen sscientific notation
 */
import * as MBigInt from '@parischap/effect-lib/MBigInt';
import * as MMatch from '@parischap/effect-lib/MMatch';
import * as MNumber from '@parischap/effect-lib/MNumber';
import * as MTypes from '@parischap/effect-lib/MTypes';
import { flow } from 'effect';
import * as BigDecimal from 'effect/BigDecimal';
import * as BigInt from 'effect/BigInt';
import * as Option from 'effect/Option';
import * as Tuple from 'effect/Tuple';
import * as CVNumberBase10FormatScientificNotationOption from '../../../../Formatting/NumberBase10Format/NumberBase10FormatScientificNotationOption/NumberBase10FormatScientificNotationOption.js';

/**
 * Type of a `CVScientificNotationMantissaAdjuster`
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<
  BigDecimal.BigDecimal,
  readonly [adjustedMantissa: BigDecimal.BigDecimal, exponent: Option.Option<number>]
> {}

/**
 * Builds a `CVScientificNotationMantissaAdjuster` implementing `self`
 *
 * @category Constructors
 */
export const fromScientificNotationOption: MTypes.OneArgFunction<
  CVNumberBase10FormatScientificNotationOption.Type,
  Type
> = flow(
  MMatch.make,
  MMatch.whenIsOr(
    CVNumberBase10FormatScientificNotationOption.Type.None,
    CVNumberBase10FormatScientificNotationOption.Type.Standard,
    (): Type => flow(Tuple.make, Tuple.appendElement(Option.none())),
  ),
  MMatch.whenIs(
    CVNumberBase10FormatScientificNotationOption.Type.Normalized,
    (): Type => (b) => {
      if (BigDecimal.isZero(b)) return Tuple.make(b, Option.some(0));
      const { value } = b;
      const log10 = MBigInt.unsafeLog10(BigInt.abs(value));

      return Tuple.make(BigDecimal.make(value, log10), Option.some(log10 - b.scale));
    },
  ),
  MMatch.whenIs(
    CVNumberBase10FormatScientificNotationOption.Type.Engineering,
    (): Type => (b) => {
      if (BigDecimal.isZero(b)) return Tuple.make(b, Option.some(0));
      const { value } = b;
      const log10 = MBigInt.unsafeLog10(BigInt.abs(value)) - b.scale;
      const correctedLog10 = log10 - MNumber.intModulo(3)(log10);
      return Tuple.make(
        BigDecimal.make(value, correctedLog10 + b.scale),
        Option.some(correctedLog10),
      );
    },
  ),
  MMatch.exhaustive,
);
