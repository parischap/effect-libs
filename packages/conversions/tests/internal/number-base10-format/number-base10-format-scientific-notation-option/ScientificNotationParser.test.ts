import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVNumberBase10FormatScientificNotationOption from '@parischap/conversions/CVNumberBase10FormatScientificNotationOption';
import * as CVScientificNotationParser from '@parischap/conversions/CVScientificNotationParser';
import { describe, it } from 'vitest';

describe('toParser', () => {
  describe('None', () => {
    const parser = CVScientificNotationParser.fromScientificNotationOption(
      CVNumberBase10FormatScientificNotationOption.Type.None,
    );
    it('Empty string', () => {
      TestUtils.assertSome(parser(''), 0);
    });
    it('Value', () => {
      TestUtils.assertNone(parser('+15'));
    });
  });

  describe('Standard', () => {
    const parser = CVScientificNotationParser.fromScientificNotationOption(
      CVNumberBase10FormatScientificNotationOption.Type.Standard,
    );
    it('Empty string', () => {
      TestUtils.assertSome(parser(''), 0);
    });
    it('Positive value', () => {
      TestUtils.assertSome(parser('+15'), 15);
    });
  });

  describe('Normalized', () => {
    const parser = CVScientificNotationParser.fromScientificNotationOption(
      CVNumberBase10FormatScientificNotationOption.Type.Normalized,
    );
    it('Empty string', () => {
      TestUtils.assertSome(parser(''), 0);
    });
    it('Negative Value', () => {
      TestUtils.assertSome(parser('-15'), -15);
    });
  });

  describe('Engineering', () => {
    const parser = CVScientificNotationParser.fromScientificNotationOption(
      CVNumberBase10FormatScientificNotationOption.Type.Engineering,
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
