import { assert, describe, it } from '@effect/vitest';

import * as MDateTimeFormat from '@parischap/effect-lib/MDateTimeFormat';

describe('MDateTimeFormat', () => {
  const { Token } = MDateTimeFormat;

  describe('make', () => {
    it('Builds an array of strings and tokens in order', () => {
      const format = MDateTimeFormat.make(
        Token.yyyy,
        '-',
        Token.MM,
        '-',
        Token.dd,
        'T',
        Token.HH,
        ':',
        Token.mm,
        ':',
        Token.ss,
        ',',
        Token.SSS,
        Token.zHzH,
        ':',
        Token.zmzm,
      );
      assert.deepStrictEqual(format, [
        Token.yyyy,
        '-',
        Token.MM,
        '-',
        Token.dd,
        'T',
        Token.HH,
        ':',
        Token.mm,
        ':',
        Token.ss,
        ',',
        Token.SSS,
        Token.zHzH,
        ':',
        Token.zmzm,
      ]);
      assert.strictEqual(format.length, 16);
    });
  });

  describe('Instances', () => {
    it('basicIso8601', () => {
      assert.deepStrictEqual(MDateTimeFormat.basicIso8601, [Token.yyyy, Token.MM, Token.dd]);
    });

    it('iso8601', () => {
      assert.deepStrictEqual(MDateTimeFormat.iso8601, [
        Token.yyyy,
        '-',
        Token.MM,
        '-',
        Token.dd,
      ]);
    });

    it('usDate', () => {
      assert.deepStrictEqual(MDateTimeFormat.usDate, [
        Token.MM,
        '/',
        Token.dd,
        '/',
        Token.yyyy,
      ]);
    });

    it('euDate', () => {
      assert.deepStrictEqual(MDateTimeFormat.euDate, [
        Token.dd,
        '/',
        Token.MM,
        '/',
        Token.yyyy,
      ]);
    });

    it('euDotDate', () => {
      assert.deepStrictEqual(MDateTimeFormat.euDotDate, [
        Token.dd,
        '.',
        Token.MM,
        '.',
        Token.yyyy,
      ]);
    });

    it('time24h', () => {
      assert.deepStrictEqual(MDateTimeFormat.time24h, [Token.HH, ':', Token.mm]);
    });

    it('time24hWithSeconds', () => {
      assert.deepStrictEqual(MDateTimeFormat.time24hWithSeconds, [
        Token.HH,
        ':',
        Token.mm,
        ':',
        Token.ss,
      ]);
    });

    it('time12h', () => {
      assert.deepStrictEqual(MDateTimeFormat.time12h, [Token.KK, ':', Token.mm, ' ', Token.a]);
    });

    it('longDate', () => {
      assert.deepStrictEqual(MDateTimeFormat.longDate, [
        Token.MMMM,
        ' ',
        Token.d,
        ',',
        ' ',
        Token.yyyy,
      ]);
    });

    it('shortDate', () => {
      assert.deepStrictEqual(MDateTimeFormat.shortDate, [
        Token.MMM,
        ' ',
        Token.d,
        ',',
        ' ',
        Token.yyyy,
      ]);
    });
  });
});
