import * as TestUtils from '@parischap/configs/TestUtils';
import { CVRoundingMode, CVRoundingOption } from '@parischap/conversions';
import { MNumber } from '@parischap/effect-lib';
import { BigDecimal, Option, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVRoundingOption', () => {
  const roundingOption = CVRoundingOption.make({
    precision: 3,
    roundingMode: CVRoundingMode.Type.HalfEven,
  });

  describe('Tag, .toString()', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(CVRoundingOption.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    it('.toString()', () => {
      TestUtils.strictEqual(roundingOption.toString(), 'HalfEvenRounderWith3Precision');
    });
  });

  describe('toNumberRounder', () => {
    const rounder = CVRoundingOption.toNumberRounder(roundingOption);
    it('Even number', () => {
      TestUtils.assertTrue(pipe(0.4566, rounder, MNumber.equals(0.457)));
    });
    it('Odd number', () => {
      TestUtils.assertTrue(pipe(-0.4564, rounder, MNumber.equals(-0.456)));
    });
  });

  describe('toBigDecimalRounder', () => {
    const rounder = CVRoundingOption.toBigDecimalRounder(roundingOption);
    it('Even number', () => {
      TestUtils.assertEquals(rounder(BigDecimal.make(4566n, 4)), BigDecimal.make(457n, 3));
    });
    it('Odd number', () => {
      TestUtils.assertEquals(rounder(BigDecimal.make(-4564n, 4)), BigDecimal.make(-456n, 3));
    });
  });
});
