/* eslint-disable functional/no-expression-statements */
import { MChunk, MFunction } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Chunk, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('MChunk', () => {
	describe('hasLength', () => {
		it('Simple chunk', () => {
			TEUtils.assertTrue(pipe(Chunk.make(1, 2, 3), MChunk.hasLength(3)));
		});
	});

	describe('hasDuplicates', () => {
		it('With no duplicates', () => {
			TEUtils.assertFalse(pipe(Chunk.make(1, 2, 3), MChunk.hasDuplicates));
		});

		it('With duplicates', () => {
			TEUtils.assertTrue(pipe(Chunk.make(1, 2, 3, 2), MChunk.hasDuplicates));
		});
	});

	describe('findAll', () => {
		it('Empty chunk', () => {
			TEUtils.assertTrue(
				pipe(Chunk.empty<number>(), MChunk.findAll(MFunction.strictEquals(3)), Chunk.isEmpty)
			);
		});
		it('Non empty chunk', () => {
			TEUtils.assertEquals(
				pipe(Chunk.make(3, 2, 5, 3, 8, 3), MChunk.findAll(MFunction.strictEquals(3))),
				Chunk.make(0, 3, 5)
			);
		});
	});

	describe('takeBut', () => {
		it('Empty chunk', () => {
			TEUtils.assertTrue(pipe(Chunk.empty<number>(), MChunk.takeBut(2), Chunk.isEmpty));
		});
		it('Non empty chunk', () => {
			TEUtils.assertEquals(
				pipe(Chunk.make(3, 2, 5, 3, 8, 3), MChunk.takeBut(2)),
				Chunk.make(3, 2, 5, 3)
			);
		});
	});

	describe('takeRightBut', () => {
		it('Empty chunk', () => {
			TEUtils.assertTrue(pipe(Chunk.empty<number>(), MChunk.takeRightBut(2), Chunk.isEmpty));
		});
		it('Non empty chunk', () => {
			TEUtils.assertEquals(
				pipe(Chunk.make(3, 2, 5, 3, 8, 3), MChunk.takeRightBut(2)),
				Chunk.make(5, 3, 8, 3)
			);
		});
	});
});
