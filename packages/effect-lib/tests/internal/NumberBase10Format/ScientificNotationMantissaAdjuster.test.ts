import { describe, it } from '@effect/vitest';
import * as BigDecimal from 'effect/BigDecimal';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
import * as MScientificNotationMantissaAdjuster from '@parischap/effect-lib/MScientificNotationMantissaAdjuster';

describe('toMantissaChecker', () => {
  const aBigNumber = BigDecimal.make(15_654_543_234n, 2);
  const aSmallNumber = BigDecimal.make(-15n, 4);
  it('None', () => {
    const adjuster = MScientificNotationMantissaAdjuster.fromScientificNotationOption(
      MNumberBase10Format.ScientificNotationOption.None,
    );
    TestUtils.assertEquals(adjuster(aBigNumber), [aBigNumber, Option.none()]);
  });

  it('Standard', () => {
    const adjuster = MScientificNotationMantissaAdjuster.fromScientificNotationOption(
      MNumberBase10Format.ScientificNotationOption.Standard,
    );
    TestUtils.assertEquals(adjuster(aBigNumber), [aBigNumber, Option.none()]);
  });

  describe('Normalized', () => {
    const adjuster = MScientificNotationMantissaAdjuster.fromScientificNotationOption(
      MNumberBase10Format.ScientificNotationOption.Normalized,
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
    const adjuster = MScientificNotationMantissaAdjuster.fromScientificNotationOption(
      MNumberBase10Format.ScientificNotationOption.Engineering,
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
