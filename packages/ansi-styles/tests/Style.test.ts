/* eslint-disable functional/no-expression-statements */
import { ASFormat, ASFormatter } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { Equal, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('ASFormat', () => {
	describe('Tag, prototype and guards', () => {
		const testColoredFormat = ASFormat.Colored.Original.red;

		it('moduleTag', () => {
			expect(ASFormat.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Colored', () => {
				expect(Equal.equals(testColoredFormat, ASFormat.Colored.Original.red)).toBe(true);
				expect(Equal.equals(testColoredFormat, ASFormat.Colored.Original.green)).toBe(false);
			});

			it('Colored and Styled matching', () => {
				expect(Equal.equals(testColoredFormat, ASFormat.Styled.fromColor(testColoredFormat))).toBe(
					true
				);
			});

			it('Colored and Styled not matching', () => {
				expect(
					Equal.equals(
						testColoredFormat,
						ASFormat.Styled.fromColor(ASFormat.Colored.Original.green)
					)
				).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(testColoredFormat.toString()).toBe('"Red"');
		});

		it('.pipe()', () => {
			expect(testColoredFormat.pipe(ASFormatter.fromFormat, ASFormatter.id)).toBe('Red');
		});

		it('has', () => {
			expect(ASFormat.has(testColoredFormat)).toBe(true);
			expect(ASFormat.has(ASFormat.Styled.none)).toBe(true);
			expect(ASFormat.has(new Date())).toBe(false);
		});
	});

	describe('Colored', () => {
		it('has', () => {
			expect(ASFormat.Colored.has(ASFormat.Colored.Original.red)).toBe(true);
			expect(ASFormat.Colored.has(ASFormat.Styled.none)).toBe(false);
		});

		describe('Original', () => {
			it('red', () => {
				const format = ASFormat.Colored.Original.red;
				expect(ASFormat.stringTransformer(format)('foo')).toBe('\x1b[31mfoo\x1b[0m');
				expect(ASFormat.id(format)).toBe('Red');
			});
			it('brightRed', () => {
				const format = ASFormat.Colored.Original.brightRed;
				expect(ASFormat.stringTransformer(format)('foo')).toBe('\x1b[91mfoo\x1b[0m');
				expect(ASFormat.id(format)).toBe('BrightRed');
			});
		});

		describe('EightBit', () => {
			it('red', () => {
				const format = ASFormat.Colored.EightBit.red;
				expect(ASFormat.stringTransformer(format)('foo')).toBe('\x1b[38;5;9mfoo\x1b[0m');
				expect(ASFormat.id(format)).toBe('EightBitRed');
			});
		});

		describe('RGB', () => {
			it('red', () => {
				const format = ASFormat.Colored.RGB.red;
				expect(ASFormat.stringTransformer(format)('foo')).toBe('\x1b[38;2;255;0;0mfoo\x1b[0m');
				expect(ASFormat.id(format)).toBe('RGBRed');
			});
			it('make', () => {
				const format = ASFormat.Colored.RGB.make({ red: 18, green: 21, blue: 24 });
				expect(ASFormat.stringTransformer(format)('foo')).toBe('\x1b[38;2;18;21;24mfoo\x1b[0m');
				expect(ASFormat.id(format)).toBe('RGB/18/21/24');
			});
		});

		describe('Styled', () => {
			it('has', () => {
				expect(ASFormat.Styled.has(ASFormat.Colored.Original.red)).toBe(false);
				expect(ASFormat.Styled.has(ASFormat.Styled.none)).toBe(true);
			});

			it('none', () => {
				const format = ASFormat.Styled.none;
				expect(ASFormat.stringTransformer(format)('foo')).toBe('foo');
				expect(ASFormat.id(format)).toBe('None');
			});
			it('fromColor', () => {
				const format = ASFormat.Styled.fromColor(ASFormat.Colored.Original.green);
				expect(ASFormat.stringTransformer(format)('foo')).toBe('\x1b[32mfoo\x1b[0m');
				expect(ASFormat.id(format)).toBe('Green');
			});
			it('Just bold', () => {
				const format = pipe(ASFormat.Styled.none, ASFormat.Styled.makeBold);
				expect(ASFormat.stringTransformer(format)('foo')).toBe('\x1b[1mfoo\x1b[0m');
				expect(ASFormat.id(format)).toBe('Bold');
			});
			it('All available styles', () => {
				const format = pipe(
					ASFormat.Styled.none,
					ASFormat.Styled.setFgColor(ASFormat.Colored.EightBit.olive),
					ASFormat.Styled.setBgColor(ASFormat.Colored.RGB.indianRed),
					ASFormat.Styled.makeBold,
					ASFormat.Styled.makeUnderlined,
					ASFormat.Styled.makeBlinking,
					ASFormat.Styled.makeFramed,
					ASFormat.Styled.makeEncircled,
					ASFormat.Styled.makeOverlined
				);
				expect(ASFormat.stringTransformer(format)('foo')).toBe(
					'\x1b[38;5;3;48;2;205;92;92;1;4;5;51;52;53mfoo\x1b[0m'
				);
				expect(ASFormat.id(format)).toBe(
					'BoldUnderlinedFramedEncircledOverlinedBlinkingEightBitOliveInRGBIndianRed'
				);
			});
		});
	});
});
