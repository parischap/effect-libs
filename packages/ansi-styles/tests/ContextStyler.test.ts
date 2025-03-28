/* eslint-disable functional/no-expression-statements */
import { ASContextStyler, ASPalette, ASStyle, ASText } from '@parischap/ansi-styles';
import { Equal } from 'effect';
import { describe, it } from 'vitest';

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
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), ASContextStyler.moduleTag);
		});

		describe('Equal.equals', () => {
			const dummy = ASContextStyler.fromSingleStyle(ASStyle.red);
			it('Matching', () => {
				TEUtils.assertTrue(Equal.equals(red, dummy));
			});

			it('Non-matching', () => {
				TEUtils.assertFalse(Equal.equals(red, ASContextStyler.black()));
			});
		});

		it('.toString()', () => {
			TEUtils.strictEqual(red.toString(), 'RedFormatter');
			TEUtils.strictEqual(
				pos1BasedAllColorsFormatter.toString(),
				'Pos1BasedBlack/Red/Green/Yellow/Blue/Magenta/Cyan/WhitePaletteFormatter'
			);
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(red.pipe(ASContextStyler.has));
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(ASContextStyler.has(red));
				TEUtils.assertTrue(ASContextStyler.has(pos1BasedAllColorsFormatter));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(ASContextStyler.has(new Date()));
			});
		});
	});

	describe('Action', () => {
		it('FromSingleStyle', () => {
			TEUtils.assertTrue(ASText.equivalence(redInValue1Context('foo'), ASStyle.red('foo')));
		});

		it('From Palette context first within bounds', () => {
			TEUtils.assertTrue(
				ASText.equivalence(pos1BasedAllColorsFormatterInValue1Context('foo'), ASStyle.green('foo'))
			);
		});

		it('From Palette context first out of bounds', () => {
			TEUtils.assertTrue(
				ASText.equivalence(pos1BasedAllColorsFormatterInValue2Context('foo'), ASStyle.red('foo'))
			);
		});

		it('From Palette context last', () => {
			TEUtils.assertTrue(
				ASText.equivalence(
					pos1BasedAllColorsFormatter.withContextLast('foo')(value1),
					ASStyle.green('foo')
				)
			);
		});
	});
});
