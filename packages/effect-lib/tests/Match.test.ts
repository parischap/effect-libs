/* eslint-disable functional/no-expression-statements */
import { MFunction, MMatch, MTypes } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Array, flow, Function, Number, pipe, Struct } from 'effect';
import { describe, it } from 'vitest';

describe('MMatch', () => {
	describe('Tag, prototype and guards', () => {
		const testMatch = MMatch.make(5);

		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), MMatch.moduleTag);
		});

		it('.toString()', () => {
			TEUtils.strictEqual(
				testMatch.toString(),
				`{
  "_id": "@parischap/effect-lib/Match/",
  "input": 5,
  "output": {
    "_id": "Option",
    "_tag": "None"
  }
}`
			);
		});

		it('.pipe()', () => {
			TEUtils.strictEqual(testMatch.pipe(Struct.get('input')), 5);
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(MMatch.has(testMatch));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(MMatch.has(new Date()));
			});
		});
	});

	describe('Predicate matching', () => {
		it('when', () => {
			TEUtils.strictEqual(
				pipe(
					5,
					MMatch.make,
					MMatch.when(Number.greaterThanOrEqualTo(6), Function.constant('a')),
					MMatch.when(Number.lessThan(6), Function.constant('b')),
					MMatch.orElse(Function.constant('c'))
				),
				'b'
			);
		});

		it('whenIs', () => {
			TEUtils.strictEqual(
				pipe(
					5,
					MMatch.make,
					MMatch.whenIs(6, Function.constant('a')),
					MMatch.whenIs(5, Function.constant('b')),
					MMatch.orElse(Function.constant('c'))
				),
				'b'
			);
		});

		it('orElse', () => {
			TEUtils.strictEqual(
				pipe(
					4,
					MMatch.make,
					MMatch.whenIs(6, Function.constant('a')),
					MMatch.whenIs(5, Function.constant('b')),
					MMatch.orElse(Function.constant('c'))
				),
				'c'
			);
		});

		it('whenOr', () => {
			TEUtils.strictEqual(
				pipe(
					5,
					MMatch.make,
					MMatch.whenOr(
						MFunction.strictEquals(4),
						MFunction.strictEquals(5),
						Function.constant('a')
					),
					MMatch.when(MFunction.strictEquals(6), Function.constant('b')),
					MMatch.orElse(Function.constant('c'))
				),
				'a'
			);
		});

		it('whenAnd', () => {
			TEUtils.strictEqual(
				pipe(
					5,
					MMatch.make,
					MMatch.when(Number.greaterThan(7), Function.constant('a')),
					MMatch.whenAnd(Number.lessThan(7), Number.greaterThan(3), Function.constant('b')),
					MMatch.orElse(Function.constant('c'))
				),
				'b'
			);
		});

		it('tryFunction', () => {
			TEUtils.strictEqual(
				pipe(
					[3, 4],
					MMatch.make,
					MMatch.tryFunction(Array.get(1)),
					MMatch.tryFunction(Array.get(5)),
					MMatch.orElse(Function.constant(0))
				),
				4
			);
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
			TEUtils.strictEqual(
				pipe(
					TestEnum.B,
					MMatch.make,
					MMatch.when(isA, Function.constant('a')),
					MMatch.when(isB, Function.constant('b')),
					MMatch.when(isC, Function.constant('c')),
					MMatch.exhaustive
				),
				'b'
			);
		});

		it('whenIs and exhaustive passing', () => {
			TEUtils.strictEqual(
				pipe(
					TestEnum.B,
					MMatch.make,
					MMatch.whenIs(TestEnum.A, flow(Function.satisfies<TestEnum.A>(), Function.constant('a'))),
					MMatch.whenIs(TestEnum.B, flow(Function.satisfies<TestEnum.B>(), Function.constant('b'))),
					MMatch.when(isC, flow(Function.satisfies<TestEnum.C>(), Function.constant('c'))),
					MMatch.exhaustive
				),
				'b'
			);
		});

		it('whenIs and exhaustive not passing', () => {
			TEUtils.strictEqual(
				pipe(
					TestEnum.B,
					MMatch.make,
					MMatch.whenIs(TestEnum.A, flow(Function.satisfies<TestEnum.A>(), Function.constant('a'))),
					MMatch.whenIs(TestEnum.B, flow(Function.satisfies<TestEnum.B>(), Function.constant('b'))),
					// @ts-expect-error TestEnum.C missing
					MMatch.exhaustive
				),
				'b'
			);
		});

		it('whenIsOr and exhaustive passing', () => {
			TEUtils.strictEqual(
				pipe(
					TestEnum.B,
					MMatch.make,
					MMatch.whenIs(TestEnum.A, flow(Function.satisfies<TestEnum.A>(), Function.constant('a'))),
					MMatch.whenIsOr(
						TestEnum.B,
						TestEnum.C,
						flow(Function.satisfies<TestEnum.B | TestEnum.C>(), Function.constant('b'))
					),
					MMatch.exhaustive
				),
				'b'
			);
		});

		it('whenIsOr and exhaustive not passing', () => {
			TEUtils.strictEqual(
				pipe(
					TestEnum.B,
					MMatch.make,
					MMatch.whenIsOr(
						TestEnum.B,
						TestEnum.C,
						flow(Function.satisfies<TestEnum.B | TestEnum.C>(), Function.constant('b'))
					),
					// @ts-expect-error TestEnum.A missing
					MMatch.exhaustive
				),
				'b'
			);
		});

		it('orElse', () => {
			TEUtils.strictEqual(
				pipe(
					TestEnum.B,
					MMatch.make,
					MMatch.whenIs(TestEnum.A, flow(Function.satisfies<TestEnum.A>(), Function.constant('a'))),
					MMatch.when(isC, flow(Function.satisfies<TestEnum.C>(), Function.constant('c'))),
					MMatch.orElse(flow(Function.satisfies<TestEnum.B>(), Function.constant('b')))
				),
				'b'
			);
		});

		it('whenOr and exhaustive passing', () => {
			TEUtils.strictEqual(
				pipe(
					TestEnum.B,
					MMatch.make,
					MMatch.when(isC, flow(Function.satisfies<TestEnum.C>(), Function.constant('c'))),
					MMatch.whenOr(
						isA,
						isB,
						flow(Function.satisfies<TestEnum.A | TestEnum.B>(), Function.constant('b'))
					),
					MMatch.exhaustive
				),
				'b'
			);
		});

		it('whenOr and exhaustive not passing', () => {
			TEUtils.strictEqual(
				pipe(
					TestEnum.B,
					MMatch.make,
					MMatch.whenOr(
						isA,
						isB,
						flow(Function.satisfies<TestEnum.A | TestEnum.B>(), Function.constant('b'))
					),
					// @ts-expect-error TestEnum.C missing
					MMatch.exhaustive
				),
				'b'
			);
		});

		it('unsafeWhen', () => {
			TEUtils.strictEqual(
				pipe(
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
				),
				'c'
			);
		});
	});
});
