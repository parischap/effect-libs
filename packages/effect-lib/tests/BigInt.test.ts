import * as TestUtils from '@parischap/configs/TestUtils';
import * as MBigInt from '@parischap/effect-lib/MBigInt'
import { describe, it } from 'vitest';

describe('MBigInt', () => {
  describe('fromPrimitiveOrThrow', () => {
    it('Passing', () => {
      TestUtils.strictEqual(MBigInt.fromPrimitiveOrThrow(10), 10n);
    });
    it('Not passing', () => {
      TestUtils.throws(() => MBigInt.fromPrimitiveOrThrow(10.4));
      TestUtils.throws(() => MBigInt.fromPrimitiveOrThrow(Infinity));
      TestUtils.throws(() => MBigInt.fromPrimitiveOrThrow(Number.NaN));
    });
  });

  describe('fromPrimitiveOption', () => {
    it('Passing', () => {
      TestUtils.assertSome(MBigInt.fromPrimitiveOption(10), 10n);
    });
    it('Not passing', () => {
      TestUtils.assertNone(MBigInt.fromPrimitiveOption(10.4));
      TestUtils.assertNone(MBigInt.fromPrimitiveOption(-Infinity));
      TestUtils.assertNone(MBigInt.fromPrimitiveOption(Number.NaN));
    });
  });

  describe('fromPrimitive', () => {
    it('Passing', () => {
      TestUtils.assertRight(MBigInt.fromPrimitive(10), 10n);
    });
    it('Not passing', () => {
      TestUtils.assertLeft(MBigInt.fromPrimitive(10.4));
      TestUtils.assertLeft(MBigInt.fromPrimitive(Infinity));
      TestUtils.assertLeft(MBigInt.fromPrimitive(Number.NaN));
    });
  });

  describe('isEven', () => {
    it('Passing', () => {
      TestUtils.assertTrue(MBigInt.isEven(10n));
    });
    it('Not passing', () => {
      TestUtils.assertFalse(MBigInt.isEven(11n));
    });
  });

  describe('unsafeLog10', () => {
    it('Not passing', () => {
      TestUtils.doesNotThrow(() => MBigInt.unsafeLog10(-3n));
    });
    it('Passing', () => {
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
