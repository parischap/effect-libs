/* eslint-disable functional/no-expression-statements */
import { MFunction } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Number, pipe, String } from 'effect';
import { describe, it } from 'vitest';

describe('MFunction', () => {
	describe('fIfTrue', () => {
		it('Matching', () => {
			TEUtils.strictEqual(
				pipe(1 as number, MFunction.fIfTrue({ condition: true, f: Number.increment })),
				2
			);
		});

		it('Non-matching', () => {
			TEUtils.strictEqual(
				pipe(1 as number, MFunction.fIfTrue({ condition: false, f: Number.increment })),
				1
			);
		});
	});

	it('flipDual', () => {
		TEUtils.strictEqual(pipe(2, MFunction.flipDual(String.takeLeft)('foo')), 'fo');
	});

	describe('strictEquals', () => {
		it('Matching', () => {
			TEUtils.assertTrue(pipe(5, MFunction.strictEquals(5)));
		});

		it('Non matching', () => {
			TEUtils.assertFalse(pipe(5, MFunction.strictEquals(2)));
		});
	});

	it('parameterNumber', () => {
		TEUtils.strictEqual(
			pipe((m: number, n: number) => m + n, MFunction.parameterNumber),
			2
		);
	});

	it('name', () => {
		TEUtils.strictEqual(pipe(Math.max, MFunction.name), 'max');
	});

	it('once', () => {
		let a = 0;
		const complexFoo = () => a++;
		const memoized = MFunction.once(complexFoo);
		TEUtils.strictEqual(memoized(), 0);
		TEUtils.strictEqual(memoized(), 0);
	});

	it('applyAsMethod', () => {
		TEUtils.strictEqual(pipe(Array.prototype.pop, MFunction.applyAsThis([1, 2])), 2);
	});

	it('execute', () => {
		TEUtils.strictEqual(
			pipe(() => 1, MFunction.execute),
			1
		);
	});

	it('clone', () => {
		const incCopy = MFunction.clone(Number.increment);
		TEUtils.assertFalse(incCopy === Number.increment);
		TEUtils.strictEqual(incCopy(1), 2);
	});
});
