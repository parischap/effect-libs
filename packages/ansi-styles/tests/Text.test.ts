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
	ASColor.ThreeBit.red,
	ASStyleCharacteristics.fromColorAsForegroundColor,
	ASText.fromStyleAndElems
);
const pink = pipe(
	ASColor.Rgb.pink,
	ASStyleCharacteristics.fromColorAsForegroundColor,
	ASText.fromStyleAndElems
);

const boldRed = flow(bold, red);
const boldRedFoo = pipe('foo', boldRed);

describe('ASText', () => {
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(ASText.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(Equal.equals(boldRedFoo, pipe('foo', red, bold))).toBe(true);
				expect(Equal.equals(pipe('', boldRed), pipe('', none))).toBe(true);
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
			expect(boldRedFoo.pipe(ASText.length)).toBe(3);
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

	/*it('append', () => {
		const result = foo.pipe(ASText.append(bar));
		expect(ASText.formatted(result)).toBe('afoobabarb');
		expect(ASText.unformatted(result)).toBe('foobar');
	});

	it('prepend', () => {
		const result = foo.pipe(ASText.prepend(bar));
		expect(ASText.formatted(result)).toBe('abarbafoob');
		expect(ASText.unformatted(result)).toBe('barfoo');
	});

	it('concat', () => {
		const result = ASText.concat(foo, bar, baz);
		expect(ASText.formatted(result)).toBe('afoobabarbabazb');
		expect(ASText.unformatted(result)).toBe('foobarbaz');
	});

	it('join', () => {
		const result = pipe(Array.make(foo, baz), ASText.join(bar));
		expect(ASText.formatted(result)).toBe('afoobabarbabazb');
		expect(ASText.unformatted(result)).toBe('foobarbaz');
	});

	it('repeat', () => {
		const result = foo.pipe(ASText.repeat(2));
		expect(ASText.formatted(result)).toBe('afoobafoob');
		expect(ASText.unformatted(result)).toBe('foofoo');
	});

	it('isEmpty', () => {
		expect(ASText.isEmpty(foo)).toBe(false);
		expect(ASText.isEmpty(ASText.empty)).toBe(true);
	});

	it('isNonEmpty', () => {
		expect(ASText.isNonEmpty(foo)).toBe(true);
		expect(ASText.isNonEmpty(ASText.empty)).toBe(false);
	});*/
});
