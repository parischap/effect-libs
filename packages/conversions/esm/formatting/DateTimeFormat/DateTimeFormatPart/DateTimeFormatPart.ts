import { flow, pipe } from 'effect';
import * as HashMap from 'effect/HashMap';
import * as Option from 'effect/Option';

/**
 * This module implements a `CVDateTimeFormatPart`, which can be either a
 * `CVDateTimeFormatPlaceholder` or a `CVDateTimeFormatSeparator`. These `CVDateTimeFormatPart`'s
 * are used to describe the string representation of a DateTime. They are converted to
 * `CVTemplatePart`'s to parse and format a `CVDateTime`
 */
import * as MMatch from '@parischap/effect-lib/MMatch';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import type * as CVTemplatePart from '../../template/TemplatePart/TemplatePart.js';
import type * as CVTemplatePlaceholder from '../../template/TemplatePart/TemplatePlaceholder/TemplatePlaceholder.js';
import type * as CVDateTimeFormatContext from '../DateTimeFormatContext/DateTimeFormatContext.js';
import type * as CVDateTimeFormatToken from '../DateTimeFormatToken.js';

import * as CVTemplateSeparator from '../../template/TemplatePart/TemplateSeparator/TemplateSeparator.js';
import * as CVDateTimeFormatPlaceholder from './DateTimeFormatPlaceholder.js';
import * as CVDateTimeFormatSeparator from './DateTimeFormatSeparator.js';

/**
 * Type of a TemplatePart
 *
 * @category Models
 */
export type Type = CVDateTimeFormatPlaceholder.Type | CVDateTimeFormatSeparator.Type;

/**
 * Type guard
 *
 * @category Guards
 */
export const isPlaceholder = (u: Type): u is CVDateTimeFormatPlaceholder.Type =>
  u instanceof CVDateTimeFormatPlaceholder.Type;

/**
 * Type guard
 *
 * @category Guards
 */
export const isSeparator = (u: Type): u is CVDateTimeFormatSeparator.Type =>
  u instanceof CVDateTimeFormatSeparator.Type;

/**
 * Converts self to its CVTemplatePart equivalent
 *
 * @category Destructors
 */
export const toTemplatePart = (
  context: CVDateTimeFormatContext.Type,
): MTypes.OneArgFunction<Type, CVTemplatePart.Type<string, any>> => {
  const getter = (token: CVDateTimeFormatToken.Type): CVTemplatePlaceholder.Type<string, number> =>
    pipe(
      context.tokenMap,
      HashMap.get(token),
      Option.getOrThrowWith(
        () => new Error(`Abnormal error: no TemplatePart was defined for token '${token}'`),
      ),
    );

  return flow(
    MMatch.make,
    MMatch.when(isPlaceholder, flow(CVDateTimeFormatPlaceholder.token, getter)),
    MMatch.when(isSeparator, ({ value }) => CVTemplateSeparator.make(value)),
    MMatch.exhaustive,
  );
};
