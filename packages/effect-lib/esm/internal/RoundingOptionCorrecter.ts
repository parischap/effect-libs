/**
 * This module implements a `RoundingOptionCorrecter`. A `RoundingOptionCorrecter` is a function
 * that takes:
 *
 * - The first digit following the last significant digit
 * - A flag indicating whether the last significant digit is even
 *
 * It returns the increment to apply to the last significand digit 0,-1 or 1.
 *
 * The correcters are stored in a table indexed by `MNumberBase10Format.RoundingOption`'s numeric
 * value. `MNumberBase10Format` is imported type-only here so that `MBigDecimal.round` can depend on
 * this module without creating a circular import.
 */

import type * as MNumberBase10Format from '../NumberBase10Format.js';
import type * as MTypes from '../types/types.js';

import * as MArray from '../Array.js';

/**
 * Type of a RoundingOptionCorrecter
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

/*
 * Indexed in the same order as `MNumberBase10Format.RoundingOption`: Ceil, Floor, Expand, Trunc,
 * HalfCeil, HalfFloor, HalfExpand, HalfTrunc, HalfEven
 */
const correcters: MTypes.OneArgFunction<number, Type> = MArray.unsafeGetter([
  /* Ceil */ ({ firstFollowingDigit }) => (firstFollowingDigit > 0 ? 1 : 0),
  /* Floor */ ({ firstFollowingDigit }) => (firstFollowingDigit < 0 ? -1 : 0),
  /* Expand */ ({ firstFollowingDigit }) => Math.sign(firstFollowingDigit) as -1 | 0 | 1,
  /* Trunc */ () => 0,
  /* HalfCeil */ ({ firstFollowingDigit }) =>
    firstFollowingDigit >= 5 ? 1 : firstFollowingDigit < -5 ? -1 : 0,
  /* HalfFloor */ ({ firstFollowingDigit }) =>
    firstFollowingDigit > 5 ? 1 : firstFollowingDigit <= -5 ? -1 : 0,
  /* HalfExpand */ ({ firstFollowingDigit }) =>
    firstFollowingDigit >= 5 ? 1 : firstFollowingDigit <= -5 ? -1 : 0,
  /* HalfTrunc */ ({ firstFollowingDigit }) =>
    firstFollowingDigit > 5 ? 1 : firstFollowingDigit < -5 ? -1 : 0,
  /* HalfEven */ ({ firstFollowingDigit, isEven }) =>
    firstFollowingDigit > 5
      ? 1
      : firstFollowingDigit < -5
        ? -1
        : firstFollowingDigit === 5
          ? isEven
            ? 0
            : 1
          : firstFollowingDigit === -5
            ? isEven
              ? 0
              : -1
            : 0,
] as const);

/**
 * Builds a `RoundingOptionCorrecter` from a `MNumberBase10Format.RoundingOption`
 *
 * @category Destructors
 */
export const fromRoundingOption: MTypes.OneArgFunction<MNumberBase10Format.RoundingOption, Type> =
  correcters;
