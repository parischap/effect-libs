import { describe, it } from '@effect/vitest';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
import * as MScientificNotationParser from '@parischap/effect-lib/MScientificNotationParser';

describe('toParser', () => {
  describe('None', () => {
    const parser = MScientificNotationParser.fromScientificNotationOption(
      MNumberBase10Format.ScientificNotationOption.None,
    );
    it('Empty string', () => {
      TestUtils.assertSome(parser(''), 0);
    });
    it('Value', () => {
      TestUtils.assertNone(parser('+15'));
    });
  });

  describe('Standard', () => {
    const parser = MScientificNotationParser.fromScientificNotationOption(
      MNumberBase10Format.ScientificNotationOption.Standard,
    );
    it('Empty string', () => {
      TestUtils.assertSome(parser(''), 0);
    });
    it('Positive value', () => {
      TestUtils.assertSome(parser('+15'), 15);
    });
  });

  describe('Normalized', () => {
    const parser = MScientificNotationParser.fromScientificNotationOption(
      MNumberBase10Format.ScientificNotationOption.Normalized,
    );
    it('Empty string', () => {
      TestUtils.assertSome(parser(''), 0);
    });
    it('Negative Value', () => {
      TestUtils.assertSome(parser('-15'), -15);
    });
  });

  describe('Engineering', () => {
    const parser = MScientificNotationParser.fromScientificNotationOption(
      MNumberBase10Format.ScientificNotationOption.Engineering,
    );
    it('Empty string', () => {
      TestUtils.assertSome(parser(''), 0);
    });
    it('Multiple of 3', () => {
      TestUtils.assertSome(parser('15'), 15);
    });
    it('Non-multiple of 3', () => {
      TestUtils.assertNone(parser('16'));
    });
  });
});
