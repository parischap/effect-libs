/* eslint-disable functional/no-expression-statements */
import { ASColor, ASStyleCharacteristics } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { Equal, Option, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('ASStyleCharacteristics', () => {
	const boldItalic = pipe(
		ASStyleCharacteristics.bold,
		ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.italic)
	);
	const boldItalicBrightGreenInBlue = pipe(
		boldItalic,
		ASStyleCharacteristics.mergeUnder(
			ASStyleCharacteristics.fromColorAsForegroundColor(ASColor.ThreeBit.Bright.green)
		),
		ASStyleCharacteristics.mergeUnder(
			ASStyleCharacteristics.fromColorAsBackgroundColor(ASColor.EightBit.blue)
		)
	);
	const bold1 = pipe(boldItalic, ASStyleCharacteristics.difference(ASStyleCharacteristics.italic));
	const notBoldNotDimRed = pipe(
		ASStyleCharacteristics.fromColorAsForegroundColor(ASColor.ThreeBit.red),
		ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notBold),
		ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notDim)
	);
	const boldNotDimRed = pipe(
		ASStyleCharacteristics.fromColorAsForegroundColor(ASColor.ThreeBit.red),
		ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.bold),
		ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notDim)
	);
	const notBoldDimRed = pipe(
		ASStyleCharacteristics.fromColorAsForegroundColor(ASColor.ThreeBit.red),
		ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notBold),
		ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.dim)
	);

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(ASStyleCharacteristics.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(Equal.equals(ASStyleCharacteristics.bold, bold1)).toBe(true);
				expect(Equal.equals(ASStyleCharacteristics.none, ASStyleCharacteristics.none)).toBe(true);
			});
			it('Non matching', () => {
				expect(Equal.equals(ASStyleCharacteristics.bold, boldItalic)).toBe(false);
				expect(Equal.equals(ASStyleCharacteristics.bold, new Date())).toBe(false);
			});
		});

		describe('.toString()', () => {
			expect(ASStyleCharacteristics.none.toString()).toBe('');
			expect(boldItalicBrightGreenInBlue.toString()).toBe('BoldItalicBrightGreenInEightBitBlue');
		});

		it('.pipe()', () => {
			expect(bold1.pipe(ASStyleCharacteristics.toId)).toBe('Bold');
		});

		describe('has', () => {
			it('Matching', () => {
				expect(ASStyleCharacteristics.has(boldItalic)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASStyleCharacteristics.has(new Date())).toBe(false);
			});
		});
	});

	it('italicState', () => {
		expect(Equal.equals(ASStyleCharacteristics.italicState(boldItalic), Option.some(true))).toBe(
			true
		);
		expect(pipe(ASStyleCharacteristics.italicState(bold1), Option.isNone)).toBe(true);
	});

	describe('toSequence', () => {
		it('none', () => {
			expect(ASStyleCharacteristics.toSequence(ASStyleCharacteristics.none)).toEqual([]);
		});

		it('bold italic', () => {
			expect(ASStyleCharacteristics.toSequence(boldItalic)).toEqual([1, 3]);
		});

		it('Not bold not dim red', () => {
			expect(ASStyleCharacteristics.toSequence(notBoldNotDimRed)).toEqual([22, 31]);
		});

		it('Bold not dim red', () => {
			expect(ASStyleCharacteristics.toSequence(boldNotDimRed)).toEqual([22, 1, 31]);
		});

		it('Not bold dim red', () => {
			expect(ASStyleCharacteristics.toSequence(notBoldDimRed)).toEqual([22, 2, 31]);
		});
	});

	it('mergeUnder', () => {
		expect(
			pipe(
				notBoldDimRed,
				ASStyleCharacteristics.mergeUnder(boldItalic),
				ASStyleCharacteristics.toId
			)
		).toBe('NotBoldDimItalicRed');
	});

	it('mergeOver', () => {
		expect(
			pipe(notBoldDimRed, ASStyleCharacteristics.mergeOver(boldItalic), ASStyleCharacteristics.toId)
		).toBe('BoldDimItalicRed');
	});

	describe('difference', () => {
		it('None with none', () => {
			expect(
				pipe(
					ASStyleCharacteristics.none,
					ASStyleCharacteristics.difference(ASStyleCharacteristics.none),
					ASStyleCharacteristics.toId
				)
			).toBe('');
		});

		it('Complex case 1', () => {
			expect(
				pipe(
					boldItalicBrightGreenInBlue,
					ASStyleCharacteristics.difference(boldNotDimRed),
					ASStyleCharacteristics.toId
				)
			).toBe('ItalicBrightGreenInEightBitBlue');
		});

		it('Complex case 2', () => {
			expect(
				pipe(
					notBoldNotDimRed,
					ASStyleCharacteristics.difference(boldNotDimRed),
					ASStyleCharacteristics.toId
				)
			).toBe('NotBold');
		});
	});

	it('substractContext', () => {
		expect(
			pipe(
				ASStyleCharacteristics.bold,
				ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.notDim),
				ASStyleCharacteristics.mergeUnder(ASStyleCharacteristics.italic),
				ASStyleCharacteristics.substractContext(ASStyleCharacteristics.bold),
				ASStyleCharacteristics.toId
			)
		).toBe('BoldNotDimItalic');
	});
});
