import { assert, describe, it } from '@effect/vitest';
import { pipe } from 'effect';
import * as BigDecimal from 'effect/BigDecimal';
import * as Tuple from 'effect/Tuple';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MNumber from '@parischap/effect-lib/MNumber';
import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';

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
      assert.strictEqual(MNumber.unsafeFromBigDecimal(bigDecimal), number);
    });
  });

  describe('fromBigDecimal', () => {
    it('Not passing: too big', () => {
      TestUtils.assertNone(MNumber.fromBigDecimal(hugeBigDecimal));
    });
    it('Passing', () => {
      TestUtils.assertSome(MNumber.fromBigDecimal(bigDecimal), number);
    });
  });

  describe('unsafeFromBigInt', () => {
    it('Not passing: too big', () => {
      TestUtils.doesNotThrow(() => MNumber.unsafeFromBigInt(hugeBigInt));
    });
    it('Passing', () => {
      assert.strictEqual(MNumber.unsafeFromBigInt(bigint), number);
    });
  });

  describe('fromBigInt', () => {
    it('Not passing: too big', () => {
      TestUtils.assertNone(MNumber.fromBigInt(hugeBigInt));
    });
    it('Passing', () => {
      TestUtils.assertSome(MNumber.fromBigInt(bigint), number);
    });
  });

  describe('opposite', () => {
    it('Positive number', () => {
      assert.strictEqual(MNumber.opposite(3), -3);
    });
    it('Negative number', () => {
      assert.strictEqual(MNumber.opposite(-3), 3);
    });
  });

  describe('unsafeFromString', () => {
    it('Non-numeric string', () => {
      TestUtils.doesNotThrow(() => MNumber.unsafeFromString('a'));
    });
    it('NaN string', () => {
      TestUtils.doesNotThrow(() => MNumber.unsafeFromString('NaN'));
    });
    it('Passing', () => {
      assert.strictEqual(MNumber.unsafeFromString('31'), 31);
    });
  });

  describe('intModulo', () => {
    it('Positive self, positive divisor: 5 mod 3', () => {
      assert.strictEqual(MNumber.intModulo(3)(5), 2);
    });
    it('Positive self, positive divisor: 3 mod 5', () => {
      assert.strictEqual(MNumber.intModulo(5)(3), 3);
    });
    it('Negative self, positive divisor: -5 mod 3', () => {
      assert.strictEqual(MNumber.intModulo(3)(-5), 1);
    });
    it('Negative self, positive divisor: -3 mod 5', () => {
      assert.strictEqual(MNumber.intModulo(5)(-3), 2);
    });
    it('Zero result', () => {
      assert.strictEqual(pipe(-3, MNumber.intModulo(3), Math.abs), 0);
    });
    it('Positive self, negative divisor: 5 mod -3', () => {
      assert.strictEqual(MNumber.intModulo(-3)(5), 2);
    });
    it('Positive self, negative divisor: 3 mod -5', () => {
      assert.strictEqual(MNumber.intModulo(-5)(3), 3);
    });
    it('Negative self, negative divisor: -5 mod -3', () => {
      assert.strictEqual(MNumber.intModulo(-3)(-5), 1);
    });
    it('Negative self, negative divisor: -3 mod -5', () => {
      assert.strictEqual(MNumber.intModulo(-5)(-3), 2);
    });
  });

  describe('quotientAndRemainder', () => {
    it('Positive dividend, positive divisor', () => {
      assert.deepStrictEqual(pipe(27, MNumber.quotientAndRemainder(5)), [5, 2]);
    });

    it('Negative dividend, positive divisor', () => {
      assert.deepStrictEqual(pipe(-27, MNumber.quotientAndRemainder(5)), [-6, 3]);
    });

    it('Positive dividend, negative divisor', () => {
      assert.deepStrictEqual(pipe(27, MNumber.quotientAndRemainder(-5)), [-6, -3]);
    });

    it('Negative dividend, negative divisor', () => {
      assert.deepStrictEqual(pipe(-27, MNumber.quotientAndRemainder(-5)), [5, -2]);
    });
  });

  describe('equals', () => {
    it('Passing', () => {
      assert.isTrue(pipe(0.3, MNumber.equals(0.1 + 0.2)));
    });

    it('Not passing', () => {
      assert.isFalse(pipe(0.4, MNumber.equals(0.1 + 0.2)));
    });
  });

  describe('trunc', () => {
    it('Number that does not need to be truncated', () => {
      assert.isTrue(pipe(54.5, MNumber.trunc(2), MNumber.equals(54.5)));
    });

    it('Positive number, first following digit < 5', () => {
      assert.isTrue(pipe(0.544, MNumber.trunc(2), MNumber.equals(0.54)));
    });

    it('Positive number, first following digit >= 5', () => {
      assert.isTrue(pipe(0.545, MNumber.trunc(2), MNumber.equals(0.54)));
    });

    it('Negative number, first following digit < 5', () => {
      assert.isTrue(pipe(-0.544, MNumber.trunc(2), MNumber.equals(-0.54)));
    });

    it('Negative number, first following digit >= 5', () => {
      assert.isTrue(pipe(-0.545, MNumber.trunc(2), MNumber.equals(-0.54)));
    });
  });

  describe('isMultipleOf', () => {
    it('Passing', () => {
      assert.isTrue(pipe(27, MNumber.isMultipleOf(3)));
    });

    it('Not passing', () => {
      assert.isFalse(pipe(26, MNumber.isMultipleOf(3)));
    });
  });

  describe('shift', () => {
    it('Positive shift', () => {
      assert.strictEqual(pipe(5.04, MNumber.shift(2)), 504);
    });

    it('Negative shift', () => {
      assert.strictEqual(pipe(504, MNumber.shift(-2)), 5.04);
    });
  });

  describe('sign2', () => {
    it('Strictly positive value', () => {
      assert.strictEqual(MNumber.sign2(5), 1);
    });

    it('+0', () => {
      assert.strictEqual(MNumber.sign2(0), 1);
    });

    it('0', () => {
      assert.strictEqual(MNumber.sign2(0), 1);
    });

    it('-0', () => {
      assert.strictEqual(MNumber.sign2(-0), -1);
    });

    it('Strictly negative value', () => {
      assert.strictEqual(MNumber.sign2(-5), -1);
    });
  });

  describe('round', () => {
    const round = MNumber.round(3, MNumberBase10Format.RoundingOption.HalfEven);
    it('Even number', () => {
      assert.isTrue(pipe(0.4566, round, MNumber.equals(0.457)));
    });
    it('Odd number', () => {
      assert.isTrue(pipe(-0.4564, round, MNumber.equals(-0.456)));
    });
  });

  describe('fromFormatAndStringStart', () => {
    const fromFormatAndStringStart = MNumber.fromFormatAndStringStart(MNumberBase10Format.frenchStyleNumber);

    it('passing', () => {
      TestUtils.assertSome(fromFormatAndStringStart('0,45Dummy'), Tuple.make(0.45, '0,45'));
    });

    it('Not passing', () => {
      TestUtils.assertNone(fromFormatAndStringStart('Dummy'));
    });
  });

  describe('fromFormatAndStringStartOrThrow', () => {
    const fromFormatAndStringStartOrThrow = MNumber.fromFormatAndStringStartOrThrow(
      MNumberBase10Format.frenchStyleNumber,
    );

    it('passing', () => {
      TestUtils.assertEquals(fromFormatAndStringStartOrThrow('0,45Dummy'), Tuple.make(0.45, '0,45'));
    });

    it('Not passing', () => {
      TestUtils.throws(() => fromFormatAndStringStartOrThrow('Dummy'));
    });
  });

  describe('fromFormatAndString', () => {
    const fromFormatAndString = MNumber.fromFormatAndString(MNumberBase10Format.frenchStyleNumber);

    it('passing', () => {
      TestUtils.assertSome(fromFormatAndString('45,50'), 45.5);
    });

    it('Not passing (extra characters)', () => {
      TestUtils.assertNone(fromFormatAndString('45,50Dummy'));
    });
  });

  describe('fromFormatAndStringOrThrow', () => {
    const fromFormatAndStringOrThrow = MNumber.fromFormatAndStringOrThrow(
      MNumberBase10Format.frenchStyleNumber,
    );

    it('passing', () => {
      TestUtils.assertEquals(fromFormatAndStringOrThrow('45,50'), 45.5);
    });

    it('Not passing', () => {
      TestUtils.throws(() => fromFormatAndStringOrThrow('45,50Dummy'));
    });
  });
});
