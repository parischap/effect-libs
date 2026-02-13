/** This module implements a type that checks the mantissa of a number */

import { MMatch, MTypes } from '@parischap/effect-lib';
import { BigDecimal, flow, Option, Predicate } from 'effect';
import * as CVNumberBase10FormatScientificNotationOption from '../../../../formatting/number-base10-format/number-base10-format-scientific-notation-option/index.js';

/**
 * Type of a `CVScientificNotationMantissaValidator`
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<
  BigDecimal.BigDecimal,
  Option.Option<BigDecimal.BigDecimal>
> {}

const zeroOrinRange = (rangeTop: number): Predicate.Predicate<BigDecimal.BigDecimal> =>
  Predicate.or(
    BigDecimal.isZero,
    Predicate.and(
      BigDecimal.greaterThanOrEqualTo(BigDecimal.unsafeFromNumber(1)),
      BigDecimal.lessThan(BigDecimal.unsafeFromNumber(rangeTop)),
    ),
  );

const zeroOrinOneToTenRange = zeroOrinRange(10);
const zeroOrinOneToOneThousandRange = zeroOrinRange(1000);

/**
 * Builds a `CVScientificNotationMantissaValidator` implementing `self`
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
    () => Option.some<BigDecimal.BigDecimal>,
  ),
  MMatch.whenIs(CVNumberBase10FormatScientificNotationOption.Type.Normalized, () =>
    Option.liftPredicate(zeroOrinOneToTenRange),
  ),
  MMatch.whenIs(CVNumberBase10FormatScientificNotationOption.Type.Engineering, () =>
    Option.liftPredicate(zeroOrinOneToOneThousandRange),
  ),
  MMatch.exhaustive,
);
