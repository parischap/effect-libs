import { describe, it } from '@effect/vitest';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
import * as MSignParser from '@parischap/effect-lib/MSignParser';

describe('MSignParser', () => {
  describe('Auto', () => {
    const parser = MSignParser.fromSignDisplayOption(MNumberBase10Format.SignDisplayOption.Auto);
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
    const parser = MSignParser.fromSignDisplayOption(MNumberBase10Format.SignDisplayOption.Always);
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
    const parser = MSignParser.fromSignDisplayOption(
      MNumberBase10Format.SignDisplayOption.ExceptZero,
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
    const parser = MSignParser.fromSignDisplayOption(
      MNumberBase10Format.SignDisplayOption.Negative,
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
    const parser = MSignParser.fromSignDisplayOption(MNumberBase10Format.SignDisplayOption.Never);
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
