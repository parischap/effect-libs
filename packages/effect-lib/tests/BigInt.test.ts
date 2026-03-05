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

  describe('fromPrimitive', () => {
    it('Passing', () => {
      TestUtils.assertRight(MBigInt.fromPrimitive(10), 10n);
    });
    it('Non-integer number', () => {
      TestUtils.assertLeft(MBigInt.fromPrimitive(10.4));
    });
    it('Infinity', () => {
      TestUtils.assertLeft(MBigInt.fromPrimitive(Infinity));
    });
    it('NaN', () => {
      TestUtils.assertLeft(MBigInt.fromPrimitive(Number.NaN));
    });
  });

  describe('isPositive', () => {
    it('Positive bigint', () => {
      TestUtils.assertTrue(MBigInt.isPositive(5n));
    });
    it('Zero', () => {
      TestUtils.assertFalse(MBigInt.isPositive(0n));
    });
    it('Negative bigint', () => {
      TestUtils.assertFalse(MBigInt.isPositive(-1n));
    });
  });

  describe('isNegative', () => {
    it('Negative bigint', () => {
      TestUtils.assertTrue(MBigInt.isNegative(-5n));
    });
    it('Zero', () => {
      TestUtils.assertFalse(MBigInt.isNegative(0n));
    });
    it('Positive bigint', () => {
      TestUtils.assertFalse(MBigInt.isNegative(1n));
    });
  });

  describe('isZero', () => {
    it('Zero bigint', () => {
      TestUtils.assertTrue(MBigInt.isZero(0n));
    });
    it('Non-zero bigint', () => {
      TestUtils.assertFalse(MBigInt.isZero(1n));
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
