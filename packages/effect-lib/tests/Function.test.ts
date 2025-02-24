/* eslint-disable functional/no-expression-statements */
import { MFunction } from '@parischap/effect-lib';
import { Number, pipe, String } from 'effect';
import { describe, expect, it } from 'vitest';
describe('MFunction', () => {
	describe('fIfTrue', () => {
		it('Matching', () => {
			expect(pipe(1 as number, MFunction.fIfTrue({ condition: true, f: Number.increment }))).toBe(
				2
			);
		});

		it('Non-matching', () => {
			expect(pipe(1 as number, MFunction.fIfTrue({ condition: false, f: Number.increment }))).toBe(
				1
			);
		});
	});

	it('flipDual', () => {
		expect(pipe(2, MFunction.flipDual(String.takeLeft)('foo'))).toBe('fo');
	});

	describe('strictEquals', () => {
		const test: number = 5;
		it('Matching', () => {
			expect(pipe(test, MFunction.strictEquals(5))).toBe(true);
		});

		it('Non matching', () => {
			expect(pipe(test, MFunction.strictEquals(2))).toBe(false);
		});
	});

	it('parameterNumber', () => {
		const foo = (m: number, n: number) => m + n;
		expect(pipe(foo, MFunction.parameterNumber)).toBe(2);
	});

	it('name', () => {
		const foo = (m: number, n: number) => m + n;
		expect(pipe(foo, MFunction.name)).toBe('foo');
	});

	it('once', () => {
		let a = 0;
		const complexFoo = () => a++;
		const memoized = MFunction.once(complexFoo);
		expect(memoized()).toBe(0);
		expect(memoized()).toBe(0);
	});

	it('applyAsMethod', () => {
		expect(pipe(Array.prototype.pop, MFunction.applyAsThis([1, 2]))).toBe(2);
	});

	it('applyNoArg', () => {
		const foo = () => 1;
		expect(pipe(foo, MFunction.execute)).toBe(1);
	});

	it('clone', () => {
		const copy = MFunction.clone(Number.increment);
		expect(copy === Number.increment).toBe(false);
		expect(copy(1)).toBe(2);
	});
});
