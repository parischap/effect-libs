/* eslint-disable functional/no-expression-statements */
import { CVNumberBase10Format } from '@parischap/conversions';
import { MUtils } from '@parischap/effect-lib';
import { Equal } from 'effect';
import { describe, expect, it } from 'vitest';

const uk = CVNumberBase10Format.uk;

describe('NumberBase10Format', () => {
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(CVNumberBase10Format.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(Equal.equals(uk, CVNumberBase10Format.make({ ...uk }))).toBe(true);
			});

			it('Non-matching', () => {
				expect(Equal.equals(uk, blackRed)).toBe(false);
			});
		});

		describe('.toString()', () => {
			it('Black and red', () => {
				expect(blackRed.toString()).toBe('Black/RedPalette');
			});
		});

		it('.pipe()', () => {
			expect(blackRed.pipe(ASPalette.has)).toBe(true);
		});

		describe('has', () => {
			it('Matching', () => {
				expect(ASPalette.has(blackRed)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASPalette.has(new Date())).toBe(false);
			});
		});
	});
});
