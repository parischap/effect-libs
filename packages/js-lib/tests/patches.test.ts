/* eslint-disable functional/no-expression-statements */
import { JsPatches } from '@parischap/js-lib';
import { describe, expect, it } from 'vitest';

describe('JsPatches', () => {
	describe('intModulo', () => {
		it('Positive divisor strictly inferior to dividend', () => {
			expect(JsPatches.intModulo(3)(5)).toBe(2);
		});

		it('Positive divisor superior or equal to dividend', () => {
			expect(JsPatches.intModulo(5)(3)).toBe(3);
		});

		it('Negative divisor strictly inferior to dividend in absolute value', () => {
			expect(JsPatches.intModulo(3)(-5)).toBe(1);
		});

		it('Negative divisor superior or equal to dividend in absolute value', () => {
			expect(JsPatches.intModulo(5)(-3)).toBe(2);
		});
	});
});
