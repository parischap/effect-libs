/* eslint-disable functional/no-expression-statements */
import { MNumber } from '@parischap/effect-lib';
import { pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MString', () => {
	describe('intModulo', () => {
		it('Positive divisor strictly inferior to dividend', () => {
			expect(MNumber.intModulo(3)(5)).toBe(2);
		});

		it('Positive divisor superior or equal to dividend', () => {
			expect(MNumber.intModulo(5)(3)).toBe(3);
		});

		it('Negative divisor strictly inferior to dividend in absolute value', () => {
			expect(MNumber.intModulo(3)(-5)).toBe(1);
		});

		it('Negative divisor superior or equal to dividend in absolute value', () => {
			expect(MNumber.intModulo(5)(-3)).toBe(2);
		});
	});

	describe('quotientAndRemainder', () => {
		it('Positive dividend, positive divisor', () => {
			expect(pipe(27, MNumber.quotientAndRemainder(5))).toStrictEqual([5, 2]);
		});

		it('Negative dividend, positive divisor', () => {
			expect(pipe(-27, MNumber.quotientAndRemainder(5))).toStrictEqual([-6, 3]);
		});

		it('Positive dividend, negative divisor', () => {
			expect(pipe(27, MNumber.quotientAndRemainder(-5))).toStrictEqual([-6, -3]);
		});

		it('Negative dividend, negative divisor', () => {
			expect(pipe(-27, MNumber.quotientAndRemainder(-5))).toStrictEqual([5, -2]);
		});
	});

	describe('shift', () => {
		it('Positive shift', () => {
			expect(pipe(5.04, MNumber.shift(2))).toBe(504);
		});

		it('Negative shift', () => {
			expect(pipe(504, MNumber.shift(-2))).toBe(5.04);
		});
	});
});
