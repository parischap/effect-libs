/**
 * Module that implements a type that tries to parse the scientific notation part from a string.
 *
 * `MNumberBase10Format` is imported type-only: `MNumberBase10Format._bigDecimalExtractor` uses
 * this module, so this module must not depend on `MNumberBase10Format` as a value.
 */

import { flow } from 'effect';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as String from 'effect/String';

import * as MArray from '../../Array.js';
import * as MNumber from '../../Number.js';
import type * as MTypes from '../../types/types.js';

import type * as MNumberBase10Format from '../../NumberBase10Format.js';

/**
 * Type of a `ScientificNotationParser`
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<string, Option.Option<number>> {}

const stringToExponent: Type = flow(
  Option.liftPredicate(String.isNonEmpty),
  Option.map(MNumber.unsafeFromString),
  Option.orElseSome(Function.constant(0)),
);

const emptyStringToZero: Type = flow(Option.liftPredicate(String.isEmpty), Option.as(0));

const stringToMultipleOfThreeExponent: Type = flow(
  stringToExponent,
  Option.filter(MNumber.isMultipleOf(3)),
);

/*
 * Indexed in the same order as `MNumberBase10Format.ScientificNotationOption`: None, Standard,
 * Normalized, Engineering
 */
const parsers: MTypes.OneArgFunction<number, Type> = MArray.unsafeGetter([
  emptyStringToZero,
  stringToExponent,
  stringToExponent,
  stringToMultipleOfThreeExponent,
] as const);

/**
 * Builds a `ScientificNotationParser` implementing `self`
 *
 * @category Constructors
 */
export const fromScientificNotationOption: MTypes.OneArgFunction<
  MNumberBase10Format.ScientificNotationOption,
  Type
> = parsers;
