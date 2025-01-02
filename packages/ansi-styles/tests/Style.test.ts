/* eslint-disable functional/no-expression-statements */
import { ASStyle, ASStyleCharacteristics } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { Array, Equal, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('ASStyle', () => {
	describe('Tag, prototype and guards', () => {
		const red = ASStyle.red;
		const bold = ASStyle.bold;
		const boldRed1 = pipe(red, ASStyle.mergeOver(bold));
		const boldRed2 = pipe(bold, ASStyle.mergeOver(red));

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
			it('Bright ThreeBit foreground color', () => {
				expect(ASStyle.Bright.cyan.toString()).toBe('BrightCyan');
			});
			it('EightBit foreground color', () => {
				expect(ASStyle.EightBit.maroon.toString()).toBe('EightBitMaroon');
			});
			it('RGB predefined foreground color', () => {
				expect(ASStyle.Rgb.goldenRod.toString()).toBe('RgbGoldenRod');
			});
			it('RGB user-defined foreground color', () => {
				expect(ASStyle.Rgb.make({ red: 107, green: 108, blue: 109 }).toString()).toBe(
					'Rgb107/108/109'
				);
			});
			it('Default background color', () => {
				expect(ASStyle.Bg.defaultColor.toString()).toBe('BgDefaultColor');
			});
			it('Bright ThreeBit background color', () => {
				expect(ASStyle.Bg.Bright.cyan.toString()).toBe('BgBrightCyan');
			});
			it('EightBit background color', () => {
				expect(ASStyle.Bg.EightBit.maroon.toString()).toBe('BgEightBitMaroon');
			});
			it('RGB predefined background color', () => {
				expect(ASStyle.Bg.Rgb.goldenRod.toString()).toBe('BgRgbGoldenRod');
			});
			it('RGB user-defined background color', () => {
				expect(ASStyle.Bg.Rgb.make({ red: 107, green: 108, blue: 109 }).toString()).toBe(
					'BgRgb107/108/109'
				);
			});
		});

		it('.pipe()', () => {
			expect(
				boldRed1.pipe(ASStyle.characteristics, ASStyleCharacteristics.sortedArray, Array.length)
			).toBe(2);
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
				ASStyle.mergeOver(ASStyle.slowBlink),
				ASStyle.mergeOver(ASStyle.Rgb.honeyDew)
			).toString()
		).toBe('SlowBlinkRgbHoneyDew');
	});

	it('mergeUnder', () => {
		expect(
			pipe(
				ASStyle.green,
				ASStyle.mergeUnder(ASStyle.slowBlink),
				ASStyle.mergeUnder(ASStyle.Rgb.honeyDew)
			).toString()
		).toBe('SlowBlinkGreen');
	});
});
