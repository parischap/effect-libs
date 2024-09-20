/* eslint-disable functional/no-expression-statements */
import { JsColor } from '@parischap/js-lib';
import { describe, expect, it } from 'vitest';

describe('JsColor', () => {
	describe('colorize', () => {
		it('Simple color', () => {
			expect(JsColor.applyToString('foo')(JsColor.red)).toBe('\x1b[31mfoo\x1b[0m');
		});
		it('Simple background color', () => {
			expect(
				JsColor.applyToString('foo')(
					JsColor.setSimpleBgColorFromOriginalColor(JsColor.OriginalColors.Red)(JsColor.empty)
				)
			).toBe('\x1b[41mfoo\x1b[0m');
		});
		it('Simple bright color', () => {
			expect(JsColor.applyToString('foo')(JsColor.brightRed)).toBe('\x1b[91mfoo\x1b[0m');
		});
		it('Simple bright background color', () => {
			expect(
				JsColor.applyToString('foo')(
					JsColor.setBrightBgColorFromOriginalColor(JsColor.OriginalColors.Red)(JsColor.empty)
				)
			).toBe('\x1b[101mfoo\x1b[0m');
		});
		it('Bold simple color', () => {
			expect(JsColor.applyToString('foo')(JsColor.setBold(JsColor.red))).toBe(
				'\x1b[31;1mfoo\x1b[0m'
			);
		});
		it('Underline RGB color', () => {
			expect(JsColor.applyToString('foo')(JsColor.setUnderline(JsColor.fromRGB(255, 0, 0)))).toBe(
				'\x1b[38;2;255;0;0;4mfoo\x1b[0m'
			);
		});
	});
});
