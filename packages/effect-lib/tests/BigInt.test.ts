import { assert, describe, it } from '@effect/vitest';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MBigInt from '@parischap/effect-lib/MBigInt';

describe('MBigInt', () => {
  describe('fromPrimitiveOrThrow', () => {
    it('Passing', () => {
      assert.strictEqual(MBigInt.fromPrimitiveOrThrow(10), 10n);
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

  describe('fromPrimitive', () => {
    it('Passing', () => {
      TestUtils.assertSome(MBigInt.fromPrimitive(10), 10n);
    });
    it('Non-integer number', () => {
      TestUtils.assertNone(MBigInt.fromPrimitive(10.4));
    });
    it('Negative Infinity', () => {
      TestUtils.assertNone(MBigInt.fromPrimitive(-Infinity));
    });
    it('NaN', () => {
      TestUtils.assertNone(MBigInt.fromPrimitive(Number.NaN));
    });
  });

  describe('isEven', () => {
    it('Even bigint', () => {
      assert.isTrue(MBigInt.isEven(10n));
    });
    it('Odd bigint', () => {
      assert.isFalse(MBigInt.isEven(11n));
    });
  });

  describe('isOdd', () => {
    it('Odd bigint', () => {
      assert.isTrue(MBigInt.isOdd(11n));
    });
    it('Even bigint', () => {
      assert.isFalse(MBigInt.isOdd(10n));
    });
  });

  describe('unsafeLog10', () => {
    it('Negative bigint', () => {
      TestUtils.doesNotThrow(() => MBigInt.unsafeLog10(-3n));
    });
    it('Positive bigint', () => {
      assert.strictEqual(MBigInt.unsafeLog10(1248n), 3);
    });
  });

  describe('log10', () => {
    it('Negative value', () => {
      TestUtils.assertNone(MBigInt.log10(-3n));
    });

    it('Zero', () => {
      TestUtils.assertNone(MBigInt.log10(0n));
    });

    it('Positive value', () => {
      TestUtils.assertSome(MBigInt.log10(1248n), 3);
    });
  });
});
