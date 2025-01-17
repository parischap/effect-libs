/* eslint-disable functional/no-expression-statements */
import { ASPalette, ASStyle } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { Equal, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

const blackRed = ASPalette.make(ASStyle.black, ASStyle.red);

describe('ASPalette', () => {
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(ASPalette.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(Equal.equals(blackRed, ASPalette.make(ASStyle.black, ASStyle.red))).toBe(true);
			});

			it('Non-matching', () => {
				expect(Equal.equals(ASPalette.allOriginalColors, blackRed)).toBe(false);
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

	it('append', () => {
		expect(
			ASPalette.equivalence(
				pipe(
					ASPalette.make(ASStyle.black, ASStyle.red, ASStyle.green, ASStyle.yellow),
					ASPalette.append(
						ASPalette.make(ASStyle.blue, ASStyle.magenta, ASStyle.cyan, ASStyle.white)
					)
				),
				ASPalette.allStandardOriginalColors
			)
		).toBe(true);
	});
});
