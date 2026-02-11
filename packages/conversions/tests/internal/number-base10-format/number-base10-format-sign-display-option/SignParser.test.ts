import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVNumberBase10FormatSignDisplayOption from '@parischap/conversions/CVNumberBase10FormatSignDisplayOption';
import * as CVSignParser from '@parischap/conversions/CVSignParser';
import { describe, it } from 'vitest';

describe('CVSignParser', () => {
  describe('Auto', () => {
    const parser = CVSignParser.fromSignDiplayOption(
      CVNumberBase10FormatSignDisplayOption.Type.Auto,
    );
    it('No sign', () => {
      TestUtils.assertSome(parser({ isZero: false, sign: '' }), 1);
      TestUtils.assertSome(parser({ isZero: true, sign: '' }), 1);
    });
    it('Minus sign', () => {
      TestUtils.assertSome(parser({ isZero: false, sign: '-' }), -1);
      TestUtils.assertSome(parser({ isZero: true, sign: '-' }), -1);
    });
    it('Plus sign', () => {
      TestUtils.assertNone(parser({ isZero: false, sign: '+' }));
      TestUtils.assertNone(parser({ isZero: true, sign: '+' }));
    });
  });

  describe('Always', () => {
    const parser = CVSignParser.fromSignDiplayOption(
      CVNumberBase10FormatSignDisplayOption.Type.Always,
    );
    it('No sign', () => {
      TestUtils.assertNone(parser({ isZero: false, sign: '' }));
      TestUtils.assertNone(parser({ isZero: true, sign: '' }));
    });
    it('Minus sign', () => {
      TestUtils.assertSome(parser({ isZero: false, sign: '-' }), -1);
      TestUtils.assertSome(parser({ isZero: true, sign: '-' }), -1);
    });
    it('Plus sign', () => {
      TestUtils.assertSome(parser({ isZero: false, sign: '+' }), 1);
      TestUtils.assertSome(parser({ isZero: true, sign: '+' }), 1);
    });
  });

  describe('ExceptZero', () => {
    const parser = CVSignParser.fromSignDiplayOption(
      CVNumberBase10FormatSignDisplayOption.Type.ExceptZero,
    );
    it('No sign', () => {
      TestUtils.assertNone(parser({ isZero: false, sign: '' }));
      //TestUtils.assertSome(parser({ isZero: true, sign: '' }), 1);
    });
    it('Minus sign', () => {
      TestUtils.assertSome(parser({ isZero: false, sign: '-' }), -1);
      TestUtils.assertNone(parser({ isZero: true, sign: '-' }));
    });
    it('Plus sign', () => {
      TestUtils.assertSome(parser({ isZero: false, sign: '+' }), 1);
      TestUtils.assertNone(parser({ isZero: true, sign: '+' }));
    });
  });

  describe('Negative', () => {
    const parser = CVSignParser.fromSignDiplayOption(
      CVNumberBase10FormatSignDisplayOption.Type.Negative,
    );
    it('No sign', () => {
      TestUtils.assertSome(parser({ isZero: false, sign: '' }), 1);
      TestUtils.assertSome(parser({ isZero: true, sign: '' }), 1);
    });
    it('Minus sign', () => {
      TestUtils.assertSome(parser({ isZero: false, sign: '-' }), -1);
      TestUtils.assertNone(parser({ isZero: true, sign: '-' }));
    });
    it('Plus sign', () => {
      TestUtils.assertNone(parser({ isZero: false, sign: '+' }));
      TestUtils.assertNone(parser({ isZero: true, sign: '+' }));
    });
  });

  describe('Never', () => {
    const parser = CVSignParser.fromSignDiplayOption(
      CVNumberBase10FormatSignDisplayOption.Type.Never,
    );
    it('No sign', () => {
      TestUtils.assertSome(parser({ isZero: false, sign: '' }), 1);
      TestUtils.assertSome(parser({ isZero: true, sign: '' }), 1);
    });
    it('Minus sign', () => {
      TestUtils.assertNone(parser({ isZero: false, sign: '-' }));
      TestUtils.assertNone(parser({ isZero: true, sign: '-' }));
    });
    it('Plus sign', () => {
      TestUtils.assertNone(parser({ isZero: false, sign: '+' }));
      TestUtils.assertNone(parser({ isZero: true, sign: '+' }));
    });
  });
});
