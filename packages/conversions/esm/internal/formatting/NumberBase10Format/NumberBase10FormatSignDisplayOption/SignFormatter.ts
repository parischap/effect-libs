/** Module that implements a type that converts a CVSignValue into a CVSignString */

import * as MFunction from '@parischap/effect-lib/MFunction';
import * as MMatch from '@parischap/effect-lib/MMatch';
import * as MTypes from '@parischap/effect-lib/MTypes';
import { flow } from 'effect';
import * as CVNumberBase10FormatSignDisplayOption from '../../../../Formatting/NumberBase10Format/NumberBase10FormatSignDisplayOption/NumberBase10FormatSignDisplayOption.js';
import * as CVSignString from './SignString.js';
import * as CVSignValue from './SignValue.js';

/**
 * Type of a SignDisplay Formatter
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<
  { readonly sign: CVSignValue.Type; readonly isZero: boolean },
  CVSignString.Type
> {}

/**
 * Builds a `Formatter` implementing `self`
 *
 * @category Destructors
 */
export const fromSignDisplayOption: MTypes.OneArgFunction<
  CVNumberBase10FormatSignDisplayOption.Type,
  Type
> = flow(
  MMatch.make,
  MMatch.whenIs(
    CVNumberBase10FormatSignDisplayOption.Type.Auto,
    (): Type =>
      ({ sign }) =>
        sign === -1 ? '-' : '',
  ),
  MMatch.whenIs(
    CVNumberBase10FormatSignDisplayOption.Type.Always,
    (): Type =>
      ({ sign }) =>
        sign === -1 ? '-' : '+',
  ),
  MMatch.whenIs(
    CVNumberBase10FormatSignDisplayOption.Type.ExceptZero,
    (): Type =>
      ({ sign, isZero }) =>
        isZero ? ''
        : sign === -1 ? '-'
        : '+',
  ),
  MMatch.whenIs(
    CVNumberBase10FormatSignDisplayOption.Type.Negative,
    (): Type =>
      ({ sign, isZero }) =>
        isZero || sign === 1 ? '' : '-',
  ),
  MMatch.whenIs(
    CVNumberBase10FormatSignDisplayOption.Type.Never,
    (): Type => MFunction.constEmptyString,
  ),
  MMatch.exhaustive,
);
