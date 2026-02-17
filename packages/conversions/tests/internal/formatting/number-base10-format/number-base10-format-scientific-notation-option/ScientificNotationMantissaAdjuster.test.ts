import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVNumberBase10FormatScientificNotationOption from '@parischap/conversions/CVNumberBase10FormatScientificNotationOption';
import * as CVScientificNotationMantissaAdjuster from '@parischap/conversions/CVScientificNotationMantissaAdjuster';
import * as BigDecimal from 'effect/BigDecimal'
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('toMantissaChecker', () => {
  const aBigNumber = BigDecimal.make(15_654_543_234n, 2);
  const aSmallNumber = BigDecimal.make(-15n, 4);
  it('None', () => {
    const adjuster = CVScientificNotationMantissaAdjuster.fromScientificNotationOption(
      CVNumberBase10FormatScientificNotationOption.Type.None,
    );
    TestUtils.assertEquals(adjuster(aBigNumber), [aBigNumber, Option.none()]);
  });

  it('Standard', () => {
    const adjuster = CVScientificNotationMantissaAdjuster.fromScientificNotationOption(
      CVNumberBase10FormatScientificNotationOption.Type.Standard,
    );
    TestUtils.assertEquals(adjuster(aBigNumber), [aBigNumber, Option.none()]);
  });

  describe('Normalized', () => {
    const adjuster = CVScientificNotationMantissaAdjuster.fromScientificNotationOption(
      CVNumberBase10FormatScientificNotationOption.Type.Normalized,
    );
    it('Big number', () => {
      TestUtils.assertEquals(adjuster(aBigNumber), [
        BigDecimal.make(15_654_543_234n, 10),
        Option.some(8),
      ]);
    });
    it('Small number', () => {
      TestUtils.assertEquals(adjuster(aSmallNumber), [BigDecimal.make(-15n, 1), Option.some(-3)]);
    });
  });

  describe('Engineering', () => {
    const adjuster = CVScientificNotationMantissaAdjuster.fromScientificNotationOption(
      CVNumberBase10FormatScientificNotationOption.Type.Engineering,
    );
    it('Big number', () => {
      TestUtils.assertEquals(adjuster(aBigNumber), [
        BigDecimal.make(15_654_543_234n, 8),
        Option.some(6),
      ]);
    });
    it('Small number', () => {
      TestUtils.assertEquals(adjuster(aSmallNumber), [BigDecimal.make(-15n, 1), Option.some(-3)]);
    });
  });
});
