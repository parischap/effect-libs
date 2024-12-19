/* eslint-disable functional/no-expression-statements */
import { ASStyleCharacteristic, ASStyleCharacteristics } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { Array, Equal, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('ASStyleCharacteristics', () => {
	describe('Tag, prototype and guards', () => {
		const bold = ASStyleCharacteristics.fromStyleCharacteristic(ASStyleCharacteristic.bold);
		const dim = ASStyleCharacteristics.fromStyleCharacteristic(ASStyleCharacteristic.dim);
		const italic = ASStyleCharacteristics.fromStyleCharacteristic(ASStyleCharacteristic.italic);
		const boldItalic1 = pipe(bold, ASStyleCharacteristics.merge(italic));
		const boldItalic2 = pipe(italic, ASStyleCharacteristics.merge(bold));

		it('moduleTag', () => {
			expect(ASStyleCharacteristics.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(Equal.equals(boldItalic1, boldItalic2)).toBe(true);
				expect(Equal.equals(ASStyleCharacteristics.none, ASStyleCharacteristics.none)).toBe(true);
			});
			it('Non matching', () => {
				expect(Equal.equals(bold, dim)).toBe(false);
			});
		});

		describe('.toString()', () => {
			it('Bold before italic', () => {
				expect(boldItalic1.toString()).toBe('BoldItalic');
			});
			it('Italic before bold', () => {
				expect(boldItalic2.toString()).toBe('BoldItalic');
			});
		});

		it('.pipe()', () => {
			expect(bold.pipe(ASStyleCharacteristics.sortedArray, Array.length)).toBe(1);
		});

		describe('has', () => {
			it('Matching', () => {
				expect(ASStyleCharacteristics.has(boldItalic1)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASStyleCharacteristics.has(new Date())).toBe(false);
			});
		});

		describe('merge', () => {
			it('None with none', () => {
				expect(
					pipe(
						ASStyleCharacteristics.none,
						ASStyleCharacteristics.merge(ASStyleCharacteristics.none),
						Equal.equals(ASStyleCharacteristics.none)
					)
				).toBe(true);
			});

			it('Non-none with none', () => {
				expect(
					pipe(bold, ASStyleCharacteristics.merge(ASStyleCharacteristics.none), Equal.equals(bold))
				).toBe(true);
			});

			it('Complex case', () => {
				expect(
					pipe(
						bold,
						ASStyleCharacteristics.merge(dim),
						ASStyleCharacteristics.merge(dim),
						ASStyleCharacteristics.merge(italic),
						ASStyleCharacteristics.merge(bold),
						Equal.equals(boldItalic1)
					)
				).toBe(true);
			});
		});

		describe('difference', () => {
			it('None with none', () => {
				expect(
					pipe(
						ASStyleCharacteristics.none,
						ASStyleCharacteristics.difference(ASStyleCharacteristics.none),
						Equal.equals(ASStyleCharacteristics.none)
					)
				).toBe(true);
			});

			it('Non-none with none', () => {
				expect(
					pipe(
						bold,
						ASStyleCharacteristics.difference(ASStyleCharacteristics.none),
						Equal.equals(bold)
					)
				).toBe(true);
			});

			it('Complex case', () => {
				expect(
					pipe(
						bold,
						ASStyleCharacteristics.merge(dim),
						ASStyleCharacteristics.merge(dim),
						ASStyleCharacteristics.merge(italic),
						ASStyleCharacteristics.merge(bold),
						ASStyleCharacteristics.difference(
							ASStyleCharacteristics.fromStyleCharacteristic(ASStyleCharacteristic.slowBlink)
						),
						ASStyleCharacteristics.difference(boldItalic1),
						Equal.equals(ASStyleCharacteristics.none)
					)
				).toBe(true);
			});
		});

		describe('toAnsiString', () => {
			it('None', () => {
				expect(ASStyleCharacteristics.toAnsiString(ASStyleCharacteristics.none)).toBe('');
			});

			it('With one characteristic', () => {
				expect(ASStyleCharacteristics.toAnsiString(bold)).toBe('\x1b[1m');
			});

			it('With more than one characteristic', () => {
				expect(ASStyleCharacteristics.toAnsiString(boldItalic1)).toBe('\x1b[1;3m');
			});
		});
	});
});
