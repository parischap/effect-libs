import * as TestUtils from '@parischap/configs/TestUtils';
import * as MNumber from '@parischap/effect-lib/MNumber'
import {pipe} from 'effect'
import * as BigDecimal from 'effect/BigDecimal'
import { describe, it } from 'vitest';

const hugeBigInt = 10n ** 500n;
const hugeBigDecimal = BigDecimal.make(hugeBigInt, 0);
const number = 243;
const bigint = BigInt(number);
const bigDecimal = BigDecimal.make(bigint, 0);

describe('MNumber', () => {
  describe('unsafeFromBigDecimal', () => {
    it('Not passing: too big', () => {
      TestUtils.doesNotThrow(() => MNumber.unsafeFromBigDecimal(hugeBigDecimal));
    });
    it('Passing', () => {
      TestUtils.strictEqual(MNumber.unsafeFromBigDecimal(bigDecimal), number);
    });
  });

  describe('fromBigDecimalOption', () => {
    it('Not passing: too big', () => {
      TestUtils.assertNone(MNumber.fromBigDecimalOption(hugeBigDecimal));
    });
    it('Passing', () => {
      TestUtils.assertSome(MNumber.fromBigDecimalOption(bigDecimal), number);
    });
  });

  describe('fromBigDecimal', () => {
    it('Not passing: too big', () => {
      TestUtils.assertLeft(MNumber.fromBigDecimal(hugeBigDecimal));
    });
    it('Passing', () => {
      TestUtils.assertRight(MNumber.fromBigDecimal(bigDecimal), number);
    });
  });

  describe('fromBigDecimalOrThrow', () => {
    it('Not passing: too big', () => {
      TestUtils.throws(() => MNumber.fromBigDecimalOrThrow(hugeBigDecimal));
    });
    it('Passing', () => {
      TestUtils.strictEqual(MNumber.fromBigDecimalOrThrow(bigDecimal), number);
    });
  });

  describe('unsafeFromBigInt', () => {
    it('Not passing: too big', () => {
      TestUtils.doesNotThrow(() => MNumber.unsafeFromBigInt(hugeBigInt));
    });
    it('Passing', () => {
      TestUtils.strictEqual(MNumber.unsafeFromBigInt(bigint), number);
    });
  });

  describe('fromBigIntOption', () => {
    it('Not passing: too big', () => {
      TestUtils.assertNone(MNumber.fromBigIntOption(hugeBigInt));
    });
    it('Passing', () => {
      TestUtils.assertSome(MNumber.fromBigIntOption(bigint), number);
    });
  });

  describe('fromBigInt', () => {
    it('Not passing: too big', () => {
      TestUtils.assertLeft(MNumber.fromBigInt(hugeBigInt));
    });
    it('Passing', () => {
      TestUtils.assertRight(MNumber.fromBigInt(bigint), number);
    });
  });

  describe('fromBigIntOrThrow', () => {
    it('Not passing: too big', () => {
      TestUtils.throws(() => MNumber.fromBigIntOrThrow(hugeBigInt));
    });
    it('Passing', () => {
      TestUtils.strictEqual(MNumber.fromBigIntOrThrow(bigint), number);
    });
  });

  it('opposite', () => {
    TestUtils.strictEqual(MNumber.opposite(3), -3);
    TestUtils.strictEqual(MNumber.opposite(-3), 3);
  });

  describe('unsafeFromString', () => {
    it('Not passing', () => {
      TestUtils.doesNotThrow(() => MNumber.unsafeFromString('a'));
      TestUtils.doesNotThrow(() => MNumber.unsafeFromString('NaN'));
    });
    it('Passing', () => {
      TestUtils.strictEqual(MNumber.unsafeFromString('31'), 31);
    });
  });

  it('intModulo', () => {
    TestUtils.strictEqual(MNumber.intModulo(3)(5), 2);
    TestUtils.strictEqual(MNumber.intModulo(5)(3), 3);
    TestUtils.strictEqual(MNumber.intModulo(3)(-5), 1);
    TestUtils.strictEqual(MNumber.intModulo(5)(-3), 2);
    TestUtils.strictEqual(pipe(-3, MNumber.intModulo(3), Math.abs), 0);
    TestUtils.strictEqual(MNumber.intModulo(-3)(5), 2);
    TestUtils.strictEqual(MNumber.intModulo(-5)(3), 3);
    TestUtils.strictEqual(MNumber.intModulo(-3)(-5), 1);
    TestUtils.strictEqual(MNumber.intModulo(-5)(-3), 2);
  });

  describe('quotientAndRemainder', () => {
    it('Positive dividend, positive divisor', () => {
      TestUtils.deepStrictEqual(pipe(27, MNumber.quotientAndRemainder(5)), [5, 2]);
    });

    it('Negative dividend, positive divisor', () => {
      TestUtils.deepStrictEqual(pipe(-27, MNumber.quotientAndRemainder(5)), [-6, 3]);
    });

    it('Positive dividend, negative divisor', () => {
      TestUtils.deepStrictEqual(pipe(27, MNumber.quotientAndRemainder(-5)), [-6, -3]);
    });

    it('Negative dividend, negative divisor', () => {
      TestUtils.deepStrictEqual(pipe(-27, MNumber.quotientAndRemainder(-5)), [5, -2]);
    });
  });

  describe('equals', () => {
    it('Passing', () => {
      TestUtils.assertTrue(pipe(0.3, MNumber.equals(0.1 + 0.2)));
    });

    it('Not passing', () => {
      TestUtils.assertFalse(pipe(0.4, MNumber.equals(0.1 + 0.2)));
    });
  });

  describe('trunc', () => {
    it('Number that does not need to be truncated', () => {
      TestUtils.assertTrue(pipe(54.5, MNumber.trunc(2), MNumber.equals(54.5)));
    });

    it('Positive number, first following digit < 5', () => {
      TestUtils.assertTrue(pipe(0.544, MNumber.trunc(2), MNumber.equals(0.54)));
    });

    it('Positive number, first following digit >= 5', () => {
      TestUtils.assertTrue(pipe(0.545, MNumber.trunc(2), MNumber.equals(0.54)));
    });

    it('Negative number, first following digit < 5', () => {
      TestUtils.assertTrue(pipe(-0.544, MNumber.trunc(2), MNumber.equals(-0.54)));
    });

    it('Negative number, first following digit >= 5', () => {
      TestUtils.assertTrue(pipe(-0.545, MNumber.trunc(2), MNumber.equals(-0.54)));
    });
  });

  describe('isMultipleOf', () => {
    it('Passing', () => {
      TestUtils.assertTrue(pipe(27, MNumber.isMultipleOf(3)));
    });

    it('Not passing', () => {
      TestUtils.assertFalse(pipe(26, MNumber.isMultipleOf(3)));
    });
  });

  describe('shift', () => {
    it('Positive shift', () => {
      TestUtils.strictEqual(pipe(5.04, MNumber.shift(2)), 504);
    });

    it('Negative shift', () => {
      TestUtils.strictEqual(pipe(504, MNumber.shift(-2)), 5.04);
    });
  });

  describe('sign2', () => {
    it('Strictly positive value', () => {
      TestUtils.strictEqual(MNumber.sign2(5), 1);
    });

    it('+0', () => {
      TestUtils.strictEqual(MNumber.sign2(0), 1);
    });

    it('0', () => {
      TestUtils.strictEqual(MNumber.sign2(0), 1);
    });

    it('-0', () => {
      TestUtils.strictEqual(MNumber.sign2(-0), -1);
    });

    it('Strictly negative value', () => {
      TestUtils.strictEqual(MNumber.sign2(-5), -1);
    });
  });
});
