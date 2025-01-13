/* eslint-disable functional/no-expression-statements */
import { ASContextFormatter, ASPalette, ASStyle, ASText } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { Equal } from 'effect';
import { describe, expect, it } from 'vitest';

describe('ContextFormatter', () => {
	interface Context {
		readonly pos1: number;
		readonly otherStuff: string;
	}

	function pos1(context: Context): number {
		return context.pos1;
	}

	const fooContextFormatter = ASContextFormatter.make({
		defaultText: 'foo',
		indexFromContext: pos1,
		palette: ASPalette.allStandardOriginalColors
	});

	const barContextFormatter = ASContextFormatter.make({
		defaultText: 'bar',
		indexFromContext: pos1,
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

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(ASContextFormatter.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(
					Equal.equals(
						fooContextFormatter,
						ASContextFormatter.make({
							defaultText: 'foo',
							indexFromContext: pos1,
							palette: ASPalette.allStandardOriginalColors
						})
					)
				).toBe(true);
			});
			it('Non matching', () => {
				expect(Equal.equals(fooContextFormatter, barContextFormatter)).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(fooContextFormatter.toString()).toBe(
				'Black/Red/Green/Yellow/Blue/Magenta/Cyan/WhiteBasedOnPos1WithFooAsDefault'
			);
		});

		it('.pipe()', () => {
			expect(fooContextFormatter.pipe(ASContextFormatter.has)).toBe(true);
		});

		describe('has', () => {
			it('Matching', () => {
				expect(ASContextFormatter.has(fooContextFormatter)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASContextFormatter.has(new Date())).toBe(false);
			});
		});
	});

	describe('Constructor', () => {
		it('Empty palette with value', () => {
			expect(
				ASText.equivalence(
					ASContextFormatter.make({
						defaultText: 'foo',
						indexFromContext: pos1,
						palette: ASPalette.empty
					})('baz')(context1),
					ASText.fromString('baz')
				)
			).toBe(true);
		});

		it('Empty palette without value', () => {
			expect(
				ASText.equivalence(
					ASContextFormatter.make({
						defaultText: 'foo',
						indexFromContext: pos1,
						palette: ASPalette.empty
					})('')(context1),
					ASText.fromString('foo')
				)
			).toBe(true);
		});

		it('Non-empty palette with value with context within bounds', () => {
			expect(ASText.equivalence(fooContextFormatter('baz')(context1), ASStyle.green('baz'))).toBe(
				true
			);
		});

		it('Non-empty palette without value with context within bounds', () => {
			expect(ASText.equivalence(fooContextFormatter('')(context1), ASStyle.green('foo'))).toBe(
				true
			);
		});

		it('Non-empty palette with value with context out of bounds', () => {
			expect(ASText.equivalence(fooContextFormatter('baz')(context2), ASStyle.red('baz'))).toBe(
				true
			);
		});
	});
});
