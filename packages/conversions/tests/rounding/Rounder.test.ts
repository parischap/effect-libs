import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVRounder from '@parischap/conversions/CVRounder';
import * as CVRounderParams from '@parischap/conversions/CVRounderParams';
import * as CVRoundingOption from '@parischap/conversions/CVRoundingOption';
import { MNumber } from '@parischap/effect-lib';
import { BigDecimal, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVRounder', () => {
  const rounderParams = CVRounderParams.make({
    precision: 3,
    roundingOption: CVRoundingOption.Type.HalfEven,
  });

  describe('number', () => {
    const rounder = CVRounder.number(rounderParams);
    it('Even number', () => {
      TestUtils.assertTrue(pipe(0.4566, rounder, MNumber.equals(0.457)));
    });
    it('Odd number', () => {
      TestUtils.assertTrue(pipe(-0.4564, rounder, MNumber.equals(-0.456)));
    });
  });

  describe('BigDecimal', () => {
    const rounder = CVRounder.bigDecimal(rounderParams);
    it('Even number', () => {
      TestUtils.assertEquals(rounder(BigDecimal.make(4566n, 4)), BigDecimal.make(457n, 3));
    });
    it('Odd number', () => {
      TestUtils.assertEquals(rounder(BigDecimal.make(-4564n, 4)), BigDecimal.make(-456n, 3));
    });
  });
});
