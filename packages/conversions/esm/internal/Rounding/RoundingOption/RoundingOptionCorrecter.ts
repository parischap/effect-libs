/**
 * This module implements a CVRoundingOptionCorrecter. A CVRoundingOptionCorrecter is a function
 * that takes:
 *
 * - the first digit following the last significant digit
 * - a flag indicating whether the last significant digit is even
 *
 * It returns the increment to apply to the last significand digit 0,-1 or 1
 */

import * as MMatch from '@parischap/effect-lib/MMatch';
import * as MTypes from '@parischap/effect-lib/MTypes';
import { flow } from 'effect';
import * as Function from 'effect/Function';
import * as Struct from 'effect/Struct';
import * as CVRoundingOption from '../../../Rounding/RoundingOption/RoundingOption.js';
/**
 * Type of a CVRoundingOptionCorrecter
 *
 * @category Models
 */
export interface Type extends MTypes.OneArgFunction<
  {
    readonly firstFollowingDigit: number;
    readonly isEven: boolean;
  },
  -1 | 0 | 1
> {}

/**
 * Builds a `CVRoundingOptionCorrecter` from a `CVRoundingOption`
 *
 * @category Destructors
 */
export const fromRoundingOption: MTypes.OneArgFunction<CVRoundingOption.Type, Type> = flow(
  MMatch.make,
  flow(
    MMatch.whenIs(
      CVRoundingOption.Type.Ceil,
      (): Type =>
        ({ firstFollowingDigit }) =>
          firstFollowingDigit > 0 ? 1 : 0,
    ),
    MMatch.whenIs(
      CVRoundingOption.Type.Floor,
      (): Type =>
        ({ firstFollowingDigit }) =>
          firstFollowingDigit < 0 ? -1 : 0,
    ),
    MMatch.whenIs(
      CVRoundingOption.Type.Expand,
      () => flow(Struct.get('firstFollowingDigit'), Math.sign) as Type,
    ),
    MMatch.whenIs(CVRoundingOption.Type.Trunc, (): Type => Function.constant(0)),
    MMatch.whenIs(
      CVRoundingOption.Type.HalfCeil,
      (): Type =>
        ({ firstFollowingDigit }) =>
          firstFollowingDigit >= 5 ? 1
          : firstFollowingDigit < -5 ? -1
          : 0,
    ),
    MMatch.whenIs(
      CVRoundingOption.Type.HalfFloor,
      (): Type =>
        ({ firstFollowingDigit }) =>
          firstFollowingDigit > 5 ? 1
          : firstFollowingDigit <= -5 ? -1
          : 0,
    ),
    MMatch.whenIs(
      CVRoundingOption.Type.HalfExpand,
      (): Type =>
        ({ firstFollowingDigit }) =>
          firstFollowingDigit >= 5 ? 1
          : firstFollowingDigit <= -5 ? -1
          : 0,
    ),
    MMatch.whenIs(
      CVRoundingOption.Type.HalfTrunc,
      (): Type =>
        ({ firstFollowingDigit }) =>
          firstFollowingDigit > 5 ? 1
          : firstFollowingDigit < -5 ? -1
          : 0,
    ),
    MMatch.whenIs(
      CVRoundingOption.Type.HalfEven,
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
