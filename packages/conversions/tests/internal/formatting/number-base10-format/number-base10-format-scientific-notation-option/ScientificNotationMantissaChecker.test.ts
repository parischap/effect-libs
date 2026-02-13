import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVNumberBase10FormatScientificNotationOption from '@parischap/conversions/CVNumberBase10FormatScientificNotationOption';
import * as CVScientificNotationMantissaValidator from '@parischap/conversions/CVScientificNotationMantissaValidator';
import { BigDecimal, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('toMantissaChecker', () => {
  describe('None', () => {
    const checker = CVScientificNotationMantissaValidator.fromScientificNotationOption(
      CVNumberBase10FormatScientificNotationOption.Type.None,
    );
    TestUtils.assertSome(pipe(checker(BigDecimal.make(15n, 1))));

    it('Standard', () => {
      const checker = CVScientificNotationMantissaValidator.fromScientificNotationOption(
        CVNumberBase10FormatScientificNotationOption.Type.Standard,
      );
      TestUtils.assertSome(pipe(checker(BigDecimal.make(0n, 1))));
    });

    describe('Normalized', () => {
      const checker = CVScientificNotationMantissaValidator.fromScientificNotationOption(
        CVNumberBase10FormatScientificNotationOption.Type.Normalized,
      );
      it('Passing', () => {
        TestUtils.assertSome(pipe(checker(BigDecimal.make(95n, 1))));
      });
      it('Not-passing', () => {
        TestUtils.assertNone(checker(BigDecimal.make(95n, 2)));
      });
    });

    describe('Engineering', () => {
      const checker = CVScientificNotationMantissaValidator.fromScientificNotationOption(
        CVNumberBase10FormatScientificNotationOption.Type.Engineering,
      );
      it('Passing', () => {
        TestUtils.assertSome(pipe(checker(BigDecimal.make(59_527n, 2))));
      });
      it('Not-passing', () => {
        TestUtils.assertNone(checker(BigDecimal.make(100_198n, 2)));
      });
    });
  });
});
