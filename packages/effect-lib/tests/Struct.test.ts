/* eslint-disable functional/no-expression-statements */
import { MStruct } from '@parischap/effect-lib';
import { flow, Number, pipe, Struct } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MRecord', () => {
	describe('prepend', () => {
		it('No overlap', () => {
			expect(pipe({ a: 0, b: 1 }, MStruct.prepend({ c: 2 }))).toEqual({ a: 0, b: 1, c: 2 });
		});

		it('With overlap', () => {
			expect(pipe({ a: 0, b: 1 }, MStruct.prepend({ b: 2, d: 4 }))).toEqual({ a: 0, b: 1, d: 4 });
		});
	});

	describe('append', () => {
		it('No overlap', () => {
			expect(pipe({ a: 0, b: 1 }, MStruct.append({ c: 2 }))).toEqual({ a: 0, b: 1, c: 2 });
		});

		it('With overlap', () => {
			expect(pipe({ a: 0, b: 1 }, MStruct.append({ b: 2 }))).toEqual({ a: 0, b: 2 });
		});
	});

	describe('set', () => {
		it('No overlap', () => {
			// @ts-expect-error Cannot set `c` as it is not in target record
			expect(pipe({ a: 0, b: 1 }, MStruct.set({ c: 2 }))).toEqual({ a: 0, b: 1, c: 2 });
		});

		it('With overlap', () => {
			expect(pipe({ a: 0, b: 1 }, MStruct.set({ b: 2 }))).toEqual({ a: 0, b: 2 });
		});
	});

	describe('make', () => {
		it('From number', () => {
			expect(pipe(3, MStruct.make('a'))).toEqual({ a: 3 });
		});
	});

	describe('enrichWith', () => {
		it('No overlap', () => {
			expect(
				pipe({ a: 0, b: 1 }, MStruct.enrichWith({ c: flow(Struct.get('a'), Number.sum(1)) }))
			).toEqual({ a: 0, b: 1, c: 1 });
		});

		it('With overlap', () => {
			expect(
				pipe(
					{ a: 0, b: 1 },
					MStruct.enrichWith({
						c: flow(Struct.get('a'), Number.sum(1)),
						b: flow(Struct.get('b'), Number.sum(1))
					})
				)
			).toEqual({ a: 0, b: 2, c: 1 });
		});
	});

	describe('evolve', () => {
		it('No No overlap', () => {
			expect(pipe({ a: 0, b: 1 }, MStruct.evolve({ c: Number.sum(1) }))).toEqual({ a: 0, b: 1 });
		});

		it('With overlap', () => {
			expect(
				pipe(
					{ a: 0, b: 1 },
					MStruct.evolve({
						b: Number.sum(1)
					})
				)
			).toEqual({ a: 0, b: 2 });
		});
	});
});
