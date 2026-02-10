/** This module implements a type that tries to parse the scientific notation part from a string */

import { MMatch, MNumber, MTypes } from '@parischap/effect-lib';
import { flow, Function, Option, String } from 'effect';
import * as CVNumberBase10FormatScientificNotationOption from '../../../../formatting/number-base10-format/number-base10-format-scientific-notation-option/index.js';
/**
 * Type of a CVScientificNotationParser
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<string, Option.Option<number>> {}

const _stringToExponent = flow(
  Option.liftPredicate(String.isNonEmpty),
  Option.map(MNumber.unsafeFromString),
  Option.orElseSome(Function.constant(0)),
);

/**
 * Builds a `Parser` implementing `self`
 *
 * @category Destructors
 */
export const fromScientificNotationOption: MTypes.OneArgFunction<
  CVNumberBase10FormatScientificNotationOption.Type,
  Type
> = flow(
  MMatch.make,
  MMatch.whenIs(CVNumberBase10FormatScientificNotationOption.Type.None, () =>
    flow(Option.liftPredicate(String.isEmpty), Option.as(0)),
  ),
  MMatch.whenIsOr(
    CVNumberBase10FormatScientificNotationOption.Type.Standard,
    CVNumberBase10FormatScientificNotationOption.Type.Normalized,
    Function.constant(_stringToExponent),
  ),
  MMatch.whenIs(CVNumberBase10FormatScientificNotationOption.Type.Engineering, () =>
    flow(_stringToExponent, Option.filter(MNumber.isMultipleOf(3))),
  ),
  MMatch.exhaustive,
);
