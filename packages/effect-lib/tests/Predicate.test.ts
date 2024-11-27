/* eslint-disable functional/no-expression-statements */
import { MPredicate } from '@parischap/effect-lib';
import { pipe, Predicate } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MPredicate', () => {
	describe('struct', () => {
		it('Type error expected', () => {
			/* @ts-expect-error c not present in object */
			expect(pipe({ a: 0, b: 1 }, MPredicate.struct({ c: Predicate.isNumber }))).toEqual(false);
		});

		it('Passing', () => {
			expect(
				pipe(
					{ a: 0, b: 1, c: 2 },
					MPredicate.struct({ b: Predicate.isNumber, c: Predicate.isNumber })
				)
			).toEqual(true);
		});

		it('Failing', () => {
			expect(
				pipe(
					{ a: 0, b: 1, c: 2 },
					MPredicate.struct({ b: Predicate.isNumber, c: Predicate.isString })
				)
			).toEqual(false);
		});
	});
});
