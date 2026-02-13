/** Module that implements a type that converts a CVSignValue into a CVSignString */

import { MFunction, MMatch, MTypes } from '@parischap/effect-lib';
import { flow } from 'effect';
import * as CVNumberBase10FormatSignDisplayOption from '../../../../formatting/number-base10-format/number-base10-format-sign-display-option/index.js';
import * as CVSignString from './SignString.js';
import * as CVSignValue from './SignValue.js';

/**
 * Type of a SignDisplay Formatter
 *
 * @category Models
 */
export interface Formatter extends MTypes.OneArgFunction<
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
  Formatter
> = flow(
  MMatch.make,
  MMatch.whenIs(
    CVNumberBase10FormatSignDisplayOption.Type.Auto,
    (): Formatter =>
      ({ sign }) =>
        sign === -1n ? '-' : '',
  ),
  MMatch.whenIs(
    CVNumberBase10FormatSignDisplayOption.Type.Always,
    (): Formatter =>
      ({ sign }) =>
        sign === -1n ? '-' : '+',
  ),
  MMatch.whenIs(
    CVNumberBase10FormatSignDisplayOption.Type.ExceptZero,
    (): Formatter =>
      ({ sign, isZero }) =>
        isZero ? ''
        : sign === -1n ? '-'
        : '+',
  ),
  MMatch.whenIs(
    CVNumberBase10FormatSignDisplayOption.Type.Negative,
    (): Formatter =>
      ({ sign, isZero }) =>
        isZero || sign === 1n ? '' : '-',
  ),
  MMatch.whenIs(
    CVNumberBase10FormatSignDisplayOption.Type.Never,
    (): Formatter => MFunction.constEmptyString,
  ),
  MMatch.exhaustive,
);
