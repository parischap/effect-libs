/* eslint-disable functional/no-expression-statements */
import { ASContextFormatter, ASPalette, ASStyle, ASText } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { describe, expect, it } from 'vitest';

describe('ContextFormatter', () => {
	const redUnistyledFormatter = ASContextFormatter.red;

	interface Value {
		readonly pos1: number;
		readonly otherStuff: string;
	}

	function pos1(value: Value): number {
		return value.pos1;
	}

	const pos1BasedAllColorsFormatter = ASContextFormatter.PaletteBased.make({
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

	const redUnistyledFormatterInValue1Context = redUnistyledFormatter(value1);
	const pos1BasedAllColorsFormatterInValue1Context = pos1BasedAllColorsFormatter(value1);
	const pos1BasedAllColorsFormatterInValue2Context = pos1BasedAllColorsFormatter(value2);

	describe('Tag and guards', () => {
		it('moduleTag', () => {
			expect(ASContextFormatter.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('has', () => {
			it('Matching', () => {
				expect(ASContextFormatter.has(redUnistyledFormatter)).toBe(true);
				expect(ASContextFormatter.has(pos1BasedAllColorsFormatter)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASContextFormatter.has(new Date())).toBe(false);
			});
		});

		describe('isUnistyled', () => {
			it('Matching', () => {
				expect(ASContextFormatter.isUnistyled(redUnistyledFormatter)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASContextFormatter.isUnistyled(pos1BasedAllColorsFormatter)).toBe(false);
			});
		});

		describe('isPaletteBased', () => {
			it('Matching', () => {
				expect(ASContextFormatter.isPaletteBased(pos1BasedAllColorsFormatter)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASContextFormatter.isPaletteBased(redUnistyledFormatter)).toBe(false);
			});
		});
	});

	describe('Unistyled', () => {
		describe('Prototype and guards', () => {
			it('.pipe()', () => {
				expect(redUnistyledFormatter.pipe(ASContextFormatter.has)).toBe(true);
			});

			describe('has', () => {
				it('Matching', () => {
					expect(ASContextFormatter.Unistyled.has(redUnistyledFormatter)).toBe(true);
				});
				it('Non matching', () => {
					expect(ASContextFormatter.Unistyled.has(pos1BasedAllColorsFormatter)).toBe(false);
				});
			});
		});

		describe('.toString()', () => {
			it('None instance', () => {
				expect(ASContextFormatter.none.toString()).toBe('NoStyleFormatter');
			});
			it('Red instance', () => {
				expect(redUnistyledFormatter.toString()).toBe('RedFormatter');
			});
		});

		describe('Action', () => {
			it('Context first', () => {
				expect(
					ASText.equivalence(redUnistyledFormatterInValue1Context('foo'), ASStyle.red('foo'))
				).toBe(true);
			});
			it('Context last', () => {
				expect(
					ASText.equivalence(
						redUnistyledFormatter.withContextLast('foo')(value1),
						ASStyle.red('foo')
					)
				).toBe(true);
			});
		});
	});

	describe('PaletteBased', () => {
		describe('Prototype and guards', () => {
			it('.pipe()', () => {
				expect(pos1BasedAllColorsFormatter.pipe(ASContextFormatter.has)).toBe(true);
			});

			describe('has', () => {
				it('Matching', () => {
					expect(ASContextFormatter.PaletteBased.has(pos1BasedAllColorsFormatter)).toBe(true);
				});
				it('Non matching', () => {
					expect(ASContextFormatter.PaletteBased.has(redUnistyledFormatter)).toBe(false);
				});
			});
		});

		it('.toString()', () => {
			expect(pos1BasedAllColorsFormatter.toString()).toBe(
				'Pos1BasedBlack/Red/Green/Yellow/Blue/Magenta/Cyan/WhitePaletteFormatter'
			);
		});

		describe('Action', () => {
			it('Context first within bounds', () => {
				expect(
					ASText.equivalence(
						pos1BasedAllColorsFormatterInValue1Context('foo'),
						ASStyle.green('foo')
					)
				).toBe(true);
			});

			it('Context first out of bounds', () => {
				expect(
					ASText.equivalence(pos1BasedAllColorsFormatterInValue2Context('foo'), ASStyle.red('foo'))
				).toBe(true);
			});

			it('Context last', () => {
				expect(
					ASText.equivalence(
						pos1BasedAllColorsFormatter.withContextLast('foo')(value1),
						ASStyle.green('foo')
					)
				).toBe(true);
			});
		});
	});
});
