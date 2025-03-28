/* eslint-disable functional/no-expression-statements */
import { MNumber } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { pipe } from 'effect';
import { describe, it } from 'vitest';

describe('MString', () => {
	describe('intModulo', () => {
		it('Positive divisor strictly inferior to dividend', () => {
			TEUtils.strictEqual(MNumber.intModulo(3)(5), 2);
		});

		it('Positive divisor superior or equal to dividend', () => {
			TEUtils.strictEqual(MNumber.intModulo(5)(3), 3);
		});

		it('Negative divisor strictly inferior to dividend in absolute value', () => {
			TEUtils.strictEqual(MNumber.intModulo(3)(-5), 1);
		});

		it('Negative divisor superior or equal to dividend in absolute value', () => {
			TEUtils.strictEqual(MNumber.intModulo(5)(-3), 2);
		});
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

	describe('shift', () => {
		it('Positive shift', () => {
			TEUtils.strictEqual(pipe(5.04, MNumber.shift(2)), 504);
		});

		it('Negative shift', () => {
			TEUtils.strictEqual(pipe(504, MNumber.shift(-2)), 5.04);
		});
	});
});
