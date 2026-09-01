import { assert, describe, it } from '@effect/vitest';

import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';
import * as MSignFormatter from '@parischap/effect-lib/MSignFormatter';

describe('MSignFormatter', () => {
  describe('Auto', () => {
    const formatter = MSignFormatter.fromSignDisplayOption(
      MNumberBase10Format.SignDisplayOption.Auto,
    );
    it('Minus sign', () => {
      assert.strictEqual(formatter({ isZero: false, sign: -1 }), '-');
      assert.strictEqual(formatter({ isZero: true, sign: -1 }), '-');
    });
    it('Plus sign', () => {
      assert.strictEqual(formatter({ isZero: false, sign: 1 }), '');
      assert.strictEqual(formatter({ isZero: true, sign: 1 }), '');
    });
  });

  describe('Always', () => {
    const formatter = MSignFormatter.fromSignDisplayOption(
      MNumberBase10Format.SignDisplayOption.Always,
    );
    it('Minus sign', () => {
      assert.strictEqual(formatter({ isZero: false, sign: -1 }), '-');
      assert.strictEqual(formatter({ isZero: true, sign: -1 }), '-');
    });
    it('Plus sign', () => {
      assert.strictEqual(formatter({ isZero: false, sign: 1 }), '+');
      assert.strictEqual(formatter({ isZero: true, sign: 1 }), '+');
    });
  });

  describe('ExceptZero', () => {
    const formatter = MSignFormatter.fromSignDisplayOption(
      MNumberBase10Format.SignDisplayOption.ExceptZero,
    );
    it('Minus sign', () => {
      assert.strictEqual(formatter({ isZero: false, sign: -1 }), '-');
      assert.strictEqual(formatter({ isZero: true, sign: -1 }), '');
    });
    it('Plus sign', () => {
      assert.strictEqual(formatter({ isZero: false, sign: 1 }), '+');
      assert.strictEqual(formatter({ isZero: true, sign: 1 }), '');
    });
  });

  describe('Negative', () => {
    const formatter = MSignFormatter.fromSignDisplayOption(
      MNumberBase10Format.SignDisplayOption.Negative,
    );
    it('Minus sign', () => {
      assert.strictEqual(formatter({ isZero: false, sign: -1 }), '-');
      assert.strictEqual(formatter({ isZero: true, sign: -1 }), '');
    });
    it('Plus sign', () => {
      assert.strictEqual(formatter({ isZero: false, sign: 1 }), '');
      assert.strictEqual(formatter({ isZero: true, sign: 1 }), '');
    });
  });

  describe('Never', () => {
    const formatter = MSignFormatter.fromSignDisplayOption(
      MNumberBase10Format.SignDisplayOption.Never,
    );
    it('Minus sign', () => {
      assert.strictEqual(formatter({ isZero: false, sign: -1 }), '');
      assert.strictEqual(formatter({ isZero: true, sign: -1 }), '');
    });
    it('Plus sign', () => {
      assert.strictEqual(formatter({ isZero: false, sign: 1 }), '');
      assert.strictEqual(formatter({ isZero: true, sign: 1 }), '');
    });
  });
});
