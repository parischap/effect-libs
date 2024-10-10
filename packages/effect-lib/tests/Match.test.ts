/* eslint-disable functional/no-expression-statements */
import { MFunction, MMatch } from '@parischap/effect-lib';
import { Array, Number, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MMatch', () => {
	describe('Predicate matching', () => {
		it('when', () => {
			const testMatch = pipe(
				5,
				MMatch.make,
				MMatch.when(Number.greaterThanOrEqualTo(6), () => 'a'),
				MMatch.when(Number.lessThan(6), () => 'b'),
				MMatch.orElse(() => 'c')
			);
			expect(testMatch).toBe('b');
		});

		it('whenIs', () => {
			const testMatch = pipe(
				5,
				MMatch.make,
				MMatch.whenIs(6, () => 'a'),
				MMatch.whenIs(5, () => 'b'),
				MMatch.orElse(() => 'c')
			);
			expect(testMatch).toBe('b');
		});

		it('orElse', () => {
			const testMatch = pipe(
				4,
				MMatch.make,
				MMatch.whenIs(6, () => 'a'),
				MMatch.whenIs(5, () => 'b'),
				MMatch.orElse(() => 'c')
			);
			expect(testMatch).toBe('c');
		});

		it('whenOr', () => {
			const testMatch = pipe(
				5,
				MMatch.make,
				MMatch.whenOr(MFunction.strictEquals(4), MFunction.strictEquals(5), () => 'a'),
				MMatch.when(MFunction.strictEquals(6), () => 'b'),
				MMatch.orElse(() => 'c')
			);
			expect(testMatch).toBe('a');
		});

		it('whenAnd', () => {
			const testMatch = pipe(
				5,
				MMatch.make,
				MMatch.when(Number.greaterThan(7), () => 'a'),
				MMatch.whenAnd(Number.lessThan(7), Number.greaterThan(3), () => 'b'),
				MMatch.orElse(() => 'c')
			);
			expect(testMatch).toBe('b');
		});

		it('tryFunction', () => {
			const testMatch = pipe(
				[3, 4],
				MMatch.make,
				MMatch.tryFunction(Array.get(1)),
				MMatch.tryFunction(Array.get(5)),
				MMatch.orElse(() => 0)
			);
			expect(testMatch).toBe(4);
		});
	});

	describe('Refinement matching', () => {
		enum TestEnum {
			A = 'a',
			B = 'b',
			C = 'c'
		}
		const isA = (value: TestEnum): value is TestEnum.A => value === TestEnum.A;
		const isB = (value: TestEnum): value is TestEnum.B => value === TestEnum.B;
		const isC = (value: TestEnum): value is TestEnum.C => value === TestEnum.C;

		it('when and exhaustive', () => {
			const testMatch = pipe(
				TestEnum.B,
				MMatch.make,
				MMatch.when(isA, () => 'a'),
				MMatch.when(isB, () => 'b'),
				MMatch.when(isC, () => 'c'),
				MMatch.exhaustive
			);
			expect(testMatch).toBe('b');
		});

		it('whenIs and exhaustive', () => {
			const testMatch = pipe(
				TestEnum.B,
				MMatch.make,
				MMatch.whenIs(TestEnum.A, () => 'a'),
				MMatch.whenIs(TestEnum.B, () => 'b'),
				MMatch.when(isC, () => 'c'),
				MMatch.exhaustive
			);
			expect(testMatch).toBe('b');
		});

		it('whenIsOr and exhaustive', () => {
			const testMatch = pipe(
				TestEnum.B,
				MMatch.make,
				MMatch.whenIs(TestEnum.A, () => 'a'),
				MMatch.whenIsOr(TestEnum.B, TestEnum.C, () => 'b'),
				MMatch.exhaustive
			);
			expect(testMatch).toBe('b');
		});

		it('orElse', () => {
			const testMatch = pipe(
				TestEnum.B,
				MMatch.make,
				MMatch.whenIs(TestEnum.A, () => 'a'),
				MMatch.when(isC, () => 'c'),
				MMatch.orElse(() => 'b')
			);
			expect(testMatch).toBe('b');
		});

		it('whenOr and exhaustive', () => {
			const testMatch = pipe(
				TestEnum.B,
				MMatch.make,
				MMatch.when(isC, () => 'c'),
				MMatch.whenOr(isA, isB, () => 'b'),
				MMatch.exhaustive
			);
			expect(testMatch).toBe('b');
		});

		it('unsafeWhen', () => {
			const testMatch = pipe(
				TestEnum.C,
				MMatch.make,
				MMatch.when(isA, () => 'a'),
				MMatch.when(isB, () => 'b'),
				MMatch.unsafeWhen(isC, () => 'c')
			);
			expect(testMatch).toBe('c');
		});
	});
});
