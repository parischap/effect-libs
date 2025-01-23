/* eslint-disable functional/no-expression-statements */
import { ASContextFormatter, ASPalette, ASStyle, ASText } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { describe, expect, it } from 'vitest';

describe('ContextFormatter', () => {
	const unistyledFormatterWithFooDefault = ASContextFormatter.Unistyled.make({
		defaultText: 'foo',
		style: ASStyle.red
	});

	interface Value {
		readonly pos1: number;
		readonly otherStuff: string;
	}

	function pos1(value: Value): number {
		return value.pos1;
	}

	const valuePos1ContextFormatter = ASContextFormatter.PaletteBased.make(pos1);

	const valuePos1ContextFormatterWithFooDefault = valuePos1ContextFormatter({
		defaultText: 'foo',
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

	const unistyledFormatterWithFooDefaultInValue1Context = unistyledFormatterWithFooDefault(value1);
	const valuePos1ContextFormatterWithFooDefaultInValue1Context =
		valuePos1ContextFormatterWithFooDefault(value1);
	const valuePos1ContextFormatterWithFooDefaultInValue2Context =
		valuePos1ContextFormatterWithFooDefault(value2);

	describe('Tag and guards', () => {
		it('moduleTag', () => {
			expect(ASContextFormatter.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('has', () => {
			it('Matching', () => {
				expect(ASContextFormatter.has(unistyledFormatterWithFooDefault)).toBe(true);
				expect(ASContextFormatter.has(valuePos1ContextFormatterWithFooDefault)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASContextFormatter.has(new Date())).toBe(false);
			});
		});

		describe('isUnistyled', () => {
			it('Matching', () => {
				expect(ASContextFormatter.isUnistyled(unistyledFormatterWithFooDefault)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASContextFormatter.isUnistyled(valuePos1ContextFormatterWithFooDefault)).toBe(false);
			});
		});

		describe('isPaletteBased', () => {
			it('Matching', () => {
				expect(ASContextFormatter.isPaletteBased(valuePos1ContextFormatterWithFooDefault)).toBe(
					true
				);
			});
			it('Non matching', () => {
				expect(ASContextFormatter.isPaletteBased(unistyledFormatterWithFooDefault)).toBe(false);
			});
		});
	});

	describe('Unistyled', () => {
		describe('Prototype and guards', () => {
			it('.pipe()', () => {
				expect(unistyledFormatterWithFooDefault.pipe(ASContextFormatter.has)).toBe(true);
			});

			describe('has', () => {
				it('Matching', () => {
					expect(ASContextFormatter.Unistyled.has(unistyledFormatterWithFooDefault)).toBe(true);
				});
				it('Non matching', () => {
					expect(ASContextFormatter.Unistyled.has(valuePos1ContextFormatterWithFooDefault)).toBe(
						false
					);
				});
			});
		});

		describe('.toString()', () => {
			it('With default text', () => {
				expect(unistyledFormatterWithFooDefault.toString()).toBe('RedFormatterWithFooAsDefault');
			});

			it('Without default text', () => {
				expect(
					ASContextFormatter.Unistyled.make({ defaultText: '', style: ASStyle.none }).toString()
				).toBe('NoStyleFormatter');
			});
		});

		describe('Action', () => {
			it('With string', () => {
				expect(
					ASText.equivalence(
						unistyledFormatterWithFooDefaultInValue1Context('baz'),
						ASStyle.red('baz')
					)
				).toBe(true);
			});

			it('Without string', () => {
				expect(
					ASText.equivalence(unistyledFormatterWithFooDefaultInValue1Context(), ASStyle.red('foo'))
				).toBe(true);
			});
		});
	});

	describe('PaletteBased', () => {
		describe('Prototype and guards', () => {
			it('.pipe()', () => {
				expect(valuePos1ContextFormatterWithFooDefault.pipe(ASContextFormatter.has)).toBe(true);
			});

			describe('has', () => {
				it('Matching', () => {
					expect(ASContextFormatter.PaletteBased.has(valuePos1ContextFormatterWithFooDefault)).toBe(
						true
					);
				});
				it('Non matching', () => {
					expect(ASContextFormatter.PaletteBased.has(unistyledFormatterWithFooDefault)).toBe(false);
				});
			});
		});

		describe('.toString()', () => {
			it('With default text', () => {
				expect(valuePos1ContextFormatterWithFooDefault.toString()).toBe(
					'Black/Red/Green/Yellow/Blue/Magenta/Cyan/WhitePaletteFormatterOnPos1WithFooAsDefault'
				);
			});

			it('Without default text', () => {
				expect(
					valuePos1ContextFormatter({
						defaultText: '',
						palette: ASPalette.allStandardOriginalColors
					}).toString()
				).toBe('Black/Red/Green/Yellow/Blue/Magenta/Cyan/WhitePaletteFormatterOnPos1');
			});
		});

		describe('Action', () => {
			it('With string and context within bounds', () => {
				expect(
					ASText.equivalence(
						valuePos1ContextFormatterWithFooDefaultInValue1Context('baz'),
						ASStyle.green('baz')
					)
				).toBe(true);
			});

			it('With string with context out of bounds', () => {
				expect(
					ASText.equivalence(
						valuePos1ContextFormatterWithFooDefaultInValue2Context('baz'),
						ASStyle.red('baz')
					)
				).toBe(true);
			});

			it('Without string, with context within bounds', () => {
				expect(
					ASText.equivalence(
						valuePos1ContextFormatterWithFooDefaultInValue1Context(),
						ASStyle.green('foo')
					)
				).toBe(true);
			});
		});
	});
});
