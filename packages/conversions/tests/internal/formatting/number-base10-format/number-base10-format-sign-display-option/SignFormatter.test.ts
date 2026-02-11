import * as TestUtils from '@parischap/configs/TestUtils';
import * as CVNumberBase10FormatSignDisplayOption from '@parischap/conversions/CVNumberBase10FormatSignDisplayOption';
import * as CVSignFormatter from '@parischap/conversions/CVSignFormatter';
import { describe, it } from 'vitest';

describe('CVSignFormatter', () => {
  describe('Auto', () => {
    const formatter = CVSignFormatter.fromSignDisplayOption(
      CVNumberBase10FormatSignDisplayOption.Type.Auto,
    );
    it('Minus sign', () => {
      TestUtils.strictEqual(formatter({ isZero: false, sign: -1 }), '-');
      TestUtils.strictEqual(formatter({ isZero: true, sign: -1 }), '-');
    });
    it('Plus sign', () => {
      TestUtils.strictEqual(formatter({ isZero: false, sign: 1 }), '');
      TestUtils.strictEqual(formatter({ isZero: true, sign: 1 }), '');
    });
  });

  describe('Always', () => {
    const formatter = CVSignFormatter.fromSignDisplayOption(
      CVNumberBase10FormatSignDisplayOption.Type.Always,
    );
    it('Minus sign', () => {
      TestUtils.strictEqual(formatter({ isZero: false, sign: -1 }), '-');
      TestUtils.strictEqual(formatter({ isZero: true, sign: -1 }), '-');
    });
    it('Plus sign', () => {
      TestUtils.strictEqual(formatter({ isZero: false, sign: 1 }), '+');
      TestUtils.strictEqual(formatter({ isZero: true, sign: 1 }), '+');
    });
  });

  describe('ExceptZero', () => {
    const formatter = CVSignFormatter.fromSignDisplayOption(
      CVNumberBase10FormatSignDisplayOption.Type.ExceptZero,
    );
    it('Minus sign', () => {
      TestUtils.strictEqual(formatter({ isZero: false, sign: -1 }), '-');
      TestUtils.strictEqual(formatter({ isZero: true, sign: -1 }), '');
    });
    it('Plus sign', () => {
      TestUtils.strictEqual(formatter({ isZero: false, sign: 1 }), '+');
      TestUtils.strictEqual(formatter({ isZero: true, sign: 1 }), '');
    });
  });

  describe('Negative', () => {
    const formatter = CVSignFormatter.fromSignDisplayOption(
      CVNumberBase10FormatSignDisplayOption.Type.Negative,
    );
    it('Minus sign', () => {
      TestUtils.strictEqual(formatter({ isZero: false, sign: -1 }), '-');
      TestUtils.strictEqual(formatter({ isZero: true, sign: -1 }), '');
    });
    it('Plus sign', () => {
      TestUtils.strictEqual(formatter({ isZero: false, sign: 1 }), '');
      TestUtils.strictEqual(formatter({ isZero: true, sign: 1 }), '');
    });
  });

  describe('Never', () => {
    const formatter = CVSignFormatter.fromSignDisplayOption(
      CVNumberBase10FormatSignDisplayOption.Type.Never,
    );
    it('Minus sign', () => {
      TestUtils.strictEqual(formatter({ isZero: false, sign: -1 }), '');
      TestUtils.strictEqual(formatter({ isZero: true, sign: -1 }), '');
    });
    it('Plus sign', () => {
      TestUtils.strictEqual(formatter({ isZero: false, sign: 1 }), '');
      TestUtils.strictEqual(formatter({ isZero: true, sign: 1 }), '');
    });
  });
});
