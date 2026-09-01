import { describe, it } from '@effect/vitest';
import { pipe } from 'effect';
import * as BigDecimal from 'effect/BigDecimal';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
import * as MScientificNotationMantissaValidator from '@parischap/effect-lib/MScientificNotationMantissaValidator';

describe('ScientificNotationMantissaValidator', () => {
  describe('None', () => {
    const checker = MScientificNotationMantissaValidator.fromScientificNotationOption(
      MNumberBase10Format.ScientificNotationOption.None,
    );
    TestUtils.assertSome(pipe(checker(BigDecimal.make(15n, 1))));

    it('Standard', () => {
      const checker = MScientificNotationMantissaValidator.fromScientificNotationOption(
        MNumberBase10Format.ScientificNotationOption.Standard,
      );
      TestUtils.assertSome(pipe(checker(BigDecimal.make(0n, 1))));
    });

    describe('Normalized', () => {
      const checker = MScientificNotationMantissaValidator.fromScientificNotationOption(
        MNumberBase10Format.ScientificNotationOption.Normalized,
      );
      it('Passing', () => {
        TestUtils.assertSome(pipe(checker(BigDecimal.make(95n, 1))));
      });
      it('Not-passing', () => {
        TestUtils.assertNone(checker(BigDecimal.make(95n, 2)));
      });
    });

    describe('Engineering', () => {
      const checker = MScientificNotationMantissaValidator.fromScientificNotationOption(
        MNumberBase10Format.ScientificNotationOption.Engineering,
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
