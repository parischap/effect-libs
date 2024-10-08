/* eslint-disable functional/no-expression-statements */
import { MPositiveInt } from '@parischap/effect-lib';
import { Transformer } from '@parischap/effect-templater';
import { Chunk, Either, Equal, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('Transformer', () => {
	describe('string', () => {
		const string = Transformer.string;
		it('Reading', () => {
			expect(
				pipe(
					'foo and bar',
					string.read,
					// Revert from Chunk to Array when Effect 4.0 with structurzl equality comes out
					Either.map(Chunk.fromIterable),
					Equal.equals(Either.right(Chunk.make('foo and bar', '')))
				)
			).toBe(true);
		});

		it('Writing', () => {
			expect(string.write('foo and bar')).toBe('foo and bar');
		});
	});

	describe('unsignedInt', () => {
		const unsignedInt = Transformer.unsignedInt('_');

		it('Reading from string not matching', () => {
			expect(pipe('+107_485foo and bar', unsignedInt.read, Either.isLeft)).toBe(true);
		});

		it('Reading from matching string', () => {
			expect(
				pipe(
					'107_485foo and bar',
					unsignedInt.read,
					// Revert from Chunk to Array when Effect 4.0 with structurzl equality comes out
					Either.map(Chunk.fromIterable),
					Equal.equals(Either.right(Chunk.make(107485, 'foo and bar')))
				)
			).toBe(true);
		});

		it('Writing', () => {
			expect(unsignedInt.write(MPositiveInt.fromNumber(1003457))).toBe('1_003_457');
		});
	});
});
