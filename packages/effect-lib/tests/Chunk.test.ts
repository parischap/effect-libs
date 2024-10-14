/* eslint-disable functional/no-expression-statements */
import { MChunk, MFunction } from '@parischap/effect-lib';
import { Chunk, Equal, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MChunk', () => {
	describe('hasLength', () => {
		it('Simple chunk', () => {
			expect(pipe(Chunk.make(1, 2, 3), MChunk.hasLength(3))).toBe(true);
		});
	});

	describe('hasDuplicates', () => {
		it('With no duplicates', () => {
			expect(pipe(Chunk.make(1, 2, 3), MChunk.hasDuplicates)).toBe(false);
		});

		it('With duplicates', () => {
			expect(pipe(Chunk.make(1, 2, 3, 2), MChunk.hasDuplicates)).toBe(true);
		});
	});

	describe('findAll', () => {
		it('Empty chunk', () => {
			expect(
				pipe(Chunk.empty<number>(), MChunk.findAll(MFunction.strictEquals(3)), Chunk.isEmpty)
			).toBe(true);
		});
		it('Non empty chunk', () => {
			expect(
				pipe(
					Chunk.make(3, 2, 5, 3, 8, 3),
					MChunk.findAll(MFunction.strictEquals(3)),
					Equal.equals(Chunk.make(0, 3, 5))
				)
			).toBe(true);
		});
	});

	describe('takeBut', () => {
		it('Empty chunk', () => {
			expect(pipe(Chunk.empty<number>(), MChunk.takeBut(2), Chunk.isEmpty)).toBe(true);
		});
		it('Non empty chunk', () => {
			expect(
				pipe(Chunk.make(3, 2, 5, 3, 8, 3), MChunk.takeBut(2), Equal.equals(Chunk.make(3, 2, 5, 3)))
			).toBe(true);
		});
	});

	describe('takeRightBut', () => {
		it('Empty chunk', () => {
			expect(pipe(Chunk.empty<number>(), MChunk.takeRightBut(2), Chunk.isEmpty)).toBe(true);
		});
		it('Non empty chunk', () => {
			expect(
				pipe(
					Chunk.make(3, 2, 5, 3, 8, 3),
					MChunk.takeRightBut(2),
					Equal.equals(Chunk.make(5, 3, 8, 3))
				)
			).toBe(true);
		});
	});
});
