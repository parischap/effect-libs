/* eslint-disable functional/no-expression-statements */
import { ASFormat } from '@parischap/ansi-styles';
import { describe, expect, it } from 'vitest';

describe('ASFormat', () => {
	describe('Colored', () => {
		describe('Original', () => {
			it('red', () => {
				const format = ASFormat.Colored.Original.red;
				expect(ASFormat.stringTransformer(format)('foo')).toBe('\x1b[31mfoo\x1b[0m');
				expect(ASFormat.name(format)).toBe('Red');
			});
			it('brightRed', () => {
				const format = ASFormat.Colored.Original.brightRed;
				expect(ASFormat.stringTransformer(format)('foo')).toBe('\x1b[91mfoo\x1b[0m');
				expect(ASFormat.name(format)).toBe('BrightRed');
			});
		});

		describe('EightBit', () => {
			it('red', () => {
				const format = ASFormat.Colored.EightBit.red;
				expect(ASFormat.stringTransformer(format)('foo')).toBe('\x1b[38;5;9mfoo\x1b[0m');
				expect(ASFormat.name(format)).toBe('EightBitRed');
			});
		});

		describe('RGB', () => {
			it('red', () => {
				const format = ASFormat.Colored.RGB.red;
				expect(ASFormat.stringTransformer(format)('foo')).toBe('\x1b[38;2;255;0;0mfoo\x1b[0m');
				expect(ASFormat.name(format)).toBe('RGBRed');
			});
		});

		describe('Styled', () => {
			it('none', () => {
				const format = ASFormat.Styled.none;
				expect(
					MColor.applyToString('foo')(
						MColor.setSimpleBgColorFromOriginalColor(MColor.OriginalColors.Red)(MColor.empty)
					)
				).toBe('\x1b[41mfoo\x1b[0m');
			});
			it('Simple bright color', () => {
				expect(MColor.applyToString('foo')(MColor.brightRed)).toBe('\x1b[91mfoo\x1b[0m');
			});
			it('Simple bright background color', () => {
				expect(
					MColor.applyToString('foo')(
						MColor.setBrightBgColorFromOriginalColor(MColor.OriginalColors.Red)(MColor.empty)
					)
				).toBe('\x1b[101mfoo\x1b[0m');
			});
			it('Bold simple color', () => {
				expect(MColor.applyToString('foo')(MColor.setBold(MColor.red))).toBe(
					'\x1b[31;1mfoo\x1b[0m'
				);
			});
			it('Underline RGB color', () => {
				expect(MColor.applyToString('foo')(MColor.setUnderline(MColor.fromRGB(255, 0, 0)))).toBe(
					'\x1b[38;2;255;0;0;4mfoo\x1b[0m'
				);
			});
		});
	});
});
