/* eslint-disable functional/no-expression-statements */
import { MTuple } from '@parischap/effect-lib';
import { Array, Number, pipe, Tuple } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MTuple', () => {
	describe('make', () => {
		it('With Array.map', () => {
			expect(pipe(Array.make(1, 2), Array.map(MTuple.fromSingleValue))).toStrictEqual(
				Array.make(Tuple.make(1), Tuple.make(2))
			);
		});
	});

	describe('makeBoth', () => {
		it('From number', () => {
			expect(pipe(1, MTuple.makeBoth)).toStrictEqual(Tuple.make(1, 1));
		});
	});

	describe('makeBothBy', () => {
		it('From number', () => {
			expect(
				pipe(1, MTuple.makeBothBy({ toFirst: Number.sum(1), toSecond: Number.multiply(2) }))
			).toStrictEqual(Tuple.make(2, 2));
		});
	});

	describe('prepend', () => {
		it('From number', () => {
			expect(pipe(1, Tuple.make, MTuple.prependElement(2))).toStrictEqual(Tuple.make(2, 1));
		});
	});

	describe('firstTwo', () => {
		it('From number tuple', () => {
			expect(pipe(Tuple.make(1, 2, 3), MTuple.firstTwo)).toStrictEqual(Tuple.make(1, 2));
		});
	});
});
