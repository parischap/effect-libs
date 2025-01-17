/* eslint-disable functional/no-expression-statements */
import { ASContextFormatter, ASPalette, ASStyle, ASText } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { describe, expect, it } from 'vitest';

describe('ContextFormatter', () => {
	interface Context {
		readonly pos1: number;
		readonly otherStuff: string;
	}

	function pos1(context: Context): number {
		return context.pos1;
	}

	const formatterOnContextPos1 = ASContextFormatter.PaletteBased.make(pos1);

	const fooUnistyledFormatter = ASContextFormatter.Unistyled.make({
		defaultText: 'foo',
		style: ASStyle.red
	});

	const allStandardOriginalColorsFormaterOnContextPos1WithFooDefault = formatterOnContextPos1({
		defaultText: 'foo',
		palette: ASPalette.allStandardOriginalColors
	});

	const context1: Context = {
		pos1: 2,
		otherStuff: 'dummy'
	};

	const context2: Context = {
		pos1: 9,
		otherStuff: 'dummy'
	};

	describe('Tag and guards', () => {
		it('moduleTag', () => {
			expect(ASContextFormatter.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('has', () => {
			it('Matching', () => {
				expect(ASContextFormatter.has(fooUnistyledFormatter)).toBe(true);
				expect(
					ASContextFormatter.has(allStandardOriginalColorsFormaterOnContextPos1WithFooDefault)
				).toBe(true);
			});
			it('Non matching', () => {
				expect(ASContextFormatter.has(new Date())).toBe(false);
			});
		});

		describe('isUnistyled', () => {
			it('Matching', () => {
				expect(ASContextFormatter.isUnistyled(fooUnistyledFormatter)).toBe(true);
			});
			it('Non matching', () => {
				expect(
					ASContextFormatter.isUnistyled(
						allStandardOriginalColorsFormaterOnContextPos1WithFooDefault
					)
				).toBe(false);
			});
		});

		describe('isPaletteBased', () => {
			it('Matching', () => {
				expect(
					ASContextFormatter.isPaletteBased(
						allStandardOriginalColorsFormaterOnContextPos1WithFooDefault
					)
				).toBe(true);
			});
			it('Non matching', () => {
				expect(ASContextFormatter.isPaletteBased(fooUnistyledFormatter)).toBe(false);
			});
		});
	});

	describe('Unistyled', () => {
		describe('Prototype and guards', () => {
			it('.pipe()', () => {
				expect(fooUnistyledFormatter.pipe(ASContextFormatter.has)).toBe(true);
			});

			describe('has', () => {
				it('Matching', () => {
					expect(ASContextFormatter.Unistyled.has(fooUnistyledFormatter)).toBe(true);
				});
				it('Non matching', () => {
					expect(
						ASContextFormatter.Unistyled.has(
							allStandardOriginalColorsFormaterOnContextPos1WithFooDefault
						)
					).toBe(false);
				});
			});
		});

		describe('.toString()', () => {
			it('With default text', () => {
				expect(fooUnistyledFormatter.toString()).toBe('RedFormatterWithFooAsDefault');
			});

			it('Without default text', () => {
				expect(
					ASContextFormatter.Unistyled.make({ defaultText: '', style: ASStyle.none }).toString()
				).toBe('NoStyleFormatter');
			});
		});

		describe('Action', () => {
			it('Non-empty string', () => {
				expect(ASText.equivalence(fooUnistyledFormatter('baz')(context1), ASStyle.red('baz'))).toBe(
					true
				);
			});

			it('Empty string', () => {
				expect(ASText.equivalence(fooUnistyledFormatter()(context1), ASStyle.red('foo'))).toBe(
					true
				);
			});
		});
	});

	describe('PaletteBased', () => {
		describe('Prototype and guards', () => {
			it('.pipe()', () => {
				expect(
					allStandardOriginalColorsFormaterOnContextPos1WithFooDefault.pipe(ASContextFormatter.has)
				).toBe(true);
			});

			describe('has', () => {
				it('Matching', () => {
					expect(
						ASContextFormatter.PaletteBased.has(
							allStandardOriginalColorsFormaterOnContextPos1WithFooDefault
						)
					).toBe(true);
				});
				it('Non matching', () => {
					expect(ASContextFormatter.PaletteBased.has(fooUnistyledFormatter)).toBe(false);
				});
			});
		});

		describe('.toString()', () => {
			it('With default text', () => {
				expect(allStandardOriginalColorsFormaterOnContextPos1WithFooDefault.toString()).toBe(
					'Black/Red/Green/Yellow/Blue/Magenta/Cyan/WhitePaletteFormatterOnPos1WithFooAsDefault'
				);
			});

			it('Without default text', () => {
				expect(
					formatterOnContextPos1({
						defaultText: '',
						palette: ASPalette.allStandardOriginalColors
					}).toString()
				).toBe('Black/Red/Green/Yellow/Blue/Magenta/Cyan/WhitePaletteFormatterOnPos1');
			});
		});

		describe('Action', () => {
			it('With value and context within bounds', () => {
				expect(
					ASText.equivalence(
						allStandardOriginalColorsFormaterOnContextPos1WithFooDefault('baz')(context1),
						ASStyle.green('baz')
					)
				).toBe(true);
			});

			it('With value with context out of bounds', () => {
				expect(
					ASText.equivalence(
						allStandardOriginalColorsFormaterOnContextPos1WithFooDefault('baz')(context2),
						ASStyle.red('baz')
					)
				).toBe(true);
			});

			it('Without value, with context within bounds', () => {
				expect(
					ASText.equivalence(
						allStandardOriginalColorsFormaterOnContextPos1WithFooDefault()(context1),
						ASStyle.green('foo')
					)
				).toBe(true);
			});
		});
	});
});
