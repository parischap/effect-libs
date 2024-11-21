/* eslint-disable functional/no-expression-statements */
import { describe, expect, it } from 'vitest';

describe('ASFormatter', () => {
	describe('fromFormat', () => {
		it('Simple color', () => {
			expect(MColor.applyToString('foo')(MColor.red)).toBe('\x1b[31mfoo\x1b[0m');
		});
		it('Simple background color', () => {
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
			expect(MColor.applyToString('foo')(MColor.setBold(MColor.red))).toBe('\x1b[31;1mfoo\x1b[0m');
		});
		it('Underline RGB color', () => {
			expect(MColor.applyToString('foo')(MColor.setUnderline(MColor.fromRGB(255, 0, 0)))).toBe(
				'\x1b[38;2;255;0;0;4mfoo\x1b[0m'
			);
		});
	});
});
