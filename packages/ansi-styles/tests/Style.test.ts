/* eslint-disable functional/no-expression-statements */
import { ASStyle, ASStyleCharacteristics, ASText } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { Equal, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('ASStyle', () => {
	const red = ASStyle.red;
	const bold = ASStyle.bold;
	const boldRed1 = pipe(red, ASStyle.mergeOver(bold));
	const boldRed2 = pipe(bold, ASStyle.mergeOver(red));

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(ASStyle.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(Equal.equals(ASStyle.none, ASStyle.none)).toBe(true);
				expect(Equal.equals(boldRed1, boldRed2)).toBe(true);
			});

			it('Non-matching', () => {
				expect(Equal.equals(boldRed2, bold)).toBe(false);
			});
		});

		describe('.toString()', () => {
			it('red before bold', () => {
				expect(boldRed1.toString()).toBe('BoldRed');
			});
			it('bold before red', () => {
				expect(boldRed2.toString()).toBe('BoldRed');
			});
			it('Other than color', () => {
				expect(ASStyle.struckThrough.toString()).toBe('StruckThrough');
			});
			it('Default foreground color', () => {
				expect(ASStyle.defaultColor.toString()).toBe('DefaultColor');
			});
			it('Default background color', () => {
				expect(ASStyle.Bg.defaultColor.toString()).toBe('InDefaultColor');
			});
		});

		it('.pipe()', () => {
			expect(boldRed1.pipe(ASStyle.toId)).toBe('BoldRed');
		});

		describe('has', () => {
			it('Matching', () => {
				expect(ASStyle.has(boldRed2)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASStyle.has(new Date())).toBe(false);
			});
		});
	});

	it('mergeOver', () => {
		expect(
			pipe(
				ASStyle.green,
				ASStyle.mergeOver(ASStyle.blinking),
				ASStyle.mergeOver(ASStyle.Bright.black)
			).toString()
		).toBe('BlinkingBrightBlack');
	});

	it('mergeUnder', () => {
		expect(
			pipe(
				ASStyle.green,
				ASStyle.mergeUnder(ASStyle.blinking),
				ASStyle.mergeUnder(ASStyle.Bright.black)
			).toString()
		).toBe('BlinkingGreen');
	});

	it('Constructor', () => {
		expect(
			ASText.equivalence(bold('foo'), ASText.fromStyleAndElems(ASStyleCharacteristics.bold)('foo'))
		).toBe(true);
	});
});
