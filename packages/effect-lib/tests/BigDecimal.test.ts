/* eslint-disable functional/no-expression-statements */
import { MBigDecimal } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('MBigDecimal', () => {
	describe('fromPrimitiveOrThrow', () => {
		const fromPrimitiveOrThrow = MBigDecimal.fromPrimitiveOrThrow(4);
		it('Passing', () => {
			TEUtils.deepStrictEqual(fromPrimitiveOrThrow(10), BigDecimal.make(10n, 4));
		});
		it('Not passing', () => {
			TEUtils.throws(() => fromPrimitiveOrThrow(10.4));
			TEUtils.throws(() => fromPrimitiveOrThrow(Infinity));
			TEUtils.throws(() => fromPrimitiveOrThrow(NaN));
		});
	});

	describe('fromPrimitive', () => {
		const fromPrimitive = MBigDecimal.fromPrimitive(4);
		it('Passing', () => {
			TEUtils.assertRight(fromPrimitive(10), BigDecimal.make(10n, 4));
		});
		it('Not passing', () => {
			TEUtils.assertLeft(fromPrimitive(10.4));
			TEUtils.assertLeft(fromPrimitive(Infinity));
			TEUtils.assertLeft(fromPrimitive(NaN));
		});
	});

	describe('trunc', () => {
		it('Number that does not need to be truncated', () => {
			TEUtils.assertEquals(
				pipe(BigDecimal.make(545n, 1), MBigDecimal.trunc(2)),
				BigDecimal.make(545n, 1)
			);
		});

		it('Positive number, first fractional digit < 5', () => {
			TEUtils.assertEquals(
				pipe(BigDecimal.make(544n, 3), MBigDecimal.trunc(2)),
				BigDecimal.make(54n, 2)
			);
		});

		it('Positive number, first fractional digit >= 5', () => {
			TEUtils.assertEquals(
				pipe(BigDecimal.make(545n, 3), MBigDecimal.trunc(2)),
				BigDecimal.make(54n, 2)
			);
		});

		it('Negative number, first fractional digit < 5', () => {
			TEUtils.assertEquals(
				pipe(BigDecimal.make(-544n, 3), MBigDecimal.trunc(2)),
				BigDecimal.make(-54n, 2)
			);
		});

		it('Negative number, first fractional digit >= 5', () => {
			TEUtils.assertEquals(
				pipe(BigDecimal.make(-545n, 3), MBigDecimal.trunc(2)),
				BigDecimal.make(-54n, 2)
			);
		});
	});

	describe('truncatedAndFollowingParts', () => {
		const truncatedAndFollowingParts = MBigDecimal.truncatedAndFollowingParts(1);
		it('Positive number, first fractional digit < 5', () => {
			TEUtils.deepStrictEqual(truncatedAndFollowingParts(BigDecimal.make(544n, 2)), [
				BigDecimal.make(54n, 1),
				BigDecimal.make(4n, 2)
			]);
		});

		it('Positive number, first fractional digit >= 5', () => {
			TEUtils.deepStrictEqual(truncatedAndFollowingParts(BigDecimal.make(545n, 2)), [
				BigDecimal.make(54n, 1),
				BigDecimal.make(5n, 2)
			]);
		});

		it('Negative number, first fractional digit < 5', () => {
			TEUtils.deepStrictEqual(truncatedAndFollowingParts(BigDecimal.make(-544n, 2)), [
				BigDecimal.make(-54n, 1),
				BigDecimal.make(-4n, 2)
			]);
		});

		it('Negative number, first fractional digit >= 5', () => {
			TEUtils.deepStrictEqual(truncatedAndFollowingParts(BigDecimal.make(-545n, 2)), [
				BigDecimal.make(-54n, 1),
				BigDecimal.make(-5n, 2)
			]);
		});
	});
});
