/* eslint-disable functional/no-expression-statements */
import { MBigDecimal } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal } from 'effect';
import { describe, it } from 'vitest';

describe('MBigDecimal', () => {
	it('unsafeFromIntString', () => {
		TEUtils.assertEquals(MBigDecimal.unsafeFromIntString(2)('123'), BigDecimal.make(123n, 2));
	});

	describe('trunc', () => {
		it('Positive number, first fractional digit < 5', () => {
			TEUtils.assertEquals(MBigDecimal.trunc(BigDecimal.make(545n, 2)), BigDecimal.make(5n, 0));
		});

		it('Positive number, first fractional digit >= 5', () => {
			TEUtils.assertEquals(MBigDecimal.trunc(BigDecimal.make(555n, 2)), BigDecimal.make(5n, 0));
		});

		it('Negative number, first fractional digit < 5', () => {
			TEUtils.assertEquals(MBigDecimal.trunc(BigDecimal.make(-545n, 2)), BigDecimal.make(-5n, 0));
		});

		it('Negative number, first fractional digit >= 5', () => {
			TEUtils.assertEquals(MBigDecimal.trunc(BigDecimal.make(-555n, 2)), BigDecimal.make(-5n, 0));
		});
	});

	describe('integerAndFractionalParts', () => {
		it('Positive number, first fractional digit < 5', () => {
			TEUtils.deepStrictEqual(MBigDecimal.integerAndFractionalParts(BigDecimal.make(54n, 1)), [
				BigDecimal.make(5n, 0),
				BigDecimal.make(4n, 1)
			]);
		});

		it('Positive number, first fractional digit >= 5', () => {
			TEUtils.deepStrictEqual(MBigDecimal.integerAndFractionalParts(BigDecimal.make(55n, 1)), [
				BigDecimal.make(5n, 0),
				BigDecimal.make(5n, 1)
			]);
		});

		it('Negative number, first fractional digit < 5', () => {
			TEUtils.deepStrictEqual(MBigDecimal.integerAndFractionalParts(BigDecimal.make(-54n, 1)), [
				BigDecimal.make(-5n, 0),
				BigDecimal.make(-4n, 1)
			]);
		});

		it('Negative number, first fractional digit >= 5', () => {
			TEUtils.deepStrictEqual(MBigDecimal.integerAndFractionalParts(BigDecimal.make(-55n, 1)), [
				BigDecimal.make(-5n, 0),
				BigDecimal.make(-5n, 1)
			]);
		});
	});
});
