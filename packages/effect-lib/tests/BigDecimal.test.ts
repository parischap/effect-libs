import { pipe } from 'effect';
import * as BigDecimal from 'effect/BigDecimal';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';

import { describe, it } from 'vitest';

describe('MBigDecimal', () => {
  describe('fromPrimitiveOption', () => {
    const fromPrimitiveOption = MBigDecimal.fromPrimitiveOption(4);
    it('Passing', () => {
      TestUtils.assertSome(fromPrimitiveOption(10), BigDecimal.make(10n, 4));
    });
    it('Non-integer number', () => {
      TestUtils.assertNone(fromPrimitiveOption(10.4));
    });
    it('Negative Infinity', () => {
      TestUtils.assertNone(fromPrimitiveOption(-Infinity));
    });
    it('NaN', () => {
      TestUtils.assertNone(fromPrimitiveOption(Number.NaN));
    });
  });

  describe('zero', () => {
    it('Equals BigDecimal.make(0n, 0)', () => {
      TestUtils.assertEquals(MBigDecimal.zero, BigDecimal.make(0n, 0));
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
