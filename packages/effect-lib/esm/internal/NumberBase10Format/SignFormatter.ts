/** Module that implements a type that converts a SignValue into a SignString */

import { flow } from 'effect';

import * as MFunction from '../../Function.js';
import * as MMatch from '../../Match.js';
import type * as MTypes from '../../types/types.js';

import type * as SignString from './SignString.js';
import type * as SignValue from './SignValue.js';

import * as MNumberBase10Format from '../../NumberBase10Format.js';

/**
 * Type of a SignDisplay Formatter
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<
  { readonly sign: SignValue.Type; readonly isZero: boolean },
  SignString.Type
> {}

/**
 * Builds a `Formatter` implementing `self`
 *
 * @category Destructors
 */
export const fromSignDisplayOption: MTypes.OneArgFunction<
  MNumberBase10Format.SignDisplayOption,
  Type
> = flow(
  MMatch.make,
  MMatch.whenIs(
    MNumberBase10Format.SignDisplayOption.Auto,
    (): Type =>
      ({ sign }) =>
        sign === -1 ? '-' : '',
  ),
  MMatch.whenIs(
    MNumberBase10Format.SignDisplayOption.Always,
    (): Type =>
      ({ sign }) =>
        sign === -1 ? '-' : '+',
  ),
  MMatch.whenIs(
    MNumberBase10Format.SignDisplayOption.ExceptZero,
    (): Type =>
      ({ sign, isZero }) =>
        isZero ? '' : sign === -1 ? '-' : '+',
  ),
  MMatch.whenIs(
    MNumberBase10Format.SignDisplayOption.Negative,
    (): Type =>
      ({ sign, isZero }) =>
        isZero || sign === 1 ? '' : '-',
  ),
  MMatch.whenIs(
    MNumberBase10Format.SignDisplayOption.Never,
    (): Type => MFunction.constEmptyString,
  ),
  MMatch.exhaustive,
);
