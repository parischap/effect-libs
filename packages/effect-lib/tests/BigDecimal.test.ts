import * as TestUtils from '@parischap/configs/TestUtils';
import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal'
import {pipe} from 'effect'
import * as BigDecimal from 'effect/BigDecimal'
import { describe, it } from 'vitest';

describe('MBigDecimal', () => {
  describe('fromPrimitiveOrThrow', () => {
    const fromPrimitiveOrThrow = MBigDecimal.fromPrimitiveOrThrow(4);
    it('Passing', () => {
      TestUtils.deepStrictEqual(fromPrimitiveOrThrow(10), BigDecimal.make(10n, 4));
    });
    it('Not passing', () => {
      TestUtils.throws(() => fromPrimitiveOrThrow(10.4));
      TestUtils.throws(() => fromPrimitiveOrThrow(Infinity));
      TestUtils.throws(() => fromPrimitiveOrThrow(Number.NaN));
    });
  });

  describe('fromPrimitiveOption', () => {
    const fromPrimitiveOption = MBigDecimal.fromPrimitiveOption(4);
    it('Passing', () => {
      TestUtils.assertSome(fromPrimitiveOption(10), BigDecimal.make(10n, 4));
    });
    it('Not passing', () => {
      TestUtils.assertNone(fromPrimitiveOption(10.4));
      TestUtils.assertNone(fromPrimitiveOption(-Infinity));
      TestUtils.assertNone(fromPrimitiveOption(Number.NaN));
    });
  });

  describe('fromPrimitive', () => {
    const fromPrimitive = MBigDecimal.fromPrimitive(4);
    it('Passing', () => {
      TestUtils.assertRight(fromPrimitive(10), BigDecimal.make(10n, 4));
    });
    it('Not passing', () => {
      TestUtils.assertLeft(fromPrimitive(10.4));
      TestUtils.assertLeft(fromPrimitive(Infinity));
      TestUtils.assertLeft(fromPrimitive(Number.NaN));
    });
  });

  describe('trunc', () => {
    it('Number that does not need to be truncated', () => {
      TestUtils.assertEquals(
        pipe(BigDecimal.make(545n, 1), MBigDecimal.trunc(2)),
        BigDecimal.make(545n, 1),
      );
    });

    it('Positive number, first fractional digit < 5', () => {
      TestUtils.assertEquals(
        pipe(BigDecimal.make(544n, 3), MBigDecimal.trunc(2)),
        BigDecimal.make(54n, 2),
      );
    });

    it('Positive number, first fractional digit >= 5', () => {
      TestUtils.assertEquals(
        pipe(BigDecimal.make(545n, 3), MBigDecimal.trunc(2)),
        BigDecimal.make(54n, 2),
      );
    });

    it('Negative number, first fractional digit < 5', () => {
      TestUtils.assertEquals(
        pipe(BigDecimal.make(-544n, 3), MBigDecimal.trunc(2)),
        BigDecimal.make(-54n, 2),
      );
    });

    it('Negative number, first fractional digit >= 5', () => {
      TestUtils.assertEquals(
        pipe(BigDecimal.make(-545n, 3), MBigDecimal.trunc(2)),
        BigDecimal.make(-54n, 2),
      );
    });
  });

  describe('truncatedAndFollowingParts', () => {
    const truncatedAndFollowingParts = MBigDecimal.truncatedAndFollowingParts(1);
    it('Positive number, first fractional digit < 5', () => {
      TestUtils.deepStrictEqual(truncatedAndFollowingParts(BigDecimal.make(544n, 2)), [
        BigDecimal.make(54n, 1),
        BigDecimal.make(4n, 2),
      ]);
    });

    it('Positive number, first fractional digit >= 5', () => {
      TestUtils.deepStrictEqual(truncatedAndFollowingParts(BigDecimal.make(545n, 2)), [
        BigDecimal.make(54n, 1),
        BigDecimal.make(5n, 2),
      ]);
    });

    it('Negative number, first fractional digit < 5', () => {
      TestUtils.deepStrictEqual(truncatedAndFollowingParts(BigDecimal.make(-544n, 2)), [
        BigDecimal.make(-54n, 1),
        BigDecimal.make(-4n, 2),
      ]);
    });

    it('Negative number, first fractional digit >= 5', () => {
      TestUtils.deepStrictEqual(truncatedAndFollowingParts(BigDecimal.make(-545n, 2)), [
        BigDecimal.make(-54n, 1),
        BigDecimal.make(-5n, 2),
      ]);
    });
  });
});
