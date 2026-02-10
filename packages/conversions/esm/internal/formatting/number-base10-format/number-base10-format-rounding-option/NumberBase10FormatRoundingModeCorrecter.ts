/** This module implements a type that takes a number and rounds it */

import { MMatch, MTypes } from '@parischap/effect-lib';
import { flow, Function, Struct } from 'effect';
import * as CVNumberBase10FormatRoundingMode from '../../../../formatting/number-base10-format/number-base10-format-rounding-mode/index.js';

/**
 * Type of a CVNumberBase10FormatRoundingModeCorrecter
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<
  {
    readonly firstFollowingDigit: number;
    readonly isEven: boolean;
  },
  number
> {}

/**
 * Builds a `Correcter` implementing `self`
 *
 * @category Destructors
 */
export const fromRoundingMode: MTypes.OneArgFunction<CVNumberBase10FormatRoundingMode.Type, Type> =
  flow(
    MMatch.make,
    flow(
      MMatch.whenIs(
        CVNumberBase10FormatRoundingMode.Type.Ceil,
        (): Type =>
          ({ firstFollowingDigit }) =>
            firstFollowingDigit > 0 ? 1 : 0,
      ),
      MMatch.whenIs(
        CVNumberBase10FormatRoundingMode.Type.Floor,
        (): Type =>
          ({ firstFollowingDigit }) =>
            firstFollowingDigit < 0 ? -1 : 0,
      ),
      MMatch.whenIs(
        CVNumberBase10FormatRoundingMode.Type.Expand,
        (): Type => flow(Struct.get('firstFollowingDigit'), Math.sign),
      ),
      MMatch.whenIs(CVNumberBase10FormatRoundingMode.Type.Trunc, (): Type => Function.constant(0)),
      MMatch.whenIs(
        CVNumberBase10FormatRoundingMode.Type.HalfCeil,
        (): Type =>
          ({ firstFollowingDigit }) =>
            firstFollowingDigit >= 5 ? 1
            : firstFollowingDigit < -5 ? -1
            : 0,
      ),
      MMatch.whenIs(
        CVNumberBase10FormatRoundingMode.Type.HalfFloor,
        (): Type =>
          ({ firstFollowingDigit }) =>
            firstFollowingDigit > 5 ? 1
            : firstFollowingDigit <= -5 ? -1
            : 0,
      ),
      MMatch.whenIs(
        CVNumberBase10FormatRoundingMode.Type.HalfExpand,
        (): Type =>
          ({ firstFollowingDigit }) =>
            firstFollowingDigit >= 5 ? 1
            : firstFollowingDigit <= -5 ? -1
            : 0,
      ),
      MMatch.whenIs(
        CVNumberBase10FormatRoundingMode.Type.HalfTrunc,
        (): Type =>
          ({ firstFollowingDigit }) =>
            firstFollowingDigit > 5 ? 1
            : firstFollowingDigit < -5 ? -1
            : 0,
      ),
      MMatch.whenIs(
        CVNumberBase10FormatRoundingMode.Type.HalfEven,
        (): Type =>
          ({ firstFollowingDigit, isEven }) =>
            firstFollowingDigit > 5 ? 1
            : firstFollowingDigit < -5 ? -1
            : firstFollowingDigit === 5 ?
              isEven ? 0
              : 1
            : firstFollowingDigit === -5 ?
              isEven ? 0
              : -1
            : 0,
      ),
    ),
    MMatch.exhaustive,
  );
