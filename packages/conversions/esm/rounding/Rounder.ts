/**
 * This module implements a CVRounder, i.e. a function that can round a number or a BigDecimal to
 * the given `precision` and according to the passed `CVRoundingOption`
 */

import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal'
import * as MBigInt from '@parischap/effect-lib/MBigInt'
import * as MNumber from '@parischap/effect-lib/MNumber'
import * as MTypes from '@parischap/effect-lib/MTypes'
import {pipe} from 'effect'
import * as BigDecimal from 'effect/BigDecimal'
import * as CVRoundingOptionCorrecter from '../internal/rounding/rounding-option/RoundingOptionCorrecter.js';
import * as CVRounderParams from './RounderParams.js';

const _bigDecimal10 = BigDecimal.make(10n, 0);

/**
 * Type of a CVRounder
 *
 * @category Models
 */
export interface Type<
  in out N extends number | BigDecimal.BigDecimal,
> extends MTypes.OneArgFunction<N> {}

/**
 * Constructor of a number rounder from a CVRounderParams
 *
 * @category Constructors
 */
export const number = (rounderParams: CVRounderParams.Type): Type<number> => {
  const shiftMultiplicand = pipe(1, MNumber.shift(rounderParams.precision));
  const unshiftMultiplicand = 1 / shiftMultiplicand;

  const correcter = CVRoundingOptionCorrecter.fromRoundingOption(rounderParams.roundingOption);

  return (n) => {
    const shiftedSelf = shiftMultiplicand * n;
    const truncatedShiftedSelf = Math.trunc(shiftedSelf);
    const firstFollowingDigit = Math.trunc((shiftedSelf - truncatedShiftedSelf) * 10);
    return (
      unshiftMultiplicand
      * (truncatedShiftedSelf
        + correcter({ firstFollowingDigit, isEven: truncatedShiftedSelf % 2 === 0 }))
    );
  };
};

/**
 * Constructor of a BigDecimal rounder from a CVRounderParams
 *
 * @category Constructors
 */
export const bigDecimal = (rounderParams: CVRounderParams.Type): Type<BigDecimal.BigDecimal> => {
  const shiftValue = BigDecimal.make(1n, -rounderParams.precision);
  const shift = BigDecimal.multiply(shiftValue);
  const unshift = BigDecimal.unsafeDivide(shiftValue);
  const correcter = CVRoundingOptionCorrecter.fromRoundingOption(rounderParams.roundingOption);

  return (n) => {
    const shiftedSelf = shift(n);
    const truncatedShiftedSelf = pipe(shiftedSelf, MBigDecimal.trunc());
    const firstFollowingDigit = pipe(
      shiftedSelf,
      BigDecimal.subtract(truncatedShiftedSelf),
      BigDecimal.multiply(_bigDecimal10),
      MBigDecimal.trunc(),
      BigDecimal.unsafeToNumber,
    );
    return pipe(
      truncatedShiftedSelf,
      BigDecimal.sum(
        pipe(
          { firstFollowingDigit, isEven: MBigInt.isEven(truncatedShiftedSelf.value) },
          correcter,
          BigDecimal.unsafeFromNumber,
        ),
      ),
      unshift,
    );
  };
};
