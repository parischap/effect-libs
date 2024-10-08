/* eslint-disable functional/no-expression-statements */
import { MNumber } from '@parischap/effect-lib';
import { Chunk, Equal, pipe } from 'effect';
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
			// Revert from Chunk to Array when Effect 4.0 with structurzl equality comes out
			expect(
				pipe(
					27,
					MNumber.quotientAndRemainder(5),
					Chunk.fromIterable,
					Equal.equals(Chunk.make(5, 2))
				)
			).toBe(true);
		});

		it('Negative dividend, positive divisor', () => {
			// Revert from Chunk to Array when Effect 4.0 with structurzl equality comes out
			expect(
				pipe(
					-27,
					MNumber.quotientAndRemainder(5),
					Chunk.fromIterable,
					Equal.equals(Chunk.make(-6, 3))
				)
			).toBe(true);
		});

		it('Positive dividend, negative divisor', () => {
			// Revert from Chunk to Array when Effect 4.0 with structurzl equality comes out
			expect(
				pipe(
					27,
					MNumber.quotientAndRemainder(-5),
					Chunk.fromIterable,
					Equal.equals(Chunk.make(-6, -3))
				)
			).toBe(true);
		});

		it('Negative dividend, negative divisor', () => {
			// Revert from Chunk to Array when Effect 4.0 with structurzl equality comes out
			expect(
				pipe(
					-27,
					MNumber.quotientAndRemainder(-5),
					Chunk.fromIterable,
					Equal.equals(Chunk.make(5, -2))
				)
			).toBe(true);
		});
	});
});
