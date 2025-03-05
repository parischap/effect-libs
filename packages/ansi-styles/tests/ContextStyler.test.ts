/* eslint-disable functional/no-expression-statements */
import { ASContextStyler, ASPalette, ASStyle, ASText } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { Equal } from 'effect';
import { describe, expect, it } from 'vitest';

describe('ContextStyler', () => {
	interface Value {
		readonly pos1: number;
		readonly otherStuff: string;
	}

	const red: ASContextStyler.Type<Value> = ASContextStyler.red();

	const pos1 = (value: Value): number => value.pos1;

	const pos1BasedAllColorsFormatter = ASContextStyler.fromPalette({
		indexFromContext: pos1,
		palette: ASPalette.allStandardOriginalColors
	});

	const value1: Value = {
		pos1: 2,
		otherStuff: 'dummy'
	};

	const value2: Value = {
		pos1: 9,
		otherStuff: 'dummy'
	};

	const redInValue1Context = red(value1);
	const pos1BasedAllColorsFormatterInValue1Context = pos1BasedAllColorsFormatter(value1);
	const pos1BasedAllColorsFormatterInValue2Context = pos1BasedAllColorsFormatter(value2);

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(ASContextStyler.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			const dummy = ASContextStyler.fromSingleStyle(ASStyle.red);
			it('Matching', () => {
				expect(Equal.equals(red, dummy)).toBe(true);
			});

			it('Non-matching', () => {
				expect(Equal.equals(red, ASContextStyler.black())).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(red.toString()).toBe('RedFormatter');
			expect(pos1BasedAllColorsFormatter.toString()).toBe(
				'Pos1BasedBlack/Red/Green/Yellow/Blue/Magenta/Cyan/WhitePaletteFormatter'
			);
		});

		it('.pipe()', () => {
			expect(red.pipe(ASContextStyler.has)).toBe(true);
		});

		describe('has', () => {
			it('Matching', () => {
				expect(ASContextStyler.has(red)).toBe(true);
				expect(ASContextStyler.has(pos1BasedAllColorsFormatter)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASContextStyler.has(new Date())).toBe(false);
			});
		});
	});

	describe('Action', () => {
		it('FromSingleStyle', () => {
			expect(ASText.equivalence(redInValue1Context('foo'), ASStyle.red('foo'))).toBe(true);
		});

		it('From Palette context first within bounds', () => {
			expect(
				ASText.equivalence(pos1BasedAllColorsFormatterInValue1Context('foo'), ASStyle.green('foo'))
			).toBe(true);
		});

		it('From Palette context first out of bounds', () => {
			expect(
				ASText.equivalence(pos1BasedAllColorsFormatterInValue2Context('foo'), ASStyle.red('foo'))
			).toBe(true);
		});

		it('From Palette context last', () => {
			expect(
				ASText.equivalence(
					pos1BasedAllColorsFormatter.withContextLast('foo')(value1),
					ASStyle.green('foo')
				)
			).toBe(true);
		});
	});
});
