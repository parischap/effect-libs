/* eslint-disable functional/no-expression-statements */
import { ASPalette, ASStyle } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { Array, Equal, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

const blackRed = ASPalette.make({
	styles: Array.make(ASStyle.black, ASStyle.red)
});

describe('ASPalette', () => {
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(ASPalette.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(
					Equal.equals(
						ASPalette.empty,
						ASPalette.make({
							styles: Array.empty()
						})
					)
				).toBe(true);
				expect(
					Equal.equals(
						blackRed,
						ASPalette.make({
							styles: Array.make(ASStyle.black, ASStyle.red)
						})
					)
				).toBe(true);
			});

			it('Non-matching', () => {
				expect(Equal.equals(ASPalette.empty, blackRed)).toBe(false);
			});
		});

		describe('.toString()', () => {
			it('empty', () => {
				expect(ASPalette.empty.toString()).toBe('');
			});
			it('Black and red', () => {
				expect(blackRed.toString()).toBe('Black/Red');
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
					ASPalette.make({
						styles: Array.of(ASStyle.black)
					}),
					ASPalette.append(
						ASPalette.make({
							styles: Array.of(ASStyle.red)
						})
					)
				),
				blackRed
			)
		).toBe(true);
	});
});
