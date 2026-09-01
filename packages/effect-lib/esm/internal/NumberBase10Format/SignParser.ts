/**
 * Module that implements a type that tries to convert a SignString into a SignValue.
 *
 * `MNumberBase10Format` is imported type-only: `MNumberBase10Format._bigDecimalExtractor` uses
 * this module, so this module must not depend on `MNumberBase10Format` as a value.
 */

import { flow } from 'effect';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as String from 'effect/String';
import * as Struct from 'effect/Struct';

import * as MArray from '../../Array.js';
import * as MMatch from '../../Match.js';
import * as MPredicate from '../../Predicate.js';
import type * as MTypes from '../../types/types.js';

import type * as MNumberBase10Format from '../../NumberBase10Format.js';
import * as SignString from './SignString.js';
import * as SignValue from './SignValue.js';

/**
 * Type of a SignDisplayParser
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<
  { readonly sign: SignString.Type; readonly isZero: boolean },
  Option.Option<SignValue.Type>
> {}

/**
 * SignDisplayParser instance that succeeds in parsing a SignString if a sign is present (i.e.
 * empty string not allowed)
 *
 * @category Instances
 */
export const hasASign: Type = flow(
  Struct.get('sign'),
  Option.liftPredicate(String.isNonEmpty),
  Option.map(SignValue.fromSignString),
);

/**
 * SignDisplayParser instance that succeeds in parsing a SignString if a sign is not present (i.e.
 * empty string is the only option allowed)
 *
 * @category Instances
 */
export const hasNoSign: Type = flow(
  Struct.get('sign'),
  Option.liftPredicate(String.isEmpty),
  Option.map(SignValue.fromSignString),
);

/**
 * SignDisplayParser instance that succeeds in parsing a SignString if anything but a plus sign is
 * present
 *
 * @category Instances
 */
export const hasNotPlusSign: Type = flow(
  Struct.get('sign'),
  Option.liftPredicate(Predicate.not(SignString.isPlusSign)),
  Option.map(SignValue.fromSignString),
);

const exceptZeroParser: Type = flow(
  MMatch.make,
  MMatch.when(MPredicate.struct({ isZero: Function.identity }), hasNoSign),
  MMatch.orElse(hasASign),
);

const negativeParser: Type = flow(
  MMatch.make,
  MMatch.when(MPredicate.struct({ isZero: Function.identity }), hasNoSign),
  MMatch.orElse(hasNotPlusSign),
);

/*
 * Indexed in the same order as `MNumberBase10Format.SignDisplayOption`: Auto, Always, ExceptZero,
 * Negative, Never
 */
const parsers: MTypes.OneArgFunction<number, Type> = MArray.unsafeGetter([
  hasNotPlusSign,
  hasASign,
  exceptZeroParser,
  negativeParser,
  hasNoSign,
] as const);

/**
 * Builds a `Parser` implementing `self`
 *
 * @category Constructors
 */
export const fromSignDisplayOption: MTypes.OneArgFunction<
  MNumberBase10Format.SignDisplayOption,
  Type
> = parsers;
