/** Module that implements a type that tries to convert a CVSignString into a CVSignValue */

import * as MMatch from '@parischap/effect-lib/MMatch'
import * as MPredicate from '@parischap/effect-lib/MPredicate'
import * as MTypes from '@parischap/effect-lib/MTypes'
import {flow} from 'effect'
import * as Function from 'effect/Function'
import * as Option from 'effect/Option'
import * as Predicate from 'effect/Predicate'
import * as String from 'effect/String'
import * as Struct from 'effect/Struct'
import * as CVNumberBase10FormatSignDisplayOption from '../../../../formatting/number-base10-format/number-base10-format-sign-display-option/index.js';
import * as CVSignString from './SignString.js';
import * as CVSignValue from './SignValue.js';
/**
 * Type of a CVNumberBase10FormatSignDisplayParser
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<
  { readonly sign: CVSignString.Type; readonly isZero: boolean },
  Option.Option<CVSignValue.Type>
> {}

/**
 * CVNumberBase10FormatSignDisplayParser instance that succeeds in parsing a SignString if a sign is
 * present (i.e. empty string not allowed)
 *
 * @category Instances
 */
export const hasASign: Type = flow(
  Struct.get('sign'),
  Option.liftPredicate(String.isNonEmpty),
  Option.map(CVSignValue.fromSignString),
);

/**
 * CVNumberBase10FormatSignDisplayParser instance that succeeds in parsing a SignString if a sign is
 * not present (i.e. empty string is the only option allowed)
 *
 * @category Instances
 */
export const hasNoSign: Type = flow(
  Struct.get('sign'),
  Option.liftPredicate(String.isEmpty),
  Option.map(CVSignValue.fromSignString),
);

/**
 * CVNumberBase10FormatSignDisplayParser instance that succeeds in parsing a SignString if anything
 * but a plus sign is present
 *
 * @category Instances
 */
export const hasNotPlusSign: Type = flow(
  Struct.get('sign'),
  Option.liftPredicate(Predicate.not(CVSignString.isPlusSign)),
  Option.map(CVSignValue.fromSignString),
);

/**
 * Builds a `Parser` implementing `self`
 *
 * @category Constructors
 */
export const fromSignDiplayOption: MTypes.OneArgFunction<
  CVNumberBase10FormatSignDisplayOption.Type,
  Type
> = flow(
  MMatch.make,
  MMatch.whenIs(CVNumberBase10FormatSignDisplayOption.Type.Auto, Function.constant(hasNotPlusSign)),
  MMatch.whenIs(CVNumberBase10FormatSignDisplayOption.Type.Always, Function.constant(hasASign)),
  MMatch.whenIs(
    CVNumberBase10FormatSignDisplayOption.Type.ExceptZero,
    (): Type =>
      flow(
        MMatch.make,
        MMatch.when(MPredicate.struct({ isZero: Function.identity }), hasNoSign),
        MMatch.orElse(hasASign),
      ),
  ),
  MMatch.whenIs(
    CVNumberBase10FormatSignDisplayOption.Type.Negative,
    (): Type =>
      flow(
        MMatch.make,
        MMatch.when(MPredicate.struct({ isZero: Function.identity }), hasNoSign),
        MMatch.orElse(hasNotPlusSign),
      ),
  ),
  MMatch.whenIs(CVNumberBase10FormatSignDisplayOption.Type.Never, Function.constant(hasNoSign)),
  MMatch.exhaustive,
);
