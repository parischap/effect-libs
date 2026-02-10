/**
 * Module that implements a type that converts a CVNumberBase10FormatSignValue into a
 * CVNumberBase10FormatSignString
 */

import { MFunction, MMatch, MTypes } from '@parischap/effect-lib';
import { flow } from 'effect';
import * as CVNumberBase10FormatSignDisplay from '../../../../formatting/number-base10-format/number-base10-format-sign-display/index.js';
import * as CVNumberBase10FormatSignString from './NumberBase10FormatSignString.js';
import * as CVNumberBase10FormatSignValue from './NumberBase10FormatSignValue.js';

/**
 * Type of a SignDisplay Formatter
 *
 * @category Models
 */
export interface Formatter extends MTypes.OneArgFunction<
  { readonly sign: CVNumberBase10FormatSignValue.Type; readonly isZero: boolean },
  CVNumberBase10FormatSignString.Type
> {}

/**
 * Builds a `Formatter` implementing `self`
 *
 * @category Destructors
 */
export const fromSignDisplay: MTypes.OneArgFunction<
  CVNumberBase10FormatSignDisplay.Type,
  Formatter
> = flow(
  MMatch.make,
  MMatch.whenIs(
    CVNumberBase10FormatSignDisplay.Type.Auto,
    (): Formatter =>
      ({ sign }) =>
        sign === -1 ? '-' : '',
  ),
  MMatch.whenIs(
    CVNumberBase10FormatSignDisplay.Type.Always,
    (): Formatter =>
      ({ sign }) =>
        sign === -1 ? '-' : '+',
  ),
  MMatch.whenIs(
    CVNumberBase10FormatSignDisplay.Type.ExceptZero,
    (): Formatter =>
      ({ sign, isZero }) =>
        isZero ? ''
        : sign === -1 ? '-'
        : '+',
  ),
  MMatch.whenIs(
    CVNumberBase10FormatSignDisplay.Type.Negative,
    (): Formatter =>
      ({ sign, isZero }) =>
        isZero || sign === 1 ? '' : '-',
  ),
  MMatch.whenIs(
    CVNumberBase10FormatSignDisplay.Type.Never,
    (): Formatter => MFunction.constEmptyString,
  ),
  MMatch.exhaustive,
);
