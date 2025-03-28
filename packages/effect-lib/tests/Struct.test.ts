/* eslint-disable functional/no-expression-statements */
import { MStruct } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { flow, Number, pipe, Struct } from 'effect';
import { describe, it } from 'vitest';

describe('MRecord', () => {
	describe('prepend', () => {
		it('No overlap', () => {
			TEUtils.deepStrictEqual(MStruct.prepend({ c: 2 })({ a: 0, b: 1 }), { a: 0, b: 1, c: 2 });
		});

		it('With overlap', () => {
			TEUtils.deepStrictEqual(MStruct.prepend({ b: 2, d: 4 })({ a: 0, b: 1 }), {
				a: 0,
				b: 1,
				d: 4
			});
		});
	});

	describe('append', () => {
		it('No overlap', () => {
			TEUtils.deepStrictEqual(MStruct.append({ c: 2 })({ a: 0, b: 1 }), { a: 0, b: 1, c: 2 });
		});

		it('With overlap', () => {
			TEUtils.deepStrictEqual(MStruct.append({ b: 2 })({ a: 0, b: 1 }), { a: 0, b: 2 });
		});
	});

	describe('set', () => {
		it('No overlap', () => {
			// @ts-expect-error Cannot set `c` as it is not in target record
			TEUtils.deepStrictEqual(pipe({ a: 0, b: 1 }, MStruct.set({ c: 2 })), { a: 0, b: 1, c: 2 });
		});

		it('With overlap', () => {
			TEUtils.deepStrictEqual(pipe({ a: 0, b: 1 }, MStruct.set({ b: 2 })), { a: 0, b: 2 });
		});
	});

	describe('make', () => {
		it('From number', () => {
			TEUtils.deepStrictEqual(MStruct.make('a')(3), { a: 3 });
		});
	});

	describe('enrichWith', () => {
		it('No overlap', () => {
			TEUtils.deepStrictEqual(
				pipe({ a: 0, b: 1 }, MStruct.enrichWith({ c: flow(Struct.get('a'), Number.sum(1)) })),
				{ a: 0, b: 1, c: 1 }
			);
		});

		it('With overlap', () => {
			TEUtils.deepStrictEqual(
				pipe(
					{ a: 0, b: 1 },
					MStruct.enrichWith({
						c: flow(Struct.get('a'), Number.sum(1)),
						b: flow(Struct.get('b'), Number.sum(1))
					})
				),
				{ a: 0, b: 2, c: 1 }
			);
		});
	});

	describe('mutableEnrichWith', () => {
		it('No overlap', () => {
			const value = { a: 0, b: 1 };
			pipe(value, MStruct.mutableEnrichWith({ c: flow(Struct.get('a'), Number.sum(1)) }));
			TEUtils.deepStrictEqual(value as never, { a: 0, b: 1, c: 1 });
		});

		it('With overlap', () => {
			const value = { a: 0, b: 1 };
			pipe(
				value,
				MStruct.mutableEnrichWith({
					c: flow(Struct.get('a'), Number.sum(1)),
					b: flow(Struct.get('b'), Number.sum(1))
				})
			);
			TEUtils.deepStrictEqual(value as never, { a: 0, b: 2, c: 1 });
		});
	});

	describe('evolve', () => {
		it('No No overlap', () => {
			TEUtils.deepStrictEqual(MStruct.evolve({ c: Number.sum(1) })({ a: 0, b: 1 }), {
				a: 0,
				b: 1
			});
		});

		it('With overlap', () => {
			TEUtils.deepStrictEqual(
				MStruct.evolve({
					b: Number.sum(1)
				})({ a: 0, b: 1 }),
				{ a: 0, b: 2 }
			);
		});
	});
});
