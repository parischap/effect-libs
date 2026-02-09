/**
 * Module that implements a type that tries to convert a CVNumberBase10FormatSignString into a
 * CVNumberBase10FormatSignValue
 */

import { MTypes } from '@parischap/effect-lib';
import { flow, Option, Predicate, String, Struct } from 'effect';
import * as CVNumberBase10FormatSignString from './NumberBase10FormatSignString.js';
import * as CVNumberBase10FormatSignValue from './NumberBase10FormatSignValue.js';

/**
 * Type of a CVNumberBase10FormatSignDisplayParser
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<
  { readonly sign: CVNumberBase10FormatSignString.Type; readonly isZero: boolean },
  Option.Option<CVNumberBase10FormatSignValue.Type>
> {}

/**
 * CVNumberBase10FormatSignDisplayParser instance that succeeds in parsing a
 * NumberBase10FormatSignString if a sign is present (i.e. empty string not allowed)
 *
 * @category Instances
 */
export const hasASign: Type = flow(
  Struct.get('sign'),
  Option.liftPredicate(String.isNonEmpty),
  Option.map(CVNumberBase10FormatSignValue.fromSignString),
);

/**
 * CVNumberBase10FormatSignDisplayParser instance that succeeds in parsing a
 * NumberBase10FormatSignString if a sign is not present (i.e. empty string is the only option
 * allowed)
 *
 * @category Instances
 */
export const hasNoSign: Type = flow(
  Struct.get('sign'),
  Option.liftPredicate(String.isEmpty),
  Option.map(CVNumberBase10FormatSignValue.fromSignString),
);

/**
 * CVNumberBase10FormatSignDisplayParser instance that succeeds in parsing a
 * NumberBase10FormatSignString if anything but a plus sign is present
 *
 * @category Instances
 */
export const hasNotPlusSign: Type = flow(
  Struct.get('sign'),
  Option.liftPredicate(Predicate.not(CVNumberBase10FormatSignString.isPlusSign)),
  Option.map(CVNumberBase10FormatSignValue.fromSignString),
);
