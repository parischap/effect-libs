/* eslint-disable functional/no-expression-statements */
import { MBigDecimal, MNumber } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('MBigDecimal', () => {
	it('unsafeFromIntString', () => {
		TEUtils.assertEquals(MBigDecimal.unsafeFromIntString(2)('123'), BigDecimal.make(123n, 2));
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

	describe('round', () => {
		const round = MBigDecimal.round({ precision: 3, roundingMode: MNumber.RoundingMode.HalfEven });
		it('Even number', () => {
			TEUtils.assertEquals(round(BigDecimal.make(4566n, 4)), BigDecimal.make(457n, 3));
		});
		it('Odd number', () => {
			TEUtils.assertEquals(round(BigDecimal.make(-4564n, 4)), BigDecimal.make(-456n, 3));
		});
	});
});
