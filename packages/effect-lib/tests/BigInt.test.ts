import * as TestUtils from '@parischap/configs/TestUtils';
import * as MBigInt from '@parischap/effect-lib/MBigInt';

import { describe, it } from 'vitest';

describe('MBigInt', () => {
  describe('fromPrimitiveOrThrow', () => {
    it('Passing', () => {
      TestUtils.strictEqual(MBigInt.fromPrimitiveOrThrow(10), 10n);
    });
    it('Non-integer number', () => {
      TestUtils.throws(() => MBigInt.fromPrimitiveOrThrow(10.4));
    });
    it('Infinity', () => {
      TestUtils.throws(() => MBigInt.fromPrimitiveOrThrow(Infinity));
    });
    it('NaN', () => {
      TestUtils.throws(() => MBigInt.fromPrimitiveOrThrow(Number.NaN));
    });
  });

  describe('fromPrimitiveOption', () => {
    it('Passing', () => {
      TestUtils.assertSome(MBigInt.fromPrimitiveOption(10), 10n);
    });
    it('Non-integer number', () => {
      TestUtils.assertNone(MBigInt.fromPrimitiveOption(10.4));
    });
    it('Negative Infinity', () => {
      TestUtils.assertNone(MBigInt.fromPrimitiveOption(-Infinity));
    });
    it('NaN', () => {
      TestUtils.assertNone(MBigInt.fromPrimitiveOption(Number.NaN));
    });
  });

  describe('isEven', () => {
    it('Even bigint', () => {
      TestUtils.assertTrue(MBigInt.isEven(10n));
    });
    it('Odd bigint', () => {
      TestUtils.assertFalse(MBigInt.isEven(11n));
    });
  });

  describe('isOdd', () => {
    it('Odd bigint', () => {
      TestUtils.assertTrue(MBigInt.isOdd(11n));
    });
    it('Even bigint', () => {
      TestUtils.assertFalse(MBigInt.isOdd(10n));
    });
  });

  describe('unsafeLog10', () => {
    it('Negative bigint', () => {
      TestUtils.doesNotThrow(() => MBigInt.unsafeLog10(-3n));
    });
    it('Positive bigint', () => {
      TestUtils.strictEqual(MBigInt.unsafeLog10(1248n), 3);
    });
  });

  describe('log10', () => {
    it('Negative value', () => {
      TestUtils.assertNone(MBigInt.log10(-3n));
    });

    it('Positive value', () => {
      TestUtils.assertSome(MBigInt.log10(1248n), 3);
    });
  });
});
