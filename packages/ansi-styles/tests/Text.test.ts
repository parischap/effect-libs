/* eslint-disable functional/no-expression-statements */
import { ASAnsiString, ASColor, ASStyleCharacteristics, ASText } from '@parischap/ansi-styles';
import { MUtils } from '@parischap/effect-lib';
import { Array, Equal, flow, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

const none = ASText.concat;
const bold = ASText.fromStyleAndElems(ASStyleCharacteristics.bold);
const dim = ASText.fromStyleAndElems(ASStyleCharacteristics.dim);
const italic = ASText.fromStyleAndElems(ASStyleCharacteristics.italic);
const underlined = ASText.fromStyleAndElems(ASStyleCharacteristics.underlined);
const notBold = ASText.fromStyleAndElems(ASStyleCharacteristics.notBold);
const notUnderlined = ASText.fromStyleAndElems(ASStyleCharacteristics.notUnderlined);

const red = pipe(
	ASColor.threeBitRed,
	ASStyleCharacteristics.fromColorAsForegroundColor,
	ASText.fromStyleAndElems
);
const pink = pipe(
	ASColor.rgbPink,
	ASStyleCharacteristics.fromColorAsForegroundColor,
	ASText.fromStyleAndElems
);

const boldRed = flow(bold, red);
const boldRedFoo = pipe('foo', boldRed);
const foo = ASText.fromString('foo');
const bar = ASText.fromString('bar');
const baz = ASText.fromString('baz');

describe('ASText', () => {
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(ASText.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('haveSameText', () => {
			it('Matching', () => {
				expect(ASText.haveSameText(boldRedFoo, ASText.fromString('foo'))).toBe(true);
			});
			it('Non matching', () => {
				expect(ASText.haveSameText(boldRedFoo, boldRed('bar'))).toBe(false);
			});
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(Equal.equals(boldRedFoo, pipe('foo', red, bold))).toBe(true);
				expect(Equal.equals(boldRed(''), none(''))).toBe(true);
			});
			it('Non matching', () => {
				expect(Equal.equals(boldRedFoo, pipe('foo', bold))).toBe(false);
			});
		});

		describe('.toString()', () => {
			it('Empty', () => {
				expect(ASText.empty.toString()).toBe('');
			});

			it('Simple string with no style', () => {
				expect(none('foo').toString()).toBe('foo');
			});

			it('Bold red string', () => {
				expect(boldRedFoo.toString()).toBe(`\x1b[1;31mfoo${ASAnsiString.reset}`);
			});
		});

		it('.pipe()', () => {
			expect(boldRedFoo.pipe(ASText.toLength)).toBe(3);
		});

		describe('has', () => {
			it('Matching', () => {
				expect(ASText.has(boldRedFoo)).toBe(true);
			});
			it('Non matching', () => {
				expect(ASText.has(new Date())).toBe(false);
			});
		});
	});

	it('length', () => {
		expect(ASText.toLength(dim(pink('foo'), red('bar')))).toBe(6);
	});

	it('concat', () => {
		expect(ASText.toUnstyledString(ASText.concat(foo, bar, boldRedFoo))).toBe('foobarfoo');
	});

	describe('empty, isEmpty', () => {
		it('Matching', () => {
			expect(pipe(ASText.empty, ASText.isEmpty)).toBe(true);
		});
		it('Non matching', () => {
			expect(pipe(boldRedFoo, ASText.isEmpty)).toBe(false);
		});
	});

	it('fromStyleAndElems', () => {
		const weird = bold('foo', 'bar', italic('foo'), italic('bar'), '', 'baz');
		expect(pipe(weird, ASText.uniStyledTexts, Array.length)).toBe(3);
		expect(ASText.equivalence(weird, bold('foobar', italic('foobar'), 'baz'))).toBe(true);
	});

	it('toAnsiString', () => {
		const text = notUnderlined(
			'foo ',
			boldRed(
				'goes ',
				italic('to '),
				pink('the ', notBold('beach ')),
				dim('to swim '),
				underlined('with bar')
			)
		);

		expect(ASText.toAnsiString(text)).toBe(
			'foo \x1b[1;31mgoes \x1b[3mto \x1b[23;38;2;255;192;203mthe \x1b[22mbeach \x1b[1;2;31mto swim \x1b[22;1;4mwith bar\x1b[0m'
		);
	});

	it('toUnstyledString', () => {
		expect(ASText.toUnstyledString(dim(pink('foo'), red('bar')))).toBe('foobar');
	});

	it('append', () => {
		expect(ASText.toUnstyledString(foo.pipe(ASText.append(bar)))).toBe('foobar');
	});

	it('prepend', () => {
		expect(ASText.toUnstyledString(bar.pipe(ASText.prepend(foo)))).toBe('foobar');
	});

	it('surround', () => {
		expect(ASText.toUnstyledString(bar.pipe(ASText.surround(foo, foo)))).toBe('foobarfoo');
	});

	it('join', () => {
		expect(pipe(Array.make(foo, bar, foo), ASText.join(baz), ASText.toUnstyledString)).toBe(
			'foobazbarbazfoo'
		);
	});

	it('repeat', () => {
		expect(ASText.toUnstyledString(bar.pipe(ASText.repeat(3)))).toBe('barbarbar');
	});
});
