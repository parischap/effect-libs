/* eslint-disable functional/no-expression-statements */
import { MNumber } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { pipe } from 'effect';
import { describe, it } from 'vitest';

describe('MNumber', () => {
	it('intModulo', () => {
		TEUtils.strictEqual(MNumber.intModulo(3)(5), 2);
		TEUtils.strictEqual(MNumber.intModulo(5)(3), 3);
		TEUtils.strictEqual(MNumber.intModulo(3)(-5), 1);
		TEUtils.strictEqual(MNumber.intModulo(5)(-3), 2);
		TEUtils.strictEqual(pipe(-3, MNumber.intModulo(3), Math.abs), 0);
		TEUtils.strictEqual(MNumber.intModulo(-3)(5), 2);
		TEUtils.strictEqual(MNumber.intModulo(-5)(3), 3);
		TEUtils.strictEqual(MNumber.intModulo(-3)(-5), 1);
		TEUtils.strictEqual(MNumber.intModulo(-5)(-3), 2);
	});

	describe('quotientAndRemainder', () => {
		it('Positive dividend, positive divisor', () => {
			TEUtils.deepStrictEqual(pipe(27, MNumber.quotientAndRemainder(5)), [5, 2]);
		});

		it('Negative dividend, positive divisor', () => {
			TEUtils.deepStrictEqual(pipe(-27, MNumber.quotientAndRemainder(5)), [-6, 3]);
		});

		it('Positive dividend, negative divisor', () => {
			TEUtils.deepStrictEqual(pipe(27, MNumber.quotientAndRemainder(-5)), [-6, -3]);
		});

		it('Negative dividend, negative divisor', () => {
			TEUtils.deepStrictEqual(pipe(-27, MNumber.quotientAndRemainder(-5)), [5, -2]);
		});
	});

	describe('equals', () => {
		it('Passing', () => {
			TEUtils.assertTrue(pipe(0.3, MNumber.equals(0.1 + 0.2)));
		});

		it('Not passing', () => {
			TEUtils.assertFalse(pipe(0.4, MNumber.equals(0.1 + 0.2)));
		});
	});

	describe('trunc', () => {
		it('Number that does not need to be truncated', () => {
			TEUtils.assertTrue(pipe(54.5, MNumber.trunc(2), MNumber.equals(54.5)));
		});

		it('Positive number, first following digit < 5', () => {
			TEUtils.assertTrue(pipe(0.544, MNumber.trunc(2), MNumber.equals(0.54)));
		});

		it('Positive number, first following digit >= 5', () => {
			TEUtils.assertTrue(pipe(0.545, MNumber.trunc(2), MNumber.equals(0.54)));
		});

		it('Negative number, first following digit < 5', () => {
			TEUtils.assertTrue(pipe(-0.544, MNumber.trunc(2), MNumber.equals(-0.54)));
		});

		it('Negative number, first following digit >= 5', () => {
			TEUtils.assertTrue(pipe(-0.545, MNumber.trunc(2), MNumber.equals(-0.54)));
		});
	});

	describe('isMultipleOf', () => {
		it('Passing', () => {
			TEUtils.assertTrue(pipe(27, MNumber.isMultipleOf(3)));
		});

		it('Not passing', () => {
			TEUtils.assertFalse(pipe(26, MNumber.isMultipleOf(3)));
		});
	});

	describe('shift', () => {
		it('Positive shift', () => {
			TEUtils.strictEqual(pipe(5.04, MNumber.shift(2)), 504);
		});

		it('Negative shift', () => {
			TEUtils.strictEqual(pipe(504, MNumber.shift(-2)), 5.04);
		});
	});

	describe('sign2', () => {
		it('Strictly positive value', () => {
			TEUtils.strictEqual(MNumber.sign2(5), 1);
		});

		it('+0', () => {
			TEUtils.strictEqual(MNumber.sign2(+0), 1);
		});

		it('0', () => {
			TEUtils.strictEqual(MNumber.sign2(0), 1);
		});

		it('-0', () => {
			TEUtils.strictEqual(MNumber.sign2(-0), -1);
		});

		it('Strictly negative value', () => {
			TEUtils.strictEqual(MNumber.sign2(-5), -1);
		});
	});
});
