/* eslint-disable functional/no-expression-statements */
import { MFunction, MMatch, MTypes, MUtils } from '@parischap/effect-lib';
import { Array, flow, Function, Number, pipe, Struct } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MMatch', () => {
	describe('Tag, prototype and guards', () => {
		const testMatch = MMatch.make(5);

		it('moduleTag', () => {
			expect(MMatch.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		it('.toString()', () => {
			expect(testMatch.toString()).toBe(`{
  "_id": "@parischap/effect-lib/Match/",
  "input": 5,
  "output": {
    "_id": "Option",
    "_tag": "None"
  }
}`);
		});

		it('.pipe()', () => {
			expect(testMatch.pipe(Struct.get('input'))).toBe(5);
		});

		describe('has', () => {
			it('Matching', () => {
				expect(MMatch.has(testMatch)).toBe(true);
			});
			it('Non matching', () => {
				expect(MMatch.has(new Date())).toBe(false);
			});
		});
	});

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
				MMatch.orElse(Function.constant(0))
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

		it('whenIs and exhaustive passing', () => {
			const testMatch = pipe(
				TestEnum.B,
				MMatch.make,
				MMatch.whenIs(TestEnum.A, flow(Function.satisfies<TestEnum.A>(), Function.constant('a'))),
				MMatch.whenIs(TestEnum.B, flow(Function.satisfies<TestEnum.B>(), Function.constant('b'))),
				MMatch.when(isC, flow(Function.satisfies<TestEnum.C>(), Function.constant('c'))),
				MMatch.exhaustive
			);
			expect(testMatch).toBe('b');
		});

		it('whenIs and exhaustive not passing', () => {
			const testMatch = pipe(
				TestEnum.B,
				MMatch.make,
				MMatch.whenIs(TestEnum.A, flow(Function.satisfies<TestEnum.A>(), Function.constant('a'))),
				MMatch.whenIs(TestEnum.B, flow(Function.satisfies<TestEnum.B>(), Function.constant('b'))),
				// @ts-expect-error TestEnum.C missing
				MMatch.exhaustive
			);
			expect(testMatch).toBe('b');
		});

		it('whenIsOr and exhaustive passing', () => {
			const testMatch = pipe(
				TestEnum.B,
				MMatch.make,
				MMatch.whenIs(TestEnum.A, flow(Function.satisfies<TestEnum.A>(), Function.constant('a'))),
				MMatch.whenIsOr(
					TestEnum.B,
					TestEnum.C,
					flow(Function.satisfies<TestEnum.B | TestEnum.C>(), Function.constant('b'))
				),
				MMatch.exhaustive
			);
			expect(testMatch).toBe('b');
		});

		it('whenIsOr and exhaustive not passing', () => {
			const testMatch = pipe(
				TestEnum.B,
				MMatch.make,
				MMatch.whenIsOr(
					TestEnum.B,
					TestEnum.C,
					flow(Function.satisfies<TestEnum.B | TestEnum.C>(), Function.constant('b'))
				),
				// @ts-expect-error TestEnum.A missing
				MMatch.exhaustive
			);
			expect(testMatch).toBe('b');
		});

		it('orElse', () => {
			const testMatch = pipe(
				TestEnum.B,
				MMatch.make,
				MMatch.whenIs(TestEnum.A, flow(Function.satisfies<TestEnum.A>(), Function.constant('a'))),
				MMatch.when(isC, flow(Function.satisfies<TestEnum.C>(), Function.constant('c'))),
				MMatch.orElse(flow(Function.satisfies<TestEnum.B>(), Function.constant('b')))
			);
			expect(testMatch).toBe('b');
		});

		it('whenOr and exhaustive passing', () => {
			const testMatch = pipe(
				TestEnum.B,
				MMatch.make,
				MMatch.when(isC, flow(Function.satisfies<TestEnum.C>(), Function.constant('c'))),
				MMatch.whenOr(
					isA,
					isB,
					flow(Function.satisfies<TestEnum.A | TestEnum.B>(), Function.constant('b'))
				),
				MMatch.exhaustive
			);
			expect(testMatch).toBe('b');
		});

		it('whenOr and exhaustive not passing', () => {
			const testMatch = pipe(
				TestEnum.B,
				MMatch.make,
				MMatch.whenOr(
					isA,
					isB,
					flow(Function.satisfies<TestEnum.A | TestEnum.B>(), Function.constant('b'))
				),
				// @ts-expect-error TestEnum.C missing
				MMatch.exhaustive
			);
			expect(testMatch).toBe('b');
		});

		it('unsafeWhen', () => {
			const testMatch = pipe(
				Array.of(0) as unknown,
				MMatch.make,
				MMatch.when(
					MTypes.isPrimitive,
					flow(Function.satisfies<MTypes.Primitive>(), Function.constant('a'))
				),
				MMatch.unsafeWhen(
					MTypes.isNonPrimitive,
					flow(Function.satisfies<MTypes.NonPrimitive>(), Function.constant('c'))
				)
			);
			expect(testMatch).toBe('c');
		});
	});
});
