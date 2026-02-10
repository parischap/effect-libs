/** This module implements a type that tries to parse the scientific notation part of a number */

import { MTypes } from '@parischap/effect-lib';
import { Option } from 'effect/Schema';

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
export const toParser: MTypes.OneArgFunction<ScientificNotation, Parser> = flow(
  MMatch.make,
  MMatch.whenIs(ScientificNotation.None, () =>
    flow(Option.liftPredicate(String.isEmpty), Option.as(0)),
  ),
  MMatch.whenIsOr(
    ScientificNotation.Standard,
    ScientificNotation.Normalized,
    Function.constant(_stringToExponent),
  ),
  MMatch.whenIs(ScientificNotation.Engineering, () =>
    flow(_stringToExponent, Option.filter(MNumber.isMultipleOf(3))),
  ),
  MMatch.exhaustive,
);
