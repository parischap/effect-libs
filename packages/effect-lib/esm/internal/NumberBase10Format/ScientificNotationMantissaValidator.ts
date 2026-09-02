/**
 * Module that implements a type that checks the mantissa of a number.
 *
 * `MNumberBase10Format` is imported type-only: `MNumberBase10Format._bigDecimalExtractor` uses this
 * module, so this module must not depend on `MNumberBase10Format` as a value.
 */

import * as BigDecimal from 'effect/BigDecimal';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';

import type * as MNumberBase10Format from '../../NumberBase10Format.js';
import type * as MTypes from '../../types/types.js';

import * as MArray from '../../Array.js';

/**
 * Type of a `ScientificNotationMantissaValidator`
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
      BigDecimal.isGreaterThanOrEqualTo(BigDecimal.fromNumberUnsafe(1)),
      BigDecimal.isLessThan(BigDecimal.fromNumberUnsafe(rangeTop)),
    ),
  );

const noValidation: Type = Option.some<BigDecimal.BigDecimal>;
const zeroOrinOneToTenRange: Type = Option.liftPredicate(zeroOrinRange(10));
const zeroOrinOneToOneThousandRange: Type = Option.liftPredicate(zeroOrinRange(1000));

/*
 * Indexed in the same order as `MNumberBase10Format.ScientificNotationOption`: None, Standard,
 * Normalized, Engineering
 */
const validators: MTypes.OneArgFunction<number, Type> = MArray.unsafeGetter([
  noValidation,
  noValidation,
  zeroOrinOneToTenRange,
  zeroOrinOneToOneThousandRange,
] as const);

/**
 * Builds a `ScientificNotationMantissaValidator` implementing `self`
 *
 * @category Constructors
 */
export const fromScientificNotationOption: MTypes.OneArgFunction<
  MNumberBase10Format.ScientificNotationOption,
  Type
> = validators;
